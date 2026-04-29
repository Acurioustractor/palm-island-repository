/** Props for <ServiceCompactTile>. Shared between web.tsx and pdf.tsx.
 *
 * Pencil source: picc-almanac-web.pen → "🏝️ Services Overview · 4 layout
 * treatments" (C64BFX), treatment 02 · Compact Tile (FCpPz row, single tile
 * shape). For grid views (e.g. 24-up of all services).
 *
 * Conceptual structure: 160h cover image (or section-tint placeholder) →
 * 16padding body with name + optional description + optional staff/clients
 * stat line.
 */
import type { tokens } from '@/lib/design-tokens/pdf-tokens'

type SectionKey = keyof typeof tokens.color.section

export interface ServiceCompactTileProps {
  /** Service display name. */
  name: string
  /** Optional one-line description. */
  description?: string
  /** Optional cover photo URL. When missing, renders a section-tint chip. */
  imageUrl?: string
  /** Section room — drives the tint chip when no image, and the stat strap. */
  tint?: SectionKey
  /** Optional staff count for the metric strap. */
  staffCount?: number
  /** Optional annual clients count for the metric strap. */
  clientsCount?: number
  /** Optional click target. Tile becomes an <a> when provided. */
  href?: string
}
