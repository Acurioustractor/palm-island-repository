/**
 * TypeScript interfaces for the Annual Report Content Planner.
 *
 * Defines the shape of a planner configuration — which content
 * (photos, quotes, stats, charts) goes into each slot of each page.
 */

import type { ReportAudience } from './audience-config'

// ── Slot types ──────────────────────────────────────────

export type SlotType = 'photo' | 'quote' | 'stat' | 'text' | 'chart' | 'person'

export interface ContentSlot {
  /** Unique slot ID within a page, e.g. "cover-hero" */
  id: string
  /** Human-readable label */
  label: string
  type: SlotType
  /** Whether this slot is required for the page to render */
  required: boolean
  /** Current assigned value — depends on type */
  value: SlotValue | null
}

export type SlotValue =
  | PhotoSlotValue
  | QuoteSlotValue
  | StatSlotValue
  | TextSlotValue
  | ChartSlotValue
  | PersonSlotValue

export interface PhotoSlotValue {
  type: 'photo'
  mediaFileId: string
  url: string
  caption?: string
  tags?: string[]
}

export interface QuoteSlotValue {
  type: 'quote'
  sourceTable: 'extracted_quotes' | 'elder_quotes' | 'community_visions' | 'stories'
  sourceId: string
  text: string
  author: string | null
  role: string | null
  photoUrl?: string | null
}

export interface StatSlotValue {
  type: 'stat'
  label: string
  value: string
  unit?: string
  sourceStatId?: string
}

export interface TextSlotValue {
  type: 'text'
  content: string
}

export interface ChartSlotValue {
  type: 'chart'
  /** Media file ID of the generated chart image */
  mediaFileId: string
  url: string
  /** The prompt used to generate this chart */
  prompt: string
  /** Underlying data for regeneration */
  chartData: Record<string, unknown>
}

export interface PersonSlotValue {
  type: 'person'
  personId: string
  name: string
  role: string
  photoUrl: string | null
}

// ── Page config ─────────────────────────────────────────

export interface PageConfig {
  /** Page key matching audience-config.ts, e.g. 'cover', 'messages' */
  pageKey: string
  /** Display label */
  label: string
  /** Short description of this page's purpose */
  description: string
  /** Content slots for this page */
  slots: ContentSlot[]
  /** Thumbnail color for the grid tile */
  accentColor: string
}

// ── Full planner config ─────────────────────────────────

export interface PlannerConfig {
  id?: string
  fiscalYear: string
  audience: ReportAudience
  /** Page configs keyed by pageKey */
  pages: Record<string, PageConfig>
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

// ── Database row shape ──────────────────────────────────

export interface PlannerConfigRow {
  id: string
  fiscal_year: string
  audience: string | null
  config: Record<string, PageConfig>
  created_by: string | null
  created_at: string
  updated_at: string
}
