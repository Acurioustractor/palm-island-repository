'use client'

/**
 * NetworkGraph — SVG force-directed graph for /voices/network.
 *
 * Uses d3-force for the simulation (already in package.json via d3 v7),
 * but renders nodes/edges as plain SVG so we keep full control over the
 * visual language (Saltwater & Earth palette, photo nodes with initial
 * fallbacks, hover tooltips).
 *
 * Interaction model:
 *   - Hover: Fraunces tooltip with name + role + neighbour count
 *   - Click node: highlight that node + edges + neighbours, others fade
 *   - Click empty: clear selection
 *   - Touch: pinch-zoom + pan via transform on the inner <g>
 *
 * Simulation runs once on mount, freezes on convergence. Re-runs on
 * resize so the layout fits the new canvas width.
 */

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force'
import type { Simulation } from 'd3-force'
import Link from 'next/link'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

export interface GraphNode {
  id: string
  name: string
  slug: string
  avatar: string | null
  role: string
}

export interface GraphEdge {
  source: string
  target: string
  weight: number
}

interface SimNode extends GraphNode {
  x: number
  y: number
  vx: number
  vy: number
  fx?: number | null
  fy?: number | null
}

interface SimEdge {
  source: SimNode
  target: SimNode
  weight: number
}

const NODE_R = 24
const STAGE_HEIGHT = 620
const MIN_WIDTH = 320

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '·'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface Props {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export default function NetworkGraph({ nodes: rawNodes, edges: rawEdges }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const simRef = useRef<Simulation<SimNode, SimEdge> | null>(null)
  const [width, setWidth] = useState(900)
  const [, force] = useState(0) // tick counter to force re-render
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null)

  // Pan + zoom state — single transform on inner <g>.
  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 })
  const dragStartRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null)
  const pinchStartRef = useRef<{ dist: number; k: number; cx: number; cy: number } | null>(null)

  // Build mutable simulation nodes/edges that d3 can mutate in place.
  const { simNodes, simEdges, neighbours, neighbourCount } = useMemo(() => {
    const nodeMap = new Map<string, SimNode>()
    const sn: SimNode[] = rawNodes.map((n, i) => {
      const angle = (i / Math.max(1, rawNodes.length)) * Math.PI * 2
      const r = 200
      const node: SimNode = {
        ...n,
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
        vx: 0,
        vy: 0,
      }
      nodeMap.set(n.id, node)
      return node
    })
    const se: SimEdge[] = []
    const nb = new Map<string, Set<string>>()
    for (const e of rawEdges) {
      const s = nodeMap.get(e.source)
      const t = nodeMap.get(e.target)
      if (!s || !t) continue
      se.push({ source: s, target: t, weight: e.weight })
      if (!nb.has(e.source)) nb.set(e.source, new Set())
      if (!nb.has(e.target)) nb.set(e.target, new Set())
      nb.get(e.source)!.add(e.target)
      nb.get(e.target)!.add(e.source)
    }
    const counts = new Map<string, number>()
    nb.forEach((set, id) => counts.set(id, set.size))
    return { simNodes: sn, simEdges: se, neighbours: nb, neighbourCount: counts }
  }, [rawNodes, rawEdges])

  // Resize observer keeps the canvas wide as the container changes.
  useEffect(() => {
    if (!wrapRef.current) return
    const ro = new ResizeObserver((entries) => {
      const w = Math.max(MIN_WIDTH, entries[0].contentRect.width)
      setWidth(w)
    })
    ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [])

  // Run / re-run the simulation when dataset or width changes.
  useEffect(() => {
    if (simNodes.length === 0) return
    const sim = forceSimulation<SimNode, SimEdge>(simNodes)
      .force(
        'link',
        forceLink<SimNode, SimEdge>(simEdges)
          .id((d) => d.id)
          .distance(110)
          .strength(0.7),
      )
      .force('charge', forceManyBody<SimNode>().strength(-280))
      .force('center', forceCenter(width / 2, STAGE_HEIGHT / 2))
      .force('collide', forceCollide<SimNode>().radius(NODE_R + 6).strength(0.9))
      .alpha(1)
      .alphaDecay(0.04)
      .on('tick', () => force((n) => n + 1))

    simRef.current = sim
    return () => {
      sim.stop()
    }
  }, [simNodes, simEdges, width])

  // Pan handlers (pointer-based — works for mouse + single-finger touch).
  const onPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    // Don't pan if the user clicked a node — node click handler will
    // call stopPropagation. Empty-canvas click reaches us here.
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      tx: transform.x,
      ty: transform.y,
    }
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }, [transform.x, transform.y])

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragStartRef.current) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    setTransform((t) => ({ ...t, x: dragStartRef.current!.tx + dx, y: dragStartRef.current!.ty + dy }))
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const moved = dragStartRef.current && (
      Math.abs(e.clientX - dragStartRef.current.x) > 4 ||
      Math.abs(e.clientY - dragStartRef.current.y) > 4
    )
    dragStartRef.current = null
    // If it was a tap (no movement) on empty canvas, clear selection.
    if (!moved) setSelectedId(null)
  }, [])

  // Wheel zoom — desktop nicety.
  const onWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault()
    const delta = -e.deltaY * 0.0015
    setTransform((t) => ({ ...t, k: Math.max(0.4, Math.min(3, t.k + delta)) }))
  }, [])

  // Touch pinch-zoom.
  const onTouchStart = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]]
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
      pinchStartRef.current = {
        dist,
        k: transform.k,
        cx: (a.clientX + b.clientX) / 2,
        cy: (a.clientY + b.clientY) / 2,
      }
    }
  }, [transform.k])

  const onTouchMove = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 2 && pinchStartRef.current) {
      const [a, b] = [e.touches[0], e.touches[1]]
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
      const ratio = dist / pinchStartRef.current.dist
      setTransform((t) => ({ ...t, k: Math.max(0.4, Math.min(3, pinchStartRef.current!.k * ratio)) }))
    }
  }, [])

  const onTouchEnd = useCallback(() => {
    pinchStartRef.current = null
  }, [])

  const handleNodeClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setSelectedId((cur) => (cur === id ? null : id))
  }

  const isFaded = (id: string): boolean => {
    if (!selectedId) return false
    if (id === selectedId) return false
    const nb = neighbours.get(selectedId)
    return !nb || !nb.has(id)
  }

  const isEdgeFaded = (e: SimEdge): boolean => {
    if (!selectedId) return false
    return e.source.id !== selectedId && e.target.id !== selectedId
  }

  // Tooltip data
  const hoverNode = hoverId ? simNodes.find((n) => n.id === hoverId) : null
  const hoverNeighbourCount = hoverId ? (neighbourCount.get(hoverId) ?? 0) : 0

  return (
    <div
      ref={wrapRef}
      className="relative w-full rounded-lg overflow-hidden"
      style={{
        background: '#fff',
        border: `1px solid ${C.border}`,
        height: STAGE_HEIGHT,
      }}
    >
      <svg
        width={width}
        height={STAGE_HEIGHT}
        style={{ display: 'block', cursor: dragStartRef.current ? 'grabbing' : 'grab', touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
          {/* Edges first so nodes paint on top */}
          {simEdges.map((e, i) => {
            const faded = isEdgeFaded(e)
            const baseAlpha = Math.min(0.7, 0.18 + (e.weight / 6) * 0.4)
            return (
              <line
                key={i}
                x1={e.source.x}
                y1={e.source.y}
                x2={e.target.x}
                y2={e.target.y}
                stroke={C.ocean}
                strokeWidth={Math.max(1, Math.min(3, e.weight * 0.6))}
                strokeOpacity={faded ? 0.05 : baseAlpha}
              />
            )
          })}

          {/* Nodes */}
          {simNodes.map((n) => {
            const faded = isFaded(n.id)
            const isSelected = n.id === selectedId
            const opacity = faded ? 0.25 : 1
            return (
              <g
                key={n.id}
                transform={`translate(${n.x},${n.y})`}
                style={{ cursor: 'pointer', opacity, transition: 'opacity 200ms ease' }}
                onClick={(e) => handleNodeClick(e, n.id)}
                onMouseEnter={() => {
                  setHoverId(n.id)
                  setHoverPos({ x: n.x * transform.k + transform.x, y: n.y * transform.k + transform.y })
                }}
                onMouseLeave={() => {
                  setHoverId(null)
                  setHoverPos(null)
                }}
              >
                {/* Selection ring */}
                {isSelected && (
                  <circle
                    r={NODE_R + 4}
                    fill="none"
                    stroke={C.ochre}
                    strokeWidth={2.5}
                  />
                )}
                {/* Photo or initials */}
                {n.avatar ? (
                  <>
                    <defs>
                      <clipPath id={`clip-${n.id}`}>
                        <circle r={NODE_R} />
                      </clipPath>
                    </defs>
                    <circle r={NODE_R} fill={C.sand} stroke={C.ocean} strokeWidth={1.5} />
                    <image
                      href={n.avatar}
                      x={-NODE_R}
                      y={-NODE_R}
                      width={NODE_R * 2}
                      height={NODE_R * 2}
                      clipPath={`url(#clip-${n.id})`}
                      preserveAspectRatio="xMidYMid slice"
                    />
                    <circle r={NODE_R} fill="none" stroke={C.ocean} strokeWidth={1.5} />
                  </>
                ) : (
                  <>
                    <circle r={NODE_R} fill={C.sand} stroke={C.ocean} strokeWidth={1.5} />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={14}
                      fontWeight={700}
                      fill={C.ocean}
                      style={{ fontFamily: '"Fraunces", Georgia, serif' }}
                    >
                      {initials(n.name)}
                    </text>
                  </>
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {/* Hover tooltip — Fraunces, anchored to node screen position */}
      {hoverNode && hoverPos && (
        <div
          className="pointer-events-none absolute"
          style={{
            left: hoverPos.x + NODE_R + 8,
            top: hoverPos.y - 18,
            background: C.midnight,
            color: '#fff',
            padding: '8px 12px',
            borderRadius: 6,
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: 13,
            lineHeight: 1.35,
            maxWidth: 220,
            boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
            zIndex: 10,
          }}
        >
          <div style={{ fontWeight: 600 }}>{hoverNode.name}</div>
          <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 11, marginTop: 2 }}>
            {hoverNode.role}
          </div>
          <div style={{ color: C.starGold, fontSize: 11, marginTop: 4, fontWeight: 600 }}>
            {hoverNeighbourCount} connection{hoverNeighbourCount === 1 ? '' : 's'}
          </div>
        </div>
      )}

      {/* Selection panel — bottom-left, links into profile */}
      {selectedId && (() => {
        const sel = simNodes.find((n) => n.id === selectedId)
        if (!sel) return null
        const count = neighbourCount.get(sel.id) ?? 0
        return (
          <div
            className="absolute left-4 bottom-4 sm:left-6 sm:bottom-6"
            style={{
              background: '#fff',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: '12px 16px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              maxWidth: 280,
            }}
          >
            <div
              className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1"
              style={{ color: C.muted }}
            >
              Selected
            </div>
            <div
              className="font-serif text-lg"
              style={{ color: C.earth, fontFamily: '"Fraunces", Georgia, serif' }}
            >
              {sel.name}
            </div>
            <div className="text-xs mt-1" style={{ color: C.driftwood }}>
              {sel.role} · {count} connection{count === 1 ? '' : 's'}
            </div>
            <Link
              href={`/voices/${sel.slug}`}
              className="inline-block mt-3 text-xs font-bold uppercase tracking-[0.2em] hover:opacity-80"
              style={{ color: C.ocean }}
            >
              See profile →
            </Link>
          </div>
        )
      })()}
    </div>
  )
}
