/**
 * /voices/questions — public Q&A.
 *
 * Lists every answered community question. Reads from stories where:
 *   metadata->>'is_question' = 'true'
 *   metadata->>'question_status' = 'answered'
 *   is_public = true
 *
 * Submitters get there from /voices/ask. Answers are added by admins
 * by editing the story row's metadata.answer + metadata.question_status
 * = 'answered' + setting is_public = true.
 */
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/client'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'
import { HelpCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 1800

export const metadata = {
  title: 'Questions answered — Palm Island Community Company',
  description: 'Community questions answered publicly by the PICC team.',
}

interface QuestionRow {
  id: string
  title: string | null
  content: string | null
  category: string | null
  metadata: Record<string, any> | null
  created_at: string
  updated_at: string | null
}

interface QuestionsPageProps {
  searchParams: Promise<{ topic?: string }>
}

export default async function QuestionsPage({ searchParams }: QuestionsPageProps) {
  const params = await searchParams
  const activeTopic = (params.topic || '').toLowerCase().trim()

  const supabase = createServerSupabase()

  // Two queries — answered questions for the public view, plus a count of
  // open ones so we can show "23 questions in the queue, ask another →".
  let answeredQuery = supabase
    .from('stories')
    .select('id, title, content, category, metadata, created_at, updated_at')
    .eq('is_public', true)
    .filter('metadata->>is_question', 'eq', 'true')
    .filter('metadata->>question_status', 'eq', 'answered')
    .order('updated_at', { ascending: false, nullsFirst: false })
    .limit(60)
  if (activeTopic) {
    answeredQuery = answeredQuery.filter('metadata->>topic', 'eq', activeTopic)
  }

  const [answeredResult, openCountResult] = await Promise.all([
    answeredQuery,
    supabase
      .from('stories')
      .select('id', { count: 'exact', head: true })
      .filter('metadata->>is_question', 'eq', 'true')
      .filter('metadata->>question_status', 'eq', 'open'),
  ])

  const answered = (answeredResult.data || []) as QuestionRow[]
  const openCount = openCountResult.count || 0

  // Build distinct topic list from the answered questions for filter pills.
  // Could fetch from a wider set, but answered is what's surfaced anyway.
  const topicCounts: Record<string, number> = {}
  for (const q of answered) {
    const t = (q.metadata?.topic as string | undefined)?.toLowerCase()
    if (t) topicCounts[t] = (topicCounts[t] || 0) + 1
  }
  const topics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1])

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FBF8EE' }}>
      {/* Hero */}
      <section
        className="px-6 md:px-12 py-16 md:py-20"
        style={{ backgroundColor: C.ocean }}
      >
        <div className="max-w-5xl mx-auto">
          <Link
            href="/voices"
            className="text-xs uppercase font-bold tracking-widest hover:opacity-80"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            ← Voices wall
          </Link>
          <div className="flex items-center gap-3 mt-8 mb-4">
            <HelpCircle className="w-8 h-8 text-white" />
            <div
              className="uppercase font-bold"
              style={{ color: C.starGold, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Questions answered
            </div>
          </div>
          <h1
            className="font-fraunces font-bold leading-tight text-white"
            style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
          >
            What the community is asking.
          </h1>
          <p
            className="mt-6 leading-relaxed text-white/85 max-w-2xl"
            style={{ fontSize: 16 }}
          >
            Every answered question lives here. PICC team reads each one and answers in public so the next person finds their answer too.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/voices/ask"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold uppercase tracking-widest hover:opacity-90"
              style={{
                backgroundColor: C.starGold,
                color: C.midnight,
                fontSize: 11,
                letterSpacing: '0.2em',
              }}
            >
              Ask a question →
            </Link>
            {openCount > 0 && (
              <span className="text-sm text-white/70">
                {openCount} {openCount === 1 ? 'question' : 'questions'} waiting for an answer
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Topic filter pills (when there are 2+ topics in the answered set) */}
      {topics.length > 1 && (
        <section className="px-6 md:px-12 pt-8" style={{ backgroundColor: C.shell }}>
          <div className="max-w-4xl mx-auto py-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/voices/questions"
                className={`px-3 py-1.5 rounded-full border text-sm capitalize transition-colors ${
                  !activeTopic
                    ? 'bg-picc-ochre text-white border-picc-ochre'
                    : 'bg-white text-stone-600 border-stone-300 hover:border-picc-ochre'
                }`}
              >
                All
              </Link>
              {topics.map(([topic, count]) => (
                <Link
                  key={topic}
                  href={`/voices/questions?topic=${encodeURIComponent(topic)}`}
                  className={`px-3 py-1.5 rounded-full border text-sm capitalize transition-colors ${
                    activeTopic === topic
                      ? 'bg-picc-ochre text-white border-picc-ochre'
                      : 'bg-white text-stone-600 border-stone-300 hover:border-picc-ochre'
                  }`}
                >
                  {topic} <span className="opacity-60">· {count}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* List */}
      <section className="px-6 md:px-12 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          {answered.length === 0 ? (
            <div className="rounded-md p-8 text-center" style={{ backgroundColor: C.shell }}>
              <p style={{ color: C.driftwood, fontSize: 15, lineHeight: 1.6 }}>
                No questions have been answered publicly yet. Be the first to ask —
                {' '}
                <Link href="/voices/ask" className="underline" style={{ color: C.ochre }}>
                  ask a question
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {answered.map((q) => {
                const askerName = q.metadata?.anonymous
                  ? 'Community member'
                  : q.metadata?.asker_name || 'Community member'
                const topic = q.metadata?.topic as string | undefined
                const answer = (q.metadata?.answer as string | undefined) || ''
                const askedAt = new Date(q.created_at)
                const answeredAt = q.updated_at ? new Date(q.updated_at) : null
                return (
                  <article
                    key={q.id}
                    className="rounded-md overflow-hidden"
                    style={{ backgroundColor: C.shell }}
                  >
                    {/* Question */}
                    <div
                      className="p-6 md:p-8"
                      style={{ borderBottom: `1px solid ${C.border}` }}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="font-fraunces font-bold leading-none flex-shrink-0"
                          style={{ color: C.ochre, fontSize: 28 }}
                        >
                          Q.
                        </span>
                        <div className="flex-1">
                          <p
                            className="font-fraunces leading-snug"
                            style={{ color: C.earth, fontSize: 'clamp(18px, 2.2vw, 22px)' }}
                          >
                            {q.content}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs" style={{ color: C.muted }}>
                            <span>{askerName}</span>
                            <span>·</span>
                            <span>{askedAt.toLocaleDateString()}</span>
                            {topic && (
                              <>
                                <span>·</span>
                                <span className="capitalize">{topic}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Answer */}
                    {answer && (
                      <div className="p-6 md:p-8" style={{ backgroundColor: '#FBF8EE' }}>
                        <div className="flex items-start gap-3">
                          <span
                            className="font-fraunces font-bold leading-none flex-shrink-0"
                            style={{ color: C.ocean, fontSize: 28 }}
                          >
                            A.
                          </span>
                          <div className="flex-1">
                            <p
                              className="leading-relaxed"
                              style={{ color: C.earth, fontSize: 15, lineHeight: 1.7 }}
                            >
                              {answer}
                            </p>
                            <div className="mt-3 text-xs" style={{ color: C.muted }}>
                              PICC team{answeredAt && ` · ${answeredAt.toLocaleDateString()}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section
        className="px-6 md:px-12 py-16 md:py-20 text-center"
        style={{ backgroundColor: C.midnight }}
      >
        <div className="max-w-xl mx-auto">
          <h2
            className="font-fraunces font-bold"
            style={{ color: C.starGold, fontSize: 'clamp(28px, 4.5vw, 42px)' }}
          >
            Got something to ask?
          </h2>
          <p className="mt-4 text-white/85 leading-relaxed">
            Anything PICC, services, culture, history, governance — every question
            gets read. Most get answered.
          </p>
          <Link
            href="/voices/ask"
            className="inline-block mt-6 px-6 py-3 rounded-full font-bold uppercase tracking-widest hover:opacity-90"
            style={{
              backgroundColor: C.starGold,
              color: C.midnight,
              fontSize: 11,
              letterSpacing: '0.2em',
            }}
          >
            Ask a question →
          </Link>
        </div>
      </section>
    </main>
  )
}
