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

interface CommunityVision {
  id: string
  vision_text: string
  category: string
  author_name: string | null
  is_anonymous: boolean
  source: string | null
  session_id: string | null
  is_approved: boolean
  approved_at: string | null
  created_at: string
}

export default function VisionBoardPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [visions, setVisions] = useState<CommunityVision[]>([])
  const [loading, setLoading] = useState(true)
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<Goal>>({})
  const [sessionFilter, setSessionFilter] = useState<string>('all')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const visionsUrl =
        sessionFilter === 'all'
          ? '/api/community-visions?status=pending'
          : `/api/community-visions?status=pending&session=${encodeURIComponent(sessionFilter)}`
      const [goalsRes, visionsRes] = await Promise.all([
        fetch('/api/goals'),
        fetch(visionsUrl),
      ])
      if (goalsRes.ok) setGoals(await goalsRes.json())

      // Visions endpoint may not exist yet — handle gracefully
      if (visionsRes.ok) {
        const visionsData = await visionsRes.json()
        setVisions(Array.isArray(visionsData) ? visionsData : visionsData.visions || [])
      }
    } catch (err) {
      console.error('Failed to fetch vision board data:', err)
    } finally {
      setLoading(false)
    }
  }, [sessionFilter])

  useEffect(() => { fetchData() }, [fetchData])

  // Distinct sessions surfaced from current visions list (so filter chips
  // populate without a separate API call). "all" is always available.
  const sessions = Array.from(
    new Set(visions.map((v) => v.session_id).filter((s): s is string => !!s))
  ).sort().reverse()

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
          <Link href="/picc" className="text-sm text-blue-600 hover:underline">
            Back to Admin
          </Link>
        </div>

        {/* Section 1: Community Visions */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <h2 className="text-xl font-semibold text-gray-900">
              Community Visions
              {visions.length > 0 && (
                <span className="ml-2 text-sm bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  {visions.length} pending
                </span>
              )}
            </h2>
            {(sessions.length > 0 || sessionFilter !== 'all') && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold uppercase tracking-widest text-gray-400">Session</span>
                <button
                  type="button"
                  onClick={() => setSessionFilter('all')}
                  className={`px-2.5 py-1 rounded-full border transition ${
                    sessionFilter === 'all'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  All
                </button>
                {sessions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSessionFilter(s)}
                    className={`px-2.5 py-1 rounded-full border font-mono transition ${
                      sessionFilter === s
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {visions.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
              No pending visions to review.
            </div>
          ) : (
            <div className="space-y-3">
              {visions.map(vision => (
                <div key={vision.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-gray-800 mb-2">&ldquo;{vision.vision_text}&rdquo;</p>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <span className="text-sm text-gray-500">
                      {vision.is_anonymous || !vision.author_name ? 'Anonymous' : vision.author_name}
                      {' '}&middot;{' '}
                      <span className="capitalize">{vision.category}</span>
                      {' '}&middot;{' '}
                      {new Date(vision.created_at).toLocaleDateString('en-AU')}
                      {vision.session_id && (
                        <>
                          {' '}&middot;{' '}
                          <button
                            type="button"
                            onClick={() => setSessionFilter(vision.session_id!)}
                            className="font-mono text-xs px-1.5 py-0.5 rounded bg-gray-100 hover:bg-blue-50 hover:text-blue-700 transition"
                            title="Filter to this session"
                          >
                            {vision.session_id}
                          </button>
                        </>
                      )}
                    </span>
                    <div className="flex gap-2">
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Organization Goals */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Organization Goals (2029 Targets)</h2>

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
        </section>

        {/* Section 3: Innovation Links placeholder */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Innovation Project Links</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
            Connect innovation projects to goals from the{' '}
            <Link href="/picc/innovation" className="text-blue-600 hover:underline">
              Innovation admin
            </Link>.
          </div>
        </section>
      </div>
    </div>
  )
}
