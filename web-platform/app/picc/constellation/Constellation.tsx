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
  TranscriptRef,
} from '@/lib/constellation/types'
import { Mic, Video as VideoIcon } from 'lucide-react'

interface Props {
  data: ConstellationPayload
  /** workshop = frozen surface for the 13 May demo. atlas = adds the new
   *  Stories and Futures lenses on top. Default = workshop. */
  variant?: 'workshop' | 'atlas'
  /** immersive = always-fullscreen layout, no rounded border, fills parent.
   *  Used by /living-atlas to make the constellation the above-the-fold
   *  experience. Parent container is responsible for sizing (typically
   *  100vh wrapper). */
  immersive?: boolean
}

interface SimFace extends d3.SimulationNodeDatum {
  id: string
  kind: 'face'
  face: FaceNode
  themeIndex: number
}

interface SimService extends d3.SimulationNodeDatum {
  id: string
  kind: 'service'
  service: ServiceItem
}

interface SimProject extends d3.SimulationNodeDatum {
  id: string
  kind: 'project'
  project: ProjectItem
}

type SimNode = SimFace | SimService | SimProject

/** Which node-type layers are visible (full opacity). Toggling one off
 *  fades those nodes to 0.12 — they stay in the simulation so the
 *  layout doesn't reflow, but visually recede. */
type LayerSet = {
  people: boolean
  services: boolean
  projects: boolean
}

type ViewMode = 'field' | 'voices' | 'timeline' | 'visions'
type RailTab =
  | 'view'
  | 'services'
  | 'projects'
  | 'elders'
  | 'stories'
  | 'reports'
  | 'futures'
  | 'bwgcolman'

const FACE_RADIUS = 22
const SERVICE_RADIUS = 18
const PROJECT_RADIUS = 16
const STAGE_HEIGHT = 640

const SERVICE_CATEGORY_COLOURS: Record<string, string> = {
  health: '#C8963E',
  family: '#A67C6D',
  community: '#0B4F6C',
  justice: '#8B1A1A',
  culture: '#8C7A8B',
  education: '#0B4F6C',
  economic: '#F5A623',
  youth: '#0EA5E9',
  other: '#6B6560',
}
const PROJECT_RING = '#D97757'

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
  'Drag a face. Scrub a year. Click a theme.',
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
 * Workshop variant — the rail strip Rachel & Narelle see on 13 May.
 * Frozen per the locked plan.
 */
const WORKSHOP_TABS: ReadonlyArray<{ key: RailTab; label: string }> = [
  { key: 'view', label: 'View' },
  { key: 'services', label: 'Services' },
  { key: 'projects', label: 'Projects' },
  { key: 'elders', label: 'Elders' },
  { key: 'reports', label: 'Reports' },
  { key: 'bwgcolman', label: 'Bwgcolman' },
]

/**
 * Atlas variant — adds the missing seven-lens entries on top of the
 * workshop strip. Per the Atlas roadmap, eventually replaces the workshop
 * strip wholesale; for now both surfaces exist so /picc/constellation can
 * stay frozen.
 */
const ATLAS_TABS: ReadonlyArray<{ key: RailTab; label: string }> = [
  { key: 'view', label: 'View' },
  { key: 'services', label: 'Services' },
  { key: 'projects', label: 'Projects' },
  { key: 'elders', label: 'Elders' },
  { key: 'stories', label: 'Stories' },
  { key: 'reports', label: 'Reports' },
  { key: 'futures', label: 'Futures' },
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

export default function Constellation({
  data,
  variant = 'workshop',
  immersive = false,
}: Props) {
  const TABS = variant === 'atlas' ? ATLAS_TABS : WORKSHOP_TABS
  const wrapperRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const simulationRef = useRef<d3.Simulation<SimNode, undefined> | null>(null)
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const simFacesRef = useRef<SimFace[]>([])

  const [stageSize, setStageSize] = useState({ width: 900, height: STAGE_HEIGHT })
  const [mode, setMode] = useState<ViewMode>('field')
  const [layers, setLayers] = useState<LayerSet>({
    people: true,
    services: true,
    projects: true,
  })
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
  const [autoPlay, setAutoPlay] = useState<boolean>(false)

  // Autoplay — advances activeYear by 1 on a timer. Years that have an
  // annual report pause for 2× the normal beat so the viewer can read
  // the rich data overlay before moving on. Loops min→max→min.
  // Auto-switches to Timeline mode.
  const reportYearSet = useMemo(
    () => new Set(data.annual_reports.map((r) => r.fiscal_year)),
    [data.annual_reports],
  )
  useEffect(() => {
    if (!autoPlay) return
    if (mode !== 'timeline') {
      setMode('timeline')
    }
    const tick = () => {
      setActiveYear((y) => {
        if (y >= yearBounds.max) return yearBounds.min
        return y + 1
      })
    }
    // Slow beat (2200ms) on report years, normal (1100ms) on
    // off-years. This is what makes the playback feel curated.
    const beat = reportYearSet.has(activeYear) ? 2200 : 1100
    const id = window.setTimeout(tick, beat)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, activeYear, yearBounds.max, yearBounds.min, reportYearSet])
  // Defer the year value used in heavy effects so scrubbing stays buttery.
  const deferredYear = useDeferredValue(activeYear)

  const activeYearDetail = useMemo(
    () => data.years.find((y) => y.fiscal_year === deferredYear) ?? null,
    [data.years, deferredYear],
  )
  const activeYearReport = useMemo(
    () =>
      data.annual_reports.find((r) => r.fiscal_year === deferredYear) ?? null,
    [data.annual_reports, deferredYear],
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
    defs
      .append('clipPath')
      .attr('id', 'cstl-svc-clip')
      .append('circle')
      .attr('r', SERVICE_RADIUS)
    defs
      .append('clipPath')
      .attr('id', 'cstl-proj-clip')
      .append('circle')
      .attr('r', PROJECT_RADIUS)

    const glow = defs
      .append('radialGradient')
      .attr('id', 'cstl-glow')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%')
    glow.append('stop').attr('offset', '0%').attr('stop-color', '#2D5F4F').attr('stop-opacity', 0.35)
    glow.append('stop').attr('offset', '100%').attr('stop-color', '#2D5F4F').attr('stop-opacity', 0)

    const root = svg.append('g').attr('class', 'cstl-root')

    // BIG year label — semi-transparent, behind everything. Visible
    // only in Timeline mode. Updates via the mode/year effect below.
    const yearBackdrop = root.append('g').attr('class', 'cstl-year-label')
    yearBackdrop
      .append('text')
      .attr('class', 'cstl-year-num')
      .attr('x', cx)
      .attr('y', cy + 50)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'Georgia, serif')
      .attr('font-size', Math.min(stageSize.width, stageSize.height) * 0.5)
      .attr('font-weight', 700)
      .attr('fill', '#2D5F4F')
      .attr('opacity', 0)
      .attr('pointer-events', 'none')
      .text(activeYear.toString())
    yearBackdrop
      .append('text')
      .attr('class', 'cstl-year-eyebrow')
      .attr('x', cx)
      .attr('y', cy - Math.min(stageSize.width, stageSize.height) * 0.16)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'Inter, system-ui, sans-serif')
      .attr('font-size', 12)
      .attr('font-weight', 700)
      .attr('letter-spacing', 4)
      .attr('fill', '#D4A373')
      .attr('opacity', 0)
      .attr('pointer-events', 'none')
      .text('FISCAL YEAR')

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
      kind: 'face' as const,
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

    // Services — initial positions on an outer ring, offset 0 rad.
    const activeServices = data.services.filter((s) => s.status === 'active')
    const simServices: SimService[] = activeServices.map((s, i) => ({
      id: `service:${s.id}`,
      kind: 'service' as const,
      service: s,
      x:
        Math.cos((i / Math.max(1, activeServices.length)) * Math.PI * 2) * 520 +
        cx,
      y:
        Math.sin((i / Math.max(1, activeServices.length)) * Math.PI * 2) * 340 +
        cy,
    }))

    // Projects — initial positions on a slightly offset outer ring.
    const simProjects: SimProject[] = data.projects.map((p, i) => ({
      id: `project:${p.id}`,
      kind: 'project' as const,
      project: p,
      x:
        Math.cos(
          (i / Math.max(1, data.projects.length)) * Math.PI * 2 + Math.PI / 6,
        ) * 580 +
        cx,
      y:
        Math.sin(
          (i / Math.max(1, data.projects.length)) * Math.PI * 2 + Math.PI / 6,
        ) * 380 +
        cy,
    }))

    const faceGroup = root.append('g').attr('class', 'cstl-faces')
    const facePoints = faceGroup
      .selectAll<SVGGElement, SimFace>('g')
      .data(simFaces, (d) => d.id)
      .join('g')
      .attr('data-id', (d) => d.id)
      .attr('class', 'cstl-face')
      .style('cursor', 'grab')
      .style('touch-action', 'none') // prevent touch scroll fighting drag
      .on('click', (event, d) => {
        event.stopPropagation()
        setActiveFace(d.face)
        setActiveTheme(null)
      })

    // Invisible expanded hit area — makes the face easier to grab on
    // touch + small viewports. Sits behind the visible ring + image.
    facePoints
      .append('circle')
      .attr('class', 'cstl-face-hit')
      .attr('r', FACE_RADIUS + 12)
      .attr('fill', 'transparent')
      .attr('pointer-events', 'all')

    facePoints
      .append('circle')
      .attr('r', (d) => FACE_RADIUS + (d.face.is_elder ? 5 : 3))
      .attr('fill', 'none')
      .attr('stroke', (d) => ringColour(d.face))
      .attr('stroke-width', (d) => (d.face.is_elder ? 3 : 2))
      .attr('opacity', 0.9)
      .attr('pointer-events', 'none')

    facePoints
      .append('image')
      .attr('href', (d) => d.face.thumb_url)
      .attr('x', -FACE_RADIUS)
      .attr('y', -FACE_RADIUS)
      .attr('width', FACE_RADIUS * 2)
      .attr('height', FACE_RADIUS * 2)
      .attr('preserveAspectRatio', 'xMidYMid slice')
      .attr('clip-path', 'url(#cstl-face-clip)')
      .attr('pointer-events', 'none')

    // ── SERVICE CIRCLES (29 active services in EL canonical) ───────────
    const serviceGroup = root.append('g').attr('class', 'cstl-services')
    const servicePoints = serviceGroup
      .selectAll<SVGGElement, SimService>('g')
      .data(simServices, (d) => d.id)
      .join('g')
      .attr('data-id', (d) => d.id)
      .attr('class', 'cstl-service')
      .style('cursor', 'grab')
      .style('touch-action', 'none')
      .on('click', (event, d) => {
        event.stopPropagation()
        setActiveService(d.service)
        setActiveTheme(null)
      })

    servicePoints
      .append('circle')
      .attr('class', 'cstl-svc-hit')
      .attr('r', SERVICE_RADIUS + 10)
      .attr('fill', 'transparent')
      .attr('pointer-events', 'all')

    servicePoints
      .append('circle')
      .attr('r', SERVICE_RADIUS + 2)
      .attr('fill', '#FBF6EE')
      .attr('stroke', (d) =>
        SERVICE_CATEGORY_COLOURS[d.service.category ?? 'other'] ??
        SERVICE_CATEGORY_COLOURS.other,
      )
      .attr('stroke-width', 2.5)
      .attr('pointer-events', 'none')

    servicePoints
      .filter((d) => Boolean(d.service.image_url))
      .append('image')
      .attr('href', (d) => d.service.image_url ?? '')
      .attr('x', -SERVICE_RADIUS)
      .attr('y', -SERVICE_RADIUS)
      .attr('width', SERVICE_RADIUS * 2)
      .attr('height', SERVICE_RADIUS * 2)
      .attr('preserveAspectRatio', 'xMidYMid slice')
      .attr('clip-path', 'url(#cstl-svc-clip)')
      .attr('pointer-events', 'none')

    // ── PROJECT CIRCLES (10 innovation projects) ────────────────────────
    const projectGroup = root.append('g').attr('class', 'cstl-projects')
    const projectPoints = projectGroup
      .selectAll<SVGGElement, SimProject>('g')
      .data(simProjects, (d) => d.id)
      .join('g')
      .attr('data-id', (d) => d.id)
      .attr('class', 'cstl-project')
      .style('cursor', 'grab')
      .style('touch-action', 'none')
      .on('click', (event, d) => {
        event.stopPropagation()
        setActiveProject(d.project)
        setActiveTheme(null)
      })

    projectPoints
      .append('circle')
      .attr('class', 'cstl-proj-hit')
      .attr('r', PROJECT_RADIUS + 10)
      .attr('fill', 'transparent')
      .attr('pointer-events', 'all')

    projectPoints
      .append('circle')
      .attr('r', PROJECT_RADIUS + 2)
      .attr('fill', '#FBF6EE')
      .attr('stroke', PROJECT_RING)
      .attr('stroke-width', 2.5)
      .attr('stroke-dasharray', '3,2') // dashed to distinguish from services
      .attr('pointer-events', 'none')

    projectPoints
      .filter((d) => Boolean(d.project.image_url))
      .append('image')
      .attr('href', (d) => d.project.image_url ?? '')
      .attr('x', -PROJECT_RADIUS)
      .attr('y', -PROJECT_RADIUS)
      .attr('width', PROJECT_RADIUS * 2)
      .attr('height', PROJECT_RADIUS * 2)
      .attr('preserveAspectRatio', 'xMidYMid slice')
      .attr('clip-path', 'url(#cstl-proj-clip)')
      .attr('pointer-events', 'none')

    // Finite simulation: run ~120 ticks to settle, then enter ambient
    // mode — periodic low-amplitude nudges keep faces gently drifting
    // (the "constellation feels alive" effect Rachel asked for).
    // Constant ticking was the original click-lag source; the pulse-
    // based approach reattaches the tick listener only for ~1.5s every
    // 6s, so CPU stays low and clicks remain instant.
    const tickHandler = () => {
      facePoints.attr('transform', (d) => `translate(${d.x}, ${d.y})`)
      servicePoints.attr('transform', (d) => `translate(${d.x}, ${d.y})`)
      projectPoints.attr('transform', (d) => `translate(${d.x}, ${d.y})`)
    }
    // Radial layout: 4 concentric rings, inner to outer:
    //   elders (inner)       → 22% of stage min-dim
    //   non-elder faces      → 42%
    //   services             → 58%
    //   projects             → 70%
    // forceRadial pulls each node toward its target radius. Collision
    // ensures faces and circles don't overlap.
    const dim = Math.min(stageSize.width, stageSize.height)
    const innerRadius = dim * 0.22
    const outerFaceRadius = dim * 0.42
    const serviceRadiusOrbit = dim * 0.58
    const projectRadiusOrbit = dim * 0.7
    const allSimNodes: SimNode[] = [
      ...simFaces,
      ...simServices,
      ...simProjects,
    ]
    const sim = d3
      .forceSimulation<SimNode>(allSimNodes)
      .force(
        'collision',
        d3.forceCollide<SimNode>()
          .radius((d) =>
            d.kind === 'face'
              ? FACE_RADIUS + 10
              : d.kind === 'service'
                ? SERVICE_RADIUS + 8
                : PROJECT_RADIUS + 8,
          )
          .strength(1),
      )
      .force('charge', d3.forceManyBody().strength(-30))
      .force(
        'radial',
        d3
          .forceRadial<SimNode>(
            (d) => {
              if (d.kind === 'face')
                return d.face.is_elder ? innerRadius : outerFaceRadius
              if (d.kind === 'service') return serviceRadiusOrbit
              return projectRadiusOrbit
            },
            cx,
            cy,
          )
          .strength(0.14),
      )
      .force('centre', d3.forceCenter(cx, cy).strength(0.015))
      .alpha(1)
      .alphaDecay(0.04)
      .alphaMin(0.06)
      .velocityDecay(0.6)
      .on('tick', tickHandler)
      .on('end', () => {
        // Free the tick listener — DOM is in final state until the
        // next ambient pulse re-attaches it.
        sim.on('tick', null)
      })

    simulationRef.current = sim

    // Ambient float — every 6s give the field a tiny kick. Faces drift
    // ~10-30px before re-settling. Pauses while the user is dragging so
    // they're never fighting the simulation. Drag's alphaTarget=0.3
    // dominates if a pulse does coincide.
    const ambientPulse = () => {
      if (dragLocked) return
      sim.on('tick', tickHandler) // re-arm; .on('end') may have cleared it
      sim.alphaTarget(0.015).restart()
      setTimeout(() => {
        if (!dragLocked) sim.alphaTarget(0)
      }, 1500)
    }
    const ambientInterval = window.setInterval(ambientPulse, 6000)

    // Generic drag — works on any face / service / project node. The
    // drag handler is parameterised on SimNode so it can run against
    // all three group selections without per-kind logic. Cursor swap
    // works because every node g has cursor: 'grab' set on parent.
    let dragLocked = false
    function makeDrag<T extends SimNode>(selector: string) {
      return d3
        .drag<SVGGElement, T>()
        .filter((event) => !event.ctrlKey && !event.button)
        .on('start', (event, d) => {
          dragLocked = true
          sim.on('tick', tickHandler)
          sim.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
          d3.select<SVGGElement, T>(
            event.sourceEvent.target.closest(selector) as SVGGElement,
          ).style('cursor', 'grabbing')
        })
        .on('drag', (event, d) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event, d) => {
          sim.alphaTarget(0)
          d.fx = null
          d.fy = null
          d3.select<SVGGElement, T>(
            event.sourceEvent.target.closest(selector) as SVGGElement,
          ).style('cursor', 'grab')
          setTimeout(() => {
            dragLocked = false
          }, 600)
        })
    }
    facePoints.call(makeDrag<SimFace>('g.cstl-face'))
    servicePoints.call(makeDrag<SimService>('g.cstl-service'))
    projectPoints.call(makeDrag<SimProject>('g.cstl-project'))

    // Zoom + pan.
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 4])
      .filter((event) => {
        if (event.type === 'mousedown' || event.type === 'touchstart') {
          const target = event.target as Element
          return !target.closest(
            '.cstl-faces g, .cstl-services g, .cstl-projects g, .cstl-wells g',
          )
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
      window.clearInterval(ambientInterval)
      sim.stop()
    }
    // Stable scene rebuild only depends on data + dimensions.
  }, [data.faces, data.themes, stageSize.width, stageSize.height])

  // Lightweight update: opacity + well state only. NEVER restarts the
  // simulation — that's what made clicks feel slow.
  // Layer toggle — fade the inactive node groups. Runs every time the
  // `layers` state changes. Uses CSS opacity transitions on the parent
  // groups so the simulation keeps positioning everything; only the
  // visual presence changes.
  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg
      .select('.cstl-faces')
      .transition()
      .duration(400)
      .style('opacity', layers.people ? 1 : 0.12)
      .style('pointer-events', layers.people ? 'auto' : 'none')
    svg
      .select('.cstl-services')
      .transition()
      .duration(400)
      .style('opacity', layers.services ? 1 : 0.12)
      .style('pointer-events', layers.services ? 'auto' : 'none')
    svg
      .select('.cstl-projects')
      .transition()
      .duration(400)
      .style('opacity', layers.projects ? 1 : 0.12)
      .style('pointer-events', layers.projects ? 'auto' : 'none')
  }, [layers])

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
          return face.year <= deferredYear ? 1 : 0.12
        // Voices mode: non-elders dim hard so Elders dominate visually.
        if (mode === 'voices') return face.is_elder ? 1 : 0.18
        // Visions mode: dim everyone so future commitments stand out.
        if (mode === 'visions') return 0.32
        return 1
      })

    // Voices mode — Elder rings pulse so the gold ring becomes the
    // visual signature. Scale Elder faces up 8% for emphasis.
    svg
      .selectAll<SVGGElement, unknown>('.cstl-faces > g')
      .each(function () {
        const id = this.getAttribute('data-id') ?? ''
        const face = idToFace.get(id)
        if (!face) return
        const sel = d3.select(this)
        // Reset transform — leave d3-force translation in place but
        // append a scale for Voices mode.
        sel.style(
          'transform-box',
          'fill-box',
        )
        sel.style(
          'transition',
          'opacity 0.4s ease',
        )
      })

    // BIG year backdrop — visible only in Timeline mode.
    svg
      .selectAll<SVGTextElement, unknown>(
        '.cstl-year-label .cstl-year-num',
      )
      .transition()
      .duration(450)
      .attr('opacity', mode === 'timeline' ? 0.08 : 0)
      .text(deferredYear.toString())
    svg
      .selectAll<SVGTextElement, unknown>(
        '.cstl-year-label .cstl-year-eyebrow',
      )
      .transition()
      .duration(450)
      .attr('opacity', mode === 'timeline' ? 0.6 : 0)
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
      // Storyteller faces carry the EL UUID in face.id as `storyteller:${uuid}` —
      // peel it off to match transcripts by storyteller_id directly. For all
      // other kinds (board / leadership / photo) fall back to last-name token.
      const storytellerUuid =
        activeFace.kind === 'storyteller' && activeFace.id.startsWith('storyteller:')
          ? activeFace.id.slice('storyteller:'.length)
          : null
      const transcripts: TranscriptRef[] = storytellerUuid
        ? data.transcripts_by_storyteller[storytellerUuid] ?? []
        : data.transcripts_by_speaker[lastName] ?? []
      return (
        <ContextCard
          label={`Voice${activeFace.is_elder ? ' · Elder' : ''}${quotes.length ? ` · ${quotes.length} quotes` : ''}${transcripts.length ? ` · ${transcripts.length} transcripts` : ''}`}
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
          {transcripts.length > 0 && (
            <div className="mt-3 pt-3 border-t border-stone-100">
              <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-1.5">
                Oral history · {transcripts.length} transcript{transcripts.length === 1 ? '' : 's'}
              </div>
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                {transcripts.slice(0, 6).map((t) => (
                  <a
                    key={t.id}
                    href={`/living-atlas/transcripts/${t.id}`}
                    className="block rounded-md border border-stone-200 bg-white p-2 hover:bg-stone-50"
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-500 mb-0.5">
                      {t.has_video ? <VideoIcon className="w-3 h-3" /> : t.has_audio ? <Mic className="w-3 h-3" /> : null}
                      {t.duration_seconds && <span>{Math.round(t.duration_seconds / 60)}m</span>}
                      {t.era_label && <span>· {t.era_label}</span>}
                      {t.cultural_sensitivity === 'sensitive' && (
                        <span className="ml-auto px-1 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wider" style={{ backgroundColor: '#FCEEDF', color: '#8B6F47' }}>sensitive</span>
                      )}
                      {t.cultural_sensitivity === 'sacred' && (
                        <span className="ml-auto px-1 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wider" style={{ backgroundColor: '#FDE3E3', color: '#8B1A1A' }}>sacred</span>
                      )}
                    </div>
                    <div className="font-serif text-[12.5px] text-charcoal leading-snug">
                      {t.title ?? 'Untitled transcript'}
                    </div>
                    {t.ai_summary && (
                      <div className="text-[10.5px] text-stone-600 mt-0.5 line-clamp-2">
                        {t.ai_summary}
                      </div>
                    )}
                  </a>
                ))}
                {transcripts.length > 6 && (
                  <div className="text-[10px] text-stone-500 italic">
                    +{transcripts.length - 6} more recordings
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="text-[11px] text-stone-500 mt-3">
            {activeFace.kind === 'storyteller'
              ? 'Consented in Empathy Ledger v2.'
              : activeFace.kind === 'leadership'
                ? 'PICC leadership · public role.'
                : 'PICC board · public director.'}
          </div>
          {activeFace.kind === 'storyteller' && activeFace.slug && (
            <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-3 text-xs">
              <a
                href={`/living-atlas/people/${activeFace.slug}`}
                className="underline font-semibold"
                style={{ color: '#2D5F4F' }}
              >
                Open their full profile →
              </a>
            </div>
          )}
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
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-3 text-xs">
            <a
              href={`/living-atlas/themes/${activeThemeWell.key}`}
              className="underline font-semibold"
              style={{ color: '#2D5F4F' }}
            >
              Explore {activeThemeWell.label} across the years →
            </a>
          </div>
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
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-3 text-xs">
            <a
              href={`/living-atlas/services/${activeService.slug}`}
              className="underline font-semibold"
              style={{ color: '#2D5F4F' }}
            >
              Open service profile →
            </a>
          </div>
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
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-3 text-xs">
            <a
              href={`/living-atlas/projects/${activeProject.slug}`}
              className="underline font-semibold"
              style={{ color: '#2D5F4F' }}
            >
              Open project profile →
            </a>
          </div>
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
          {activeReport.summary && (
            <p className="text-xs text-stone-800 italic font-serif leading-snug mt-2 mb-2">
              {activeReport.summary.length > 240
                ? activeReport.summary.slice(0, 240) + '…'
                : activeReport.summary}
            </p>
          )}
          {activeReport.key_achievements.length > 0 && (
            <div className="mt-2">
              <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-1">
                Key achievements
              </div>
              <ul className="space-y-1 text-xs text-stone-700">
                {activeReport.key_achievements.slice(0, 3).map((a, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-sage-700 flex-shrink-0">✓</span>
                    <span className="line-clamp-2">{a}</span>
                  </li>
                ))}
              </ul>
            </div>
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
    data.transcripts_by_storyteller,
    data.transcripts_by_speaker,
  ])

  return (
    <div
      ref={wrapperRef}
      className="bg-cream flex flex-col"
      style={{ height: isFullscreen || immersive ? '100vh' : 'auto' }}
    >
      {/* ─── HEADER · Row 1 — Identity + action icons (subtle, secondary) */}
      <div className="flex items-center justify-between px-5 py-2 border-b border-stone-200 bg-white/80 backdrop-blur gap-3">
        <div className="flex items-baseline gap-3 min-w-0">
          <span className="text-[10px] uppercase tracking-[0.4em] text-ochre font-bold whitespace-nowrap">
            Bwgcolman Constellation
          </span>
          <span
            key={tagIdx}
            className="font-serif text-stone-600 text-xs italic truncate hidden md:inline"
            style={{ animation: 'cstl-fade 0.6s ease' }}
          >
            {TAGLINES[tagIdx]}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={clearAllFocus}
            title="Clear all focus (Esc)"
            aria-label="Clear focus"
            className="text-[11px] px-2 py-1 rounded hover:bg-stone-100 text-stone-600 hover:text-charcoal"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={resetView}
            title="Reset zoom + pan"
            aria-label="Reset view"
            className="text-[11px] px-2 py-1 rounded hover:bg-stone-100 text-stone-600 hover:text-charcoal"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            className="text-[11px] px-2 py-1 rounded hover:bg-stone-100 text-stone-600 hover:text-charcoal inline-flex items-center gap-1"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {isFullscreen ? (
                <>
                  <path d="M9 9V3M9 9H3M9 9L3 3" />
                  <path d="M15 9V3M15 9H21M15 9L21 3" />
                  <path d="M9 15V21M9 15H3M9 15L3 21" />
                  <path d="M15 15V21M15 15H21M15 15L21 21" />
                </>
              ) : (
                <>
                  <path d="M3 9V3H9" />
                  <path d="M21 9V3H15" />
                  <path d="M3 15V21H9" />
                  <path d="M21 15V21H15" />
                </>
              )}
            </svg>
            {isFullscreen ? 'Exit' : 'Present'}
          </button>
        </div>
      </div>

      {/* ─── HEADER · Row 2 — Primary controls (modes + layers, prominent) */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-stone-200 bg-cream gap-3 flex-wrap">
        {/* Mode toggle */}
        <div className="inline-flex rounded-md border border-stone-300 overflow-hidden shadow-sm bg-white">
          {MODES.map((m) => {
            const active = mode === m.key
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setMode(m.key)}
                title={m.hint}
                className="text-[11px] px-3.5 py-1.5 font-semibold border-r border-stone-300 last:border-r-0 transition"
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

        {/* Layer toggles — show/hide People · Services · Projects */}
        <div className="inline-flex items-center gap-1.5">
          <span className="text-[9.5px] uppercase tracking-[0.2em] text-stone-500 mr-1.5 font-semibold">
            Layers
          </span>
          {([
            { key: 'people', label: 'People', count: data.faces.length, dotColor: '#2D5F4F' },
            { key: 'services', label: 'Services', count: data.services.filter((s) => s.status === 'active').length, dotColor: '#C8963E' },
            { key: 'projects', label: 'Projects', count: data.projects.length, dotColor: PROJECT_RING },
          ] as const).map((l) => {
            const on = layers[l.key]
            return (
              <button
                key={l.key}
                type="button"
                onClick={() =>
                  setLayers((s) => ({ ...s, [l.key]: !s[l.key] }))
                }
                className="text-[11px] inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition"
                style={
                  on
                    ? {
                        backgroundColor: '#FFFFFF',
                        borderColor: l.dotColor,
                        color: '#2C2C2C',
                      }
                    : {
                        backgroundColor: 'transparent',
                        borderColor: '#E0CFB8',
                        color: '#8B8B7D',
                      }
                }
                title={on ? `Hide ${l.label}` : `Show ${l.label}`}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: on ? l.dotColor : 'transparent',
                    border: `1.5px solid ${l.dotColor}`,
                  }}
                />
                <span className="font-semibold">{l.label}</span>
                <span className="opacity-60 tabular-nums">{l.count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Three-column body */}
      <div
        className="flex flex-1 min-h-0"
        style={{
          height:
            isFullscreen || immersive
              ? 'calc(100vh - 154px)'
              : `${STAGE_HEIGHT}px`,
        }}
      >
        {/* LEFT RAIL — tabbed browser */}
        <div className="w-[220px] border-r border-stone-200 bg-white/60 flex-shrink-0 flex flex-col">
          {/* Tab strip — underlined pills, subtler than coloured fills */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 px-3 py-2 border-b border-stone-200">
            {TABS.map((t) => {
              const active = tab === t.key
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className="text-[11px] py-1 font-semibold relative transition"
                  style={{
                    color: active ? '#2D5F4F' : '#6B6560',
                  }}
                >
                  {t.label}
                  {active && (
                    <span
                      className="absolute left-0 right-0 -bottom-[3px] h-[2px] rounded-full"
                      style={{ backgroundColor: '#2D5F4F' }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Tab body */}
          <div className="flex-1 overflow-y-auto p-3 text-sm">
            {tab === 'view' && (
              <>
                {/* Voice rings legend — the colour key for the canvas.
                    Active mode + How-to-use removed: the mode toggle in
                    the header already shows active state, and the intro
                    overlay introduces the gestures on first paint. */}
                <RailHeading>Ring colours</RailHeading>
                <div className="space-y-1.5 text-[11px] text-stone-700">
                  <LegendRow colour={ELDER_RING} label="Elder voice" />
                  <LegendRow colour={VOICE_RINGS.staff} label="Staff · service" />
                  <LegendRow colour={VOICE_RINGS.community} label="Community" />
                  <LegendRow colour={VOICE_RINGS.supporter} label="Supporter" />
                  <LegendRow colour={VOICE_RINGS.governance} label="Governance" />
                </div>

                <RailDivider />
                <RailHeading>Layer outlines</RailHeading>
                <div className="space-y-1.5 text-[11px] text-stone-700">
                  <LegendRow colour="#C8963E" label="Services · solid ring" />
                  <LegendRow colour={PROJECT_RING} label="Projects · dashed ring" />
                </div>
              </>
            )}

            {tab === 'services' && (
              <>
                <RailHeading>
                  {data.services.length} services · click to filter, open arrow for detail
                </RailHeading>
                <ul className="space-y-1">
                  {data.services.map((s) => (
                    <li key={s.id} className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveService(s)
                          setActiveProject(null)
                          setActiveElder(null)
                          setActiveReport(null)
                        }}
                        className="flex-1 flex items-center gap-2 text-[11.5px] px-2 py-1.5 rounded hover:bg-stone-100"
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
                      <a
                        href={`/living-atlas/services/${s.slug}`}
                        title="Open service detail page"
                        className="text-stone-400 hover:text-charcoal text-sm px-1.5"
                      >
                        →
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {tab === 'projects' && (
              <>
                <RailHeading>
                  {data.projects.length} projects · click to filter, → for detail
                </RailHeading>
                <ul className="space-y-1">
                  {data.projects.map((p) => (
                    <li key={p.id} className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveProject(p)
                          setActiveService(null)
                          setActiveElder(null)
                          setActiveReport(null)
                        }}
                        className="flex-1 flex items-center gap-2 text-[11.5px] px-2 py-1.5 rounded hover:bg-stone-100"
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
                      <a
                        href={`/living-atlas/projects/${p.slug}`}
                        title="Open project detail page"
                        className="text-stone-400 hover:text-charcoal text-sm px-1.5"
                      >
                        →
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {tab === 'elders' && (
              <>
                <RailHeading>{data.named_elders.length} named Elders · click to filter</RailHeading>
                <ul className="space-y-1">
                  {data.named_elders.map((e) => (
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
                  {data.annual_reports.map((r) => {
                    const yd = data.years.find(
                      (y) => y.fiscal_year === r.fiscal_year,
                    )
                    return (
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
                            <div className="flex items-center gap-1">
                              {yd?.revenue && (
                                <span
                                  className="text-[9px] text-stone-500"
                                  title="Total income"
                                >
                                  ${(yd.revenue / 1_000_000).toFixed(1)}M
                                </span>
                              )}
                              {r.pdf_url && (
                                <span
                                  className="text-[9px] text-stone-500 uppercase tracking-wide"
                                  title="PDF available"
                                >
                                  PDF
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-[10.5px] text-stone-600 truncate">
                            {r.title ?? '—'}
                          </div>
                          {yd && (yd.events.length > 0 || yd.achievements.length > 0) && (
                            <div className="text-[9.5px] text-stone-500 mt-0.5">
                              {yd.events.length}e · {yd.achievements.length}a
                            </div>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>

                {/* Cross-cut: revenue arc across years */}
                <RailDivider />
                <RailHeading>Revenue arc</RailHeading>
                <div className="space-y-1">
                  {(() => {
                    const yearsWithRev = data.years
                      .filter((y) => y.revenue != null)
                      .sort((a, b) => a.fiscal_year - b.fiscal_year)
                    if (yearsWithRev.length === 0) return null
                    const max = Math.max(...yearsWithRev.map((y) => y.revenue!))
                    return yearsWithRev.map((y) => {
                      const pct = (y.revenue! / max) * 100
                      return (
                        <div key={y.fiscal_year} className="flex items-center gap-2 text-[10px]">
                          <span className="text-stone-500 w-9">FY{String(y.fiscal_year).slice(-2)}</span>
                          <div className="flex-1 bg-stone-100 rounded-sm h-2 overflow-hidden">
                            <div
                              className="h-full"
                              style={{ width: `${pct}%`, backgroundColor: '#2D5F4F' }}
                            />
                          </div>
                          <span className="text-stone-600 w-12 text-right">
                            ${(y.revenue! / 1_000_000).toFixed(1)}M
                          </span>
                        </div>
                      )
                    })
                  })()}
                </div>
              </>
            )}

            {tab === 'stories' && (
              <>
                {data.el_stories.length > 0 && (
                  <>
                    <RailHeading>
                      EL archive · {data.el_stories.length} published stories
                    </RailHeading>
                    <ul className="space-y-2 mb-3">
                      {data.el_stories.slice(0, 12).map((s) => (
                        <li
                          key={s.id}
                          className="rounded-md border border-stone-200 bg-white p-2"
                        >
                          <div className="flex items-baseline justify-between gap-2">
                            <div className="font-semibold text-[11.5px] truncate">
                              {s.title}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {s.is_featured && (
                                <span
                                  className="text-[8.5px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
                                  style={{ backgroundColor: '#F4E9DC', color: '#8B6F47' }}
                                >
                                  featured
                                </span>
                              )}
                              {s.is_elder_approved && (
                                <span
                                  className="text-[8.5px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
                                  style={{ backgroundColor: '#FCEEDF', color: '#8B6F47' }}
                                  title="Elder approved"
                                >
                                  ★
                                </span>
                              )}
                            </div>
                          </div>
                          {s.summary && (
                            <div className="text-[10.5px] text-stone-600 mt-0.5 line-clamp-2">
                              {s.summary}
                            </div>
                          )}
                          <div className="text-[9.5px] text-stone-500 mt-1 flex gap-1.5 flex-wrap">
                            {s.category && <span>{s.category}</span>}
                            {s.themes.slice(0, 3).map((t) => (
                              <a
                                key={t}
                                href={`/living-atlas/themes/${t}`}
                                className="hover:underline"
                              >
                                #{t}
                              </a>
                            ))}
                            {s.created_year && <span>· {s.created_year}</span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                    <RailDivider />
                  </>
                )}
                <RailHeading>
                  {data.top_stories.length} stories · top by quality
                </RailHeading>
                {data.top_stories.length === 0 ? (
                  <div className="text-[11px] text-stone-500 italic">
                    No published stories on file yet — once stories pass review they surface here.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {data.top_stories.slice(0, 20).map((s) => (
                      <li key={s.id} className="rounded-md border border-stone-200 bg-white p-2">
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="font-semibold text-[11.5px] truncate">
                            {s.title}
                          </div>
                          {s.is_featured && (
                            <span
                              className="text-[8.5px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
                              style={{ backgroundColor: '#F4E9DC', color: '#8B6F47' }}
                            >
                              featured
                            </span>
                          )}
                        </div>
                        {s.summary && (
                          <div className="text-[10.5px] text-stone-600 mt-0.5 line-clamp-2">
                            {s.summary}
                          </div>
                        )}
                        <div className="text-[9.5px] text-stone-500 mt-1 flex gap-1.5">
                          {s.category && <span>{s.category}</span>}
                          {s.created_year && <span>· {s.created_year}</span>}
                          {s.quality_score != null && (
                            <span>· q{s.quality_score}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <RailDivider />
                <RailHeading>
                  {data.featured_knowledge.length} featured knowledge entries
                </RailHeading>
                <ul className="space-y-1 text-[11px]">
                  {data.featured_knowledge.slice(0, 12).map((k) => (
                    <li
                      key={k.id}
                      className="flex gap-2 text-stone-700"
                    >
                      <span
                        className="font-semibold flex-shrink-0 uppercase text-[9px] tracking-wide"
                        style={{ color: '#8B6F47' }}
                      >
                        {k.entry_type}
                      </span>
                      <span className="truncate">{k.title}</span>
                    </li>
                  ))}
                </ul>
                <div className="text-[10px] text-stone-500 italic mt-2">
                  Pulled from 474 PICC knowledge entries. Stage 2 of the Atlas
                  roadmap surfaces full content + cross-year cuts.
                </div>
              </>
            )}

            {tab === 'futures' && (
              <>
                <RailHeading>The next 20 years</RailHeading>
                <div className="text-xs text-stone-700 mb-3">
                  <p className="mb-2">
                    <strong>{2027 - new Date().getFullYear()}</strong> years until
                    the PICC 20-year anniversary (2027). The Atlas IS the
                    celebration.
                  </p>
                </div>

                <RailDivider />
                <RailHeading>Community visions ({data.visions.length})</RailHeading>
                <ul className="space-y-2">
                  {data.visions.map((v, i) => (
                    <li key={i} className="border-l-2 border-ochre/60 pl-2.5">
                      <div className="font-serif text-[11.5px] italic leading-snug">
                        “{v.text.length > 120 ? v.text.slice(0, 120) + '…' : v.text}”
                      </div>
                      <div className="text-[10px] text-stone-500 mt-1">
                        — {v.author_name ?? 'Anonymous'}
                        {v.category && (
                          <span className="ml-1 text-stone-400">· {v.category}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                <RailDivider />
                <RailHeading>Forward commitments</RailHeading>
                <ul className="space-y-2 text-[11.5px] text-stone-700">
                  {data.commitments.map((c, i) => (
                    <li key={i} className="flex gap-2">
                      <span
                        className="font-serif font-bold w-12 flex-shrink-0"
                        style={{ color: '#2D5F4F' }}
                      >
                        {c.target_year}
                      </span>
                      <span>
                        <span className="font-semibold">{c.title}</span>
                        <span className="block text-[10.5px] text-stone-600 mt-0.5">
                          {c.body}
                        </span>
                      </span>
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

                {data.hull_river_voices.length > 0 && (
                  <>
                    <RailDivider />
                    <RailHeading>
                      Hull River voices ({data.hull_river_voices.length})
                    </RailHeading>
                    <div className="text-[10px] text-stone-500 italic mb-2">
                      Quotes naming Hull River, the 1918 cyclone (Leonte),
                      Mission Beach, or the transfer.
                    </div>
                    <ul className="space-y-2">
                      {data.hull_river_voices.slice(0, 5).map((v, i) => (
                        <li
                          key={i}
                          className="border-l-2 border-ochre/60 pl-2.5"
                        >
                          <div className="font-serif text-[11px] italic leading-snug">
                            “{v.text.length > 140 ? v.text.slice(0, 140) + '…' : v.text}”
                          </div>
                          {v.speaker && (
                            <div className="text-[9.5px] text-stone-600 mt-0.5">
                              — {v.speaker}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* STAGE */}
        <div
          ref={stageRef}
          className="relative flex-1 min-w-0 overflow-hidden"
          style={{
            background: backdropFor(deferredYear),
            transition: 'background 600ms ease',
          }}
        >
          {/* Cover backdrop — in Timeline mode the active year's report
              cover photo fades in behind the constellation at very low
              opacity. Creates a sense of "this is what 2014 looked like."
              Keyed on fiscal_year so changing the year cross-fades to
              the next cover. */}
          {mode === 'timeline' && activeYearReport?.cover_photo_url && (
            <div
              key={activeYearReport.fiscal_year}
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url(${activeYearReport.cover_photo_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.18,
                filter: 'saturate(0.7)',
                animation: 'cstl-cover-in 800ms ease',
              }}
            />
          )}
          {/* Cream wash over the cover so faces stay legible. */}
          {mode === 'timeline' && activeYearReport?.cover_photo_url && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(251,246,238,0.5) 0%, rgba(251,246,238,0.75) 70%, rgba(251,246,238,0.85) 100%)',
              }}
            />
          )}
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`0 0 ${stageSize.width} ${stageSize.height}`}
            preserveAspectRatio="xMidYMid meet"
            className="relative z-[1]"
          />

          {/* Year glance card — floats over the canvas in Timeline mode.
              Cycles through every facet of the report (summary, numbers,
              achievements, highlights, sections) every 2s when autoplay
              is on. Click a facet dot to jump. Open full report → full
              overlay. */}
          {mode === 'timeline' && activeYearReport && (
            <YearGlanceCard
              key={activeYearReport.fiscal_year}
              report={activeYearReport}
              yearDetail={activeYearDetail}
              voicesThatYear={data.year_anchored_quotes.filter(
                (q) =>
                  q.event_year_min <= deferredYear &&
                  q.event_year_max >= deferredYear,
              )}
              autoCycle={autoPlay}
              onOpenFull={() => {
                setOverlayReport(activeYearReport)
                setAutoPlay(false)
              }}
            />
          )}

          {/* When in timeline mode on an off-year (no report exists),
              show a quieter hint so the user knows nothing's broken. */}
          {mode === 'timeline' && !activeYearReport && (
            <div
              className="absolute bottom-5 left-5 z-10 rounded-lg bg-white/80 backdrop-blur px-3 py-2 border border-stone-200"
              style={{ animation: 'cstl-glance-in 350ms ease' }}
            >
              <div className="text-[11px] text-stone-600">
                <span className="font-semibold text-charcoal">
                  FY {activeYear}
                </span>{' '}
                · no annual report on file
              </div>
            </div>
          )}
        </div>

        {/* RIGHT RAIL */}
        <div className="w-[280px] border-l border-stone-200 bg-white/60 overflow-y-auto flex-shrink-0 flex flex-col">
          {/* Context card grows to fill available space — the most important
              part of the rail (active face / theme / service / project). */}
          <div className="flex-1 p-3 overflow-y-auto">{rightCard}</div>

          {/* Sovereignty footer — compact, calm, single line. Click to
              expand the full Permissions breakdown. */}
          <details className="border-t border-stone-200 bg-stone-50/70">
            <summary className="cursor-pointer list-none px-3 py-2 text-[10px] uppercase tracking-[0.15em] font-semibold text-stone-500 hover:bg-stone-100 select-none flex items-center justify-between">
              <span>Sovereignty · {data.stats.faces_consented} consented</span>
              <span className="text-stone-400">+</span>
            </summary>
            <div className="px-3 py-2 text-[11px] text-charcoal space-y-1 bg-white border-t border-stone-200">
              <Stat label="faces consented" value={data.stats.faces_consented} />
              <Stat label="elder quotes validated" value={data.stats.voices_validated_elder} />
              <Stat label="voices extracted" value={data.stats.voices_extracted} />
              <Stat label="stories captured" value={data.stats.stories} />
              <Stat label="board members tracked" value={data.stats.board_members} />
              <div
                className="flex justify-between items-baseline pt-1 mt-1 border-t"
                style={{ borderColor: '#F4E9DC' }}
              >
                <span className="text-stone-600 italic">
                  restricted by community choice
                </span>
                <span className="font-semibold" style={{ color: '#8B6F47' }}>
                  {data.stats.restricted_by_community.toLocaleString()}
                </span>
              </div>
              <div className="text-[10px] text-stone-500 pt-1.5">
                Elder approvals current as of{' '}
                {data.meta.elder_approvals_current_as_of}
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* ─── Bottom — year scrubber with report markers ────────────── */}
      <div className="px-6 py-4 border-t border-stone-200 bg-white/80 backdrop-blur">
        <div className="flex items-center gap-3 mb-2 justify-between">
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-ochre">
            Year scrubber · {data.annual_reports.length} annual reports
          </span>
          <div className="flex items-center gap-3">
            {/* Auto-play — turns the timeline into a time-machine. */}
            <button
              type="button"
              onClick={() => setAutoPlay((p) => !p)}
              aria-label={autoPlay ? 'Pause auto-advance' : 'Auto-advance year by year'}
              title={autoPlay ? 'Pause' : 'Play through the years'}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition"
              style={
                autoPlay
                  ? { backgroundColor: '#2D5F4F', color: '#FBF6EE', borderColor: '#2D5F4F' }
                  : { backgroundColor: 'white', color: '#2C2C2C', borderColor: '#D4D4D4' }
              }
            >
              {autoPlay ? (
                <>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="5" width="4" height="14" rx="1" />
                    <rect x="14" y="5" width="4" height="14" rx="1" />
                  </svg>
                  Pause
                </>
              ) : (
                <>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Play through
                </>
              )}
            </button>
            <div className="font-serif text-charcoal flex items-baseline gap-1">
              <span className="text-[10px] uppercase tracking-wider text-stone-500">FY</span>
              <span className="text-xl tabular-nums">{activeYear}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-stone-500 font-semibold tabular-nums">
            {yearBounds.min}
          </span>
          <div className="flex-1 relative" style={{ height: 30 }}>
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
              className="w-full absolute inset-x-0"
              style={{
                accentColor: '#2D5F4F',
                top: 4,
                height: 18,
              }}
              aria-label="Active fiscal year"
            />
            {/* Report markers — clickable dots below the track. */}
            <div className="absolute left-0 right-0 bottom-0 h-3 pointer-events-none">
              {data.annual_reports.map((r) => {
                const span = yearBounds.max - yearBounds.min || 1
                const pct = ((r.fiscal_year - yearBounds.min) / span) * 100
                const isActive = activeYear === r.fiscal_year
                return (
                  <button
                    key={r.fiscal_year}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setActiveReport(r)
                      setActiveYear(r.fiscal_year)
                      setOverlayReport(r)
                    }}
                    title={`FY ${r.fiscal_year} · ${r.title ?? 'Open report'}`}
                    aria-label={`Open FY ${r.fiscal_year} annual report`}
                    className="absolute hover:scale-150 transition-transform pointer-events-auto"
                    style={{
                      left: `calc(${pct}% - 6px)`,
                      top: 0,
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: '#D97757',
                      border: isActive ? '2px solid #2C2C2C' : '2px solid #FBF6EE',
                      cursor: 'pointer',
                      boxShadow: isActive
                        ? '0 0 0 3px rgba(217, 119, 87, 0.3)'
                        : '0 1px 2px rgba(0,0,0,0.15)',
                    }}
                  />
                )
              })}
            </div>
          </div>
          <span className="text-[10px] text-stone-500 font-semibold tabular-nums">
            {yearBounds.max}
          </span>
        </div>
        <div className="text-[10px] text-stone-500 mt-2 flex items-center gap-1.5">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: '#D97757' }}
          />
          <span>
            Each dot is an annual report — click to open the year in full.
          </span>
        </div>
      </div>

      {/* Full-screen annual report summary overlay */}
      {overlayReport && (
        (() => {
          // Compute prev/next based on the sorted reports list so the user
          // can flip through years without closing/reopening the overlay.
          const sortedReports = [...data.annual_reports].sort(
            (a, b) => a.fiscal_year - b.fiscal_year,
          )
          const idx = sortedReports.findIndex(
            (r) => r.fiscal_year === overlayReport.fiscal_year,
          )
          const prev = idx > 0 ? sortedReports[idx - 1] : null
          const next = idx >= 0 && idx < sortedReports.length - 1
            ? sortedReports[idx + 1]
            : null
          return (
            <ReportOverlay
              report={overlayReport}
              yearDetail={
                data.years.find(
                  (y) => y.fiscal_year === overlayReport.fiscal_year,
                ) ?? null
              }
              themesWithQuotes={data.themes}
              onClose={() => setOverlayReport(null)}
              onPrev={prev ? () => setOverlayReport(prev) : null}
              onNext={next ? () => setOverlayReport(next) : null}
              prevYear={prev?.fiscal_year ?? null}
              nextYear={next?.fiscal_year ?? null}
            />
          )
        })()
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
        @keyframes cstl-glance-in {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes cstl-facet-in {
          from {
            opacity: 0;
            transform: translateX(8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes cstl-cover-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 0.18;
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
  onPrev,
  onNext,
  prevYear,
  nextYear,
}: {
  report: AnnualReportItem
  yearDetail: ConstellationPayload['years'][number] | null
  themesWithQuotes: ThemeWell[]
  onClose: () => void
  onPrev?: (() => void) | null
  onNext?: (() => void) | null
  prevYear?: number | null
  nextYear?: number | null
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft' && onPrev) onPrev()
      else if (e.key === 'ArrowRight' && onNext) onNext()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, onPrev, onNext])

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
          <div className="flex items-center gap-1.5">
            {onPrev && prevYear != null && (
              <button
                type="button"
                onClick={onPrev}
                aria-label={`Previous report (FY ${prevYear})`}
                title={`← FY ${prevYear}`}
                className="text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded border border-stone-300 hover:bg-stone-50"
              >
                ← FY {prevYear}
              </button>
            )}
            {onNext && nextYear != null && (
              <button
                type="button"
                onClick={onNext}
                aria-label={`Next report (FY ${nextYear})`}
                title={`FY ${nextYear} →`}
                className="text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded border border-stone-300 hover:bg-stone-50"
              >
                FY {nextYear} →
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-stone-500 hover:text-stone-800 text-2xl leading-none px-2 ml-1"
            >
              ×
            </button>
          </div>
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

          {/* Year-at-a-glance + extracted summary + events + achievements */}
          <div className="space-y-5">
            {/* AI-extracted summary from the report itself */}
            {report.summary && (
              <div>
                <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-2">
                  From the report
                </div>
                <p className="font-serif italic text-stone-800 leading-relaxed text-[15px]">
                  {report.summary}
                </p>
              </div>
            )}

            <div>
              <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-2">
                Year at a glance
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {report.stats?.total_revenue ? (
                  <Glance
                    label="Total revenue"
                    value={`$${(Number(report.stats.total_revenue) / 1_000_000).toFixed(1)}M`}
                  />
                ) : revenue ? (
                  <Glance label="Total income" value={revenue} />
                ) : null}
                {report.stats?.staff_count != null && (
                  <Glance
                    label="Staff"
                    value={String(report.stats.staff_count)}
                  />
                )}
                {report.stats?.clients_served != null && (
                  <Glance
                    label="Clients served"
                    value={Number(report.stats.clients_served).toLocaleString()}
                  />
                )}
                {report.stats?.programs_count != null && (
                  <Glance
                    label="Programs"
                    value={String(report.stats.programs_count)}
                  />
                )}
                {report.stats?.ceo && (
                  <Glance label="CEO" value={String(report.stats.ceo)} />
                )}
                {report.stats?.chair && (
                  <Glance label="Chair" value={String(report.stats.chair)} />
                )}
                {!report.stats && yearDetail?.audited && (
                  <Glance label="Status" value="Audited" />
                )}
              </div>
            </div>

            {/* AI-extracted key achievements (from PDF) */}
            {report.key_achievements.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-2">
                  Key achievements (from the report)
                </div>
                <ul className="space-y-1.5 text-sm text-stone-800">
                  {report.key_achievements.slice(0, 6).map((a, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-sage-700 flex-shrink-0">✓</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* PICC-side keyed statistics (curated by PICC, not AI-extracted) */}
            {report.picc_statistics.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-2">
                  Curated stats · {report.picc_statistics.length} on file
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {report.picc_statistics
                    .filter((s) => s.stat_value && s.stat_label)
                    .slice(0, 8)
                    .map((s) => (
                      <div
                        key={s.id}
                        className="rounded-md border border-stone-200 bg-white px-3 py-2"
                      >
                        <div
                          className="font-serif text-lg leading-tight"
                          style={{ color: '#2D5F4F' }}
                        >
                          {s.stat_value}
                          {s.stat_unit && (
                            <span className="text-sm text-stone-500 ml-1">
                              {s.stat_unit}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] uppercase tracking-wide text-stone-500 mt-0.5">
                          {s.stat_label}
                          {s.is_key_metric && (
                            <span className="ml-1 text-ochre">★</span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* PICC-side named highlights (curated case studies) */}
            {report.picc_highlights.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-2">
                  Highlights · {report.picc_highlights.length} case studies
                </div>
                <div className="space-y-2.5">
                  {report.picc_highlights.slice(0, 4).map((h) => (
                    <article
                      key={h.id}
                      className="rounded-md border border-stone-200 bg-white p-3"
                    >
                      <div className="font-serif text-sm text-charcoal">
                        {h.title}
                        {h.is_featured && (
                          <span className="ml-2 text-[8.5px] uppercase tracking-wider font-semibold text-ochre">
                            featured
                          </span>
                        )}
                      </div>
                      {h.subtitle && (
                        <div className="text-[11px] text-stone-500 italic mt-0.5">
                          {h.subtitle}
                        </div>
                      )}
                      {h.description && (
                        <p className="text-[11.5px] text-stone-700 mt-1 leading-snug line-clamp-3">
                          {h.description}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* PICC-side section walkthrough (curated, may overlap with AI sections) */}
            {report.picc_sections.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-2">
                  Sections · {report.picc_sections.length} written
                </div>
                <ul className="space-y-2 text-sm text-stone-800">
                  {report.picc_sections.slice(0, 6).map((s) => (
                    <li key={s.id}>
                      <div className="font-semibold text-charcoal">
                        {s.section_title}
                      </div>
                      {s.section_content && (
                        <div className="text-[12px] text-stone-700 leading-snug line-clamp-2">
                          {s.section_content}
                        </div>
                      )}
                      {s.featured_quote && (
                        <blockquote className="text-[11px] italic text-stone-600 border-l-2 border-ochre/60 pl-2 mt-1">
                          &ldquo;{s.featured_quote}&rdquo;
                          {s.quote_author && (
                            <span className="not-italic ml-1">— {s.quote_author}</span>
                          )}
                        </blockquote>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI-extracted section walkthrough */}
            {report.sections.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold mb-2">
                  Inside the report ({report.sections.length} sections)
                </div>
                <ul className="space-y-2 text-sm text-stone-800">
                  {report.sections.slice(0, 6).map((s, i) => (
                    <li key={i}>
                      <div className="font-semibold text-charcoal">{s.title}</div>
                      <div className="text-[12px] text-stone-700 leading-snug">
                        {s.summary}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
                    <a
                      key={t.key}
                      href={`/living-atlas/themes/${t.key}`}
                      className="inline-flex items-center gap-1 text-[11px] rounded-full px-2.5 py-0.5 hover:underline"
                      style={{ backgroundColor: '#F4E9DC', color: '#2C2C2C' }}
                      title={`Explore "${t.label}" across the years`}
                    >
                      {t.label}
                      <span className="text-stone-500">·{t.count}</span>
                    </a>
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

/**
 * YearGlanceCard — cycling info-stream for the active year. Renders one
 * facet at a time. When `autoCycle` is true (autoplay running), advances
 * to the next facet every 2.2s. User can click a dot to jump.
 *
 * Facets supported (only non-empty ones are shown):
 *   summary    — cover + title + AI summary
 *   numbers    — revenue / staff / clients / programs grid
 *   achievements — top 4 AI-extracted achievements
 *   highlights — first PICC case study (cover + name + description)
 *   sections   — first 4 section walkthrough titles
 */
function YearGlanceCard({
  report,
  yearDetail,
  voicesThatYear,
  autoCycle,
  onOpenFull,
}: {
  report: AnnualReportItem
  yearDetail: ConstellationPayload['years'][number] | null
  voicesThatYear: ConstellationPayload['year_anchored_quotes']
  autoCycle: boolean
  onOpenFull: () => void
}) {
  type Facet =
    | 'summary'
    | 'numbers'
    | 'achievements'
    | 'voices'
    | 'highlights'
    | 'sections'
  // Build the active facet list — only include ones that have content.
  const facets = useMemo<Facet[]>(() => {
    const out: Facet[] = []
    if (report.summary || report.cover_photo_url) out.push('summary')
    if (
      report.stats?.total_revenue ||
      yearDetail?.revenue ||
      report.stats?.staff_count ||
      report.stats?.clients_served ||
      report.stats?.programs_count
    ) out.push('numbers')
    if (report.key_achievements.length > 0) out.push('achievements')
    if (voicesThatYear.length > 0) out.push('voices')
    if (report.picc_highlights.length > 0) out.push('highlights')
    if (report.sections.length > 0 || report.picc_sections.length > 0)
      out.push('sections')
    return out.length > 0 ? out : ['summary']
  }, [report, yearDetail, voicesThatYear])

  const [idx, setIdx] = useState(0)
  const safeIdx = idx % facets.length
  const facet = facets[safeIdx]

  // Auto-cycle every 2.2s when autoplay is on. Resets when facets
  // change (new year landed).
  useEffect(() => {
    setIdx(0)
  }, [facets])
  useEffect(() => {
    if (!autoCycle) return
    if (facets.length <= 1) return
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % facets.length)
    }, 2200)
    return () => window.clearInterval(id)
  }, [autoCycle, facets.length])

  return (
    <div
      className="absolute bottom-5 left-5 z-10 rounded-xl shadow-xl border bg-white overflow-hidden"
      style={{
        width: 380,
        borderColor: '#E0CFB8',
        animation: 'cstl-glance-in 350ms ease',
      }}
    >
      {/* Cover photo strip — always visible at top */}
      {report.cover_photo_url && (
        <div className="relative">
          <img
            src={report.cover_photo_url}
            alt=""
            className="w-full h-28 object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.45))',
            }}
          />
          <div className="absolute bottom-2 left-3 text-white">
            <div className="text-[10px] uppercase tracking-[0.3em] font-bold">
              FY {report.fiscal_year}
            </div>
            <div className="font-serif text-base leading-tight line-clamp-1 max-w-[320px]">
              {report.title ?? `Annual Report FY${report.fiscal_year}`}
            </div>
          </div>
        </div>
      )}

      {/* Facet body — cycles every 2.2s */}
      <div
        key={`${report.fiscal_year}-${facet}`}
        className="p-4 min-h-[130px]"
        style={{ animation: 'cstl-facet-in 300ms ease' }}
      >
        <div className="text-[9px] uppercase tracking-[0.3em] font-bold text-ochre mb-2">
          {facet === 'summary' && 'From the report'}
          {facet === 'numbers' && 'The numbers'}
          {facet === 'achievements' && 'Key achievements'}
          {facet === 'voices' && `Voices that year · ${voicesThatYear.length}`}
          {facet === 'highlights' && 'Case study'}
          {facet === 'sections' && 'Inside this report'}
        </div>

        {facet === 'summary' && (
          <p className="text-[12px] text-stone-700 leading-snug line-clamp-5 font-serif italic">
            {report.summary}
          </p>
        )}

        {facet === 'numbers' && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            {(report.stats?.total_revenue || yearDetail?.revenue) && (
              <div>
                <div
                  className="font-serif tabular-nums text-xl"
                  style={{ color: '#2D5F4F' }}
                >
                  $
                  {(
                    (Number(report.stats?.total_revenue ?? 0) ||
                      yearDetail?.revenue ||
                      0) / 1_000_000
                  ).toFixed(1)}
                  M
                </div>
                <div className="text-[10px] uppercase tracking-wider text-stone-500">
                  total revenue
                </div>
              </div>
            )}
            {report.stats?.staff_count != null && (
              <div>
                <div
                  className="font-serif tabular-nums text-xl"
                  style={{ color: '#2D5F4F' }}
                >
                  {report.stats.staff_count}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-stone-500">
                  staff
                </div>
              </div>
            )}
            {report.stats?.clients_served != null && (
              <div>
                <div
                  className="font-serif tabular-nums text-xl"
                  style={{ color: '#2D5F4F' }}
                >
                  {Number(report.stats.clients_served).toLocaleString()}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-stone-500">
                  clients
                </div>
              </div>
            )}
            {report.stats?.programs_count != null && (
              <div>
                <div
                  className="font-serif tabular-nums text-xl"
                  style={{ color: '#2D5F4F' }}
                >
                  {report.stats.programs_count}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-stone-500">
                  programs
                </div>
              </div>
            )}
            {report.stats?.ceo && (
              <div className="col-span-2">
                <div className="text-[10px] uppercase tracking-wider text-stone-500">
                  CEO
                </div>
                <div className="text-[12px] font-semibold text-charcoal">
                  {String(report.stats.ceo)}
                </div>
              </div>
            )}
          </div>
        )}

        {facet === 'achievements' && (
          <ul className="space-y-1.5 text-[12px] text-stone-800">
            {report.key_achievements.slice(0, 4).map((a, i) => (
              <li key={i} className="flex gap-2 leading-snug">
                <span style={{ color: '#2D5F4F' }} className="flex-shrink-0">
                  ✓
                </span>
                <span className="line-clamp-2">{a}</span>
              </li>
            ))}
          </ul>
        )}

        {facet === 'voices' && voicesThatYear.length > 0 && (
          <div className="space-y-2">
            {voicesThatYear.slice(0, 2).map((v, i) => (
              <div key={i} className="flex gap-2.5">
                {v.speaker_photo_url ? (
                  <img
                    src={v.speaker_photo_url}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                    style={{
                      border: `2px solid ${v.speaker_is_elder ? '#B8860B' : '#FBF6EE'}`,
                    }}
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-serif text-[10px]"
                    style={{ backgroundColor: '#F4E9DC', color: '#8B6F47' }}
                  >
                    {v.speaker_name
                      .split(/\s+/)
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <blockquote className="font-serif italic text-[11.5px] text-stone-700 leading-snug line-clamp-2">
                    &ldquo;
                    {v.text.length > 110 ? v.text.slice(0, 107) + '…' : v.text}
                    &rdquo;
                  </blockquote>
                  <div className="text-[10px] text-stone-500 mt-0.5 truncate">
                    {v.speaker_name}
                    {v.speaker_is_elder && (
                      <span
                        className="ml-1 text-[8.5px] uppercase tracking-wider font-bold"
                        style={{ color: '#B8860B' }}
                      >
                        Elder
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {facet === 'highlights' && report.picc_highlights[0] && (
          <div>
            <div className="font-serif text-sm text-charcoal mb-1 leading-snug">
              {report.picc_highlights[0].title}
            </div>
            {report.picc_highlights[0].subtitle && (
              <div className="text-[11px] text-stone-500 italic mb-1.5">
                {report.picc_highlights[0].subtitle}
              </div>
            )}
            {report.picc_highlights[0].description && (
              <p className="text-[11.5px] text-stone-700 leading-snug line-clamp-4">
                {report.picc_highlights[0].description}
              </p>
            )}
          </div>
        )}

        {facet === 'sections' && (
          <ul className="space-y-1.5 text-[12px] text-stone-800">
            {(report.picc_sections.length > 0
              ? report.picc_sections.slice(0, 4).map((s) => s.section_title)
              : report.sections.slice(0, 4).map((s) => s.title)
            ).map((t, i) => (
              <li key={i} className="flex gap-2 leading-snug">
                <span style={{ color: '#D4A373' }} className="flex-shrink-0">
                  ·
                </span>
                <span className="line-clamp-1">{t}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Facet dots + open-full link */}
      <div className="px-4 pb-3 flex items-center justify-between border-t border-stone-100 pt-2">
        <div className="flex items-center gap-1.5">
          {facets.map((f, i) => (
            <button
              key={f}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`Show ${f}`}
              className="transition"
              style={{
                width: i === safeIdx ? 18 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === safeIdx ? '#2D5F4F' : '#D4D4D4',
              }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={onOpenFull}
          className="text-[11px] font-semibold inline-flex items-center gap-1 hover:underline"
          style={{ color: '#2D5F4F' }}
        >
          Open full report →
        </button>
      </div>
    </div>
  )
}
