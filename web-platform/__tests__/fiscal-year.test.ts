import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getCurrentFiscalYear } from '@/lib/content-readiness/check-completeness'
import { parseFiscalYear } from '@/lib/financials/get-financials'

describe('getCurrentFiscalYear', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns current FY when month is July (start of new FY)', () => {
    vi.setSystemTime(new Date(2025, 6, 1)) // July 2025
    expect(getCurrentFiscalYear()).toBe('2025-26')
  })

  it('returns current FY when month is December', () => {
    vi.setSystemTime(new Date(2025, 11, 15)) // December 2025
    expect(getCurrentFiscalYear()).toBe('2025-26')
  })

  it('returns previous FY when month is June (end of FY)', () => {
    vi.setSystemTime(new Date(2025, 5, 30)) // June 2025
    expect(getCurrentFiscalYear()).toBe('2024-25')
  })

  it('returns previous FY when month is January', () => {
    vi.setSystemTime(new Date(2026, 0, 15)) // January 2026
    expect(getCurrentFiscalYear()).toBe('2025-26')
  })

  it('formats with 2-digit end year', () => {
    vi.setSystemTime(new Date(2030, 7, 1)) // August 2030
    expect(getCurrentFiscalYear()).toBe('2030-31')
  })

  it('handles year boundary correctly (June vs July)', () => {
    // June 30 = still previous FY
    vi.setSystemTime(new Date(2025, 5, 30))
    expect(getCurrentFiscalYear()).toBe('2024-25')

    // July 1 = new FY
    vi.setSystemTime(new Date(2025, 6, 1))
    expect(getCurrentFiscalYear()).toBe('2025-26')
  })
})

describe('parseFiscalYear', () => {
  it('parses "2023-24" format → 2024 (end year)', () => {
    expect(parseFiscalYear('2023-24')).toBe(2024)
  })

  it('parses "2024-25" format → 2025', () => {
    expect(parseFiscalYear('2024-25')).toBe(2025)
  })

  it('parses "2024-2025" format (4-digit end year)', () => {
    expect(parseFiscalYear('2024-2025')).toBe(2025)
  })

  it('parses plain year "2024" as-is', () => {
    expect(parseFiscalYear('2024')).toBe(2024)
  })

  it('throws on invalid format', () => {
    expect(() => parseFiscalYear('invalid')).toThrow('Invalid fiscal year format')
  })

  it('throws on empty string', () => {
    expect(() => parseFiscalYear('')).toThrow('Invalid fiscal year format')
  })
})
