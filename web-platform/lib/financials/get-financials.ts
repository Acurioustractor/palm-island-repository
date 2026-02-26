/**
 * Shared Financial Data Service — Single query module for annual_financials.
 *
 * All consumers (chat tools, API routes, PDF reports, dashboards) should
 * import from here instead of writing their own Supabase queries.
 */

import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface FinancialRecord {
  fiscal_year: number               // 2025
  fiscal_year_display: string        // '2024-25'
  total_income: number
  total_expenditure: number
  net_result: number
  total_assets: number
  total_liabilities: number
  net_assets: number
  expense_breakdown: {
    labour_costs: number
    administration_expenses: number
    property_energy_expenses: number
    motor_vehicle_expenses: number
    travel_training_expenses: number
    client_related_costs: number
  }
  audited: boolean
  auditor_name: string | null
}

// ─── Fiscal Year Helpers ────────────────────────────────────────────────────

/** Convert display format to DB integer: '2023-24' → 2024 */
export function parseFiscalYear(fy: string): number {
  // Handle '2023-24' format → take first part + 1
  const match = fy.match(/^(\d{4})-(\d{2,4})$/)
  if (match) {
    return parseInt(match[1], 10) + 1
  }
  // Handle plain year '2024'
  const plain = parseInt(fy, 10)
  if (!isNaN(plain)) return plain
  throw new Error(`Invalid fiscal year format: ${fy}`)
}

/** Convert DB integer to display format: 2024 → '2023-24' */
export function formatFiscalYear(year: number): string {
  return `${year - 1}-${String(year).slice(2)}`
}

// ─── Data Fetching ──────────────────────────────────────────────────────────

interface GetFinancialsOpts {
  /** Fiscal year in display format ('2023-24') or integer (2024) */
  fiscalYear?: string | number
  /** Max records to return (default 10) */
  limit?: number
}

/** Normalise a raw DB row into a FinancialRecord */
function normaliseRow(row: Record<string, unknown>): FinancialRecord {
  const fy = Number(row.fiscal_year)
  const labourCosts = Number(row.labour_costs) || 0
  const adminExpenses = Number(row.administration_expenses) || 0
  const propertyEnergy = Number(row.property_energy_expenses) || 0
  const motorVehicle = Number(row.motor_vehicle_expenses) || 0
  const travelTraining = Number(row.travel_training_expenses) || 0
  const clientCosts = Number(row.client_related_costs) || 0

  const totalIncome = Number(row.total_income) || 0

  // Use view columns if present, otherwise compute
  const totalExpenditure = Number(row.total_expenditure) ||
    (labourCosts + adminExpenses + propertyEnergy + motorVehicle + travelTraining + clientCosts)
  const netResult = Number(row.net_surplus_deficit) ?? (totalIncome - totalExpenditure)

  const currentAssets = Number(row.current_assets) || 0
  const nonCurrentAssets = Number(row.non_current_assets) || 0
  const currentLiabilities = Number(row.current_liabilities) || 0
  const nonCurrentLiabilities = Number(row.non_current_liabilities) || 0

  const totalAssets = Number(row.total_assets) || (currentAssets + nonCurrentAssets)
  const totalLiabilities = Number(row.total_liabilities) || (currentLiabilities + nonCurrentLiabilities)

  return {
    fiscal_year: fy,
    fiscal_year_display: formatFiscalYear(fy),
    total_income: totalIncome,
    total_expenditure: totalExpenditure,
    net_result: netResult,
    total_assets: totalAssets,
    total_liabilities: totalLiabilities,
    net_assets: Number(row.net_assets) || (totalAssets - totalLiabilities),
    expense_breakdown: {
      labour_costs: labourCosts,
      administration_expenses: adminExpenses,
      property_energy_expenses: propertyEnergy,
      motor_vehicle_expenses: motorVehicle,
      travel_training_expenses: travelTraining,
      client_related_costs: clientCosts,
    },
    audited: Boolean(row.audited),
    auditor_name: (row.auditor_name as string) || null,
  }
}

/**
 * Fetch financial records from Supabase.
 * Tries the `annual_financials_complete` view first, falls back to base table.
 */
export async function getFinancials(opts?: GetFinancialsOpts): Promise<FinancialRecord[]> {
  const supabase = getSupabase()
  const limit = opts?.limit ?? 10

  // Resolve fiscal year to integer if provided
  let fyInt: number | undefined
  if (opts?.fiscalYear != null) {
    fyInt = typeof opts.fiscalYear === 'number'
      ? opts.fiscalYear
      : parseFiscalYear(opts.fiscalYear)
  }

  // Try view first
  let query = supabase
    .from('annual_financials_complete')
    .select('*')
    .order('fiscal_year', { ascending: false })
    .limit(limit)
  if (fyInt) query = query.eq('fiscal_year', fyInt)

  let { data, error } = await query

  // Fallback to base table
  if (error || !data?.length) {
    let fallback = supabase
      .from('annual_financials')
      .select('*')
      .order('fiscal_year', { ascending: false })
      .limit(limit)
    if (fyInt) fallback = fallback.eq('fiscal_year', fyInt)
    const res = await fallback
    data = res.data
  }

  return (data || []).map((row: Record<string, unknown>) => normaliseRow(row))
}

/** Get the most recent financial record */
export async function getLatestFinancials(): Promise<FinancialRecord | null> {
  const records = await getFinancials({ limit: 1 })
  return records[0] ?? null
}
