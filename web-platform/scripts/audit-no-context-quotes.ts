import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

async function main() {
  // Get all quotes WITHOUT context_before
  const { data: quotes } = await supabase
    .from('story_quotes')
    .select(`
      id, quote_text,
      stories:story_id (id, title, storyteller_id,
        profiles:storyteller_id (full_name, preferred_name)
      )
    `)
    .is('context_before', null)
    .limit(200)

  // Group by story
  const storyMap = new Map<string, { title: string; storyteller: string; quoteCount: number }>()
  for (const q of quotes || []) {
    const story = q.stories as any
    if (!story) continue
    const key = story.id
    if (!storyMap.has(key)) {
      const p = story.profiles as any
      storyMap.set(key, {
        title: story.title,
        storyteller: p?.preferred_name || p?.full_name || '(no profile)',
        quoteCount: 0
      })
    }
    storyMap.get(key)!.quoteCount++
  }

  console.log('=== Stories with quotes but NO context_before ===')
  console.log(`${storyMap.size} stories, ${quotes?.length} quotes total\n`)
  for (const [id, s] of storyMap) {
    console.log(`  "${s.title}" — storyteller: ${s.storyteller} — ${s.quoteCount} quotes`)
  }

  // Check: do any of these stories have multiple speakers embedded in content?
  // Sample a few story contents for multi-speaker indicators
  const storyIds = [...storyMap.keys()].slice(0, 5)
  for (const sid of storyIds) {
    const { data: story } = await supabase
      .from('stories')
      .select('title, content')
      .eq('id', sid)
      .single()

    if (!story) continue
    // Check for colon-delimited speaker patterns
    const speakerLines = (story.content || '').match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?:/gm) || []
    const uniqueSpeakers = [...new Set(speakerLines)]
    if (uniqueSpeakers.length > 1) {
      console.log(`\n  ⚠️ Multi-speaker detected in "${story.title}": ${uniqueSpeakers.join(', ')}`)
    }
  }
}

main().catch(console.error)
