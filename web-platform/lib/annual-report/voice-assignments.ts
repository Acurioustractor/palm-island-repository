/**
 * Voice/story assignment system for annual report pages.
 *
 * Distributes community voices across pages so that:
 *   - No voice appears on multiple pages
 *   - Elder content respects validation/permission rules
 *   - Each page gets the right type and count of voices
 */

import type { CommunityVoice } from './fetch-report-data'

// ── Types ─────────────────────────────────────────────

export interface PageVoiceAssignment {
  voices: CommunityVoice[]
}

export interface VoiceAssignments {
  communityVoices: PageVoiceAssignment
  youthVoices: PageVoiceAssignment
  resilience: PageVoiceAssignment
  floodStories: PageVoiceAssignment
  nextTwenty: PageVoiceAssignment
}

// ── Page voice requirements ───────────────────────────

interface PageVoiceConfig {
  key: keyof VoiceAssignments
  types: CommunityVoice['type'][]
  categories: (string | null)[] | null  // null array = any category, null entry = match voices with no category
  maxCount: number
  /** If true, only include elder_quotes that would pass validation */
  requireElderValidation: boolean
}

const PAGE_CONFIGS: PageVoiceConfig[] = [
  {
    key: 'communityVoices',
    types: ['story', 'elder_quote', 'feedback'],
    categories: ['health', 'family', 'employment', null],
    maxCount: 6,
    requireElderValidation: true,
  },
  {
    key: 'youthVoices',
    types: ['story', 'community_vision'],
    categories: ['youth'],
    maxCount: 3,
    requireElderValidation: false,
  },
  {
    key: 'resilience',
    types: ['elder_quote'],
    categories: ['resilience'],
    maxCount: 1,
    requireElderValidation: true,
  },
  {
    key: 'floodStories',
    types: ['elder_quote', 'story'],
    categories: ['resilience'],
    maxCount: 4,
    requireElderValidation: true,
  },
  {
    key: 'nextTwenty',
    types: ['community_vision'],
    categories: null,
    maxCount: 2,
    requireElderValidation: false,
  },
]

// ── Main assignment function ──────────────────────────

/**
 * Distribute voices across pages. Each voice is assigned to at most one page.
 * Pages are processed in config order (community voices first, then youth, etc.)
 * to ensure priority pages get first pick.
 */
export function assignVoicesToPages(allVoices: CommunityVoice[]): VoiceAssignments {
  const usedIds = new Set<string>()

  const result: VoiceAssignments = {
    communityVoices: { voices: [] },
    youthVoices: { voices: [] },
    resilience: { voices: [] },
    floodStories: { voices: [] },
    nextTwenty: { voices: [] },
  }

  for (const config of PAGE_CONFIGS) {
    const candidates = allVoices.filter((v) => {
      // Skip already-assigned voices
      if (usedIds.has(v.id)) return false

      // Type match
      if (!config.types.includes(v.type)) return false

      // Category match (null in config = any, null in voice category = matches null category entries)
      if (config.categories !== null) {
        const voiceCat = v.category?.toLowerCase() || null
        const configCats = config.categories.map((c) => c?.toLowerCase() || null)
        if (!configCats.includes(voiceCat)) return false
      }

      return true
    })

    // Take up to maxCount
    const assigned = candidates.slice(0, config.maxCount)

    // Mark as used
    for (const voice of assigned) {
      usedIds.add(voice.id)
    }

    result[config.key] = { voices: assigned }
  }

  return result
}
