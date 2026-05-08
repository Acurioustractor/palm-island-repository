/**
 * /stories — public index of every Palm Island story.
 *
 * 92 stories live in the PICC archive; 74 are public. They span:
 *   - community_story    — general community conversations (52)
 *   - challenge_overcome — flood + hardship narratives    (17)
 *   - elder_wisdom       — Elder voices                    (11)
 *   - service_success    — service-in-action conversations  (8)
 *   - other              — achievement / editorial          (4)
 *
 * Until now these were only reachable by direct slug. This index
 * surfaces them grouped by type, with story cards linking to
 * /stories/[id] for the full read.
 */
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/client'
import { getPalmStorytellers } from '@/lib/empathy-ledger/el-server'
import { C, SECTION_COLOURS } from '@/components/annual-report/2024-25/almanac/tokens'
import StoriesGrid, { type StoryCard, type TypeKey } from './StoriesGrid'

export const metadata = {
  title: 'Stories — Palm Island Community Company',
  description:
    'Every public story from Palm Island — community conversations, resilience narratives, elder wisdom, and service-in-action stories.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 1800

export const TYPE_LABELS: Record<TypeKey, { label: string; colour: string; blurb: string }> = {
  all: { label: 'All', colour: C.ocean, blurb: 'Every public story.' },
  community_story: {
    label: 'Community',
    colour: SECTION_COLOURS.educationCommunity,
    blurb: 'Voices from across the island — what people see, do, hold close.',
  },
  challenge_overcome: {
    label: 'Resilience',
    colour: SECTION_COLOURS.justiceSafety,
    blurb: 'Flood stories. Hardship narratives. The flood and the rebuild are the same story.',
  },
  elder_wisdom: {
    label: 'Elder wisdom',
    colour: SECTION_COLOURS.governance,
    blurb: 'Cultural authority. Named, consented, kept close.',
  },
  service: {
    label: 'Service in action',
    colour: SECTION_COLOURS.healthWellbeing,
    blurb: 'How services land — told by the people who deliver them and the people they serve.',
  },
  other: {
    label: 'Other',
    colour: SECTION_COLOURS.economic,
    blurb: 'Achievements, editorial, traditional knowledge.',
  },
}

function classifyType(t: string | null | undefined): TypeKey {
  switch ((t || '').toLowerCase()) {
    case 'community_story': return 'community_story'
    case 'challenge_overcome': return 'challenge_overcome'
    case 'elder_wisdom': return 'elder_wisdom'
    case 'service_success':
    case 'service_story': return 'service'
    default: return 'other'
  }
}

interface StoryRow {
  id: string
  title: string | null
  excerpt: string | null
  summary: string | null
  story_type: string | null
  storyteller_id: string | null
  featured_image_url: string | null
  is_featured: boolean | null
  story_date: string | null
  published_at: string | null
  service_id: string | null
}

export default async function StoriesIndexPage() {
  const supabase = createServerSupabase()

  const [{ data: storiesData }, storytellers] = await Promise.all([
    supabase
      .from('stories')
      .select('id, title, excerpt, summary, story_type, storyteller_id, featured_image_url, is_featured, story_date, published_at, service_id')
      .eq('is_public', true)
      .order('is_featured', { ascending: false, nullsFirst: false })
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('story_date', { ascending: false, nullsFirst: false })
      .limit(200),
    getPalmStorytellers().catch(() => []),
  ])

  const stories = (storiesData || []) as StoryRow[]

  const nameById = new Map<string, string>()
  for (const s of storytellers) {
    if (s.id && s.display_name) nameById.set(s.id, s.display_name)
  }

  const cards: StoryCard[] = stories.map((s) => ({
    id: s.id,
    title: s.title || 'Untitled',
    excerpt: (s.excerpt || s.summary || '').slice(0, 220) || 'Tap to read this story.',
    type: classifyType(s.story_type),
    typeLabel: TYPE_LABELS[classifyType(s.story_type)].label,
    typeColour: TYPE_LABELS[classifyType(s.story_type)].colour,
    storyteller_name: s.storyteller_id ? nameById.get(s.storyteller_id) || null : null,
    featured_image_url: s.featured_image_url,
    is_featured: !!s.is_featured,
    date: s.published_at || s.story_date,
  }))

  const counts: Record<TypeKey, number> = {
    all: cards.length,
    community_story: 0,
    challenge_overcome: 0,
    elder_wisdom: 0,
    service: 0,
    other: 0,
  }
  for (const c of cards) counts[c.type] = (counts[c.type] || 0) + 1

  const featured = cards.filter((c) => c.is_featured).slice(0, 3)

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FBF8EE' }}>
      <section className="px-6 md:px-12 pt-16 md:pt-20 pb-8" style={{ backgroundColor: C.shell }}>
        <div className="max-w-6xl mx-auto">
          <div
            className="uppercase font-bold mb-3"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            Community archive · {cards.length} stories
          </div>
          <h1
            className="font-fraunces font-bold leading-[1.05] mb-5"
            style={{ color: C.ocean, fontSize: 'clamp(40px, 7vw, 84px)' }}
          >
            Every story from Palm Island.
          </h1>
          <p
            className="font-fraunces max-w-2xl mb-6"
            style={{ color: C.driftwood, fontSize: 20, lineHeight: 1.5 }}
          >
            Community conversations, flood-and-rebuild narratives, elder wisdom, services in action — the full archive of voices, named and consented at the source.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold uppercase tracking-widest">
            <Link href="/voices" className="hover:opacity-80" style={{ color: C.ochre, letterSpacing: '0.15em' }}>
              Voice wall →
            </Link>
            <Link href="/voices/themes" className="hover:opacity-80" style={{ color: C.ochre, letterSpacing: '0.15em' }}>
              Themes →
            </Link>
            <Link href="/voices/network" className="hover:opacity-80" style={{ color: C.ochre, letterSpacing: '0.15em' }}>
              Connection map →
            </Link>
            <Link href="/elders" className="hover:opacity-80" style={{ color: C.ochre, letterSpacing: '0.15em' }}>
              Elders →
            </Link>
            <Link href="/share-note" className="hover:opacity-80" style={{ color: C.ochre, letterSpacing: '0.15em' }}>
              Add yours →
            </Link>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="px-6 md:px-12 py-12">
          <div className="max-w-6xl mx-auto">
            <div
              className="uppercase font-bold mb-4"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Featured · editor&apos;s pick
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featured.map((c) => (
                <Link
                  key={c.id}
                  href={`/stories/${c.id}`}
                  className="group block rounded-2xl overflow-hidden border bg-white hover:shadow-md transition"
                  style={{ borderColor: C.border }}
                >
                  {c.featured_image_url ? (
                    <div className="aspect-[16/10] relative" style={{ backgroundColor: C.shell }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.featured_image_url}
                        alt={c.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/10] flex items-center justify-center p-4 text-center" style={{ backgroundColor: c.typeColour }}>
                      <div className="font-fraunces font-bold leading-tight" style={{ color: '#fff', fontSize: 22 }}>
                        {c.title}
                      </div>
                    </div>
                  )}
                  <div className="p-5">
                    <span
                      className="inline-block text-[10px] uppercase font-bold tracking-[0.2em] px-2 py-0.5 rounded-full mb-2"
                      style={{ backgroundColor: c.typeColour + '22', color: c.typeColour, letterSpacing: '0.15em' }}
                    >
                      {c.typeLabel}
                    </span>
                    <h3 className="font-fraunces font-bold leading-tight mb-2" style={{ color: C.ocean, fontSize: 20 }}>
                      {c.title}
                    </h3>
                    <p className="text-sm" style={{ color: C.driftwood, lineHeight: 1.55 }}>
                      {c.excerpt}
                    </p>
                    {c.storyteller_name && (
                      <p className="text-xs mt-3" style={{ color: C.driftwood }}>
                        — {c.storyteller_name}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <StoriesGrid cards={cards} typeLabels={TYPE_LABELS} counts={counts} />
    </main>
  )
}
