import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ grantId: string; outcomeId: string }> }
) {
  try {
    const { grantId, outcomeId } = await params
    const supabase = createServerSupabase()
    const body = await request.json()

    const { data, error } = await supabase
      .from('grant_outcomes')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', outcomeId)
      .eq('grant_id', grantId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ outcome: data })
  } catch (err) {
    console.error('Outcome PATCH error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ grantId: string; outcomeId: string }> }
) {
  try {
    const { grantId, outcomeId } = await params
    const supabase = createServerSupabase()

    const { error } = await supabase
      .from('grant_outcomes')
      .delete()
      .eq('id', outcomeId)
      .eq('grant_id', grantId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Outcome DELETE error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
