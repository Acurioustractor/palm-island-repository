import { createServerSupabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function GrantDetailPage({
  params,
}: {
  params: Promise<{ grantId: string }>
}) {
  const { grantId } = await params
  const supabase = createServerSupabase()

  const [grantRes, outcomesRes, deadlinesRes] = await Promise.all([
    supabase
      .from('service_grants')
      .select('*')
      .eq('id', grantId)
      .single(),
    supabase
      .from('grant_outcomes')
      .select('*, evidence_links(*)')
      .eq('grant_id', grantId)
      .order('created_at', { ascending: true }),
    supabase
      .from('grant_deadlines')
      .select('*')
      .eq('grant_id', grantId)
      .order('due_date', { ascending: true }),
  ])

  if (!grantRes.data) notFound()

  const grant = grantRes.data
  const outcomes = outcomesRes.data || []
  const deadlines = deadlinesRes.data || []

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/picc/grants" className="text-sm text-gray-600 hover:text-gray-900 mb-4 inline-block">
          &larr; Back to Grants
        </Link>

        {/* Grant Header */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{grant.grant_name}</h1>
          <div className="text-gray-600 mt-1">{grant.funder_name}</div>
          <div className="flex gap-4 mt-3 text-sm text-gray-600">
            {grant.amount && <span>Amount: ${Number(grant.amount).toLocaleString()}</span>}
            {grant.start_date && <span>Start: {grant.start_date}</span>}
            {grant.end_date && <span>End: {grant.end_date}</span>}
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              grant.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {grant.status || 'active'}
            </span>
          </div>
        </div>

        {/* Outcomes */}
        <div className="bg-white rounded-lg border mb-6">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Outcomes ({outcomes.length})</h2>
          </div>
          {outcomes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No outcomes defined yet for this grant.
            </div>
          ) : (
            <div className="divide-y">
              {outcomes.map((outcome) => {
                const evidenceCount = (outcome.evidence_links as unknown[])?.length || 0
                return (
                  <div key={outcome.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{outcome.outcome_name}</div>
                        {outcome.outcome_description && (
                          <div className="text-sm text-gray-600 mt-1">{outcome.outcome_description}</div>
                        )}
                        <div className="flex gap-3 mt-2 text-xs text-gray-500">
                          {outcome.target_metric && (
                            <span>Target: {outcome.target_metric} = {outcome.target_value}</span>
                          )}
                          {outcome.actual_value != null && (
                            <span>Actual: {outcome.actual_value}</span>
                          )}
                          {outcome.due_date && <span>Due: {outcome.due_date}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          outcome.status === 'met' || outcome.status === 'exceeded' ? 'bg-green-100 text-green-700' :
                          outcome.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                          outcome.status === 'not_met' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {outcome.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          evidenceCount > 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {evidenceCount} evidence
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Deadlines */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Deadlines ({deadlines.length})</h2>
          </div>
          {deadlines.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No deadlines set for this grant.
            </div>
          ) : (
            <div className="divide-y">
              {deadlines.map((d) => {
                const daysUntil = Math.ceil(
                  (new Date(d.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                )
                return (
                  <div key={d.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{d.title}</div>
                      <div className="text-sm text-gray-600">{d.deadline_type} &middot; {d.due_date}</div>
                      {d.description && <div className="text-sm text-gray-500 mt-1">{d.description}</div>}
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        d.status === 'overdue' ? 'bg-red-100 text-red-700' :
                        d.status === 'submitted' || d.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        d.status === 'due_soon' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {d.status}
                      </span>
                      {daysUntil > 0 && d.status !== 'submitted' && d.status !== 'accepted' && (
                        <div className="text-xs text-gray-500 mt-1">{daysUntil} days</div>
                      )}
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
