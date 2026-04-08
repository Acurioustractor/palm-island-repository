import { describe, it, expect } from 'vitest'
import { scoreStory, scoreAndRankStories, type StoryCandidate } from '@/lib/auto-link/score-stories'

function makeStory(overrides: Partial<StoryCandidate> = {}): StoryCandidate {
  return {
    id: 'test-id',
    title: 'A regular story',
    category: 'general',
    quality_score: 50,
    total_score: null,
    views: 0,
    shares: 0,
    likes: 0,
    is_featured: false,
    is_verified: false,
    contains_traditional_knowledge: false,
    elder_approval_given: false,
    auto_include: false,
    report_worthy: false,
    tags: [],
    ...overrides,
  }
}

describe('scoreStory', () => {
  it('uses total_score as base when available', () => {
    const score = scoreStory(makeStory({ total_score: 80, quality_score: 30 }))
    expect(score).toBe(80)
  })

  it('falls back to quality_score when total_score is null', () => {
    const score = scoreStory(makeStory({ total_score: null, quality_score: 30 }))
    expect(score).toBe(30)
  })

  it('starts at 0 when both scores are null', () => {
    const score = scoreStory(makeStory({ total_score: null, quality_score: null }))
    expect(score).toBe(0)
  })

  it('adds +1000 for auto_include', () => {
    const base = scoreStory(makeStory())
    const boosted = scoreStory(makeStory({ auto_include: true }))
    expect(boosted - base).toBe(1000)
  })

  it('adds +350 for report_worthy', () => {
    const base = scoreStory(makeStory())
    const boosted = scoreStory(makeStory({ report_worthy: true }))
    expect(boosted - base).toBe(350)
  })

  it('adds +120 for is_featured', () => {
    const base = scoreStory(makeStory())
    const boosted = scoreStory(makeStory({ is_featured: true }))
    expect(boosted - base).toBe(120)
  })

  it('adds +60 for is_verified', () => {
    const base = scoreStory(makeStory())
    const boosted = scoreStory(makeStory({ is_verified: true }))
    expect(boosted - base).toBe(60)
  })

  it('penalizes -200 for unapproved traditional knowledge', () => {
    const base = scoreStory(makeStory())
    const penalized = scoreStory(makeStory({
      contains_traditional_knowledge: true,
      elder_approval_given: false,
    }))
    expect(penalized - base).toBe(-200)
  })

  it('does NOT penalize approved traditional knowledge', () => {
    const base = scoreStory(makeStory())
    const approved = scoreStory(makeStory({
      contains_traditional_knowledge: true,
      elder_approval_given: true,
    }))
    expect(approved).toBe(base)
  })

  it('calculates engagement correctly (views + shares*2 + likes) / 5, capped at 250', () => {
    // 100 views + 50 shares*2 + 50 likes = 250 engagement => 250/5 = 50
    const score = scoreStory(makeStory({
      total_score: 0, quality_score: 0,
      views: 100, shares: 50, likes: 50,
    }))
    expect(score).toBe(50)
  })

  it('caps engagement bonus at 250', () => {
    // Huge engagement: 10000 views => 10000/5 = 2000, capped at 250
    const score = scoreStory(makeStory({
      total_score: 0, quality_score: 0,
      views: 10000, shares: 0, likes: 0,
    }))
    expect(score).toBe(250)
  })

  it('adds +80 for keyword match in title', () => {
    const base = scoreStory(makeStory({ total_score: 0, quality_score: 0 }))
    const boosted = scoreStory(makeStory({
      total_score: 0, quality_score: 0,
      title: 'Youth Program Success Story',
    }))
    expect(boosted - base).toBe(80)
  })

  it('adds +80 for keyword match in tags', () => {
    const base = scoreStory(makeStory({ total_score: 0, quality_score: 0 }))
    const boosted = scoreStory(makeStory({
      total_score: 0, quality_score: 0,
      tags: ['innovation', 'tech'],
    }))
    expect(boosted - base).toBe(80)
  })

  it('only counts one keyword boost even with multiple matches', () => {
    const base = scoreStory(makeStory({ total_score: 0, quality_score: 0 }))
    const boosted = scoreStory(makeStory({
      total_score: 0, quality_score: 0,
      title: 'Youth Elder Health Innovation',
    }))
    // Should only be +80, not +320
    expect(boosted - base).toBe(80)
  })

  it('handles null/undefined fields gracefully', () => {
    const score = scoreStory({
      id: 'minimal',
      title: null,
      category: null,
      quality_score: null,
      total_score: null,
      views: null,
      shares: null,
      likes: null,
      is_featured: null,
      is_verified: null,
      contains_traditional_knowledge: null,
      elder_approval_given: null,
      auto_include: null,
      report_worthy: null,
      tags: null,
    })
    expect(score).toBe(0)
  })
})

describe('scoreAndRankStories', () => {
  it('returns empty array for empty input', () => {
    expect(scoreAndRankStories([])).toEqual([])
  })

  it('limits output to 18 stories', () => {
    const stories = Array.from({ length: 30 }, (_, i) =>
      makeStory({ id: `story-${i}`, total_score: 100 - i })
    )
    const result = scoreAndRankStories(stories)
    expect(result.length).toBe(18)
  })

  it('returns results sorted by score descending', () => {
    const stories = [
      makeStory({ id: 'low', total_score: 10 }),
      makeStory({ id: 'high', total_score: 100 }),
      makeStory({ id: 'mid', total_score: 50 }),
    ]
    const result = scoreAndRankStories(stories)
    expect(result[0].story.id).toBe('high')
    expect(result[result.length - 1].story.id).toBe('low')
  })

  it('ensures category diversity — picks top from each category', () => {
    const stories = [
      // High-scoring health story
      makeStory({ id: 'health-1', category: 'health', total_score: 200 }),
      makeStory({ id: 'health-2', category: 'health', total_score: 190 }),
      // Lower-scoring innovation story should still appear
      makeStory({ id: 'innovation-1', category: 'innovation', total_score: 50 }),
    ]
    const result = scoreAndRankStories(stories)
    const ids = result.map((r) => r.story.id)
    expect(ids).toContain('health-1')
    expect(ids).toContain('innovation-1')
  })

  it('auto_include stories dominate ranking', () => {
    const stories = [
      makeStory({ id: 'normal', total_score: 500 }),
      makeStory({ id: 'auto', total_score: 10, auto_include: true }),
    ]
    const result = scoreAndRankStories(stories)
    expect(result[0].story.id).toBe('auto')
  })
})
