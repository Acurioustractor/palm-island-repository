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
import { PALM_ISLAND_LANDMARKS } from '@/lib/maps/picc-service-coords'
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

          {/* Landmarks — township + airport + point references for
              orientation. Rendered UNDER service dots so dots stay
              visible when they sit on top. */}
          {PALM_ISLAND_LANDMARKS.map((lm) => {
            const lx = lm.map_x * vbW
            const ly = lm.map_y * vbH
            if (lm.kind === 'township') {
              return (
                <g key={lm.label} pointerEvents="none">
                  <title>{lm.label}</title>
                  {/* concentric ring under township */}
                  <circle cx={lx} cy={ly} r={32} fill={C.ocean} fillOpacity={0.05} />
                  <circle cx={lx} cy={ly} r={20} fill="none" stroke={C.ocean} strokeOpacity={0.3} strokeWidth={1} strokeDasharray="3 2" />
                  {/* tiny crosshair */}
                  <line x1={lx - 6} y1={ly} x2={lx + 6} y2={ly} stroke={C.ocean} strokeWidth={1.5} strokeOpacity={0.6} />
                  <line x1={lx} y1={ly - 6} x2={lx} y2={ly + 6} stroke={C.ocean} strokeWidth={1.5} strokeOpacity={0.6} />
                  <text x={lx} y={ly + 38} textAnchor="middle" fontFamily="Inter" fontWeight="700" fontSize="11" letterSpacing="2" fill={C.ocean}>
                    TOWNSHIP
                  </text>
                </g>
              )
            }
            if (lm.kind === 'airport') {
              return (
                <g key={lm.label} pointerEvents="none">
                  <title>{lm.label}</title>
                  {/* small triangle marker */}
                  <polygon points={`${lx},${ly - 5} ${lx + 5},${ly + 4} ${lx - 5},${ly + 4}`} fill={C.driftwood} fillOpacity={0.7} />
                  <text x={lx + 10} y={ly + 4} fontFamily="Inter" fontSize="9" letterSpacing="1.5" fill={C.driftwood}>
                    AIRPORT
                  </text>
                </g>
              )
            }
            // point — tiny label
            return (
              <g key={lm.label} pointerEvents="none">
                <text x={lx} y={ly} fontFamily="Inter" fontSize="9" letterSpacing="1.5" fill={C.driftwood} opacity={0.7}>
                  {lm.label.toUpperCase()}
                </text>
              </g>
            )
          })}

          {/* Geo-positioned service dots */}
          {placed.map((svc) => {
            const colour = CATEGORY_COLOUR[svc.service_category ?? ''] ?? C.driftwood
            const cx = (svc.map_x ?? 0.5) * vbW
            const cy = (svc.map_y ?? 0.5) * vbH
            return (
              <g key={svc.id} className="cursor-help">
                <title>{svc.name}</title>
                <circle cx={cx} cy={cy} r={10} fill={colour} fillOpacity={0.16} />
                <circle cx={cx} cy={cy} r={6} fill={colour} stroke="#FBF8EE" strokeWidth={1.5} />
              </g>
            )
          })}

          {/* Any service without coords — small ring at the bottom-left,
              tagged so editors know to assign a position. Should be
              empty once picc-service-coords.ts has all IDs. */}
          {unplaced.map((svc, i) => {
            const colour = CATEGORY_COLOUR[svc.service_category ?? ''] ?? C.driftwood
            const cx = vbW * 0.04 + (i % 4) * 14
            const cy = vbH * 0.95 + Math.floor(i / 4) * 14
            return (
              <g key={svc.id} className="cursor-help">
                <title>{svc.name} (no coords)</title>
                <circle cx={cx} cy={cy} r={4} fill={colour} fillOpacity={0.5} stroke={colour} strokeWidth={1} strokeDasharray="2 1" />
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
