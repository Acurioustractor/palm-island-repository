import { tool, jsonSchema, type Tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { buildKnowledgeGraph } from '@/lib/ai/knowledge-graph'

// Zod v4's toJSONSchema() produces valid JSON Schema but the AI SDK tool()
// function doesn't auto-convert Zod v4 schemas correctly for Anthropic's API.
// This helper converts to JSON Schema explicitly via jsonSchema() wrapper.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function defineTool<TInput, TOutput>(def: { description: string; parameters: z.ZodType<TInput>; execute: (input: TInput) => Promise<TOutput> }): Tool<TInput, TOutput> {
  const js = def.parameters.toJSONSchema()
  // Remove $schema field — Anthropic API doesn't accept it
  delete (js as Record<string, unknown>)['$schema']
  return (tool as any)({
    description: def.description,
    parameters: jsonSchema(js as any),
    inputSchema: jsonSchema(js as any),
    execute: def.execute,
  }) as Tool<TInput, TOutput>
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function buildPublicUrl(bucket: string, path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
}

// ─── Schema definitions ──────────────────────────────────────────────────────

const searchStoriesSchema = z.object({
  query: z.string().describe('Search query — topic, person name, service, or keyword'),
  category: z.string().optional().describe('Filter by story category'),
  tags: z.array(z.string()).optional().describe('Filter by tags'),
  limit: z.number().min(1).max(6).default(4).describe('Number of stories to return'),
})

const getServiceInfoSchema = z.object({
  serviceSlug: z.string().optional().describe('Service URL slug (e.g. "health-services")'),
  serviceName: z.string().optional().describe('Service name to search for'),
})

const exploreTimelineSchema = z.object({
  era: z.enum(['founding', 'early', 'growth', 'recent', 'all']).default('all')
    .describe('Era to explore: founding (2005-2010), early (2010-2015), growth (2015-2020), recent (2020-2025), or all'),
  dateFrom: z.string().optional().describe('Start fiscal year (e.g. "2020-21")'),
  dateTo: z.string().optional().describe('End fiscal year (e.g. "2024-25")'),
  topic: z.string().optional().describe('Topic to filter by (e.g. "health", "governance")'),
  limit: z.number().min(1).max(20).default(10).describe('Number of events to return'),
})

const findQuotesSchema = z.object({
  themes: z.array(z.string()).optional().describe('Themes to search for (e.g. ["health", "elders", "community"])'),
  limit: z.number().min(1).max(6).default(3).describe('Number of quotes to return'),
})

const getPhotoGallerySchema = z.object({
  topic: z.string().optional().describe('Topic to search photos for'),
  storyId: z.string().optional().describe('Specific story ID to get photos from'),
  serviceSlug: z.string().optional().describe('Service slug to find related photos'),
  limit: z.number().min(1).max(12).default(6).describe('Number of photos to return'),
})

const exploreKnowledgeGraphSchema = z.object({
  centeredOn: z.string().optional().describe('Center the graph on this entity (e.g. "health", "elders")'),
  types: z.array(z.string()).optional().describe('Node types to include: story, person, place, concept, knowledge'),
  depth: z.number().min(1).max(3).default(2).describe('How many connections deep to explore'),
})

const submitCommunityVisionSchema = z.object({
  vision: z.string().min(10).describe('The vision or aspiration text'),
  category: z.enum(['services', 'culture', 'youth', 'economic', 'environment', 'governance', 'other'])
    .describe('Category of the vision'),
  authorName: z.string().optional().describe('Name of the person sharing (if not anonymous)'),
  isAnonymous: z.boolean().default(true).describe('Whether the submission is anonymous'),
})

// ─── Type helpers ────────────────────────────────────────────────────────────

type SearchStoriesInput = z.infer<typeof searchStoriesSchema>
type GetServiceInfoInput = z.infer<typeof getServiceInfoSchema>
type ExploreTimelineInput = z.infer<typeof exploreTimelineSchema>
type FindQuotesInput = z.infer<typeof findQuotesSchema>
type GetPhotoGalleryInput = z.infer<typeof getPhotoGallerySchema>
type ExploreKnowledgeGraphInput = z.infer<typeof exploreKnowledgeGraphSchema>
type SubmitCommunityVisionInput = z.infer<typeof submitCommunityVisionSchema>

// ─── searchStories ───────────────────────────────────────────────────────────

export const searchStories = defineTool({
  description: 'Search PICC stories by topic, person, service, or keyword. Returns story cards with images.',
  parameters: searchStoriesSchema,
  execute: async (input: SearchStoriesInput) => {
    const { query, category, tags, limit } = input
    const supabase = getSupabase()

    let dbQuery = supabase
      .from('stories')
      .select(`
        id, title, content, category, tags, story_date, published_at, location,
        story_media (file_path, supabase_bucket, alt_text, media_type)
      `)
      .eq('status', 'published')
      .eq('is_public', true)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (category) {
      dbQuery = dbQuery.eq('category', category)
    }

    if (tags && tags.length > 0) {
      dbQuery = dbQuery.overlaps('tags', tags)
    }

    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    }

    const { data: stories, error } = await dbQuery

    if (error) {
      console.error('searchStories error:', error)
      return { stories: [], total: 0 }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = (stories || []).map((s: any) => {
      const media = s.story_media as Array<{
        file_path: string; supabase_bucket: string; alt_text: string | null; media_type: string
      }> | null
      const heroImage = media?.find((m: { media_type: string }) => m.media_type === 'image')
      return {
        id: s.id,
        title: s.title,
        excerpt: typeof s.content === 'string' ? s.content.slice(0, 200) + '...' : '',
        category: s.category,
        tags: s.tags,
        storyDate: s.story_date,
        publishedAt: s.published_at,
        location: s.location,
        heroImage: heroImage
          ? buildPublicUrl(heroImage.supabase_bucket, heroImage.file_path)
          : null,
        heroAlt: heroImage?.alt_text || s.title,
      }
    })

    return { stories: results, total: results.length }
  },
})

// ─── getServiceInfo ──────────────────────────────────────────────────────────

export const getServiceInfo = defineTool({
  description: 'Get detailed information about a PICC service, including metrics and achievements.',
  parameters: getServiceInfoSchema,
  execute: async (input: GetServiceInfoInput) => {
    const { serviceSlug, serviceName } = input
    const supabase = getSupabase()

    let query = supabase
      .from('organization_services')
      .select('id, name, slug, description, service_category, is_active')
      .eq('is_active', true)

    if (serviceSlug) {
      query = query.eq('slug', serviceSlug)
    } else if (serviceName) {
      query = query.ilike('name', `%${serviceName}%`)
    }

    const { data: services } = await query.limit(1)
    const service = services?.[0]
    if (!service) return { found: false, service: null, metrics: null, achievements: [] }

    const [metricsResult, achievementsResult] = await Promise.all([
      supabase
        .from('service_metrics')
        .select('fiscal_year, clients_served, sessions_delivered, events_held, staff_count, key_achievement, headline_stat_value, headline_stat_label')
        .eq('organization_service_id', service.id)
        .order('fiscal_year', { ascending: false })
        .limit(3),
      supabase
        .from('governance_achievements')
        .select('achievement_text, category, fiscal_year')
        .eq('category', service.service_category || service.slug)
        .order('fiscal_year', { ascending: false })
        .limit(5),
    ])

    return {
      found: true,
      service: {
        name: service.name,
        slug: service.slug,
        description: service.description,
        category: service.service_category,
      },
      metrics: metricsResult.data?.[0] || null,
      recentMetrics: metricsResult.data || [],
      achievements: achievementsResult.data || [],
    }
  },
})

// ─── exploreTimeline ─────────────────────────────────────────────────────────

export const exploreTimeline = defineTool({
  description: 'Explore PICC\'s historical timeline of achievements and events by era or topic.',
  parameters: exploreTimelineSchema,
  execute: async (input: ExploreTimelineInput) => {
    const { era, dateFrom, dateTo, topic, limit } = input
    const supabase = getSupabase()

    const eraRanges: Record<string, [string, string]> = {
      founding: ['2005-06', '2009-10'],
      early: ['2010-11', '2014-15'],
      growth: ['2015-16', '2019-20'],
      recent: ['2020-21', '2024-25'],
      all: ['2005-06', '2024-25'],
    }

    const [from, to] = dateFrom && dateTo
      ? [dateFrom, dateTo]
      : eraRanges[era] || eraRanges.all

    let query = supabase
      .from('governance_achievements')
      .select('id, achievement_text, category, fiscal_year, display_order')
      .gte('fiscal_year', from)
      .lte('fiscal_year', to)
      .order('fiscal_year', { ascending: true })
      .order('display_order')
      .limit(limit)

    if (topic) {
      query = query.ilike('category', `%${topic}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('exploreTimeline error:', error)
      return { events: [], era, total: 0 }
    }

    return {
      events: data || [],
      era,
      dateRange: { from, to },
      total: data?.length || 0,
    }
  },
})

// ─── findQuotes ──────────────────────────────────────────────────────────────

export const findQuotes = defineTool({
  description: 'Find community quotes by theme or impact. Returns quotes with attribution from published stories.',
  parameters: findQuotesSchema,
  execute: async (input: FindQuotesInput) => {
    const { themes, limit } = input
    const supabase = getSupabase()

    let query = supabase
      .from('story_quotes')
      .select(`
        id, quote_text, themes, impact_score, is_featured,
        stories:story_id (id, title, status)
      `)
      .order('impact_score', { ascending: false, nullsFirst: false })
      .limit(limit * 2)

    if (themes && themes.length > 0) {
      query = query.overlaps('themes', themes)
    }

    const { data, error } = await query

    if (error) {
      console.error('findQuotes error:', error)
      return { quotes: [], total: 0 }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filtered = (data || [] as any[])
      .filter((q: any) => {
        const story = q.stories as { status: string } | null
        return story && story.status === 'published'
      })
      .slice(0, limit)
      .map((q: any) => {
        const story = q.stories as { id: string; title: string } | null
        return {
          id: q.id,
          text: q.quote_text,
          themes: q.themes,
          impactScore: q.impact_score,
          isFeatured: q.is_featured,
          storyTitle: story?.title || null,
          storyId: story?.id || null,
        }
      })

    return { quotes: filtered, total: filtered.length }
  },
})

// ─── getPhotoGallery ─────────────────────────────────────────────────────────

export const getPhotoGallery = defineTool({
  description: 'Get photos from PICC stories by topic, story, or service.',
  parameters: getPhotoGallerySchema,
  execute: async (input: GetPhotoGalleryInput) => {
    const { topic, storyId, serviceSlug, limit } = input
    const supabase = getSupabase()

    if (storyId) {
      const { data } = await supabase
        .from('story_media')
        .select('id, file_path, file_name, alt_text, caption, supabase_bucket')
        .eq('story_id', storyId)
        .eq('media_type', 'image')
        .limit(limit)

      return {
        photos: (data || []).map(m => ({
          id: m.id,
          url: buildPublicUrl(m.supabase_bucket, m.file_path),
          alt: m.alt_text || m.file_name,
          caption: m.caption,
        })),
        total: data?.length || 0,
      }
    }

    let storyQuery = supabase
      .from('stories')
      .select('id')
      .eq('status', 'published')
      .eq('is_public', true)
      .limit(10)

    if (serviceSlug) {
      storyQuery = storyQuery.eq('related_service', serviceSlug)
    } else if (topic) {
      storyQuery = storyQuery.or(`title.ilike.%${topic}%,tags.cs.{${topic}}`)
    }

    const { data: storyData } = await storyQuery
    if (!storyData || storyData.length === 0) return { photos: [], total: 0 }

    const storyIds = storyData.map(s => s.id)
    const { data: mediaData } = await supabase
      .from('story_media')
      .select('id, file_path, file_name, alt_text, caption, supabase_bucket')
      .eq('media_type', 'image')
      .in('story_id', storyIds)
      .limit(limit)

    return {
      photos: (mediaData || []).map(m => ({
        id: m.id,
        url: buildPublicUrl(m.supabase_bucket, m.file_path),
        alt: m.alt_text || m.file_name,
        caption: m.caption,
      })),
      total: mediaData?.length || 0,
    }
  },
})

// ─── exploreKnowledgeGraph ───────────────────────────────────────────────────

export const exploreKnowledgeGraph = defineTool({
  description: 'Explore the knowledge graph showing connections between stories, people, places, and concepts.',
  parameters: exploreKnowledgeGraphSchema,
  execute: async (input: ExploreKnowledgeGraphInput) => {
    const { centeredOn, types, depth } = input
    const graph = await buildKnowledgeGraph({
      limit: 50,
      types: types as string[] | undefined,
    })

    if (centeredOn) {
      const centerNode = graph.nodes.find(n =>
        n.label.toLowerCase().includes(centeredOn.toLowerCase()) ||
        n.id.toLowerCase().includes(centeredOn.toLowerCase())
      )

      if (centerNode) {
        const included = new Set<string>([centerNode.id])
        let current = [centerNode.id]

        for (let d = 0; d < depth; d++) {
          const next: string[] = []
          for (const edge of graph.edges) {
            if (current.includes(edge.source) && !included.has(edge.target)) {
              included.add(edge.target)
              next.push(edge.target)
            }
            if (current.includes(edge.target) && !included.has(edge.source)) {
              included.add(edge.source)
              next.push(edge.source)
            }
          }
          current = next
        }

        const nodes = graph.nodes.filter(n => included.has(n.id))
        const edges = graph.edges.filter(e => included.has(e.source) && included.has(e.target))

        return {
          nodes,
          edges,
          centeredOn: centerNode.label,
          stats: { totalNodes: nodes.length, totalEdges: edges.length },
        }
      }
    }

    return {
      nodes: graph.nodes.slice(0, 30),
      edges: graph.edges.filter(e =>
        graph.nodes.slice(0, 30).some(n => n.id === e.source) &&
        graph.nodes.slice(0, 30).some(n => n.id === e.target)
      ),
      centeredOn: null,
      stats: graph.metadata,
    }
  },
})

// ─── submitCommunityVision ───────────────────────────────────────────────────

export const submitCommunityVision = defineTool({
  description: 'Record a community member\'s vision or aspiration for PICC\'s future (20th anniversary).',
  parameters: submitCommunityVisionSchema,
  execute: async (input: SubmitCommunityVisionInput) => {
    const { vision, category, authorName, isAnonymous } = input
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('community_visions')
      .insert({
        vision_text: vision,
        category,
        author_name: isAnonymous ? null : authorName,
        is_anonymous: isAnonymous,
        source: 'explore-chat',
      })
      .select('id, created_at')
      .single()

    if (error) {
      console.error('submitCommunityVision error:', error)
      return { success: false, error: 'Failed to save vision. Please try again.' }
    }

    const { count } = await supabase
      .from('community_visions')
      .select('*', { count: 'exact', head: true })

    return {
      success: true,
      id: data.id,
      category,
      totalVisions: count || 0,
      message: 'Your vision has been recorded and will be reviewed by the PICC team.',
    }
  },
})

// ─── Export all tools ────────────────────────────────────────────────────────

export const exploreTools = {
  searchStories,
  getServiceInfo,
  exploreTimeline,
  findQuotes,
  getPhotoGallery,
  exploreKnowledgeGraph,
  submitCommunityVision,
}
