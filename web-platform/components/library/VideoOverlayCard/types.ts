/** Props for <VideoOverlayCard>. Shared between web.tsx and pdf.tsx.
 *
 * Pencil source: picc-almanac-web.pen → "🎬 Video Overlay Gallery · 6
 * treatments + create-new spec" (GMfEM). One flexible card covers all six
 * treatments via three knobs: surface (light shell vs dark midnight vs
 * ocean), captionPosition (below the media or overlaid on it), and
 * mediaType (video / poster / placeholder).
 *
 * Slot key convention from EL v2: picc:slot:video-<scene>. Pair with
 * getVideoOverlay(scene) from lib/media/el-photos.
 */
import type { tokens } from '@/lib/design-tokens/pdf-tokens'

type SectionKey = keyof typeof tokens.color.section

export type VideoOverlaySurface = 'shell' | 'midnight' | 'ocean'
export type VideoOverlayCaptionPosition = 'below' | 'overlay-bottom'

export interface VideoOverlayCardProps {
  /** All-caps eyebrow (e.g. "BWGCOLMAN BREAK"). */
  eyebrow: string
  /** Caption / title shown with the video (Fraunces, italic). */
  caption: string
  /** Optional sub-caption (smaller, supporting line). */
  subcaption?: string
  /** Direct video URL. When absent, renders the poster (or section-tint placeholder). */
  videoUrl?: string
  /** Poster / fallback still. Used as <video> poster and as placeholder when videoUrl is absent. */
  posterUrl?: string
  /** Card surface — drives bg + text colour. Default 'shell'. */
  surface?: VideoOverlaySurface
  /** Where the caption sits — under the media or overlaid on the bottom of it. Default 'below'. */
  captionPosition?: VideoOverlayCaptionPosition
  /** Optional section tint for placeholder fill when no poster + videoUrl. */
  tint?: SectionKey
  /** Aspect-ratio for the media block. Default '16:9'. */
  aspect?: '16:9' | '1:1' | '9:16' | '4:3'
  /** Optional anchor id of the next section. When provided, renders a
      "↓ Next: <label>" button that scrolls to #nextSectionId. */
  nextSectionId?: string
  /** Label shown next to the next-section arrow. Default 'Next'. */
  nextSectionLabel?: string
}
