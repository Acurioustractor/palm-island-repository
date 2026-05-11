'use client'

/**
 * Bwgcolman Constellation — the living map of Palm Island storytelling.
 *
 * Five layers, designed to make a workshop room feel the difference between
 * a glossy brochure and a community-led report:
 *
 *   1. Foundation pole (left)  — Hull River → Reserve → 2004 in custody
 *   2. The Field               — face nodes drift; Elders wear gold rings
 *   3. Theme wells             — gravity wells; click for top community quotes
 *   4. Year scrubber           — bottom; reveals revenue + achievements +
 *                                timeline events for the active year
 *   5. Future pole (right)     — community visions + 20-year commitments
 *
 * Every layer is consent-cleared or validator-flagged at source. The
 * Permissions panel and Standing Tagline are always visible — sovereignty
 * made legible, not metadata.
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
const HEIGHT = 720
const WIDTH_FALLBACK = 1200

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

/**
 * Backdrop palette shifts with active year.
 * - Pre-2010 → warm sunrise (dawn of PICC)
 * - 2010–2018 → ochre noon (growth)
 * - 2019–present → deep sage (sovereign present)
 */
function backdropFor(year: number): string {
  if (year < 2010) return 'linear-gradient(180deg, #FBF6EE 0%, #F6E6D3 100%)'
  if (year < 2019) return 'linear-gradient(180deg, #FBF6EE 0%, #EDD6BA 100%)'
  return 'linear-gradient(180deg, #F6F2EA 0%, #D8E2D6 100%)'
}

export default function Constellation({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const simulationRef = useRef<d3.Simulation<SimFace, undefined> | null>(null)

  const [width, setWidth] = useState(WIDTH_FALLBACK)
  const [mode, setMode] = useState<ViewMode>('field')
  const [activeTheme, setActiveTheme] = useState<string | null>(null)
  const [activeFace, setActiveFace] = useState<FaceNode | null>(null)
  const [tagIdx, setTagIdx] = useState(0)

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

  // Rotate the tagline every 8s — keeps the standing line alive without
  // demanding attention.
  useEffect(() => {
    const id = window.setInterval(
      () => setTagIdx((i) => (i + 1) % TAGLINES.length),
      8000,
    )
    return () => window.clearInterval(id)
  }, [])

  const simFaces: SimFace[] = useMemo(
    () =>
      data.faces.map((f, i) => ({
        id: f.id,
        face: f,
        themeIndex: data.themes.length === 0 ? 0 : i % data.themes.length,
        x:
          Math.cos((i / Math.max(1, data.faces.length)) * Math.PI * 2) * 320 +
          width / 2,
        y:
          Math.sin((i / Math.max(1, data.faces.length)) * Math.PI * 2) * 200 +
          HEIGHT / 2,
      })),
    [data.faces, data.themes.length, width],
  )

  // Theme wells positioned on a ring around centre.
  const themeWells = useMemo(() => {
    if (data.themes.length === 0)
      return [] as Array<ThemeWell & { x: number; y: number }>
    const radius = Math.min(width, HEIGHT) * 0.34
    const cx = width / 2
    const cy = HEIGHT / 2
    return data.themes.map((t, i) => {
      const angle =
        (i / data.themes.length) * Math.PI * 2 - Math.PI / 2
      return {
        ...t,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      }
    })
  }, [data.themes, width])

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width
      if (w > 200) setWidth(w)
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Main simulation effect — re-runs when faces, mode, theme, year change.
  useEffect(() => {
    if (!svgRef.current || simFaces.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const cx = width / 2
    const cy = HEIGHT / 2
    const defs = svg.append('defs')

    // Circle clip for face photos.
    const clipId = 'cstl-face-clip'
    defs
      .append('clipPath')
      .attr('id', clipId)
      .append('circle')
      .attr('r', FACE_RADIUS)

    // Soft radial glow under active theme well.
    const glowId = 'cstl-glow'
    const glow = defs
      .append('radialGradient')
      .attr('id', glowId)
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%')
    glow.append('stop').attr('offset', '0%').attr('stop-color', '#2D5F4F').attr('stop-opacity', 0.35)
    glow.append('stop').attr('offset', '100%').attr('stop-color', '#2D5F4F').attr('stop-opacity', 0)

    // Anchor rings (decorative).
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

    svg
      .append('circle')
      .attr('cx', cx)
      .attr('cy', cy)
      .attr('r', Math.min(width, HEIGHT) * 0.22)
      .attr('fill', 'none')
      .attr('stroke', '#E3D5C5')
      .attr('stroke-width', 0.6)
      .attr('opacity', 0.45)

    // Foundation pole — Hull River etc. pinned on the left margin.
    if (data.foundation.length > 0) {
      const fg = svg.append('g').attr('transform', `translate(28, ${cy - 140})`)
      fg.append('rect')
        .attr('width', 180)
        .attr('height', 280)
        .attr('rx', 14)
        .attr('fill', '#F4E9DC')
        .attr('stroke', '#C7A87E')
        .attr('stroke-width', 1)
        .attr('opacity', 0.85)
      fg.append('text')
        .text('Foundation')
        .attr('x', 90)
        .attr('y', 22)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'Georgia, serif')
        .attr('font-size', 12)
        .attr('font-weight', 700)
        .attr('fill', '#8B6F47')
        .attr('letter-spacing', 2)
      data.foundation.slice(0, 6).forEach((f, i) => {
        const y = 48 + i * 38
        fg.append('text')
          .text(String(f.year))
          .attr('x', 14)
          .attr('y', y)
          .attr('font-family', 'Georgia, serif')
          .attr('font-size', 11)
          .attr('font-weight', 700)
          .attr('fill', '#2C2C2C')
        fg.append('text')
          .text(f.title.length > 26 ? f.title.slice(0, 26) + '…' : f.title)
          .attr('x', 50)
          .attr('y', y)
          .attr('font-family', 'Inter, sans-serif')
          .attr('font-size', 10)
          .attr('fill', '#4A3F33')
      })
    }

    // Future pole — visions + commitments pinned on the right margin.
    {
      const fg = svg
        .append('g')
        .attr('transform', `translate(${width - 208}, ${cy - 140})`)
      fg.append('rect')
        .attr('width', 180)
        .attr('height', 280)
        .attr('rx', 14)
        .attr('fill', '#E7EFE4')
        .attr('stroke', '#5B8A72')
        .attr('stroke-width', 1)
        .attr('opacity', 0.85)
      fg.append('text')
        .text('Next 20 years')
        .attr('x', 90)
        .attr('y', 22)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'Georgia, serif')
        .attr('font-size', 12)
        .attr('font-weight', 700)
        .attr('fill', '#2D5F4F')
        .attr('letter-spacing', 2)
      data.commitments.forEach((c, i) => {
        const y = 50 + i * 64
        fg.append('text')
          .text(String(c.target_year))
          .attr('x', 14)
          .attr('y', y)
          .attr('font-family', 'Georgia, serif')
          .attr('font-size', 11)
          .attr('font-weight', 700)
          .attr('fill', '#2D5F4F')
        fg.append('text')
          .text(c.title)
          .attr('x', 50)
          .attr('y', y)
          .attr('font-family', 'Inter, sans-serif')
          .attr('font-size', 10.5)
          .attr('font-weight', 600)
          .attr('fill', '#2C2C2C')
        fg.append('text')
          .text(c.body.length > 30 ? c.body.slice(0, 30) + '…' : c.body)
          .attr('x', 50)
          .attr('y', y + 14)
          .attr('font-family', 'Inter, sans-serif')
          .attr('font-size', 9)
          .attr('fill', '#4A3F33')
      })
    }

    // Active theme glow.
    if (activeTheme) {
      const w = themeWells.find((t) => t.key === activeTheme)
      if (w) {
        svg
          .append('circle')
          .attr('cx', w.x)
          .attr('cy', w.y)
          .attr('r', 120)
          .attr('fill', `url(#${glowId})`)
      }
    }

    // Theme wells.
    const wellGroup = svg.append('g').attr('class', 'wells')
    const wells = wellGroup
      .selectAll<SVGGElement, (typeof themeWells)[number]>('g')
      .data(themeWells)
      .join('g')
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (_event, d) =>
        setActiveTheme((curr) => (curr === d.key ? null : d.key)),
      )

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

    // Face nodes.
    const faceGroup = svg.append('g').attr('class', 'faces')
    const facePoints = faceGroup
      .selectAll<SVGGElement, SimFace>('g')
      .data(simFaces, (d) => d.id)
      .join('g')
      .style('cursor', 'pointer')
      .on('click', (_event, d) => setActiveFace(d.face))

    // Outer ring (Elder gold or voice colour).
    facePoints
      .append('circle')
      .attr('r', (d) => FACE_RADIUS + (d.face.is_elder ? 5 : 3))
      .attr('fill', 'none')
      .attr('stroke', (d) => ringColour(d.face))
      .attr('stroke-width', (d) => (d.face.is_elder ? 3 : 2))
      .attr('opacity', 0.9)

    // Face image clipped to a circle.
    facePoints
      .append('image')
      .attr('href', (d) => d.face.avatar_url)
      .attr('x', -FACE_RADIUS)
      .attr('y', -FACE_RADIUS)
      .attr('width', FACE_RADIUS * 2)
      .attr('height', FACE_RADIUS * 2)
      .attr('preserveAspectRatio', 'xMidYMid slice')
      .attr('clip-path', `url(#${clipId})`)

    // Mode-driven node opacity.
    facePoints.attr('opacity', (d) => {
      if (mode === 'timeline' && d.face.year !== null) {
        return d.face.year <= activeYear ? 1 : 0.16
      }
      if (mode === 'voices') {
        // Highlight Elders, fade rest gently.
        return d.face.is_elder ? 1 : 0.55
      }
      return 1
    })

    // Custom force biased by active theme / mode.
    function themeForce(alpha: number) {
      simFaces.forEach((node) => {
        let target: { x: number; y: number } | null = null
        if (mode === 'visions') {
          target = { x: width - 130, y: cy } // pull toward future pole
        } else if (activeTheme) {
          const w = themeWells.find((t) => t.key === activeTheme)
          if (w) target = { x: w.x, y: w.y }
        } else {
          target = themeWells[node.themeIndex] ?? null
        }
        if (!target || node.x === undefined || node.y === undefined) return
        const k =
          mode === 'visions' ? 0.06 : activeTheme ? 0.18 : 0.035
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
      .alphaDecay(0.035)
      .on('tick', () => {
        facePoints.attr('transform', (d) => `translate(${d.x}, ${d.y})`)
      })

    simulationRef.current = sim
    return () => {
      sim.stop()
    }
  }, [
    simFaces,
    themeWells,
    width,
    mode,
    activeTheme,
    activeYear,
    data.foundation,
    data.commitments,
  ])

  // Quick legends + counts for the side panels.
  const revenue = formatRevenue(activeYearDetail?.revenue ?? null)

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Top toolbar: mode toggle + stats */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-1.5 py-1 border border-stone-200 shadow-sm text-xs">
        {(['field', 'voices', 'timeline', 'visions'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={
              'px-3 py-1.5 rounded-full font-medium transition ' +
              (mode === m
                ? 'bg-sage-700 text-white'
                : 'text-stone-700 hover:bg-stone-100')
            }
            style={
              mode === m ? { backgroundColor: '#2D5F4F', color: '#FBF6EE' } : {}
            }
          >
            {m === 'field'
              ? 'The Field'
              : m === 'voices'
                ? 'Voices · Elders'
                : m === 'timeline'
                  ? 'Timeline'
                  : 'Visions'}
          </button>
        ))}
      </div>

      <svg
        ref={svgRef}
        width="100%"
        height={HEIGHT}
        viewBox={`0 0 ${width} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ background: backdropFor(activeYear), transition: 'background 600ms ease' }}
      />

      {/* Standing tagline (top-left) */}
      <div className="absolute top-4 left-4 max-w-[300px] bg-white/85 backdrop-blur-sm rounded-xl p-4 border border-stone-200 shadow-sm">
        <div className="text-[10px] uppercase tracking-wide text-ochre font-semibold mb-1">
          Bwgcolman Constellation
        </div>
        <div
          className="font-serif text-charcoal text-base leading-snug"
          key={tagIdx}
          style={{ animation: 'fadeIn 0.6s ease' }}
        >
          {TAGLINES[tagIdx]}
        </div>
        {activeTheme && (
          <div className="mt-2 text-xs text-sage-700">
            Showing flow toward <span className="font-semibold">{activeTheme}</span>{' '}
            — click again to release.
          </div>
        )}
      </div>

      {/* Permissions panel (top-right) */}
      <div className="absolute top-16 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-stone-200 shadow-sm text-xs text-charcoal max-w-[240px] z-10">
        <div className="text-[10px] uppercase tracking-wide text-stone-500 mb-2 font-semibold">
          Permissions
        </div>
        <Stat label="faces consented" value={data.stats.faces_consented} />
        <Stat label="elder quotes validated" value={data.stats.voices_validated_elder} />
        <Stat label="voices extracted" value={data.stats.voices_extracted} />
        <Stat label="stories captured" value={data.stats.stories} />
        <Stat label="board members tracked" value={data.stats.board_members} />
        <div className="text-stone-500 text-[10.5px] mt-2">
          Elder approvals current as of {data.meta.elder_approvals_current_as_of}
        </div>
      </div>

      {/* Now-showing panel (right-side, swaps with active state) */}
      {(activeThemeWell || activeFace) && (
        <div className="absolute top-72 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 border border-stone-200 shadow-lg text-sm text-charcoal max-w-[320px] z-10">
          {activeThemeWell && !activeFace && (
            <>
              <div className="text-[10px] uppercase tracking-wide text-ochre font-semibold mb-2">
                Theme · {activeThemeWell.count} voices
              </div>
              <div className="font-serif text-lg mb-3">{activeThemeWell.label}</div>
              {activeThemeWell.top_quotes.length === 0 ? (
                <div className="text-xs text-stone-500">
                  No quoted voices on file for this theme yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {activeThemeWell.top_quotes.map((q, i) => (
                    <div key={i} className="border-l-2 border-ochre/60 pl-3">
                      <div className="font-serif text-sm leading-snug italic">
                        “{q.text}”
                      </div>
                      <div className="text-[11px] text-stone-600 mt-1">
                        — {q.attribution ?? 'Bwgcolman voice'}
                        {q.suggested && (
                          <span className="ml-2 inline-block bg-sage-100 text-sage-800 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider">
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
            </>
          )}
          {activeFace && (
            <>
              <div className="text-[10px] uppercase tracking-wide text-ochre font-semibold mb-2">
                Voice {activeFace.is_elder && '· Elder'}
              </div>
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
                className="mt-3 text-xs text-sage-700 hover:underline"
                onClick={() => setActiveFace(null)}
              >
                close
              </button>
            </>
          )}
        </div>
      )}

      {/* Year detail panel (bottom-left, shown in Timeline mode) */}
      {mode === 'timeline' && activeYearDetail && (
        <div className="absolute bottom-20 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 border border-stone-200 shadow-lg max-w-[360px] z-10">
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-[10px] uppercase tracking-wide text-ochre font-semibold">
              FY {activeYearDetail.fiscal_year}
              {activeYearDetail.audited && (
                <span className="ml-2 text-stone-500">· audited</span>
              )}
            </div>
            {revenue && (
              <div className="font-serif text-lg text-sage-700">{revenue}</div>
            )}
          </div>
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
        </div>
      )}

      {/* Visions panel (bottom-left, shown in Visions mode) */}
      {mode === 'visions' && data.visions.length > 0 && (
        <div className="absolute bottom-20 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 border border-stone-200 shadow-lg max-w-[420px] z-10">
          <div className="text-[10px] uppercase tracking-wide text-ochre font-semibold mb-2">
            Community visions for the next 20 years
          </div>
          <div className="space-y-2">
            {data.visions.slice(0, 3).map((v, i) => (
              <div key={i} className="border-l-2 border-sage-700/60 pl-3">
                <div className="font-serif text-sm italic leading-snug">
                  “{v.text}”
                </div>
                <div className="text-[11px] text-stone-600 mt-1">
                  — {v.author_name ?? 'Anonymous'}
                  {v.category && (
                    <span className="ml-2 text-stone-500">· {v.category}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Voice mode legend (bottom-left, shown in Voices mode) */}
      {mode === 'voices' && (
        <div className="absolute bottom-20 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 border border-stone-200 shadow-lg max-w-[260px] z-10">
          <div className="text-[10px] uppercase tracking-wide text-ochre font-semibold mb-2">
            Voice rings
          </div>
          <div className="space-y-1.5 text-xs text-stone-700">
            <LegendRow colour={ELDER_RING} label="Elder voice" />
            <LegendRow colour={VOICE_RINGS.staff} label="Staff / Service" />
            <LegendRow colour={VOICE_RINGS.community} label="Community" />
            <LegendRow colour={VOICE_RINGS.supporter} label="Supporter" />
            <LegendRow colour={VOICE_RINGS.governance} label="Governance" />
          </div>
        </div>
      )}

      {/* Year scrubber (always visible at bottom) */}
      <div className="absolute bottom-3 left-0 right-0 px-6 flex items-center gap-4">
        <span className="text-xs text-stone-500 font-medium">
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
        <span className="text-xs text-stone-500 font-medium">
          {yearBounds.max}
        </span>
        <span className="text-sm font-serif text-charcoal min-w-[64px] text-right">
          FY {activeYear}
        </span>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-stone-600">{label}</span>
      <span className="font-semibold text-sage-700">
        {value.toLocaleString()}
      </span>
    </div>
  )
}

function LegendRow({ colour, label }: { colour: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block rounded-full border-2"
        style={{ width: 14, height: 14, borderColor: colour }}
      />
      <span>{label}</span>
    </div>
  )
}
