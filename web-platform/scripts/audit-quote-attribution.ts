import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

async function main() {
  // 1. Check story_quotes schema
  const { data: sample } = await supabase
    .from('story_quotes')
    .select(`
      id, quote_text, themes, impact_score, context_before, speaker_name,
      stories:story_id (id, title, storyteller_id,
        profiles:storyteller_id (full_name, preferred_name)
      )
    `)
    .order('impact_score', { ascending: false, nullsFirst: false })
    .limit(20)

  console.log('=== Top 20 quotes by impact ===')
  for (const q of sample || []) {
    const story = q.stories as any
    const profile = story?.profiles as any
    const storyTeller = profile?.preferred_name || profile?.full_name || '(no profile)'
    const directSpeaker = (q as any).speaker_name || '(no speaker_name column)'
    console.log(`\nQuote: "${(q.quote_text || '').slice(0, 80)}..."`)
    console.log(`  Story: "${story?.title}"`)
    console.log(`  Story storyteller_id profile: ${storyTeller}`)
    console.log(`  Direct speaker_name: ${directSpeaker}`)
    console.log(`  context_before: "${(q.context_before || '').slice(0, 100)}"`)
    console.log(`  themes: ${JSON.stringify(q.themes)}`)
  }

  // 2. Check if speaker_name column exists on story_quotes
  const { data: cols } = await supabase
    .from('story_quotes')
    .select('*')
    .limit(1)

  if (cols && cols.length > 0) {
    console.log('\n=== story_quotes columns ===')
    console.log(Object.keys(cols[0]).join(', '))
  }

  // 3. Count multi-speaker stories (stories with quotes from different speakers)
  const { data: allQuotes } = await supabase
    .from('story_quotes')
    .select('story_id, context_before')
    .not('context_before', 'is', null)
    .limit(500)

  const storyContexts = new Map<string, Set<string>>()
  for (const q of allQuotes || []) {
    if (!q.story_id || !q.context_before) continue
    if (!storyContexts.has(q.story_id)) storyContexts.set(q.story_id, new Set())
    // Extract first word that looks like a name
    const nameMatch = q.context_before.match(/^(?:Aunty|Uncle|Elder\s+)?([A-Z][a-z]+)/)
    if (nameMatch) storyContexts.get(q.story_id)!.add(nameMatch[0])
  }

  const multiSpeaker = [...storyContexts.entries()].filter(([, names]) => names.size > 1)
  console.log(`\n=== Multi-speaker stories: ${multiSpeaker.length} ===`)
  for (const [storyId, names] of multiSpeaker.slice(0, 10)) {
    console.log(`  Story ${storyId}: speakers = ${[...names].join(', ')}`)
  }

  // 4. Check the specific Hull River story
  const { data: hullRiver } = await supabase
    .from('stories')
    .select('id, title, storyteller_id, profiles:storyteller_id (full_name, preferred_name)')
    .ilike('title', '%Hull River%')
    .limit(3)

  console.log('\n=== Hull River stories ===')
  for (const s of hullRiver || []) {
    const p = (s as any).profiles
    console.log(`  "${s.title}" storyteller: ${p?.preferred_name || p?.full_name || '(none)'} (id: ${s.storyteller_id})`)

    // Get all quotes from this story
    const { data: quotes } = await supabase
      .from('story_quotes')
      .select('id, quote_text, context_before')
      .eq('story_id', s.id)

    for (const q of quotes || []) {
      console.log(`    Quote: "${(q.quote_text || '').slice(0, 60)}..."`)
      console.log(`    context_before: "${q.context_before || '(empty)'}"`)
    }
  }
}

main().catch(console.error)
