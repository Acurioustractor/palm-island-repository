/**
 * /picc/canvas — the operator big-picture dashboard.
 *
 * One continuous-scroll page that surfaces every signal the platform
 * tracks, sectioned by the 5 metabolic modes:
 *   1. TODAY        live counts, goals, visions, top themes, recent
 *   2. GAPS         coverage holes per surface (services, projects,
 *                   storytellers, annual reports, research)
 *   3. PIPELINE     innovation projects in flight, strategic goals
 *                   with progress, community visions as commitments
 *   4. KNOWLEDGE    the layered archive (stories, quotes, sources)
 *   5. ACTIONS      prioritized queue with owners
 *
 * The canvas is the bridge between the operator dashboard (/picc) and
 * the public showcase (/atlas). For Tuesday demos: walk /atlas on the
 * projector, this on a second screen. Updates live via EL canonical
 * + PICC Supabase queries.
 *
 * Design: Saltwater & Earth tokens, no admin chrome bleeding through,
 * no charts for chart's sake. Every number answers an operator
 * question. Every section ends with a deep-link.
 */
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/client'
import { getPiccStorytellers } from '@/lib/empathy-ledger/el-storytellers'
import { getPiccServices } from '@/lib/services/el-services'
import { getPiccProjects } from '@/lib/empathy-ledger/el-projects'
import { getThemesIndex } from '@/lib/empathy-ledger/el-themes'
import { C, SECTION_COLOURS } from '@/components/annual-report/2024-25/almanac/tokens'
import { ogMeta } from '@/lib/seo/og'

export const metadata = ogMeta({
  title: 'Canvas — operator big picture · PICC',
  description: 'Every signal the platform tracks, on one screen.',
  path: '/picc/canvas',
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
  display_order: number
  notes: string | null
}

interface Vision {
  id: string
  vision_text: string
  category: string
  author_name: string | null
}

interface InnovationProject {
  id: string
  slug: string
  name: string
  category: string | null
  status: string
  people_impacted: number | null
  hero_image_url: string | null
}

const CATEGORY_COLOUR: Record<string, string> = {
  youth: SECTION_COLOURS.educationCommunity,
  health: SECTION_COLOURS.healthWellbeing,
  culture: SECTION_COLOURS.governance,
  economic: SECTION_COLOURS.economic,
  community: SECTION_COLOURS.educationCommunity,
  education: SECTION_COLOURS.educationCommunity,
  governance: SECTION_COLOURS.justiceSafety,
}

export default async function PiccCanvasPage() {
  const supabase = createServerSupabase()

  // ── Pull everything in parallel ───────────────────────────────────
  const [
    storytellers,
    services,
    projects,
    themesIndex,
    goalsRes,
    visionsRes,
    innovationsRes,
    statsRes,
  ] = await Promise.all([
    getPiccStorytellers({ limit: 500 }).catch(() => []),
    getPiccServices({ status: 'active' }).catch(() => []),
    getPiccProjects({ status: 'all' }).catch(() => []),
    getThemesIndex().catch(() => ({ total_themes: 0, total_tagged: 0, themes: [] })),
    supabase.from('organization_goals').select('*').eq('is_public', true).order('display_order'),
    supabase.from('community_visions').select('id, vision_text, category, author_name').eq('is_approved', true).order('created_at', { ascending: true }).limit(8),
    supabase.from('innovation_projects').select('id, slug, name, category, status, people_impacted, hero_image_url').order('status').order('people_impacted', { ascending: false, nullsFirst: false }),
    Promise.all([
      supabase.from('elder_quotes').select('id', { count: 'exact', head: true }).in('permission_level', ['public', 'community']),
      supabase.from('extracted_quotes').select('id', { count: 'exact', head: true }),
      supabase.from('interviews').select('id', { count: 'exact', head: true }),
      supabase.from('stories').select('id', { count: 'exact', head: true }).eq('is_public', true),
      supabase.from('annual_reports').select('id', { count: 'exact', head: true }),
      supabase.from('research_sources').select('id, is_verified'),
      supabase.from('media_files').select('id', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('knowledge_entries').select('id', { count: 'exact', head: true }),
    ]),
  ])

  const goals = (goalsRes.data || []) as Goal[]
  const visions = (visionsRes.data || []) as Vision[]
  const innovations = (innovationsRes.data || []) as InnovationProject[]
  const [
    elderQuotes,
    extractedQuotes,
    interviews,
    publicStories,
    annualReports,
    researchSources,
    mediaFiles,
    knowledgeEntries,
  ] = statsRes
  const researchVerified = ((researchSources.data || []) as Array<{ is_verified: boolean }>).filter((r) => r.is_verified).length
  const researchAwaiting = ((researchSources.data || []) as Array<{ is_verified: boolean }>).filter((r) => !r.is_verified).length

  // ── Derived signals ──────────────────────────────────────────────
  const storytellersWithPhotos = storytellers.filter((s) => !!s.photo_url).length
  const eldersCount = storytellers.filter((s) => s.is_elder).length

  const servicesMissingCover = services.filter((s) => !s.image_url).length
  const servicesWithDraftDesc = services.filter((s) => /\[DRAFT/i.test(s.description || '')).length
  const servicesWithThinDesc = services.filter((s) => (s.description || '').length < 100).length

  const projectsMissingCover = projects.filter((p) => !p.cover_image_url).length
  const projectsWithoutTagline = projects.filter((p) => !p.tagline).length

  // Top themes excluding noise (count >= 2)
  const topThemes = themesIndex.themes.filter((t) => t.count >= 2).slice(0, 8)

  // Total reports universe: 19 fiscal years FY07-08 → FY25-26
  const totalAnnualReports = 19
  const annualReportsInMirror = annualReports.count || 0
  const annualReportsInArchiveOnly = totalAnnualReports - annualReportsInMirror

  // ── Action queue (top 5 prioritized) ─────────────────────────────
  const actions: Array<{
    title: string
    detail: string
    href: string
    owner: string
    priority: 'high' | 'medium' | 'low'
  }> = []
  if (servicesMissingCover > 0) {
    actions.push({
      title: `${servicesMissingCover} service${servicesMissingCover === 1 ? '' : 's'} missing cover`,
      detail: 'Upload + Set as Cover in EL admin so the public /services list lights up everywhere.',
      href: '/picc/services/coverage',
      owner: 'Narelle',
      priority: 'high',
    })
  }
  if (projectsMissingCover > 0) {
    actions.push({
      title: `${projectsMissingCover} project${projectsMissingCover === 1 ? '' : 's'} missing cover`,
      detail: '/projects index falls back to a name placeholder until covers are set.',
      href: '/picc/projects/coverage',
      owner: 'Narelle',
      priority: 'high',
    })
  }
  if (servicesWithDraftDesc > 0) {
    actions.push({
      title: `${servicesWithDraftDesc} service description${servicesWithDraftDesc === 1 ? '' : 's'} marked DRAFT`,
      detail: 'Use the ✨ Draft button on the coverage page — Service-register copy in 30s.',
      href: '/picc/services/coverage',
      owner: 'Narelle',
      priority: 'medium',
    })
  }
  if (projectsWithoutTagline > 0) {
    actions.push({
      title: `${projectsWithoutTagline} project tagline${projectsWithoutTagline === 1 ? '' : 's'} empty`,
      detail: 'Single sentence per project — the AI drafter handles taglines too.',
      href: '/picc/projects/coverage',
      owner: 'Narelle',
      priority: 'medium',
    })
  }
  if (researchAwaiting > 0) {
    actions.push({
      title: `${researchAwaiting} research source${researchAwaiting === 1 ? '' : 's'} awaiting verification`,
      detail: 'Confirm citation, mark verified, link from /picc/library.',
      href: '/picc/library',
      owner: 'Cassie',
      priority: 'low',
    })
  }
  if (annualReportsInArchiveOnly > 0) {
    actions.push({
      title: `${annualReportsInArchiveOnly} annual report${annualReportsInArchiveOnly === 1 ? '' : 's'} only in EL archive`,
      detail: 'Capture into PICC mirror so /picc/finances + /20-years can cite without a hop.',
      href: '/picc/library',
      owner: 'Cassie',
      priority: 'low',
    })
  }
  const topActions = actions.slice(0, 6)

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FBF8EE' }}>
      {/* HEADER */}
      <section className="px-6 md:px-12 pt-12 pb-8" style={{ backgroundColor: C.midnight }}>
        <div className="max-w-7xl mx-auto">
          <div
            className="uppercase font-bold mb-3"
            style={{ color: C.starGold, fontSize: 11, letterSpacing: '0.3em' }}
          >
            Operator canvas · live
          </div>
          <h1
            className="font-fraunces font-bold leading-[1.05] mb-3"
            style={{ color: '#FBF8EE', fontSize: 'clamp(40px, 6vw, 64px)' }}
          >
            Every signal. One screen.
          </h1>
          <p
            className="font-fraunces max-w-3xl"
            style={{ color: '#FBF8EE', opacity: 0.85, fontSize: 18, lineHeight: 1.55 }}
          >
            What's live. What's missing. What's coming. Drill into any
            number to land in the right admin surface.
          </p>
        </div>
      </section>

      {/* ── 1 · TODAY · live counts ── */}
      <section className="px-6 md:px-12 py-10" style={{ backgroundColor: C.shell }}>
        <div className="max-w-7xl mx-auto">
          <SectionEyebrow num="01" title="Today · live" colour={C.ocean} />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <CountCard label="Storytellers" big={storytellers.length} sub={`${storytellersWithPhotos} with photos · ${eldersCount} elders`} href="/picc/voices" colour={C.ocean} />
            <CountCard label="Quotes attributed" big={(extractedQuotes.count || 0) + (elderQuotes.count || 0)} sub={`${elderQuotes.count || 0} elder · ${extractedQuotes.count || 0} extracted`} href="/voices/themes" colour={C.ochre} />
            <CountCard label="Services" big={services.length} sub={`${services.length - servicesMissingCover}/${services.length} with covers`} href="/picc/services/coverage" colour={SECTION_COLOURS.healthWellbeing} />
            <CountCard label="Projects" big={projects.length} sub={`${projects.length - projectsMissingCover}/${projects.length} with covers`} href="/picc/projects/coverage" colour={SECTION_COLOURS.economic} />
            <CountCard label="Themes" big={themesIndex.total_themes} sub={`${themesIndex.total_tagged.toLocaleString()} tagged voices`} href="/voices/themes" colour={SECTION_COLOURS.governance} />
            <CountCard label="Public stories" big={publicStories.count || 0} sub="of 92 total" href="/stories" colour={C.turtleRed} />
            <CountCard label="Photos" big={mediaFiles.count || 0} sub={`${interviews.count || 0} interviews`} href="/picc/voices" colour={C.driftwood} />
            <CountCard label="Knowledge entries" big={knowledgeEntries.count || 0} sub="cross-cutting facts" href="/picc/library" colour={SECTION_COLOURS.educationCommunity} />
          </div>
        </div>
      </section>

      {/* ── Goals + Visions strip ── */}
      <section className="px-6 md:px-12 py-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strategic goals */}
          <div className="rounded-2xl bg-white border p-6" style={{ borderColor: C.border }}>
            <div className="flex items-center justify-between mb-4">
              <SectionEyebrow inline num="02a" title={`Strategic 2029 goals · ${goals.length}`} colour={C.ocean} />
              <Link href="/picc/vision" className="text-xs text-[#0B4F6C] hover:underline">Edit →</Link>
            </div>
            <div className="flex flex-col gap-3">
              {goals.length === 0 && <p className="text-sm" style={{ color: C.driftwood }}>No goals set yet.</p>}
              {goals.map((g) => {
                const cur = g.current_value || 0
                const tgt = g.target_value || 1
                const pct = Math.min(Math.round((cur / tgt) * 100), 100)
                const display = (v: number) => g.unit === '$' ? `$${(v / 1_000_000).toFixed(1)}M` : v.toLocaleString()
                return (
                  <div key={g.id}>
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-sm font-medium truncate" style={{ color: C.ocean }}>{g.label}</div>
                      <div className="text-xs flex-shrink-0" style={{ color: C.driftwood }}>
                        {display(cur)} <span className="opacity-60">/ {display(tgt)} {g.unit && g.unit !== '$' ? g.unit : ''}</span>
                      </div>
                    </div>
                    <div className="mt-1 w-full bg-stone-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: C.ocean }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Community visions */}
          <div className="rounded-2xl bg-white border p-6" style={{ borderColor: C.border }}>
            <div className="flex items-center justify-between mb-4">
              <SectionEyebrow inline num="02b" title={`Community visions · ${visions.length}`} colour={C.ochre} />
              <Link href="/sign-the-vision" target="_blank" className="text-xs text-[#0B4F6C] hover:underline">Public canvas →</Link>
            </div>
            <div className="flex flex-col gap-3">
              {visions.length === 0 && <p className="text-sm" style={{ color: C.driftwood }}>No approved visions yet.</p>}
              {visions.map((v) => {
                const colour = CATEGORY_COLOUR[v.category] || C.driftwood
                return (
                  <div key={v.id} className="border-l-2 pl-3" style={{ borderColor: colour }}>
                    <p className="text-sm leading-snug" style={{ color: C.earth }}>
                      &ldquo;{v.vision_text.slice(0, 140)}{v.vision_text.length > 140 ? '…' : ''}&rdquo;
                    </p>
                    <p className="text-[11px] mt-1" style={{ color: C.driftwood }}>
                      {v.author_name || 'Anonymous'} · <span className="capitalize" style={{ color: colour }}>{v.category}</span>
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Top themes ── */}
      {topThemes.length > 0 && (
        <section className="px-6 md:px-12 py-10" style={{ backgroundColor: C.shell }}>
          <div className="max-w-7xl mx-auto">
            <SectionEyebrow num="03" title={`Strongest threads · top ${topThemes.length} of ${themesIndex.total_themes}`} colour={C.turtleRed} />
            <div className="flex flex-wrap gap-2">
              {topThemes.map((t) => (
                <Link
                  key={t.theme}
                  href={`/voices/themes/${encodeURIComponent(t.theme)}`}
                  className="inline-flex items-baseline gap-2 px-4 py-2 rounded-full bg-white border hover:shadow-sm transition"
                  style={{ borderColor: C.border, color: C.ocean }}
                >
                  <span className="capitalize font-medium">{t.theme}</span>
                  <span className="text-xs" style={{ color: C.driftwood }}>{t.count}</span>
                </Link>
              ))}
              <Link
                href="/voices/themes"
                className="inline-flex items-center px-4 py-2 rounded-full text-xs uppercase font-bold tracking-widest hover:opacity-80"
                style={{ color: C.ochre, letterSpacing: '0.2em' }}
              >
                See all →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── 4 · GAPS — what needs attention ── */}
      <section className="px-6 md:px-12 py-10">
        <div className="max-w-7xl mx-auto">
          <SectionEyebrow num="04" title="Gaps · what needs attention" colour={SECTION_COLOURS.justiceSafety} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <GapCard
              label="Service covers"
              missing={servicesMissingCover}
              total={services.length}
              note="Upload + Set as Cover in EL admin"
              href="/picc/services/coverage"
              colour={SECTION_COLOURS.healthWellbeing}
            />
            <GapCard
              label="Project covers"
              missing={projectsMissingCover}
              total={projects.length}
              note="Same pattern as services"
              href="/picc/projects/coverage"
              colour={SECTION_COLOURS.economic}
            />
            <GapCard
              label="DRAFT descriptions"
              missing={servicesWithDraftDesc}
              total={services.length}
              note="Use the ✨ Draft button"
              href="/picc/services/coverage"
              colour={C.turtleRed}
            />
            <GapCard
              label="Empty taglines"
              missing={projectsWithoutTagline}
              total={projects.length}
              note="One sentence per project"
              href="/picc/projects/coverage"
              colour={C.ochre}
            />
            <GapCard
              label="Storytellers no-photo"
              missing={storytellers.length - storytellersWithPhotos}
              total={storytellers.length}
              note="Most are historical; ~3 active to fill"
              href="/picc/voices"
              colour={C.driftwood}
            />
            <GapCard
              label="Annual reports gap"
              missing={annualReportsInArchiveOnly}
              total={totalAnnualReports}
              note="EL archive only — capture into PICC"
              href="/picc/library"
              colour={SECTION_COLOURS.governance}
            />
            <GapCard
              label="Research awaiting verify"
              missing={researchAwaiting}
              total={researchAwaiting + researchVerified}
              note="Confirm citation in /picc/library"
              href="/picc/library"
              colour={SECTION_COLOURS.educationCommunity}
            />
            <GapCard
              label="Thin descriptions"
              missing={servicesWithThinDesc - servicesWithDraftDesc}
              total={services.length}
              note="Below 100 chars — flesh out"
              href="/picc/services/coverage"
              colour={C.muted}
            />
          </div>
        </div>
      </section>

      {/* ── 5 · PIPELINE — innovation ── */}
      {innovations.length > 0 && (
        <section className="px-6 md:px-12 py-10" style={{ backgroundColor: C.shell }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-baseline justify-between mb-6">
              <SectionEyebrow inline num="05" title={`Pipeline · ${innovations.length} innovation projects`} colour={C.ochre} />
              <Link href="/picc/innovation" className="text-xs text-[#0B4F6C] hover:underline">Manage →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {innovations.slice(0, 6).map((p) => {
                const statusColour =
                  p.status === 'active' ? '#16A34A' :
                  p.status === 'planning' ? '#F59E0B' :
                  p.status === 'completed' ? C.ocean :
                  C.driftwood
                return (
                  <div key={p.id} className="rounded-2xl bg-white border overflow-hidden" style={{ borderColor: C.border }}>
                    {p.hero_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.hero_image_url} alt={p.name} className="w-full h-32 object-cover" />
                    ) : (
                      <div
                        className="h-32 flex items-center justify-center"
                        style={{ backgroundColor: statusColour + '15' }}
                      >
                        <span className="text-2xl font-bold" style={{ color: statusColour }}>
                          {p.name.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join('')}
                        </span>
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded" style={{ backgroundColor: statusColour + '22', color: statusColour, letterSpacing: '0.15em' }}>
                          {p.status}
                        </span>
                        {p.category && <span className="text-[10px] uppercase tracking-widest" style={{ color: C.driftwood }}>{p.category}</span>}
                      </div>
                      <h3 className="font-fraunces font-bold leading-tight mb-1" style={{ color: C.ocean, fontSize: 16 }}>
                        {p.name}
                      </h3>
                      {p.people_impacted != null && p.people_impacted > 0 && (
                        <p className="text-xs" style={{ color: C.driftwood }}>👥 {p.people_impacted.toLocaleString()} impacted</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── 6 · ACTIONS — owned queue ── */}
      {topActions.length > 0 && (
        <section className="px-6 md:px-12 py-10">
          <div className="max-w-7xl mx-auto">
            <SectionEyebrow num="06" title={`Action queue · ${topActions.length}`} colour={C.turtleRed} />
            <div className="rounded-2xl bg-white border overflow-hidden" style={{ borderColor: C.border }}>
              {topActions.map((a, i) => {
                const priorityColour = a.priority === 'high' ? C.turtleRed : a.priority === 'medium' ? C.ochre : C.driftwood
                return (
                  <Link
                    key={a.title}
                    href={a.href}
                    className={`flex items-center gap-4 p-5 hover:bg-stone-50 transition ${i > 0 ? 'border-t' : ''}`}
                    style={{ borderColor: C.border }}
                  >
                    <div
                      className="w-1.5 h-12 rounded-full flex-shrink-0"
                      style={{ backgroundColor: priorityColour }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold leading-tight" style={{ color: C.ocean, fontSize: 15 }}>
                        {a.title}
                      </h3>
                      <p className="text-xs mt-1" style={{ color: C.driftwood }}>{a.detail}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: priorityColour, letterSpacing: '0.2em' }}>
                        {a.priority}
                      </span>
                      <span className="text-xs" style={{ color: C.driftwood }}>{a.owner}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── 7 · KNOWLEDGE — the layered archive ── */}
      <section className="px-6 md:px-12 py-10" style={{ backgroundColor: C.shell }}>
        <div className="max-w-7xl mx-auto">
          <SectionEyebrow num="07" title="Knowledge layer · the archive PICC sits on" colour={C.driftwood} />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <ArchiveCard label="Annual reports" mirror={annualReportsInMirror} archive={annualReportsInArchiveOnly} />
            <ArchiveCard label="Stories (public)" mirror={publicStories.count || 0} />
            <ArchiveCard label="Elder quotes" mirror={elderQuotes.count || 0} />
            <ArchiveCard label="Extracted quotes" mirror={extractedQuotes.count || 0} />
            <ArchiveCard label="Interviews" mirror={interviews.count || 0} />
            <ArchiveCard label="Research sources" mirror={researchVerified} archive={researchAwaiting} mirrorLabel="verified" archiveLabel="awaiting" />
          </div>
          <div className="mt-6 flex flex-wrap gap-3 text-xs">
            <Link href="/picc/library" className="px-3 py-1.5 rounded-full bg-white border hover:shadow-sm" style={{ borderColor: C.border, color: C.ocean }}>
              Library inventory →
            </Link>
            <Link href="/picc/voices" className="px-3 py-1.5 rounded-full bg-white border hover:shadow-sm" style={{ borderColor: C.border, color: C.ocean }}>
              Voices admin →
            </Link>
            <Link href="/voices/themes" className="px-3 py-1.5 rounded-full bg-white border hover:shadow-sm" style={{ borderColor: C.border, color: C.ocean }}>
              Public themes →
            </Link>
            <Link href="/picc/walk" className="px-3 py-1.5 rounded-full bg-white border hover:shadow-sm" style={{ borderColor: C.border, color: C.ocean }}>
              Stage walk →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="px-6 md:px-12 py-12" style={{ backgroundColor: C.midnight }}>
        <div className="max-w-7xl mx-auto text-center">
          <p className="font-fraunces" style={{ color: C.starGold, opacity: 0.85, fontSize: 14, lineHeight: 1.7 }}>
            Live counts pull from EL canonical (storytellers · services · projects · themes ·
            photos) and PICC Supabase (stories · annual reports · research · goals · visions ·
            innovation). The canvas is the single screen that proves the platform is alive.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs">
            <Link href="/atlas" target="_blank" className="px-4 py-2 rounded-md font-semibold" style={{ backgroundColor: '#FBF8EE22', color: '#FBF8EE' }}>
              Public atlas →
            </Link>
            <Link href="/picc/walk" className="px-4 py-2 rounded-md font-semibold" style={{ backgroundColor: '#FBF8EE22', color: '#FBF8EE' }}>
              Stage walk →
            </Link>
            <Link href="/picc" className="px-4 py-2 rounded-md font-semibold" style={{ backgroundColor: '#FBF8EE22', color: '#FBF8EE' }}>
              Operator dashboard →
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

// ─── COMPONENTS ────────────────────────────────────────────────────────

function SectionEyebrow({ num, title, colour, inline }: { num: string; title: string; colour: string; inline?: boolean }) {
  return (
    <div className={inline ? 'flex items-baseline gap-3' : 'mb-6'}>
      <span className="font-mono text-xs" style={{ color: colour, letterSpacing: '0.2em' }}>
        {num}
      </span>
      <h2 className={inline ? 'text-base font-fraunces font-bold' : 'mt-2 text-2xl md:text-3xl font-fraunces font-bold'} style={{ color: C.ocean }}>
        {title}
      </h2>
    </div>
  )
}

function CountCard({ label, big, sub, href, colour }: { label: string; big: number; sub?: string; href: string; colour: string }) {
  return (
    <Link
      href={href}
      className="block rounded-xl bg-white border p-4 hover:shadow-sm transition group"
      style={{ borderColor: C.border, borderTopWidth: 3, borderTopColor: colour }}
    >
      <div className="text-[10px] uppercase font-bold tracking-widest" style={{ color: colour, letterSpacing: '0.2em' }}>
        {label}
      </div>
      <div className="font-fraunces font-bold mt-1 leading-none" style={{ color: C.ocean, fontSize: 28 }}>
        {big.toLocaleString()}
      </div>
      {sub && <div className="text-[11px] mt-2" style={{ color: C.driftwood }}>{sub}</div>}
    </Link>
  )
}

function GapCard({ label, missing, total, note, href, colour }: { label: string; missing: number; total: number; note: string; href: string; colour: string }) {
  const pct = total > 0 ? Math.round(((total - missing) / total) * 100) : 100
  const tone = missing === 0 ? '#16A34A' : missing > total * 0.4 ? C.turtleRed : colour
  return (
    <Link
      href={href}
      className="block rounded-xl bg-white border p-4 hover:shadow-sm transition"
      style={{ borderColor: C.border }}
    >
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: tone, letterSpacing: '0.2em' }}>
          {label}
        </span>
        <span className="text-xs font-mono" style={{ color: C.driftwood }}>
          {missing}/{total}
        </span>
      </div>
      <div className="font-fraunces font-bold mb-2 leading-tight" style={{ color: tone, fontSize: 22 }}>
        {missing === 0 ? '✓ complete' : `${missing} missing`}
      </div>
      <div className="w-full bg-stone-100 rounded-full h-1 mb-2">
        <div className="h-1 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: tone }} />
      </div>
      <p className="text-[11px]" style={{ color: C.driftwood }}>{note}</p>
    </Link>
  )
}

function ArchiveCard({ label, mirror, archive, mirrorLabel, archiveLabel }: { label: string; mirror: number; archive?: number; mirrorLabel?: string; archiveLabel?: string }) {
  return (
    <div className="rounded-xl bg-white border p-4" style={{ borderColor: C.border }}>
      <div className="text-[10px] uppercase font-bold tracking-widest" style={{ color: C.driftwood, letterSpacing: '0.2em' }}>
        {label}
      </div>
      <div className="font-fraunces font-bold mt-1 leading-none" style={{ color: C.ocean, fontSize: 26 }}>
        {(mirror + (archive || 0)).toLocaleString()}
      </div>
      <div className="text-[11px] mt-2 flex flex-col gap-0.5" style={{ color: C.driftwood }}>
        <span>{mirror.toLocaleString()} {mirrorLabel || 'in PICC'}</span>
        {archive != null && <span>{archive.toLocaleString()} {archiveLabel || 'EL archive only'}</span>}
      </div>
    </div>
  )
}
