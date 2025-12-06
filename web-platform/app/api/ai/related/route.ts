/**
 * Related Content API
 *
 * Find semantically related content across the knowledge base.
 */

import { NextResponse } from 'next/server';
import {
  findRelatedContent,
  findRelatedToStory,
  findRelatedToPerson,
  findRelatedToKnowledge,
  discoverConnections
} from '@/lib/ai/related-content';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type') as 'story' | 'person' | 'knowledge';
  const limit = parseInt(searchParams.get('limit') || '5');

  if (!id) {
    return NextResponse.json({ error: 'id parameter required' }, { status: 400 });
  }

  if (!type || !['story', 'person', 'knowledge'].includes(type)) {
    return NextResponse.json({
      error: 'type parameter required (story, person, or knowledge)'
    }, { status: 400 });
  }

  try {
    const related = await findRelatedContent(id, type, limit);

    return NextResponse.json({
      sourceId: id,
      sourceType: type,
      relatedItems: related,
      count: related.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Related content error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to find related content'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, items, existingConnections = [] } = body;

    if (action === 'discover') {
      // AI-powered connection discovery
      if (!items || !Array.isArray(items)) {
        return NextResponse.json({
          error: 'items array required for discover action'
        }, { status: 400 });
      }

      const connections = await discoverConnections(items, existingConnections);

      return NextResponse.json({
        action: 'discover',
        connections,
        count: connections.length,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      error: 'Unknown action. Use: discover'
    }, { status: 400 });

  } catch (error: any) {
    console.error('Related content POST error:', error);
    return NextResponse.json({
      error: error.message || 'Request failed'
    }, { status: 500 });
  }
}
