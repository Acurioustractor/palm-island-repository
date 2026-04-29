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
import {
  getPalmStorytellers,
  getELQuotes,
  findQuotesForPerson,
  getStoriesForStoryteller,
  getTranscriptsForStoryteller,
  type ELStoryteller,
  type ELQuote,
  type ELStory,
  type ELTranscript,
} from '@/lib/empathy-ledger/el-server'
import { getPhotosForStoryteller, type ELPhoto } from '@/lib/media/el-photos'
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
  const all = await getPalmStorytellers()
  const teller = all.find((t) => slugify(t.display_name) === slug)
  if (!teller) return { title: 'Voice — Palm Island Community Company' }
  return {
    title: `${teller.display_name} — Voices · PICC`,
    description: `${teller.display_name}'s profile in the Palm Island voices archive.`,
  }
}

export default async function StorytellerProfilePage({ params }: PageProps) {
  const { slug } = await params

  const [allStorytellers, allQuotes] = await Promise.all([
    getPalmStorytellers(),
    getELQuotes({ limit: 1000 }),
  ])

  const teller = allStorytellers.find((t) => slugify(t.display_name) === slug)
  if (!teller) notFound()

  const personQuotes = findQuotesForPerson(allQuotes, teller.display_name)
  const featured = pickFeaturedQuote(personQuotes)
  const [photos, stories, transcripts] = await Promise.all([
    getPhotosForStoryteller(teller.id, 12),
    getStoriesForStoryteller(teller.id, { limit: 12, publishedOnly: true }),
    getTranscriptsForStoryteller(teller.id, { limit: 6 }),
  ])

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

      {/* 04 · Where she connects — only if we can derive (omitted when no data) */}

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
