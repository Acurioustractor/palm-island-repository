import { createServerSupabase } from '@/lib/supabase/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mic, Calendar, Clock, Tag, User, Play, Volume2 } from 'lucide-react'

export const dynamic = 'force-dynamic'
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('interviews')
    .select('interview_title')
    .eq('id', id)
    .single()

  return {
    title: data?.interview_title ? `${data.interview_title} | PICC` : 'Interview | PICC',
  }
}

export default async function InterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createServerSupabase()

  const { data: interview, error } = await supabase
    .from('interviews')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !interview) return notFound()

  // Fetch the storyteller profile
  let elder: { id: string; full_name: string; preferred_name: string | null; profile_image_url: string | null; is_elder: boolean } | null = null
  if (interview.storyteller_id) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, preferred_name, profile_image_url, is_elder')
      .eq('id', interview.storyteller_id)
      .single()
    elder = data
  }

  // Fetch related quotes extracted from this interview
  const { data: relatedQuotes } = await supabase
    .from('extracted_quotes')
    .select('id, quote_text, theme, sentiment')
    .eq('source_type', 'interview')
    .eq('source_id', id)
    .limit(10)

  const statusColors: Record<string, string> = {
    approved: 'bg-green-100 text-green-700',
    edited: 'bg-amber-100 text-amber-700',
    raw: 'bg-stone-100 text-stone-600',
    pending: 'bg-blue-100 text-blue-700',
  }

  const themes: string[] = Array.isArray(interview.key_themes) ? interview.key_themes : []

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Back link */}
        <Link
          href={elder?.is_elder ? '/elders' : '/picc/dashboard'}
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-picc-ochre/10 text-picc-ochre flex items-center justify-center flex-shrink-0">
              <Mic className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-stone-900">
                {interview.interview_title || 'Untitled Interview'}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-stone-500">
                {interview.interview_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(interview.interview_date).toLocaleDateString('en-AU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                )}
                {interview.interview_duration_minutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {interview.interview_duration_minutes} minutes
                  </span>
                )}
                {interview.status && (
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[interview.status] || statusColors.raw}`}>
                    {interview.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Elder card */}
        {elder && (
          <Link
            href={`/elders`}
            className="flex items-center gap-3 p-4 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors mb-8"
          >
            {elder.profile_image_url ? (
              <img
                src={elder.profile_image_url}
                alt={elder.preferred_name || elder.full_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-picc-ochre/10 flex items-center justify-center">
                <User className="w-5 h-5 text-picc-ochre" />
              </div>
            )}
            <div>
              <div className="font-semibold text-stone-800">
                {elder.preferred_name || elder.full_name}
              </div>
              <div className="text-xs text-stone-500">
                {elder.is_elder ? 'Elder' : 'Storyteller'}
              </div>
            </div>
          </Link>
        )}

        {/* Media players */}
        {(interview.video_url || interview.audio_url) && (
          <div className="mb-8 space-y-4">
            {interview.video_url && (
              <div className="rounded-2xl overflow-hidden border border-stone-200 bg-black">
                <video
                  src={interview.video_url}
                  controls
                  className="w-full max-h-[480px]"
                  poster=""
                >
                  <track kind="captions" />
                </video>
              </div>
            )}
            {interview.audio_url && !interview.video_url && (
              <div className="p-6 rounded-2xl border border-stone-200 bg-white">
                <div className="flex items-center gap-3 mb-3">
                  <Volume2 className="w-5 h-5 text-picc-ochre" />
                  <span className="text-sm font-medium text-stone-700">Audio Recording</span>
                </div>
                <audio src={interview.audio_url} controls className="w-full" />
              </div>
            )}
          </div>
        )}

        {/* Themes */}
        {themes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">
              Key Themes
            </h2>
            <div className="flex flex-wrap gap-2">
              {themes.map((theme) => (
                <span
                  key={theme}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-picc-ochre/10 text-picc-ochre text-sm font-medium"
                >
                  <Tag className="w-3 h-3" />
                  {theme}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Transcript */}
        {interview.raw_transcript && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">
              Transcript
            </h2>
            <div className="p-6 rounded-2xl border border-stone-200 bg-white">
              <div className="prose prose-stone max-w-none whitespace-pre-wrap text-stone-700 leading-relaxed">
                {interview.raw_transcript}
              </div>
            </div>
          </div>
        )}

        {/* Interview notes */}
        {interview.interview_notes && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">
              Notes
            </h2>
            <div className="p-6 rounded-2xl border border-stone-200 bg-white">
              <div className="prose prose-stone max-w-none whitespace-pre-wrap text-stone-600">
                {interview.interview_notes}
              </div>
            </div>
          </div>
        )}

        {/* Related quotes */}
        {relatedQuotes && relatedQuotes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">
              Extracted Quotes
            </h2>
            <div className="space-y-3">
              {relatedQuotes.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl border border-stone-200 bg-white"
                >
                  <p className="text-stone-700 italic">&ldquo;{q.quote_text}&rdquo;</p>
                  <div className="flex gap-2 mt-2">
                    {q.theme && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-picc-ochre/10 text-picc-ochre">
                        {q.theme}
                      </span>
                    )}
                    {q.sentiment && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                        {q.sentiment}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
