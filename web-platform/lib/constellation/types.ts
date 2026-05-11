/**
 * Bwgcolman Constellation — data types.
 *
 * The constellation renders three layers simultaneously:
 *   - Face nodes (storytellers) — consent-cleared via EL v2
 *   - Theme gravity wells — named in PICC's extracted_quotes corpus
 *   - Year anchors — historical annual reports as time markers
 *
 * The hero of the workshop. Every field here ties back to data sovereignty:
 * names come from PICC's own validated tables, faces from EL v2's elder-approved
 * + consent-obtained gate. There is no synthetic content in this payload.
 */

export interface FaceNode {
  id: string
  name: string | null
  avatar_url: string
  attribution: string | null
  year: number | null
  /** Slot tag from EL v2 (e.g. "hero", "service-childcare"). Used for visual grouping. */
  slot: string | null
}

export interface ThemeWell {
  /** Lowercase theme key, e.g. "culture", "resilience". */
  key: string
  /** Display label — capitalised theme key. */
  label: string
  /** Number of validated quotes naming this theme in PICC's corpus. */
  count: number
}

export interface YearAnchor {
  fiscal_year: number
  title: string | null
  subtitle: string | null
  cover_url: string | null
}

export interface ConstellationPayload {
  faces: FaceNode[]
  themes: ThemeWell[]
  years: YearAnchor[]
  /** Snapshot counts for the cultural-protocol panel. */
  meta: {
    faces_consented: number
    voices_validated: number
    elder_approvals_current_as_of: string
  }
}
