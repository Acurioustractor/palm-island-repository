import { createServerSupabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default async function CaptureDashboardPage() {
  const supabase = createServerSupabase()

  const [capturesRes, pendingRes, approvedRes, promptsRes] = await Promise.all([
    supabase
      .from('story_captures')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('story_captures')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'review'),
    supabase
      .from('story_captures')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved'),
    supabase
      .from('capture_prompts')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
  ])

  const captures = capturesRes.data || []
  const pendingCount = pendingRes.count || 0
  const approvedCount = approvedRes.count || 0
  const activePrompts = promptsRes.count || 0

  const statusColors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-700',
    enriching: 'bg-blue-100 text-blue-700',
    review: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    published: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Story Capture</h1>
            <p className="text-gray-600 mt-1">Collect, enrich, and approve community stories</p>
          </div>
          <Link
            href="/picc/capture/prompts"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Manage Prompts
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border p-4">
            <div className="text-sm text-gray-600">Total Captures</div>
            <div className="text-2xl font-bold text-gray-900">{captures.length}</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-sm text-gray-600">Awaiting Review</div>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-sm text-gray-600">Approved</div>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-sm text-gray-600">Active Prompts</div>
            <div className="text-2xl font-bold text-blue-600">{activePrompts}</div>
          </div>
        </div>

        {/* Capture Feed */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Recent Captures</h2>
          </div>
          {captures.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No story captures yet. Stories will appear here when submitted via SMS, email, or web form.
            </div>
          ) : (
            <div className="divide-y">
              {captures.map((capture) => (
                <div key={capture.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">
                        {capture.enriched_title || capture.raw_content.slice(0, 80)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {capture.storyteller_name || 'Anonymous'} &middot; {capture.source}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(capture.created_at).toLocaleDateString()}
                        {capture.enriched_tags && capture.enriched_tags.length > 0 && (
                          <span className="ml-2">
                            {capture.enriched_tags.slice(0, 3).map((tag: string) => (
                              <span key={tag} className="inline-block px-1.5 py-0.5 bg-gray-100 rounded text-xs mr-1">
                                {tag}
                              </span>
                            ))}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {capture.elder_review_required && (
                        <span className="px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700">
                          Elder Review
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[capture.status] || 'bg-gray-100 text-gray-700'}`}>
                        {capture.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
