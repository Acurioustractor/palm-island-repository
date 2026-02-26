import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'

export async function POST() {
  try {
    const supabase = createServerSupabase()

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Mark all read error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
