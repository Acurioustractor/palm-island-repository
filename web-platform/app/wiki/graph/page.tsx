'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Network, BookOpen } from 'lucide-react';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';
import KnowledgeGraph from '@/components/wiki/KnowledgeGraph';

export default function KnowledgeGraphPage() {
  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[] }>({
    nodes: [],
    edges: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGraph() {
      const supabase = createClient();

      // Fetch stories and create graph
      const { data: stories } = await supabase
        .from('stories')
        .select(`
          id,
          title,
          story_category,
          storyteller:storyteller_id (
            id,
            full_name,
            preferred_name
          ),
          service:service_id (
            id,
            service_name
          )
        `)
        .eq('is_public', true)
        .limit(50);

      if (stories) {
        const nodes: any[] = [];
        const edges: any[] = [];
        const nodeMap = new Map();

        stories.forEach((story: any) => {
          // Add story node
          if (!nodeMap.has(story.id)) {
            nodes.push({
              id: story.id,
              label: story.title.length > 30 ? story.title.substring(0, 27) + '...' : story.title,
              type: 'story',
              metadata: {
                category: story.story_category,
              },
            });
            nodeMap.set(story.id, true);
          }

          // Add storyteller node and edge
          if (story.storyteller) {
            const storytellerId = story.storyteller.id;
            if (!nodeMap.has(storytellerId)) {
              nodes.push({
                id: storytellerId,
                label: story.storyteller.preferred_name || story.storyteller.full_name,
                type: 'person',
                size: 15,
              });
              nodeMap.set(storytellerId, true);
            }

            edges.push({
              source: storytellerId,
              target: story.id,
              type: 'created',
              strength: 1.0,
            });
          }

          // Add service node and edge
          if (story.service) {
            const serviceId = story.service.id;
            if (!nodeMap.has(serviceId)) {
              nodes.push({
                id: serviceId,
                label: story.service.service_name,
                type: 'service',
                size: 18,
              });
              nodeMap.set(serviceId, true);
            }

            edges.push({
              source: story.id,
              target: serviceId,
              type: 'related_to',
              strength: 0.8,
            });
          }
        });

        setGraphData({ nodes, edges });
      }

      setLoading(false);
    }

    loadGraph();
  }, []);

  const breadcrumbs = [
    { label: 'Wiki', href: '/wiki', icon: BookOpen },
    { label: 'Knowledge Graph', href: '/wiki/graph' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <Network className="h-10 w-10 text-blue-600" />
          Knowledge Graph
        </h1>
        <p className="text-xl text-gray-600">
          Explore the relationships between stories, people, and services
        </p>
      </div>

      {/* Graph */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Building knowledge graph...</p>
          </div>
        </div>
      ) : (
        <KnowledgeGraph
          nodes={graphData.nodes}
          edges={graphData.edges}
          height={600}
          onNodeClick={(node) => {
            console.log('Clicked:', node);
            // Navigate based on node type
            if (node.type === 'story') {
              window.location.href = `/stories/${node.id}`;
            } else if (node.type === 'person') {
              window.location.href = `/wiki/people/${node.id}`;
            }
          }}
        />
      )}

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">How to use the knowledge graph:</h3>
        <ul className="space-y-2 text-gray-700">
          <li>• <strong>Nodes</strong> represent stories (blue), people (purple), places (green), topics (orange), services (pink)</li>
          <li>• <strong>Lines</strong> show relationships between items</li>
          <li>• <strong>Click nodes</strong> to see details and navigate to that page</li>
          <li>• <strong>Zoom</strong> in/out using the controls or mouse wheel</li>
          <li>• <strong>Pan</strong> by dragging the canvas</li>
        </ul>
      </div>
    </div>
  );
}
