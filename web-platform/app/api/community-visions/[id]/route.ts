import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function getServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) throw new Error('Missing Supabase credentials')
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = getServerClient()

    const updates: Record<string, any> = {}

    // Approval flow — accept either { is_approved: bool } directly or
    // a friendlier { status: 'approved' | 'rejected' | 'pending' } shape.
    if (typeof body?.is_approved === 'boolean') {
      updates.is_approved = body.is_approved
    } else if (typeof body?.status === 'string') {
      const s = body.status.toLowerCase()
      if (s === 'approved') updates.is_approved = true
      else if (s === 'rejected' || s === 'pending') updates.is_approved = false
    }

    // Stamp approval metadata when transitioning to approved.
    if (updates.is_approved === true) {
      updates.approved_at = new Date().toISOString()
      if (typeof body?.approved_by === 'string') updates.approved_by = body.approved_by
    } else if (updates.is_approved === false) {
      updates.approved_at = null
      updates.approved_by = null
    }

    if (Array.isArray(body?.related_themes)) {
      updates.related_themes = body.related_themes
        .filter((t: unknown) => typeof t === 'string')
        .slice(0, 8)
    }
    if (typeof body?.category === 'string') {
      updates.category = body.category.trim().toLowerCase()
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('community_visions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}
