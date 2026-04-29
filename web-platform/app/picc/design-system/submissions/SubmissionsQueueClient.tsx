'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Archive, Clock, AlertCircle, ExternalLink } from 'lucide-react'
import type { ArtSubmission } from './page'

type Filter = 'pending' | 'approved' | 'all'

interface Props {
  submissions: ArtSubmission[]
  loadError: string | null
}

export default function SubmissionsQueueClient({ submissions: initial, loadError }: Props) {
  const [submissions, setSubmissions] = useState(initial)
  const [filter, setFilter] = useState<Filter>('pending')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const visible = submissions.filter((s) => {
    if (filter === 'all') return true
    if (filter === 'pending') return !s.is_public
    return s.is_public
  })

  const counts = {
    pending: submissions.filter((s) => !s.is_public).length,
    approved: submissions.filter((s) => s.is_public).length,
    all: submissions.length,
  }

  async function approve(id: string) {
    setBusyId(id)
    setActionError(null)
    try {
      const supabase = createClient()
      const target = submissions.find((s) => s.id === id)
      const newTags = Array.from(new Set([...(target?.tags || []), 'approved']))
      const { error } = await supabase
        .from('media_files')
        .update({ is_public: true, tags: newTags })
        .eq('id', id)
      if (error) throw error
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_public: true, tags: newTags } : s)),
      )
    } catch (err: any) {
      setActionError(err?.message || 'Failed to approve.')
    } finally {
      setBusyId(null)
    }
  }

  async function archive(id: string) {
    setBusyId(id)
    setActionError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('media_files')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      setSubmissions((prev) => prev.filter((s) => s.id !== id))
    } catch (err: any) {
      setActionError(err?.message || 'Failed to archive.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-10">
        <div className="mb-8">
          <Link
            href="/picc/design-system"
            className="text-xs uppercase font-bold tracking-widest hover:opacity-80 text-stone-500"
          >
            ← Design system
          </Link>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mt-6 mb-2">
            Internal · Submissions
          </p>
          <h1 className="font-fraunces text-3xl md:text-4xl text-stone-800 italic mb-3">
            Art submissions queue
          </h1>
          <p className="text-stone-600 max-w-2xl leading-relaxed">
            Community artwork submitted via{' '}
            <Link href="/share-art" className="text-picc-ochre hover:underline">
              /share-art
            </Link>
            . Approve a piece to make it public and eligible for curation. Archive
            anything that shouldn&apos;t be in the system.
          </p>
        </div>

        {loadError && (
          <div className="mb-4 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
            <AlertCircle className="w-4 h-4" />
            {loadError}
          </div>
        )}
        {actionError && (
          <div className="mb-4 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
            <AlertCircle className="w-4 h-4" />
            {actionError}
          </div>
        )}

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-2 mb-6 text-sm">
          {(['pending', 'approved', 'all'] as Filter[]).map((f) => (
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

        {/* Grid */}
        {visible.length === 0 ? (
          <div className="rounded-md bg-amber-50 border border-amber-200 p-6 text-sm text-stone-700">
            No {filter === 'all' ? '' : filter} submissions.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((s) => {
              const artType = s.metadata?.art_type as string | undefined
              const relatedTo = s.metadata?.related_to as string | undefined
              const submittedAt = new Date(s.created_at)
              return (
                <article key={s.id} className="bg-white rounded-md border border-stone-200 overflow-hidden flex flex-col">
                  <div className="relative bg-stone-100" style={{ aspectRatio: '1 / 1' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.public_url}
                      alt={s.title || 'submission'}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2">
                      {s.is_public ? (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-emerald-600 text-white">
                          ✓ approved
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-amber-500 text-white">
                          <Clock className="w-3 h-3 inline mr-1" />
                          pending
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-grow">
                    <h3 className="font-fraunces text-lg text-stone-800 leading-tight">
                      {s.title || 'Untitled'}
                    </h3>
                    {s.caption && (
                      <p className="text-sm text-stone-600 leading-relaxed line-clamp-3">
                        {s.caption}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs text-stone-500">
                      <span>{s.attribution || 'Anonymous'}</span>
                      {artType && <span>· {artType}</span>}
                      {relatedTo && (
                        <span className="font-mono text-picc-ochre">· related:{relatedTo}</span>
                      )}
                    </div>
                    <div className="text-xs text-stone-400 mt-auto pt-2">
                      Submitted {submittedAt.toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {!s.is_public && (
                        <button
                          onClick={() => approve(s.id)}
                          disabled={busyId === s.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest bg-emerald-600 text-white hover:opacity-90 disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => archive(s.id)}
                        disabled={busyId === s.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest bg-stone-200 text-stone-700 hover:bg-stone-300 disabled:opacity-50"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        Archive
                      </button>
                      <a
                        href={s.public_url}
                        target="_blank"
                        rel="noopener"
                        className="ml-auto text-xs text-picc-ochre hover:underline flex items-center gap-1"
                      >
                        Open <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
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
