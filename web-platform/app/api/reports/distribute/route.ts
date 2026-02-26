import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'
import { getGHLClient } from '@/lib/ghl/client'

/**
 * POST /api/reports/distribute
 * Trigger report distribution via GHL campaign
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const body = await request.json()
    const { fiscal_year, audience, report_url, workflowId } = body

    if (!fiscal_year || !audience) {
      return NextResponse.json(
        { error: 'fiscal_year and audience are required' },
        { status: 400 }
      )
    }

    const ghl = getGHLClient()

    // Create distribution record regardless of GHL status
    const { data: distribution, error: dbErr } = await supabase
      .from('report_distributions')
      .insert({
        fiscal_year,
        audience,
        report_url: report_url || null,
        status: ghl.isConfigured() ? 'pending' : 'pending',
        metadata: { workflowId },
      })
      .select()
      .single()

    if (dbErr) {
      return NextResponse.json({ error: dbErr.message }, { status: 500 })
    }

    if (!ghl.isConfigured()) {
      return NextResponse.json({
        distribution,
        ghl_status: 'GHL not configured. Distribution recorded but not sent.',
      })
    }

    // If GHL is configured and workflow provided, trigger it
    if (workflowId) {
      // Search for contacts with audience tag
      const searchRes = await ghl.searchContacts(audience)
      const contacts = searchRes.data?.contacts || []

      let sent = 0
      for (const contact of contacts) {
        if (contact.id) {
          const res = await ghl.triggerWorkflow(workflowId, contact.id)
          if (res.success) sent++
        }
      }

      await supabase
        .from('report_distributions')
        .update({
          status: 'sent',
          recipients_count: sent,
          sent_at: new Date().toISOString(),
        })
        .eq('id', distribution.id)

      // Notification
      await supabase.from('notifications').insert({
        type: 'success',
        title: 'Report Distributed',
        message: `${fiscal_year} ${audience} report sent to ${sent} recipients`,
        action_url: `/picc/reports/composer`,
      })

      return NextResponse.json({
        distribution: { ...distribution, status: 'sent', recipients_count: sent },
        ghl_status: 'sent',
      })
    }

    return NextResponse.json({ distribution })
  } catch (err) {
    console.error('Distribute error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
