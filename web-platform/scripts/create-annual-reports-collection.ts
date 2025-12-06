/**
 * Create Annual Reports Images Collection
 *
 * Creates a photo collection for all annual report images and adds them to it.
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(__dirname, '../.env.local') })

// ============================================================================
// Configuration
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const COLLECTION_NAME = 'Annual Reports Images'
const COLLECTION_SLUG = 'annual-reports-images'
const COLLECTION_DESCRIPTION = 'Visual history of PICC through 15 years of annual reports (2009-2024). Extracted images showcasing programs, people, facilities, and milestones across the organization\'s journey.'

// ============================================================================
// Helper Functions
// ============================================================================

function log(message: string, data?: any) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${message}`, data || '')
}

function error(message: string, err?: any) {
  console.error(`❌ ERROR: ${message}`, err || '')
}

// ============================================================================
// Main Function
// ============================================================================

async function main() {
  log('🚀 Creating Annual Reports Images Collection')
  log('')

  // Check if collection already exists
  const { data: existingCollection, error: checkError } = await supabase
    .from('photo_collections')
    .select('id, name, slug, item_count')
    .eq('slug', COLLECTION_SLUG)
    .single()

  if (existingCollection) {
    log(`✅ Collection already exists: "${existingCollection.name}"`)
    log(`   ID: ${existingCollection.id}`)
    log(`   Items: ${existingCollection.item_count}`)
    log('')
    log('Updating collection...')
  }

  // Get all annual report images
  log('📊 Fetching annual report images from media library...')
  const { data: images, error: fetchError } = await supabase
    .from('media_files')
    .select('id, filename, title, created_at')
    .contains('tags', ['annual-report'])
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  if (fetchError) {
    error('Failed to fetch images', fetchError)
    throw fetchError
  }

  log(`Found ${images?.length || 0} annual report images`)
  log('')

  // Create or update collection
  let collectionId: string

  if (existingCollection) {
    // Update existing collection
    collectionId = existingCollection.id
    const { error: updateError } = await supabase
      .from('photo_collections')
      .update({
        description: COLLECTION_DESCRIPTION,
        updated_at: new Date().toISOString()
      })
      .eq('id', collectionId)

    if (updateError) {
      error('Failed to update collection', updateError)
      throw updateError
    }

    log(`✅ Updated collection: "${COLLECTION_NAME}"`)
  } else {
    // Create new collection
    const { data: newCollection, error: createError } = await supabase
      .from('photo_collections')
      .insert({
        name: COLLECTION_NAME,
        slug: COLLECTION_SLUG,
        description: COLLECTION_DESCRIPTION,
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (createError || !newCollection) {
      error('Failed to create collection', createError)
      throw createError
    }

    collectionId = newCollection.id
    log(`✅ Created collection: "${COLLECTION_NAME}"`)
    log(`   ID: ${collectionId}`)
  }

  log('')
  log('📁 Adding images to collection...')

  // Get existing collection items to avoid duplicates
  const { data: existingItems } = await supabase
    .from('collection_items')
    .select('media_id')
    .eq('collection_id', collectionId)

  const existingMediaIds = new Set(existingItems?.map(item => item.media_id) || [])

  // Add images to collection
  let addedCount = 0
  let skippedCount = 0

  if (images) {
    for (let i = 0; i < images.length; i++) {
      const image = images[i]

      // Skip if already in collection
      if (existingMediaIds.has(image.id)) {
        skippedCount++
        continue
      }

      const { error: addError } = await supabase
        .from('collection_items')
        .insert({
          collection_id: collectionId,
          media_id: image.id,
          sort_order: i,
          added_at: new Date().toISOString()
        })

      if (addError) {
        error(`  Failed to add ${image.filename}`, addError)
      } else {
        addedCount++
        if (addedCount % 10 === 0 || addedCount === images.length) {
          log(`  Added ${addedCount}/${images.length} images...`)
        }
      }
    }
  }

  log('')
  log('='.repeat(60))
  log('📊 COLLECTION CREATED - SUMMARY')
  log('='.repeat(60))
  log(`Collection: ${COLLECTION_NAME}`)
  log(`Collection ID: ${collectionId}`)
  log(`Total Images: ${images?.length || 0}`)
  log(`Added: ${addedCount}`)
  log(`Skipped (already in collection): ${skippedCount}`)
  log('')
  log('✅ Collection created successfully!')
  log('')
  log('Next steps:')
  log('1. View collection at: /picc/media/collections/' + COLLECTION_SLUG)
  log('2. Set a cover image for the collection')
  log('3. Build timeline and gallery pages')
}

// ============================================================================
// Run
// ============================================================================

main()
  .then(() => process.exit(0))
  .catch(err => {
    error('Fatal error', err)
    process.exit(1)
  })
