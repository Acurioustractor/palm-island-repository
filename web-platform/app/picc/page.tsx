/**
 * /picc — operator landing.
 *
 * Six priority command-centers, in the order an operator's day actually
 * moves through them. Each centre is a domain — not a flat link grid.
 * Live counts so progress shows up without having to click through.
 *
 * The mental model:
 *   1. Vision        — the next 20 years (what defines the work)
 *   2. Canonical     — services / projects / storytellers aligned with EL
 *   3. Capture       — pending review, signing canvas, sprint
 *   4. Curate        — themes, library, voice review
 *   5. Govern        — finances, governance, risks, sector
 *   6. Ship          — annual report, demo, public showcase
 */
import Link from 'next/link'
import {
  Compass,
  Database,
  Inbox,
  Sparkles,
  Landmark,
  FileText,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { createServerSupabase } from '@/lib/supabase/client'
import { getPiccServices } from '@/lib/services/el-services'
import { getPiccProjects } from '@/lib/empathy-ledger/el-projects'
import { getPiccStorytellers } from '@/lib/empathy-ledger/el-storytellers'
import { getELStats } from '@/lib/empathy-ledger/el-server'
import { C, SECTION_COLOURS } from '@/components/annual-report/2024-25/almanac/tokens'

export const metadata = {
  title: 'PICC Admin',
  description: 'Operator landing — the canonical archive, the next 20 years, the report.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const EL_ADMIN_BASE = process.env.NEXT_PUBLIC_EL_V2_URL || 'https://empathy-ledger-v2.vercel.app'

async function getInboxCount(): Promise<number> {
  try {
    const supabase = createServerSupabase()
    const [art, questions, stories, notes] = await Promise.all([
      supabase
        .from('media_files')
        .select('id', { count: 'exact', head: true })
        .eq('page_context', 'community-art')
        .eq('is_public', false)
        .is('deleted_at', null),
      supabase
        .from('stories')
        .select('id', { count: 'exact', head: true })
        .filter('metadata->>is_question', 'eq', 'true')
        .filter('metadata->>question_status', 'eq', 'open')
        .is('deleted_at', null),
      supabase
        .from('stories')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'submitted')
        .eq('is_public', false)
        .or('metadata->>is_question.is.null,metadata->>is_question.eq.false')
        .or('metadata->>is_note.is.null,metadata->>is_note.eq.false')
        .is('deleted_at', null),
      supabase
        .from('stories')
        .select('id', { count: 'exact', head: true })
        .filter('metadata->>is_note', 'eq', 'true')
        .eq('is_public', false)
        .is('deleted_at', null),
    ])
    return (art.count || 0) + (questions.count || 0) + (stories.count || 0) + (notes.count || 0)
  } catch {
    return 0
  }
}

interface CommandCentre {
  id: string
  label: string
  blurb: string
  colour: string
  icon: React.ReactNode
  primary: { href: string; label: string; live?: string }
  links: Array<{ href: string; label: string; sub?: string; external?: boolean; badge?: string | number }>
}

export default async function PICCIndexPage() {
  const [
    services,
    projects,
    storytellers,
    elStats,
    inboxCount,
    pendingVisionsRes,
    approvedVisionsRes,
  ] = await Promise.all([
    getPiccServices({ status: 'active' }).catch(() => []),
    getPiccProjects({ status: 'all' }).catch(() => []),
    getPiccStorytellers({ limit: 500 }).catch(() => []),
    getELStats().catch(() => ({ quotes: 0, transcripts: 0, stories: 0, media: 0 })),
    getInboxCount(),
    createServerSupabase()
      .from('community_visions')
      .select('id', { count: 'exact', head: true })
      .eq('is_approved', false),
    createServerSupabase()
      .from('community_visions')
      .select('id', { count: 'exact', head: true })
      .eq('is_approved', true),
  ])

  const totalServices = services.length
  const servicesWithCover = services.filter((s) => s.image_url).length
  const totalProjects = projects.filter((p) => p.status !== 'cancelled').length
  const projectsWithCover = projects.filter((p) => p.cover_image_url && p.status !== 'cancelled').length
  const totalStorytellers = storytellers.length
  const storytellersWithPhoto = storytellers.filter((s) => s.photo_url).length
  const totalElders = storytellers.filter((s) => s.is_elder).length
  const totalQuotes = elStats.quotes
  const totalApprovedVisions = approvedVisionsRes.count ?? 0
  const totalPendingVisions = pendingVisionsRes.count ?? 0

  const centres: CommandCentre[] = [
    {
      id: 'vision',
      label: 'The next 20 years',
      blurb:
        'What defines the work — the strategic frame, the community canvas, and the visions still awaiting Elder review.',
      colour: SECTION_COLOURS.all,
      icon: <Compass className="w-5 h-5" />,
      primary: {
        href: '/picc/next-20',
        label: 'Open the canvas',
        live: `${totalApprovedVisions} signed · ${totalPendingVisions} pending`,
      },
      links: [
        { href: '/picc/next-20', label: 'Next-20 working canvas', sub: '6 visions · forward commitments · urgent asks' },
        { href: '/picc/vision', label: 'Approval queue', sub: 'Pending visions · Elder review', badge: totalPendingVisions || undefined },
        { href: '/picc/launchpad', label: 'Launchpad', sub: '20-year strategic plan' },
        { href: '/sign-the-vision', label: 'Public signing canvas', sub: 'What the community sees · QR ready' },
      ],
    },
    {
      id: 'canonical',
      label: 'Canonical archive',
      blurb:
        'Services, projects, storytellers — all aligned to Empathy Ledger v2 as the single source of truth. This is where alignment lives or dies.',
      colour: SECTION_COLOURS.educationCommunity,
      icon: <Database className="w-5 h-5" />,
      primary: {
        href: '/picc/services/coverage',
        label: 'Service alignment',
        live: `${servicesWithCover}/${totalServices} services covered · ${projectsWithCover}/${totalProjects} projects covered`,
      },
      links: [
        { href: '/picc/services/coverage', label: 'Service alignment', sub: `${totalServices} active · ${servicesWithCover} with cover` },
        { href: '/picc/projects/coverage', label: 'Project alignment', sub: `${totalProjects} live · ${projectsWithCover} with cover` },
        { href: '/picc/voices', label: 'Voices inventory', sub: `${totalStorytellers} storytellers · ${storytellersWithPhoto} with photo · ${totalElders} elders` },
        { href: `${EL_ADMIN_BASE}/admin/picc-tagging`, label: 'EL photo tagger', sub: 'Tag photos to services + projects', external: true },
        { href: `${EL_ADMIN_BASE}/admin/picc-clusters`, label: 'EL face tagger', sub: 'Cluster + name faces', external: true },
        { href: `${EL_ADMIN_BASE}/admin/picc-bulk`, label: 'EL bulk operations', sub: 'Batch tagging + cleanup', external: true },
      ],
    },
    {
      id: 'capture',
      label: 'Capture',
      blurb:
        'Pending art, questions, stories and notes from community — review queue. Plus the live capture surfaces.',
      colour: SECTION_COLOURS.youth,
      icon: <Inbox className="w-5 h-5" />,
      primary: {
        href: '/picc/inbox',
        label: 'Open inbox',
        live: inboxCount > 0 ? `${inboxCount} awaiting review` : 'Nothing waiting',
      },
      links: [
        { href: '/picc/inbox', label: 'Inbox', sub: 'Art · questions · stories · notes — unified triage', badge: inboxCount || undefined },
        { href: '/picc/meetings/process', label: 'Process meeting', sub: 'Audio → transcript → themes + action items → save' },
        { href: '/picc/elders/meetings', label: 'Elders meetings', sub: 'Browse meeting notes + action items' },
        { href: '/picc/notes', label: 'Notes', sub: 'Staff scratchpad · field notes' },
        { href: '/share-note', label: 'Public · Leave a note', sub: 'Where the community submits' },
      ],
    },
    {
      id: 'curate',
      label: 'Curate',
      blurb:
        'What lifts to the public. Themes-of-the-year, validated voices, library curation, voice sprint progress.',
      colour: SECTION_COLOURS.justiceSafety,
      icon: <Sparkles className="w-5 h-5" />,
      primary: { href: '/picc/themes', label: 'Featured themes', live: `${totalQuotes.toLocaleString()} voices in archive` },
      links: [
        { href: '/picc/themes', label: 'Featured themes', sub: 'Curate which themes lift on /voices' },
        { href: '/picc/voices', label: '20-Voices sprint', sub: 'Capture priority list · consent flow' },
        { href: '/picc/library', label: 'Library', sub: 'Publications · research · EL connections' },
        { href: '/voices/themes', label: 'Public · Themes index', sub: 'What surfaces today' },
      ],
    },
    {
      id: 'govern',
      label: 'Govern',
      blurb:
        'Finances, board governance, sector map, risks register — the underwriting that makes everything else legitimate.',
      colour: SECTION_COLOURS.governance,
      icon: <Landmark className="w-5 h-5" />,
      primary: { href: '/picc/finances', label: 'Finances dashboard' },
      links: [
        { href: '/picc/finances', label: 'Finances', sub: '17-year revenue + headcount curve' },
        { href: '/picc/governance', label: 'Governance', sub: 'Board · directors · 2007→2021 transition' },
        { href: '/picc/sector-map', label: 'Sector map', sub: 'PICC in context · 3-layer ecosystem' },
        { href: '/picc/risks', label: 'Risks register', sub: '8 structural pressures · mitigations' },
      ],
    },
    {
      id: 'ship',
      label: 'Ship',
      blurb:
        'The annual report, the leader-meeting demo, the public showcase. Where the work meets the world.',
      colour: SECTION_COLOURS.economic,
      icon: <FileText className="w-5 h-5" />,
      primary: { href: '/picc/reports/builder', label: 'Annual report builder' },
      links: [
        { href: '/picc/reports/builder', label: 'Annual report builder', sub: 'Audience-targeted PDF · 4 cuts' },
        { href: '/picc/almanac/preview', label: 'Almanac preview', sub: 'Full report walk · sticky chrome' },
        { href: '/picc/almanac/checklist', label: 'Almanac checklist', sub: 'Every blocker · readiness %' },
        { href: '/picc/demo', label: 'Demo run-of-show', sub: 'CEO walkthrough script · QR · presenter mode' },
        { href: '/picc/atlas', label: 'Operator master surface', sub: 'Every link · live counters · session canvas' },
        { href: '/showcase', label: 'Public showcase', sub: 'The cinematic public hero' },
      ],
    },
  ]

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Hero */}
      <header className="mb-10">
        <p
          className="text-[11px] font-bold uppercase tracking-[0.3em] mb-3"
          style={{ color: C.turtleRed }}
        >
          Operator · The canonical archive · The next 20 years
        </p>
        <h1
          className="font-fraunces font-bold leading-[1.05] mb-4"
          style={{ color: C.ocean, fontSize: 'clamp(36px, 5.5vw, 56px)' }}
        >
          Six command centres. One operator&apos;s day.
        </h1>
        <p className="font-fraunces max-w-3xl" style={{ color: C.driftwood, fontSize: 18, lineHeight: 1.55 }}>
          Vision · canonical archive · capture · curate · govern · ship — in the order they actually move through. Live counts pulled from Empathy Ledger v2 every load.
        </p>

        {/* Headline KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-8">
          <Kpi label="Services" total={totalServices} covered={servicesWithCover} colour={C.ocean} />
          <Kpi label="Projects" total={totalProjects} covered={projectsWithCover} colour={C.coral} />
          <Kpi label="Storytellers" total={totalStorytellers} covered={storytellersWithPhoto} colour={C.ochre} sub={`${totalElders} elders`} />
          <Kpi label="Voices" total={totalQuotes} colour={C.mangrove} />
          <Kpi label="Visions" total={totalApprovedVisions} sub={`${totalPendingVisions} pending`} colour={C.turtleRed} />
        </div>
      </header>

      {/* Six command centres */}
      <div className="space-y-8">
        {centres.map((c, idx) => (
          <section
            key={c.id}
            className="rounded-2xl border bg-white p-6 md:p-7"
            style={{ borderColor: C.border }}
          >
            <div className="flex items-start gap-4 flex-wrap md:flex-nowrap">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: c.colour + '15', color: c.colour }}
              >
                {c.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                  <span
                    className="text-[11px] uppercase font-bold tracking-[0.2em]"
                    style={{ color: C.driftwood, letterSpacing: '0.2em' }}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <h2
                    className="font-fraunces font-bold"
                    style={{ color: c.colour, fontSize: 28 }}
                  >
                    {c.label}
                  </h2>
                </div>
                <p className="font-fraunces" style={{ color: C.driftwood, fontSize: 17, lineHeight: 1.55 }}>
                  {c.blurb}
                </p>
                {c.primary.live && (
                  <div className="mt-2 inline-flex items-center gap-2 text-[11px] font-mono" style={{ color: C.driftwood }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.colour }} />
                    {c.primary.live}
                  </div>
                )}
              </div>
              <Link
                href={c.primary.href}
                className="px-4 py-2.5 rounded-md font-bold uppercase text-xs whitespace-nowrap inline-flex items-center gap-2 flex-shrink-0"
                style={{ backgroundColor: c.colour, color: '#fff', letterSpacing: '0.15em' }}
              >
                {c.primary.label}
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Sub-links */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {c.links.map((l) => {
                const isExternal = !!l.external
                const Tag: any = isExternal ? 'a' : Link
                const props: any = isExternal
                  ? { href: l.href, target: '_blank', rel: 'noopener noreferrer' }
                  : { href: l.href }
                return (
                  <Tag
                    key={l.href + l.label}
                    {...props}
                    className="group flex items-start gap-2 rounded-lg border px-3 py-2.5 hover:shadow-sm transition"
                    style={{ borderColor: C.border, backgroundColor: '#FBF8EE' }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span
                          className="font-bold text-sm"
                          style={{ color: C.ocean }}
                        >
                          {l.label}
                        </span>
                        {l.badge !== undefined && l.badge !== '' && Number(l.badge) > 0 && (
                          <span
                            className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold"
                            style={{ backgroundColor: c.colour, color: '#fff' }}
                          >
                            {l.badge}
                          </span>
                        )}
                        {isExternal && (
                          <ExternalLink className="w-3 h-3 opacity-50" style={{ color: C.driftwood }} />
                        )}
                      </div>
                      {l.sub && (
                        <div className="text-[11px] mt-0.5" style={{ color: C.driftwood, lineHeight: 1.4 }}>
                          {l.sub}
                        </div>
                      )}
                    </div>
                  </Tag>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Footer — public surfaces strip */}
      <footer className="mt-10 pt-6 border-t" style={{ borderColor: C.border }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: C.driftwood }}>
          Public-facing surfaces
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/', label: 'Home' },
            { href: '/atlas', label: 'Public atlas' },
            { href: '/showcase', label: 'Showcase' },
            { href: '/voices', label: 'Voices' },
            { href: '/voices/network', label: 'Connection map' },
            { href: '/services', label: 'Services' },
            { href: '/projects', label: 'Projects' },
            { href: '/elders', label: 'Elders' },
            { href: '/20-years', label: '20 years' },
            { href: '/bwgcolman', label: 'Bwgcolman Way' },
            { href: '/sign-the-vision', label: 'Sign the vision' },
            { href: '/design-system', label: 'Design system' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target="_blank"
              className="px-3 py-1.5 rounded-full text-xs hover:shadow-sm transition"
              style={{ backgroundColor: '#fff', border: `1px solid ${C.border}`, color: C.ocean }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  )
}

function Kpi({
  label,
  total,
  covered,
  sub,
  colour,
}: {
  label: string
  total: number
  covered?: number
  sub?: string
  colour: string
}) {
  const pct = covered !== undefined && total > 0 ? Math.round((covered / total) * 100) : null
  const okState = pct !== null ? pct >= 80 : true
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: C.border, backgroundColor: '#fff' }}>
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: C.driftwood }}>
        {label}
      </div>
      <div className="font-fraunces font-bold leading-none mb-1" style={{ color: colour, fontSize: 30 }}>
        {total.toLocaleString()}
      </div>
      {covered !== undefined && (
        <div className="text-[11px] mt-1 font-mono flex items-center gap-1" style={{ color: okState ? C.mangrove : C.coral }}>
          {okState ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
          {covered}/{total} covered ({pct}%)
        </div>
      )}
      {sub && (
        <div className="text-[11px] mt-1" style={{ color: C.driftwood }}>
          {sub}
        </div>
      )}
    </div>
  )
}
