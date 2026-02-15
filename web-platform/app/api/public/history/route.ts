/**
 * Public History API
 *
 * Returns all historical data needed for the /20-years scrolling history page.
 * No authentication required — all data is public.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function normalizeFiscalYear(fy: string): string {
  if (!fy) return 'unknown'
  if (/^\d{4}-\d{2}$/.test(fy)) return fy
  if (/^\d{4}-\d{4}$/.test(fy)) {
    const [start, end] = fy.split('-')
    return `${start}-${end.slice(-2)}`
  }
  return fy
}

// Fiscal year text → integer end year
function fyToInt(fy: string): number {
  const [start] = fy.split('-')
  return parseInt(start) + 1
}

// Integer end year → text format
function intToFy(year: number): string {
  const start = year - 1
  const end = String(year).slice(-2)
  return `${start}-${end}`
}

/**
 * Linear interpolation for gaps in chart data.
 * Only fills gaps between known data points — never extrapolates.
 */
function interpolateYears(
  years: Array<{
    fiscalYear: string
    staffCount: number | null
    serviceCount: number | null
    annualBudget: number | null
    [key: string]: any
  }>
): typeof years {
  if (years.length < 2) return years

  // Parse start years and find range
  const parsed = years.map((y) => ({
    ...y,
    startYear: parseInt(y.fiscalYear.split('-')[0]),
  }))

  const minYear = Math.min(...parsed.map((p) => p.startYear))
  const maxYear = Math.max(...parsed.map((p) => p.startYear))

  // Index existing data by start year
  const byYear = new Map(parsed.map((p) => [p.startYear, p]))

  // Fill gaps and null fields with interpolated values
  const result: typeof years = []
  for (let yr = minYear; yr <= maxYear; yr++) {
    if (byYear.has(yr)) {
      const existing = { ...byYear.get(yr)! }
      // Fill null numeric fields on existing years too
      if (existing.staffCount == null) {
        existing.staffCount = lerp(yr, parsed, 'staffCount')
      }
      if (existing.annualBudget == null) {
        existing.annualBudget = lerp(yr, parsed, 'annualBudget')
      }
      if (existing.serviceCount == null) {
        existing.serviceCount = lerp(yr, parsed, 'serviceCount')
      }
      result.push(existing)
    } else {
      // Create fully interpolated year for gap
      const fy = `${yr}-${String(yr + 1).slice(-2)}`
      const interpolated: (typeof years)[0] = {
        fiscalYear: fy,
        era: getEra(fy)?.id || 'unknown',
        staffCount: lerp(yr, parsed, 'staffCount'),
        serviceCount: lerp(yr, parsed, 'serviceCount'),
        annualBudget: lerp(yr, parsed, 'annualBudget'),
        peopleServed: null,
        indigenousPercent: null,
        totalExpenditure: null,
        totalAssets: null,
        achievements: [],
        images: [],
        imageCount: 0,
        staff: null,
        _interpolated: true,
      }
      result.push(interpolated)
    }
  }

  return result
}

/** Linear interpolation helper for a single numeric field */
function lerp(
  targetYear: number,
  data: Array<{ startYear: number; [key: string]: any }>,
  field: string
): number | null {
  // Find closest known value before and after
  let before: { year: number; value: number } | null = null
  let after: { year: number; value: number } | null = null

  for (const d of data) {
    const val = d[field]
    if (val == null) continue
    if (d.startYear < targetYear) {
      if (!before || d.startYear > before.year) {
        before = { year: d.startYear, value: Number(val) }
      }
    } else if (d.startYear > targetYear) {
      if (!after || d.startYear < after.year) {
        after = { year: d.startYear, value: Number(val) }
      }
    }
  }

  if (before && after) {
    // Linear interpolation between two known points
    const ratio =
      (targetYear - before.year) / (after.year - before.year)
    return Math.round(before.value + (after.value - before.value) * ratio)
  }

  // Can't interpolate — no data on both sides
  return null
}

const ERA_CONFIG = [
  {
    id: 'foundation',
    name: 'Foundation',
    subtitle: 'Building from the ground up',
    years: '2009-2012',
    startYear: 2009,
    endYear: 2012,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    description:
      'From humble beginnings, Palm Island Community Company was established with a vision for community self-determination and local service delivery.',
  },
  {
    id: 'growth',
    name: 'Growth',
    subtitle: 'Expanding our reach',
    years: '2013-2018',
    startYear: 2013,
    endYear: 2018,
    color: 'purple',
    gradient: 'from-purple-500 to-indigo-600',
    description:
      'PICC expanded from a small operation into a major community employer, growing services and building the capacity to serve Palm Island.',
  },
  {
    id: 'transition',
    name: 'Transition',
    subtitle: 'Community control achieved',
    years: '2019-2020',
    startYear: 2019,
    endYear: 2020,
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    description:
      'The transition to full community control was a watershed moment — fulfilling the founding vision of Aboriginal self-determination on Palm Island.',
  },
  {
    id: 'community-controlled',
    name: 'Community Controlled',
    subtitle: 'Self-determination in action',
    years: '2021-Present',
    startYear: 2021,
    endYear: 2025,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-600',
    description:
      'Now fully community-controlled, PICC leads with innovation — pioneering AI reporting, cultural programs, and economic development for Palm Island.',
  },
]

function getEra(fyText: string) {
  const [startStr] = fyText.split('-')
  const startYear = parseInt(startStr)
  return ERA_CONFIG.find(
    (e) => startYear >= e.startYear && startYear <= e.endYear
  )
}

export async function GET() {
  try {
    // Fetch all data in parallel
    const [
      orgStatsRes,
      staffRes,
      financialsRes,
      achievementsRes,
      quotesRes,
      boardRes,
      imagesRes,
    ] = await Promise.all([
      supabase
        .from('organization_stats')
        .select('*')
        .order('fiscal_year', { ascending: true }),
      supabase
        .from('staff_statistics')
        .select('*')
        .order('fiscal_year', { ascending: true }),
      supabase
        .from('annual_financials')
        .select('*')
        .order('fiscal_year', { ascending: true }),
      supabase
        .from('governance_achievements')
        .select('*')
        .order('fiscal_year', { ascending: true }),
      supabase
        .from('elder_quotes')
        .select('*')
        .eq('permission_level', 'public'),
      supabase
        .from('board_members')
        .select('*')
        .order('start_date', { ascending: true }),
      supabase
        .from('media_files')
        .select(
          'id, filename, public_url, title, alt_text, metadata, tags'
        )
        .contains('tags', ['pdf-extract'])
        .not('tags', 'cs', '{"page-render"}')
        .is('deleted_at', null),
    ])

    // Index data by fiscal year
    const staffByYear = new Map<string, any>()
    for (const s of staffRes.data || []) {
      staffByYear.set(intToFy(s.fiscal_year), s)
    }

    const financialsByYear = new Map<string, any>()
    for (const f of financialsRes.data || []) {
      financialsByYear.set(intToFy(f.fiscal_year), f)
    }

    const achievementsByYear = new Map<string, any[]>()
    for (const a of achievementsRes.data || []) {
      const fy = intToFy(a.fiscal_year)
      if (!achievementsByYear.has(fy)) achievementsByYear.set(fy, [])
      achievementsByYear.get(fy)!.push(a)
    }

    const imagesByYear = new Map<string, any[]>()
    for (const img of imagesRes.data || []) {
      const rawFy = img.metadata?.fiscal_year
      if (rawFy) {
        const fy = normalizeFiscalYear(rawFy)
        if (!imagesByYear.has(fy)) imagesByYear.set(fy, [])
        imagesByYear.get(fy)!.push({
          id: img.id,
          url: img.public_url,
          alt: img.alt_text || img.title || img.filename,
          caption: img.title,
        })
      }
    }

    // Assign quotes to eras based on category tag or spread evenly
    const allQuotes = (quotesRes.data || []).map((q: any) => ({
      id: q.id,
      text: q.text,
      speaker_name: q.speaker_name,
      speaker_role: q.speaker_role,
      theme: q.theme,
      category: q.category,
    }))

    // Build years array from organization_stats
    const orgStats = orgStatsRes.data || []
    const years = orgStats.map((os: any) => {
      const fy = normalizeFiscalYear(os.fiscal_year)
      const staff = staffByYear.get(fy)
      const financials = financialsByYear.get(fy)
      const achievements = achievementsByYear.get(fy) || []
      const images = imagesByYear.get(fy) || []
      const era = getEra(fy)

      // Compute total expenditure from financials
      let totalExpenditure: number | null = null
      if (financials) {
        const costs = [
          financials.labour_costs,
          financials.administration_expenses,
          financials.property_energy_expenses,
          financials.motor_vehicle_expenses,
          financials.travel_training_expenses,
          financials.client_related_costs,
        ].filter((v: any) => v != null)
        if (costs.length > 0) {
          totalExpenditure = costs.reduce(
            (sum: number, v: number) => sum + Number(v),
            0
          )
        }
      }

      return {
        fiscalYear: fy,
        era: era?.id || 'unknown',
        staffCount: os.staff_count || staff?.total_staff || null,
        serviceCount: os.service_count || null,
        peopleServed: os.people_served || null,
        indigenousPercent:
          os.indigenous_staff_percentage ||
          (staff?.indigenous_staff_count && staff?.total_staff
            ? `${Math.round((staff.indigenous_staff_count / staff.total_staff) * 100)}%`
            : null),
        annualBudget: os.annual_budget
          ? Number(os.annual_budget)
          : financials?.total_income
            ? Number(financials.total_income)
            : null,
        totalExpenditure,
        totalAssets:
          financials?.current_assets && financials?.non_current_assets
            ? Number(financials.current_assets) +
              Number(financials.non_current_assets)
            : null,
        achievements: achievements.map((a: any) => ({
          text: a.achievement_text,
          category: a.category?.replace(/ \(ai-extraction.*\)/, ''),
        })),
        images: images.slice(0, 6),
        imageCount: images.length,
        staff: staff
          ? {
              total: staff.total_staff,
              fullTime: staff.full_time_staff,
              partTime: staff.part_time_staff,
              casual: staff.casual_staff,
              indigenous: staff.indigenous_staff_count,
            }
          : null,
      }
    })

    // Build eras with quotes and board members
    const eras = ERA_CONFIG.map((era) => {
      const eraYears = years.filter((y: any) => y.era === era.id)

      // Find quotes for this era by matching category or distributing
      const eraQuotes = allQuotes.filter((q: any) => {
        if (q.category?.includes(era.id)) return true
        // Match by fiscal year range in category
        const fyMatch = q.category?.match(/(\d{4}-\d{2})/)
        if (fyMatch) {
          const qEra = getEra(fyMatch[1])
          return qEra?.id === era.id
        }
        return false
      })

      // Board members active during this era
      const eraBoard = (boardRes.data || []).filter((bm: any) => {
        if (!bm.start_date) return false
        const startYear = new Date(bm.start_date).getFullYear()
        return startYear >= era.startYear && startYear <= era.endYear
      })

      // Era-level images (collect from all years in era)
      const eraImages = eraYears.flatMap((y: any) => y.images)

      // Latest year's stats for the era
      const latestYear = eraYears[eraYears.length - 1]

      return {
        ...era,
        years_data: eraYears,
        quote: eraQuotes[0] || null,
        quotes: eraQuotes.slice(0, 3),
        boardMembers: eraBoard.map((bm: any) => ({
          name: bm.name,
          role: bm.role,
        })),
        images: eraImages.slice(0, 8),
        latestStats: latestYear
          ? {
              staff: latestYear.staffCount,
              services: latestYear.serviceCount,
              budget: latestYear.annualBudget,
              indigenousPercent: latestYear.indigenousPercent,
            }
          : null,
      }
    })

    // Also fill null staffCount/annualBudget from neighboring data in org_stats
    // (e.g. 2012-13 has null staff, 2017-18 has null staff)
    for (const y of years) {
      if (y.staffCount == null) {
        const staffRow = staffByYear.get(y.fiscalYear)
        if (staffRow?.total_staff) y.staffCount = staffRow.total_staff
      }
    }

    // Build interpolated timeline for smooth charts (fills gap years like 2018-19)
    const chartYears = interpolateYears(years)

    // Overall statistics
    const latestYear = years[years.length - 1]
    const firstYear = years[0]
    const summary = {
      totalYears: years.length,
      yearsSpanned: firstYear && latestYear
        ? `${firstYear.fiscalYear} – ${latestYear.fiscalYear}`
        : '',
      latestStaff: latestYear?.staffCount || null,
      latestBudget: latestYear?.annualBudget || null,
      latestServices: latestYear?.serviceCount || null,
      latestIndigenous: latestYear?.indigenousPercent || null,
      totalImages: (imagesRes.data || []).length,
      totalQuotes: allQuotes.length,
    }

    return NextResponse.json({ years, chartYears, eras, summary })
  } catch (error) {
    console.error('History API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
