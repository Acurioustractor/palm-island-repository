import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

async function main() {
  // Find both copies
  const { data } = await supabase
    .from('media_files')
    .select('id, title, rating, tags, deleted_at')
    .ilike('title', '%Young People Helping%')

  if (!data || data.length === 0) {
    console.log('No Descript videos found')
    return
  }

  for (const v of data) {
    console.log(`ID: ${v.id}`)
    console.log(`  rating: ${v.rating}, deleted: ${v.deleted_at}`)
    console.log(`  tags: ${JSON.stringify(v.tags)}`)

    if (v.deleted_at) {
      // Undelete the good one
      console.log('  → Undeleting (restoring deleted_at to null)...')
      const { error } = await supabase
        .from('media_files')
        .update({ deleted_at: null })
        .eq('id', v.id)
      if (error) console.log(`  Error: ${error.message}`)
      else console.log('  ✓ Restored')
    }

    // Ensure correct project tag on both
    const tags = v.tags || []
    const hasProjectTag = tags.includes('project:the-centre-the-station')
    if (!hasProjectTag) {
      const newTags = [...new Set([...tags, 'project:the-centre-the-station'])]
      console.log('  → Adding project tag...')
      const { error } = await supabase
        .from('media_files')
        .update({ tags: newTags, rating: 5 })
        .eq('id', v.id)
      if (error) console.log(`  Error: ${error.message}`)
      else console.log('  ✓ Tagged and rated 5')
    }
  }

  // Verify
  const { data: verify } = await supabase
    .from('media_files')
    .select('id, title, rating, tags, deleted_at')
    .ilike('title', '%Young People Helping%')

  console.log('\n=== After fix ===')
  for (const v of verify || []) {
    console.log(`  "${v.title}" rating=${v.rating} deleted=${v.deleted_at} tags=${JSON.stringify(v.tags?.slice(0, 5))}`)
  }
}

main().catch(console.error)
