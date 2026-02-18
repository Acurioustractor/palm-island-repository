import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// GET - List meeting notes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const group = searchParams.get('group') || null
    const limit = Math.min(Number(searchParams.get('limit') || 50), 200)
    const offset = Number(searchParams.get('offset') || 0)
    const q = searchParams.get('q')?.trim() || null

    const supabase = getSupabase()

    let query = supabase
      .from('meeting_notes')
      .select('id, title, meeting_date, location, group_name, summary, key_themes, action_items, attendees, recorded_by, is_public, related_project_slug, created_at', { count: 'exact' })
      .order('meeting_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (group) {
      query = query.eq('group_name', group)
    }

    if (q) {
      query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%,transcript.ilike.%${q}%`)
    }

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({ data: data || [], count: count || 0 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to list meetings' }, { status: 500 })
  }
}

// POST - Create a new meeting note
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title, meeting_date, location, group_name,
      transcript, summary, key_themes, action_items, attendees,
      recorded_by, is_public, is_sensitive, sensitivity_notes,
      related_project_slug, metadata,
    } = body

    if (!title || !meeting_date) {
      return NextResponse.json({ error: 'title and meeting_date are required' }, { status: 400 })
    }

    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('meeting_notes')
      .insert({
        title,
        meeting_date,
        location: location || 'Palm Island',
        group_name: group_name || 'Elders Group',
        transcript,
        summary,
        key_themes: key_themes || [],
        action_items: action_items || [],
        attendees: attendees || [],
        recorded_by,
        is_public: is_public ?? false,
        is_sensitive: is_sensitive ?? false,
        sensitivity_notes,
        related_project_slug,
        metadata: metadata || {},
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create meeting' }, { status: 500 })
  }
}
