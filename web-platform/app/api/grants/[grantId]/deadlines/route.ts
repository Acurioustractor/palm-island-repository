import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ grantId: string }> }
) {
  try {
    const { grantId } = await params
    const supabase = createServerSupabase()

    const { data, error } = await supabase
      .from('grant_deadlines')
      .select('*')
      .eq('grant_id', grantId)
      .order('due_date', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ deadlines: data })
  } catch (err) {
    console.error('Deadlines GET error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ grantId: string }> }
) {
  try {
    const { grantId } = await params
    const supabase = createServerSupabase()
    const body = await request.json()

    const { data, error } = await supabase
      .from('grant_deadlines')
      .insert({
        grant_id: grantId,
        deadline_type: body.deadline_type,
        due_date: body.due_date,
        title: body.title,
        description: body.description || null,
        status: body.status || 'upcoming',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ deadline: data }, { status: 201 })
  } catch (err) {
    console.error('Deadlines POST error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
