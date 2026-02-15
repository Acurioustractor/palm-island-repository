import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// GET: Fetch vote counts for a report's content
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('report_id')
    const contentType = searchParams.get('content_type')
    const userId = searchParams.get('user_id')

    if (!reportId) {
      return NextResponse.json({ error: 'report_id required' }, { status: 400 })
    }

    // Fetch aggregated vote counts
    let countsQuery = supabase
      .from('report_content_vote_counts')
      .select('*')
      .eq('report_id', reportId)

    if (contentType) {
      countsQuery = countsQuery.eq('content_type', contentType)
    }

    const { data: counts, error: countsError } = await countsQuery

    if (countsError) {
      // View might not exist yet, fall back to raw query
      const { data: rawVotes, error: rawError } = await supabase
        .from('report_content_votes')
        .select('content_type, content_id, vote_type')
        .eq('report_id', reportId)

      if (rawError) throw rawError

      // Aggregate manually
      const aggregated: Record<string, { total_votes: number; upvotes: number; loves: number; stars: number }> = {}
      for (const v of rawVotes || []) {
        const key = `${v.content_type}:${v.content_id}`
        if (!aggregated[key]) {
          aggregated[key] = { total_votes: 0, upvotes: 0, loves: 0, stars: 0 }
        }
        aggregated[key].total_votes++
        if (v.vote_type === 'upvote') aggregated[key].upvotes++
        if (v.vote_type === 'love') aggregated[key].loves++
        if (v.vote_type === 'star') aggregated[key].stars++
      }

      return NextResponse.json({ counts: aggregated })
    }

    // If user_id provided, also fetch which items this user voted on
    let userVotes: string[] = []
    if (userId) {
      const { data: uv } = await supabase
        .from('report_content_votes')
        .select('content_type, content_id, vote_type')
        .eq('report_id', reportId)
        .eq('user_id', userId)

      userVotes = (uv || []).map(v => `${v.content_type}:${v.content_id}:${v.vote_type}`)
    }

    return NextResponse.json({ counts: counts || [], user_votes: userVotes })
  } catch (error) {
    console.error('Votes GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST: Cast a vote
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { report_id, content_type, content_id, user_id, vote_type, comment } = body

    if (!report_id || !content_type || !content_id || !user_id) {
      return NextResponse.json(
        { error: 'report_id, content_type, content_id, and user_id required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('report_content_votes')
      .upsert(
        {
          report_id,
          content_type,
          content_id,
          user_id,
          vote_type: vote_type || 'upvote',
          comment: comment || null,
        },
        { onConflict: 'report_id,content_type,content_id,user_id' }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ vote: data })
  } catch (error) {
    console.error('Votes POST error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE: Remove a vote
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('report_id')
    const contentType = searchParams.get('content_type')
    const contentId = searchParams.get('content_id')
    const userId = searchParams.get('user_id')

    if (!reportId || !contentType || !contentId || !userId) {
      return NextResponse.json(
        { error: 'report_id, content_type, content_id, and user_id required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('report_content_votes')
      .delete()
      .eq('report_id', reportId)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .eq('user_id', userId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Votes DELETE error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
