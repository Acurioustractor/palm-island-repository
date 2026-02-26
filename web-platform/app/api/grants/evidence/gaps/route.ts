import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'

export async function GET() {
  try {
    const supabase = createServerSupabase()

    // Find outcomes with zero evidence links
    const { data: outcomes, error } = await supabase
      .from('grant_outcomes')
      .select(`
        id, outcome_name, outcome_description, status, due_date,
        grant_id,
        service_grants!inner(id, grant_name, funder_name),
        evidence_links(count)
      `)
      .in('status', ['pending', 'partial'])
      .order('due_date', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Filter to only outcomes with 0 evidence
    const gaps = (outcomes || []).filter((o: Record<string, unknown>) => {
      const links = o.evidence_links as { count: number }[] | undefined
      return !links || links.length === 0 || (links[0] && links[0].count === 0)
    })

    return NextResponse.json({ gaps, total: gaps.length })
  } catch (err) {
    console.error('Evidence gaps error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
