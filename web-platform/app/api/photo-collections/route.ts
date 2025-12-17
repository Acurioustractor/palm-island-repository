import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function isDev(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') return false
  const host = request.headers.get('host') || ''
  return host.includes('localhost') || host.includes('127.0.0.1')
}

function getServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function GET(request: NextRequest) {
  try {
    // Safety: this endpoint bypasses RLS using the service role; keep it dev-only.
    if (!isDev(request)) return NextResponse.json({ error: 'Not available' }, { status: 403 })

    const supabase = getServerClient()
    const { data, error } = await (supabase as any)
      .from('photo_collections')
      .select('id,name,slug,item_count,cover_image_id,is_public')
      .order('name', { ascending: true })
      .limit(500)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load collections' }, { status: 500 })
  }
}

