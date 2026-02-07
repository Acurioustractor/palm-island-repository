/**
 * Add Content-Type Tags to Event Photos
 *
 * Based on visual inspection of sample photos from each event,
 * applies content-type tags that describe what's IN the photos.
 *
 * These are ADDITIVE - they append to existing event tags, not replace.
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface ContentRule {
  eventTag: string
  addTags: string[]
  updateDescription?: string
}

const CONTENT_RULES: ContentRule[] = [
  {
    eventTag: 'event:spring-festival-2025',
    addTags: [
      'content:portrait',      // all are portrait-style
      'content:indoor',        // studio/booth setting
      'content:youth',         // predominantly kids and teens
      'setting:photobooth',    // blue couch studio backdrop
      'subject:first-nations', // First Nations community members
    ],
    updateDescription: 'PhotoBooth portrait at Palm Island Spring Festival, September 2025 - community members posing on studio couch',
  },
  {
    eventTag: 'event:daycare-opening-2025',
    addTags: [
      'content:indoor',            // ceremony hall + playroom
      'content:group',             // gatherings, audiences
      'content:children',          // lots of kids
      'content:elders',            // elders present with children
      'content:ceremony',          // official opening
      'setting:community-hall',    // PICC community venue
      'setting:childcare-centre',  // new daycare facility
      'subject:first-nations',
      'service:early-childhood-services',  // correct service tag
      'service:child-care',
    ],
  },
  {
    eventTag: 'event:community-visit-jun-2025',
    addTags: [
      'content:outdoor',        // bush, parks, streets
      'content:documentary',    // candid documentary style
      'content:youth',          // kids on scooters, playing
      'content:elders',         // elders at art centre
      'content:art',            // Aboriginal art, murals, Girringun Art Centre
      'content:nature',         // bush walks, tropical greenery
      'setting:on-country',     // Palm Island community
      'setting:art-centre',     // Girringun Aboriginal Art Centre
      'subject:first-nations',
      'subject:daily-life',     // everyday community life
    ],
  },
  {
    eventTag: 'event:photo-shoot-oct-2025',
    addTags: [
      'content:outdoor',            // outdoor golden hour
      'content:portrait',           // professional portraits
      'content:group',              // group shots
      'content:elders',             // many elder subjects
      'content:art',                // art centre backgrounds
      'content:nature',             // bush trails, tropical
      'quality:professional',       // pro photographer
      'setting:on-country',
      'setting:art-centre',
      'subject:first-nations',
    ],
  },
]

async function addContentTags(rule: ContentRule): Promise<number> {
  console.log(`\nProcessing: ${rule.eventTag}`)
  console.log(`  Adding tags: ${rule.addTags.join(', ')}`)

  // Fetch all photos with this event tag
  const { data: photos, error } = await supabase
    .from('media_files')
    .select('id, tags, description')
    .contains('tags', [rule.eventTag])
    .is('deleted_at', null)

  if (error || !photos) {
    console.error(`  Error: ${error?.message}`)
    return 0
  }

  console.log(`  Found ${photos.length} photos`)

  let updated = 0
  const batchSize = 50

  for (let i = 0; i < photos.length; i += batchSize) {
    const batch = photos.slice(i, i + batchSize)

    for (const photo of batch) {
      const existingTags = photo.tags || []
      const newTags = [...new Set([...existingTags, ...rule.addTags])]

      // Skip if no new tags to add
      if (newTags.length === existingTags.length) continue

      const updateData: any = {
        tags: newTags,
        updated_at: new Date().toISOString(),
      }
      if (rule.updateDescription) {
        updateData.description = rule.updateDescription
      }

      const { error: updateError } = await supabase
        .from('media_files')
        .update(updateData)
        .eq('id', photo.id)

      if (updateError) {
        console.error(`  Update error: ${updateError.message}`)
      } else {
        updated++
      }
    }

    console.log(`  Progress: ${Math.min(i + batchSize, photos.length)}/${photos.length}`)
  }

  console.log(`  Updated: ${updated}`)
  return updated
}

async function markFeatured(): Promise<void> {
  console.log('\n--- Marking featured photos ---')

  // For each event, mark a subset as featured based on file size (larger = higher quality)
  const events = [
    { tag: 'event:spring-festival-2025', featuredCount: 20 },
    { tag: 'event:daycare-opening-2025', featuredCount: 15 },
    { tag: 'event:community-visit-jun-2025', featuredCount: 20 },
    { tag: 'event:photo-shoot-oct-2025', featuredCount: 25 },
  ]

  for (const ev of events) {
    // Get photos ordered by file size (larger files = higher resolution = better quality)
    const { data: photos } = await supabase
      .from('media_files')
      .select('id, file_size')
      .contains('tags', [ev.tag])
      .is('deleted_at', null)
      .order('file_size', { ascending: false })
      .limit(ev.featuredCount)

    if (!photos || photos.length === 0) continue

    const ids = photos.map(p => p.id)

    const { error } = await supabase
      .from('media_files')
      .update({ is_featured: true, updated_at: new Date().toISOString() })
      .in('id', ids)

    if (error) {
      console.error(`  Error marking featured for ${ev.tag}: ${error.message}`)
    } else {
      console.log(`  ${ev.tag}: ${ids.length} photos marked as featured`)
    }
  }

  // Also mark all board photos, website gallery, and annual report covers as featured
  const specialQueries = [
    { label: 'Board photos', filter: { tags: ['board'] } },
    { label: 'Website gallery', filter: { tags: ['source:picc-website'] } },
    { label: 'Annual report covers', filter: { tags: ['section:cover'] } },
    { label: 'CEO messages', filter: { tags: ['section:ceo-message'] } },
    { label: 'Chair messages', filter: { tags: ['section:chair-message'] } },
  ]

  for (const sq of specialQueries) {
    const { data: photos } = await supabase
      .from('media_files')
      .select('id')
      .contains('tags', sq.filter.tags)
      .is('deleted_at', null)

    if (!photos || photos.length === 0) continue

    const ids = photos.map(p => p.id)
    const { error } = await supabase
      .from('media_files')
      .update({ is_featured: true, updated_at: new Date().toISOString() })
      .in('id', ids)

    if (error) {
      console.error(`  Error marking ${sq.label}: ${error.message}`)
    } else {
      console.log(`  ${sq.label}: ${ids.length} marked as featured`)
    }
  }
}

async function main() {
  console.log('╔' + '═'.repeat(58) + '╗')
  console.log('║   Content-Type Tags + Featured Selection                  ║')
  console.log('╚' + '═'.repeat(58) + '╝')

  let totalUpdated = 0
  for (const rule of CONTENT_RULES) {
    totalUpdated += await addContentTags(rule)
  }

  await markFeatured()

  // Final count
  const { count: featuredCount } = await supabase
    .from('media_files')
    .select('id', { count: 'exact', head: true })
    .eq('is_featured', true)
    .is('deleted_at', null)

  console.log('\n' + '='.repeat(60))
  console.log('COMPLETE')
  console.log(`  Content-type tags updated: ${totalUpdated}`)
  console.log(`  Total featured photos: ${featuredCount}`)
  console.log('='.repeat(60))

  // Show content tag distribution
  console.log('\n--- Content tag distribution ---')
  const { data: contentTags } = await supabase
    .from('media_files')
    .select('tags')
    .is('deleted_at', null)

  if (contentTags) {
    const counts = new Map<string, number>()
    for (const row of contentTags) {
      for (const tag of row.tags || []) {
        if (tag.startsWith('content:') || tag.startsWith('setting:') || tag.startsWith('subject:') || tag.startsWith('quality:')) {
          counts.set(tag, (counts.get(tag) || 0) + 1)
        }
      }
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
    for (const [tag, count] of sorted) {
      console.log(`  ${tag}: ${count}`)
    }
  }
}

main().catch(console.error)
