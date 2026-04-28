/**
 * ServicesAroundIsland — painted Palm Island anchored in the centre,
 * with PICC's 24 services laid out as categorical clusters around it.
 *
 * Hybrid component: the brush-textured PNG is a stylistic anchor (the
 * idea of "Palm Island"), real data drives the dot clusters. Each
 * cluster sits in a fixed zone (NW, N, NE, E, SE, S, SW, W) with its
 * own label and count, so it actually reads as data instead of dots
 * floating around art.
 *
 * Approved infographic #08 (intended use: "use as an icon on the
 * services page"). Companion brand motif: motif-concentric-corner.
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
  heroImageUrl?: string
}

const DEFAULT_HERO = assetUrl('/icons/picc/infographics/08-services-around-island.png')

// Service categories → palette + label. We merge community + education
// because they're a single peak in the SECTION map ("Education &
// Community"). Order here drives clockwise placement.
interface CategoryDef {
  /** All raw service_category strings that fall into this group */
  matches: string[]
  label: string
  colour: string
  /** Anchor position of the cluster on the square canvas (% from left/top) */
  anchor: { x: number; y: number }
  /** Text alignment + label side relative to dots */
  side: 'left' | 'right' | 'center'
}

const CATEGORIES: CategoryDef[] = [
  { matches: ['family'],               label: 'Children & Families',  colour: C.ochre,    anchor: { x: 24, y: 20 },  side: 'left'   }, // NW
  { matches: ['health'],               label: 'Health & Wellbeing',   colour: C.mangrove, anchor: { x: 76, y: 20 },  side: 'right'  }, // NE
  { matches: ['justice'],              label: 'Justice & Safety',     colour: C.coral,    anchor: { x: 80, y: 50 },  side: 'right'  }, // E
  { matches: ['youth'],                label: 'Youth',                colour: C.reef,     anchor: { x: 76, y: 80 },  side: 'right'  }, // SE
  { matches: ['economic'],             label: 'Economic',             colour: C.starGold, anchor: { x: 24, y: 80 },  side: 'left'   }, // SW
  { matches: ['community','education'],label: 'Education & Community',colour: C.ocean,    anchor: { x: 20, y: 50 },  side: 'left'   }, // W
]

export function ServicesAroundIsland({ services, heroImageUrl }: ServicesAroundIslandProps) {
  // Bucket services into the 6 category groups
  const buckets = CATEGORIES.map((cat) => {
    const list = services.filter((s) =>
      cat.matches.includes((s.service_category ?? '').toLowerCase()),
    )
    return { ...cat, services: list }
  })

  return (
    <section className="relative w-full" aria-label="PICC services around Palm Island">
      {/* DESKTOP — painted island anchor with categorical clusters at
          compass positions. Hidden on mobile (md+ only). */}
      <div
        className="relative mx-auto hidden md:block"
        style={{ aspectRatio: '1 / 1', maxWidth: 760 }}
      >
        {/* Painted island anchor. mix-blend-multiply blends the cream
            paper background of the PNG into the page sand-tone so the
            painted square doesn't look plonked on top. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImageUrl ?? DEFAULT_HERO}
          alt=""
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '54%',
            height: 'auto',
            mixBlendMode: 'multiply',
          }}
        />

        {buckets.map((bucket) => (
          <ClusterView key={bucket.label} bucket={bucket} />
        ))}
      </div>

      {/* MOBILE — painted island on top, cluster cards stacked below */}
      <div className="md:hidden">
        <div className="mx-auto" style={{ maxWidth: 320 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImageUrl ?? DEFAULT_HERO}
            alt=""
            className="w-full h-auto"
            style={{ mixBlendMode: 'multiply' }}
          />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 px-4 sm:grid-cols-2">
          {buckets
            .filter((b) => b.services.length > 0)
            .map((bucket) => (
              <MobileClusterCard key={bucket.label} bucket={bucket} />
            ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────

function MobileClusterCard({
  bucket,
}: {
  bucket: CategoryDef & { services: Service[] }
}) {
  return (
    <div
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
      <div className="font-caveat" style={{ color: C.driftwood, fontSize: 14, lineHeight: 1.1 }}>
        {bucket.services.length} {bucket.services.length === 1 ? 'service' : 'services'}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────

function ClusterView({ bucket }: { bucket: CategoryDef & { services: Service[] } }) {
  if (bucket.services.length === 0) return null

  const transformOriginX =
    bucket.side === 'left' ? '0%' : bucket.side === 'right' ? '100%' : '50%'
  const translateX =
    bucket.side === 'left' ? '0%' : bucket.side === 'right' ? '-100%' : '-50%'

  return (
    <div
      className="absolute"
      style={{
        left: `${bucket.anchor.x}%`,
        top: `${bucket.anchor.y}%`,
        transform: `translate(${translateX}, -50%)`,
        transformOrigin: `${transformOriginX} center`,
        maxWidth: 200,
      }}
    >
      <div
        className={`flex flex-wrap gap-1.5 mb-2 ${bucket.side === 'right' ? 'justify-end' : bucket.side === 'center' ? 'justify-center' : 'justify-start'}`}
        style={{ maxWidth: 160 }}
      >
        {bucket.services.map((svc) => (
          <span
            key={svc.id}
            title={svc.name}
            className="cursor-help transition-transform hover:scale-150"
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: bucket.colour,
              border: '2px solid #FBF8EE',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
              display: 'inline-block',
            }}
          />
        ))}
      </div>
      <div
        className={`text-${bucket.side === 'right' ? 'right' : bucket.side === 'center' ? 'center' : 'left'}`}
      >
        <div
          className="font-bold uppercase"
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
          style={{ color: C.driftwood, fontSize: 16, lineHeight: 1, marginTop: 2 }}
        >
          {bucket.services.length} {bucket.services.length === 1 ? 'service' : 'services'}
        </div>
      </div>
    </div>
  )
}
