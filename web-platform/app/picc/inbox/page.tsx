/**
 * /picc/inbox — unified pending-submissions triage view.
 *
 * Surfaces every contribution awaiting admin action across art,
 * questions, and stories in one place. Each section shows total +
 * first 5 items + link to its dedicated admin queue.
 *
 * One page = "what's PICC's queue depth right now". Replaces the need
 * to bounce between /picc/design-system/submissions, /picc/voices/questions,
 * and /picc/stories to know what's outstanding.
 */
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/client'
import { Image as ImageIcon, HelpCircle, BookOpen, Clock, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Inbox — PICC Admin',
  description: 'Pending submissions across art, questions, and stories.',
}

interface ArtRow {
  id: string
  public_url: string
  title: string | null
  attribution: string | null
  metadata: Record<string, any> | null
  created_at: string
}

interface QuestionRow {
  id: string
  content: string | null
  metadata: Record<string, any> | null
  created_at: string
}

interface StoryRow {
  id: string
  title: string | null
  content: string | null
  category: string | null
  storyteller_id: string | null
  metadata: Record<string, any> | null
  created_at: string
}

export default async function InboxPage() {
  const supabase = createServerSupabase()

  const [art, openQuestions, submittedStories, allCounts] = await Promise.all([
    // Pending art (is_public = false, page_context = community-art, not deleted)
    supabase
      .from('media_files')
      .select('id, public_url, title, attribution, metadata, created_at')
      .eq('page_context', 'community-art')
      .eq('is_public', false)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5),
    // Open questions (is_question=true AND question_status=open)
    supabase
      .from('stories')
      .select('id, content, metadata, created_at')
      .filter('metadata->>is_question', 'eq', 'true')
      .filter('metadata->>question_status', 'eq', 'open')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5),
    // Submitted (non-question) stories awaiting review
    supabase
      .from('stories')
      .select('id, title, content, category, storyteller_id, metadata, created_at')
      .eq('status', 'submitted')
      .eq('is_public', false)
      .or('metadata->>is_question.is.null,metadata->>is_question.eq.false')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5),
    // Totals
    Promise.all([
      supabase
        .from('media_files')
        .select('id', { count: 'exact', head: true })
        .eq('page_context', 'community-art')
        .eq('is_public', false)
        .is('deleted_at', null),
      supabase
        .from('stories')
        .select('id', { count: 'exact', head: true })
        .filter('metadata->>is_question', 'eq', 'true')
        .filter('metadata->>question_status', 'eq', 'open')
        .is('deleted_at', null),
      supabase
        .from('stories')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'submitted')
        .eq('is_public', false)
        .or('metadata->>is_question.is.null,metadata->>is_question.eq.false')
        .is('deleted_at', null),
    ]),
  ])

  const artRows = (art.data || []) as ArtRow[]
  const questionRows = (openQuestions.data || []) as QuestionRow[]
  const storyRows = (submittedStories.data || []) as StoryRow[]
  const [artCount, questionsCount, storiesCount] = allCounts.map((r) => r.count || 0)

  const totalPending = artCount + questionsCount + storiesCount

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-10">
        <div className="mb-8">
          <Link
            href="/picc"
            className="text-xs uppercase font-bold tracking-widest hover:opacity-80 text-stone-500"
          >
            ← Admin
          </Link>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mt-6 mb-2">
            Internal · Inbox
          </p>
          <h1 className="font-fraunces text-3xl md:text-4xl text-stone-800 italic mb-3">
            Pending submissions
          </h1>
          <p className="text-stone-600 max-w-2xl leading-relaxed">
            Everything waiting for review across the contribution flows. Action each
            type in its dedicated queue, or jump straight into a specific item below.
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-10">
          <SummaryCard
            label="Total pending"
            count={totalPending}
            tint="text-stone-800"
            primary
          />
          <SummaryCard label="Art" count={artCount} icon={ImageIcon} tint="text-picc-ochre" />
          <SummaryCard label="Questions" count={questionsCount} icon={HelpCircle} tint="text-picc-ochre" />
          <SummaryCard label="Stories" count={storiesCount} icon={BookOpen} tint="text-picc-ochre" />
        </div>

        {/* Empty state */}
        {totalPending === 0 && (
          <div className="rounded-md bg-emerald-50 border border-emerald-200 p-8 text-center">
            <p className="font-fraunces text-2xl text-emerald-800 mb-2">Inbox zero.</p>
            <p className="text-sm text-stone-700">
              No submissions waiting. Nice work.
            </p>
          </div>
        )}

        {/* Art section */}
        {artCount > 0 && (
          <Section
            icon={ImageIcon}
            title="Art submissions"
            count={artCount}
            queueHref="/picc/design-system/submissions"
          >
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {artRows.map((a) => (
                <Link
                  key={a.id}
                  href="/picc/design-system/submissions"
                  className="group flex flex-col gap-1"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.public_url}
                    alt={a.title || ''}
                    className="w-full h-32 object-cover rounded-md group-hover:opacity-90"
                    loading="lazy"
                  />
                  <div className="text-xs font-semibold text-stone-700 line-clamp-1">
                    {a.title || 'Untitled'}
                  </div>
                  <div className="text-xs text-stone-500 line-clamp-1">
                    {a.attribution || 'Anonymous'}
                  </div>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* Questions section */}
        {questionsCount > 0 && (
          <Section
            icon={HelpCircle}
            title="Open questions"
            count={questionsCount}
            queueHref="/picc/voices/questions"
          >
            <div className="flex flex-col gap-2">
              {questionRows.map((q) => {
                const askerName = q.metadata?.anonymous
                  ? 'Community member'
                  : q.metadata?.asker_name || 'Community member'
                const topic = q.metadata?.topic as string | undefined
                return (
                  <Link
                    key={q.id}
                    href="/picc/voices/questions"
                    className="block rounded-md bg-white border border-stone-200 p-4 hover:border-picc-ochre/50"
                  >
                    <p className="font-fraunces text-sm text-stone-800 line-clamp-2 leading-snug">
                      {q.content}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                      <span>{askerName}</span>
                      {topic && (
                        <>
                          <span>·</span>
                          <span className="capitalize">{topic}</span>
                        </>
                      )}
                      <span className="ml-auto inline-flex items-center gap-1 text-amber-600">
                        <Clock className="w-3 h-3" />
                        Awaiting answer
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </Section>
        )}

        {/* Stories section */}
        {storiesCount > 0 && (
          <Section
            icon={BookOpen}
            title="Submitted stories"
            count={storiesCount}
            queueHref="/picc/stories?status=submitted"
          >
            <div className="flex flex-col gap-2">
              {storyRows.map((s) => {
                const submissionType = s.metadata?.submission_type as string | undefined
                return (
                  <Link
                    key={s.id}
                    href={`/picc/stories/${s.id}/edit`}
                    className="block rounded-md bg-white border border-stone-200 p-4 hover:border-picc-ochre/50"
                  >
                    <h3 className="font-fraunces text-sm text-stone-800 line-clamp-1 leading-snug">
                      {s.title || 'Untitled story'}
                    </h3>
                    {s.content && (
                      <p className="mt-1 text-xs text-stone-600 line-clamp-2">
                        {s.content}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                      {s.category && <span className="capitalize">{s.category}</span>}
                      {submissionType && (
                        <>
                          <span>·</span>
                          <span>{submissionType}</span>
                        </>
                      )}
                      <span className="ml-auto inline-flex items-center gap-1 text-amber-600">
                        <Clock className="w-3 h-3" />
                        Awaiting review
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </Section>
        )}
      </div>
    </main>
  )
}

function SummaryCard({
  label,
  count,
  icon: Icon,
  tint,
  primary,
}: {
  label: string
  count: number
  icon?: React.ComponentType<{ className?: string }>
  tint: string
  primary?: boolean
}) {
  return (
    <div
      className={`rounded-md border p-4 flex flex-col gap-1 ${
        primary ? 'bg-picc-ochre/5 border-picc-ochre/30' : 'bg-white border-stone-200'
      }`}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`w-4 h-4 ${tint}`} />}
        <span className="text-xs font-bold uppercase tracking-widest text-stone-500">
          {label}
        </span>
      </div>
      <span className={`font-fraunces text-3xl font-bold ${tint}`}>{count}</span>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  count,
  queueHref,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  count: number
  queueHref: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-picc-ochre" />
          <h2 className="font-fraunces text-xl text-stone-800">
            {title} <span className="text-stone-400 font-normal text-base">· {count}</span>
          </h2>
        </div>
        <Link
          href={queueHref}
          className="text-xs font-bold uppercase tracking-widest text-picc-ochre hover:underline inline-flex items-center gap-1"
        >
          Open queue <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      {children}
    </section>
  )
}
