/**
 * Knowledge Graph API
 *
 * Provides graph data for D3.js visualization of relationships
 * between stories, people, places, and concepts.
 */

import { NextResponse } from 'next/server';
import {
  buildKnowledgeGraph,
  getNodeNeighborhood,
  getGraphStats
} from '@/lib/ai/knowledge-graph';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'full';
  const nodeId = searchParams.get('nodeId');
  const depth = parseInt(searchParams.get('depth') || '1');
  const limit = parseInt(searchParams.get('limit') || '100');
  const types = searchParams.get('types')?.split(',');

  try {
    switch (action) {
      case 'stats':
        const stats = await getGraphStats();
        return NextResponse.json({
          action: 'stats',
          ...stats,
          timestamp: new Date().toISOString()
        });

      case 'neighborhood':
        if (!nodeId) {
          return NextResponse.json({
            error: 'nodeId required for neighborhood action'
          }, { status: 400 });
        }
        const neighborhood = await getNodeNeighborhood(nodeId, depth);
        return NextResponse.json({
          action: 'neighborhood',
          centeredOn: nodeId,
          depth,
          ...neighborhood
        });

      case 'full':
      default:
        const graph = await buildKnowledgeGraph({ limit, types });
        return NextResponse.json({
          action: 'full',
          ...graph
        });
    }

  } catch (error: any) {
    console.error('Knowledge graph error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to build knowledge graph'
    }, { status: 500 });
  }
}
