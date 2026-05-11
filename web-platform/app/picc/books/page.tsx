/**
 * /picc/books — Community books builder.
 *
 * Where young people, schools, services, and Elders co-create small
 * print-on-demand books. Pulls from the same sources as the Saltwater
 * Almanac (EL voices, /share-art submissions, photo library) but
 * assembles them into 6-16 page artefacts with a topic-led narrative.
 *
 * MVP: book templates list + draft books + how-it-works guide. Build
 * surface for actually assembling pages comes after Wednesday's
 * sign-off on the model.
 */
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { ArrowRight, ArrowLeft, BookOpen, Palette, Mic, Camera, Users, Sparkles, Plus, Lock } from 'lucide-react'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Community Books Builder · PICC Admin',
  description: 'Print-on-demand books co-created with young people, schools, services, and Elders.',
}

interface SubmissionCounts {
  artwork: number
  voices: number
  notes: number
  storiesOpen: number
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('no creds')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function getCounts(): Promise<SubmissionCounts> {
  try {
    const supabase = getSupabase()
    const [art, voices, notes, stories] = await Promise.all([
      supabase.from('media_files').select('id', { count: 'exact', head: true })
        .eq('page_context', 'community-art').is('deleted_at', null),
      supabase.from('extracted_quotes').select('id', { count: 'exact', head: true }),
      supabase.from('stories').select('id', { count: 'exact', head: true })
        .filter('metadata->>is_note', 'eq', 'true').is('deleted_at', null),
      supabase.from('stories').select('id', { count: 'exact', head: true })
        .eq('is_public', true).is('deleted_at', null),
    ])
    return {
      artwork: art.count || 0,
      voices: voices.count || 0,
      notes: notes.count || 0,
      storiesOpen: stories.count || 0,
    }
  } catch {
    return { artwork: 0, voices: 0, notes: 0, storiesOpen: 0 }
  }
}

// Book templates — 6 starter templates, each maps to existing data sources
interface BookTemplate {
  id: string
  title: string
  pages: string
  audience: string
  body: string
  sources: string[]
  accent: string
  cultural?: boolean
  innovative?: boolean
}

const TEMPLATES: BookTemplate[] = [
  {
    id: 'service-as-story',
    title: 'A service told as story',
    pages: '12 pages',
    audience: 'Kids in services · families',
    body: 'Pick one PICC service. Tell its story through a kid\'s eyes — what they see, who they meet, what happens. Photos from the service slot, voices from the staff and families, drawings from the kids in the service.',
    sources: ['EL service photos', 'staff quotes', '/share-art submissions', 'kids\' interviews'],
    accent: C.mangrove,
  },
  {
    id: 'elder-portrait',
    title: 'An Elder, a story',
    pages: '8-12 pages',
    audience: 'Schools · grandkids',
    body: 'A small book about one Elder — their journey, their Country, their voice, in their own words. Photos from EL, quotes from interviews, drawings from kids who know them.',
    sources: ['Elder profile from EL', 'Hearth quotes', 'family-approved photos'],
    accent: C.turtleRed,
    cultural: true,
  },
  {
    id: 'place-portrait',
    title: 'A place, our place',
    pages: '8-16 pages',
    audience: 'Schools · community',
    body: 'A book about one place on Palm Island — what it means, what happens there, who belongs to it. Hull River. Butler Bay. The Pier. The Hospital.',
    sources: ['archive photos', 'community quotes', 'Manbarra cultural notes'],
    accent: C.ocean,
    cultural: true,
  },
  {
    id: 'trip-journal',
    title: 'Trip storybook',
    pages: '8-12 pages',
    audience: 'Trip attendees + supporters',
    body: 'After every Elders trip — Atherton Tablelands, Hull River, Adnapa Homestead — assemble a small book of the journey. Photos, milestones, voices, what we learned.',
    sources: ['/picc/trips/[slug] milestones', 'trip photos', 'Elder quotes recorded on trip'],
    accent: C.starGold,
  },
  {
    id: 'kids-make',
    title: 'Kids make the book',
    pages: '12-16 pages',
    audience: 'School groups · youth services',
    body: 'A workshop format. Young people choose the topic, gather drawings (one per kid via /share-art), interview an Elder or a community member (recorded via /share-voice). Admin assembles. Every kid who contributes gets a free copy.',
    sources: ['/share-art batch from school', '/share-voice from kids', 'one Elder interview'],
    accent: C.ochre,
    innovative: true,
  },
  {
    id: 'monthly-snapshot',
    title: 'Monthly snapshot',
    pages: '4 pages',
    audience: 'Subscribers · staff',
    body: 'A 4-page artefact each month: latest stats, 3 voices, 1 anchor story, one photo from the month. Email + PDF + optional print run for staff noticeboards.',
    sources: ['/picc/action-items recent done', 'top 3 quotes by impact_score', '1 service highlight'],
    accent: C.reef,
    innovative: true,
  },
] as const

export default async function BooksPage() {
  const counts = await getCounts()

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <Link
        href="/picc/annual-report"
        className="inline-flex items-center gap-2 mb-6 text-sm hover:underline"
        style={{ color: C.turtleRed, letterSpacing: '0.15em' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Annual Report Command Center
      </Link>

      <header className="mb-10">
        <p
          className="font-bold uppercase mb-2"
          style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
        >
          Innovation track · community books
        </p>
        <h1
          className="font-fraunces font-bold mb-3"
          style={{ color: C.ocean, fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: 1.05 }}
        >
          Community books
        </h1>
        <p
          className="font-fraunces max-w-3xl"
          style={{ color: C.driftwood, fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: 1.55 }}
        >
          Print-on-demand books co-created with young people, schools, services, and Elders. Same
          sources as the Saltwater Almanac (EL voices, photos, artwork) but assembled into 6-16
          page topic-led artefacts. Kids own the making.
        </p>
      </header>

      {/* Why this matters */}
      <section
        className="mb-10 rounded-2xl p-7 md:p-8"
        style={{ background: `linear-gradient(135deg, ${C.ochre}11, ${C.turtleRed}11)`, border: `1px solid ${C.ochre}44` }}
      >
        <p
          className="font-bold uppercase mb-3"
          style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
        >
          Why this matters
        </p>
        <h2
          className="font-fraunces font-bold mb-4"
          style={{ color: C.ocean, fontSize: 'clamp(22px, 3vw, 32px)', lineHeight: 1.15 }}
        >
          Engagement isn&apos;t inclusion — it&apos;s authorship
        </h2>
        <p className="font-fraunces leading-relaxed" style={{ color: C.earth, fontSize: 17, lineHeight: 1.6 }}>
          The annual report tells the world what PICC did. Community books let the community tell
          itself who it is. Different artefact, different power. Books in kids&apos; hands become
          gifts, teaching tools, evidence — and the act of making is the engagement, not the act
          of being included.
        </p>
      </section>

      {/* Available source material */}
      <section className="mb-10">
        <SectionHeader
          eyebrow="What's already in the bank"
          title="Source material across PICC + EL"
          subtitle="Every book pulls from these. The more we capture, the richer every book becomes."
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SourceCount icon={Mic} label="Voices in EL" value={counts.voices} accent={C.ochre} link="/picc/voices" />
          <SourceCount icon={Palette} label="Artwork submissions" value={counts.artwork} accent={C.coral} link="/picc/inbox" />
          <SourceCount icon={BookOpen} label="Stories published" value={counts.storiesOpen} accent={C.mangrove} link="/picc/stories" />
          <SourceCount icon={Users} label="Field notes captured" value={counts.notes} accent={C.reef} link="/picc/notes" />
        </div>
      </section>

      {/* Templates */}
      <section className="mb-10">
        <SectionHeader
          eyebrow="6 starter templates"
          title="Pick a shape, assemble a book"
          subtitle="Each template names what data feeds it. Page builder ships next phase — for now, this is the catalogue."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TEMPLATES.map((t) => (
            <article
              key={t.id}
              className="rounded-xl p-6"
              style={{
                backgroundColor: '#FFFFFF',
                border: `1px solid ${C.border}`,
                borderLeftWidth: 4,
                borderLeftColor: t.accent,
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3
                  className="font-fraunces font-bold flex-1"
                  style={{ color: C.ocean, fontSize: 22, lineHeight: 1.2 }}
                >
                  {t.title}
                </h3>
                {t.innovative && (
                  <span
                    className="font-bold uppercase px-2 py-0.5 rounded flex-shrink-0"
                    style={{ backgroundColor: C.ochre + '22', color: C.ochre, fontSize: 9, letterSpacing: '0.2em' }}
                  >
                    New
                  </span>
                )}
                {t.cultural && (
                  <span
                    className="inline-flex items-center gap-1 font-bold uppercase px-2 py-0.5 rounded flex-shrink-0"
                    style={{ backgroundColor: C.turtleRed + '22', color: C.turtleRed, fontSize: 9, letterSpacing: '0.2em' }}
                    title="Cultural review required before print"
                  >
                    <Lock className="w-2.5 h-2.5" />
                    Cultural
                  </span>
                )}
              </div>

              <p className="font-fraunces leading-relaxed mb-4" style={{ color: C.driftwood, fontSize: 15 }}>
                {t.body}
              </p>

              <dl className="text-xs space-y-1.5 mb-4" style={{ color: C.muted }}>
                <div>
                  <dt className="inline font-bold uppercase mr-2" style={{ color: C.driftwood, letterSpacing: '0.15em' }}>Pages</dt>
                  <dd className="inline" style={{ color: C.earth }}>{t.pages}</dd>
                </div>
                <div>
                  <dt className="inline font-bold uppercase mr-2" style={{ color: C.driftwood, letterSpacing: '0.15em' }}>Audience</dt>
                  <dd className="inline" style={{ color: C.earth }}>{t.audience}</dd>
                </div>
              </dl>

              <p
                className="font-bold uppercase mb-2"
                style={{ color: t.accent, fontSize: 10, letterSpacing: '0.2em' }}
              >
                Pulls from
              </p>
              <ul className="space-y-1 text-xs mb-5" style={{ color: C.driftwood }}>
                {t.sources.map((s) => (
                  <li key={s} className="flex items-start gap-2">
                    <span style={{ color: t.accent }}>·</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-bold uppercase text-xs opacity-50 cursor-not-allowed"
                style={{ backgroundColor: t.accent, color: '#FFFFFF', letterSpacing: '0.15em' }}
                title="Coming next phase"
              >
                <Plus className="w-3.5 h-3.5" />
                Start a book
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* The making process */}
      <section className="mb-10">
        <SectionHeader
          eyebrow="The making process"
          title="How a community book gets made"
          subtitle="6 steps from topic to printed copy in hands."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { n: '01', title: 'Topic', body: 'Community group (school, service, family) picks a topic. Names the audience the book is for.' },
            { n: '02', title: 'Capture', body: 'Drawings via /share-art. Voices via /share-voice. Photos via EL admin. One Elder interview if relevant.' },
            { n: '03', title: 'Cultural review', body: 'Elder approval gate (same as the Almanac). Sorry Business protocol on every photo of a deceased person.' },
            { n: '04', title: 'Assemble', body: 'Admin uses Pencil component library + book template. 6-16 pages. Brand-consistent.' },
            { n: '05', title: 'Print', body: 'PDF export → print partner (Lulu / Blurb / local print) → physical books. Run sized to need: 5 to 200 copies.' },
            { n: '06', title: 'Hands', body: 'Every contributor gets a free copy. Extra copies for school library, service waiting rooms, gifts.' },
          ].map((step) => (
            <div
              key={step.n}
              className="rounded-xl p-5"
              style={{ backgroundColor: C.shell, border: `1px solid ${C.border}` }}
            >
              <p
                className="font-bold uppercase mb-2"
                style={{ color: C.muted, fontSize: 11, letterSpacing: '0.3em' }}
              >
                {step.n}
              </p>
              <h3
                className="font-fraunces font-bold mb-2"
                style={{ color: C.ocean, fontSize: 17, lineHeight: 1.2 }}
              >
                {step.title}
              </h3>
              <p className="font-fraunces" style={{ color: C.driftwood, fontSize: 14, lineHeight: 1.55 }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Status banner */}
      <section
        className="rounded-2xl p-6 flex items-start gap-3"
        style={{ background: C.shell, border: `1px solid ${C.ochre}44`, borderTop: `3px solid ${C.ochre}` }}
      >
        <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: C.ochre }} />
        <div>
          <p
            className="font-bold uppercase mb-1"
            style={{ color: C.ochre, fontSize: 11, letterSpacing: '0.3em' }}
          >
            Phase status
          </p>
          <p className="font-fraunces" style={{ color: C.earth, fontSize: 15, lineHeight: 1.55 }}>
            <strong>Phase 1 (today):</strong> templates catalogued · sources mapped · process documented.
            <br />
            <strong>Phase 2 (after Wednesday sign-off):</strong> page builder UI · drag-from-source assembly · PDF export · print-partner integration.
            <br />
            <strong>Phase 3 (next bi-monthly visit):</strong> first community book pilot with one school. Kids make. We print.
          </p>
        </div>
      </section>
    </div>
  )
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <p
        className="font-bold uppercase mb-2"
        style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
      >
        {eyebrow}
      </p>
      <h2
        className="font-fraunces font-bold"
        style={{ color: C.ocean, fontSize: 'clamp(24px, 3vw, 32px)', lineHeight: 1.15 }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="font-fraunces mt-2"
          style={{ color: C.driftwood, fontSize: 15, lineHeight: 1.55 }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}

function SourceCount({
  icon: Icon, label, value, accent, link,
}: {
  icon: any; label: string; value: number; accent: string; link: string
}) {
  return (
    <Link
      href={link}
      className="block rounded-xl p-4 hover:shadow-sm transition-shadow"
      style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}`, borderTopWidth: 3, borderTopColor: accent }}
    >
      <Icon className="w-5 h-5 mb-3" style={{ color: accent }} />
      <p className="font-fraunces font-bold leading-none mb-2" style={{ color: C.ocean, fontSize: 26 }}>
        {value}
      </p>
      <p
        className="font-bold uppercase"
        style={{ color: accent, fontSize: 10, letterSpacing: '0.25em' }}
      >
        {label}
      </p>
    </Link>
  )
}
