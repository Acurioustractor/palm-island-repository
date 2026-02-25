/**
 * Extract and fill financial data from annual report PDFs
 *
 * Focused script that only extracts financial data using Claude,
 * maps to the actual annual_financials DB schema, and fills gaps.
 *
 * Run: npx tsx scripts/extract-financials.ts
 * Single year: npx tsx scripts/extract-financials.ts --year 2023-24
 * Dry run: npx tsx scripts/extract-financials.ts --dry-run
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { readFileSync, existsSync } from 'fs'
import Anthropic from '@anthropic-ai/sdk'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!supabaseUrl || !supabaseKey) { console.error('Missing Supabase credentials'); process.exit(1) }

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})
const anthropic = new Anthropic()

let pdfjs: typeof import('pdfjs-dist/legacy/build/pdf.mjs')

const DRY_RUN = process.argv.includes('--dry-run')
const SINGLE_YEAR = process.argv.find((_, i, a) => a[i - 1] === '--year')

const FISCAL_YEARS = [
  '2009-10', '2010-11', '2011-12', '2012-13', '2013-14', '2014-15',
  '2015-16', '2016-17', '2017-18', '2018-19', '2019-20', '2020-21',
  '2021-22', '2022-23', '2023-24'
]

// DB fiscal_year format: "2024" for FY2023-24
function toDbFiscalYear(fy: string): string {
  return '20' + fy.split('-')[1]
}

async function extractTextFromPDF(fiscalYear: string): Promise<string> {
  const pdfPath = resolve(process.cwd(), '..', 'annual-reports', 'source-pdfs', `${fiscalYear}.pdf`)
  if (!existsSync(pdfPath)) return ''

  if (!pdfjs) pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')

  const buffer = readFileSync(pdfPath)
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer), useSystemFonts: true }).promise

  let text = ''
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map((item: { str?: string }) => item.str || '').join(' ') + '\n'
  }
  return text
}

interface FinancialData {
  total_income: number | null
  labour_costs: number | null
  administration_expenses: number | null
  property_energy_expenses: number | null
  motor_vehicle_expenses: number | null
  travel_training_expenses: number | null
  client_related_costs: number | null
  current_assets: number | null
  non_current_assets: number | null
  current_liabilities: number | null
  non_current_liabilities: number | null
  audited: boolean
  auditor_name: string | null
  notes: string | null
}

async function extractFinancials(text: string, fiscalYear: string): Promise<FinancialData> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    system: `You are a financial data extractor analyzing Palm Island Community Company (PICC) annual reports. Extract exact financial figures from the report. Use raw integer numbers (no $ signs, no commas, no decimals). If a figure cannot be found, use null.`,
    messages: [{
      role: 'user',
      content: `Extract ALL financial data from this PICC Annual Report for fiscal year ${fiscalYear} (July-June).

Look for:
- Income Statement / Statement of Comprehensive Income / Profit & Loss
- Balance Sheet / Statement of Financial Position
- Notes to Financial Statements
- Auditor's Report
- Any financial tables, charts, or mentions of dollar amounts

${text.slice(0, 80000)}

Return ONLY valid JSON with these exact fields (use raw integers, no $ or commas):
{
  "total_income": null,
  "labour_costs": null,
  "administration_expenses": null,
  "property_energy_expenses": null,
  "motor_vehicle_expenses": null,
  "travel_training_expenses": null,
  "client_related_costs": null,
  "current_assets": null,
  "non_current_assets": null,
  "current_liabilities": null,
  "non_current_liabilities": null,
  "audited": false,
  "auditor_name": null,
  "notes": "Brief summary of financial position"
}

Definitions:
- total_income: All revenue including grants, government funding, fees, sales
- labour_costs: Employee expenses, wages, salaries, superannuation, workers comp
- administration_expenses: Office costs, insurance, professional fees, IT
- property_energy_expenses: Rent, utilities, building maintenance, repairs
- motor_vehicle_expenses: Vehicle costs, fuel, fleet expenses
- travel_training_expenses: Staff travel, professional development, training
- client_related_costs: Direct service delivery costs, program materials
- current_assets: Cash, receivables, prepayments (due within 12 months)
- non_current_assets: Property, equipment, vehicles (long-term)
- current_liabilities: Payables, provisions, unexpended grants (due within 12 months)
- non_current_liabilities: Long-term provisions, loans
- audited: Whether an auditor's report is present
- auditor_name: Name of auditing firm if mentioned`
    }]
  })

  const textContent = response.content.find(c => c.type === 'text')
  try {
    const jsonMatch = textContent?.text?.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
  } catch (e) {
    console.error(`  JSON parse error:`, e)
  }

  return {
    total_income: null, labour_costs: null, administration_expenses: null,
    property_energy_expenses: null, motor_vehicle_expenses: null,
    travel_training_expenses: null, client_related_costs: null,
    current_assets: null, non_current_assets: null,
    current_liabilities: null, non_current_liabilities: null,
    audited: false, auditor_name: null, notes: null
  }
}

async function main() {
  console.log('PICC Financial Data Extraction')
  console.log('=' .repeat(60))

  if (DRY_RUN) console.log('MODE: DRY RUN\n')

  const yearsToProcess = SINGLE_YEAR
    ? FISCAL_YEARS.filter(y => y === SINGLE_YEAR)
    : FISCAL_YEARS

  // Show current state
  const { data: existing } = await supabase
    .from('annual_financials')
    .select('*')
    .order('fiscal_year')

  console.log('\nCurrent financial data:')
  console.log('FY    | Income     | Labour     | Admin     | Assets    | Liabilities | Audited')
  console.log('-'.repeat(90))
  for (const f of (existing || [])) {
    const fmt = (n: number | null) => n ? `$${(n / 1_000_000).toFixed(2)}M` : '  —    '
    console.log(
      `${f.fiscal_year}  | ${fmt(f.total_income).padStart(10)} | ${fmt(f.labour_costs).padStart(10)} | ${fmt(f.administration_expenses).padStart(9)} | ${fmt((f.current_assets || 0) + (f.non_current_assets || 0)).padStart(9)} | ${fmt((f.current_liabilities || 0) + (f.non_current_liabilities || 0)).padStart(11)} | ${f.audited ? 'Yes' : 'No'}`
    )
  }

  // Find gaps
  const existingYears = new Set((existing || []).map((f: { fiscal_year: string }) => f.fiscal_year))
  const allDbYears = yearsToProcess.map(toDbFiscalYear)
  const missingYears = allDbYears.filter(y => !existingYears.has(y))
  const incompleteYears = (existing || [])
    .filter((f: Record<string, unknown>) => !f.labour_costs || f.labour_costs === 0)
    .map((f: { fiscal_year: string }) => f.fiscal_year)

  console.log(`\nMissing years: ${missingYears.length > 0 ? missingYears.join(', ') : 'none'}`)
  console.log(`Incomplete years (no expense breakdown): ${incompleteYears.length > 0 ? incompleteYears.join(', ') : 'none'}`)

  // Process each year
  const results: { fy: string; dbFy: string; status: string; data?: FinancialData }[] = []

  for (const fy of yearsToProcess) {
    const dbFy = toDbFiscalYear(fy)
    const existingRecord = (existing || []).find((f: { fiscal_year: string }) => f.fiscal_year === dbFy)

    // Skip years that already have complete data
    if (existingRecord && existingRecord.labour_costs && existingRecord.labour_costs > 0 &&
        existingRecord.current_assets && existingRecord.current_assets > 0) {
      console.log(`\n${fy} (FY${dbFy}): Already complete, skipping`)
      results.push({ fy, dbFy, status: 'skipped' })
      continue
    }

    console.log(`\n${fy} (FY${dbFy}): Extracting...`)

    const text = await extractTextFromPDF(fy)
    if (text.length < 200) {
      console.log(`  Insufficient text (${text.length} chars) — skipping`)
      results.push({ fy, dbFy, status: 'no-text' })
      continue
    }

    const data = await extractFinancials(text, fy)
    results.push({ fy, dbFy, status: 'extracted', data })

    const fmt = (n: number | null) => n ? `$${(n / 1_000_000).toFixed(2)}M` : 'null'
    console.log(`  Income: ${fmt(data.total_income)}, Labour: ${fmt(data.labour_costs)}`)
    console.log(`  Assets: ${fmt((data.current_assets || 0) + (data.non_current_assets || 0))}, Liabilities: ${fmt((data.current_liabilities || 0) + (data.non_current_liabilities || 0))}`)
    console.log(`  Audited: ${data.audited}${data.auditor_name ? ` (${data.auditor_name})` : ''}`)

    if (DRY_RUN) continue

    // Build update record (only non-null extracted values)
    const record: Record<string, unknown> = {}
    if (data.total_income) record.total_income = data.total_income
    if (data.labour_costs) record.labour_costs = data.labour_costs
    if (data.administration_expenses) record.administration_expenses = data.administration_expenses
    if (data.property_energy_expenses) record.property_energy_expenses = data.property_energy_expenses
    if (data.motor_vehicle_expenses) record.motor_vehicle_expenses = data.motor_vehicle_expenses
    if (data.travel_training_expenses) record.travel_training_expenses = data.travel_training_expenses
    if (data.client_related_costs) record.client_related_costs = data.client_related_costs
    if (data.current_assets) record.current_assets = data.current_assets
    if (data.non_current_assets) record.non_current_assets = data.non_current_assets
    if (data.current_liabilities) record.current_liabilities = data.current_liabilities
    if (data.non_current_liabilities) record.non_current_liabilities = data.non_current_liabilities
    if (data.audited) record.audited = data.audited
    if (data.auditor_name) record.auditor_name = data.auditor_name
    if (data.notes) record.notes = data.notes

    if (Object.keys(record).length === 0) {
      console.log(`  No usable financial data extracted`)
      continue
    }

    if (existingRecord) {
      // Only update null/zero fields
      const updates: Record<string, unknown> = {}
      for (const [key, val] of Object.entries(record)) {
        if (val != null && (!existingRecord[key] || existingRecord[key] === 0)) {
          updates[key] = val
        }
      }
      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.from('annual_financials').update(updates).eq('id', existingRecord.id)
        if (error) console.error(`  DB error:`, error.message)
        else console.log(`  Updated ${Object.keys(updates).length} fields`)
      } else {
        console.log(`  No new data to fill`)
      }
    } else {
      record.fiscal_year = dbFy
      const { error } = await supabase.from('annual_financials').insert(record)
      if (error) console.error(`  DB error:`, error.message)
      else console.log(`  Created new record`)
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 1500))
  }

  // Final state
  console.log('\n\n' + '='.repeat(60))
  console.log('FINAL STATE')
  console.log('='.repeat(60))

  const { data: final } = await supabase
    .from('annual_financials')
    .select('*')
    .order('fiscal_year')

  console.log('\nFY    | Income     | Labour     | Admin     | Assets    | Liabilities | Audited')
  console.log('-'.repeat(90))
  for (const f of (final || [])) {
    const fmt = (n: number | null) => n ? `$${(n / 1_000_000).toFixed(2)}M` : '  —    '
    console.log(
      `${f.fiscal_year}  | ${fmt(f.total_income).padStart(10)} | ${fmt(f.labour_costs).padStart(10)} | ${fmt(f.administration_expenses).padStart(9)} | ${fmt((f.current_assets || 0) + (f.non_current_assets || 0)).padStart(9)} | ${fmt((f.current_liabilities || 0) + (f.non_current_liabilities || 0)).padStart(11)} | ${f.audited ? 'Yes' : 'No'}`
    )
  }

  // Summary
  const extracted = results.filter(r => r.status === 'extracted').length
  const skipped = results.filter(r => r.status === 'skipped').length
  const noText = results.filter(r => r.status === 'no-text').length
  console.log(`\nProcessed: ${extracted} extracted, ${skipped} skipped (complete), ${noText} no text`)
}

main()
  .then(() => { console.log('\nDone.'); process.exit(0) })
  .catch(e => { console.error('Fatal:', e); process.exit(1) })
