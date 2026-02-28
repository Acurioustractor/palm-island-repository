/**
 * Process Archive Books
 *
 * Stores references to Internet Archive books related to Palm Island history
 * as historical artifacts. Does not download full text (requires login).
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
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DRY_RUN = process.argv.includes('--dry-run')

// ─── Book Metadata ───────────────────────────────────────────────────────────

interface BookConfig {
  id: string
  title: string
  author: string
  year: number
  archiveUrl: string
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
    chapters: ['reserve', 'act', 'dormitories', 'hull-river', 'strike-1957'],
    description: 'Comprehensive history of Queensland Aboriginal policy — removals, reserves, protection acts, and institutional control.',
  },
  {
    id: 'tall-man',
    title: 'The Tall Man: Death and Life on Palm Island',
    author: 'Chloe Hooper',
    year: 2008,
    archiveUrl: 'https://archive.org/details/tallmandeathlife0000hoop',
    chapters: ['mulrunji'],
    description: 'Investigative account of the death of Mulrunji Doomadgee in Palm Island police custody in 2004.',
  },
]

// ─── Main ────────────────────────────────────────────────────────────────────

async function processBook(book: BookConfig) {
  console.log(`\n📚 Processing: "${book.title}" by ${book.author} (${book.year})`)

  // Check if artifact already exists for this archive URL
  const { data: existing, error: checkError } = await supabase
    .from('historical_artifacts')
    .select('id')
    .eq('source_url', book.archiveUrl)
    .eq('artifact_type', 'book_reference')
    .single()

  if (checkError && checkError.code !== 'PGRST116') {
    console.log(`  ⚠️  Database error checking for existing artifact: ${checkError.message}`)
    return
  }

  if (existing) {
    console.log(`  ⏭️  Artifact already exists (ID: ${existing.id})`)
    return
  }

  // Create historical artifact record for this book reference
  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would create book_reference artifact:`)
    console.log(`    Title: ${book.title}`)
    console.log(`    Author: ${book.author}`)
    console.log(`    Year: ${book.year}`)
    console.log(`    URL: ${book.archiveUrl}`)
    console.log(`    Chapters: ${book.chapters.join(', ')}`)
    console.log(`    Description: ${book.description}`)
  } else {
    const { error } = await supabase.from('historical_artifacts').insert({
      title: `${book.title} (${book.year})`,
      artifact_type: 'book_reference',
      source_name: 'Internet Archive',
      source_url: book.archiveUrl,
      content_summary: book.description,
      tags: ['book', book.id, ...book.chapters],
      chapter_ref: book.chapters[0], // Primary chapter
      cultural_sensitivity_level: 'low',
      is_verified: true, // Book metadata is verified
      provenance_notes: `${book.author}, "${book.title}" (${book.year}). Available via Internet Archive. Full text download requires login.`,
      metadata: {
        book_id: book.id,
        book_title: book.title,
        book_author: book.author,
        book_year: book.year,
        related_chapters: book.chapters,
      },
    })

    if (error) {
      console.log(`  ⚠️  Failed to create artifact: ${error.message}`)
      return
    }

    console.log(`  ✅ Created book_reference artifact`)
  }
}

async function main() {
  console.log('═══════════════════════════════════════')
  console.log(' Book References — Internet Archive')
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
      .eq('artifact_type', 'book_reference')

    console.log(`\n📊 Total book reference artifacts: ${artifactCount}`)
  }

  console.log('\nDone!')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
