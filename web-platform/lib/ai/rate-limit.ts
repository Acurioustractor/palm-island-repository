/**
 * Rate Limiting for AI Endpoints
 *
 * Uses Upstash Redis sliding window when configured (works on Vercel serverless),
 * falls back to in-memory sliding window for local dev.
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// ─── Types ──────────────────────────────────────────────────────────────────

interface RateLimitEntry {
  requests: number[];
  blocked: boolean;
  blockedUntil?: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDurationMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

// ─── Endpoint configs ───────────────────────────────────────────────────────

const RATE_CONFIGS: Record<string, RateLimitConfig> = {
  ai: { windowMs: 60_000, maxRequests: 20, blockDurationMs: 60_000 },
  vision: { windowMs: 60_000, maxRequests: 10, blockDurationMs: 120_000 },
  pdf: { windowMs: 60_000, maxRequests: 5, blockDurationMs: 180_000 },
  query: { windowMs: 60_000, maxRequests: 60, blockDurationMs: 30_000 },
  graph: { windowMs: 60_000, maxRequests: 30, blockDurationMs: 60_000 },
  chat: { windowMs: 60_000, maxRequests: 30, blockDurationMs: 60_000 },
  transcription: { windowMs: 60_000, maxRequests: 5, blockDurationMs: 180_000 },
}

// ─── Upstash limiters (lazy-init per endpoint type) ─────────────────────────

const upstashEnabled = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

let _redis: Redis | null = null
function getRedis() {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  }
  return _redis
}

const upstashLimiters = new Map<string, Ratelimit>()
function getUpstashLimiter(endpointType: string): Ratelimit {
  if (!upstashLimiters.has(endpointType)) {
    const config = RATE_CONFIGS[endpointType] || RATE_CONFIGS.ai
    upstashLimiters.set(endpointType, new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(config.maxRequests, `${config.windowMs / 1000} s`),
      prefix: `ratelimit:${endpointType}`,
    }))
  }
  return upstashLimiters.get(endpointType)!
}

// ─── In-memory fallback (same as before) ────────────────────────────────────

class InMemoryRateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();

  check(identifier: string, endpointType: string = 'ai'): RateLimitResult {
    const key = `${endpointType}:${identifier}`;
    const config = RATE_CONFIGS[endpointType] || RATE_CONFIGS.ai;
    const now = Date.now();

    let entry = this.limits.get(key);
    if (!entry) {
      entry = { requests: [], blocked: false };
      this.limits.set(key, entry);
    }

    if (entry.blocked && entry.blockedUntil) {
      if (now < entry.blockedUntil) {
        return { allowed: false, remaining: 0, resetAt: entry.blockedUntil, retryAfter: Math.ceil((entry.blockedUntil - now) / 1000) };
      }
      entry.blocked = false;
      entry.blockedUntil = undefined;
      entry.requests = [];
    }

    const windowStart = now - config.windowMs;
    entry.requests = entry.requests.filter(time => time > windowStart);

    if (entry.requests.length >= config.maxRequests) {
      entry.blocked = true;
      entry.blockedUntil = now + config.blockDurationMs;
      return { allowed: false, remaining: 0, resetAt: entry.blockedUntil, retryAfter: Math.ceil(config.blockDurationMs / 1000) };
    }

    entry.requests.push(now);
    return { allowed: true, remaining: config.maxRequests - entry.requests.length, resetAt: now + config.windowMs };
  }

  getHeaders(result: RateLimitResult): Record<string, string> {
    const headers: Record<string, string> = {
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.resetAt).toISOString()
    };
    if (result.retryAfter) {
      headers['Retry-After'] = result.retryAfter.toString();
    }
    return headers;
  }

  getStats(): { totalTracked: number; currentlyBlocked: number; byEndpoint: Record<string, { tracked: number; blocked: number }> } {
    const stats: Record<string, { tracked: number; blocked: number }> = {};
    let totalBlocked = 0;
    for (const [key, entry] of Array.from(this.limits.entries())) {
      const [endpoint] = key.split(':');
      if (!stats[endpoint]) stats[endpoint] = { tracked: 0, blocked: 0 };
      stats[endpoint].tracked++;
      if (entry.blocked) { stats[endpoint].blocked++; totalBlocked++; }
    }
    return { totalTracked: this.limits.size, currentlyBlocked: totalBlocked, byEndpoint: stats };
  }

  cleanup(): number {
    const now = Date.now();
    let removed = 0;
    for (const [key, entry] of Array.from(this.limits.entries())) {
      if (entry.requests.length === 0 && !entry.blocked) { this.limits.delete(key); removed++; }
      if (entry.blocked && entry.blockedUntil && now > entry.blockedUntil && entry.requests.length === 0) { this.limits.delete(key); removed++; }
    }
    return removed;
  }

  reset(identifier: string, endpointType?: string): void {
    if (endpointType) {
      this.limits.delete(`${endpointType}:${identifier}`);
    } else {
      for (const key of Array.from(this.limits.keys())) {
        if (key.endsWith(`:${identifier}`)) this.limits.delete(key);
      }
    }
  }
}

// ─── Unified RateLimiter (delegates to Upstash or in-memory) ────────────────

class RateLimiter {
  private fallback = new InMemoryRateLimiter();

  async checkAsync(identifier: string, endpointType: string = 'ai'): Promise<RateLimitResult> {
    if (upstashEnabled) {
      try {
        const limiter = getUpstashLimiter(endpointType)
        const { success, remaining, reset } = await limiter.limit(identifier)
        const now = Date.now()
        const config = RATE_CONFIGS[endpointType] || RATE_CONFIGS.ai
        return {
          allowed: success,
          remaining,
          resetAt: reset,
          retryAfter: success ? undefined : Math.ceil(config.blockDurationMs / 1000),
        }
      } catch (err) {
        console.warn('Upstash rate limit error, falling back to in-memory:', err)
        return this.fallback.check(identifier, endpointType)
      }
    }
    return this.fallback.check(identifier, endpointType)
  }

  // Synchronous check — in-memory only (used by legacy consumers)
  check(identifier: string, endpointType: string = 'ai'): RateLimitResult {
    return this.fallback.check(identifier, endpointType);
  }

  getHeaders(result: RateLimitResult): Record<string, string> {
    return this.fallback.getHeaders(result);
  }

  getStats() {
    return this.fallback.getStats();
  }

  cleanup(): number {
    return this.fallback.cleanup();
  }

  reset(identifier: string, endpointType?: string): void {
    this.fallback.reset(identifier, endpointType);
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getClientId(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  const ua = request.headers.get('user-agent') || 'unknown';
  const accept = request.headers.get('accept') || '';
  return `anon-${hashSimple(ua + accept)}`;
}

function hashSimple(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Rate limit middleware for API routes
 */
export function withRateLimit(endpointType: string = 'ai') {
  return async function rateLimitMiddleware(
    request: Request,
    handler: () => Promise<Response>
  ): Promise<Response> {
    const clientId = getClientId(request);
    const result = await rateLimiter.checkAsync(clientId, endpointType);
    const headers = rateLimiter.getHeaders(result);

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: result.retryAfter,
          message: `Too many requests. Please try again in ${result.retryAfter} seconds.`
        }),
        { status: 429, headers: { 'Content-Type': 'application/json', ...headers } }
      );
    }

    const response = await handler();
    const newHeaders = new Headers(response.headers);
    for (const [key, value] of Object.entries(headers)) {
      newHeaders.set(key, value);
    }
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers: newHeaders });
  };
}

// Cleanup every 10 minutes (in-memory fallback only)
if (typeof setInterval !== 'undefined') {
  setInterval(() => { rateLimiter.cleanup(); }, 10 * 60 * 1000);
}

/**
 * Rate limit types enum for convenience
 */
export enum RateLimitType {
  AI = 'ai',
  VISION = 'vision',
  PDF = 'pdf',
  QUERY = 'query',
  GRAPH = 'graph',
  CHAT = 'chat',
  TRANSCRIPTION = 'transcription'
}

/**
 * Simple rate limit helper for API routes (async — uses Upstash when available)
 */
export async function rateLimit(
  request: Request,
  type: RateLimitType | string = RateLimitType.AI
): Promise<{ success: boolean; remaining: number; retryAfter?: number }> {
  const clientId = getClientId(request);
  const result = await rateLimiter.checkAsync(clientId, type);
  return { success: result.allowed, remaining: result.remaining, retryAfter: result.retryAfter };
}
