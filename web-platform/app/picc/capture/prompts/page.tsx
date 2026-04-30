import { createServerSupabase } from '@/lib/supabase/client'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export default async function CapturePromptsPage() {
  const supabase = createServerSupabase()

  const { data: prompts } = await supabase
    .from('capture_prompts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/picc/capture" className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block">
            &larr; Back to Capture
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Capture Prompts</h1>
          <p className="text-gray-600 mt-1">Create and manage story collection prompts</p>
        </div>

        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">All Prompts</h2>
          </div>
          {(!prompts || prompts.length === 0) ? (
            <div className="p-8 text-center text-gray-500">
              No prompts created yet. Prompts are templates used to invite community members to share stories.
            </div>
          ) : (
            <div className="divide-y">
              {prompts.map((prompt) => (
                <div key={prompt.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{prompt.title}</div>
                      <div className="text-sm text-gray-600 mt-1">{prompt.prompt_text}</div>
                      <div className="flex gap-2 mt-2 text-xs text-gray-500">
                        <span>Audience: {prompt.target_audience}</span>
                        <span>&middot;</span>
                        <span>Via: {(prompt.send_via || []).join(', ')}</span>
                        <span>&middot;</span>
                        <span>Responses: {prompt.responses_count || 0}</span>
                        {prompt.last_sent_at && (
                          <>
                            <span>&middot;</span>
                            <span>Last sent: {new Date(prompt.last_sent_at).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      prompt.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {prompt.is_active ? 'Active' : 'Inactive'}
                    </span>
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
