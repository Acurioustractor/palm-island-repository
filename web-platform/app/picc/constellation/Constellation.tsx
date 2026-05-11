'use client'

/**
 * Bwgcolman Constellation — the living map of Palm Island storytelling.
 *
 * Layout: a single shell split into three columns:
 *   [ left rail · modes ]  [ stage ]  [ right rail · context ]
 * Bottom: year scrubber + fullscreen toggle + reset view.
 *
 * The stage is a d3 force layout that supports:
 *   - mouse-wheel / pinch zoom
 *   - drag-pan on empty space
 *   - drag-reposition on individual face nodes
 *   - fullscreen presentation mode
 *
 * Every photo and quote on screen was consent-cleared or validator-flagged
 * at source. The Permissions panel and standing tagline are first-class
 * design elements, not metadata.
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

interface SimFace extends d3.SimulationNodeDatum {
  id: string
  face: FaceNode
  themeIndex: number
}

type ViewMode = 'field' | 'voices' | 'timeline' | 'visions'

const FACE_RADIUS = 22
const STAGE_HEIGHT = 640
const STAGE_HEIGHT_FS = 0 // computed at runtime when fullscreen

const ELDER_RING = '#B8860B'
const VOICE_RINGS: Record<string, string> = {
  organisation: '#2D5F4F',
  staff: '#5B8A72',
  service: '#5B8A72',
  community: '#D4A373',
  supporter: '#D97757',
  governance: '#2C2C2C',
  board: '#2C2C2C',
  hero: '#D4A373',
  bwgcolman: '#8B6F47',
}

const TAGLINES = [
  'Every face here has said yes.',
  'Every theme here was named by community.',
  'This is the report writing itself.',
] as const

const MODES: ReadonlyArray<{
  key: ViewMode
  label: string
  hint: string
}> = [
  { key: 'field', label: 'The Field', hint: 'Faces drift. Themes hold.' },
  { key: 'voices', label: 'Voices · Elders', hint: 'Elders surface in gold.' },
  { key: 'timeline', label: 'Timeline', hint: 'Scrub a year. See it.' },
  { key: 'visions', label: 'Visions', hint: 'Faces drift to 2045.' },
]

function ringColour(face: FaceNode): string {
  if (face.is_elder) return ELDER_RING
  const slot = face.slot ?? ''
  for (const key of Object.keys(VOICE_RINGS)) {
    if (slot.startsWith(key)) return VOICE_RINGS[key]
  }
  return VOICE_RINGS.community
}

function formatRevenue(n: number | null): string | null {
  if (n == null || !Number.isFinite(n)) return null
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`
  return `$${n.toFixed(0)}`
}

function backdropFor(year: number): string {
  if (year < 2010) return 'linear-gradient(180deg, #FBF6EE 0%, #F6E6D3 100%)'
  if (year < 2019) return 'linear-gradient(180deg, #FBF6EE 0%, #EDD6BA 100%)'
  return 'linear-gradient(180deg, #F6F2EA 0%, #D8E2D6 100%)'
}

export default function Constellation({ data }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const simulationRef = useRef<d3.Simulation<SimFace, undefined> | null>(null)
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)

  const [stageSize, setStageSize] = useState({ width: 900, height: STAGE_HEIGHT })
  const [mode, setMode] = useState<ViewMode>('field')
  const [activeTheme, setActiveTheme] = useState<string | null>(null)
  const [activeFace, setActiveFace] = useState<FaceNode | null>(null)
  const [tagIdx, setTagIdx] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const yearBounds = useMemo(() => {
    const fyYears = data.years.map((y) => y.fiscal_year)
    const faceYears = data.faces
      .map((f) => f.year)
      .filter((y): y is number => y !== null)
    const all = [...fyYears, ...faceYears]
    if (all.length === 0) return { min: 2008, max: new Date().getFullYear() }
    return { min: Math.min(...all), max: Math.max(...all) }
  }, [data])
  const [activeYear, setActiveYear] = useState<number>(yearBounds.max)

  const activeYearDetail = useMemo(
    () => data.years.find((y) => y.fiscal_year === activeYear) ?? null,
    [data.years, activeYear],
  )
  const activeThemeWell = useMemo(
    () => data.themes.find((t) => t.key === activeTheme) ?? null,
    [data.themes, activeTheme],
  )

  // Rotate tagline every 9s — present but unobtrusive.
  useEffect(() => {
    const id = window.setInterval(
      () => setTagIdx((i) => (i + 1) % TAGLINES.length),
      9000,
    )
    return () => window.clearInterval(id)
  }, [])

  // Track fullscreen state.
  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  // Stage sizing — fills available space, expands in fullscreen.
  useEffect(() => {
    if (!stageRef.current) return
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      if (width > 200) setStageSize({ width, height: Math.max(height, 400) })
    })
    ro.observe(stageRef.current)
    return () => ro.disconnect()
  }, [isFullscreen])

  // Simulation data — initial positions on a wide ring so the entrance is
  // visible (faces drift inward) rather than springing from centre.
  const simFaces: SimFace[] = useMemo(() => {
    return data.faces.map((f, i) => ({
      id: f.id,
      face: f,
      themeIndex: data.themes.length === 0 ? 0 : i % data.themes.length,
      x:
        Math.cos((i / Math.max(1, data.faces.length)) * Math.PI * 2) * 400 +
        stageSize.width / 2,
      y:
        Math.sin((i / Math.max(1, data.faces.length)) * Math.PI * 2) * 260 +
        stageSize.height / 2,
    }))
  }, [data.faces, data.themes.length, stageSize.width, stageSize.height])

  const themeWells = useMemo(() => {
    if (data.themes.length === 0)
      return [] as Array<ThemeWell & { x: number; y: number }>
    const radius = Math.min(stageSize.width, stageSize.height) * 0.36
    const cx = stageSize.width / 2
    const cy = stageSize.height / 2
    return data.themes.map((t, i) => {
      const angle = (i / data.themes.length) * Math.PI * 2 - Math.PI / 2
      return {
        ...t,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      }
    })
  }, [data.themes, stageSize.width, stageSize.height])

  // Main render effect.
  useEffect(() => {
    if (!svgRef.current || simFaces.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const cx = stageSize.width / 2
    const cy = stageSize.height / 2
    const defs = svg.append('defs')

    const clipId = 'cstl-face-clip'
    defs
      .append('clipPath')
      .attr('id', clipId)
      .append('circle')
      .attr('r', FACE_RADIUS)

    const glowId = 'cstl-glow'
    const glow = defs
      .append('radialGradient')
      .attr('id', glowId)
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%')
    glow.append('stop').attr('offset', '0%').attr('stop-color', '#2D5F4F').attr('stop-opacity', 0.35)
    glow.append('stop').attr('offset', '100%').attr('stop-color', '#2D5F4F').attr('stop-opacity', 0)

    // Root group — everything inside this is zoomable + pannable.
    const root = svg.append('g').attr('class', 'cstl-root')

    // Decorative rings.
    root
      .append('circle')
      .attr('cx', cx)
      .attr('cy', cy)
      .attr('r', Math.min(stageSize.width, stageSize.height) * 0.4)
      .attr('fill', 'none')
      .attr('stroke', '#E3D5C5')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4 6')
      .attr('opacity', 0.55)

    root
      .append('circle')
      .attr('cx', cx)
      .attr('cy', cy)
      .attr('r', Math.min(stageSize.width, stageSize.height) * 0.22)
      .attr('fill', 'none')
      .attr('stroke', '#E3D5C5')
      .attr('stroke-width', 0.6)
      .attr('opacity', 0.4)

    // Active theme glow.
    if (activeTheme) {
      const w = themeWells.find((t) => t.key === activeTheme)
      if (w) {
        root
          .append('circle')
          .attr('cx', w.x)
          .attr('cy', w.y)
          .attr('r', 130)
          .attr('fill', `url(#${glowId})`)
      }
    }

    // Theme wells.
    const wellGroup = root.append('g').attr('class', 'wells')
    const wells = wellGroup
      .selectAll<SVGGElement, (typeof themeWells)[number]>('g')
      .data(themeWells)
      .join('g')
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation()
        setActiveTheme((curr) => (curr === d.key ? null : d.key))
        setActiveFace(null)
      })

    wells
      .append('circle')
      .attr('r', (d) => 18 + Math.sqrt(d.count) * 2.2)
      .attr('fill', (d) => (d.key === activeTheme ? '#2D5F4F' : '#F4E9DC'))
      .attr('stroke', '#2D5F4F')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.92)

    wells
      .append('text')
      .text((d) => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('font-family', 'Georgia, serif')
      .attr('font-size', 12)
      .attr('font-weight', 700)
      .attr('fill', (d) => (d.key === activeTheme ? '#FBF6EE' : '#2C2C2C'))
      .attr('pointer-events', 'none')

    wells
      .append('text')
      .text((d) => `${d.count}`)
      .attr('text-anchor', 'middle')
      .attr('dy', 24)
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-size', 10)
      .attr('fill', '#6B5D4F')
      .attr('pointer-events', 'none')

    // Faces.
    const faceGroup = root.append('g').attr('class', 'faces')
    const facePoints = faceGroup
      .selectAll<SVGGElement, SimFace>('g')
      .data(simFaces, (d) => d.id)
      .join('g')
      .style('cursor', 'grab')
      .on('click', (event, d) => {
        event.stopPropagation()
        setActiveFace(d.face)
        setActiveTheme(null)
      })

    facePoints
      .append('circle')
      .attr('r', (d) => FACE_RADIUS + (d.face.is_elder ? 5 : 3))
      .attr('fill', 'none')
      .attr('stroke', (d) => ringColour(d.face))
      .attr('stroke-width', (d) => (d.face.is_elder ? 3 : 2))
      .attr('opacity', 0.9)

    facePoints
      .append('image')
      .attr('href', (d) => d.face.thumb_url)
      .attr('x', -FACE_RADIUS)
      .attr('y', -FACE_RADIUS)
      .attr('width', FACE_RADIUS * 2)
      .attr('height', FACE_RADIUS * 2)
      .attr('preserveAspectRatio', 'xMidYMid slice')
      .attr('clip-path', `url(#${clipId})`)

    facePoints.attr('opacity', (d) => {
      if (mode === 'timeline' && d.face.year !== null) {
        return d.face.year <= activeYear ? 1 : 0.18
      }
      if (mode === 'voices') return d.face.is_elder ? 1 : 0.5
      return 1
    })

    // Theme/visions force bias.
    function themeForce(alpha: number) {
      simFaces.forEach((node) => {
        let target: { x: number; y: number } | null = null
        if (mode === 'visions') target = { x: stageSize.width - 80, y: cy }
        else if (activeTheme) {
          const w = themeWells.find((t) => t.key === activeTheme)
          if (w) target = { x: w.x, y: w.y }
        } else target = themeWells[node.themeIndex] ?? null
        if (!target || node.x === undefined || node.y === undefined) return
        const k = mode === 'visions' ? 0.06 : activeTheme ? 0.18 : 0.035
        node.vx = (node.vx ?? 0) + (target.x - node.x) * k * alpha
        node.vy = (node.vy ?? 0) + (target.y - node.y) * k * alpha
      })
    }

    const sim = d3
      .forceSimulation<SimFace>(simFaces)
      .force(
        'collision',
        d3.forceCollide<SimFace>().radius(FACE_RADIUS + 5).strength(0.9),
      )
      .force('charge', d3.forceManyBody().strength(-22))
      .force('centre', d3.forceCenter(cx, cy).strength(0.03))
      .force('theme', themeForce as unknown as d3.Force<SimFace, undefined>)
      .alpha(1)
      .alphaDecay(0.04)
      .on('tick', () => {
        facePoints.attr('transform', (d) => `translate(${d.x}, ${d.y})`)
      })

    simulationRef.current = sim

    // Per-face drag.
    const drag = d3
      .drag<SVGGElement, SimFace>()
      .on('start', (event, d) => {
        if (!event.active) sim.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) sim.alphaTarget(0)
        d.fx = null
        d.fy = null
      })
    facePoints.call(drag)

    // Zoom + pan on the SVG.
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 4])
      .filter((event) => {
        // Allow wheel + touch + drag on non-interactive surfaces.
        // Block drag-from-face so face-drag works.
        if (event.type === 'mousedown' || event.type === 'touchstart') {
          const target = event.target as Element
          return !target.closest('.faces g, .wells g')
        }
        return true
      })
      .on('zoom', (event) => root.attr('transform', event.transform.toString()))

    zoomBehaviorRef.current = zoom
    svg.call(zoom)
    // Click empty space to clear active state.
    svg.on('click', () => {
      setActiveFace(null)
      setActiveTheme(null)
    })

    return () => {
      sim.stop()
    }
  }, [simFaces, themeWells, stageSize, mode, activeTheme, activeYear])

  const revenue = formatRevenue(activeYearDetail?.revenue ?? null)

  // Toggle fullscreen on the wrapper.
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else if (wrapperRef.current) {
        await wrapperRef.current.requestFullscreen()
      }
    } catch {
      // Browser denied — silent.
    }
  }

  function resetView() {
    if (!svgRef.current || !zoomBehaviorRef.current) return
    d3.select(svgRef.current)
      .transition()
      .duration(400)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity)
  }

  return (
    <div
      ref={wrapperRef}
      className="bg-cream flex flex-col"
      style={{
        height: isFullscreen ? '100vh' : 'auto',
      }}
    >
      {/* Header strip — title + tagline + actions */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 bg-white/70 backdrop-blur">
        <div className="flex items-baseline gap-3 min-w-0">
          <span className="text-[10px] uppercase tracking-[0.3em] text-ochre font-bold whitespace-nowrap">
            Bwgcolman Constellation
          </span>
          <span
            key={tagIdx}
            className="font-serif text-charcoal text-sm italic truncate"
            style={{ animation: 'cstl-fade 0.6s ease' }}
          >
            {TAGLINES[tagIdx]}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={resetView}
            className="text-xs px-2.5 py-1 rounded border border-stone-300 hover:bg-stone-50"
          >
            Reset view
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="text-xs px-3 py-1 rounded font-semibold text-white"
            style={{ backgroundColor: '#2D5F4F' }}
          >
            {isFullscreen ? 'Exit fullscreen' : 'Present full screen'}
          </button>
        </div>
      </div>

      {/* Three-column body */}
      <div
        className="flex flex-1 min-h-0"
        style={{
          height: isFullscreen ? 'calc(100vh - 102px)' : `${STAGE_HEIGHT}px`,
        }}
      >
        {/* LEFT RAIL — modes */}
        <div className="w-[200px] border-r border-stone-200 bg-white/60 p-3 overflow-y-auto flex-shrink-0">
          <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-2 px-1">
            View
          </div>
          <div className="space-y-1">
            {MODES.map((m) => {
              const active = mode === m.key
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMode(m.key)}
                  className="block w-full text-left px-3 py-2 rounded-lg text-sm transition"
                  style={
                    active
                      ? { backgroundColor: '#2D5F4F', color: '#FBF6EE' }
                      : { color: '#2C2C2C' }
                  }
                >
                  <div className="font-semibold">{m.label}</div>
                  <div
                    className="text-[11px] mt-0.5"
                    style={{ color: active ? '#E7D7C4' : '#6B5D4F' }}
                  >
                    {m.hint}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="border-t border-stone-200 my-4" />

          <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-2 px-1">
            Voice rings
          </div>
          <div className="space-y-1 text-[11px] text-stone-700 px-1">
            <LegendRow colour={ELDER_RING} label="Elder voice" />
            <LegendRow colour={VOICE_RINGS.staff} label="Staff · service" />
            <LegendRow colour={VOICE_RINGS.community} label="Community" />
            <LegendRow colour={VOICE_RINGS.supporter} label="Supporter" />
            <LegendRow colour={VOICE_RINGS.governance} label="Governance" />
          </div>

          <div className="border-t border-stone-200 my-4" />

          <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-2 px-1">
            How to use
          </div>
          <ul className="text-[11px] text-stone-700 space-y-1 px-1">
            <li>Drag any face to move it.</li>
            <li>Scroll / pinch to zoom.</li>
            <li>Click a theme to focus.</li>
            <li>Scrub a year to time-travel.</li>
          </ul>
        </div>

        {/* STAGE — the constellation */}
        <div
          ref={stageRef}
          className="relative flex-1 min-w-0"
          style={{
            background: backdropFor(activeYear),
            transition: 'background 600ms ease',
          }}
        >
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`0 0 ${stageSize.width} ${stageSize.height}`}
            preserveAspectRatio="xMidYMid meet"
          />
        </div>

        {/* RIGHT RAIL — context */}
        <div className="w-[280px] border-l border-stone-200 bg-white/60 p-3 overflow-y-auto flex-shrink-0">
          {/* Permissions — always visible */}
          <div className="rounded-lg border border-stone-200 bg-white p-3 mb-3">
            <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-2">
              Permissions
            </div>
            <div className="text-xs text-charcoal space-y-1">
              <Stat label="faces consented" value={data.stats.faces_consented} />
              <Stat
                label="elder quotes validated"
                value={data.stats.voices_validated_elder}
              />
              <Stat label="voices extracted" value={data.stats.voices_extracted} />
              <Stat label="stories captured" value={data.stats.stories} />
              <Stat
                label="board members tracked"
                value={data.stats.board_members}
              />
            </div>
            <div className="text-[10px] text-stone-500 mt-2">
              Elder approvals current as of {data.meta.elder_approvals_current_as_of}
            </div>
          </div>

          {/* Now-showing block — swaps based on active state + mode */}
          {activeFace ? (
            <ContextCard label={`Voice${activeFace.is_elder ? ' · Elder' : ''}`}>
              <div className="font-serif text-base mb-1">
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
              <div className="text-[11px] text-stone-500 mt-2">
                Consented in Empathy Ledger v2 · displayed with attribution.
              </div>
              <button
                type="button"
                className="mt-2 text-xs text-sage-700 hover:underline"
                onClick={() => setActiveFace(null)}
              >
                clear
              </button>
            </ContextCard>
          ) : activeThemeWell ? (
            <ContextCard
              label={`Theme · ${activeThemeWell.count} voices`}
            >
              <div className="font-serif text-base mb-2">
                {activeThemeWell.label}
              </div>
              {activeThemeWell.top_quotes.length === 0 ? (
                <div className="text-xs text-stone-500">
                  No quoted voices on file for this theme yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {activeThemeWell.top_quotes.map((q, i) => (
                    <div key={i} className="border-l-2 border-ochre/60 pl-3">
                      <div className="font-serif text-xs leading-snug italic">
                        “{q.text}”
                      </div>
                      <div className="text-[10px] text-stone-600 mt-1">
                        — {q.attribution ?? 'Bwgcolman voice'}
                        {q.suggested && (
                          <span
                            className="ml-2 inline-block px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wider"
                            style={{ backgroundColor: '#E7EFE4', color: '#2D5F4F' }}
                          >
                            report-ready
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                className="mt-3 text-xs text-sage-700 hover:underline"
                onClick={() => setActiveTheme(null)}
              >
                clear theme
              </button>
            </ContextCard>
          ) : mode === 'timeline' && activeYearDetail ? (
            <ContextCard
              label={`FY ${activeYearDetail.fiscal_year}${activeYearDetail.audited ? ' · audited' : ''}`}
              right={revenue}
            >
              {activeYearDetail.report_title && (
                <div className="font-serif text-sm text-charcoal mb-2">
                  {activeYearDetail.report_title}
                  {activeYearDetail.report_subtitle && (
                    <span className="text-stone-500">
                      {' '}
                      · {activeYearDetail.report_subtitle}
                    </span>
                  )}
                </div>
              )}
              {activeYearDetail.events.length > 0 && (
                <div className="mb-2">
                  <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-1">
                    Timeline events
                  </div>
                  <ul className="space-y-1 text-xs text-stone-700">
                    {activeYearDetail.events.slice(0, 3).map((e, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-ochre">·</span>
                        <span>
                          {e.title}
                          {e.significance >= 8 && (
                            <span className="ml-1 text-stone-500">★</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {activeYearDetail.achievements.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-1">
                    Achievements
                  </div>
                  <ul className="space-y-1 text-xs text-stone-700">
                    {activeYearDetail.achievements.slice(0, 2).map((a, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-sage-700">✓</span>
                        <span className="line-clamp-2">{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </ContextCard>
          ) : mode === 'visions' ? (
            <ContextCard label="Community visions · next 20">
              <div className="space-y-3">
                {data.visions.slice(0, 3).map((v, i) => (
                  <div
                    key={i}
                    className="border-l-2 pl-3"
                    style={{ borderColor: 'rgba(45, 95, 79, 0.6)' }}
                  >
                    <div className="font-serif text-xs italic leading-snug">
                      “{v.text.length > 110 ? v.text.slice(0, 110) + '…' : v.text}”
                    </div>
                    <div className="text-[10px] text-stone-600 mt-1">
                      — {v.author_name ?? 'Anonymous'}
                      {v.category && (
                        <span className="ml-2 text-stone-500">· {v.category}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ContextCard>
          ) : (
            <ContextCard label="Foundation · pre-2008 anchors">
              <ul className="text-xs text-stone-700 space-y-1.5">
                {data.foundation.slice(0, 5).map((f, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-serif font-bold text-charcoal w-10 flex-shrink-0">
                      {f.year}
                    </span>
                    <span>
                      {f.title.length > 36 ? f.title.slice(0, 36) + '…' : f.title}
                      {f.significance >= 9 && (
                        <span className="ml-1 text-stone-500">★</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="text-[10px] text-stone-500 italic mt-2">
                Click any theme well, scrub a year, or switch to Visions to surface
                more.
              </div>
            </ContextCard>
          )}
        </div>
      </div>

      {/* Bottom — year scrubber */}
      <div className="px-4 py-3 border-t border-stone-200 bg-white/70 backdrop-blur flex items-center gap-3">
        <span className="text-[11px] text-stone-500 font-medium">
          {yearBounds.min}
        </span>
        <input
          type="range"
          min={yearBounds.min}
          max={yearBounds.max}
          step={1}
          value={activeYear}
          onChange={(e) => {
            setActiveYear(parseInt(e.target.value, 10))
            if (mode !== 'timeline') setMode('timeline')
          }}
          className="flex-1"
          style={{ accentColor: '#2D5F4F' }}
          aria-label="Active fiscal year"
        />
        <span className="text-[11px] text-stone-500 font-medium">
          {yearBounds.max}
        </span>
        <span className="text-sm font-serif text-charcoal min-w-[70px] text-right">
          FY {activeYear}
        </span>
      </div>

      <style jsx>{`
        @keyframes cstl-fade {
          from {
            opacity: 0;
            transform: translateY(3px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        :fullscreen {
          background: #fbf6ee;
        }
      `}</style>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-stone-600">{label}</span>
      <span className="font-semibold" style={{ color: '#2D5F4F' }}>
        {value.toLocaleString()}
      </span>
    </div>
  )
}

function LegendRow({ colour, label }: { colour: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block rounded-full border-2 flex-shrink-0"
        style={{ width: 12, height: 12, borderColor: colour }}
      />
      <span>{label}</span>
    </div>
  )
}

function ContextCard({
  label,
  right,
  children,
}: {
  label: string
  right?: string | null
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-3 mb-3">
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-[10px] uppercase tracking-wide text-ochre font-semibold">
          {label}
        </div>
        {right && (
          <div className="font-serif text-sm" style={{ color: '#2D5F4F' }}>
            {right}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}
