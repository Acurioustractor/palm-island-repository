import { z } from 'zod'
import { defineTool, getSupabase } from './_shared'
import { checkCompleteness, type CompletenessReport, type ServiceCompleteness } from '@/lib/content-readiness/check-completeness'
import { getFinancials, formatFiscalYear, type FinancialRecord } from '@/lib/financials/get-financials'

// ─── Schema definitions ──────────────────────────────────────────────────────

const getFinancialSummarySchema = z.object({
  fiscalYear: z.string().optional().describe('Fiscal year (e.g. "2023-24"). Defaults to latest.'),
  focus: z.enum(['overview', 'expenses', 'trends', 'ratios']).default('overview')
    .describe('What to focus on: overview (headline numbers + breakdown %), expenses (6-category detail with YoY), trends (all years with growth rates), ratios (labour %, admin %, current ratio)'),
})

type GetFinancialSummaryInput = z.infer<typeof getFinancialSummarySchema>

const getContentReadinessSchema = z.object({
  scope: z.enum(['all', 'services', 'report']).default('all')
    .describe('What to check: all (services + report sections), services only, or report sections only'),
})

type GetContentReadinessInput = z.infer<typeof getContentReadinessSchema>

const getAnnualReportArchiveSchema = z.object({
  year: z.string().optional().describe('Specific fiscal year (e.g. "2023-24")'),
})

type GetAnnualReportArchiveInput = z.infer<typeof getAnnualReportArchiveSchema>

const getPublicationsSchema = z.object({
  category: z.string().optional().describe('Filter by category'),
  search: z.string().optional().describe('Search title or description'),
})

type GetPublicationsInput = z.infer<typeof getPublicationsSchema>

const getImpactIndicatorsSchema = z.object({
  serviceArea: z.string().optional().describe('Filter by service area'),
  indicatorType: z.string().optional().describe('Filter by indicator type'),
})

type GetImpactIndicatorsInput = z.infer<typeof getImpactIndicatorsSchema>

// ─── Helper functions ────────────────────────────────────────────────────────

function pct(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0
}

function yoyGrowth(current: number, previous: number): number | null {
  if (!previous || previous === 0) return null
  return Math.round(((current - previous) / previous) * 1000) / 10
}

// ─── getFinancialSummary ────────────────────────────────────────────────────

export const getFinancialSummary = defineTool({
  description: 'Get PICC financial summary — revenue, expenditure, expense breakdown, trends, and ratios. Use focus=overview for headline numbers, focus=expenses for category detail, focus=trends for multi-year growth, focus=ratios for health indicators.',
  parameters: getFinancialSummarySchema,
  execute: async (input: GetFinancialSummaryInput) => {
    const { fiscalYear, focus } = input

    const limit = focus === 'trends' ? 10 : 3
    const records = await getFinancials({ fiscalYear, limit })

    if (records.length === 0) {
      return { financials: [], count: 0 }
    }

    const latest = records[0]
    const prev = records[1] || null

    // Build expense breakdown with percentages
    const breakdownEntries = Object.entries(latest.expense_breakdown).map(([key, amount]) => ({
      category: key,
      label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      amount,
      percentage: pct(amount, latest.total_expenditure),
      yoy_change: prev ? yoyGrowth(amount, (prev.expense_breakdown as Record<string, number>)[key]) : null,
    })).sort((a, b) => b.amount - a.amount)

    // Base financial row shape for the renderer
    const toFinancialRow = (r: FinancialRecord) => ({
      fiscal_year: r.fiscal_year_display,
      total_revenue: r.total_income,
      total_expenditure: r.total_expenditure,
      surplus_deficit: r.net_result,
      total_assets: r.total_assets,
      net_assets: r.net_assets,
      audited: r.audited,
      ...r.expense_breakdown,
    })

    if (focus === 'overview') {
      return {
        financials: records.map(toFinancialRow),
        expense_breakdown: breakdownEntries,
        count: records.length,
      }
    }

    if (focus === 'expenses') {
      return {
        financials: [toFinancialRow(latest)],
        expense_breakdown: breakdownEntries,
        count: 1,
      }
    }

    if (focus === 'trends') {
      const trendRows = records.map((r, i) => {
        const prevRecord = records[i + 1] || null
        return {
          ...toFinancialRow(r),
          revenue_growth: prevRecord ? yoyGrowth(r.total_income, prevRecord.total_income) : null,
          expenditure_growth: prevRecord ? yoyGrowth(r.total_expenditure, prevRecord.total_expenditure) : null,
        }
      })
      return {
        financials: trendRows,
        expense_breakdown: breakdownEntries,
        count: trendRows.length,
        summary: records.length >= 2
          ? `Revenue ${yoyGrowth(records[0].total_income, records[records.length - 1].total_income) ?? 0}% over ${records.length} years`
          : null,
      }
    }

    // focus === 'ratios'
    const labourRatio = pct(latest.expense_breakdown.labour_costs, latest.total_expenditure)
    const adminRatio = pct(latest.expense_breakdown.administration_expenses, latest.total_expenditure)
    const currentRatio = latest.total_liabilities > 0
      ? Math.round((latest.total_assets / latest.total_liabilities) * 100) / 100
      : null

    const ratioHealth = (label: string, value: number, thresholds: { good: [number, number]; warn: [number, number] }) => {
      const status = value >= thresholds.good[0] && value <= thresholds.good[1] ? 'healthy'
        : value >= thresholds.warn[0] && value <= thresholds.warn[1] ? 'watch' : 'concern'
      return { label, value, status }
    }

    return {
      financials: [toFinancialRow(latest)],
      expense_breakdown: breakdownEntries,
      ratios: [
        ratioHealth('Labour Cost Ratio', labourRatio, { good: [50, 65], warn: [40, 70] }),
        ratioHealth('Admin Overhead', adminRatio, { good: [10, 20], warn: [5, 30] }),
        ...(currentRatio != null ? [ratioHealth('Current Ratio (Assets/Liabilities)', currentRatio, { good: [1.2, 3], warn: [1, 5] })] : []),
      ],
      audited: latest.audited,
      auditor_name: latest.auditor_name,
      count: 1,
    }
  },
})

// ─── getContentReadiness ─────────────────────────────────────────────────────

export const getContentReadiness = defineTool({
  description: 'Check completeness of PICC data — services (description, cover photo, metrics, stories, notes) and annual report sections (CEO message, financials, elder quotes, gallery photos). Returns green/amber/red status per item.',
  parameters: getContentReadinessSchema,
  execute: async (input: GetContentReadinessInput) => {
    const { scope } = input

    try {
      const report = await checkCompleteness()

      if (scope === 'services') {
        return {
          services: report.services,
          overallScore: report.overallScore,
          generatedAt: report.generatedAt,
        }
      }

      if (scope === 'report') {
        return {
          reportSections: report.reportSections,
          overallScore: report.overallScore,
          generatedAt: report.generatedAt,
        }
      }

      return report
    } catch (err) {
      console.error('getContentReadiness error:', err)
      return { error: 'Failed to check content readiness.' }
    }
  },
})

// ─── getAnnualReportArchive ─────────────────────────────────────────────────

export const getAnnualReportArchive = defineTool({
  description: 'Get past annual reports — titles, themes, executive summaries, and download links.',
  parameters: getAnnualReportArchiveSchema,
  execute: async (input: GetAnnualReportArchiveInput) => {
    const { year } = input
    const supabase = getSupabase()

    let query = supabase
      .from('annual_reports')
      .select('id, fiscal_year, title, subtitle, theme, status, executive_summary, leadership_message_author, year_highlights, looking_forward, pdf_url, web_version_url, published_date, views, downloads')
      .order('fiscal_year', { ascending: false })
      .limit(10)

    if (year) query = query.eq('fiscal_year', year)

    const { data } = await query

    return { reports: data || [], count: data?.length || 0 }
  },
})

// ─── getPublications ────────────────────────────────────────────────────────

export const getPublications = defineTool({
  description: 'Get PICC publications — reports, research papers, and documents with download links.',
  parameters: getPublicationsSchema,
  execute: async (input: GetPublicationsInput) => {
    const { category, search } = input
    const supabase = getSupabase()

    let query = supabase
      .from('publications')
      .select('slug, title, subtitle, description, category, tags, pdf_url, author, published_date, fiscal_year, is_featured')
      .eq('status', 'published')
      .order('published_date', { ascending: false })
      .limit(20)

    if (category) query = query.eq('category', category)
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)

    const { data } = await query

    return { publications: data || [], count: data?.length || 0 }
  },
})

// ─── getImpactIndicators ────────────────────────────────────────────────────

export const getImpactIndicators = defineTool({
  description: 'Get impact measurement indicators — KPIs, outcomes, and change metrics tracked across services and stories.',
  parameters: getImpactIndicatorsSchema,
  execute: async (input: GetImpactIndicatorsInput) => {
    const { serviceArea, indicatorType } = input
    const supabase = getSupabase()

    let query = supabase
      .from('impact_indicators')
      .select('id, service_area, indicator_type, indicator_name, indicator_description, measurement_type, value_numeric, value_text, value_category, baseline_value, target_value, change_observed, significance, measurement_date, pattern_category')
      .order('measurement_date', { ascending: false })
      .limit(30)

    if (serviceArea) query = query.ilike('service_area', `%${serviceArea}%`)
    if (indicatorType) query = query.eq('indicator_type', indicatorType)

    const { data } = await query

    return { indicators: data || [], count: data?.length || 0 }
  },
})
