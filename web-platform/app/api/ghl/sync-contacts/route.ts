import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'
import { getGHLClient } from '@/lib/ghl/client'

export async function POST() {
  try {
    const ghl = getGHLClient()
    if (!ghl.isConfigured()) {
      return NextResponse.json(
        { success: false, reason: 'GHL not configured. Set GHL_API_KEY and GHL_LOCATION_ID.' },
        { status: 200 }
      )
    }

    const supabase = createServerSupabase()
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, role')
      .not('email', 'is', null)
      .limit(100)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const results = { synced: 0, failed: 0, skipped: 0 }

    for (const profile of profiles || []) {
      if (!profile.email) {
        results.skipped++
        continue
      }

      const nameParts = (profile.full_name || '').split(' ')
      const res = await ghl.createContact({
        email: profile.email,
        phone: profile.phone || undefined,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        tags: [profile.role || 'contact', 'picc-platform'],
        source: 'picc-platform-sync',
      })

      if (res.success) results.synced++
      else results.failed++
    }

    return NextResponse.json({ success: true, results })
  } catch (err) {
    console.error('GHL sync error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
