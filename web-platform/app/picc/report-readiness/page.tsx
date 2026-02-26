import { checkCompleteness } from '@/lib/content-readiness/check-completeness'
import { ReportReadinessClient } from './client'

export const dynamic = 'force-dynamic'

export default async function ReportReadinessPage() {
  const report = await checkCompleteness()

  const completeSections = report.reportSections.filter(s => s.status === 'green').length

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Report Readiness</h1>
        <p className="text-sm text-gray-500 mt-1">
          {completeSections} of {report.reportSections.length} sections complete — {report.services.length} services tracked
        </p>
      </div>
      <ReportReadinessClient report={report} />
    </div>
  )
}
