/**
 * Bwgcolman Constellation — data types.
 *
 * The constellation is a living map of Palm Island storytelling culture.
 * Layers, in order of depth:
 *   1. Foundation   — pre-PICC anchors (Hull River → Reserve gazette → 2004)
 *   2. The Field    — face nodes (consent-cleared EL v2 photos)
 *   3. Themes       — gravity wells with top quotes
 *   4. Years        — financials + governance + timeline events per FY
 *   5. Future       — community visions + 20-year forward commitments
 *
 * Cultural protocols are first-class fields — visibility of consent and
 * Elder approval is part of the design, not metadata.
 */

export interface FaceNode {
  id: string
  name: string | null
  /** Full-resolution photo URL — used only when a face card is open. */
  avatar_url: string
  /** Smaller URL for the SVG nodes. */
  thumb_url: string
  attribution: string | null
  /** Year the photo was taken, if known. */
  year: number | null
  /** Origin of this face: storyteller (named, profile), leadership, board, or photo (consented EL v2 only). */
  kind: 'storyteller' | 'leadership' | 'board' | 'photo'
  /** Slug for stable matching (storyteller.slug / leadership.id / board.id / photo.id). */
  slug: string | null
  /** Storyteller display role / leadership title. */
  role: string | null
  /** Cultural background label when known. */
  cultural_background: string | null
  /** Whether this person is Elder-tagged in EL v2 / PICC. */
  is_elder: boolean
  /** Featured flag from EL v2 storytellers. */
  is_featured: boolean
  /** EL v2 service slugs this storyteller is linked to. */
  service_slugs: string[]
  /** EL v2 project slugs this storyteller is linked to. */
  project_slugs: string[]
  /** Number of validated quotes attributed to this person. */
  quote_count: number
}

export interface TopQuote {
  text: string
  attribution: string | null
  /** True iff suggested_for_report flag set by validators. */
  suggested: boolean
}

export interface ThemeWell {
  key: string
  label: string
  count: number
  top_quotes: TopQuote[]
}

export interface TimelineMarker {
  year: number
  title: string
  significance: number
  event_type: string | null
  is_featured: boolean
  image_url: string | null
}

export interface YearDetail {
  fiscal_year: number
  /** Total income for the fiscal year (AUD), if known. */
  revenue: number | null
  audited: boolean
  /** Annual report metadata for this year, if a report exists. */
  report_title: string | null
  report_subtitle: string | null
  report_cover_url: string | null
  /** Featured timeline events in this year. */
  events: TimelineMarker[]
  /** First few governance achievements for the year. */
  achievements: string[]
}

export interface FoundationEvent {
  year: number
  title: string
  description: string | null
  event_type: string | null
  significance: number
}

export interface CommunityVision {
  text: string
  author_name: string | null
  author_role: string | null
  category: string | null
}

export interface ForwardCommitment {
  /** Target year for the commitment (e.g. 2028, 2030, 2045). */
  target_year: number
  title: string
  body: string
}

export interface ConstellationStats {
  faces_consented: number
  voices_validated_elder: number
  voices_extracted: number
  stories: number
  governance_achievements: number
  board_members: number
  knowledge_entries: number
  /**
   * Items hidden from the public surface by community choice
   * (cultural_sensitivity = 'restricted' / 'sacred'). Counted but not
   * displayed — sovereignty made legible.
   */
  restricted_by_community: number
}

export interface ServiceMetric {
  fiscal_year: number | null
  clients_served: number | null
  sessions_delivered: number | null
  events_held: number | null
  staff_count: number | null
  headline_stat_value: string | null
  headline_stat_label: string | null
  key_achievement: string | null
}

export interface ServiceItem {
  id: string
  name: string
  slug: string
  description: string | null
  /** Canonical EL v2 service photo. */
  image_url: string | null
  category: string | null
  service_type: string | null
  status: string | null
  /** Geographic location set in /picc/services/map admin. */
  latitude: number | null
  longitude: number | null
  /** Face ids of storytellers linked via service_slugs. */
  photo_ids: string[]
  /** Per-fiscal-year performance from PICC service_metrics. */
  metrics: ServiceMetric[]
}

export interface ProjectItem {
  id: string
  name: string
  slug: string
  description: string | null
  status: string | null
  start_year: number | null
  /** Canonical EL v2 project cover photo. */
  image_url: string | null
  tagline: string | null
  /** Face ids of storytellers linked via project_slugs. */
  photo_ids: string[]
  /** EL v2 photo count tagged to this project. */
  photo_count: number
}

export interface NamedElder {
  /** Display name as it appears in elder_quotes.speaker_name. */
  name: string
  /** Number of validated quotes attributed to this elder. */
  quote_count: number
  /** Up to 5 quotes from this elder, for the right rail. */
  quotes: string[]
  /** Face ids whose photo metadata mentions this elder. */
  photo_ids: string[]
}

export interface AnnualReportSection {
  title: string
  summary: string
}

export interface AnnualReportStats {
  ceo?: string | null
  chair?: string | null
  staff_count?: number | null
  total_revenue?: number | null
  total_expenses?: number | null
  net_surplus?: number | null
  programs_count?: number | null
  clients_served?: number | null
  trainees?: number | null
  [key: string]: number | string | null | undefined
}

export interface AnnualReportItem {
  fiscal_year: number
  title: string | null
  subtitle: string | null
  cover_photo_url: string | null
  pdf_url: string | null
  published_date: string | null
  /** AI-extracted: 2-4 sentence summary of the year. */
  summary: string | null
  /** AI-extracted: structured numbers (CEO, chair, revenue, staff, clients…). */
  stats: AnnualReportStats | null
  /** AI-extracted: section titles + summaries from the PDF. */
  sections: AnnualReportSection[]
  /** AI-extracted: key achievements bullet list (from metadata). */
  key_achievements: string[]
  /** When the extraction was last run. */
  extracted_at: string | null
}

export interface HistoricalArtifact {
  id: string
  title: string
  artifact_type: string
  source_name: string | null
  source_url: string | null
  date_original: string | null
  content_summary: string | null
  image_url: string | null
  tags: string[]
  chapter_ref: string | null
  is_verified: boolean
}

export interface PiccEra {
  name: string
  year_start: number | null
  year_end: number | null
  description: string | null
  milestones: string[]
}

export interface ElderTripStop {
  trip_name: string
  stop_order: number | null
  name: string
  description: string | null
  lat: number | null
  lng: number | null
}

export interface PartnerOrg {
  id: string
  name: string
  short_name: string | null
  partner_type: string | null
  logo_url: string | null
  website_url: string | null
  start_year: number | null
}

export interface ResearchSource {
  id: string
  title: string
  source_type: string
  author: string | null
  publisher: string | null
  publication_date: string | null
  url: string | null
  citation_text: string | null
  is_primary_source: boolean
  is_verified: boolean
}

export interface BwgcolmanNation {
  /** "Bwgcolman" — composite name meaning "many tribes, one people". */
  name: string
  /** Primary public framing — short. */
  meaning: string
  /** PICC's canonical annual-report number. */
  language_groups: number
  /** Year forced relocations began (Hull River 1918). */
  founded_year: number
  /** Traditional Owners of Great Palm Island. */
  traditional_owners: string
  /** Plain-English sourcing note for the language-groups number — surfaced
   *  in the Bwgcolman lens so the screen never hides the fact that
   *  different sources count differently. */
  sourcing_note: string
}

export interface SpeakerQuote {
  text: string
  /** Theme key when known. */
  theme: string | null
  /** True when validator flagged for an annual report. */
  suggested: boolean
  /** Source table tag (debug). */
  source: 'elder_quotes' | 'extracted_quotes'
}

export interface StoryItem {
  id: string
  title: string
  summary: string | null
  category: string | null
  story_type: string | null
  quality_score: number | null
  is_featured: boolean
  created_year: number | null
}

export interface KnowledgeEntry {
  id: string
  title: string
  subtitle: string | null
  summary: string | null
  entry_type: string
  category: string | null
  date_from: string | null
  fiscal_year: string | null
  importance: number | null
  is_featured: boolean
}

export interface HullRiverVoice {
  /** Quote text mentioning Hull River, cyclone, transfer, etc. */
  text: string
  speaker: string | null
  theme: string | null
}

export interface ConstellationPayload {
  faces: FaceNode[]
  themes: ThemeWell[]
  years: YearDetail[]
  foundation: FoundationEvent[]
  visions: CommunityVision[]
  commitments: ForwardCommitment[]
  services: ServiceItem[]
  projects: ProjectItem[]
  named_elders: NamedElder[]
  annual_reports: AnnualReportItem[]
  bwgcolman: BwgcolmanNation
  /** Quotes keyed by lowercase speaker last-name token. Lets any face on
   *  the canvas surface their quotes in the right rail without re-fetch. */
  quotes_by_speaker: Record<string, SpeakerQuote[]>
  /** Top stories by quality_score — drives the Stories lens. */
  top_stories: StoryItem[]
  /** Featured knowledge entries — programs, events, statistics, history. */
  featured_knowledge: KnowledgeEntry[]
  /** Quotes / fragments referencing Hull River + the 1918 cyclone. */
  hull_river_voices: HullRiverVoice[]
  /** Historical artifacts (573 newspapers 1911→2014, court records, photographs) */
  historical_artifacts: HistoricalArtifact[]
  /** PICC's own 4-era timeline (Foundation, Growth, Transition, Community Controlled) */
  picc_eras: PiccEra[]
  /** Stops on the 2024 Elders trip (Palm → Lucinda → Ingham → Hull River). */
  elder_trip_stops: ElderTripStop[]
  /** PICC partnership network. */
  partners: PartnerOrg[]
  /** Citation graph for history claims. */
  research_sources: ResearchSource[]
  stats: ConstellationStats
  /** Always-visible cultural-protocol legibility snapshot. */
  meta: {
    elder_approvals_current_as_of: string
  }
}
