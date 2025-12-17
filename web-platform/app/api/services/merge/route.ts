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

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export async function POST(request: NextRequest) {
  try {
    // Safety: this endpoint bypasses RLS using the service role; keep it dev-only.
    if (!isDev(request)) return NextResponse.json({ error: 'Not available' }, { status: 403 })

    const body = (await request.json().catch(() => ({}))) as any
    const fromId = String(body.fromId || '').trim()
    const toId = String(body.toId || '').trim()

    if (!isUuid(fromId) || !isUuid(toId)) {
      return NextResponse.json({ error: 'fromId and toId must be UUIDs' }, { status: 400 })
    }
    if (fromId === toId) {
      return NextResponse.json({ error: 'fromId and toId must be different' }, { status: 400 })
    }

    const supabase = getServerClient()

    // Ensure both exist
    const { data: services, error: servicesError } = await supabase
      .from('organization_services')
      .select('id,name')
      .in('id', [fromId, toId])

    if (servicesError) return NextResponse.json({ error: servicesError.message }, { status: 500 })
    if ((services || []).length !== 2) return NextResponse.json({ error: 'Service not found' }, { status: 404 })

    const updates = [
      { table: 'stories', column: 'service_id' },
      { table: 'profiles', column: 'service_id' },
      { table: 'organization_members', column: 'service_id' },
      { table: 'data_snapshots', column: 'service_id' },
    ]

    const results: Record<string, number> = {}

    for (const u of updates) {
      const { data, error } = await (supabase as any)
        .from(u.table)
        .update({ [u.column]: toId })
        .eq(u.column, fromId)
        .select('id')

      if (error) return NextResponse.json({ error: error.message, table: u.table }, { status: 500 })
      results[`${u.table}.${u.column}`] = (data || []).length
    }

    // Deactivate the source service to remove it from dropdowns.
    const { error: deactivateError } = await (supabase as any)
      .from('organization_services')
      .update({ is_active: false })
      .eq('id', fromId)

    if (deactivateError) return NextResponse.json({ error: deactivateError.message }, { status: 500 })

    return NextResponse.json({ ok: true, moved: results, deactivated: fromId, into: toId })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Merge failed' }, { status: 500 })
  }
}

