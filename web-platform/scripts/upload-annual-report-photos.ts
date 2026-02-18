/**
 * Upload extracted annual report photos to Supabase storage and create media_files records.
 *
 * Photos extracted from docs/picc-2023-24-annual-report.pdf using pdfimages.
 *
 * Usage: npx tsx scripts/upload-annual-report-photos.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { config } from 'dotenv'
config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const EXTRACTED_DIR = resolve(__dirname, '../public/annual-report-photos/2023-24/extracted')

// Photo manifest — identified from visual inspection of extracted images
const PHOTOS: Array<{
  file: string
  title: string
  description: string
  caption: string | null
  tags: string[]
  person_name?: string // For headshots — will be used to update data-2024.ts
  person_role?: string
}> = [
  {
    file: 'img-000.jpg',
    title: 'Beach Walk — Palm Island Community',
    description: 'Four people walking along the beach on Palm Island',
    caption: 'Community members walking along the Palm Island shoreline',
    tags: ['annual-report', 'year:2024', 'community', 'beach', 'palm-island', 'collection:annual-report-2023-24'],
  },
  {
    file: 'img-001.jpg',
    title: 'Palm Island Beach Panorama',
    description: 'Wide panoramic view of Palm Island beach with clear waters',
    caption: null,
    tags: ['annual-report', 'annual-report-cover', 'year:2024', 'landscape', 'beach', 'palm-island', 'collection:annual-report-2023-24'],
  },
  {
    file: 'img-002.jpg',
    title: 'Rachel Atkinson — CEO Portrait',
    description: 'Professional portrait of Rachel Atkinson, Chief Executive Officer of PICC',
    caption: 'Rachel Atkinson, Chief Executive Officer',
    tags: ['annual-report', 'year:2024', 'portrait', 'leadership', 'headshot', 'collection:annual-report-2023-24'],
    person_name: 'Rachel Atkinson',
    person_role: 'ceo',
  },
  {
    file: 'img-003.jpg',
    title: 'Palm Island Coastline',
    description: 'Scenic view of the Palm Island coastline with vegetation',
    caption: null,
    tags: ['annual-report', 'year:2024', 'landscape', 'coastline', 'palm-island', 'collection:annual-report-2023-24'],
  },
  {
    file: 'img-004.jpg',
    title: 'Luella Bligh — Chair Portrait',
    description: 'Professional portrait of Luella Bligh, Chair of the PICC Board of Directors',
    caption: 'Luella Bligh, Chair of the Board',
    tags: ['annual-report', 'year:2024', 'portrait', 'leadership', 'headshot', 'board', 'collection:annual-report-2023-24'],
    person_name: 'Luella Bligh',
    person_role: 'chair',
  },
  {
    file: 'img-005.jpg',
    title: 'PICC Board of Directors Group Photo',
    description: 'Board of Directors group photo taken at the PICC office',
    caption: 'PICC Board of Directors 2023-24',
    tags: ['annual-report', 'year:2024', 'board', 'group-photo', 'governance', 'collection:annual-report-2023-24'],
  },
  {
    file: 'img-006.jpg',
    title: 'Palm Valley Waterhole',
    description: 'Scenic view of the Palm Valley waterhole surrounded by lush vegetation',
    caption: 'Palm Valley waterhole, Palm Island',
    tags: ['annual-report', 'year:2024', 'landscape', 'nature', 'palm-island', 'collection:annual-report-2023-24'],
  },
  {
    file: 'img-007.jpg',
    title: 'Cultural Dance Performance',
    description: 'Young people performing traditional cultural dance on Palm Island',
    caption: 'Cultural dance performance by Palm Island youth',
    tags: ['annual-report', 'year:2024', 'culture', 'dance', 'youth', 'performance', 'collection:annual-report-2023-24'],
  },
  {
    file: 'img-008.jpg',
    title: "Women's Healing Service Speaker",
    description: "Speaker presenting at a Women's Healing Service event",
    caption: null,
    tags: ['annual-report', 'year:2024', 'service', 'womens-healing', 'event', 'collection:annual-report-2023-24'],
  },
  {
    file: 'img-009.jpg',
    title: 'Rocky Coastline View',
    description: 'View of the rocky coastline and surrounding islands from Palm Island',
    caption: null,
    tags: ['annual-report', 'year:2024', 'landscape', 'coastline', 'palm-island', 'collection:annual-report-2023-24'],
  },
  {
    file: 'img-010.jpg',
    title: 'Youth Services — Community Support',
    description: 'PICC staff member with young community member',
    caption: 'PICC youth services in action',
    tags: ['annual-report', 'year:2024', 'service', 'youth', 'community', 'collection:annual-report-2023-24'],
  },
  {
    file: 'img-011.jpg',
    title: 'Deadly Choices Health Event',
    description: 'Speaker at a Deadly Choices health promotion event on Palm Island',
    caption: 'Deadly Choices health promotion event',
    tags: ['annual-report', 'year:2024', 'health', 'event', 'deadly-choices', 'collection:annual-report-2023-24'],
  },
  {
    file: 'img-012.jpg',
    title: 'Peter Gullumbah Prior Mural',
    description: 'Mural artwork by Peter Gullumbah Prior on Palm Island',
    caption: 'Mural by Peter Gullumbah Prior',
    tags: ['annual-report', 'year:2024', 'culture', 'art', 'mural', 'heritage', 'collection:annual-report-2023-24'],
  },
  {
    file: 'img-013.jpg',
    title: 'PICC Staff Team Photo',
    description: 'Group of five PICC staff members seated on a bench',
    caption: 'PICC team members',
    tags: ['annual-report', 'year:2024', 'staff', 'team', 'group-photo', 'collection:annual-report-2023-24'],
  },
  {
    file: 'img-014.jpg',
    title: 'Beach Through the Trees',
    description: 'View of the Palm Island beach framed by tropical trees',
    caption: null,
    tags: ['annual-report', 'year:2024', 'landscape', 'beach', 'palm-island', 'collection:annual-report-2023-24'],
  },
]

async function uploadPhoto(photo: typeof PHOTOS[number]) {
  const filePath = resolve(EXTRACTED_DIR, photo.file)
  const buffer = readFileSync(filePath)

  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const storageName = `annual-report-2024/${timestamp}-${randomStr}-${photo.file}`

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('story-media')
    .upload(storageName, buffer, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    console.error(`  Upload failed for ${photo.file}:`, uploadError.message)
    return null
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('story-media')
    .getPublicUrl(storageName)

  // Create media_files record
  const { data: mediaFile, error: insertError } = await supabase
    .from('media_files')
    .insert({
      filename: storageName.split('/').pop(),
      original_filename: photo.file,
      file_path: storageName,
      bucket_name: 'story-media',
      public_url: publicUrl,
      file_type: 'image',
      mime_type: 'image/jpeg',
      file_size: buffer.length,
      title: photo.title,
      description: photo.description,
      caption: photo.caption,
      tags: photo.tags,
      metadata: {
        source: 'annual-report-extraction',
        source_file: 'picc-2023-24-annual-report.pdf',
        person_name: photo.person_name || null,
        person_role: photo.person_role || null,
      },
    })
    .select()
    .single()

  if (insertError) {
    console.error(`  DB insert failed for ${photo.file}:`, insertError.message)
    return null
  }

  return { ...mediaFile, person_name: photo.person_name, person_role: photo.person_role }
}

;(async () => {
  console.log('Uploading annual report photos to Supabase...\n')

  const results: Array<{ file: string; url: string; person_name?: string; person_role?: string }> = []

  for (const photo of PHOTOS) {
    process.stdout.write(`  Uploading ${photo.file} — ${photo.title}...`)
    const result = await uploadPhoto(photo)
    if (result) {
      console.log(` OK (${result.public_url})`)
      results.push({
        file: photo.file,
        url: result.public_url,
        person_name: photo.person_name,
        person_role: photo.person_role,
      })
    } else {
      console.log(' FAILED')
    }
  }

  console.log(`\n${results.length}/${PHOTOS.length} photos uploaded successfully.\n`)

  // Print summary for manual update of data-2024.ts
  const headshots = results.filter(r => r.person_name)
  if (headshots.length > 0) {
    console.log('=== Leadership/Board Headshot URLs ===')
    for (const h of headshots) {
      console.log(`  ${h.person_name} (${h.person_role}): ${h.url}`)
    }
  }

  const cover = results.find(r => r.file === 'img-001.jpg')
  if (cover) {
    console.log(`\n=== Cover Photo URL ===`)
    console.log(`  ${cover.url}`)
  }

  const gallery = results.filter(r =>
    !r.person_name && r.file !== 'img-001.jpg'
  )
  if (gallery.length > 0) {
    console.log(`\n=== Gallery Photo URLs (${gallery.length}) ===`)
    for (const g of gallery) {
      console.log(`  ${g.file}: ${g.url}`)
    }
  }
})()
