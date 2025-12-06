/**
 * Semantic Search API
 *
 * Vector-based semantic search across all content.
 */

import { NextResponse } from 'next/server';
import { semanticSearch, findSimilarContent, getEmbeddingStats } from '@/lib/ai/embeddings';
import { rateLimiter, getClientId } from '@/lib/ai/rate-limit';

export async function GET(request: Request) {
  // Apply rate limiting
  const clientId = getClientId(request);
  const rateCheck = rateLimiter.check(clientId, 'ai');

  if (!rateCheck.allowed) {
    return NextResponse.json({
      error: 'Rate limit exceeded',
      retryAfter: rateCheck.retryAfter
    }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'search';

  try {
    switch (action) {
      case 'stats':
        const stats = await getEmbeddingStats();
        return NextResponse.json({ action: 'stats', ...stats });

      case 'similar':
        const contentId = searchParams.get('id');
        const contentType = searchParams.get('type') as 'story' | 'knowledge' | 'person';

        if (!contentId || !contentType) {
          return NextResponse.json({
            error: 'id and type parameters required'
          }, { status: 400 });
        }

        const similar = await findSimilarContent(contentId, contentType, {
          limit: parseInt(searchParams.get('limit') || '5')
        });

        return NextResponse.json({
          action: 'similar',
          sourceId: contentId,
          sourceType: contentType,
          results: similar
        });

      default:
        return NextResponse.json({
          error: 'Use POST for search queries'
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Semantic search error:', error);
    return NextResponse.json({
      error: error.message || 'Search failed'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Apply rate limiting
  const clientId = getClientId(request);
  const rateCheck = rateLimiter.check(clientId, 'ai');

  if (!rateCheck.allowed) {
    return NextResponse.json({
      error: 'Rate limit exceeded',
      retryAfter: rateCheck.retryAfter
    }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { query, types, limit = 10, threshold = 0.5 } = body;

    if (!query || query.length < 2) {
      return NextResponse.json({
        error: 'Query must be at least 2 characters'
      }, { status: 400 });
    }

    const results = await semanticSearch(query, {
      types,
      limit,
      threshold
    });

    return NextResponse.json({
      query,
      results,
      count: results.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Semantic search POST error:', error);
    return NextResponse.json({
      error: error.message || 'Search failed'
    }, { status: 500 });
  }
}
