import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'

/**
 * POST /api/ghl/webhook/report-engagement
 * Receive open/click events from GHL for report distribution tracking
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const body = await request.json()
    const { distributionId, event_type } = body

    if (!distributionId || !event_type) {
      return NextResponse.json(
        { error: 'distributionId and event_type required' },
        { status: 400 }
      )
    }

    // Get current counts
    const { data: dist, error: fetchErr } = await supabase
      .from('report_distributions')
      .select('opened_count, clicked_count')
      .eq('id', distributionId)
      .single()

    if (fetchErr || !dist) {
      return NextResponse.json({ error: 'Distribution not found' }, { status: 404 })
    }

    const updates: Record<string, unknown> = {}
    if (event_type === 'open') {
      updates.opened_count = (dist.opened_count || 0) + 1
      updates.status = 'delivered'
    } else if (event_type === 'click') {
      updates.clicked_count = (dist.clicked_count || 0) + 1
    }

    await supabase
      .from('report_distributions')
      .update(updates)
      .eq('id', distributionId)

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Report engagement webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
