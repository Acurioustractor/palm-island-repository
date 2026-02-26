import { NextRequest, NextResponse } from 'next/server'
import { getFinancials } from '@/lib/financials/get-financials'

// GET - List financial records via shared data service
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const fiscal_year = searchParams.get('fiscal_year')
    const limit = parseInt(searchParams.get('limit') || '100')

    const records = await getFinancials({
      fiscalYear: fiscal_year ? parseInt(fiscal_year) : undefined,
      limit,
    })

    // Build summary from the latest record
    let summary = null
    if (records.length > 0) {
      const latest = records[0]
      summary = {
        fiscal_year: latest.fiscal_year,
        total_income: latest.total_income,
        total_expenses: latest.total_expenditure,
        net_result: latest.net_result,
        total_assets: latest.total_assets,
        total_liabilities: latest.total_liabilities,
        net_assets: latest.net_assets,
        labour_costs: latest.expense_breakdown.labour_costs,
        administration_expenses: latest.expense_breakdown.administration_expenses,
        audited: latest.audited,
        record_count: records.length,
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
