/**
 * Related Content Service
 *
 * Finds semantically related content across the knowledge base.
 * Uses embeddings and AI to suggest relevant connections.
 */

import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { generateEmbeddings } from '../scraper/embeddings'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Vector similarity search using content_embeddings table.
 * Falls back gracefully if no embedding exists for the item.
 */
async function vectorFindSimilar(
  contentId: string,
  contentType: 'story' | 'person' | 'knowledge',
  limit: number = 5
): Promise<RelatedItem[]> {
  try {
    const supabase = getSupabase()

    // Get the embedding for this content
    const { data: embeddingData } = await supabase
      .from('content_embeddings')
      .select('embedding')
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      .single()

    if (!embeddingData) return []

    // Search for similar content via RPC
    const { data, error } = await supabase.rpc('match_content_by_embedding', {
      query_embedding: embeddingData.embedding,
      match_threshold: 0.6,
      match_count: limit + 1,
      content_types: null // search across all types
    })

    if (error || !data) return []

    // Map RPC results to RelatedItem format, excluding self
    return (data as any[])
      .filter(item => !(item.id === contentId && item.type === contentType))
      .slice(0, limit)
      .map(item => ({
        id: item.id,
        type: item.type as RelatedContentType,
        title: item.title || 'Untitled',
        summary: item.summary || item.content?.substring(0, 150),
        url: item.type === 'story' ? `/stories/${item.id}`
          : item.type === 'person' ? `/wiki/people/${item.id}`
          : item.type === 'knowledge' ? `/wiki/${item.id}`
          : `/${item.type}/${item.id}`,
        similarity: item.similarity,
        relationship: 'Semantically related'
      }))
  } catch (error) {
    console.error('Vector search fallback:', error)
    return []
  }
}

export type RelatedContentType = 'story' | 'person' | 'knowledge' | 'media' | 'service' | 'quote' | 'financial'

export interface RelatedItem {
  id: string
  type: RelatedContentType
  title: string
  summary?: string
  url: string
  similarity: number
  relationship?: string
}

export interface RelatedContentResult {
  sourceId: string
  sourceType: string
  relatedItems: RelatedItem[]
  suggestedConnections?: Array<{
    fromId: string
    toId: string
    relationship: string
    confidence: number
  }>
}

/**
 * Find related content for a story
 */
export async function findRelatedToStory(
  storyId: string,
  limit: number = 5
): Promise<RelatedItem[]> {
  const supabase = getSupabase()

  // Get the story
  const { data: story } = await supabase
    .from('stories')
    .select('id, title, content, story_category, storyteller_id')
    .eq('id', storyId)
    .single()

  if (!story) return []

  const related: RelatedItem[] = []

  // Find stories in same category
  const { data: sameCategory } = await supabase
    .from('stories')
    .select('id, title, content')
    .eq('story_category', story.story_category)
    .eq('is_public', true)
    .neq('id', storyId)
    .limit(3)

  if (sameCategory) {
    for (const s of sameCategory) {
      related.push({
        id: s.id,
        type: 'story',
        title: s.title,
        summary: s.content?.substring(0, 150) + '...',
        url: `/stories/${s.id}`,
        similarity: 0.7,
        relationship: `Same category: ${story.story_category}`
      })
    }
  }

  // Find other stories by same storyteller
  if (story.storyteller_id) {
    const { data: sameTeller } = await supabase
      .from('stories')
      .select('id, title, content')
      .eq('storyteller_id', story.storyteller_id)
      .eq('is_public', true)
      .neq('id', storyId)
      .limit(2)

    if (sameTeller) {
      for (const s of sameTeller) {
        related.push({
          id: s.id,
          type: 'story',
          title: s.title,
          summary: s.content?.substring(0, 150) + '...',
          url: `/stories/${s.id}`,
          similarity: 0.8,
          relationship: 'Same storyteller'
        })
      }
    }

    // Add storyteller profile
    const { data: teller } = await supabase
      .from('profiles')
      .select('id, full_name, preferred_name, bio')
      .eq('id', story.storyteller_id)
      .single()

    if (teller) {
      related.push({
        id: teller.id,
        type: 'person',
        title: teller.preferred_name || teller.full_name,
        summary: teller.bio?.substring(0, 150),
        url: `/wiki/people/${teller.id}`,
        similarity: 0.9,
        relationship: 'Story author'
      })
    }
  }

  // Try vector similarity search (real cosine similarity scores)
  const vectorResults = await vectorFindSimilar(storyId, 'story', limit)

  // Merge vector results with SQL results, dedup by ID
  const allResults = [...related, ...vectorResults]
  const seen = new Map<string, RelatedItem>()
  for (const item of allResults) {
    const existing = seen.get(item.id)
    if (!existing || item.similarity > existing.similarity) {
      seen.set(item.id, item)
    }
  }

  return Array.from(seen.values())
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
}

/**
 * Find related content for a person
 */
export async function findRelatedToPerson(
  personId: string,
  limit: number = 5
): Promise<RelatedItem[]> {
  const supabase = getSupabase()

  const related: RelatedItem[] = []

  // Find their stories
  const { data: stories } = await supabase
    .from('stories')
    .select('id, title, content, story_category')
    .eq('storyteller_id', personId)
    .eq('is_public', true)
    .limit(5)

  if (stories) {
    for (const s of stories) {
      related.push({
        id: s.id,
        type: 'story',
        title: s.title,
        summary: s.content?.substring(0, 150) + '...',
        url: `/stories/${s.id}`,
        similarity: 0.9,
        relationship: 'Their story'
      })
    }
  }

  // Try vector similarity search
  const vectorResults = await vectorFindSimilar(personId, 'person', limit)

  const allResults = [...related, ...vectorResults]
  const seen = new Map<string, RelatedItem>()
  for (const item of allResults) {
    const existing = seen.get(item.id)
    if (!existing || item.similarity > existing.similarity) {
      seen.set(item.id, item)
    }
  }

  return Array.from(seen.values())
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
}

/**
 * Find related content for a knowledge entry
 */
export async function findRelatedToKnowledge(
  entryId: string,
  limit: number = 5
): Promise<RelatedItem[]> {
  const supabase = getSupabase()

  const { data: entry } = await supabase
    .from('knowledge_entries')
    .select('id, title, category, summary')
    .eq('id', entryId)
    .single()

  if (!entry) return []

  const related: RelatedItem[] = []

  // Find entries in same category
  const { data: sameCategory } = await supabase
    .from('knowledge_entries')
    .select('id, slug, title, summary')
    .eq('category', entry.category)
    .eq('is_public', true)
    .neq('id', entryId)
    .limit(3)

  if (sameCategory) {
    for (const k of sameCategory) {
      related.push({
        id: k.id,
        type: 'knowledge',
        title: k.title,
        summary: k.summary,
        url: `/wiki/${k.slug || k.id}`,
        similarity: 0.7,
        relationship: `Same category: ${entry.category}`
      })
    }
  }

  // Try vector similarity search
  const vectorResults = await vectorFindSimilar(entryId, 'knowledge', limit)

  const allResults = [...related, ...vectorResults]
  const seen = new Map<string, RelatedItem>()
  for (const item of allResults) {
    const existing = seen.get(item.id)
    if (!existing || item.similarity > existing.similarity) {
      seen.set(item.id, item)
    }
  }

  return Array.from(seen.values())
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
}

/**
 * Find related content for a service
 */
export async function findRelatedToService(
  serviceId: string,
  limit: number = 5
): Promise<RelatedItem[]> {
  const supabase = getSupabase()

  const { data: service } = await supabase
    .from('organization_services')
    .select('id, name, slug, description, service_category')
    .eq('id', serviceId)
    .single()

  if (!service) return []

  const related: RelatedItem[] = []

  // Find stories linked to this service
  const { data: storyLinks } = await supabase
    .from('service_story_links')
    .select('story_id, service_outcome')
    .eq('service_name', service.name)
    .limit(5)

  if (storyLinks && storyLinks.length > 0) {
    const storyIds = storyLinks.map(l => l.story_id)
    const { data: stories } = await supabase
      .from('stories')
      .select('id, title, content')
      .in('id', storyIds)
      .eq('is_public', true)
      .limit(3)

    if (stories) {
      for (const s of stories) {
        related.push({
          id: s.id,
          type: 'story',
          title: s.title,
          summary: s.content?.substring(0, 150) + '...',
          url: `/stories/${s.id}`,
          similarity: 0.8,
          relationship: `${service.name} story`
        })
      }
    }
  }

  // Find services in the same category
  if (service.service_category) {
    const { data: sameCategory } = await supabase
      .from('organization_services')
      .select('id, name, slug, description')
      .eq('service_category', service.service_category)
      .eq('is_active', true)
      .neq('id', serviceId)
      .limit(3)

    if (sameCategory) {
      for (const s of sameCategory) {
        related.push({
          id: s.id,
          type: 'service',
          title: s.name,
          summary: s.description?.substring(0, 150),
          url: `/services`,
          similarity: 0.7,
          relationship: `Same category: ${service.service_category}`
        })
      }
    }
  }

  // Find media tagged with this service
  const { data: media } = await supabase
    .from('media_files')
    .select('id, title, file_name, public_url')
    .contains('tags', [`service:${service.slug}`])
    .eq('is_public', true)
    .limit(3)

  if (media) {
    for (const m of media) {
      related.push({
        id: m.id,
        type: 'media',
        title: m.title || m.file_name,
        url: m.public_url || `/picc/media/${m.id}`,
        similarity: 0.6,
        relationship: `${service.name} photo`
      })
    }
  }

  return related
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
}

/**
 * Find related content for a media item
 */
export async function findRelatedToMedia(
  mediaId: string,
  limit: number = 5
): Promise<RelatedItem[]> {
  const supabase = getSupabase()

  const { data: media } = await supabase
    .from('media_files')
    .select('id, title, file_name, tags, page_context')
    .eq('id', mediaId)
    .single()

  if (!media) return []

  const related: RelatedItem[] = []
  const tags: string[] = media.tags || []

  // Find service from tags (e.g., "service:aged-care")
  const serviceTag = tags.find(t => t.startsWith('service:'))
  if (serviceTag) {
    const serviceSlug = serviceTag.replace('service:', '')
    const { data: service } = await supabase
      .from('organization_services')
      .select('id, name, slug, description')
      .eq('slug', serviceSlug)
      .single()

    if (service) {
      related.push({
        id: service.id,
        type: 'service',
        title: service.name,
        summary: service.description?.substring(0, 150),
        url: `/services`,
        similarity: 0.9,
        relationship: 'Tagged service'
      })
    }
  }

  // Find other media with overlapping tags
  if (tags.length > 0) {
    const { data: similarMedia } = await supabase
      .from('media_files')
      .select('id, title, file_name, public_url, tags')
      .eq('is_public', true)
      .neq('id', mediaId)
      .overlaps('tags', tags)
      .limit(4)

    if (similarMedia) {
      for (const m of similarMedia) {
        const overlapCount = (m.tags || []).filter((t: string) => tags.includes(t)).length
        related.push({
          id: m.id,
          type: 'media',
          title: m.title || m.file_name,
          url: m.public_url || `/picc/media/${m.id}`,
          similarity: Math.min(0.5 + overlapCount * 0.15, 0.9),
          relationship: 'Similar tags'
        })
      }
    }
  }

  return related
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
}

/**
 * Find related content for a quote
 */
export async function findRelatedToQuote(
  quoteId: string,
  limit: number = 5
): Promise<RelatedItem[]> {
  const supabase = getSupabase()

  const related: RelatedItem[] = []

  // Try elder_quotes first
  const { data: elderQuote } = await supabase
    .from('elder_quotes')
    .select('id, quote_text, speaker_name, context, theme')
    .eq('id', quoteId)
    .single()

  if (elderQuote) {
    // Find stories by keyword from the quote context/theme
    if (elderQuote.theme) {
      const { data: stories } = await supabase
        .from('stories')
        .select('id, title, content')
        .eq('is_public', true)
        .ilike('title', `%${elderQuote.theme}%`)
        .limit(3)

      if (stories) {
        for (const s of stories) {
          related.push({
            id: s.id,
            type: 'story',
            title: s.title,
            summary: s.content?.substring(0, 150) + '...',
            url: `/stories/${s.id}`,
            similarity: 0.7,
            relationship: `Theme: ${elderQuote.theme}`
          })
        }
      }
    }

    // Find other quotes by same speaker
    if (elderQuote.speaker_name) {
      const { data: otherQuotes } = await supabase
        .from('elder_quotes')
        .select('id, quote_text, speaker_name, theme')
        .eq('speaker_name', elderQuote.speaker_name)
        .neq('id', quoteId)
        .limit(2)

      if (otherQuotes) {
        for (const q of otherQuotes) {
          related.push({
            id: q.id,
            type: 'quote',
            title: `"${q.quote_text.substring(0, 60)}..."`,
            summary: `— ${q.speaker_name}`,
            url: `/voices`,
            similarity: 0.8,
            relationship: 'Same speaker'
          })
        }
      }
    }

    return related.sort((a, b) => b.similarity - a.similarity).slice(0, limit)
  }

  // Try extracted_quotes
  const { data: extractedQuote } = await supabase
    .from('extracted_quotes')
    .select('id, quote_text, attribution, story_id, themes')
    .eq('id', quoteId)
    .single()

  if (extractedQuote?.story_id) {
    const { data: story } = await supabase
      .from('stories')
      .select('id, title, content')
      .eq('id', extractedQuote.story_id)
      .single()

    if (story) {
      related.push({
        id: story.id,
        type: 'story',
        title: story.title,
        summary: story.content?.substring(0, 150) + '...',
        url: `/stories/${story.id}`,
        similarity: 0.9,
        relationship: 'Source story'
      })
    }
  }

  return related.sort((a, b) => b.similarity - a.similarity).slice(0, limit)
}

/**
 * Find related content for a financial entry
 */
export async function findRelatedToFinancial(
  financialId: string,
  limit: number = 5
): Promise<RelatedItem[]> {
  const supabase = getSupabase()

  const { data: financial } = await supabase
    .from('annual_financials')
    .select('id, fiscal_year, total_income')
    .eq('id', financialId)
    .single()

  if (!financial) return []

  const related: RelatedItem[] = []

  // Find services active during that fiscal year
  const { data: services } = await supabase
    .from('organization_services')
    .select('id, name, slug, description')
    .eq('is_active', true)
    .limit(5)

  if (services) {
    for (const s of services) {
      related.push({
        id: s.id,
        type: 'service',
        title: s.name,
        summary: s.description?.substring(0, 150),
        url: `/services`,
        similarity: 0.6,
        relationship: `Active in ${financial.fiscal_year}`
      })
    }
  }

  // Find knowledge entries about the fiscal year
  if (financial.fiscal_year) {
    const { data: knowledge } = await supabase
      .from('knowledge_entries')
      .select('id, slug, title, summary')
      .eq('is_public', true)
      .ilike('title', `%${financial.fiscal_year}%`)
      .limit(3)

    if (knowledge) {
      for (const k of knowledge) {
        related.push({
          id: k.id,
          type: 'knowledge',
          title: k.title,
          summary: k.summary,
          url: `/wiki/${k.slug || k.id}`,
          similarity: 0.7,
          relationship: `FY ${financial.fiscal_year}`
        })
      }
    }
  }

  return related
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
}

/**
 * AI-powered relationship discovery
 * Suggests new connections between content items
 */
export async function discoverConnections(
  items: Array<{ id: string; title: string; content: string; type: string }>,
  existingConnections: Array<{ from: string; to: string }> = []
): Promise<Array<{
  fromId: string
  toId: string
  relationship: string
  confidence: number
}>> {
  if (items.length < 2) return []

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 800,
      system: `You are an expert at finding meaningful connections between pieces of content in an Indigenous community knowledge base.
Look for:
- Thematic connections (shared topics, themes)
- People connections (mentioned individuals)
- Place connections (shared locations)
- Time connections (shared time periods)
- Cultural connections (shared practices, traditions)

Respond with JSON:
{
  "connections": [
    {"from": "id1", "to": "id2", "relationship": "description", "confidence": 0.0-1.0}
  ]
}`,
      messages: [{
        role: 'user',
        content: `Find connections between these items:\n\n${items.map(i =>
          `[${i.id}] ${i.type}: ${i.title}\n${i.content.substring(0, 200)}`
        ).join('\n\n')}`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (!jsonMatch) return []

    const parsed = JSON.parse(jsonMatch[0])
    const existingSet = new Set(existingConnections.map(c => `${c.from}-${c.to}`))

    return (parsed.connections || [])
      .filter((c: any) => !existingSet.has(`${c.from}-${c.to}`))
      .map((c: any) => ({
        fromId: c.from,
        toId: c.to,
        relationship: c.relationship,
        confidence: c.confidence || 0.5
      }))

  } catch (error) {
    console.error('Connection discovery error:', error)
    return []
  }
}

/**
 * Get all related content for any item
 */
export async function findRelatedContent(
  id: string,
  type: RelatedContentType,
  limit: number = 5
): Promise<RelatedItem[]> {
  switch (type) {
    case 'story':
      return findRelatedToStory(id, limit)
    case 'person':
      return findRelatedToPerson(id, limit)
    case 'knowledge':
      return findRelatedToKnowledge(id, limit)
    case 'service':
      return findRelatedToService(id, limit)
    case 'media':
      return findRelatedToMedia(id, limit)
    case 'quote':
      return findRelatedToQuote(id, limit)
    case 'financial':
      return findRelatedToFinancial(id, limit)
    default:
      return []
  }
}
