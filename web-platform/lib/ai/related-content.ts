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

export interface RelatedItem {
  id: string
  type: 'story' | 'person' | 'knowledge' | 'media'
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

  // Find related knowledge entries by content similarity
  const searchQuery = story.title + ' ' + (story.content || '').substring(0, 200)
  const { data: knowledge } = await supabase
    .from('knowledge_entries')
    .select('id, slug, title, summary')
    .eq('is_public', true)
    .or(`title.ilike.%${story.title.split(' ')[0]}%,summary.ilike.%${story.story_category}%`)
    .limit(3)

  if (knowledge) {
    for (const k of knowledge) {
      related.push({
        id: k.id,
        type: 'knowledge',
        title: k.title,
        summary: k.summary,
        url: `/wiki/${k.slug || k.id}`,
        similarity: 0.6,
        relationship: 'Related topic'
      })
    }
  }

  // Sort by similarity and limit
  return related
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

  return related.slice(0, limit)
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

  // Find related stories
  const { data: stories } = await supabase
    .from('stories')
    .select('id, title, content')
    .eq('is_public', true)
    .ilike('title', `%${entry.title.split(' ')[0]}%`)
    .limit(2)

  if (stories) {
    for (const s of stories) {
      related.push({
        id: s.id,
        type: 'story',
        title: s.title,
        summary: s.content?.substring(0, 150) + '...',
        url: `/stories/${s.id}`,
        similarity: 0.5,
        relationship: 'Related story'
      })
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
  type: 'story' | 'person' | 'knowledge',
  limit: number = 5
): Promise<RelatedItem[]> {
  switch (type) {
    case 'story':
      return findRelatedToStory(id, limit)
    case 'person':
      return findRelatedToPerson(id, limit)
    case 'knowledge':
      return findRelatedToKnowledge(id, limit)
    default:
      return []
  }
}
