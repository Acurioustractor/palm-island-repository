/**
 * ServicesAroundIsland — clean, integrated services breakdown.
 *
 * Pivoted from the painted-PNG-as-backdrop approach (which was just
 * layering, not integrating). Now: a deliberately composed clean
 * graphic — a soft ocean-tinted island circle in the center, 24
 * service dots arranged around it in 6 categorical arcs (one arc per
 * category, color-tinted from the brand palette), with category
 * labels reading outward.
 *
 * The painted concept asset still ships as a small decorative banner
 * BEFORE this graphic so the brand atmosphere is present without
 * fighting the data viz.
 */
'use client'

import { assetUrl } from '@/lib/media/asset-url'
import { C } from './tokens'

interface Service {
  id: string
  name: string
  service_category?: string | null
}

interface ServicesAroundIslandProps {
  services: Service[]
}

interface CategoryDef {
  matches: string[]
  label: string
  colour: string
  /** Arc center angle in degrees. 0 = top (north), clockwise. */
  arcCenter: number
  /** Anchor position for the label. */
  labelAnchor: 'top' | 'topRight' | 'right' | 'bottomRight' | 'bottom' | 'bottomLeft' | 'left' | 'topLeft'
}

const CATEGORIES: CategoryDef[] = [
  { matches: ['family'],                label: 'Children & Families',   colour: C.ochre,    arcCenter: 330, labelAnchor: 'topLeft'    },
  { matches: ['health'],                label: 'Health & Wellbeing',    colour: C.mangrove, arcCenter: 30,  labelAnchor: 'topRight'   },
  { matches: ['justice'],               label: 'Justice & Safety',      colour: C.coral,    arcCenter: 90,  labelAnchor: 'right'      },
  { matches: ['youth'],                 label: 'Youth',                 colour: C.reef,     arcCenter: 150, labelAnchor: 'bottomRight'},
  { matches: ['economic'],              label: 'Economic',              colour: C.starGold, arcCenter: 210, labelAnchor: 'bottomLeft' },
  { matches: ['community','education'], label: 'Education & Community', colour: C.ocean,    arcCenter: 270, labelAnchor: 'left'       },
]

const PAINTED_BANNER = assetUrl('/icons/picc/infographics/08-services-around-island.png')

export function ServicesAroundIsland({ services }: ServicesAroundIslandProps) {
  // Bucket services into the 6 categories
  const buckets = CATEGORIES.map((cat) => {
    const list = services.filter((s) =>
      cat.matches.includes((s.service_category ?? '').toLowerCase()),
    )
    return { ...cat, services: list }
  })

  // SVG layout — viewBox 100x100, island circle in middle, dots on
  // an arc per category. We compute dot positions deterministically
  // so a re-render lands them in the same spots.
  const VB = 100
  const cx = 50
  const cy = 50
  const islandR = 16
  const dotR = 1.6
  const ringR = 32 // distance from center for the dot arc

  type DotInfo = { x: number; y: number; colour: string; serviceName: string; key: string }
  const dots: DotInfo[] = []

  buckets.forEach((bucket) => {
    const n = bucket.services.length
    if (n === 0) return
    // Spread n dots over a 50° arc centered on bucket.arcCenter
    const arcSpread = Math.min(50, n * 8)
    const start = bucket.arcCenter - arcSpread / 2
    bucket.services.forEach((svc, i) => {
      const t = n === 1 ? 0.5 : i / (n - 1)
      const angleDeg = start + t * arcSpread
      const angleRad = ((angleDeg - 90) * Math.PI) / 180 // -90 so 0deg = top
      const x = cx + ringR * Math.cos(angleRad)
      const y = cy + ringR * Math.sin(angleRad)
      dots.push({
        x,
        y,
        colour: bucket.colour,
        serviceName: svc.name,
        key: svc.id,
      })
    })
  })

  return (
    <section className="w-full" aria-label="PICC services around Palm Island">
      {/* Decorative painted banner — smaller, separate from the data viz */}
      <div className="mx-auto mb-10 hidden md:block" style={{ maxWidth: 480 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PAINTED_BANNER}
          alt=""
          className="w-full h-auto"
          style={{ mixBlendMode: 'multiply', opacity: 0.7 }}
        />
      </div>

      {/* DESKTOP — clean SVG composition with category labels */}
      <div className="relative mx-auto hidden md:block" style={{ maxWidth: 760, aspectRatio: '1 / 1' }}>
        <svg viewBox={`0 0 ${VB} ${VB}`} className="absolute inset-0 h-full w-full" role="img">
          {/* Island circle — soft ocean tint with subtle shadow */}
          <circle cx={cx} cy={cy} r={islandR} fill={C.ocean} opacity={0.08} />
          <circle cx={cx} cy={cy} r={islandR} fill="none" stroke={C.ocean} strokeOpacity={0.35} strokeWidth={0.4} strokeDasharray="0.6 1.2" />
          <circle cx={cx} cy={cy} r={islandR + 6} fill="none" stroke={C.ocean} strokeOpacity={0.12} strokeWidth={0.3} />

          {/* Service dots — one per service, colour by category */}
          {dots.map((d) => (
            <g key={d.key}>
              <title>{d.serviceName}</title>
              <circle cx={d.x} cy={d.y} r={dotR} fill={d.colour} stroke="#FBF8EE" strokeWidth={0.4} />
            </g>
          ))}

          {/* Center stat — total + label */}
          <text
            x={cx}
            y={cy - 1}
            textAnchor="middle"
            fontFamily="Caveat, cursive"
            fontWeight="700"
            fontSize="11"
            fill={C.midnight}
          >
            {services.length}
          </text>
          <text
            x={cx}
            y={cy + 5}
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
            fontWeight="600"
            fontSize="2"
            letterSpacing="0.3"
            fill={C.midnight}
            opacity={0.7}
          >
            ACTIVE SERVICES
          </text>
        </svg>

        {/* Category labels — positioned at fixed compass points so they
            never sit on the dots or the island circle. */}
        {buckets.map((bucket) => {
          if (bucket.services.length === 0) return null
          const pos = LABEL_POSITIONS[bucket.labelAnchor]
          return (
            <div
              key={bucket.label}
              className="absolute"
              style={{
                left: `${pos.left}%`,
                top: `${pos.top}%`,
                transform: pos.transform,
                textAlign: pos.textAlign,
                maxWidth: 170,
              }}
            >
              <div
                className="font-bold uppercase mb-0.5"
                style={{
                  color: bucket.colour,
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  lineHeight: 1.2,
                }}
              >
                {bucket.label}
              </div>
              <div
                className="font-caveat"
                style={{ color: C.driftwood, fontSize: 16, lineHeight: 1.0 }}
              >
                {bucket.services.length} {bucket.services.length === 1 ? 'service' : 'services'}
              </div>
            </div>
          )
        })}
      </div>

      {/* MOBILE — painted banner small + cluster cards stacked */}
      <div className="md:hidden">
        <div className="mx-auto mb-6" style={{ maxWidth: 280 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PAINTED_BANNER}
            alt=""
            className="w-full h-auto"
            style={{ mixBlendMode: 'multiply', opacity: 0.7 }}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 px-4 sm:grid-cols-2">
          {buckets
            .filter((b) => b.services.length > 0)
            .map((bucket) => (
              <div
                key={bucket.label}
                className="rounded-md border bg-white/40 p-3"
                style={{ borderColor: `${bucket.colour}40` }}
              >
                <div className="mb-1.5 flex flex-wrap gap-1">
                  {bucket.services.map((svc) => (
                    <span
                      key={svc.id}
                      title={svc.name}
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: bucket.colour,
                        border: '1.5px solid #FBF8EE',
                        display: 'inline-block',
                      }}
                    />
                  ))}
                </div>
                <div
                  className="font-bold uppercase"
                  style={{ color: bucket.colour, fontSize: 10, letterSpacing: '0.12em' }}
                >
                  {bucket.label}
                </div>
                <div
                  className="font-caveat"
                  style={{ color: C.driftwood, fontSize: 14, lineHeight: 1.1 }}
                >
                  {bucket.services.length} {bucket.services.length === 1 ? 'service' : 'services'}
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────

const LABEL_POSITIONS: Record<
  CategoryDef['labelAnchor'],
  { left: number; top: number; transform: string; textAlign: 'left' | 'right' | 'center' }
> = {
  top:         { left: 50, top: 0,   transform: 'translate(-50%, 0%)',   textAlign: 'center' },
  topRight:    { left: 88, top: 14,  transform: 'translate(-100%, 0%)',  textAlign: 'right'  },
  right:       { left: 96, top: 50,  transform: 'translate(-100%, -50%)',textAlign: 'right'  },
  bottomRight: { left: 88, top: 86,  transform: 'translate(-100%, -100%)',textAlign: 'right' },
  bottom:      { left: 50, top: 100, transform: 'translate(-50%, -100%)',textAlign: 'center' },
  bottomLeft:  { left: 12, top: 86,  transform: 'translate(0%, -100%)',  textAlign: 'left'   },
  left:        { left: 4,  top: 50,  transform: 'translate(0%, -50%)',   textAlign: 'left'   },
  topLeft:     { left: 12, top: 14,  transform: 'translate(0%, 0%)',     textAlign: 'left'   },
}
