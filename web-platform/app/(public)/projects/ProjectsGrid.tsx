'use client'

/**
 * ProjectsGrid — client island for filterable project cards.
 *
 * Receives the full list from the server page; chips filter in the browser
 * (no extra round-trip). Cards link into the existing /projects/[slug]
 * detail page so we don't break anything upstream.
 */

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ScrollReveal } from '@/components/story-scroll'
import { assetUrl } from '@/lib/media/asset-url'
import { C, SECTION_COLOURS } from '@/components/annual-report/2024-25/almanac/tokens'

export type ProjectCardRow = {
  id: string
  name: string | null
  slug: string
  tagline: string | null
  description: string | null
  status: string | null
  project_type: string | null
  tags: string[] | null
  impact_areas: string[] | null
  hero_image_url: string | null
}

type Theme = 'Culture & Country' | 'Technology & Sovereignty' | 'Employment & Enterprise'

/** Mirror of /innovation theme inference so badges match across surfaces. */
function inferTheme(p: { tags?: string[] | null; impact_areas?: string[] | null }): Theme {
  const combined = [...(p.tags || []), ...(p.impact_areas || [])].map((t) => t.toLowerCase())
  if (combined.some((t) => ['culture', 'elders', 'cultural', 'country', 'photo', 'photo-studio'].includes(t))) {
    return 'Culture & Country'
  }
  if (combined.some((t) => ['employment', 'enterprise', 'economic', 'recycling', 'jobs'].includes(t))) {
    return 'Employment & Enterprise'
  }
  return 'Technology & Sovereignty'
}

/** Section-coloured tint per theme for placeholders + theme pills. */
function themeTint(theme: Theme): string {
  switch (theme) {
    case 'Culture & Country':
      return SECTION_COLOURS.childrenFamilies // ochre
    case 'Employment & Enterprise':
      return SECTION_COLOURS.economic // starGold
    case 'Technology & Sovereignty':
    default:
      return SECTION_COLOURS.educationCommunity // ocean
  }
}

type StatusKey = 'all' | 'active' | 'planning' | 'completed'

const STATUS_LABELS: Record<StatusKey, string> = {
  all: 'All',
  active: 'Active',
  planning: 'Planning',
  completed: 'Completed',
}

/** Normalise the wide variety of status strings into the four chips. */
function statusBucket(raw: string | null | undefined): StatusKey {
  const s = (raw || '').toLowerCase().trim()
  if (!s) return 'planning'
  if (s === 'active' || s === 'in_progress' || s === 'in progress' || s === 'running' || s === 'ongoing') return 'active'
  if (s === 'completed' || s === 'complete' || s === 'done' || s === 'closed' || s === 'wrapped') return 'completed'
  if (s === 'planning' || s === 'planned' || s === 'pending' || s === 'on_hold' || s === 'on hold' || s === 'paused') return 'planning'
  return 'planning'
}

const STATUS_PILL: Record<StatusKey, { bg: string; fg: string; label: string }> = {
  all: { bg: C.shell, fg: C.driftwood, label: 'Status' },
  active: { bg: '#DCF1E5', fg: C.mangrove, label: 'Active' },
  planning: { bg: '#FFF1D6', fg: '#7A4F0A', label: 'Planning' },
  completed: { bg: '#DAEAF6', fg: C.ocean, label: 'Completed' },
}

interface ProjectsGridProps {
  projects: ProjectCardRow[]
}

export function ProjectsGrid({ projects }: ProjectsGridProps) {
  const [filter, setFilter] = useState<StatusKey>('all')

  // Pre-compute counts per chip from the full list.
  const counts = useMemo(() => {
    const c: Record<StatusKey, number> = { all: projects.length, active: 0, planning: 0, completed: 0 }
    for (const p of projects) c[statusBucket(p.status)] += 1
    return c
  }, [projects])

  const visible = useMemo(() => {
    if (filter === 'all') return projects
    return projects.filter((p) => statusBucket(p.status) === filter)
  }, [projects, filter])

  return (
    <div>
      {/* Filter chips */}
      <div
        className="flex flex-wrap items-center gap-2 mb-10"
        role="tablist"
        aria-label="Filter projects by status"
      >
        {(['all', 'active', 'planning', 'completed'] as StatusKey[]).map((key) => {
          const isActive = filter === key
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setFilter(key)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs uppercase font-bold transition-colors duration-200"
              style={{
                letterSpacing: '0.2em',
                backgroundColor: isActive ? C.ocean : 'transparent',
                color: isActive ? '#FFFFFF' : C.ocean,
                border: `1.5px solid ${C.ocean}`,
              }}
            >
              {STATUS_LABELS[key]}
              <span
                className="inline-flex items-center justify-center text-[10px] font-bold rounded-full px-2"
                style={{
                  backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : C.shell,
                  color: isActive ? '#FFFFFF' : C.driftwood,
                  letterSpacing: 0,
                  minWidth: 22,
                }}
              >
                {counts[key]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Cards grid */}
      {visible.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {visible.map((p, i) => {
            const theme = inferTheme(p)
            const tint = themeTint(theme)
            const status = statusBucket(p.status)
            const statusPill = STATUS_PILL[status]
            const heroUrl = p.hero_image_url

            return (
              <ScrollReveal key={p.id} direction="up" delay={Math.min(i * 0.04, 0.4)}>
                <Link
                  href={`/projects/${p.slug}`}
                  className="group block h-full rounded-2xl overflow-hidden bg-white transition-all duration-300 ease-out hover:shadow-lg"
                  style={{ border: `1px solid ${C.border}` }}
                >
                  {/* Hero — photo if present, else section-tinted placeholder using bespoke vision icon */}
                  <div
                    className="relative h-44 w-full overflow-hidden"
                    style={{
                      backgroundColor: tint,
                      backgroundImage: heroUrl
                        ? `linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 100%), url(${heroUrl})`
                        : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {!heroUrl && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Image
                          src={assetUrl('/icons/bespoke-white/vision.png')}
                          alt=""
                          width={56}
                          height={56}
                          className="opacity-90"
                          aria-hidden="true"
                        />
                      </div>
                    )}
                    {/* Status pill — top right */}
                    <span
                      className="absolute top-3 right-3 text-[10px] font-bold uppercase rounded-full px-2.5 py-1"
                      style={{
                        letterSpacing: '0.15em',
                        backgroundColor: statusPill.bg,
                        color: statusPill.fg,
                      }}
                    >
                      {statusPill.label}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex flex-col gap-3">
                    {/* Caption-cadence theme label */}
                    <div
                      className="text-[11px] font-bold uppercase"
                      style={{ color: tint, letterSpacing: '0.3em' }}
                    >
                      {theme}
                    </div>
                    <h3
                      className="font-fraunces font-bold leading-tight group-hover:underline"
                      style={{ color: C.ocean, fontSize: 22 }}
                    >
                      {p.name || p.slug}
                    </h3>
                    {(p.tagline || p.description) && (
                      <p
                        className="leading-relaxed line-clamp-3"
                        style={{ color: C.driftwood, fontSize: 15 }}
                      >
                        {p.tagline ||
                          (p.description && p.description.length > 180
                            ? p.description.slice(0, 180) + '…'
                            : p.description)}
                      </p>
                    )}
                    <span
                      className="mt-2 text-xs font-bold uppercase inline-flex items-center gap-1"
                      style={{ color: C.ochre, letterSpacing: '0.2em' }}
                    >
                      Open project
                      <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            )
          })}
        </div>
      ) : (
        <div
          className="rounded-2xl px-6 py-16 text-center"
          style={{ backgroundColor: C.shell, border: `1px solid ${C.border}` }}
        >
          <div
            className="text-[11px] font-bold uppercase mb-3"
            style={{ color: C.driftwood, letterSpacing: '0.3em' }}
          >
            Nothing in this filter
          </div>
          <p style={{ color: C.earth, fontSize: 16 }}>
            No projects match the {STATUS_LABELS[filter].toLowerCase()} filter just yet.
          </p>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs uppercase font-bold"
            style={{
              letterSpacing: '0.2em',
              backgroundColor: C.ocean,
              color: '#FFFFFF',
            }}
          >
            Show all projects
          </button>
        </div>
      )}
    </div>
  )
}
