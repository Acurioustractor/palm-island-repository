import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const FLAG_TYPES = ['wrong', 'review', 'placeholder', 'approved'] as const

export async function GET() {
  const supabase = await createRouteHandlerClient()
  const { data, error } = await (supabase as any)
    .from('almanac_photo_flags')
    .select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ flags: data ?? [] })
}

export async function POST(req: Request) {
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }) }

  const slug = String(body.slot_id ?? '').trim()
  if (!slug) return NextResponse.json({ error: 'slot_id required' }, { status: 400 })

  const flagType = body.flag_type ?? 'wrong'
  if (!FLAG_TYPES.includes(flagType)) {
    return NextResponse.json({ error: 'invalid flag_type' }, { status: 400 })
  }

  const supabase = await createRouteHandlerClient()
  const update: Record<string, any> = {
    slot_id: slug,
    flag_type: flagType,
    comment: body.comment ? String(body.comment).slice(0, 500) : null,
    flagged_by: body.flagged_by ? String(body.flagged_by).slice(0, 100) : null,
    resolved_at: body.resolved ? new Date().toISOString() : null,
  }

  const { data, error } = await (supabase as any)
    .from('almanac_photo_flags')
    .upsert(update, { onConflict: 'slot_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ flag: data })
}
