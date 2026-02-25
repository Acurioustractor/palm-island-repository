/**
 * PICC Deep Knowledge Ingestion — 17 Years of Annual Reports
 *
 * Extracts, analyses, chunks, and embeds all 15 annual report PDFs (2009-2024)
 * into the knowledge base, content_embeddings, timeline_events, and annual_financials.
 *
 * Run: npx tsx scripts/ingest-annual-reports.ts
 * Run single year: npx tsx scripts/ingest-annual-reports.ts --year 2023-24
 * Dry run: npx tsx scripts/ingest-annual-reports.ts --dry-run
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { readFileSync, existsSync } from 'fs'
import Anthropic from '@anthropic-ai/sdk'

// pdfjs-dist loaded via dynamic import (ESM)
let pdfjs: typeof import('pdfjs-dist/legacy/build/pdf.mjs')

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

// ============================================================================
// CONFIG
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const openaiKey = process.env.OPENAI_API_KEY!

if (!supabaseUrl || !supabaseKey) { console.error('Missing Supabase credentials'); process.exit(1) }
if (!openaiKey) { console.error('Missing OPENAI_API_KEY'); process.exit(1) }

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})
const anthropic = new Anthropic()

const DRY_RUN = process.argv.includes('--dry-run')
const SINGLE_YEAR = process.argv.find((_, i, a) => a[i - 1] === '--year')
const DELAY_MS = 1500 // delay between Claude API calls

const FISCAL_YEARS = [
  '2009-10', '2010-11', '2011-12', '2012-13', '2013-14', '2014-15',
  '2015-16', '2016-17', '2017-18', '2018-19', '2019-20', '2020-21',
  '2021-22', '2022-23', '2023-24'
]

const FISCAL_YEAR_INFO: Record<string, { theme: string; era: string; keywords: string[] }> = {
  '2009-10': { theme: 'Foundation & Early Growth', era: 'foundation', keywords: ['foundation', 'community control', 'establishing services'] },
  '2010-11': { theme: 'Building Infrastructure', era: 'foundation', keywords: ['infrastructure', 'growth', 'expansion'] },
  '2011-12': { theme: 'Service Expansion', era: 'foundation', keywords: ['services', 'expansion', 'community programs'] },
  '2012-13': { theme: 'Community Engagement', era: 'foundation', keywords: ['engagement', 'community', 'participation'] },
  '2013-14': { theme: 'Strengthening Governance', era: 'growth', keywords: ['governance', 'accountability', 'leadership'] },
  '2014-15': { theme: 'Health & Wellbeing Focus', era: 'growth', keywords: ['health', 'wellbeing', 'services'] },
  '2015-16': { theme: 'Economic Development', era: 'growth', keywords: ['economic', 'development', 'employment'] },
  '2016-17': { theme: 'Cultural Preservation', era: 'growth', keywords: ['culture', 'heritage', 'preservation'] },
  '2017-18': { theme: 'Housing & Infrastructure', era: 'growth', keywords: ['housing', 'infrastructure', 'facilities'] },
  '2018-19': { theme: 'Education & Training', era: 'growth', keywords: ['education', 'training', 'skills'] },
  '2019-20': { theme: 'Transition Planning', era: 'transition', keywords: ['transition', 'planning', 'change'] },
  '2020-21': { theme: 'Community Control Achieved', era: 'transition', keywords: ['community control', 'achievement', 'milestone'] },
  '2021-22': { theme: 'Self-Determination', era: 'community-led', keywords: ['self-determination', 'autonomy', 'empowerment'] },
  '2022-23': { theme: 'Community-Led Growth', era: 'community-led', keywords: ['community-led', 'growth', 'innovation'] },
  '2023-24': { theme: 'Sustainable Future', era: 'community-led', keywords: ['sustainable', 'future', 'vision'] }
}

// ============================================================================
// HELPERS
// ============================================================================

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function splitIntoChunks(text: string, chunkSize = 1000, overlap = 150): string[] {
  const chunks: string[] = []
  const words = text.split(/\s+/)
  let current: string[] = []
  let currentLen = 0

  for (const word of words) {
    current.push(word)
    currentLen += word.length + 1
    if (currentLen >= chunkSize) {
      chunks.push(current.join(' '))
      const overlapWords = Math.floor(overlap / 5)
      current = current.slice(-overlapWords)
      currentLen = current.join(' ').length
    }
  }
  if (current.length > 0) {
    const remaining = current.join(' ')
    if (remaining.length > 50) chunks.push(remaining)
  }
  return chunks
}

// ============================================================================
// PDF EXTRACTION
// ============================================================================

async function extractTextFromPDF(fiscalYear: string): Promise<string> {
  const pdfPath = resolve(process.cwd(), '..', 'annual-reports', 'source-pdfs', `${fiscalYear}.pdf`)

  if (!existsSync(pdfPath)) {
    console.error(`  PDF not found: ${pdfPath}`)
    return ''
  }

  if (!pdfjs) {
    pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  }

  const buffer = readFileSync(pdfPath)
  const uint8 = new Uint8Array(buffer)
  const doc = await pdfjs.getDocument({ data: uint8, useSystemFonts: true }).promise

  let fullText = ''
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    const text = content.items.map((item: { str?: string }) => item.str || '').join(' ')
    fullText += text + '\n'
  }

  console.log(`  Extracted ${doc.numPages} pages, ${fullText.length} chars`)
  return fullText
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\x20-\x7E\n.,;:!?'"()\-–—/&$%@#*+\[\]{}]/g, '')
    .trim()
}

// ============================================================================
// CLAUDE ANALYSIS
// ============================================================================

interface ReportAnalysis {
  summary: string
  sections: { title: string; description: string }[]
  keyTopics: string[]
  entities: { people: string[]; places: string[]; organizations: string[]; programs: string[] }
  statistics: { metric: string; value: string; context: string }[]
  achievements: { title: string; description: string; year?: string }[]
  financials: {
    total_income?: number | null
    labour_costs?: number | null
    administration_expenses?: number | null
    property_energy_expenses?: number | null
    motor_vehicle_expenses?: number | null
    travel_training_expenses?: number | null
    client_related_costs?: number | null
    current_assets?: number | null
    non_current_assets?: number | null
    current_liabilities?: number | null
    non_current_liabilities?: number | null
    audited?: boolean
    auditor_name?: string | null
    funding_sources?: { source: string; amount?: number }[]
  }
  timeline_events: { title: string; description: string; date?: string; event_type?: string; significance?: number }[]
}

async function analyzeReport(text: string, fiscalYear: string): Promise<ReportAnalysis> {
  const yearInfo = FISCAL_YEAR_INFO[fiscalYear]

  console.log(`  Running Claude deep analysis...`)
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 8192,
    system: `You are analyzing a Palm Island Community Company (PICC) annual report for fiscal year ${fiscalYear} (July-June).
Extract comprehensive structured information. Be precise with numbers, names, and dates.
PICC is an Aboriginal community organisation on Palm Island, QLD, Australia.
Era context: ${yearInfo.era} phase — ${yearInfo.theme}.`,
    messages: [{
      role: 'user',
      content: `Analyze this annual report and return a JSON object with ALL of the following fields. Extract as much data as possible.

${text.slice(0, 80000)}${text.length > 80000 ? '\n...[truncated]' : ''}

Return ONLY valid JSON with these exact fields:
{
  "summary": "2-3 paragraph executive summary of the year's key achievements, challenges, and direction",
  "sections": [{"title": "Section Name", "description": "Brief description of section content"}],
  "keyTopics": ["topic1", "topic2"],
  "entities": {
    "people": ["Full Name - Role/Position"],
    "places": ["Place Name"],
    "organizations": ["Partner/Funder Org Name"],
    "programs": ["Program/Service Name"]
  },
  "statistics": [{"metric": "What was measured", "value": "The number/amount", "context": "Why it matters"}],
  "achievements": [{"title": "Achievement title", "description": "What was achieved and why it matters"}],
  "financials": {
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
    "funding_sources": [{"source": "Funder name", "amount": null}]
  },
  "timeline_events": [{"title": "Event title", "description": "What happened", "date": "YYYY-MM-DD or YYYY", "event_type": "milestone|service_launch|award|leadership_change|community|policy_change", "significance": 1-10}]
}

For financial amounts, use raw numbers (no $ or commas). If a value isn't found, use null.
Financial categories: total_income = all revenue/grants/funding. labour_costs = employee/staff wages/salaries. administration_expenses = office/admin costs. property_energy_expenses = rent/utilities/maintenance. motor_vehicle_expenses = fleet/transport. travel_training_expenses = travel/professional development. client_related_costs = direct service delivery costs. current_assets/non_current_assets = from balance sheet. current_liabilities/non_current_liabilities = from balance sheet.
For timeline events, extract 3-8 of the most significant events from this report year.`
    }]
  })

  const textContent = response.content.find(c => c.type === 'text')
  try {
    const jsonMatch = textContent?.text?.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        summary: parsed.summary || '',
        sections: parsed.sections || [],
        keyTopics: parsed.keyTopics || [],
        entities: {
          people: parsed.entities?.people || [],
          places: parsed.entities?.places || [],
          organizations: parsed.entities?.organizations || [],
          programs: parsed.entities?.programs || []
        },
        statistics: parsed.statistics || [],
        achievements: parsed.achievements || [],
        financials: parsed.financials || {},
        timeline_events: parsed.timeline_events || []
      }
    }
  } catch (e) {
    console.error(`  JSON parse error:`, e)
  }

  return {
    summary: '', sections: [], keyTopics: [], entities: { people: [], places: [], organizations: [], programs: [] },
    statistics: [], achievements: [], financials: {}, timeline_events: []
  }
}

// ============================================================================
// EMBEDDING
// ============================================================================

async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const clean = texts.map(t => t.replace(/\s+/g, ' ').trim().substring(0, 8000))
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: clean })
  })
  if (!res.ok) throw new Error(`OpenAI error: ${await res.text()}`)
  const data = await res.json()
  return data.data.map((d: { embedding: number[] }) => d.embedding)
}

async function upsertEmbedding(contentId: string, contentType: string, embedding: number[]) {
  const { error } = await supabase
    .from('content_embeddings')
    .upsert({
      content_id: contentId,
      content_type: contentType,
      embedding,
      updated_at: new Date().toISOString()
    }, { onConflict: 'content_id,content_type' })
  if (error) console.error(`  Embedding upsert error (${contentType}/${contentId}):`, error.message)
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

async function upsertKnowledgeEntry(entry: {
  slug: string; title: string; subtitle?: string; content: string; summary?: string;
  entry_type: string; category?: string; subcategory?: string; fiscal_year?: string;
  keywords?: string[]; structured_data?: Record<string, unknown>;
  importance?: number; is_featured?: boolean; is_public?: boolean;
}): Promise<string | null> {
  // Check if exists
  const { data: existing } = await supabase
    .from('knowledge_entries')
    .select('id')
    .eq('slug', entry.slug)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('knowledge_entries')
      .update({
        title: entry.title,
        subtitle: entry.subtitle,
        content: entry.content,
        summary: entry.summary,
        entry_type: entry.entry_type,
        category: entry.category,
        subcategory: entry.subcategory,
        fiscal_year: entry.fiscal_year,
        keywords: entry.keywords,
        structured_data: entry.structured_data,
        importance: entry.importance ?? 5,
        is_featured: entry.is_featured ?? false,
        is_public: entry.is_public ?? true,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
    if (error) { console.error(`  Update error for ${entry.slug}:`, error.message); return null }
    return existing.id
  } else {
    const { data, error } = await supabase
      .from('knowledge_entries')
      .insert({
        slug: entry.slug,
        title: entry.title,
        subtitle: entry.subtitle,
        content: entry.content,
        summary: entry.summary,
        entry_type: entry.entry_type,
        category: entry.category,
        subcategory: entry.subcategory,
        fiscal_year: entry.fiscal_year,
        keywords: entry.keywords,
        structured_data: entry.structured_data,
        importance: entry.importance ?? 5,
        is_featured: entry.is_featured ?? false,
        is_public: entry.is_public ?? true,
        is_verified: false
      })
      .select('id')
      .single()
    if (error) { console.error(`  Insert error for ${entry.slug}:`, error.message); return null }
    return data?.id || null
  }
}

async function upsertTimelineEvent(event: {
  title: string; description?: string; event_date?: string; event_date_end?: string;
  event_type?: string; significance?: number; is_featured?: boolean;
  related_entry_id?: string; source_fiscal_year?: string;
}) {
  // Check for existing by title + approximate date
  const { data: existing } = await supabase
    .from('timeline_events')
    .select('id')
    .eq('title', event.title)
    .limit(1)
    .single()

  if (existing) {
    await supabase.from('timeline_events').update({
      description: event.description,
      event_date: event.event_date,
      event_type: event.event_type,
      significance: event.significance,
      is_featured: event.is_featured ?? false,
      related_entry_id: event.related_entry_id,
      updated_at: new Date().toISOString()
    }).eq('id', existing.id)
  } else {
    await supabase.from('timeline_events').insert({
      title: event.title,
      description: event.description,
      event_date: event.event_date,
      event_date_end: event.event_date_end,
      date_precision: event.event_date?.length === 4 ? 'year' : 'exact',
      event_type: event.event_type || 'milestone',
      location_name: 'Palm Island',
      location_type: 'palm_island',
      significance: event.significance ?? 5,
      is_featured: (event.significance ?? 5) >= 7,
      related_entry_id: event.related_entry_id
    })
  }
}

async function upsertFinancials(fiscalYear: string, financials: ReportAnalysis['financials']) {
  const hasAnyData = financials.total_income || financials.labour_costs ||
    financials.current_assets || financials.non_current_assets
  if (!hasAnyData) {
    console.log(`  No financial data extracted for ${fiscalYear}`)
    return
  }

  // fiscal_year in DB uses just the start year (e.g. "2024" for FY2023-24)
  const dbFiscalYear = '20' + fiscalYear.split('-')[1]

  // Check existing
  const { data: existing } = await supabase
    .from('annual_financials')
    .select('*')
    .eq('fiscal_year', dbFiscalYear)
    .single()

  // Build record with only non-null extracted values
  const record: Record<string, unknown> = { fiscal_year: dbFiscalYear }
  if (financials.total_income) record.total_income = financials.total_income
  if (financials.labour_costs) record.labour_costs = financials.labour_costs
  if (financials.administration_expenses) record.administration_expenses = financials.administration_expenses
  if (financials.property_energy_expenses) record.property_energy_expenses = financials.property_energy_expenses
  if (financials.motor_vehicle_expenses) record.motor_vehicle_expenses = financials.motor_vehicle_expenses
  if (financials.travel_training_expenses) record.travel_training_expenses = financials.travel_training_expenses
  if (financials.client_related_costs) record.client_related_costs = financials.client_related_costs
  if (financials.current_assets) record.current_assets = financials.current_assets
  if (financials.non_current_assets) record.non_current_assets = financials.non_current_assets
  if (financials.current_liabilities) record.current_liabilities = financials.current_liabilities
  if (financials.non_current_liabilities) record.non_current_liabilities = financials.non_current_liabilities
  if (financials.audited != null) record.audited = financials.audited
  if (financials.auditor_name) record.auditor_name = financials.auditor_name

  if (existing) {
    // Only fill in fields that are currently null/0 in existing record
    const updates: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(record)) {
      if (key === 'fiscal_year') continue
      if (val != null && (!existing[key] || existing[key] === 0)) {
        updates[key] = val
      }
    }
    if (Object.keys(updates).length === 0) {
      console.log(`  Financial record for FY${dbFiscalYear} already complete`)
      return
    }
    const { error } = await supabase
      .from('annual_financials')
      .update(updates)
      .eq('id', existing.id)
    if (error) console.error(`  Financial update error for ${fiscalYear}:`, error.message)
    else console.log(`  Updated ${Object.keys(updates).length} financial fields for FY${dbFiscalYear}`)
  } else {
    const { error } = await supabase
      .from('annual_financials')
      .insert(record)
    if (error) console.error(`  Financial insert error for ${fiscalYear}:`, error.message)
    else console.log(`  Created financial record for FY${dbFiscalYear}`)
  }
}

// ============================================================================
// MAIN PROCESSING
// ============================================================================

interface YearResult {
  fiscalYear: string
  textLength: number
  knowledgeEntriesCreated: number
  timelineEventsCreated: number
  embeddingsCreated: number
  financialsUpserted: boolean
  errors: string[]
}

async function processYear(fiscalYear: string): Promise<YearResult> {
  const result: YearResult = {
    fiscalYear,
    textLength: 0,
    knowledgeEntriesCreated: 0,
    timelineEventsCreated: 0,
    embeddingsCreated: 0,
    financialsUpserted: false,
    errors: []
  }

  const yearInfo = FISCAL_YEAR_INFO[fiscalYear]

  try {
    console.log(`\n${'='.repeat(70)}`)
    console.log(`  PROCESSING: FY${fiscalYear} — ${yearInfo.theme}`)
    console.log(`${'='.repeat(70)}`)

    // ── Step 1: Extract text ──────────────────────────────────────────
    console.log('\n  [1/6] Extracting text from PDF...')
    const rawText = await extractTextFromPDF(fiscalYear)
    if (!rawText || rawText.length < 200) {
      result.errors.push('Insufficient text extracted from PDF')
      console.error(`  SKIP: Only ${rawText.length} chars extracted`)
      return result
    }

    const text = cleanText(rawText)
    result.textLength = text.length
    console.log(`  OK: ${(text.length / 1000).toFixed(1)}K chars cleaned`)

    if (DRY_RUN) {
      console.log(`  [DRY RUN] Would process ${fiscalYear} (${(text.length / 1000).toFixed(1)}K chars)`)
      return result
    }

    // ── Step 2: Claude deep analysis ──────────────────────────────────
    console.log('\n  [2/6] Claude deep analysis...')
    const analysis = await analyzeReport(text, fiscalYear)
    await delay(DELAY_MS)

    console.log(`  OK: ${analysis.sections.length} sections, ${analysis.statistics.length} stats, ${analysis.achievements.length} achievements`)
    console.log(`      ${analysis.entities.people.length} people, ${analysis.entities.programs.length} programs`)
    console.log(`      ${analysis.timeline_events.length} timeline events`)

    // ── Step 3: Create knowledge entries ──────────────────────────────
    console.log('\n  [3/6] Creating knowledge entries...')

    // 3a. Parent document entry
    const parentSlug = `picc-annual-report-${fiscalYear}`
    const parentId = await upsertKnowledgeEntry({
      slug: parentSlug,
      title: `PICC Annual Report ${fiscalYear}`,
      subtitle: yearInfo.theme,
      content: text.substring(0, 50000), // Store first 50K chars
      summary: analysis.summary,
      entry_type: 'document',
      category: 'Annual Reports',
      subcategory: yearInfo.era,
      fiscal_year: fiscalYear,
      keywords: [...yearInfo.keywords, ...analysis.keyTopics.slice(0, 10)],
      structured_data: {
        era: yearInfo.era,
        theme: yearInfo.theme,
        sections: analysis.sections,
        entities: analysis.entities,
        statistics_count: analysis.statistics.length,
        full_text_length: text.length,
        extracted_at: new Date().toISOString()
      },
      importance: 8,
      is_featured: true,
      is_public: true
    })

    if (parentId) {
      result.knowledgeEntriesCreated++
      console.log(`  Created parent entry: ${parentSlug}`)
    }

    // 3b. Statistics entries
    for (const stat of analysis.statistics.slice(0, 15)) {
      const statSlug = slugify(`picc-stat-${fiscalYear}-${stat.metric}`.substring(0, 80))
      const statId = await upsertKnowledgeEntry({
        slug: statSlug,
        title: `${stat.metric} (FY${fiscalYear})`,
        content: `${stat.metric}: ${stat.value}. ${stat.context}`,
        summary: `${stat.value} — ${stat.context}`,
        entry_type: 'statistic',
        category: 'Statistics',
        fiscal_year: fiscalYear,
        keywords: [stat.metric.toLowerCase(), fiscalYear, yearInfo.era],
        structured_data: { metric: stat.metric, value: stat.value, context: stat.context, parent_report: parentSlug },
        importance: 5,
        is_public: true
      })
      if (statId) result.knowledgeEntriesCreated++
    }

    // 3c. Achievement entries
    for (const ach of analysis.achievements.slice(0, 10)) {
      const achSlug = slugify(`picc-achievement-${fiscalYear}-${ach.title}`.substring(0, 80))
      const achId = await upsertKnowledgeEntry({
        slug: achSlug,
        title: ach.title,
        content: ach.description,
        entry_type: 'event',
        category: 'Achievements',
        fiscal_year: fiscalYear,
        keywords: ['achievement', fiscalYear, yearInfo.era],
        structured_data: { parent_report: parentSlug, era: yearInfo.era },
        importance: 6,
        is_public: true
      })
      if (achId) result.knowledgeEntriesCreated++
    }

    // 3d. Program/service entries
    for (const program of analysis.entities.programs.slice(0, 10)) {
      const progSlug = slugify(`picc-program-${fiscalYear}-${program}`.substring(0, 80))
      const progId = await upsertKnowledgeEntry({
        slug: progSlug,
        title: `${program} (FY${fiscalYear})`,
        content: `Program/service mentioned in PICC Annual Report ${fiscalYear}: ${program}`,
        entry_type: 'program',
        category: 'Programs & Services',
        fiscal_year: fiscalYear,
        keywords: [program.toLowerCase(), 'program', 'service', fiscalYear],
        structured_data: { parent_report: parentSlug, program_name: program },
        importance: 4,
        is_public: true
      })
      if (progId) result.knowledgeEntriesCreated++
    }

    console.log(`  OK: ${result.knowledgeEntriesCreated} knowledge entries`)

    // ── Step 4: Financial data ────────────────────────────────────────
    console.log('\n  [4/6] Upserting financial data...')
    await upsertFinancials(fiscalYear, analysis.financials)
    result.financialsUpserted = true

    // ── Step 5: Timeline events ───────────────────────────────────────
    console.log('\n  [5/6] Creating timeline events...')
    for (const event of analysis.timeline_events) {
      // Default date to start of fiscal year if not specified
      const eventDate = event.date || `20${fiscalYear.split('-')[0].slice(-2)}-07-01`
      await upsertTimelineEvent({
        title: event.title,
        description: event.description,
        event_date: eventDate,
        event_type: event.event_type || 'milestone',
        significance: event.significance || 5,
        related_entry_id: parentId || undefined,
        source_fiscal_year: fiscalYear
      })
      result.timelineEventsCreated++
    }
    console.log(`  OK: ${result.timelineEventsCreated} timeline events`)

    // ── Step 6: Chunk and embed ───────────────────────────────────────
    console.log('\n  [6/6] Chunking and embedding...')

    // 6a. Embed the summary
    if (analysis.summary) {
      const summaryText = `PICC Annual Report ${fiscalYear} Summary: ${analysis.summary}`
      const [summaryEmb] = await generateEmbeddings([summaryText])
      await upsertEmbedding(`report-${fiscalYear}-summary`, 'knowledge', summaryEmb)
      result.embeddingsCreated++
    }

    // 6b. Embed text chunks
    const chunks = splitIntoChunks(text, 1000, 150)
    console.log(`  Embedding ${chunks.length} chunks...`)

    const BATCH_SIZE = 15
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE)
      const prefixed = batch.map((c, idx) =>
        `PICC Annual Report ${fiscalYear} (${yearInfo.theme}): ${c}`
      )
      try {
        const embeddings = await generateEmbeddings(prefixed)
        for (let j = 0; j < embeddings.length; j++) {
          await upsertEmbedding(
            `report-${fiscalYear}-chunk-${i + j}`,
            'knowledge',
            embeddings[j]
          )
          result.embeddingsCreated++
        }
        process.stdout.write(`    ${Math.min(i + BATCH_SIZE, chunks.length)}/${chunks.length} chunks\r`)
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        console.error(`\n  Embedding batch error at ${i}: ${msg}`)
        result.errors.push(`Embedding error at chunk ${i}: ${msg}`)
      }
      await delay(300) // rate limit for OpenAI
    }

    // 6c. Embed statistics as individual items
    for (const stat of analysis.statistics.slice(0, 15)) {
      const statText = `PICC ${fiscalYear} statistic: ${stat.metric} = ${stat.value}. ${stat.context}`
      try {
        const [emb] = await generateEmbeddings([statText])
        await upsertEmbedding(
          `report-${fiscalYear}-stat-${slugify(stat.metric).substring(0, 40)}`,
          'knowledge',
          emb
        )
        result.embeddingsCreated++
      } catch { /* skip individual stat embedding failures */ }
    }

    // 6d. Embed achievements
    for (const ach of analysis.achievements.slice(0, 10)) {
      const achText = `PICC ${fiscalYear} achievement: ${ach.title}. ${ach.description}`
      try {
        const [emb] = await generateEmbeddings([achText])
        await upsertEmbedding(
          `report-${fiscalYear}-ach-${slugify(ach.title).substring(0, 40)}`,
          'knowledge',
          emb
        )
        result.embeddingsCreated++
      } catch { /* skip */ }
    }

    console.log(`\n  OK: ${result.embeddingsCreated} embeddings`)

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    result.errors.push(msg)
    console.error(`\n  FATAL ERROR for ${fiscalYear}: ${msg}`)
  }

  return result
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════╗')
  console.log('║   PICC DEEP KNOWLEDGE INGESTION — 17 Years of Annual Reports   ║')
  console.log('╚══════════════════════════════════════════════════════════════════╝')
  console.log()

  if (DRY_RUN) console.log('  MODE: DRY RUN (no database writes)\n')
  if (SINGLE_YEAR) console.log(`  MODE: Single year — ${SINGLE_YEAR}\n`)

  const yearsToProcess = SINGLE_YEAR
    ? FISCAL_YEARS.filter(y => y === SINGLE_YEAR)
    : FISCAL_YEARS

  if (yearsToProcess.length === 0) {
    console.error(`Year ${SINGLE_YEAR} not found. Valid years: ${FISCAL_YEARS.join(', ')}`)
    process.exit(1)
  }

  // Pre-flight: check PDF availability
  console.log('Pre-flight checks:')
  let missingPdfs = 0
  for (const fy of yearsToProcess) {
    const pdfPath = resolve(process.cwd(), '..', 'annual-reports', 'source-pdfs', `${fy}.pdf`)
    if (!existsSync(pdfPath)) {
      console.log(`  MISSING: ${fy}.pdf`)
      missingPdfs++
    }
  }
  if (missingPdfs > 0) {
    console.error(`\n${missingPdfs} PDFs missing. Aborting.`)
    process.exit(1)
  }
  console.log(`  All ${yearsToProcess.length} PDFs found`)

  // Check current state
  const { count: keBefore } = await supabase.from('knowledge_entries').select('*', { count: 'exact', head: true })
  const { count: teBefore } = await supabase.from('timeline_events').select('*', { count: 'exact', head: true })
  const { count: ceBefore } = await supabase.from('content_embeddings').select('*', { count: 'exact', head: true })
  const { count: afBefore } = await supabase.from('annual_financials').select('*', { count: 'exact', head: true })
  console.log(`\nCurrent DB state:`)
  console.log(`  Knowledge entries: ${keBefore}`)
  console.log(`  Timeline events:   ${teBefore}`)
  console.log(`  Embeddings:        ${ceBefore}`)
  console.log(`  Financials:        ${afBefore}`)

  // Process each year
  const results: YearResult[] = []
  for (const fy of yearsToProcess) {
    const result = await processYear(fy)
    results.push(result)
  }

  // Final report
  console.log('\n\n' + '═'.repeat(70))
  console.log('  INGESTION COMPLETE — FINAL REPORT')
  console.log('═'.repeat(70))

  const totalText = results.reduce((s, r) => s + r.textLength, 0)
  const totalKE = results.reduce((s, r) => s + r.knowledgeEntriesCreated, 0)
  const totalTE = results.reduce((s, r) => s + r.timelineEventsCreated, 0)
  const totalEmb = results.reduce((s, r) => s + r.embeddingsCreated, 0)
  const totalErrors = results.reduce((s, r) => s + r.errors.length, 0)

  console.log(`\n  Years processed:     ${results.length}`)
  console.log(`  Text extracted:      ${(totalText / 1000).toFixed(0)}K characters`)
  console.log(`  Knowledge entries:   +${totalKE}`)
  console.log(`  Timeline events:     +${totalTE}`)
  console.log(`  Embeddings created:  +${totalEmb}`)
  if (totalErrors > 0) console.log(`  Errors:              ${totalErrors}`)

  // Check final state
  const { count: keAfter } = await supabase.from('knowledge_entries').select('*', { count: 'exact', head: true })
  const { count: teAfter } = await supabase.from('timeline_events').select('*', { count: 'exact', head: true })
  const { count: ceAfter } = await supabase.from('content_embeddings').select('*', { count: 'exact', head: true })
  const { count: afAfter } = await supabase.from('annual_financials').select('*', { count: 'exact', head: true })

  console.log(`\n  DB State Change:`)
  console.log(`    Knowledge entries: ${keBefore} → ${keAfter}`)
  console.log(`    Timeline events:   ${teBefore} → ${teAfter}`)
  console.log(`    Embeddings:        ${ceBefore} → ${ceAfter}`)
  console.log(`    Financials:        ${afBefore} → ${afAfter}`)

  console.log('\n  Per-year breakdown:')
  for (const r of results) {
    const status = r.errors.length === 0 ? '✓' : '!'
    console.log(`    ${status} ${r.fiscalYear}: ${(r.textLength / 1000).toFixed(0)}K chars, ${r.knowledgeEntriesCreated} entries, ${r.embeddingsCreated} embeddings${r.errors.length ? ` (${r.errors.length} errors)` : ''}`)
  }

  if (totalErrors > 0) {
    console.log('\n  Errors:')
    for (const r of results) {
      for (const err of r.errors) {
        console.log(`    ${r.fiscalYear}: ${err}`)
      }
    }
  }

  console.log('\n  Next steps:')
  console.log('    1. Run: npx tsx scripts/build-embeddings.ts')
  console.log('       (re-embeds knowledge entries with the standard pipeline)')
  console.log('    2. Test: "What was PICC\'s income in 2015?"')
  console.log('    3. Test: "How has PICC grown over the years?"')
  console.log()
}

main()
  .then(() => {
    console.log('Done.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
