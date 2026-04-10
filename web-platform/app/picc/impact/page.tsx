import { getServiceImpact } from '@/lib/services/get-service-impact'
import { ImpactDashboardClient } from './client'

export const metadata = {
  title: 'Impact Dashboard — PICC Admin',
  description: 'Service-level impact metrics across PICC\'s active services.',
}

export const dynamic = 'force-dynamic'

export default async function ImpactPage() {
  const data = await getServiceImpact()

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Service Impact</h1>
        <p className="text-sm text-gray-500 mt-1">
          {data.coverage.reporting} of {data.coverage.total} services reporting — FY {data.fiscalYearDisplay}
        </p>
      </div>
      <ImpactDashboardClient data={data} />
    </div>
  )
}
