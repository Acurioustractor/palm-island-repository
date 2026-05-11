/**
 * /picc/annual-report — command center for the always-on annual report.
 *
 * One page that surfaces every input (photos, voices, artwork, meetings,
 * action items) AND every output (web report, Pencil spreads, future
 * print-on-demand cuts). Designed so an editor can scan readiness in 30s
 * and a CEO can see how the report stays alive between visits.
 */
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import {
  ArrowRight, ExternalLink, FileText, Camera, Mic, Palette, Users,
  ListChecks, Calendar, Printer, BookOpen, Target, Sparkles, Lock,
} from 'lucide-react'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'
import { getELQuotes, getELStats } from '@/lib/empathy-ledger/el-server'
import { getPiccElders, getPiccStorytellers } from '@/lib/empathy-ledger/el-storytellers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Annual Report Command Center · PICC Admin',
  description: 'Always-on annual report — every input, every output, every cut.',
}

const EL_BASE = (process.env.NEXT_PUBLIC_EL_V2_URL?.replace(/\/$/, '') || 'https://picc.empathyledger.com')

interface Counts {
  meetings: number
  meetingsElders: number
  actionItems: number
  actionItemsDone: number
  artworkPending: number
  storiesPending: number
  notesNew: number
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('no creds')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function getCounts(): Promise<Counts> {
  try {
    const supabase = getSupabase()
    const [allMeetings, eldersMeetings, allActions, doneActions, artwork, stories, notes] = await Promise.all([
      supabase.from('meeting_notes').select('id', { count: 'exact', head: true }),
      supabase.from('meeting_notes').select('id', { count: 'exact', head: true }).eq('group_name', 'Elders Group'),
      supabase.from('meeting_notes').select('action_items').limit(500),
      supabase.from('action_item_states').select('id', { count: 'exact', head: true }).eq('status', 'done'),
      supabase.from('media_files').select('id', { count: 'exact', head: true })
        .eq('page_context', 'community-art').eq('is_public', false).is('deleted_at', null),
      supabase.from('stories').select('id', { count: 'exact', head: true })
        .eq('status', 'submitted').eq('is_public', false).is('deleted_at', null),
      supabase.from('stories').select('id', { count: 'exact', head: true })
        .filter('metadata->>is_note', 'eq', 'true').eq('is_public', false).is('deleted_at', null),
    ])

    const totalActions = (allActions.data || []).reduce(
      (sum, m) => sum + (Array.isArray(m.action_items) ? m.action_items.length : 0), 0,
    )

    return {
      meetings: allMeetings.count || 0,
      meetingsElders: eldersMeetings.count || 0,
      actionItems: totalActions,
      actionItemsDone: doneActions.count || 0,
      artworkPending: artwork.count || 0,
      storiesPending: stories.count || 0,
      notesNew: notes.count || 0,
    }
  } catch {
    return { meetings: 0, meetingsElders: 0, actionItems: 0, actionItemsDone: 0, artworkPending: 0, storiesPending: 0, notesNew: 0 }
  }
}

// Saltwater Almanac spreads — mirrored from the Pencil v2 cluster
interface Spread {
  id: string
  n: string
  name: string
  audience: string[]
  status: string
  owner?: string
}

const SPREADS: Spread[] = [
  { id: 'pQZZX', n: '01', name: 'Cover',                                      audience: ['all'],                           status: 'designed' },
  { id: 'WIyhs', n: '02', name: 'Acknowledgement of Country',                 audience: ['all'],                           status: 'designed' },
  { id: 'UNmRP', n: '03', name: 'Contents',                                   audience: ['all'],                           status: 'designed' },
  { id: 'PQPPx', n: '04', name: 'CEO Message — Rachel Atkinson',              audience: ['all'],                           status: 'awaiting-signoff', owner: 'Rachel' },
  { id: '1cNee', n: '05', name: 'Chair Message — Luella Bligh',               audience: ['all'],                           status: 'awaiting-signoff', owner: 'Luella' },
  { id: 'oTtjL', n: '06', name: 'Governance — Board',                         audience: ['all'],                           status: 'designed' },
  { id: 'bpXvp', n: '07', name: 'Elders On Country — photo essay',            audience: ['community','supporter','board'], status: 'photos-needed' },
  { id: 'AO7ma', n: '08', name: 'Elders On Country — RIGHT PAGE',             audience: ['community','supporter','board'], status: 'photos-needed' },
  { id: '0eq4I', n: '09', name: 'Year 17 in Numbers — Constellation',         audience: ['all'],                           status: 'designed' },
  { id: '0WnsQ', n: '10', name: 'Services at a Glance — 30 services',         audience: ['all'],                           status: 'review-count', owner: 'Narelle' },
  { id: 'kjUI7', n: '11', name: 'Bwgcolman Way — Before/After',               audience: ['all'],                           status: 'awaiting-cultural-review', owner: 'Elders Group' },
  { id: 'HRveX', n: '12', name: 'Featured Service — Bwgcolman Healing',       audience: ['all'],                           status: 'photos-needed' },
  { id: 'ht6rD', n: '13', name: 'Featured Service — First 1,000 Days',       audience: ['all'],                           status: 'photos-needed' },
  { id: 'CcAqN', n: '14', name: 'Featured Service — BEAI',                    audience: ['all'],                           status: 'photos-needed' },
  { id: 'zBumS', n: '15', name: 'Community Voices — Double Page',             audience: ['community','supporter'],         status: 'voices-curating' },
  { id: 'JOvEu', n: '16', name: 'Our Journey — River Timeline',               audience: ['all'],                           status: 'designed' },
  { id: 'cGaCV', n: '17', name: 'Financial Summary — Saltwater Rings',       audience: ['funder','board','govt'],         status: 'awaiting-numbers', owner: 'Mark' },
  { id: 'QPEH6', n: '18', name: 'Compliance & Accreditation',                 audience: ['funder','board','govt'],         status: 'designed' },
  { id: 'EihyD', n: '19', name: 'Risks',                                      audience: ['funder','board','govt'],         status: 'designed' },
  { id: 'fy7j6', n: '20', name: 'Looking Forward — Reef Layers',              audience: ['all'],                           status: 'designed' },
  { id: 'IBRsF', n: '21', name: 'Acknowledgements & Credits',                 audience: ['all'],                           status: 'designed' },
  { id: 'vZQsM', n: '22', name: 'Back Cover',                                 audience: ['all'],                           status: 'designed' },
] as const

const STATUS_META: Record<string, { label: string; colour: string }> = {
  'designed':                  { label: 'Designed',           colour: '#16A34A' }, // green
  'awaiting-signoff':          { label: 'Awaiting sign-off',  colour: C.ochre },
  'awaiting-cultural-review':  { label: 'Cultural review',    colour: C.turtleRed },
  'photos-needed':             { label: 'Photos needed',      colour: C.coral },
  'voices-curating':           { label: 'Voices curating',    colour: C.reef },
  'awaiting-numbers':          { label: 'Numbers needed',     colour: C.muted },
  'review-count':              { label: 'Review count',       colour: C.starGold },
}

const AUDIENCES = ['all', 'community', 'funder', 'supporter', 'board', 'govt'] as const

export default async function AnnualReportHubPage() {
  const [counts, elStats, recentQuotes, elders, allStorytellers] = await Promise.all([
    getCounts(),
    getELStats().catch(() => ({ quotes: 0, transcripts: 0, stories: 0, media: 0 })),
    getELQuotes({ limit: 8, minImpact: 7 }).catch(() => []),
    getPiccElders().catch(() => []),
    getPiccStorytellers({ limit: 500 }).catch(() => []),
  ])

  // Group spreads by status
  const designed = SPREADS.filter((s) => s.status === 'designed').length
  const blocked = SPREADS.length - designed

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <p
          className="font-bold uppercase mb-2"
          style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
        >
          Always-on annual report · command center
        </p>
        <h1
          className="font-fraunces font-bold mb-3"
          style={{ color: C.ocean, fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: 1.05 }}
        >
          Saltwater Almanac
        </h1>
        <p
          className="font-fraunces max-w-3xl"
          style={{ color: C.driftwood, fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: 1.55 }}
        >
          Two surfaces, one story: an always-on web report (lives, breathes, updates) and a printed
          Saltwater Almanac (annual artefact, 5 audience cuts, on-demand reprints between).
        </p>

        {/* Quick action row */}
        <div className="flex flex-wrap gap-3 mt-8">
          <Link
            href="/annual-report/2024-25/almanac"
            target="_blank"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-bold uppercase text-xs hover:opacity-90 transition"
            style={{ backgroundColor: C.ocean, color: '#FBF8EE', letterSpacing: '0.15em' }}
          >
            Open live almanac <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/annual-report/live"
            target="_blank"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-bold uppercase text-xs hover:opacity-90 transition"
            style={{ backgroundColor: 'transparent', color: C.ocean, border: `2px solid ${C.ocean}`, letterSpacing: '0.15em' }}
          >
            Open always-on report <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/picc/almanac/preview"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-bold uppercase text-xs hover:opacity-90 transition"
            style={{ backgroundColor: C.shell, color: C.ocean, border: `1px solid ${C.border}`, letterSpacing: '0.15em' }}
          >
            Preview (admin overlays) <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* THE TWO SURFACES — clear story */}
      <section className="mb-12 grid md:grid-cols-2 gap-6">
        <SurfaceCard
          eyebrow="Surface 1 · Always-on"
          title="Web report"
          body="Live data from EL. Every photo, voice, action item flows in continuously. Audience-targeted via URL. Updated the moment data lands."
          metrics={[
            { label: 'Storytellers', value: allStorytellers.length },
            { label: 'Quotes in EL', value: elStats?.quotes || 0 },
            { label: 'Photos in EL', value: elStats?.media || 0 },
          ]}
          ctaLabel="Walk it"
          ctaHref="/annual-report/2024-25/almanac"
          accent={C.ocean}
        />
        <SurfaceCard
          eyebrow="Surface 2 · Print"
          title="Saltwater Almanac"
          body="22 v2 spreads in Pencil. A4 portrait. 5 audience cuts. Yearly print event + on-demand reprints whenever a funder / board / community member asks."
          metrics={[
            { label: 'Spreads designed', value: `${designed}/${SPREADS.length}` },
            { label: 'Audience cuts', value: AUDIENCES.length - 1 },
            { label: 'Pencil file', value: 'v2' },
          ]}
          ctaLabel="Open Pencil"
          ctaHref="/picc/almanac/checklist"
          accent={C.ochre}
        />
      </section>

      {/* SPREAD CHECKLIST — the production status */}
      <section className="mb-12">
        <SectionHeader
          eyebrow="Production status"
          title="22 spreads · what's ready, what's blocked"
          subtitle={`${designed} designed · ${blocked} need attention before print`}
        />
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}` }}>
          {SPREADS.map((s, i) => {
            const meta = STATUS_META[s.status]
            return (
              <div
                key={s.id}
                className="flex items-center gap-4 px-5 py-3"
                style={{ borderTop: i === 0 ? 'none' : `1px solid ${C.border}` }}
              >
                <span
                  className="font-fraunces font-bold flex-shrink-0 w-10"
                  style={{ color: C.muted, fontSize: 16 }}
                >
                  {s.n}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate" style={{ color: C.ocean, fontSize: 14 }}>
                    {s.name}
                  </p>
                  <p className="text-xs" style={{ color: C.driftwood }}>
                    Audience: {s.audience.join(' · ')}{s.owner ? ` · waiting on ${s.owner}` : ''}
                  </p>
                </div>
                <span
                  className="font-bold uppercase px-2.5 py-1 rounded flex-shrink-0"
                  style={{ backgroundColor: meta.colour + '22', color: meta.colour, fontSize: 10, letterSpacing: '0.15em' }}
                >
                  {meta.label}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* CONTINUOUS CONTENT INPUTS — what's flowing in */}
      <section className="mb-12">
        <SectionHeader
          eyebrow="Continuous capture"
          title="What's flowing in right now"
          subtitle="Every input feeds both the live web version and the next print event."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <InputCard icon={Mic} label="Voices in queue" value={counts.storiesPending} accent={C.ochre} link="/picc/inbox" cta="Open inbox" />
          <InputCard icon={Palette} label="Artwork pending review" value={counts.artworkPending} accent={C.coral} link="/picc/inbox" cta="Open inbox" />
          <InputCard icon={FileText} label="Notes captured" value={counts.notesNew} accent={C.reef} link="/picc/notes" cta="Open notes" />
          <InputCard icon={ListChecks} label="Action items tracked" value={`${counts.actionItemsDone}/${counts.actionItems}`} accent={C.mangrove} link="/picc/action-items" cta="Open ledger" />
          <InputCard icon={Calendar} label="Meetings recorded" value={counts.meetings} accent={C.ocean} link="/picc/meetings" cta="Open meetings" />
          <InputCard icon={Users} label="Elders Group meetings" value={counts.meetingsElders} accent={C.turtleRed} link="/picc/elders/meetings" cta="Browse" />
          <InputCard icon={Camera} label="Photos in EL" value={elStats?.media || 0} accent={C.starGold} link="/picc/almanac/photos" cta="Photo browser" external />
          <InputCard icon={Sparkles} label="Quotes in EL (impact ≥ 7)" value={recentQuotes.length} accent={C.ochre} link="/picc/almanac/voices" cta="Voice tracker" />
        </div>
      </section>

      {/* PRINT-ON-DEMAND CUTS — the innovation */}
      <section className="mb-12">
        <SectionHeader
          eyebrow="Print on demand"
          title="6 form factors · one source of truth"
          subtitle="Same EL data, different page selections + audience voice. Print events on demand, not on a calendar."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormatCard
            title="Saltwater Almanac"
            body="Full 27 pages. Board / annual moment."
            cadence="Yearly"
            audience="all"
            ready={designed === SPREADS.length}
          />
          <FormatCard
            title="Funder cut"
            body="~12 pages. Compliance + financials + 1-2 anchor stories."
            cadence="On demand per funder"
            audience="funder · govt · board"
            ready={false}
          />
          <FormatCard
            title="Community pamphlet"
            body="~6 pages. Community voices + photo essay + journey."
            cadence="Quarterly · AGM"
            audience="community · supporter"
            ready={false}
          />
          <FormatCard
            title="Kids' picture book"
            body="~12 pages. Drawings + Elder quotes + a service told as story."
            cadence="On demand · per topic"
            audience="schools · kids in services"
            ready={false}
            innovative
          />
          <FormatCard
            title="Trip storybook"
            body="Per Elders trip. Photos + voices + map. 8-16pp."
            cadence="Per trip"
            audience="Elders + supporters"
            ready={false}
            innovative
            link="/picc/trips/atherton-tablelands-2026"
            linkLabel="Atherton trip"
          />
          <FormatCard
            title="Monthly snapshot"
            body="Latest stats + 3 voices + 1 anchor story. Email + 4-page PDF."
            cadence="Monthly"
            audience="subscribers · staff"
            ready={false}
            innovative
          />
        </div>
      </section>

      {/* COMMUNITY BOOKS — the radical generative idea */}
      <section
        className="mb-12 rounded-2xl p-8 md:p-10"
        style={{ background: `linear-gradient(135deg, ${C.ochre}11, ${C.turtleRed}11)`, border: `1px solid ${C.ochre}44` }}
      >
        <div className="flex items-start gap-4 flex-wrap">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: C.ochre + '22', color: C.ochre }}
          >
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-[260px]">
            <p
              className="font-bold uppercase mb-2"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Innovation track · community books
            </p>
            <h2
              className="font-fraunces font-bold mb-3"
              style={{ color: C.ocean, fontSize: 'clamp(24px, 3.5vw, 36px)', lineHeight: 1.15 }}
            >
              Young people make the next book
            </h2>
            <p className="font-fraunces mb-5" style={{ color: C.earth, fontSize: 17, lineHeight: 1.6 }}>
              The annual report belongs to the community that made it. The most generative form is the
              one young people make themselves: pick a topic (a service, an Elder, a place), gather
              drawings via <Link href="/share-art" className="underline">/share-art</Link>, voices via
              {' '}<Link href="/share-voice" className="underline">/share-voice</Link>, photos. Admin
              assembles a 12-page book using the Pencil component library. Print on demand. Every kid
              who contributes gets a free copy.
            </p>
            <p className="font-fraunces italic mb-5" style={{ color: C.driftwood, fontSize: 15 }}>
              Books become teaching tools, gifts, gentle proof. The act of making is the engagement —
              not the act of being included.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/picc/books"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-bold uppercase text-xs hover:opacity-90 transition"
                style={{ backgroundColor: C.ochre, color: C.earth, letterSpacing: '0.15em' }}
              >
                Open books builder <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/share-art"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-bold uppercase text-xs hover:opacity-90 transition"
                style={{ backgroundColor: 'transparent', color: C.ochre, border: `2px solid ${C.ochre}`, letterSpacing: '0.15em' }}
              >
                Public capture
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CULTURAL PROTOCOL */}
      <section className="mb-12">
        <SectionHeader
          eyebrow="Cultural protocol"
          title="The gates that hold this together"
          subtitle="Every voice, every photo, every story passes through Elder review before publication."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ProtocolCard
            title="Elder approval gate"
            body="Quote extraction blocked by /api/interviews/analyze until requires_elder_approval = false. The 403 IS the protocol."
          />
          <ProtocolCard
            title="Consent stamp"
            body="Every photo of a named person needs consent (filtered server-side in EL v2)."
          />
          <ProtocolCard
            title="Sorry Business protocol"
            body="Photos of deceased Elders never appear without family consultation. Flag is_sensitive on every meeting captured."
          />
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className="rounded-2xl p-6" style={{ backgroundColor: C.shell, border: `1px solid ${C.border}` }}>
        <p
          className="font-bold uppercase mb-4"
          style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
        >
          Quick jumps
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
          {[
            { label: 'Almanac checklist', href: '/picc/almanac/checklist' },
            { label: 'Almanac photos', href: '/picc/almanac/photos' },
            { label: 'Photo library', href: '/picc/almanac/photo-library' },
            { label: 'Pencil photo bridge', href: '/picc/almanac/pencil-bridge' },
            { label: 'Voices sprint', href: '/picc/almanac/voices' },
            { label: 'Services coverage', href: '/picc/almanac/services-coverage' },
            { label: 'Almanac videos', href: '/picc/almanac/videos' },
            { label: 'Annual reports list', href: '/picc/annual-reports' },
            { label: 'Action items', href: '/picc/action-items' },
            { label: 'Meetings hub', href: '/picc/meetings' },
            { label: 'Trips', href: '/picc/trips' },
            { label: 'Inbox', href: '/picc/inbox' },
            { label: 'Family connections', href: '/picc/kinship' },
            { label: 'Empathy Ledger', href: EL_BASE, external: true },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              {...(link.external ? { target: '_blank', rel: 'noreferrer' } : {})}
              className="inline-flex items-center justify-between gap-2 px-3 py-2 rounded-md hover:bg-white transition-colors"
              style={{ color: C.ocean, fontSize: 13 }}
            >
              {link.label}
              {link.external ? <ExternalLink className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

// ── Components ──

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

function SurfaceCard({
  eyebrow, title, body, metrics, ctaLabel, ctaHref, accent,
}: {
  eyebrow: string; title: string; body: string;
  metrics: Array<{ label: string; value: number | string }>;
  ctaLabel: string; ctaHref: string; accent: string
}) {
  return (
    <div
      className="rounded-2xl p-7"
      style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}`, borderTopWidth: 4, borderTopColor: accent }}
    >
      <p
        className="font-bold uppercase mb-2"
        style={{ color: accent, fontSize: 11, letterSpacing: '0.3em' }}
      >
        {eyebrow}
      </p>
      <h3
        className="font-fraunces font-bold mb-3"
        style={{ color: C.ocean, fontSize: 28, lineHeight: 1.15 }}
      >
        {title}
      </h3>
      <p className="font-fraunces leading-relaxed mb-5" style={{ color: C.driftwood, fontSize: 15 }}>
        {body}
      </p>
      <div className="grid grid-cols-3 gap-3 mb-5">
        {metrics.map((m) => (
          <div key={m.label}>
            <p className="font-fraunces font-bold leading-none" style={{ color: C.ocean, fontSize: 22 }}>
              {m.value}
            </p>
            <p
              className="font-bold uppercase mt-1.5"
              style={{ color: C.muted, fontSize: 9, letterSpacing: '0.2em' }}
            >
              {m.label}
            </p>
          </div>
        ))}
      </div>
      <Link
        href={ctaHref}
        target={ctaHref.startsWith('http') ? '_blank' : undefined}
        className="inline-flex items-center gap-2 font-bold uppercase text-xs hover:underline"
        style={{ color: accent, letterSpacing: '0.15em' }}
      >
        {ctaLabel} <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  )
}

function InputCard({
  icon: Icon, label, value, accent, link, cta, external,
}: {
  icon: any; label: string; value: number | string; accent: string;
  link: string; cta: string; external?: boolean
}) {
  return (
    <Link
      href={link}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className="group block rounded-xl p-4 hover:shadow-sm transition-shadow"
      style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}`, borderTopWidth: 3, borderTopColor: accent }}
    >
      <div className="flex items-start gap-3 mb-3">
        <Icon className="w-5 h-5 mt-0.5" style={{ color: accent }} />
        <div className="flex-1">
          <p className="font-fraunces font-bold leading-none" style={{ color: C.ocean, fontSize: 24 }}>
            {value}
          </p>
        </div>
      </div>
      <p
        className="font-bold uppercase mb-2"
        style={{ color: accent, fontSize: 10, letterSpacing: '0.2em' }}
      >
        {label}
      </p>
      <p
        className="text-xs group-hover:underline inline-flex items-center gap-1"
        style={{ color: C.driftwood }}
      >
        {cta} <ArrowRight className="w-3 h-3" />
      </p>
    </Link>
  )
}

function FormatCard({
  title, body, cadence, audience, ready, innovative, link, linkLabel,
}: {
  title: string; body: string; cadence: string; audience: string;
  ready: boolean; innovative?: boolean; link?: string; linkLabel?: string
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: '#FFFFFF',
        border: `1px solid ${innovative ? C.ochre + '66' : C.border}`,
        borderTopWidth: 3,
        borderTopColor: innovative ? C.ochre : ready ? '#16A34A' : C.muted,
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3
          className="font-fraunces font-bold"
          style={{ color: C.ocean, fontSize: 19, lineHeight: 1.2 }}
        >
          {title}
        </h3>
        {innovative && (
          <span
            className="font-bold uppercase px-2 py-0.5 rounded flex-shrink-0"
            style={{ backgroundColor: C.ochre + '22', color: C.ochre, fontSize: 9, letterSpacing: '0.2em' }}
          >
            New
          </span>
        )}
      </div>
      <p className="font-fraunces leading-relaxed mb-4" style={{ color: C.driftwood, fontSize: 14 }}>
        {body}
      </p>
      <div className="text-xs space-y-1 mb-3" style={{ color: C.muted }}>
        <p><strong style={{ color: C.driftwood }}>Cadence:</strong> {cadence}</p>
        <p><strong style={{ color: C.driftwood }}>Audience:</strong> {audience}</p>
      </div>
      {link && (
        <Link
          href={link}
          className="inline-flex items-center gap-1 text-xs hover:underline"
          style={{ color: C.ochre, fontWeight: 600 }}
        >
          {linkLabel || 'Open'} <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  )
}

function ProtocolCard({ title, body }: { title: string; body: string }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}`, borderLeftWidth: 4, borderLeftColor: C.turtleRed }}
    >
      <div className="flex items-start gap-3">
        <Lock className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: C.turtleRed }} />
        <div>
          <h3 className="font-fraunces font-bold mb-2" style={{ color: C.ocean, fontSize: 16 }}>
            {title}
          </h3>
          <p className="font-fraunces" style={{ color: C.driftwood, fontSize: 13, lineHeight: 1.55 }}>
            {body}
          </p>
        </div>
      </div>
    </div>
  )
}
