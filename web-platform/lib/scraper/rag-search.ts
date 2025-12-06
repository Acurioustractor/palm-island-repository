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
 * Vector search over content chunks using embeddings
 */
export async function vectorSearch(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const {
    limit = 10,
    threshold = 0.7
  } = options

  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbeddings([query], {
      provider: 'voyage',
      model: 'voyage-3-lite'
    })

    if (!queryEmbedding || queryEmbedding.length === 0) {
      console.warn('Failed to generate query embedding, falling back to text search')
      return textSearch(query, options)
    }

    const supabase = getSupabase()

    // Use the hybrid_search_chunks function for best results
    const { data, error } = await supabase
      .rpc('hybrid_search_chunks', {
        query_text: query,
        query_embedding: queryEmbedding[0],
        match_count: limit,
        vector_weight: 0.7,
        keyword_weight: 0.3
      })

    if (error) {
      console.error('Vector search error:', error)
      // Fallback to text search
      return textSearch(query, options)
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      chunkText: row.chunk_text,
      score: row.hybrid_score,
      sourceUrl: row.source_url,
      sourceTitle: row.source_title,
      metadata: row.metadata
    }))
  } catch (error) {
    console.error('Vector search exception:', error)
    // Fallback to text search
    return textSearch(query, options)
  }
}

/**
 * Hybrid search combining vector embeddings and full-text search
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

  // Try vector search first (falls back to text if embeddings not available)
  const chunkResults = await vectorSearch(query, options)

  // Search knowledge base with vector embeddings if available
  const knowledgeResults = includeKnowledgeBase
    ? await searchKnowledgeBaseVector(query, limit)
    : []

  return {
    chunks: chunkResults,
    knowledgeEntries: knowledgeResults
  }
}

/**
 * Search the knowledge base using vector embeddings
 */
async function searchKnowledgeBaseVector(
  query: string,
  limit: number = 10
): Promise<any[]> {
  try {
    // Generate embedding for the query (OpenAI for 1536-dim)
    const queryEmbedding = await generateEmbeddings([query], {
      provider: 'openai',
      model: 'text-embedding-3-small'
    })

    if (!queryEmbedding || queryEmbedding.length === 0) {
      console.warn('Failed to generate query embedding for knowledge base, falling back to text search')
      return searchKnowledgeBase(query, limit)
    }

    const supabase = getSupabase()

    // Use the match_knowledge_entries function
    const { data, error } = await supabase
      .rpc('match_knowledge_entries', {
        query_embedding: queryEmbedding[0],
        match_count: limit,
        match_threshold: 0.7
      })

    if (error) {
      console.error('Knowledge base vector search error:', error)
      // Fallback to text search
      return searchKnowledgeBase(query, limit)
    }

    return data || []
  } catch (error) {
    console.error('Knowledge base vector search exception:', error)
    // Fallback to text search
    return searchKnowledgeBase(query, limit)
  }
}

/**
 * Search the knowledge base (existing knowledge_entries table) using text search
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
