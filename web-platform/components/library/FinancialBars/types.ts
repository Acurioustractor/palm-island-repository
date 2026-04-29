/** Pencil source: picc-almanac-web.pen → "07 · FinancialBars" (jpeCB). */
import type { tokens } from '@/lib/design-tokens/pdf-tokens'

type SectionKey = keyof typeof tokens.color.section
type BrandKey = keyof typeof tokens.color.brand

export interface FinancialBarsRow {
  label: string
  /** Display value, e.g. "$12.4M". */
  display: string
  /** Bar fill ratio 0..1. */
  ratio: number
  /** Bar fill colour. */
  tint?: SectionKey | BrandKey
}

export interface FinancialBarsProps {
  /** All-caps header line. */
  header: string
  rows: FinancialBarsRow[]
}
