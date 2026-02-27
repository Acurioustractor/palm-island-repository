import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'
import { classifyMessage } from '@/lib/messaging/classify-message'
import { canSendMessage, requiresHumanReview, isOptOutMessage } from '@/lib/messaging/cultural-safety'
import { getGHLClient } from '@/lib/ghl/client'
import type { GHLInboundMessage } from '@/lib/ghl/types'

export const maxDuration = 30

/**
 * POST /api/ghl/webhook/inbound-message
 *
 * Receives GHL InboundMessage webhooks from WhatsApp/SMS.
 * Classifies intent and routes to the appropriate handler:
 * - story → /api/capture/inbound
 * - question → /api/ghl/webhook/conversation (Phase 2)
 * - feedback → community_feedback table
 * - need → community_needs table
 * - vision → community_visions table
 * - greeting → simple acknowledgement
 */
export async function POST(request: NextRequest) {
  try {
    const event = (await request.json()) as GHLInboundMessage
    const supabase = createServerSupabase()

    const {
      contactId,
      conversationId,
      body,
      messageType,
      attachments,
    } = event

    if (!contactId || !body) {
      return NextResponse.json({ error: 'Missing contactId or body' }, { status: 400 })
    }

    const msgType = (messageType || 'SMS').toLowerCase() as 'sms' | 'whatsapp' | 'email'

    // Handle opt-out immediately
    if (isOptOutMessage(body)) {
      await supabase
        .from('profiles')
        .update({ messaging_opt_out: true })
        .eq('ghl_contact_id', contactId)

      await logMessage(supabase, {
        ghl_contact_id: contactId,
        ghl_conversation_id: conversationId,
        direction: 'inbound',
        message_type: msgType,
        body,
        intent_classified: 'greeting',
        routed_to: 'opt_out',
      })

      return NextResponse.json({ received: true, action: 'opt_out' })
    }

    // Classify intent
    const classification = await classifyMessage(body)

    // Log the inbound message
    const messageRecord = await logMessage(supabase, {
      ghl_contact_id: contactId,
      ghl_conversation_id: conversationId,
      direction: 'inbound',
      message_type: msgType,
      body,
      intent_classified: classification.intent,
      intent_confidence: classification.confidence,
      attachments: attachments || [],
      metadata: { category: classification.category },
    })

    // Check cultural safety — requires human review?
    const review = await requiresHumanReview(contactId, body)
    if (review.requiresReview) {
      await supabase.from('notifications').insert({
        type: 'urgent',
        title: 'Message Requires Human Review',
        message: `${review.reason}: "${body.slice(0, 100)}"`,
        action_url: '/picc/messaging',
        metadata: {
          ghl_contact_id: contactId,
          message_id: messageRecord?.id,
          review_reason: review.reason,
        },
      })

      return NextResponse.json({
        received: true,
        action: 'human_review',
        reason: review.reason,
      })
    }

    // Route by intent
    let routedTo: string = classification.intent
    let responseMessage: string | null = null

    switch (classification.intent) {
      case 'story': {
        // Route to capture pipeline
        const captureResponse = await fetch(
          new URL('/api/capture/inbound', request.url),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              source: msgType === 'whatsapp' ? 'ghl_sms' : 'ghl_sms',
              raw_content: body,
              storyteller_contact: contactId,
              metadata: {
                ghl_conversation_id: conversationId,
                message_type: msgType,
                community_message_id: messageRecord?.id,
              },
            }),
          }
        )
        const captureData = await captureResponse.json()

        if (captureData.capture?.id && messageRecord) {
          await supabase
            .from('community_messages')
            .update({ capture_id: captureData.capture.id, routed_to: 'capture' })
            .eq('id', messageRecord.id)
        }

        responseMessage = 'Thanks for sharing your story! It helps show the community\'s journey. A staff member will review it soon.'
        routedTo = 'capture'
        break
      }

      case 'question': {
        // Route to conversation handler (Phase 2)
        // For now, queue for the conversation endpoint
        routedTo = 'conversation'

        // Fire-and-forget to conversation handler
        fetch(new URL('/api/ghl/webhook/conversation', request.url), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactId,
            conversationId,
            body,
            messageType: msgType,
            messageId: messageRecord?.id,
          }),
        }).catch(err => console.error('[inbound-message] Conversation handler error:', err))

        // Don't send acknowledgement — conversation handler will respond
        break
      }

      case 'feedback': {
        const { data: feedback } = await supabase
          .from('community_feedback')
          .insert({
            ghl_contact_id: contactId,
            feedback_text: body,
            category: classification.category,
            sentiment: detectSentiment(body),
            status: 'received',
          })
          .select('id')
          .single()

        if (feedback && messageRecord) {
          await supabase
            .from('community_messages')
            .update({ feedback_id: feedback.id, routed_to: 'feedback' })
            .eq('id', messageRecord.id)
        }

        // Notify staff
        await supabase.from('notifications').insert({
          type: 'info',
          title: 'New Community Feedback',
          message: `${classification.category}: "${body.slice(0, 100)}"`,
          action_url: '/picc/messaging/feedback',
          metadata: { feedback_id: feedback?.id, ghl_contact_id: contactId },
        })

        responseMessage = 'Thanks for your feedback — it\'s been passed to the team. We\'ll get back to you.'
        routedTo = 'feedback'
        break
      }

      case 'need': {
        const urgency = detectUrgency(body)
        const { data: need } = await supabase
          .from('community_needs')
          .insert({
            ghl_contact_id: contactId,
            need_text: body,
            need_category: classification.category,
            urgency,
            status: 'logged',
          })
          .select('id')
          .single()

        if (need && messageRecord) {
          await supabase
            .from('community_messages')
            .update({ need_id: need.id, routed_to: 'needs' })
            .eq('id', messageRecord.id)
        }

        // Urgent needs get priority notification
        await supabase.from('notifications').insert({
          type: urgency === 'urgent' ? 'urgent' : 'info',
          title: urgency === 'urgent' ? 'Urgent Community Need' : 'New Community Need',
          message: `${classification.category}: "${body.slice(0, 100)}"`,
          action_url: '/picc/messaging/needs',
          metadata: { need_id: need?.id, urgency, ghl_contact_id: contactId },
        })

        responseMessage = urgency === 'urgent'
          ? 'We\'ve received your message and flagged it as urgent. Someone will be in touch soon. If it\'s an emergency, call 000.'
          : 'Thanks for letting us know. We\'ve logged your request and the team will follow up.'
        routedTo = 'needs'
        break
      }

      case 'vision': {
        await supabase.from('community_visions').insert({
          vision_text: body,
          category: 'other',
          is_anonymous: false,
          source: msgType === 'whatsapp' ? 'whatsapp' : 'sms',
        })

        responseMessage = 'Thanks for sharing your vision for the community\'s future! It\'s been recorded and will help shape the way forward.'
        routedTo = 'visions'
        break
      }

      case 'greeting': {
        responseMessage = 'G\'day! This is Palm Island Community Company. You can ask us about our services, share a story, or give feedback. How can we help?'
        routedTo = 'greeting'
        break
      }

      default: {
        responseMessage = 'Thanks for your message. We\'ve received it and someone will get back to you if needed. You can ask about our services, share a story, or give us feedback anytime.'
        routedTo = 'unknown'
      }
    }

    // Send acknowledgement via GHL (if we have a response and it's not a question)
    if (responseMessage && conversationId) {
      const canSend = await canSendMessage(contactId)
      if (canSend.allowed) {
        const ghl = getGHLClient()
        if (ghl.isConfigured()) {
          await ghl.sendMessage(conversationId, responseMessage, msgType)

          // Log outbound message
          await logMessage(supabase, {
            ghl_contact_id: contactId,
            ghl_conversation_id: conversationId,
            direction: 'outbound',
            message_type: msgType,
            body: responseMessage,
            intent_classified: classification.intent,
            routed_to: routedTo,
          })
        }
      }
    }

    // Update routed_to on original message
    if (messageRecord) {
      await supabase
        .from('community_messages')
        .update({ routed_to: routedTo })
        .eq('id', messageRecord.id)
    }

    return NextResponse.json({
      received: true,
      intent: classification.intent,
      confidence: classification.confidence,
      routedTo,
    })
  } catch (err) {
    console.error('[inbound-message] Webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

async function logMessage(
  supabase: ReturnType<typeof createServerSupabase>,
  data: Record<string, unknown>
) {
  const { data: record, error } = await supabase
    .from('community_messages')
    .insert(data)
    .select('id')
    .single()

  if (error) {
    console.error('[inbound-message] Failed to log message:', error.message)
  }
  return record
}

/** Simple sentiment detection via keywords */
function detectSentiment(text: string): 'positive' | 'negative' | 'neutral' | 'mixed' {
  const lower = text.toLowerCase()
  const positive = /\b(good|great|love|thank|happy|excellent|wonderful|amazing|helpful|fantastic)\b/
  const negative = /\b(bad|terrible|awful|hate|angry|frustrated|disappointed|poor|worst|slow|long wait)\b/

  const hasPositive = positive.test(lower)
  const hasNegative = negative.test(lower)

  if (hasPositive && hasNegative) return 'mixed'
  if (hasPositive) return 'positive'
  if (hasNegative) return 'negative'
  return 'neutral'
}

/** Detect urgency from message content */
function detectUrgency(text: string): 'low' | 'normal' | 'high' | 'urgent' {
  const lower = text.toLowerCase()
  if (/\b(emergency|urgent|asap|right now|immediately|danger|unsafe|crisis)\b/.test(lower)) return 'urgent'
  if (/\b(soon|quickly|important|need help|struggling)\b/.test(lower)) return 'high'
  return 'normal'
}
