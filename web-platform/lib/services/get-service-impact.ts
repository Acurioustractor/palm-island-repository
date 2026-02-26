import { createServerSupabase } from '@/lib/supabase/client'
import { STAFF, SERVICES, MILESTONES } from '@/lib/stats/current-stats'
import { formatFiscalYear } from '@/lib/financials/get-financials'

export interface ServiceBreakdown {
  id: string
  name: string
  slug: string
  category: string | null
  clients: number
  sessions: number
  events: number
  staff: number
}

export interface StaffComposition {
  total: number
  indigenousPct: number
  residentPct: number
}

export interface ServiceImpactData {
  fiscalYearDisplay: string
  totals: {
    clients: number
    sessions: number
    events: number
    staff: number
  }
  priorYear: {
    clients: number
    sessions: number
    events: number
    staff: number
  }
  services: ServiceBreakdown[]
  staffComposition: StaffComposition
  coverage: {
    reporting: number
    total: number
  }
  journey: {
    currentYear: number
    targetYear: number
    progressPct: number
    yearsRemaining: number
  }
}

export async function getServiceImpact(): Promise<ServiceImpactData> {
  const supabase = createServerSupabase()

  // Auto-detect latest fiscal year with data instead of hardcoding
  const { data: latestMetric } = await supabase
    .from('service_metrics')
    .select('fiscal_year')
    .order('fiscal_year', { ascending: false })
    .limit(1)
    .maybeSingle()

  const fyInt = latestMetric?.fiscal_year ?? 2025
  const priorFyInt = fyInt - 1
  const fiscalYearDisplay = formatFiscalYear(fyInt)

  // Fetch all active services
  const { data: allServices } = await supabase
    .from('organization_services')
    .select('id, name, slug, service_category')
    .eq('is_active', true)
    .order('name')

  const serviceList = allServices ?? []

  // Fetch current year metrics
  const { data: currentMetrics } = await supabase
    .from('service_metrics')
    .select('organization_service_id, clients_served, sessions_delivered, events_held, staff_count')
    .eq('fiscal_year', fyInt)

  // Fetch prior year metrics
  const { data: priorMetrics } = await supabase
    .from('service_metrics')
    .select('organization_service_id, clients_served, sessions_delivered, events_held, staff_count')
    .eq('fiscal_year', priorFyInt)

  // Fetch latest staff statistics
  const { data: staffStats } = await supabase
    .from('staff_statistics')
    .select('total_staff, indigenous_staff_count, palm_island_resident_count')
    .order('fiscal_year', { ascending: false })
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Build per-service breakdown
  const metricsMap = new Map(
    (currentMetrics ?? []).map(m => [m.organization_service_id, m])
  )
  const priorMap = new Map(
    (priorMetrics ?? []).map(m => [m.organization_service_id, m])
  )

  const services: ServiceBreakdown[] = serviceList
    .map(s => {
      const m = metricsMap.get(s.id)
      return {
        id: s.id,
        name: s.name,
        slug: s.slug,
        category: s.service_category ?? null,
        clients: m?.clients_served ?? 0,
        sessions: m?.sessions_delivered ?? 0,
        events: m?.events_held ?? 0,
        staff: m?.staff_count ?? 0,
      }
    })
    .sort((a, b) => b.clients - a.clients)

  // Aggregate totals
  const totals = {
    clients: services.reduce((sum, s) => sum + s.clients, 0),
    sessions: services.reduce((sum, s) => sum + s.sessions, 0),
    events: services.reduce((sum, s) => sum + s.events, 0),
    staff: services.reduce((sum, s) => sum + s.staff, 0),
  }

  // Prior year totals
  const priorArr = Array.from(priorMap.values())
  const priorYear = {
    clients: priorArr.reduce((sum, m) => sum + (m.clients_served ?? 0), 0),
    sessions: priorArr.reduce((sum, m) => sum + (m.sessions_delivered ?? 0), 0),
    events: priorArr.reduce((sum, m) => sum + (m.events_held ?? 0), 0),
    staff: priorArr.reduce((sum, m) => sum + (m.staff_count ?? 0), 0),
  }

  // Staff composition — use DB if available, fall back to static constants
  const staffComposition: StaffComposition = staffStats
    ? {
        total: staffStats.total_staff,
        indigenousPct: staffStats.total_staff > 0
          ? Math.round((staffStats.indigenous_staff_count / staffStats.total_staff) * 100)
          : 0,
        residentPct: staffStats.total_staff > 0
          ? Math.round((staffStats.palm_island_resident_count / staffStats.total_staff) * 100)
          : 0,
      }
    : {
        total: STAFF.total,
        indigenousPct: STAFF.indigenousPct,
        residentPct: STAFF.palmIslandResidentsPct,
      }

  // Coverage: how many services have metrics vs total active
  const reporting = serviceList.filter(s => metricsMap.has(s.id)).length

  // Use fallback for staff total if DB aggregates are zero
  if (totals.staff === 0) {
    totals.staff = staffComposition.total
  }

  return {
    fiscalYearDisplay,
    totals,
    priorYear,
    services,
    staffComposition,
    coverage: {
      reporting,
      total: serviceList.length || SERVICES.total,
    },
    journey: {
      currentYear: MILESTONES.currentYear,
      targetYear: MILESTONES.twentyYearAnniversary,
      progressPct: MILESTONES.progressPct,
      yearsRemaining: MILESTONES.yearsRemaining,
    },
  }
}
