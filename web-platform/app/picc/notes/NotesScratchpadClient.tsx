'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { StickyNote, Send, Trash2, AlertCircle, User as UserIcon, Tag as TagIcon } from 'lucide-react'
import type { AdminNote } from './page'

interface Props {
  initialNotes: AdminNote[]
  loadError: string | null
}

export default function NotesScratchpadClient({ initialNotes, loadError }: Props) {
  const [notes, setNotes] = useState(initialNotes)
  const [draft, setDraft] = useState('')
  const [author, setAuthor] = useState('')
  const [tags, setTags] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('')

  const visible = notes.filter((n) => {
    if (!filter.trim()) return true
    const q = filter.toLowerCase()
    if ((n.content || '').toLowerCase().includes(q)) return true
    const noteAuthor = (n.metadata?.author as string | undefined)?.toLowerCase() || ''
    if (noteAuthor.includes(q)) return true
    const noteTags = (n.metadata?.tags as string[] | undefined) || []
    if (noteTags.some((t) => t.toLowerCase().includes(q))) return true
    return false
  })

  async function addNote(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const trimmed = draft.trim()
    if (trimmed.length < 3) {
      setError('Type at least a few words.')
      return
    }
    setBusy(true)
    try {
      const supabase = createClient()
      const tagList = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      const titleSnippet = trimmed.slice(0, 60) + (trimmed.length > 60 ? '…' : '')
      const metadata = {
        is_admin_note: true,
        author: author.trim() || null,
        tags: tagList,
      }
      const { data, error: insertError } = await supabase
        .from('stories')
        .insert([
          {
            title: titleSnippet,
            content: trimmed,
            story_type: 'community_story',
            category: 'admin-note',
            status: 'draft',
            access_level: 'restricted',
            is_public: false,
            metadata,
          },
        ])
        .select('id, content, metadata, created_at')
        .single()
      if (insertError) throw insertError
      setNotes((prev) => [data as AdminNote, ...prev])
      setDraft('')
      setTags('')
    } catch (err: any) {
      setError(err?.message || 'Failed to save note.')
    } finally {
      setBusy(false)
    }
  }

  async function deleteNote(id: string) {
    if (!confirm('Delete this note? Soft-deletes (recoverable in DB).')) return
    setError(null)
    try {
      const supabase = createClient()
      const { error: delError } = await supabase
        .from('stories')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
      if (delError) throw delError
      setNotes((prev) => prev.filter((n) => n.id !== id))
    } catch (err: any) {
      setError(err?.message || 'Failed to delete.')
    }
  }

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-10">
        <div className="mb-8">
          <Link
            href="/picc"
            className="text-xs uppercase font-bold tracking-widest hover:opacity-80 text-stone-500"
          >
            ← Admin
          </Link>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mt-6 mb-2">
            Internal · Scratchpad
          </p>
          <div className="flex items-center gap-3 mb-3">
            <StickyNote className="w-7 h-7 text-stone-700" />
            <h1 className="font-fraunces text-3xl md:text-4xl text-stone-800 italic">
              Notes
            </h1>
          </div>
          <p className="text-stone-600 max-w-2xl leading-relaxed">
            Quick observations, field notes, things to follow up on. Staff-only —
            never published. For public reflections from the community, see{' '}
            <Link href="/share-note" className="text-picc-ochre hover:underline">
              /share-note
            </Link>
            .
          </p>
        </div>

        {/* Composer */}
        <form
          onSubmit={addNote}
          className="bg-white border border-stone-200 rounded-lg p-4 mb-6 flex flex-col gap-3"
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="What did you notice today?"
            rows={4}
            className="w-full border border-stone-300 rounded px-3 py-2 bg-white text-sm"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author (optional)"
                className="w-full pl-9 pr-3 py-2 rounded border border-stone-300 bg-white text-sm"
                maxLength={80}
              />
            </div>
            <div className="relative">
              <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Tags, comma-separated (optional)"
                className="w-full pl-9 pr-3 py-2 rounded border border-stone-300 bg-white text-sm"
                maxLength={120}
              />
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={busy}
              className="bg-picc-ochre text-white px-4 py-2 rounded font-bold uppercase tracking-widest text-xs hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              {busy ? 'Saving…' : 'Save note'}
            </button>
          </div>
        </form>

        {/* Filter + count */}
        <div className="flex items-center justify-between mb-4 gap-3">
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search content / author / tag…"
            className="flex-1 max-w-xs px-3 py-1.5 rounded border border-stone-300 bg-white text-sm"
          />
          <div className="text-xs text-stone-500">
            {filter ? `${visible.length} of ${notes.length}` : `${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`}
          </div>
        </div>

        {loadError && (
          <div className="mb-4 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
            <AlertCircle className="w-4 h-4" />
            {loadError}
          </div>
        )}

        {/* List */}
        {visible.length === 0 ? (
          <div className="rounded-md bg-amber-50 border border-amber-200 p-6 text-sm text-stone-700">
            {notes.length === 0
              ? 'No notes yet. Add the first one above.'
              : `No notes match "${filter}".`}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map((n) => {
              const author = n.metadata?.author as string | undefined
              const noteTags = (n.metadata?.tags as string[] | undefined) || []
              const created = new Date(n.created_at)
              return (
                <article
                  key={n.id}
                  className="bg-white border border-stone-200 rounded-md p-4"
                >
                  <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-wrap">
                    {n.content}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                    {author && <span className="font-semibold">{author}</span>}
                    <span>{created.toLocaleDateString()} · {created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {noteTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {noteTags.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => deleteNote(n.id)}
                      className="ml-auto text-stone-400 hover:text-red-600 inline-flex items-center gap-1"
                      aria-label="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
