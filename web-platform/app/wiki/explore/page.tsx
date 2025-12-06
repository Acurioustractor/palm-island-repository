'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import KnowledgeGraph to avoid SSR issues with D3
const KnowledgeGraph = dynamic(
  () => import('@/components/visualization/KnowledgeGraph'),
  { ssr: false, loading: () => <GraphLoading /> }
);

function GraphLoading() {
  return (
    <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-xl border border-gray-200">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading knowledge graph...</p>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const [selectedNode, setSelectedNode] = useState<{
    id: string;
    label: string;
    type: string;
  } | null>(null);

  const handleNodeClick = (node: { id: string; label: string; type: string }) => {
    setSelectedNode(node);
  };

  const getNodeUrl = (node: { id: string; type: string }) => {
    const [type, id] = node.id.split(':');
    switch (type) {
      case 'story':
        return `/stories/${id}`;
      case 'person':
        return `/wiki/people/${id}`;
      case 'knowledge':
        return `/wiki/${id}`;
      case 'place':
        return `/wiki/places/${id}`;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="text-sm mb-4">
            <Link href="/wiki" className="text-indigo-600 hover:underline">
              Wiki
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-600">Explore</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Knowledge Graph
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Explore the connections between stories, people, places, and knowledge
            in the Palm Island community. Click on any node to see details and
            navigate to related content.
          </p>
        </div>
      </div>

      {/* Graph Container */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Graph */}
          <div className="lg:col-span-3">
            <KnowledgeGraph
              width={900}
              height={600}
              onNodeClick={handleNodeClick}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Node Details */}
            {selectedNode ? (
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {selectedNode.label}
                </h3>
                <p className="text-sm text-gray-500 capitalize mb-4">
                  Type: {selectedNode.type}
                </p>
                {getNodeUrl(selectedNode) && (
                  <Link
                    href={getNodeUrl(selectedNode)!}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    View Details
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">
                  Click on a node in the graph to see details
                </p>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">How to Use</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600">•</span>
                  <span>Drag nodes to rearrange the graph</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600">•</span>
                  <span>Scroll to zoom in and out</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600">•</span>
                  <span>Click a node to see details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600">•</span>
                  <span>Use Reset View to center the graph</span>
                </li>
              </ul>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Graph Stats</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">Stories</div>
                  <div className="text-gray-600">Narratives</div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-emerald-600">People</div>
                  <div className="text-gray-600">Community</div>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-amber-600">Places</div>
                  <div className="text-gray-600">Locations</div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-indigo-600">Knowledge</div>
                  <div className="text-gray-600">Entries</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
