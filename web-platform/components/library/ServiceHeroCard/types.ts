/** Props for <ServiceHeroCard>. Shared between web.tsx and pdf.tsx.
 *
 * Pencil source: picc-almanac-web.pen → "🏝️ Services Overview · 4 layout
 * treatments" (C64BFX), treatment 01 · Hero Card (mw1g5). For featured
 * service spotlights — landing pages, anchor stories, /services/[slug] hero.
 *
 * Conceptual structure: 600px cover image on the left + 500px shell-bg body
 * on the right, with eyebrow caps (section-tinted) → name (Fraunces 42 ocean)
 * → description (Inter 14 driftwood) → optional Caveat fact strap.
 */
import type { tokens } from '@/lib/design-tokens/pdf-tokens'

type SectionKey = keyof typeof tokens.color.section

export interface ServiceHeroCardProps {
  /** All-caps eyebrow above the name (e.g. "CHILDREN & FAMILIES"). */
  categoryLabel: string
  /** Service display name. Fraunces 42 ocean. */
  name: string
  /** Body description — 1-3 sentences. */
  description?: string
  /** Optional fact strap in Caveat italic (e.g. "FY24-25 · 1st in Queensland"). */
  factStrap?: string
  /** Cover photo URL. Falls back to section-tint block when missing. */
  imageUrl?: string
  /** Section room — drives eyebrow tint and the placeholder block colour. */
  tint?: SectionKey
}
