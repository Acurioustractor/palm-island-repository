import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const grantId = searchParams.get('grantId')

    let query = supabase
      .from('evidence_links')
      .select(`
        *,
        grant_outcomes!inner(
          id, outcome_name, status, grant_id,
          service_grants!inner(id, grant_name, funder_name)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (type) {
      query = query.eq('evidence_type', type)
    }
    if (grantId) {
      query = query.eq('grant_outcomes.grant_id', grantId)
    }

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ evidence: data })
  } catch (err) {
    console.error('Evidence search error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
