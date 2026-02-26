import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

async function main() {
  // Get all published stories with quote_text and check title vs storyteller
  const { data: stories } = await supabase
    .from('stories')
    .select('id, title, quote_text, storyteller_id, profiles:storyteller_id (full_name, preferred_name)')
    .not('quote_text', 'is', null)
    .eq('status', 'published')
    .limit(50)

  console.log('=== Stories where title person ≠ storyteller ===\n')
  const mismatches: any[] = []

  for (const s of stories || []) {
    const p = (s as any).profiles
    const teller = p?.preferred_name || p?.full_name || ''

    // Extract person from title — patterns like "Elder X:", "X Y:", "X:"
    const titleMatch = s.title.match(/^(?:Elder\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?))\s*[:\-–—]/)
    if (!titleMatch) continue

    const titlePerson = titleMatch[1]
    const tellerFirst = teller.replace(/^(Aunty|Uncle|Elder)\s+/, '').split(' ')[0]
    const titleFirst = titlePerson.replace(/^(Aunty|Uncle|Elder)\s+/, '').split(' ')[0]

    // Check if they match
    if (tellerFirst && titleFirst && tellerFirst !== titleFirst && !teller.includes(titleFirst) && !titlePerson.includes(tellerFirst)) {
      mismatches.push({
        title: s.title,
        titlePerson,
        storyteller: teller,
        quote: (s.quote_text || '').slice(0, 80),
        storyId: s.id,
      })
    }
  }

  console.log(`Found ${mismatches.length} mismatches:\n`)
  for (const m of mismatches) {
    console.log(`  STORY: "${m.title}"`)
    console.log(`  Title person: ${m.titlePerson}`)
    console.log(`  Storyteller: ${m.storyteller}`)
    console.log(`  Quote (currently attributed to ${m.storyteller}): "${m.quote}..."`)
    console.log(`  Story ID: ${m.storyId}`)
    console.log()
  }
}

main().catch(console.error)
