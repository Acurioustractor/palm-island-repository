/**
 * Auto-Summarization Service
 *
 * Uses Claude AI to generate intelligent summaries for content.
 * Features:
 * - Story summarization
 * - Document condensation
 * - Key point extraction
 * - Metadata generation
 */

import Anthropic from '@anthropic-ai/sdk'
import { aiCache, CACHE_TTL } from './cache'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

// Helper to create a content hash for cache keys
function hashContent(content: string): string {
  let hash = 0
  const sample = content.substring(0, 1000) // Use first 1000 chars for hash
  for (let i = 0; i < sample.length; i++) {
    const char = sample.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

export interface SummaryResult {
  summary: string
  keyPoints: string[]
  keywords: string[]
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed'
  readingTime: number // in minutes
  suggestedTitle?: string
  categories: string[]
  success: boolean
  error?: string
}

export interface ContentMetadata {
  title: string
  summary: string
  keywords: string[]
  categories: string[]
  entities: {
    people: string[]
    places: string[]
    organizations: string[]
    dates: string[]
  }
  themes: string[]
}

/**
 * Generate a summary for content using Claude AI
 */
export async function summarizeContent(
  content: string,
  options: {
    maxLength?: number // target summary length in words
    style?: 'concise' | 'detailed' | 'bullet-points'
    preserveCulturalContext?: boolean
    extractKeyPoints?: boolean
  } = {}
): Promise<SummaryResult> {
  const {
    maxLength = 100,
    style = 'concise',
    preserveCulturalContext = true,
    extractKeyPoints = true
  } = options

  // Handle empty or very short content
  if (!content || content.length < 50) {
    return {
      summary: content || '',
      keyPoints: [],
      keywords: [],
      sentiment: 'neutral',
      readingTime: 0,
      categories: [],
      success: true
    }
  }

  // Calculate reading time (average 200 words per minute)
  const wordCount = content.split(/\s+/).length
  const readingTime = Math.ceil(wordCount / 200)

  // Check cache first
  const contentHash = hashContent(content)
  const cacheKey = [contentHash, maxLength, style, preserveCulturalContext, extractKeyPoints]
  const cached = aiCache.get<SummaryResult>('summarize', cacheKey)
  if (cached) {
    return { ...cached, readingTime }
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 800,
      system: `You are an expert content summarizer for the Palm Island Community Company knowledge base.
Your task is to create accurate, culturally respectful summaries.

${preserveCulturalContext ? `
Cultural Guidelines:
- Respect Indigenous knowledge and storytelling traditions
- Preserve the voice and perspective of storytellers
- Acknowledge Manbarra and Bwgcolman cultural context
- Maintain the emotional and spiritual significance of stories
` : ''}

Respond ONLY with valid JSON in this exact format:
{
  "summary": "The ${style === 'bullet-points' ? 'key points as bullet list' : `${maxLength}-word summary`}",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "sentiment": "positive|neutral|negative|mixed",
  "suggestedTitle": "A suggested title if none exists",
  "categories": ["relevant", "categories"]
}

Keep summaries accurate and respectful. Never fabricate information.`,
      messages: [{
        role: 'user',
        content: `Summarize this content (target: ${maxLength} words, style: ${style}):\n\n${content.substring(0, 8000)}`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const parsed = JSON.parse(jsonMatch[0])

    const result: SummaryResult = {
      summary: parsed.summary || '',
      keyPoints: parsed.keyPoints || [],
      keywords: parsed.keywords || [],
      sentiment: parsed.sentiment || 'neutral',
      readingTime,
      suggestedTitle: parsed.suggestedTitle,
      categories: parsed.categories || [],
      success: true
    }

    // Cache the result (1 hour - summaries are stable)
    aiCache.set('summarize', cacheKey, result, CACHE_TTL.LONG)

    return result
  } catch (error: any) {
    console.error('Summarization error:', error)

    // Fallback: basic extractive summary
    return {
      ...basicSummarize(content, maxLength),
      readingTime,
      success: false,
      error: error.message
    }
  }
}

/**
 * Basic extractive summarization (fallback without AI)
 */
function basicSummarize(content: string, maxWords: number): Omit<SummaryResult, 'readingTime' | 'success' | 'error'> {
  const sentences = content
    .replace(/\n+/g, ' ')
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20)

  // Take first few sentences up to maxWords
  let summary = ''
  let wordCount = 0

  for (const sentence of sentences) {
    const sentenceWords = sentence.split(/\s+/).length
    if (wordCount + sentenceWords > maxWords) break
    summary += sentence + '. '
    wordCount += sentenceWords
  }

  // Extract keywords (simple frequency-based)
  const words = content.toLowerCase().split(/\s+/)
  const wordFreq = new Map<string, number>()
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had'])

  for (const word of words) {
    const clean = word.replace(/[^\w]/g, '')
    if (clean.length > 3 && !stopWords.has(clean)) {
      wordFreq.set(clean, (wordFreq.get(clean) || 0) + 1)
    }
  }

  const keywords = Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word)

  return {
    summary: summary.trim(),
    keyPoints: sentences.slice(0, 3),
    keywords,
    sentiment: 'neutral',
    suggestedTitle: undefined,
    categories: []
  }
}

/**
 * Extract comprehensive metadata from content
 */
export async function extractMetadata(
  content: string,
  existingTitle?: string
): Promise<ContentMetadata> {
  // Check cache first
  const contentHash = hashContent(content)
  const cacheKey = [contentHash, existingTitle || '']
  const cached = aiCache.get<ContentMetadata>('extractMetadata', cacheKey)
  if (cached) {
    return cached
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 600,
      system: `You are a metadata extraction expert for Indigenous community content.
Extract structured metadata while respecting cultural context.

Respond ONLY with valid JSON:
{
  "title": "suggested or improved title",
  "summary": "2-3 sentence summary",
  "keywords": ["keyword1", "keyword2"],
  "categories": ["health", "culture", "community", "youth", "elder_care", "history", "services"],
  "entities": {
    "people": ["names mentioned"],
    "places": ["locations mentioned"],
    "organizations": ["orgs mentioned"],
    "dates": ["dates/years mentioned"]
  },
  "themes": ["main theme 1", "theme 2"]
}`,
      messages: [{
        role: 'user',
        content: `${existingTitle ? `Title: ${existingTitle}\n\n` : ''}Content:\n${content.substring(0, 6000)}`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      throw new Error('No JSON found')
    }

    const parsed = JSON.parse(jsonMatch[0])

    const result: ContentMetadata = {
      title: existingTitle || parsed.title || 'Untitled',
      summary: parsed.summary || '',
      keywords: parsed.keywords || [],
      categories: parsed.categories || [],
      entities: {
        people: parsed.entities?.people || [],
        places: parsed.entities?.places || [],
        organizations: parsed.entities?.organizations || [],
        dates: parsed.entities?.dates || []
      },
      themes: parsed.themes || []
    }

    // Cache the result (1 hour - metadata is stable)
    aiCache.set('extractMetadata', cacheKey, result, CACHE_TTL.LONG)

    return result
  } catch (error) {
    console.error('Metadata extraction error:', error)

    // Basic fallback
    const basicSummary = basicSummarize(content, 50)
    return {
      title: existingTitle || 'Untitled',
      summary: basicSummary.summary,
      keywords: basicSummary.keywords,
      categories: [],
      entities: { people: [], places: [], organizations: [], dates: [] },
      themes: []
    }
  }
}

/**
 * Generate a one-line description for content
 */
export async function generateOneLiner(
  content: string,
  title?: string
): Promise<string> {
  // Check cache first
  const contentHash = hashContent(content)
  const cacheKey = [contentHash, title || '']
  const cached = aiCache.get<string>('oneLiner', cacheKey)
  if (cached) {
    return cached
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `Write a single compelling sentence (under 150 characters) that describes this content. Be accurate and engaging.

${title ? `Title: ${title}\n` : ''}Content: ${content.substring(0, 2000)}`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const result = text.trim().replace(/^["']|["']$/g, '') // Remove quotes if present

    // Cache the result (1 hour)
    aiCache.set('oneLiner', cacheKey, result, CACHE_TTL.LONG)

    return result
  } catch (error) {
    console.error('One-liner generation error:', error)
    // Fallback: first sentence
    const firstSentence = content.split(/[.!?]/)[0]
    return firstSentence?.substring(0, 150) || ''
  }
}

/**
 * Batch summarize multiple pieces of content
 */
export async function batchSummarize(
  contents: Array<{ id: string; content: string; title?: string }>,
  options?: Parameters<typeof summarizeContent>[1]
): Promise<Map<string, SummaryResult>> {
  const results = new Map<string, SummaryResult>()

  // Process in parallel with concurrency limit
  const batchSize = 5
  for (let i = 0; i < contents.length; i += batchSize) {
    const batch = contents.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(async ({ id, content }) => {
        const result = await summarizeContent(content, options)
        return { id, result }
      })
    )

    for (const { id, result } of batchResults) {
      results.set(id, result)
    }

    // Small delay between batches
    if (i + batchSize < contents.length) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }

  return results
}

/**
 * Auto-categorize content based on its text
 */
export async function categorizeContent(
  content: string
): Promise<{ primary: string; secondary: string[]; confidence: number }> {
  // Check cache first
  const contentHash = hashContent(content)
  const cacheKey = [contentHash]
  const cached = aiCache.get<{ primary: string; secondary: string[]; confidence: number }>('categorize', cacheKey)
  if (cached) {
    return cached
  }

  const categories = [
    'health',
    'culture',
    'community',
    'youth',
    'elder_care',
    'history',
    'services',
    'education',
    'environment',
    'sports',
    'arts',
    'governance',
    'family'
  ]

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 150,
      messages: [{
        role: 'user',
        content: `Categorize this content. Choose from: ${categories.join(', ')}

Respond with JSON: {"primary": "category", "secondary": ["cat1", "cat2"], "confidence": 0.0-1.0}

Content: ${content.substring(0, 3000)}`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      const result = {
        primary: parsed.primary || 'community',
        secondary: parsed.secondary || [],
        confidence: parsed.confidence || 0.7
      }

      // Cache the result (1 hour)
      aiCache.set('categorize', cacheKey, result, CACHE_TTL.LONG)

      return result
    }
  } catch (error) {
    console.error('Categorization error:', error)
  }

  // Fallback
  return { primary: 'community', secondary: [], confidence: 0.3 }
}
