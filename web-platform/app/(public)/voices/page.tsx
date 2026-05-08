/**
 * /voices — the community voices wall.
 *
 * A Bento-style photo mosaic of every named storyteller and the services
 * they speak through. Click into a face for the full profile + quotes.
 * Pulled live from Empathy Ledger v2 — voices-pool (faces + service
 * linkages) and the voices-wall slot (broader portrait set).
 *
 * Followed by:
 *   - 20-Voices-for-20-Years sprint progress
 *   - Elder voices section (pulled from elder_quotes + elders directory)
 *   - Connections preview (force graph at /voices/network)
 *   - All-quote search wall (legacy VoiceWall, now below the fold)
 */
import Link from 'next/link'
import Image from 'next/image'
import { Quote, ArrowRight, Sparkles } from 'lucide-react'
import StorytellerSearchStrip from '@/components/community/StorytellerSearchStrip'
import { getPiccStorytellers } from '@/lib/empathy-ledger/el-storytellers'
import { getPiccServices } from '@/lib/services/el-services'
import { getPhotosForSlots } from '@/lib/media/el-photos'
import { C, SECTION_COLOURS } from '@/components/annual-report/2024-25/almanac/tokens'
import { ogMeta } from '@/lib/seo/og'

export const dynamic = 'force-dynamic'
export const revalidate = 1800

export const metadata = ogMeta({
  title: 'Voices — Palm Island Community Company',
  description:
    'Every named voice in the Palm Island archive — faces, services, and the threads between them.',
  path: '/voices',
})

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function initials(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Section-coloured tonal placeholder per name (same hash → same colour)
function tintFor(name: string): string {
  const palette = [C.ocean, C.ochre, C.mangrove, C.coral, C.reef, C.starGold, C.turtleRed]
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return palette[h % palette.length]
}

// Bento layout: cycle through (huge / wide / tall / square / square / square)
// so the first row of every chunk has a hero + variety. Adjusts gracefully on
// mobile (everything becomes 2-col).
type Span = 'lg' | 'wide' | 'tall' | 'sq'
// 16-tile rhythm — one large hero per row of ~5, occasional tall + wide,
// rest squares. With grid-flow-dense the squares backfill holes left by
// the wide/tall tiles so the wall packs tight.
const SPAN_PATTERN: Span[] = [
  'lg', 'sq', 'sq', 'tall',  'sq',
  'sq', 'wide', 'sq',         'sq',
  'tall', 'sq', 'sq',         'sq',
  'sq', 'sq', 'sq',
]

function spanClass(span: Span): string {
  switch (span) {
    case 'lg':   return 'col-span-2 row-span-2 md:col-span-2 md:row-span-2'
    case 'wide': return 'col-span-2 row-span-1 md:col-span-2 md:row-span-1'
    case 'tall': return 'col-span-1 row-span-2 md:col-span-1 md:row-span-2'
    case 'sq':
    default:     return 'col-span-1 row-span-1'
  }
}

interface Tile {
  id: string
  name: string
  role: string | null
  photo: string | null
  services: string[]
  quoteCount: number
  href: string
  isElder: boolean
  isFeatured: boolean
}

interface ServiceMeta {
  slug: string
  name: string
}

export default async function VoicesPage() {
  const [storytellers, services, voicesWallPhotos] = await Promise.all([
    getPiccStorytellers({ limit: 500 }),
    getPiccServices({ status: 'active' }).catch(() => []),
    getPhotosForSlots(['voices-wall', 'gallery', 'elders-on-country'], 30).catch(() => []),
  ])

  // ── Build a slug → service-name map (for chip rendering) ──────────────
  const serviceBySlug = new Map<string, ServiceMeta>()
  for (const s of services) serviceBySlug.set(s.slug, { slug: s.slug, name: s.name })

  // ── Tiles: only storytellers with a real photo go in the wall ─────────
  // Per directive: "I only want faces in the photos wall if they have
  // profile images." Initials-only placeholders feel cheap; better to
  // show a tight wall of real faces. Storytellers without photos still
  // surface in the search strip + quote wall below.
  const tiles: Tile[] = storytellers
    .filter((s) => !!s.display_name && !!s.photo_url)
    .map((s) => ({
      id: s.id,
      name: s.display_name,
      role: s.role,
      photo: s.photo_url,
      services: s.service_slugs,
      quoteCount: s.quote_count,
      href: `/voices/${s.slug || slugify(s.display_name)}`,
      isElder: s.is_elder,
      isFeatured: s.is_featured,
    }))
    .sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1
      if (a.isElder !== b.isElder) return a.isElder ? -1 : 1
      if (a.quoteCount !== b.quoteCount) return b.quoteCount - a.quoteCount
      return a.name.localeCompare(b.name)
    })

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FBF8EE' }}>
      {/* Hero — short, intentional, sets the cadence ─────────────────── */}
      <section
        className="px-6 md:px-12 pt-16 md:pt-20 pb-10"
        style={{ backgroundColor: C.shell }}
      >
        <div className="max-w-6xl mx-auto">
          <div
            className="uppercase font-bold mb-3"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            Community voices · {tiles.length} faces · {tiles.filter((t) => t.isElder).length} elders · {storytellers.length} in the archive
          </div>
          <h1
            className="font-fraunces font-bold leading-[1.05] mb-6"
            style={{ color: C.ocean, fontSize: 'clamp(40px, 7vw, 80px)' }}
          >
            Every voice has a face.
          </h1>
          <p
            className="font-fraunces max-w-2xl mb-6"
            style={{ color: C.driftwood, fontSize: 20, lineHeight: 1.5 }}
          >
            Faces from the Palm Island archive, named where named, consented at the source. Tap any tile to step inside the profile.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold uppercase tracking-widest">
            <Link href="/voices/who" className="hover:opacity-80" style={{ color: C.ochre, letterSpacing: '0.15em' }}>
              Storyteller grid →
            </Link>
            <Link href="/voices/network" className="hover:opacity-80" style={{ color: C.ochre, letterSpacing: '0.15em' }}>
              Connection map →
            </Link>
            <Link href="/voices/themes" className="hover:opacity-80" style={{ color: C.ochre, letterSpacing: '0.15em' }}>
              Themes →
            </Link>
            <Link href="/voices/this-month" className="hover:opacity-80" style={{ color: C.ochre, letterSpacing: '0.15em' }}>
              This month →
            </Link>
            <Link href="/elders" className="hover:opacity-80" style={{ color: C.ochre, letterSpacing: '0.15em' }}>
              Elders →
            </Link>
            <Link href="/share-note" className="hover:opacity-80" style={{ color: C.ochre, letterSpacing: '0.15em' }}>
              Leave a note →
            </Link>
          </div>
        </div>
      </section>

      {/* ── BENTO MOSAIC — the rad photo wall ──────────────────────────── */}
      <section className="px-4 md:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div
            className="grid grid-flow-dense grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 auto-rows-[150px] md:auto-rows-[200px]"
          >
            {tiles.slice(0, 60).map((t, i) => {
              const span = SPAN_PATTERN[i % SPAN_PATTERN.length]
              const tint = tintFor(t.name)
              const primaryServiceSlug = t.services[0]
              const primaryService = primaryServiceSlug ? serviceBySlug.get(primaryServiceSlug) : null
              const sectionColour =
                primaryService
                  ? sectionColourForCategory(services.find((s) => s.slug === primaryServiceSlug)?.service_category)
                  : tint

              return (
                <Link
                  key={t.id}
                  href={t.href}
                  className={`relative rounded-2xl overflow-hidden group ${spanClass(span)}`}
                  style={{ backgroundColor: tint }}
                >
                  {t.isElder && (
                    <span
                      className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em]"
                      style={{ backgroundColor: C.starGold, color: C.midnight, letterSpacing: '0.15em' }}
                    >
                      Elder
                    </span>
                  )}
                  {t.photo && (
                    <Image
                      src={t.photo}
                      alt={t.name}
                      fill
                      sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}

                  {/* Gradient overlay (always there for legibility) */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 80%, rgba(0,0,0,0.85) 100%)',
                    }}
                  />

                  {/* Bottom label panel */}
                  <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 text-white">
                    <div
                      className="font-fraunces font-bold leading-tight mb-1"
                      style={{ fontSize: span === 'lg' ? 26 : span === 'wide' ? 22 : 17 }}
                    >
                      {t.name}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {primaryService && (
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.15em]"
                          style={{ backgroundColor: sectionColour, color: '#fff' }}
                        >
                          {primaryService.name.length > 18 ? primaryService.name.slice(0, 16) + '…' : primaryService.name}
                        </span>
                      )}
                      {t.quoteCount > 0 && (
                        <span className="text-[10px] opacity-85">
                          {t.quoteCount} quote{t.quoteCount === 1 ? '' : 's'}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── ELDERS SPOTLIGHT ──────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-16" style={{ backgroundColor: C.midnight, color: '#fff' }}>
        <div className="max-w-6xl mx-auto">
          <div
            className="uppercase font-bold mb-3"
            style={{ color: C.starGold, fontSize: 11, letterSpacing: '0.3em' }}
          >
            Cultural authority · Elders
          </div>
          <h2 className="font-fraunces font-bold leading-tight mb-4" style={{ fontSize: 'clamp(28px, 4.5vw, 48px)' }}>
            What the Elders teach.
          </h2>
          <p className="font-fraunces mb-8 max-w-3xl" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18 }}>
            Eight named Elders. 162 validated quotes. Trip stories from Country, generational threads, and the cultural review that holds every public surface.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/elders"
              className="px-5 py-3 rounded-md font-bold uppercase tracking-widest text-xs"
              style={{ backgroundColor: C.starGold, color: C.midnight, letterSpacing: '0.15em' }}
            >
              Open Elders directory →
            </Link>
            <Link
              href="/elders/leadership"
              className="px-5 py-3 rounded-md font-bold uppercase tracking-widest text-xs border"
              style={{ borderColor: C.starGold, color: '#fff', letterSpacing: '0.15em' }}
            >
              What the Elders teach →
            </Link>
            <Link
              href="/voices/network"
              className="px-5 py-3 rounded-md font-bold uppercase tracking-widest text-xs border"
              style={{ borderColor: C.starGold, color: '#fff', letterSpacing: '0.15em' }}
            >
              Connection map →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CONNECTIONS PREVIEW (link to /voices/network) ─────────────── */}
      <section className="px-6 md:px-12 py-16">
        <div className="max-w-6xl mx-auto">
          <div
            className="uppercase font-bold mb-3"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            Threads between voices
          </div>
          <h2 className="font-fraunces font-bold leading-tight mb-3" style={{ color: C.ocean, fontSize: 'clamp(28px, 4.5vw, 48px)' }}>
            Every storyteller is connected to others.
          </h2>
          <p className="font-fraunces mb-6 max-w-3xl" style={{ color: C.driftwood, fontSize: 18 }}>
            Shared photos, shared themes, shared services. The connection map renders the threads as a force graph — drag, hover, see who appears alongside whom.
          </p>
          <Link
            href="/voices/network"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-md font-bold uppercase tracking-widest text-xs"
            style={{ backgroundColor: C.ocean, color: '#fff', letterSpacing: '0.15em' }}
          >
            <Sparkles className="w-3 h-3" />
            Open the connection map →
          </Link>
        </div>
      </section>

      {/* ── BACKGROUND PHOTO STRIP — voices-wall ──────────────────────── */}
      {voicesWallPhotos.length > 0 && (
        <section className="py-16">
          <div
            className="uppercase font-bold mb-4 px-6 md:px-12 max-w-7xl mx-auto"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            From the archive
          </div>
          <div className="px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
            {voicesWallPhotos.slice(0, 12).map((p) => (
              <div
                key={p.id}
                className="aspect-square rounded-md overflow-hidden relative"
                style={{ backgroundColor: C.shell }}
              >
                {p.url && (
                  <Image
                    src={p.url}
                    alt={p.alt_text || 'Palm Island archive photograph'}
                    fill
                    sizes="(min-width: 1024px) 16vw, (min-width: 768px) 25vw, 50vw"
                    className="object-cover"
                  />
                )}
                {(p.alt_text || p.caption) && (
                  <div
                    className="absolute inset-x-0 bottom-0 p-2 text-[10px]"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
                      color: '#fff',
                    }}
                  >
                    {(p.caption || p.alt_text || '').slice(0, 60)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── STORYTELLER SEARCH (for completeness, below the bento) ────── */}
      {storytellers.length > 0 && (
        <section className="px-6 md:px-12 py-12" style={{ backgroundColor: C.shell }}>
          <div className="max-w-6xl mx-auto mb-6">
            <div
              className="uppercase font-bold mb-2"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Search by name
            </div>
          </div>
          <StorytellerSearchStrip
            storytellers={storytellers
              .slice()
              .sort((a, b) => (a.display_name || '').localeCompare(b.display_name || ''))
              .map((s) => ({
                id: s.id,
                name: s.display_name,
                slug: s.slug || slugify(s.display_name),
              }))}
          />
        </section>
      )}

    </main>
  )
}

function sectionColourForCategory(category: string | null | undefined): string {
  switch ((category || '').toLowerCase()) {
    case 'family':            return SECTION_COLOURS.childrenFamilies
    case 'health':            return SECTION_COLOURS.healthWellbeing
    case 'justice':           return SECTION_COLOURS.justiceSafety
    case 'youth':             return SECTION_COLOURS.youth
    case 'economic':          return SECTION_COLOURS.economic
    case 'education':         return SECTION_COLOURS.educationCommunity
    case 'community':         return SECTION_COLOURS.educationCommunity
    case 'governance':        return SECTION_COLOURS.governance
    default:                  return C.ocean
  }
}
