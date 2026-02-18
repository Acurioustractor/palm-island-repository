/**
 * Fix tags on annual report photos to align with the smart folder system.
 *
 * Corrections:
 * - year:2024 → fy:2023-24 (proper fiscal year prefix)
 * - Add role:board-member to board photos (for Board Members smart folder)
 * - Add role:leadership, role:ceo, role:chair to leadership portraits
 * - Add content: and service: namespace tags
 * - Add quality:professional to portraits
 *
 * Usage: npx tsx scripts/fix-annual-report-tags.ts
 */

import { createClient } from '@supabase/supabase-js'
import { resolve } from 'path'
import { config } from 'dotenv'

config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

interface Correction {
  add: string[]
  remove: string[]
}

const PERSON_CORRECTIONS: Record<string, Correction> = {
  'Rachel Atkinson': {
    add: ['role:leadership', 'role:ceo', 'content:portrait', 'quality:professional'],
    remove: [],
  },
  'Luella Bligh': {
    add: ['role:board-member', 'role:leadership', 'role:chair', 'content:portrait', 'quality:professional'],
    remove: ['board'],
  },
}

;(async () => {
  const { data: photos, error } = await supabase
    .from('media_files')
    .select('id, title, tags, metadata')
    .contains('tags', ['collection:annual-report-2023-24'])
    .order('created_at', { ascending: true })

  if (error || !photos) {
    console.error('Failed to fetch photos:', error)
    process.exit(1)
  }

  console.log(`Found ${photos.length} annual report photos.\n`)

  for (const photo of photos) {
    let tags = [...(photo.tags || [])]
    let changed = false

    // 1. Fix fiscal year tag: year:2024 → fy:2023-24
    if (tags.includes('year:2024')) {
      tags = tags.filter(t => t !== 'year:2024')
      if (!tags.includes('fy:2023-24')) tags.push('fy:2023-24')
      changed = true
    }

    // 2. Person-specific corrections
    const personName = photo.metadata?.person_name as string | undefined
    if (personName && PERSON_CORRECTIONS[personName]) {
      const c = PERSON_CORRECTIONS[personName]
      for (const r of c.remove) {
        if (tags.includes(r)) {
          tags = tags.filter(t => t !== r)
          changed = true
        }
      }
      for (const a of c.add) {
        if (!tags.includes(a)) {
          tags.push(a)
          changed = true
        }
      }
    }

    // 3. Board group photo
    if (photo.title?.includes('Board of Directors')) {
      const boardTags = ['role:board-member', 'content:group-photo', 'quality:professional']
      for (const t of boardTags) {
        if (!tags.includes(t)) { tags.push(t); changed = true }
      }
      if (tags.includes('board')) { tags = tags.filter(t => t !== 'board'); changed = true }
      if (tags.includes('group-photo')) { tags = tags.filter(t => t !== 'group-photo'); changed = true }
    }

    // 4. Service-related tags
    if (photo.title?.includes("Women") && !tags.includes('service:womens-healing')) {
      tags.push('service:womens-healing'); changed = true
    }
    if (photo.title?.includes('Youth') && !tags.includes('service:youth')) {
      tags.push('service:youth'); changed = true
    }
    if ((photo.title?.includes('Deadly Choices') || photo.title?.includes('Health Event')) && !tags.includes('service:health')) {
      tags.push('service:health'); changed = true
    }

    // 5. Content type tags from bare tags
    if (tags.includes('landscape') && !tags.includes('content:landscape')) {
      tags.push('content:landscape'); changed = true
    }
    if (tags.includes('culture') && !tags.includes('content:culture')) {
      tags.push('content:culture'); changed = true
    }
    if (photo.title?.includes('Staff') && !tags.includes('content:group-photo')) {
      tags.push('content:group-photo'); changed = true
    }
    if (photo.title?.includes('Mural') && !tags.includes('content:culture')) {
      tags.push('content:culture'); changed = true
    }

    // Dedupe
    tags = [...new Set(tags)]

    if (changed) {
      const { error: updateError } = await supabase
        .from('media_files')
        .update({ tags })
        .eq('id', photo.id)

      if (updateError) {
        console.error(`  FAILED: ${photo.title} — ${updateError.message}`)
      } else {
        console.log(`  Updated: ${photo.title}`)
        console.log(`    Tags: ${tags.join(', ')}`)
      }
    } else {
      console.log(`  No change: ${photo.title}`)
    }
  }

  console.log('\nDone! Tags aligned with smart folder system.')
  console.log('Board photos now tagged role:board-member → visible in Board Members smart folder.')
})()
