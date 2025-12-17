import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role credentials')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = getServerClient()

    const { data, error } = await (supabase as any).from('media_files').select('*').eq('id', id).single()
    if (error) return NextResponse.json({ error: error.message }, { status: 404 })

    return NextResponse.json({ media: data })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load media' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>

    const allowedKeys = new Set([
      'title',
      'caption',
      'description',
      'alt_text',
      'tags',
      'location',
      'taken_at',
      'is_public',
      'is_featured',
      'display_order',
      'page_context',
      'page_section',
      'usage_context',
      'context_metadata',
      'metadata',
    ])

    const update: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(body)) {
      if (allowedKeys.has(key)) update[key] = value
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const supabase = getServerClient()
    const { data, error } = await (supabase as any)
      .from('media_files')
      .update(update)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, media: data })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update media' }, { status: 500 })
  }
}
