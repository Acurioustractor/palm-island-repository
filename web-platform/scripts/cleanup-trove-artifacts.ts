/**
 * Cleanup Trove Artifacts
 *
 * 1. Remove duplicate articles (same source_url, keep first inserted)
 * 2. Remove irrelevant articles (mail contracts, brand registrations, gazette notices)
 *
 * Usage:
 *   npx tsx scripts/cleanup-trove-artifacts.ts --dry-run
 *   npx tsx scripts/cleanup-trove-artifacts.ts
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

// Titles/patterns that indicate irrelevant articles
const IRRELEVANT_PATTERNS = [
  /^conveyance of mails/i,
  /^registration of brands/i,
  /^government gazette/i,
  /^contracts? for the public service/i,
  /^new south wales\. conveyance/i,
  /^first quarterly list/i,
  /^third list of cattle/i,
  /^second list of cattle/i,
  /^tenders? and contracts/i,
  /^postal directory/i,
  /^mail contracts/i,
  /^shipping/i,
  /^marine board/i,
  /^customs notifications/i,
]

function isIrrelevant(title: string, summary: string | null): boolean {
  const t = title || ''

  // Check title against known irrelevant patterns
  if (IRRELEVANT_PATTERNS.some(p => p.test(t))) return true

  // No content and generic government title
  if (!summary && /gazette|tender|contract|mail|brand|shipping/i.test(t)) return true

  return false
}

function isPalmIslandRelevant(title: string, summary: string | null): boolean {
  const text = `${title} ${summary || ''}`.toLowerCase()
  const keywords = [
    'palm island', 'aboriginal', 'protector', 'reserve',
    'hull river', 'settlement', 'dormitor', 'strike',
    'mulrunji', 'doomadgee', 'fantome', 'lazaret',
    'bwgcolman', 'manbarra', 'wulgurukaba', 'bleakley',
    'native', 'mission', 'superintendent',
  ]
  return keywords.some(kw => text.includes(kw))
}

async function main() {
  console.log('═══════════════════════════════════════')
  console.log(' Cleanup Trove Artifacts')
  console.log('═══════════════════════════════════════')
  if (DRY_RUN) console.log('🔍 DRY RUN — no deletes\n')

  // Fetch all newspaper artifacts
  const { data: all, error } = await supabase
    .from('historical_artifacts')
    .select('id, title, source_url, content_summary, chapter_ref, created_at')
    .eq('artifact_type', 'newspaper')
    .order('created_at', { ascending: true })

  if (error || !all) {
    console.error('Failed to fetch:', error?.message)
    return
  }

  console.log(`Total newspaper artifacts: ${all.length}`)

  // 1. Find duplicates (same source_url — keep earliest)
  const byUrl = new Map<string, typeof all>()
  for (const a of all) {
    const url = a.source_url || a.id
    if (!byUrl.has(url)) byUrl.set(url, [])
    byUrl.get(url)!.push(a)
  }

  const dupeIds: string[] = []
  for (const [, group] of byUrl) {
    if (group.length > 1) {
      // Keep the first, mark rest for deletion
      for (let i = 1; i < group.length; i++) {
        dupeIds.push(group[i].id)
      }
    }
  }

  console.log(`Unique URLs: ${byUrl.size}`)
  console.log(`Duplicate entries to remove: ${dupeIds.length}`)

  // 2. Find irrelevant articles
  const irrelevantIds: string[] = []
  for (const a of all) {
    if (dupeIds.includes(a.id)) continue // Already flagged
    if (isIrrelevant(a.title, a.content_summary)) {
      irrelevantIds.push(a.id)
    }
  }

  console.log(`Irrelevant articles to remove: ${irrelevantIds.length}`)

  // 3. Find articles that don't mention Palm Island at all
  const noMentionIds: string[] = []
  for (const a of all) {
    if (dupeIds.includes(a.id) || irrelevantIds.includes(a.id)) continue
    if (!isPalmIslandRelevant(a.title, a.content_summary)) {
      noMentionIds.push(a.id)
    }
  }

  console.log(`No Palm Island mention: ${noMentionIds.length}`)

  const allRemoveIds = [...new Set([...dupeIds, ...irrelevantIds, ...noMentionIds])]
  console.log(`\nTotal to remove: ${allRemoveIds.length}`)
  console.log(`Will keep: ${all.length - allRemoveIds.length}`)

  // Show some examples of what we're removing
  console.log('\n--- Sample removals (duplicates) ---')
  for (const id of dupeIds.slice(0, 3)) {
    const a = all.find(x => x.id === id)
    if (a) console.log(`  "${a.title}" (${a.chapter_ref})`)
  }

  console.log('\n--- Sample removals (irrelevant) ---')
  for (const id of irrelevantIds.slice(0, 5)) {
    const a = all.find(x => x.id === id)
    if (a) console.log(`  "${a.title}"`)
  }

  console.log('\n--- Sample removals (no Palm Island mention) ---')
  for (const id of noMentionIds.slice(0, 5)) {
    const a = all.find(x => x.id === id)
    if (a) console.log(`  "${a.title}" — ${(a.content_summary || '').slice(0, 100)}`)
  }

  // Show what we're keeping
  const keepIds = all.filter(a => !allRemoveIds.includes(a.id))
  console.log('\n--- Sample keeps ---')
  for (const a of keepIds.slice(0, 10)) {
    console.log(`  [${a.chapter_ref}] "${a.title}" — ${(a.content_summary || '').slice(0, 80)}`)
  }

  if (!DRY_RUN && allRemoveIds.length > 0) {
    // Delete in batches of 100
    let deleted = 0
    for (let i = 0; i < allRemoveIds.length; i += 100) {
      const batch = allRemoveIds.slice(i, i + 100)
      const { error: delError } = await supabase
        .from('historical_artifacts')
        .delete()
        .in('id', batch)

      if (delError) {
        console.error(`Delete batch error: ${delError.message}`)
      } else {
        deleted += batch.length
      }
    }
    console.log(`\n✅ Deleted ${deleted} artifacts`)

    // Final count
    const { count } = await supabase
      .from('historical_artifacts')
      .select('*', { count: 'exact', head: true })
    console.log(`📊 Remaining artifacts: ${count}`)
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
