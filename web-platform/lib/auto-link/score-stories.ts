/**
 * Pure scoring logic for auto-linking stories to annual reports.
 * Extracted from app/api/auto-link-stories/route.ts for testability.
 */

export type StoryCandidate = {
  id: string
  title?: string | null
  category?: string | null
  quality_score?: number | null
  total_score?: number | null
  views?: number | null
  shares?: number | null
  likes?: number | null
  is_featured?: boolean | null
  is_verified?: boolean | null
  contains_traditional_knowledge?: boolean | null
  elder_approval_given?: boolean | null
  auto_include?: boolean | null
  report_worthy?: boolean | null
  tags?: string[] | null
}

export type ScoredStory = {
  story: StoryCandidate
  score: number
}

export const KEYWORD_BOOSTS = [
  'photo studio',
  'elders',
  'elder',
  'innovation',
  'digital service centre',
  'delegated authority',
  'bwgcolman',
  'leaders trip',
  'youth',
  'family',
  'health',
]

export const CATEGORIES = [
  'innovation', 'economic_development', 'culture', 'youth', 'health',
  'family', 'environment', 'justice', 'housing', 'community',
]

/** Score a single story candidate */
export function scoreStory(story: StoryCandidate): number {
  const titleLower = String(story.title || '').toLowerCase()
  const tagsLower = Array.isArray(story.tags)
    ? story.tags.map((t) => String(t).toLowerCase()).join(' ')
    : ''

  let score = Number(story.total_score) || Number(story.quality_score) || 0

  // Boost flags
  if (story.auto_include) score += 1000
  if (story.report_worthy) score += 350
  if (story.is_featured) score += 120
  if (story.is_verified) score += 60

  // Penalize unapproved traditional knowledge
  if (story.contains_traditional_knowledge && !story.elder_approval_given) score -= 200

  // Engagement
  const engagement =
    (Number(story.views) || 0) + (Number(story.shares) || 0) * 2 + (Number(story.likes) || 0)
  score += Math.min(250, engagement / 5)

  // Keyword boosts (only first match counts)
  for (const kw of KEYWORD_BOOSTS) {
    if (titleLower.includes(kw) || tagsLower.includes(kw)) {
      score += 80
      break
    }
  }

  return score
}

/** Score and rank stories, ensuring category diversity. Returns top 18. */
export function scoreAndRankStories(candidates: StoryCandidate[]): ScoredStory[] {
  const scored = candidates
    .map((story) => ({ story, score: scoreStory(story) }))
    .sort((a, b) => b.score - a.score)

  // Ensure category diversity
  const byCategory = new Map<string, ScoredStory[]>()
  for (const item of scored) {
    const cat = String(item.story.category || 'general').toLowerCase()
    const list = byCategory.get(cat) || []
    list.push(item)
    byCategory.set(cat, list)
  }

  // Pick top from each category first
  const picked: ScoredStory[] = []
  for (const cat of CATEGORIES) {
    const list = byCategory.get(cat)
    if (list && list.length > 0) picked.push(list[0])
  }

  // Add remaining top stories
  const remaining = scored.filter((s) => !picked.find((p) => p.story.id === s.story.id))
  picked.push(...remaining.slice(0, 20))

  // Limit to top 18 stories
  return picked.slice(0, 18).sort((a, b) => b.score - a.score)
}
