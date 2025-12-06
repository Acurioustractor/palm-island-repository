/**
 * Rate Limiting for AI Endpoints
 *
 * Protects AI endpoints from overuse using a sliding window algorithm.
 */

interface RateLimitEntry {
  requests: number[];
  blocked: boolean;
  blockedUntil?: number;
}

interface RateLimitConfig {
  windowMs: number;       // Time window in milliseconds
  maxRequests: number;    // Max requests per window
  blockDurationMs: number; // How long to block after exceeding
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();

  // Default configs for different endpoint types
  private configs: Record<string, RateLimitConfig> = {
    // Standard AI endpoints (expensive operations)
    ai: {
      windowMs: 60 * 1000,      // 1 minute
      maxRequests: 20,          // 20 requests per minute
      blockDurationMs: 60 * 1000
    },
    // Vision endpoints (very expensive)
    vision: {
      windowMs: 60 * 1000,
      maxRequests: 10,          // 10 per minute
      blockDurationMs: 120 * 1000
    },
    // PDF processing (very expensive + slow)
    pdf: {
      windowMs: 60 * 1000,
      maxRequests: 5,           // 5 per minute
      blockDurationMs: 180 * 1000
    },
    // Query expansion (fast, less expensive)
    query: {
      windowMs: 60 * 1000,
      maxRequests: 60,          // 60 per minute
      blockDurationMs: 30 * 1000
    },
    // Knowledge graph (database heavy)
    graph: {
      windowMs: 60 * 1000,
      maxRequests: 30,
      blockDurationMs: 60 * 1000
    }
  };

  /**
   * Check if request is allowed
   */
  check(identifier: string, endpointType: string = 'ai'): RateLimitResult {
    const key = `${endpointType}:${identifier}`;
    const config = this.configs[endpointType] || this.configs.ai;
    const now = Date.now();

    let entry = this.limits.get(key);

    // Initialize if not exists
    if (!entry) {
      entry = { requests: [], blocked: false };
      this.limits.set(key, entry);
    }

    // Check if blocked
    if (entry.blocked && entry.blockedUntil) {
      if (now < entry.blockedUntil) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: entry.blockedUntil,
          retryAfter: Math.ceil((entry.blockedUntil - now) / 1000)
        };
      }
      // Block expired
      entry.blocked = false;
      entry.blockedUntil = undefined;
      entry.requests = [];
    }

    // Clean old requests outside window
    const windowStart = now - config.windowMs;
    entry.requests = entry.requests.filter(time => time > windowStart);

    // Check if over limit
    if (entry.requests.length >= config.maxRequests) {
      entry.blocked = true;
      entry.blockedUntil = now + config.blockDurationMs;

      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.blockedUntil,
        retryAfter: Math.ceil(config.blockDurationMs / 1000)
      };
    }

    // Add this request
    entry.requests.push(now);

    return {
      allowed: true,
      remaining: config.maxRequests - entry.requests.length,
      resetAt: now + config.windowMs
    };
  }

  /**
   * Get rate limit headers for response
   */
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

  /**
   * Get current stats for monitoring
   */
  getStats(): {
    totalTracked: number;
    currentlyBlocked: number;
    byEndpoint: Record<string, { tracked: number; blocked: number }>;
  } {
    const stats: Record<string, { tracked: number; blocked: number }> = {};
    let totalBlocked = 0;

    const entries = Array.from(this.limits.entries());
    for (const [key, entry] of entries) {
      const [endpoint] = key.split(':');

      if (!stats[endpoint]) {
        stats[endpoint] = { tracked: 0, blocked: 0 };
      }

      stats[endpoint].tracked++;
      if (entry.blocked) {
        stats[endpoint].blocked++;
        totalBlocked++;
      }
    }

    return {
      totalTracked: this.limits.size,
      currentlyBlocked: totalBlocked,
      byEndpoint: stats
    };
  }

  /**
   * Clean up old entries
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    const entries = Array.from(this.limits.entries());
    for (const [key, entry] of entries) {
      // Remove if no recent requests and not blocked
      if (entry.requests.length === 0 && !entry.blocked) {
        this.limits.delete(key);
        removed++;
      }
      // Remove if block expired and no requests
      if (entry.blocked && entry.blockedUntil && now > entry.blockedUntil) {
        if (entry.requests.length === 0) {
          this.limits.delete(key);
          removed++;
        }
      }
    }

    return removed;
  }

  /**
   * Reset limits for an identifier
   */
  reset(identifier: string, endpointType?: string): void {
    if (endpointType) {
      this.limits.delete(`${endpointType}:${identifier}`);
    } else {
      // Reset all endpoints for this identifier
      const keys = Array.from(this.limits.keys());
      for (const key of keys) {
        if (key.endsWith(`:${identifier}`)) {
          this.limits.delete(key);
        }
      }
    }
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Get client identifier from request
 */
export function getClientId(request: Request): string {
  // Try to get real IP from headers (for proxied requests)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a hash of user agent + some headers
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
export function withRateLimit(
  endpointType: string = 'ai'
) {
  return async function rateLimit(
    request: Request,
    handler: () => Promise<Response>
  ): Promise<Response> {
    const clientId = getClientId(request);
    const result = rateLimiter.check(clientId, endpointType);
    const headers = rateLimiter.getHeaders(result);

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: result.retryAfter,
          message: `Too many requests. Please try again in ${result.retryAfter} seconds.`
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        }
      );
    }

    // Call the handler and add rate limit headers to response
    const response = await handler();

    // Clone response to add headers
    const newHeaders = new Headers(response.headers);
    for (const [key, value] of Object.entries(headers)) {
      newHeaders.set(key, value);
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  };
}

// Cleanup every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup();
  }, 10 * 60 * 1000);
}
