import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'
import { canSendMessage, getOptOutFooter } from '@/lib/messaging/cultural-safety'
import { getGHLClient } from '@/lib/ghl/client'

/**
 * POST /api/messaging/respond-to-feedback
 *
 * Close the feedback loop: "You told us X, so we did Y."
 * This is the critical trust-building mechanism.
 *
 * Body:
 * - feedbackId: string (required) — UUID of community_feedback record
 * - response: string (required) — the response message
 * - respondedBy: string — staff member name
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { feedbackId, response, respondedBy } = body

    if (!feedbackId || !response) {
      return NextResponse.json(
        { error: 'feedbackId and response are required' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabase()

    // Get the feedback record
    const { data: feedback, error: fetchError } = await supabase
      .from('community_feedback')
      .select('id, ghl_contact_id, feedback_text, status')
      .eq('id', feedbackId)
      .single()

    if (fetchError || !feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
    }

    if (feedback.status === 'resolved') {
      return NextResponse.json({ error: 'Feedback already resolved' }, { status: 400 })
    }

    // Check if we can send to this contact
    const canSend = await canSendMessage(feedback.ghl_contact_id)
    if (!canSend.allowed) {
      // Still update the record, just don't send the message
      await supabase
        .from('community_feedback')
        .update({
          response_sent: response,
          responded_at: new Date().toISOString(),
          responded_by: respondedBy || null,
          status: 'responded',
          updated_at: new Date().toISOString(),
        })
        .eq('id', feedbackId)

      return NextResponse.json({
        success: true,
        messageSent: false,
        reason: canSend.reason,
      })
    }

    // Send response via GHL
    const ghl = getGHLClient()
    let messageSent = false

    if (ghl.isConfigured()) {
      // Find the most recent conversation with this contact
      const { data: recentMessage } = await supabase
        .from('community_messages')
        .select('ghl_conversation_id')
        .eq('ghl_contact_id', feedback.ghl_contact_id)
        .not('ghl_conversation_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (recentMessage?.ghl_conversation_id) {
        const fullMessage = response + getOptOutFooter()
        const sendResult = await ghl.sendMessage(
          recentMessage.ghl_conversation_id,
          fullMessage,
          'sms'
        )
        messageSent = sendResult.success

        if (messageSent) {
          // Log outbound message
          await supabase.from('community_messages').insert({
            ghl_contact_id: feedback.ghl_contact_id,
            ghl_conversation_id: recentMessage.ghl_conversation_id,
            direction: 'outbound',
            message_type: 'sms',
            body: fullMessage,
            intent_classified: 'feedback',
            routed_to: 'feedback_response',
            feedback_id: feedbackId,
          })
        }
      }
    }

    // Update feedback record
    await supabase
      .from('community_feedback')
      .update({
        response_sent: response,
        responded_at: new Date().toISOString(),
        responded_by: respondedBy || null,
        status: 'responded',
        updated_at: new Date().toISOString(),
      })
      .eq('id', feedbackId)

    return NextResponse.json({
      success: true,
      messageSent,
      feedbackId,
    })
  } catch (err) {
    console.error('[respond-to-feedback] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
