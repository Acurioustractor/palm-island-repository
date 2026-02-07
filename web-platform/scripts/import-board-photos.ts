/**
 * Import Board Member Photos from Annual Report Crops
 *
 * Uploads cropped board member portraits and group photos
 * with person name tags for use across the site.
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { promises as fs } from 'fs'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const SCRATCHPAD = '/private/tmp/claude/-Users-benknight-Code-Palm-Island-Reposistory/13ef0960-1a38-4634-824a-3beef0f133c3/scratchpad'

interface BoardPhoto {
  localFile: string
  originalFilename: string
  title: string
  description: string
  altText: string
  tags: string[]
  facesDetected: string[]
}

const BOARD_PHOTOS: BoardPhoto[] = [
  // 2023-24 portraits
  {
    localFile: 'crop-2024-ceo-rachel-atkinson.jpg',
    originalFilename: 'board-ceo-rachel-atkinson-2023-24.jpg',
    title: 'Rachel Atkinson - CEO',
    description: 'Portrait of Rachel Atkinson, CEO of Palm Island Community Company, from the 2023-24 Annual Report.',
    altText: 'Rachel Atkinson, CEO of PICC',
    tags: [
      'photo', 'portrait', 'board', 'leadership', 'ceo',
      'person:rachel-atkinson', 'role:ceo',
      'annual-report', 'annual-report-2023-24', 'fy:2023-24',
      'picc', 'source:annual-report',
      'page:about', 'page:board', 'page:annual-report',
    ],
    facesDetected: ['Rachel Atkinson'],
  },
  {
    localFile: 'crop-2024-chair-luella-bligh.jpg',
    originalFilename: 'board-chair-luella-bligh-2023-24.jpg',
    title: 'Luella Bligh - Chair',
    description: 'Portrait of Luella Bligh, Chair of the Board of Directors, Palm Island Community Company, from the 2023-24 Annual Report.',
    altText: 'Luella Bligh, Chair of PICC Board',
    tags: [
      'photo', 'portrait', 'board', 'leadership', 'chair', 'chairperson',
      'person:luella-bligh', 'role:chair',
      'annual-report', 'annual-report-2023-24', 'fy:2023-24',
      'picc', 'source:annual-report',
      'page:about', 'page:board', 'page:annual-report',
    ],
    facesDetected: ['Luella Bligh'],
  },
  {
    localFile: 'crop-2024-board-group.jpg',
    originalFilename: 'board-group-photo-2023-24.jpg',
    title: 'PICC Board of Directors 2023-24',
    description: 'Group photo of the PICC Board of Directors from the 2023-24 Annual Report. Members: Luella Bligh (Chair), Rhonda Phillips, Allan Palm Island, Matthew Lindsay, Harriet Hulthen, Raymond Palmer Snr, Cassie Lang.',
    altText: 'PICC Board of Directors group photo 2023-24',
    tags: [
      'photo', 'group', 'board', 'leadership', 'directors',
      'person:luella-bligh', 'person:rhonda-phillips', 'person:allan-palm-island',
      'person:matthew-lindsay', 'person:harriet-hulthen', 'person:raymond-palmer',
      'role:chair', 'role:director', 'role:company-secretary',
      'annual-report', 'annual-report-2023-24', 'fy:2023-24',
      'picc', 'source:annual-report',
      'page:about', 'page:board', 'page:annual-report',
    ],
    facesDetected: [
      'Luella Bligh', 'Rhonda Phillips', 'Allan Palm Island',
      'Matthew Lindsay', 'Harriet Hulthen', 'Raymond Palmer',
    ],
  },

  // 2022-23 portraits
  {
    localFile: 'crop-2023-ceo-rachel-atkinson.jpg',
    originalFilename: 'board-ceo-rachel-atkinson-2022-23.jpg',
    title: 'Rachel Atkinson - CEO (2022-23)',
    description: 'Portrait of Rachel Atkinson, CEO of Palm Island Community Company, from the 2022-23 Annual Report.',
    altText: 'Rachel Atkinson, CEO of PICC',
    tags: [
      'photo', 'portrait', 'board', 'leadership', 'ceo',
      'person:rachel-atkinson', 'role:ceo',
      'annual-report', 'annual-report-2022-23', 'fy:2022-23',
      'picc', 'source:annual-report',
      'page:about', 'page:board', 'page:annual-report',
    ],
    facesDetected: ['Rachel Atkinson'],
  },
  {
    localFile: 'crop-2023-chair-luella-bligh.jpg',
    originalFilename: 'board-chair-luella-bligh-2022-23.jpg',
    title: 'Luella Bligh - Chair (2022-23)',
    description: 'Portrait of Luella Bligh, Chair of the Board of Directors, Palm Island Community Company, from the 2022-23 Annual Report.',
    altText: 'Luella Bligh, Chair of PICC Board',
    tags: [
      'photo', 'portrait', 'board', 'leadership', 'chair', 'chairperson',
      'person:luella-bligh', 'role:chair',
      'annual-report', 'annual-report-2022-23', 'fy:2022-23',
      'picc', 'source:annual-report',
      'page:about', 'page:board', 'page:annual-report',
    ],
    facesDetected: ['Luella Bligh'],
  },
  {
    localFile: 'crop-2023-board-group.jpg',
    originalFilename: 'board-group-photo-2022-23.jpg',
    title: 'PICC Board of Directors 2022-23',
    description: 'Group photo of the PICC Board of Directors from the 2022-23 Annual Report. Members: Luella Bligh (Chair), Harriet Hulthen, Matthew Lindsay, Cassie Lang, Allan Palm Island, Raymond Palmer Snr, Rhonda Phillips.',
    altText: 'PICC Board of Directors group photo 2022-23',
    tags: [
      'photo', 'group', 'board', 'leadership', 'directors',
      'person:luella-bligh', 'person:rhonda-phillips', 'person:allan-palm-island',
      'person:matthew-lindsay', 'person:harriet-hulthen', 'person:raymond-palmer',
      'role:chair', 'role:director', 'role:company-secretary',
      'annual-report', 'annual-report-2022-23', 'fy:2022-23',
      'picc', 'source:annual-report',
      'page:about', 'page:board', 'page:annual-report',
    ],
    facesDetected: [
      'Luella Bligh', 'Rhonda Phillips', 'Allan Palm Island',
      'Matthew Lindsay', 'Harriet Hulthen', 'Raymond Palmer',
    ],
  },
]

async function importPhoto(photo: BoardPhoto, index: number): Promise<boolean> {
  const label = `[${index + 1}/${BOARD_PHOTOS.length}]`
  console.log(`${label} Importing ${photo.title}...`)

  // Check for duplicates
  const { data: existing } = await supabase
    .from('media_files')
    .select('id')
    .eq('original_filename', photo.originalFilename)
    .is('deleted_at', null)
    .limit(1)

  if (existing && existing.length > 0) {
    console.log(`${label} Already exists, skipping`)
    return false
  }

  // Read local file
  const filePath = resolve(SCRATCHPAD, photo.localFile)
  let buffer: Buffer
  try {
    buffer = await fs.readFile(filePath)
  } catch (err: any) {
    console.error(`${label} Failed to read file: ${err.message}`)
    return false
  }

  const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2)
  console.log(`${label} File size: ${sizeMB}MB`)

  // Upload to Supabase Storage
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(7)
  const storageName = `board-${timestamp}-${randomStr}.jpg`

  const { error: uploadError } = await supabase.storage
    .from('story-media')
    .upload(storageName, buffer, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    console.error(`${label} Upload failed: ${uploadError.message}`)
    return false
  }

  const { data: { publicUrl } } = supabase.storage
    .from('story-media')
    .getPublicUrl(storageName)

  const mediaData = {
    filename: storageName,
    original_filename: photo.originalFilename,
    file_path: storageName,
    bucket_name: 'story-media',
    public_url: publicUrl,
    file_type: 'image',
    mime_type: 'image/jpeg',
    file_size: buffer.length,
    title: photo.title,
    description: photo.description,
    alt_text: photo.altText,
    tags: photo.tags,
    faces_detected: photo.facesDetected,
    is_public: true,
    is_featured: true,
    metadata: {
      source: 'annual-report-crop',
      imported_at: new Date().toISOString(),
      crop_method: 'imagemagick',
    },
    ...(tenantId ? { tenant_id: tenantId } : {}),
  }

  const { error: insertError } = await supabase
    .from('media_files')
    .insert(mediaData)

  if (insertError) {
    console.error(`${label} DB insert failed: ${insertError.message}`)
    await supabase.storage.from('story-media').remove([storageName])
    return false
  }

  console.log(`${label} Imported successfully: ${publicUrl}`)
  return true
}

async function main() {
  console.log('='.repeat(60))
  console.log('Board Member Photos Import')
  console.log(`Importing ${BOARD_PHOTOS.length} photos`)
  console.log('='.repeat(60))

  let imported = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < BOARD_PHOTOS.length; i++) {
    const result = await importPhoto(BOARD_PHOTOS[i], i)
    if (result) {
      imported++
    } else {
      const { data: existing } = await supabase
        .from('media_files')
        .select('id')
        .eq('original_filename', BOARD_PHOTOS[i].originalFilename)
        .is('deleted_at', null)
        .limit(1)
      if (existing && existing.length > 0) {
        skipped++
      } else {
        failed++
      }
    }
  }

  console.log('')
  console.log('='.repeat(60))
  console.log('Import Complete')
  console.log(`  Imported: ${imported}`)
  console.log(`  Skipped: ${skipped}`)
  console.log(`  Failed: ${failed}`)
  console.log('='.repeat(60))

  // Show summary of person tags now in system
  const { data: personTags } = await supabase.rpc('unnest_tags_count', {}).catch(() => ({ data: null }))

  console.log('\nPerson tags now in media library:')
  const { data: results } = await supabase
    .from('media_files')
    .select('tags')
    .contains('tags', ['board'])
    .is('deleted_at', null)

  if (results) {
    const persons = new Set<string>()
    for (const row of results) {
      for (const tag of row.tags || []) {
        if (tag.startsWith('person:')) persons.add(tag)
      }
    }
    for (const p of persons) {
      console.log(`  ${p}`)
    }
  }
}

main().catch(console.error)
