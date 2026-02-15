import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// GET - List financial records from annual_financials (real data)
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)

    const fiscal_year = searchParams.get('fiscal_year')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('annual_financials')
      .select('*')
      .order('fiscal_year', { ascending: false })

    if (fiscal_year) {
      query = query.eq('fiscal_year', parseInt(fiscal_year))
    }

    query = query.range(offset, offset + limit - 1)

    const { data: records, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Build summary from the data
    let summary = null
    if (records && records.length > 0) {
      const latest = records[0]
      if (latest) {
        const totalExpenses = (latest.labour_costs || 0) +
          (latest.administration_expenses || 0) +
          (latest.property_energy_expenses || 0) +
          (latest.motor_vehicle_expenses || 0) +
          (latest.travel_training_expenses || 0) +
          (latest.client_related_costs || 0)

        const totalAssets = (latest.current_assets || 0) + (latest.non_current_assets || 0)
        const totalLiabilities = (latest.current_liabilities || 0) + (latest.non_current_liabilities || 0)

        summary = {
          fiscal_year: latest.fiscal_year,
          total_income: latest.total_income || 0,
          total_expenses: totalExpenses,
          net_result: (latest.total_income || 0) - totalExpenses,
          total_assets: totalAssets,
          total_liabilities: totalLiabilities,
          net_assets: totalAssets - totalLiabilities,
          labour_costs: latest.labour_costs || 0,
          administration_expenses: latest.administration_expenses || 0,
          audited: latest.audited || false,
          record_count: records.length
        }
      }
    }

    return NextResponse.json({ records, summary })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST/PUT - Redirect to the canonical financial data endpoint
export async function POST() {
  return NextResponse.json({
    error: 'Write operations for financial data should use /api/annual-report-data/financials',
    redirect: '/api/annual-report-data/financials'
  }, { status: 308 })
}

export async function PUT() {
  return NextResponse.json({
    error: 'Write operations for financial data should use /api/annual-report-data/financials',
    redirect: '/api/annual-report-data/financials'
  }, { status: 308 })
}
