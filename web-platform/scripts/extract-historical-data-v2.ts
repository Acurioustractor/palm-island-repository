/**
 * Historical Data Extraction Script v2
 *
 * Fetches annual report text from knowledge_entries, sends to Claude API
 * for structured extraction, and upserts into existing Supabase tables.
 *
 * Usage:
 *   npx tsx scripts/extract-historical-data-v2.ts              # Extract all years
 *   npx tsx scripts/extract-historical-data-v2.ts --year 2023-24  # Single year
 *   npx tsx scripts/extract-historical-data-v2.ts --dry-run       # Preview only
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Parse CLI flags
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const yearFlag = args.find((_, i) => args[i - 1] === '--year')

// Fiscal year text → integer (e.g., "2023-24" → 2024, "2009-10" → 2010)
function fiscalYearToInt(fy: string): number {
  const [startStr] = fy.split('-')
  return parseInt(startStr) + 1
}

// Normalize fiscal year format to "YYYY-YY"
function normalizeFiscalYear(fy: string): string {
  if (/^\d{4}-\d{2}$/.test(fy)) return fy
  if (/^\d{4}-\d{4}$/.test(fy)) {
    const [start, end] = fy.split('-')
    return `${start}-${end.slice(-2)}`
  }
  return fy
}

interface ExtractionResult {
  fiscal_year: string
  staff: {
    total: number | null
    indigenous_count: number | null
    indigenous_percent: number | null
    full_time: number | null
    part_time: number | null
    casual: number | null
    confidence: number
  }
  financials: {
    total_income: number | null
    total_expenditure: number | null
    total_assets: number | null
    current_assets: number | null
    non_current_assets: number | null
    current_liabilities: number | null
    non_current_liabilities: number | null
    labour_costs: number | null
    confidence: number
  }
  board_members: Array<{ name: string; role: string }>
  achievements: Array<{ text: string; category: string }>
  quotes: Array<{
    text: string
    speaker_name: string
    speaker_role: string
    theme: string
  }>
  services: string[]
  narrative_summary: string
  service_count: number | null
  people_served: string | null
}

const EXTRACTION_PROMPT = `You are analyzing an annual report from Palm Island Community Company (PICC), an Indigenous community-controlled organization in Queensland, Australia. Extract structured data from this annual report text.

Return a JSON object with this exact structure (use null for fields you cannot find):

{
  "staff": {
    "total": <number or null>,
    "indigenous_count": <number or null>,
    "indigenous_percent": <number or null>,
    "full_time": <number or null>,
    "part_time": <number or null>,
    "casual": <number or null>,
    "confidence": <0-100>
  },
  "financials": {
    "total_income": <number or null - in AUD, no cents>,
    "total_expenditure": <number or null>,
    "total_assets": <number or null>,
    "current_assets": <number or null>,
    "non_current_assets": <number or null>,
    "current_liabilities": <number or null>,
    "non_current_liabilities": <number or null>,
    "labour_costs": <number or null>,
    "confidence": <0-100>
  },
  "board_members": [
    { "name": "Full Name", "role": "Chairperson/Director/etc" }
  ],
  "achievements": [
    { "text": "Achievement description", "category": "service|governance|community|infrastructure|cultural" }
  ],
  "quotes": [
    {
      "text": "The exact quote text",
      "speaker_name": "Speaker Name",
      "speaker_role": "Their role/title",
      "theme": "leadership|community|culture|service|future"
    }
  ],
  "services": ["Service Name 1", "Service Name 2"],
  "narrative_summary": "2-3 sentence summary of the year's key themes and outcomes",
  "service_count": <number or null>,
  "people_served": "<string like '2,500+' or null>"
}

Rules:
- Extract ONLY data explicitly stated in the text. Do not fabricate.
- Financial figures should be whole dollars (no cents). Convert "2.1 million" to 2100000.
- For staff percentages, calculate if total and indigenous count are given.
- Achievements should be 3-5 of the most significant, concrete accomplishments.
- Quotes must be exact text from the report, not paraphrased.
- Confidence scores: 90+ = exact numbers found, 50-89 = estimated from context, <50 = very uncertain.
- Return ONLY the JSON object, no markdown or explanation.`

async function extractFromText(
  fiscalYear: string,
  text: string
): Promise<ExtractionResult> {
  const truncatedText = text.slice(0, 80000) // Stay within token limits

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `This is the PICC Annual Report for fiscal year ${fiscalYear}.\n\n${truncatedText}`,
      },
    ],
    system: EXTRACTION_PROMPT,
  })

  const responseText =
    message.content[0].type === 'text' ? message.content[0].text : ''

  // Parse JSON, handling potential markdown wrapping
  const jsonStr = responseText
    .replace(/^```json\s*/, '')
    .replace(/```\s*$/, '')
    .trim()

  const parsed = JSON.parse(jsonStr)

  return {
    fiscal_year: fiscalYear,
    ...parsed,
  }
}

async function getOrganizationId(): Promise<string> {
  const { data } = await supabase
    .from('organizations')
    .select('id')
    .ilike('name', '%palm island%')
    .limit(1)
    .single()

  if (!data) throw new Error('Organization not found')
  return data.id
}

async function upsertStaffStats(
  orgId: string,
  result: ExtractionResult
): Promise<void> {
  if (!result.staff.total && result.staff.confidence < 30) {
    console.log(`  ⏭️  Skipping staff stats (low confidence: ${result.staff.confidence})`)
    return
  }

  const fyInt = fiscalYearToInt(result.fiscal_year)
  const [startYear] = result.fiscal_year.split('-')
  const snapshotDate = `${startYear}-06-30` // End of fiscal year

  const { error } = await supabase.from('staff_statistics').upsert(
    {
      organization_id: orgId,
      fiscal_year: fyInt,
      snapshot_date: snapshotDate,
      total_staff: result.staff.total || 0,
      full_time_staff: result.staff.full_time,
      part_time_staff: result.staff.part_time,
      casual_staff: result.staff.casual,
      indigenous_staff_count: result.staff.indigenous_count,
      notes: `source: ai-extraction-v2, confidence: ${result.staff.confidence}`,
    },
    { onConflict: 'organization_id,fiscal_year,snapshot_date' }
  )

  if (error) console.error(`  ❌ Staff stats error:`, error.message)
  else console.log(`  ✅ Staff stats upserted`)
}

async function upsertFinancials(
  orgId: string,
  result: ExtractionResult
): Promise<void> {
  if (!result.financials.total_income && result.financials.confidence < 30) {
    console.log(`  ⏭️  Skipping financials (low confidence: ${result.financials.confidence})`)
    return
  }

  const fyInt = fiscalYearToInt(result.fiscal_year)

  const { error } = await supabase.from('annual_financials').upsert(
    {
      organization_id: orgId,
      fiscal_year: fyInt,
      total_income: result.financials.total_income,
      current_assets: result.financials.current_assets || 0,
      non_current_assets: result.financials.non_current_assets || 0,
      current_liabilities: result.financials.current_liabilities || 0,
      non_current_liabilities: result.financials.non_current_liabilities || 0,
      labour_costs: result.financials.labour_costs || 0,
      notes: `source: ai-extraction-v2, confidence: ${result.financials.confidence}`,
    },
    { onConflict: 'organization_id,fiscal_year' }
  )

  if (error) console.error(`  ❌ Financials error:`, error.message)
  else console.log(`  ✅ Financials upserted`)
}

async function upsertAchievements(
  orgId: string,
  result: ExtractionResult
): Promise<void> {
  if (!result.achievements?.length) return

  const fyInt = fiscalYearToInt(result.fiscal_year)

  // Delete existing AI-extracted achievements for this year first
  await supabase
    .from('governance_achievements')
    .delete()
    .eq('organization_id', orgId)
    .eq('fiscal_year', fyInt)
    .ilike('category', '%ai-extraction%')

  for (let i = 0; i < result.achievements.length; i++) {
    const a = result.achievements[i]
    const { error } = await supabase.from('governance_achievements').insert({
      organization_id: orgId,
      fiscal_year: fyInt,
      achievement_text: a.text,
      category: `${a.category} (ai-extraction-v2)`,
      display_order: i,
    })
    if (error) console.error(`  ❌ Achievement error:`, error.message)
  }
  console.log(`  ✅ ${result.achievements.length} achievements inserted`)
}

async function upsertQuotes(
  orgId: string,
  result: ExtractionResult
): Promise<void> {
  if (!result.quotes?.length) return

  for (const q of result.quotes) {
    // Check if quote already exists (by speaker + approximate text match)
    const { data: existing } = await supabase
      .from('elder_quotes')
      .select('id')
      .eq('organization_id', orgId)
      .eq('speaker_name', q.speaker_name)
      .ilike('text', `%${q.text.slice(0, 50)}%`)
      .limit(1)

    if (existing?.length) continue // Skip duplicates

    const { error } = await supabase.from('elder_quotes').insert({
      organization_id: orgId,
      text: q.text,
      speaker_name: q.speaker_name,
      speaker_role: q.speaker_role,
      theme: q.theme,
      category: `ai-extraction-v2 (${result.fiscal_year})`,
      is_validated: false,
      permission_level: 'public',
      cultural_sensitivity: 'standard',
    })
    if (error) console.error(`  ❌ Quote error:`, error.message)
  }
  console.log(`  ✅ ${result.quotes.length} quotes processed`)
}

async function upsertOrgStats(
  orgId: string,
  result: ExtractionResult
): Promise<void> {
  const { error } = await supabase.from('organization_stats').upsert(
    {
      organization_id: orgId,
      fiscal_year: result.fiscal_year,
      staff_count: result.staff.total,
      service_count: result.service_count || result.services?.length || null,
      people_served: result.people_served,
      annual_budget: result.financials.total_income,
      indigenous_staff_percentage: result.staff.indigenous_percent
        ? `${result.staff.indigenous_percent}%`
        : null,
      notes: `source: ai-extraction-v2`,
    },
    { onConflict: 'organization_id,fiscal_year' }
  )

  if (error) console.error(`  ❌ Org stats error:`, error.message)
  else console.log(`  ✅ Organization stats upserted`)
}

async function upsertBoardMembers(
  orgId: string,
  result: ExtractionResult
): Promise<void> {
  if (!result.board_members?.length) return

  // Only insert board members if they don't already exist
  for (const bm of result.board_members) {
    const { data: existing } = await supabase
      .from('board_members')
      .select('id')
      .eq('organization_id', orgId)
      .ilike('name', bm.name)
      .limit(1)

    if (existing?.length) continue

    const [startYear] = result.fiscal_year.split('-')
    const { error } = await supabase.from('board_members').insert({
      organization_id: orgId,
      name: bm.name,
      role: bm.role,
      start_date: `${startYear}-07-01`,
    })
    if (error) console.error(`  ❌ Board member error:`, error.message)
  }
  console.log(`  ✅ ${result.board_members.length} board members processed`)
}

async function main() {
  console.log('🏝️  PICC Historical Data Extraction v2')
  console.log(dryRun ? '🔍 DRY RUN MODE - no data will be written\n' : '\n')

  // Fetch knowledge entries
  let query = supabase
    .from('knowledge_entries')
    .select('slug, fiscal_year, content, title')
    .eq('entry_type', 'document')
    .ilike('slug', 'picc-annual-report-%-full-pdf')
    .order('fiscal_year', { ascending: true })

  const { data: entries, error } = await query

  if (error) {
    console.error('❌ Failed to fetch knowledge entries:', error.message)
    process.exit(1)
  }

  if (!entries?.length) {
    console.log('⚠️  No knowledge entries found')
    process.exit(0)
  }

  // Filter by year if specified
  let toProcess = entries
  if (yearFlag) {
    toProcess = entries.filter(
      (e) => normalizeFiscalYear(e.fiscal_year) === yearFlag
    )
    if (!toProcess.length) {
      console.error(`❌ No entry found for year: ${yearFlag}`)
      process.exit(1)
    }
  }

  console.log(`📄 Found ${toProcess.length} annual report(s) to process\n`)

  const orgId = await getOrganizationId()
  console.log(`🏢 Organization ID: ${orgId}\n`)

  for (const entry of toProcess) {
    const fy = normalizeFiscalYear(entry.fiscal_year)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📅 Processing: ${fy} (${entry.title})`)
    console.log(`   Content length: ${entry.content?.length || 0} chars`)

    if (!entry.content || entry.content.length < 500) {
      console.log(`   ⏭️  Skipping - content too short\n`)
      continue
    }

    try {
      console.log(`   🤖 Sending to Claude for extraction...`)
      const result = await extractFromText(fy, entry.content)

      console.log(`   📊 Extraction complete:`)
      console.log(`      Staff: ${result.staff.total ?? 'N/A'} (confidence: ${result.staff.confidence}%)`)
      console.log(`      Income: ${result.financials.total_income ? `$${(result.financials.total_income / 1_000_000).toFixed(1)}M` : 'N/A'} (confidence: ${result.financials.confidence}%)`)
      console.log(`      Board: ${result.board_members?.length || 0} members`)
      console.log(`      Achievements: ${result.achievements?.length || 0}`)
      console.log(`      Quotes: ${result.quotes?.length || 0}`)
      console.log(`      Services: ${result.services?.length || 0}`)
      console.log(`      Summary: ${result.narrative_summary?.slice(0, 80)}...`)

      if (!dryRun) {
        console.log(`   💾 Writing to database...`)
        await upsertStaffStats(orgId, result)
        await upsertFinancials(orgId, result)
        await upsertAchievements(orgId, result)
        await upsertQuotes(orgId, result)
        await upsertOrgStats(orgId, result)
        await upsertBoardMembers(orgId, result)
      } else {
        console.log(`   🔍 DRY RUN - skipping database writes`)
      }
    } catch (err: any) {
      console.error(`   ❌ Error processing ${fy}:`, err.message)
    }

    console.log()
  }

  console.log('✅ Extraction complete!')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
