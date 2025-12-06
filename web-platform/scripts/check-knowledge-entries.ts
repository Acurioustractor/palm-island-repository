/**
 * Quick diagnostic script to check knowledge_entries table
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkKnowledgeEntries() {
  console.log('🔍 Checking knowledge_entries table...\n')

  // Check all entries
  const { data: allEntries, error: allError } = await supabase
    .from('knowledge_entries')
    .select('slug, entry_type, fiscal_year, title')
    .order('created_at', { ascending: false })
    .limit(20)

  if (allError) {
    console.error('❌ Error fetching all entries:', allError)
    return
  }

  console.log(`📊 Total entries in last 20: ${allEntries?.length || 0}`)
  if (allEntries && allEntries.length > 0) {
    console.log('\nRecent entries:')
    allEntries.forEach((entry, i) => {
      console.log(`  ${i + 1}. ${entry.slug}`)
      console.log(`     Type: ${entry.entry_type || 'NULL'}`)
      console.log(`     Year: ${entry.fiscal_year || 'NULL'}`)
      console.log(`     Title: ${entry.title || 'NULL'}`)
      console.log('')
    })
  }

  // Check specifically for annual-report entries
  const { data: reportEntries, error: reportError } = await supabase
    .from('knowledge_entries')
    .select('*')
    .eq('entry_type', 'annual-report')

  if (reportError) {
    console.error('❌ Error fetching annual-report entries:', reportError)
    return
  }

  console.log(`\n📅 Annual report entries found: ${reportEntries?.length || 0}`)
  if (reportEntries && reportEntries.length > 0) {
    reportEntries.forEach((entry) => {
      console.log(`  - ${entry.fiscal_year}: ${entry.title}`)
    })
  }

  // Check entries containing "annual" in slug
  const { data: annualEntries, error: annualError } = await supabase
    .from('knowledge_entries')
    .select('slug, entry_type, fiscal_year')
    .ilike('slug', '%annual%')

  if (annualError) {
    console.error('❌ Error fetching entries with "annual" in slug:', annualError)
    return
  }

  console.log(`\n🔎 Entries with "annual" in slug: ${annualEntries?.length || 0}`)
  if (annualEntries && annualEntries.length > 0) {
    annualEntries.forEach((entry) => {
      console.log(`  - ${entry.slug} (type: ${entry.entry_type}, year: ${entry.fiscal_year})`)
    })
  }

  // Check distinct entry_types
  const { data: types, error: typesError } = await supabase
    .from('knowledge_entries')
    .select('entry_type')

  if (typesError) {
    console.error('❌ Error fetching entry types:', typesError)
    return
  }

  const uniqueTypes = [...new Set(types?.map(t => t.entry_type).filter(Boolean))]
  console.log(`\n📋 Distinct entry_types in database: ${uniqueTypes.length}`)
  uniqueTypes.forEach((type) => {
    console.log(`  - ${type}`)
  })
}

checkKnowledgeEntries()
  .then(() => {
    console.log('\n✅ Check complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
