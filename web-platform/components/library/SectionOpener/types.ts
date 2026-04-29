/** Pencil source: picc-almanac-web.pen → "01 · SectionOpener" (jX21S). */
import type { tokens } from '@/lib/design-tokens/pdf-tokens'

type SectionKey = keyof typeof tokens.color.section

export interface SectionOpenerProps {
  /** Eyebrow caps (e.g. "CHILDREN & FAMILIES"). */
  eyebrow: string
  /** Section title in Fraunces 72. */
  title: string
  /** Optional supporting line under the title. */
  subtitle?: string
  /** Section room — drives eyebrow + title color. */
  section?: SectionKey
  /** Optional icon URL (resolved via assetUrl on web side). */
  iconUrl?: string
}
