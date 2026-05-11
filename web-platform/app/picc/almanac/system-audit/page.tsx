/**
 * /picc/almanac/system-audit — what we have in EL/PICC vs what's in the
 * 22-spread report. Surfaces the GAPS so editors can decide what extra
 * spreads to build, what to elevate, what to leave out.
 *
 * Categories audited:
 *   - Storytellers (58 in EL · 16 named in Voices spread)
 *   - Quotes (148 captured · 19 placed in spreads)
 *   - Services (26 in EL · 3 featured + 30 listed)
 *   - Projects (9 in EL · 1 featured)
 *   - Photos by slot (104 synced)
 *   - Action items (live from meetings)
 *   - Trip plans (Atherton 2026)
 */
import Link from 'next/link'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ExternalLink, ArrowRight } from 'lucide-react'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'
import { IMAGE_TARGETS } from '@/lib/almanac/pencil-image-targets'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export const metadata = {
  title: 'System audit · PICC Almanac',
  description: 'What lives in EL/PICC vs what made it into the 22-spread report. Find the gaps.',
}

async function fetchEL<T>(path: string): Promise<T | null> {
  const base = process.env.EL_V2_API_URL?.replace(/\/$/, '')
  const key = process.env.EL_V2_API_KEY
  if (!base || !key) return null
  try {
    const r = await fetch(`${base}${path}`, { headers: { 'x-picc-api-key': key }, cache: 'no-store' })
    if (!r.ok) return null
    return (await r.json()) as T
  } catch {
    return null
  }
}

async function loadQuoteCount(): Promise<number> {
  try {
    const dir = join(process.cwd(), 'scripts', 'reports')
    const files = (await readdir(dir)).filter((f) => /elders-bios-quotes.*\.json/.test(f))
    if (files.length === 0) return 0
    const data = JSON.parse(await readFile(join(dir, files.sort().pop()!), 'utf8')) as { totals?: { quotes?: number } }
    return data.totals?.quotes ?? 0
  } catch {
    return 0
  }
}

export default async function SystemAuditPage() {
  const [stData, svcData, prjData, quoteCount] = await Promise.all([
    fetchEL<{ count: number; storytellers: Array<{ slug: string; display_name: string; photo_url?: string; quote_count?: number; is_elder?: boolean }> }>('/api/picc/storytellers?limit=200'),
    fetchEL<{ count: number; services: Array<{ slug: string; name: string; image_url?: string; category?: string }> }>('/api/picc/services?limit=200'),
    fetchEL<{ count: number; projects: Array<{ slug: string; name: string; cover_image_url?: string; status?: string; description?: string }> }>('/api/picc/projects?limit=200'),
    loadQuoteCount(),
  ])

  const storytellers = stData?.storytellers ?? []
  const services = svcData?.services ?? []
  const projects = prjData?.projects ?? []

  // Which storytellers are NAMED in IMAGE_TARGETS (i.e. have a portrait spot)
  const featuredStorytellerSlugs = new Set(
    IMAGE_TARGETS.map((t) => (t as ImageTargetWithEntities).storytellerSlug).filter(Boolean) as string[],
  )
  const featuredServiceSlugs = new Set(
    IMAGE_TARGETS.map((t) => (t as ImageTargetWithEntities).serviceSlug).filter(Boolean) as string[],
  )

  const namedStorytellers = storytellers.filter((s) => featuredStorytellerSlugs.has(s.slug))
  const unfeaturedStorytellers = storytellers
    .filter((s) => s.photo_url && (s.quote_count ?? 0) > 0 && !featuredStorytellerSlugs.has(s.slug))
    .sort((a, b) => (b.quote_count ?? 0) - (a.quote_count ?? 0))

  const featuredServices = services.filter((s) => featuredServiceSlugs.has(s.slug))
  const unfeaturedServices = services.filter((s) => !featuredServiceSlugs.has(s.slug))

  // ALL projects are unfeatured currently (only Bwgcolman Way is mentioned, picc-elders implied)
  const unfeaturedProjects = projects

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <p className="font-bold uppercase mb-3" style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}>
          PICC · ALMANAC · SYSTEM AUDIT
        </p>
        <h1 className="font-fraunces font-bold mb-3" style={{ color: C.ocean, fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.05 }}>
          What's in the system. What made the report. The gaps.
        </h1>
        <p className="font-fraunces mb-6" style={{ color: C.driftwood, fontSize: 20, lineHeight: 1.4, maxWidth: 760 }}>
          Every storyteller, service, project, and quote in EL — sorted by what's
          featured in the 22-spread Saltwater Almanac vs what's still waiting for a
          spread. Use this to decide: who else deserves a page?
        </p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
        <Stat label="Storytellers" total={storytellers.length} featured={namedStorytellers.length} unit="people" color={C.ocean} />
        <Stat label="Services" total={services.length} featured={featuredServices.length} unit="services" color={C.mangrove} />
        <Stat label="Projects" total={projects.length} featured={1} unit="projects" color={C.reef} />
        <Stat label="EL quotes captured" total={quoteCount} featured={19} unit="placed in spreads" color={C.ochre} />
      </section>

      {/* STORYTELLERS not yet in the report */}
      <Section
        title="Storytellers in EL · waiting for a page"
        intro={`${unfeaturedStorytellers.length} people have a photo + quotes uploaded to EL but aren't named in any of the 22 spreads. The Voices page holds 16. Most-quoted come first.`}
        accent={C.ocean}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {unfeaturedStorytellers.slice(0, 24).map((s) => (
            <article
              key={s.slug}
              className="rounded-lg p-4 flex items-start gap-3"
              style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}` }}
            >
              {s.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.photo_url}
                  alt={s.display_name}
                  className="w-16 h-16 rounded object-cover flex-shrink-0"
                  style={{ backgroundColor: C.shell }}
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-fraunces font-bold flex items-center gap-1 flex-wrap" style={{ color: C.ocean, fontSize: 14, lineHeight: 1.2 }}>
                  {s.display_name}
                  {s.is_elder && (
                    <span className="text-[10px] px-1 py-0.5 rounded" style={{ backgroundColor: C.ochre + '14', color: C.ochre, fontWeight: 700 }}>
                      ✦
                    </span>
                  )}
                </h3>
                <p className="text-xs mt-1" style={{ color: C.muted }}>
                  <code>{s.slug}</code>
                </p>
                <p className="text-xs mt-1 font-bold" style={{ color: C.turtleRed }}>
                  {s.quote_count ?? 0} quotes in EL
                </p>
              </div>
            </article>
          ))}
        </div>
        {unfeaturedStorytellers.length > 24 && (
          <p className="mt-4 text-sm font-fraunces italic" style={{ color: C.muted }}>
            … and {unfeaturedStorytellers.length - 24} more.
          </p>
        )}
      </Section>

      {/* PROJECTS not in report */}
      <Section
        title="Projects in EL · only one is featured"
        intro="The report mentions Bwgcolman Way (project: bwg-way) but EL has 9 projects with cover photos uploaded. These are real PICC initiatives that could each anchor their own spread."
        accent={C.reef}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {unfeaturedProjects.map((p) => (
            <article
              key={p.slug}
              className="rounded-lg overflow-hidden flex"
              style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}` }}
            >
              {p.cover_image_url && (
                <div
                  className="w-24 flex-shrink-0"
                  style={{ backgroundColor: C.shell }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.cover_image_url} alt={p.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 p-3 min-w-0">
                <h3 className="font-fraunces font-bold mb-1" style={{ color: C.ocean, fontSize: 14, lineHeight: 1.2 }}>
                  {p.name}
                </h3>
                <p className="text-xs mb-1" style={{ color: C.muted }}>
                  <code>{p.slug}</code> · {p.status ?? '—'}
                </p>
                {p.description && (
                  <p className="text-xs italic font-fraunces line-clamp-2" style={{ color: C.driftwood, lineHeight: 1.4 }}>
                    {p.description}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* SERVICES not detailed in report */}
      <Section
        title="Services in EL · not detailed in the report"
        intro="3 services get a full Featured spread (Bwgcolman Healing, First 1,000 Days, BEAI). The other 23 are listed on the Services-at-a-Glance spread but don't have their own story told."
        accent={C.mangrove}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {unfeaturedServices.map((s) => (
            <article
              key={s.slug}
              className="rounded-lg p-3 flex items-start gap-3"
              style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}` }}
            >
              {s.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.image_url} alt={s.name} className="w-12 h-12 rounded object-cover flex-shrink-0" style={{ backgroundColor: C.shell }} />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-fraunces font-bold mb-0.5 truncate" style={{ color: C.ocean, fontSize: 12, lineHeight: 1.2 }} title={s.name}>
                  {s.name}
                </h3>
                <p className="text-[10px]" style={{ color: C.muted }}>
                  <code>{s.slug}</code>
                </p>
                {s.category && (
                  <p className="text-[10px] mt-0.5" style={{ color: C.driftwood }}>
                    {s.category}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* OPPORTUNITIES — proposed extra spreads */}
      <Section
        title="Spreads we could build next"
        intro="Each item below is a proposed new spread, drawn from data already in the system."
        accent={C.turtleRed}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Idea
            title="Elders Trips program"
            data="EL project: picc-elders · 1 cover photo synced · linked to 8 Elders + ~50 quotes about on-Country trips · plus the planned Atherton Tablelands 2026 trip"
            value="Showcase intergenerational knowledge transfer + cultural healing as a programmed activity, not just a phrase."
            slug="picc-elders"
          />
          <Idea
            title="Healthy Meals + Goods/Recycling"
            data="EL projects: healthy-meals + goods-recycling · cover photos uploaded · part of social-enterprise mandate"
            value="Visible community-economy stories beyond Logistics + Retail. Names where the cooked food + recycled goods come from."
            slug="healthy-meals"
          />
          <Idea
            title="Uncle Allan Palm Island Art"
            data="EL project: uncle-allan · cover photo uploaded · Allan has 58 quotes in EL"
            value="Cultural ambassador profile. Connects Bwgcolman Way (cultural framework) to one specific Elder's continuing practice."
            slug="uncle-allan"
          />
          <Idea
            title="On-Country Server"
            data="EL project: on-country-server · cover photo uploaded · status active"
            value="Innovation infrastructure story — locally-hosted technology supporting cultural sovereignty."
            slug="on-country-server"
          />
          <Idea
            title="Detailed Service Profiles · Health (4)"
            data="Bwgcolman Healing is featured. SEWB, Women's Healing, First 1,000 Days are not."
            value="Show the full health-and-wellbeing spectrum — currently only one of four health services has a story page."
            slug=""
          />
          <Idea
            title="Detailed Service Profiles · Family (8)"
            data="The largest service category. None have individual feature pages."
            value="Family Care, FPP, Family Wellbeing Centre, Safe House, DFV, Women's Shelter — each carries hundreds of placements."
            slug=""
          />
          <Idea
            title="Storyteller deep-dive · Aunty Ethel"
            data="39 quotes in EL · 23 suggested-for-report · richest single voice in the archive"
            value="Treat the most-quoted Elder as a profile spread, not just a tile in Voices. Same template could repeat for Allan (58q), Henry (35q), Uncle Frank (40q)."
            slug="aunty-ethel-taylor-robertson"
          />
          <Idea
            title="Action items ledger"
            data="Live capture pipeline (/picc/action-items) — already tracking what was said vs what got done"
            value="Show the bi-monthly cadence in action: 'we said, we did' across the year. Trust = receipts."
            slug=""
          />
        </div>
      </Section>

      <div className="mt-12 flex flex-wrap gap-3 text-sm">
        <Link href="/picc/almanac/alignment" className="px-4 py-2 rounded-md hover:bg-stone-50" style={{ color: C.ocean, border: `1px solid ${C.border}` }}>
          ← Alignment audit
        </Link>
        <Link href="/picc/almanac/quotes" className="px-4 py-2 rounded-md hover:bg-stone-50" style={{ color: C.ocean, border: `1px solid ${C.border}` }}>
          Quote library →
        </Link>
        <Link href="/picc/annual-report" className="px-4 py-2 rounded-md hover:bg-stone-50" style={{ color: C.muted, border: `1px solid ${C.border}` }}>
          Annual Report Hub
        </Link>
      </div>
    </div>
  )
}

interface ImageTargetWithEntities {
  storytellerSlug?: string
  serviceSlug?: string
  projectSlug?: string
}

function Stat({ label, total, featured, unit, color }: { label: string; total: number; featured: number; unit: string; color: string }) {
  const gap = total - featured
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}`, borderTopWidth: 3, borderTopColor: color }}>
      <p className="text-xs font-bold uppercase" style={{ color: C.muted, letterSpacing: '0.15em' }}>{label}</p>
      <p className="mt-2 font-fraunces font-bold" style={{ color, fontSize: 32, lineHeight: 1 }}>
        {featured} <span className="text-base" style={{ color: C.muted }}>/ {total}</span>
      </p>
      <p className="text-xs mt-1" style={{ color: C.driftwood }}>
        in report · <strong style={{ color: C.turtleRed }}>{gap}</strong> {unit} not yet placed
      </p>
    </div>
  )
}

function Section({ title, intro, accent, children }: { title: string; intro: string; accent: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <header className="mb-5 pb-3 border-b" style={{ borderColor: C.border }}>
        <p className="font-bold uppercase mb-1" style={{ color: accent, fontSize: 11, letterSpacing: '0.3em' }}>
          GAP
        </p>
        <h2 className="font-fraunces font-bold mb-2" style={{ color: C.ocean, fontSize: 28, lineHeight: 1.15 }}>
          {title}
        </h2>
        <p className="font-fraunces" style={{ color: C.driftwood, fontSize: 14, lineHeight: 1.45, maxWidth: 760 }}>
          {intro}
        </p>
      </header>
      {children}
    </section>
  )
}

function Idea({ title, data, value, slug }: { title: string; data: string; value: string; slug: string }) {
  return (
    <article className="rounded-lg p-5" style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}`, borderLeftWidth: 4, borderLeftColor: C.turtleRed }}>
      <h3 className="font-fraunces font-bold mb-2" style={{ color: C.ocean, fontSize: 18, lineHeight: 1.2 }}>
        {title}
      </h3>
      <p className="text-xs uppercase mb-1" style={{ color: C.muted, letterSpacing: '0.15em' }}>WHAT WE HAVE</p>
      <p className="text-sm font-fraunces mb-3" style={{ color: C.earth, lineHeight: 1.5 }}>{data}</p>
      <p className="text-xs uppercase mb-1" style={{ color: C.muted, letterSpacing: '0.15em' }}>WHY IT MATTERS</p>
      <p className="text-sm font-fraunces italic" style={{ color: C.driftwood, lineHeight: 1.5 }}>{value}</p>
    </article>
  )
}
