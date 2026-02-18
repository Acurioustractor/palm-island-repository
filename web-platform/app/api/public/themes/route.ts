/**
 * Public Themes API
 *
 * GET /api/public/themes
 *
 * Returns thematic analysis across all content:
 * - Theme name, count of quotes, sample quotes
 * - Aggregated from extracted_quotes, elder_quotes, and story categories
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const revalidate = 600 // Cache for 10 minutes

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// Normalize raw theme strings into clean display themes
const THEME_MAP: Record<string, string> = {
  // Standard themes
  community: 'Community',
  services: 'Services',
  culture: 'Culture',
  history: 'History',
  achievement: 'Achievement',
  resilience: 'Resilience',
  youth: 'Youth',
  elders: 'Elders',
  innovation: 'Innovation',
  connection: 'Connection',
  // Common AI-generated theme variants
  community_wellbeing: 'Community',
  cultural_preservation: 'Culture',
  youth_development: 'Youth',
  employment: 'Employment',
  health: 'Health',
  education: 'Education',
  housing: 'Community',
  environment: 'Community',
  governance: 'Governance',
  family: 'Family',
  healing: 'Healing',
  economic_development: 'Employment',
  child_protection: 'Family',
  crisis_services: 'Services',
  justice: 'Services',
  digital_services: 'Innovation',
}

function normalizeTheme(raw: string | null): string | null {
  if (!raw) return null
  const key = raw.toLowerCase().trim().replace(/[\s-]+/g, '_')
  return THEME_MAP[key] || null
}

interface ThemeSummary {
  theme: string
  count: number
  sources: { extracted: number; elder: number; stories: number }
  sampleQuotes: Array<{
    text: string
    author: string | null
    source: string
  }>
}

export async function GET() {
  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    const [extractedResult, elderResult, storiesResult] = await Promise.all([
      supabase
        .from('extracted_quotes')
        .select('quote_text, attribution, theme, impact_area')
        .eq('is_validated', true)
        .limit(500),

      supabase
        .from('elder_quotes')
        .select('text, speaker_name, theme, category')
        .eq('is_validated', true)
        .eq('permission_level', 'public')
        .limit(500),

      supabase
        .from('stories')
        .select('title, quote_text, quote_attribution, category')
        .eq('status', 'published')
        .eq('report_worthy', true)
        .limit(100),
    ])

    const themeMap = new Map<string, ThemeSummary>()

    const getOrCreate = (theme: string): ThemeSummary => {
      if (!themeMap.has(theme)) {
        themeMap.set(theme, {
          theme,
          count: 0,
          sources: { extracted: 0, elder: 0, stories: 0 },
          sampleQuotes: [],
        })
      }
      return themeMap.get(theme)!
    }

    // Process extracted quotes
    for (const q of extractedResult.data || []) {
      const theme = normalizeTheme(q.theme) || normalizeTheme(q.impact_area)
      if (!theme) continue
      const entry = getOrCreate(theme)
      entry.count++
      entry.sources.extracted++
      if (entry.sampleQuotes.length < 3) {
        const text = String(q.quote_text || '').trim()
        if (text.length >= 30) {
          entry.sampleQuotes.push({ text, author: q.attribution || null, source: 'interview' })
        }
      }
    }

    // Process elder quotes
    for (const q of elderResult.data || []) {
      const theme = normalizeTheme(q.theme) || normalizeTheme(q.category)
      if (!theme) continue
      const entry = getOrCreate(theme)
      entry.count++
      entry.sources.elder++
      if (entry.sampleQuotes.length < 3) {
        const text = String(q.text || '').trim()
        if (text.length >= 30) {
          entry.sampleQuotes.push({ text, author: q.speaker_name || null, source: 'elder' })
        }
      }
    }

    // Process stories
    for (const s of storiesResult.data || []) {
      const theme = normalizeTheme(s.category)
      if (!theme) continue
      const entry = getOrCreate(theme)
      entry.count++
      entry.sources.stories++
      if (entry.sampleQuotes.length < 3 && s.quote_text) {
        entry.sampleQuotes.push({
          text: String(s.quote_text).trim(),
          author: s.quote_attribution || null,
          source: 'story',
        })
      }
    }

    // Sort by count descending
    const themes = Array.from(themeMap.values()).sort((a, b) => b.count - a.count)

    return NextResponse.json({
      themes,
      totalQuotes: themes.reduce((sum, t) => sum + t.count, 0),
    })
  } catch (error: any) {
    console.error('Error building thematic analysis:', error)
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}
