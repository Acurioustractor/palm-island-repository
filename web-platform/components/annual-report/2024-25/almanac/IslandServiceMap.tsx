/**
 * IslandServiceMap — geographically-real Palm Island silhouette with
 * service dots positioned over it.
 *
 * SVG outline is traced from OpenStreetMap (way IDs 69255195 Palm +
 * 69255186 Eclipse). Service positions are illustrative — most PICC
 * services are network-delivered across the island rather than pinned
 * to specific lat/lng, so we cluster them visually inside the township
 * area (south + south-east) where the work concentrates.
 *
 * Categories are colour-coded; hover any dot for the service name.
 */
'use client'

import { PALM_ISLAND_VIEWBOX, PALM_ISLAND_PATHS } from '@/lib/maps/palm-island-paths'
import { C } from './tokens'

interface ServiceWithMapCoords {
  id: string
  name: string
  service_category?: string | null
  /** 0-1 normalized x within the SVG viewBox */
  map_x?: number
  /** 0-1 normalized y within the SVG viewBox */
  map_y?: number
}

interface IslandServiceMapProps {
  services: ServiceWithMapCoords[]
}

const CATEGORY_COLOUR: Record<string, string> = {
  family: C.ochre,
  health: C.mangrove,
  justice: C.coral,
  youth: C.reef,
  economic: C.starGold,
  community: C.ocean,
  education: C.ocean,
}

export function IslandServiceMap({ services }: IslandServiceMapProps) {
  // Parse "0 0 1000 723" → numbers
  const [, , vbW, vbH] = PALM_ISLAND_VIEWBOX.split(' ').map(Number)

  // Services with a position get rendered; ones without map_x/y get
  // distributed in a deterministic ring as a fallback so editors who
  // haven't set coords still see them.
  const placed = services.filter((s) => Number.isFinite(s.map_x) && Number.isFinite(s.map_y))
  const unplaced = services.filter((s) => !Number.isFinite(s.map_x) || !Number.isFinite(s.map_y))

  return (
    <section className="w-full" aria-label="Services across Palm Island">
      <div className="relative mx-auto" style={{ maxWidth: 920, aspectRatio: `${vbW} / ${vbH}` }}>
        <svg
          viewBox={PALM_ISLAND_VIEWBOX}
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-hidden
        >
          {/* Soft ocean background tint behind the islands */}
          <rect x="0" y="0" width={vbW} height={vbH} fill={C.shell} opacity={0.4} />

          {/* Island silhouettes — Palm + Eclipse — rendered in mangrove
              with a quiet stroke for definition. */}
          {PALM_ISLAND_PATHS.map((p) => (
            <path
              key={p.name}
              d={p.d}
              fill={C.mangrove}
              fillOpacity={0.18}
              stroke={C.mangrove}
              strokeOpacity={0.65}
              strokeWidth={1.5}
            >
              <title>{p.name}</title>
            </path>
          ))}

          {/* Geo-positioned service dots */}
          {placed.map((svc) => {
            const colour = CATEGORY_COLOUR[svc.service_category ?? ''] ?? C.driftwood
            const cx = (svc.map_x ?? 0.5) * vbW
            const cy = (svc.map_y ?? 0.5) * vbH
            return (
              <g key={svc.id} className="cursor-help">
                <title>{svc.name}</title>
                <circle cx={cx} cy={cy} r={11} fill={colour} fillOpacity={0.18} />
                <circle cx={cx} cy={cy} r={7} fill={colour} stroke="#FBF8EE" strokeWidth={1.5} />
              </g>
            )
          })}

          {/* Unplaced services — small marker stack at top-right corner */}
          {unplaced.map((svc, i) => {
            const colour = CATEGORY_COLOUR[svc.service_category ?? ''] ?? C.driftwood
            const cx = vbW * 0.92
            const cy = vbH * 0.08 + i * 14
            return (
              <g key={svc.id} className="cursor-help">
                <title>{svc.name} (no coords yet)</title>
                <circle cx={cx} cy={cy} r={5} fill={colour} fillOpacity={0.5} stroke={colour} strokeWidth={1} strokeDasharray="2 1" />
              </g>
            )
          })}
        </svg>

        {/* Compass + scale annotation */}
        <div
          className="absolute bottom-3 right-3 text-right"
          style={{ color: C.driftwood, fontSize: 10, letterSpacing: '0.1em' }}
        >
          <div style={{ fontFamily: 'Inter', fontWeight: 600 }}>GREAT PALM ISLAND</div>
          <div style={{ fontFamily: 'Inter', opacity: 0.7 }}>· ECLIPSE ISLAND ·</div>
          <div style={{ fontFamily: 'Inter', opacity: 0.5, marginTop: 4 }}>OSM coastline · {placed.length} of {services.length} services placed</div>
        </div>
      </div>
    </section>
  )
}
