import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

async function main() {
  // Stories with quote_text set
  const { data: stories } = await supabase
    .from('stories')
    .select('id, title, quote_text, storyteller_id, profiles:storyteller_id (full_name, preferred_name)')
    .not('quote_text', 'is', null)
    .eq('status', 'published')
    .limit(30)

  console.log(`=== Stories with quote_text: ${stories?.length || 0} ===\n`)
  for (const s of stories || []) {
    const p = (s as any).profiles
    const teller = p?.preferred_name || p?.full_name || '(none)'
    console.log(`"${s.title}"`)
    console.log(`  storyteller: ${teller}`)
    console.log(`  quote_text: "${(s.quote_text || '').slice(0, 80)}..."`)
    console.log()
  }

  // Also check: extracted_quotes with profile_id — is profile_id always correct?
  const { data: extracted } = await supabase
    .from('extracted_quotes')
    .select(`
      id, quote_text, attribution, speaker_name,
      profiles:profile_id (full_name, preferred_name)
    `)
    .eq('is_validated', true)
    .limit(20)

  console.log(`\n=== Extracted quotes (validated): ${extracted?.length || 0} ===\n`)
  for (const q of extracted || []) {
    const p = (q as any).profiles
    const profileName = p?.preferred_name || p?.full_name || '(no profile)'
    console.log(`"${(q.quote_text || '').slice(0, 60)}..."`)
    console.log(`  attribution: ${q.attribution}`)
    console.log(`  speaker_name col: ${(q as any).speaker_name || '(null)'}`)
    console.log(`  profile_id name: ${profileName}`)
    const match = q.attribution && profileName !== '(no profile)' &&
      (profileName.includes(q.attribution.split(' ')[0]) || q.attribution.includes(profileName.split(' ')[0]))
    console.log(`  match: ${match ? '✓' : '⚠️ MISMATCH'}`)
    console.log()
  }
}

main().catch(console.error)
