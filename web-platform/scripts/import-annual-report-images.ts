/**
 * Import Annual Report Images to Media Library
 *
 * Imports all extracted images from annual reports into the media_files table
 * with proper tags, metadata, and organization.
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { promises as fs } from 'fs'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(__dirname, '../.env.local') })

// ============================================================================
// Configuration
// ============================================================================

const METADATA_FILE = resolve(__dirname, '../public/documents/annual-reports/images-metadata.json')
const IMAGES_BASE_PATH = '/documents/annual-reports/images'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ============================================================================
// Types
// ============================================================================

interface ImageMetadata {
  id: string
  fiscalYear: string
  pdfPath: string
  pageNumber: number
  imageIndex: number
  fileName: string
  filePath: string
  width: number
  height: number
  format: string
  fileSize: number
  hash: string
  extractedAt: string
  knowledgeEntrySlug: string
}

interface ImportResult {
  totalImages: number
  imported: number
  skipped: number
  errors: number
  byYear: Record<string, number>
  errorMessages: string[]
}

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

/**
 * Generate tags for an image
 */
function generateTags(metadata: ImageMetadata): string[] {
  const tags = [
    'annual-report',
    `annual-report-${metadata.fiscalYear}`,
    `page-${metadata.pageNumber}`,
    'picc',
    'historical'
  ]

  // Add decade tag
  const year = parseInt(metadata.fiscalYear.split('-')[0])
  const decade = Math.floor(year / 10) * 10
  tags.push(`${decade}s`)

  return tags
}

/**
 * Generate title for an image
 */
function generateTitle(metadata: ImageMetadata): string {
  return `PICC Annual Report ${metadata.fiscalYear} - Page ${metadata.pageNumber}, Image ${metadata.imageIndex + 1}`
}

/**
 * Generate description for an image
 */
function generateDescription(metadata: ImageMetadata): string {
  return `Image extracted from Palm Island Community Company (PICC) Annual Report ${metadata.fiscalYear}, page ${metadata.pageNumber}.`
}

/**
 * Check if image already exists in media library
 */
async function imageExists(hash: string): Promise<boolean> {
  const { data, error: err } = await supabase
    .from('media_files')
    .select('id')
    .eq('metadata->>hash', hash)
    .limit(1)

  if (err) {
    console.error('Error checking image existence:', err)
    return false
  }

  return (data?.length || 0) > 0
}

/**
 * Import a single image to media library
 */
async function importImage(metadata: ImageMetadata): Promise<boolean> {
  try {
    // Check if already imported
    const exists = await imageExists(metadata.hash)
    if (exists) {
      log(`  ⏭️  Already exists: ${metadata.fileName}`)
      return false
    }

    const tags = generateTags(metadata)
    const title = generateTitle(metadata)
    const description = generateDescription(metadata)

    // Create media_files record
    const { data, error: err } = await supabase
      .from('media_files')
      .insert({
        filename: metadata.fileName,
        file_path: metadata.filePath,
        bucket_name: 'story-media', // Historical documentary media
        public_url: metadata.filePath, // Local file, public path
        file_type: 'image',
        mime_type: 'image/jpeg',
        file_size: metadata.fileSize,
        width: metadata.width,
        height: metadata.height,
        title,
        description,
        tags,
        is_public: true,
        location: 'Palm Island Community Company',
        taken_at: null, // Unknown when photos were taken
        metadata: {
          source: 'annual-report',
          fiscal_year: metadata.fiscalYear,
          pdf_path: metadata.pdfPath,
          page_number: metadata.pageNumber,
          image_index: metadata.imageIndex,
          hash: metadata.hash,
          extracted_at: metadata.extractedAt,
          knowledge_entry_slug: metadata.knowledgeEntrySlug
        }
      })
      .select()
      .single()

    if (err) {
      error(`  Failed to import ${metadata.fileName}:`, err)
      return false
    }

    log(`  ✅ Imported: ${metadata.fileName} (${metadata.width}x${metadata.height})`)
    return true
  } catch (err) {
    error(`  Exception importing ${metadata.fileName}:`, err)
    return false
  }
}

// ============================================================================
// Main Import Function
// ============================================================================

async function main() {
  log('🚀 Starting Annual Report Images Import')
  log(`Metadata File: ${METADATA_FILE}`)
  log('')

  // Load metadata
  const metadataContent = await fs.readFile(METADATA_FILE, 'utf-8')
  const allMetadata: ImageMetadata[] = JSON.parse(metadataContent)

  log(`Found ${allMetadata.length} images to import`)
  log('')

  const result: ImportResult = {
    totalImages: allMetadata.length,
    imported: 0,
    skipped: 0,
    errors: 0,
    byYear: {},
    errorMessages: []
  }

  // Group by year for progress tracking
  const byYear: Record<string, ImageMetadata[]> = {}
  for (const img of allMetadata) {
    if (!byYear[img.fiscalYear]) byYear[img.fiscalYear] = []
    byYear[img.fiscalYear].push(img)
  }

  const years = Object.keys(byYear).sort()

  // Process each year
  for (const year of years) {
    const images = byYear[year]
    log(`\n📅 Processing ${year} (${images.length} images)`)

    let yearImported = 0
    for (const img of images) {
      const success = await importImage(img)
      if (success) {
        result.imported++
        yearImported++
      } else {
        // Check if it was skipped or error
        const exists = await imageExists(img.hash)
        if (exists) {
          result.skipped++
        } else {
          result.errors++
          result.errorMessages.push(`Failed to import ${img.fileName}`)
        }
      }
    }

    result.byYear[year] = yearImported
    log(`  ✅ Imported ${yearImported} new images`)
  }

  // Print summary
  log('\n' + '='.repeat(60))
  log('📊 IMPORT COMPLETE - SUMMARY')
  log('='.repeat(60))
  log(`Total Images: ${result.totalImages}`)
  log(`Imported: ${result.imported}`)
  log(`Skipped (already exist): ${result.skipped}`)
  log(`Errors: ${result.errors}`)
  log('')
  log('Imported by Year:')
  Object.entries(result.byYear)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([year, count]) => {
      log(`  ${year}: ${count} images`)
    })

  if (result.errorMessages.length > 0) {
    log('')
    log('⚠️  Errors:')
    result.errorMessages.forEach(err => log(`  - ${err}`))
  }

  log('')
  log('✅ Import complete!')
  log('')
  log('Next steps:')
  log('1. Create "Annual Reports Images" photo collection')
  log('2. Add all images to the collection')
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
