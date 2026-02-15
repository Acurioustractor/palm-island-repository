'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import OrganizationNetworkGraph from '../OrganizationNetworkGraph';
import NodeDetailPanel from '../NodeDetailPanel';
import GraphControls from '../GraphControls';
import { useDataIntelligenceStore } from '@/lib/data-intelligence/store';
import type { NetworkNode, NetworkEdge } from '@/lib/data-intelligence/types';

export default function NetworkTab() {
  const { activeDomains, toggleDomain, fiscalYear, setFiscalYear, selectedNode, setSelectedNode } = useDataIntelligenceStore();
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [edges, setEdges] = useState<NetworkEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/data-intelligence/network?fy=${fiscalYear}&domains=${activeDomains.join(',')}`);
        if (res.ok) {
          const data = await res.json();
          setNodes(data.nodes || []);
          setEdges(data.edges || []);
        }
      } catch (e) {
        console.error('Failed to load network data:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fiscalYear, activeDomains]);

  const handleExportSvg = () => {
    const svg = containerRef.current?.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `picc-network-fy${fiscalYear}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <GraphControls
        activeDomains={activeDomains}
        onToggleDomain={toggleDomain}
        fiscalYear={fiscalYear}
        onFiscalYearChange={setFiscalYear}
        availableYears={[2022, 2023, 2024, 2025]}
        onExportSvg={handleExportSvg}
      />

      <div className="relative" ref={containerRef} style={{ minHeight: 550 }}>
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <OrganizationNetworkGraph
              nodes={nodes}
              edges={edges}
              width={900}
              height={600}
              onNodeClick={setSelectedNode}
              activeDomains={activeDomains}
            />
            <NodeDetailPanel
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
            />
          </>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <div className="text-gray-500">Nodes</div>
          <div className="text-xl font-bold text-gray-900">{nodes.length}</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <div className="text-gray-500">Connections</div>
          <div className="text-xl font-bold text-gray-900">{edges.length}</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <div className="text-gray-500">Domains</div>
          <div className="text-xl font-bold text-gray-900">{activeDomains.length}/6</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <div className="text-gray-500">Fiscal Year</div>
          <div className="text-xl font-bold text-gray-900">FY{fiscalYear - 1}-{String(fiscalYear).slice(2)}</div>
        </div>
      </div>
    </div>
  );
}
