import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'

export async function GET() {
  try {
    const supabase = createServerSupabase()
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // Gather weekly activity
    const [storiesRes, capturesRes, notificationsRes] = await Promise.all([
      supabase
        .from('stories')
        .select('id, title, created_at')
        .gte('created_at', oneWeekAgo)
        .order('created_at', { ascending: false }),
      supabase
        .from('story_captures')
        .select('id, enriched_title, status, created_at')
        .gte('created_at', oneWeekAgo)
        .order('created_at', { ascending: false }),
      supabase
        .from('notifications')
        .select('id')
        .gte('created_at', oneWeekAgo),
    ])

    const digest = {
      period: {
        from: oneWeekAgo,
        to: new Date().toISOString(),
      },
      stories: {
        count: storiesRes.data?.length || 0,
        items: (storiesRes.data || []).slice(0, 5),
      },
      captures: {
        count: capturesRes.data?.length || 0,
        pending: (capturesRes.data || []).filter(c => c.status === 'pending').length,
        items: (capturesRes.data || []).slice(0, 5),
      },
      notifications: {
        count: notificationsRes.data?.length || 0,
      },
    }

    return NextResponse.json({ digest })
  } catch (err) {
    console.error('Digest error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
