/**
 * Process Archive Books
 *
 * Downloads and processes freely available books from Internet Archive
 * related to Palm Island history. Extracts text, chunks for RAG,
 * and stores references in historical_artifacts.
 *
 * Usage:
 *   npx tsx scripts/process-archive-books.ts
 *   npx tsx scripts/process-archive-books.ts --dry-run
 *
 * Books processed:
 * - Rosalind Kidd, "The Way We Civilise" (1997) — Queensland Aboriginal policy
 * - Chloe Hooper, "The Tall Man" (2008) — Mulrunji Doomadgee death in custody
 */

import { config } from 'dotenv'
import { resolve, join } from 'path'
import { promises as fs } from 'fs'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

const DRY_RUN = process.argv.includes('--dry-run')
const BOOKS_DIR = resolve(__dirname, '../content/books')

// ─── Book Metadata ───────────────────────────────────────────────────────────

interface BookConfig {
  id: string
  title: string
  author: string
  year: number
  archiveUrl: string
  textUrl: string // Direct text download URL from Internet Archive
  chapters: string[] // which history chapters this maps to
  description: string
}

const BOOKS: BookConfig[] = [
  {
    id: 'way-we-civilise',
    title: 'The Way We Civilise',
    author: 'Rosalind Kidd',
    year: 1997,
    archiveUrl: 'https://archive.org/details/wayweciviliseabo0000kidd',
    textUrl: 'https://archive.org/download/wayweciviliseabo0000kidd/wayweciviliseabo0000kidd_djvu.txt',
    chapters: ['reserve', 'act', 'dormitories', 'hull-river', 'strike-1957'],
    description: 'Comprehensive history of Queensland Aboriginal policy — removals, reserves, protection acts, and institutional control.',
  },
  {
    id: 'tall-man',
    title: 'The Tall Man: Death and Life on Palm Island',
    author: 'Chloe Hooper',
    year: 2008,
    archiveUrl: 'https://archive.org/details/tallmandeathlife0000hoop',
    textUrl: 'https://archive.org/download/tallmandeathlife0000hoop/tallmandeathlife0000hoop_djvu.txt',
    chapters: ['mulrunji'],
    description: 'Investigative account of the death of Mulrunji Doomadgee in Palm Island police custody in 2004.',
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Chunk text into segments suitable for storage and RAG
 */
function chunkText(text: string, maxChars = 2000, overlap = 200): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    let end = start + maxChars

    // Try to break at a paragraph boundary
    if (end < text.length) {
      const lastParagraph = text.lastIndexOf('\n\n', end)
      if (lastParagraph > start + maxChars / 2) {
        end = lastParagraph
      }
    }

    chunks.push(text.slice(start, end).trim())
    start = end - overlap
  }

  return chunks.filter(c => c.length > 50)
}

/**
 * Extract Palm Island relevant passages from a chunk
 */
function isPalmIslandRelevant(text: string): boolean {
  const keywords = [
    'palm island', 'hull river', 'bleakley', 'protector',
    'dormitor', 'reserve', 'aboriginal', 'settlement',
    'removal', 'bwgcolman', 'manbarra', 'wulgurukaba',
    'fantome', 'lazaret', 'doomadgee', 'mulrunji',
    'thaiday', 'strike', 'magnificent seven',
  ]
  const lower = text.toLowerCase()
  return keywords.some(kw => lower.includes(kw))
}

/**
 * Use Claude to extract quotes and key passages from a text chunk
 */
async function extractQuotesAndFacts(
  chunk: string,
  bookTitle: string
): Promise<{ quotes: string[]; facts: string[]; summary: string }> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: `From this excerpt of "${bookTitle}", extract:
1. Any notable quotes (direct speech or memorable passages)
2. Key historical facts with dates
3. A one-sentence summary of this passage

Text:
${chunk.slice(0, 3000)}

Return JSON: { "quotes": ["..."], "facts": ["..."], "summary": "..." }
Return ONLY valid JSON.`,
      },
    ],
  })

  const text = response.choices[0]?.message?.content || ''
  try {
    const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return { quotes: [], facts: [], summary: '' }
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function processBook(book: BookConfig) {
  console.log(`\n📚 Processing: "${book.title}" by ${book.author} (${book.year})`)

  // Ensure books directory exists
  await fs.mkdir(BOOKS_DIR, { recursive: true })

  const textPath = join(BOOKS_DIR, `${book.id}.txt`)

  // Download if not cached
  let text: string
  try {
    text = await fs.readFile(textPath, 'utf-8')
    console.log(`  Using cached text (${(text.length / 1024).toFixed(0)}KB)`)
  } catch {
    console.log(`  Downloading from Internet Archive...`)
    try {
      const response = await fetch(book.textUrl)
      if (!response.ok) {
        console.log(`  ⚠️  Download failed (${response.status}) — book may not be freely available as text`)
        console.log(`  Archive URL: ${book.archiveUrl}`)
        return
      }
      text = await response.text()
      if (!DRY_RUN) {
        await fs.writeFile(textPath, text)
      }
      console.log(`  Downloaded ${(text.length / 1024).toFixed(0)}KB`)
    } catch (err) {
      console.log(`  ⚠️  Download failed: ${err instanceof Error ? err.message : err}`)
      return
    }
  }

  // Chunk and filter for Palm Island relevance
  const allChunks = chunkText(text)
  const relevantChunks = allChunks.filter(isPalmIslandRelevant)
  console.log(`  ${allChunks.length} total chunks, ${relevantChunks.length} Palm Island-relevant`)

  if (relevantChunks.length === 0) {
    console.log(`  ⚠️  No Palm Island-relevant content found`)
    return
  }

  // Process relevant chunks
  let storedChunks = 0
  let storedArtifacts = 0

  for (let i = 0; i < relevantChunks.length; i++) {
    const chunk = relevantChunks[i]

    // Store in content_chunks for RAG
    if (!DRY_RUN) {
      const { error } = await supabase.from('content_chunks').insert({
        content: chunk,
        source_type: 'book',
        source_id: book.id,
        metadata: {
          book_title: book.title,
          book_author: book.author,
          book_year: book.year,
          chunk_index: i,
          total_chunks: relevantChunks.length,
        },
      })
      if (!error) storedChunks++
    }

    // Extract quotes and facts (rate-limited)
    if (i < 20) { // Only process first 20 chunks for quotes
      await sleep(500)
      const extracted = await extractQuotesAndFacts(chunk, book.title)

      if (extracted.quotes.length > 0 || extracted.facts.length > 0) {
        if (!DRY_RUN) {
          // Store as artifact
          const chapterRef = book.chapters[0] // primary chapter
          const { error } = await supabase.from('historical_artifacts').insert({
            title: extracted.summary || `Excerpt from ${book.title}`,
            artifact_type: 'book_excerpt',
            source_name: 'Internet Archive',
            source_url: book.archiveUrl,
            content_text: chunk.slice(0, 5000),
            content_summary: extracted.summary,
            tags: ['book', book.id, ...book.chapters],
            chapter_ref: chapterRef,
            cultural_sensitivity_level: 'low',
            is_verified: false,
            provenance_notes: `${book.author}, "${book.title}" (${book.year}). Downloaded from Internet Archive. Fair dealing for research and study.`,
            metadata: {
              book_id: book.id,
              book_title: book.title,
              book_author: book.author,
              quotes: extracted.quotes,
              facts: extracted.facts,
              chunk_index: i,
            },
          })
          if (!error) storedArtifacts++
        }
      }
    }

    if ((i + 1) % 10 === 0) {
      console.log(`  Processed ${i + 1}/${relevantChunks.length} chunks...`)
    }
  }

  console.log(`  ✅ Stored ${storedChunks} chunks for RAG, ${storedArtifacts} artifacts`)
}

async function main() {
  console.log('═══════════════════════════════════════')
  console.log(' Book Processing — Internet Archive')
  console.log('═══════════════════════════════════════')
  if (DRY_RUN) console.log('🔍 DRY RUN — no writes\n')

  for (const book of BOOKS) {
    await processBook(book)
  }

  // Summary
  if (!DRY_RUN) {
    const { count: artifactCount } = await supabase
      .from('historical_artifacts')
      .select('*', { count: 'exact', head: true })
      .eq('artifact_type', 'book_excerpt')

    const { count: chunkCount } = await supabase
      .from('content_chunks')
      .select('*', { count: 'exact', head: true })
      .eq('source_type', 'book')

    console.log(`\n📊 Total book artifacts: ${artifactCount}`)
    console.log(`📊 Total book chunks for RAG: ${chunkCount}`)
  }

  console.log('\nDone!')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
