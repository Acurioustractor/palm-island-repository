import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getFinancials, parseFiscalYear } from '@/lib/financials/get-financials'

export const dynamic = 'force-dynamic'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fy = searchParams.get('fy')

    if (!fy) {
      return NextResponse.json({ error: 'fiscal year (fy) required' }, { status: 400 })
    }

    const fiscalYear = parseFiscalYear(fy)
    const records = await getFinancials({ fiscalYear, limit: 1 })

    return NextResponse.json({ financials: records[0] ?? null, fiscal_year: fiscalYear })
  } catch (error: any) {
    console.error('Financials GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    const { fiscal_year, ...fields } = body

    if (!fiscal_year) {
      return NextResponse.json({ error: 'fiscal_year required' }, { status: 400 })
    }

    // Get PICC org id
    const { data: orgs } = await supabase
      .from('organizations')
      .select('id')
      .eq('short_name', 'PICC')
      .limit(1)

    const organizationId = orgs?.[0]?.id

    if (!organizationId) {
      return NextResponse.json({ error: 'PICC organization not found' }, { status: 404 })
    }

    const financialData = {
      organization_id: organizationId,
      fiscal_year: parseInt(fiscal_year),
      current_assets: fields.current_assets ?? null,
      non_current_assets: fields.non_current_assets ?? null,
      current_liabilities: fields.current_liabilities ?? null,
      non_current_liabilities: fields.non_current_liabilities ?? null,
      total_income: fields.total_income ?? null,
      labour_costs: fields.labour_costs ?? null,
      administration_expenses: fields.administration_expenses ?? null,
      property_energy_expenses: fields.property_energy_expenses ?? null,
      motor_vehicle_expenses: fields.motor_vehicle_expenses ?? null,
      travel_training_expenses: fields.travel_training_expenses ?? null,
      client_related_costs: fields.client_related_costs ?? null,
      audited: fields.audited ?? false,
      auditor_name: fields.auditor_name ?? null,
      audit_date: fields.audit_date ?? null,
      notes: fields.notes ?? null,
    }

    const { data, error } = await supabase
      .from('annual_financials')
      .upsert(financialData, { onConflict: 'organization_id,fiscal_year' })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ financials: data })
  } catch (error: any) {
    console.error('Financials PUT error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
