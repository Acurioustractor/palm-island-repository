'use client'

/**
 * Bwgcolman Constellation — the living map of Palm Island storytelling.
 *
 * Three-column shell: [ left rail · browse ]  [ stage ]  [ right rail · context ]
 * Bottom: year scrubber. Top: title + fullscreen + reset.
 *
 * Performance contract:
 *   - The SVG scene is built ONCE per data/dimensions change.
 *   - Mode, theme, year, and Elder-focus changes only update force targets
 *     and node opacity in place — no DOM rebuild.
 *   - Faces load via thumbnail_url so 117 thumbnails ≪ 117 full photos.
 *
 * Stage supports d3-zoom (wheel/pinch), drag-pan on empty space, and
 * per-face drag-reposition. The right rail swaps content based on what is
 * active. The left rail is a tab strip: View · Services · Projects ·
 * Elders · Reports · Bwgcolman.
 */

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import * as d3 from 'd3'
import type {
  AnnualReportItem,
  ConstellationPayload,
  FaceNode,
  NamedElder,
  ProjectItem,
  ServiceItem,
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
type RailTab =
  | 'view'
  | 'services'
  | 'projects'
  | 'elders'
  | 'reports'
  | 'bwgcolman'

const FACE_RADIUS = 22
const STAGE_HEIGHT = 640

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

/**
 * Seven lenses (per Atlas plan) + Bwgcolman + View. View is the active-mode
 * indicator since the mode toggle now lives on the top strip; the rest
 * follow the seven-lens framing from the research report:
 *   Now · Services · Projects · Elders · Stories · Reports · Futures.
 * Bwgcolman holds the place-of-origin context.
 */
const TABS: ReadonlyArray<{ key: RailTab; label: string }> = [
  { key: 'view', label: 'View' },
  { key: 'services', label: 'Services' },
  { key: 'projects', label: 'Projects' },
  { key: 'elders', label: 'Elders' },
  { key: 'reports', label: 'Reports' },
  { key: 'bwgcolman', label: 'Bwgcolman' },
]

function ringColour(face: FaceNode): string {
  if (face.is_elder) return ELDER_RING
  if (face.kind === 'leadership') return VOICE_RINGS.organisation
  if (face.kind === 'board') return VOICE_RINGS.governance
  if (face.is_featured) return VOICE_RINGS.staff
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

// Photo-id sets are pre-computed in queries.ts. The viz uses them for
// precise filtering — no string-matching guesses.
function buildIdSet(ids: string[] | undefined): Set<string> {
  return new Set(ids ?? [])
}

export default function Constellation({ data }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const simulationRef = useRef<d3.Simulation<SimFace, undefined> | null>(null)
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const simFacesRef = useRef<SimFace[]>([])

  const [stageSize, setStageSize] = useState({ width: 900, height: STAGE_HEIGHT })
  const [mode, setMode] = useState<ViewMode>('field')
  const [activeTheme, setActiveTheme] = useState<string | null>(null)
  const [activeFace, setActiveFace] = useState<FaceNode | null>(null)
  const [activeService, setActiveService] = useState<ServiceItem | null>(null)
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null)
  const [activeElder, setActiveElder] = useState<NamedElder | null>(null)
  const [activeReport, setActiveReport] = useState<AnnualReportItem | null>(null)
  /** Full-screen report summary overlay — separate from the rail card so
   *  clicking a year opens a proper read view, not just a 280-pixel panel. */
  const [overlayReport, setOverlayReport] = useState<AnnualReportItem | null>(
    null,
  )
  const [tagIdx, setTagIdx] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [tab, setTab] = useState<RailTab>('view')

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
  // Defer the year value used in heavy effects so scrubbing stays buttery.
  const deferredYear = useDeferredValue(activeYear)

  const activeYearDetail = useMemo(
    () => data.years.find((y) => y.fiscal_year === deferredYear) ?? null,
    [data.years, deferredYear],
  )
  const activeThemeWell = useMemo(
    () => data.themes.find((t) => t.key === activeTheme) ?? null,
    [data.themes, activeTheme],
  )

  // Rotate tagline every 9s.
  useEffect(() => {
    const id = window.setInterval(
      () => setTagIdx((i) => (i + 1) % TAGLINES.length),
      9000,
    )
    return () => window.clearInterval(id)
  }, [])

  // Fullscreen state.
  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  // Stage sizing.
  useEffect(() => {
    if (!stageRef.current) return
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      if (width > 200) setStageSize({ width, height: Math.max(height, 400) })
    })
    ro.observe(stageRef.current)
    return () => ro.disconnect()
  }, [isFullscreen])

  // Build the stable scene once when data/dimensions change. Mode / theme /
  // year / service / project / elder updates land in lighter effects below.
  useEffect(() => {
    if (!svgRef.current || data.faces.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const cx = stageSize.width / 2
    const cy = stageSize.height / 2
    const defs = svg.append('defs')

    defs
      .append('clipPath')
      .attr('id', 'cstl-face-clip')
      .append('circle')
      .attr('r', FACE_RADIUS)

    const glow = defs
      .append('radialGradient')
      .attr('id', 'cstl-glow')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%')
    glow.append('stop').attr('offset', '0%').attr('stop-color', '#2D5F4F').attr('stop-opacity', 0.35)
    glow.append('stop').attr('offset', '100%').attr('stop-color', '#2D5F4F').attr('stop-opacity', 0)

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

    // Glow placeholder — moved by the lightweight effect.
    root
      .append('circle')
      .attr('class', 'cstl-active-glow')
      .attr('cx', cx)
      .attr('cy', cy)
      .attr('r', 130)
      .attr('fill', 'url(#cstl-glow)')
      .attr('opacity', 0)

    // Theme wells.
    const themeWells = data.themes.map((t, i) => {
      const radius = Math.min(stageSize.width, stageSize.height) * 0.36
      const angle = (i / data.themes.length) * Math.PI * 2 - Math.PI / 2
      return {
        ...t,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      }
    })

    const wellGroup = root.append('g').attr('class', 'cstl-wells')
    const wells = wellGroup
      .selectAll<SVGGElement, (typeof themeWells)[number]>('g')
      .data(themeWells)
      .join('g')
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
      .attr('data-key', (d) => d.key)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation()
        setActiveTheme((curr) => (curr === d.key ? null : d.key))
        setActiveFace(null)
      })

    wells
      .append('circle')
      .attr('class', 'well-bg')
      .attr('r', (d) => 18 + Math.sqrt(d.count) * 2.2)
      .attr('fill', '#F4E9DC')
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
      .attr('fill', '#2C2C2C')
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

    // Faces — initial positions on a wide ring (so the entrance is visible).
    const simFaces: SimFace[] = data.faces.map((f, i) => ({
      id: f.id,
      face: f,
      themeIndex: data.themes.length === 0 ? 0 : i % data.themes.length,
      x:
        Math.cos((i / Math.max(1, data.faces.length)) * Math.PI * 2) * 400 +
        cx,
      y:
        Math.sin((i / Math.max(1, data.faces.length)) * Math.PI * 2) * 260 +
        cy,
    }))
    simFacesRef.current = simFaces

    const faceGroup = root.append('g').attr('class', 'cstl-faces')
    const facePoints = faceGroup
      .selectAll<SVGGElement, SimFace>('g')
      .data(simFaces, (d) => d.id)
      .join('g')
      .attr('data-id', (d) => d.id)
      .attr('class', 'cstl-face')
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
      .attr('clip-path', 'url(#cstl-face-clip)')

    // Finite simulation: run ~120 ticks to settle, then stop completely.
    // Constant ticking was the source of click-lag. After settle, faces
    // stay put; mode / theme / elder changes manipulate opacity only.
    const sim = d3
      .forceSimulation<SimFace>(simFaces)
      .force(
        'collision',
        d3.forceCollide<SimFace>().radius(FACE_RADIUS + 4).strength(0.9),
      )
      .force('charge', d3.forceManyBody().strength(-14))
      .force('centre', d3.forceCenter(cx, cy).strength(0.05))
      .alpha(1)
      .alphaDecay(0.05)
      .alphaMin(0.08)
      .velocityDecay(0.55)
      .on('tick', () => {
        facePoints.attr('transform', (d) => `translate(${d.x}, ${d.y})`)
      })
      .on('end', () => {
        // Free the tick listener — DOM is in final state.
        sim.on('tick', null)
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

    // Zoom + pan.
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 4])
      .filter((event) => {
        if (event.type === 'mousedown' || event.type === 'touchstart') {
          const target = event.target as Element
          return !target.closest('.cstl-faces g, .cstl-wells g')
        }
        return true
      })
      .on('zoom', (event) => root.attr('transform', event.transform.toString()))
    zoomBehaviorRef.current = zoom
    svg.call(zoom)

    svg.on('click', () => {
      setActiveFace(null)
      setActiveTheme(null)
    })

    return () => {
      sim.stop()
    }
    // Stable scene rebuild only depends on data + dimensions.
  }, [data.faces, data.themes, stageSize.width, stageSize.height])

  // Lightweight update: opacity + well state only. NEVER restarts the
  // simulation — that's what made clicks feel slow.
  useEffect(() => {
    if (!svgRef.current) return
    const simFaces = simFacesRef.current
    if (simFaces.length === 0) return

    const svg = d3.select(svgRef.current)

    // Snapshot theme well positions once.
    const themeWellMap = new Map<string, { x: number; y: number }>()
    svg.selectAll<SVGGElement, unknown>('.cstl-wells > g').each(function () {
      const key = this.getAttribute('data-key') ?? ''
      const t = this.getAttribute('transform') ?? ''
      const m = /translate\(([-\d.]+),\s*([-\d.]+)\)/.exec(t)
      if (m) themeWellMap.set(key, { x: parseFloat(m[1]), y: parseFloat(m[2]) })
    })

    // Active well visual state (no transition — instant).
    svg.selectAll<SVGGElement, unknown>('.cstl-wells > g').each(function () {
      const key = this.getAttribute('data-key')
      const bg = d3.select(this).select<SVGCircleElement>('circle.well-bg')
      const lbl = d3.select(this).select<SVGTextElement>('text:first-of-type')
      const isActive = key === activeTheme
      bg.attr('fill', isActive ? '#2D5F4F' : '#F4E9DC')
      lbl.attr('fill', isActive ? '#FBF6EE' : '#2C2C2C')
    })

    // Glow position / visibility.
    const glowSel = svg.select<SVGCircleElement>('.cstl-active-glow')
    if (activeTheme) {
      const pos = themeWellMap.get(activeTheme)
      if (pos) glowSel.attr('cx', pos.x).attr('cy', pos.y).attr('opacity', 1)
    } else {
      glowSel.attr('opacity', 0)
    }

    // Face opacity — single pass keyed by data-id. CSS handles the fade
    // (see opacity-transition class on each face g).
    const idToFace = new Map<string, FaceNode>()
    for (const s of simFaces) idToFace.set(s.id, s.face)

    // Precise face filtering — uses photo_ids pre-computed server-side.
    const serviceIds = buildIdSet(activeService?.photo_ids)
    const projectIds = buildIdSet(activeProject?.photo_ids)
    const elderIds = buildIdSet(activeElder?.photo_ids)

    svg
      .selectAll<SVGGElement, unknown>('.cstl-faces > g')
      .attr('opacity', function () {
        const id = this.getAttribute('data-id') ?? ''
        const face = idToFace.get(id)
        if (!face) return 1
        if (activeService) return serviceIds.has(id) ? 1 : 0.1
        if (activeProject) return projectIds.has(id) ? 1 : 0.1
        if (activeElder) return elderIds.has(id) ? 1 : 0.1
        if (mode === 'timeline' && face.year !== null)
          return face.year <= deferredYear ? 1 : 0.18
        if (mode === 'voices') return face.is_elder ? 1 : 0.5
        return 1
      })
  }, [
    mode,
    activeTheme,
    deferredYear,
    activeService,
    activeProject,
    activeElder,
  ])

  const revenue = formatRevenue(activeYearDetail?.revenue ?? null)

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else if (wrapperRef.current) await wrapperRef.current.requestFullscreen()
    } catch {
      // ignore
    }
  }

  function resetView() {
    if (!svgRef.current || !zoomBehaviorRef.current) return
    d3.select(svgRef.current)
      .transition()
      .duration(400)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity)
  }

  function clearAllFocus() {
    setActiveFace(null)
    setActiveTheme(null)
    setActiveService(null)
    setActiveProject(null)
    setActiveElder(null)
    setActiveReport(null)
  }

  // Decide what the right rail shows — memoised so a year-scrub or
  // simulation tick doesn't re-render the card subtree.
  const rightCard = useMemo(() => {
    if (activeFace) {
      // Look up every quote attributed to this person by last-name token.
      const lastName = (activeFace.name ?? '')
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .pop() ?? ''
      const quotes = data.quotes_by_speaker[lastName] ?? []
      return (
        <ContextCard
          label={`Voice${activeFace.is_elder ? ' · Elder' : ''}${quotes.length ? ` · ${quotes.length} quotes` : ''}`}
        >
          <div className="font-serif text-base mb-1">
            {activeFace.name ?? activeFace.attribution ?? 'Storyteller'}
          </div>
          {activeFace.role && (
            <div className="text-xs text-stone-600">{activeFace.role}</div>
          )}
          {activeFace.cultural_background && (
            <div className="text-xs text-stone-600">
              {activeFace.cultural_background}
            </div>
          )}
          {activeFace.service_slugs.length > 0 && (
            <div className="text-[11px] text-stone-500 mt-2">
              Linked services:{' '}
              <span className="text-stone-700">
                {activeFace.service_slugs.slice(0, 4).join(', ')}
              </span>
            </div>
          )}
          {quotes.length > 0 && (
            <div className="mt-3 space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {quotes.slice(0, 6).map((q, i) => (
                <div key={i} className="border-l-2 border-ochre/60 pl-3">
                  <div className="font-serif text-xs italic leading-snug">
                    “{q.text.length > 220 ? q.text.slice(0, 220) + '…' : q.text}”
                  </div>
                  <div className="text-[10px] text-stone-500 mt-1 flex gap-1 items-center">
                    {q.theme && <span>theme: {q.theme}</span>}
                    {q.suggested && (
                      <span
                        className="ml-1 px-1.5 py-0.5 rounded text-[8.5px] font-semibold uppercase tracking-wider"
                        style={{ backgroundColor: '#E7EFE4', color: '#2D5F4F' }}
                      >
                        report-ready
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {quotes.length > 6 && (
                <div className="text-[10px] text-stone-500 italic">
                  +{quotes.length - 6} more in the archive
                </div>
              )}
            </div>
          )}
          <div className="text-[11px] text-stone-500 mt-3">
            {activeFace.kind === 'storyteller'
              ? 'Consented in Empathy Ledger v2.'
              : activeFace.kind === 'leadership'
                ? 'PICC leadership · public role.'
                : 'PICC board · public director.'}
          </div>
          <ClearButton onClick={() => setActiveFace(null)} />
        </ContextCard>
      )
    }
    if (activeThemeWell)
      return (
        <ContextCard label={`Theme · ${activeThemeWell.count} voices`}>
          <div className="font-serif text-base mb-2">{activeThemeWell.label}</div>
          {activeThemeWell.top_quotes.length === 0 ? (
            <div className="text-xs text-stone-500">
              No quoted voices on file for this theme yet.
            </div>
          ) : (
            <div className="space-y-3">
              {activeThemeWell.top_quotes.map((q, i) => (
                <div key={i} className="border-l-2 border-ochre/60 pl-3">
                  <div className="font-serif text-xs leading-snug italic">“{q.text}”</div>
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
          <ClearButton onClick={() => setActiveTheme(null)} />
        </ContextCard>
      )
    if (activeService)
      return (
        <ContextCard
          label={`Service · ${activeService.category ?? 'PICC'}`}
          right={activeService.status === 'active' ? 'active' : activeService.status}
        >
          {activeService.image_url && (
            <img
              src={activeService.image_url}
              alt=""
              loading="lazy"
              className="w-full rounded-md mb-2 object-cover"
              style={{ maxHeight: 140 }}
            />
          )}
          <div className="font-serif text-base mb-1">{activeService.name}</div>
          <div className="text-[11px] text-stone-500 mb-2">
            {activeService.photo_ids.length} linked storyteller
            {activeService.photo_ids.length === 1 ? '' : 's'}
          </div>
          {activeService.description && (
            <div className="text-xs text-stone-700 leading-relaxed">
              {activeService.description.length > 240
                ? activeService.description.slice(0, 240) + '…'
                : activeService.description}
            </div>
          )}
          <ClearButton onClick={() => setActiveService(null)} />
        </ContextCard>
      )
    if (activeProject)
      return (
        <ContextCard
          label={`Project · ${activeProject.status ?? 'live'}`}
          right={activeProject.start_year ? `from ${activeProject.start_year}` : null}
        >
          {activeProject.image_url && (
            <img
              src={activeProject.image_url}
              alt=""
              loading="lazy"
              className="w-full rounded-md mb-2 object-cover"
              style={{ maxHeight: 140 }}
            />
          )}
          <div className="font-serif text-base mb-1">{activeProject.name}</div>
          {activeProject.tagline && (
            <div className="text-[11px] text-stone-500 italic mb-2">
              {activeProject.tagline}
            </div>
          )}
          <div className="text-[11px] text-stone-500 mb-2">
            {activeProject.photo_ids.length} linked storyteller
            {activeProject.photo_ids.length === 1 ? '' : 's'} ·{' '}
            {activeProject.photo_count} tagged photo
            {activeProject.photo_count === 1 ? '' : 's'}
          </div>
          {activeProject.description && (
            <div className="text-xs text-stone-700 leading-relaxed">
              {activeProject.description.length > 240
                ? activeProject.description.slice(0, 240) + '…'
                : activeProject.description}
            </div>
          )}
          <ClearButton onClick={() => setActiveProject(null)} />
        </ContextCard>
      )
    if (activeElder)
      return (
        <ContextCard label={`Elder · ${activeElder.quote_count} voices`}>
          <div className="font-serif text-base mb-1">{activeElder.name}</div>
          <div className="text-[11px] text-stone-500 mb-2">
            {activeElder.photo_ids.length} photo
            {activeElder.photo_ids.length === 1 ? '' : 's'} on the canvas
          </div>
          <div className="space-y-2">
            {activeElder.quotes.slice(0, 3).map((q, i) => (
              <div key={i} className="border-l-2 border-ochre/60 pl-3">
                <div className="font-serif text-xs italic leading-snug">
                  “{q.length > 180 ? q.slice(0, 180) + '…' : q}”
                </div>
              </div>
            ))}
          </div>
          {activeElder.quotes.length > 3 && (
            <div className="text-[10px] text-stone-500 mt-2 italic">
              +{activeElder.quotes.length - 3} more in the archive
            </div>
          )}
          <ClearButton onClick={() => setActiveElder(null)} />
        </ContextCard>
      )
    if (activeReport) {
      const yearDetail =
        data.years.find((y) => y.fiscal_year === activeReport.fiscal_year) ?? null
      return (
        <ContextCard
          label={`Annual Report · FY ${activeReport.fiscal_year}`}
          right={formatRevenue(yearDetail?.revenue ?? null)}
        >
          {activeReport.cover_photo_url && (
            <img
              src={activeReport.cover_photo_url}
              alt=""
              className="w-full rounded-md mb-2"
              loading="lazy"
            />
          )}
          <div className="font-serif text-sm mb-1">
            {activeReport.title ?? `Annual Report FY${activeReport.fiscal_year}`}
          </div>
          {activeReport.subtitle && (
            <div className="text-xs text-stone-600 mb-2">{activeReport.subtitle}</div>
          )}
          {yearDetail && yearDetail.events.length > 0 && (
            <div className="mt-2">
              <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-1">
                Interesting things, FY{activeReport.fiscal_year}
              </div>
              <ul className="space-y-1 text-xs text-stone-700">
                {yearDetail.events.slice(0, 3).map((e, i) => (
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
          {yearDetail && yearDetail.achievements.length > 0 && (
            <div className="mt-2">
              <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-1">
                Achievements that year
              </div>
              <ul className="space-y-1 text-xs text-stone-700">
                {yearDetail.achievements.slice(0, 2).map((a, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-sage-700">✓</span>
                    <span className="line-clamp-2">{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {activeReport.pdf_url && (
            <a
              href={activeReport.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs underline text-sage-700"
            >
              Open PDF →
            </a>
          )}
          <ClearButton onClick={() => setActiveReport(null)} />
        </ContextCard>
      )
    }
    if (mode === 'timeline' && activeYearDetail)
      return (
        <ContextCard
          label={`FY ${activeYearDetail.fiscal_year}${activeYearDetail.audited ? ' · audited' : ''}`}
          right={revenue}
        >
          {activeYearDetail.report_title && (
            <div className="font-serif text-sm text-charcoal mb-2">
              {activeYearDetail.report_title}
              {activeYearDetail.report_subtitle && (
                <span className="text-stone-500"> · {activeYearDetail.report_subtitle}</span>
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
                      {e.significance >= 8 && <span className="ml-1 text-stone-500">★</span>}
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
      )
    if (mode === 'visions')
      return (
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
      )
    return (
      <ContextCard label="Foundation · pre-2008 anchors">
        <ul className="text-xs text-stone-700 space-y-1.5">
          {data.foundation.slice(0, 5).map((f, i) => (
            <li key={i} className="flex gap-2">
              <span className="font-serif font-bold text-charcoal w-10 flex-shrink-0">
                {f.year}
              </span>
              <span>
                {f.title.length > 36 ? f.title.slice(0, 36) + '…' : f.title}
                {f.significance >= 9 && <span className="ml-1 text-stone-500">★</span>}
              </span>
            </li>
          ))}
        </ul>
        <div className="text-[10px] text-stone-500 italic mt-2">
          Click any theme, scrub a year, or browse the rail to surface more.
        </div>
      </ContextCard>
    )
  }, [
    activeFace,
    activeThemeWell,
    activeService,
    activeProject,
    activeElder,
    activeReport,
    mode,
    activeYearDetail,
    revenue,
    data.foundation,
    data.visions,
    data.years,
    data.quotes_by_speaker,
  ])

  return (
    <div
      ref={wrapperRef}
      className="bg-cream flex flex-col"
      style={{ height: isFullscreen ? '100vh' : 'auto' }}
    >
      {/* Header strip — title · tagline · mode-segmented · actions */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-200 bg-white/80 backdrop-blur gap-3 flex-wrap">
        <div className="flex items-baseline gap-3 min-w-0">
          <span className="text-[10px] uppercase tracking-[0.3em] text-ochre font-bold whitespace-nowrap">
            Bwgcolman Constellation
          </span>
          <span
            key={tagIdx}
            className="font-serif text-charcoal text-sm italic truncate hidden md:inline"
            style={{ animation: 'cstl-fade 0.6s ease' }}
          >
            {TAGLINES[tagIdx]}
          </span>
        </div>

        {/* Top-strip mode toggle — promoted from rail */}
        <div className="inline-flex rounded-md border border-stone-300 overflow-hidden shadow-sm">
          {MODES.map((m) => {
            const active = mode === m.key
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setMode(m.key)}
                title={m.hint}
                className="text-[11px] px-3 py-1.5 font-semibold border-r border-stone-300 last:border-r-0 transition"
                style={
                  active
                    ? { backgroundColor: '#2D5F4F', color: '#FBF6EE' }
                    : { backgroundColor: '#FFFFFF', color: '#2C2C2C' }
                }
              >
                {m.label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={clearAllFocus}
            className="text-xs px-2.5 py-1 rounded border border-stone-300 hover:bg-stone-50"
          >
            Clear focus
          </button>
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
        {/* LEFT RAIL — tabbed browser */}
        <div className="w-[220px] border-r border-stone-200 bg-white/60 flex-shrink-0 flex flex-col">
          {/* Tab strip */}
          <div className="flex flex-wrap gap-1 p-2 border-b border-stone-200">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className="text-[11px] px-2 py-1 rounded font-semibold"
                style={
                  tab === t.key
                    ? { backgroundColor: '#2D5F4F', color: '#FBF6EE' }
                    : { color: '#2C2C2C', backgroundColor: 'transparent' }
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab body */}
          <div className="flex-1 overflow-y-auto p-3 text-sm">
            {tab === 'view' && (
              <>
                <RailHeading>Active mode</RailHeading>
                <div className="rounded-md border border-stone-200 bg-white p-3 mb-3">
                  <div className="font-serif text-sm text-charcoal">
                    {MODES.find((m) => m.key === mode)?.label}
                  </div>
                  <div className="text-[11px] text-stone-600 mt-0.5">
                    {MODES.find((m) => m.key === mode)?.hint}
                  </div>
                  <div className="text-[10px] text-stone-500 mt-2 italic">
                    Switch modes from the top strip.
                  </div>
                </div>

                <RailHeading>Voice rings</RailHeading>
                <div className="space-y-1 text-[11px] text-stone-700">
                  <LegendRow colour={ELDER_RING} label="Elder voice" />
                  <LegendRow colour={VOICE_RINGS.staff} label="Staff · service" />
                  <LegendRow colour={VOICE_RINGS.community} label="Community" />
                  <LegendRow colour={VOICE_RINGS.supporter} label="Supporter" />
                  <LegendRow colour={VOICE_RINGS.governance} label="Governance" />
                </div>

                <RailDivider />
                <RailHeading>How to use</RailHeading>
                <ul className="text-[11px] text-stone-700 space-y-1">
                  <li>Drag any face to move it.</li>
                  <li>Scroll / pinch to zoom.</li>
                  <li>Click a theme to focus.</li>
                  <li>Scrub a year to time-travel.</li>
                </ul>
              </>
            )}

            {tab === 'services' && (
              <>
                <RailHeading>{data.services.length} services · click to filter</RailHeading>
                <ul className="space-y-1">
                  {data.services.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveService(s)
                          setActiveProject(null)
                          setActiveElder(null)
                          setActiveReport(null)
                        }}
                        className="flex w-full items-center gap-2 text-[11.5px] px-2 py-1.5 rounded hover:bg-stone-100"
                        style={
                          activeService?.id === s.id
                            ? { backgroundColor: '#E7EFE4', color: '#2D5F4F', fontWeight: 600 }
                            : {}
                        }
                      >
                        <Thumb url={s.image_url} fallback="#F4E9DC" />
                        <span className="flex-1 truncate text-left">{s.name}</span>
                        <span
                          className="text-stone-500 flex-shrink-0"
                          title={`${s.photo_ids.length} linked storyteller${s.photo_ids.length === 1 ? '' : 's'}`}
                        >
                          {s.photo_ids.length}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {tab === 'projects' && (
              <>
                <RailHeading>{data.projects.length} projects · click to filter</RailHeading>
                <ul className="space-y-1">
                  {data.projects.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveProject(p)
                          setActiveService(null)
                          setActiveElder(null)
                          setActiveReport(null)
                        }}
                        className="flex w-full items-center gap-2 text-[11.5px] px-2 py-1.5 rounded hover:bg-stone-100"
                        style={
                          activeProject?.id === p.id
                            ? { backgroundColor: '#E7EFE4', color: '#2D5F4F', fontWeight: 600 }
                            : {}
                        }
                      >
                        <Thumb url={p.image_url} fallback="#EDD6BA" />
                        <span className="flex-1 truncate text-left">
                          {p.name}
                          {p.status && p.status !== 'active' && (
                            <span className="ml-2 text-[10px] text-stone-500">
                              · {p.status}
                            </span>
                          )}
                        </span>
                        <span className="text-stone-500 flex-shrink-0">
                          {p.photo_ids.length}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {tab === 'elders' && (
              <>
                <RailHeading>{data.named_elders.length} named elders · click to filter</RailHeading>
                <ul className="space-y-1">
                  {data.named_elders.slice(0, 30).map((e) => (
                    <li key={e.name}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveElder(e)
                          setActiveService(null)
                          setActiveProject(null)
                          setActiveReport(null)
                        }}
                        className="flex w-full justify-between gap-2 text-[11.5px] px-2 py-1.5 rounded hover:bg-stone-100"
                        style={
                          activeElder?.name === e.name
                            ? { backgroundColor: '#FCEEDF', color: '#8B6F47', fontWeight: 600 }
                            : {}
                        }
                      >
                        <span className="truncate">{e.name}</span>
                        <span className="text-stone-500 flex-shrink-0">
                          {e.quote_count}q
                          {e.photo_ids.length > 0 && (
                            <span className="ml-1">· {e.photo_ids.length}p</span>
                          )}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {tab === 'reports' && (
              <>
                <RailHeading>
                  {data.annual_reports.length} reports · click to time-travel
                </RailHeading>
                <ul className="space-y-2">
                  {data.annual_reports.map((r) => (
                    <li key={r.fiscal_year}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveReport(r)
                          setActiveService(null)
                          setActiveProject(null)
                          setActiveElder(null)
                          setActiveYear(r.fiscal_year)
                          setMode('timeline')
                          setOverlayReport(r)
                        }}
                        className="block w-full text-left rounded-md hover:bg-stone-100 p-1.5"
                        style={
                          activeReport?.fiscal_year === r.fiscal_year
                            ? { backgroundColor: '#E7EFE4' }
                            : {}
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-[11.5px]">
                            FY {r.fiscal_year}
                          </div>
                          {r.pdf_url && (
                            <span
                              className="text-[9px] text-stone-500 uppercase tracking-wide"
                              title="PDF available"
                            >
                              PDF
                            </span>
                          )}
                        </div>
                        <div className="text-[10.5px] text-stone-600 truncate">
                          {r.title ?? '—'}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {tab === 'bwgcolman' && (
              <>
                <RailHeading>Bwgcolman</RailHeading>
                <div className="text-xs text-stone-700 leading-relaxed">
                  <p className="mb-2 font-serif italic">
                    “{data.bwgcolman.name}” — {data.bwgcolman.meaning}.
                  </p>
                  <p className="mb-2">
                    Traditional Owners:{' '}
                    <strong>{data.bwgcolman.traditional_owners}</strong>.
                  </p>
                  <p className="mb-3">
                    <strong>{data.bwgcolman.language_groups}</strong> language groups
                    brought together on Palm Island from{' '}
                    {data.bwgcolman.founded_year} — the foundation of Bwgcolman
                    community identity.
                  </p>
                  <details className="mb-3">
                    <summary className="text-[10.5px] uppercase tracking-wide text-stone-500 font-semibold cursor-pointer">
                      Sourcing
                    </summary>
                    <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                      {data.bwgcolman.sourcing_note}
                    </p>
                  </details>
                </div>

                <RailDivider />
                <RailHeading>Foundational events</RailHeading>
                <ul className="text-[11.5px] text-stone-700 space-y-1.5">
                  {data.foundation.map((f, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-serif font-bold w-10 flex-shrink-0">
                        {f.year}
                      </span>
                      <span>
                        {f.title}
                        {f.significance >= 9 && (
                          <span className="ml-1 text-stone-500">★</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* STAGE */}
        <div
          ref={stageRef}
          className="relative flex-1 min-w-0"
          style={{
            background: backdropFor(deferredYear),
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

        {/* RIGHT RAIL */}
        <div className="w-[280px] border-l border-stone-200 bg-white/60 p-3 overflow-y-auto flex-shrink-0">
          <div className="rounded-lg border border-stone-200 bg-white p-3 mb-3">
            <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-2">
              Permissions
            </div>
            <div className="text-xs text-charcoal space-y-1">
              <Stat label="faces consented" value={data.stats.faces_consented} />
              <Stat label="elder quotes validated" value={data.stats.voices_validated_elder} />
              <Stat label="voices extracted" value={data.stats.voices_extracted} />
              <Stat label="stories captured" value={data.stats.stories} />
              <Stat label="board members tracked" value={data.stats.board_members} />
            </div>
            <div className="text-[10px] text-stone-500 mt-2">
              Elder approvals current as of {data.meta.elder_approvals_current_as_of}
            </div>
          </div>

          {rightCard}
        </div>
      </div>

      {/* Bottom — year scrubber with report markers */}
      <div className="px-4 py-3 border-t border-stone-200 bg-white/70 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-stone-500 font-medium">
            {yearBounds.min}
          </span>
          <div className="flex-1 relative">
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
              className="w-full"
              style={{ accentColor: '#2D5F4F' }}
              aria-label="Active fiscal year"
            />
            {/* Report markers — small dots below the track at years with an annual report */}
            <div className="absolute left-0 right-0 -bottom-1 pointer-events-none">
              {data.annual_reports.map((r) => {
                const span = yearBounds.max - yearBounds.min || 1
                const pct = ((r.fiscal_year - yearBounds.min) / span) * 100
                return (
                  <span
                    key={r.fiscal_year}
                    className="absolute w-1.5 h-1.5 rounded-full"
                    style={{
                      left: `calc(${pct}% - 3px)`,
                      backgroundColor: '#D97757',
                    }}
                    title={`FY ${r.fiscal_year} report`}
                  />
                )
              })}
            </div>
          </div>
          <span className="text-[11px] text-stone-500 font-medium">
            {yearBounds.max}
          </span>
          <span className="text-sm font-serif text-charcoal min-w-[70px] text-right">
            FY {activeYear}
          </span>
        </div>
        <div className="text-[10px] text-stone-500 mt-1.5 flex items-center gap-1.5">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: '#D97757' }}
          />
          <span>Years with an annual report — click in the Reports rail to dive.</span>
        </div>
      </div>

      {/* Full-screen annual report summary overlay */}
      {overlayReport && (
        <ReportOverlay
          report={overlayReport}
          yearDetail={
            data.years.find(
              (y) => y.fiscal_year === overlayReport.fiscal_year,
            ) ?? null
          }
          // Voices captured that year — collected from quotes_by_speaker via
          // years.events isn't quote-aware, so we just use top-quotes from
          // the active year's theme well summary for now.
          themesWithQuotes={data.themes}
          onClose={() => setOverlayReport(null)}
        />
      )}

      <style jsx global>{`
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
        /* GPU-accelerated opacity transition for face nodes — keeps
           clicking + mode-switching feeling instant even with ~100 faces. */
        .cstl-face {
          transition: opacity 240ms ease;
        }
        :fullscreen {
          background: #fbf6ee;
        }
      `}</style>
    </div>
  )
}

/** Full-screen annual-report summary overlay. Opens when a year is clicked
 *  from the Reports rail. Surfaces cover, year-at-a-glance, top events,
 *  achievements, and a PDF link. Dismissed with Esc or the X button. */
function ReportOverlay({
  report,
  yearDetail,
  themesWithQuotes,
  onClose,
}: {
  report: AnnualReportItem
  yearDetail: ConstellationPayload['years'][number] | null
  themesWithQuotes: ThemeWell[]
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const revenue = yearDetail?.revenue
    ? `$${(yearDetail.revenue / 1_000_000).toFixed(1)}M`
    : null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-cream rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-stone-200">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-ochre font-bold">
              Annual Report · FY {report.fiscal_year}
            </div>
            <h2 className="font-serif text-2xl text-charcoal mt-1">
              {report.title ?? `Palm Island Community Company FY${report.fiscal_year}`}
            </h2>
            {report.subtitle && (
              <p className="text-sm text-stone-600 mt-1">{report.subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-stone-500 hover:text-stone-800 text-2xl leading-none px-2"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 p-6">
          {/* Cover image column */}
          <div>
            {report.cover_photo_url ? (
              <img
                src={report.cover_photo_url}
                alt=""
                loading="lazy"
                className="w-full rounded-lg shadow-md"
              />
            ) : (
              <div className="aspect-[3/4] rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 text-sm italic">
                no cover image
              </div>
            )}
            {report.pdf_url && (
              <a
                href={report.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block text-center px-4 py-2 rounded-md font-semibold text-white text-sm"
                style={{ backgroundColor: '#2D5F4F' }}
              >
                Open full PDF →
              </a>
            )}
            {report.published_date && (
              <div className="text-[11px] text-stone-500 mt-2 text-center">
                Published {report.published_date.slice(0, 10)}
              </div>
            )}
          </div>

          {/* Year-at-a-glance + events + achievements */}
          <div className="space-y-5">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-2">
                Year at a glance
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {revenue && (
                  <Glance label="Total income" value={revenue} />
                )}
                {yearDetail?.audited && (
                  <Glance label="Status" value="Audited" />
                )}
                <Glance
                  label="Timeline events"
                  value={String(yearDetail?.events.length ?? 0)}
                />
                <Glance
                  label="Achievements"
                  value={String(yearDetail?.achievements.length ?? 0)}
                />
              </div>
            </div>

            {yearDetail && yearDetail.events.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-2">
                  Interesting things that year
                </div>
                <ul className="space-y-1.5 text-sm text-stone-800">
                  {yearDetail.events.slice(0, 6).map((e, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-ochre flex-shrink-0">·</span>
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

            {yearDetail && yearDetail.achievements.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-2">
                  Achievements
                </div>
                <ul className="space-y-1.5 text-sm text-stone-800">
                  {yearDetail.achievements.slice(0, 5).map((a, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-sage-700 flex-shrink-0">✓</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {themesWithQuotes.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-2">
                  Themes named in this corpus
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {themesWithQuotes.slice(0, 8).map((t) => (
                    <span
                      key={t.key}
                      className="inline-flex items-center gap-1 text-[11px] rounded-full px-2.5 py-0.5"
                      style={{ backgroundColor: '#F4E9DC', color: '#2C2C2C' }}
                    >
                      {t.label}
                      <span className="text-stone-500">·{t.count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-3 border-t border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
          <span>Esc to close · click anywhere outside to dismiss</span>
          <span className="italic">
            Quote decomposition arrives in Stage 2 of the Atlas roadmap.
          </span>
        </div>
      </div>
    </div>
  )
}

function Glance({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-stone-200 bg-white px-3 py-2">
      <div className="font-serif text-lg leading-tight" style={{ color: '#2D5F4F' }}>
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-stone-500 mt-0.5">
        {label}
      </div>
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

function RailHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-2 px-0.5">
      {children}
    </div>
  )
}

function RailDivider() {
  return <div className="border-t border-stone-200 my-3" />
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
      <div className="flex items-baseline justify-between mb-2 gap-2">
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

function ClearButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="mt-2 text-xs text-sage-700 hover:underline"
      onClick={onClick}
    >
      clear
    </button>
  )
}

/** Tiny thumbnail used in left-rail rows. Shows image when present,
 *  coloured swatch as fallback. */
function Thumb({
  url,
  fallback,
  size = 28,
}: {
  url: string | null
  fallback: string
  size?: number
}) {
  return (
    <span
      className="inline-block rounded-md flex-shrink-0 overflow-hidden"
      style={{ width: size, height: size, backgroundColor: fallback }}
    >
      {url && (
        <img
          src={url}
          alt=""
          loading="lazy"
          width={size}
          height={size}
          className="w-full h-full object-cover"
        />
      )}
    </span>
  )
}
