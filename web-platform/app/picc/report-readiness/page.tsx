import { checkCompleteness, getCurrentFiscalYear } from '@/lib/content-readiness/check-completeness'
import { ReportReadinessClient } from './client'
import { createServerComponentClient } from '@/lib/supabase/server'
import { AutoLinkButton } from './auto-link-button'
import { FiscalYearSelector } from './fiscal-year-selector'

export const dynamic = 'force-dynamic'

// Generate fiscal year options (current + 3 prior years)
function getFiscalYearOptions() {
  const current = getCurrentFiscalYear()
  const currentYear = parseInt(current.split('-')[0])
  const options = []

  for (let i = 0; i <= 3; i++) {
    const startYear = currentYear - i
    const endYear = startYear + 1
    options.push({
      value: `${startYear}-${String(endYear).slice(-2)}`,
      label: `${startYear}-${String(endYear).slice(-2)}`,
    })
  }

  return options
}

// Get available reports for auto-linking
async function getAvailableReports() {
  const supabase = await createServerComponentClient()
  const { data: reports } = await supabase
    .from('annual_reports')
    .select('id, title, report_year, fiscal_year, status')
    .order('report_year', { ascending: false })
    .limit(10)
  return reports || []
}

export default async function ReportReadinessPage({
  searchParams,
}: {
  searchParams: Promise<{ fy?: string }>
}) {
  const params = await searchParams
  const fiscalYear = params.fy || getCurrentFiscalYear()
  const report = await checkCompleteness(fiscalYear)
  const fyOptions = getFiscalYearOptions()
  const reports = await getAvailableReports()

  const completeSections = report.reportSections.filter(s => s.status === 'green').length

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report Readiness</h1>
          <p className="text-sm text-gray-500 mt-1">
            {completeSections} of {report.reportSections.length} sections complete — {report.services.length} services tracked
          </p>
        </div>
        
        {/* Fiscal Year Selector - Client Component */}
        <FiscalYearSelector currentYear={fiscalYear} options={fyOptions} />
      </div>
      
      {/* Auto-link Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Auto-Link Stories</h3>
            <p className="text-sm text-blue-700 mt-1">
              Automatically select and link the best stories to your annual report based on quality, engagement, and category diversity.
            </p>
          </div>
          <AutoLinkButton reports={reports} />
        </div>
      </div>
      
      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-amber-800 mb-2">Priority Actions</h3>
          <ul className="space-y-1">
            {report.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-amber-700 flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <ReportReadinessClient report={report} />
    </div>
  )
}
