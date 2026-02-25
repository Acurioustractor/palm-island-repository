/**
 * Ingest key PICC publications (strategic plans, evaluations, constitution)
 * into the knowledge base with Claude analysis and embeddings.
 *
 * Run: npx tsx scripts/ingest-publications.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { readFileSync, existsSync } from 'fs'
import Anthropic from '@anthropic-ai/sdk'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const openaiKey = process.env.OPENAI_API_KEY!

if (!supabaseUrl || !supabaseKey || !openaiKey) { console.error('Missing credentials'); process.exit(1) }

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { autoRefreshToken: false, persistSession: false } })
const anthropic = new Anthropic()
let pdfjs: typeof import('pdfjs-dist/legacy/build/pdf.mjs')

const PUBLICATIONS = [
  {
    file: 'strategic-plan-2021-26.pdf',
    slug: 'picc-strategic-plan-2021-26',
    title: 'PICC Strategic Plan 2021–2026',
    category: 'Strategic Plans',
    entry_type: 'document' as const,
    importance: 9,
    keywords: ['strategic plan', 'vision', 'goals', '2021-2026', 'direction']
  },
  {
    file: 'strategic-plan-2017-19.pdf',
    slug: 'picc-strategic-plan-2017-19',
    title: 'PICC Strategic Plan 2017–2019',
    category: 'Strategic Plans',
    entry_type: 'document' as const,
    importance: 7,
    keywords: ['strategic plan', 'vision', 'goals', '2017-2019']
  },
  {
    file: 'picc-evaluation-main.pdf',
    slug: 'picc-evaluation-report',
    title: 'PICC Evaluation Report (Full)',
    category: 'Evaluations',
    entry_type: 'research' as const,
    importance: 8,
    keywords: ['evaluation', 'assessment', 'outcomes', 'impact', 'review']
  },
  {
    file: 'picc-evaluation-summary.pdf',
    slug: 'picc-evaluation-summary',
    title: 'PICC Evaluation Highlights',
    category: 'Evaluations',
    entry_type: 'research' as const,
    importance: 7,
    keywords: ['evaluation', 'highlights', 'summary', 'impact']
  },
  {
    file: 'picc-constitution.pdf',
    slug: 'picc-constitution-community-controlled',
    title: 'PICC Constitution (Community-Controlled Company)',
    category: 'Governance',
    entry_type: 'document' as const,
    importance: 9,
    keywords: ['constitution', 'governance', 'community control', 'CATSI', 'rules']
  },
  {
    file: 'community-control-transition.pdf',
    slug: 'picc-community-control-transition',
    title: 'PICC is Becoming Community Controlled',
    category: 'Governance',
    entry_type: 'history' as const,
    importance: 8,
    keywords: ['community control', 'transition', 'self-determination', 'governance']
  }
]

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
      current = current.slice(-Math.floor(overlap / 5))
      currentLen = current.join(' ').length
    }
  }
  if (current.length > 0 && current.join(' ').length > 50) chunks.push(current.join(' '))
  return chunks
}

async function extractText(filePath: string): Promise<string> {
  if (!pdfjs) pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const buffer = readFileSync(filePath)
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer), useSystemFonts: true }).promise
  let text = ''
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map((item: { str?: string }) => item.str || '').join(' ') + '\n'
  }
  return text.replace(/\s+/g, ' ').trim()
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

async function main() {
  console.log('PICC Publications Ingestion')
  console.log('='.repeat(60))

  const basePath = resolve(process.cwd(), '..', 'annual-reports', 'source-pdfs', 'publications')
  let totalEntries = 0
  let totalEmbeddings = 0

  for (const pub of PUBLICATIONS) {
    const filePath = resolve(basePath, pub.file)
    if (!existsSync(filePath)) {
      console.log(`\nSKIP: ${pub.file} not found`)
      continue
    }

    const fileSize = readFileSync(filePath).length
    if (fileSize < 1000) {
      console.log(`\nSKIP: ${pub.file} too small (${fileSize} bytes)`)
      continue
    }

    console.log(`\n${'─'.repeat(60)}`)
    console.log(`Processing: ${pub.title} (${(fileSize / 1_000_000).toFixed(1)}MB)`)

    // Extract text
    console.log('  Extracting text...')
    const text = await extractText(filePath)
    console.log(`  ${text.length} chars extracted`)

    if (text.length < 200) {
      console.log('  Insufficient text, trying OCR...')
      // OCR would go here - skip for now
      continue
    }

    // Claude analysis
    console.log('  Analyzing with Claude...')
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: 'You are analyzing a document from the Palm Island Community Company (PICC), an Aboriginal community organisation on Palm Island, QLD, Australia.',
      messages: [{
        role: 'user',
        content: `Analyze this document and return JSON with:
{
  "summary": "2-3 paragraph summary of the document's key content and significance",
  "keyTopics": ["topic1", "topic2"],
  "keyPoints": ["Important point 1", "Important point 2"],
  "people": ["Name - Role"],
  "dates": ["YYYY - what happened"],
  "timeline_events": [{"title": "Event", "description": "Details", "date": "YYYY-MM-DD", "event_type": "milestone|policy_change|founding", "significance": 1-10}]
}

Document: ${pub.title}
Content:
${text.slice(0, 60000)}

Return ONLY valid JSON.`
      }]
    })

    let analysis: Record<string, unknown> = {}
    const textContent = response.content.find(c => c.type === 'text')
    try {
      const jsonMatch = textContent?.text?.match(/\{[\s\S]*\}/)
      if (jsonMatch) analysis = JSON.parse(jsonMatch[0])
    } catch { /* skip */ }

    const summary = (analysis.summary as string) || ''
    const keyTopics = (analysis.keyTopics as string[]) || []
    const keyPoints = (analysis.keyPoints as string[]) || []
    const timeline = (analysis.timeline_events as { title: string; description: string; date?: string; event_type?: string; significance?: number }[]) || []

    console.log(`  ${keyTopics.length} topics, ${keyPoints.length} points, ${timeline.length} events`)

    // Upsert knowledge entry
    const { data: existing } = await supabase.from('knowledge_entries').select('id').eq('slug', pub.slug).single()
    const entryData = {
      slug: pub.slug,
      title: pub.title,
      content: text.substring(0, 50000),
      summary,
      entry_type: pub.entry_type,
      category: pub.category,
      keywords: [...pub.keywords, ...keyTopics.slice(0, 5)],
      structured_data: {
        key_points: keyPoints,
        source_file: pub.file,
        extracted_at: new Date().toISOString()
      },
      importance: pub.importance,
      is_featured: true,
      is_public: true
    }

    let entryId: string | null = null
    if (existing) {
      await supabase.from('knowledge_entries').update({ ...entryData, updated_at: new Date().toISOString() }).eq('id', existing.id)
      entryId = existing.id
    } else {
      const { data } = await supabase.from('knowledge_entries').insert({ ...entryData, is_verified: false }).select('id').single()
      entryId = data?.id || null
    }
    if (entryId) totalEntries++

    // Key points as separate entries
    for (const point of keyPoints.slice(0, 5)) {
      const pointSlug = slugify(`picc-${pub.slug}-point-${point}`.substring(0, 80))
      await supabase.from('knowledge_entries').upsert({
        slug: pointSlug,
        title: point.length > 80 ? point.substring(0, 77) + '...' : point,
        content: point,
        entry_type: 'fact',
        category: pub.category,
        keywords: pub.keywords,
        structured_data: { parent_doc: pub.slug },
        importance: pub.importance - 2,
        is_public: true,
        is_verified: false
      }, { onConflict: 'slug' })
      totalEntries++
    }

    // Timeline events
    for (const event of timeline) {
      const { data: ex } = await supabase.from('timeline_events').select('id').eq('title', event.title).single()
      if (!ex) {
        await supabase.from('timeline_events').insert({
          title: event.title,
          description: event.description,
          event_date: event.date,
          date_precision: event.date?.length === 4 ? 'year' : 'exact',
          event_type: event.event_type || 'milestone',
          location_name: 'Palm Island',
          location_type: 'palm_island',
          significance: event.significance || 5,
          is_featured: (event.significance || 5) >= 7,
          related_entry_id: entryId
        })
      }
    }

    // Embed
    console.log('  Embedding...')
    const chunks = splitIntoChunks(text, 1000, 150)
    const BATCH = 15
    for (let i = 0; i < chunks.length; i += BATCH) {
      const batch = chunks.slice(i, i + BATCH)
      const prefixed = batch.map(c => `PICC ${pub.title}: ${c}`)
      try {
        const embeddings = await generateEmbeddings(prefixed)
        for (let j = 0; j < embeddings.length; j++) {
          await supabase.from('content_embeddings').upsert({
            content_id: `pub-${pub.slug}-chunk-${i + j}`,
            content_type: 'knowledge',
            embedding: embeddings[j],
            updated_at: new Date().toISOString()
          }, { onConflict: 'content_id,content_type' })
          totalEmbeddings++
        }
      } catch (e) {
        console.error(`  Batch error:`, e)
      }
      await delay(300)
    }

    // Summary embedding
    if (summary) {
      const [emb] = await generateEmbeddings([`PICC ${pub.title}: ${summary}`])
      await supabase.from('content_embeddings').upsert({
        content_id: `pub-${pub.slug}-summary`,
        content_type: 'knowledge',
        embedding: emb,
        updated_at: new Date().toISOString()
      }, { onConflict: 'content_id,content_type' })
      totalEmbeddings++
    }

    console.log(`  Done: ${chunks.length + 1} embeddings`)
    await delay(1500)
  }

  console.log('\n' + '='.repeat(60))
  console.log(`COMPLETE: ${totalEntries} entries, ${totalEmbeddings} embeddings`)
}

main()
  .then(() => { console.log('\nDone.'); process.exit(0) })
  .catch(e => { console.error('Fatal:', e); process.exit(1) })
