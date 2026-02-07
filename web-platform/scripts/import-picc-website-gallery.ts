/**
 * Import PICC Website Gallery Photos
 *
 * Downloads all gallery images from picc.com.au and imports them
 * into the media_files table with proper tags and metadata.
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ============================================================================
// Gallery image data from picc.com.au/about/gallery/
// ============================================================================

interface GalleryImage {
  url: string
  category: 'landscape' | 'services-people'
  filename: string
}

const GALLERY_IMAGES: GalleryImage[] = [
  // Beautiful Palm Island - landscape/scenic photos
  { url: 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery1/big/picture32.jpg', category: 'landscape', filename: 'picture32.jpg' },
  { url: 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery1/big/picture31.jpg', category: 'landscape', filename: 'picture31.jpg' },
  { url: 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery1/big/picture21.jpg', category: 'landscape', filename: 'picture21.jpg' },
  { url: 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery1/big/picture10.jpg', category: 'landscape', filename: 'picture10.jpg' },
  { url: 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery1/big/picture20.jpg', category: 'landscape', filename: 'picture20.jpg' },
  { url: 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery1/big/picture14.jpg', category: 'landscape', filename: 'picture14.jpg' },
  { url: 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery1/big/picture8.jpg', category: 'landscape', filename: 'picture8.jpg' },
  { url: 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery1/big/palmisland.320.jpg', category: 'landscape', filename: 'palmisland.320.jpg' },
  { url: 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery1/big/palmisland.299.jpg', category: 'landscape', filename: 'palmisland.299.jpg' },
  { url: 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery1/big/palmisland.286.jpg', category: 'landscape', filename: 'palmisland.286.jpg' },
  { url: 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery1/big/palmisland.284.jpg', category: 'landscape', filename: 'palmisland.284.jpg' },
  { url: 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery1/big/palmisland.269.jpg', category: 'landscape', filename: 'palmisland.269.jpg' },
  { url: 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery1/big/palmisland.171.jpg', category: 'landscape', filename: 'palmisland.171.jpg' },
  { url: 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery1/big/palmisland.167.jpg', category: 'landscape', filename: 'palmisland.167.jpg' },
  { url: 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery1/big/palmisland.268.jpg', category: 'landscape', filename: 'palmisland.268.jpg' },

  // Our Services and People - service/community photos
  { url: 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery2/big/picture30.jpg', category: 'services-people', filename: 'picture30.jpg' },
  { url: 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery2/big/picture27.jpg', category: 'services-people', filename: 'picture27.jpg' },
  { url: 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery2/big/picture22.jpg', category: 'services-people', filename: 'picture22.jpg' },
  { url: 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery2/big/picture19.jpg', category: 'services-people', filename: 'picture19.jpg' },
  { url: 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery2/big/picture15.jpg', category: 'services-people', filename: 'picture15.jpg' },
  { url: 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery2/big/picture6.jpg', category: 'services-people', filename: 'picture6.jpg' },
  { url: 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery2/big/picture4.jpg', category: 'services-people', filename: 'picture4.jpg' },
  { url: 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery2/big/picture12.jpg', category: 'services-people', filename: 'picture12.jpg' },
  { url: 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery2/big/picture3.jpg', category: 'services-people', filename: 'picture3.jpg' },
  { url: 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery2/big/palmisland.021.jpg', category: 'services-people', filename: 'palmisland.021.jpg' },
  { url: 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery2/big/palmisland.116.jpg', category: 'services-people', filename: 'palmisland.116.jpg' },
  { url: 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery2/big/palmisland.466.jpg', category: 'services-people', filename: 'palmisland.466.jpg' },
]

// ============================================================================
// Import Logic
// ============================================================================

function generateTags(img: GalleryImage): string[] {
  const tags = [
    'photo',
    'source:picc-website',
    'picc',
    'palm-island',
  ]

  if (img.category === 'landscape') {
    tags.push('landscape', 'scenic', 'page:home', 'page:about')
  } else {
    tags.push('services', 'people', 'community', 'page:services')
  }

  return tags
}

async function downloadImage(url: string): Promise<{ buffer: Buffer; contentType: string; size: number } | null> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      console.error(`  Failed to download ${url}: ${response.status}`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    return { buffer, contentType, size: buffer.length }
  } catch (err: any) {
    console.error(`  Download error for ${url}: ${err.message}`)
    return null
  }
}

async function importImage(img: GalleryImage, index: number): Promise<boolean> {
  const label = `[${index + 1}/${GALLERY_IMAGES.length}]`
  console.log(`${label} Importing ${img.filename} (${img.category})...`)

  // Check for duplicates
  const { data: existing } = await supabase
    .from('media_files')
    .select('id')
    .eq('original_filename', `picc-website-${img.filename}`)
    .is('deleted_at', null)
    .limit(1)

  if (existing && existing.length > 0) {
    console.log(`${label} Already exists, skipping`)
    return false
  }

  // Download
  const downloaded = await downloadImage(img.url)
  if (!downloaded) return false

  const sizeMB = (downloaded.size / (1024 * 1024)).toFixed(1)
  console.log(`${label} Downloaded: ${sizeMB}MB`)

  // Upload to Supabase Storage
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(7)
  const storageName = `picc-website-${timestamp}-${randomStr}.jpg`

  const { error: uploadError } = await supabase.storage
    .from('story-media')
    .upload(storageName, downloaded.buffer, {
      contentType: downloaded.contentType,
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    console.error(`${label} Upload failed: ${uploadError.message}`)
    return false
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('story-media')
    .getPublicUrl(storageName)

  // Insert media record
  const tags = generateTags(img)
  const mediaData = {
    filename: storageName,
    original_filename: `picc-website-${img.filename}`,
    file_path: storageName,
    bucket_name: 'story-media',
    public_url: publicUrl,
    file_type: 'image',
    mime_type: downloaded.contentType,
    file_size: downloaded.size,
    title: img.category === 'landscape'
      ? `Palm Island - ${img.filename.replace('.jpg', '')}`
      : `PICC Services & People - ${img.filename.replace('.jpg', '')}`,
    description: img.category === 'landscape'
      ? 'Scenic photo of Palm Island from PICC website gallery'
      : 'Services and people photo from PICC website gallery',
    tags,
    is_public: true,
    metadata: {
      source_url: img.url,
      source_site: 'picc.com.au',
      gallery_category: img.category,
      imported_at: new Date().toISOString(),
    },
    ...(tenantId ? { tenant_id: tenantId } : {}),
  }

  const { error: insertError } = await supabase
    .from('media_files')
    .insert(mediaData)

  if (insertError) {
    console.error(`${label} DB insert failed: ${insertError.message}`)
    // Clean up uploaded file
    await supabase.storage.from('story-media').remove([storageName])
    return false
  }

  console.log(`${label} Imported successfully`)
  return true
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('='.repeat(60))
  console.log('PICC Website Gallery Import')
  console.log(`Importing ${GALLERY_IMAGES.length} images from picc.com.au`)
  console.log('='.repeat(60))

  let imported = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < GALLERY_IMAGES.length; i++) {
    const result = await importImage(GALLERY_IMAGES[i], i)
    if (result) {
      imported++
    } else {
      // Check if it was a skip (already exists) or failure
      const { data: existing } = await supabase
        .from('media_files')
        .select('id')
        .eq('original_filename', `picc-website-${GALLERY_IMAGES[i].filename}`)
        .is('deleted_at', null)
        .limit(1)

      if (existing && existing.length > 0) {
        skipped++
      } else {
        failed++
      }
    }

    // Small delay between downloads to be polite
    if (i < GALLERY_IMAGES.length - 1) {
      await new Promise(r => setTimeout(r, 500))
    }
  }

  console.log('')
  console.log('='.repeat(60))
  console.log('Import Complete')
  console.log(`  Imported: ${imported}`)
  console.log(`  Skipped (already exist): ${skipped}`)
  console.log(`  Failed: ${failed}`)
  console.log('='.repeat(60))
}

main().catch(console.error)
