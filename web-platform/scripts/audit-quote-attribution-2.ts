import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

async function main() {
  // 1. Total quotes
  const { count } = await supabase
    .from('story_quotes')
    .select('id', { count: 'exact', head: true })
  console.log(`Total quotes: ${count}`)

  // 2. Quotes with non-null impact_score
  const { count: withScore } = await supabase
    .from('story_quotes')
    .select('id', { count: 'exact', head: true })
    .not('impact_score', 'is', null)
  console.log(`Quotes with impact_score: ${withScore}`)

  // 3. Quotes with non-null context_before
  const { count: withContext } = await supabase
    .from('story_quotes')
    .select('id', { count: 'exact', head: true })
    .not('context_before', 'is', null)
  console.log(`Quotes with context_before: ${withContext}`)

  // 4. Get ALL quotes and check attribution accuracy
  const { data: allQuotes } = await supabase
    .from('story_quotes')
    .select(`
      id, quote_text, context_before,
      stories:story_id (id, title, storyteller_id,
        profiles:storyteller_id (full_name, preferred_name)
      )
    `)
    .limit(500)

  let misattributed = 0
  let correctlyExtracted = 0
  let noContext = 0
  const misattributedList: any[] = []

  for (const q of allQuotes || []) {
    const story = q.stories as any
    const profile = story?.profiles as any
    const storyTeller = profile?.preferred_name || profile?.full_name || null
    const ctx = q.context_before || ''

    if (!ctx) {
      noContext++
      continue
    }

    // Check if context_before mentions a different speaker than the storyteller
    const nameMatch = ctx.match(/^(?:Aunty|Uncle|Elder\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/)
    if (nameMatch) {
      const extractedName = nameMatch[0]
      // Check if extracted name is different from storyteller
      if (storyTeller && !storyTeller.includes(extractedName.replace(/^(Aunty|Uncle|Elder)\s+/, ''))) {
        misattributed++
        misattributedList.push({
          quote: (q.quote_text || '').slice(0, 60),
          storyTeller,
          actualSpeaker: extractedName,
          storyTitle: story?.title,
          context: ctx,
        })
      } else {
        correctlyExtracted++
      }
    }
  }

  console.log(`\n=== Attribution Analysis ===`)
  console.log(`Correct (speaker = storyteller): ${correctlyExtracted}`)
  console.log(`Misattributed (different speaker in context): ${misattributed}`)
  console.log(`No context_before: ${noContext}`)

  console.log(`\n=== Misattributed quotes ===`)
  for (const m of misattributedList.slice(0, 20)) {
    console.log(`\n  Story: "${m.storyTitle}"`)
    console.log(`  Story storyteller: ${m.storyTeller}`)
    console.log(`  Actual speaker: ${m.actualSpeaker}`)
    console.log(`  context: "${m.context}"`)
    console.log(`  Quote: "${m.quote}..."`)
  }

  // 5. Check if there are profiles for the actual speakers
  const uniqueSpeakers = [...new Set(misattributedList.map(m => m.actualSpeaker))]
  console.log(`\n=== Unique misattributed speakers (${uniqueSpeakers.length}) ===`)
  for (const name of uniqueSpeakers) {
    const cleanName = name.replace(/^(Aunty|Uncle|Elder)\s+/, '')
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, preferred_name, profile_image_url')
      .or(`full_name.ilike.%${cleanName}%,preferred_name.ilike.%${cleanName}%`)
      .limit(3)

    console.log(`  ${name}: ${profiles?.length ? profiles.map(p => `${p.preferred_name || p.full_name} (img: ${p.profile_image_url ? 'yes' : 'no'})`).join(', ') : 'NO PROFILE FOUND'}`)
  }
}

main().catch(console.error)
