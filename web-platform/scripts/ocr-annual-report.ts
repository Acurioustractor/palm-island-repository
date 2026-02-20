/**
 * OCR image-based annual report PDFs using Claude Vision
 *
 * Converts PDF pages to images, sends to Claude Vision for text extraction,
 * then runs the standard ingestion pipeline on the extracted text.
 *
 * Run: npx tsx scripts/ocr-annual-report.ts --year 2018-19
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs'
import Anthropic from '@anthropic-ai/sdk'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const openaiKey = process.env.OPENAI_API_KEY!

if (!supabaseUrl || !supabaseKey) { console.error('Missing Supabase credentials'); process.exit(1) }
if (!openaiKey) { console.error('Missing OPENAI_API_KEY'); process.exit(1) }

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})
const anthropic = new Anthropic()

const YEAR = process.argv.find((_, i, a) => a[i - 1] === '--year') || '2018-19'

const FISCAL_YEAR_INFO: Record<string, { theme: string; era: string; keywords: string[] }> = {
  '2018-19': { theme: 'Education & Training', era: 'growth', keywords: ['education', 'training', 'skills'] },
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)) }

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
    .upsert({ content_id: contentId, content_type: contentType, embedding, updated_at: new Date().toISOString() },
      { onConflict: 'content_id,content_type' })
  if (error) console.error(`  Embedding error (${contentType}/${contentId}):`, error.message)
}

/**
 * Convert PDF pages to images using pdf-to-img, then OCR with Claude Vision
 */
async function ocrPdfWithVision(pdfPath: string): Promise<string> {
  console.log('  Converting PDF pages to images...')

  // Use pdf-to-img to render pages
  const { pdf } = await import('pdf-to-img')
  const buffer = readFileSync(pdfPath)
  const pages: Buffer[] = []

  let pageNum = 0
  for await (const image of await pdf(buffer, { scale: 2.0 })) {
    pageNum++
    pages.push(Buffer.from(image))
    console.log(`    Rendered page ${pageNum}`)
  }

  console.log(`  ${pages.length} pages rendered, running Claude Vision OCR...`)

  let fullText = ''

  // Process pages in batches of 3 (Claude can handle multiple images)
  for (let i = 0; i < pages.length; i++) {
    const pageImage = pages[i]
    const base64 = pageImage.toString('base64')

    console.log(`  OCR page ${i + 1}/${pages.length}...`)

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/png',
              data: base64
            }
          },
          {
            type: 'text',
            text: `Extract ALL text from this annual report page image. This is page ${i + 1} of a Palm Island Community Company (PICC) Annual Report.

Instructions:
- Extract every word visible on the page
- Preserve headings, paragraphs, and list structure
- Format tables as markdown tables
- Include all numbers, statistics, and financial figures
- Describe any charts or graphs with their data points
- Note any photos with [Photo: description]
- Preserve names of people, programs, and organizations exactly

Return the extracted text in a clean, readable format.`
          }
        ]
      }]
    })

    const textContent = response.content.find(c => c.type === 'text')
    if (textContent?.text) {
      fullText += `\n--- PAGE ${i + 1} ---\n${textContent.text}\n`
    }

    await delay(1500) // Rate limit
  }

  return fullText
}

async function main() {
  console.log(`OCR Annual Report: FY${YEAR}`)
  console.log('='.repeat(60))

  const pdfPath = resolve(process.cwd(), '..', 'annual-reports', 'source-pdfs', `${YEAR}.pdf`)
  if (!existsSync(pdfPath)) {
    console.error(`PDF not found: ${pdfPath}`)
    process.exit(1)
  }

  const fileSize = readFileSync(pdfPath).length
  console.log(`PDF: ${pdfPath} (${(fileSize / 1_000_000).toFixed(1)}MB)`)

  // Step 1: OCR
  console.log('\n[1/4] OCR extraction with Claude Vision...')
  const ocrText = await ocrPdfWithVision(pdfPath)
  console.log(`  Extracted ${ocrText.length} chars via OCR`)

  // Save OCR text for reference
  const ocrDir = resolve(process.cwd(), '..', 'annual-reports', 'output')
  if (!existsSync(ocrDir)) mkdirSync(ocrDir, { recursive: true })
  writeFileSync(resolve(ocrDir, `${YEAR}-ocr-text.txt`), ocrText)
  console.log(`  Saved to annual-reports/output/${YEAR}-ocr-text.txt`)

  if (ocrText.length < 500) {
    console.error('  OCR produced insufficient text. Aborting.')
    process.exit(1)
  }

  // Step 2: Claude deep analysis
  console.log('\n[2/4] Claude deep analysis...')
  const analysisResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: `You are analyzing a Palm Island Community Company (PICC) annual report for fiscal year ${YEAR} (July-June). Extract comprehensive structured information. Be precise with numbers, names, and dates.`,
    messages: [{
      role: 'user',
      content: `Analyze this OCR-extracted annual report text and return a JSON object.

${ocrText.slice(0, 80000)}

Return ONLY valid JSON with these fields:
{
  "summary": "2-3 paragraph executive summary",
  "sections": [{"title": "Section Name", "description": "Brief description"}],
  "keyTopics": ["topic1", "topic2"],
  "entities": {
    "people": ["Full Name - Role/Position"],
    "places": ["Place Name"],
    "organizations": ["Partner/Funder Org Name"],
    "programs": ["Program/Service Name"]
  },
  "statistics": [{"metric": "What was measured", "value": "The number/amount", "context": "Why it matters"}],
  "achievements": [{"title": "Achievement title", "description": "What was achieved"}],
  "financials": {
    "total_income": null,
    "labour_costs": null,
    "administration_expenses": null,
    "current_assets": null,
    "non_current_assets": null,
    "current_liabilities": null,
    "non_current_liabilities": null,
    "audited": false,
    "auditor_name": null
  },
  "timeline_events": [{"title": "Event", "description": "What happened", "event_type": "milestone|service_launch|award|community", "significance": 1-10}]
}

Use raw integers for financial amounts (no $ or commas). Use null if not found.`
    }]
  })

  let analysis: Record<string, unknown> = {}
  const textContent = analysisResponse.content.find(c => c.type === 'text')
  try {
    const jsonMatch = textContent?.text?.match(/\{[\s\S]*\}/)
    if (jsonMatch) analysis = JSON.parse(jsonMatch[0])
  } catch (e) {
    console.error('  JSON parse error:', e)
  }

  const summary = (analysis.summary as string) || ''
  const statistics = (analysis.statistics as { metric: string; value: string; context: string }[]) || []
  const achievements = (analysis.achievements as { title: string; description: string }[]) || []
  const entities = (analysis.entities as { people: string[]; programs: string[] }) || { people: [], programs: [] }
  const timeline = (analysis.timeline_events as { title: string; description: string; event_type?: string; significance?: number }[]) || []

  console.log(`  ${statistics.length} stats, ${achievements.length} achievements, ${entities.programs?.length || 0} programs, ${timeline.length} events`)

  // Step 3: Create knowledge entries
  console.log('\n[3/4] Creating knowledge entries...')
  const yearInfo = FISCAL_YEAR_INFO[YEAR] || { theme: 'Annual Report', era: 'growth', keywords: [] }
  let entriesCreated = 0

  // Parent entry
  const parentSlug = `picc-annual-report-${YEAR}`
  const { data: existingParent } = await supabase.from('knowledge_entries').select('id').eq('slug', parentSlug).single()

  const parentData = {
    slug: parentSlug,
    title: `PICC Annual Report ${YEAR}`,
    subtitle: yearInfo.theme,
    content: ocrText.substring(0, 50000),
    summary,
    entry_type: 'document',
    category: 'Annual Reports',
    subcategory: yearInfo.era,
    fiscal_year: YEAR,
    keywords: [...yearInfo.keywords, ...(analysis.keyTopics as string[] || []).slice(0, 10)],
    structured_data: {
      era: yearInfo.era,
      theme: yearInfo.theme,
      ocr_extracted: true,
      sections: analysis.sections,
      entities: analysis.entities,
      extracted_at: new Date().toISOString()
    },
    importance: 8,
    is_featured: true,
    is_public: true
  }

  let parentId: string | null = null
  if (existingParent) {
    await supabase.from('knowledge_entries').update({ ...parentData, updated_at: new Date().toISOString() }).eq('id', existingParent.id)
    parentId = existingParent.id
  } else {
    const { data } = await supabase.from('knowledge_entries').insert({ ...parentData, is_verified: false }).select('id').single()
    parentId = data?.id || null
  }
  if (parentId) entriesCreated++

  // Child entries (stats, achievements, programs)
  for (const stat of statistics.slice(0, 15)) {
    const slug = slugify(`picc-stat-${YEAR}-${stat.metric}`.substring(0, 80))
    const { error } = await supabase.from('knowledge_entries').upsert({
      slug, title: `${stat.metric} (FY${YEAR})`, content: `${stat.metric}: ${stat.value}. ${stat.context}`,
      summary: `${stat.value} — ${stat.context}`, entry_type: 'statistic', category: 'Statistics',
      fiscal_year: YEAR, keywords: [stat.metric.toLowerCase(), YEAR], importance: 5, is_public: true, is_verified: false,
      structured_data: { metric: stat.metric, value: stat.value, context: stat.context, parent_report: parentSlug }
    }, { onConflict: 'slug' })
    if (!error) entriesCreated++
  }

  for (const ach of achievements.slice(0, 10)) {
    const slug = slugify(`picc-achievement-${YEAR}-${ach.title}`.substring(0, 80))
    const { error } = await supabase.from('knowledge_entries').upsert({
      slug, title: ach.title, content: ach.description, entry_type: 'event', category: 'Achievements',
      fiscal_year: YEAR, keywords: ['achievement', YEAR], importance: 6, is_public: true, is_verified: false,
      structured_data: { parent_report: parentSlug, era: yearInfo.era }
    }, { onConflict: 'slug' })
    if (!error) entriesCreated++
  }

  console.log(`  Created ${entriesCreated} knowledge entries`)

  // Timeline events
  for (const event of timeline) {
    const { data: ex } = await supabase.from('timeline_events').select('id').eq('title', event.title).single()
    if (!ex) {
      await supabase.from('timeline_events').insert({
        title: event.title, description: event.description,
        event_date: `2019-07-01`, date_precision: 'year',
        event_type: event.event_type || 'milestone',
        location_name: 'Palm Island', location_type: 'palm_island',
        significance: event.significance || 5,
        is_featured: (event.significance || 5) >= 7,
        related_entry_id: parentId
      })
    }
  }
  console.log(`  ${timeline.length} timeline events processed`)

  // Financial data
  const fin = analysis.financials as Record<string, unknown> | undefined
  if (fin && (fin.total_income || fin.current_assets)) {
    const dbFy = '2019' // FY2018-19
    const { data: exFin } = await supabase.from('annual_financials').select('id').eq('fiscal_year', dbFy).single()
    const record: Record<string, unknown> = { fiscal_year: dbFy }
    for (const key of ['total_income', 'labour_costs', 'administration_expenses', 'current_assets', 'non_current_assets', 'current_liabilities', 'non_current_liabilities']) {
      if (fin[key]) record[key] = fin[key]
    }
    if (fin.audited) record.audited = fin.audited
    if (fin.auditor_name) record.auditor_name = fin.auditor_name

    if (exFin) {
      await supabase.from('annual_financials').update(record).eq('id', exFin.id)
    } else {
      await supabase.from('annual_financials').insert(record)
    }
    console.log(`  Financial data saved for FY${dbFy}`)
  }

  // Step 4: Chunk and embed
  console.log('\n[4/4] Chunking and embedding...')
  let embeddingsCreated = 0

  // Summary embedding
  if (summary) {
    const [emb] = await generateEmbeddings([`PICC Annual Report ${YEAR} Summary: ${summary}`])
    await upsertEmbedding(`report-${YEAR}-summary`, 'knowledge', emb)
    embeddingsCreated++
  }

  // Text chunks
  const chunks = splitIntoChunks(ocrText, 1000, 150)
  console.log(`  Embedding ${chunks.length} chunks...`)

  const BATCH = 15
  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH)
    const prefixed = batch.map(c => `PICC Annual Report ${YEAR} (${yearInfo.theme}): ${c}`)
    try {
      const embeddings = await generateEmbeddings(prefixed)
      for (let j = 0; j < embeddings.length; j++) {
        await upsertEmbedding(`report-${YEAR}-chunk-${i + j}`, 'knowledge', embeddings[j])
        embeddingsCreated++
      }
    } catch (e) {
      console.error(`  Batch error at ${i}:`, e)
    }
    await delay(300)
  }

  console.log(`  ${embeddingsCreated} embeddings created`)

  console.log('\n' + '='.repeat(60))
  console.log(`COMPLETE: FY${YEAR}`)
  console.log(`  Text: ${ocrText.length} chars (OCR)`)
  console.log(`  Knowledge entries: ${entriesCreated}`)
  console.log(`  Embeddings: ${embeddingsCreated}`)
}

main()
  .then(() => { console.log('\nDone.'); process.exit(0) })
  .catch(e => { console.error('Fatal:', e); process.exit(1) })
