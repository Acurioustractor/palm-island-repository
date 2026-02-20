/**
 * PICC Organization Statistics — Single Source of Truth
 *
 * All public-facing pages should import from here instead of hardcoding numbers.
 * Update this file when new annual report data is confirmed.
 *
 * Source: PICC Annual Report 2023-24, verified with leadership
 * Last updated: February 2026
 */

/** Fiscal year these stats represent */
export const STATS_FISCAL_YEAR = '2023-24'

/** Staff and employment */
export const STAFF = {
  total: 197,
  indigenousPct: 82,
  palmIslandResidentsPct: 70,
  socialEnterprisesStaff: 44,
  digitalCentreStaff: 21,
  /** Historical growth for charts */
  history: [
    { year: '2021', staff: 120, indigenous: 98, nonIndigenous: 22 },
    { year: '2022', staff: 152, indigenous: 125, nonIndigenous: 27 },
    { year: '2023', staff: 151, indigenous: 124, nonIndigenous: 27 },
    { year: '2024', staff: 197, indigenous: 162, nonIndigenous: 35 },
  ] as const,
} as const

/** Services and programs */
export const SERVICES = {
  /** Integrated services under community control */
  total: 20,
  /** Growth target for 20-year vision (2029) */
  target2029: 50,
} as const

/** Financial summary (FY 2023-24) */
export const FINANCIALS = {
  totalIncome: 23_400_335,
  totalExpenditure: 23_678_058,
  netResult: -277_723,
  /** Formatted for display */
  incomeDisplay: '$23.4M',
  /** Revenue breakdown */
  breakdown: {
    labourCosts: { amount: 14_282_962, pct: 60 },
    adminExpenses: { amount: 5_000_820, pct: 21 },
    travelTraining: { amount: 1_778_367, pct: 8 },
    clientCosts: { amount: 1_156_713, pct: 5 },
    propertyEnergy: { amount: 1_058_084, pct: 4 },
    motorVehicle: { amount: 401_112, pct: 2 },
  },
  /** Historical income for charts (fallback when DB unavailable) */
  incomeHistory: [
    { year: '2010', income: 3_460_000 },
    { year: '2011', income: 4_230_000 },
    { year: '2012', income: 5_000_000 },
    { year: '2013', income: 5_150_000 },
    { year: '2014', income: 6_190_000 },
    { year: '2015', income: 6_940_000 },
    { year: '2016', income: 7_500_000 },
    { year: '2017', income: 7_950_000 },
    { year: '2018', income: 8_970_000 },
    { year: '2019', income: 9_980_000 },
    { year: '2020', income: 11_475_000 },
    { year: '2021', income: 12_970_000 },
    { year: '2022', income: 18_220_000 },
    { year: '2023', income: 20_100_000 },
    { year: '2024', income: 23_400_000 },
    { year: '2025', income: 23_400_000 },
  ] as const,
} as const

/** Organization milestones */
const _currentYear = new Date().getFullYear()
export const MILESTONES = {
  /** Rachel Atkinson appointed as sole employee */
  genesisYear: 2007,
  /** PICC formally established and delivering services — basis for 20-year countdown */
  founded: 2009,
  communityControlDate: '30 September 2021',
  twentyYearAnniversary: 2029,
  /** Current year in the 20-year journey (2009 = year 1, so 2026 = year 17) */
  currentYear: _currentYear - 2009 + 1,
  yearsRemaining: 2029 - _currentYear,
  /** Progress percentage toward 20-year milestone */
  progressPct: Math.round(((_currentYear - 2009 + 1) / 20) * 100),
  yearsOperating: _currentYear - 2009,
}

/** Fallback values when database returns 0/null */
export const FALLBACKS = {
  staffCount: STAFF.total,
  serviceCount: SERVICES.total,
  storyCount: 31,
} as const

/**
 * Fetch live goal values from the goals API.
 * Falls back to the static constants above if the API is unavailable.
 */
export async function getLiveStats(baseUrl?: string): Promise<{
  staff: number
  staffTarget: number
  services: number
  servicesTarget: number
  income: number
  incomeTarget: number
}> {
  try {
    const url = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || ''
    const res = await fetch(`${url}/api/goals`, { next: { revalidate: 300 } })
    if (!res.ok) throw new Error(`Goals API ${res.status}`)
    const goals: Array<{ goal_key: string; current_value: number; target_value: number }> = await res.json()

    const byKey = Object.fromEntries(goals.map((g) => [g.goal_key, g]))

    return {
      staff: byKey.staff_total?.current_value ?? STAFF.total,
      staffTarget: byKey.staff_total?.target_value ?? 300,
      services: byKey.services_total?.current_value ?? SERVICES.total,
      servicesTarget: byKey.services_total?.target_value ?? SERVICES.target2029,
      income: byKey.total_income?.current_value ?? FINANCIALS.totalIncome,
      incomeTarget: byKey.total_income?.target_value ?? 40_000_000,
    }
  } catch {
    return {
      staff: STAFF.total,
      staffTarget: 300,
      services: SERVICES.total,
      servicesTarget: SERVICES.target2029,
      income: FINANCIALS.totalIncome,
      incomeTarget: 40_000_000,
    }
  }
}
