import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { getElementBySlug } from '@/lib/design-system/elements-registry'

export const dynamic = 'force-dynamic'

const VOTES = ['fire', 'up', 'meh', 'down'] as const
const STATUSES = ['concept', 'approved', 'priority', 'retire'] as const

const VOTE_DELTA: Record<(typeof VOTES)[number], number> = {
  fire: 25,
  up:   10,
  meh:   0,
  down: -15,
}

export async function POST(req: Request) {
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }) }

  const slug = String(body.slug ?? '').trim()
  if (!slug || !getElementBySlug(slug)) {
    return NextResponse.json({ error: 'unknown slug' }, { status: 400 })
  }

  const update: Record<string, any> = { slug }

  if (body.vote !== undefined) {
    if (body.vote !== null && !VOTES.includes(body.vote)) {
      return NextResponse.json({ error: 'invalid vote' }, { status: 400 })
    }
    update.vote = body.vote
  }
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) {
      return NextResponse.json({ error: 'invalid status' }, { status: 400 })
    }
    update.status = body.status
  }
  if (body.intended_use !== undefined) update.intended_use = String(body.intended_use ?? '').slice(0, 200) || null
  if (body.notes !== undefined)        update.notes        = String(body.notes ?? '').slice(0, 1000) || null

  const supabase = await createRouteHandlerClient()

  // Read current row so we can derive the new score from the previous one.
  const { data: existing } = await (supabase as any)
    .from('design_element_votes')
    .select('score, vote')
    .eq('slug', slug)
    .maybeSingle()

  const prevScore = (existing?.score as number | undefined) ?? 0
  const prevVote  = ((existing?.vote ?? null) as keyof typeof VOTE_DELTA | null)

  if (update.vote !== undefined) {
    // Reverse prior vote contribution before applying new one.
    const reversal = prevVote ? -VOTE_DELTA[prevVote] : 0
    const addition = update.vote ? VOTE_DELTA[update.vote as keyof typeof VOTE_DELTA] : 0
    update.score = Math.max(0, Math.min(100, prevScore + reversal + addition))
  }

  const { data, error } = await (supabase as any)
    .from('design_element_votes')
    .upsert(update, { onConflict: 'slug' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ vote: data })
}
