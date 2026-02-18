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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServerClient()
    const { data, error } = await supabase
      .from('service_grants')
      .select('*, partners:funder_id(id, name, partner_type, logo_url)')
      .eq('service_id', params.id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ grants: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('service_grants')
      .insert({
        service_id: params.id,
        funder_id: body.funder_id || null,
        grant_name: body.grant_name,
        amount: body.amount || null,
        status: body.status || 'prospect',
        application_date: body.application_date || null,
        award_date: body.award_date || null,
        reporting_due: body.reporting_due || null,
        acquittal_due: body.acquittal_due || null,
        fiscal_year: body.fiscal_year || null,
        notes: body.notes || null,
        requirements: body.requirements || {},
        outcomes_reported: body.outcomes_reported || {},
      })
      .select('*, partners:funder_id(id, name, partner_type, logo_url)')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ grant: data })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}
