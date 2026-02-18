import { createClient } from '@supabase/supabase-js'
import { resolve } from 'path'
import { config } from 'dotenv'

config({ path: resolve(__dirname, '../.env.local') })

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
})

;(async () => {
  // Check annual report extractions
  const { data: arPhotos } = await s.from('media_files')
    .select('id, filename, original_filename, file_path, bucket_name')
    .contains('tags', ['collection:annual-report-2023-24']).limit(3)

  console.log('=== Annual report photos ===')
  for (const f of arPhotos || []) {
    console.log(`  filename: ${f.filename}`)
    console.log(`  original_filename: ${f.original_filename}`)
    console.log(`  file_path: ${f.file_path}`)
    console.log(`  ---`)
  }

  // Check GPS-named photos
  const { data: gpsPhotos } = await s.from('media_files')
    .select('id, filename, original_filename, file_path, bucket_name')
    .ilike('original_filename', 'GPS%').limit(3)

  console.log('\n=== GPS-named photos ===')
  for (const f of gpsPhotos || []) {
    console.log(`  filename: ${f.filename}`)
    console.log(`  original_filename: ${f.original_filename}`)
    console.log(`  file_path: ${f.file_path}`)
    console.log(`  ---`)
  }

  // Check IMG_ photos
  const { data: imgPhotos } = await s.from('media_files')
    .select('id, filename, original_filename, file_path, bucket_name')
    .ilike('original_filename', 'IMG_%').limit(3)

  console.log('\n=== IMG_ photos ===')
  for (const f of imgPhotos || []) {
    console.log(`  filename: ${f.filename}`)
    console.log(`  original_filename: ${f.original_filename}`)
    console.log(`  file_path: ${f.file_path}`)
    console.log(`  ---`)
  }
})()
