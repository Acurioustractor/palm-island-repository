import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'

/**
 * GET /api/elders/youth-engagement
 * Fetch approved, public youth engagements.
 * Optional query params: elder_id, story_id
 */
export async function GET(req: NextRequest) {
  const supabase = createServerSupabase()
  const { searchParams } = new URL(req.url)
  const elderId = searchParams.get('elder_id')
  const storyId = searchParams.get('story_id')

  let query = supabase
    .from('youth_engagement')
    .select('id, engagement_type, content, author_name, author_age_group, elder_responded, elder_response, created_at')
    .eq('status', 'approved')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(50)

  if (elderId) {
    query = query.eq('elder_id', elderId)
  }
  if (storyId) {
    query = query.eq('story_id', storyId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ engagements: data ?? [] })
}

/**
 * POST /api/elders/youth-engagement
 * Create a new youth engagement (status: pending, is_public: false).
 */
export async function POST(req: NextRequest) {
  const supabase = createServerSupabase()

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { engagement_type, content, author_name, author_age_group, elder_id, story_id, quote_id } = body as {
    engagement_type?: string
    content?: string
    author_name?: string | null
    author_age_group?: string | null
    elder_id?: string | null
    story_id?: string | null
    quote_id?: string | null
  }

  // Validate required fields
  if (!engagement_type || !content) {
    return NextResponse.json(
      { error: 'engagement_type and content are required' },
      { status: 400 }
    )
  }

  const validTypes = ['question', 'response', 'reflection', 'connection_request']
  if (!validTypes.includes(engagement_type)) {
    return NextResponse.json(
      { error: `engagement_type must be one of: ${validTypes.join(', ')}` },
      { status: 400 }
    )
  }

  const validAgeGroups = ['under-12', '12-17', '18-25', '26-35']
  if (author_age_group && !validAgeGroups.includes(author_age_group)) {
    return NextResponse.json(
      { error: `author_age_group must be one of: ${validAgeGroups.join(', ')}` },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('youth_engagement')
    .insert({
      engagement_type,
      content: (content as string).trim(),
      author_name: author_name || null,
      author_age_group: author_age_group || null,
      elder_id: elder_id || null,
      story_id: story_id || null,
      quote_id: quote_id || null,
      status: 'pending',
      is_public: false,
    })
    .select('id, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ engagement: data }, { status: 201 })
}
