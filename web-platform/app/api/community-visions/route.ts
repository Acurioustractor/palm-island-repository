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

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerClient()
    const status = request.nextUrl.searchParams.get('status')
    const limit = Number(request.nextUrl.searchParams.get('limit') ?? 100)

    let query = supabase
      .from('community_visions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 500))

    if (status) query = query.eq('status', status)

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
    const content = typeof body?.content === 'string' ? body.content.trim() : ''
    const author_name = typeof body?.author_name === 'string' ? body.author_name.trim() || null : null

    if (!content || content.length < 4) {
      return NextResponse.json({ error: 'content is required (min 4 chars)' }, { status: 400 })
    }
    if (content.length > 2000) {
      return NextResponse.json({ error: 'content too long (max 2000 chars)' }, { status: 400 })
    }

    const supabase = getServerClient()
    const { data, error } = await supabase
      .from('community_visions')
      .insert({ content, author_name, status: 'pending', is_public: false })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}
