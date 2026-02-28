/**
 * Trove Harvest Script
 *
 * One-shot script to search Trove for Palm Island historical newspaper articles,
 * store results in scraped_content and historical_artifacts tables.
 *
 * Usage:
 *   npx tsx scripts/run-trove-harvest.ts
 *   npx tsx scripts/run-trove-harvest.ts --query "Palm Island strike"
 *   npx tsx scripts/run-trove-harvest.ts --max 50
 *
 * Requires TROVE_API_KEY in .env.local
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import {
  searchNewspapers,
  getArticle,
  searchImages,
  PALM_ISLAND_QUERIES,
  TroveArticle,
} from '../lib/scraper/trove-client'

config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── Config ──────────────────────────────────────────────────────────────────

const MAX_ARTICLES_PER_QUERY = parseInt(process.argv.find(a => a.startsWith('--max'))?.split('=')?.[1] || '100')
const SINGLE_QUERY = process.argv.find(a => a.startsWith('--query='))?.split('=')?.[1]
const RATE_LIMIT_MS = 350 // ~170 req/min to stay under 200/min limit

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function inferChapterRef(article: TroveArticle, queryChapters: readonly string[]): string | null {
  const text = `${article.heading} ${article.snippet}`.toLowerCase()

  // Try to infer from content keywords
  if (text.includes('hull river') || text.includes('cyclone')) return 'hull-river'
  if (text.includes('strike') || text.includes('1957')) return 'strike-1957'
  if (text.includes('dormitor')) return 'dormitories'
  if (text.includes('mulrunji') || text.includes('doomadgee') || text.includes('death in custody')) return 'mulrunji'
  if (text.includes('bleakley') || text.includes('protector')) return 'reserve'
  if (text.includes('fantome') || text.includes('lazaret') || text.includes('leper')) return 'hull-river'
  if (text.includes('self-determination') || text.includes('bwgcolman')) return 'self-determination'
  if (text.includes('community company') || text.includes('picc')) return 'picc'
  if (text.includes('manbarra') || text.includes('wulgurukaba')) return 'manbarra'
  if (text.includes('language') || text.includes('tribal')) return 'languages'

  // Fall back to query's mapped chapters
  return queryChapters[0] || null
}

function inferSensitivity(article: TroveArticle): {
  level: string
  elderApproval: boolean
} {
  const text = `${article.heading} ${article.snippet}`.toLowerCase()

  if (text.includes('death') || text.includes('suicide') || text.includes('violence') || text.includes('abuse')) {
    return { level: 'high', elderApproval: true }
  }
  if (text.includes('stolen') || text.includes('removal') || text.includes('dormitor') || text.includes('punishment')) {
    return { level: 'medium', elderApproval: false }
  }
  return { level: 'low', elderApproval: false }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function harvestNewspapers() {
  const queries = SINGLE_QUERY
    ? [{ query: SINGLE_QUERY, chapters: ['general'] as readonly string[], description: 'Custom query' }]
    : PALM_ISLAND_QUERIES

  let totalStored = 0
  let totalSkipped = 0

  for (const searchConfig of queries) {
    console.log(`\n📰 Searching: "${searchConfig.query}" (${searchConfig.description})`)

    let nextCursor: string | undefined = undefined
    let queryStored = 0

    while (queryStored < MAX_ARTICLES_PER_QUERY) {
      await sleep(RATE_LIMIT_MS)

      let result
      try {
        result = await searchNewspapers({
          query: searchConfig.query,
          startCursor: nextCursor,
          limit: 20,
          sortBy: 'relevance',
        })
      } catch (err) {
        console.log(`  ⚠️  Search failed: ${err instanceof Error ? err.message : err}`)
        console.log(`  Waiting 5s and retrying...`)
        await sleep(5000)
        try {
          result = await searchNewspapers({
            query: searchConfig.query,
            startCursor: nextCursor,
            limit: 20,
            sortBy: 'relevance',
          })
        } catch {
          console.log(`  ❌ Retry failed, skipping to next query`)
          break
        }
      }

      if (result.articles.length === 0) {
        console.log(`  No more results (total found: ${result.total})`)
        break
      }

      console.log(`  Found ${result.total} total, processing batch...`)

      for (const article of result.articles) {
        if (queryStored >= MAX_ARTICLES_PER_QUERY) break

        // Check if already stored
        const { data: existing } = await supabase
          .from('historical_artifacts')
          .select('id')
          .eq('source_url', article.troveUrl)
          .single()

        if (existing) {
          totalSkipped++
          continue
        }

        // Use snippet from search results (full text fetch is unreliable)
        const fullText = article.articleText || article.snippet

        const sensitivity = inferSensitivity(article)
        const chapterRef = inferChapterRef(article, searchConfig.chapters)

        // Store in historical_artifacts
        const { error } = await supabase.from('historical_artifacts').insert({
          title: article.heading,
          artifact_type: 'newspaper',
          source_name: 'Trove',
          source_url: article.troveUrl,
          date_original: article.date || null,
          content_text: fullText || article.snippet,
          content_summary: article.snippet,
          tags: [
            'trove',
            'newspaper',
            article.title, // newspaper name
            ...searchConfig.chapters,
          ].filter(Boolean),
          chapter_ref: chapterRef,
          cultural_sensitivity_level: sensitivity.level,
          elder_approval_required: sensitivity.elderApproval,
          is_verified: false,
          provenance_notes: `Source: ${article.title}, page ${article.page || 'unknown'}. Via Trove (National Library of Australia). Public domain (pre-1955) or fair dealing for research.`,
          metadata: {
            trove_id: article.id,
            newspaper_title: article.title,
            page_number: article.page,
            illustrated: article.illustrated,
            search_query: searchConfig.query,
          },
        })

        if (error) {
          console.error(`  ❌ Failed to store article ${article.id}: ${error.message}`)
        } else {
          queryStored++
          totalStored++
        }
      }

      nextCursor = result.nextStart ?? undefined
      if (!result.nextStart) break
    }

    console.log(`  ✅ Stored ${queryStored} articles for this query`)
  }

  console.log(`\n═══════════════════════════════════════`)
  console.log(`Total stored: ${totalStored}`)
  console.log(`Total skipped (duplicates): ${totalSkipped}`)
}

async function harvestImages() {
  console.log('\n🖼️  Searching Trove for Palm Island images...')

  const imageQueries = [
    '"Palm Island" Aboriginal',
    '"Palm Island" Queensland photograph',
    '"Hull River" settlement',
  ]

  let totalImages = 0

  for (const query of imageQueries) {
    await sleep(RATE_LIMIT_MS)
    const result = await searchImages(query, { limit: 50 })
    console.log(`  "${query}": ${result.total} results`)

    for (const image of result.images) {
      const { data: existing } = await supabase
        .from('historical_artifacts')
        .select('id')
        .eq('source_url', image.troveUrl)
        .single()

      if (existing) continue

      const { error } = await supabase.from('historical_artifacts').insert({
        title: image.title,
        artifact_type: 'photograph',
        source_name: 'Trove',
        source_url: image.troveUrl,
        date_original: image.date || null,
        content_summary: image.description,
        image_url: image.thumbnailUrl,
        tags: ['trove', 'photograph', 'historical'],
        cultural_sensitivity_level: 'low',
        elder_approval_required: false,
        is_verified: false,
        provenance_notes: image.creator ? `Creator: ${image.creator}. Via Trove.` : 'Via Trove (National Library of Australia).',
        metadata: {
          trove_id: image.id,
          creator: image.creator,
        },
      })

      if (!error) totalImages++
    }
  }

  console.log(`  ✅ Stored ${totalImages} images`)
}

async function main() {
  console.log('═══════════════════════════════════════')
  console.log(' Trove Harvest — Palm Island History')
  console.log('═══════════════════════════════════════')

  try {
    await harvestNewspapers()
    await harvestImages()

    // Summary
    const { count } = await supabase
      .from('historical_artifacts')
      .select('*', { count: 'exact', head: true })
      .eq('source_name', 'Trove')

    console.log(`\n📊 Total Trove artifacts in database: ${count}`)
    console.log('Done!')
  } catch (err) {
    console.error('Fatal error:', err)
    process.exit(1)
  }
}

main()
