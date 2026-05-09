'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Goal {
  id: string
  goal_key: string
  category: string
  label: string
  current_value: number | null
  target_value: number | null
  target_year: number | null
  unit: string | null
  display_order: number
  is_public: boolean
  notes: string | null
}

interface InnovationProject {
  id: string
  slug: string
  name: string
  category: string | null
  status: string
  people_impacted: number | null
  jobs_created: number | null
  hero_image_url: string | null
  description: string | null
}

// Matches actual community_visions schema:
//   id, vision_text, author_name, author_role, category, is_approved, created_at
// (Earlier interface added is_anonymous/session_id/source — those columns
// don't exist; the page rendered nothing because of the schema drift +
// a status=pending filter that never matched auto-approved submissions.)
interface CommunityVision {
  id: string
  vision_text: string
  category: string
  author_name: string | null
  author_role: string | null
  is_approved: boolean
  created_at: string
}

type VisionTab = 'approved' | 'pending'

const CATEGORY_COLOURS: Record<string, string> = {
  youth: '#0EA5E9',
  health: '#16A34A',
  culture: '#C8963E',
  economic: '#F59E0B',
  community: '#8B5CF6',
  education: '#0B4F6C',
  governance: '#8B1A1A',
}

export default function VisionBoardPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [visions, setVisions] = useState<CommunityVision[]>([])
  const [innovations, setInnovations] = useState<InnovationProject[]>([])
  const [loading, setLoading] = useState(true)
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<Goal>>({})
  const [tab, setTab] = useState<VisionTab>('approved')
  const [counts, setCounts] = useState<{ approved: number; pending: number }>({ approved: 0, pending: 0 })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [goalsRes, approvedRes, pendingRes, innovationsRes] = await Promise.all([
        fetch('/api/goals'),
        fetch('/api/community-visions?status=approved'),
        fetch('/api/community-visions?status=pending'),
        fetch('/api/innovation-projects'),
      ])
      if (goalsRes.ok) setGoals(await goalsRes.json())
      if (innovationsRes.ok) {
        const innovData = await innovationsRes.json()
        setInnovations(Array.isArray(innovData) ? innovData : [])
      }

      const parse = async (r: Response) => {
        if (!r.ok) return [] as CommunityVision[]
        const j = await r.json()
        return Array.isArray(j) ? (j as CommunityVision[]) : ((j.visions || []) as CommunityVision[])
      }
      const approved = await parse(approvedRes)
      const pending = await parse(pendingRes)
      setCounts({ approved: approved.length, pending: pending.length })
      setVisions(tab === 'approved' ? approved : pending)
    } catch (err) {
      console.error('Failed to fetch vision board data:', err)
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => { fetchData() }, [fetchData])

  const startEditing = (goal: Goal) => {
    setEditingGoal(goal.id)
    setEditValues({ current_value: goal.current_value, target_value: goal.target_value, notes: goal.notes })
  }

  const saveGoal = async (goalId: string) => {
    try {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues),
      })
      if (res.ok) {
        const updated = await res.json()
        setGoals(prev => prev.map(g => g.id === goalId ? updated : g))
        setEditingGoal(null)
      }
    } catch (err) {
      console.error('Failed to save goal:', err)
    }
  }

  const handleVision = async (visionId: string, action: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/community-visions/${visionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action, is_public: action === 'approved' }),
      })
      if (res.ok) {
        setVisions(prev => prev.filter(v => v.id !== visionId))
        // Refresh counts
        fetchData()
      }
    } catch (err) {
      console.error('Failed to update vision:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vision Board</h1>
            <p className="text-gray-500 mt-1">DIRECTION — Track aspirations with real evidence</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/sign-the-vision" target="_blank" className="text-blue-600 hover:underline">
              View public canvas →
            </Link>
            <Link href="/picc" className="text-blue-600 hover:underline">
              Back to Admin
            </Link>
          </div>
        </div>

        {/* Section 1: Community Visions */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <h2 className="text-xl font-semibold text-gray-900">
              Community Visions
              <span className="ml-2 text-sm font-normal text-gray-500">
                {counts.approved} on canvas · {counts.pending} pending review
              </span>
            </h2>
            {/* Tab toggle */}
            <div className="inline-flex rounded-lg bg-white border border-gray-200 overflow-hidden text-sm">
              <button
                type="button"
                onClick={() => setTab('approved')}
                className={`px-4 py-2 transition ${
                  tab === 'approved' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Approved ({counts.approved})
              </button>
              <button
                type="button"
                onClick={() => setTab('pending')}
                className={`px-4 py-2 transition border-l border-gray-200 ${
                  tab === 'pending' ? 'bg-amber-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Pending ({counts.pending})
              </button>
            </div>
          </div>

          {visions.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
              {tab === 'pending'
                ? 'No pending visions to review. Submissions to /sign-the-vision are auto-approved on submit.'
                : 'No approved visions yet. Add one via /sign-the-vision.'}
            </div>
          ) : (
            <div className="space-y-3">
              {visions.map((vision) => {
                const colour = CATEGORY_COLOURS[vision.category] || '#6B7280'
                return (
                  <div
                    key={vision.id}
                    className="bg-white rounded-lg border p-4"
                    style={{ borderColor: colour + '33', borderLeftWidth: 4, borderLeftColor: colour }}
                  >
                    <p className="text-gray-800 mb-3 leading-relaxed">&ldquo;{vision.vision_text}&rdquo;</p>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        <span
                          className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded"
                          style={{ backgroundColor: colour + '22', color: colour, letterSpacing: '0.15em' }}
                        >
                          {vision.category || 'general'}
                        </span>
                        <span className="text-gray-700 font-medium">
                          {vision.author_name || 'Anonymous'}
                        </span>
                        {vision.author_role && (
                          <span className="text-gray-500">· {vision.author_role}</span>
                        )}
                        <span className="text-gray-400 text-xs">
                          · {new Date(vision.created_at).toLocaleDateString('en-AU', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {tab === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleVision(vision.id, 'approved')}
                              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleVision(vision.id, 'rejected')}
                              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="px-3 py-1 text-xs uppercase font-bold tracking-widest text-green-700 bg-green-50 rounded">
                            ✓ on canvas
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Section 2: Organization Goals */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Organization Goals (2029 Targets)</h2>

          {goals.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
              No goals set yet. Goals connect strategic targets to live data.
            </div>
          ) : (
            <div className="grid gap-4">
              {goals.map(goal => {
                const isEditing = editingGoal === goal.id
                const current = goal.current_value || 0
                const target = goal.target_value || 1
                const pct = Math.min(Math.round((current / target) * 100), 100)

                return (
                  <div key={goal.id} className="bg-white rounded-lg border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{goal.label}</h3>
                        <span className="text-xs text-gray-400 uppercase tracking-wider">{goal.category}</span>
                      </div>
                      {!isEditing ? (
                        <button
                          onClick={() => startEditing(goal)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveGoal(goal.id)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingGoal(null)}
                            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Current</label>
                          <input
                            type="number"
                            value={editValues.current_value ?? ''}
                            onChange={e => setEditValues(prev => ({ ...prev, current_value: Number(e.target.value) }))}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Target</label>
                          <input
                            type="number"
                            value={editValues.target_value ?? ''}
                            onChange={e => setEditValues(prev => ({ ...prev, target_value: Number(e.target.value) }))}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Notes</label>
                          <input
                            type="text"
                            value={editValues.notes ?? ''}
                            onChange={e => setEditValues(prev => ({ ...prev, notes: e.target.value }))}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-2xl font-bold text-blue-700">
                          {goal.unit === '$' ? `$${(current / 1_000_000).toFixed(1)}M` : current}
                        </span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-500">
                          {goal.unit === '$' ? `$${((target) / 1_000_000).toFixed(0)}M` : target} {goal.unit !== '$' ? goal.unit : ''}
                          {goal.target_year ? ` by ${goal.target_year}` : ''}
                        </span>
                      </div>
                    )}

                    {/* Progress bar */}
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 mt-1 block">{pct}% toward target</span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Section 3: Innovation Project Links */}
        <section>
          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <h2 className="text-xl font-semibold text-gray-900">
              Innovation Project Links
              <span className="ml-2 text-sm font-normal text-gray-500">
                {innovations.length} {innovations.length === 1 ? 'project' : 'projects'} connected
              </span>
            </h2>
            <Link href="/picc/innovation" className="text-sm text-blue-600 hover:underline">
              Innovation admin →
            </Link>
          </div>

          {innovations.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
              No innovation projects yet. Add via{' '}
              <Link href="/picc/innovation" className="text-blue-600 hover:underline">
                Innovation admin
              </Link>.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {innovations.map((p) => {
                const statusColour =
                  p.status === 'active' ? '#16A34A' :
                  p.status === 'planning' ? '#F59E0B' :
                  p.status === 'completed' ? '#0B4F6C' :
                  '#6B7280'
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden flex"
                  >
                    {p.hero_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.hero_image_url}
                        alt={p.name}
                        className="w-24 h-24 object-cover flex-shrink-0"
                      />
                    ) : (
                      <div
                        className="w-24 h-24 flex-shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: statusColour + '15' }}
                      >
                        <span
                          className="text-2xl font-bold"
                          style={{ color: statusColour }}
                        >
                          {p.name
                            .split(/\s+/)
                            .map((w) => w[0])
                            .filter(Boolean)
                            .slice(0, 2)
                            .join('')}
                        </span>
                      </div>
                    )}
                    <div className="p-4 flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded"
                          style={{ backgroundColor: statusColour + '22', color: statusColour, letterSpacing: '0.15em' }}
                        >
                          {p.status}
                        </span>
                        {p.category && (
                          <span className="text-[10px] uppercase tracking-widest text-gray-400">
                            {p.category}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 leading-tight truncate" title={p.name}>
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        {p.people_impacted != null && p.people_impacted > 0 && (
                          <span>👥 {p.people_impacted.toLocaleString()}</span>
                        )}
                        {p.jobs_created != null && p.jobs_created > 0 && (
                          <span>💼 {p.jobs_created} jobs</span>
                        )}
                        <Link
                          href={`/picc/innovation/${p.slug}`}
                          className="text-blue-600 hover:underline ml-auto"
                        >
                          Edit →
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
