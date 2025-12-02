/**
 * RAG Search Service
 *
 * Provides semantic search over scraped content for:
 * - Chatbot responses
 * - Annual report generation
 * - Knowledge discovery
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { generateEmbeddings } from './embeddings'

export interface SearchResult {
  id: string
  chunkText: string
  score: number
  sourceUrl: string
  sourceTitle: string | null
  metadata: any
}

export interface SearchOptions {
  limit?: number
  threshold?: number
  sourceTypes?: string[]
  dateFrom?: string
  dateTo?: string
  includeKnowledgeBase?: boolean
}

function getSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

/**
 * Full-text search over content chunks using PostgreSQL
 */
export async function textSearch(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const {
    limit = 10,
    sourceTypes,
    dateFrom,
    dateTo
  } = options

  const supabase = getSupabase()

  // Use the database function for text search
  const { data, error } = await supabase
    .rpc('search_chunks', {
      search_query: query,
      match_count: limit
    })

  if (error) {
    console.error('Text search error:', error)
    return []
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    chunkText: row.chunk_text,
    score: row.rank,
    sourceUrl: row.source_url,
    sourceTitle: row.source_title,
    metadata: row.metadata
  }))
}

/**
 * Hybrid search combining full-text and knowledge base
 */
export async function hybridSearch(
  query: string,
  options: SearchOptions = {}
): Promise<{
  chunks: SearchResult[]
  knowledgeEntries: any[]
}> {
  const {
    limit = 10,
    includeKnowledgeBase = true
  } = options

  const supabase = getSupabase()

  // Parallel search
  const [chunkResults, knowledgeResults] = await Promise.all([
    textSearch(query, options),
    includeKnowledgeBase ? searchKnowledgeBase(query, limit) : Promise.resolve([])
  ])

  return {
    chunks: chunkResults,
    knowledgeEntries: knowledgeResults
  }
}

/**
 * Search the knowledge base (existing knowledge_entries table)
 */
async function searchKnowledgeBase(
  query: string,
  limit: number = 10
): Promise<any[]> {
  const supabase = getSupabase()

  // Use full-text search on knowledge_entries
  const { data, error } = await supabase
    .from('knowledge_entries')
    .select('id, slug, title, summary, content, entry_type, category')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%,summary.ilike.%${query}%`)
    .eq('is_public', true)
    .limit(limit)

  if (error) {
    console.error('Knowledge base search error:', error)
    return []
  }

  return data || []
}

/**
 * Build context for RAG from search results
 */
export function buildRAGContext(
  chunks: SearchResult[],
  knowledgeEntries: any[],
  options: {
    maxTokens?: number
    includeSource?: boolean
  } = {}
): string {
  const { maxTokens = 2000, includeSource = true } = options

  const contextParts: string[] = []
  let totalChars = 0
  const maxChars = maxTokens * 4 // Rough estimate

  // Add knowledge base entries first (higher quality)
  for (const entry of knowledgeEntries) {
    const content = entry.summary || entry.content?.substring(0, 500) || ''
    const part = includeSource
      ? `[${entry.title}]: ${content}`
      : content

    if (totalChars + part.length > maxChars) break
    contextParts.push(part)
    totalChars += part.length
  }

  // Add scraped chunks
  for (const chunk of chunks) {
    const part = includeSource
      ? `[${chunk.sourceTitle || chunk.sourceUrl}]: ${chunk.chunkText}`
      : chunk.chunkText

    if (totalChars + part.length > maxChars) break
    contextParts.push(part)
    totalChars += part.length
  }

  return contextParts.join('\n\n')
}

/**
 * Get relevant context for a question (main RAG function)
 */
export async function getRAGContext(
  question: string,
  options: SearchOptions & { maxContextTokens?: number } = {}
): Promise<{
  context: string
  sources: Array<{ title: string; url: string }>
}> {
  const { maxContextTokens = 2000, ...searchOptions } = options

  const { chunks, knowledgeEntries } = await hybridSearch(question, {
    ...searchOptions,
    includeKnowledgeBase: true
  })

  const context = buildRAGContext(chunks, knowledgeEntries, {
    maxTokens: maxContextTokens,
    includeSource: false
  })

  // Collect unique sources
  const sourceMap = new Map<string, { title: string; url: string }>()

  for (const chunk of chunks) {
    const url = chunk.sourceUrl
    if (!sourceMap.has(url)) {
      sourceMap.set(url, {
        title: chunk.sourceTitle || url,
        url
      })
    }
  }

  for (const entry of knowledgeEntries) {
    const key = `kb:${entry.slug}`
    if (!sourceMap.has(key)) {
      sourceMap.set(key, {
        title: entry.title,
        url: `/wiki/${entry.slug}`
      })
    }
  }

  return {
    context,
    sources: Array.from(sourceMap.values())
  }
}

/**
 * Find related content to a given piece of content
 */
export async function findRelatedContent(
  contentId: string,
  limit: number = 5
): Promise<SearchResult[]> {
  const supabase = getSupabase()

  // Get the content
  const { data: content } = await supabase
    .from('scraped_content')
    .select('title, content')
    .eq('id', contentId)
    .single()

  if (!content) return []

  // Search for similar content
  const searchQuery = content.title || content.content.substring(0, 200)
  return textSearch(searchQuery, { limit })
}

/**
 * Get statistics about the knowledge corpus
 */
export async function getCorpusStats(): Promise<{
  totalSources: number
  totalPages: number
  totalChunks: number
  knowledgeEntries: number
  lastScraped: string | null
}> {
  const supabase = getSupabase()

  const [sourcesResult, contentResult, chunksResult, knowledgeResult, lastScrapedResult] = await Promise.all([
    supabase.from('scrape_sources').select('id', { count: 'exact', head: true }),
    supabase.from('scraped_content').select('id', { count: 'exact', head: true }),
    supabase.from('content_chunks').select('id', { count: 'exact', head: true }),
    supabase.from('knowledge_entries').select('id', { count: 'exact', head: true }),
    supabase.from('scrape_sources').select('last_scraped_at').order('last_scraped_at', { ascending: false }).limit(1)
  ])

  return {
    totalSources: sourcesResult.count || 0,
    totalPages: contentResult.count || 0,
    totalChunks: chunksResult.count || 0,
    knowledgeEntries: knowledgeResult.count || 0,
    lastScraped: lastScrapedResult.data?.[0]?.last_scraped_at || null
  }
}
