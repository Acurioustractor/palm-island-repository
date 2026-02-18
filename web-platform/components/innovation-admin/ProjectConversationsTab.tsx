'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Loader2, MessageSquare, Pin, PinOff, Send, Trash2, Flag
} from 'lucide-react'
import type { ProjectData } from './InnovationAdminDetail'

type Note = {
  id: string
  project_id: string
  note_type: string
  content: string
  author_name: string | null
  pinned: boolean
  tags: string[] | null
  created_at: string
  updated_at: string
}

type Props = {
  project: ProjectData
}

const NOTE_TYPES = [
  { value: 'conversation', label: 'Conversation', icon: '\u{1F4AC}' },
  { value: 'update', label: 'Update', icon: '\u{1F4DD}' },
  { value: 'feedback', label: 'Feedback', icon: '\u{1F4A1}' },
  { value: 'meeting', label: 'Meeting', icon: '\u{1F91D}' },
  { value: 'idea', label: 'Idea', icon: '\u{2728}' },
  { value: 'refinement', label: 'Refinement', icon: '\u{1F527}' },
  { value: 'milestone', label: 'Milestone', icon: '\u{1F3C1}' },
]

const NOTE_TYPE_STYLES: Record<string, string> = {
  conversation: 'bg-blue-100 text-blue-700',
  update: 'bg-gray-100 text-gray-700',
  feedback: 'bg-yellow-100 text-yellow-700',
  meeting: 'bg-purple-100 text-purple-700',
  idea: 'bg-emerald-100 text-emerald-700',
  refinement: 'bg-orange-100 text-orange-700',
  milestone: 'bg-rose-100 text-rose-700',
}

export default function ProjectConversationsTab({ project }: Props) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('')

  const [newContent, setNewContent] = useState('')
  const [newType, setNewType] = useState('update')
  const [newAuthor, setNewAuthor] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  const loadNotes = useCallback(async () => {
    setLoading(true)
    try {
      const typeParam = filterType ? `&type=${filterType}` : ''
      const res = await fetch(`/api/projects/${project.id}/notes?${typeParam}`)
      if (res.ok) {
        const data = await res.json()
        setNotes(data.notes || [])
      }
    } catch {}
    setLoading(false)
  }, [project.id, filterType])

  useEffect(() => { loadNotes() }, [loadNotes])

  // Extract milestones for journey timeline
  const milestones = notes
    .filter(n => n.note_type === 'milestone')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  const handleSubmit = async () => {
    if (!newContent.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/projects/${project.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note_type: newType,
          content: newContent.trim(),
          author_name: newAuthor.trim() || null,
        }),
      })
      if (res.ok) {
        setNewContent('')
        loadNotes()
      }
    } catch {}
    setSaving(false)
  }

  const handleTogglePin = async (note: Note) => {
    setToggling(note.id)
    try {
      const res = await fetch(`/api/projects/${project.id}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_id: note.id, pinned: !note.pinned }),
      })
      if (res.ok) {
        setNotes(prev => prev.map(n =>
          n.id === note.id ? { ...n, pinned: !n.pinned } : n
        ))
      }
    } catch {}
    setToggling(null)
  }

  const handleDelete = async (noteId: string) => {
    if (!confirm('Delete this note?')) return
    setDeleting(noteId)
    try {
      const res = await fetch(`/api/projects/${project.id}/notes?noteId=${noteId}`, { method: 'DELETE' })
      if (res.ok) {
        setNotes(prev => prev.filter(n => n.id !== noteId))
      }
    } catch {}
    setDeleting(null)
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    if (diffHours < 1) return `${Math.round(diffMs / 60000)}m ago`
    if (diffHours < 24) return `${Math.round(diffHours)}h ago`
    const diffDays = Math.round(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      {/* Journey Timeline */}
      {milestones.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Flag className="w-4 h-4" />
            Project Journey
          </h2>
          <div className="relative">
            {/* Horizontal line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200" />
            <div className="flex gap-4 overflow-x-auto pb-2">
              {milestones.map((m, i) => {
                const title = m.content.split('\n')[0].slice(0, 60)
                return (
                  <div key={m.id} className="relative flex-shrink-0 min-w-[140px] max-w-[200px]">
                    {/* Dot */}
                    <div className="w-8 h-8 rounded-full bg-picc-red text-white flex items-center justify-center text-xs font-bold relative z-10 mx-auto">
                      {i + 1}
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-xs font-medium text-gray-800 line-clamp-2">{title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(m.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quick Note Entry */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Add Note</h2>

        <div className="flex items-center gap-2 mb-3">
          <select
            value={newType}
            onChange={e => setNewType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            {NOTE_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
            ))}
          </select>
          <input
            value={newAuthor}
            onChange={e => setNewAuthor(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-shrink-0 w-40"
            placeholder="Your name"
          />
        </div>

        <div className="flex gap-2">
          <textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            rows={3}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none resize-none"
            placeholder={newType === 'milestone' ? 'Milestone title on first line, details below...' : 'Write a note...'}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={saving || !newContent.trim()}
            className="self-end px-4 py-2 text-sm text-white bg-picc-red rounded-lg hover:bg-picc-red/90 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-1">Cmd+Enter to submit</div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterType('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            filterType === '' ? 'bg-picc-red text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {NOTE_TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => setFilterType(filterType === t.value ? '' : t.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filterType === t.value ? 'bg-picc-red text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Notes List */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No notes yet. Add one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map(note => (
              <div
                key={note.id}
                className={`p-4 rounded-xl border transition-colors ${
                  note.pinned
                    ? 'border-picc-red/30 bg-picc-red/5'
                    : note.note_type === 'milestone'
                      ? 'border-rose-200 bg-rose-50/50'
                      : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${NOTE_TYPE_STYLES[note.note_type] || 'bg-gray-100 text-gray-600'}`}>
                        {NOTE_TYPES.find(t => t.value === note.note_type)?.icon} {note.note_type}
                      </span>
                      {note.author_name && (
                        <span className="text-xs text-gray-500">{note.author_name}</span>
                      )}
                      <span className="text-xs text-gray-400">{formatDate(note.created_at)}</span>
                      {note.pinned && (
                        <Pin className="w-3 h-3 text-picc-red flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleTogglePin(note)}
                      disabled={toggling === note.id}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                      title={note.pinned ? 'Unpin' : 'Pin'}
                    >
                      {toggling === note.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : note.pinned ? (
                        <PinOff className="w-3.5 h-3.5" />
                      ) : (
                        <Pin className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      disabled={deleting === note.id}
                      className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      {deleting === note.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
