import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type {
  ThemeDefinition,
  ThemeContent,
  ThemeStory,
  ThemeQuote,
  ThemePhoto,
  ThemeMetric,
  ThemeAchievement,
  ThemeStaffStats,
} from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>

function getSupabase(): AnySupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

/**
 * Fetch all content for a theme from Supabase using parallel queries.
 * Respects cultural protocols: only published stories and validated quotes.
 */
export async function fetchThemeContent(theme: ThemeDefinition): Promise<ThemeContent> {
  const supabase = getSupabase()
  const { filters } = theme

  // Run all queries in parallel
  const [stories, quotes, photos, metrics, achievements, staffStats] = await Promise.all([
    fetchStories(supabase, filters),
    fetchQuotes(supabase, filters),
    fetchPhotos(supabase, filters),
    fetchMetrics(supabase, filters),
    fetchAchievements(supabase, filters),
    fetchStaffStats(supabase, filters),
  ])

  return { theme, stories, quotes, photos, metrics, achievements, staffStats }
}

/**
 * Fetch content counts for all themes efficiently (for the selection grid).
 */
export async function fetchThemeContentCounts(
  themes: ThemeDefinition[]
): Promise<Record<string, { stories: number; photos: number }>> {
  const supabase = getSupabase()

  // Fetch all published stories and their tags in one query
  const { data: allStories } = await supabase
    .from('stories')
    .select('id, tags, related_service, service_id, category')
    .eq('status', 'published')

  // Fetch all story media counts grouped by story
  const { data: allMedia } = await supabase
    .from('story_media')
    .select('id, story_id')
    .eq('media_type', 'image')

  const counts: Record<string, { stories: number; photos: number }> = {}

  for (const theme of themes) {
    const { filters } = theme
    let storyCount = 0
    let photoCount = 0

    if (allStories) {
      const matchingStories = allStories.filter(s => matchesFilters(s, filters))
      storyCount = matchingStories.length

      if (allMedia) {
        const matchingStoryIds = new Set(matchingStories.map(s => s.id))
        photoCount = allMedia.filter(m => m.story_id && matchingStoryIds.has(m.story_id)).length
      }
    }

    counts[theme.slug] = { stories: storyCount, photos: photoCount }
  }

  return counts
}

function matchesFilters(
  story: { tags: string[] | null; related_service: string | null; service_id: string | null; category: string },
  filters: ThemeDefinition['filters']
): boolean {
  if (filters.storyTags && filters.storyTags.length > 0) {
    if (story.tags && filters.storyTags.some(t => story.tags!.includes(t))) return true
  }
  if (filters.serviceSlug && story.related_service === filters.serviceSlug) return true
  if (filters.storyCategory && story.category === filters.storyCategory) return true
  // If no filters matched and there were tag filters, return false
  if (filters.storyTags && filters.storyTags.length > 0) return false
  return false
}

// --- Individual query functions ---

async function fetchStories(
  supabase: AnySupabaseClient,
  filters: ThemeDefinition['filters']
): Promise<ThemeStory[]> {
  let query = supabase
    .from('stories')
    .select(`
      id, title, content, category, tags, story_date, published_at,
      location, outcome_achieved,
      story_media (file_path, supabase_bucket, alt_text)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(10)

  // Apply tag filter using overlaps (any match)
  if (filters.storyTags && filters.storyTags.length > 0) {
    query = query.overlaps('tags', filters.storyTags)
  }

  if (filters.serviceSlug) {
    query = query.eq('related_service', filters.serviceSlug)
  }

  const { data, error } = await query
  if (error) {
    console.error('Error fetching stories:', error)
    return []
  }

  return (data || []).map(s => {
    const media = (s as Record<string, unknown>).story_media as Array<{
      file_path: string
      supabase_bucket: string
      alt_text: string | null
    }> | null
    const heroMedia = media?.[0]
    return {
      id: s.id,
      title: s.title,
      content: s.content,
      category: s.category,
      tags: s.tags,
      story_date: s.story_date,
      published_at: s.published_at,
      location: s.location,
      outcome_achieved: s.outcome_achieved,
      heroImage: heroMedia
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${heroMedia.supabase_bucket}/${heroMedia.file_path}`
        : null,
    }
  })
}

async function fetchQuotes(
  supabase: AnySupabaseClient,
  filters: ThemeDefinition['filters']
): Promise<ThemeQuote[]> {
  let query = supabase
    .from('story_quotes')
    .select(`
      id, quote_text, themes, impact_score, is_featured,
      stories:story_id (title)
    `)
    .order('impact_score', { ascending: false, nullsFirst: false })
    .limit(10)

  if (filters.quoteThemes && filters.quoteThemes.length > 0) {
    query = query.overlaps('themes', filters.quoteThemes)
  }

  const { data, error } = await query
  if (error) {
    console.error('Error fetching quotes:', error)
    return []
  }

  return (data || []).map(q => ({
    id: q.id,
    quote_text: q.quote_text,
    themes: q.themes,
    impact_score: q.impact_score,
    story: Array.isArray(q.stories) ? (q.stories[0] as { title: string } ?? null) : (q.stories as { title: string } | null),
  }))
}

async function fetchPhotos(
  supabase: AnySupabaseClient,
  filters: ThemeDefinition['filters']
): Promise<ThemePhoto[]> {
  // Photos are linked through stories — get story IDs first, then their media
  let storyQuery = supabase
    .from('stories')
    .select('id')
    .eq('status', 'published')
    .limit(20)

  if (filters.storyTags && filters.storyTags.length > 0) {
    storyQuery = storyQuery.overlaps('tags', filters.storyTags)
  }
  if (filters.serviceSlug) {
    storyQuery = storyQuery.eq('related_service', filters.serviceSlug)
  }

  const { data: storyData } = await storyQuery
  if (!storyData || storyData.length === 0) return []

  const storyIds = storyData.map(s => s.id)

  const { data: mediaData, error } = await supabase
    .from('story_media')
    .select('id, file_path, file_name, alt_text, caption, supabase_bucket')
    .eq('media_type', 'image')
    .in('story_id', storyIds)
    .limit(24)

  if (error) {
    console.error('Error fetching photos:', error)
    return []
  }

  return (mediaData || []).map(m => ({
    id: m.id,
    file_path: m.file_path,
    file_name: m.file_name,
    alt_text: m.alt_text,
    caption: m.caption,
    supabase_bucket: m.supabase_bucket,
  }))
}

async function fetchMetrics(
  supabase: AnySupabaseClient,
  filters: ThemeDefinition['filters']
): Promise<ThemeMetric[]> {
  if (!filters.serviceCategory && !filters.serviceSlug) return []

  let query = supabase
    .from('service_metrics')
    .select(`
      clients_served, sessions_delivered, events_held, staff_count,
      key_achievement, headline_stat_value, headline_stat_label,
      organization_services:organization_service_id (name, slug, service_category)
    `)
    .order('fiscal_year', { ascending: false })
    .limit(10)

  const { data, error } = await query
  if (error) {
    console.error('Error fetching metrics:', error)
    return []
  }

  return (data || [])
    .filter(m => {
      const svc = (m as Record<string, unknown>).organization_services as {
        name: string
        slug: string
        service_category: string | null
      } | null
      if (!svc) return false
      if (filters.serviceSlug && svc.slug === filters.serviceSlug) return true
      if (filters.serviceCategory && svc.service_category === filters.serviceCategory) return true
      return false
    })
    .map(m => {
      const svc = (m as Record<string, unknown>).organization_services as { name: string } | null
      return {
        service_name: svc?.name || 'Unknown Service',
        clients_served: m.clients_served,
        sessions_delivered: m.sessions_delivered,
        events_held: m.events_held,
        staff_count: m.staff_count,
        key_achievement: m.key_achievement,
        headline_stat_value: m.headline_stat_value,
        headline_stat_label: m.headline_stat_label,
      }
    })
}

async function fetchAchievements(
  supabase: AnySupabaseClient,
  filters: ThemeDefinition['filters']
): Promise<ThemeAchievement[]> {
  let query = supabase
    .from('governance_achievements')
    .select('id, achievement_text, category, fiscal_year')
    .order('fiscal_year', { ascending: false })
    .order('display_order')
    .limit(20)

  if (filters.achievementCategory) {
    query = query.eq('category', filters.achievementCategory)
  }

  if (filters.fiscalYearRange) {
    query = query
      .gte('fiscal_year', filters.fiscalYearRange.from)
      .lte('fiscal_year', filters.fiscalYearRange.to)
  }

  const { data, error } = await query
  if (error) {
    console.error('Error fetching achievements:', error)
    return []
  }

  return data || []
}

async function fetchStaffStats(
  supabase: AnySupabaseClient,
  filters: ThemeDefinition['filters']
): Promise<ThemeStaffStats[]> {
  let query = supabase
    .from('staff_statistics')
    .select('fiscal_year, total_staff, indigenous_staff_count, palm_island_resident_count, full_time_staff, part_time_staff')
    .order('fiscal_year', { ascending: false })
    .limit(10)

  if (filters.fiscalYearRange) {
    query = query
      .gte('fiscal_year', filters.fiscalYearRange.from)
      .lte('fiscal_year', filters.fiscalYearRange.to)
  }

  const { data, error } = await query
  if (error) {
    console.error('Error fetching staff stats:', error)
    return []
  }

  return data || []
}
