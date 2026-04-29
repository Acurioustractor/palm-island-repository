/** Pencil source: picc-almanac-web.pen → "04 · QuoteCard / Elder" (LXimo). */
export interface QuoteCardElderProps {
  /** The quote, no surrounding quotation marks (component adds them). Fraunces 32 italic. */
  quote: string
  /** Speaker name. */
  speakerName: string
  /** Speaker role / title (e.g. "Elder · Bwgcolman"). */
  speakerRole?: string
  /** Optional speaker portrait URL (48×48 circle). */
  portraitUrl?: string
}
