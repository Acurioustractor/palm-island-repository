/**
 * Shared audience configuration for annual reports.
 *
 * Used by both the PDF template (AnnualReportPDF) and the live web page.
 * Extracted from AnnualReportPDF.tsx to maintain a single source of truth.
 */

export type ReportAudience = 'community' | 'funder' | 'board' | 'supporter' | 'government' | null

export interface AudienceConfig {
  coverSubtitle: string
  pages: string[]
  statEmphasis: 'people' | 'money' | 'balanced'
}

export const AUDIENCE_CONFIGS: Record<string, AudienceConfig> = {
  community: {
    coverSubtitle: 'Year 17 — Saltwater Country, One People',
    pages: [
      'cover', 'acknowledgement', 'messages', 'numbers', 'photos',
      'highlights', 'communityVoices', 'youthVoices', 'resilience', 'floodStories',
      'services', 'innovation', 'journey', 'nextTwenty', 'backCover',
    ],
    statEmphasis: 'people',
  },
  funder: {
    coverSubtitle: `Annual Report`,
    pages: [
      'cover', 'acknowledgement', 'messages', 'numbers',
      'highlights', 'services', 'innovation', 'governance',
      'compliance', 'directorsReport', 'financials', 'financialDetail',
      'nextTwenty', 'backCover',
    ],
    statEmphasis: 'money',
  },
  supporter: {
    coverSubtitle: 'Year 17 — Our Impact & Innovation',
    pages: [
      'cover', 'acknowledgement', 'messages', 'numbers', 'photos',
      'highlights', 'communityVoices', 'resilience', 'floodStories',
      'innovation', 'journey', 'nextTwenty', 'backCover',
    ],
    statEmphasis: 'balanced',
  },
  board: {
    coverSubtitle: `Annual Report`,
    pages: [
      'cover', 'acknowledgement', 'messages', 'numbers',
      'highlights', 'governance', 'compliance', 'directorsReport',
      'services', 'innovation', 'financials', 'financialDetail',
      'communityVoices', 'journey', 'nextTwenty', 'backCover',
    ],
    statEmphasis: 'balanced',
  },
  government: {
    coverSubtitle: `Annual Report`,
    pages: [
      'cover', 'acknowledgement', 'messages', 'numbers',
      'highlights', 'services', 'governance', 'compliance',
      'directorsReport', 'financials', 'financialDetail',
      'innovation', 'nextTwenty', 'backCover',
    ],
    statEmphasis: 'money',
  },
}

export const DEFAULT_PAGES = [
  'cover', 'acknowledgement', 'messages', 'numbers', 'photos',
  'highlights', 'communityVoices', 'youthVoices', 'resilience', 'floodStories',
  'governance', 'compliance', 'directorsReport', 'services', 'innovation',
  'financials', 'financialDetail', 'journey', 'nextTwenty', 'backCover',
]

/** Check if a PDF page should be shown for the given audience */
export function shouldShow(page: string, audience: ReportAudience): boolean {
  if (!audience) return DEFAULT_PAGES.includes(page)
  const config = AUDIENCE_CONFIGS[audience]
  return config ? config.pages.includes(page) : DEFAULT_PAGES.includes(page)
}

// ── Web section mapping ──
// Maps live web page sections to their corresponding PDF page keys

const WEB_SECTION_TO_PDF_PAGES: Record<string, string[]> = {
  hero: [], // always show
  acknowledgment: [], // always show
  messages: ['messages'],
  numbers: ['numbers'],
  communityVoices: ['communityVoices', 'youthVoices'],
  services: ['services'],
  photos: ['photos'],
  innovation: ['innovation'],
  governance: ['governance'],
  financials: ['financials', 'financialDetail'],
  vision: ['nextTwenty', 'journey'],
}

/** Check if a web section should be shown for the given audience */
export function shouldShowWebSection(section: string, audience: ReportAudience): boolean {
  const pdfPages = WEB_SECTION_TO_PDF_PAGES[section]
  // Sections with no mapped pages (hero, acknowledgment) always show
  if (!pdfPages || pdfPages.length === 0) return true
  // Show the web section if ANY of its mapped PDF pages would be shown
  return pdfPages.some((page) => shouldShow(page, audience))
}

/** Parse audience from search params, returning null for invalid/missing */
export function parseAudience(value?: string | null): ReportAudience {
  if (!value) return null
  const valid: ReportAudience[] = ['community', 'funder', 'board', 'supporter', 'government']
  return valid.includes(value as ReportAudience) ? (value as ReportAudience) : null
}
