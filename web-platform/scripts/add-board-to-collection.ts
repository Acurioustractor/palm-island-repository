import { createClient } from '@supabase/supabase-js'
import { resolve } from 'path'
import { config } from 'dotenv'

config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const BOARD_COLLECTION_ID = 'c499e286-d8af-42eb-8823-4c94a15a453f'

;(async () => {
  // Find board/leadership photos from our annual report upload
  const { data: allPhotos } = await supabase
    .from('media_files')
    .select('id, title, tags')
    .contains('tags', ['collection:annual-report-2023-24'])

  const boardPhotos = (allPhotos || []).filter(p =>
    p.tags?.includes('role:board-member') ||
    p.tags?.includes('role:ceo') ||
    p.tags?.includes('role:chair')
  )

  if (boardPhotos.length === 0) {
    console.log('No board photos found')
    return
  }

  console.log(`Adding ${boardPhotos.length} photos to Board images collection:\n`)

  for (const photo of boardPhotos) {
    const { error } = await supabase.from('collection_items').upsert(
      {
        collection_id: BOARD_COLLECTION_ID,
        media_id: photo.id,
        sort_order: 0,
      },
      { onConflict: 'collection_id,media_id' }
    )

    if (error) {
      console.log(`  FAILED: ${photo.title} — ${error.message}`)
    } else {
      console.log(`  Added: ${photo.title}`)
    }
  }

  // Check updated count
  const { data: col } = await supabase
    .from('photo_collections')
    .select('item_count')
    .eq('id', BOARD_COLLECTION_ID)
    .single()

  console.log(`\nBoard images collection now has ${col?.item_count} items`)
})()
