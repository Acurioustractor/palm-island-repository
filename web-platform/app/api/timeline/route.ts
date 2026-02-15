/**
 * Timeline API
 *
 * Aggregates events from multiple data sources into a unified chronological timeline.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

interface TimelineEvent {
  id: string
  type: 'story' | 'milestone' | 'service' | 'media' | 'quote'
  title: string
  description?: string
  date: string
  year: number
  url?: string
  imageUrl?: string
  metadata?: Record<string, unknown>
}

// PICC milestones (hardcoded key moments)
const PICC_MILESTONES: TimelineEvent[] = [
  {
    id: 'milestone-founding',
    type: 'milestone',
    title: 'Palm Island Community Company Founded',
    description: 'PICC established to serve the Palm Island community with locally-led programs and services.',
    date: '2010-01-01',
    year: 2010,
    url: '/about',
  },
  {
    id: 'milestone-10-years',
    type: 'milestone',
    title: 'PICC Celebrates 10 Years',
    description: 'A decade of community-led service delivery on Manbarra and Bwgcolman Country.',
    date: '2020-01-01',
    year: 2020,
    url: '/about',
  },
  {
    id: 'milestone-15-years',
    type: 'milestone',
    title: 'PICC Celebrates 15 Years',
    description: '15 years of impact: 100% Indigenous-led, community-controlled services.',
    date: '2025-01-01',
    year: 2025,
    url: '/road-to-20-years',
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fromYear = parseInt(searchParams.get('from') || '2010')
  const toYear = parseInt(searchParams.get('to') || '2026')
  const typesParam = searchParams.get('types')
  const types = typesParam ? typesParam.split(',') : ['story', 'milestone', 'service', 'media', 'quote']

  try {
    const supabase = getSupabase()
    const events: TimelineEvent[] = []

    // 1. Stories
    if (types.includes('story')) {
      const { data: stories } = await supabase
        .from('stories')
        .select('id, title, content, story_date, created_at, story_category')
        .eq('is_public', true)
        .order('story_date', { ascending: false, nullsFirst: false })
        .limit(200)

      if (stories) {
        for (const s of stories) {
          const date = s.story_date || s.created_at
          if (!date) continue
          const year = new Date(date).getFullYear()
          if (year < fromYear || year > toYear) continue

          events.push({
            id: s.id,
            type: 'story',
            title: s.title,
            description: s.content?.substring(0, 150) + '...',
            date,
            year,
            url: `/stories/${s.id}`,
            metadata: { category: s.story_category },
          })
        }
      }
    }

    // 2. Milestones
    if (types.includes('milestone')) {
      for (const m of PICC_MILESTONES) {
        if (m.year >= fromYear && m.year <= toYear) {
          events.push(m)
        }
      }
    }

    // 3. Elder quotes
    if (types.includes('quote')) {
      const { data: quotes } = await supabase
        .from('elder_quotes')
        .select('id, quote_text, speaker_name, theme, created_at')
        .limit(100)

      if (quotes) {
        for (const q of quotes) {
          const date = q.created_at
          if (!date) continue
          const year = new Date(date).getFullYear()
          if (year < fromYear || year > toYear) continue

          events.push({
            id: q.id,
            type: 'quote',
            title: `"${q.quote_text.substring(0, 60)}..."`,
            description: `— ${q.speaker_name}`,
            date,
            year,
            url: '/voices',
            metadata: { speaker: q.speaker_name, theme: q.theme },
          })
        }
      }
    }

    // 4. Media (photos with dates)
    if (types.includes('media')) {
      const { data: media } = await supabase
        .from('media_files')
        .select('id, title, file_name, public_url, created_at, tags')
        .eq('is_public', true)
        .eq('media_type', 'image')
        .order('created_at', { ascending: false })
        .limit(100)

      if (media) {
        for (const m of media) {
          const date = m.created_at
          if (!date) continue
          const year = new Date(date).getFullYear()
          if (year < fromYear || year > toYear) continue

          events.push({
            id: m.id,
            type: 'media',
            title: m.title || m.file_name,
            date,
            year,
            imageUrl: m.public_url,
            metadata: { tags: m.tags },
          })
        }
      }
    }

    // Sort by date descending
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Group by year
    const byYear: Record<number, TimelineEvent[]> = {}
    for (const event of events) {
      if (!byYear[event.year]) byYear[event.year] = []
      byYear[event.year].push(event)
    }

    return NextResponse.json({
      events,
      byYear,
      totalCount: events.length,
      yearRange: { from: fromYear, to: toYear },
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    console.error('Timeline API error:', error)
    return NextResponse.json(
      { error: 'Failed to load timeline' },
      { status: 500 }
    )
  }
}
