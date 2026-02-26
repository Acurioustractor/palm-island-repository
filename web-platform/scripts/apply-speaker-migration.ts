import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

async function main() {
  // Check if column exists already
  const { data: existing } = await supabase
    .from('story_quotes')
    .select('*')
    .limit(1)

  if (existing && existing.length > 0 && 'speaker_name' in existing[0]) {
    console.log('speaker_name column already exists')
  } else {
    console.log('speaker_name column does not exist yet — needs to be added via Supabase dashboard SQL editor')
    console.log('Run this SQL:\n')
    console.log('ALTER TABLE story_quotes ADD COLUMN IF NOT EXISTS speaker_name TEXT;')
    console.log('CREATE INDEX IF NOT EXISTS idx_story_quotes_speaker_name ON story_quotes (speaker_name) WHERE speaker_name IS NOT NULL;')
  }
}

main().catch(console.error)
