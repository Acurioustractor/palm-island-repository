'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface GraphNode {
  id: string;
  label: string;
  type: string;
  group: number;
  size?: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
  relationship: string;
  weight: number;
}

interface KnowledgeGraphProps {
  width?: number;
  height?: number;
  onNodeClick?: (node: GraphNode) => void;
  centeredOn?: string;
}

// Color palette for different node types
const TYPE_COLORS: Record<string, string> = {
  story: '#3B82F6',    // blue
  person: '#10B981',   // emerald
  place: '#F59E0B',    // amber
  concept: '#8B5CF6',  // violet
  event: '#EC4899',    // pink
  knowledge: '#6366F1' // indigo
};

export default function KnowledgeGraph({
  width = 800,
  height = 600,
  onNodeClick,
  centeredOn
}: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] } | null>(null);

  useEffect(() => {
    async function fetchGraph() {
      try {
        setLoading(true);
        const endpoint = centeredOn
          ? `/api/ai/knowledge-graph?action=neighborhood&nodeId=${centeredOn}&depth=2`
          : '/api/ai/knowledge-graph?action=full&limit=50';

        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setGraphData({
          nodes: data.nodes || [],
          edges: data.edges || []
        });
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchGraph();
  }, [centeredOn]);

  useEffect(() => {
    if (!graphData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { nodes, edges } = graphData;

    if (nodes.length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#6B7280')
        .text('No data to display');
      return;
    }

    // Create container with zoom
    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create force simulation
    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(edges)
        .id((d: any) => d.id)
        .distance(100)
        .strength((d: any) => d.weight || 0.5))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => (d.size || 15) + 5));

    // Create edges
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('stroke', '#CBD5E1')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d) => Math.sqrt(d.weight) * 2);

    // Create edge labels
    const linkLabel = g.append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(edges)
      .join('text')
      .attr('font-size', '8px')
      .attr('fill', '#9CA3AF')
      .attr('text-anchor', 'middle')
      .text((d) => d.relationship);

    // Create nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }) as any);

    // Node circles
    node.append('circle')
      .attr('r', (d) => d.size || 15)
      .attr('fill', (d) => TYPE_COLORS[d.type] || '#6B7280')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .on('click', (event, d) => {
        setSelectedNode(d);
        onNodeClick?.(d);
      })
      .on('mouseover', function() {
        d3.select(this).attr('stroke-width', 4);
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke-width', 2);
      });

    // Node labels
    node.append('text')
      .attr('dy', (d) => (d.size || 15) + 12)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#374151')
      .text((d) => d.label.length > 15 ? d.label.substring(0, 15) + '...' : d.label);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      linkLabel
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Initial zoom to fit
    setTimeout(() => {
      svg.transition().duration(500).call(
        zoom.transform,
        d3.zoomIdentity.translate(width / 4, height / 4).scale(0.8)
      );
    }, 100);

    return () => {
      simulation.stop();
    };
  }, [graphData, width, height, onNodeClick]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center text-red-500" style={{ width, height }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-gray-50 rounded-xl border border-gray-200"
      />

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white/90 rounded-lg p-3 shadow-sm">
        <div className="text-xs font-medium text-gray-700 mb-2">Legend</div>
        <div className="space-y-1">
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-gray-600 capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected node info */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg p-4 shadow-lg border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: TYPE_COLORS[selectedNode.type] }}
                />
                <span className="font-medium text-gray-900">{selectedNode.label}</span>
              </div>
              <div className="text-sm text-gray-500 mt-1 capitalize">
                Type: {selectedNode.type}
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => {
            const svg = d3.select(svgRef.current);
            svg.transition().duration(500).call(
              d3.zoom<SVGSVGElement, unknown>().transform as any,
              d3.zoomIdentity.translate(width / 4, height / 4).scale(0.8)
            );
          }}
          className="bg-white rounded-lg px-3 py-1 text-sm text-gray-600 shadow-sm border border-gray-200 hover:bg-gray-50"
        >
          Reset View
        </button>
      </div>
    </div>
  );
}
