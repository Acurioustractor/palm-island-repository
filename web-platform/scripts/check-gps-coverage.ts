import { createClient } from '@supabase/supabase-js'
import { resolve } from 'path'
import { config } from 'dotenv'

config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

;(async () => {
  const { count: total } = await supabase
    .from('media_files').select('id', { count: 'exact', head: true })
    .eq('file_type', 'image').is('deleted_at', null)

  const { count: withGps } = await supabase
    .from('media_files').select('id', { count: 'exact', head: true })
    .eq('file_type', 'image').is('deleted_at', null).not('latitude', 'is', null)

  const { data: gpsPhotos } = await supabase
    .from('media_files').select('title, latitude, longitude, tags')
    .eq('file_type', 'image').is('deleted_at', null).not('latitude', 'is', null)
    .limit(20)

  console.log(`Total images: ${total}`)
  console.log(`With GPS: ${withGps}`)
  console.log(`Without GPS: ${(total || 0) - (withGps || 0)}`)

  if (gpsPhotos && gpsPhotos.length > 0) {
    console.log(`\nSample geotagged photos:`)
    for (const p of gpsPhotos) {
      console.log(`  ${p.title} → ${p.latitude?.toFixed(6)}, ${p.longitude?.toFixed(6)}`)
    }
  }
})()
