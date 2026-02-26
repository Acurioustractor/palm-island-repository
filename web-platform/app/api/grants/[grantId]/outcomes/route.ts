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
      .from('grant_outcomes')
      .select('*, evidence_links(count)')
      .eq('grant_id', grantId)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ outcomes: data })
  } catch (err) {
    console.error('Grant outcomes GET error:', err)
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
      .from('grant_outcomes')
      .insert({
        grant_id: grantId,
        outcome_name: body.outcome_name,
        outcome_description: body.outcome_description || null,
        target_metric: body.target_metric || null,
        target_value: body.target_value || null,
        status: body.status || 'pending',
        due_date: body.due_date || null,
        notes: body.notes || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ outcome: data }, { status: 201 })
  } catch (err) {
    console.error('Grant outcomes POST error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
