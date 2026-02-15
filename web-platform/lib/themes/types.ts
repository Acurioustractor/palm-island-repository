/**
 * Thematic Report Builder - Type Definitions
 * Maps themes to content queries and story-scroll section sequences
 */

export type ThemeCategory = 'services' | 'innovation' | 'eras' | 'vision'

export interface ThemeDefinition {
  slug: string
  title: string
  subtitle: string
  category: ThemeCategory
  color: string       // Tailwind gradient or bg class
  heroImage?: string  // Optional hero image URL
  description: string // Narrative intro for the theme

  /** Filters used to query Supabase for matching content */
  filters: ThemeFilters

  /** Ordered list of story-scroll section types to render */
  sectionSequence: ThemeSectionType[]

  /** Page plan template for PDF generation */
  pdfPageTypes: PdfPageEntry[]
}

export interface ThemeFilters {
  /** Match stories.tags array contains any of these */
  storyTags?: string[]
  /** Match stories.related_service or stories.service_id */
  serviceSlug?: string
  /** Match stories.category */
  storyCategory?: string
  /** Match story_quotes.themes array contains any of these */
  quoteThemes?: string[]
  /** Match governance_achievements.category */
  achievementCategory?: string
  /** Fiscal year range for era themes */
  fiscalYearRange?: { from: number; to: number }
  /** Match organization_services.service_category */
  serviceCategory?: string
  /** Free text search in stories.content */
  contentSearch?: string
}

export type ThemeSectionType =
  | 'hero'
  | 'metrics_bar'
  | 'narrative_intro'
  | 'key_stories'
  | 'elder_quotes'
  | 'photo_gallery'
  | 'timeline'
  | 'parallax_divider'
  | 'vision_forward'

export interface PdfPageEntry {
  page_number: number
  page_type: string
  content_config: Record<string, unknown>
}

// --- Fetched content types ---

export interface ThemeStory {
  id: string
  title: string
  content: string
  category: string
  tags: string[] | null
  story_date: string | null
  published_at: string | null
  location: string | null
  outcome_achieved: string | null
  heroImage?: string | null
  storyteller?: { display_name: string; role?: string } | null
}

export interface ThemeQuote {
  id: string
  quote_text: string
  themes: string[] | null
  impact_score: number | null
  story?: {
    title: string
    storyteller?: { display_name: string; role?: string } | null
  } | null
}

export interface ThemePhoto {
  id: string
  file_path: string
  file_name: string
  alt_text: string | null
  caption: string | null
  supabase_bucket: string
}

export interface ThemeMetric {
  service_name: string
  clients_served: number | null
  sessions_delivered: number | null
  events_held: number | null
  staff_count: number | null
  key_achievement: string | null
  headline_stat_value: string | null
  headline_stat_label: string | null
}

export interface ThemeAchievement {
  id: string
  achievement_text: string
  category: string | null
  fiscal_year: number
}

export interface ThemeStaffStats {
  fiscal_year: number
  total_staff: number
  indigenous_staff_count: number | null
  palm_island_resident_count: number | null
  full_time_staff: number | null
  part_time_staff: number | null
}

export interface ThemeContent {
  theme: ThemeDefinition
  stories: ThemeStory[]
  quotes: ThemeQuote[]
  photos: ThemePhoto[]
  metrics: ThemeMetric[]
  achievements: ThemeAchievement[]
  staffStats: ThemeStaffStats[]
}

// --- Story section types for rendering ---

export type StorySection =
  | { type: 'hero'; title: string; subtitle?: string; backgroundImage?: string }
  | { type: 'metrics_bar'; metrics: Array<{ label: string; value: string | number }> }
  | { type: 'narrative_intro'; title?: string; content: string }
  | { type: 'key_stories'; stories: ThemeStory[] }
  | { type: 'elder_quotes'; quotes: ThemeQuote[] }
  | { type: 'photo_gallery'; title?: string; photos: ThemePhoto[] }
  | { type: 'timeline'; title?: string; events: Array<{ date: string; title: string; description: string }> }
  | { type: 'parallax_divider'; backgroundImage: string; text?: string }
  | { type: 'vision_forward'; title: string; content: string }
