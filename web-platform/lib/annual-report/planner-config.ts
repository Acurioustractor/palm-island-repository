/**
 * Default page-to-slot mapping for the Annual Report Content Planner.
 *
 * Defines what content slots each of the 20 report pages has,
 * derived from AnnualReportPDF.tsx page components.
 */

import type { PageConfig, ContentSlot } from './planner-types'
import { DEFAULT_PAGES } from './audience-config'

// ── Brand colors for page tiles ─────────────────────────
const COLORS = {
  ocean: '#0B4F6C',
  reef: '#2A9D8F',
  ochre: '#C8963E',
  coral: '#E76F51',
  mangrove: '#386641',
  starGold: '#FFB703',
  midnight: '#1A1A2E',
  sand: '#F5F0E8',
}

// ── Slot factories ──────────────────────────────────────

function photo(id: string, label: string, required = false): ContentSlot {
  return { id, label, type: 'photo', required, value: null }
}

function quote(id: string, label: string, required = false): ContentSlot {
  return { id, label, type: 'quote', required, value: null }
}

function stat(id: string, label: string, required = false): ContentSlot {
  return { id, label, type: 'stat', required, value: null }
}

function text(id: string, label: string, required = false): ContentSlot {
  return { id, label, type: 'text', required, value: null }
}

function chart(id: string, label: string): ContentSlot {
  return { id, label, type: 'chart', required: false, value: null }
}

function person(id: string, label: string): ContentSlot {
  return { id, label, type: 'person', required: false, value: null }
}

// ── Page definitions ────────────────────────────────────

const PAGE_CONFIGS: Record<string, PageConfig> = {
  cover: {
    pageKey: 'cover',
    label: 'Cover',
    description: 'Hero background image and title treatment',
    accentColor: COLORS.ocean,
    slots: [
      photo('cover-hero', 'Hero Background Photo', true),
      text('cover-title', 'Cover Title'),
    ],
  },

  acknowledgement: {
    pageKey: 'acknowledgement',
    label: 'Acknowledgement',
    description: 'Acknowledgement of Country text',
    accentColor: COLORS.ochre,
    slots: [
      text('ack-text', 'Acknowledgement Text', true),
    ],
  },

  messages: {
    pageKey: 'messages',
    label: 'Messages',
    description: 'CEO and Chair messages with portraits',
    accentColor: COLORS.ocean,
    slots: [
      person('msg-ceo', 'CEO'),
      photo('msg-ceo-photo', 'CEO Portrait'),
      text('msg-ceo-title', 'CEO Message Title'),
      text('msg-ceo-body', 'CEO Message Body'),
      quote('msg-ceo-quote', 'CEO Featured Quote'),
      person('msg-chair', 'Chair'),
      photo('msg-chair-photo', 'Chair Portrait'),
      text('msg-chair-title', 'Chair Message Title'),
      text('msg-chair-body', 'Chair Message Body'),
      quote('msg-chair-quote', 'Chair Featured Quote'),
    ],
  },

  numbers: {
    pageKey: 'numbers',
    label: 'Year in Numbers',
    description: 'Hero stat with photo, key metrics grid',
    accentColor: COLORS.reef,
    slots: [
      photo('numbers-hero', 'Hero Photo'),
      stat('numbers-hero-stat', 'Hero Stat (e.g. 197 Staff)', true),
      stat('numbers-stat-1', 'Large Stat 1 (Revenue)'),
      stat('numbers-stat-2', 'Large Stat 2 (Indigenous Employment)'),
      stat('numbers-stat-3', 'Large Stat 3 (Services)'),
      stat('numbers-stat-4', 'Large Stat 4 (Community Members)'),
      stat('numbers-key-1', 'Key Metric 1'),
      stat('numbers-key-2', 'Key Metric 2'),
      stat('numbers-key-3', 'Key Metric 3'),
      stat('numbers-key-4', 'Key Metric 4'),
      chart('numbers-chart', 'Impact Chart Image'),
    ],
  },

  photos: {
    pageKey: 'photos',
    label: 'Photo Spread',
    description: 'Community life gallery — 1 large + 4 grid',
    accentColor: COLORS.mangrove,
    slots: [
      photo('photos-large', 'Large Photo (Full Width)', true),
      photo('photos-grid-1', 'Grid Photo 1'),
      photo('photos-grid-2', 'Grid Photo 2'),
      photo('photos-grid-3', 'Grid Photo 3'),
      photo('photos-grid-4', 'Grid Photo 4'),
    ],
  },

  highlights: {
    pageKey: 'highlights',
    label: 'Highlights',
    description: 'Featured highlight card + grid of 5 more',
    accentColor: COLORS.coral,
    slots: [
      text('highlights-featured', 'Featured Highlight'),
      text('highlights-1', 'Highlight 1'),
      text('highlights-2', 'Highlight 2'),
      text('highlights-3', 'Highlight 3'),
      text('highlights-4', 'Highlight 4'),
      text('highlights-5', 'Highlight 5'),
      stat('highlights-impact', 'Impact Metric'),
    ],
  },

  communityVoices: {
    pageKey: 'communityVoices',
    label: 'Community Voices',
    description: 'Elder wisdom, stories, community visions (6 quotes)',
    accentColor: COLORS.starGold,
    slots: [
      quote('cv-featured', 'Featured Voice (Large)', true),
      quote('cv-2', 'Community Voice 2'),
      quote('cv-3', 'Community Voice 3'),
      quote('cv-4', 'Community Voice 4'),
      quote('cv-5', 'Community Voice 5'),
      quote('cv-6', 'Community Voice 6'),
    ],
  },

  youthVoices: {
    pageKey: 'youthVoices',
    label: 'Youth Voices',
    description: '3 youth quotes + 3 youth stats',
    accentColor: COLORS.coral,
    slots: [
      quote('yv-1', 'Youth Voice 1 (Large)', true),
      quote('yv-2', 'Youth Voice 2'),
      quote('yv-3', 'Youth Voice 3'),
      stat('yv-stat-1', 'Youth Stat 1 (Population)'),
      stat('yv-stat-2', 'Youth Stat 2 (Digital Centre)'),
      stat('yv-stat-3', 'Youth Stat 3 (Diversionary)'),
    ],
  },

  resilience: {
    pageKey: 'resilience',
    label: 'Resilience',
    description: 'Flood knowledge, traditional wisdom, timeline',
    accentColor: COLORS.starGold,
    slots: [
      quote('res-gubbal', 'Gubbal Creation Story'),
      text('res-wisdom', 'Traditional Wisdom'),
      text('res-timeline', 'Resilience Timeline'),
    ],
  },

  floodStories: {
    pageKey: 'floodStories',
    label: 'Flood Stories',
    description: 'Community flood/resilience voices',
    accentColor: COLORS.ocean,
    slots: [
      quote('flood-1', 'Flood Voice 1'),
      quote('flood-2', 'Flood Voice 2'),
      quote('flood-3', 'Flood Voice 3'),
      quote('flood-4', 'Flood Voice 4'),
    ],
  },

  governance: {
    pageKey: 'governance',
    label: 'Governance',
    description: 'Board of Directors portraits and statement',
    accentColor: COLORS.ocean,
    slots: [
      person('gov-chair', 'Chair'),
      person('gov-dir-1', 'Director 1'),
      person('gov-dir-2', 'Director 2'),
      person('gov-dir-3', 'Director 3'),
      person('gov-dir-4', 'Director 4'),
      person('gov-dir-5', 'Director 5'),
      person('gov-dir-6', 'Director 6'),
      text('gov-statement', 'Governance Statement'),
    ],
  },

  compliance: {
    pageKey: 'compliance',
    label: 'Compliance',
    description: 'CATSI Act compliance fields and auditor info',
    accentColor: COLORS.midnight,
    slots: [
      stat('comp-icn', 'ICN Number'),
      stat('comp-abn', 'ABN'),
      stat('comp-members', 'Members Count'),
      stat('comp-agm', 'AGM Date'),
      stat('comp-meetings', 'Board Meetings Held'),
      text('comp-auditor', 'Auditor Information'),
      text('comp-catsi', 'CATSI Compliance Statement'),
    ],
  },

  directorsReport: {
    pageKey: 'directorsReport',
    label: "Directors' Report",
    description: "Directors' declaration and signatories",
    accentColor: COLORS.ocean,
    slots: [
      text('dir-declaration', 'Declaration Text'),
      person('dir-signatory-1', 'Signatory 1 (Chair)'),
      person('dir-signatory-2', 'Signatory 2 (CEO)'),
    ],
  },

  services: {
    pageKey: 'services',
    label: 'Services',
    description: 'Programs grouped by category with staff/client counts',
    accentColor: COLORS.reef,
    slots: [
      text('svc-intro', 'Services Introduction'),
      stat('svc-total-staff', 'Total Staff'),
      stat('svc-total-clients', 'Total Clients'),
    ],
  },

  innovation: {
    pageKey: 'innovation',
    label: 'Innovation',
    description: 'Innovation projects with images and descriptions',
    accentColor: COLORS.reef,
    slots: [
      photo('innov-img-1', 'Project Image 1'),
      photo('innov-img-2', 'Project Image 2'),
      text('innov-desc', 'Innovation Overview'),
      stat('innov-total', 'Total Projects'),
      stat('innov-active', 'Active Projects'),
    ],
  },

  financials: {
    pageKey: 'financials',
    label: 'Financials',
    description: 'Income, expenditure, net result + breakdown bars',
    accentColor: COLORS.mangrove,
    slots: [
      stat('fin-income', 'Total Income', true),
      stat('fin-expenditure', 'Total Expenditure', true),
      stat('fin-net', 'Net Result', true),
      chart('fin-breakdown-chart', 'Expenditure Breakdown Chart'),
      chart('fin-pie-chart', 'Income Pie Chart'),
    ],
  },

  financialDetail: {
    pageKey: 'financialDetail',
    label: 'Financial Detail',
    description: 'Revenue by funder and year-on-year comparison',
    accentColor: COLORS.mangrove,
    slots: [
      chart('findet-funder-chart', 'Revenue by Funder Chart'),
      chart('findet-yoy-chart', 'Year-on-Year Comparison Chart'),
    ],
  },

  journey: {
    pageKey: 'journey',
    label: 'Journey Timeline',
    description: 'Eras from foundation to present, progress bar',
    accentColor: COLORS.starGold,
    slots: [
      text('journey-intro', 'Journey Introduction'),
    ],
  },

  nextTwenty: {
    pageKey: 'nextTwenty',
    label: 'Next Twenty',
    description: 'Vision goals, CEO text, community aspirations',
    accentColor: COLORS.ocean,
    slots: [
      stat('next-goal-1', 'Goal 1 (Staff)'),
      stat('next-goal-2', 'Goal 2 (Services)'),
      stat('next-goal-3', 'Goal 3 (Income)'),
      stat('next-goal-4', 'Goal 4 (Enterprises)'),
      quote('next-vision-1', 'Community Vision 1'),
      quote('next-vision-2', 'Community Vision 2'),
      text('next-ceo', 'CEO Looking Forward Text'),
    ],
  },

  backCover: {
    pageKey: 'backCover',
    label: 'Back Cover',
    description: 'Logo, mission statement, contact details',
    accentColor: COLORS.midnight,
    slots: [
      photo('back-logo', 'Logo'),
      text('back-mission', 'Mission Statement'),
      text('back-contact', 'Contact Details'),
    ],
  },
}

/**
 * Get the default page configs for all 20 pages.
 * Pages are returned in the order defined by DEFAULT_PAGES.
 */
export function getDefaultPageConfigs(): Record<string, PageConfig> {
  const configs: Record<string, PageConfig> = {}
  for (const pageKey of DEFAULT_PAGES) {
    const config = PAGE_CONFIGS[pageKey]
    if (config) {
      // Deep clone to avoid mutation
      configs[pageKey] = JSON.parse(JSON.stringify(config))
    }
  }
  return configs
}

/**
 * Get a single page config by key.
 */
export function getPageConfig(pageKey: string): PageConfig | null {
  return PAGE_CONFIGS[pageKey] || null
}

/**
 * Get all page keys in display order.
 */
export function getOrderedPageKeys(): string[] {
  return [...DEFAULT_PAGES]
}
