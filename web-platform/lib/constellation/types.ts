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
  /** Smaller URL when available; what the SVG renders. Falls back to avatar_url. */
  thumb_url: string
  attribution: string | null
  year: number | null
  /** Slot tag from EL v2 (e.g. "hero", "elder", "service-childcare"). */
  slot: string | null
  /** Inferred Elder status from slot prefix or alt-text. */
  is_elder: boolean
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
}

export interface ConstellationPayload {
  faces: FaceNode[]
  themes: ThemeWell[]
  years: YearDetail[]
  foundation: FoundationEvent[]
  visions: CommunityVision[]
  commitments: ForwardCommitment[]
  stats: ConstellationStats
  /** Always-visible cultural-protocol legibility snapshot. */
  meta: {
    elder_approvals_current_as_of: string
  }
}
