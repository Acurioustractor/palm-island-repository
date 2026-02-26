import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Extract speaker name from context_before text
function extractSpeaker(ctx: string): string | null {
  if (!ctx) return null

  // "An Elder on..." or "An Elder shared..."
  if (/^An Elder\b/i.test(ctx)) return 'An Elder'

  // "Aunty Ethel on..." / "Uncle Frank said..."
  const honorificMatch = ctx.match(/^(Aunty|Uncle|Elder)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/)
  if (honorificMatch) return `${honorificMatch[1]} ${honorificMatch[2]}`

  // "Allan Palm Island explained..."
  const fullNameMatch = ctx.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?))\s+(?:on|said|described|reflected|explained|recalled|shared|spoke|talked|stood|honoured)/)
  if (fullNameMatch) return fullNameMatch[1]

  // "Winni stood on..." / "Cyndel described..."
  const firstNameMatch = ctx.match(/^([A-Z][a-z]{2,})\s+(?:on|said|described|reflected|explained|recalled|shared|spoke|talked|stood|honoured)/)
  if (firstNameMatch) return firstNameMatch[1]

  // "Name:" pattern
  const colonMatch = ctx.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*:/)
  if (colonMatch) return colonMatch[1]

  return null
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')

  // 1. Add speaker_name column if it doesn't exist
  if (!dryRun) {
    console.log('Adding speaker_name column to story_quotes...')
    const { error: colError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE story_quotes ADD COLUMN IF NOT EXISTS speaker_name TEXT;`
    }).single()

    // If rpc doesn't exist, try raw — this is expected to fail gracefully
    if (colError) {
      console.log('Note: Could not add column via RPC. May need migration. Continuing with existing schema...')
    }
  }

  // 2. Get all quotes with context_before
  const { data: withContext } = await supabase
    .from('story_quotes')
    .select(`
      id, quote_text, context_before,
      stories:story_id (id, title, storyteller_id,
        profiles:storyteller_id (full_name, preferred_name)
      )
    `)
    .not('context_before', 'is', null)

  console.log(`\n=== Quotes with context_before: ${withContext?.length || 0} ===`)
  const updates: { id: string; speaker_name: string }[] = []

  for (const q of withContext || []) {
    const story = q.stories as any
    const profile = story?.profiles as any
    const storyTeller = profile?.preferred_name || profile?.full_name || null
    const extracted = extractSpeaker(q.context_before || '')

    console.log(`  "${(q.quote_text || '').slice(0, 50)}..."`)
    console.log(`    context: "${q.context_before}"`)
    console.log(`    extracted speaker: ${extracted}`)
    console.log(`    story storyteller: ${storyTeller}`)
    console.log(`    ${extracted && extracted !== storyTeller ? '⚠️ DIFFERENT' : '✓ MATCH'}`)

    if (extracted) {
      updates.push({ id: q.id, speaker_name: extracted })
    }
  }

  // 3. Get quotes WITHOUT context — try to extract from story title vs storyteller
  const { data: noContext } = await supabase
    .from('story_quotes')
    .select(`
      id, quote_text,
      stories:story_id (id, title, storyteller_id,
        profiles:storyteller_id (full_name, preferred_name)
      )
    `)
    .is('context_before', null)

  console.log(`\n=== Quotes without context_before: ${noContext?.length || 0} ===`)
  let suspicious = 0

  for (const q of noContext || []) {
    const story = q.stories as any
    const profile = story?.profiles as any
    const storyTeller = profile?.preferred_name || profile?.full_name || null

    if (storyTeller) {
      updates.push({ id: q.id, speaker_name: storyTeller })
    }

    // Check if story title mentions someone different from storyteller
    const title = story?.title || ''
    const titleNameMatch = title.match(/^(?:Elder\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?):/) ||
      title.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?(?:\s+[A-Z][a-z]+)?):/i)
    if (titleNameMatch && storyTeller) {
      const titleName = titleNameMatch[1]
      if (!storyTeller.includes(titleName.split(' ')[0]) && !titleName.includes(storyTeller.split(' ')[0])) {
        console.log(`  ⚠️ Suspicious: "${title}" storyteller=${storyTeller}, title person=${titleName}`)
        suspicious++
      }
    }
  }

  console.log(`\nSuspicious mismatches: ${suspicious}`)
  console.log(`Total updates to apply: ${updates.length}`)

  if (dryRun) {
    console.log('\n[DRY RUN] No changes applied. Run without --dry-run to apply.')
    return
  }

  // 4. Apply speaker_name updates
  let applied = 0
  let errors = 0
  for (const u of updates) {
    const { error } = await supabase
      .from('story_quotes')
      .update({ speaker_name: u.speaker_name } as any)
      .eq('id', u.id)

    if (error) {
      // Column might not exist yet
      if (errors === 0) console.log(`Error updating: ${error.message}`)
      errors++
    } else {
      applied++
    }
  }

  console.log(`\nApplied ${applied} speaker_name updates (${errors} errors)`)
}

main().catch(console.error)
