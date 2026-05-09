/**
 * /picc/dashboard — operator landing.
 *
 * Brand-aligned with Saltwater & Earth tokens. Same design language
 * as /picc/canvas, /picc/walk, /picc/services/coverage so the
 * operator experience is one continuous palette, not a generic
 * Tailwind starter pasted into PICC chrome.
 *
 * Counts pull from EL canonical (storytellers · services · projects)
 * and PICC Supabase (stories · media · grants · annual reports).
 * Drift caught: storyteller count was reading PICC profiles (54);
 * EL canonical roster has 58. Same for services (26 not 30).
 */
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/client'
import { getPiccStorytellers } from '@/lib/empathy-ledger/el-storytellers'
import { getPiccServices } from '@/lib/services/el-services'
import { getPiccProjects } from '@/lib/empathy-ledger/el-projects'
import { checkCompleteness, getCurrentFiscalYear } from '@/lib/content-readiness/check-completeness'
import { C, SECTION_COLOURS } from '@/components/annual-report/2024-25/almanac/tokens'
import {
  ChevronRight,
  FileText,
  Users,
  Image as ImageIcon,
  Calendar,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  BarChart3,
  Layers,
  Sparkles,
  FolderKanban,
} from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export default async function PICCDashboard() {
  const supabase = createServerSupabase()

  // ── Counts in parallel from canonical sources ──────────────────────
  const [
    storytellers,
    services,
    projects,
    storiesCounts,
    mediaCounts,
    grantsCounts,
    reportsCounts,
    recentSubmissions,
    upcomingGrants,
    recentStories,
    latestReportRes,
  ] = await Promise.all([
    getPiccStorytellers({ limit: 500 }).catch(() => []),
    getPiccServices({ status: 'active' }).catch(() => []),
    getPiccProjects({ status: 'all' }).catch(() => []),
    Promise.all([
      supabase.from('stories').select('id', { count: 'exact', head: true }),
      supabase.from('stories').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('stories').select('id', { count: 'exact', head: true }).eq('status', 'submitted'),
    ]),
    Promise.all([
      supabase.from('media_files').select('id', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('extracted_quotes').select('id', { count: 'exact', head: true }),
      supabase.from('elder_quotes').select('id', { count: 'exact', head: true }),
    ]),
    Promise.all([
      supabase.from('grants').select('id', { count: 'exact', head: true }),
      supabase.from('grants').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    ]),
    Promise.all([
      supabase.from('annual_reports').select('id', { count: 'exact', head: true }),
      supabase.from('annual_reports').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    ]),
    supabase.from('stories').select('id, title, created_at, status, category').eq('status', 'submitted').order('created_at', { ascending: false }).limit(5),
    (() => {
      const from = new Date().toISOString().slice(0, 10)
      const to = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      return supabase.from('grants').select('id, title, deadline, status').gte('deadline', from).lte('deadline', to).eq('status', 'active').order('deadline').limit(3)
    })(),
    supabase.from('stories').select('id, title, status, created_at, category').eq('is_public', true).order('created_at', { ascending: false }).limit(5),
    supabase.from('annual_reports').select('id, title, report_year, status').order('report_year', { ascending: false }).limit(1).single(),
  ])

  const [{ count: totalStories }, { count: publishedStories }, { count: submittedStories }] = storiesCounts
  const [{ count: mediaFiles }, { count: extractedCount }, { count: elderCount }] = mediaCounts
  const [{ count: totalGrants }, { count: activeGrants }] = grantsCounts
  const [{ count: reportsCount }, { count: publishedReports }] = reportsCounts
  const latestReport = latestReportRes.data

  const storytellerCount = storytellers.length
  const eldersCount = storytellers.filter((s) => s.is_elder).length
  const servicesCount = services.length
  const projectsCount = projects.length
  const totalQuotes = (extractedCount || 0) + (elderCount || 0)

  // Readiness score — keep existing logic
  let readinessScore = 0
  let readinessStatus: 'green' | 'amber' | 'red' = 'red'
  try {
    const completeness = await checkCompleteness(getCurrentFiscalYear())
    readinessScore = completeness.overallScore
    readinessStatus = readinessScore >= 70 ? 'green' : readinessScore >= 40 ? 'amber' : 'red'
  } catch {
    readinessScore = 0
    readinessStatus = 'red'
  }
  const readinessTone = readinessStatus === 'green' ? '#16A34A' : readinessStatus === 'amber' ? C.ochre : C.turtleRed

  return (
    <div className="space-y-8" style={{ backgroundColor: 'transparent' }}>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p
            className="uppercase font-bold mb-2"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            PICC admin · control centre
          </p>
          <h1
            className="font-fraunces font-bold leading-tight"
            style={{ color: C.ocean, fontSize: 'clamp(32px, 5vw, 48px)' }}
          >
            Everything in one place.
          </h1>
          <p className="mt-2 text-sm" style={{ color: C.driftwood }}>
            Live counts from EL canonical + PICC. For the big-picture
            view with gaps + actions, see{' '}
            <Link href="/picc/canvas" className="underline" style={{ color: C.ocean }}>
              /picc/canvas
            </Link>
            .
          </p>
        </div>

        {/* Readiness pill */}
        <div
          className="flex items-center gap-3 px-5 py-3 rounded-2xl"
          style={{ backgroundColor: readinessTone + '15', border: `1px solid ${readinessTone}33` }}
        >
          {readinessStatus === 'green' ? (
            <CheckCircle2 className="w-5 h-5" style={{ color: readinessTone }} />
          ) : (
            <AlertCircle className="w-5 h-5" style={{ color: readinessTone }} />
          )}
          <div>
            <p className="font-fraunces font-bold leading-none" style={{ color: readinessTone, fontSize: 22 }}>
              {readinessScore}%
            </p>
            <p className="text-[10px] uppercase font-bold tracking-widest mt-1" style={{ color: C.driftwood, letterSpacing: '0.2em' }}>
              Report readiness
            </p>
          </div>
          <Link
            href="/picc/report-readiness"
            className="ml-2 text-xs font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-md"
            style={{ backgroundColor: readinessTone, color: '#fff', letterSpacing: '0.15em' }}
          >
            View →
          </Link>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard
          icon={FileText}
          label="Stories"
          value={totalStories || 0}
          subValue={`${publishedStories || 0} public`}
          href="/picc/stories"
          colour={SECTION_COLOURS.educationCommunity}
        />
        <StatCard
          icon={Users}
          label="Storytellers"
          value={storytellerCount}
          subValue={`${eldersCount} elders · EL canonical`}
          href="/picc/voices"
          colour={C.ocean}
        />
        <StatCard
          icon={ImageIcon}
          label="Media"
          value={mediaFiles || 0}
          subValue="Photos + videos"
          href="/picc/media"
          colour={C.driftwood}
        />
        <StatCard
          icon={Layers}
          label="Services"
          value={servicesCount}
          subValue="EL canonical"
          href="/picc/services/coverage"
          colour={SECTION_COLOURS.healthWellbeing}
        />
        <StatCard
          icon={FolderKanban}
          label="Projects"
          value={projectsCount}
          subValue="EL canonical"
          href="/picc/projects/coverage"
          colour={SECTION_COLOURS.economic}
        />
        <StatCard
          icon={Sparkles}
          label="Quotes"
          value={totalQuotes}
          subValue={`${elderCount || 0} elder · ${extractedCount || 0} extracted`}
          href="/voices/themes"
          colour={C.ochre}
        />
        <StatCard
          icon={BarChart3}
          label="Reports"
          value={reportsCount || 0}
          subValue={`${publishedReports || 0} published`}
          href="/picc/annual-reports"
          colour={SECTION_COLOURS.governance}
        />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT — content */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Pending reviews" icon={AlertCircle} href="/picc/stories?status=submitted" actionText="View all">
            {submittedStories && submittedStories > 0 && recentSubmissions.data && recentSubmissions.data.length > 0 ? (
              <div className="flex flex-col gap-1">
                {recentSubmissions.data.map((story) => (
                  <Link
                    key={story.id}
                    href={`/picc/stories/${story.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" style={{ color: C.ocean, fontSize: 14 }}>
                        {story.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: C.driftwood }}>
                        {story.category || 'Uncategorised'}
                      </p>
                    </div>
                    <span
                      className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded"
                      style={{ backgroundColor: C.ochre + '22', color: C.ochre, letterSpacing: '0.15em' }}
                    >
                      Pending
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-center py-6" style={{ color: C.driftwood }}>
                No pending reviews.
              </p>
            )}
          </SectionCard>

          <SectionCard title="Recent stories" icon={FileText} href="/picc/stories" actionText="View all">
            {recentStories.data && recentStories.data.length > 0 ? (
              <div className="flex flex-col gap-1">
                {recentStories.data.map((story) => (
                  <Link
                    key={story.id}
                    href={`/picc/stories/${story.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" style={{ color: C.ocean, fontSize: 14 }}>
                        {story.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: C.driftwood }}>
                        {new Date(story.created_at).toLocaleDateString('en-AU')} · {story.category || 'general'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4" style={{ color: C.muted }} />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-center py-6" style={{ color: C.driftwood }}>
                No published stories yet.
              </p>
            )}
          </SectionCard>

          <SectionCard title="Upcoming grant deadlines" icon={Calendar} href="/picc/grants" actionText="View all">
            {upcomingGrants.data && upcomingGrants.data.length > 0 ? (
              <div className="flex flex-col gap-1">
                {upcomingGrants.data.map((grant) => {
                  const days = Math.ceil((new Date(grant.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  const tone = days < 7 ? C.turtleRed : days < 14 ? C.ochre : C.driftwood
                  return (
                    <Link
                      key={grant.id}
                      href={`/picc/grants/${grant.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 transition"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" style={{ color: C.ocean, fontSize: 14 }}>
                          {grant.title}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: C.driftwood }}>
                          Due {new Date(grant.deadline).toLocaleDateString('en-AU')}
                        </p>
                      </div>
                      <span
                        className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded whitespace-nowrap"
                        style={{ backgroundColor: tone + '22', color: tone, letterSpacing: '0.15em' }}
                      >
                        {days} days
                      </span>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-center py-6" style={{ color: C.driftwood }}>
                No deadlines in the next 30 days.
              </p>
            )}
          </SectionCard>
        </div>

        {/* RIGHT — actions + report + summary */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-2xl bg-white p-5" style={{ border: `1px solid ${C.border}` }}>
            <h3
              className="uppercase font-bold mb-4"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Quick actions
            </h3>
            <div className="flex flex-col gap-2">
              <QuickAction href="/picc/stories/new" label="Add new story" />
              <QuickAction href="/picc/media/upload" label="Upload media" />
              <QuickAction href="/picc/canvas" label="Open the canvas" emphasised />
              <QuickAction href="/picc/walk" label="Open the stage walk" />
              <QuickAction href="/picc/annual-reports/new" label="Create annual report" />
            </div>
          </div>

          {/* Annual Report */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: C.shell, border: `1px solid ${C.starGold}33` }}
          >
            <h3
              className="uppercase font-bold mb-3"
              style={{ color: C.starGold, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Annual report
            </h3>
            {latestReport ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: C.driftwood }}>Latest</span>
                  <span className="font-fraunces font-bold" style={{ color: C.ocean, fontSize: 16 }}>
                    FY {latestReport.report_year}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: C.driftwood }}>Status</span>
                  <span
                    className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded"
                    style={{
                      backgroundColor: latestReport.status === 'published' ? '#16A34A22' : C.ochre + '22',
                      color: latestReport.status === 'published' ? '#16A34A' : C.ochre,
                      letterSpacing: '0.15em',
                    }}
                  >
                    {latestReport.status}
                  </span>
                </div>
                <Link
                  href={`/picc/annual-reports/${latestReport.id}`}
                  className="block w-full text-center font-bold uppercase tracking-widest py-2.5 rounded-md transition hover:opacity-90 mt-2"
                  style={{
                    backgroundColor: C.starGold,
                    color: C.midnight,
                    fontSize: 11,
                    letterSpacing: '0.2em',
                  }}
                >
                  Manage report →
                </Link>
              </div>
            ) : (
              <p className="text-sm" style={{ color: C.driftwood }}>No reports yet</p>
            )}
          </div>

          {/* Content Summary */}
          <div className="rounded-2xl bg-white p-5" style={{ border: `1px solid ${C.border}` }}>
            <h3
              className="uppercase font-bold mb-4"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Content summary
            </h3>
            <div className="flex flex-col gap-4">
              <SummaryBar
                label="Stories"
                value={`${publishedStories || 0} of ${totalStories || 0} public`}
                pct={totalStories ? Math.round(((publishedStories || 0) / totalStories) * 100) : 0}
                colour={C.ocean}
              />
              <SummaryBar
                label="Media files"
                value={`${(mediaFiles || 0).toLocaleString()} files`}
                pct={Math.min(100, Math.round((mediaFiles || 0) / 30))}
                colour={C.ochre}
              />
              <SummaryBar
                label="Quotes"
                value={`${totalQuotes.toLocaleString()} attributed`}
                pct={Math.min(100, Math.round(totalQuotes / 12))}
                colour={SECTION_COLOURS.healthWellbeing}
              />
              <SummaryBar
                label="Storytellers"
                value={`${storytellerCount} canonical · ${eldersCount} elders`}
                pct={Math.min(100, Math.round((storytellerCount / 100) * 100))}
                colour={SECTION_COLOURS.governance}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── COMPONENTS ───────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  href,
  colour,
}: {
  icon: React.ElementType
  label: string
  value: number | string
  subValue: string
  href: string
  colour: string
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl bg-white p-4 hover:shadow-sm transition group"
      style={{ border: `1px solid ${C.border}`, borderTopWidth: 3, borderTopColor: colour }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color: colour }} />
        <span
          className="uppercase font-bold"
          style={{ color: colour, fontSize: 10, letterSpacing: '0.2em' }}
        >
          {label}
        </span>
      </div>
      <p className="font-fraunces font-bold leading-none" style={{ color: C.ocean, fontSize: 28 }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="text-[11px] mt-2" style={{ color: C.driftwood }}>
        {subValue}
      </p>
    </Link>
  )
}

function SectionCard({
  title,
  icon: Icon,
  href,
  actionText,
  children,
}: {
  title: string
  icon: React.ElementType
  href?: string
  actionText?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl bg-white p-5" style={{ border: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: C.driftwood }} />
          <h3
            className="uppercase font-bold"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            {title}
          </h3>
        </div>
        {href && (
          <Link
            href={href}
            className="text-xs hover:underline"
            style={{ color: C.ocean }}
          >
            {actionText} →
          </Link>
        )}
      </div>
      {children}
    </div>
  )
}

function QuickAction({ href, label, emphasised }: { href: string; label: string; emphasised?: boolean }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-3 rounded-lg transition"
      style={{
        border: `1px solid ${emphasised ? C.ocean : C.border}`,
        backgroundColor: emphasised ? C.ocean + '08' : 'transparent',
      }}
    >
      <span className="text-sm font-medium" style={{ color: emphasised ? C.ocean : C.earth }}>
        {label}
      </span>
      <ChevronRight className="w-4 h-4" style={{ color: emphasised ? C.ocean : C.muted }} />
    </Link>
  )
}

function SummaryBar({ label, value, pct, colour }: { label: string; value: string; pct: number; colour: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span style={{ color: C.driftwood }}>{label}</span>
        <span className="font-medium" style={{ color: C.ocean }}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ backgroundColor: C.border }}>
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: colour }} />
      </div>
    </div>
  )
}
