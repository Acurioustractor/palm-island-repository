/**
 * Add History Scrape Sources
 *
 * Adds Palm Island history-related websites to the scrape_sources table
 * for harvesting via the existing Firecrawl/Jina scraping pipeline.
 *
 * Usage:
 *   npx tsx scripts/add-history-scrape-sources.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ScrapeSource {
  name: string
  url: string
  source_type: string
  scrape_frequency: string
  description: string
  tags: string[]
  chapter_refs: string[] // which history chapters this maps to
}

const HISTORY_SOURCES: ScrapeSource[] = [
  // ─── Find and Connect (institutional history) ────────────────────────────
  {
    name: 'Find and Connect — Palm Island Aboriginal Settlement',
    url: 'https://www.findandconnect.gov.au/entity/palm-island-aboriginal-settlement/',
    source_type: 'website',
    scrape_frequency: 'monthly',
    description: 'Structured institutional history — dates, legislation, linked records for Palm Island settlement',
    tags: ['history', 'institutional', 'government'],
    chapter_refs: ['reserve', 'act', 'dormitories'],
  },
  {
    name: 'Find and Connect — Hull River Aboriginal Settlement',
    url: 'https://www.findandconnect.gov.au/entity/hull-river-aboriginal-settlement/',
    source_type: 'website',
    scrape_frequency: 'monthly',
    description: 'Hull River settlement records — predecessor to Palm Island',
    tags: ['history', 'hull-river', 'institutional'],
    chapter_refs: ['hull-river'],
  },
  // ─── Queensland Historical Atlas ────────────────────────────────────────
  {
    name: 'Queensland Historical Atlas — Palm Island',
    url: 'https://www.qhatlas.com.au/content/palm-island',
    source_type: 'website',
    scrape_frequency: 'monthly',
    description: 'Contextualised historical essays with maps about Palm Island',
    tags: ['history', 'maps', 'essays'],
    chapter_refs: ['reserve', 'manbarra', 'act'],
  },
  // ─── Queensland State Archives ──────────────────────────────────────────
  {
    name: 'QSA — Palm Island Aboriginal Settlement Agency',
    url: 'https://www.archivessearch.qld.gov.au/agencies/A76',
    source_type: 'website',
    scrape_frequency: 'monthly',
    description: 'Queensland State Archives catalogue for Palm Island agency A76 — removal registers, superintendent reports, correspondence',
    tags: ['history', 'government', 'archives', 'primary-source'],
    chapter_refs: ['reserve', 'dormitories', 'act', 'strike-1957'],
  },
  // ─── State Library of Queensland ────────────────────────────────────────
  {
    name: 'SLQ — Palm Island & Our People Exhibition',
    url: 'https://www.slq.qld.gov.au/discover/exhibitions/palm-island-our-people',
    source_type: 'website',
    scrape_frequency: 'monthly',
    description: 'State Library of Queensland Palm Island exhibition — historical photographs and digital stories',
    tags: ['history', 'photographs', 'exhibition', 'stories'],
    chapter_refs: ['manbarra', 'reserve', 'dormitories', 'strike-1957', 'self-determination'],
  },
  // ─── AustLII Legal Records ──────────────────────────────────────────────
  {
    name: 'AustLII — R v Hurley (2006)',
    url: 'https://www.austlii.edu.au/cgi-bin/viewdoc/au/cases/qld/QCA/2011/120.html',
    source_type: 'website',
    scrape_frequency: 'monthly',
    description: 'Queensland Court of Appeal — R v Hurley, relating to death of Mulrunji Doomadgee',
    tags: ['legal', 'court-record', 'mulrunji'],
    chapter_refs: ['mulrunji'],
  },
  {
    name: 'AustLII — Wotton v Queensland (2012)',
    url: 'https://www.austlii.edu.au/cgi-bin/viewdoc/au/cases/cth/HCA/2012/2.html',
    source_type: 'website',
    scrape_frequency: 'monthly',
    description: 'High Court — Wotton v Queensland, Palm Island riots / civil rights case',
    tags: ['legal', 'court-record', 'mulrunji', 'civil-rights'],
    chapter_refs: ['mulrunji'],
  },
  {
    name: 'AustLII — Palm Island Race Discrimination Case (2016)',
    url: 'https://www.austlii.edu.au/cgi-bin/viewdoc/au/cases/cth/FCA/2016/1457.html',
    source_type: 'website',
    scrape_frequency: 'monthly',
    description: 'Federal Court — Palm Island race discrimination class action settlement',
    tags: ['legal', 'court-record', 'mulrunji', 'class-action'],
    chapter_refs: ['mulrunji'],
  },
  // ─── Bringing Them Home Report ──────────────────────────────────────────
  {
    name: 'Bringing Them Home — Palm Island references',
    url: 'https://humanrights.gov.au/our-work/bringing-them-home-report-1997',
    source_type: 'website',
    scrape_frequency: 'monthly',
    description: 'National Inquiry into the Separation of Aboriginal Children — Palm Island dormitory references',
    tags: ['history', 'stolen-generations', 'dormitories', 'government-report'],
    chapter_refs: ['dormitories', 'act'],
  },
]

async function main() {
  console.log('═══════════════════════════════════════')
  console.log(' Adding History Scrape Sources')
  console.log('═══════════════════════════════════════\n')

  let added = 0
  let skipped = 0

  for (const source of HISTORY_SOURCES) {
    // Check if already exists
    const { data: existing } = await supabase
      .from('scrape_sources')
      .select('id')
      .eq('url', source.url)
      .single()

    if (existing) {
      console.log(`  ⏭️  Already exists: ${source.name}`)
      skipped++
      continue
    }

    const { error } = await supabase.from('scrape_sources').insert({
      name: source.name,
      url: source.url,
      source_type: source.source_type,
      scrape_frequency: source.scrape_frequency,
      is_active: true,
      css_selectors: {
        description: source.description,
        tags: source.tags,
        chapter_refs: source.chapter_refs,
        added_by: 'history-enrichment-pipeline',
      },
    })

    if (error) {
      console.error(`  ❌ Failed: ${source.name} — ${error.message}`)
    } else {
      console.log(`  ✅ Added: ${source.name}`)
      added++
    }
  }

  console.log(`\n═══════════════════════════════════════`)
  console.log(`Added: ${added}`)
  console.log(`Skipped: ${skipped}`)
  console.log(`\nRun the scraper to harvest these sources:`)
  console.log(`  npx tsx scripts/run-scheduled-scrapes.ts`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
