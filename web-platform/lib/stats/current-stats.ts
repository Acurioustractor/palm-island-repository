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
  target2029: 40,
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
} as const

/** Organization milestones */
export const MILESTONES = {
  founded: 2009,
  communityControlDate: '30 September 2021',
  twentyYearAnniversary: 2029,
  yearsOperating: new Date().getFullYear() - 2009,
} as const

/** Fallback values when database returns 0/null */
export const FALLBACKS = {
  staffCount: STAFF.total,
  serviceCount: SERVICES.total,
  storyCount: 31,
} as const
