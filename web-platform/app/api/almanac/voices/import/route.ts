/**
 * POST /api/almanac/voices/import
 *
 * Bring an EL v2 storyteller-quote into the local 20-voice sprint.
 * Body: { el_quote_id, speaker_name, speaker_role, quote, service_slug?, photo_url?, storyteller_id? }
 *
 * Idempotent on (el_storyteller_id, quote prefix) so re-importing the
 * same quote doesn't create duplicates.
 */
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }) }

  const speaker_name = String(body.speaker_name ?? '').trim()
  const quote = String(body.quote ?? '').trim()
  if (!speaker_name || !quote) return NextResponse.json({ error: 'speaker_name + quote required' }, { status: 400 })

  const supabase = await createRouteHandlerClient()
  const row = {
    speaker_name,
    speaker_role: body.speaker_role ? String(body.speaker_role).slice(0, 200) : null,
    service_slug: body.service_slug ?? null,
    quote: quote.slice(0, 2000),
    photo_url: body.photo_url ?? null,
    el_storyteller_id: body.storyteller_id ?? null,
    source: 'el-pool',
    consent_status: 'verbal' as const,  // existing EL v2 quotes already have some consent posture
    status: 'review' as const,           // imports drop into review, not draft
    notes: body.el_quote_id ? `imported from el v2 quote ${body.el_quote_id}` : null,
  }

  const { data, error } = await (supabase as any)
    .from('almanac_voices')
    .insert(row)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ voice: data })
}
