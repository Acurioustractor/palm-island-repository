/** Pencil source: picc-almanac-web.pen → "03 · MilestoneCallout" (zgUWR). */
import type { tokens } from '@/lib/design-tokens/pdf-tokens'

type SectionKey = keyof typeof tokens.color.section
type BrandKey = keyof typeof tokens.color.brand

export interface MilestoneCalloutProps {
  /** Big phrase (e.g. "1st"). Fraunces 120/700. */
  value: string
  /** Description body. */
  description: string
  /** Background colour. Default 'ocean'. */
  background?: SectionKey | BrandKey
  /** Tint of the value. Default 'starGold'. */
  valueTint?: BrandKey | SectionKey
}
