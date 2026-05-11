/**
 * Empathy Ledger v2 — annual reports archive.
 *
 * EL v2 holds the canonical multi-year PICC annual report archive
 * (2007-08 through 2024-25 — 18 years, 15 with PDFs). PICC's own
 * `annual_reports` table is for in-flight planning only; the historical
 * record lives in EL v2.
 *
 * This module queries EL v2's Supabase directly via the service-role
 * key (REST PostgREST endpoint), scoped to the PICC organisation id
 * registered in EL v2.
 */

const EL_REST = 'https://yvnuayzslukamizrlhwb.supabase.co/rest/v1'
const PICC_ORG_ID_EL = '084f851c-72e0-41fb-b5ba-f3088f44862d'

export interface ELAnnualReportSection {
  title: string
  summary: string
  page_range?: string
}

export interface ELAnnualReportStats {
  ceo?: string | null
  chair?: string | null
  staff_count?: number | null
  total_revenue?: number | null
  total_expenses?: number | null
  net_surplus?: number | null
  programs_count?: number | null
  clients_served?: number | null
  trainees?: number | null
  indigenous_staff_percent?: number | null
  /** Open shape — EL extraction picks up other numbers per report too. */
  [key: string]: number | string | null | undefined
}

export interface ELAnnualReport {
  id: string
  fiscal_year: string | null
  title: string | null
  subtitle: string | null
  pdf_url: string | null
  cover_image_url: string | null
  published_date: string | null
  status: string | null
  /** Set when EL ran its Claude-vision PDF extraction. */
  extraction_status: string | null
  /** 2-4 sentence summary of the year, extracted from the PDF. */
  extracted_summary: string | null
  /** Structured numbers — staff_count, total_revenue, etc. */
  extracted_stats: ELAnnualReportStats | null
  /** Array of {title, summary, page_range}. */
  extracted_sections: ELAnnualReportSection[] | null
  /** Photo descriptions extracted from the PDF. */
  extracted_photos: string[] | null
  /** Bag with key_achievements, financial_highlights, extracted_at. */
  metadata: {
    key_achievements?: string[]
    financial_highlights?: Record<string, unknown>
    extracted_at?: string
  } | null
}

export async function getPiccAnnualReports(): Promise<ELAnnualReport[]> {
  const key = process.env.EMPATHY_LEDGER_SERVICE_KEY
  if (!key) return []
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 15_000)
  try {
    const url = `${EL_REST}/annual_reports?organization_id=eq.${PICC_ORG_ID_EL}&select=id,fiscal_year,title,subtitle,pdf_url,cover_image_url,published_date,status,extraction_status,extracted_summary,extracted_stats,extracted_sections,extracted_photos,metadata&order=fiscal_year.desc`
    const res = await fetch(url, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: 'no-store',
      signal: ctrl.signal,
    })
    if (!res.ok) return []
    return (await res.json()) as ELAnnualReport[]
  } catch {
    return []
  } finally {
    clearTimeout(timer)
  }
}

/** Parse "2023-24" → 2024 (the calendar year the fiscal year ends in). */
export function fiscalYearEnd(fy: string | null | undefined): number | null {
  if (!fy) return null
  const m = /(\d{4})-(\d{2,4})/.exec(fy)
  if (!m) return null
  const start = parseInt(m[1], 10)
  if (!Number.isFinite(start)) return null
  return start + 1
}
