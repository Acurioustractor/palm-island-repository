import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'

/**
 * POST /api/capture/inbound
 * Receive raw story content from webhooks, SMS, forms.
 * No auth required — this is an inbound webhook endpoint.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const body = await request.json()

    const {
      source,
      raw_content,
      storyteller_name,
      storyteller_contact,
      service_id,
      prompt_id,
      metadata,
    } = body

    if (!source || !raw_content) {
      return NextResponse.json(
        { error: 'source and raw_content are required' },
        { status: 400 }
      )
    }

    const validSources = ['ghl_sms', 'ghl_email', 'web_form', 'voice_note', 'staff_input']
    if (!validSources.includes(source)) {
      return NextResponse.json(
        { error: `Invalid source. Must be one of: ${validSources.join(', ')}` },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('story_captures')
      .insert({
        source,
        raw_content,
        storyteller_name: storyteller_name || null,
        storyteller_contact: storyteller_contact || null,
        service_id: service_id || null,
        prompt_id: prompt_id || null,
        status: 'pending',
        metadata: metadata || {},
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create notification for new capture
    await supabase.from('notifications').insert({
      type: 'capture',
      title: 'New Story Capture',
      message: `New ${source} story from ${storyteller_name || 'anonymous'}`,
      action_url: `/picc/capture`,
      metadata: { capture_id: data.id, source },
    })

    return NextResponse.json({ capture: data }, { status: 201 })
  } catch (err) {
    console.error('Capture inbound error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
