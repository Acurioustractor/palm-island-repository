/**
 * Audit Supabase AI/LLM/Embedding Setup
 * Checks current configuration and health
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const openaiKey = process.env.OPENAI_API_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function auditAISetup() {
  console.log('🔍 SUPABASE AI/LLM/EMBEDDING AUDIT')
  console.log('='.repeat(60))
  console.log()

  // 1. Check pgvector extension
  console.log('📦 1. PGVECTOR EXTENSION')
  console.log('-'.repeat(60))

  // Check if embedding column is accessible
  const { data: vectorCheck, error: vectorError } = await supabase
    .from('knowledge_entries')
    .select('embedding')
    .limit(1)

  if (vectorError) {
    console.log('⚠️  Cannot query embedding column:', vectorError.message)
    console.log('   pgvector may not be enabled')
  } else {
    console.log('✅ pgvector is enabled (embedding column accessible)')
  }

  // 2. Check knowledge_entries table structure
  console.log('\n📊 2. KNOWLEDGE_ENTRIES TABLE')
  console.log('-'.repeat(60))

  const { data: entries, error: entriesError } = await supabase
    .from('knowledge_entries')
    .select('*')
    .limit(1)

  if (entriesError) {
    console.log('❌ Error accessing knowledge_entries:', entriesError.message)
  } else if (entries && entries.length > 0) {
    console.log('✅ Table exists and is accessible')
    console.log('\nColumns found:')
    Object.keys(entries[0]).forEach(col => {
      const value = entries[0][col]
      const type = Array.isArray(value) ? 'array' : typeof value
      console.log(`   - ${col}: ${type}`)
    })
  } else {
    console.log('⚠️  Table exists but is empty')
  }

  // 3. Check embedding statistics
  console.log('\n🧮 3. EMBEDDING STATISTICS')
  console.log('-'.repeat(60))

  const { data: totalEntries, error: countError } = await supabase
    .from('knowledge_entries')
    .select('id', { count: 'exact', head: true })

  if (!countError) {
    console.log(`Total knowledge entries: ${totalEntries?.length || 0}`)
  }

  const { data: withEmbeddings, error: embeddingCountError } = await supabase
    .from('knowledge_entries')
    .select('id', { count: 'exact', head: true })
    .not('embedding', 'is', null)

  if (!embeddingCountError) {
    console.log(`Entries with embeddings: ${withEmbeddings?.length || 0}`)
  }

  // Check by entry type
  const { data: byType, error: typeError } = await supabase
    .from('knowledge_entries')
    .select('entry_type, embedding')
    .not('embedding', 'is', null)

  if (!typeError && byType) {
    const typeCounts = byType.reduce((acc: any, entry: any) => {
      acc[entry.entry_type] = (acc[entry.entry_type] || 0) + 1
      return acc
    }, {})

    console.log('\nEntries with embeddings by type:')
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}`)
    })
  }

  // 4. Check vector search function
  console.log('\n🔎 4. VECTOR SEARCH FUNCTION')
  console.log('-'.repeat(60))

  // Try to call match_knowledge function
  const testVector = Array(1536).fill(0) // OpenAI embedding size
  let searchResult = null
  let searchError = null

  try {
    const result = await supabase.rpc('match_knowledge', {
      query_embedding: testVector,
      match_threshold: 0.5,
      match_count: 1
    })
    searchResult = result.data
    searchError = result.error
  } catch (err: any) {
    searchError = err
  }

  if (searchError) {
    console.log('❌ match_knowledge function error:', searchError.message)
    console.log('   Vector search function may not be set up')
  } else {
    console.log('✅ match_knowledge function is working')
    console.log(`   Returned ${searchResult?.length || 0} results`)
  }

  // 5. Check OpenAI API key configuration
  console.log('\n🔑 5. OPENAI API CONFIGURATION')
  console.log('-'.repeat(60))

  if (openaiKey) {
    console.log('✅ OPENAI_API_KEY is configured')
    console.log(`   Key: ${openaiKey.substring(0, 10)}...${openaiKey.substring(openaiKey.length - 4)}`)
  } else {
    console.log('❌ OPENAI_API_KEY is not configured')
  }

  // 6. Check API routes
  console.log('\n🌐 6. API ROUTES')
  console.log('-'.repeat(60))

  const apiRoutes = [
    '/api/knowledge/search',
    '/api/knowledge/timeline',
    '/api/knowledge/annual-reports',
  ]

  for (const route of apiRoutes) {
    try {
      const response = await fetch(`http://localhost:3000${route}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })
      if (response.ok) {
        console.log(`✅ ${route} - ${response.status} OK`)
      } else {
        console.log(`⚠️  ${route} - ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.log(`❌ ${route} - Not accessible (server may not be running)`)
    }
  }

  // 7. Check recent migrations
  console.log('\n📋 7. RECENT DATABASE SCHEMA')
  console.log('-'.repeat(60))

  // Check tables (skipping information_schema check as it may not be accessible)

  // List key tables
  const keyTables = [
    'knowledge_entries',
    'media_files',
    'photo_collections',
    'smart_folders',
    'collection_items'
  ]

  console.log('Key tables:')
  for (const table of keyTables) {
    const { data, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })

    if (!error) {
      console.log(`   ✅ ${table} (exists)`)
    } else {
      console.log(`   ❌ ${table} (not found)`)
    }
  }

  // 8. Sample embedding data
  console.log('\n🔬 8. SAMPLE EMBEDDING DATA')
  console.log('-'.repeat(60))

  const { data: sampleEntry, error: sampleError } = await supabase
    .from('knowledge_entries')
    .select('slug, title, entry_type, embedding')
    .not('embedding', 'is', null)
    .limit(1)
    .single()

  if (!sampleError && sampleEntry) {
    console.log('Sample entry with embedding:')
    console.log(`   Slug: ${sampleEntry.slug}`)
    console.log(`   Title: ${sampleEntry.title}`)
    console.log(`   Type: ${sampleEntry.entry_type}`)
    if (sampleEntry.embedding) {
      const embeddingArray = Array.isArray(sampleEntry.embedding)
        ? sampleEntry.embedding
        : JSON.parse(sampleEntry.embedding as any)
      console.log(`   Embedding dimensions: ${embeddingArray?.length || 'unknown'}`)
      console.log(`   First 5 values: [${embeddingArray?.slice(0, 5).join(', ')}...]`)
    }
  } else {
    console.log('⚠️  No entries with embeddings found')
  }

  // 9. Health summary
  console.log('\n\n🏥 HEALTH SUMMARY')
  console.log('='.repeat(60))

  const health = {
    pgvectorEnabled: !vectorError,
    knowledgeTableExists: !entriesError,
    hasEmbeddings: (withEmbeddings?.length || 0) > 0,
    vectorSearchWorks: !searchError,
    openaiConfigured: !!openaiKey,
    totalEntries: totalEntries?.length || 0,
    entriesWithEmbeddings: withEmbeddings?.length || 0
  }

  console.log('\n✅ Working:')
  if (health.pgvectorEnabled) console.log('   - pgvector extension')
  if (health.knowledgeTableExists) console.log('   - knowledge_entries table')
  if (health.hasEmbeddings) console.log(`   - ${health.entriesWithEmbeddings} entries with embeddings`)
  if (health.vectorSearchWorks) console.log('   - Vector search function')
  if (health.openaiConfigured) console.log('   - OpenAI API key')

  console.log('\n⚠️  Issues:')
  const issues = []
  if (!health.pgvectorEnabled) issues.push('pgvector extension not enabled')
  if (!health.knowledgeTableExists) issues.push('knowledge_entries table missing')
  if (!health.hasEmbeddings) issues.push('No embeddings found')
  if (!health.vectorSearchWorks) issues.push('Vector search function not working')
  if (!health.openaiConfigured) issues.push('OpenAI API key not configured')

  if (issues.length === 0) {
    console.log('   None! Everything looks good 🎉')
  } else {
    issues.forEach(issue => console.log(`   - ${issue}`))
  }

  // 10. Next steps
  console.log('\n\n🚀 NEXT STEPS')
  console.log('='.repeat(60))

  if (!health.pgvectorEnabled) {
    console.log('\n1. Enable pgvector extension:')
    console.log('   Run: CREATE EXTENSION vector;')
  }

  if (!health.vectorSearchWorks) {
    console.log('\n2. Create vector search function:')
    console.log('   Run migration: 06_enable_vector_embeddings.sql')
  }

  if (health.totalEntries > health.entriesWithEmbeddings) {
    const missing = health.totalEntries - health.entriesWithEmbeddings
    console.log(`\n3. Generate embeddings for ${missing} entries without them`)
    console.log('   Create script to batch process entries and call OpenAI API')
  }

  if (!health.openaiConfigured) {
    console.log('\n4. Configure OpenAI API key:')
    console.log('   Add OPENAI_API_KEY to .env.local')
  }

  console.log('\n5. Consider implementing:')
  console.log('   - Automatic embedding generation on content creation')
  console.log('   - RAG (Retrieval Augmented Generation) for Q&A')
  console.log('   - Semantic search interface for annual reports')
  console.log('   - Related content suggestions')
  console.log('   - Content summarization')

  console.log('\n')
}

auditAISetup()
  .then(() => {
    console.log('✅ Audit complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
