/**
 * /get-involved — single-page hub gathering every way someone can
 * contribute to the Palm Island archive.
 *
 * Replaces the scattered footer links and isolated /sign-the-vision +
 * /share-note. One CTA surface for the CEO walk-through and any
 * external visitor who wants a path in.
 *
 * Five lanes:
 *   1. Sign the 20-year vision  — live signature counter
 *   2. Share a note             — short reflection (anyone)
 *   3. Share your story         — interview / record (consent flow)
 *   4. Add a photo              — community archive contribution
 *   5. Partner / fund / volunteer — direct contact paths
 */
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/client'
import { C, SECTION_COLOURS } from '@/components/annual-report/2024-25/almanac/tokens'

import { ogMeta } from '@/lib/seo/og'

export const metadata = ogMeta({
  title: 'Get involved — Palm Island Community Company',
  description:
    'Five ways to add your voice, your photo, your story, or your partnership to the Palm Island archive.',
  path: '/get-involved',
})

export const dynamic = 'force-dynamic'
export const revalidate = 600

interface Lane {
  key: string
  num: string
  title: string
  blurb: string
  body: string
  cta: { label: string; href: string }
  secondary?: { label: string; href: string }
  colour: string
  meta?: string
}

export default async function GetInvolvedPage() {
  const supabase = createServerSupabase()

  // Live signature count for the 20-year vision lane
  const { count: visionCount } = await supabase
    .from('community_visions')
    .select('id', { count: 'exact', head: true })
    .eq('is_approved', true)

  // Public note count (community_story · is_note)
  const { count: noteCount } = await supabase
    .from('stories')
    .select('id', { count: 'exact', head: true })
    .eq('is_public', true)
    .eq('category', 'note')

  // Story count (any public story not a note)
  const { count: storyCount } = await supabase
    .from('stories')
    .select('id', { count: 'exact', head: true })
    .eq('is_public', true)

  const lanes: Lane[] = [
    {
      key: 'vision',
      num: '01',
      title: 'Sign the 20-year vision',
      blurb: 'A short stand for what Palm Island will be in 2045. Your name, your reason, public on the canvas.',
      body:
        'Twenty years in, the community is naming what comes next. Add your reason and your name to the open canvas. Read every signature that came before you.',
      cta: { label: 'Sign the canvas', href: '/sign-the-vision' },
      secondary: { label: 'Read all visions', href: '/voices' },
      colour: SECTION_COLOURS.governance,
      meta: visionCount != null ? `${visionCount.toLocaleString()} signed` : undefined,
    },
    {
      key: 'note',
      num: '02',
      title: 'Share a note',
      blurb: 'A short observation, a thought, a reaction. No recording, no title, no commitment.',
      body:
        'A single paragraph is plenty. We review every note before publishing. Your name is optional. Anonymous notes are welcome — they still count, and Elders read them.',
      cta: { label: 'Add a note', href: '/share-note' },
      secondary: { label: 'See published notes', href: '/voices' },
      colour: SECTION_COLOURS.educationCommunity,
      meta: noteCount != null ? `${noteCount.toLocaleString()} notes published` : undefined,
    },
    {
      key: 'story',
      num: '03',
      title: 'Share your story',
      blurb: 'A longer voice — interview, record, or write. Cultural protocols and Elder review built in.',
      body:
        'For longer narratives, we offer a guided flow: voice, photo, or written. Every storyteller chooses what is public, what stays in the archive, and how they’re named. Cassie, Narelle, or Rachel will be in touch within a week.',
      cta: { label: 'Start a story', href: '/share-note?type=story' },
      secondary: { label: 'Read public stories', href: '/stories' },
      colour: SECTION_COLOURS.healthWellbeing,
      meta: storyCount != null ? `${storyCount.toLocaleString()} stories in the archive` : undefined,
    },
    {
      key: 'photo',
      num: '04',
      title: 'Add a photo',
      blurb: 'Family photos, archive photos, today’s photos — every image with consent helps the wall grow.',
      body:
        'Email a photo with a sentence about who, where, and when. We tag, store with cultural protocols, and surface across the site. Elders review anything that needs cultural authority.',
      cta: { label: 'Email a photo', href: 'mailto:archive@picc.com.au?subject=Photo%20for%20the%20archive' },
      secondary: { label: 'See the photo wall', href: '/voices' },
      colour: SECTION_COLOURS.justiceSafety,
    },
    {
      key: 'partner',
      num: '05',
      title: 'Partner · fund · volunteer',
      blurb: 'Funders, government, peak bodies, neighbouring communities, individuals — pathways for each.',
      body:
        'PICC partners with health services, education providers, justice agencies, peak bodies, and community-controlled organisations across Queensland and the country. If you want to fund work, partner on delivery, or volunteer time on island, we have a direct path.',
      cta: { label: 'Email Rachel + Cassie', href: 'mailto:info@picc.com.au?subject=Partner%20with%20PICC' },
      secondary: { label: 'See services', href: '/services' },
      colour: SECTION_COLOURS.economic,
    },
  ]

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FBF8EE' }}>
      {/* Hero */}
      <section
        className="px-6 md:px-12 pt-16 md:pt-20 pb-10"
        style={{ backgroundColor: C.shell }}
      >
        <div className="max-w-6xl mx-auto">
          <div
            className="uppercase font-bold mb-3"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            Get involved
          </div>
          <h1
            className="font-fraunces font-bold leading-[1.05] mb-5"
            style={{ color: C.ocean, fontSize: 'clamp(40px, 7vw, 84px)' }}
          >
            Five ways in.
          </h1>
          <p
            className="font-fraunces max-w-2xl"
            style={{ color: C.driftwood, fontSize: 20, lineHeight: 1.5 }}
          >
            Add your voice, your photo, your story, or your partnership to
            the Palm Island archive. Every contribution is consented at
            the source and held with cultural protocols.
          </p>

          {/* Quick-jump pills */}
          <div className="mt-8 flex flex-wrap gap-2">
            {lanes.map((l) => (
              <a
                key={l.key}
                href={`#${l.key}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border hover:shadow-sm transition"
                style={{
                  borderColor: l.colour,
                  color: l.colour,
                  backgroundColor: '#fff',
                  letterSpacing: '0.15em',
                }}
              >
                <span style={{ opacity: 0.6 }}>{l.num}</span>
                {l.title.split(' · ')[0]}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Lanes */}
      <section className="px-6 md:px-12 py-12 md:py-16">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          {lanes.map((l, idx) => (
            <article
              key={l.key}
              id={l.key}
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: idx % 2 === 0 ? '#fff' : C.shell,
                border: `1px solid ${l.colour}33`,
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                {/* Side strip */}
                <div
                  className="md:col-span-4 lg:col-span-3 p-8 flex flex-col justify-between"
                  style={{ backgroundColor: l.colour + '15', borderRight: `1px solid ${l.colour}22` }}
                >
                  <div>
                    <div
                      className="font-mono"
                      style={{ color: l.colour, fontSize: 12, letterSpacing: '0.2em' }}
                    >
                      {l.num}
                    </div>
                    <div
                      className="mt-3 uppercase font-bold"
                      style={{ color: l.colour, fontSize: 10, letterSpacing: '0.3em' }}
                    >
                      Lane
                    </div>
                  </div>
                  {l.meta && (
                    <div
                      className="font-fraunces font-bold leading-tight mt-6"
                      style={{ color: l.colour, fontSize: 28 }}
                    >
                      {l.meta}
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="md:col-span-8 lg:col-span-9 p-8 md:p-10">
                  <h2
                    className="font-fraunces font-bold leading-tight mb-3"
                    style={{ color: C.ocean, fontSize: 'clamp(28px, 4vw, 40px)' }}
                  >
                    {l.title}
                  </h2>
                  <p
                    className="font-fraunces mb-4 max-w-2xl"
                    style={{ color: C.driftwood, fontSize: 19, lineHeight: 1.5 }}
                  >
                    {l.blurb}
                  </p>
                  <p
                    className="text-sm max-w-2xl mb-6"
                    style={{ color: C.driftwood, lineHeight: 1.65 }}
                  >
                    {l.body}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={l.cta.href}
                      className="px-5 py-3 rounded-md font-semibold hover:opacity-90 transition"
                      style={{ backgroundColor: l.colour, color: '#fff', fontSize: 13 }}
                    >
                      {l.cta.label} →
                    </Link>
                    {l.secondary && (
                      <Link
                        href={l.secondary.href}
                        className="px-5 py-3 rounded-md font-semibold hover:shadow-sm transition border"
                        style={{
                          borderColor: l.colour,
                          color: l.colour,
                          backgroundColor: '#fff',
                          fontSize: 13,
                        }}
                      >
                        {l.secondary.label}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Cultural footer */}
      <section
        className="px-6 md:px-12 py-12"
        style={{ backgroundColor: C.shell, borderTop: `1px solid ${C.border}` }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="uppercase font-bold mb-3"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            How we hold what you share
          </div>
          <p
            className="font-fraunces"
            style={{ color: C.driftwood, fontSize: 17, lineHeight: 1.6 }}
          >
            Every voice, photo and story is held under Manbarra and
            Bwgcolman cultural protocols. Elder review applies to anything
            with cultural authority. You can withdraw at any time. Nothing
            is sold, nothing is used outside the platform without your
            written go-ahead.
          </p>
        </div>
      </section>
    </main>
  )
}
