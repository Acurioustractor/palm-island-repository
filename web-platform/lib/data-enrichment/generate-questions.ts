/**
 * Maps completeness gaps to plain-language questions for staff.
 *
 * Takes the output of checkCompleteness() and produces actionable
 * questions grouped by entity and sorted by priority.
 */

import type {
  CompletenessReport,
  ServiceCompleteness,
  ReportSectionCompleteness,
} from '@/lib/content-readiness/check-completeness'

export type DataGap = {
  entityType: 'service' | 'report'
  entityName: string
  entitySlug?: string
  field: string
  question: string
  priority: 'high' | 'medium' | 'low'
  assignTo?: string // role suggestion
}

// Maps service check keys to question templates
const SERVICE_QUESTION_MAP: Record<
  string,
  {
    field: string
    questionTemplate: (name: string) => string
    priority: 'high' | 'medium' | 'low'
    assignTo: string
  }
> = {
  hasDescription: {
    field: 'description',
    questionTemplate: (name) =>
      `Can you provide a 2-3 sentence description of what ${name} does and who it serves?`,
    priority: 'high',
    assignTo: 'Service Manager',
  },
  hasCoverPhoto: {
    field: 'cover_photo',
    questionTemplate: (name) =>
      `Do you have a good photo that represents ${name}? We need a cover image for the annual report.`,
    priority: 'medium',
    assignTo: 'Communications',
  },
  hasCurrentYearMetrics: {
    field: 'metrics',
    questionTemplate: (name) =>
      `How many clients did ${name} serve this financial year? How many sessions were delivered?`,
    priority: 'high',
    assignTo: 'Service Manager',
  },
  hasStories: {
    field: 'stories',
    questionTemplate: (name) =>
      `Can you share a success story or positive outcome from ${name} this year? (De-identified is fine)`,
    priority: 'medium',
    assignTo: 'Service Manager',
  },
  hasGpsCoords: {
    field: 'location',
    questionTemplate: (name) =>
      `What is the street address or location of ${name} on Palm Island?`,
    priority: 'low',
    assignTo: 'Admin',
  },
  hasNotes: {
    field: 'notes',
    questionTemplate: (name) =>
      `What were the key achievements or challenges for ${name} this quarter?`,
    priority: 'medium',
    assignTo: 'Service Manager',
  },
  hasGrantInfo: {
    field: 'grants',
    questionTemplate: (name) =>
      `What funding sources or grants support ${name}? Please list the funder name and approximate amount.`,
    priority: 'medium',
    assignTo: 'Finance',
  },
}

// Maps report section names to question details when the section status is not green
const REPORT_SECTION_QUESTIONS: Record<
  string,
  {
    field: string
    question: string
    priority: 'high' | 'medium' | 'low'
    assignTo: string
  }
> = {
  'CEO Message': {
    field: 'hasCEOMessage',
    question:
      'Has the CEO written their message for the annual report?',
    priority: 'high',
    assignTo: 'CEO',
  },
  'Chair Message': {
    field: 'hasChairMessage',
    question:
      'Has the Board Chair written their message for the annual report?',
    priority: 'high',
    assignTo: 'Board Chair',
  },
  'Financial Data': {
    field: 'hasFinancials',
    question:
      'Have the audited financial statements been completed for this financial year?',
    priority: 'high',
    assignTo: 'Finance Manager',
  },
  'Board Photos': {
    field: 'hasBoardPhotos',
    question:
      'Do we have up-to-date photos of all current Board directors?',
    priority: 'medium',
    assignTo: 'Communications',
  },
  'Elder Quotes': {
    field: 'hasElderQuotes',
    question:
      'Do we have approved Elder quotes for the annual report? (Requires elder_approval_given = true)',
    priority: 'medium',
    assignTo: 'Cultural Advisor',
  },
  'Community Voices': {
    field: 'hasCommunityVoices',
    question:
      'Have community voices and stories been collected for the annual report?',
    priority: 'medium',
    assignTo: 'Communications',
  },
  'Gallery Photos': {
    field: 'hasGalleryPhotos',
    question:
      'Have recent event and activity photos been uploaded to the media library?',
    priority: 'low',
    assignTo: 'Communications',
  },
}

function generateServiceGaps(service: ServiceCompleteness): DataGap[] {
  const gaps: DataGap[] = []

  for (const [checkKey, passed] of Object.entries(service.checks)) {
    if (passed) continue
    const mapping = SERVICE_QUESTION_MAP[checkKey]
    if (!mapping) continue

    gaps.push({
      entityType: 'service',
      entityName: service.name,
      entitySlug: service.slug,
      field: mapping.field,
      question: mapping.questionTemplate(service.name),
      priority: mapping.priority,
      assignTo: mapping.assignTo,
    })
  }

  return gaps
}

function generateReportGaps(
  section: ReportSectionCompleteness
): DataGap | null {
  // Only generate gaps for non-green sections
  if (section.status === 'green') return null

  const mapping = REPORT_SECTION_QUESTIONS[section.section]
  if (!mapping) return null

  return {
    entityType: 'report',
    entityName: section.section,
    field: mapping.field,
    question: mapping.question,
    priority: mapping.priority,
    assignTo: mapping.assignTo,
  }
}

/**
 * Generate plain-language questions from completeness data.
 * Takes the output of checkCompleteness() and produces questions
 * sorted by priority (high first).
 */
export function generateQuestions(
  completeness: CompletenessReport
): DataGap[] {
  const gaps: DataGap[] = []

  // Service-level gaps
  for (const service of completeness.services) {
    gaps.push(...generateServiceGaps(service))
  }

  // Report-level gaps
  for (const section of completeness.reportSections) {
    const gap = generateReportGaps(section)
    if (gap) gaps.push(gap)
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  gaps.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return gaps
}

/**
 * Format gaps as a plain-text list suitable for pasting into
 * email or GHL messages.
 */
export function formatGapsAsText(
  gaps: DataGap[],
  filter?: 'high' | 'medium' | 'low'
): string {
  const filtered = filter ? gaps.filter((g) => g.priority === filter) : gaps
  if (filtered.length === 0) return 'No gaps found.'

  const lines: string[] = []
  let currentEntity = ''

  for (const gap of filtered) {
    if (gap.entityName !== currentEntity) {
      if (currentEntity) lines.push('')
      lines.push(`--- ${gap.entityName} ---`)
      currentEntity = gap.entityName
    }
    const assignee = gap.assignTo ? ` [${gap.assignTo}]` : ''
    lines.push(`  ${gap.priority.toUpperCase()}: ${gap.question}${assignee}`)
  }

  return lines.join('\n')
}
