'use client'

import { useEffect, useRef } from 'react'
import { Network } from 'lucide-react'
import type { GraphData } from './ToolResultRenderer'

interface KnowledgeGraphMiniProps {
  data: GraphData
  darkMode?: boolean
}

const TYPE_COLORS: Record<string, string> = {
  story: '#f59e0b',
  person: '#3b82f6',
  place: '#10b981',
  concept: '#8b5cf6',
  event: '#ef4444',
  knowledge: '#06b6d4',
}

export function KnowledgeGraphMini({ data, darkMode = false }: KnowledgeGraphMiniProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return

    const width = svgRef.current.clientWidth || 600
    const height = 300
    const cx = width / 2
    const cy = height / 2

    type NodePos = { id: string; x: number; y: number; vx: number; vy: number; label: string; type: string; size: number }

    const nodePositions: NodePos[] = data.nodes.map((n) => ({
      id: n.id,
      x: cx + (Math.random() - 0.5) * width * 0.6,
      y: cy + (Math.random() - 0.5) * height * 0.6,
      vx: 0,
      vy: 0,
      label: n.label,
      type: n.type,
      size: n.size || 12,
    }))

    const nodeMap = new Map(nodePositions.map(n => [n.id, n]))

    for (let iter = 0; iter < 80; iter++) {
      for (let i = 0; i < nodePositions.length; i++) {
        for (let j = i + 1; j < nodePositions.length; j++) {
          const a = nodePositions[i]
          const b = nodePositions[j]
          let dx = b.x - a.x
          let dy = b.y - a.y
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
          const force = 800 / (dist * dist)
          dx = (dx / dist) * force
          dy = (dy / dist) * force
          a.vx -= dx; a.vy -= dy
          b.vx += dx; b.vy += dy
        }
      }

      for (const edge of data.edges) {
        const source = nodeMap.get(edge.source)
        const target = nodeMap.get(edge.target)
        if (!source || !target) continue
        const dx = target.x - source.x
        const dy = target.y - source.y
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
        const force = (dist - 80) * 0.01
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        source.vx += fx; source.vy += fy
        target.vx -= fx; target.vy -= fy
      }

      for (const node of nodePositions) {
        node.vx += (cx - node.x) * 0.005
        node.vy += (cy - node.y) * 0.005
      }

      for (const node of nodePositions) {
        node.vx *= 0.8
        node.vy *= 0.8
        node.x += node.vx
        node.y += node.vy
        node.x = Math.max(30, Math.min(width - 30, node.x))
        node.y = Math.max(20, Math.min(height - 20, node.y))
      }
    }

    const svg = svgRef.current
    svg.innerHTML = ''
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)

    // Edges
    for (const edge of data.edges) {
      const source = nodeMap.get(edge.source)
      const target = nodeMap.get(edge.target)
      if (!source || !target) continue
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('x1', String(source.x))
      line.setAttribute('y1', String(source.y))
      line.setAttribute('x2', String(target.x))
      line.setAttribute('y2', String(target.y))
      line.setAttribute('stroke', darkMode ? 'rgba(255,255,255,0.06)' : '#e5e7eb')
      line.setAttribute('stroke-width', '1')
      svg.appendChild(line)
    }

    // Nodes
    for (const node of nodePositions) {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      const r = Math.min(node.size, 20)
      circle.setAttribute('cx', String(node.x))
      circle.setAttribute('cy', String(node.y))
      circle.setAttribute('r', String(r))
      circle.setAttribute('fill', TYPE_COLORS[node.type] || '#9ca3af')
      circle.setAttribute('opacity', darkMode ? '0.6' : '0.8')
      g.appendChild(circle)

      // Glow effect in dark mode
      if (darkMode && r >= 8) {
        const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        glow.setAttribute('cx', String(node.x))
        glow.setAttribute('cy', String(node.y))
        glow.setAttribute('r', String(r + 4))
        glow.setAttribute('fill', 'none')
        glow.setAttribute('stroke', TYPE_COLORS[node.type] || '#9ca3af')
        glow.setAttribute('stroke-width', '1')
        glow.setAttribute('opacity', '0.15')
        g.insertBefore(glow, circle)
      }

      if (r >= 10) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        text.setAttribute('x', String(node.x))
        text.setAttribute('y', String(node.y + r + 12))
        text.setAttribute('text-anchor', 'middle')
        text.setAttribute('fill', darkMode ? 'rgba(255,255,255,0.4)' : '#6b7280')
        text.setAttribute('font-size', '9')
        text.textContent = node.label.length > 18 ? node.label.slice(0, 16) + '...' : node.label
        g.appendChild(text)
      }

      svg.appendChild(g)
    }
  }, [data, darkMode])

  if (!data.nodes.length) {
    return (
      <div className={`my-4 rounded-2xl p-6 text-center text-sm ${
        darkMode ? 'bg-white/[0.04] text-white/40' : 'bg-gray-50 text-gray-500'
      }`}>
        No knowledge graph data available.
      </div>
    )
  }

  return (
    <div className={`my-2 rounded-2xl overflow-hidden ${
      darkMode
        ? 'bg-white/[0.04] border border-white/[0.06]'
        : 'bg-white border border-gray-100'
    }`}>
      <div className={`px-4 py-3 border-b flex items-center gap-2 ${
        darkMode ? 'bg-white/[0.02] border-white/[0.04]' : 'bg-gray-50 border-gray-100'
      }`}>
        <Network className={`w-4 h-4 ${darkMode ? 'text-white/30' : 'text-gray-500'}`} />
        <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
          Knowledge Graph
          {data.centeredOn && <> &mdash; centered on {data.centeredOn}</>}
        </span>
        <span className={`ml-auto text-xs ${darkMode ? 'text-white/25' : 'text-gray-400'}`}>
          {data.stats.totalNodes} nodes, {data.stats.totalEdges} connections
        </span>
      </div>

      <div className="p-2">
        <svg ref={svgRef} className="w-full" style={{ height: 300 }} />
      </div>

      {/* Legend */}
      <div className="px-4 pb-3 flex flex-wrap gap-3">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color, opacity: darkMode ? 0.6 : 0.8 }} />
            <span className={`text-xs capitalize ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>{type}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
