import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ grantId: string; outcomeId: string }> }
) {
  try {
    const { outcomeId } = await params
    void (await params).grantId // validate param exists
    const supabase = createServerSupabase()

    const { data, error } = await supabase
      .from('evidence_links')
      .select('*')
      .eq('outcome_id', outcomeId)
      .order('relevance_score', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ evidence: data })
  } catch (err) {
    console.error('Evidence GET error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ grantId: string; outcomeId: string }> }
) {
  try {
    const { outcomeId } = await params
    const supabase = createServerSupabase()
    const body = await request.json()

    const { data, error } = await supabase
      .from('evidence_links')
      .insert({
        outcome_id: outcomeId,
        evidence_type: body.evidence_type,
        evidence_id: body.evidence_id,
        evidence_title: body.evidence_title || null,
        evidence_url: body.evidence_url || null,
        relevance_score: body.relevance_score || 0.5,
        linked_by: body.linked_by || null,
        auto_linked: body.auto_linked || false,
        notes: body.notes || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ evidence: data }, { status: 201 })
  } catch (err) {
    console.error('Evidence POST error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
