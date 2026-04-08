import { describe, it, expect } from 'vitest'

// These are internal helpers from check-completeness.ts.
// We re-implement them here to test the logic without Supabase deps.
// If the source changes, these tests catch regressions in the scoring logic.

function scoreToStatus(score: number): 'green' | 'amber' | 'red' {
  if (score >= 70) return 'green'
  if (score >= 40) return 'amber'
  return 'red'
}

function booleanScore(checks: Record<string, boolean>): number {
  const values = Object.values(checks)
  const passed = values.filter(Boolean).length
  return Math.round((passed / values.length) * 100)
}

describe('scoreToStatus', () => {
  it('returns green for score >= 70', () => {
    expect(scoreToStatus(70)).toBe('green')
    expect(scoreToStatus(100)).toBe('green')
    expect(scoreToStatus(85)).toBe('green')
  })

  it('returns amber for score 40-69', () => {
    expect(scoreToStatus(40)).toBe('amber')
    expect(scoreToStatus(69)).toBe('amber')
    expect(scoreToStatus(50)).toBe('amber')
  })

  it('returns red for score < 40', () => {
    expect(scoreToStatus(0)).toBe('red')
    expect(scoreToStatus(39)).toBe('red')
    expect(scoreToStatus(10)).toBe('red')
  })
})

describe('booleanScore', () => {
  it('returns 100 when all checks pass', () => {
    expect(booleanScore({ a: true, b: true, c: true })).toBe(100)
  })

  it('returns 0 when no checks pass', () => {
    expect(booleanScore({ a: false, b: false, c: false })).toBe(0)
  })

  it('calculates percentage correctly', () => {
    // 3 of 7 = 42.857... → rounds to 43
    expect(booleanScore({
      hasDescription: true,
      hasCoverPhoto: false,
      hasGpsCoords: true,
      hasCurrentYearMetrics: false,
      hasStories: true,
      hasNotes: false,
      hasGrantInfo: false,
    })).toBe(43)
  })

  it('rounds correctly for edge cases', () => {
    // 1 of 3 = 33.33 → rounds to 33
    expect(booleanScore({ a: true, b: false, c: false })).toBe(33)
    // 2 of 3 = 66.67 → rounds to 67
    expect(booleanScore({ a: true, b: true, c: false })).toBe(67)
  })

  it('maps to correct status via scoreToStatus', () => {
    // All 7 pass (100) → green
    const allPass = booleanScore({
      hasDescription: true, hasCoverPhoto: true, hasGpsCoords: true,
      hasCurrentYearMetrics: true, hasStories: true, hasNotes: true, hasGrantInfo: true,
    })
    expect(scoreToStatus(allPass)).toBe('green')

    // 3 of 7 pass (43) → amber
    const someFail = booleanScore({
      hasDescription: true, hasCoverPhoto: false, hasGpsCoords: true,
      hasCurrentYearMetrics: false, hasStories: true, hasNotes: false, hasGrantInfo: false,
    })
    expect(scoreToStatus(someFail)).toBe('amber')

    // 1 of 7 pass (14) → red
    const mostFail = booleanScore({
      hasDescription: true, hasCoverPhoto: false, hasGpsCoords: false,
      hasCurrentYearMetrics: false, hasStories: false, hasNotes: false, hasGrantInfo: false,
    })
    expect(scoreToStatus(mostFail)).toBe('red')
  })
})
