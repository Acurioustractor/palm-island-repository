'use client'

/**
 * Bwgcolman Constellation — client viz.
 *
 * d3-force layout with three layers:
 *   1. Face nodes drift in the field.
 *   2. Theme gravity wells sit on a fixed ring around the centre. Clicking
 *      a well biases the simulation so faces flow toward it.
 *   3. A year scrubber filters nodes by taken_at (when set on the EL v2 row).
 *
 * Cultural protocol layer is part of the design, not a toggle:
 *   - Only EL v2 consented photos are ever fetched (server-side gate).
 *   - The Permissions panel is always visible — sovereignty made legible.
 *   - "Every face here has said yes" is the standing caption.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import type {
  ConstellationPayload,
  FaceNode,
  ThemeWell,
} from '@/lib/constellation/types'

interface Props {
  data: ConstellationPayload
}

type Sim = d3.Simulation<SimFace, undefined>

interface SimFace extends d3.SimulationNodeDatum {
  id: string
  face: FaceNode
  /** Index into themes array (assigned at random for visual variety). */
  themeIndex: number
}

const FACE_RADIUS = 22
const WIDTH_FALLBACK = 1100
const HEIGHT = 680

const VOICE_RING_COLORS: Record<string, string> = {
  organisation: '#2D5F4F',
  staff: '#5B8A72',
  community: '#D4A373',
  supporter: '#D97757',
  elder: '#B8860B',
}

function colourForSlot(slot: string | null): string {
  if (!slot) return VOICE_RING_COLORS.community
  if (slot.startsWith('elder')) return VOICE_RING_COLORS.elder
  if (slot.startsWith('staff') || slot.startsWith('service')) return VOICE_RING_COLORS.staff
  if (slot.startsWith('board') || slot.startsWith('governance')) return VOICE_RING_COLORS.organisation
  return VOICE_RING_COLORS.community
}

export default function Constellation({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const simulationRef = useRef<Sim | null>(null)

  const [width, setWidth] = useState(WIDTH_FALLBACK)
  const [activeTheme, setActiveTheme] = useState<string | null>(null)
  const [activeFace, setActiveFace] = useState<FaceNode | null>(null)

  // Year-range support: years anchors give us min/max; faces with a year
  // outside the active window are dimmed (not hidden — community is always
  // present, time just changes who is highlighted).
  const yearBounds = useMemo(() => {
    const fyYears = data.years.map((y) => y.fiscal_year)
    const faceYears = data.faces.map((f) => f.year).filter((y): y is number => y !== null)
    const all = [...fyYears, ...faceYears]
    if (all.length === 0) return { min: 2008, max: new Date().getFullYear() }
    return { min: Math.min(...all), max: Math.max(...all) }
  }, [data])
  const [activeYear, setActiveYear] = useState<number>(yearBounds.max)

  // Sim nodes — assign a theme bias index to each face for visual flow.
  const simFaces: SimFace[] = useMemo(
    () =>
      data.faces.map((f, i) => ({
        id: f.id,
        face: f,
        themeIndex: data.themes.length === 0 ? 0 : i % data.themes.length,
      })),
    [data.faces, data.themes.length],
  )

  // Theme well positions — on a ring around centre. Outer radius is sized
  // so faces have room to flow toward and away from each well.
  const themeWells = useMemo(() => {
    if (data.themes.length === 0) return [] as Array<ThemeWell & { x: number; y: number }>
    const radius = Math.min(width, HEIGHT) * 0.36
    const cx = width / 2
    const cy = HEIGHT / 2
    return data.themes.map((t, i) => {
      const angle = (i / data.themes.length) * Math.PI * 2 - Math.PI / 2
      return {
        ...t,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      }
    })
  }, [data.themes, width])

  // Responsive width
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width
      if (w > 200) setWidth(w)
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Build / rebuild the simulation when faces, width, or theme target changes.
  useEffect(() => {
    if (!svgRef.current || simFaces.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const defs = svg.append('defs')

    // Clip path so face photos render as circles regardless of source ratio.
    const clipId = 'constellation-face-clip'
    defs
      .append('clipPath')
      .attr('id', clipId)
      .append('circle')
      .attr('r', FACE_RADIUS)

    const cx = width / 2
    const cy = HEIGHT / 2

    // Background ring — visual anchor that makes the field feel intentional.
    svg
      .append('circle')
      .attr('cx', cx)
      .attr('cy', cy)
      .attr('r', Math.min(width, HEIGHT) * 0.4)
      .attr('fill', 'none')
      .attr('stroke', '#E3D5C5')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4 6')
      .attr('opacity', 0.6)

    // Theme wells.
    const wellGroup = svg.append('g').attr('class', 'wells')
    const wells = wellGroup
      .selectAll('g')
      .data(themeWells)
      .join('g')
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        setActiveTheme((curr) => (curr === d.key ? null : d.key))
      })

    wells
      .append('circle')
      .attr('r', (d) => 18 + Math.sqrt(d.count) * 2)
      .attr('fill', (d) => (d.key === activeTheme ? '#2D5F4F' : '#F4E9DC'))
      .attr('stroke', '#2D5F4F')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.85)

    wells
      .append('text')
      .text((d) => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('font-family', 'Georgia, serif')
      .attr('font-size', 12)
      .attr('font-weight', 600)
      .attr('fill', (d) => (d.key === activeTheme ? '#FBF6EE' : '#2C2C2C'))
      .attr('pointer-events', 'none')

    wells
      .append('text')
      .text((d) => `${d.count} voices`)
      .attr('text-anchor', 'middle')
      .attr('dy', 22)
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-size', 10)
      .attr('fill', '#6B5D4F')
      .attr('pointer-events', 'none')

    // Face nodes.
    const faceGroup = svg.append('g').attr('class', 'faces')
    const facePoints = faceGroup
      .selectAll<SVGGElement, SimFace>('g')
      .data(simFaces, (d) => d.id)
      .join('g')
      .style('cursor', 'pointer')
      .on('click', (_event, d) => setActiveFace(d.face))

    facePoints
      .append('circle')
      .attr('r', FACE_RADIUS + 3)
      .attr('fill', 'none')
      .attr('stroke', (d) => colourForSlot(d.face.slot))
      .attr('stroke-width', 2)
      .attr('opacity', 0.85)

    facePoints
      .append('image')
      .attr('href', (d) => d.face.avatar_url)
      .attr('x', -FACE_RADIUS)
      .attr('y', -FACE_RADIUS)
      .attr('width', FACE_RADIUS * 2)
      .attr('height', FACE_RADIUS * 2)
      .attr('preserveAspectRatio', 'xMidYMid slice')
      .attr('clip-path', `url(#${clipId})`)

    // Year-window opacity: faces outside the window dim down.
    facePoints.attr('opacity', (d) => {
      if (d.face.year === null) return 1
      return d.face.year <= activeYear ? 1 : 0.18
    })

    // Theme well drives a custom force. When a theme is active, every face
    // is pulled toward that well; otherwise faces drift toward their assigned
    // theme bias (light scatter so the field feels alive).
    function themeForce(alpha: number) {
      simFaces.forEach((node) => {
        const targetIdx =
          activeTheme === null
            ? node.themeIndex
            : themeWells.findIndex((t) => t.key === activeTheme)
        const well = themeWells[targetIdx]
        if (!well || node.x === undefined || node.y === undefined) return
        const k = activeTheme === null ? 0.04 : 0.18
        node.vx = (node.vx ?? 0) + (well.x - node.x) * k * alpha
        node.vy = (node.vy ?? 0) + (well.y - node.y) * k * alpha
      })
    }

    const sim = d3
      .forceSimulation<SimFace>(simFaces)
      .force(
        'collision',
        d3.forceCollide<SimFace>().radius(FACE_RADIUS + 4).strength(0.9),
      )
      .force('charge', d3.forceManyBody().strength(-18))
      .force('centre', d3.forceCenter(cx, cy).strength(0.04))
      .force('theme', themeForce as unknown as d3.Force<SimFace, undefined>)
      .alpha(0.9)
      .alphaDecay(0.04)
      .on('tick', () => {
        facePoints.attr('transform', (d) => `translate(${d.x}, ${d.y})`)
      })

    simulationRef.current = sim

    return () => {
      sim.stop()
    }
  }, [simFaces, themeWells, width, activeTheme, activeYear])

  return (
    <div ref={containerRef} className="relative w-full">
      <svg
        ref={svgRef}
        width="100%"
        height={HEIGHT}
        viewBox={`0 0 ${width} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ background: 'linear-gradient(180deg, #FBF6EE 0%, #F4E9DC 100%)' }}
      />

      {/* Permissions panel (top-right) — data sovereignty made legible */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-stone-200 shadow-sm text-xs text-charcoal max-w-[240px]">
        <div className="text-[10px] uppercase tracking-wide text-stone-500 mb-2 font-semibold">
          Permissions
        </div>
        <div className="space-y-1">
          <div>
            <span className="font-semibold text-sage-700">{data.meta.faces_consented}</span>{' '}
            faces consented
          </div>
          <div>
            <span className="font-semibold text-sage-700">{data.meta.voices_validated}</span>{' '}
            voices validated
          </div>
          <div className="text-stone-500 text-[11px] mt-1">
            Elder approvals current as of {data.meta.elder_approvals_current_as_of}
          </div>
        </div>
      </div>

      {/* Active face card (bottom-left) */}
      {activeFace && (
        <div className="absolute bottom-20 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 border border-stone-200 shadow-lg max-w-[280px]">
          <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-1">
            Voice
          </div>
          <div className="font-serif text-base text-charcoal mb-1">
            {activeFace.name ?? activeFace.attribution ?? 'Storyteller'}
          </div>
          {activeFace.slot && (
            <div className="text-xs text-stone-600">
              Slot: <span className="font-medium">{activeFace.slot}</span>
            </div>
          )}
          {activeFace.year && (
            <div className="text-xs text-stone-600">Year: {activeFace.year}</div>
          )}
          <button
            type="button"
            className="mt-2 text-xs text-sage-700 hover:underline"
            onClick={() => setActiveFace(null)}
          >
            close
          </button>
        </div>
      )}

      {/* Year scrubber (bottom) */}
      <div className="absolute bottom-3 left-0 right-0 px-6 flex items-center gap-4">
        <span className="text-xs text-stone-500 font-medium">{yearBounds.min}</span>
        <input
          type="range"
          min={yearBounds.min}
          max={yearBounds.max}
          step={1}
          value={activeYear}
          onChange={(e) => setActiveYear(parseInt(e.target.value, 10))}
          className="flex-1 accent-sage-700"
          aria-label="Year"
        />
        <span className="text-xs text-stone-500 font-medium">{yearBounds.max}</span>
        <span className="text-sm font-serif text-charcoal min-w-[60px] text-right">
          {activeYear}
        </span>
      </div>

      {/* Standing caption — never goes away */}
      <div className="absolute top-4 left-4 max-w-[320px] bg-white/85 backdrop-blur-sm rounded-xl p-4 border border-stone-200 shadow-sm">
        <div className="font-serif text-charcoal text-sm leading-snug">
          Every face here has said yes. Every theme here was named by community.
          This is the report writing itself.
        </div>
        {activeTheme && (
          <div className="mt-2 text-xs text-sage-700">
            Showing flow toward <span className="font-semibold">{activeTheme}</span> — click
            again to release.
          </div>
        )}
      </div>
    </div>
  )
}
