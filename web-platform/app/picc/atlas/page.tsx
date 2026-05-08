/**
 * /picc/atlas — the master surface.
 *
 * One page that connects every surface in the platform. Live counts from
 * EL v2 + Supabase, every URL clickable, search across surfaces, the
 * sign-canvas QR. Designed to be the *one tab* an operator keeps open
 * during a leader meeting or a community walkthrough.
 */
import Link from 'next/link'
import { headers } from 'next/headers'
import {
  Mic,
  Users,
  Sparkles,
  Compass,
  Camera,
  BarChart3,
  PenLine,
  Tv2,
  Search,
  ArrowRight,
} from 'lucide-react'
import { C, SECTION_COLOURS } from '@/components/annual-report/2024-25/almanac/tokens'
import { createServerSupabase } from '@/lib/supabase/client'
import { getPalmStorytellers, getELStats } from '@/lib/empathy-ledger/el-server'
import { getPiccServices } from '@/lib/services/el-services'
import { getVoicesPool } from '@/lib/services/el-coverage'
import AnimatedStat from '@/components/data/AnimatedStat'
import QRPanel from '@/components/picc/QRPanel'
import AtlasSearch from './AtlasSearch'

export const metadata = {
  title: 'Atlas — every surface in the platform | PICC',
  description:
    'One page connecting every surface PICC runs: voices, services, projects, elders, 20-year canvas, signing surfaces, operator tools. Live counts. Bounce between everything.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface SurfaceCard {
  title: string
  description: string
  href: string
  count?: string
  icon?: React.ReactNode
  external?: boolean
  badge?: string
}

interface SurfaceGroup {
  id: string
  label: string
  blurb: string
  colour: string
  icon: React.ReactNode
  surfaces: SurfaceCard[]
}

export default async function AtlasPage() {
  const supabase = createServerSupabase()

  const h = await headers()
  const host = h.get('host') ?? 'palmisland.org.au'
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  const session = `meeting-${new Date().toISOString().slice(0, 10)}`
  const signUrl = `${proto}://${host}/sign-the-vision?session=${encodeURIComponent(session)}&from=atlas`

  // Live data — pulled in parallel so the atlas always shows real state
  const [storytellers, services, voicesPool, elStats, pendingVisionsRes, approvedVisionsRes, projectsRes] =
    await Promise.all([
      getPalmStorytellers().catch(() => []),
      getPiccServices({ status: 'active' }).catch(() => []),
      getVoicesPool().catch(() => []),
      getELStats().catch(() => ({ quotes: 0, transcripts: 0, stories: 0, media: 0 })),
      supabase.from('community_visions').select('id', { count: 'exact', head: true }).eq('is_approved', false),
      supabase.from('community_visions').select('id', { count: 'exact', head: true }).eq('is_approved', true),
      supabase.from('projects').select('id, status', { count: 'exact' }).eq('is_public', true),
    ])

  const distinctNamed = new Set<string>()
  for (const v of voicesPool) {
    if (v.storyteller_id && v.speaker_name) distinctNamed.add(v.storyteller_id)
  }
  const sprintPercent = Math.min(100, Math.round((distinctNamed.size / 20) * 100))

  const projectsData = (projectsRes.data || []) as Array<{ id: string; status: string | null }>
  const projectsByStatus = projectsData.reduce<Record<string, number>>((acc, p) => {
    const k = (p.status || 'unknown').toLowerCase()
    acc[k] = (acc[k] || 0) + 1
    return acc
  }, {})

  const totalServices = services.length
  const totalStorytellers = storytellers.length
  const totalProjects = projectsData.length
  const totalQuotes = elStats.quotes
  const totalApprovedVisions = approvedVisionsRes.count ?? 0
  const totalPendingVisions = pendingVisionsRes.count ?? 0

  const groups: SurfaceGroup[] = [
    {
      id: 'voices',
      label: 'Voices',
      blurb: 'What the community has said, who said it, how it lights up.',
      colour: SECTION_COLOURS.youth,
      icon: <Mic className="w-5 h-5" />,
      surfaces: [
        { title: 'Voices wall', description: 'Validated quotes, searchable, by storyteller.', href: '/voices', count: `${totalQuotes.toLocaleString()} quotes` },
        { title: 'Who — face index', description: 'Every named storyteller, faces first, click into profile.', href: '/voices/who', count: `${totalStorytellers}`, badge: 'New' },
        { title: 'Themes', description: 'Featured themes + the full tag cloud, ranked by frequency.', href: '/voices/themes' },
        { title: 'Community pulse', description: 'Top themes, sentiment, monthly contributions, top voices.', href: '/voices/pulse' },
        { title: 'This month', description: 'Voice-of-the-month with RSS feed.', href: '/voices/this-month' },
        { title: 'Ask a question', description: 'Public Q&A capture surface.', href: '/voices/ask' },
      ],
    },
    {
      id: 'services',
      label: 'Services',
      blurb: 'Every service PICC runs, the people who deliver them, the photos that prove they work.',
      colour: SECTION_COLOURS.educationCommunity,
      icon: <Users className="w-5 h-5" />,
      surfaces: [
        { title: 'All services', description: 'Live map + grid · innovation pills · 26 active services.', href: '/services', count: `${totalServices}` },
        { title: 'Innovation programmes', description: 'The next-20 programmes section + curated projects.', href: '/innovation' },
        { title: 'Coverage audit', description: 'Operator dashboard — which services need a hero photo.', href: '/picc/services/coverage', badge: 'Admin' },
        { title: 'Featured · Bwgcolman Way', description: 'Delegated authority case study — Part 2A in practice.', href: '/bwgcolman' },
      ],
    },
    {
      id: 'projects',
      label: 'Projects',
      blurb: 'What PICC is building right now, by status and theme.',
      colour: SECTION_COLOURS.economic,
      icon: <Sparkles className="w-5 h-5" />,
      surfaces: [
        { title: 'All projects', description: 'Index with status filters · hero photo per card.', href: '/projects', count: `${totalProjects}`, badge: 'New' },
        { title: 'Active', description: 'Live + in-progress projects only.', href: '/projects?status=active', count: `${(projectsByStatus.active || 0) + (projectsByStatus.in_progress || 0)}` },
        { title: 'Planning', description: 'Funded or scoped, not yet active.', href: '/projects?status=planning', count: `${projectsByStatus.planning || 0}` },
        { title: 'Innovation deep-dive', description: 'Curated projects with story-scroll layout.', href: '/innovation' },
      ],
    },
    {
      id: 'elders',
      label: 'Elders',
      blurb: 'Cultural authority. Named, consented, never decoration.',
      colour: SECTION_COLOURS.governance,
      icon: <Compass className="w-5 h-5" />,
      surfaces: [
        { title: 'Elders directory', description: 'Dual-source: PICC profiles + EL v2 quotes, merged + named.', href: '/elders' },
        { title: 'What the Elders teach', description: 'Leadership themes from the named voices.', href: '/elders/leadership' },
        { title: 'Bwgcolman Way', description: 'The case study built around Elder authority + delegated power.', href: '/bwgcolman' },
      ],
    },
    {
      id: 'twenty',
      label: '20-year story',
      blurb: 'Twenty years of community control · the next twenty as a design choice.',
      colour: SECTION_COLOURS.all,
      icon: <Tv2 className="w-5 h-5" />,
      surfaces: [
        { title: '17-year journey', description: 'Year-by-year scroll history with growth chart + milestones.', href: '/20-years' },
        { title: 'Road to 20 years', description: 'Strategy view — where we have been, where next.', href: '/road-to-20-years' },
        { title: 'Next-20 working canvas', description: 'Live-polling visions · forward commitments · urgent asks.', href: '/picc/next-20', badge: 'Admin' },
        { title: 'Next-20 (presenter mode)', description: 'No chrome · projects on screen · live signature loop.', href: '/picc/next-20?presenter=1', badge: 'Admin' },
        { title: 'Sign the vision', description: 'Community canvas — endorse or add your own.', href: signUrl, external: true, count: `${totalApprovedVisions} signed` },
      ],
    },
    {
      id: 'brand',
      label: 'Brand & showcase',
      blurb: 'Saltwater & Earth — how PICC looks, sounds and moves.',
      colour: SECTION_COLOURS.justiceSafety,
      icon: <Camera className="w-5 h-5" />,
      surfaces: [
        { title: 'Design system', description: 'Voice registers · colour as Country · typography lived · the manifesto.', href: '/design-system' },
        { title: 'Animated stats', description: '<AnimatedStat> showcase — five anchor figures.', href: '/design-system/stats', badge: 'New' },
      ],
    },
    {
      id: 'data',
      label: 'Data & finance',
      blurb: 'Real numbers. Real provenance. Real story.',
      colour: SECTION_COLOURS.healthWellbeing,
      icon: <BarChart3 className="w-5 h-5" />,
      surfaces: [
        { title: 'Finances', description: 'Revenue · expenditure · headcount over 17 years.', href: '/picc/finances', badge: 'Admin' },
        { title: 'Governance', description: 'Board · directors · the 2007→2021 transition.', href: '/picc/governance', badge: 'Admin' },
        { title: 'Sector map', description: 'PICC in context — local roots, peak bodies, sector position.', href: '/picc/sector-map', badge: 'Admin' },
        { title: 'Risks register', description: '8 structural pressures with mitigations.', href: '/picc/risks', badge: 'Admin' },
        { title: 'Library', description: 'Knowledge inventory — research sources, methodology, citations.', href: '/picc/library', badge: 'Admin' },
      ],
    },
    {
      id: 'capture',
      label: 'Capture & participation',
      blurb: 'How the community adds to the archive — voice, vision, story, note.',
      colour: SECTION_COLOURS.economic,
      icon: <PenLine className="w-5 h-5" />,
      surfaces: [
        { title: 'Sign the vision', description: 'Endorse one of six visions or add your own. Sessions tagged.', href: '/sign-the-vision', count: `${totalPendingVisions} pending review` },
        { title: 'Leave a note', description: 'Quick free-form capture — public-archive bound.', href: '/share-note' },
        { title: 'Share a story', description: 'Long-form story submission with consent flow.', href: '/share-story' },
        { title: 'Share your voice', description: 'Voice / audio capture surface.', href: '/share-voice' },
        { title: 'Ask a question', description: 'Question goes to public Q&A queue.', href: '/voices/ask' },
      ],
    },
    {
      id: 'operator',
      label: 'Operator',
      blurb: 'What you keep open during the meeting.',
      colour: SECTION_COLOURS.justiceSafety,
      icon: <Search className="w-5 h-5" />,
      surfaces: [
        { title: 'Demo run-of-show', description: '6 acts · session override · QR for audience.', href: '/picc/demo', badge: 'Admin' },
        { title: 'Vision approval queue', description: `Pending review · session filter · approve to push live.`, href: '/picc/vision', count: `${totalPendingVisions} pending`, badge: 'Admin' },
        { title: 'Voices admin', description: '20-voices sprint · capture priority list.', href: '/picc/voices', badge: 'Admin' },
        { title: 'Launchpad', description: '20-year strategic review (Rachel + Narelle sign-off).', href: '/picc/launchpad', badge: 'Admin' },
      ],
    },
  ]

  // Flat list for client search
  const flatSurfaces = groups.flatMap((g) =>
    g.surfaces.map((s) => ({ ...s, group: g.label, groupId: g.id, groupColour: g.colour }))
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FBF8EE' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14">
        {/* Header */}
        <header className="mb-10">
          <div
            className="uppercase font-bold mb-3"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            Atlas · the master surface
          </div>
          <h1
            className="font-fraunces font-bold leading-[1.05] mb-4"
            style={{ color: C.ocean, fontSize: 'clamp(36px, 5.5vw, 64px)' }}
          >
            One page. Every surface. Every connection.
          </h1>
          <p className="font-fraunces max-w-3xl" style={{ color: C.driftwood, fontSize: 18, lineHeight: 1.55 }}>
            Bounce between voices, services, projects, Elders, the 20-year canvas, the data
            and the operator tools — without losing your place. Live counts pulled from the
            community-controlled archive on every load.
          </p>
        </header>

        {/* Live counters */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-12">
          <AnimatedStat value={totalServices} label="Active services" colour="ocean" size="md" provenance="EL v2 / api/picc/services" />
          <AnimatedStat value={totalStorytellers} label="Named storytellers" colour="ochre" size="md" provenance="EL v2 / getPalmStorytellers" />
          <AnimatedStat value={totalQuotes} label="Voices in archive" colour="mangrove" size="md" provenance="EL v2 / extracted_quotes" />
          <AnimatedStat value={totalProjects} label="Public projects" colour="coral" size="md" provenance="PICC / projects.is_public" />
          <AnimatedStat value={totalApprovedVisions} label="Visions on canvas" colour="turtleRed" size="md" provenance={`+${totalPendingVisions} pending review`} delay={400} />
        </section>

        {/* 20-voices sprint progress */}
        <section
          className="mb-12 rounded-2xl border-2 p-6 md:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4"
          style={{ borderColor: distinctNamed.size >= 20 ? C.mangrove : C.starGold, backgroundColor: '#fff' }}
        >
          <div>
            <div className="uppercase font-bold mb-1" style={{ color: C.turtleRed, fontSize: 10, letterSpacing: '0.3em' }}>
              20 Voices for 20 Years · sprint
            </div>
            <div className="font-fraunces font-bold" style={{ color: C.ocean, fontSize: 24 }}>
              {distinctNamed.size} of 20 named voices captured · {sprintPercent}%
            </div>
          </div>
          <div className="flex-1 max-w-md">
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F0EDE7' }}>
              <div className="h-full" style={{ width: `${sprintPercent}%`, backgroundColor: distinctNamed.size >= 20 ? C.mangrove : C.ochre, transition: 'width 600ms ease-out' }} />
            </div>
          </div>
          <Link
            href="/voices/who"
            className="inline-flex items-center gap-1 px-4 py-2.5 rounded-md font-bold uppercase tracking-widest text-xs whitespace-nowrap"
            style={{ backgroundColor: C.ocean, color: '#fff', letterSpacing: '0.15em' }}
          >
            See storytellers <ArrowRight className="w-3 h-3" />
          </Link>
        </section>

        {/* Live signing canvas — QR + ticker info */}
        <section
          className="mb-12 rounded-2xl border-2 overflow-hidden"
          style={{ borderColor: '#F5A623', backgroundColor: '#FFFBEB' }}
        >
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 min-w-0">
              <div className="uppercase font-bold mb-2" style={{ color: C.turtleRed, fontSize: 10, letterSpacing: '0.3em' }}>
                Audience surface · scan to participate
              </div>
              <h3 className="font-fraunces font-bold mb-2" style={{ color: C.ocean, fontSize: 28 }}>
                Sign the next 20 years from your phone.
              </h3>
              <p className="text-sm mb-4" style={{ color: C.driftwood }}>
                QR carries the meeting session ({session}). Submissions land at{' '}
                <Link href="/picc/vision" className="font-bold underline" style={{ color: C.ocean }}>
                  /picc/vision
                </Link>{' '}
                tagged to today. Approvals pulse live on{' '}
                <Link href="/picc/next-20?presenter=1" className="font-bold underline" style={{ color: C.ocean }}>
                  the canvas
                </Link>{' '}
                within ~8 seconds.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Link href="/sign-the-vision" className="px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: C.ocean, color: '#fff', letterSpacing: '0.15em' }}>
                  Open canvas
                </Link>
                <Link href="/picc/demo" className="px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest border" style={{ borderColor: C.ocean, color: C.ocean, letterSpacing: '0.15em' }}>
                  Run-of-show
                </Link>
              </div>
            </div>
            <div className="flex-shrink-0">
              <QRPanel url={signUrl} label="Audience scan" size={180} />
            </div>
          </div>
        </section>

        {/* Search */}
        <section className="mb-10">
          <AtlasSearch surfaces={flatSurfaces} />
        </section>

        {/* Surface groups */}
        <section className="space-y-12">
          {groups.map((g) => (
            <div key={g.id}>
              <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1" style={{ color: g.colour }}>
                    {g.icon}
                    <h2
                      className="font-fraunces font-bold"
                      style={{ color: g.colour, fontSize: 28 }}
                    >
                      {g.label}
                    </h2>
                    <span
                      className="ml-2 text-xs uppercase font-bold tracking-widest"
                      style={{ color: C.driftwood, letterSpacing: '0.2em' }}
                    >
                      {g.surfaces.length} surfaces
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: C.driftwood }}>{g.blurb}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {g.surfaces.map((s) => (
                  <SurfaceTile key={s.href + s.title} surface={s} colour={g.colour} />
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Connections diagram — simple, honest */}
        <section className="mt-16 mb-10">
          <div
            className="uppercase font-bold mb-4"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            How it all links
          </div>
          <div className="rounded-2xl border p-6 md:p-10" style={{ borderColor: C.border, backgroundColor: '#fff' }}>
            <ConnectionsDiagram />
            <p className="text-xs mt-6" style={{ color: C.driftwood }}>
              Voices flow through services and projects · services feed the annual report finance · the 20-year canvas pulls from every domain · the signing surface writes back into the same archive.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

function SurfaceTile({ surface, colour }: { surface: SurfaceCard; colour: string }) {
  return (
    <Link
      href={surface.href}
      target={surface.external ? '_blank' : undefined}
      className="group block rounded-xl border p-5 bg-white hover:shadow-md transition"
      style={{ borderColor: C.border }}
    >
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <h3 className="font-fraunces font-bold" style={{ color: C.ocean, fontSize: 18 }}>
          {surface.title}
        </h3>
        {surface.badge && (
          <span
            className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{
              backgroundColor: surface.badge === 'New' ? colour : '#F0EDE7',
              color: surface.badge === 'New' ? '#fff' : C.driftwood,
              letterSpacing: '0.2em',
            }}
          >
            {surface.badge}
          </span>
        )}
      </div>
      <p className="text-xs mb-3" style={{ color: C.driftwood, lineHeight: 1.5 }}>
        {surface.description}
      </p>
      <div className="flex items-center justify-between">
        {surface.count ? (
          <span className="text-xs font-bold" style={{ color: colour }}>
            {surface.count}
          </span>
        ) : <span />}
        <span className="text-xs font-mono opacity-60 group-hover:opacity-100 truncate ml-2" style={{ color: C.driftwood }}>
          {surface.href.length > 28 ? surface.href.slice(0, 25) + '…' : surface.href}
        </span>
      </div>
    </Link>
  )
}

// Honest, simple connection diagram — pure SVG, no D3 or libraries.
function ConnectionsDiagram() {
  const nodes = [
    { id: 'voices', label: 'Voices', x: 120, y: 80, colour: SECTION_COLOURS.youth },
    { id: 'storytellers', label: 'Storytellers', x: 360, y: 40, colour: SECTION_COLOURS.governance },
    { id: 'services', label: 'Services', x: 360, y: 130, colour: SECTION_COLOURS.educationCommunity },
    { id: 'projects', label: 'Projects', x: 360, y: 220, colour: SECTION_COLOURS.economic },
    { id: 'themes', label: 'Themes', x: 600, y: 80, colour: SECTION_COLOURS.justiceSafety },
    { id: 'finance', label: 'Finance', x: 600, y: 180, colour: SECTION_COLOURS.healthWellbeing },
    { id: 'next20', label: 'Next 20 canvas', x: 840, y: 130, colour: SECTION_COLOURS.all },
    { id: 'sign', label: 'Sign the vision', x: 600, y: 280, colour: '#F5A623' },
  ]

  const edges: [string, string][] = [
    ['voices', 'storytellers'],
    ['voices', 'services'],
    ['voices', 'projects'],
    ['storytellers', 'themes'],
    ['services', 'themes'],
    ['services', 'finance'],
    ['projects', 'themes'],
    ['themes', 'next20'],
    ['finance', 'next20'],
    ['sign', 'next20'],
  ]

  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]))

  return (
    <svg viewBox="0 0 1000 340" className="w-full h-auto" role="img" aria-label="How surfaces connect">
      {edges.map(([a, b]) => {
        const A = byId[a], B = byId[b]
        if (!A || !B) return null
        return (
          <line
            key={`${a}-${b}`}
            x1={A.x}
            y1={A.y}
            x2={B.x}
            y2={B.y}
            stroke={C.driftwood}
            strokeWidth={1.5}
            strokeOpacity={0.35}
          />
        )
      })}
      {nodes.map((n) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r={20} fill={n.colour} />
          <text
            x={n.x}
            y={n.y + 38}
            textAnchor="middle"
            fontSize={12}
            fill={C.ocean}
            fontWeight={700}
            fontFamily="Inter, system-ui, sans-serif"
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
