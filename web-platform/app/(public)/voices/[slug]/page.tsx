/**
 * Storyteller Profile — per-person template.
 *
 * Pencil source: picc-almanac-web.pen → "👤 Storyteller Profile · per-person
 * template" (inORe). Five sections:
 *   01 Hero — portrait + name + role + connections eyebrow
 *   02 Featured quote — sand bg, centred, consent line
 *   03 Photo gallery — getPhotosForStoryteller(id)
 *   04 Where she connects — service tiles (rendered only if derivable)
 *   05 Back to voices wall — midnight bg link
 *
 * Data flows entirely through EL v2:
 *   - getPalmStorytellers() resolves slug → storyteller
 *   - getELQuotes() + findQuotesForPerson() picks the featured quote
 *   - getPhotosForStoryteller(id) fetches the gallery
 *
 * URL: /voices/<slug>  where <slug> is the slugified display_name.
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPiccStorytellers, type ELStoryteller as PiccStoryteller } from '@/lib/empathy-ledger/el-storytellers'
import {
  getPalmStorytellers,
  getELQuotes,
  findQuotesForPerson,
  getStoriesForStoryteller,
  getTranscriptsForStoryteller,
  getServicesForStoryteller,
  type ELStoryteller,
  type ELQuote,
  type ELStory,
  type ELTranscript,
} from '@/lib/empathy-ledger/el-server'
import { getPhotosForStoryteller, getStorytellerConnections, type ELPhoto, type ELConnection } from '@/lib/media/el-photos'
import { getPiccServices } from '@/lib/services/el-services'
import { createServerSupabase } from '@/lib/supabase/client'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function deriveRole(s: ELStoryteller): string {
  const bg = (s.cultural_background || []).join(' · ')
  return bg ? `${bg} storyteller` : 'Bwgcolman storyteller'
}

function pickFeaturedQuote(quotes: ELQuote[]): ELQuote | null {
  if (!quotes.length) return null
  const sorted = [...quotes].sort((a, b) => (b.impact_score || 0) - (a.impact_score || 0))
  return sorted[0]
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  // Canonical first, then fall back to the location-filtered list for any
  // storytellers EL hasn't yet pinned to the PICC organisation.
  const canonical = await getPiccStorytellers({ limit: 500 })
  let name = canonical.find((t) => (t.slug || slugify(t.display_name)) === slug)?.display_name
  if (!name) {
    const fallback = await getPalmStorytellers()
    name = fallback.find((t) => slugify(t.display_name) === slug)?.display_name
  }
  if (!name) return { title: 'Voice — Palm Island Community Company' }
  return {
    title: `${name} — Voices · PICC`,
    description: `${name}'s profile in the Palm Island voices archive.`,
  }
}

export default async function StorytellerProfilePage({ params }: PageProps) {
  const { slug } = await params

  const [canonical, allStorytellers, allQuotes] = await Promise.all([
    getPiccStorytellers({ limit: 500 }),
    getPalmStorytellers(),
    getELQuotes({ limit: 1000 }),
  ])

  // Canonical EL roster (58) → fall back to the older location-filtered
  // list for any storytellers not yet pinned to the PICC organisation.
  const canonicalHit = canonical.find((t) => (t.slug || slugify(t.display_name)) === slug)
  let teller: ELStoryteller | undefined = allStorytellers.find(
    (t) => slugify(t.display_name) === slug,
  )
  // If canonical found one and the legacy list didn't, synthesise an
  // ELStoryteller-shaped record from the canonical row so the rest of
  // the page works unchanged.
  if (!teller && canonicalHit) {
    teller = {
      id: canonicalHit.id,
      display_name: canonicalHit.display_name,
      location: canonicalHit.location ?? '',
      profile_id: '',
      cultural_background: canonicalHit.cultural_background,
    } as unknown as ELStoryteller
  }
  if (!teller) notFound()

  const personQuotes = findQuotesForPerson(allQuotes, teller.display_name)
  const featured = pickFeaturedQuote(personQuotes)
  const piccSupabase = createServerSupabase()
  const [photos, stories, transcripts, serviceTags, piccServices, connections, bespokeArtResult] = await Promise.all([
    getPhotosForStoryteller(teller.id, 12),
    getStoriesForStoryteller(teller.id, { limit: 12, publishedOnly: true }),
    getTranscriptsForStoryteller(teller.id, { limit: 6 }),
    getServicesForStoryteller(teller.id),
    getPiccServices(),
    getStorytellerConnections(teller.id),
    // Approved community art tagged related:<storyteller-slug>. Same
    // pattern as /services/<slug> — pieces submitted via /share-art and
    // approved at /picc/design-system/submissions surface here.
    piccSupabase
      .from('media_files')
      .select('id, public_url, title, caption, attribution, metadata')
      .eq('page_context', 'community-art')
      .eq('is_public', true)
      .is('deleted_at', null)
      .contains('tags', [`related:${slug}`])
      .order('created_at', { ascending: false })
      .limit(12),
  ])
  const bespokeArt = (bespokeArtResult.data || []) as Array<{
    id: string
    public_url: string
    title: string | null
    caption: string | null
    attribution: string | null
    metadata: Record<string, any> | null
  }>

  // Map raw EL v2 service tags (snake_case editorial labels like
  // 'bwgcolman_healing') onto PICC's canonical service roster so each
  // tile can link to /services/<slug>. Unmapped tags still render —
  // they just don't get a link.
  const connectedServices = serviceTags.map((tag) => {
    const tagSlug = tag.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const match = piccServices.find((s) => {
      const nameSlug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      return s.slug === tagSlug || nameSlug === tagSlug || nameSlug.includes(tagSlug) || tagSlug.includes(s.slug)
    })
    return {
      tag,
      label: match?.name ?? tag.replace(/_/g, ' '),
      slug: match?.slug ?? null,
      category: match?.service_category ?? null,
    }
  })

  const portrait = photos[0] || null
  const galleryPhotos = photos.slice(1, 5)
  const role = deriveRole(teller)
  const isElder = (teller.cultural_background || []).some((b) =>
    /elder/i.test(b),
  )
  const eyebrow = isElder ? 'VOICES · ELDER · WITH CONSENT' : 'VOICES · COMMUNITY · WITH CONSENT'

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FBF8EE' }}>
      {/* 01 · HERO — portrait + name */}
      <HeroSection
        eyebrow={eyebrow}
        name={teller.display_name}
        role={role}
        portraitUrl={portrait?.url}
        location={teller.location}
      />

      {/* 02 · FEATURED QUOTE — sand bg */}
      {featured && (
        <FeaturedQuoteSection
          quote={featured.quote_text}
          consent="Recorded with consent · Validated · Empathy Ledger"
        />
      )}

      {/* 03 · PHOTO GALLERY — getPhotosForStoryteller */}
      {galleryPhotos.length > 0 && (
        <PhotoGallerySection
          firstName={teller.display_name.split(/\s+/)[0]}
          photos={galleryPhotos}
          totalCount={photos.length}
        />
      )}

      {/* 04 · Where she connects — service tiles derived from
          stories.related_service. Tiles link to /services/<slug>
          when the EL v2 service name maps to a known PICC service. */}
      {connectedServices.length > 0 && (
        <WhereSheConnectsSection
          firstName={teller.display_name.split(/\s+/)[0]}
          services={connectedServices}
        />
      )}

      {/* Stories — published stories from EL v2 attributed via storyteller_id */}
      {stories.length > 0 && (
        <StoriesSection
          firstName={teller.display_name.split(/\s+/)[0]}
          stories={stories}
        />
      )}

      {/* Conversations — transcripts attributed via storyteller_id */}
      {transcripts.length > 0 && (
        <ConversationsSection
          firstName={teller.display_name.split(/\s+/)[0]}
          transcripts={transcripts}
        />
      )}

      {/* Faces in frame — confirmed face matches in shared photographs */}
      {connections.length > 0 && (
        <AppearsWithSection
          firstName={teller.display_name.split(/\s+/)[0]}
          connections={connections}
          allStorytellers={allStorytellers}
        />
      )}

      {/* Bespoke art — approved community submissions tagged related:<slug> */}
      {bespokeArt.length > 0 && (
        <BespokeArtSection
          firstName={teller.display_name.split(/\s+/)[0]}
          art={bespokeArt}
        />
      )}

      {/* 05 · BACK TO VOICES WALL */}
      <BackToVoicesWall />
    </main>
  )
}

function HeroSection({
  eyebrow,
  name,
  role,
  portraitUrl,
  location,
}: {
  eyebrow: string
  name: string
  role: string
  portraitUrl?: string
  location?: string | null
}) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2" style={{ minHeight: 560 }}>
      <div className="relative bg-stone-200" style={{ minHeight: 360 }}>
        {portraitUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={portraitUrl}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'center top' }}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: C.sand }}
          >
            <span className="font-fraunces" style={{ color: C.ocean, fontSize: 96 }}>
              {name
                .split(/\s+/)
                .map((p) => p[0])
                .slice(0, 2)
                .join('')}
            </span>
          </div>
        )}
      </div>
      <div
        className="flex flex-col justify-end px-8 md:px-16 py-12 md:py-20"
        style={{ backgroundColor: C.shell }}
      >
        <div
          className="uppercase font-bold mb-3"
          style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
        >
          {eyebrow}
        </div>
        <h1
          className="font-fraunces font-bold leading-none mb-3"
          style={{ color: C.ocean, fontSize: 'clamp(48px, 7vw, 96px)' }}
        >
          {name}
        </h1>
        <div
          className="font-caveat italic mb-2"
          style={{ color: C.ochre, fontSize: 'clamp(20px, 2.4vw, 32px)' }}
        >
          {role}
        </div>
        {location && (
          <div
            className="italic"
            style={{ color: C.driftwood, fontSize: 12, letterSpacing: '0.05em' }}
          >
            {location}
          </div>
        )}
      </div>
    </section>
  )
}

function FeaturedQuoteSection({ quote, consent }: { quote: string; consent: string }) {
  return (
    <section
      className="px-6 md:px-12 py-20 md:py-28 text-center"
      style={{ backgroundColor: C.sand }}
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
        <div
          className="font-fraunces"
          style={{ color: C.turtleRed, fontSize: 48, lineHeight: 1, opacity: 0.7 }}
          aria-hidden
        >
          &ldquo;
        </div>
        <blockquote
          className="font-fraunces italic font-medium leading-snug"
          style={{ color: C.earth, fontSize: 'clamp(24px, 3vw, 42px)' }}
        >
          &ldquo;{quote}&rdquo;
        </blockquote>
        <div
          className="font-caveat italic"
          style={{ color: C.muted, fontSize: 18 }}
        >
          {consent}
        </div>
      </div>
    </section>
  )
}

function PhotoGallerySection({
  firstName,
  photos,
  totalCount,
}: {
  firstName: string
  photos: ELPhoto[]
  totalCount: number
}) {
  return (
    <section
      className="px-6 md:px-12 py-20 md:py-28"
      style={{ backgroundColor: '#FBF8EE' }}
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
        <div
          className="uppercase font-bold"
          style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
        >
          Photos · live from Empathy Ledger
        </div>
        <h2
          className="font-fraunces font-bold leading-tight"
          style={{ color: C.ocean, fontSize: 'clamp(32px, 4.5vw, 48px)' }}
        >
          Where {firstName} walks.
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {photos.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={p.id}
              src={p.url}
              alt={p.alt_text || `${firstName} — photo`}
              className="w-full h-[200px] md:h-[280px] object-cover rounded-md"
              loading="lazy"
            />
          ))}
        </div>
        <div
          className="font-caveat italic text-center"
          style={{ color: C.muted, fontSize: 18 }}
        >
          {totalCount} {totalCount === 1 ? 'photo' : 'photos'} linked to {firstName} in EL v2 · ordered most recent first · all consent-cleared
        </div>
      </div>
    </section>
  )
}

function WhereSheConnectsSection({
  firstName,
  services,
}: {
  firstName: string
  services: Array<{ tag: string; label: string; slug: string | null; category: string | null }>
}) {
  const categoryTints: Record<string, string> = {
    health: C.mangrove,
    family: C.ochre,
    justice: C.coral,
    youth: C.reef,
    economic: C.starGold,
    education: C.ocean,
    community: C.ocean,
  }

  return (
    <section
      className="px-6 md:px-12 py-20 md:py-28"
      style={{ backgroundColor: C.shell }}
    >
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
        <div
          className="uppercase font-bold"
          style={{ color: C.ocean, fontSize: 11, letterSpacing: '0.3em' }}
        >
          Connected across PICC
        </div>
        <h2
          className="font-fraunces font-bold leading-tight text-center"
          style={{ color: C.ocean, fontSize: 'clamp(28px, 4vw, 42px)' }}
        >
          Where {firstName} walks.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {services.map((s) => {
            const tint = (s.category && categoryTints[s.category]) || C.ocean
            const card = (
              <div
                className="rounded-md p-5 flex flex-col gap-2 h-full hover:shadow-md transition-shadow"
                style={{
                  backgroundColor: '#FBF8EE',
                  borderLeft: `3px solid ${tint}`,
                }}
              >
                {s.category && (
                  <div
                    className="uppercase font-bold"
                    style={{ color: tint, fontSize: 10, letterSpacing: '0.2em' }}
                  >
                    {s.category}
                  </div>
                )}
                <div
                  className="font-fraunces font-bold leading-tight capitalize"
                  style={{ color: C.ocean, fontSize: 18 }}
                >
                  {s.label}
                </div>
                {s.slug && (
                  <div
                    className="mt-auto text-xs uppercase font-bold tracking-widest"
                    style={{ color: tint }}
                  >
                    Visit service →
                  </div>
                )}
              </div>
            )
            return s.slug ? (
              <Link key={s.tag} href={`/services/${s.slug}`} className="block">
                {card}
              </Link>
            ) : (
              <div key={s.tag}>{card}</div>
            )
          })}
        </div>
        <p
          className="italic text-center"
          style={{ color: C.muted, fontSize: 13, maxWidth: 560 }}
        >
          From {firstName}&rsquo;s connections in Empathy Ledger — every service tagged on a story they&rsquo;ve shared.
        </p>
      </div>
    </section>
  )
}

function StoriesSection({
  firstName,
  stories,
}: {
  firstName: string
  stories: ELStory[]
}) {
  return (
    <section
      className="px-6 md:px-12 py-20 md:py-28"
      style={{ backgroundColor: C.shell }}
    >
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
        <div
          className="uppercase font-bold"
          style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
        >
          Stories · published in Empathy Ledger
        </div>
        <h2
          className="font-fraunces font-bold leading-tight text-center"
          style={{ color: C.ocean, fontSize: 'clamp(32px, 4.5vw, 48px)' }}
        >
          What {firstName} has shared.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {stories.map((story) => (
            <article
              key={story.id}
              className="rounded-md overflow-hidden flex flex-col"
              style={{ backgroundColor: '#FBF8EE' }}
            >
              {story.story_image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={story.story_image_url}
                  alt={story.title || ''}
                  className="w-full h-[200px] object-cover"
                  loading="lazy"
                />
              )}
              <div className="p-5 flex flex-col gap-2 flex-grow">
                {story.story_type && (
                  <div
                    className="uppercase font-bold"
                    style={{ color: C.ochre, fontSize: 10, letterSpacing: '0.2em' }}
                  >
                    {story.story_type.replace(/_/g, ' ')}
                  </div>
                )}
                <h3
                  className="font-fraunces font-bold leading-tight"
                  style={{ color: C.ocean, fontSize: 20 }}
                >
                  {story.title || 'Untitled story'}
                </h3>
                {(story.excerpt || story.summary) && (
                  <p
                    className="leading-relaxed"
                    style={{ color: C.driftwood, fontSize: 14 }}
                  >
                    {story.excerpt || story.summary}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ConversationsSection({
  firstName,
  transcripts,
}: {
  firstName: string
  transcripts: ELTranscript[]
}) {
  return (
    <section
      className="px-6 md:px-12 py-20 md:py-28"
      style={{ backgroundColor: '#FBF8EE' }}
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
        <div
          className="uppercase font-bold"
          style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
        >
          Conversations · long-form interviews
        </div>
        <h2
          className="font-fraunces font-bold leading-tight text-center"
          style={{ color: C.ocean, fontSize: 'clamp(28px, 4vw, 42px)' }}
        >
          Sitting with {firstName}.
        </h2>
        <div className="flex flex-col gap-6 w-full">
          {transcripts.map((t) => (
            <article
              key={t.id}
              className="rounded-md p-6 flex flex-col gap-3"
              style={{ backgroundColor: C.sand }}
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3
                  className="font-fraunces font-bold leading-tight flex-1"
                  style={{ color: C.ocean, fontSize: 22 }}
                >
                  {t.title || 'Untitled conversation'}
                </h3>
                {t.word_count != null && (
                  <span
                    className="uppercase whitespace-nowrap"
                    style={{ color: C.muted, fontSize: 10, letterSpacing: '0.15em' }}
                  >
                    {t.word_count.toLocaleString()} words
                  </span>
                )}
              </div>
              {t.ai_summary && (
                <p
                  className="leading-relaxed"
                  style={{ color: C.earth, fontSize: 14 }}
                >
                  {t.ai_summary}
                </p>
              )}
              {t.themes && t.themes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {t.themes.map((theme: string) => (
                    <span
                      key={theme}
                      className="uppercase"
                      style={{
                        color: C.turtleRed,
                        backgroundColor: 'rgba(139,26,26,0.08)',
                        fontSize: 10,
                        letterSpacing: '0.15em',
                        padding: '4px 10px',
                        borderRadius: 999,
                      }}
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function BespokeArtSection({
  firstName,
  art,
}: {
  firstName: string
  art: Array<{
    id: string
    public_url: string
    title: string | null
    caption: string | null
    attribution: string | null
    metadata: Record<string, any> | null
  }>
}) {
  return (
    <section
      className="px-6 md:px-12 py-20 md:py-28"
      style={{ backgroundColor: C.shell }}
    >
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
        <div
          className="uppercase font-bold"
          style={{ color: C.ochre, fontSize: 11, letterSpacing: '0.3em' }}
        >
          Community art · approved submissions
        </div>
        <h2
          className="font-fraunces font-bold leading-tight text-center"
          style={{ color: C.ocean, fontSize: 'clamp(28px, 4vw, 42px)' }}
        >
          Pieces about {firstName}.
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
          {art.map((piece) => (
            <figure
              key={piece.id}
              className="rounded-md overflow-hidden flex flex-col"
              style={{ backgroundColor: '#FBF8EE' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={piece.public_url}
                alt={piece.title || 'community art'}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <figcaption className="p-4 flex flex-col gap-1 flex-grow">
                {piece.title && (
                  <div
                    className="font-fraunces font-bold leading-tight"
                    style={{ color: C.ocean, fontSize: 16 }}
                  >
                    {piece.title}
                  </div>
                )}
                {piece.caption && (
                  <p
                    className="leading-relaxed line-clamp-2"
                    style={{ color: C.driftwood, fontSize: 12 }}
                  >
                    {piece.caption}
                  </p>
                )}
                <div
                  className="font-bold mt-auto pt-1"
                  style={{ color: C.ochre, fontSize: 11 }}
                >
                  {piece.attribution || 'Anonymous'}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
        <p
          className="italic text-center"
          style={{ color: C.muted, fontSize: 13, maxWidth: 520 }}
        >
          Drawings, icons, and artwork made by community members. Want to add yours?{' '}
          <Link href="/share-art" className="underline" style={{ color: C.ochre }}>
            Submit a piece
          </Link>
          .
        </p>
      </div>
    </section>
  )
}

function AppearsWithSection({
  firstName,
  connections,
  allStorytellers,
}: {
  firstName: string
  connections: ELConnection[]
  allStorytellers: ELStoryteller[]
}) {
  // Resolve EL ids to PICC voice slugs so each card links to its profile.
  const slugById = new Map(allStorytellers.map((s) => [s.id, slugify(s.display_name)]))
  return (
    <section
      className="px-6 md:px-12 py-20 md:py-28"
      style={{ backgroundColor: C.shell }}
    >
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
        <div
          className="uppercase font-bold"
          style={{ color: C.ochre, fontSize: 11, letterSpacing: '0.3em' }}
        >
          Faces in frame · confirmed by family
        </div>
        <h2
          className="font-fraunces font-bold leading-tight text-center"
          style={{ color: C.ocean, fontSize: 'clamp(28px, 4vw, 42px)' }}
        >
          {firstName} appears alongside.
        </h2>
        <p
          className="text-center leading-relaxed"
          style={{ color: C.driftwood, fontSize: 14, maxWidth: 560 }}
        >
          Storytellers named beside {firstName} in the same photographs. Pairs come from face matches confirmed by elders or family members. Click through to walk the line.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
          {connections.map((c) => {
            const slug = slugById.get(c.storyteller_id)
            const card = (
              <div
                className="flex items-center gap-3 p-3 rounded-md"
                style={{ backgroundColor: '#FBF8EE', border: '1px solid #E8DEC5' }}
              >
                {c.public_avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.public_avatar_url}
                    alt={c.display_name ?? ''}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    style={{ border: '1px solid #E8DEC5' }}
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex-shrink-0"
                    style={{ backgroundColor: C.sand, border: '1px solid #E8DEC5' }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div
                    className="font-fraunces font-bold leading-tight truncate"
                    style={{ color: C.ocean, fontSize: 14 }}
                  >
                    {c.display_name ?? '—'}
                  </div>
                  <div style={{ color: C.muted, fontSize: 11 }}>
                    {c.shared_photos} photo{c.shared_photos === 1 ? '' : 's'} together
                  </div>
                </div>
              </div>
            )
            return slug ? (
              <Link key={c.storyteller_id} href={`/voices/${slug}`} className="block hover:opacity-80 transition">
                {card}
              </Link>
            ) : (
              <div key={c.storyteller_id}>{card}</div>
            )
          })}
        </div>
        <p
          className="italic text-center"
          style={{ color: C.muted, fontSize: 12, maxWidth: 520 }}
        >
          Source: Empathy Ledger v2 · image_depicted_people · only confirmed face matches surface here.
        </p>
      </div>
    </section>
  )
}

function BackToVoicesWall() {
  return (
    <section
      className="px-6 py-16 text-center"
      style={{ backgroundColor: C.midnight }}
    >
      <Link
        href="/voices"
        className="inline-block uppercase font-bold hover:opacity-80 transition-opacity"
        style={{ color: C.starGold, fontSize: 11, letterSpacing: '0.3em' }}
      >
        &larr; Back to voices wall
      </Link>
    </section>
  )
}
