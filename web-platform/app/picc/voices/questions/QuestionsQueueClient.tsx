'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Archive, Clock, AlertCircle, Edit3, Send } from 'lucide-react'
import type { CommunityQuestion } from './page'

type Filter = 'open' | 'answered' | 'all'

interface Props {
  questions: CommunityQuestion[]
  loadError: string | null
}

export default function QuestionsQueueClient({ questions: initial, loadError }: Props) {
  const [questions, setQuestions] = useState(initial)
  const [filter, setFilter] = useState<Filter>('open')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const isAnswered = (q: CommunityQuestion) =>
    q.metadata?.question_status === 'answered' && q.is_public

  const visible = questions.filter((q) => {
    if (filter === 'all') return true
    if (filter === 'open') return !isAnswered(q)
    return isAnswered(q)
  })

  const counts = {
    open: questions.filter((q) => !isAnswered(q)).length,
    answered: questions.filter(isAnswered).length,
    all: questions.length,
  }

  function startEditing(q: CommunityQuestion) {
    setEditingId(q.id)
    setDraft((q.metadata?.answer as string) || '')
    setActionError(null)
  }

  function cancelEditing() {
    setEditingId(null)
    setDraft('')
  }

  async function publishAnswer(id: string) {
    if (!draft.trim() || draft.trim().length < 5) {
      setActionError('Answer too short — write a proper response.')
      return
    }
    setBusyId(id)
    setActionError(null)
    try {
      const supabase = createClient()
      const target = questions.find((q) => q.id === id)
      const newMetadata = {
        ...(target?.metadata || {}),
        answer: draft.trim(),
        question_status: 'answered',
        answered_at: new Date().toISOString(),
      }
      const { error } = await supabase
        .from('stories')
        .update({
          is_public: true,
          metadata: newMetadata,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
      if (error) throw error
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === id ? { ...q, is_public: true, metadata: newMetadata, updated_at: new Date().toISOString() } : q,
        ),
      )
      setEditingId(null)
      setDraft('')
    } catch (err: any) {
      setActionError(err?.message || 'Failed to publish answer.')
    } finally {
      setBusyId(null)
    }
  }

  async function archive(id: string) {
    if (!confirm('Archive this question? It will be hidden from both admin and public surfaces.')) return
    setBusyId(id)
    setActionError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('stories')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      setQuestions((prev) => prev.filter((q) => q.id !== id))
    } catch (err: any) {
      setActionError(err?.message || 'Failed to archive.')
    } finally {
      setBusyId(null)
    }
  }

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
            Internal · Questions queue
          </p>
          <h1 className="font-fraunces text-3xl md:text-4xl text-stone-800 italic mb-3">
            Community questions
          </h1>
          <p className="text-stone-600 max-w-2xl leading-relaxed">
            Questions submitted via{' '}
            <Link href="/voices/ask" className="text-picc-ochre hover:underline">
              /voices/ask
            </Link>
            . Write a public answer to publish; the Q&amp;A appears on{' '}
            <Link href="/voices/questions" className="text-picc-ochre hover:underline">
              /voices/questions
            </Link>{' '}
            once published.
          </p>
        </div>

        {loadError && (
          <ErrorBanner>{loadError}</ErrorBanner>
        )}
        {actionError && (
          <ErrorBanner>{actionError}</ErrorBanner>
        )}

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-2 mb-6 text-sm">
          {(['open', 'answered', 'all'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full border capitalize transition-colors ${
                filter === f
                  ? 'bg-picc-ochre text-white border-picc-ochre'
                  : 'bg-white text-stone-600 border-stone-300 hover:border-picc-ochre'
              }`}
            >
              {f} <span className="opacity-60">· {counts[f]}</span>
            </button>
          ))}
        </div>

        {/* List */}
        {visible.length === 0 ? (
          <div className="rounded-md bg-amber-50 border border-amber-200 p-6 text-sm text-stone-700">
            No {filter === 'all' ? '' : filter} questions.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {visible.map((q) => {
              const askerName = q.metadata?.anonymous
                ? 'Community member'
                : q.metadata?.asker_name || 'Community member'
              const topic = q.metadata?.topic as string | undefined
              const answer = (q.metadata?.answer as string | undefined) || ''
              const askedAt = new Date(q.created_at)
              const answered = isAnswered(q)
              const editing = editingId === q.id

              return (
                <article key={q.id} className="bg-white border border-stone-200 rounded-md overflow-hidden">
                  {/* Question */}
                  <div className="p-5 md:p-6">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        {answered ? (
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-emerald-600 text-white">
                            ✓ answered
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-amber-500 text-white inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            open
                          </span>
                        )}
                        {topic && (
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-stone-100 text-stone-700 capitalize">
                            {topic}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-400 whitespace-nowrap">
                        {askedAt.toLocaleDateString()}
                      </div>
                    </div>
                    <p className="font-fraunces text-lg leading-snug text-stone-800">
                      {q.content}
                    </p>
                    <div className="mt-2 text-xs text-stone-500">
                      {askerName}
                    </div>
                  </div>

                  {/* Answer panel */}
                  <div className="bg-stone-50 border-t border-stone-200 p-5 md:p-6">
                    {editing ? (
                      <div className="flex flex-col gap-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-500">
                          Public answer
                        </label>
                        <textarea
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          rows={6}
                          placeholder="Write the public answer in PICC's voice."
                          className="w-full border border-stone-300 rounded px-3 py-2 bg-white text-sm"
                          autoFocus
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => publishAnswer(q.id)}
                            disabled={busyId === q.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest bg-emerald-600 text-white hover:opacity-90 disabled:opacity-50"
                          >
                            <Send className="w-3.5 h-3.5" />
                            {answered ? 'Update answer' : 'Publish answer'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest bg-stone-200 text-stone-700 hover:bg-stone-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : answer ? (
                      <div>
                        <div className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-2">
                          PICC team answer
                        </div>
                        <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
                          {answer}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => startEditing(q)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest bg-white border border-stone-300 text-stone-700 hover:bg-stone-100"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => archive(q.id)}
                            disabled={busyId === q.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 disabled:opacity-50 ml-auto"
                          >
                            <Archive className="w-3.5 h-3.5" />
                            Archive
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <p className="text-sm text-stone-500 flex-1">
                          No answer yet. Write one to publish this question.
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditing(q)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest bg-picc-ochre text-white hover:opacity-90"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Compose answer
                          </button>
                          <button
                            onClick={() => archive(q.id)}
                            disabled={busyId === q.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 disabled:opacity-50"
                          >
                            <Archive className="w-3.5 h-3.5" />
                            Archive
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

function ErrorBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
      <AlertCircle className="w-4 h-4" />
      {children}
    </div>
  )
}
