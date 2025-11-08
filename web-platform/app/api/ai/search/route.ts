import { NextRequest, NextResponse } from 'next/server';

/**
 * Semantic Search API Route
 * Proxies requests to the Python AI backend for semantic story search
 */

const AI_BACKEND_URL = process.env.AI_BACKEND_URL || 'http://localhost:8001';

interface SearchRequest {
  query: string;
  limit?: number;
}

interface SearchResult {
  id: string;
  score: number;
  title: string;
  content_preview: string;
  story_type: string;
  created_at: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();

    const { query, limit = 10 } = body;

    // Validate query
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Call Python AI backend
    const response = await fetch(`${AI_BACKEND_URL}/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, limit }),
    });

    if (!response.ok) {
      throw new Error(`AI backend returned ${response.status}`);
    }

    const results: SearchResult[] = await response.json();

    return NextResponse.json(results);

  } catch (error) {
    console.error('Semantic search error:', error);

    return NextResponse.json(
      {
        error: 'Failed to perform semantic search',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    const response = await fetch(`${AI_BACKEND_URL}/health`, {
      method: 'GET',
    });

    const health = await response.json();

    return NextResponse.json({
      status: 'healthy',
      ai_backend: health,
      backend_url: AI_BACKEND_URL,
    });

  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Cannot connect to AI backend',
        backend_url: AI_BACKEND_URL,
      },
      { status: 503 }
    );
  }
}
