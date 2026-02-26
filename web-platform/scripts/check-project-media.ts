import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

async function main() {
  // Check all media tagged with this project
  const { data } = await supabase
    .from('media_files')
    .select('id, title, file_type, public_url, file_path, bucket_name, rating, tags')
    .contains('tags', ['project:the-centre-the-station'])
    .is('deleted_at', null)
    .order('rating', { ascending: false, nullsFirst: false })
    .limit(20)

  console.log('=== All media tagged project:the-centre-the-station (ordered by rating DESC) ===')
  for (const m of data || []) {
    console.log(`[${m.file_type}] rating:${m.rating} "${m.title}" url:${(m.public_url || '').slice(0, 100)}`)
  }
  console.log(`Total: ${data?.length}`)

  // Check Descript video specifically
  const { data: descript } = await supabase
    .from('media_files')
    .select('id, title, file_type, public_url, rating, tags')
    .ilike('title', '%Young People Helping%')
    .limit(5)

  console.log('\n=== Descript video ===')
  for (const m of descript || []) {
    console.log(`[${m.file_type}] rating:${m.rating} "${m.title}"`)
    console.log(`  url: ${m.public_url}`)
    console.log(`  tags: ${JSON.stringify(m.tags)}`)
  }
}

main().catch(console.error)
