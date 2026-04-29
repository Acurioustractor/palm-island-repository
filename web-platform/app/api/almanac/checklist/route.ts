import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const CATEGORIES = ['data', 'sign-off', 'photos', 'content', 'video'] as const
const URGENCIES = ['urgent', 'normal', 'low'] as const
const STATUSES = ['open', 'in-progress', 'done', 'blocked', 'n-a'] as const

export async function GET() {
  const supabase = await createRouteHandlerClient()
  const { data, error } = await (supabase as any)
    .from('almanac_checklist_items')
    .select('*')
    .order('urgency', { ascending: true })
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data ?? [] })
}

export async function POST(req: Request) {
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }) }

  const slug = String(body.slug ?? '').trim()
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  const patch: Record<string, any> = { slug }

  if (body.title !== undefined) patch.title = String(body.title).slice(0, 200)
  if (body.description !== undefined) patch.description = body.description ? String(body.description).slice(0, 1000) : null
  if (body.owner !== undefined) patch.owner = body.owner ? String(body.owner).slice(0, 100) : null
  if (body.comment !== undefined) patch.comment = body.comment ? String(body.comment).slice(0, 1000) : null
  if (body.due_date !== undefined) patch.due_date = body.due_date || null
  if (body.sort_order !== undefined) patch.sort_order = Number(body.sort_order) || 100

  if (body.category !== undefined) {
    if (!CATEGORIES.includes(body.category)) return NextResponse.json({ error: 'invalid category' }, { status: 400 })
    patch.category = body.category
  }
  if (body.urgency !== undefined) {
    if (!URGENCIES.includes(body.urgency)) return NextResponse.json({ error: 'invalid urgency' }, { status: 400 })
    patch.urgency = body.urgency
  }
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) return NextResponse.json({ error: 'invalid status' }, { status: 400 })
    patch.status = body.status
  }

  // For new rows, require category + title.
  const supabase = await createRouteHandlerClient()
  const { data: existing } = await (supabase as any)
    .from('almanac_checklist_items')
    .select('slug')
    .eq('slug', slug)
    .maybeSingle()

  if (!existing) {
    if (!patch.category) return NextResponse.json({ error: 'category required for new item' }, { status: 400 })
    if (!patch.title) return NextResponse.json({ error: 'title required for new item' }, { status: 400 })
  }

  const { data, error } = await (supabase as any)
    .from('almanac_checklist_items')
    .upsert(patch, { onConflict: 'slug' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ item: data })
}
