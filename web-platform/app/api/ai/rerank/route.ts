/**
 * Re-ranking API
 *
 * Score and reorder search results by relevance using AI.
 */

import { NextResponse } from 'next/server';
import { rerankResults, hybridRerank, quickScore } from '@/lib/ai/reranking';
import { rateLimiter, getClientId } from '@/lib/ai/rate-limit';

export async function POST(request: Request) {
  // Apply rate limiting (AI operations: 20/min)
  const clientId = getClientId(request);
  const rateCheck = rateLimiter.check(clientId, 'ai');

  if (!rateCheck.allowed) {
    return NextResponse.json({
      error: 'Rate limit exceeded',
      retryAfter: rateCheck.retryAfter,
      message: `Too many requests. Please try again in ${rateCheck.retryAfter} seconds.`
    }, {
      status: 429,
      headers: {
        'X-RateLimit-Remaining': rateCheck.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateCheck.resetAt).toISOString(),
        'Retry-After': rateCheck.retryAfter?.toString() || '60'
      }
    });
  }

  try {
    const body = await request.json();
    const {
      query,
      items,
      options = {}
    } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({
        error: 'query parameter required'
      }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        error: 'items array required'
      }, { status: 400 });
    }

    const {
      topK = 10,
      includeReasoning = false,
      method = 'hybrid' // 'ai', 'quick', 'hybrid'
    } = options;

    let result;

    switch (method) {
      case 'ai':
        // Full AI reranking
        result = await rerankResults(query, items, {
          topK,
          includeReasoning
        });
        return NextResponse.json({
          query,
          method: 'ai',
          rerankedItems: result.rerankedItems,
          processingTime: result.processingTime,
          timestamp: new Date().toISOString()
        });

      case 'quick':
        // Fast heuristic scoring only
        const quickScored = items.map(item => ({
          ...item,
          score: quickScore(query, item)
        })).sort((a, b) => b.score - a.score).slice(0, topK);

        return NextResponse.json({
          query,
          method: 'quick',
          rerankedItems: quickScored.map((item, i) => ({
            id: item.id,
            originalRank: items.findIndex(it => it.id === item.id),
            newRank: i,
            relevanceScore: item.score
          })),
          timestamp: new Date().toISOString()
        });

      case 'hybrid':
      default:
        // Hybrid: quick scoring + AI for top results
        const hybridResults = await hybridRerank(query, items, {
          topK,
          aiRerankTop: 5
        });

        return NextResponse.json({
          query,
          method: 'hybrid',
          rerankedItems: hybridResults.map((item, i) => ({
            id: item.id,
            title: item.title,
            newRank: i,
            relevanceScore: item.score || 0
          })),
          timestamp: new Date().toISOString()
        });
    }

  } catch (error: any) {
    console.error('Rerank API error:', error);
    return NextResponse.json({
      error: error.message || 'Reranking failed'
    }, { status: 500 });
  }
}

// GET endpoint for API info
export async function GET() {
  return NextResponse.json({
    name: 'Re-ranking API',
    version: '1.0.0',
    methods: {
      ai: 'Full AI-powered reranking using Claude',
      quick: 'Fast heuristic-based scoring',
      hybrid: 'Quick scoring + AI for top results (default)'
    },
    example: {
      method: 'POST',
      body: {
        query: 'health services',
        items: [
          { id: '1', title: 'Health Clinic', content: '...' },
          { id: '2', title: 'Community Center', content: '...' }
        ],
        options: {
          topK: 10,
          method: 'hybrid',
          includeReasoning: false
        }
      }
    }
  });
}
