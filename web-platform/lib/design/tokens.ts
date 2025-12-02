/**
 * Design Tokens for Palm Island Annual Reports
 * Shared values for both dashboard and public report experiences
 */

// Earth & Ocean palette - culturally appropriate for Palm Island
export const colors = {
  // Primary - Earth tones (connection to land)
  earth: {
    50: '#fdf8f3',
    100: '#f5e6d3',
    200: '#e6cba8',
    300: '#d4a574',
    400: '#c4854a',
    500: '#8b5a2b',
    600: '#6f4722',
    700: '#543619',
    800: '#3a2511',
    900: '#1f1409',
  },

  // Ocean - Torres Strait waters
  ocean: {
    50: '#f0f7fb',
    100: '#d4e9f5',
    200: '#a8d3eb',
    300: '#6bb4db',
    400: '#3a94c7',
    500: '#1e3a5f',
    600: '#183049',
    700: '#122534',
    800: '#0c1a22',
    900: '#060f11',
  },

  // Accent - Sunrise/energy
  sunrise: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#e85d04',
    600: '#c2410c',
    700: '#9a3412',
    800: '#7c2d12',
    900: '#431407',
  },

  // Growth - Forest green
  growth: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#2d6a4f',
    600: '#1b4332',
    700: '#14532d',
    800: '#166534',
    900: '#052e16',
  },

  // Coral - Community warmth
  coral: {
    50: '#fff5f5',
    100: '#ffe3e3',
    200: '#ffc9c9',
    300: '#ffa8a8',
    400: '#ff8787',
    500: '#ff6b6b',
    600: '#fa5252',
    700: '#f03e3e',
    800: '#e03131',
    900: '#c92a2a',
  },
};

// Semantic colors for status indicators
export const semanticColors = {
  success: {
    light: '#dcfce7',
    main: '#22c55e',
    dark: '#15803d',
    text: '#166534',
  },
  warning: {
    light: '#fef3c7',
    main: '#f59e0b',
    dark: '#b45309',
    text: '#92400e',
  },
  error: {
    light: '#fee2e2',
    main: '#ef4444',
    dark: '#b91c1c',
    text: '#991b1b',
  },
  info: {
    light: '#dbeafe',
    main: '#3b82f6',
    dark: '#1d4ed8',
    text: '#1e40af',
  },
};

// Typography scale
export const typography = {
  // Font families
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    display: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },

  // Size scale (rem)
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
  },

  // Line heights
  lineHeight: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
};

// Spacing scale
export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  8: '2rem',        // 32px
  10: '2.5rem',     // 40px
  12: '3rem',       // 48px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  32: '8rem',       // 128px
};

// Animation durations and easings
export const animation = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
  },
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
};

// Shadow definitions
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
};

// Border radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

// Z-index scale
export const zIndex = {
  behind: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
};

// Breakpoints (matching Tailwind defaults)
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Report-specific design tokens
export const reportTokens = {
  // Section backgrounds
  sectionBg: {
    light: '#fefdfb',
    alternate: '#f8f6f3',
    dark: '#1a1a1a',
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2d6a4f 100%)',
  },

  // Quote styling
  quote: {
    fontSize: '1.5rem',
    lineHeight: 1.5,
    borderColor: colors.earth[500],
    backgroundColor: colors.earth[50],
  },

  // Impact stat styling
  impactStat: {
    numberSize: '4rem',
    labelSize: '1rem',
    animationDuration: 2000,
  },

  // Story card styling
  storyCard: {
    borderRadius: borderRadius['2xl'],
    padding: spacing[6],
    shadow: shadows.lg,
    hoverShadow: shadows.xl,
  },
};

// Dashboard-specific design tokens
export const dashboardTokens = {
  // Sidebar
  sidebar: {
    width: '280px',
    collapsedWidth: '64px',
    background: '#ffffff',
    borderColor: '#e5e7eb',
  },

  // Header
  header: {
    height: '64px',
    background: '#ffffff',
    borderColor: '#e5e7eb',
  },

  // Cards
  card: {
    background: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    shadow: shadows.md,
  },

  // Status badges
  statusColors: {
    draft: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
    review: { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
    published: { bg: '#dcfce7', text: '#166534', border: '#22c55e' },
    archived: { bg: '#f3f4f6', text: '#4b5563', border: '#9ca3af' },
  },
};

export default {
  colors,
  semanticColors,
  typography,
  spacing,
  animation,
  shadows,
  borderRadius,
  zIndex,
  breakpoints,
  reportTokens,
  dashboardTokens,
};
