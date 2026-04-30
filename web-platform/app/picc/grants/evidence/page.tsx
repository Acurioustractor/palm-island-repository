import { createServerSupabase } from '@/lib/supabase/client'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export default async function EvidenceDashboardPage() {
  const supabase = createServerSupabase()

  const [outcomesRes, evidenceRes, gapsRes] = await Promise.all([
    supabase
      .from('grant_outcomes')
      .select(`
        id, outcome_name, status, due_date,
        grant_id,
        service_grants(grant_name, funder_name)
      `)
      .order('due_date', { ascending: true }),
    supabase
      .from('evidence_links')
      .select('id, evidence_type, outcome_id')
      .limit(500),
    supabase
      .from('grant_outcomes')
      .select('id, outcome_name, service_grants(grant_name)')
      .in('status', ['pending', 'partial']),
  ])

  const outcomes = outcomesRes.data || []
  const evidence = evidenceRes.data || []
  const allGaps = gapsRes.data || []

  // Calculate coverage
  const outcomeIds = new Set(outcomes.map(o => o.id))
  const coveredOutcomeIds = new Set(evidence.map(e => e.outcome_id))
  const coveragePercent = outcomeIds.size > 0
    ? Math.round((coveredOutcomeIds.size / outcomeIds.size) * 100)
    : 0

  // Evidence type breakdown
  const byType: Record<string, number> = {}
  for (const e of evidence) {
    byType[e.evidence_type] = (byType[e.evidence_type] || 0) + 1
  }

  // Gaps: outcomes with no evidence
  const gaps = allGaps.filter(o => !coveredOutcomeIds.has(o.id))

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/picc/grants" className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block">
            &larr; Back to Grants
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Evidence Dashboard</h1>
          <p className="text-gray-600 mt-1">Track evidence coverage across all grant outcomes</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border p-4">
            <div className="text-sm text-gray-600">Total Outcomes</div>
            <div className="text-2xl font-bold text-gray-900">{outcomes.length}</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-sm text-gray-600">Evidence Coverage</div>
            <div className={`text-2xl font-bold ${coveragePercent >= 70 ? 'text-green-600' : coveragePercent >= 40 ? 'text-orange-600' : 'text-red-600'}`}>
              {coveragePercent}%
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-sm text-gray-600">Total Evidence Items</div>
            <div className="text-2xl font-bold text-blue-600">{evidence.length}</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-sm text-gray-600">Evidence Gaps</div>
            <div className="text-2xl font-bold text-red-600">{gaps.length}</div>
          </div>
        </div>

        {/* Evidence by Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-4">Evidence by Type</h2>
            {Object.entries(byType).length === 0 ? (
              <p className="text-gray-500 text-sm">No evidence linked yet</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(byType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">{type}</span>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gap Alerts */}
          <div className="bg-white rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-4 text-red-700">Gap Alerts</h2>
            {gaps.length === 0 ? (
              <p className="text-green-600 text-sm">All outcomes have evidence linked</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {gaps.slice(0, 10).map((gap) => {
                  const grants = gap.service_grants as unknown as { grant_name: string }[] | null
                  const grantName = grants?.[0]?.grant_name
                  return (
                    <div key={gap.id} className="p-2 bg-red-50 rounded border border-red-100">
                      <div className="text-sm font-medium text-red-800">{gap.outcome_name}</div>
                      {grantName && (
                        <div className="text-xs text-red-600">{grantName}</div>
                      )}
                    </div>
                  )
                })}
                {gaps.length > 10 && (
                  <p className="text-xs text-gray-500">+ {gaps.length - 10} more gaps</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* All Outcomes with Evidence Status */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">All Outcomes</h2>
          </div>
          {outcomes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No outcomes defined yet. Add outcomes to your grants to start tracking evidence.
            </div>
          ) : (
            <div className="divide-y">
              {outcomes.map((outcome) => {
                const hasEvidence = coveredOutcomeIds.has(outcome.id)
                const grants = outcome.service_grants as unknown as { grant_name: string; funder_name: string }[] | null
                const grant = grants?.[0] || null
                return (
                  <div key={outcome.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{outcome.outcome_name}</div>
                      {grant && (
                        <div className="text-sm text-gray-600">{grant.grant_name} &middot; {grant.funder_name}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        outcome.status === 'met' || outcome.status === 'exceeded' ? 'bg-green-100 text-green-700' :
                        outcome.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                        outcome.status === 'not_met' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {outcome.status}
                      </span>
                      <span className={`w-3 h-3 rounded-full ${hasEvidence ? 'bg-green-500' : 'bg-red-400'}`}
                        title={hasEvidence ? 'Has evidence' : 'No evidence'} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
