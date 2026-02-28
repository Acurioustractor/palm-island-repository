/**
 * Scrape History Sources with Firecrawl
 *
 * Scrapes all registered history sources and stores content
 * in both scraped_content (for RAG) and historical_artifacts.
 *
 * Usage:
 *   npx dotenvx run -- npx tsx scripts/scrape-history-sources.ts
 *   npx dotenvx run -- npx tsx scripts/scrape-history-sources.ts --dry-run
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(__dirname, '../.env.local') })

// Dynamic import for Firecrawl (ESM/CJS compat)
async function getFirecrawl() {
  const FC = await import('@mendable/firecrawl-js')
  const Client = (FC as any).default || FC
  const client = new Client({ apiKey: process.env.FIRECRAWL_API_KEY! })
  return (client as any).v1 || client
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DRY_RUN = process.argv.includes('--dry-run')

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Chapter inference from content
function inferChapter(text: string, tags: string[]): string | null {
  const lower = text.toLowerCase()
  const tagStr = tags.join(' ').toLowerCase()
  const combined = lower + ' ' + tagStr

  const chapters: [string, string[]][] = [
    ['mulrunji', ['mulrunji', 'doomadgee', 'hurley', 'death in custody', 'wotton', 'riot']],
    ['hull-river', ['hull river', 'cyclone 1918', 'tully', 'djiru']],
    ['dormitories', ['dormitory', 'dormitories', 'stolen generation', 'superintendent', 'curfew']],
    ['strike-1957', ['strike', '1957', 'magnificent seven', 'thaiday']],
    ['manbarra', ['manbarra', 'wulgurukaba', 'canoe people', 'pre-contact']],
    ['reserve', ['reserve', 'gazetted', '1914', 'bleakley', 'protector']],
    ['self-determination', ['self-determination', 'dogit', 'deed of grant', 'community control']],
    ['picc', ['picc', 'community company', 'rachel atkinson', '20-year']],
    ['languages', ['bwgcolman', 'language', 'many tribes', 'removal']],
  ]

  for (const [ref, keywords] of chapters) {
    const matches = keywords.filter(kw => combined.includes(kw)).length
    if (matches >= 2) return ref
  }
  for (const [ref, keywords] of chapters) {
    if (keywords.some(kw => combined.includes(kw))) return ref
  }
  return null
}

function inferSensitivity(chapterRef: string | null): string {
  const high = ['hull-river', 'dormitories', 'mulrunji']
  const medium = ['manbarra', 'languages', 'strike-1957']
  if (chapterRef && high.includes(chapterRef)) return 'high'
  if (chapterRef && medium.includes(chapterRef)) return 'medium'
  return 'low'
}

function inferArtifactType(url: string, tags: string[]): string {
  if (tags.some(t => t.includes('legal') || t.includes('court'))) return 'court_record'
  if (url.includes('austlii')) return 'court_record'
  if (url.includes('archivessearch')) return 'government_record'
  if (url.includes('humanrights')) return 'government_record'
  if (tags.some(t => t.includes('photograph'))) return 'photograph'
  return 'website'
}

async function main() {
  console.log('═══════════════════════════════════════')
  console.log(' Scrape History Sources (Firecrawl)')
  console.log('═══════════════════════════════════════')
  if (DRY_RUN) console.log('🔍 DRY RUN — no writes\n')

  const firecrawl = await getFirecrawl()

  // Get all history sources
  const { data: sources, error: sourcesError } = await supabase
    .from('scrape_sources')
    .select('*')
    .eq('is_active', true)

  if (sourcesError || !sources) {
    console.error('Failed to fetch sources:', sourcesError?.message)
    process.exit(1)
  }

  // Filter to history-related sources
  const historySources = sources.filter(s => {
    const meta = s.css_selectors || {}
    return meta.added_by === 'history-enrichment-pipeline'
  })

  console.log(`\nFound ${historySources.length} history sources to scrape\n`)

  let totalScraped = 0
  let totalArtifacts = 0
  let totalErrors = 0

  for (const source of historySources) {
    const meta = source.css_selectors || {}
    const tags: string[] = meta.tags || []
    const chapterRefs: string[] = meta.chapter_refs || []

    console.log(`\n📄 ${source.name}`)
    console.log(`   ${source.url}`)

    try {
      // Scrape with Firecrawl
      const result = await firecrawl.scrapeUrl(source.url, {
        formats: ['markdown'],
        onlyMainContent: true,
      })

      if (!result || !result.success || !result.markdown) {
        console.log(`   ⚠️  No content retrieved`)
        totalErrors++
        continue
      }

      const content = result.markdown as string
      const title = result.metadata?.title || source.name
      console.log(`   ✅ Scraped ${(content.length / 1024).toFixed(1)}KB`)

      if (DRY_RUN) {
        console.log(`   Preview: ${content.slice(0, 200).replace(/\n/g, ' ')}...`)
        totalScraped++
        continue
      }

      // Store in scraped_content
      const contentHash = Buffer.from(content).toString('base64').slice(0, 64)
      const { data: existing } = await supabase
        .from('scraped_content')
        .select('id')
        .eq('content_hash', contentHash)
        .single()

      if (!existing) {
        const { error: storeError } = await supabase.from('scraped_content').insert({
          source_id: source.id,
          url: source.url,
          title,
          content,
          content_hash: contentHash,
          markdown_content: content,
          metadata: {
            scraped_by: 'scrape-history-sources.ts',
            scraped_at: new Date().toISOString(),
            tags,
          },
        })
        if (storeError) {
          console.log(`   ⚠️  Failed to store scraped content: ${storeError.message}`)
        }
      }

      // Store as historical artifact
      const chapterRef = chapterRefs[0] || inferChapter(content, tags)
      const sensitivity = inferSensitivity(chapterRef)
      const artifactType = inferArtifactType(source.url, tags)

      // Check for existing artifact with same URL
      const { data: existingArtifact } = await supabase
        .from('historical_artifacts')
        .select('id')
        .eq('source_url', source.url)
        .single()

      if (existingArtifact) {
        console.log(`   ⏭️  Artifact already exists`)
      } else {
        const summary = content.slice(0, 500).replace(/\n/g, ' ').trim()
        const { error: artifactError } = await supabase.from('historical_artifacts').insert({
          title,
          artifact_type: artifactType,
          source_name: source.name,
          source_url: source.url,
          content_text: content.slice(0, 50000), // Cap at 50KB
          content_summary: summary,
          tags: [...tags, ...chapterRefs, 'scraped'],
          chapter_ref: chapterRef,
          cultural_sensitivity_level: sensitivity,
          elder_approval_required: sensitivity === 'high',
          is_verified: false,
          provenance_notes: `Scraped from ${source.url} on ${new Date().toISOString()}`,
          metadata: {
            source_id: source.id,
            chapter_refs: chapterRefs,
            scraped_by: 'scrape-history-sources.ts',
            content_length: content.length,
          },
        })

        if (artifactError) {
          console.log(`   ⚠️  Failed to store artifact: ${artifactError.message}`)
        } else {
          console.log(`   📦 Stored as ${artifactType} artifact (${chapterRef || 'unassigned'})`)
          totalArtifacts++
        }
      }

      // Update source last_scraped_at
      await supabase
        .from('scrape_sources')
        .update({ last_scraped_at: new Date().toISOString() })
        .eq('id', source.id)

      totalScraped++
    } catch (err: any) {
      console.log(`   ❌ Error: ${err.message}`)
      totalErrors++
    }

    // Rate limit — 2s between scrapes
    await sleep(2000)
  }

  console.log(`\n═══════════════════════════════════════`)
  console.log(`Scraped: ${totalScraped}`)
  console.log(`Artifacts created: ${totalArtifacts}`)
  console.log(`Errors: ${totalErrors}`)

  // Show total artifact counts
  if (!DRY_RUN) {
    const { count } = await supabase
      .from('historical_artifacts')
      .select('*', { count: 'exact', head: true })
    console.log(`\n📊 Total historical artifacts in DB: ${count}`)
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
