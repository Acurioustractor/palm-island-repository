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

export async function PATCH(request: NextRequest, { params }: { params: { id: string; grantId: string } }) {
  try {
    const supabase = getServerClient()
    const body = await request.json()

    const allowedKeys = new Set([
      'grant_name', 'funder_id', 'amount', 'status',
      'application_date', 'award_date', 'reporting_due', 'acquittal_due',
      'fiscal_year', 'notes', 'requirements', 'outcomes_reported',
    ])

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const [k, v] of Object.entries(body)) {
      if (allowedKeys.has(k)) update[k] = v
    }

    const { data, error } = await supabase
      .from('service_grants')
      .update(update)
      .eq('id', params.grantId)
      .eq('service_id', params.id)
      .select('*, partners:funder_id(id, name, partner_type, logo_url)')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ grant: data })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; grantId: string } }) {
  try {
    const supabase = getServerClient()
    const { error } = await supabase
      .from('service_grants')
      .delete()
      .eq('id', params.grantId)
      .eq('service_id', params.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}
