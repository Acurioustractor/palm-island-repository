import { tool, jsonSchema, type Tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { buildKnowledgeGraph } from '@/lib/ai/knowledge-graph'
import { checkCompleteness, type CompletenessReport, type ServiceCompleteness } from '@/lib/content-readiness/check-completeness'

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

/** Resolve a media_files row to a usable URL — prefer public_url, fall back to storage path */
function resolveMediaUrl(row: { public_url?: string | null; file_path?: string | null; bucket_name?: string | null }): string | null {
  if (row.public_url) return row.public_url
  if (row.file_path && row.bucket_name) return buildPublicUrl(row.bucket_name, row.file_path)
  if (row.file_path) return buildPublicUrl('story-media', row.file_path)
  return null
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
    .describe('Era to explore: founding (2009-2013), early (2013-2017), growth (2017-2021), recent (2021-2026), or all'),
  dateFrom: z.string().optional().describe('Start fiscal year (e.g. "2020-21")'),
  dateTo: z.string().optional().describe('End fiscal year (e.g. "2024-25")'),
  topic: z.string().optional().describe('Topic to filter by (e.g. "health", "governance")'),
  limit: z.number().min(1).max(20).default(10).describe('Number of events to return'),
})

const findQuotesSchema = z.object({
  themes: z.array(z.string()).optional().describe('Themes to search for (e.g. ["health", "elders", "community"])'),
  query: z.string().optional().describe('Text search — finds quotes from stories matching this keyword in title (e.g. "elders", "healing")'),
  limit: z.number().min(1).max(6).default(3).describe('Number of quotes to return'),
})

const getPhotoGallerySchema = z.object({
  topic: z.string().optional().describe('Topic to search photos for (e.g. "photo studio", "elders trip", "community event")'),
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
        story_media (file_path, supabase_bucket, alt_text, media_type),
        profiles:storyteller_id (profile_image_url, preferred_name, full_name)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (category) {
      dbQuery = dbQuery.eq('category', category)
    }

    if (tags && tags.length > 0) {
      dbQuery = dbQuery.overlaps('tags', tags)
    }

    if (query) {
      // Try exact phrase first, then split into significant keywords for title matching
      const words = query.split(/\s+/).filter(w => w.length >= 4)
      if (words.length > 1) {
        // Match any keyword in title, or full phrase in content
        const titleConditions = words.map(w => `title.ilike.%${w}%`)
        dbQuery = dbQuery.or([...titleConditions, `content.ilike.%${query}%`].join(','))
      } else {
        dbQuery = dbQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      }
    }

    let { data: stories, error } = await dbQuery

    if (error) {
      console.error('searchStories error:', error)
      return { stories: [], total: 0 }
    }

    // Fallback: if query returned nothing, return most recent published stories
    if ((!stories || stories.length === 0) && query) {
      const { data: fallback } = await supabase
        .from('stories')
        .select(`
          id, title, content, category, tags, story_date, published_at, location,
          story_media (file_path, supabase_bucket, alt_text, media_type),
          profiles:storyteller_id (profile_image_url, preferred_name, full_name)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit)
      stories = fallback
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = (stories || []).map((s: any) => {
      const media = s.story_media as Array<{
        file_path: string; supabase_bucket: string; alt_text: string | null; media_type: string
      }> | null
      const heroImage = media?.find((m: { media_type: string }) => m.media_type === 'image')
      const profile = s.profiles as { profile_image_url: string | null; preferred_name: string | null; full_name: string } | null
      // Use story_media hero first, fall back to storyteller profile image
      const imageUrl = heroImage
        ? buildPublicUrl(heroImage.supabase_bucket, heroImage.file_path)
        : profile?.profile_image_url || null
      return {
        id: s.id,
        title: s.title,
        excerpt: typeof s.content === 'string'
          ? s.content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 200) + '...'
          : '',
        category: s.category,
        tags: s.tags,
        storyDate: s.story_date,
        publishedAt: s.published_at,
        location: s.location,
        heroImage: imageUrl,
        heroAlt: heroImage?.alt_text || profile?.preferred_name || profile?.full_name || s.title,
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

    // Try slug first, then name search, then fuzzy slug match
    let service: any = null

    if (serviceSlug) {
      const { data } = await supabase
        .from('organization_services')
        .select('id, name, slug, description, service_category, is_active')
        .eq('is_active', true)
        .eq('slug', serviceSlug)
        .limit(1)
      service = data?.[0]
    }

    // Fallback: search by name (handles both serviceName and serviceSlug as text)
    if (!service) {
      const searchText = serviceName || serviceSlug?.replace(/[-_]/g, ' ') || ''
      if (searchText) {
        const { data } = await supabase
          .from('organization_services')
          .select('id, name, slug, description, service_category, is_active')
          .eq('is_active', true)
          .ilike('name', `%${searchText}%`)
          .limit(1)
        service = data?.[0]
      }
    }
    if (!service) {
      // Return all active services as suggestions
      const { data: allServices } = await supabase
        .from('organization_services')
        .select('name, slug, description, service_category')
        .eq('is_active', true)
        .order('name')
      return {
        found: false,
        service: null,
        metrics: null,
        achievements: [],
        suggestions: (allServices || []).map((s: any) => ({
          name: s.name,
          slug: s.slug,
          description: s.description,
          category: s.service_category,
        })),
      }
    }

    const serviceTag = `service:${service.slug}`
    const [metricsResult, achievementsResult, photosResult] = await Promise.all([
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
      supabase
        .from('media_files')
        .select('id, public_url, file_path, bucket_name, title, alt_text')
        .contains('tags', [serviceTag])
        .eq('file_type', 'image')
        .is('deleted_at', null)
        .order('rating', { ascending: false, nullsFirst: false })
        .order('is_featured', { ascending: false })
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
      photos: (photosResult.data || [])
        .map((p: any) => ({ url: resolveMediaUrl(p), alt: p.alt_text || p.title || service.name }))
        .filter((p: any) => p.url !== null),
    }
  },
})

// ─── exploreTimeline ─────────────────────────────────────────────────────────

// Pre-PICC historical milestones (not in governance_achievements table)
const HISTORICAL_MILESTONES = [
  { id: 'hist-1', fiscal_year: '1914', category: 'history', achievement_text: 'Hull River Aboriginal Settlement established on Djiru people\'s land in the Mission Beach region of North Queensland', display_order: 1 },
  { id: 'hist-2', fiscal_year: '1918-03', category: 'history', achievement_text: 'Category 5 cyclone destroyed Hull River Settlement on 10 March 1918 — winds of 240-288 km/h and 305mm rain devastated the settlement', display_order: 2 },
  { id: 'hist-3', fiscal_year: '1918-06', category: 'history', achievement_text: 'Survivors of Hull River cyclone transferred to Palm Island (June 1918). Palm Island gazetted as Aboriginal reserve — people from 50+ language groups forcibly relocated over following decades', display_order: 3 },
  { id: 'hist-4', fiscal_year: '1985', category: 'history', achievement_text: 'Palm Island Community Company formed by a small group of concerned residents to fill service gaps left by government', display_order: 4 },
  { id: 'hist-5', fiscal_year: '2007', category: 'governance', achievement_text: 'PICC transitioned to community-controlled Aboriginal and Torres Strait Islander Corporation under CATSI Act', display_order: 5 },
  { id: 'hist-6', fiscal_year: '2009', category: 'governance', achievement_text: 'PICC begins formal governance framework and strategic planning', display_order: 6 },
  { id: 'hist-7', fiscal_year: '2017', category: 'governance', achievement_text: 'PICC awarded delegated authority for Child Safety — first Indigenous org in Queensland', display_order: 7 },
  { id: 'hist-8', fiscal_year: '2023', category: 'community', achievement_text: 'Elders Advisory Group journey to Hull River — reconnecting with history of forced removal', display_order: 8 },
]

export const exploreTimeline = defineTool({
  description: 'Explore PICC\'s historical timeline of achievements and events by era or topic. Includes pre-PICC history (Hull River, forced removals) and PICC operational milestones.',
  parameters: exploreTimelineSchema,
  execute: async (input: ExploreTimelineInput) => {
    const { era, dateFrom, dateTo, topic, limit } = input
    const supabase = getSupabase()

    const eraRanges: Record<string, [string, string]> = {
      founding: ['2009-10', '2012-13'],
      early: ['2013-14', '2016-17'],
      growth: ['2017-18', '2020-21'],
      recent: ['2021-22', '2025-26'],
      all: ['1914', '2025-26'],
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
      query = query.or(`category.ilike.%${topic}%,achievement_text.ilike.%${topic}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('exploreTimeline error:', error)
    }

    let events = data || []

    // Include historical milestones when relevant (pre-2007 era, history topic, or empty results)
    const includeHistory = from < '2007' || !events.length ||
      (topic && ['history', 'hull river', 'removal', 'founding', 'cyclone', 'reserve'].some(kw => topic.toLowerCase().includes(kw)))

    if (includeHistory) {
      const filtered = HISTORICAL_MILESTONES.filter(m => {
        if (topic && !m.achievement_text.toLowerCase().includes(topic.toLowerCase()) && !m.category.includes(topic.toLowerCase())) {
          return false
        }
        return m.fiscal_year >= from && m.fiscal_year <= to
      })
      events = [...filtered, ...events]
    }

    return {
      events,
      era,
      dateRange: { from, to },
      total: events.length,
    }
  },
})

// ─── findQuotes ──────────────────────────────────────────────────────────────

export const findQuotes = defineTool({
  description: 'Find community quotes by theme or impact. Returns quotes with attribution from published stories.',
  parameters: findQuotesSchema,
  execute: async (input: FindQuotesInput) => {
    const { themes, query: searchQuery, limit } = input
    const supabase = getSupabase()

    // Strategy: search by themes first, then supplement with story-title-matched quotes
    let allQuotes: any[] = []

    // 1. Theme-based search
    if (themes && themes.length > 0) {
      const { data } = await supabase
        .from('story_quotes')
        .select(`
          id, quote_text, themes, impact_score, is_featured, context_before,
          stories:story_id (id, title, status, storyteller_id,
            profiles:storyteller_id (full_name, preferred_name, profile_image_url, is_elder)
          )
        `)
        .overlaps('themes', themes)
        .order('impact_score', { ascending: false, nullsFirst: false })
        .limit(limit * 3)

      allQuotes = data || []
    }

    // 2. Story-title-matched quotes (finds quotes from stories about the topic even if themes are null)
    if (searchQuery && allQuotes.length < limit * 3) {
      const words = searchQuery.split(/\s+/).filter(w => w.length >= 4)
      const titleConditions = words.length > 0
        ? words.map(w => `title.ilike.%${w}%`).join(',')
        : `title.ilike.%${searchQuery}%`

      const { data: matchingStories } = await supabase
        .from('stories')
        .select('id')
        .eq('status', 'published')
        .or(titleConditions)
        .limit(20)

      if (matchingStories && matchingStories.length > 0) {
        const storyIds = matchingStories.map(s => s.id)
        const existingIds = new Set(allQuotes.map((q: any) => q.id))

        const { data: storyQuotes } = await supabase
          .from('story_quotes')
          .select(`
            id, quote_text, themes, impact_score, is_featured, context_before,
            stories:story_id (id, title, status, storyteller_id,
              profiles:storyteller_id (full_name, preferred_name, profile_image_url, is_elder)
            )
          `)
          .in('story_id', storyIds)
          .order('impact_score', { ascending: false, nullsFirst: false })
          .limit(limit * 3)

        const extra = (storyQuotes || []).filter((q: any) => !existingIds.has(q.id))
        allQuotes = [...allQuotes, ...extra]
      }
    }

    // Fallback: if no quotes matched, return highest-impact featured quotes
    if (allQuotes.length === 0) {
      const { data: featured } = await supabase
        .from('story_quotes')
        .select(`
          id, quote_text, themes, impact_score, is_featured, context_before,
          stories:story_id (id, title, status, storyteller_id,
            profiles:storyteller_id (full_name, preferred_name, profile_image_url, is_elder)
          )
        `)
        .order('impact_score', { ascending: false, nullsFirst: false })
        .limit(limit * 3)
      allQuotes = featured || []
    }

    const data = allQuotes

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const published = (data || [] as any[])
      .filter((q: any) => {
        const story = q.stories as { status: string } | null
        return story && story.status === 'published'
      })

    // Diversify: max 2 quotes per story to show range of voices
    const storyCount = new Map<string, number>()
    const diverse = published.filter((q: any) => {
      const storyId = (q.stories as any)?.id
      if (!storyId) return true
      const count = storyCount.get(storyId) || 0
      if (count >= 2) return false
      storyCount.set(storyId, count + 1)
      return true
    })

    const filtered = diverse.slice(0, limit).map((q: any) => {
      const story = q.stories as { id: string; title: string; profiles: any } | null
      const profile = story?.profiles as { full_name: string; preferred_name: string | null; profile_image_url: string | null; is_elder: boolean | null } | null
      // Extract actual speaker from context_before — multi-speaker stories attribute
      // quotes to the story's storyteller by default, which is often wrong.
      // Patterns: "Aunty Ethel on...", "Elder Frank said...", "Winni stood on...", "Cyndel described..."
      let speakerName: string | null = null
      const ctx = (q.context_before as string | null) || ''
      const speakerPatterns = [
        /^(?:Aunty|Uncle|Elder)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*[:—–\-]/,  // "Aunty Ethel:"
        /^(?:Aunty|Uncle|Elder)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:on|said|described|reflected|explained|recalled|shared|spoke|talked|honoured)/,  // "Aunty Ethel on..."
        /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*[:—–\-]/,  // "Frank:"
        /^([A-Z][a-z]+(?:e|i|y))\s+(?:on|said|described|reflected|explained|recalled|shared|spoke|talked|stood|honoured)/,  // "Winni stood on..." (name ending in vowel-like)
        /^([A-Z][a-z]{2,})\s+(?:on|said|described|reflected|explained|recalled|shared|spoke|talked|stood|honoured)/,  // "Cyndel described..."
      ]
      for (const pattern of speakerPatterns) {
        const match = ctx.match(pattern)
        if (match) {
          speakerName = match[1]
          // Restore honorific if it was in the context
          if (/^Aunty\s/i.test(ctx)) speakerName = `Aunty ${speakerName}`
          else if (/^Uncle\s/i.test(ctx)) speakerName = `Uncle ${speakerName}`
          else if (/^Elder\s/i.test(ctx)) speakerName = `Elder ${speakerName}`
          break
        }
      }
      // Only fall back to story storyteller if no speaker found in context
      if (!speakerName) {
        speakerName = profile?.preferred_name || profile?.full_name || null
      }
      return {
        id: q.id,
        text: q.quote_text,
        themes: q.themes,
        impactScore: q.impact_score,
        isFeatured: q.is_featured,
        storyTitle: story?.title || null,
        storyId: story?.id || null,
        speakerName,
        speakerImage: profile?.profile_image_url || null,
      }
    })

    return { quotes: filtered, total: filtered.length }
  },
})

// ─── getPhotoGallery ─────────────────────────────────────────────────────────

export const getPhotoGallery = defineTool({
  description: 'Get photos from PICC media library and stories by topic, story, service, or tags.',
  parameters: getPhotoGallerySchema,
  execute: async (input: GetPhotoGalleryInput) => {
    const { topic, storyId, serviceSlug, limit } = input
    const supabase = getSupabase()

    // 1. If a specific story is requested, get its attached media
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

    // 2. Search media_files library by tags first (most reliable source)
    let photos: { id: string; url: string; alt: string; caption: string | null }[] = []

    // Build tag candidates from the topic/service
    const tagCandidates: string[] = []
    if (serviceSlug) {
      tagCandidates.push(`service:${serviceSlug}`)
    } else if (topic) {
      const topicLower = topic.toLowerCase()
      // Map topic keywords to known project/event tags
      const tagMap: Array<{ keywords: string[]; tag: string }> = [
        { keywords: ['elder', 'cultural trip', 'elders trip'], tag: 'project:elders-trips' },
        { keywords: ['photo studio', 'photo shoot', 'professional photo'], tag: 'event:photo-shoot-oct-2025' },
        { keywords: ['storm', 'cyclone', 'recovery', 'kirrilee'], tag: 'project:storm-recovery' },
        { keywords: ['server', 'local server', 'digital', 'internet'], tag: 'project:local-server' },
        { keywords: ['centre', 'station', 'the centre'], tag: 'project:the-centre-the-station' },
        { keywords: ['health'], tag: 'service:health-services' },
        { keywords: ['family', 'children'], tag: 'service:family-services' },
        { keywords: ['justice'], tag: 'service:justice-services' },
        { keywords: ['youth'], tag: 'service:youth-services' },
        { keywords: ['housing'], tag: 'service:housing' },
        { keywords: ['crisis', 'safe house'], tag: 'service:crisis-services' },
      ]
      for (const { keywords, tag } of tagMap) {
        if (keywords.some(kw => topicLower.includes(kw))) {
          tagCandidates.push(tag)
        }
      }
      // Also try generic kebab-case as a tag and as project: prefix
      const kebab = topicLower.replace(/\s+/g, '-')
      tagCandidates.push(kebab, `project:${kebab}`)
    }

    // Tag-based search on media_files
    if (tagCandidates.length > 0) {
      const { data } = await supabase
        .from('media_files')
        .select('id, public_url, file_path, bucket_name, original_filename, title, description, tags, rating')
        .eq('file_type', 'image')
        .is('deleted_at', null)
        .overlaps('tags', tagCandidates)
        .order('rating', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(limit)

      photos = (data || [])
        .map(m => ({ id: m.id, url: resolveMediaUrl(m), alt: m.title || m.original_filename, caption: m.description }))
        .filter((p): p is typeof p & { url: string } => p.url !== null)
    }

    // 3. Fallback: text search on media_files filename/title/description
    if (photos.length < limit && topic) {
      const remaining = limit - photos.length
      const likeTerm = `%${topic}%`
      const { data } = await supabase
        .from('media_files')
        .select('id, public_url, file_path, bucket_name, original_filename, title, description, tags, rating')
        .eq('file_type', 'image')
        .is('deleted_at', null)
        .or(`original_filename.ilike.${likeTerm},title.ilike.${likeTerm},description.ilike.${likeTerm}`)
        .order('rating', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(remaining)

      const existingIds = new Set(photos.map(p => p.id))
      const extra = (data || [])
        .map(m => ({ id: m.id, url: resolveMediaUrl(m), alt: m.title || m.original_filename, caption: m.description }))
        .filter((p): p is typeof p & { url: string } => p.url !== null)
        .filter(m => !existingIds.has(m.id))
      photos = [...photos, ...extra].slice(0, limit)
    }

    // 4. Last resort: search story_media via related stories
    if (photos.length < limit) {
      const remaining = limit - photos.length
      let storyQuery = supabase
        .from('stories')
        .select('id')
        .eq('status', 'published')
        .limit(10)

      if (serviceSlug) {
        storyQuery = storyQuery.eq('related_service', serviceSlug)
      } else if (topic) {
        storyQuery = storyQuery.or(`title.ilike.%${topic}%,tags.cs.{${topic}}`)
      }

      const { data: storyData } = await storyQuery
      if (storyData && storyData.length > 0) {
        const storyIds = storyData.map(s => s.id)
        const { data: mediaData } = await supabase
          .from('story_media')
          .select('id, file_path, file_name, alt_text, caption, supabase_bucket')
          .eq('media_type', 'image')
          .in('story_id', storyIds)
          .limit(remaining)

        const existingIds = new Set(photos.map(p => p.id))
        const storyPhotos = (mediaData || [])
          .filter(m => !existingIds.has(m.id))
          .map(m => ({
            id: m.id,
            url: buildPublicUrl(m.supabase_bucket, m.file_path),
            alt: m.alt_text || m.file_name,
            caption: m.caption,
          }))
        photos = [...photos, ...storyPhotos].slice(0, limit)
      }
    }

    return {
      photos,
      total: photos.length,
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

// ─── getCommunityVisions ────────────────────────────────────────────────────

const getCommunityVisionsSchema = z.object({
  category: z.string().optional().describe('Filter by category: youth, health, culture, economic, governance, environment'),
  limit: z.number().min(1).max(20).default(10).describe('Number of visions to return'),
})

type GetCommunityVisionsInput = z.infer<typeof getCommunityVisionsSchema>

export const getCommunityVisions = defineTool({
  description: 'Get community visions and aspirations for PICC\'s future and next 20 years. Shows what community members, Elders, and staff envision for Palm Island.',
  parameters: getCommunityVisionsSchema,
  execute: async (input: GetCommunityVisionsInput) => {
    const { category, limit } = input
    const supabase = getSupabase()

    let query = supabase
      .from('community_visions')
      .select('id, vision_text, category, author_name, is_anonymous, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (category) {
      query = query.eq('category', category)
    }

    const { data: visions, error } = await query

    if (error) {
      console.error('getCommunityVisions error:', error)
      return { visions: [], total: 0 }
    }

    // Also get future-themed elder quotes
    const { data: elderQuotes } = await supabase
      .from('elder_quotes')
      .select('id, text, speaker_name, speaker_role, theme')
      .or('text.ilike.%future%,text.ilike.%next%,theme.ilike.%future%,theme.ilike.%vision%')
      .limit(5)

    return {
      visions: (visions || []).map((v: any) => ({
        text: v.vision_text,
        category: v.category,
        author: v.is_anonymous ? 'Community member' : (v.author_name || 'Community member'),
        date: v.created_at,
      })),
      elderVoices: (elderQuotes || []).map((q: any) => ({
        text: q.text,
        speaker: q.speaker_name,
        role: q.speaker_role,
        theme: q.theme,
      })),
      total: visions?.length || 0,
    }
  },
})

// ─── getInnovationProjects ──────────────────────────────────────────────────

const getInnovationProjectsSchema = z.object({
  projectSlug: z.string().optional().describe('Project slug to get details for a specific project'),
  status: z.string().optional().describe('Filter by status: active, in_progress, planning, completed'),
})

type GetInnovationProjectsInput = z.infer<typeof getInnovationProjectsSchema>

export const getInnovationProjects = defineTool({
  description: 'Get information about PICC innovation projects. Projects include: The Centre & The Station (Townsville hub), Elders Cultural Trips, Photo Studio, Healthy Meals, On-Country Server, Movember, Recycling/Goods, Annual Report. Use this for ANY question about PICC projects, initiatives, or "what is [project name]?".',
  parameters: getInnovationProjectsSchema,
  execute: async (input: GetInnovationProjectsInput) => {
    let { projectSlug, status } = input
    const supabase = getSupabase()

    // Fuzzy slug matching — try exact slug first, then search by name
    if (projectSlug) {
      const { data: exact } = await supabase
        .from('projects')
        .select('id, name, slug, description, tagline, status, hero_image_url, target_beneficiaries, actual_beneficiaries, budget_total, budget_spent')
        .eq('slug', projectSlug)
        .limit(1)

      if (!exact || exact.length === 0) {
        // Try fuzzy: convert slug to name search
        const nameSearch = projectSlug.replace(/[-_]/g, ' ')
        const { data: fuzzy } = await supabase
          .from('projects')
          .select('id, name, slug, description, tagline, status, hero_image_url, target_beneficiaries, actual_beneficiaries, budget_total, budget_spent')
          .or(`name.ilike.%${nameSearch}%,slug.ilike.%${projectSlug}%,description.ilike.%${nameSearch}%`)
          .limit(1)

        if (fuzzy && fuzzy.length > 0) {
          projectSlug = fuzzy[0].slug
        }
      }
    }

    let query = supabase
      .from('projects')
      .select('id, name, slug, description, tagline, status, hero_image_url, target_beneficiaries, actual_beneficiaries, budget_total, budget_spent')
      .order('name')

    if (projectSlug) {
      query = query.eq('slug', projectSlug)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data: projects, error } = await query.limit(10)

    if (error) {
      console.error('getInnovationProjects error:', error)
      return { projects: [], total: 0 }
    }

    if (!projects || projects.length === 0) {
      return { projects: [], total: 0, message: 'No innovation projects found.' }
    }

    // For single project, also fetch notes, stories, and media
    if (projectSlug && projects.length === 1) {
      const proj = projects[0]
      const projectTag = `project:${proj.slug}`
      const [notesResult, storiesResult, mediaResult] = await Promise.all([
        supabase
          .from('project_notes')
          .select('id, content, note_type, author_name, created_at')
          .eq('project_id', proj.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('stories')
          .select('id, title, excerpt, category')
          .eq('status', 'published')
          .or(`title.ilike.%${proj.name}%,content.ilike.%${proj.name}%`)
          .limit(3),
        supabase
          .from('media_files')
          .select('id, public_url, file_path, bucket_name, title, alt_text, file_type')
          .contains('tags', [projectTag])
          .is('deleted_at', null)
          .order('rating', { ascending: false, nullsFirst: false })
          .limit(8),
      ])

      const photos = (mediaResult.data || [])
        .filter((m: any) => m.file_type === 'image')
        .map((m: any) => ({ url: resolveMediaUrl(m), alt: m.alt_text || m.title || proj.name }))
        .filter((p: any) => p.url !== null)

      const videos = (mediaResult.data || [])
        .filter((m: any) => m.file_type === 'video')
        .map((m: any) => ({ url: resolveMediaUrl(m), title: m.title }))
        .filter((v: any) => v.url !== null)

      return {
        project: {
          name: proj.name,
          slug: proj.slug,
          description: proj.description,
          tagline: proj.tagline,
          status: proj.status,
          heroImage: proj.hero_image_url,
          targetBeneficiaries: proj.target_beneficiaries,
          actualBeneficiaries: proj.actual_beneficiaries,
          budget: proj.budget_total ? `$${(proj.budget_total / 1000).toFixed(0)}K` : null,
        },
        notes: notesResult.data || [],
        relatedStories: storiesResult.data || [],
        photos,
        videos,
        total: 1,
      }
    }

    return {
      projects: projects.map(p => ({
        name: p.name,
        slug: p.slug,
        tagline: p.tagline || p.description?.substring(0, 100),
        status: p.status,
        heroImage: p.hero_image_url,
      })),
      total: projects.length,
    }
  },
})

// ─── getServiceMetrics ──────────────────────────────────────────────────────

const getServiceMetricsSchema = z.object({
  serviceSlug: z.string().optional().describe('Service slug to get metrics for'),
  fiscalYear: z.string().optional().describe('Fiscal year (e.g. "2024-25"). Defaults to latest.'),
  includeActivity: z.boolean().default(true).describe('Include monthly activity log data'),
})

type GetServiceMetricsInput = z.infer<typeof getServiceMetricsSchema>

export const getServiceMetrics = defineTool({
  description: 'Get service metrics and activity trends — annual metrics plus monthly activity logs for trend analysis.',
  parameters: getServiceMetricsSchema,
  execute: async (input: GetServiceMetricsInput) => {
    const { serviceSlug, fiscalYear, includeActivity } = input
    const supabase = getSupabase()

    // Find service
    let serviceId: string | null = null
    let serviceName: string | null = null
    if (serviceSlug) {
      const { data } = await supabase
        .from('organization_services')
        .select('id, name')
        .eq('slug', serviceSlug)
        .single()
      serviceId = data?.id || null
      serviceName = data?.name || null
    }

    // Annual metrics
    let metricsQuery = supabase
      .from('service_metrics')
      .select('*')
      .order('fiscal_year', { ascending: false })
      .limit(5)
    if (serviceId) metricsQuery = metricsQuery.eq('organization_service_id', serviceId)
    if (fiscalYear) metricsQuery = metricsQuery.eq('fiscal_year', fiscalYear)
    const { data: metrics } = await metricsQuery

    // Monthly activity logs
    let activityLogs: any[] = []
    if (includeActivity && serviceId) {
      const { data } = await supabase
        .from('service_activity_logs')
        .select('*')
        .eq('service_id', serviceId)
        .order('period_start', { ascending: false })
        .limit(12)
      activityLogs = data || []
    }

    return {
      service: serviceName,
      annualMetrics: metrics || [],
      activityLogs,
      trends: activityLogs.length > 1 ? {
        totalClients: activityLogs.reduce((sum: number, l: any) => sum + (l.clients_served || 0), 0),
        totalSessions: activityLogs.reduce((sum: number, l: any) => sum + (l.sessions_delivered || 0), 0),
        monthsCovered: activityLogs.length,
      } : null,
    }
  },
})

// ─── getFinancialSummary ────────────────────────────────────────────────────

const getFinancialSummarySchema = z.object({
  fiscalYear: z.string().optional().describe('Fiscal year (e.g. "2023-24"). Defaults to latest.'),
})

type GetFinancialSummaryInput = z.infer<typeof getFinancialSummarySchema>

export const getFinancialSummary = defineTool({
  description: 'Get PICC financial summary — revenue, expenditure, and breakdown by category.',
  parameters: getFinancialSummarySchema,
  execute: async (input: GetFinancialSummaryInput) => {
    const { fiscalYear } = input
    const supabase = getSupabase()

    let query = supabase
      .from('annual_financials')
      .select('*')
      .order('fiscal_year', { ascending: false })
      .limit(3)
    if (fiscalYear) query = query.eq('fiscal_year', fiscalYear)
    const { data } = await query

    return { financials: data || [], count: data?.length || 0 }
  },
})

// ─── submitServiceUpdate ────────────────────────────────────────────────────

const submitServiceUpdateSchema = z.object({
  serviceSlug: z.string().describe('Service slug to update'),
  content: z.string().min(10).describe('The update or note content'),
  noteType: z.enum(['update', 'achievement', 'challenge', 'feedback']).default('update')
    .describe('Type of note'),
  authorName: z.string().optional().describe('Who provided this information'),
})

type SubmitServiceUpdateInput = z.infer<typeof submitServiceUpdateSchema>

export const submitServiceUpdate = defineTool({
  description: 'Record a service update or note captured from conversation. Saves to service_notes table.',
  parameters: submitServiceUpdateSchema,
  execute: async (input: SubmitServiceUpdateInput) => {
    const { serviceSlug, content, noteType, authorName } = input
    const supabase = getSupabase()

    // Find service
    const { data: service } = await supabase
      .from('organization_services')
      .select('id, name')
      .eq('slug', serviceSlug)
      .single()

    if (!service) return { success: false, error: `Service "${serviceSlug}" not found` }

    const { data, error } = await supabase
      .from('service_notes')
      .insert({
        service_id: service.id,
        content,
        note_type: noteType,
        author_name: authorName || 'Chat Assistant',
        source: 'chat',
      })
      .select('id, created_at')
      .single()

    if (error) return { success: false, error: error.message }

    return {
      success: true,
      id: data.id,
      service: service.name,
      noteType,
      message: `Update saved for ${service.name}. It will be visible in the service admin page.`,
    }
  },
})

// ─── submitMeetingNote ──────────────────────────────────────────────────────

const submitMeetingNoteSchema = z.object({
  title: z.string().describe('Meeting title or subject'),
  summary: z.string().min(20).describe('Meeting summary or key points'),
  attendees: z.array(z.string()).optional().describe('List of attendee names'),
  meetingDate: z.string().optional().describe('Meeting date (YYYY-MM-DD). Defaults to today.'),
  actionItems: z.array(z.string()).optional().describe('Action items from the meeting'),
})

type SubmitMeetingNoteInput = z.infer<typeof submitMeetingNoteSchema>

export const submitMeetingNote = defineTool({
  description: 'Record a meeting summary captured from conversation. Saves to meeting_notes table.',
  parameters: submitMeetingNoteSchema,
  execute: async (input: SubmitMeetingNoteInput) => {
    const { title, summary, attendees, meetingDate, actionItems } = input
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('meeting_notes')
      .insert({
        title,
        summary,
        attendees: attendees || [],
        meeting_date: meetingDate || new Date().toISOString().split('T')[0],
        action_items: actionItems || [],
        source: 'chat',
      })
      .select('id, created_at')
      .single()

    if (error) return { success: false, error: error.message }

    return {
      success: true,
      id: data.id,
      message: `Meeting note "${title}" saved successfully.`,
    }
  },
})

// ─── getContentReadiness ─────────────────────────────────────────────────────

const getContentReadinessSchema = z.object({
  scope: z.enum(['all', 'services', 'report']).default('all')
    .describe('What to check: all (services + report sections), services only, or report sections only'),
})

type GetContentReadinessInput = z.infer<typeof getContentReadinessSchema>

export const getContentReadiness = defineTool({
  description: 'Check completeness of PICC data — services (description, cover photo, metrics, stories, notes) and annual report sections (CEO message, financials, elder quotes, gallery photos). Returns green/amber/red status per item.',
  parameters: getContentReadinessSchema,
  execute: async (input: GetContentReadinessInput) => {
    const { scope } = input

    try {
      const report = await checkCompleteness()

      if (scope === 'services') {
        return {
          services: report.services,
          overallScore: report.overallScore,
          generatedAt: report.generatedAt,
        }
      }

      if (scope === 'report') {
        return {
          reportSections: report.reportSections,
          overallScore: report.overallScore,
          generatedAt: report.generatedAt,
        }
      }

      return report
    } catch (err) {
      console.error('getContentReadiness error:', err)
      return { error: 'Failed to check content readiness.' }
    }
  },
})

// ─── suggestDataEnrichment ──────────────────────────────────────────────────

const suggestDataEnrichmentSchema = z.object({
  serviceSlug: z.string().optional().describe('Limit suggestions to a specific service by slug'),
})

type SuggestDataEnrichmentInput = z.infer<typeof suggestDataEnrichmentSchema>

function generateServiceQuestions(service: ServiceCompleteness): string[] {
  const questions: string[] = []
  const { checks, name } = service

  if (!checks.hasDescription) {
    questions.push(`Can you provide a description for ${name}?`)
  }
  if (!checks.hasCoverPhoto) {
    questions.push(`Do you have a cover photo for ${name}?`)
  }
  if (!checks.hasCurrentYearMetrics) {
    questions.push(`How many clients did ${name} serve this financial year?`)
    questions.push(`How many sessions or events did ${name} deliver this quarter?`)
  }
  if (!checks.hasStories) {
    questions.push(`What was a key achievement or success story for ${name} recently?`)
  }
  if (!checks.hasNotes) {
    questions.push(`Are there any recent updates or notes for ${name}?`)
  }
  if (!checks.hasGrantInfo) {
    questions.push(`What funding or grants support ${name}?`)
  }
  if (!checks.hasGpsCoords) {
    questions.push(`Where is ${name} located? We need GPS coordinates for the map.`)
  }

  return questions
}

function generateReportQuestions(section: { section: string; status: string; details: string }): string[] {
  if (section.status === 'green') return []

  const map: Record<string, string[]> = {
    'CEO Message': ['Can you provide the CEO message or leadership summary for the annual report?'],
    'Chair Message': ['Is there a Chair message or acknowledgement of country for the report?'],
    'Financial Data': ['Have the financials for the current fiscal year been entered?'],
    'Community Voices': ['Are there community quotes or testimonials to include in the report?'],
    'Gallery Photos': ['Can you tag more photos with "annual-report" for the gallery section? We need at least 5.'],
    'Elder Quotes': ['Are there Elder quotes available for the annual report?'],
    'Board Photos': ['Do you have photos of board members tagged with "board-member"? We need at least 3.'],
  }

  return map[section.section] || [`The "${section.section}" section needs attention: ${section.details}`]
}

export const suggestDataEnrichment = defineTool({
  description: 'Suggest specific questions to fill data gaps for services and annual report sections. Returns plain-language questions grouped by service or report section.',
  parameters: suggestDataEnrichmentSchema,
  execute: async (input: SuggestDataEnrichmentInput) => {
    const { serviceSlug } = input

    try {
      const report = await checkCompleteness()

      const serviceGroups: { service: string; slug: string; status: string; questions: string[] }[] = []
      const filteredServices = serviceSlug
        ? report.services.filter((s) => s.slug === serviceSlug)
        : report.services

      for (const svc of filteredServices) {
        if (svc.status === 'green') continue
        const questions = generateServiceQuestions(svc)
        if (questions.length > 0) {
          serviceGroups.push({
            service: svc.name,
            slug: svc.slug,
            status: svc.status,
            questions,
          })
        }
      }

      const reportGaps: { section: string; status: string; questions: string[] }[] = []
      for (const sec of report.reportSections) {
        if (sec.status === 'green') continue
        const questions = generateReportQuestions(sec)
        if (questions.length > 0) {
          reportGaps.push({
            section: sec.section,
            status: sec.status,
            questions,
          })
        }
      }

      return {
        serviceGaps: serviceGroups,
        reportGaps: serviceSlug ? [] : reportGaps,
        totalQuestions: serviceGroups.reduce((sum, g) => sum + g.questions.length, 0) +
          reportGaps.reduce((sum, g) => sum + g.questions.length, 0),
        overallScore: report.overallScore,
      }
    } catch (err) {
      console.error('suggestDataEnrichment error:', err)
      return { error: 'Failed to generate enrichment suggestions.' }
    }
  },
})

// ─── getBoardAndLeadership ──────────────────────────────────────────────────

const getBoardAndLeadershipSchema = z.object({
  includeMessages: z.boolean().default(false).describe('Include leadership messages (CEO/Chair messages for annual report)'),
})

type GetBoardAndLeadershipInput = z.infer<typeof getBoardAndLeadershipSchema>

export const getBoardAndLeadership = defineTool({
  description: 'Get PICC board members and leadership team — names, roles, bios, and optionally their leadership messages.',
  parameters: getBoardAndLeadershipSchema,
  execute: async (input: GetBoardAndLeadershipInput) => {
    const { includeMessages } = input
    const supabase = getSupabase()

    const boardSelect = 'name, role, bio, photo_url, start_date, end_date, display_order'
    const { data: board } = await supabase
      .from('board_members')
      .select(boardSelect)
      .order('display_order', { ascending: true })

    const leadershipSelect = includeMessages
      ? 'full_name, position, bio, photo_url, leadership_type, message_title, message_content, featured_quote'
      : 'full_name, position, bio, photo_url, leadership_type, featured_quote'
    const { data: leaders } = await supabase
      .from('leadership')
      .select(leadershipSelect)
      .eq('is_active', true)
      .order('position_order', { ascending: true })

    return {
      board: board || [],
      leadership: leaders || [],
      boardCount: board?.length || 0,
      leadershipCount: leaders?.length || 0,
    }
  },
})

// ─── getInterview ───────────────────────────────────────────────────────────

const getInterviewSchema = z.object({
  interviewId: z.string().optional().describe('Specific interview ID to retrieve'),
  search: z.string().optional().describe('Search interview titles, themes, or segment text'),
  limit: z.number().default(5).describe('Max interviews to return'),
})

type GetInterviewInput = z.infer<typeof getInterviewSchema>

export const getInterview = defineTool({
  description: 'Search or retrieve interviews and their transcript segments. Contains 34 interviews with 2000+ transcript segments from community members.',
  parameters: getInterviewSchema,
  execute: async (input: GetInterviewInput) => {
    const { interviewId, search, limit } = input
    const supabase = getSupabase()

    if (interviewId) {
      const { data: interview } = await supabase
        .from('interviews')
        .select('id, interview_title, interview_date, interview_location, interview_type, key_themes, interview_notes, status, privacy_level, is_public')
        .eq('id', interviewId)
        .single()

      if (!interview) return { found: false, error: 'Interview not found' }

      // Check privacy
      if (!interview.is_public && interview.privacy_level === 'restricted') {
        return { found: true, interview: { ...interview, segments: [] }, note: 'This interview has restricted access. Segments not shown.' }
      }

      const { data: segments } = await supabase
        .from('interview_segments')
        .select('segment_index, speaker, segment_text')
        .eq('interview_id', interviewId)
        .order('segment_index', { ascending: true })
        .limit(50)

      return { found: true, interview, segments: segments || [] }
    }

    // Search mode
    let query = supabase
      .from('interviews')
      .select('id, interview_title, interview_date, interview_type, key_themes, status, is_public')
      .eq('status', 'completed')
      .order('interview_date', { ascending: false })
      .limit(limit)

    if (search) {
      query = query.or(`interview_title.ilike.%${search}%,key_themes.cs.{${search}}`)
    }

    const { data: interviews } = await query

    // If searching, also search segments
    let matchingSegments: Array<{ interview_id: string; segment_text: string; speaker: string }> = []
    if (search) {
      const { data } = await supabase
        .from('interview_segments')
        .select('interview_id, segment_text, speaker')
        .ilike('segment_text', `%${search}%`)
        .limit(10)
      matchingSegments = data || []
    }

    return {
      interviews: interviews || [],
      matchingSegments,
      count: interviews?.length || 0,
    }
  },
})

// ─── getPhotoCollections ────────────────────────────────────────────────────

const getPhotoCollectionsSchema = z.object({
  slug: z.string().optional().describe('Get a specific collection by slug'),
})

type GetPhotoCollectionsInput = z.infer<typeof getPhotoCollectionsSchema>

export const getPhotoCollections = defineTool({
  description: 'Get curated photo collections — named galleries of photos grouped by theme, event, or project.',
  parameters: getPhotoCollectionsSchema,
  execute: async (input: GetPhotoCollectionsInput) => {
    const { slug } = input
    const supabase = getSupabase()

    if (slug) {
      const { data: collection } = await supabase
        .from('photo_collections')
        .select('id, name, slug, description, item_count, is_public')
        .eq('slug', slug)
        .eq('is_public', true)
        .single()

      if (!collection) return { found: false }

      // Get photos in this collection via collection_items
      const { data: items } = await supabase
        .from('collection_items')
        .select('media_files(id, file_url, alt_text, caption, tags)')
        .eq('collection_id', collection.id)
        .limit(20)

      return {
        found: true,
        collection,
        photos: items?.map((i: any) => i.media_files).filter(Boolean) || [],
      }
    }

    const { data: collections } = await supabase
      .from('photo_collections')
      .select('name, slug, description, item_count, is_public')
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    return { collections: collections || [], count: collections?.length || 0 }
  },
})

// ─── getAnnualReportArchive ─────────────────────────────────────────────────

const getAnnualReportArchiveSchema = z.object({
  year: z.string().optional().describe('Specific fiscal year (e.g. "2023-24")'),
})

type GetAnnualReportArchiveInput = z.infer<typeof getAnnualReportArchiveSchema>

export const getAnnualReportArchive = defineTool({
  description: 'Get past annual reports — titles, themes, executive summaries, and download links.',
  parameters: getAnnualReportArchiveSchema,
  execute: async (input: GetAnnualReportArchiveInput) => {
    const { year } = input
    const supabase = getSupabase()

    let query = supabase
      .from('annual_reports')
      .select('id, fiscal_year, title, subtitle, theme, status, executive_summary, leadership_message_author, year_highlights, looking_forward, pdf_url, web_version_url, published_date, views, downloads')
      .order('fiscal_year', { ascending: false })
      .limit(10)

    if (year) query = query.eq('fiscal_year', year)

    const { data } = await query

    return { reports: data || [], count: data?.length || 0 }
  },
})

// ─── getPublications ────────────────────────────────────────────────────────

const getPublicationsSchema = z.object({
  category: z.string().optional().describe('Filter by category'),
  search: z.string().optional().describe('Search title or description'),
})

type GetPublicationsInput = z.infer<typeof getPublicationsSchema>

export const getPublications = defineTool({
  description: 'Get PICC publications — reports, research papers, and documents with download links.',
  parameters: getPublicationsSchema,
  execute: async (input: GetPublicationsInput) => {
    const { category, search } = input
    const supabase = getSupabase()

    let query = supabase
      .from('publications')
      .select('slug, title, subtitle, description, category, tags, pdf_url, author, published_date, fiscal_year, is_featured')
      .eq('status', 'published')
      .order('published_date', { ascending: false })
      .limit(20)

    if (category) query = query.eq('category', category)
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)

    const { data } = await query

    return { publications: data || [], count: data?.length || 0 }
  },
})

// ─── getDeepHistory ─────────────────────────────────────────────────────────

const getDeepHistorySchema = z.object({
  search: z.string().optional().describe('Search history events by keyword'),
  eventType: z.string().optional().describe('Filter by event type (e.g. "milestone", "cultural", "governance")'),
  era: z.string().optional().describe('Filter by era name'),
})

type GetDeepHistoryInput = z.infer<typeof getDeepHistorySchema>

export const getDeepHistory = defineTool({
  description: 'Get detailed PICC history — timeline events (55+), organizational eras, and story-linked events. Deeper than exploreTimeline which only covers governance achievements.',
  parameters: getDeepHistorySchema,
  execute: async (input: GetDeepHistoryInput) => {
    const { search, eventType, era } = input
    const supabase = getSupabase()

    // Timeline events (main history table)
    let eventsQuery = supabase
      .from('timeline_events')
      .select('id, title, description, event_date, event_type, location_name, significance, is_featured, image_url')
      .order('event_date', { ascending: false })
      .limit(30)

    if (search) eventsQuery = eventsQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    if (eventType) eventsQuery = eventsQuery.eq('event_type', eventType)

    const { data: rawEvents } = await eventsQuery

    // Deduplicate against HISTORICAL_MILESTONES (which exploreTimeline also returns)
    // Match on keywords to avoid showing "Hull River cyclone" twice
    const milestoneKeywords = HISTORICAL_MILESTONES.map(m => {
      const words = m.achievement_text.toLowerCase().split(/\s+/).filter(w => w.length > 5)
      return words.slice(0, 3)
    })
    const events = (rawEvents || []).filter((e: any) => {
      const text = `${e.title} ${e.description}`.toLowerCase()
      // If this event matches a historical milestone closely, skip it
      return !milestoneKeywords.some(keywords =>
        keywords.length > 0 && keywords.every(kw => text.includes(kw))
      )
    })

    // Organization eras
    let erasQuery = supabase
      .from('organization_history')
      .select('era_name, year_start, year_end, description, milestones')
      .order('year_start', { ascending: true })

    if (era) erasQuery = erasQuery.ilike('era_name', `%${era}%`)

    const { data: eras } = await erasQuery

    // Story timeline events (events linked to stories)
    let storyEventsQuery = supabase
      .from('story_timeline_events')
      .select('event_title, event_description, event_date, story_sections(story_id)')
      .order('event_date', { ascending: false })
      .limit(20)

    if (search) storyEventsQuery = storyEventsQuery.or(`event_title.ilike.%${search}%,event_description.ilike.%${search}%`)

    const { data: storyEvents } = await storyEventsQuery

    return {
      events: events || [],
      eras: eras || [],
      storyEvents: storyEvents || [],
      totalEvents: (events?.length || 0) + (storyEvents?.length || 0),
    }
  },
})

// ─── getImpactIndicators ────────────────────────────────────────────────────

const getImpactIndicatorsSchema = z.object({
  serviceArea: z.string().optional().describe('Filter by service area'),
  indicatorType: z.string().optional().describe('Filter by indicator type'),
})

type GetImpactIndicatorsInput = z.infer<typeof getImpactIndicatorsSchema>

export const getImpactIndicators = defineTool({
  description: 'Get impact measurement indicators — KPIs, outcomes, and change metrics tracked across services and stories.',
  parameters: getImpactIndicatorsSchema,
  execute: async (input: GetImpactIndicatorsInput) => {
    const { serviceArea, indicatorType } = input
    const supabase = getSupabase()

    let query = supabase
      .from('impact_indicators')
      .select('id, service_area, indicator_type, indicator_name, indicator_description, measurement_type, value_numeric, value_text, value_category, baseline_value, target_value, change_observed, significance, measurement_date, pattern_category')
      .order('measurement_date', { ascending: false })
      .limit(30)

    if (serviceArea) query = query.ilike('service_area', `%${serviceArea}%`)
    if (indicatorType) query = query.eq('indicator_type', indicatorType)

    const { data } = await query

    return { indicators: data || [], count: data?.length || 0 }
  },
})

// ─── getImmersiveStories ────────────────────────────────────────────────────

const getImmersiveStoriesSchema = z.object({
  slug: z.string().optional().describe('Get a specific immersive story by slug'),
})

type GetImmersiveStoriesInput = z.infer<typeof getImmersiveStoriesSchema>

export const getImmersiveStories = defineTool({
  description: 'Get immersive/multimedia story experiences — rich scrollytelling stories with sections, media, and interactive elements.',
  parameters: getImmersiveStoriesSchema,
  execute: async (input: GetImmersiveStoriesInput) => {
    const { slug } = input
    const supabase = getSupabase()

    if (slug) {
      const { data: story } = await supabase
        .from('immersive_stories')
        .select('id, title, subtitle, slug, hero_media_url, hero_media_type, is_published, published_at')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

      if (!story) return { found: false }

      // Get sections for this story (via project_id link or direct)
      const { data: sections } = await supabase
        .from('story_sections')
        .select('section_order, section_type, title, content, media_url, media_type, media_caption, quote_author, quote_role')
        .eq('story_id', story.id)
        .order('section_order', { ascending: true })

      return { found: true, story, sections: sections || [] }
    }

    const { data: stories } = await supabase
      .from('immersive_stories')
      .select('title, subtitle, slug, hero_media_url, is_published, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })

    return { stories: stories || [], count: stories?.length || 0 }
  },
})

// ─── getGrantsAndPartnerships ───────────────────────────────────────────────

const getGrantsAndPartnershipsSchema = z.object({
  serviceSlug: z.string().optional().describe('Filter grants/partners by service slug'),
})

type GetGrantsAndPartnershipsInput = z.infer<typeof getGrantsAndPartnershipsSchema>

export const getGrantsAndPartnerships = defineTool({
  description: 'Get grant funding information and partnership details for PICC services. Includes grant deadlines, outcomes, and partner-service relationships.',
  parameters: getGrantsAndPartnershipsSchema,
  execute: async (input: GetGrantsAndPartnershipsInput) => {
    const { serviceSlug } = input
    const supabase = getSupabase()

    // Get partners (already in RAG but no direct tool)
    const { data: partners } = await supabase
      .from('partners')
      .select('name, partner_type, description, logo_url, website_url, is_active')
      .eq('is_active', true)
      .order('name')

    // Service grants
    let grantsQuery = supabase
      .from('service_grants')
      .select('*')
      .limit(30)

    if (serviceSlug) {
      const { data: svc } = await supabase
        .from('organization_services')
        .select('id')
        .eq('slug', serviceSlug)
        .single()
      if (svc) grantsQuery = grantsQuery.eq('service_id', svc.id)
    }

    const { data: grants } = await grantsQuery

    // Grant deadlines
    const { data: deadlines } = await supabase
      .from('grant_deadlines')
      .select('*')
      .gte('deadline_date', new Date().toISOString().split('T')[0])
      .order('deadline_date', { ascending: true })
      .limit(10)

    return {
      partners: partners || [],
      grants: grants || [],
      upcomingDeadlines: deadlines || [],
      partnerCount: partners?.length || 0,
    }
  },
})

// ─── escalateToHuman ──────────────────────────────────────────────────────────

const escalateToHumanSchema = z.object({
  reason: z.string().describe('Why escalation is needed (e.g. "crisis support", "complex query", "user requested")'),
  category: z.enum(['crisis', 'service_inquiry', 'complaint', 'general', 'unresolved']).default('general')
    .describe('Category of escalation'),
  userMessage: z.string().optional().describe('The user message or question to pass along'),
})

type EscalateToHumanInput = z.infer<typeof escalateToHumanSchema>

export const escalateToHuman = defineTool({
  description: 'Connect the user to a real person at PICC. Use for crisis situations (DV, child safety, mental health), when the user explicitly asks to speak with someone, or when you cannot resolve their question after multiple attempts.',
  parameters: escalateToHumanSchema,
  execute: async (input: EscalateToHumanInput) => {
    const { reason, category, userMessage } = input

    const isCrisis = category === 'crisis'

    return {
      escalated: true,
      category,
      reason,
      userMessage,
      contacts: {
        phone: '(07) 4770 1177',
        email: 'admin@picc.com.au',
        address: 'Palm Island Community Company, Palm Island QLD 4816',
        hours: 'Monday to Friday, 8:30am - 4:30pm',
      },
      crisisContacts: isCrisis ? {
        emergencyServices: '000',
        dvConnect: '1800 811 811',
        '1800RESPECT': '1800 737 732',
        kidsHelpline: '1800 551 800',
        lifeline: '13 11 14',
        mentalHealthLine: '1300 642 255',
      } : null,
      message: isCrisis
        ? 'If you or someone you know is in immediate danger, please call 000. For crisis support, the contacts below are available 24/7.'
        : 'I can pass your question along to the PICC team, or you can reach them directly using the contact details below.',
    }
  },
})

// ─── Export all tools ────────────────────────────────────────────────────────

export const exploreTools = {
  searchStories,
  getServiceInfo,
  getInnovationProjects,
  exploreTimeline,
  findQuotes,
  getPhotoGallery,
  exploreKnowledgeGraph,
  submitCommunityVision,
  getCommunityVisions,
  getServiceMetrics,
  getFinancialSummary,
  submitServiceUpdate,
  submitMeetingNote,
  getContentReadiness,
  suggestDataEnrichment,
  getBoardAndLeadership,
  getInterview,
  getPhotoCollections,
  getAnnualReportArchive,
  getPublications,
  getDeepHistory,
  getImpactIndicators,
  getImmersiveStories,
  getGrantsAndPartnerships,
  escalateToHuman,
}
