/**
 * Upload 71 service photos from local folder to Supabase storage + media_files table.
 * GPS-tagged reference photos also update service coordinates.
 *
 * Usage: npx tsx scripts/upload-service-photos.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const SOURCE_DIR = '/Users/benknight/Pictures/Manual Library/Service Photos PICC'

// GPS reference photos → service slug mappings
const GPS_SERVICE_MAP: Record<string, { lat: number; lng: number; slugs: string[] }> = {
  'GPS Safe House.jpg': {
    lat: -18.733544, lng: 146.580339,
    slugs: ['safe-house'],
  },
  "GPS Men's Diversionary Centre.jpg": {
    lat: -18.733567, lng: 146.578811,
    slugs: ['diversionary-service'],
  },
  "GPS Women's Shelter.jpg": {
    lat: -18.734300, lng: 146.579803,
    slugs: ['womens-service', 'dfv-service', 'womens-healing-service'],
  },
  'GPS PICC Offices.jpg': {
    lat: -18.734664, lng: 146.578217,
    slugs: ['digital_services', 'family-care-service', 'family-participation-program'],
  },
  'GPS Youth Hub.jpg': {
    lat: -18.721408, lng: 146.587647,
    slugs: ['youth-service'],
  },
  'GPS Ferdies.jpg': {
    lat: -18.721844, lng: 146.582733,
    slugs: [], // landmark only
  },
  'GPS Mechanics.jpg': {
    lat: -18.721169, lng: 146.587692,
    slugs: [], // landmark only
  },
}

const COMMON_TAGS = ['service-photo', 'palm-island']

async function uploadPhoto(filename: string): Promise<string | null> {
  const filePath = path.join(SOURCE_DIR, filename)
  const fileBuffer = fs.readFileSync(filePath)
  const ext = path.extname(filename).toLowerCase()
  const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
  const storagePath = `picc-website/service-photos/${filename}`

  console.log(`  Uploading ${filename} (${(fileBuffer.length / 1024).toFixed(0)}KB)...`)

  const { error: uploadErr } = await supabase.storage
    .from('story-media')
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: true,
    })

  if (uploadErr) {
    console.error(`    Storage upload failed: ${uploadErr.message}`)
    return null
  }

  const { data: urlData } = supabase.storage.from('story-media').getPublicUrl(storagePath)
  const publicUrl = urlData.publicUrl

  // Build tags
  const tags = [...COMMON_TAGS]
  const gpsInfo = GPS_SERVICE_MAP[filename]
  if (gpsInfo) {
    tags.push('gps-reference')
    for (const slug of gpsInfo.slugs) {
      tags.push(`service:${slug}`)
    }
  }

  // Extract date from filename if present (e.g., 20240409-IMG_6096.jpg)
  const dateMatch = filename.match(/^(\d{8})-/)
  const dateStr = dateMatch ? dateMatch[1] : undefined

  const title = gpsInfo
    ? filename.replace('.jpg', '').replace('.jpeg', '')
    : filename.replace(/^\d{8}-/, '').replace(/\.[^.]+$/, '')

  const { data: mediaRecord, error: insertErr } = await supabase
    .from('media_files')
    .insert({
      filename,
      original_filename: filename,
      file_path: storagePath,
      bucket_name: 'story-media',
      public_url: publicUrl,
      mime_type: mimeType,
      file_type: 'image',
      file_size: fileBuffer.length,
      title,
      tags,
      metadata: {
        upload_source: 'service-photos-batch',
        ...(dateStr ? { date_taken: `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}` } : {}),
        ...(gpsInfo ? { latitude: gpsInfo.lat, longitude: gpsInfo.lng } : {}),
      },
    })
    .select('id')
    .single()

  if (insertErr) {
    console.error(`    DB insert failed: ${insertErr.message}`)
    return null
  }

  console.log(`    OK: ${mediaRecord.id}`)
  return mediaRecord.id
}

async function updateServiceCoordinates() {
  console.log('\n--- Updating service coordinates from GPS reference photos ---\n')

  // Fetch all services
  const { data: services, error } = await supabase
    .from('organization_services')
    .select('id, slug, metadata')

  if (error || !services) {
    console.error('Failed to fetch services:', error?.message)
    return
  }

  const serviceBySlug = new Map(services.map(s => [s.slug, s]))

  for (const [filename, info] of Object.entries(GPS_SERVICE_MAP)) {
    if (info.slugs.length === 0) {
      console.log(`  ${filename}: landmark only, skipping`)
      continue
    }

    for (const slug of info.slugs) {
      const service = serviceBySlug.get(slug)
      if (!service) {
        console.log(`  ${slug}: service not found, skipping`)
        continue
      }

      const existingMeta = (service.metadata as Record<string, unknown>) || {}
      const newMeta = {
        ...existingMeta,
        latitude: info.lat,
        longitude: info.lng,
      }

      const { error: updateErr } = await supabase
        .from('organization_services')
        .update({ metadata: newMeta })
        .eq('id', service.id)

      if (updateErr) {
        console.error(`  ${slug}: update failed — ${updateErr.message}`)
      } else {
        console.log(`  ${slug}: updated to ${info.lat}, ${info.lng}`)
      }
    }
  }
}

async function main() {
  console.log('=== Upload Service Photos ===\n')

  const files = fs.readdirSync(SOURCE_DIR).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
  console.log(`Found ${files.length} images in ${SOURCE_DIR}\n`)

  let uploaded = 0
  let failed = 0

  for (const file of files) {
    const id = await uploadPhoto(file)
    if (id) uploaded++
    else failed++
  }

  console.log(`\nUpload complete: ${uploaded} uploaded, ${failed} failed`)

  // Phase 2: update service GPS coords
  await updateServiceCoordinates()

  console.log('\nDone!')
}

main().catch(console.error)
