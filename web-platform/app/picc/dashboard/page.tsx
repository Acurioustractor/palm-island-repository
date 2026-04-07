import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase/client'
import { checkCompleteness, getCurrentFiscalYear } from '@/lib/content-readiness/check-completeness'

const EL_URL = 'https://yvnuayzslukamizrlhwb.supabase.co'
const PICC_ORG_ID = '084f851c-72e0-41fb-b5ba-f3088f44862d'

export const dynamic = 'force-dynamic'
export const revalidate = 60
import {
  ChevronRight,
  FileText,
  Users,
  Image,
  TrendingUp,
  Award,
  Calendar,
  AlertCircle,
  CheckCircle,
  DollarSign,
  BarChart3,
  Layers
} from 'lucide-react'

export default async function PICCDashboard() {
  const supabase = createServerSupabase()

  // Get story counts (without is_active filter since column may not exist)
  const [{ count: totalStories }, { count: publishedStories }, { count: submittedStories }, { count: draftStories }] = await Promise.all([
    supabase.from('stories').select('id', { count: 'exact', head: true }),
    supabase.from('stories').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('stories').select('id', { count: 'exact', head: true }).eq('status', 'submitted'),
    supabase.from('stories').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
  ])

  // Get media counts
  const [{ count: mediaFiles }, { count: totalQuotes }] = await Promise.all([
    supabase.from('media_files').select('id', { count: 'exact', head: true }),
    supabase.from('extracted_quotes').select('id', { count: 'exact', head: true }),
  ])

  // Get services count (no is_active filter — table doesn't have it)
  const { count: servicesCount } = await supabase
    .from('organization_services')
    .select('id', { count: 'exact', head: true })

  // Get storyteller count from elders + profiles
  const { count: storytellerCount } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('show_in_directory', true)

  // Pull EL stats — sovereign data lives there
  let elQuoteCount = 0
  let elTranscriptCount = 0
  try {
    const elKey = process.env.EMPATHY_LEDGER_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
    if (elKey) {
      const el = createClient(EL_URL, elKey)
      const [qRes, tRes] = await Promise.all([
        el.from('extracted_quotes').select('id', { count: 'exact', head: true }).eq('organization_id', PICC_ORG_ID),
        el.from('transcripts').select('id', { count: 'exact', head: true }).eq('organization_id', PICC_ORG_ID),
      ])
      elQuoteCount = qRes.count || 0
      elTranscriptCount = tRes.count || 0
    }
  } catch {}

  // Get grants count
  const [{ count: totalGrants }, { count: activeGrants }] = await Promise.all([
    supabase.from('grants').select('*', { count: 'exact', head: true }),
    supabase.from('grants').select('*', { count: 'exact', head: true }).eq('status', 'active'),
  ])

  // Get reports count
  const [{ count: reportsCount }, { count: publishedReports }] = await Promise.all([
    supabase.from('annual_reports').select('*', { count: 'exact', head: true }),
    supabase.from('annual_reports').select('*', { count: 'exact', head: true }).eq('status', 'published'),
  ])

  // Get recent submissions
  const { data: recentSubmissions } = await supabase
    .from('stories')
    .select('id, title, created_at, status, category')
    .eq('status', 'submitted')
    .order('created_at', { ascending: false })
    .limit(5)

  // Get upcoming grant deadlines (next 30 days)
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
  
  const { data: upcomingGrants } = await supabase
    .from('grants')
    .select('id, title, deadline, status')
    .gte('deadline', new Date().toISOString().split('T')[0])
    .lte('deadline', thirtyDaysFromNow.toISOString().split('T')[0])
    .eq('status', 'active')
    .order('deadline')
    .limit(3)

  // Get recent stories
  const { data: recentStories } = await supabase
    .from('stories')
    .select('id, title, status, created_at, category')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(5)

  // Get report readiness score
  const { data: latestReport } = await supabase
    .from('annual_reports')
    .select('id, title, report_year, status')
    .order('report_year', { ascending: false })
    .limit(1)
    .single()

  // Calculate readiness from real data
  let readinessScore = 0
  let readinessStatus: 'green' | 'amber' | 'red' = 'red'
  try {
    const completeness = await checkCompleteness(getCurrentFiscalYear())
    readinessScore = completeness.overallScore
    readinessStatus = readinessScore >= 70 ? 'green' : readinessScore >= 40 ? 'amber' : 'red'
  } catch {
    // Fallback if completeness check fails
    readinessScore = 0
    readinessStatus = 'red'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">PICC Admin</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">Control Centre</h1>
          <p className="text-sm text-gray-500 mt-1">Everything in one place</p>
        </div>
        
        {/* Quick Status */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${
          readinessStatus === 'green' ? 'bg-green-50 border-green-200' : 
          readinessStatus === 'amber' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
        }`}>
          {readinessStatus === 'green' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : readinessStatus === 'amber' ? (
            <AlertCircle className="w-5 h-5 text-amber-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <div>
            <p className={`text-lg font-bold ${
              readinessStatus === 'green' ? 'text-green-800' : 
              readinessStatus === 'amber' ? 'text-amber-800' : 'text-red-800'
            }`}>
              {readinessScore}%
            </p>
            <p className="text-xs text-gray-600">Report Readiness</p>
          </div>
          <Link 
            href="/picc/report-readiness" 
            className={`ml-2 text-xs font-medium px-2 py-1 rounded ${
              readinessStatus === 'green' ? 'bg-green-100 text-green-700' : 
              readinessStatus === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
            }`}
          >
            View →
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard 
          icon={FileText} 
          label="Stories" 
          value={totalStories || 0} 
          subValue={`${publishedStories || 0} published`}
          href="/picc/stories"
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Storytellers"
          value={storytellerCount || 0}
          subValue={`${elQuoteCount} voices in EL`}
          href="/picc/storytellers"
          color="indigo"
        />
        <StatCard 
          icon={Image} 
          label="Media" 
          value={mediaFiles || 0} 
          subValue="Photos & videos"
          href="/picc/media"
          color="purple"
        />
        <StatCard 
          icon={Layers} 
          label="Services" 
          value={servicesCount || 0} 
          subValue="Active"
          href="/picc/services"
          color="emerald"
        />
        <StatCard 
          icon={DollarSign} 
          label="Grants" 
          value={totalGrants || 0} 
          subValue={`${activeGrants || 0} active`}
          href="/picc/grants"
          color="amber"
        />
        <StatCard 
          icon={BarChart3} 
          label="Reports" 
          value={reportsCount || 0} 
          subValue={`${publishedReports || 0} published`}
          href="/picc/annual-reports"
          color="rose"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Pending Reviews */}
          <SectionCard 
            title="Pending Reviews" 
            icon={AlertCircle}
            href="/picc/stories?status=submitted"
            actionText="View all"
          >
            {submittedStories && submittedStories > 0 && recentSubmissions ? (
              <div className="space-y-3">
                {recentSubmissions.map((story) => (
                  <Link 
                    key={story.id} 
                    href={`/picc/stories/${story.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{story.title}</p>
                      <p className="text-xs text-gray-500">{story.category || 'Uncategorized'}</p>
                    </div>
                    <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">
                      Pending
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">No pending reviews</p>
            )}
          </SectionCard>

          {/* Recent Stories */}
          <SectionCard 
            title="Recent Stories" 
            icon={FileText}
            href="/picc/stories"
            actionText="View all"
          >
            {recentStories && recentStories.length > 0 ? (
              <div className="space-y-3">
                {recentStories.map((story) => (
                  <Link 
                    key={story.id} 
                    href={`/picc/stories/${story.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{story.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(story.created_at).toLocaleDateString()} · {story.category || 'General'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">No published stories yet</p>
            )}
          </SectionCard>

          {/* Upcoming Grant Deadlines */}
          <SectionCard 
            title="Upcoming Deadlines" 
            icon={Calendar}
            href="/picc/grants"
            actionText="View all grants"
          >
            {upcomingGrants && upcomingGrants.length > 0 ? (
              <div className="space-y-3">
                {upcomingGrants.map((grant) => (
                  <Link 
                    key={grant.id} 
                    href={`/picc/grants/${grant.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{grant.title}</p>
                      <p className="text-xs text-gray-500">
                        Due: {new Date(grant.deadline).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
                      {Math.ceil((new Date(grant.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">No upcoming deadlines</p>
            )}
          </SectionCard>
        </div>

        {/* Right Column - Quick Actions & Status */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <QuickAction href="/picc/stories/new" label="Add New Story" />
              <QuickAction href="/picc/media/upload" label="Upload Media" />
              <QuickAction href="/picc/report-readiness" label="Check Report Readiness" />
              <QuickAction href="/picc/grants/new" label="Add Grant Opportunity" />
              <QuickAction href="/picc/annual-reports/new" label="Create Annual Report" />
            </div>
          </div>

          {/* Report Status */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Annual Report</h3>
            {latestReport ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">Latest Report</span>
                  <span className="text-sm font-medium text-blue-900">FY {latestReport.report_year}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">Status</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    latestReport.status === 'published' ? 'bg-green-100 text-green-700' : 
                    latestReport.status === 'drafting' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {latestReport.status}
                  </span>
                </div>
                <Link 
                  href={`/picc/annual-reports/${latestReport.id}`}
                  className="block w-full text-center text-sm text-blue-700 bg-white border border-blue-200 rounded-lg py-2 mt-3 hover:bg-blue-50 transition-colors"
                >
                  Manage Report →
                </Link>
              </div>
            ) : (
              <p className="text-sm text-blue-700">No reports yet</p>
            )}
          </div>

          {/* Content Summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Content Summary</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Stories</span>
                  <span className="font-medium">{publishedStories || 0} of {totalStories || 0} published</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${totalStories ? ((publishedStories || 0) / totalStories) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Media</span>
                  <span className="font-medium">{mediaFiles || 0} files</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${Math.min(100, (mediaFiles || 0) / 10)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Quotes (Empathy Ledger)</span>
                  <span className="font-medium">{elQuoteCount} sovereign</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, elQuoteCount / 6)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Transcripts (Empathy Ledger)</span>
                  <span className="font-medium">{elTranscriptCount} captured</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${Math.min(100, elTranscriptCount * 0.8)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subValue, 
  href,
  color 
}: { 
  icon: React.ElementType,
  label: string,
  value: number | string,
  subValue: string,
  href: string,
  color: string
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  }
  
  return (
    <Link href={href} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      <p className="text-xs text-gray-400 mt-1">{subValue}</p>
    </Link>
  )
}

// Section Card Component
function SectionCard({ 
  title, 
  icon: Icon, 
  href, 
  actionText,
  children 
}: { 
  title: string,
  icon: React.ElementType,
  href?: string,
  actionText?: string,
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>
        {href && (
          <Link href={href} className="text-xs text-gray-500 hover:text-gray-900 font-medium">
            {actionText} →
          </Link>
        )}
      </div>
      {children}
    </div>
  )
}

// Quick Action Component
function QuickAction({ href, label }: { href: string, label: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
    >
      <span className="text-sm text-gray-700">{label}</span>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </Link>
  )
}
