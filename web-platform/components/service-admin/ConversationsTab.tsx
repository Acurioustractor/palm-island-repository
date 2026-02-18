'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Loader2, MessageSquare, Pin, PinOff, Send, Trash2, Users
} from 'lucide-react'
import type { ServiceData } from './ServiceAdminDetail'

type Note = {
  id: string
  service_id: string
  note_type: string
  content: string
  author_name: string | null
  pinned: boolean
  tags: string[] | null
  created_at: string
  updated_at: string
}

type TeamMember = {
  id: string
  full_name: string | null
  community_role: string | null
  avatar_url: string | null
  role: string | null
  title: string | null
}

type Props = {
  service: ServiceData
}

const NOTE_TYPES = [
  { value: 'conversation', label: 'Conversation', icon: '💬' },
  { value: 'update', label: 'Update', icon: '📝' },
  { value: 'feedback', label: 'Feedback', icon: '💡' },
  { value: 'meeting', label: 'Meeting', icon: '🤝' },
  { value: 'idea', label: 'Idea', icon: '✨' },
  { value: 'refinement', label: 'Refinement', icon: '🔧' },
]

const NOTE_TYPE_STYLES: Record<string, string> = {
  conversation: 'bg-blue-100 text-blue-700',
  update: 'bg-gray-100 text-gray-700',
  feedback: 'bg-yellow-100 text-yellow-700',
  meeting: 'bg-purple-100 text-purple-700',
  idea: 'bg-emerald-100 text-emerald-700',
  refinement: 'bg-orange-100 text-orange-700',
}

function getInitials(name: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function ConversationsTab({ service }: Props) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('')

  // Team members for author selection
  const [team, setTeam] = useState<TeamMember[]>([])
  const [teamLoading, setTeamLoading] = useState(true)

  // New note
  const [newContent, setNewContent] = useState('')
  const [newType, setNewType] = useState('update')
  const [newAuthor, setNewAuthor] = useState('')
  const [authorMode, setAuthorMode] = useState<'profile' | 'custom'>('profile')
  const [saving, setSaving] = useState(false)

  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  const loadTeam = useCallback(async () => {
    setTeamLoading(true)
    try {
      const res = await fetch(`/api/services/${service.id}/team`)
      if (res.ok) {
        const data = await res.json()
        setTeam(data.team || [])
      }
    } catch { /* ignore */ }
    setTeamLoading(false)
  }, [service.id])

  const loadNotes = useCallback(async () => {
    setLoading(true)
    try {
      const typeParam = filterType ? `&type=${filterType}` : ''
      const res = await fetch(`/api/services/${service.id}/notes?${typeParam}`)
      if (res.ok) {
        const data = await res.json()
        setNotes(data.notes || [])
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [service.id, filterType])

  useEffect(() => {
    loadTeam()
    loadNotes()
  }, [loadTeam, loadNotes])

  const handleSubmit = async () => {
    if (!newContent.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/services/${service.id}/notes`, {
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
    } catch { /* ignore */ }
    setSaving(false)
  }

  const handleTogglePin = async (note: Note) => {
    setToggling(note.id)
    try {
      const res = await fetch(`/api/services/${service.id}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_id: note.id, pinned: !note.pinned }),
      })
      if (res.ok) {
        setNotes(prev => prev.map(n =>
          n.id === note.id ? { ...n, pinned: !n.pinned } : n
        ))
      }
    } catch { /* ignore */ }
    setToggling(null)
  }

  const handleDelete = async (noteId: string) => {
    if (!confirm('Delete this note?')) return
    setDeleting(noteId)
    try {
      const res = await fetch(`/api/services/${service.id}/notes?noteId=${noteId}`, { method: 'DELETE' })
      if (res.ok) {
        setNotes(prev => prev.filter(n => n.id !== noteId))
      }
    } catch { /* ignore */ }
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
      {/* People linked to this service */}
      {!teamLoading && team.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-gray-400" />
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Service Team</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {team.map(member => (
              <div
                key={member.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-full"
              >
                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="text-[9px] font-medium text-gray-500">{getInitials(member.full_name)}</span>
                  )}
                </div>
                <span className="text-xs text-gray-700 font-medium">{member.full_name}</span>
                {member.role && (
                  <span className="text-[10px] text-gray-400">{member.role.replace(/_/g, ' ')}</span>
                )}
              </div>
            ))}
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

          {/* Author: profile dropdown or custom text */}
          {team.length > 0 && authorMode === 'profile' ? (
            <div className="flex items-center gap-1">
              <select
                value={newAuthor}
                onChange={e => setNewAuthor(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white w-44"
              >
                <option value="">Select person...</option>
                {team.map(m => (
                  <option key={m.id} value={m.full_name || ''}>{m.full_name}</option>
                ))}
              </select>
              <button
                onClick={() => { setAuthorMode('custom'); setNewAuthor('') }}
                className="px-2 py-2 text-xs text-gray-400 hover:text-gray-600 whitespace-nowrap"
                title="Type a custom name instead"
              >
                Other
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <input
                value={newAuthor}
                onChange={e => setNewAuthor(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-shrink-0 w-40"
                placeholder="Your name"
              />
              {team.length > 0 && (
                <button
                  onClick={() => { setAuthorMode('profile'); setNewAuthor('') }}
                  className="px-2 py-2 text-xs text-gray-400 hover:text-gray-600 whitespace-nowrap"
                  title="Select from team members"
                >
                  Team
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            rows={3}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none resize-none"
            placeholder="Write a note..."
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
