import { z } from 'zod'
import { defineTool, getSupabase, buildPublicUrl } from './_shared'

// ─── Schema definitions ──────────────────────────────────────────────────────

const searchStoriesSchema = z.object({
  query: z.string().describe('Search query — topic, person name, service, or keyword'),
  category: z.string().optional().describe('Filter by story category'),
  tags: z.array(z.string()).optional().describe('Filter by tags'),
  limit: z.number().min(1).max(6).default(4).describe('Number of stories to return'),
})

type SearchStoriesInput = z.infer<typeof searchStoriesSchema>

const findQuotesSchema = z.object({
  themes: z.array(z.string()).optional().describe('Themes to search for (e.g. ["health", "elders", "community"])'),
  query: z.string().optional().describe('Text search — finds quotes from stories matching this keyword in title (e.g. "elders", "healing")'),
  limit: z.number().min(1).max(6).default(3).describe('Number of quotes to return'),
})

type FindQuotesInput = z.infer<typeof findQuotesSchema>

const getInterviewSchema = z.object({
  interviewId: z.string().optional().describe('Specific interview ID to retrieve'),
  search: z.string().optional().describe('Search interview titles, themes, or segment text'),
  limit: z.number().default(5).describe('Max interviews to return'),
})

type GetInterviewInput = z.infer<typeof getInterviewSchema>

const getImmersiveStoriesSchema = z.object({
  slug: z.string().optional().describe('Get a specific immersive story by slug'),
})

type GetImmersiveStoriesInput = z.infer<typeof getImmersiveStoriesSchema>

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

    // Resolve speaker names and look up correct profile images
    const filtered = await Promise.all(diverse.slice(0, limit).map(async (q: any) => {
      const story = q.stories as { id: string; title: string; profiles: any } | null
      const storyProfile = story?.profiles as { full_name: string; preferred_name: string | null; profile_image_url: string | null; is_elder: boolean | null } | null
      // Extract actual speaker from context_before — multi-speaker stories attribute
      // quotes to the story's storyteller by default, which is often wrong.
      let speakerName: string | null = null
      let speakerIsDifferent = false
      const ctx = (q.context_before as string | null) || ''

      if (ctx) {
        // "An Elder on..." — anonymous, no profile to look up
        if (/^An Elder\b/i.test(ctx)) {
          speakerName = 'An Elder'
          speakerIsDifferent = true
        } else {
          const speakerPatterns = [
            /^(?:Aunty|Uncle|Elder)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*[:—–\-]/,
            /^(?:Aunty|Uncle|Elder)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:on|said|described|reflected|explained|recalled|shared|spoke|talked|honoured)/,
            /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*[:—–\-]/,
            /^([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]+)*)\s+(?:on|said|described|reflected|explained|recalled|shared|spoke|talked|stood|honoured)/,
          ]
          for (const pattern of speakerPatterns) {
            const match = ctx.match(pattern)
            if (match) {
              speakerName = match[1]
              if (/^Aunty\s/i.test(ctx)) speakerName = `Aunty ${speakerName}`
              else if (/^Uncle\s/i.test(ctx)) speakerName = `Uncle ${speakerName}`
              else if (/^Elder\s/i.test(ctx)) speakerName = `Elder ${speakerName}`
              // Check if this is a different person from the storyteller
              const storytellerName = storyProfile?.preferred_name || storyProfile?.full_name || ''
              const cleanSpeaker = speakerName.replace(/^(Aunty|Uncle|Elder)\s+/, '')
              if (storytellerName && !storytellerName.includes(cleanSpeaker) && !cleanSpeaker.includes(storytellerName.split(' ')[0])) {
                speakerIsDifferent = true
              }
              break
            }
          }
        }
      }

      // Fall back to story storyteller if no speaker found in context
      if (!speakerName) {
        speakerName = storyProfile?.preferred_name || storyProfile?.full_name || null
      }

      // Look up correct profile image when speaker differs from storyteller
      let speakerImage: string | null = null
      if (speakerIsDifferent && speakerName && speakerName !== 'An Elder') {
        const cleanName = speakerName.replace(/^(Aunty|Uncle|Elder)\s+/, '')
        const { data: speakerProfiles } = await supabase
          .from('profiles')
          .select('profile_image_url')
          .or(`preferred_name.ilike.%${cleanName}%,full_name.ilike.%${cleanName}%`)
          .limit(1)
        speakerImage = speakerProfiles?.[0]?.profile_image_url || null
      } else if (!speakerIsDifferent) {
        speakerImage = storyProfile?.profile_image_url || null
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
        speakerImage,
      }
    }))

    return { quotes: filtered, total: filtered.length }
  },
})

// ─── getInterview ───────────────────────────────────────────────────────────

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

// ─── getImmersiveStories ────────────────────────────────────────────────────

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
