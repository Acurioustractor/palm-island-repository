/**
 * POST /api/atlas/capture
 *
 * Atlas capture endpoint — community / youth / elder reflections submitted
 * from /atlas/capture land here. Always created with status='pending' so
 * they enter the existing /picc/inbox review queue rather than going live
 * automatically.
 *
 * Backed by the community_feedback table. source='atlas-capture'
 * disambiguates these submissions from other feedback sources (forms,
 * GHL, manual entry) so the inbox can filter to "atlas voices" cleanly.
 *
 * Cultural protocol: youth submissions are flagged in tags but still go
 * to staff review. Elder content is flagged in tags. Neither
 * auto-publishes.
 */

import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'

const PICC_ORG_ID = '3c2011b9-f80d-4289-b300-0cd383cff479'
const ALLOWED_KINDS = new Set([
  'voice',
  'photo',
  'text',
  'youth-art',
  'elder',
])
const MAX_LENGTH = 2_500

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 })
  }

  const data = body as {
    text?: string
    name?: string
    kind?: string
    contributor_role?: string
    atlas_context?: unknown
  }

  const text = (data.text ?? '').trim()
  const kind = (data.kind ?? 'text').trim()
  const name = (data.name ?? '').trim()
  const role = (data.contributor_role ?? '').trim()

  if (text.length === 0) {
    return NextResponse.json(
      { error: 'text is required' },
      { status: 400 },
    )
  }
  if (text.length > MAX_LENGTH) {
    return NextResponse.json(
      { error: `text exceeds ${MAX_LENGTH} characters` },
      { status: 400 },
    )
  }
  if (!ALLOWED_KINDS.has(kind)) {
    return NextResponse.json(
      { error: `kind must be one of: ${Array.from(ALLOWED_KINDS).join(', ')}` },
      { status: 400 },
    )
  }

  const tags = ['atlas-capture', kind]
  if (role === 'youth') tags.push('youth-cosign-required')
  if (role === 'elder') tags.push('elder-priority')

  const supabase = createServerSupabase()
  const { data: inserted, error } = await supabase
    .from('community_feedback')
    .insert({
      organization_id: PICC_ORG_ID,
      feedback_text: text,
      category: kind,
      is_anonymous: name.length === 0,
      submitter_name: name.length > 0 ? name : null,
      source: 'atlas-capture',
      status: 'pending',
      priority: role === 'elder' ? 'high' : 'normal',
      tags,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message ?? 'failed to save' },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, id: inserted.id })
}
