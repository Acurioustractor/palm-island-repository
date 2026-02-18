/**
 * Curated Voices API
 *
 * GET /api/annual-report-data/curated-voices?year=2024-25
 *
 * Returns a curated mix of community voices for the annual report:
 * - Top report-worthy stories (highest quality_score)
 * - Validated elder quotes (public permission)
 * - Approved community visions
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function GET(request: NextRequest) {
  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    const [storiesResult, elderQuotesResult, visionsResult] = await Promise.all([
      // Top report-worthy stories
      supabase
        .from('stories')
        .select('id, title, quote_text, quote_attribution, featured_image_url, category, excerpt')
        .eq('status', 'published')
        .eq('report_worthy', true)
        .order('quality_score', { ascending: false })
        .limit(3),

      // Validated elder quotes
      supabase
        .from('elder_quotes')
        .select('id, text, speaker_name, speaker_role')
        .eq('is_validated', true)
        .eq('permission_level', 'public')
        .limit(3),

      // Approved community visions
      supabase
        .from('community_visions')
        .select('id, vision_text, author_name, author_role, category')
        .eq('is_approved', true)
        .limit(3),
    ])

    const voices = {
      stories: (storiesResult.data || []).map((s: any) => ({
        id: s.id,
        type: 'story',
        text: s.quote_text || s.excerpt || s.title,
        author: s.quote_attribution || null,
        role: null,
        photo_url: s.featured_image_url || null,
        category: s.category,
      })),
      elder_quotes: (elderQuotesResult.data || []).map((q: any) => ({
        id: q.id,
        type: 'elder_quote',
        text: q.text,
        author: q.speaker_name,
        role: q.speaker_role || 'Elder',
        photo_url: null,
      })),
      community_visions: (visionsResult.data || []).map((v: any) => ({
        id: v.id,
        type: 'community_vision',
        text: v.vision_text,
        author: v.author_name,
        role: v.author_role || 'Community Member',
        category: v.category,
      })),
    }

    return NextResponse.json(voices)
  } catch (error: any) {
    console.error('Error fetching curated voices:', error)
    return NextResponse.json({ error: error?.message || 'Failed to fetch voices' }, { status: 500 })
  }
}
