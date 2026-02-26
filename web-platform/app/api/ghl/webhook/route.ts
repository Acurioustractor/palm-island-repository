import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'
import type { GHLWebhookEvent } from '@/lib/ghl/types'

export async function POST(request: NextRequest) {
  try {
    const event = (await request.json()) as GHLWebhookEvent
    const supabase = createServerSupabase()

    // Create notification for incoming GHL events
    await supabase.from('notifications').insert({
      type: 'info',
      title: `GHL Event: ${event.type}`,
      message: `Received ${event.type} event${event.contactId ? ` for contact ${event.contactId}` : ''}`,
      metadata: { ghl_event: event },
    })

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('GHL webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
