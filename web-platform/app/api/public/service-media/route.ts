import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

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

function sample<T>(items: T[], count: number) {
  const arr = items.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
  return arr.slice(0, Math.max(0, count))
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = String(searchParams.get('slug') || '').trim()
    const limit = Math.min(24, Math.max(1, Number(searchParams.get('limit') || 12)))

    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

    const supabase = getServerClient()
    const tag = `service:${slug}`

    const { data, error } = await supabase
      .from('media_files')
      .select('id, public_url, title, caption, alt_text, tags, created_at')
      .eq('is_public', true)
      .is('deleted_at', null)
      .eq('file_type', 'image')
      .overlaps('tags', [tag])
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(120)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const picked = sample((data || []) as any[], limit)
    return NextResponse.json({ media: picked })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load service media' }, { status: 500 })
  }
}

