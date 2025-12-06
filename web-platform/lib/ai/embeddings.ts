/**
 * Vector Embeddings Service
 *
 * Generate and manage vector embeddings for semantic search.
 * Uses OpenAI's text-embedding-3-small for cost-effective embeddings.
 */

import { createClient } from '@/lib/supabase/server'
import { aiCache, CACHE_TTL } from './cache'

const EMBEDDING_MODEL = 'text-embedding-3-small'
const EMBEDDING_DIMENSIONS = 1536

interface EmbeddingResult {
  embedding: number[]
  tokens: number
}

interface SemanticSearchResult {
  id: string
  type: 'story' | 'knowledge' | 'person'
  title: string
  content?: string
  summary?: string
  similarity: number
  metadata?: Record<string, unknown>
}

/**
 * Generate embedding for text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  // Check cache first
  const cacheKey = [text.substring(0, 500)] // Use first 500 chars for cache key
  const cached = aiCache.get<EmbeddingResult>('embedding', cacheKey)
  if (cached) {
    return cached
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured')
  }

  // Clean and truncate text (max ~8000 tokens)
  const cleanText = text
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 30000)

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: cleanText
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  const result: EmbeddingResult = {
    embedding: data.data[0].embedding,
    tokens: data.usage.total_tokens
  }

  // Cache for 24 hours (embeddings are deterministic)
  aiCache.set('embedding', cacheKey, result, CACHE_TTL.VERY_LONG)

  return result
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddingsBatch(
  texts: string[]
): Promise<EmbeddingResult[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured')
  }

  // Clean texts
  const cleanTexts = texts.map(t =>
    t.replace(/\s+/g, ' ').trim().substring(0, 30000)
  )

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: cleanTexts
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  return data.data.map((item: any) => ({
    embedding: item.embedding,
    tokens: Math.ceil(data.usage.total_tokens / texts.length)
  }))
}

/**
 * Store embedding for a content item
 */
export async function storeEmbedding(
  contentId: string,
  contentType: 'story' | 'knowledge' | 'person',
  text: string
): Promise<void> {
  const supabase = await createClient()

  // Generate embedding
  const { embedding } = await generateEmbedding(text)

  // Store in embeddings table
  const { error } = await supabase
    .from('content_embeddings')
    .upsert({
      content_id: contentId,
      content_type: contentType,
      embedding: embedding,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'content_id,content_type'
    })

  if (error) {
    console.error('Error storing embedding:', error)
    throw error
  }
}

/**
 * Semantic search across all content
 */
export async function semanticSearch(
  query: string,
  options: {
    limit?: number
    types?: ('story' | 'knowledge' | 'person')[]
    threshold?: number
  } = {}
): Promise<SemanticSearchResult[]> {
  const { limit = 10, types, threshold = 0.5 } = options
  const supabase = await createClient()

  // Generate query embedding
  const { embedding } = await generateEmbedding(query)

  // Search using pgvector similarity
  const { data, error } = await supabase.rpc('match_content_by_embedding', {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: limit,
    content_types: types || null
  })

  if (error) {
    console.error('Semantic search error:', error)
    throw error
  }

  return data || []
}

/**
 * Find similar content to a given item
 */
export async function findSimilarContent(
  contentId: string,
  contentType: 'story' | 'knowledge' | 'person',
  options: {
    limit?: number
    excludeSameType?: boolean
  } = {}
): Promise<SemanticSearchResult[]> {
  const { limit = 5, excludeSameType = false } = options
  const supabase = await createClient()

  // Get the embedding for this content
  const { data: embeddingData } = await supabase
    .from('content_embeddings')
    .select('embedding')
    .eq('content_id', contentId)
    .eq('content_type', contentType)
    .single()

  if (!embeddingData) {
    return []
  }

  // Search for similar content
  const { data, error } = await supabase.rpc('match_content_by_embedding', {
    query_embedding: embeddingData.embedding,
    match_threshold: 0.6,
    match_count: limit + 1, // +1 to exclude self
    content_types: excludeSameType ? null : [contentType]
  })

  if (error) {
    console.error('Find similar error:', error)
    return []
  }

  // Filter out the source content
  return (data || []).filter(
    (item: SemanticSearchResult) =>
      !(item.id === contentId && item.type === contentType)
  ).slice(0, limit)
}

/**
 * Update embeddings for all content (background job)
 */
export async function updateAllEmbeddings(
  contentType: 'story' | 'knowledge' | 'person'
): Promise<{ processed: number; errors: number }> {
  const supabase = await createClient()
  let processed = 0
  let errors = 0

  // Get content that needs embedding
  let query
  switch (contentType) {
    case 'story':
      query = supabase
        .from('stories')
        .select('id, title, content, summary')
        .eq('is_public', true)
      break
    case 'knowledge':
      query = supabase
        .from('knowledge_entries')
        .select('id, title, content, summary')
      break
    case 'person':
      query = supabase
        .from('profiles')
        .select('id, full_name, bio')
        .eq('is_public', true)
      break
  }

  const { data: items } = await query

  if (!items) return { processed: 0, errors: 0 }

  // Process in batches of 10
  const batchSize = 10
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)

    await Promise.all(batch.map(async (item: any) => {
      try {
        const text = contentType === 'person'
          ? `${item.full_name}. ${item.bio || ''}`
          : `${item.title}. ${item.summary || ''} ${item.content || ''}`

        await storeEmbedding(item.id, contentType, text)
        processed++
      } catch (err) {
        console.error(`Error embedding ${contentType} ${item.id}:`, err)
        errors++
      }
    }))

    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return { processed, errors }
}

/**
 * Get embedding statistics
 */
export async function getEmbeddingStats(): Promise<{
  total: number
  byType: Record<string, number>
  lastUpdated: string | null
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('content_embeddings')
    .select('content_type, updated_at')

  if (error || !data) {
    return { total: 0, byType: {}, lastUpdated: null }
  }

  const byType: Record<string, number> = {}
  let lastUpdated: string | null = null

  for (const item of data) {
    byType[item.content_type] = (byType[item.content_type] || 0) + 1
    if (!lastUpdated || item.updated_at > lastUpdated) {
      lastUpdated = item.updated_at
    }
  }

  return {
    total: data.length,
    byType,
    lastUpdated
  }
}
