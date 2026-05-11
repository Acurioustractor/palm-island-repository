/**
 * /picc/system — the theory of change for the always-on annual report.
 *
 * One page that explains how every piece of the platform fits together:
 * Five flows (Capture → Review → Curate → Publish → Reflect), four
 * stakeholders (Elders · Kids · Innovation · 20-year dreams), and the
 * bi-monthly cadence loop that keeps it alive.
 *
 * Designed to print as a single A4 explainer too — which is why the
 * structure is dense, scannable, narrative-led rather than dashboard-led.
 */
import Link from 'next/link'
import { ArrowRight, ExternalLink, Mic, Lock, Sparkles, Send, RefreshCw, Users, Baby, Lightbulb, Compass } from 'lucide-react'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export const metadata = {
  title: 'The System · how it all works · PICC Admin',
  description: 'Theory of change for the always-on annual report. Five flows, four stakeholders, one loop.',
}

interface FlowSurface {
  label: string
  href: string
  external?: boolean
}

interface Flow {
  n: string
  icon: typeof Mic
  title: string
  accent: string
  body: string
  surfaces: FlowSurface[]
}

const FLOWS: Flow[] = [
  {
    n: '01',
    icon: Mic,
    title: 'Capture',
    accent: C.ochre,
    body: 'A meeting recorded. A photo taken. A quote extracted. A drawing submitted via /share-art. A note jotted in the field. Every fragment of community life lands in one of these channels.',
    surfaces: [
      { label: 'Process meeting', href: '/picc/meetings/process' },
      { label: 'Share voice', href: '/share-voice' },
      { label: 'Share art', href: '/share-art' },
      { label: 'Share note', href: '/share-note' },
      { label: 'EL photo admin', href: 'https://picc.empathyledger.com/admin/photos', external: true },
    ],
  },
  {
    n: '02',
    icon: Lock,
    title: 'Review',
    accent: C.turtleRed,
    body: 'Cultural protocol gates. Elder approval on quotes from sensitive meetings. Sorry Business protocol on photos. Consent stamps on every named person. The 403 from /api/interviews/analyze IS the protocol — code that refuses to publish until Elders have signed off.',
    surfaces: [
      { label: 'Elders meetings (review)', href: '/picc/elders/meetings' },
      { label: 'Inbox', href: '/picc/inbox' },
      { label: 'Action items needing approval', href: '/picc/action-items?status=open' },
    ],
  },
  {
    n: '03',
    icon: Sparkles,
    title: 'Curate',
    accent: C.starGold,
    body: 'AI extracts themes + action items + quotable lines. Editors pin the best to spreads, services, projects. Themes-of-the-year curation lifts what the community is talking about. Kinship view shows who connects to whom.',
    surfaces: [
      { label: 'Featured themes', href: '/picc/themes' },
      { label: 'Voices sprint', href: '/picc/almanac/voices' },
      { label: 'Almanac checklist', href: '/picc/almanac/checklist' },
      { label: 'Family connections', href: '/picc/kinship' },
    ],
  },
  {
    n: '04',
    icon: Send,
    title: 'Publish',
    accent: C.ocean,
    body: 'The web report (/annual-report/2024-25/almanac) updates the moment data lands. Print on demand: Saltwater Almanac, funder cuts, community pamphlets, kids\' books, trip storybooks, monthly snapshots. Same data, different shapes for different audiences.',
    surfaces: [
      { label: 'Live almanac', href: '/annual-report/2024-25/almanac' },
      { label: 'Annual Report Hub', href: '/picc/annual-report' },
      { label: 'Community Books', href: '/picc/books' },
    ],
  },
  {
    n: '05',
    icon: RefreshCw,
    title: 'Reflect',
    accent: C.mangrove,
    body: 'Every visit opens with the action items ledger: "here\'s what we said, here\'s what got done." Community sees its own signal. The annual report itself is the longest-form reflection — but it\'s only the loudest moment in a continuous practice.',
    surfaces: [
      { label: 'Action items board', href: '/picc/action-items/board' },
      { label: 'Trips planning', href: '/picc/trips/atherton-tablelands-2026' },
      { label: 'Insights', href: '/picc/insights' },
    ],
  },
]

const STAKEHOLDERS = [
  {
    icon: Users,
    title: 'Elders',
    accent: C.turtleRed,
    body: 'Cultural authority. Country knowledge. The voices that ground every story. Every Elder has profile + voice + family connections in EL. Every Elder controls what publishes.',
    proof: 'Elders meeting captured 16 Feb 2026 → 9 action items tracked → cultural review gate active on all extracted quotes.',
    href: '/elders',
  },
  {
    icon: Baby,
    title: 'Kids',
    accent: C.ochre,
    body: 'Future. Makers. The owners of the next 20 years. They contribute drawings, voices, stories — and they make their own books. The act of authorship is the engagement.',
    proof: '/share-art submission flow live · 6 community-book templates ready · Phase 3 pilot: first kids\' book with one school, next visit.',
    href: '/picc/books',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    accent: C.reef,
    body: 'Bwgcolman Way. Delegated Authority. Always-on report. Community books. Sovereignty in the design itself: the platform is not just for the community, it\'s shaped by them.',
    proof: 'PICC is first ATSICCO live with Part 2A delegated authority · always-on report is novel for the sector · community books are a generative format.',
    href: '/innovation',
  },
  {
    icon: Compass,
    title: '20-year vision',
    accent: C.ocean,
    body: 'Year 17 of a 20-year story. Six community visions. Three forward commitments. Three urgent asks. The platform makes the long arc visible — not as a destination but as a practice that compounds.',
    proof: '197 staff · $23.4M revenue · 28 services · 122 photos consented · 870 quotes captured · 58 storytellers in EL.',
    href: '/20-years',
  },
] as const

export default function SystemPage() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <header className="mb-12">
        <p
          className="font-bold uppercase mb-2"
          style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
        >
          Theory of change · how it all works
        </p>
        <h1
          className="font-fraunces font-bold mb-4"
          style={{ color: C.ocean, fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: 1.05 }}
        >
          The annual report doesn&apos;t get written. It gets captured.
        </h1>
        <p
          className="font-fraunces max-w-3xl"
          style={{ color: C.driftwood, fontSize: 'clamp(17px, 2vw, 22px)', lineHeight: 1.55 }}
        >
          One platform. Five flows. Four stakeholders. One loop. Every story PICC tells starts with
          a moment captured in the community, passes through cultural protocol, lands in a place the
          community owns, and gets reflected back — continuously.
        </p>
      </header>

      {/* The headline equation */}
      <section
        className="mb-14 rounded-2xl p-8 md:p-10"
        style={{ background: `linear-gradient(135deg, ${C.midnight}, ${C.earth})`, color: '#FFFFFF' }}
      >
        <p
          className="font-bold uppercase mb-3"
          style={{ color: C.ochre, fontSize: 11, letterSpacing: '0.3em' }}
        >
          The shift
        </p>
        <h2
          className="font-fraunces font-bold mb-6"
          style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', lineHeight: 1.2 }}
        >
          Old reports were screenshots in time. This one keeps moving.
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="font-bold uppercase mb-2" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, letterSpacing: '0.3em' }}>
              Old model
            </p>
            <ul className="font-fraunces space-y-2" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, lineHeight: 1.55 }}>
              <li>Annual writing event</li>
              <li>One audience, one shape (PDF)</li>
              <li>Static at publication moment</li>
              <li>Funder-facing — performs upward</li>
              <li>Community sees themselves once a year</li>
            </ul>
          </div>
          <div>
            <p className="font-bold uppercase mb-2" style={{ color: C.ochre, fontSize: 10, letterSpacing: '0.3em' }}>
              New model
            </p>
            <ul className="font-fraunces space-y-2" style={{ color: '#FFFFFF', fontSize: 16, lineHeight: 1.55 }}>
              <li>Continuous capture practice</li>
              <li>Five audience cuts + community books on demand</li>
              <li>Always-on web; print is just a snapshot</li>
              <li>Community-owned — protocol baked in</li>
              <li>Community sees itself every meeting, every visit</li>
            </ul>
          </div>
        </div>
      </section>

      {/* THE FIVE FLOWS */}
      <section className="mb-14">
        <SectionHeader
          eyebrow="Five flows"
          title="Capture → Review → Curate → Publish → Reflect"
          subtitle="Every piece of community life moves through these five stations. None of them are done by the editor alone — each is a community + tools + protocol relationship."
        />
        <div className="space-y-4">
          {FLOWS.map((flow) => (
            <FlowCard key={flow.n} flow={flow} />
          ))}
        </div>
      </section>

      {/* THE LOOP */}
      <section
        className="mb-14 rounded-2xl p-8 md:p-10"
        style={{ background: `linear-gradient(135deg, ${C.ochre}11, ${C.turtleRed}11)`, border: `1px solid ${C.ochre}44` }}
      >
        <p
          className="font-bold uppercase mb-3"
          style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
        >
          The loop
        </p>
        <h2
          className="font-fraunces font-bold mb-4"
          style={{ color: C.ocean, fontSize: 'clamp(24px, 3.5vw, 36px)', lineHeight: 1.15 }}
        >
          Bi-monthly cadence makes the system alive
        </h2>
        <p className="font-fraunces leading-relaxed mb-6" style={{ color: C.earth, fontSize: 17, lineHeight: 1.6 }}>
          Every two months, Ben is on the island. Each visit feeds the system: an Elders Group meeting captured →
          interviews with PICC staff and community → kids&apos; workshop session for a book →
          photographer captures pending slots → Elders review last visit&apos;s quotes for approval. The next
          visit opens with: <em>here&apos;s what we said last time. Here&apos;s what got done.</em>
        </p>
        <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: C.driftwood }}>
          <span className="font-bold uppercase" style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.2em' }}>The rhythm:</span>
          <span>visit → capture → review → curate → publish → reflect → next visit opens with the receipts</span>
        </div>
      </section>

      {/* FOUR STAKEHOLDERS */}
      <section className="mb-14">
        <SectionHeader
          eyebrow="Four stakeholders"
          title="Who this serves"
          subtitle="The system is generative across four constituencies. Each gets a different shape of the same story."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {STAKEHOLDERS.map((s) => (
            <StakeholderCard key={s.title} stakeholder={s} />
          ))}
        </div>
      </section>

      {/* WHERE IT ALL LANDS */}
      <section className="mb-14">
        <SectionHeader
          eyebrow="Where it all lands"
          title="The surfaces, sequenced"
          subtitle="One platform. Many doors. Same data behind every door."
        />
        <div className="rounded-2xl p-6 md:p-8" style={{ backgroundColor: C.shell, border: `1px solid ${C.border}` }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            {[
              { label: 'Always-on web report', href: '/annual-report/2024-25/almanac', accent: C.ocean },
              { label: 'Annual Report Hub (admin)', href: '/picc/annual-report', accent: C.ocean },
              { label: 'Community Books builder', href: '/picc/books', accent: C.ochre },
              { label: 'Meetings hub (capture)', href: '/picc/meetings', accent: C.turtleRed },
              { label: 'Action items ledger', href: '/picc/action-items', accent: C.mangrove },
              { label: 'Trips planning', href: '/picc/trips', accent: C.starGold },
              { label: 'Elders (public)', href: '/elders', accent: C.turtleRed },
              { label: 'Family connections', href: '/elders/family', accent: C.ochre },
              { label: 'Voices wall', href: '/voices', accent: C.ochre },
              { label: 'Stories', href: '/stories', accent: C.reef },
              { label: 'Bwgcolman Way case study', href: '/bwgcolman', accent: C.turtleRed },
              { label: '20-year vision', href: '/20-years', accent: C.ocean },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center justify-between gap-2 px-3 py-2 rounded-md hover:bg-white transition-colors"
                style={{ color: C.ocean, fontSize: 14 }}
              >
                <span className="inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: link.accent }} />
                  {link.label}
                </span>
                <ArrowRight className="w-3.5 h-3.5 opacity-50" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING LINE */}
      <section className="text-center mb-12">
        <p
          className="font-fraunces italic mx-auto"
          style={{ color: C.earth, fontSize: 'clamp(20px, 3vw, 30px)', lineHeight: 1.4, maxWidth: 680 }}
        >
          &ldquo;Old reports performed at funders. This one belongs to the community that made it.&rdquo;
        </p>
        <p
          className="font-bold uppercase mt-6"
          style={{ color: C.ochre, fontSize: 11, letterSpacing: '0.3em' }}
        >
          The 20-year vision · made tangible
        </p>
      </section>
    </div>
  )
}

// ── Components ──

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <p
        className="font-bold uppercase mb-2"
        style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
      >
        {eyebrow}
      </p>
      <h2
        className="font-fraunces font-bold"
        style={{ color: C.ocean, fontSize: 'clamp(26px, 3.5vw, 38px)', lineHeight: 1.15 }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="font-fraunces mt-3 max-w-3xl" style={{ color: C.driftwood, fontSize: 16, lineHeight: 1.55 }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

function FlowCard({ flow }: { flow: Flow }) {
  const Icon = flow.icon
  return (
    <article
      className="rounded-xl p-6 md:p-7"
      style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}`, borderLeftWidth: 4, borderLeftColor: flow.accent }}
    >
      <div className="flex items-start gap-4 flex-wrap md:flex-nowrap">
        <div className="flex items-center gap-3 flex-shrink-0">
          <span
            className="font-fraunces font-bold leading-none"
            style={{ color: C.muted, fontSize: 32 }}
          >
            {flow.n}
          </span>
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: flow.accent + '22', color: flow.accent }}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="font-fraunces font-bold mb-2"
            style={{ color: C.ocean, fontSize: 24, lineHeight: 1.2 }}
          >
            {flow.title}
          </h3>
          <p className="font-fraunces leading-relaxed mb-4" style={{ color: C.earth, fontSize: 16 }}>
            {flow.body}
          </p>
          <div className="flex flex-wrap gap-2">
            {flow.surfaces.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                {...(s.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs hover:bg-stone-50 transition-colors"
                style={{ color: flow.accent, border: `1px solid ${flow.accent}33` }}
              >
                {s.label}
                {s.external ? <ExternalLink className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}

function StakeholderCard({ stakeholder }: { stakeholder: typeof STAKEHOLDERS[number] }) {
  const Icon = stakeholder.icon
  return (
    <Link
      href={stakeholder.href}
      className="group block rounded-xl p-6 hover:shadow-sm transition-shadow"
      style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}`, borderTopWidth: 3, borderTopColor: stakeholder.accent }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: stakeholder.accent + '22', color: stakeholder.accent }}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3
            className="font-fraunces font-bold group-hover:text-picc-ochre transition-colors"
            style={{ color: C.ocean, fontSize: 22, lineHeight: 1.2 }}
          >
            {stakeholder.title}
          </h3>
        </div>
      </div>
      <p className="font-fraunces leading-relaxed mb-4" style={{ color: C.earth, fontSize: 15 }}>
        {stakeholder.body}
      </p>
      <p
        className="font-bold uppercase mb-2"
        style={{ color: stakeholder.accent, fontSize: 10, letterSpacing: '0.2em' }}
      >
        Proof
      </p>
      <p className="font-fraunces italic" style={{ color: C.driftwood, fontSize: 13, lineHeight: 1.5 }}>
        {stakeholder.proof}
      </p>
    </Link>
  )
}
