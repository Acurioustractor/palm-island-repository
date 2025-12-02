/**
 * Simple Web Scraper
 *
 * A lightweight scraper that works without paid APIs.
 * Uses basic fetch and regex to extract content.
 */

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// Simple HTML to text extraction
function htmlToText(html: string): string {
  return html
    // Remove scripts and styles
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // Remove HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Decode entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

// Extract title from HTML
function extractTitle(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch) return titleMatch[1].trim()

  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
  if (h1Match) return htmlToText(h1Match[1])

  return 'Untitled'
}

// Extract main content (tries common content selectors)
function extractMainContent(html: string): string {
  // Try to find article content
  const patterns = [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class="[^"]*article[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class="[^"]*post[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match && match[1].length > 200) {
      return htmlToText(match[1])
    }
  }

  // Fallback: extract body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bodyMatch) {
    return htmlToText(bodyMatch[1])
  }

  return htmlToText(html)
}

// Generate content hash
function contentHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex')
}

// Simple chunking
function chunkText(text: string, chunkSize: number = 1000): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/)
  const chunks: string[] = []
  let currentChunk = ''

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += ' ' + sentence
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}

export interface SimpleScrapeResult {
  success: boolean
  url: string
  title: string
  content: string
  error?: string
}

// Scrape a single URL
export async function scrapeUrl(url: string): Promise<SimpleScrapeResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PICC-Bot/1.0; +https://picc.com.au)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(30000) // 30 second timeout
    })

    if (!response.ok) {
      return {
        success: false,
        url,
        title: '',
        content: '',
        error: `HTTP ${response.status}: ${response.statusText}`
      }
    }

    const html = await response.text()
    const title = extractTitle(html)
    const content = extractMainContent(html)

    if (content.length < 100) {
      return {
        success: false,
        url,
        title,
        content: '',
        error: 'Content too short or could not be extracted'
      }
    }

    return {
      success: true,
      url,
      title,
      content
    }
  } catch (error: any) {
    return {
      success: false,
      url,
      title: '',
      content: '',
      error: error.message || 'Unknown error'
    }
  }
}

// Scrape and store content
export async function scrapeAndStore(
  sourceId: string,
  url: string
): Promise<{
  success: boolean
  contentId?: string
  chunksCreated: number
  isDuplicate: boolean
  error?: string
}> {
  const supabase = getSupabase()

  try {
    // Scrape the URL
    const result = await scrapeUrl(url)

    if (!result.success) {
      return {
        success: false,
        chunksCreated: 0,
        isDuplicate: false,
        error: result.error
      }
    }

    // Check for duplicates
    const hash = contentHash(result.content)
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

    // Store content
    const { data: content, error: contentError } = await supabase
      .from('scraped_content')
      .insert({
        source_id: sourceId,
        url: result.url,
        title: result.title,
        content: result.content,
        content_hash: hash,
        markdown_content: result.content
      })
      .select()
      .single()

    if (contentError) {
      return {
        success: false,
        chunksCreated: 0,
        isDuplicate: false,
        error: contentError.message
      }
    }

    // Create chunks
    const chunks = chunkText(result.content)
    const chunkInserts = chunks.map((text, index) => ({
      content_id: content.id,
      chunk_index: index,
      chunk_text: text,
      chunk_hash: contentHash(`${hash}-${index}-${text.substring(0, 50)}`),
      token_count: Math.ceil(text.length / 4)
    }))

    const { error: chunksError } = await supabase
      .from('content_chunks')
      .insert(chunkInserts)

    if (chunksError) {
      console.error('Failed to store chunks:', chunksError)
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

// Run scrape for all active sources
export async function runAllScrapes(): Promise<{
  success: boolean
  sourcesProcessed: number
  pagesScraped: number
  chunksCreated: number
  errors: string[]
}> {
  const supabase = getSupabase()

  const result = {
    success: true,
    sourcesProcessed: 0,
    pagesScraped: 0,
    chunksCreated: 0,
    errors: [] as string[]
  }

  try {
    // Get all active sources
    const { data: sources, error: sourcesError } = await supabase
      .from('scrape_sources')
      .select('*')
      .eq('is_active', true)

    if (sourcesError || !sources) {
      return {
        ...result,
        success: false,
        errors: [sourcesError?.message || 'No sources found']
      }
    }

    // Process each source
    for (const source of sources) {
      result.sourcesProcessed++

      // Create job record
      const { data: job } = await supabase
        .from('scrape_jobs')
        .insert({
          source_id: source.id,
          status: 'running',
          started_at: new Date().toISOString()
        })
        .select()
        .single()

      try {
        // Scrape the main URL
        const scrapeResult = await scrapeAndStore(source.id, source.url)

        if (scrapeResult.success && !scrapeResult.isDuplicate) {
          result.pagesScraped++
          result.chunksCreated += scrapeResult.chunksCreated
        } else if (!scrapeResult.success) {
          result.errors.push(`${source.name}: ${scrapeResult.error}`)
        }

        // Update job
        if (job) {
          await supabase
            .from('scrape_jobs')
            .update({
              status: 'completed',
              pages_scraped: scrapeResult.success ? 1 : 0,
              chunks_created: scrapeResult.chunksCreated,
              duplicates_found: scrapeResult.isDuplicate ? 1 : 0,
              completed_at: new Date().toISOString()
            })
            .eq('id', job.id)
        }

        // Update source last_scraped_at
        await supabase
          .from('scrape_sources')
          .update({ last_scraped_at: new Date().toISOString() })
          .eq('id', source.id)

      } catch (error: any) {
        result.errors.push(`${source.name}: ${error.message}`)

        if (job) {
          await supabase
            .from('scrape_jobs')
            .update({
              status: 'failed',
              error_message: error.message,
              completed_at: new Date().toISOString()
            })
            .eq('id', job.id)
        }
      }
    }

    return result
  } catch (error: any) {
    return {
      ...result,
      success: false,
      errors: [error.message]
    }
  }
}

// Get stats about the content system
export async function getContentStats(): Promise<{
  totalSources: number
  totalContent: number
  totalChunks: number
  totalQuotes: number
  validatedQuotes: number
  recentJobs: any[]
}> {
  const supabase = getSupabase()

  const [sources, content, chunks, quotes, validatedQuotes, jobs] = await Promise.all([
    supabase.from('scrape_sources').select('id', { count: 'exact', head: true }),
    supabase.from('scraped_content').select('id', { count: 'exact', head: true }),
    supabase.from('content_chunks').select('id', { count: 'exact', head: true }),
    supabase.from('extracted_quotes').select('id', { count: 'exact', head: true }),
    supabase.from('extracted_quotes').select('id', { count: 'exact', head: true }).eq('is_validated', true),
    supabase.from('scrape_jobs').select('*').order('created_at', { ascending: false }).limit(5)
  ])

  return {
    totalSources: sources.count || 0,
    totalContent: content.count || 0,
    totalChunks: chunks.count || 0,
    totalQuotes: quotes.count || 0,
    validatedQuotes: validatedQuotes.count || 0,
    recentJobs: jobs.data || []
  }
}
