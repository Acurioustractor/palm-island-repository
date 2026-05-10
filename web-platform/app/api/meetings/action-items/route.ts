/**
 * Action item state read/write.
 *
 * GET  /api/meetings/action-items                    → list all states (optionally filtered by ?status=)
 * GET  /api/meetings/action-items?meeting_id=:id     → states for one meeting
 * PATCH /api/meetings/action-items                   → upsert one state
 *   body: { meeting_id, item_index, status?, assignee?, due_date?, completion_notes?, updated_by? }
 *
 * Degrades gracefully if the action_item_states table doesn't exist yet —
 * GET returns { data: [], degraded: true }, PATCH returns 503.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const ALLOWED_STATUSES = new Set(['open', 'in_progress', 'done', 'cancelled'])

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function isMissingTableError(err: any): boolean {
  const msg = String(err?.message || '')
  const code = String(err?.code || '')
  return code === '42P01' || /relation .* does not exist/i.test(msg)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const meetingId = searchParams.get('meeting_id')?.trim() || null
    const status = searchParams.get('status')?.trim() || null

    let q = supabase
      .from('action_item_states')
      .select('meeting_id, item_index, status, assignee, due_date, completion_notes, completed_at, updated_at, updated_by')

    if (meetingId) q = q.eq('meeting_id', meetingId)
    if (status && ALLOWED_STATUSES.has(status)) q = q.eq('status', status)

    const { data, error } = await q
    if (error) {
      if (isMissingTableError(error)) {
        return NextResponse.json({ data: [], degraded: true, reason: 'action_item_states table not yet applied' })
      }
      throw error
    }

    return NextResponse.json({ data: data || [], degraded: false })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const meetingId = String(body?.meeting_id || '').trim()
    const itemIndex = Number(body?.item_index)

    if (!meetingId) return NextResponse.json({ error: 'meeting_id required' }, { status: 400 })
    if (!Number.isInteger(itemIndex) || itemIndex < 0) {
      return NextResponse.json({ error: 'item_index must be a non-negative integer' }, { status: 400 })
    }

    const status = body?.status ? String(body.status).trim() : undefined
    if (status && !ALLOWED_STATUSES.has(status)) {
      return NextResponse.json({ error: `status must be one of ${Array.from(ALLOWED_STATUSES).join(', ')}` }, { status: 400 })
    }

    const payload: Record<string, any> = { meeting_id: meetingId, item_index: itemIndex }
    if (status !== undefined) payload.status = status
    if ('assignee' in body) payload.assignee = body.assignee?.trim() || null
    if ('due_date' in body) payload.due_date = body.due_date || null
    if ('completion_notes' in body) payload.completion_notes = body.completion_notes?.trim() || null
    if ('updated_by' in body) payload.updated_by = body.updated_by?.trim() || null

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('action_item_states')
      .upsert(payload, { onConflict: 'meeting_id,item_index' })
      .select()
      .single()

    if (error) {
      if (isMissingTableError(error)) {
        return NextResponse.json(
          {
            error: 'Phase 2 not enabled — action_item_states migration not applied yet',
            migration: 'web-platform/supabase/migrations/20260511_action_item_states.sql',
          },
          { status: 503 }
        )
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed' }, { status: 500 })
  }
}
