import Link from 'next/link'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import {
  checkCompleteness,
  type CompletenessStatus,
  type ServiceCompleteness,
  type ReportSectionCompleteness,
} from '@/lib/content-readiness/check-completeness'

export const dynamic = 'force-dynamic'

function StatusDot({ status }: { status: CompletenessStatus }) {
  const colors = {
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  }
  return <span className={`inline-block w-3 h-3 rounded-full ${colors[status]}`} />
}

function StatusIcon({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
  ) : (
    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
  )
}

const CHECK_LABELS: Record<string, string> = {
  hasDescription: 'Description',
  hasCoverPhoto: 'Cover Photo',
  hasGpsCoords: 'GPS Coordinates',
  hasCurrentYearMetrics: 'Current Year Metrics',
  hasStories: 'Published Stories',
  hasNotes: 'Service Notes',
  hasGrantInfo: 'Grant Information',
}

function ServiceCard({ service }: { service: ServiceCompleteness }) {
  return (
    <Link
      href={`/picc/services/${service.slug}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StatusDot status={service.status} />
          <h3 className="font-semibold text-gray-900 text-sm">{service.name}</h3>
        </div>
        <span className="text-xs font-medium text-gray-500">{service.score}%</span>
      </div>
      <ul className="space-y-1.5">
        {Object.entries(service.checks).map(([key, value]) => (
          <li key={key} className="flex items-center gap-2 text-xs text-gray-600">
            <StatusIcon ok={value} />
            <span>{CHECK_LABELS[key] ?? key}</span>
          </li>
        ))}
      </ul>
    </Link>
  )
}

function ReportSectionCard({ section }: { section: ReportSectionCompleteness }) {
  const icon = {
    green: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    amber: <AlertCircle className="w-5 h-5 text-amber-500" />,
    red: <XCircle className="w-5 h-5 text-red-500" />,
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-2">
        {icon[section.status]}
        <h3 className="font-semibold text-gray-900 text-sm">{section.section}</h3>
      </div>
      <p className="text-xs text-gray-500">{section.details}</p>
    </div>
  )
}

function OverallScoreBar({ score }: { score: number }) {
  const color =
    score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">Overall Readiness</span>
        <span className="text-sm font-bold text-gray-900">{score}%</span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

export default async function ContentReadinessPage() {
  const report = await checkCompleteness()

  const formattedTime = new Date(report.generatedAt).toLocaleString('en-AU', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Australia/Brisbane',
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Readiness</h1>
        <p className="text-sm text-gray-500 mb-4">
          Generated {formattedTime}
        </p>
        <OverallScoreBar score={report.overallScore} />
      </div>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Services ({report.services.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {report.services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
          {report.services.length === 0 && (
            <p className="text-sm text-gray-400 col-span-full">
              No active services found.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Annual Report Sections
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {report.reportSections.map((section) => (
            <ReportSectionCard key={section.section} section={section} />
          ))}
        </div>
      </section>
    </div>
  )
}
