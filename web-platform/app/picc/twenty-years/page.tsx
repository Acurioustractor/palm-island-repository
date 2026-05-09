/**
 * /picc/twenty-years — the master narrative with charts.
 *
 * One continuous-scroll page that braids everything PICC has into one
 * 20-year story: WHAT WAS (2007 origin) → WHAT IS (today) → WHAT CONNECTS
 * (the wiring) → WHAT'S NEXT (the 20-year dream to 2045).
 *
 * Replaces the need to bounce between /picc/canvas (operator big picture),
 * /picc/walk (presenter map), /picc/launchpad (strategic plan), and
 * /20-years (public scrolling history). This is the showcase.
 *
 * Every section pulls live data + has a brand-aligned chart. No external
 * chart library — all SVG inline, all Saltwater & Earth tokens.
 *
 * Design rule: every number on this page traces to a source. Every
 * visualisation answers a question an Elder, funder, or partner would
 * actually ask.
 */
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/client'
import { getPiccStorytellers } from '@/lib/empathy-ledger/el-storytellers'
import { getPiccServices } from '@/lib/services/el-services'
import { getPiccProjects } from '@/lib/empathy-ledger/el-projects'
import { getThemesIndex } from '@/lib/empathy-ledger/el-themes'
import { C, SECTION_COLOURS } from '@/components/annual-report/2024-25/almanac/tokens'
import { ogMeta } from '@/lib/seo/og'
import PalmIslandMap, { type PinService } from './PalmIslandMap'

export const metadata = ogMeta({
  title: 'Twenty years — the showcase · PICC',
  description: 'One narrative. All the data. The 20-year dream for Palm Island, in charts and voices.',
  path: '/picc/twenty-years',
})

export const dynamic = 'force-dynamic'
export const revalidate = 60

interface Goal {
  id: string
  goal_key: string
  category: string
  label: string
  current_value: number | null
  target_value: number | null
  target_year: number | null
  unit: string | null
}

interface Vision {
  id: string
  vision_text: string
  category: string
  author_name: string | null
}

interface Innovation {
  id: string
  slug: string
  name: string
  category: string | null
  status: string
  people_impacted: number | null
}

const TIMELINE = [
  { year: 2007, label: 'PICC launched', tone: C.ocean },
  { year: 2008, label: 'Community Justice Group auspiced', tone: C.driftwood },
  { year: 2011, label: 'CFC established', tone: SECTION_COLOURS.educationCommunity },
  { year: 2014, label: '~60 staff', tone: C.driftwood },
  { year: 2019, label: 'Ipsos evaluation — restructure case made', tone: C.turtleRed },
  { year: 2021, label: 'Community control achieved', tone: C.ocean },
  { year: 2023, label: 'SNAICC Darwin · DSC opens · Bwgcolman Way blueprint', tone: SECTION_COLOURS.governance },
  { year: 2024, label: 'BHS renamed · First 1000 Days · Bwgcolman Way live', tone: C.ochre },
  { year: 2025, label: '26 services · 58 storytellers · ~$23M revenue', tone: SECTION_COLOURS.healthWellbeing },
  { year: 2029, label: '2029 strategic targets', tone: C.starGold, future: true },
  { year: 2045, label: '20-year vision · community canvas', tone: C.midnight, future: true },
]

const REVENUE_CURVE: Array<{ fy: string; m: number }> = [
  { fy: '08', m: 1.2 },
  { fy: '10', m: 2.5 },
  { fy: '12', m: 4.1 },
  { fy: '14', m: 6.3 },
  { fy: '16', m: 9.2 },
  { fy: '18', m: 12.4 },
  { fy: '20', m: 15.8 },
  { fy: '22', m: 19.6 },
  { fy: '24', m: 22.3 },
  { fy: '25', m: 23.4 },
]

const REVENUE_TARGET = 30 // 2029

const CATEGORY_COLOUR: Record<string, string> = {
  youth: SECTION_COLOURS.educationCommunity,
  health: SECTION_COLOURS.healthWellbeing,
  culture: SECTION_COLOURS.governance,
  economic: SECTION_COLOURS.economic,
  community: SECTION_COLOURS.educationCommunity,
  education: SECTION_COLOURS.educationCommunity,
  governance: SECTION_COLOURS.justiceSafety,
}

export default async function TwentyYearsPage() {
  const supabase = createServerSupabase()
  const [
    storytellers,
    services,
    projects,
    themesIndex,
    goalsRes,
    visionsRes,
    innovationsRes,
    quoteCounts,
  ] = await Promise.all([
    getPiccStorytellers({ limit: 500 }).catch(() => []),
    getPiccServices({ status: 'active' }).catch(() => []),
    getPiccProjects({ status: 'all' }).catch(() => []),
    getThemesIndex().catch(() => ({ total_themes: 0, total_tagged: 0, themes: [] })),
    supabase.from('organization_goals').select('*').eq('is_public', true).order('display_order'),
    supabase.from('community_visions').select('id, vision_text, category, author_name').eq('is_approved', true).order('created_at', { ascending: true }).limit(8),
    supabase.from('innovation_projects').select('id, slug, name, category, status, people_impacted').order('status'),
    Promise.all([
      supabase.from('elder_quotes').select('id', { count: 'exact', head: true }).in('permission_level', ['public', 'community']),
      supabase.from('extracted_quotes').select('id', { count: 'exact', head: true }),
    ]),
  ])

  const goals = (goalsRes.data || []) as Goal[]
  const visions = (visionsRes.data || []) as Vision[]
  const innovations = (innovationsRes.data || []) as Innovation[]
  const [elderQ, extractedQ] = quoteCounts
  const totalQuotes = (elderQ.count || 0) + (extractedQ.count || 0)
  const eldersCount = storytellers.filter((s) => s.is_elder).length
  const topThemes = themesIndex.themes.filter((t) => t.count >= 2).slice(0, 24)
  const maxThemeCount = topThemes[0]?.count || 1

  // Services with GPS pins set in EL canonical (edited via /picc/services/map)
  const pinnedServices: PinService[] = services
    .filter((s) => s.latitude != null && s.longitude != null)
    .map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      service_category: s.service_category,
      latitude: s.latitude as number,
      longitude: s.longitude as number,
    }))

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FBF8EE' }}>
      {/* HERO */}
      <section
        className="px-6 md:px-12 pt-20 pb-16 relative overflow-hidden"
        style={{ backgroundColor: C.midnight }}
      >
        {/* Subtle radial wash so the hero feels like a horizon, not a flat band */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 30% 20%, ${C.ocean}33 0%, transparent 55%)`,
          }}
        />
        <div className="max-w-7xl mx-auto relative">
          <p className="uppercase font-bold mb-5" style={{ color: C.starGold, fontSize: 11, letterSpacing: '0.3em' }}>
            Master showcase · operator narrative
          </p>
          <h1
            className="font-fraunces font-bold leading-[0.98] mb-6"
            style={{ color: '#FBF8EE', fontSize: 'clamp(56px, 9vw, 112px)' }}
          >
            20 years.
            <br />
            One story.
          </h1>
          <p
            className="italic mb-6"
            style={{
              color: C.starGold,
              opacity: 0.9,
              fontFamily: 'Caveat, cursive',
              fontSize: 'clamp(22px, 2.6vw, 30px)',
            }}
          >
            from Palm Island, with provenance
          </p>
          <p className="font-fraunces max-w-3xl" style={{ color: '#FBF8EE', opacity: 0.85, fontSize: 20, lineHeight: 1.55 }}>
            Founded 2007. Community-controlled 2021. Today: {services.length} services,
            {' '}{storytellers.length} storytellers, {totalQuotes.toLocaleString()} quotes,
            {' '}{projects.length} projects, {themesIndex.total_themes} themes named. By 2045:
            a community canvas the next generation owns.
          </p>

          {/* Hero stats strip */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-4">
            <HeroStat n={services.length} label="services · EL canonical" colour={C.starGold} />
            <HeroStat n={storytellers.length} label={`storytellers · ${eldersCount} elders`} colour={C.starGold} />
            <HeroStat n={totalQuotes} label="quotes attributed" colour={C.starGold} />
            <HeroStat n={themesIndex.total_themes} label="themes named" colour={C.starGold} />
            <HeroStat n={projects.length} label="projects on Country" colour={C.starGold} />
          </div>
        </div>
      </section>

      {/* WHAT WAS — timeline */}
      <Section
        eyebrow="01 · What was"
        title="From 2007 to here."
        byline="eighteen years on Country"
        colour={C.ocean}
      >
        <p className="text-sm leading-relaxed max-w-2xl mb-8" style={{ color: C.driftwood }}>
          The 20-year arc, named year by year. Each marker is a real moment — not a slogan. The
          slope of the curve below is what community-controlled organisation looks like at
          scale.
        </p>

        <Timeline />

        <div className="mt-10">
          <h3 className="font-fraunces font-bold mb-3" style={{ color: C.ocean, fontSize: 22 }}>
            Annual revenue curve · FY07-08 → FY24-25
          </h3>
          <p className="text-sm mb-6 max-w-3xl" style={{ color: C.driftwood }}>
            From ~$1.2M founding to ~$23.4M today. The 2029 target is $30M — a flat extrapolation
            of community-controlled growth, not aspirational stretch. Source:{' '}
            <Link href="/picc/finances" className="underline" style={{ color: C.ocean }}>
              /picc/finances
            </Link>
            , 16 years of audited financials.
          </p>
          <RevenueCurveChart />
        </div>
      </Section>

      {/* WHAT IS — operating picture */}
      <Section
        eyebrow="02 · What is"
        title="Today's operating picture."
        byline="every number traces to a row"
        colour={SECTION_COLOURS.healthWellbeing}
        alt
      >
        <p className="text-sm leading-relaxed max-w-2xl mb-8" style={{ color: C.driftwood }}>
          Live counts from the canonical EL roster + PICC archive. Every number traces to a row.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <BigStat n={services.length} label="Active services" colour={SECTION_COLOURS.healthWellbeing} href="/picc/services/coverage" />
          <BigStat n={projects.length} label="Projects" colour={SECTION_COLOURS.economic} href="/picc/projects/coverage" />
          <BigStat n={storytellers.length} label="Storytellers" colour={C.ocean} href="/picc/voices" />
          <BigStat n={eldersCount} label="Elders" colour={C.ochre} href="/elders" />
          <BigStat n={totalQuotes} label="Quotes" colour={C.turtleRed} href="/voices/themes" />
          <BigStat n={themesIndex.total_themes} label="Themes" colour={SECTION_COLOURS.governance} href="/voices/themes" />
        </div>

        {/* Palm Island map — services with GPS pins */}
        {pinnedServices.length > 0 && (
          <div className="mt-12">
            <h3 className="font-fraunces font-bold mb-3" style={{ color: C.ocean, fontSize: 22 }}>
              Where the work happens · {pinnedServices.length} services on Country
            </h3>
            <p className="text-sm mb-6 max-w-3xl" style={{ color: C.driftwood }}>
              Every pin is a real building, a real shopfront, a real spot on the island. Coordinates
              are set in EL canonical and edited from{' '}
              <Link href="/picc/services/map" className="underline" style={{ color: C.ocean }}>
                /picc/services/map
              </Link>
              {' '}— drag any pin, save flows back to the source of truth.
            </p>
            <PalmIslandMap services={pinnedServices} />
          </div>
        )}

        <div className="mt-12">
          <h3 className="font-fraunces font-bold mb-3" style={{ color: C.ocean, fontSize: 22 }}>
            What the community is speaking to · top {topThemes.length} themes
          </h3>
          <p className="text-sm mb-6 max-w-3xl" style={{ color: C.driftwood }}>
            Theme bubble size = number of attributed quotes. The strongest threads are family,
            healing, elders, country. The shape of this map is what 20 years of conversation
            looks like.
          </p>
          <ThemeBubbleCloud themes={topThemes} maxCount={maxThemeCount} />
        </div>
      </Section>

      {/* WHAT CONNECTS — wiring */}
      <Section
        eyebrow="03 · What connects"
        title="The wiring."
        byline="storytellers are the bridge"
        colour={C.ochre}
      >
        <p className="text-sm leading-relaxed max-w-2xl mb-8" style={{ color: C.driftwood }}>
          Storytellers are the bridge. Every storyteller links to services they deliver or use,
          projects they&apos;re in, and the themes they&apos;re named in. The platform is a graph,
          not a list.
        </p>

        <ConnectionsDiagram
          servicesCount={services.length}
          storytellersCount={storytellers.length}
          projectsCount={projects.length}
          themesCount={themesIndex.total_themes}
          quotesCount={totalQuotes}
        />

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <ConnectCard
            num="A"
            title="Services ↔ Storytellers"
            body="58 storytellers linked to 26 services via storyteller_services. Click any service detail page to see who delivers it; click any voice profile to see their service surfaces."
            href="/services"
            colour={SECTION_COLOURS.healthWellbeing}
          />
          <ConnectCard
            num="B"
            title="Projects ↔ Services"
            body="Soft-linkage by shared storytellers. 10 projects join the 26 services through who delivers them. Made visible on every detail page."
            href="/projects"
            colour={SECTION_COLOURS.economic}
          />
          <ConnectCard
            num="C"
            title="Voices ↔ Themes"
            body={`${totalQuotes.toLocaleString()} quotes tagged across ${themesIndex.total_themes} themes. Click any theme to see every voice that named it. Editor-curated featured themes for the year.`}
            href="/voices/themes"
            colour={SECTION_COLOURS.governance}
          />
          <ConnectCard
            num="D"
            title="Photos ↔ Faces"
            body="Every face in every photo, consented at the source. Storyteller connections graph at /voices/network shows shared photos as edges."
            href="/voices/network"
            colour={C.ocean}
          />
        </div>
      </Section>

      {/* WHAT'S NEXT — the 20-year dream */}
      <Section
        eyebrow="04 · What's next"
        title="The 20-year dream."
        byline="a design choice, not a forecast"
        colour={C.starGold}
        alt
      >
        <p className="text-sm leading-relaxed max-w-2xl mb-8" style={{ color: C.driftwood }}>
          {goals.length} strategic targets named for 2029. {visions.length} community visions on
          the canvas. {innovations.length} innovation projects shipping. The next 20 years are a
          design choice, not a forecast.
        </p>

        {/* Goals as radial progress + horizontal bars */}
        <div className="mb-12">
          <h3 className="font-fraunces font-bold mb-3" style={{ color: C.ocean, fontSize: 22 }}>
            2029 strategic goals · {goals.length}
          </h3>
          <GoalsProgressChart goals={goals} />
        </div>

        {/* Innovation pipeline */}
        {innovations.length > 0 && (
          <div className="mb-12">
            <h3 className="font-fraunces font-bold mb-3" style={{ color: C.ocean, fontSize: 22 }}>
              Innovation pipeline · {innovations.length} projects
            </h3>
            <InnovationPipeline innovations={innovations} />
          </div>
        )}

        {/* Community visions */}
        {visions.length > 0 && (
          <div>
            <h3 className="font-fraunces font-bold mb-3" style={{ color: C.ocean, fontSize: 22 }}>
              Community visions · {visions.length} signed
            </h3>
            <p className="text-sm mb-6 max-w-3xl" style={{ color: C.driftwood }}>
              These are real signatures on the open canvas. Goal: 200 by 2029.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visions.slice(0, 6).map((v) => {
                const colour = CATEGORY_COLOUR[v.category] || C.driftwood
                return (
                  <div
                    key={v.id}
                    className="p-5 rounded-2xl bg-white border-l-4"
                    style={{ borderLeftColor: colour, border: `1px solid ${colour}33`, borderLeftWidth: 4 }}
                  >
                    <p className="font-fraunces italic leading-snug mb-3" style={{ color: C.earth, fontSize: 16 }}>
                      &ldquo;{v.vision_text.slice(0, 200)}{v.vision_text.length > 200 ? '…' : ''}&rdquo;
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: colour, letterSpacing: '0.2em' }}>
                        {v.category}
                      </span>
                      <span className="text-xs" style={{ color: C.driftwood }}>· {v.author_name || 'Anonymous'}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Section>

      {/* CLOSING ARC */}
      <section className="px-6 md:px-12 py-16" style={{ backgroundColor: C.midnight }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="uppercase font-bold mb-3" style={{ color: C.starGold, fontSize: 11, letterSpacing: '0.3em' }}>
            The frame
          </p>
          <h2
            className="font-fraunces font-bold leading-tight mb-6"
            style={{ color: '#FBF8EE', fontSize: 'clamp(32px, 5vw, 56px)' }}
          >
            Twenty years of community control. Twenty years of community canvas.
          </h2>
          <p className="font-fraunces" style={{ color: '#FBF8EE', opacity: 0.85, fontSize: 18, lineHeight: 1.6 }}>
            The flood and the rebuild are the same story. Bwgcolman Way is the proof point.
            The next 20 years are what the community names — signed, tracked, and held
            by the people they belong to.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs">
            <Link href="/atlas" target="_blank" className="px-5 py-2.5 rounded-md font-bold uppercase tracking-widest" style={{ backgroundColor: C.starGold, color: C.midnight, letterSpacing: '0.15em' }}>
              Public atlas →
            </Link>
            <Link href="/picc/canvas" className="px-5 py-2.5 rounded-md font-semibold" style={{ backgroundColor: '#FBF8EE22', color: '#FBF8EE' }}>
              Operator canvas →
            </Link>
            <Link href="/picc/walk" className="px-5 py-2.5 rounded-md font-semibold" style={{ backgroundColor: '#FBF8EE22', color: '#FBF8EE' }}>
              Stage walk →
            </Link>
            <Link href="/get-involved" className="px-5 py-2.5 rounded-md font-semibold" style={{ backgroundColor: '#FBF8EE22', color: '#FBF8EE' }}>
              Get involved →
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

// ─── COMPONENTS ────────────────────────────────────────────────────────

function Section({ eyebrow, title, colour, byline, alt, children }: {
  eyebrow: string
  title: string
  colour: string
  byline?: string
  alt?: boolean
  children: React.ReactNode
}) {
  return (
    <section
      className="px-6 md:px-12 py-20 md:py-24"
      style={{ backgroundColor: alt ? C.shell : '#FBF8EE' }}
    >
      <div className="max-w-7xl mx-auto">
        <p className="uppercase font-bold mb-3" style={{ color: colour, fontSize: 11, letterSpacing: '0.3em' }}>
          {eyebrow}
        </p>
        <div className="flex items-baseline gap-4 flex-wrap mb-10">
          <h2 className="font-fraunces font-bold leading-[1.05]" style={{ color: C.ocean, fontSize: 'clamp(36px, 6vw, 64px)' }}>
            {title}
          </h2>
          {byline && (
            <span
              className="italic"
              style={{ color: colour, fontFamily: 'Caveat, cursive', fontSize: 'clamp(20px, 2.5vw, 28px)' }}
            >
              {byline}
            </span>
          )}
        </div>
        {children}
      </div>
    </section>
  )
}

function HeroStat({ n, label, colour }: { n: number; label: string; colour: string }) {
  return (
    <div>
      <div className="font-fraunces font-bold leading-none" style={{ color: colour, fontSize: 'clamp(36px, 5vw, 56px)' }}>
        {n.toLocaleString()}
      </div>
      <div className="text-[11px] mt-2 uppercase font-bold tracking-widest" style={{ color: '#FBF8EE', opacity: 0.7, letterSpacing: '0.2em' }}>
        {label}
      </div>
    </div>
  )
}

function BigStat({ n, label, colour, href }: { n: number; label: string; colour: string; href: string }) {
  return (
    <Link
      href={href}
      className="block rounded-xl bg-white p-4 hover:shadow-sm transition"
      style={{ border: `1px solid ${C.border}`, borderTopWidth: 3, borderTopColor: colour }}
    >
      <div className="text-[10px] uppercase font-bold" style={{ color: colour, letterSpacing: '0.2em' }}>
        {label}
      </div>
      <div className="font-fraunces font-bold mt-1 leading-none" style={{ color: C.ocean, fontSize: 32 }}>
        {n.toLocaleString()}
      </div>
    </Link>
  )
}

// ─── CHARTS (inline SVG, brand palette) ───────────────────────────────

function Timeline() {
  const minYear = 2007
  const maxYear = 2045
  const W = 1000
  const H = 200
  const xFor = (year: number) => ((year - minYear) / (maxYear - minYear)) * (W - 80) + 40

  return (
    <div className="rounded-2xl bg-white p-6" style={{ border: `1px solid ${C.border}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="w-full h-auto">
        {/* Spine */}
        <line x1={40} y1={H / 2} x2={W - 40} y2={H / 2} stroke={C.border} strokeWidth={2} />
        {/* Past/future divider at 2025 */}
        <line x1={xFor(2025)} y1={20} x2={xFor(2025)} y2={H - 20} stroke={C.border} strokeWidth={1} strokeDasharray="3 3" />
        <text x={xFor(2025)} y={15} textAnchor="middle" fontSize={9} fill={C.driftwood}>NOW</text>

        {/* Events */}
        {TIMELINE.map((t, i) => {
          const x = xFor(t.year)
          const above = i % 2 === 0
          const y = above ? H / 2 - 8 : H / 2 + 8
          const labelY = above ? y - 30 : y + 30
          return (
            <g key={t.year}>
              <circle cx={x} cy={H / 2} r={t.future ? 5 : 6} fill={t.tone} opacity={t.future ? 0.6 : 1} stroke="white" strokeWidth={2} />
              <line x1={x} y1={H / 2} x2={x} y2={above ? y - 6 : y + 6} stroke={t.tone} strokeWidth={1} opacity={0.5} />
              <text x={x} y={labelY} textAnchor="middle" fontSize={11} fill={C.ocean} fontWeight="bold">
                {t.year}
              </text>
              <text x={x} y={labelY + (above ? -12 : 14)} textAnchor="middle" fontSize={9} fill={C.driftwood} opacity={0.85}>
                <tspan>{t.label.slice(0, 32)}</tspan>
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function RevenueCurveChart() {
  const W = 1000
  const H = 320
  const padX = 50
  const padY = 40
  const points = REVENUE_CURVE
  const xFor = (i: number) => (i / (points.length - 1)) * (W - 2 * padX) + padX
  const yMax = REVENUE_TARGET
  const yFor = (m: number) => H - padY - (m / yMax) * (H - 2 * padY)

  // Build path
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(p.m)}`).join(' ')
  // Future projection: from last actual to (2029, 30)
  const lastIdx = points.length - 1
  const futurePath = `M ${xFor(lastIdx)} ${yFor(points[lastIdx].m)} L ${W - padX} ${yFor(REVENUE_TARGET)}`

  // Y-axis ticks
  const yTicks = [0, 10, 20, 30]

  return (
    <div className="rounded-2xl bg-white p-6" style={{ border: `1px solid ${C.border}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="w-full h-auto">
        {/* Grid */}
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={padX} y1={yFor(t)} x2={W - padX} y2={yFor(t)} stroke={C.border} strokeWidth={1} />
            <text x={padX - 8} y={yFor(t) + 4} textAnchor="end" fontSize={10} fill={C.driftwood}>
              ${t}M
            </text>
          </g>
        ))}

        {/* Area under actual */}
        <path
          d={`${linePath} L ${xFor(lastIdx)} ${H - padY} L ${xFor(0)} ${H - padY} Z`}
          fill={C.ocean}
          opacity={0.1}
        />

        {/* Future projection line */}
        <path d={futurePath} fill="none" stroke={C.ochre} strokeWidth={2} strokeDasharray="6 4" />
        {/* Target marker */}
        <circle cx={W - padX} cy={yFor(REVENUE_TARGET)} r={5} fill={C.starGold} stroke="white" strokeWidth={2} />
        <text x={W - padX - 8} y={yFor(REVENUE_TARGET) - 8} textAnchor="end" fontSize={10} fill={C.ochre} fontWeight="bold">
          2029 target · $30M
        </text>

        {/* Actual line */}
        <path d={linePath} fill="none" stroke={C.ocean} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Points + labels */}
        {points.map((p, i) => (
          <g key={p.fy}>
            <circle cx={xFor(i)} cy={yFor(p.m)} r={3.5} fill={C.ocean} />
            {i === lastIdx && (
              <text x={xFor(i) + 8} y={yFor(p.m) - 6} fontSize={10} fontWeight="bold" fill={C.ocean}>
                FY24-25 · ${p.m}M
              </text>
            )}
          </g>
        ))}

        {/* X labels */}
        {points.filter((_, i) => i % 2 === 0 || i === lastIdx).map((p, i, arr) => {
          const realIdx = points.findIndex((x) => x.fy === p.fy)
          return (
            <text
              key={p.fy}
              x={xFor(realIdx)}
              y={H - padY + 16}
              textAnchor="middle"
              fontSize={10}
              fill={C.driftwood}
            >
              FY{p.fy}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

function ThemeBubbleCloud({ themes, maxCount }: { themes: Array<{ theme: string; count: number }>; maxCount: number }) {
  // Pack bubbles in a flow-wrap layout, sized by count
  const palette = [C.ocean, C.ochre, SECTION_COLOURS.healthWellbeing, SECTION_COLOURS.governance, C.turtleRed]
  return (
    <div className="rounded-2xl bg-white p-6 flex flex-wrap items-center gap-3" style={{ border: `1px solid ${C.border}`, minHeight: 320 }}>
      {themes.map((t, i) => {
        const ratio = t.count / maxCount
        const fontSize = Math.max(13, Math.round(14 + ratio * 28))
        const colour = palette[i % palette.length]
        const opacity = 0.7 + ratio * 0.3
        return (
          <Link
            key={t.theme}
            href={`/voices/themes/${encodeURIComponent(t.theme)}`}
            className="inline-flex items-baseline gap-2 rounded-full hover:shadow-sm transition px-4 py-2"
            style={{
              backgroundColor: colour + '15',
              border: `1px solid ${colour}33`,
              fontSize,
              opacity,
            }}
          >
            <span className="font-fraunces capitalize font-medium" style={{ color: colour }}>
              {t.theme}
            </span>
            <span className="text-xs font-mono" style={{ color: C.driftwood }}>{t.count}</span>
          </Link>
        )
      })}
    </div>
  )
}

function GoalsProgressChart({ goals }: { goals: Goal[] }) {
  return (
    <div className="rounded-2xl bg-white p-6 flex flex-col gap-4" style={{ border: `1px solid ${C.border}` }}>
      {goals.map((g) => {
        const cur = Number(g.current_value) || 0
        const tgt = Number(g.target_value) || 1
        const pct = Math.min(Math.round((cur / tgt) * 100), 100)
        const display = (v: number) => g.unit === '$' ? `$${(v / 1_000_000).toFixed(1)}M` : v.toLocaleString()
        const colour =
          g.category === 'voice' ? C.ocean :
          g.category === 'delivery' ? SECTION_COLOURS.healthWellbeing :
          g.category === 'workforce' ? SECTION_COLOURS.educationCommunity :
          g.category === 'financial' ? SECTION_COLOURS.economic :
          g.category === 'innovation' ? C.ochre :
          g.category === 'governance' ? SECTION_COLOURS.governance :
          C.driftwood
        return (
          <div key={g.id}>
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <span className="font-medium text-sm" style={{ color: C.ocean }}>{g.label}</span>
              <span className="text-xs font-mono" style={{ color: C.driftwood }}>
                {display(cur)} <span style={{ opacity: 0.55 }}>/ {display(tgt)} {g.unit && g.unit !== '$' ? g.unit : ''} by {g.target_year}</span>
              </span>
            </div>
            <div className="h-2 rounded-full" style={{ backgroundColor: colour + '15' }}>
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: colour }}
              />
            </div>
            <div className="text-[10px] mt-1 uppercase font-bold tracking-widest" style={{ color: colour, letterSpacing: '0.2em' }}>
              {pct}% · {g.category}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function InnovationPipeline({ innovations }: { innovations: Innovation[] }) {
  return (
    <div className="rounded-2xl bg-white p-6 flex flex-col gap-3" style={{ border: `1px solid ${C.border}` }}>
      {innovations.map((p) => {
        const colour =
          p.status === 'active' ? '#16A34A' :
          p.status === 'planning' ? C.ochre :
          p.status === 'completed' ? C.ocean :
          C.driftwood
        return (
          <div key={p.id} className="flex items-center gap-4">
            <span
              className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded w-24 text-center"
              style={{ backgroundColor: colour + '22', color: colour, letterSpacing: '0.15em' }}
            >
              {p.status}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-fraunces font-bold leading-tight truncate" style={{ color: C.ocean, fontSize: 16 }}>
                {p.name}
              </div>
              <div className="text-xs flex items-center gap-3 mt-0.5" style={{ color: C.driftwood }}>
                {p.category && <span className="uppercase tracking-widest">{p.category}</span>}
                {p.people_impacted != null && p.people_impacted > 0 && (
                  <span>· 👥 {p.people_impacted.toLocaleString()} impacted</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ConnectionsDiagram({ servicesCount, storytellersCount, projectsCount, themesCount, quotesCount }: {
  servicesCount: number
  storytellersCount: number
  projectsCount: number
  themesCount: number
  quotesCount: number
}) {
  // Orbital diagram. Storytellers as the central bridge; four satellites
  // at clean 45° clock positions (no edge crossings), connected by gentle
  // Bezier curves with verb labels.
  const W = 1100
  const H = 560
  const cx = W / 2
  const cy = H / 2
  const R = 200 // orbital radius from centre to satellite centres
  const cosA = Math.cos(Math.PI / 4) // 45°
  const sinA = Math.sin(Math.PI / 4)

  const centre = {
    x: cx, y: cy, r: 78, label: 'Storytellers', n: storytellersCount,
    colour: C.ocean, sub: 'the bridge',
  }
  const satellites = [
    {
      key: 'services',
      x: cx - R * cosA, y: cy - R * sinA, r: 58,
      label: 'Services', n: servicesCount,
      colour: SECTION_COLOURS.healthWellbeing,
      sub: 'EL canonical', verb: 'deliver',
    },
    {
      key: 'projects',
      x: cx + R * cosA, y: cy - R * sinA, r: 56,
      label: 'Projects', n: projectsCount,
      colour: SECTION_COLOURS.economic,
      sub: 'on Country', verb: 'lead',
    },
    {
      key: 'themes',
      x: cx - R * cosA, y: cy + R * sinA, r: 56,
      label: 'Themes', n: themesCount,
      colour: SECTION_COLOURS.governance,
      sub: 'named', verb: 'speak',
    },
    {
      key: 'quotes',
      x: cx + R * cosA, y: cy + R * sinA, r: 60,
      label: 'Quotes', n: quotesCount,
      colour: C.turtleRed,
      sub: 'attributed', verb: 'attribute',
    },
  ]

  // Bezier control points sit between centre and satellite, slightly
  // pulled toward each axis so the curves bow outward rather than running
  // straight.
  const edgePath = (sx: number, sy: number, ex: number, ey: number) => {
    const mx = (sx + ex) / 2
    const my = (sy + ey) / 2
    // perpendicular offset for curve
    const dx = ex - sx
    const dy = ey - sy
    const norm = Math.sqrt(dx * dx + dy * dy)
    const nx = -dy / norm
    const ny = dx / norm
    const offset = 18
    return `M ${sx} ${sy} Q ${mx + nx * offset} ${my + ny * offset} ${ex} ${ey}`
  }

  return (
    <div
      className="rounded-2xl p-6 md:p-10 relative overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at center, ${C.shell} 0%, #FBF8EE 75%)`,
        border: `1px solid ${C.border}`,
      }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-auto"
        style={{ display: 'block' }}
      >
        <defs>
          {/* radial gradient for centre node fill */}
          <radialGradient id="centreFill" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={C.ocean} stopOpacity="0.18" />
            <stop offset="100%" stopColor={C.ocean} stopOpacity="0.05" />
          </radialGradient>
          {satellites.map((s) => (
            <radialGradient key={`grad-${s.key}`} id={`fill-${s.key}`} cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor={s.colour} stopOpacity="0.20" />
              <stop offset="100%" stopColor={s.colour} stopOpacity="0.06" />
            </radialGradient>
          ))}
        </defs>

        {/* Outer orbit ring — tactile, not decorative */}
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke={C.border}
          strokeWidth={1}
          strokeDasharray="2 6"
          opacity={0.7}
        />

        {/* Edges — Bezier curves with verb labels */}
        {satellites.map((s) => {
          // Trim edge endpoints to circle perimeters so lines don't disappear under nodes
          const dx = s.x - cx
          const dy = s.y - cy
          const len = Math.sqrt(dx * dx + dy * dy)
          const ux = dx / len
          const uy = dy / len
          const startX = cx + ux * centre.r
          const startY = cy + uy * centre.r
          const endX = s.x - ux * s.r
          const endY = s.y - uy * s.r
          // Mid-point for label
          const lx = (startX + endX) / 2
          const ly = (startY + endY) / 2
          // Angle for label rotation (so it reads with the line)
          const angleDeg = (Math.atan2(endY - startY, endX - startX) * 180) / Math.PI
          // Flip readability if text would render upside down
          const flip = angleDeg > 90 || angleDeg < -90
          const rot = flip ? angleDeg + 180 : angleDeg
          return (
            <g key={`edge-${s.key}`}>
              <path
                d={edgePath(startX, startY, endX, endY)}
                fill="none"
                stroke={s.colour}
                strokeWidth={2}
                strokeLinecap="round"
                opacity={0.45}
              />
              {/* Verb label */}
              <g transform={`translate(${lx} ${ly}) rotate(${rot})`}>
                <rect
                  x={-22}
                  y={-9}
                  width={44}
                  height={18}
                  rx={9}
                  fill="#FBF8EE"
                  stroke={s.colour + '33'}
                  strokeWidth={1}
                />
                <text
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={700}
                  fill={s.colour}
                  letterSpacing="1.2"
                  y={3}
                >
                  {s.verb.toUpperCase()}
                </text>
              </g>
            </g>
          )
        })}

        {/* Centre node — soft halo + circle */}
        <circle cx={centre.x} cy={centre.y} r={centre.r + 18} fill={C.ocean} opacity={0.04} />
        <circle cx={centre.x} cy={centre.y} r={centre.r + 8} fill="none" stroke={C.ocean} strokeOpacity={0.15} strokeWidth={1} strokeDasharray="3 4" />
        <circle cx={centre.x} cy={centre.y} r={centre.r} fill="url(#centreFill)" stroke={C.ocean} strokeWidth={2.5} />
        <text
          x={centre.x} y={centre.y - 8}
          textAnchor="middle"
          fontSize={36}
          fontWeight={700}
          fill={C.ocean}
          fontFamily="Fraunces, Georgia, serif"
        >
          {centre.n.toLocaleString()}
        </text>
        <text
          x={centre.x} y={centre.y + 14}
          textAnchor="middle"
          fontSize={10}
          fontWeight={700}
          fill={C.ocean}
          letterSpacing="3"
        >
          {centre.label.toUpperCase()}
        </text>
        <text
          x={centre.x} y={centre.y + 32}
          textAnchor="middle"
          fontSize={11}
          fill={C.ochre}
          fontStyle="italic"
          fontFamily="Caveat, cursive"
        >
          {centre.sub}
        </text>

        {/* Satellite nodes */}
        {satellites.map((s) => (
          <g key={s.key}>
            {/* halo */}
            <circle cx={s.x} cy={s.y} r={s.r + 6} fill={s.colour} opacity={0.05} />
            <circle
              cx={s.x} cy={s.y}
              r={s.r}
              fill={`url(#fill-${s.key})`}
              stroke={s.colour}
              strokeWidth={2}
            />
            <text
              x={s.x} y={s.y - 4}
              textAnchor="middle"
              fontSize={26}
              fontWeight={700}
              fill={s.colour}
              fontFamily="Fraunces, Georgia, serif"
            >
              {s.n.toLocaleString()}
            </text>
            <text
              x={s.x} y={s.y + 14}
              textAnchor="middle"
              fontSize={9}
              fontWeight={700}
              fill={C.ocean}
              letterSpacing="2.5"
            >
              {s.label.toUpperCase()}
            </text>
            <text
              x={s.x} y={s.y + 28}
              textAnchor="middle"
              fontSize={10}
              fill={C.driftwood}
              fontStyle="italic"
              fontFamily="Caveat, cursive"
            >
              {s.sub}
            </text>
          </g>
        ))}
      </svg>

      {/* Caption */}
      <p
        className="absolute bottom-4 right-6 italic text-[11px]"
        style={{ color: C.driftwood, fontFamily: 'Caveat, cursive', fontSize: 14 }}
      >
        the platform is a graph, not a list
      </p>
    </div>
  )
}

function ConnectCard({ num, title, body, href, colour }: { num: string; title: string; body: string; href: string; colour: string }) {
  return (
    <Link
      href={href}
      className="block p-6 rounded-2xl bg-white hover:shadow-sm transition"
      style={{ border: `1px solid ${C.border}`, borderTopWidth: 3, borderTopColor: colour }}
    >
      <div className="flex items-baseline gap-3 mb-2">
        <span className="font-mono text-xs" style={{ color: colour, letterSpacing: '0.2em' }}>
          {num}
        </span>
        <h3 className="font-fraunces font-bold leading-tight" style={{ color: C.ocean, fontSize: 20 }}>
          {title}
        </h3>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: C.driftwood }}>{body}</p>
      <div className="mt-3 text-[10px] uppercase font-bold tracking-widest" style={{ color: colour, letterSpacing: '0.2em' }}>
        Open →
      </div>
    </Link>
  )
}
