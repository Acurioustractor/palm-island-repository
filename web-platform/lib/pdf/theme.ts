/**
 * PICC PDF Theme — Colors, dimensions, typography, and shared styles.
 * Used by all PDF book templates.
 */
import { StyleSheet } from '@react-pdf/renderer'

// ── Saltwater Country Palette ────────────────────────
export const C = {
  // Primary — Coral Sea
  reefDeep: '#0C4A6E',
  reefBright: '#0EA5E9',
  reefDeep10: 'rgba(12, 74, 110, 0.1)',

  // Secondary — Island environment
  sand: '#FEF3C7',
  mangrove: '#065F46',
  coral: '#F97316',

  // Premium dark — Night sky
  midnight: '#1E1B4B',

  // Accent — Stars & innovation
  starGold: '#FBBF24',
  lagoon: '#2DD4BF',

  // Text
  rock: '#292524',
  driftwood: '#78716C',
  textMuted: '#a8a29e',
  textLight: '#d6d3d1',

  // Backgrounds
  white: '#ffffff',
  shellWhite: '#FAFAF9',
  bgLight: '#f5f5f4',
  bgDark: '#1E1B4B',

  // Border
  border: '#e7e5e4',
  borderLight: '#f5f5f4',

  // Legacy aliases (for backward compatibility during migration)
  blue: '#0C4A6E',
  blueDark: '#0C4A6E',
  blueDeep: '#0C4A6E',
  blue50: '#f0f9ff',
  blue100: '#e0f2fe',
  purple: '#0EA5E9',
  purple50: '#f0f9ff',
  purple100: '#e0f2fe',
  purpleDark: '#0C4A6E',
  green: '#065F46',
  green50: '#ecfdf5',
  amber: '#FBBF24',
  amber50: '#FEF3C7',
  orange: '#F97316',
  teal: '#2DD4BF',
  textPrimary: '#292524',
  textSecondary: '#78716C',
  bgSection: '#f5f5f4',
} as const

// ── Page Dimensions (A4) ─────────────────────────────
export const A4_W = 595.28 // pt
export const A4_H = 841.89 // pt
export const MARGIN = 50
export const CONTENT_W = A4_W - MARGIN * 2

// ── Currency Formatting ──────────────────────────────
export function fmtCurrency(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

export function fmtFullCurrency(n: number): string {
  const abs = Math.abs(n)
  const formatted = abs.toLocaleString('en-AU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return n < 0 ? `($${formatted})` : `$${formatted}`
}

// ── Base Styles ──────────────────────────────────────
export const baseStyles = StyleSheet.create({
  // Standard content page
  page: {
    flexDirection: 'column',
    backgroundColor: C.white,
    fontFamily: 'Inter',
    fontSize: 9.5,
    color: C.rock,
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: MARGIN,
  },

  // Full-bleed page (no padding)
  pageBleed: {
    flexDirection: 'column',
    backgroundColor: C.white,
    fontFamily: 'Inter',
    fontSize: 9.5,
    color: C.rock,
  },

  // Running header
  runningHeader: {
    position: 'absolute',
    top: 20,
    left: MARGIN,
    right: MARGIN,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  runningHeaderText: {
    fontSize: 6.5,
    fontWeight: 'semibold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: C.textMuted,
  },

  // Page number footer
  pageFooter: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: C.textMuted,
  },

  // Section label (reef bright uppercase)
  sectionLabel: {
    fontSize: 7.5,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: C.reefBright,
    marginBottom: 6,
  },

  // Headings (Playfair Display serif)
  h1: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 36,
    fontWeight: 'bold',
    color: C.reefDeep,
    marginBottom: 8,
    lineHeight: 1.1,
  },
  h2: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 24,
    fontWeight: 'bold',
    color: C.reefDeep,
    marginBottom: 6,
    lineHeight: 1.15,
  },
  h3: {
    fontSize: 14,
    fontWeight: 'bold',
    color: C.reefDeep,
    marginBottom: 4,
  },
  h4: {
    fontSize: 11,
    fontWeight: 'bold',
    color: C.reefDeep,
    marginBottom: 3,
  },

  // Body text
  body: {
    fontSize: 9.5,
    color: C.driftwood,
    lineHeight: 1.65,
  },
  bodySmall: {
    fontSize: 8.5,
    color: C.driftwood,
    lineHeight: 1.6,
  },
  lead: {
    fontSize: 11,
    color: C.driftwood,
    lineHeight: 1.7,
    marginBottom: 16,
  },
})
