import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function getServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) throw new Error('Missing Supabase credentials')
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServerClient()
    const { searchParams } = new URL(request.url)
    const noteType = searchParams.get('type')

    let query = supabase
      .from('service_notes')
      .select('*')
      .eq('service_id', params.id)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100)

    if (noteType) {
      query = query.eq('note_type', noteType)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ notes: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServerClient()
    const body = await request.json()

    if (!body.content?.trim()) {
      return NextResponse.json({ error: 'content required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('service_notes')
      .insert({
        service_id: params.id,
        note_type: body.note_type || 'update',
        content: body.content.trim(),
        author_name: body.author_name || null,
        linked_story_id: body.linked_story_id || null,
        linked_grant_id: body.linked_grant_id || null,
        tags: body.tags || null,
        pinned: body.pinned || false,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ note: data })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServerClient()
    const body = await request.json()
    const noteId = body.note_id

    if (!noteId) return NextResponse.json({ error: 'note_id required' }, { status: 400 })

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.pinned !== undefined) update.pinned = body.pinned
    if (body.content !== undefined) update.content = body.content
    if (body.note_type !== undefined) update.note_type = body.note_type

    const { data, error } = await supabase
      .from('service_notes')
      .update(update)
      .eq('id', noteId)
      .eq('service_id', params.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ note: data })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServerClient()
    const { searchParams } = new URL(request.url)
    const noteId = searchParams.get('noteId')

    if (!noteId) return NextResponse.json({ error: 'noteId required' }, { status: 400 })

    const { error } = await supabase
      .from('service_notes')
      .delete()
      .eq('id', noteId)
      .eq('service_id', params.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}
