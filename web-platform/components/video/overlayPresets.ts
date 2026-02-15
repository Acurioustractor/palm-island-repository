/** Overlay style presets for VideoBackground — PICC brand palette */
export const OVERLAY_PRESETS = {
  /** Dark gradient top and bottom — good readability */
  'gradient-dark': 'bg-gradient-to-b from-black/60 via-black/30 to-black/60',
  /** Brand earth tones fading from edges */
  'gradient-brand': 'bg-gradient-to-b from-[#2D2319]/80 via-[#2D2319]/40 to-[#2D2319]/80',
  /** Heavy bottom gradient — cinematic, great for text at bottom */
  cinematic: 'bg-gradient-to-t from-black/80 via-transparent to-black/40',
  /** Solid dark overlay */
  'solid-dark': 'bg-black/50',
  /** Earth brown overlay */
  'solid-earth': 'bg-[#2D2319]/60',
  /** No overlay */
  none: '',
} as const

export type OverlayPreset = keyof typeof OVERLAY_PRESETS
