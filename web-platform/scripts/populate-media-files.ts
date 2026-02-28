#!/usr/bin/env npx tsx
/**
 * Populate Supabase `media_files` table with photos from:
 *   1. photo-manifest.json (443 annual report photos with AI descriptions)
 *   2. public/archive-photos/ (60 historical archive photos)
 *
 * Tags each photo for page-based retrieval in the Report Builder UI.
 *
 * Usage:
 *   npx tsx scripts/populate-media-files.ts
 *   npx tsx scripts/populate-media-files.ts --dry-run
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// ── Config ────────────────────────────────────────────

const DRY_RUN = process.argv.includes('--dry-run')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Page tag assignment based on photo description keywords ──

interface PageTagRule {
  tag: string
  keywords: string[]
}

const PAGE_TAG_RULES: PageTagRule[] = [
  { tag: 'annual-report-cover', keywords: ['aerial', 'panorama', 'beach', 'island', 'scenic'] },
  { tag: 'annual-report-messages', keywords: ['leader', 'office', 'ceo', 'chair', 'director', 'desk'] },
  { tag: 'annual-report-numbers', keywords: ['staff', 'group', 'team', 'workers'] },
  { tag: 'annual-report-photos', keywords: ['community', 'celebration', 'event', 'gathering', 'culture'] },
  { tag: 'annual-report-community-voices', keywords: ['women', 'children', 'family', 'elders', 'meeting'] },
  { tag: 'annual-report-youth', keywords: ['youth', 'young', 'kids', 'school', 'children', 'sport'] },
  { tag: 'annual-report-governance', keywords: ['board', 'directors', 'governance', 'formal', 'shirts'] },
  { tag: 'annual-report-services', keywords: ['health', 'clinic', 'medical', 'service', 'care', 'hospital'] },
  { tag: 'annual-report-journey', keywords: ['aerial', 'jetty', 'historical', 'old', 'panorama'] },
  { tag: 'annual-report-resilience', keywords: ['cyclone', 'flood', 'storm', 'damage', 'hull river'] },
]

function getPageTags(description: string): string[] {
  const lower = description.toLowerCase()
  const tags: string[] = []
  for (const rule of PAGE_TAG_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      tags.push(rule.tag)
    }
  }
  return tags
}

// ── Manifest processing ───────────────────────────────

interface ManifestEntry {
  path: string
  year: string
  description: string
}

interface PhotoManifest {
  generated_at: string
  total_processed: number
  hero_images: ManifestEntry[]
}

function processManifestPhotos(manifest: PhotoManifest) {
  const records: Array<{
    file_name: string
    storage_url: string
    caption: string
    tags: string[]
    source: string
    year_range: string
  }> = []

  for (const entry of manifest.hero_images) {
    const fileName = path.basename(entry.path)
    const storageUrl = entry.path // Relative to public/
    const pageTags = getPageTags(entry.description)

    records.push({
      file_name: fileName,
      storage_url: storageUrl,
      caption: entry.description,
      tags: ['annual-report', `annual-report-${entry.year}`, ...pageTags],
      source: 'annual-report-archive',
      year_range: entry.year,
    })
  }

  return records
}

// ── Archive photos processing ─────────────────────────

function processArchivePhotos(archiveDir: string) {
  const records: Array<{
    file_name: string
    storage_url: string
    caption: string
    tags: string[]
    source: string
    year_range: string
  }> = []

  if (!fs.existsSync(archiveDir)) {
    console.warn(`Archive directory not found: ${archiveDir}`)
    return records
  }

  const files = fs.readdirSync(archiveDir).filter((f) =>
    /\.(jpg|jpeg|png|webp)$/i.test(f)
  )

  for (const file of files) {
    // Extract year from filename if present (e.g. "palm-island-1938.png")
    const yearMatch = file.match(/(\d{4})/)
    const year = yearMatch ? yearMatch[1] : 'historical'

    // Generate caption from filename
    const caption = file
      .replace(/\.(jpg|jpeg|png|webp)$/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())

    // Determine page tags from filename keywords
    const pageTags = getPageTags(file.replace(/[-_]/g, ' '))
    // Archive photos are especially useful for journey/resilience pages
    pageTags.push('annual-report-journey')
    if (file.includes('hull-river') || file.includes('cyclone') || file.includes('1918')) {
      pageTags.push('annual-report-resilience')
    }

    records.push({
      file_name: file,
      storage_url: `/archive-photos/${file}`,
      caption,
      tags: [...new Set(['annual-report', 'archive', ...pageTags])],
      source: 'historical-archive',
      year_range: year,
    })
  }

  return records
}

// ── Main ──────────────────────────────────────────────

async function main() {
  console.log(`\n📸 Populating media_files table${DRY_RUN ? ' (DRY RUN)' : ''}...\n`)

  // 1. Read photo manifest
  const manifestPath = path.join(process.cwd(), 'content', 'photo-manifest.json')
  if (!fs.existsSync(manifestPath)) {
    console.error(`Manifest not found: ${manifestPath}`)
    process.exit(1)
  }
  const manifest: PhotoManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
  const manifestRecords = processManifestPhotos(manifest)
  console.log(`  Manifest photos: ${manifestRecords.length}`)

  // 2. Read archive photos
  const archiveDir = path.join(process.cwd(), 'public', 'archive-photos')
  const archiveRecords = processArchivePhotos(archiveDir)
  console.log(`  Archive photos:  ${archiveRecords.length}`)

  const allRecords = [...manifestRecords, ...archiveRecords]
  console.log(`  Total to import: ${allRecords.length}\n`)

  if (DRY_RUN) {
    console.log('Sample records:')
    for (const rec of allRecords.slice(0, 5)) {
      console.log(`  ${rec.file_name}`)
      console.log(`    URL:  ${rec.storage_url}`)
      console.log(`    Tags: ${rec.tags.join(', ')}`)
      console.log()
    }
    console.log(`Would insert ${allRecords.length} records. Use without --dry-run to execute.`)
    return
  }

  // 3. Check existing records to avoid duplicates
  const { data: existing, error: fetchErr } = await supabase
    .from('media_files')
    .select('file_name')
    .in('source', ['annual-report-archive', 'historical-archive'])

  if (fetchErr) {
    console.error('Error fetching existing records:', fetchErr.message)
    process.exit(1)
  }

  const existingNames = new Set((existing || []).map((r: any) => r.file_name))
  const newRecords = allRecords.filter((r) => !existingNames.has(r.file_name))

  if (newRecords.length === 0) {
    console.log('All photos already imported. Nothing to do.')
    return
  }

  console.log(`  Skipping ${allRecords.length - newRecords.length} already-imported photos`)
  console.log(`  Inserting ${newRecords.length} new photos...\n`)

  // 4. Batch insert in chunks of 100
  const BATCH_SIZE = 100
  let inserted = 0

  for (let i = 0; i < newRecords.length; i += BATCH_SIZE) {
    const batch = newRecords.slice(i, i + BATCH_SIZE).map((r) => ({
      file_name: r.file_name,
      storage_url: r.storage_url,
      caption: r.caption,
      tags: r.tags,
      source: r.source,
      media_type: r.file_name.endsWith('.png') ? 'image/png' : 'image/jpeg',
      is_featured: false,
    }))

    const { error: insertErr } = await supabase
      .from('media_files')
      .insert(batch)

    if (insertErr) {
      console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, insertErr.message)
      // Continue with next batch
    } else {
      inserted += batch.length
      console.log(`  Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} records (${inserted}/${newRecords.length})`)
    }
  }

  console.log(`\nDone! Inserted ${inserted} media_files records.`)

  // 5. Summary of tag distribution
  const tagCounts: Record<string, number> = {}
  for (const rec of allRecords) {
    for (const tag of rec.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    }
  }

  console.log('\nTag distribution:')
  for (const [tag, count] of Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 15)) {
    console.log(`  ${tag}: ${count}`)
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
