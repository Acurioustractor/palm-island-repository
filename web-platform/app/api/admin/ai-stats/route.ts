/**
 * Admin AI Stats API
 *
 * Returns statistics about AI usage, caching, and rate limiting.
 */

import { NextResponse } from 'next/server';
import { aiCache } from '@/lib/ai/cache';
import { rateLimiter } from '@/lib/ai/rate-limit';

export async function GET() {
  try {
    const cacheStats = aiCache.getStats();
    const rateLimitStats = rateLimiter.getStats();

    // Calculate hit rate
    const totalRequests = cacheStats.totalHits + cacheStats.totalMisses;
    const hitRate = totalRequests > 0
      ? ((cacheStats.totalHits / totalRequests) * 100).toFixed(1)
      : '0';

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      cache: {
        entries: cacheStats.totalEntries,
        hits: cacheStats.totalHits,
        misses: cacheStats.totalMisses,
        hitRate: `${hitRate}%`,
        memoryUsage: cacheStats.memoryUsage
      },
      rateLimit: {
        totalTracked: rateLimitStats.totalTracked,
        currentlyBlocked: rateLimitStats.currentlyBlocked,
        byEndpoint: rateLimitStats.byEndpoint
      },
      endpoints: {
        available: [
          { path: '/api/ai/expand-query', method: 'POST', description: 'Query expansion' },
          { path: '/api/ai/summarize', method: 'POST', description: 'Content summarization' },
          { path: '/api/ai/rerank', method: 'POST', description: 'Search result reranking' },
          { path: '/api/ai/related', method: 'GET', description: 'Related content' },
          { path: '/api/ai/knowledge-graph', method: 'GET', description: 'Knowledge graph' },
          { path: '/api/ai/pdf', method: 'POST', description: 'PDF processing' },
          { path: '/api/ai/vision', method: 'POST', description: 'Image analysis' }
        ]
      }
    });
  } catch (error: any) {
    console.error('AI stats error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to get AI stats'
    }, { status: 500 });
  }
}

// POST to perform admin actions
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, namespace, identifier, endpointType } = body;

    switch (action) {
      case 'clear-cache':
        if (namespace) {
          const count = aiCache.invalidate(namespace);
          return NextResponse.json({
            success: true,
            message: `Cleared ${count} cache entries for namespace: ${namespace}`
          });
        } else {
          aiCache.clear();
          return NextResponse.json({
            success: true,
            message: 'Cleared all cache entries'
          });
        }

      case 'cleanup-cache':
        const removed = aiCache.cleanup();
        return NextResponse.json({
          success: true,
          message: `Removed ${removed} expired cache entries`
        });

      case 'reset-rate-limit':
        if (!identifier) {
          return NextResponse.json({
            error: 'identifier required for reset-rate-limit'
          }, { status: 400 });
        }
        rateLimiter.reset(identifier, endpointType);
        return NextResponse.json({
          success: true,
          message: `Reset rate limit for: ${identifier}`
        });

      case 'cleanup-rate-limits':
        const cleaned = rateLimiter.cleanup();
        return NextResponse.json({
          success: true,
          message: `Cleaned up ${cleaned} rate limit entries`
        });

      default:
        return NextResponse.json({
          error: `Unknown action: ${action}`,
          availableActions: ['clear-cache', 'cleanup-cache', 'reset-rate-limit', 'cleanup-rate-limits']
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('AI admin action error:', error);
    return NextResponse.json({
      error: error.message || 'Action failed'
    }, { status: 500 });
  }
}
