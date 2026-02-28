/**
 * PICC Video Theme — "Saltwater & Earth" palette for Remotion
 * Mirrors lib/pdf/theme.ts but adapted for screen/video (RGB, px units).
 */

// ── Saltwater & Earth Palette ────────────────────────
export const colors = {
  // Core Identity
  ocean: '#0B4F6C',
  ochre: '#C8963E',
  earth: '#2D2319',

  // Supporting
  reef: '#0EA5E9',
  mangrove: '#15803D',
  coral: '#E8600A',
  starGold: '#F5A623',

  // Cultural
  turtleRed: '#8B1A1A',
  sand: '#FEF3C7',

  // Dark
  midnight: '#1A1A2E',

  // Neutrals
  rock: '#292524',
  driftwood: '#6B6560',
  muted: '#A39E99',
  shell: '#F7F6F4',
  border: '#E8E6E3',
  white: '#ffffff',
} as const

// ── Typography ───────────────────────────────────────
export const fonts = {
  heading: 'Inter, system-ui, sans-serif',
  body: 'Inter, system-ui, sans-serif',
  display: 'Georgia, serif', // Fallback for Caveat in video context
} as const

// ── Video Dimensions ─────────────────────────────────
export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 30 * 60, // 60 seconds default
} as const

// ── Spacing (px) ─────────────────────────────────────
export const spacing = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  xxl: 64,
  xxxl: 96,
} as const
