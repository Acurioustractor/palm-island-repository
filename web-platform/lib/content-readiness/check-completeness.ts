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
  category: string
  status: CompletenessStatus
  details: string
  needed: number
  have: number
  link?: string
}

export type CompletenessReport = {
  fiscalYear: string
  services: ServiceCompleteness[]
  reportSections: ReportSectionCompleteness[]
  overallScore: number
  generatedAt: string
  recommendations: string[]
}

// Get current fiscal year
export function getCurrentFiscalYear(): string {
  const now = new Date()
  const startYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
  const endYear = startYear + 1
  return `${startYear}-${String(endYear).slice(-2)}`
}

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
  service: { id: string; name: string; slug: string; description: string | null; metadata: any },
  fiscalYear: string
): Promise<ServiceCompleteness> {
  const hasDescription = !!service.description && service.description.length > 20
  const hasCoverPhoto = !!service.metadata?.cover_photo_id
  const hasGpsCoords = !!service.metadata?.latitude && !!service.metadata?.longitude

  const fyInt = parseFiscalYear(fiscalYear)

  const [metricsResult, storiesResult, notesResult, grantsResult] = await Promise.allSettled([
    supabase
      .from('service_metrics')
      .select('id', { count: 'exact', head: true })
      .eq('organization_service_id', service.id)
      .eq('fiscal_year', fyInt),
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
  supabase: ReturnType<typeof createServerSupabase>,
  fiscalYear: string
): Promise<ReportSectionCompleteness[]> {
  const sections: ReportSectionCompleteness[] = []
  const fyInt = parseInt(fiscalYear.split('-')[0]) + 1

  // CEO / Leadership Message
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
      category: 'Leadership',
      status: hasIt ? 'green' : 'red',
      details: hasLeadership
        ? 'Leadership message found in latest report'
        : hasExecSummary
          ? 'Executive summary found (no separate leadership message)'
          : 'No leadership message in latest report',
      needed: 1,
      have: hasIt ? 1 : 0,
      link: '/picc/annual-reports',
    })
  } catch {
    sections.push({
      section: 'CEO Message',
      category: 'Leadership',
      status: 'red',
      details: 'Could not query annual_reports table',
      needed: 1,
      have: 0,
      link: '/picc/annual-reports',
    })
  }

  // Chair Message
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
      category: 'Leadership',
      status: hasIt ? 'green' : 'amber',
      details: hasIt
        ? 'Acknowledgements found in latest report'
        : 'No chair/acknowledgement message yet',
      needed: 1,
      have: hasIt ? 1 : 0,
      link: '/picc/annual-reports',
    })
  } catch {
    sections.push({
      section: 'Chair Message',
      category: 'Leadership',
      status: 'amber',
      details: 'Could not query annual_reports table',
      needed: 1,
      have: 0,
      link: '/picc/annual-reports',
    })
  }

  // Financial Data
  try {
    const { count } = await supabase
      .from('annual_financials')
      .select('id', { count: 'exact', head: true })
      .eq('fiscal_year', fyInt)
    const have = count ?? 0
    const hasIt = have > 0
    sections.push({
      section: 'Financial Data',
      category: 'Finance',
      status: hasIt ? 'green' : 'red',
      details: hasIt ? `Financial records found for FY${fyInt}` : `No financial data for ${fiscalYear}`,
      needed: 1,
      have,
      link: '/picc/financials',
    })
  } catch {
    sections.push({
      section: 'Financial Data',
      category: 'Finance',
      status: 'red',
      details: 'Could not query annual_financials table',
      needed: 1,
      have: 0,
      link: '/picc/financials',
    })
  }

  // Community Voices (quotes)
  try {
    const { count } = await supabase
      .from('extracted_quotes')
      .select('id', { count: 'exact', head: true })
      .eq('is_curated', true)
    const have = count ?? 0
    const hasIt = have >= 5
    sections.push({
      section: 'Community Voices',
      category: 'Content',
      status: hasIt ? 'green' : have > 0 ? 'amber' : 'red',
      details: hasIt ? `${have} curated quotes available` : `${have} quotes (need 5+)`,
      needed: 5,
      have,
      link: '/picc/stories',
    })
  } catch {
    sections.push({
      section: 'Community Voices',
      category: 'Content',
      status: 'red',
      details: 'No curated quotes found',
      needed: 5,
      have: 0,
      link: '/picc/stories',
    })
  }

  // Gallery Photos - FY specific
  try {
    const { count } = await supabase
      .from('media_files')
      .select('id', { count: 'exact', head: true })
      .contains('tags', ['annual-report'])
      .contains('tags', [`fy:${fiscalYear}`])
    const have = count ?? 0
    const needed = 15
    const hasIt = have >= needed
    sections.push({
      section: 'Gallery Photos',
      category: 'Media',
      status: hasIt ? 'green' : have > 0 ? 'amber' : 'red',
      details: `${have} photos for ${fiscalYear} (need ${needed}+)`,
      needed,
      have,
      link: '/picc/media/gallery',
    })
  } catch {
    sections.push({
      section: 'Gallery Photos',
      category: 'Media',
      status: 'red',
      details: 'Could not query media_files table',
      needed: 15,
      have: 0,
      link: '/picc/media/gallery',
    })
  }

  // Elder Quotes
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
    const have = (elderCount1 ?? 0) + (elderCount2 ?? 0) + (elderCount3 ?? 0)
    const hasIt = have >= 2
    sections.push({
      section: 'Elder Quotes',
      category: 'Content',
      status: hasIt ? 'green' : have > 0 ? 'amber' : 'red',
      details: hasIt ? `${have} elder quotes available` : `${have} elder quotes (need 2+)`,
      needed: 2,
      have,
      link: '/picc/stories',
    })
  } catch {
    sections.push({
      section: 'Elder Quotes',
      category: 'Content',
      status: 'red',
      details: 'No elder quotes found',
      needed: 2,
      have: 0,
      link: '/picc/stories',
    })
  }

  // Board Photos
  try {
    const { count } = await supabase
      .from('media_files')
      .select('id', { count: 'exact', head: true })
      .contains('tags', ['board-member'])
    const have = count ?? 0
    const needed = 3
    const hasIt = have >= needed
    sections.push({
      section: 'Board Photos',
      category: 'Media',
      status: hasIt ? 'green' : have > 0 ? 'amber' : 'red',
      details: `${have} board member photos (need ${needed}+)`,
      needed,
      have,
      link: '/picc/media/gallery',
    })
  } catch {
    sections.push({
      section: 'Board Photos',
      category: 'Media',
      status: 'red',
      details: 'No board member photos found',
      needed: 3,
      have: 0,
      link: '/picc/media/gallery',
    })
  }

  // Service Stories - FY specific
  try {
    const startDate = `${parseInt(fiscalYear.split('-')[0])}-07-01`
    const endDate = `${fyInt}-06-30`
    const { count } = await supabase
      .from('stories')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
    const have = count ?? 0
    const needed = 8
    const hasIt = have >= needed
    sections.push({
      section: 'Service Stories',
      category: 'Content',
      status: hasIt ? 'green' : have > 0 ? 'amber' : 'red',
      details: `${have} stories from ${fiscalYear} (need ${needed}+)`,
      needed,
      have,
      link: '/picc/stories',
    })
  } catch {
    sections.push({
      section: 'Service Stories',
      category: 'Content',
      status: 'red',
      details: 'Could not query stories table',
      needed: 8,
      have: 0,
      link: '/picc/stories',
    })
  }

  // Innovation Projects
  try {
    const { count } = await supabase
      .from('innovation_projects')
      .select('id', { count: 'exact', head: true })
      .eq('fiscal_year', fyInt)
    const have = count ?? 0
    const hasIt = have >= 1
    sections.push({
      section: 'Innovation Projects',
      category: 'Impact',
      status: hasIt ? 'green' : have > 0 ? 'amber' : 'amber',
      details: hasIt ? `${have} innovation projects for ${fiscalYear}` : 'No innovation projects recorded',
      needed: 1,
      have,
      link: '/picc/reports',
    })
  } catch {
    sections.push({
      section: 'Innovation Projects',
      category: 'Impact',
      status: 'amber',
      details: 'Could not query innovation_projects table',
      needed: 1,
      have: 0,
      link: '/picc/reports',
    })
  }

  return sections
}

function generateRecommendations(
  reportSections: ReportSectionCompleteness[],
  services: ServiceCompleteness[]
): string[] {
  const recs: string[] = []

  // Check sections
  for (const section of reportSections) {
    if (section.status === 'red') {
      recs.push(`Add ${section.section} - currently missing`)
    } else if (section.status === 'amber' && section.have < section.needed) {
      recs.push(`Increase ${section.section}: have ${section.have}, need ${section.needed}`)
    }
  }

  // Check services
  const incompleteServices = services.filter(s => s.status !== 'green')
  if (incompleteServices.length > 0) {
    recs.push(`${incompleteServices.length} services need attention before report`)
  }

  // Add positive notes
  if (reportSections.every(s => s.status === 'green') && services.every(s => s.status === 'green')) {
    recs.push('🎉 All report content is ready!')
  }

  return recs.slice(0, 5) // Limit to top 5
}

export async function checkCompleteness(fiscalYear?: string): Promise<CompletenessReport> {
  const supabase = createServerSupabase()
  const fy = fiscalYear || getCurrentFiscalYear()

  // Fetch all active services
  const { data: servicesRaw } = await supabase
    .from('organization_services')
    .select('id, name, slug, description, metadata')
    .eq('is_active', true)
    .order('name')

  const services = servicesRaw ?? []

  // Check services in parallel
  const serviceResults = await Promise.all(
    services.map((s) => checkServiceCompleteness(supabase, s, fy))
  )

  // Check report sections
  const reportSections = await checkReportSections(supabase, fy)

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

  const recommendations = generateRecommendations(reportSections, serviceResults)

  return {
    fiscalYear: fy,
    services: serviceResults,
    reportSections,
    overallScore,
    generatedAt: new Date().toISOString(),
    recommendations,
  }
}
