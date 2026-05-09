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
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p
            className="uppercase font-bold mb-2"
            style={{ color: '#8B1A1A', fontSize: 11, letterSpacing: '0.3em' }}
          >
            PICC admin · report readiness
          </p>
          <h1
            className="font-fraunces font-bold leading-tight"
            style={{ color: '#0B4F6C', fontSize: 'clamp(28px, 4vw, 40px)' }}
          >
            How ready are we?
          </h1>
          <p className="mt-2 text-sm" style={{ color: '#6B6560' }}>
            {completeSections} of {report.reportSections.length} sections complete · {report.services.length} services tracked
          </p>
        </div>

        {/* Fiscal Year Selector - Client Component */}
        <FiscalYearSelector currentYear={fiscalYear} options={fyOptions} />
      </div>

      {/* Auto-link Section */}
      <div
        className="rounded-2xl p-5"
        style={{ backgroundColor: '#F7F6F4', border: '1px solid #C8963E33' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p
              className="uppercase font-bold mb-2"
              style={{ color: '#C8963E', fontSize: 11, letterSpacing: '0.3em' }}
            >
              Auto-link stories
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#2D2319' }}>
              Automatically select and link the best stories to your annual report based on
              quality, engagement, and category diversity.
            </p>
          </div>
          <AutoLinkButton reports={reports} />
        </div>
      </div>

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: '#FEF3C7', border: '1px solid #C8963E33' }}
        >
          <p
            className="uppercase font-bold mb-3"
            style={{ color: '#8B1A1A', fontSize: 11, letterSpacing: '0.3em' }}
          >
            Priority actions
          </p>
          <ul className="flex flex-col gap-2">
            {report.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2 leading-relaxed" style={{ color: '#2D2319' }}>
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#C8963E' }} />
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
