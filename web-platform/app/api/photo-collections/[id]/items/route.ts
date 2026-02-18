import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

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

async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: any) {
            cookiesToSet.forEach(({ name, value, options }: any) => {
              try { cookieStore.set(name, value, options) } catch {}
            })
          },
        } as any,
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    return !!user
  } catch {
    return false
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Update item_count on the collection
    const { count } = await supabase
      .from('collection_items')
      .select('*', { count: 'exact', head: true })
      .eq('collection_id', collectionId)
    await supabase
      .from('photo_collections')
      .update({ item_count: count ?? 0, updated_at: new Date().toISOString() })
      .eq('id', collectionId)

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to add to collection' }, { status: 500 })
  }
}

