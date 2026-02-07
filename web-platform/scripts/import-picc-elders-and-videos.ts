/**
 * Import Elders Conference Photos + PICC Videos
 *
 * 1. Downloads & uploads 28 photos from the Elders Conference news article
 * 2. Adds NAIDOC Week Elders' Dinner YouTube video as a media record
 * 3. Tags the NAIDOC video for home page hero use
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const BUCKET = 'story-media'

// ── Elders Conference photos (gallery9) ──
const ELDERS_CONFERENCE_PHOTOS = [
  'dsc07950.jpg', 'img_0400.jpg', 'img_0389.jpg', 'img_0387.jpg', 'img_0391.jpg',
  'img_0394.jpg', 'img_0396.jpg', 'img_0398.jpg', 'img_0401.jpg', 'img_0403.jpg',
  'img_0405.jpg', 'img_0407.jpg', 'img_0409.jpg', 'img_0411.jpg', 'img_0413.jpg',
  'img_0415.jpg', 'img_0417.jpg', 'img_0419.jpg', 'img_0421.jpg', 'img_0423.jpg',
  'img_0425.jpg', 'img_0427.jpg', 'img_0429.jpg', 'img_0431.jpg', 'img_0433.jpg',
  'img_0435.jpg', 'img_0437.jpg', 'img_0439.jpg',
]

const GALLERY9_BASE = 'https://os-data-2.xargo-cdn.net/picc-com-au/gallery9/big/'

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'Referer': 'https://www.picc.com.au/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    })
    if (!res.ok) {
      console.error(`  Failed to download ${url}: ${res.status}`)
      return null
    }
    const arrayBuffer = await res.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (err: any) {
    console.error(`  Download error: ${err.message}`)
    return null
  }
}

async function importEldersConferencePhotos(): Promise<number> {
  console.log('\n--- Importing Elders Conference Photos (28) ---')

  // Check for duplicates
  const { data: existing } = await supabase
    .from('media_files')
    .select('original_filename')
    .contains('tags', ['event:elders-conference'])
    .is('deleted_at', null)

  const existingNames = new Set((existing || []).map(e => e.original_filename))
  let imported = 0

  for (const filename of ELDERS_CONFERENCE_PHOTOS) {
    if (existingNames.has(filename)) {
      console.log(`  Skip (exists): ${filename}`)
      continue
    }

    const url = `${GALLERY9_BASE}${filename}`
    const buffer = await downloadImage(url)
    if (!buffer) continue

    const storagePath = `picc-website/elders-conference/${filename}`

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      })

    if (uploadError) {
      console.error(`  Upload error for ${filename}: ${uploadError.message}`)
      continue
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${storagePath}`

    // Create media record
    const { error: insertError } = await supabase
      .from('media_files')
      .insert({
        title: filename.replace(/\.\w+$/, ''),
        filename: filename,
        original_filename: filename,
        file_type: 'image',
        file_size: buffer.length,
        public_url: publicUrl,
        file_path: storagePath,
        bucket_name: BUCKET,
        mime_type: 'image/jpeg',
        is_public: true,
        is_featured: true,
        tags: [
          'photo',
          'event', 'event:elders-conference',
          'content:group', 'content:elders', 'content:indoor',
          'content:ceremony',
          'setting:community-hall',
          'subject:first-nations',
          'source:picc-website',
          'picc',
        ],
        description: 'First Palm Island Elders Conference - community event celebrating and thanking Elders',
      })

    if (insertError) {
      console.error(`  Insert error for ${filename}: ${insertError.message}`)
    } else {
      imported++
      console.log(`  Imported: ${filename} (${(buffer.length / 1024).toFixed(0)}KB)`)
    }
  }

  console.log(`  Total imported: ${imported}`)
  return imported
}

async function addNaidocVideo(): Promise<boolean> {
  console.log('\n--- Adding NAIDOC Elders\' Dinner YouTube Video ---')

  // Check if already exists
  const { data: existing } = await supabase
    .from('media_files')
    .select('id')
    .eq('public_url', 'https://youtu.be/Lxaik-zxzro')
    .is('deleted_at', null)

  if (existing && existing.length > 0) {
    console.log('  Already exists, updating tags...')
    const { error } = await supabase
      .from('media_files')
      .update({
        tags: [
          'video',
          'event', 'event:naidoc-2019',
          'content:elders', 'content:ceremony', 'content:group',
          'content:indoor',
          'subject:first-nations',
          'source:picc-website', 'source:youtube',
          'picc',
          'hero', 'page:home',
          'video:naidoc-elders-dinner',
        ],
        is_featured: true,
        is_public: true,
        description: 'NAIDOC Week Elders\' Dinner video - celebrating and thanking the Elders of Palm Island for their contribution to the community. July 2019.',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing[0].id)

    if (error) {
      console.error(`  Update error: ${error.message}`)
      return false
    }
    console.log('  Updated existing record with new tags')
    return true
  }

  // Create new record
  const { error } = await supabase
    .from('media_files')
    .insert({
      title: 'NAIDOC Week Elders\' Dinner - Palm Island 2019',
      filename: 'naidoc-elders-dinner-2019',
      original_filename: 'naidoc-elders-dinner-2019.mp4',
      file_path: 'external/youtube/Lxaik-zxzro',
      file_type: 'video',
      public_url: 'https://youtu.be/Lxaik-zxzro',
      is_public: true,
      is_featured: true,
      tags: [
        'video',
        'event', 'event:naidoc-2019',
        'content:elders', 'content:ceremony', 'content:group',
        'content:indoor',
        'subject:first-nations',
        'source:picc-website', 'source:youtube',
        'picc',
        'hero', 'page:home',
        'video:naidoc-elders-dinner',
      ],
      description: 'NAIDOC Week Elders\' Dinner video - celebrating and thanking the Elders of Palm Island for their contribution to the community. July 2019.',
      metadata: {
        external_video: {
          platform: 'youtube',
          video_id: 'Lxaik-zxzro',
          url: 'https://youtu.be/Lxaik-zxzro',
          thumbnail_url: 'https://img.youtube.com/vi/Lxaik-zxzro/maxresdefault.jpg',
        },
      },
    })

  if (error) {
    console.error(`  Insert error: ${error.message}`)
    return false
  }

  console.log('  Added NAIDOC video record')
  return true
}

async function main() {
  console.log('╔' + '═'.repeat(58) + '╗')
  console.log('║   Import Elders Conference Photos + PICC Videos           ║')
  console.log('╚' + '═'.repeat(58) + '╝')

  const photosImported = await importEldersConferencePhotos()
  const videoAdded = await addNaidocVideo()

  // Summary
  const { count: totalMedia } = await supabase
    .from('media_files')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null)

  const { count: totalVideos } = await supabase
    .from('media_files')
    .select('id', { count: 'exact', head: true })
    .eq('file_type', 'video')
    .is('deleted_at', null)

  const { count: heroVideos } = await supabase
    .from('media_files')
    .select('id', { count: 'exact', head: true })
    .contains('tags', ['hero', 'page:home'])
    .is('deleted_at', null)

  console.log('\n' + '='.repeat(60))
  console.log('COMPLETE')
  console.log(`  Elders Conference photos imported: ${photosImported}`)
  console.log(`  NAIDOC video added: ${videoAdded ? 'yes' : 'no'}`)
  console.log(`  Total media files: ${totalMedia}`)
  console.log(`  Total videos: ${totalVideos}`)
  console.log(`  Home page hero videos: ${heroVideos}`)
  console.log('='.repeat(60))
}

main().catch(console.error)
