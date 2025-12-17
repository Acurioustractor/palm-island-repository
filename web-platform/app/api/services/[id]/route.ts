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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false
  return Object.getPrototypeOf(value) === Object.prototype
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isDev(request)) return NextResponse.json({ error: 'Not available' }, { status: 403 })

    const id = params.id
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const allowedKeys = new Set(['name', 'slug', 'service_category', 'description', 'is_active', 'metadata'])

    const update: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(body)) {
      if (allowedKeys.has(k)) update[k] = v
    }

    if (update.metadata && !isPlainObject(update.metadata)) {
      return NextResponse.json({ error: 'metadata must be an object' }, { status: 400 })
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const supabase = getServerClient()
    const { data, error } = await (supabase as any)
      .from('organization_services')
      .update(update)
      .eq('id', id)
      .select('id, name, slug, service_category, description, is_active, metadata')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, service: data })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update service' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isDev(request)) return NextResponse.json({ error: 'Not available' }, { status: 403 })

    const id = params.id
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const url = new URL(request.url)
    const force = url.searchParams.get('force') === '1'

    const supabase = getServerClient()

    const counts: Record<string, number> = {}
    const checkTables = [
      { table: 'stories', column: 'service_id' },
      { table: 'profiles', column: 'service_id' },
      { table: 'organization_members', column: 'service_id' },
      { table: 'data_snapshots', column: 'service_id' },
    ]

    for (const { table, column } of checkTables) {
      try {
        const res = await (supabase as any)
          .from(table)
          .select('id', { count: 'exact', head: true })
          .eq(column, id)
        if (!res.error) counts[table] = Number(res.count || 0)
      } catch {
        // ignore
      }
    }

    const referencedBy = Object.entries(counts).filter(([, c]) => c > 0)
    if (!force && referencedBy.length > 0) {
      return NextResponse.json(
        {
          error:
            'Service is referenced by other records. Deactivate it instead, or retry delete with ?force=1.',
          references: counts,
        },
        { status: 409 }
      )
    }

    const { error } = await (supabase as any).from('organization_services').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete service' }, { status: 500 })
  }
}
