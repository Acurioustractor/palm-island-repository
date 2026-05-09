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
        <p className="uppercase font-bold mb-2" style={{ color: '#8B1A1A', fontSize: 11, letterSpacing: '0.3em' }}>
          PICC admin · service impact
        </p>
        <h1 className="font-fraunces font-bold leading-tight" style={{ color: '#0B4F6C', fontSize: 'clamp(28px, 4vw, 40px)' }}>Service impact.</h1>
        <p className="mt-2 text-sm" style={{ color: '#6B6560' }}>
          {data.coverage.reporting} of {data.coverage.total} services reporting — FY {data.fiscalYearDisplay}
        </p>
      </div>
      <ImpactDashboardClient data={data} />
    </div>
  )
}
