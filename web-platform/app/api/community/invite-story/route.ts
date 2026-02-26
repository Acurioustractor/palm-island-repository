import { NextRequest, NextResponse } from 'next/server'
import { getGHLClient } from '@/lib/ghl/client'
import { createServerSupabase } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contactId, promptId, workflowId } = body

    if (!contactId) {
      return NextResponse.json({ error: 'contactId is required' }, { status: 400 })
    }

    const ghl = getGHLClient()
    if (!ghl.isConfigured()) {
      return NextResponse.json({
        success: false,
        reason: 'GHL not configured. Story invitations require GHL integration.',
      })
    }

    // Tag the contact
    await ghl.addContactTag(contactId, ['story-invited'])

    // Trigger workflow if provided
    let workflowResult = null
    if (workflowId) {
      workflowResult = await ghl.triggerWorkflow(workflowId, contactId)
    }

    // Log notification
    const supabase = createServerSupabase()
    await supabase.from('notifications').insert({
      type: 'story',
      title: 'Story Invitation Sent',
      message: `Story invitation sent to contact ${contactId}`,
      metadata: { contactId, promptId, workflowId },
    })

    // Update prompt responses count if provided
    if (promptId) {
      const { data: prompt } = await supabase
        .from('capture_prompts')
        .select('responses_count')
        .eq('id', promptId)
        .single()
      if (prompt) {
        await supabase
          .from('capture_prompts')
          .update({
            responses_count: (prompt.responses_count || 0) + 1,
            last_sent_at: new Date().toISOString(),
          })
          .eq('id', promptId)
      }
    }

    return NextResponse.json({
      success: true,
      workflow: workflowResult,
    })
  } catch (err) {
    console.error('Invite story error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
