import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function test() {
  // Get one entry
  const { data: entries } = await supabase
    .from('knowledge_entries')
    .select('id, title, embedding')
    .limit(1)

  if (!entries || entries.length === 0) {
    console.log('No entries found')
    return
  }

  const entry = entries[0]
  console.log('Testing with entry:', entry.title)
  console.log('Current embedding:', entry.embedding ? 'EXISTS' : 'NULL')

  // Try to update with a dummy vector (all zeros)
  const dummyEmbedding = Array(1536).fill(0)

  console.log('Attempting update...')
  const { data, error } = await supabase
    .from('knowledge_entries')
    .update({ embedding: dummyEmbedding })
    .eq('id', entry.id)
    .select()

  if (error) {
    console.log('❌ Error updating:', error)
  } else {
    console.log('✅ Update successful')
    console.log('Data returned:', data)
  }

  // Verify
  const { data: verifyData } = await supabase
    .from('knowledge_entries')
    .select('id, title, embedding')
    .eq('id', entry.id)
    .single()

  console.log('Verification - embedding now:', verifyData?.embedding ? 'EXISTS' : 'NULL')
}

test()
