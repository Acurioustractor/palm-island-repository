/**
 * Main Scraper Service
 *
 * Orchestrates the full scraping pipeline:
 * 1. Fetch content from source
 * 2. Check for duplicates
 * 3. Chunk content
 * 4. Generate embeddings
 * 5. Store in database
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { scrapeUrl, crawlSite, ScrapeResult } from './firecrawl-client'
import { jinaFetch } from './jina-client'
import { chunkContent, Chunk } from './chunker'
import { contentHash, chunkHash, minHashSignature, checkDuplication } from './deduplication'
import { generateEmbeddings } from './embeddings'

export interface ScrapeJobResult {
  success: boolean
  jobId: string
  pagesScraped: number
  chunksCreated: number
  duplicatesFound: number
  errors: string[]
}

export interface ScraperConfig {
  useFirecrawl?: boolean
  maxPages?: number
  chunkOptions?: {
    maxTokens?: number
    overlapTokens?: number
  }
  generateEmbeddings?: boolean
  checkDuplicates?: boolean
}

const DEFAULT_CONFIG: Required<ScraperConfig> = {
  useFirecrawl: true,
  maxPages: 50,
  chunkOptions: {
    maxTokens: 256,
    overlapTokens: 50
  },
  generateEmbeddings: false, // Disabled by default until pgvector is set up
  checkDuplicates: true
}

function getSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

/**
 * Scrape a single URL and store the content
 */
export async function scrapeAndStore(
  sourceId: string,
  url: string,
  config: ScraperConfig = {}
): Promise<{
  success: boolean
  contentId?: string
  chunksCreated: number
  isDuplicate: boolean
  error?: string
}> {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const supabase = getSupabase()

  try {
    // 1. Scrape the URL
    let scrapeResult: ScrapeResult

    if (cfg.useFirecrawl) {
      scrapeResult = await scrapeUrl(url)

      // Fallback to Jina if Firecrawl fails
      if (!scrapeResult.success) {
        const jinaResult = await jinaFetch(url)
        scrapeResult = {
          url,
          title: jinaResult.title,
          content: jinaResult.content,
          markdown: jinaResult.content,
          metadata: {},
          success: jinaResult.success,
          error: jinaResult.error
        }
      }
    } else {
      const jinaResult = await jinaFetch(url)
      scrapeResult = {
        url,
        title: jinaResult.title,
        content: jinaResult.content,
        markdown: jinaResult.content,
        metadata: {},
        success: jinaResult.success,
        error: jinaResult.error
      }
    }

    if (!scrapeResult.success || !scrapeResult.content) {
      return {
        success: false,
        chunksCreated: 0,
        isDuplicate: false,
        error: scrapeResult.error || 'No content retrieved'
      }
    }

    // 2. Check for duplicates
    const hash = contentHash(scrapeResult.content)

    if (cfg.checkDuplicates) {
      const { data: existing } = await supabase
        .from('scraped_content')
        .select('id')
        .eq('content_hash', hash)
        .single()

      if (existing) {
        return {
          success: true,
          contentId: existing.id,
          chunksCreated: 0,
          isDuplicate: true
        }
      }
    }

    // 3. Store the scraped content
    const { data: content, error: contentError } = await supabase
      .from('scraped_content')
      .insert({
        source_id: sourceId,
        url: scrapeResult.url,
        title: scrapeResult.title,
        content: scrapeResult.content,
        content_hash: hash,
        markdown_content: scrapeResult.markdown,
        metadata: scrapeResult.metadata
      })
      .select()
      .single()

    if (contentError) {
      return {
        success: false,
        chunksCreated: 0,
        isDuplicate: false,
        error: `Failed to store content: ${contentError.message}`
      }
    }

    // 4. Store MinHash signature for near-duplicate detection
    const signature = minHashSignature(scrapeResult.content)
    await supabase
      .from('content_minhash')
      .insert({
        content_id: content.id,
        signature
      })

    // 5. Chunk the content
    const contentToChunk = scrapeResult.markdown || scrapeResult.content
    const chunks = chunkContent(contentToChunk, cfg.chunkOptions)

    if (chunks.length === 0) {
      return {
        success: true,
        contentId: content.id,
        chunksCreated: 0,
        isDuplicate: false
      }
    }

    // 6. Generate embeddings (if enabled)
    let embeddings: number[][] = []
    if (cfg.generateEmbeddings) {
      const embeddingResult = await generateEmbeddings(
        chunks.map(c => c.text),
        { inputType: 'document' }
      )
      if (embeddingResult.success) {
        embeddings = embeddingResult.embeddings
      }
    }

    // 7. Store chunks
    const chunkInserts = chunks.map((chunk, index) => ({
      content_id: content.id,
      chunk_index: chunk.index,
      chunk_text: chunk.text,
      chunk_hash: chunkHash(chunk.text, hash, chunk.index),
      token_count: chunk.tokenCount,
      metadata: chunk.metadata
      // embedding: embeddings[index] // Enable when pgvector is ready
    }))

    const { error: chunksError } = await supabase
      .from('content_chunks')
      .insert(chunkInserts)

    if (chunksError) {
      return {
        success: false,
        contentId: content.id,
        chunksCreated: 0,
        isDuplicate: false,
        error: `Failed to store chunks: ${chunksError.message}`
      }
    }

    return {
      success: true,
      contentId: content.id,
      chunksCreated: chunks.length,
      isDuplicate: false
    }
  } catch (error: any) {
    return {
      success: false,
      chunksCreated: 0,
      isDuplicate: false,
      error: error.message
    }
  }
}

/**
 * Run a full scrape job for a source
 */
export async function runScrapeJob(
  sourceId: string,
  config: ScraperConfig = {}
): Promise<ScrapeJobResult> {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const supabase = getSupabase()

  // Get source details
  const { data: source, error: sourceError } = await supabase
    .from('scrape_sources')
    .select('*')
    .eq('id', sourceId)
    .single()

  if (sourceError || !source) {
    return {
      success: false,
      jobId: '',
      pagesScraped: 0,
      chunksCreated: 0,
      duplicatesFound: 0,
      errors: [`Source not found: ${sourceError?.message || 'Unknown error'}`]
    }
  }

  // Create job record
  const { data: job, error: jobError } = await supabase
    .from('scrape_jobs')
    .insert({
      source_id: sourceId,
      status: 'running',
      started_at: new Date().toISOString()
    })
    .select()
    .single()

  if (jobError || !job) {
    return {
      success: false,
      jobId: '',
      pagesScraped: 0,
      chunksCreated: 0,
      duplicatesFound: 0,
      errors: [`Failed to create job: ${jobError?.message || 'Unknown error'}`]
    }
  }

  const result: ScrapeJobResult = {
    success: true,
    jobId: job.id,
    pagesScraped: 0,
    chunksCreated: 0,
    duplicatesFound: 0,
    errors: []
  }

  try {
    // Crawl the site
    if (cfg.useFirecrawl) {
      const crawlResult = await crawlSite(source.url, { maxPages: cfg.maxPages })

      if (!crawlResult.success) {
        throw new Error(crawlResult.error || 'Crawl failed')
      }

      // Process each page
      for (const page of crawlResult.pages) {
        const storeResult = await scrapeAndStore(sourceId, page.url, {
          ...cfg,
          useFirecrawl: false // Already have content
        })

        if (storeResult.success) {
          result.pagesScraped++
          result.chunksCreated += storeResult.chunksCreated
          if (storeResult.isDuplicate) {
            result.duplicatesFound++
          }
        } else if (storeResult.error) {
          result.errors.push(`${page.url}: ${storeResult.error}`)
        }
      }
    } else {
      // Single page scrape with Jina
      const storeResult = await scrapeAndStore(sourceId, source.url, cfg)

      if (storeResult.success) {
        result.pagesScraped = 1
        result.chunksCreated = storeResult.chunksCreated
        if (storeResult.isDuplicate) {
          result.duplicatesFound = 1
        }
      } else if (storeResult.error) {
        result.errors.push(storeResult.error)
      }
    }

    // Update job status
    await supabase
      .from('scrape_jobs')
      .update({
        status: result.errors.length > 0 ? 'completed' : 'completed',
        pages_scraped: result.pagesScraped,
        chunks_created: result.chunksCreated,
        duplicates_found: result.duplicatesFound,
        error_message: result.errors.length > 0 ? result.errors.join('\n') : null,
        completed_at: new Date().toISOString()
      })
      .eq('id', job.id)

    // Update source last_scraped_at
    await supabase
      .from('scrape_sources')
      .update({ last_scraped_at: new Date().toISOString() })
      .eq('id', sourceId)

  } catch (error: any) {
    result.success = false
    result.errors.push(error.message)

    // Update job as failed
    await supabase
      .from('scrape_jobs')
      .update({
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', job.id)
  }

  return result
}

/**
 * Get sources that are due for scraping
 */
export async function getSourcesDueForScraping(): Promise<Array<{
  id: string
  name: string
  url: string
  source_type: string
  scrape_frequency: string
}>> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .rpc('get_sources_due_for_scraping')

  if (error) {
    console.error('Error getting sources due for scraping:', error)
    return []
  }

  return data || []
}

/**
 * Run all scheduled scrape jobs
 */
export async function runScheduledScrapes(
  config: ScraperConfig = {}
): Promise<{
  jobsRun: number
  totalPagesScraped: number
  totalChunksCreated: number
  errors: string[]
}> {
  const sources = await getSourcesDueForScraping()

  const result = {
    jobsRun: 0,
    totalPagesScraped: 0,
    totalChunksCreated: 0,
    errors: [] as string[]
  }

  for (const source of sources) {
    const jobResult = await runScrapeJob(source.id, config)
    result.jobsRun++
    result.totalPagesScraped += jobResult.pagesScraped
    result.totalChunksCreated += jobResult.chunksCreated
    result.errors.push(...jobResult.errors)
  }

  return result
}
