'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import type { NetworkNode, NetworkEdge, NodeType, EdgeType } from '@/lib/data-intelligence/types';
import { EDGE_STYLES } from '@/lib/data-intelligence/types';

interface OrganizationNetworkGraphProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  width?: number;
  height?: number;
  onNodeClick?: (node: NetworkNode) => void;
  activeDomains?: NodeType[];
}

// Cluster positions by domain type
const CLUSTER_POSITIONS: Record<NodeType, { x: number; y: number }> = {
  service: { x: 0.3, y: 0.3 },
  partner: { x: 0.7, y: 0.3 },
  finance: { x: 0.7, y: 0.7 },
  staff: { x: 0.3, y: 0.7 },
  story: { x: 0.5, y: 0.15 },
  governance: { x: 0.5, y: 0.5 },
};

function drawNodeShape(
  selection: d3.Selection<SVGGElement, NetworkNode, SVGGElement, unknown>,
) {
  selection.each(function (d) {
    const g = d3.select(this);
    const s = d.size;

    switch (d.type) {
      case 'partner': // diamond
        g.append('path')
          .attr('d', `M0,${-s} L${s},0 L0,${s} L${-s},0 Z`)
          .attr('fill', d.color)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
        break;

      case 'finance': { // hexagon
        const pts = Array.from({ length: 6 }, (_, i) => {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          return `${s * Math.cos(angle)},${s * Math.sin(angle)}`;
        });
        g.append('path')
          .attr('d', `M${pts.join('L')}Z`)
          .attr('fill', d.color)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
        break;
      }

      case 'governance': // rounded rect
        g.append('rect')
          .attr('x', -s)
          .attr('y', -s * 0.7)
          .attr('width', s * 2)
          .attr('height', s * 1.4)
          .attr('rx', 4)
          .attr('fill', d.color)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
        break;

      default: // circle for service, staff, story
        g.append('circle')
          .attr('r', s)
          .attr('fill', d.color)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
        break;
    }
  });
}

export default function OrganizationNetworkGraph({
  nodes,
  edges,
  width = 900,
  height = 600,
  onNodeClick,
  activeDomains,
}: OrganizationNetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null);

  const filteredNodes = activeDomains
    ? nodes.filter(n => activeDomains.includes(n.type) || n.id === 'picc-hub')
    : nodes;

  const nodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = edges.filter(e => nodeIds.has(e.source as string) && nodeIds.has(e.target as string));

  const renderGraph = useCallback(() => {
    if (!svgRef.current || filteredNodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g');

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom);

    // Clone data for d3 mutation
    const simNodes = filteredNodes.map(n => ({ ...n }));
    const simEdges = filteredEdges.map(e => ({ ...e }));

    // Force simulation
    const simulation = d3.forceSimulation(simNodes as any)
      .force('link', d3.forceLink(simEdges as any)
        .id((d: any) => d.id)
        .distance(80)
        .strength((d: any) => (d.weight || 0.5) * 0.3))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.size + 8))
      .force('x', d3.forceX().x((d: any) => {
        const pos = CLUSTER_POSITIONS[d.type as NodeType];
        return pos ? pos.x * width : width / 2;
      }).strength(0.05))
      .force('y', d3.forceY().y((d: any) => {
        const pos = CLUSTER_POSITIONS[d.type as NodeType];
        return pos ? pos.y * height : height / 2;
      }).strength(0.05));

    simulationRef.current = simulation;

    // Edges
    const link = g.append('g')
      .selectAll('line')
      .data(simEdges)
      .join('line')
      .attr('stroke', (d: any) => EDGE_STYLES[d.type as EdgeType]?.stroke || '#CBD5E1')
      .attr('stroke-dasharray', (d: any) => EDGE_STYLES[d.type as EdgeType]?.dasharray || '')
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', (d: any) => Math.max(1, (d.weight || 0.5) * 3));

    // Node groups
    const node = g.append('g')
      .selectAll<SVGGElement, NetworkNode>('g')
      .data(simNodes as NetworkNode[])
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, NetworkNode>()
        .on('start', (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }) as any);

    // Draw shapes
    drawNodeShape(node);

    // Click handler
    node.on('click', (_event, d) => onNodeClick?.(d));

    // Hover effects
    node.on('mouseover', function () {
      d3.select(this).select('circle, path, rect').attr('stroke-width', 4);
    }).on('mouseout', function () {
      d3.select(this).select('circle, path, rect').attr('stroke-width', 2);
    });

    // Labels
    node.append('text')
      .attr('dy', (d: NetworkNode) => d.size + 14)
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px')
      .attr('fill', '#374151')
      .attr('pointer-events', 'none')
      .text((d: NetworkNode) => d.label.length > 20 ? d.label.substring(0, 18) + '...' : d.label);

    // Tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Initial fit
    setTimeout(() => {
      svg.transition().duration(500).call(
        zoom.transform,
        d3.zoomIdentity.translate(0, 0).scale(0.85)
      );
    }, 200);

    return () => simulation.stop();
  }, [filteredNodes, filteredEdges, width, height, onNodeClick]);

  useEffect(() => {
    const cleanup = renderGraph();
    return () => {
      cleanup?.();
      simulationRef.current?.stop();
    };
  }, [renderGraph]);

  if (filteredNodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        No data to display. Select domains to visualize.
      </div>
    );
  }

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="bg-gray-50 rounded-xl border border-gray-200"
      style={{ width: '100%', height: '100%', minHeight: 500 }}
      viewBox={`0 0 ${width} ${height}`}
    />
  );
}
