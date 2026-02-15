import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

/**
 * GET /api/unified/storyteller/[id]
 *
 * Returns everything about a storyteller in one call:
 * profile, stories, interviews (with segments), quotes, media
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getSupabase()

    // 1. Get the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Storyteller not found' }, { status: 404 })
    }

    // 2. Parallel fetch related data
    const [storiesResult, interviewsResult, elderQuotesResult] = await Promise.all([
      // Their stories
      supabase
        .from('stories')
        .select('id, title, summary, content, category, fiscal_year, featured_image_url, status, created_at')
        .eq('storyteller_id', id)
        .order('created_at', { ascending: false })
        .limit(20),

      // Their interviews (with segments)
      supabase
        .from('interviews')
        .select('id, interview_title, interview_date, duration_minutes, key_themes, summary')
        .eq('storyteller_id', id)
        .order('interview_date', { ascending: false })
        .limit(10),

      // Elder quotes matching their name
      profile.full_name ? supabase
        .from('elder_quotes')
        .select('id, quote_text, context, theme')
        .ilike('speaker_name', `%${profile.full_name}%`)
        .limit(10)
        : Promise.resolve({ data: [] })
    ])

    // 3. Get interview segments for matched interviews
    const interviewIds = (interviewsResult.data || []).map((i: any) => i.id)
    let segments: any[] = []
    if (interviewIds.length > 0) {
      const { data: segmentData } = await supabase
        .from('interview_segments')
        .select('id, interview_id, segment_text, speaker, timestamp_start, timestamp_end')
        .in('interview_id', interviewIds)
        .order('timestamp_start', { ascending: true })
        .limit(50)
      segments = segmentData || []
    }

    // Attach segments to interviews
    const interviews = (interviewsResult.data || []).map((interview: any) => ({
      ...interview,
      segments: segments.filter((s: any) => s.interview_id === interview.id)
    }))

    // 4. Get extracted quotes from their stories
    const storyIds = (storiesResult.data || []).map((s: any) => s.id)
    let storyQuotes: any[] = []
    if (storyIds.length > 0) {
      const { data: quotes } = await supabase
        .from('extracted_quotes')
        .select('id, quote_text, speaker_name, theme, sentiment, story_id')
        .in('story_id', storyIds)
        .limit(20)
      storyQuotes = quotes || []
    }

    // 5. Get media from their stories
    let media: any[] = []
    if (storyIds.length > 0) {
      const { data: storyMedia } = await supabase
        .from('story_media')
        .select('media_files(id, title, public_url, file_type, caption)')
        .in('story_id', storyIds)
        .limit(20)
      media = (storyMedia || []).map((sm: any) => sm.media_files).filter(Boolean)
    }

    return NextResponse.json({
      profile,
      stories: storiesResult.data || [],
      interviews,
      quotes: {
        elder: elderQuotesResult.data || [],
        extracted: storyQuotes
      },
      media,
      counts: {
        stories: storiesResult.data?.length || 0,
        interviews: interviews.length,
        segments: segments.length,
        elderQuotes: elderQuotesResult.data?.length || 0,
        extractedQuotes: storyQuotes.length,
        media: media.length
      }
    })
  } catch (error: any) {
    console.error('Unified storyteller error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
