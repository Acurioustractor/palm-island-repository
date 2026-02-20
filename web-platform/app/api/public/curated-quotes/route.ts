/**
 * Public Curated Quotes API
 *
 * GET /api/public/curated-quotes
 *   ?theme=culture|community|resilience|services|history|achievement|youth|elders|innovation|connection
 *   ?limit=6
 *   ?featured=true   (only suggested_for_report quotes)
 *   ?shuffle=true     (randomize order)
 *
 * Returns validated, curated quotes from across the platform:
 * - extracted_quotes (from interview analysis)
 * - elder_quotes (manually curated)
 *
 * All quotes are cleaned and ready for display.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const revalidate = 300 // Cache for 5 minutes

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

interface CuratedQuote {
  id: string
  text: string
  author: string | null
  role: string | null
  photo_url: string | null
  theme: string | null
  source: 'extracted' | 'elder' | 'story'
  is_elder: boolean
}

export async function GET(request: NextRequest) {
  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const theme = searchParams.get('theme')
  const limit = Math.min(parseInt(searchParams.get('limit') || '6', 10), 30)
  const featured = searchParams.get('featured') === 'true'
  const shuffle = searchParams.get('shuffle') === 'true'

  try {
    // Fetch from both quote sources in parallel
    const extractedQuery = supabase
      .from('extracted_quotes')
      .select(`
        id, quote_text, attribution, context, theme, sentiment, impact_area,
        suggested_for_report, photo_url,
        profiles:profile_id (full_name, preferred_name, profile_image_url, is_elder, community_role)
      `)
      .eq('is_validated', true)

    if (theme) extractedQuery.eq('theme', theme)
    if (featured) extractedQuery.eq('suggested_for_report', true)
    extractedQuery.limit(limit * 2) // Over-fetch for blending

    const elderQuery = supabase
      .from('elder_quotes')
      .select('id, text, speaker_name, speaker_role, theme, category')
      .eq('is_validated', true)
      .eq('permission_level', 'public')

    if (theme) elderQuery.eq('theme', theme)
    elderQuery.limit(limit * 2)

    // Also fetch quotes from published stories (definitely real content)
    const storyQuery = supabase
      .from('stories')
      .select(`
        id, quote_text, title,
        storyteller:storyteller_id (full_name, preferred_name, profile_image_url, is_elder, community_role)
      `)
      .eq('status', 'published')
      .eq('access_level', 'public')
      .not('quote_text', 'is', null)
      .limit(limit * 2)

    const [extractedResult, elderResult, storyResult] = await Promise.all([extractedQuery, elderQuery, storyQuery])

    const quotes: CuratedQuote[] = []

    // Map extracted quotes
    for (const q of extractedResult.data || []) {
      const text = String(q.quote_text || '').trim()
      if (!text || text.length < 30) continue

      const profile = q.profiles as any
      const authorName = profile?.preferred_name || profile?.full_name || q.attribution || null

      quotes.push({
        id: q.id,
        text,
        author: authorName,
        role: profile?.community_role || (profile?.is_elder ? 'Elder' : null),
        photo_url: profile?.profile_image_url || q.photo_url || null,
        theme: q.theme || null,
        source: 'extracted',
        is_elder: Boolean(profile?.is_elder),
      })
    }

    // Map elder quotes
    for (const q of elderResult.data || []) {
      const text = String(q.text || '').trim()
      if (!text || text.length < 30) continue

      quotes.push({
        id: q.id,
        text,
        author: q.speaker_name || null,
        role: q.speaker_role || 'Elder',
        photo_url: null,
        theme: q.theme || q.category || null,
        source: 'elder',
        is_elder: true,
      })
    }

    // Map story quotes (real published content)
    for (const q of storyResult.data || []) {
      const text = String(q.quote_text || '').trim()
      if (!text || text.length < 30) continue

      const storyteller = q.storyteller as any
      const authorName = storyteller?.preferred_name || storyteller?.full_name || null

      quotes.push({
        id: q.id,
        text,
        author: authorName,
        role: storyteller?.community_role || (storyteller?.is_elder ? 'Elder' : 'Community Member'),
        photo_url: storyteller?.profile_image_url || null,
        theme: null,
        source: 'story',
        is_elder: Boolean(storyteller?.is_elder),
      })
    }

    // Deduplicate by text similarity (first 60 chars lowercase)
    const seen = new Set<string>()
    const deduped = quotes.filter((q) => {
      const key = q.text.slice(0, 60).toLowerCase().replace(/\s+/g, ' ')
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    // Sort or shuffle
    let result: CuratedQuote[]
    if (shuffle) {
      result = deduped.sort(() => Math.random() - 0.5).slice(0, limit)
    } else {
      // Prefer: quotes with photos first, then elders, then story source, then medium length
      result = deduped
        .sort((a, b) => {
          // Photos first — quotes with faces look real
          if (a.photo_url && !b.photo_url) return -1
          if (!a.photo_url && b.photo_url) return 1
          // Story-sourced quotes are definitely real
          if (a.source === 'story' && b.source !== 'story') return -1
          if (a.source !== 'story' && b.source === 'story') return 1
          // Then elders
          if (a.is_elder !== b.is_elder) return a.is_elder ? -1 : 1
          // Prefer medium-length quotes (80-200 chars)
          const aScore = Math.abs(a.text.length - 140)
          const bScore = Math.abs(b.text.length - 140)
          return aScore - bScore
        })
        .slice(0, limit)
    }

    // Collect available themes for filtering
    const themes = Array.from(new Set(deduped.map((q) => q.theme).filter((t): t is string => Boolean(t))))

    return NextResponse.json({
      quotes: result,
      total: deduped.length,
      themes,
    })
  } catch (error: any) {
    console.error('Error fetching curated quotes:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch quotes' },
      { status: 500 }
    )
  }
}
