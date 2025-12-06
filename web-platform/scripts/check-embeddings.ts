import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../.env.local') })
import { createClient } from '@supabase/supabase-js'

async function checkEmbeddings() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error, count } = await supabase
    .from('knowledge_entries')
    .select('slug, title, embedding', { count: 'exact' })
    .not('embedding', 'is', null)

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  const { count: totalCount } = await supabase
    .from('knowledge_entries')
    .select('*', { count: 'exact', head: true })

  console.log(`✅ Entries with embeddings: ${count} / ${totalCount}`)
  console.log(`📊 Percentage: ${((count / totalCount) * 100).toFixed(2)}%`)

  // Show last 5 entries
  console.log('\n📄 Last 5 entries with embeddings:')
  data?.slice(-5).forEach((entry, i) => {
    console.log(`  ${i + 1}. ${entry.slug}`)
  })
}

checkEmbeddings().then(() => process.exit(0))
