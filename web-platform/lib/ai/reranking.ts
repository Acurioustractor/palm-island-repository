/**
 * Re-ranking Service
 *
 * Uses Claude AI to score and reorder search results by relevance.
 * This significantly improves search quality by understanding context.
 */

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export interface RerankableItem {
  id: string
  title: string
  content?: string
  summary?: string
  type: string
  score?: number
}

export interface RerankResult {
  id: string
  originalRank: number
  newRank: number
  relevanceScore: number
  reasoning?: string
}

export interface RerankResponse {
  query: string
  rerankedItems: RerankResult[]
  totalItems: number
  processingTime: number
}

/**
 * Rerank search results using Claude AI
 * Returns items sorted by relevance with scores
 */
export async function rerankResults(
  query: string,
  items: RerankableItem[],
  options: {
    topK?: number
    includeReasoning?: boolean
    context?: string
  } = {}
): Promise<RerankResponse> {
  const startTime = Date.now()
  const { topK = 10, includeReasoning = false, context = '' } = options

  // If no items or just one, return as-is
  if (items.length <= 1) {
    return {
      query,
      rerankedItems: items.map((item, i) => ({
        id: item.id,
        originalRank: i,
        newRank: i,
        relevanceScore: 1.0
      })),
      totalItems: items.length,
      processingTime: Date.now() - startTime
    }
  }

  // Prepare items for Claude
  const itemsForRanking = items.slice(0, 20).map((item, index) => ({
    index,
    id: item.id,
    title: item.title,
    snippet: (item.summary || item.content || '').substring(0, 300),
    type: item.type
  }))

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1000,
      system: `You are a search relevance expert for the Palm Island Community knowledge base.
Your task is to rerank search results by relevance to the user's query.

${context ? `Context: ${context}\n` : ''}
Consider:
- Semantic relevance to the query
- Content quality and completeness
- Cultural significance for Indigenous community content
- Freshness and accuracy

Respond ONLY with valid JSON in this format:
{
  "rankings": [
    {"index": 0, "score": 0.95${includeReasoning ? ', "reason": "Most relevant because..."' : ''}},
    {"index": 2, "score": 0.85${includeReasoning ? ', "reason": "Relevant because..."' : ''}}
  ]
}

Score from 0.0 to 1.0. Only include items with score > 0.3.
Order by score descending.`,
      messages: [{
        role: 'user',
        content: `Query: "${query}"

Items to rank:
${itemsForRanking.map(item =>
  `[${item.index}] ${item.type.toUpperCase()}: ${item.title}\n    ${item.snippet}`
).join('\n\n')}`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      throw new Error('No JSON in response')
    }

    const parsed = JSON.parse(jsonMatch[0])
    const rankings = parsed.rankings || []

    // Build reranked results
    const rerankedItems: RerankResult[] = rankings
      .slice(0, topK)
      .map((r: any, newRank: number) => ({
        id: items[r.index]?.id || '',
        originalRank: r.index,
        newRank,
        relevanceScore: r.score || 0.5,
        reasoning: includeReasoning ? r.reason : undefined
      }))
      .filter((r: RerankResult) => r.id)

    return {
      query,
      rerankedItems,
      totalItems: items.length,
      processingTime: Date.now() - startTime
    }

  } catch (error) {
    console.error('Reranking error:', error)

    // Fallback: return original order with estimated scores
    return {
      query,
      rerankedItems: items.slice(0, topK).map((item, i) => ({
        id: item.id,
        originalRank: i,
        newRank: i,
        relevanceScore: 1.0 - (i * 0.1) // Decreasing scores
      })),
      totalItems: items.length,
      processingTime: Date.now() - startTime
    }
  }
}

/**
 * Quick relevance scoring without full reranking
 * Uses heuristics for speed
 */
export function quickScore(query: string, item: RerankableItem): number {
  const queryTerms = query.toLowerCase().split(/\s+/)
  const title = (item.title || '').toLowerCase()
  const content = (item.content || item.summary || '').toLowerCase()

  let score = 0
  let matches = 0

  for (const term of queryTerms) {
    if (term.length < 2) continue

    // Title matches are worth more
    if (title.includes(term)) {
      score += 0.3
      matches++
    }

    // Content matches
    if (content.includes(term)) {
      score += 0.1
      matches++
    }

    // Exact phrase bonus
    if (title.includes(query.toLowerCase())) {
      score += 0.4
    }
  }

  // Normalize score
  const maxPossible = queryTerms.length * 0.4 + 0.4
  return Math.min(1.0, score / maxPossible)
}

/**
 * Hybrid reranking: quick scoring + AI for top results
 */
export async function hybridRerank(
  query: string,
  items: RerankableItem[],
  options: {
    topK?: number
    aiRerankTop?: number
  } = {}
): Promise<RerankableItem[]> {
  const { topK = 10, aiRerankTop = 5 } = options

  // Quick score all items
  const scored = items.map(item => ({
    ...item,
    score: quickScore(query, item)
  })).sort((a, b) => (b.score || 0) - (a.score || 0))

  // If few items, just return quick-scored
  if (scored.length <= aiRerankTop) {
    return scored.slice(0, topK)
  }

  // AI rerank top candidates
  const topCandidates = scored.slice(0, aiRerankTop * 2)
  const reranked = await rerankResults(query, topCandidates, { topK: aiRerankTop })

  // Build final list
  const rerankedIds = new Set(reranked.rerankedItems.map(r => r.id))
  const aiRerankedItems = reranked.rerankedItems.map(r => {
    const item = items.find(i => i.id === r.id)!
    return { ...item, score: r.relevanceScore }
  })

  // Add remaining items that weren't AI-reranked
  const remainingItems = scored
    .filter(item => !rerankedIds.has(item.id))
    .slice(0, topK - aiRerankedItems.length)

  return [...aiRerankedItems, ...remainingItems].slice(0, topK)
}
