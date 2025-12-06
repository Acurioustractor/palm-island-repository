/**
 * AI Response Cache
 *
 * In-memory cache with TTL for AI responses.
 * Reduces API calls and improves response times.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  hits: number;
}

interface CacheStats {
  totalEntries: number;
  totalHits: number;
  totalMisses: number;
  memoryUsage: string;
}

class AICache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private stats = {
    hits: 0,
    misses: 0
  };

  // Default TTL: 1 hour
  private defaultTTL = 60 * 60 * 1000;

  // Max cache size: 1000 entries
  private maxSize = 1000;

  /**
   * Generate cache key from function name and args
   */
  private generateKey(namespace: string, args: unknown[]): string {
    const argsHash = JSON.stringify(args);
    return `${namespace}:${this.hashString(argsHash)}`;
  }

  /**
   * Simple string hash
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get cached value
   */
  get<T>(namespace: string, args: unknown[]): T | null {
    const key = this.generateKey(namespace, args);
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    entry.hits++;
    this.stats.hits++;
    return entry.data;
  }

  /**
   * Set cached value
   */
  set<T>(namespace: string, args: unknown[], data: T, ttlMs?: number): void {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    const key = this.generateKey(namespace, args);
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + (ttlMs || this.defaultTTL),
      hits: 0
    });
  }

  /**
   * Evict oldest/least used entries
   */
  private evictOldest(): void {
    const entries = Array.from(this.cache.entries());

    // Sort by hits (least used first), then by expiry (soonest first)
    entries.sort((a, b) => {
      if (a[1].hits !== b[1].hits) {
        return a[1].hits - b[1].hits;
      }
      return a[1].expiresAt - b[1].expiresAt;
    });

    // Remove 10% of entries
    const toRemove = Math.ceil(this.maxSize * 0.1);
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Invalidate cache by namespace
   */
  invalidate(namespace: string): number {
    let count = 0;
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (key.startsWith(`${namespace}:`)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    // Estimate memory usage
    let memoryBytes = 0;
    const entries = Array.from(this.cache.values());
    for (const entry of entries) {
      memoryBytes += JSON.stringify(entry.data).length * 2; // Rough estimate
    }

    return {
      totalEntries: this.cache.size,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      memoryUsage: this.formatBytes(memoryBytes)
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }
}

// Singleton instance
export const aiCache = new AICache();

/**
 * Cache decorator for async functions
 */
export function withCache<T extends unknown[], R>(
  namespace: string,
  fn: (...args: T) => Promise<R>,
  ttlMs?: number
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    // Try to get from cache
    const cached = aiCache.get<R>(namespace, args);
    if (cached !== null) {
      return cached;
    }

    // Call function and cache result
    const result = await fn(...args);
    aiCache.set(namespace, args, result, ttlMs);

    return result;
  };
}

// TTL constants
export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000,      // 5 minutes
  MEDIUM: 30 * 60 * 1000,    // 30 minutes
  LONG: 60 * 60 * 1000,      // 1 hour
  VERY_LONG: 24 * 60 * 60 * 1000  // 24 hours
};

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    aiCache.cleanup();
  }, 5 * 60 * 1000);
}
