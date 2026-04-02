'use client'

import { useEffect, useState } from 'react'
import {
  Award,
  BookOpen,
  Users,
  MapPin,
  Star,
  Globe,
  Heart,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Milestone = {
  id: string
  type: string // first_story, story_count, cultural_contributor, community_leader, mentor_recognition, travel, cultural_sharing
  title: string
  description?: string | null
  achieved_at?: string | null
  progress_percentage?: number // 0-100
  status: 'achieved' | 'in_progress' | 'planned'
  badge_earned?: string | null
}

export type ElderMilestoneTimelineProps = {
  elderId: string
  elderName: string
  milestones?: Milestone[]
}

// ---------------------------------------------------------------------------
// Icon map
// ---------------------------------------------------------------------------

const ICON_MAP: Record<string, React.ElementType> = {
  first_story: BookOpen,
  story_count: Star,
  cultural_contributor: Heart,
  community_leader: Users,
  mentor_recognition: Award,
  travel: MapPin,
  cultural_sharing: Globe,
}

function MilestoneIcon({ type, className }: { type: string; className?: string }) {
  const Icon = ICON_MAP[type] ?? Star
  return <Icon className={className} />
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TimelineNode({ milestone }: { milestone: Milestone }) {
  const isAchieved = milestone.status === 'achieved'
  const isInProgress = milestone.status === 'in_progress'

  return (
    <div className="relative flex gap-4 pb-8 last:pb-0">
      {/* Vertical line */}
      <div className="absolute left-[17px] top-10 bottom-0 w-0.5 bg-stone-200 last:hidden" />

      {/* Node circle */}
      <div className="relative z-10 flex-shrink-0">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
            isAchieved
              ? 'border-picc-ochre bg-picc-ochre text-white'
              : isInProgress
                ? 'border-warm-300 bg-warm-100 text-warm-600 animate-pulse'
                : 'border-dashed border-stone-300 bg-white text-stone-400'
          }`}
        >
          <MilestoneIcon type={milestone.type} className="h-4 w-4" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4
            className={`text-sm font-semibold ${
              isAchieved
                ? 'text-stone-900'
                : isInProgress
                  ? 'text-stone-700'
                  : 'text-stone-400'
            }`}
          >
            {milestone.title}
          </h4>
          {milestone.badge_earned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-picc-ochre/10 px-2 py-0.5 text-xs font-medium text-picc-ochre">
              <Award className="h-3 w-3" />
              {milestone.badge_earned}
            </span>
          )}
        </div>

        {milestone.description && (
          <p
            className={`mt-1 text-sm ${
              isAchieved ? 'text-stone-600' : 'text-stone-400'
            }`}
          >
            {milestone.description}
          </p>
        )}

        {milestone.achieved_at && isAchieved && (
          <p className="mt-1 text-xs text-stone-400">
            {new Date(milestone.achieved_at).toLocaleDateString('en-AU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}

        {isInProgress && typeof milestone.progress_percentage === 'number' && (
          <div className="mt-2 w-full max-w-xs">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span>Progress</span>
              <span>{Math.round(milestone.progress_percentage)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-stone-200">
              <div
                className="h-full rounded-full bg-picc-ochre transition-all duration-500"
                style={{ width: `${milestone.progress_percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function VisionCard({ milestones }: { milestones: Milestone[] }) {
  const planned = milestones.filter((m) => m.status === 'planned')
  if (planned.length === 0) return null

  return (
    <div className="mt-6 rounded-2xl border border-stone-200 bg-warm-50 p-5">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-stone-800">
        <Star className="h-4 w-4 text-picc-ochre" />
        3-Year Vision
      </h4>
      <ul className="mt-3 space-y-2">
        {planned.map((m) => (
          <li key={m.id} className="flex items-start gap-2 text-sm text-stone-500">
            <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-stone-300" />
            <span>
              <span className="font-medium text-stone-600">{m.title}</span>
              {m.description && ` — ${m.description}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ElderMilestoneTimeline({
  elderId,
  elderName,
  milestones: initialMilestones,
}: ElderMilestoneTimelineProps) {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones ?? [])
  const [loading, setLoading] = useState(!initialMilestones)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialMilestones) return

    let cancelled = false
    async function fetchMilestones() {
      try {
        const res = await fetch(
          `/api/elders/milestones?elderId=${encodeURIComponent(elderId)}`
        )
        if (!res.ok) throw new Error(`Failed to fetch milestones (${res.status})`)
        const data = await res.json()
        if (!cancelled) {
          setMilestones(data.milestones ?? [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchMilestones()
    return () => {
      cancelled = true
    }
  }, [elderId, initialMilestones])

  // Sort: achieved first (newest first), then in_progress, then planned
  const sorted = [...milestones].sort((a, b) => {
    const order = { achieved: 0, in_progress: 1, planned: 2 }
    const diff = order[a.status] - order[b.status]
    if (diff !== 0) return diff
    // Within achieved, newest first
    if (a.achieved_at && b.achieved_at) {
      return new Date(b.achieved_at).getTime() - new Date(a.achieved_at).getTime()
    }
    return 0
  })

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6">
      <h3 className="flex items-center gap-2 text-lg font-bold text-stone-900">
        <Award className="h-5 w-5 text-picc-ochre" />
        Journey &amp; Milestones
      </h3>
      <p className="mt-1 text-sm text-stone-500">
        {elderName}&apos;s storytelling journey
      </p>

      {loading && (
        <div className="mt-6 flex items-center gap-2 text-sm text-stone-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-picc-ochre" />
          Loading milestones...
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-500">Could not load milestones: {error}</p>
      )}

      {!loading && !error && sorted.length === 0 && (
        <p className="mt-4 text-sm text-stone-400">No milestones yet.</p>
      )}

      {!loading && !error && sorted.length > 0 && (
        <>
          <div className="mt-6">
            {sorted.map((m) => (
              <TimelineNode key={m.id} milestone={m} />
            ))}
          </div>
          <VisionCard milestones={sorted} />
        </>
      )}
    </section>
  )
}
