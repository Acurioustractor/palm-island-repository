import { z } from 'zod'
import { defineTool, getSupabase } from './_shared'

// ─── Schema definitions ──────────────────────────────────────────────────────

const exploreTimelineSchema = z.object({
  era: z.enum(['founding', 'early', 'growth', 'recent', 'all']).default('all')
    .describe('Era to explore: founding (2009-2013), early (2013-2017), growth (2017-2021), recent (2021-2026), or all'),
  dateFrom: z.string().optional().describe('Start fiscal year (e.g. "2020-21")'),
  dateTo: z.string().optional().describe('End fiscal year (e.g. "2024-25")'),
  topic: z.string().optional().describe('Topic to filter by (e.g. "health", "governance")'),
  limit: z.number().min(1).max(20).default(10).describe('Number of events to return'),
})

type ExploreTimelineInput = z.infer<typeof exploreTimelineSchema>

const getDeepHistorySchema = z.object({
  search: z.string().optional().describe('Search history events by keyword'),
  eventType: z.string().optional().describe('Filter by event type (e.g. "milestone", "cultural", "governance")'),
  era: z.string().optional().describe('Filter by era name'),
})

type GetDeepHistoryInput = z.infer<typeof getDeepHistorySchema>

// Pre-PICC historical milestones (not in governance_achievements table)
const HISTORICAL_MILESTONES = [
  { id: 'hist-1', fiscal_year: '1914', category: 'history', achievement_text: 'Hull River Aboriginal Settlement established on Djiru people\'s land in the Mission Beach region of North Queensland', display_order: 1 },
  { id: 'hist-2', fiscal_year: '1918-03', category: 'history', achievement_text: 'Category 5 cyclone destroyed Hull River Settlement on 10 March 1918 — winds of 240-288 km/h and 305mm rain devastated the settlement', display_order: 2 },
  { id: 'hist-3', fiscal_year: '1918-06', category: 'history', achievement_text: 'Survivors of Hull River cyclone transferred to Palm Island (June 1918). Palm Island gazetted as Aboriginal reserve — people from 50+ language groups forcibly relocated over following decades', display_order: 3 },
  { id: 'hist-4', fiscal_year: '1985', category: 'history', achievement_text: 'Palm Island Community Company formed by a small group of concerned residents to fill service gaps left by government', display_order: 4 },
  { id: 'hist-5', fiscal_year: '2007', category: 'governance', achievement_text: 'PICC transitioned to community-controlled Aboriginal and Torres Strait Islander Corporation under CATSI Act', display_order: 5 },
  { id: 'hist-6', fiscal_year: '2009', category: 'governance', achievement_text: 'PICC begins formal governance framework and strategic planning', display_order: 6 },
  { id: 'hist-7', fiscal_year: '2017', category: 'governance', achievement_text: 'PICC awarded delegated authority for Child Safety — first Indigenous org in Queensland', display_order: 7 },
  { id: 'hist-8', fiscal_year: '2025', category: 'community', achievement_text: 'Elders Advisory Group journey to Hull River — reconnecting with history of forced removal', display_order: 8 },
]

// ─── exploreTimeline ─────────────────────────────────────────────────────────

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

// ─── getDeepHistory ─────────────────────────────────────────────────────────

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
