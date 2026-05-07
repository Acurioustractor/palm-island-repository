import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const ALLOWED_CATEGORIES = [
  'services',
  'culture',
  'youth',
  'economic',
  'environment',
  'governance',
  'other',
] as const
type Category = (typeof ALLOWED_CATEGORIES)[number]

function getServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) throw new Error('Missing Supabase credentials')
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerClient()
    const sp = request.nextUrl.searchParams
    const status = sp.get('status') // 'pending' | 'approved'
    const category = sp.get('category')
    const limit = Math.min(Math.max(Number(sp.get('limit') ?? 100), 1), 500)

    const session = sp.get('session') // exact match on session_id

    let query = supabase
      .from('community_visions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status === 'approved') query = query.eq('is_approved', true)
    else if (status === 'pending') query = query.eq('is_approved', false)

    if (category && (ALLOWED_CATEGORIES as readonly string[]).includes(category)) {
      query = query.eq('category', category)
    }

    if (session) query = query.eq('session_id', session)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const vision_text = typeof body?.vision_text === 'string' ? body.vision_text.trim() : ''
    const author_name = typeof body?.author_name === 'string' ? body.author_name.trim() || null : null
    const is_anonymous = author_name === null ? true : Boolean(body?.is_anonymous ?? false)
    const source = typeof body?.source === 'string' ? body.source.trim().slice(0, 60) : 'signing-canvas'
    const session_id = typeof body?.session_id === 'string' ? body.session_id.slice(0, 60) : null
    const related_themes = Array.isArray(body?.related_themes)
      ? body.related_themes.filter((t: unknown) => typeof t === 'string').slice(0, 8)
      : null
    const rawCategory = typeof body?.category === 'string' ? body.category.trim().toLowerCase() : 'other'
    const category: Category = (ALLOWED_CATEGORIES as readonly string[]).includes(rawCategory)
      ? (rawCategory as Category)
      : 'other'

    if (!vision_text || vision_text.length < 4) {
      return NextResponse.json({ error: 'vision_text is required (min 4 chars)' }, { status: 400 })
    }
    if (vision_text.length > 2000) {
      return NextResponse.json({ error: 'vision_text too long (max 2000 chars)' }, { status: 400 })
    }

    const supabase = getServerClient()
    const { data, error } = await supabase
      .from('community_visions')
      .insert({
        vision_text,
        category,
        author_name,
        is_anonymous,
        source,
        session_id,
        related_themes,
        is_approved: false,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}
