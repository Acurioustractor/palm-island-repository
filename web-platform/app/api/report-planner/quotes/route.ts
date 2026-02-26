/**
 * Quote browser for planner QuotePicker
 *
 * GET /api/report-planner/quotes?theme=elder&q=community&limit=20
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const theme = searchParams.get('theme')
  const query = searchParams.get('q')
  const limit = parseInt(searchParams.get('limit') || '20', 10)

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return NextResponse.json({ quotes: [] })
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  try {
    const results: Array<{
      id: string
      text: string
      author: string | null
      role: string | null
      photo_url: string | null
      source_table: string
      theme: string | null
    }> = []

    // Fetch from elder_quotes
    if (!theme || theme === 'elder') {
      let eq = supabase
        .from('elder_quotes')
        .select('id, text, speaker_name, speaker_role')
        .eq('is_validated', true)
        .eq('permission_level', 'public')
        .limit(limit)

      if (query) {
        eq = eq.ilike('text', `%${query}%`)
      }

      const { data } = await eq
      for (const q of data || []) {
        results.push({
          id: q.id,
          text: q.text,
          author: q.speaker_name,
          role: q.speaker_role || 'Elder',
          photo_url: null,
          source_table: 'elder_quotes',
          theme: 'elder',
        })
      }
    }

    // Fetch from stories (report-worthy)
    if (!theme || theme === 'story' || theme === 'youth' || theme === 'resilience') {
      let sq = supabase
        .from('stories')
        .select('id, quote_text, quote_attribution, featured_image_url, category')
        .eq('status', 'published')
        .eq('report_worthy', true)
        .not('quote_text', 'is', null)
        .limit(limit)

      if (query) {
        sq = sq.ilike('quote_text', `%${query}%`)
      }
      if (theme === 'youth') {
        sq = sq.eq('category', 'youth')
      } else if (theme === 'resilience') {
        sq = sq.eq('category', 'resilience')
      }

      const { data } = await sq
      for (const s of data || []) {
        results.push({
          id: s.id,
          text: s.quote_text!,
          author: s.quote_attribution,
          role: null,
          photo_url: s.featured_image_url,
          source_table: 'stories',
          theme: s.category || 'story',
        })
      }
    }

    // Fetch from community_visions
    if (!theme || theme === 'vision') {
      let vq = supabase
        .from('community_visions')
        .select('id, vision_text, author_name, author_role, category')
        .eq('is_approved', true)
        .limit(limit)

      if (query) {
        vq = vq.ilike('vision_text', `%${query}%`)
      }

      const { data } = await vq
      for (const v of data || []) {
        results.push({
          id: v.id,
          text: v.vision_text,
          author: v.author_name,
          role: v.author_role || 'Community Member',
          photo_url: null,
          source_table: 'community_visions',
          theme: 'vision',
        })
      }
    }

    return NextResponse.json({ quotes: results.slice(0, limit) })
  } catch (err) {
    console.error('Quotes query failed:', err)
    return NextResponse.json({ quotes: [] })
  }
}
