'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Network, X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: 'story' | 'person' | 'place' | 'topic' | 'service' | 'event';
  size?: number;
  color?: string;
  metadata?: Record<string, any>;
}

interface GraphEdge {
  source: string;
  target: string;
  type: 'mentions' | 'collaborates' | 'influences' | 'located_at' | 'related_to';
  strength?: number;
  label?: string;
}

interface KnowledgeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  centerNodeId?: string;
  height?: number;
  className?: string;
  onNodeClick?: (node: GraphNode) => void;
}

export function KnowledgeGraph({
  nodes,
  edges,
  centerNodeId,
  height = 500,
  className = '',
  onNodeClick,
}: KnowledgeGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  // Node type colors
  const typeColors: Record<string, string> = {
    story: '#3B82F6', // blue
    person: '#8B5CF6', // purple
    place: '#10B981', // green
    topic: '#F59E0B', // orange
    service: '#EC4899', // pink
    event: '#EF4444', // red
  };

  // Simple force-directed layout simulation
  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const container = containerRef.current;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = height;
    }

    // Initialize node positions (simple circular layout for now)
    const nodePositions = new Map<string, { x: number; y: number; vx: number; vy: number }>();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.3;

    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI;
      const isCenterNode = node.id === centerNodeId;

      nodePositions.set(node.id, {
        x: isCenterNode ? centerX : centerX + radius * Math.cos(angle),
        y: isCenterNode ? centerY : centerY + radius * Math.sin(angle),
        vx: 0,
        vy: 0,
      });
    });

    // Render function
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply zoom and pan
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // Draw edges
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 1;
      edges.forEach((edge) => {
        const sourcePos = nodePositions.get(edge.source);
        const targetPos = nodePositions.get(edge.target);
        if (sourcePos && targetPos) {
          ctx.beginPath();
          ctx.moveTo(sourcePos.x, sourcePos.y);
          ctx.lineTo(targetPos.x, targetPos.y);
          ctx.stroke();
        }
      });

      // Draw nodes
      nodes.forEach((node) => {
        const pos = nodePositions.get(node.id);
        if (!pos) return;

        const isCenterNode = node.id === centerNodeId;
        const isSelected = selectedNode?.id === node.id;
        const isHovered = hoveredNode?.id === node.id;
        const nodeSize = node.size || (isCenterNode ? 20 : 12);
        const color = node.color || typeColors[node.type];

        // Draw node circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, nodeSize, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();

        // Highlight selected/hovered nodes
        if (isSelected || isHovered) {
          ctx.strokeStyle = isSelected ? '#1E40AF' : '#60A5FA';
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // Draw label
        ctx.fillStyle = '#1F2937';
        ctx.font = isCenterNode ? 'bold 14px sans-serif' : '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          node.label.length > 20 ? node.label.substring(0, 17) + '...' : node.label,
          pos.x,
          pos.y + nodeSize + 15
        );
      });

      ctx.restore();
    };

    render();

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;

      let foundNode: GraphNode | null = null;

      for (const node of nodes) {
        const pos = nodePositions.get(node.id);
        if (!pos) continue;

        const nodeSize = node.size || (node.id === centerNodeId ? 20 : 12);
        const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));

        if (distance <= nodeSize) {
          foundNode = node;
          break;
        }
      }

      setHoveredNode(foundNode);
      canvas.style.cursor = foundNode ? 'pointer' : 'default';
      render();
    };

    const handleClick = (e: MouseEvent) => {
      if (hoveredNode) {
        setSelectedNode(hoveredNode);
        onNodeClick?.(hoveredNode);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [nodes, edges, centerNodeId, zoom, pan, selectedNode, hoveredNode, height, onNodeClick]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className={`relative bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-teal-50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Network className="h-5 w-5 text-blue-600" />
            Knowledge Graph
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-white rounded transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-white rounded transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={handleReset}
              className="p-1 hover:bg-white rounded transition-colors"
              title="Reset view"
            >
              <Maximize2 className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} style={{ height: `${height}px` }} className="relative">
        <canvas ref={canvasRef} className="w-full h-full" />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-3 text-xs">
          <div className="font-medium text-gray-900 mb-2">Node Types</div>
          <div className="space-y-1">
            {Object.entries(typeColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-700 capitalize">{type}s</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Node Info */}
        {selectedNode && (
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-4 max-w-xs">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="text-xs text-gray-600 capitalize">{selectedNode.type}</div>
                <div className="font-medium text-gray-900">{selectedNode.label}</div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            {selectedNode.metadata && (
              <div className="text-xs text-gray-600 space-y-1">
                {Object.entries(selectedNode.metadata).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium">{key}:</span> {String(value)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-600">
        <div>
          {nodes.length} nodes • {edges.length} connections
        </div>
        <div>Zoom: {(zoom * 100).toFixed(0)}%</div>
      </div>
    </div>
  );
}

export default KnowledgeGraph;
