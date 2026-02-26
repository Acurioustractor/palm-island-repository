import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'
import { getGHLClient } from '@/lib/ghl/client'

/**
 * POST /api/capture/prompts/[id]/send
 * Send a capture prompt to contacts via GHL
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServerSupabase()
    const body = await request.json()
    const { workflowId, contactIds } = body

    // Get the prompt
    const { data: prompt, error: promptErr } = await supabase
      .from('capture_prompts')
      .select('*')
      .eq('id', id)
      .single()

    if (promptErr || !prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }

    const ghl = getGHLClient()
    if (!ghl.isConfigured()) {
      return NextResponse.json({
        success: false,
        reason: 'GHL not configured. Cannot send prompts without GHL integration.',
      })
    }

    if (!workflowId) {
      return NextResponse.json(
        { error: 'workflowId is required to send via GHL' },
        { status: 400 }
      )
    }

    let sent = 0
    let failed = 0

    for (const contactId of contactIds || []) {
      const res = await ghl.triggerWorkflow(workflowId, contactId)
      if (res.success) sent++
      else failed++
    }

    // Update prompt
    await supabase
      .from('capture_prompts')
      .update({ last_sent_at: new Date().toISOString() })
      .eq('id', id)

    // Notification
    await supabase.from('notifications').insert({
      type: 'info',
      title: 'Capture Prompt Sent',
      message: `"${prompt.title}" sent to ${sent} contacts (${failed} failed)`,
      metadata: { prompt_id: id, sent, failed },
    })

    return NextResponse.json({ success: true, sent, failed })
  } catch (err) {
    console.error('Send prompt error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
