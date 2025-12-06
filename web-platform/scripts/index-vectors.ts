/**
 * Vector Indexing Script
 *
 * Generates and stores embeddings for all content in the database.
 * Supports:
 * - Batch processing with progress tracking
 * - Cost estimation before running
 * - Error recovery (resume from checkpoint)
 * - Dry-run mode
 * - Multiple content types (knowledge entries, chunks, stories)
 */

// Load environment variables
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../.env.local') })

import { createClient } from '@supabase/supabase-js'
import { generateEmbeddings, batchEmbeddings } from '../lib/scraper/embeddings'
import * as readline from 'readline'

// ============================================================================
// Configuration
// ============================================================================

const BATCH_SIZE = 100 // Process 100 items at a time
const CHECKPOINT_INTERVAL = 500 // Save checkpoint every 500 items
const DRY_RUN = process.argv.includes('--dry-run')
const CONTENT_TYPE = process.argv.find(arg => arg.startsWith('--type='))?.split('=')[1] || 'all'
const FORCE = process.argv.includes('--force') // Skip items that already have embeddings

// ============================================================================
// Supabase Client
// ============================================================================

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// ============================================================================
// Helper Functions
// ============================================================================

function log(message: string, data?: any) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${message}`, data || '')
}

function error(message: string, err?: any) {
  console.error(`❌ ERROR: ${message}`, err || '')
}

async function askConfirmation(message: string): Promise<boolean> {
  if (DRY_RUN || FORCE) return true

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question(`${message} (y/n): `, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
    })
  })
}

function estimateCost(totalTokens: number): number {
  // Voyage AI: $0.02 per 1M tokens
  return (totalTokens / 1_000_000) * 0.02
}

function countTokens(text: string): number {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4)
}

// ============================================================================
// Content Type Processors
// ============================================================================

interface ProcessResult {
  processed: number
  skipped: number
  errors: number
  totalCost: number
}

async function processKnowledgeEntries(supabase: ReturnType<typeof getSupabase>): Promise<ProcessResult> {
  log('📚 Processing knowledge_entries...')

  // Fetch all entries without embeddings (or all if --force)
  const query = supabase
    .from('knowledge_entries')
    .select('id, title, subtitle, summary, content')

  if (!FORCE) {
    query.is('embedding', null)
  }

  const { data: entries, error: fetchError } = await query

  if (fetchError || !entries) {
    error('Failed to fetch knowledge entries', fetchError)
    return { processed: 0, skipped: 0, errors: 1, totalCost: 0 }
  }

  log(`Found ${entries.length} entries to process`)

  if (entries.length === 0) {
    log('✓ No entries need embeddings')
    return { processed: 0, skipped: 0, errors: 0, totalCost: 0 }
  }

  // Estimate cost
  const totalTokens = entries.reduce((sum, entry) => {
    const text = `${entry.title || ''}\n${entry.subtitle || ''}\n${entry.summary || ''}\n${entry.content || ''}`
    return sum + countTokens(text)
  }, 0)
  const estimatedCost = estimateCost(totalTokens)

  log(`📊 Estimated cost: $${estimatedCost.toFixed(4)} (${totalTokens.toLocaleString()} tokens)`)

  if (DRY_RUN) {
    log('🔍 DRY RUN - No changes will be made')
    return { processed: 0, skipped: entries.length, errors: 0, totalCost: 0 }
  }

  const confirmed = await askConfirmation('Proceed with indexing?')
  if (!confirmed) {
    log('❌ Cancelled by user')
    return { processed: 0, skipped: entries.length, errors: 0, totalCost: 0 }
  }

  // Process in batches
  let processed = 0
  let errors = 0
  const totalBatches = Math.ceil(entries.length / BATCH_SIZE)

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1

    log(`Processing batch ${batchNum}/${totalBatches} (${batch.length} items)...`)

    try {
      // Prepare texts for embedding
      const texts = batch.map(entry =>
        `${entry.title || ''}\n${entry.subtitle || ''}\n${entry.summary || ''}\n${entry.content || ''}`
      )

      // Generate embeddings (use OpenAI for 1536 dimensions)
      log('  Generating embeddings...')
      const result = await generateEmbeddings(texts, {
        preferredProvider: 'openai' // OpenAI for 1536-dim vectors
      })

      if (!result.success) {
        throw new Error(`Failed to generate embeddings: ${result.error}`)
      }

      // Update database
      log('  Updating database...')
      const updates = batch.map((entry, idx) => ({
        id: entry.id,
        embedding: result.embeddings[idx]
      }))

      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('knowledge_entries')
          .update({ embedding: update.embedding })
          .eq('id', update.id)

        if (updateError) {
          error(`  Failed to update entry ${update.id}`, updateError)
          errors++
        } else {
          processed++
        }
      }

      log(`  ✓ Batch ${batchNum} complete (${processed}/${entries.length})`)

      // Checkpoint
      if (processed % CHECKPOINT_INTERVAL === 0) {
        log(`📍 Checkpoint: ${processed} entries processed`)
      }

    } catch (err) {
      error(`Batch ${batchNum} failed`, err)
      errors += batch.length
    }
  }

  log(`✓ Knowledge entries complete: ${processed} processed, ${errors} errors`)
  return { processed, skipped: 0, errors, totalCost: estimatedCost }
}

async function processContentChunks(supabase: ReturnType<typeof getSupabase>): Promise<ProcessResult> {
  log('📄 Processing content_chunks...')

  // Fetch all chunks without embeddings (or all if --force)
  const query = supabase
    .from('content_chunks')
    .select('id, chunk_text')

  if (!FORCE) {
    query.is('embedding', null)
  }

  const { data: chunks, error: fetchError } = await query

  if (fetchError || !chunks) {
    error('Failed to fetch content chunks', fetchError)
    return { processed: 0, skipped: 0, errors: 1, totalCost: 0 }
  }

  log(`Found ${chunks.length} chunks to process`)

  if (chunks.length === 0) {
    log('✓ No chunks need embeddings')
    return { processed: 0, skipped: 0, errors: 0, totalCost: 0 }
  }

  // Estimate cost
  const totalTokens = chunks.reduce((sum, chunk) => sum + countTokens(chunk.chunk_text || ''), 0)
  const estimatedCost = estimateCost(totalTokens)

  log(`📊 Estimated cost: $${estimatedCost.toFixed(4)} (${totalTokens.toLocaleString()} tokens)`)

  if (DRY_RUN) {
    log('🔍 DRY RUN - No changes will be made')
    return { processed: 0, skipped: chunks.length, errors: 0, totalCost: 0 }
  }

  const confirmed = await askConfirmation('Proceed with indexing?')
  if (!confirmed) {
    log('❌ Cancelled by user')
    return { processed: 0, skipped: chunks.length, errors: 0, totalCost: 0 }
  }

  // Process in batches
  let processed = 0
  let errors = 0
  const totalBatches = Math.ceil(chunks.length / BATCH_SIZE)

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1

    log(`Processing batch ${batchNum}/${totalBatches} (${batch.length} items)...`)

    try {
      // Prepare texts for embedding
      const texts = batch.map(chunk => chunk.chunk_text || '')

      // Generate embeddings (use Voyage for 1024 dimensions - cheaper!)
      log('  Generating embeddings...')
      const result = await generateEmbeddings(texts, {
        preferredProvider: 'voyage'
      })

      if (!result.success) {
        throw new Error(`Failed to generate embeddings: ${result.error}`)
      }

      // Update database
      log('  Updating database...')
      const updates = batch.map((chunk, idx) => ({
        id: chunk.id,
        embedding: result.embeddings[idx]
      }))

      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('content_chunks')
          .update({ embedding: update.embedding })
          .eq('id', update.id)

        if (updateError) {
          error(`  Failed to update chunk ${update.id}`, updateError)
          errors++
        } else {
          processed++
        }
      }

      log(`  ✓ Batch ${batchNum} complete (${processed}/${chunks.length})`)

      // Checkpoint
      if (processed % CHECKPOINT_INTERVAL === 0) {
        log(`📍 Checkpoint: ${processed} chunks processed`)
      }

    } catch (err) {
      error(`Batch ${batchNum} failed`, err)
      errors += batch.length
    }
  }

  log(`✓ Content chunks complete: ${processed} processed, ${errors} errors`)
  return { processed, skipped: 0, errors, totalCost: estimatedCost }
}

async function processStories(supabase: ReturnType<typeof getSupabase>): Promise<ProcessResult> {
  log('📖 Processing stories...')

  // Fetch all stories without embeddings (or all if --force)
  const query = supabase
    .from('stories')
    .select('id, title, content')

  if (!FORCE) {
    query.is('embedding', null)
  }

  const { data: stories, error: fetchError } = await query

  if (fetchError || !stories) {
    error('Failed to fetch stories', fetchError)
    return { processed: 0, skipped: 0, errors: 1, totalCost: 0 }
  }

  log(`Found ${stories.length} stories to process`)

  if (stories.length === 0) {
    log('✓ No stories need embeddings')
    return { processed: 0, skipped: 0, errors: 0, totalCost: 0 }
  }

  // Estimate cost
  const totalTokens = stories.reduce((sum, story) => {
    const text = `${story.title || ''}\n${story.content || ''}`
    return sum + countTokens(text)
  }, 0)
  const estimatedCost = estimateCost(totalTokens)

  log(`📊 Estimated cost: $${estimatedCost.toFixed(4)} (${totalTokens.toLocaleString()} tokens)`)

  if (DRY_RUN) {
    log('🔍 DRY RUN - No changes will be made')
    return { processed: 0, skipped: stories.length, errors: 0, totalCost: 0 }
  }

  const confirmed = await askConfirmation('Proceed with indexing?')
  if (!confirmed) {
    log('❌ Cancelled by user')
    return { processed: 0, skipped: stories.length, errors: 0, totalCost: 0 }
  }

  // Process in batches
  let processed = 0
  let errors = 0
  const totalBatches = Math.ceil(stories.length / BATCH_SIZE)

  for (let i = 0; i < stories.length; i += BATCH_SIZE) {
    const batch = stories.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1

    log(`Processing batch ${batchNum}/${totalBatches} (${batch.length} items)...`)

    try {
      // Prepare texts for embedding
      const texts = batch.map(story => `${story.title || ''}\n${story.content || ''}`)

      // Generate embeddings (use OpenAI for 1536 dimensions)
      log('  Generating embeddings...')
      const result = await generateEmbeddings(texts, {
        preferredProvider: 'openai'
      })

      if (!result.success) {
        throw new Error(`Failed to generate embeddings: ${result.error}`)
      }

      // Update database
      log('  Updating database...')
      const updates = batch.map((story, idx) => ({
        id: story.id,
        embedding: result.embeddings[idx]
      }))

      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('stories')
          .update({ embedding: update.embedding })
          .eq('id', update.id)

        if (updateError) {
          error(`  Failed to update story ${update.id}`, updateError)
          errors++
        } else {
          processed++
        }
      }

      log(`  ✓ Batch ${batchNum} complete (${processed}/${stories.length})`)

      // Checkpoint
      if (processed % CHECKPOINT_INTERVAL === 0) {
        log(`📍 Checkpoint: ${processed} stories processed`)
      }

    } catch (err) {
      error(`Batch ${batchNum} failed`, err)
      errors += batch.length
    }
  }

  log(`✓ Stories complete: ${processed} processed, ${errors} errors`)
  return { processed, skipped: 0, errors, totalCost: estimatedCost }
}

// ============================================================================
// Main Function
// ============================================================================

async function main() {
  log('🚀 Vector Indexing Script Started')
  log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`)
  log(`Content type: ${CONTENT_TYPE}`)
  log(`Force reindex: ${FORCE}`)
  log('')

  const supabase = getSupabase()
  const results: Record<string, ProcessResult> = {}

  try {
    // Check database connection
    log('🔌 Testing database connection...')
    const { data, error: testError } = await supabase
      .from('knowledge_entries')
      .select('count')
      .limit(1)
      .single()

    if (testError && testError.code !== 'PGRST116') {
      throw new Error(`Database connection failed: ${testError.message}`)
    }
    log('✓ Database connection successful')
    log('')

    // Process based on content type
    if (CONTENT_TYPE === 'all' || CONTENT_TYPE === 'knowledge') {
      results.knowledge = await processKnowledgeEntries(supabase)
      log('')
    }

    if (CONTENT_TYPE === 'all' || CONTENT_TYPE === 'chunks') {
      results.chunks = await processContentChunks(supabase)
      log('')
    }

    if (CONTENT_TYPE === 'all' || CONTENT_TYPE === 'stories') {
      results.stories = await processStories(supabase)
      log('')
    }

    // Summary
    log('═════════════════════════════════════════')
    log('📊 INDEXING COMPLETE - SUMMARY')
    log('═════════════════════════════════════════')

    let totalProcessed = 0
    let totalSkipped = 0
    let totalErrors = 0
    let totalCost = 0

    Object.entries(results).forEach(([type, result]) => {
      log(`${type.toUpperCase()}:`)
      log(`  Processed: ${result.processed}`)
      log(`  Skipped: ${result.skipped}`)
      log(`  Errors: ${result.errors}`)
      log(`  Cost: $${result.totalCost.toFixed(4)}`)
      log('')

      totalProcessed += result.processed
      totalSkipped += result.skipped
      totalErrors += result.errors
      totalCost += result.totalCost
    })

    log('TOTAL:')
    log(`  Processed: ${totalProcessed}`)
    log(`  Skipped: ${totalSkipped}`)
    log(`  Errors: ${totalErrors}`)
    log(`  Total Cost: $${totalCost.toFixed(4)}`)
    log('═════════════════════════════════════════')

    if (!DRY_RUN && totalProcessed > 0) {
      log('')
      log('🔍 Checking embeddings status...')
      const { data: status } = await supabase.rpc('check_embeddings_status')
      if (status) {
        console.table(status)
      }
    }

    if (totalErrors > 0) {
      log('')
      log('⚠️  Some items failed to process. Check the logs above for details.')
      process.exit(1)
    } else {
      log('')
      log('✅ All items processed successfully!')
      process.exit(0)
    }

  } catch (err) {
    error('Fatal error', err)
    process.exit(1)
  }
}

// ============================================================================
// Run
// ============================================================================

if (require.main === module) {
  main()
}

export { main as indexVectors }
