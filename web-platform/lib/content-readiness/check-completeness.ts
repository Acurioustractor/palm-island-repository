import { createServerSupabase } from '@/lib/supabase/client'
import { parseFiscalYear } from '@/lib/financials/get-financials'

export type CompletenessStatus = 'green' | 'amber' | 'red'

export type ServiceCompleteness = {
  id: string
  name: string
  slug: string
  status: CompletenessStatus
  checks: {
    hasDescription: boolean
    hasCoverPhoto: boolean
    hasGpsCoords: boolean
    hasCurrentYearMetrics: boolean
    hasStories: boolean
    hasNotes: boolean
    hasGrantInfo: boolean
  }
  score: number // 0-100
}

export type ReportSectionCompleteness = {
  section: string
  status: CompletenessStatus
  details: string
}

export type CompletenessReport = {
  services: ServiceCompleteness[]
  reportSections: ReportSectionCompleteness[]
  overallScore: number
  generatedAt: string
}

const CURRENT_FY = '2024-25'

function scoreToStatus(score: number): CompletenessStatus {
  if (score >= 70) return 'green'
  if (score >= 40) return 'amber'
  return 'red'
}

function booleanScore(checks: Record<string, boolean>): number {
  const values = Object.values(checks)
  const passed = values.filter(Boolean).length
  return Math.round((passed / values.length) * 100)
}

async function checkServiceCompleteness(
  supabase: ReturnType<typeof createServerSupabase>,
  service: { id: string; name: string; slug: string; description: string | null; metadata: any }
): Promise<ServiceCompleteness> {
  const hasDescription = !!service.description && service.description.length > 20
  const hasCoverPhoto = !!service.metadata?.cover_photo_id
  const hasGpsCoords = !!service.metadata?.latitude && !!service.metadata?.longitude

  const [metricsResult, storiesResult, notesResult, grantsResult] = await Promise.allSettled([
    supabase
      .from('service_metrics')
      .select('id', { count: 'exact', head: true })
      .eq('organization_service_id', service.id)
      .eq('fiscal_year', parseFiscalYear(CURRENT_FY)),
    supabase
      .from('stories')
      .select('id', { count: 'exact', head: true })
      .eq('service_id', service.id)
      .eq('status', 'published'),
    supabase
      .from('service_notes')
      .select('id', { count: 'exact', head: true })
      .eq('service_id', service.id),
    supabase
      .from('service_grants')
      .select('id', { count: 'exact', head: true })
      .eq('service_id', service.id),
  ])

  const hasCurrentYearMetrics =
    metricsResult.status === 'fulfilled' && (metricsResult.value.count ?? 0) > 0
  const hasStories =
    storiesResult.status === 'fulfilled' && (storiesResult.value.count ?? 0) > 0
  const hasNotes =
    notesResult.status === 'fulfilled' && (notesResult.value.count ?? 0) > 0
  const hasGrantInfo =
    grantsResult.status === 'fulfilled' && (grantsResult.value.count ?? 0) > 0

  const checks = {
    hasDescription,
    hasCoverPhoto,
    hasGpsCoords,
    hasCurrentYearMetrics,
    hasStories,
    hasNotes,
    hasGrantInfo,
  }

  const score = booleanScore(checks)

  return {
    id: service.id,
    name: service.name,
    slug: service.slug,
    status: scoreToStatus(score),
    checks,
    score,
  }
}

async function checkReportSections(
  supabase: ReturnType<typeof createServerSupabase>
): Promise<ReportSectionCompleteness[]> {
  const sections: ReportSectionCompleteness[] = []

  // CEO / Leadership Message — actual column is leadership_message
  try {
    const { data } = await supabase
      .from('annual_reports')
      .select('leadership_message, executive_summary, title')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    const hasLeadership = !!data?.leadership_message && data.leadership_message.length > 0
    const hasExecSummary = !!data?.executive_summary && data.executive_summary.length > 0
    const hasIt = hasLeadership || hasExecSummary
    sections.push({
      section: 'CEO Message',
      status: hasIt ? 'green' : 'red',
      details: hasLeadership
        ? 'Leadership message found in latest report'
        : hasExecSummary
          ? 'Executive summary found (no separate leadership message)'
          : 'No leadership message in latest report',
    })
  } catch {
    sections.push({
      section: 'CEO Message',
      status: 'red',
      details: 'Could not query annual_reports table',
    })
  }

  // Chair Message — check for a second leadership message or acknowledgements
  try {
    const { data } = await supabase
      .from('annual_reports')
      .select('acknowledgments, acknowledgement_of_country')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    const hasIt = (!!data?.acknowledgments && data.acknowledgments.length > 0) ||
      (!!data?.acknowledgement_of_country && data.acknowledgement_of_country.length > 0)
    sections.push({
      section: 'Chair Message',
      status: hasIt ? 'green' : 'amber',
      details: hasIt
        ? 'Acknowledgements found in latest report'
        : 'No chair/acknowledgement message yet — can be added later',
    })
  } catch {
    sections.push({
      section: 'Chair Message',
      status: 'amber',
      details: 'Could not query annual_reports table',
    })
  }

  // Financial Data — fiscal_year is stored as integer (e.g. 2025 for FY 2024-25)
  try {
    const fyInt = parseInt(CURRENT_FY.split('-')[0]) + 1 // '2024-25' → 2025
    const { count } = await supabase
      .from('annual_financials')
      .select('id', { count: 'exact', head: true })
      .eq('fiscal_year', fyInt)
    const hasIt = (count ?? 0) > 0
    sections.push({
      section: 'Financial Data',
      status: hasIt ? 'green' : 'red',
      details: hasIt ? `Financial records found for FY${fyInt}` : `No financial data for ${CURRENT_FY}`,
    })
  } catch {
    sections.push({
      section: 'Financial Data',
      status: 'red',
      details: 'Could not query annual_financials table',
    })
  }

  // Community Voices
  try {
    const { count } = await supabase
      .from('extracted_quotes')
      .select('id', { count: 'exact', head: true })
    const hasIt = (count ?? 0) > 0
    sections.push({
      section: 'Community Voices',
      status: hasIt ? 'green' : 'red',
      details: hasIt ? `${count} quotes available` : 'No extracted quotes found',
    })
  } catch {
    sections.push({
      section: 'Community Voices',
      status: 'red',
      details: 'Could not query extracted_quotes table',
    })
  }

  // Gallery Photos
  try {
    const { count } = await supabase
      .from('media_files')
      .select('id', { count: 'exact', head: true })
      .contains('tags', ['annual-report'])
    const enough = (count ?? 0) >= 5
    sections.push({
      section: 'Gallery Photos',
      status: enough ? 'green' : (count ?? 0) > 0 ? 'amber' : 'red',
      details: `${count ?? 0} photos tagged 'annual-report' (need >= 5)`,
    })
  } catch {
    sections.push({
      section: 'Gallery Photos',
      status: 'red',
      details: 'Could not query media_files table',
    })
  }

  // Elder Quotes — match Aunty/Uncle/Elder in attribution
  try {
    const { count: elderCount1 } = await supabase
      .from('extracted_quotes')
      .select('id', { count: 'exact', head: true })
      .ilike('attribution', '%elder%')
    const { count: elderCount2 } = await supabase
      .from('extracted_quotes')
      .select('id', { count: 'exact', head: true })
      .ilike('attribution', '%aunty%')
    const { count: elderCount3 } = await supabase
      .from('extracted_quotes')
      .select('id', { count: 'exact', head: true })
      .ilike('attribution', '%uncle%')
    const total = (elderCount1 ?? 0) + (elderCount2 ?? 0) + (elderCount3 ?? 0)
    const hasIt = total > 0
    sections.push({
      section: 'Elder Quotes',
      status: hasIt ? 'green' : 'red',
      details: hasIt ? `${total} elder quotes available (Aunty/Uncle/Elder)` : 'No elder quotes found',
    })
  } catch {
    sections.push({
      section: 'Elder Quotes',
      status: 'red',
      details: 'Could not query extracted_quotes table',
    })
  }

  // Board Photos
  try {
    const { count } = await supabase
      .from('media_files')
      .select('id', { count: 'exact', head: true })
      .contains('tags', ['board-member'])
    const enough = (count ?? 0) >= 3
    sections.push({
      section: 'Board Photos',
      status: enough ? 'green' : (count ?? 0) > 0 ? 'amber' : 'red',
      details: `${count ?? 0} photos tagged 'board-member' (need >= 3)`,
    })
  } catch {
    sections.push({
      section: 'Board Photos',
      status: 'red',
      details: 'Could not query media_files table',
    })
  }

  return sections
}

export async function checkCompleteness(): Promise<CompletenessReport> {
  const supabase = createServerSupabase()

  // Fetch all active services
  const { data: servicesRaw } = await supabase
    .from('organization_services')
    .select('id, name, slug, description, metadata')
    .eq('is_active', true)
    .order('name')

  const services = servicesRaw ?? []

  // Check services in parallel
  const serviceResults = await Promise.all(
    services.map((s) => checkServiceCompleteness(supabase, s))
  )

  // Check report sections
  const reportSections = await checkReportSections(supabase)

  // Overall score: average of all service scores and report section scores
  const reportSectionScores = reportSections.map((s) =>
    s.status === 'green' ? 100 : s.status === 'amber' ? 50 : 0
  )
  const allScores = [
    ...serviceResults.map((s) => s.score),
    ...reportSectionScores,
  ]
  const overallScore =
    allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : 0

  return {
    services: serviceResults,
    reportSections,
    overallScore,
    generatedAt: new Date().toISOString(),
  }
}
