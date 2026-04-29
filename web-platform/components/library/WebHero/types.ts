/** Pencil source: picc-almanac-web.pen → "06 · WebHero" (G8642). */
export interface WebHeroProps {
  /** Hero background image URL. */
  imageUrl: string
  /** Eyebrow caps line (e.g. "ANNUAL REPORT 2024-25"). */
  eyebrow: string
  /** Main hero title in Fraunces 120 white. */
  title: string
  /** Optional subtitle in Fraunces 36 starGold. */
  subtitle?: string
  /** Hero height in px. Default 680. */
  height?: number
}
