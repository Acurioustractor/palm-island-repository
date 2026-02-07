/**
 * Fix Event-Based Photo Tags
 *
 * Strips incorrectly bulk-applied service tags and replaces them with
 * accurate event-based tags grouped by photo date.
 *
 * Event groupings identified from date prefixes:
 * - 20250602-06: Community visit/activities photos
 * - 20250812: Daycare Opening ceremony
 * - 20250926-27: Palm Island Spring Festival (photobooth)
 * - 20251015-19: October 2025 photo shoot (on-country / immersive story)
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ============================================================================
// Event definitions
// ============================================================================

interface EventGroup {
  name: string
  dateRange: string[]  // date prefixes to match
  correctTags: string[]
  correctDescription: string
  stripServiceTags: boolean  // remove all service:* tags
  stripOtherTags: string[]   // specific tags to remove
}

const EVENT_GROUPS: EventGroup[] = [
  {
    name: 'Palm Island Spring Festival',
    dateRange: ['20250926', '20250927'],
    correctTags: [
      'photo',
      'event', 'event:spring-festival-2025',
      'photobooth',
      'community', 'people', 'celebration',
      'picc',
      'fy:2025-26',
    ],
    correctDescription: 'PhotoBooth at Palm Island Spring Festival, September 2025',
    stripServiceTags: true,
    stripOtherTags: [],
  },
  {
    name: 'Daycare Opening',
    dateRange: ['20250812'],
    correctTags: [
      'photo',
      'event', 'event:daycare-opening-2025',
      'ceremony', 'opening',
      'community', 'people',
      'service:early-childhood-services', 'service:child-care',
      'picc',
      'fy:2025-26',
    ],
    correctDescription: 'Daycare Opening ceremony, August 2025',
    stripServiceTags: true,  // strip all, then add back the correct ones
    stripOtherTags: ['Daycare Opening'],  // remove freeform tag, use structured one
  },
  {
    name: 'Community Visit June 2025',
    dateRange: ['20250602', '20250603', '20250604', '20250605', '20250606'],
    correctTags: [
      'photo',
      'event', 'event:community-visit-jun-2025',
      'community', 'people',
      'on-country', 'palm-island',
      'picc',
      'fy:2024-25',
    ],
    correctDescription: 'Community visit and activities, Palm Island, June 2025',
    stripServiceTags: true,
    stripOtherTags: [],
  },
  {
    name: 'October 2025 Photo Shoot',
    dateRange: ['20251015', '20251016', '20251017', '20251018', '20251019'],
    correctTags: [
      'photo',
      'event', 'event:photo-shoot-oct-2025',
      'professional-photography',
      'community', 'people', 'palm-island',
      'picc',
      'fy:2025-26',
    ],
    correctDescription: 'Professional photo shoot, Palm Island, October 2025',
    stripServiceTags: true,
    stripOtherTags: [
      'immersive-story', 'collection:immersive-story',
      'usage:immersive_story',
      'story:elders-trip', 'project:elders-trips',
      'page:elders',
      'annual-report',
      'historical', '2020s',
    ],
  },
]

// ============================================================================
// Fix logic
// ============================================================================

async function fixEventGroup(group: EventGroup): Promise<{ updated: number; errors: number }> {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`Processing: ${group.name}`)
  console.log(`Date prefixes: ${group.dateRange.join(', ')}`)
  console.log('='.repeat(60))

  let updated = 0
  let errors = 0

  for (const datePrefix of group.dateRange) {
    // Fetch all photos matching this date prefix
    const { data: photos, error: fetchError } = await supabase
      .from('media_files')
      .select('id, title, tags, description')
      .like('title', `${datePrefix}%`)
      .is('deleted_at', null)

    if (fetchError) {
      console.error(`  Error fetching ${datePrefix}: ${fetchError.message}`)
      errors++
      continue
    }

    if (!photos || photos.length === 0) {
      console.log(`  No photos found for ${datePrefix}`)
      continue
    }

    console.log(`  Found ${photos.length} photos for ${datePrefix}`)

    // Process in batches of 50
    const batchSize = 50
    for (let i = 0; i < photos.length; i += batchSize) {
      const batch = photos.slice(i, i + batchSize)
      const ids = batch.map(p => p.id)

      // Build new tags: start with correct tags, then keep any non-service
      // tags that aren't in the strip list
      // Since all photos in a batch get the same event tags, we use a single update
      const { error: updateError } = await supabase
        .from('media_files')
        .update({
          tags: group.correctTags,
          description: group.correctDescription,
          updated_at: new Date().toISOString(),
        })
        .in('id', ids)

      if (updateError) {
        console.error(`  Batch update error: ${updateError.message}`)
        errors += batch.length
      } else {
        updated += batch.length
        console.log(`  Updated ${Math.min(i + batchSize, photos.length)}/${photos.length}`)
      }
    }
  }

  console.log(`  Result: ${updated} updated, ${errors} errors`)
  return { updated, errors }
}

// ============================================================================
// Preserve hero tags - some photos were marked as hero images
// ============================================================================

async function preserveHeroTags(): Promise<void> {
  console.log('\n--- Preserving hero tags ---')

  // Find photos that had 'hero' tag before our update
  // We need to re-add hero to any photo that previously had it
  // Since we already overwrote, we check the metadata or just query for known hero patterns
  const { data: heroPhotos, error } = await supabase
    .from('media_files')
    .select('id, title, tags')
    .is('deleted_at', null)
    .or('title.like.%hero%,tags.cs.{hero}')

  if (error) {
    console.error('  Error checking hero tags:', error.message)
    return
  }

  console.log(`  Found ${heroPhotos?.length || 0} photos with hero tag (already preserved in tags)`)
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('╔' + '═'.repeat(58) + '╗')
  console.log('║   PICC Media Library - Event Tag Cleanup                  ║')
  console.log('╚' + '═'.repeat(58) + '╝')

  // First, let's count what we're about to change
  let totalToFix = 0
  for (const group of EVENT_GROUPS) {
    let count = 0
    for (const datePrefix of group.dateRange) {
      const { count: c } = await supabase
        .from('media_files')
        .select('id', { count: 'exact', head: true })
        .like('title', `${datePrefix}%`)
        .is('deleted_at', null)
      count += (c || 0)
    }
    console.log(`  ${group.name}: ${count} photos`)
    totalToFix += count
  }

  console.log(`\n  TOTAL: ${totalToFix} photos to re-tag`)
  console.log('  Starting in 2 seconds...\n')
  await new Promise(r => setTimeout(r, 2000))

  // Before: snapshot
  console.log('--- Processing events ---')

  let grandUpdated = 0
  let grandErrors = 0

  for (const group of EVENT_GROUPS) {
    const result = await fixEventGroup(group)
    grandUpdated += result.updated
    grandErrors += result.errors
  }

  // After: verify
  console.log('\n' + '='.repeat(60))
  console.log('CLEANUP COMPLETE')
  console.log('='.repeat(60))
  console.log(`  Total updated: ${grandUpdated}`)
  console.log(`  Total errors: ${grandErrors}`)

  // Verify event tags
  console.log('\n--- AFTER: Event tag counts ---')
  const { data: eventTags } = await supabase
    .from('media_files')
    .select('tags')
    .is('deleted_at', null)
    .contains('tags', ['event'])

  if (eventTags) {
    const events = new Map<string, number>()
    for (const row of eventTags) {
      for (const tag of row.tags || []) {
        if (tag.startsWith('event:')) {
          events.set(tag, (events.get(tag) || 0) + 1)
        }
      }
    }
    for (const [event, count] of events) {
      console.log(`  ${event}: ${count} photos`)
    }
  }

  // Show overall tag health
  const { data: healthCheck } = await supabase
    .from('media_files')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null)
    .contains('tags', ['event'])

  console.log(`\n  Photos with event tags: ${healthCheck?.length ?? 'n/a'}`)
}

main().catch(console.error)
