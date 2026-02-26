import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

async function main() {
  // Exact same query the tool uses
  const projectTag = 'project:the-centre-the-station'

  const { data: videos, error } = await supabase
    .from('media_files')
    .select('id, public_url, file_path, bucket_name, title, alt_text, file_type, rating, tags')
    .contains('tags', [projectTag])
    .eq('file_type', 'video')
    .is('deleted_at', null)
    .order('rating', { ascending: false, nullsFirst: false })
    .limit(4)

  console.log('=== Videos returned by tool query ===')
  console.log(`Error: ${error?.message || 'none'}`)
  console.log(`Count: ${videos?.length || 0}\n`)
  for (const v of videos || []) {
    const url = v.public_url || (v.file_path && v.bucket_name
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${v.bucket_name}/${v.file_path}`
      : null)
    console.log(`  [rating:${v.rating}] "${v.title}"`)
    console.log(`  url: ${url?.slice(0, 100)}`)
    console.log(`  file_type: ${v.file_type}`)
    console.log(`  tags: ${JSON.stringify(v.tags?.slice(0, 5))}`)
    console.log()
  }

  // Now check ALL videos tagged with this project (no limit)
  const { data: allVideos } = await supabase
    .from('media_files')
    .select('id, title, file_type, public_url, rating, tags')
    .contains('tags', [projectTag])
    .eq('file_type', 'video')
    .is('deleted_at', null)
    .order('rating', { ascending: false, nullsFirst: false })

  console.log('=== ALL videos tagged (no limit) ===')
  console.log(`Count: ${allVideos?.length || 0}\n`)
  for (const v of allVideos || []) {
    console.log(`  [rating:${v.rating}] "${v.title}" — ${v.public_url?.slice(0, 80)}`)
  }

  // Check the Descript video specifically
  const { data: descript } = await supabase
    .from('media_files')
    .select('id, title, file_type, public_url, rating, tags, deleted_at')
    .ilike('title', '%Young People Helping%')

  console.log('\n=== Descript video search ===')
  for (const v of descript || []) {
    console.log(`  "${v.title}" file_type=${v.file_type} rating=${v.rating} deleted=${v.deleted_at}`)
    console.log(`  url: ${v.public_url}`)
    console.log(`  tags: ${JSON.stringify(v.tags)}`)
  }
}

main().catch(console.error)
