import { getFinancials, getLatestFinancials, type FinancialRecord } from '@/lib/financials/get-financials'
import { FinancialDashboardClient } from './client'

export const dynamic = 'force-dynamic'

export default async function FinancialsPage() {
  const [allRecords, latest] = await Promise.all([
    getFinancials({ limit: 10 }),
    getLatestFinancials(),
  ])

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          {latest
            ? `Current position as at FY ${latest.fiscal_year_display} — ${allRecords.length} years of data`
            : 'No financial data available'}
        </p>
      </div>

      {latest ? (
        <FinancialDashboardClient records={allRecords} latest={latest} />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center text-gray-500">
          No financial data found in the database. Add records to the <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">annual_financials</code> table.
        </div>
      )}
    </div>
  )
}
