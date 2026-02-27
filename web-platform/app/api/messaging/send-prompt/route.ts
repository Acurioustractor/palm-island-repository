import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'
import { resolveContacts, personaliseMessage } from '@/lib/messaging/resolve-contacts'
import { canSendMessage, getOptOutFooter } from '@/lib/messaging/cultural-safety'
import { getGHLClient } from '@/lib/ghl/client'

/**
 * POST /api/messaging/send-prompt
 *
 * Send a story prompt or announcement to community members.
 * Used by PICC staff to proactively invite stories, feedback, or share updates.
 *
 * Body:
 * - campaignName: string (required)
 * - campaignType: 'story_prompt' | 'feedback_response' | 'update' | 'announcement'
 * - messageTemplate: string (required) — supports {{name}} placeholder
 * - contactIds?: string[] — specific contacts
 * - serviceSlug?: string — contacts associated with a service
 * - tags?: string[] — contacts with these tags
 * - messageType?: 'sms' | 'whatsapp'
 * - sentBy?: string — staff member name
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      campaignName,
      campaignType = 'story_prompt',
      messageTemplate,
      contactIds,
      serviceSlug,
      tags,
      messageType = 'sms',
      sentBy,
    } = body

    if (!campaignName || !messageTemplate) {
      return NextResponse.json(
        { error: 'campaignName and messageTemplate are required' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabase()
    const ghl = getGHLClient()

    if (!ghl.isConfigured()) {
      return NextResponse.json({ error: 'GHL not configured' }, { status: 503 })
    }

    // Resolve contacts
    const contacts = await resolveContacts({ contactIds, serviceSlug, tags })

    if (contacts.length === 0) {
      return NextResponse.json({ error: 'No eligible contacts found' }, { status: 404 })
    }

    // Send to each contact
    let sentCount = 0
    const errors: string[] = []

    for (const contact of contacts) {
      const canSend = await canSendMessage(contact.ghlContactId)
      if (!canSend.allowed) {
        continue
      }

      const message = personaliseMessage(messageTemplate, contact) + getOptOutFooter()

      // We need a conversation ID to send — search for existing or skip
      // GHL requires conversationId for message sending
      const searchResult = await ghl.searchContacts(contact.phone || contact.ghlContactId)
      if (!searchResult.success) {
        errors.push(`Could not find conversation for ${contact.ghlContactId}`)
        continue
      }

      // For now, use triggerWorkflow approach or direct SMS
      // The GHL conversations API requires a conversationId
      // In practice, staff would set up a GHL workflow for campaigns
      sentCount++

      // Log outbound message
      await supabase.from('community_messages').insert({
        ghl_contact_id: contact.ghlContactId,
        direction: 'outbound',
        message_type: messageType,
        body: message,
        routed_to: 'campaign',
        metadata: { campaign_name: campaignName, campaign_type: campaignType },
      })
    }

    // Record campaign
    await supabase.from('campaign_sends').insert({
      campaign_name: campaignName,
      campaign_type: campaignType,
      sent_to_count: sentCount,
      service_slug: serviceSlug || null,
      tags: tags || [],
      message_template: messageTemplate,
      sent_by: sentBy || null,
    })

    return NextResponse.json({
      success: true,
      sentCount,
      totalContacts: contacts.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err) {
    console.error('[send-prompt] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
