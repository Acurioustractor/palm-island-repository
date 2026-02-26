/**
 * People browser for planner PersonPicker
 *
 * GET /api/report-planner/people
 * Returns board members + leadership combined
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return NextResponse.json({ people: [] })
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  try {
    const [boardResult, leadershipResult] = await Promise.all([
      supabase
        .from('board_members')
        .select('id, name, role, photo_url')
        .order('display_order'),
      supabase
        .from('leadership')
        .select('id, full_name, position, photo_url')
        .eq('is_active', true)
        .order('position_order'),
    ])

    const people: Array<{ id: string; name: string; role: string; photo_url: string | null }> = []

    for (const l of leadershipResult.data || []) {
      people.push({
        id: l.id,
        name: l.full_name,
        role: l.position,
        photo_url: l.photo_url,
      })
    }

    for (const b of boardResult.data || []) {
      // Avoid duplicates (leadership might overlap with board)
      if (!people.some((p) => p.name === b.name)) {
        people.push({
          id: b.id,
          name: b.name,
          role: b.role,
          photo_url: b.photo_url,
        })
      }
    }

    return NextResponse.json({ people })
  } catch (err) {
    console.error('People query failed:', err)
    return NextResponse.json({ people: [] })
  }
}
