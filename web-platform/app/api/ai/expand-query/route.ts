/**
 * Query Expansion API
 *
 * Expands search queries for better results using Claude AI.
 * Features:
 * - Typo correction
 * - Synonym expansion
 * - Query reformulation
 * - Intent detection
 */

import { NextResponse } from 'next/server';
import { expandQuery, extractKeywords } from '@/lib/ai/query-expansion';
import { rateLimiter, getClientId } from '@/lib/ai/rate-limit';

export async function POST(request: Request) {
  // Apply rate limiting (query is fast: 60/min)
  const clientId = getClientId(request);
  const rateCheck = rateLimiter.check(clientId, 'query');

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
    const { query, options = {} } = body;

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        error: 'Query must be at least 2 characters'
      }, { status: 400 });
    }

    const result = await expandQuery(query, {
      context: options.context,
      maxAlternatives: options.maxAlternatives || 3,
      includeSynonyms: options.includeSynonyms !== false
    });

    return NextResponse.json({
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Query expansion API error:', error);
    return NextResponse.json({
      error: error.message || 'Query expansion failed'
    }, { status: 500 });
  }
}

// GET endpoint for quick expansion
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({
      error: 'Query parameter "q" must be at least 2 characters'
    }, { status: 400 });
  }

  try {
    // For GET requests, just extract keywords (faster, no API call)
    const keywords = extractKeywords(query);

    return NextResponse.json({
      query,
      keywords,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Keyword extraction error:', error);
    return NextResponse.json({
      error: error.message || 'Keyword extraction failed'
    }, { status: 500 });
  }
}
