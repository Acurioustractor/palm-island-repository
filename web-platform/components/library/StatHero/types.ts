/** Props for <StatHero>. Shared between web.tsx and pdf.tsx.
 *
 * Pencil source: picc-almanac-web.pen → "02 · StatHero" (XhjFb)
 * Conceptual structure: optional icon → big number → eyebrow label → caption.
 */
import type { tokens } from '@/lib/design-tokens/pdf-tokens'

type SectionKey = keyof typeof tokens.color.section
type BrandKey = keyof typeof tokens.color.brand

export interface StatHeroProps {
  /** The big number / phrase (e.g. "17,488", "1st in QLD"). Fraunces 72/700. */
  value: string
  /** Eyebrow label above-or-below the value, all-caps (e.g. "EPISODES OF CARE"). */
  label: string
  /** Optional supporting caption (e.g. "Bwgcolman Healing Service · FY23-24"). */
  caption?: string
  /** Optional icon URL (resolved via assetUrl on the web side). */
  iconUrl?: string
  /** Tints the big value. Default: 'mangrove'. Either a section room or a brand colour. */
  tint?: SectionKey | BrandKey
  /** Layout: column (default, fixed 300×240) or fluid (fills its grid cell). */
  size?: 'fixed' | 'fluid'
}
