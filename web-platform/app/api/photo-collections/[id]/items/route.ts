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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Safety: this endpoint bypasses RLS using the service role; keep it dev-only.
    if (!isDev(request)) {
      return NextResponse.json({ error: 'Not available' }, { status: 403 })
    }

    const collectionId = params.id
    if (!collectionId) return NextResponse.json({ error: 'Collection id required' }, { status: 400 })

    const body = (await request.json()) as { mediaIds?: string[] }
    const mediaIds = Array.isArray(body.mediaIds) ? body.mediaIds.filter(Boolean) : []

    if (mediaIds.length === 0) {
      return NextResponse.json({ error: 'mediaIds required' }, { status: 400 })
    }

    const supabase = getServerClient()

    const rows = mediaIds.map((mediaId) => ({
      collection_id: collectionId,
      media_id: mediaId,
      added_by: null,
      sort_order: 0,
    }))

    const { error } = await (supabase as any)
      .from('collection_items')
      .upsert(rows, { onConflict: 'collection_id,media_id', ignoreDuplicates: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to add to collection' }, { status: 500 })
  }
}

