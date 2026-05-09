import { createServerSupabase } from '@/lib/supabase/client'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export default async function GrantsOverviewPage() {
  const supabase = createServerSupabase()

  const [grantsRes, outcomesRes, deadlinesRes] = await Promise.all([
    supabase
      .from('service_grants')
      .select('id, grant_name, funder_name, status, amount, start_date, end_date')
      .order('start_date', { ascending: false }),
    supabase
      .from('grant_outcomes')
      .select('id, status'),
    supabase
      .from('grant_deadlines')
      .select('id, status, due_date')
      .gte('due_date', new Date().toISOString().split('T')[0])
      .order('due_date', { ascending: true })
      .limit(10),
  ])

  const grants = grantsRes.data || []
  const outcomes = outcomesRes.data || []
  const deadlines = deadlinesRes.data || []

  const totalOutcomes = outcomes.length
  const metOutcomes = outcomes.filter(o => o.status === 'met' || o.status === 'exceeded').length
  const upcomingDeadlines = deadlines.filter(d => d.status === 'upcoming' || d.status === 'due_soon').length

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#FBF8EE' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <p
            className="uppercase font-bold mb-2"
            style={{ color: '#8B1A1A', fontSize: 11, letterSpacing: '0.3em' }}
          >
            PICC admin · grants
          </p>
          <h1
            className="font-fraunces font-bold leading-tight"
            style={{ color: '#0B4F6C', fontSize: 'clamp(28px, 4vw, 40px)' }}
          >
            Grants & evidence.
          </h1>
          <p className="mt-2 text-sm" style={{ color: '#6B6560' }}>
            Track grant outcomes, evidence, and deadlines.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
          <div className="rounded-xl bg-white p-4" style={{ border: '1px solid #E8E6E3', borderTopWidth: 3, borderTopColor: '#0B4F6C' }}>
            <div className="text-[10px] uppercase font-bold" style={{ color: '#0B4F6C', letterSpacing: '0.2em' }}>Active grants</div>
            <div className="font-fraunces font-bold mt-1 leading-none" style={{ color: '#0B4F6C', fontSize: 28 }}>{grants.length}</div>
          </div>
          <div className="rounded-xl bg-white p-4" style={{ border: '1px solid #E8E6E3', borderTopWidth: 3, borderTopColor: '#C8963E' }}>
            <div className="text-[10px] uppercase font-bold" style={{ color: '#C8963E', letterSpacing: '0.2em' }}>Total outcomes</div>
            <div className="font-fraunces font-bold mt-1 leading-none" style={{ color: '#C8963E', fontSize: 28 }}>{totalOutcomes}</div>
          </div>
          <div className="rounded-xl bg-white p-4" style={{ border: '1px solid #E8E6E3', borderTopWidth: 3, borderTopColor: '#16A34A' }}>
            <div className="text-[10px] uppercase font-bold" style={{ color: '#16A34A', letterSpacing: '0.2em' }}>Outcomes met</div>
            <div className="font-fraunces font-bold mt-1 leading-none" style={{ color: '#16A34A', fontSize: 28 }}>{metOutcomes}</div>
          </div>
          <div className="rounded-xl bg-white p-4" style={{ border: '1px solid #E8E6E3', borderTopWidth: 3, borderTopColor: '#F5A623' }}>
            <div className="text-[10px] uppercase font-bold" style={{ color: '#F5A623', letterSpacing: '0.2em' }}>Upcoming deadlines</div>
            <div className="font-fraunces font-bold mt-1 leading-none" style={{ color: '#F5A623', fontSize: 28 }}>{upcomingDeadlines}</div>
          </div>
        </div>

        {/* Grants List */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold">All Grants</h2>
            <Link href="/picc/grants/evidence" className="text-sm text-blue-600 hover:underline">
              View Evidence Dashboard
            </Link>
          </div>
          {grants.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No grants found. Grant data is managed in the service_grants table.
            </div>
          ) : (
            <div className="divide-y">
              {grants.map((grant) => (
                <Link
                  key={grant.id}
                  href={`/picc/grants/${grant.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{grant.grant_name}</div>
                      <div className="text-sm text-gray-600">{grant.funder_name}</div>
                    </div>
                    <div className="text-right">
                      {grant.amount && (
                        <div className="font-medium text-gray-900">
                          ${Number(grant.amount).toLocaleString()}
                        </div>
                      )}
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        grant.status === 'active' ? 'bg-green-100 text-green-700' :
                        grant.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {grant.status || 'active'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        {deadlines.length > 0 && (
          <div className="mt-6 bg-white rounded-lg border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Upcoming Deadlines</h2>
            </div>
            <div className="divide-y">
              {deadlines.map((d) => (
                <div key={d.id} className="p-4 flex items-center justify-between">
                  <div className="text-sm text-gray-900">{d.due_date}</div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    d.status === 'overdue' ? 'bg-red-100 text-red-700' :
                    d.status === 'due_soon' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
