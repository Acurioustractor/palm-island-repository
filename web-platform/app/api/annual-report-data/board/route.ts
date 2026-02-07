import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET() {
  try {
    const supabase = getSupabase()

    const [boardRes, leadershipRes] = await Promise.all([
      supabase
        .from('board_members')
        .select('*')
        .order('display_order'),
      supabase
        .from('leadership')
        .select('*')
        .order('position_order'),
    ])

    if (boardRes.error) throw boardRes.error
    if (leadershipRes.error) throw leadershipRes.error

    // Map full_name -> name for leadership so the UI component works consistently
    const leadership = (leadershipRes.data || []).map((l: any) => ({
      ...l,
      name: l.full_name || l.name,
    }))

    return NextResponse.json({
      board_members: boardRes.data || [],
      leadership,
    })
  } catch (error: any) {
    console.error('Board GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { table, ...fields } = body

    if (table !== 'board_members' && table !== 'leadership') {
      return NextResponse.json({ error: 'table must be board_members or leadership' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from(table)
      .insert(fields)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ record: data })
  } catch (error: any) {
    console.error('Board POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { table, id, ...fields } = body

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 })
    }
    if (table !== 'board_members' && table !== 'leadership') {
      return NextResponse.json({ error: 'table must be board_members or leadership' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from(table)
      .update(fields)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ record: data })
  } catch (error: any) {
    console.error('Board PUT error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const table = searchParams.get('table')

    if (!id || !table) {
      return NextResponse.json({ error: 'id and table required' }, { status: 400 })
    }
    if (table !== 'board_members' && table !== 'leadership') {
      return NextResponse.json({ error: 'table must be board_members or leadership' }, { status: 400 })
    }

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Board DELETE error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
