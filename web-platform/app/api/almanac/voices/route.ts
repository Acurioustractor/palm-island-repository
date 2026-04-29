import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const CONSENT = ['pending', 'verbal', 'signed', 'declined'] as const
const STATUS = ['draft', 'review', 'approved', 'published', 'declined'] as const

export async function GET() {
  const supabase = await createRouteHandlerClient()
  const { data, error } = await (supabase as any)
    .from('almanac_voices')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ voices: data ?? [] })
}

export async function POST(req: Request) {
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }) }

  const isUpdate = !!body.id
  const patch: Record<string, any> = {}

  if (body.speaker_name !== undefined) patch.speaker_name = String(body.speaker_name).slice(0, 200)
  if (body.speaker_role !== undefined) patch.speaker_role = body.speaker_role ? String(body.speaker_role).slice(0, 200) : null
  if (body.service_slug !== undefined) patch.service_slug = body.service_slug || null
  if (body.theme !== undefined) patch.theme = body.theme ? String(body.theme).slice(0, 100) : null
  if (body.quote !== undefined) patch.quote = String(body.quote).slice(0, 2000)
  if (body.context !== undefined) patch.context = body.context ? String(body.context).slice(0, 4000) : null
  if (body.captured_by !== undefined) patch.captured_by = body.captured_by ? String(body.captured_by).slice(0, 100) : null
  if (body.captured_at !== undefined) patch.captured_at = body.captured_at || null
  if (body.source !== undefined) patch.source = body.source ? String(body.source).slice(0, 50) : null
  if (body.el_storyteller_id !== undefined) patch.el_storyteller_id = body.el_storyteller_id || null
  if (body.photo_url !== undefined) patch.photo_url = body.photo_url || null
  if (body.notes !== undefined) patch.notes = body.notes ? String(body.notes).slice(0, 1000) : null

  if (body.consent_status !== undefined) {
    if (!CONSENT.includes(body.consent_status)) return NextResponse.json({ error: 'invalid consent_status' }, { status: 400 })
    patch.consent_status = body.consent_status
  }
  if (body.status !== undefined) {
    if (!STATUS.includes(body.status)) return NextResponse.json({ error: 'invalid status' }, { status: 400 })
    patch.status = body.status
  }

  if (!isUpdate) {
    if (!patch.speaker_name) return NextResponse.json({ error: 'speaker_name required' }, { status: 400 })
    if (!patch.quote) return NextResponse.json({ error: 'quote required' }, { status: 400 })
  }

  const supabase = await createRouteHandlerClient()
  const query = isUpdate
    ? (supabase as any).from('almanac_voices').update(patch).eq('id', body.id).select().single()
    : (supabase as any).from('almanac_voices').insert(patch).select().single()

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ voice: data })
}
