'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Loader2, Pencil, X, Check,
  LayoutGrid, List, Camera, Image as ImageIcon,
  FileText, CheckCircle2, XCircle, Filter, RefreshCw,
  Globe, ExternalLink, BookOpen, Settings
} from 'lucide-react'
import MediaPickerDialog from '@/components/admin/MediaPickerDialog'

type ProjectRow = {
  id: string
  name: string
  slug: string
  tagline: string | null
  description: string | null
  status: string | null
  project_type: string | null
  hero_image_url: string | null
  is_public: boolean | null
  featured: boolean | null
  metadata?: any
  created_at?: string | null
}

type ContentStatusMap = Record<string, {
  hasCover: boolean
  coverUrl?: string
  photoCount: number
  hasVideo: boolean
  hasDescription: boolean
  hasStory: boolean
  hasWebsite: boolean
}>

type ViewMode = 'cards' | 'table'
type FilterMode = 'all' | 'missing-cover' | 'missing-link' | 'missing-description' | 'needs-story' | 'complete'

const STATUS_OPTIONS = ['planning', 'in_progress', 'on_hold', 'completed', 'archived'] as const
const TYPE_OPTIONS = ['innovation', 'infrastructure', 'cultural', 'service', 'research', 'other'] as const

const TOTAL_CHECKS = 6

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function completenessScore(status: ContentStatusMap[string] | undefined): number {
  if (!status) return 0
  return [status.hasCover, status.photoCount > 0, status.hasVideo, status.hasDescription, status.hasStory, status.hasWebsite]
    .filter(Boolean).length
}

function getStatusColor(status: string | null) {
  switch (status) {
    case 'planning': return 'bg-blue-100 text-blue-700'
    case 'in_progress': return 'bg-green-100 text-green-700'
    case 'on_hold': return 'bg-amber-100 text-amber-700'
    case 'completed': return 'bg-gray-100 text-gray-600'
    case 'archived': return 'bg-gray-100 text-gray-400'
    default: return 'bg-gray-100 text-gray-600'
  }
}

function getTypeLabel(type: string | null) {
  if (!type) return null
  return type.charAt(0).toUpperCase() + type.slice(1)
}

// --- Overview Dashboard ---
function OverviewDashboard({
  projects,
  contentStatus,
  activeFilter,
  setActiveFilter,
  viewMode,
  setViewMode,
}: {
  projects: ProjectRow[]
  contentStatus: ContentStatusMap
  activeFilter: FilterMode
  setActiveFilter: (f: FilterMode) => void
  viewMode: ViewMode
  setViewMode: (v: ViewMode) => void
}) {
  const active = projects.filter(p => p.status === 'in_progress')
  const planning = projects.filter(p => p.status === 'planning')
  const completed = projects.filter(p => p.status === 'completed')
  const fullyComplete = projects.filter(p => completenessScore(contentStatus[p.slug]) === TOTAL_CHECKS)
  const needsAttention = projects.length - fullyComplete.length

  const filters: { key: FilterMode; label: string; count?: number }[] = [
    { key: 'all', label: 'All', count: projects.length },
    { key: 'missing-cover', label: 'Missing Cover', count: projects.filter(p => !contentStatus[p.slug]?.hasCover).length },
    { key: 'missing-link', label: 'Missing Link', count: projects.filter(p => !contentStatus[p.slug]?.hasWebsite).length },
    { key: 'missing-description', label: 'Missing Desc', count: projects.filter(p => !contentStatus[p.slug]?.hasDescription).length },
    { key: 'needs-story', label: 'Needs Story', count: projects.filter(p => !contentStatus[p.slug]?.hasStory).length },
    { key: 'complete', label: 'Complete', count: fullyComplete.length },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-6">
      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-6 mb-4">
        <div>
          <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
          <div className="text-xs text-gray-500">Total Projects</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">{active.length}</div>
          <div className="text-xs text-gray-500">In Progress</div>
        </div>
        {planning.length > 0 && (
          <div>
            <div className="text-2xl font-bold text-blue-600">{planning.length}</div>
            <div className="text-xs text-gray-500">Planning</div>
          </div>
        )}
        {completed.length > 0 && (
          <div>
            <div className="text-2xl font-bold text-gray-400">{completed.length}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
        )}
        <div className="ml-auto text-sm text-gray-600">
          <span className="font-semibold text-green-600">{fullyComplete.length}</span> fully set up
          {needsAttention > 0 && (
            <>, <span className="font-semibold text-amber-600">{needsAttention}</span> need attention</>
          )}
        </div>
      </div>

      {/* Filters + View Toggle */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-gray-400" />
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeFilter === f.key
                ? 'bg-picc-red text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
            {f.count !== undefined && (
              <span className={`${activeFilter === f.key ? 'text-white/80' : 'text-gray-400'}`}>
                {f.count}
              </span>
            )}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 border border-gray-200 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'cards' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
            title="Card view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
            title="Table view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Project Content Card ---
function ProjectContentCard({
  project,
  status,
  onEdit,
  onSetCover,
}: {
  project: ProjectRow
  status: ContentStatusMap[string] | undefined
  onEdit: () => void
  onSetCover: () => void
}) {
  const score = completenessScore(status)
  const isArchived = project.status === 'archived'

  return (
    <div className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${isArchived ? 'border-gray-200 opacity-60' : 'border-gray-200'}`}>
      {/* Cover photo */}
      <div className="aspect-[16/9] bg-gray-100 relative overflow-hidden">
        {status?.hasCover && status.coverUrl ? (
          <img src={status.coverUrl} alt={project.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-gray-300">
              <ImageIcon className="w-10 h-10 mx-auto mb-1" />
              <p className="text-xs">No cover photo</p>
            </div>
          </div>
        )}
        {project.status && (
          <div className={`absolute top-2 left-2 px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
            {project.status.replace('_', ' ')}
          </div>
        )}
        {project.project_type && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
            {getTypeLabel(project.project_type)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{project.name}</h3>
        {project.tagline && (
          <p className="text-xs text-gray-500 mb-2 line-clamp-1">{project.tagline}</p>
        )}

        {/* Progress bar */}
        {status && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden mr-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    score === TOTAL_CHECKS ? 'bg-green-500' : score >= 4 ? 'bg-amber-500' : 'bg-red-400'
                  }`}
                  style={{ width: `${(score / TOTAL_CHECKS) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-500">{score}/{TOTAL_CHECKS}</span>
            </div>
          </div>
        )}

        {/* Status icons row */}
        {status && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] mb-3">
            <StatusPill ok={status.hasCover} label="Cover" />
            <StatusPill ok={status.photoCount > 0} label="Photos" />
            <StatusPill ok={status.hasVideo} label="Video" />
            <StatusPill ok={status.hasDescription} label="Desc" />
            <StatusPill ok={status.hasStory} label="Story" />
            <StatusPill ok={status.hasWebsite} label="Link" />
          </div>
        )}

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
          <button
            onClick={onSetCover}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            title="Set cover photo"
          >
            <Camera className="w-3 h-3" />
          </button>
          <Link
            href={`/picc/projects/${project.slug}`}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            title="View project detail"
          >
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${ok ? 'text-green-600' : 'text-gray-400'}`}>
      {ok ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {label}
    </span>
  )
}

// --- Main Page ---
export default function ProjectsContentHubPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contentStatus, setContentStatus] = useState<ContentStatusMap>({})
  const [contentLoading, setContentLoading] = useState(false)

  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [activeFilter, setActiveFilter] = useState<FilterMode>('all')

  // Slide-over state
  const [slideOverSlug, setSlideOverSlug] = useState<string | null>(null)

  // Media picker for quick "Set Cover"
  const [coverPickerSlug, setCoverPickerSlug] = useState<string | null>(null)
  const [settingCover, setSettingCover] = useState(false)

  // Create project form
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    status: 'in_progress',
    project_type: 'innovation',
    is_public: true,
    featured: false,
  })

  const computedSlug = useMemo(() => (form.slug.trim() ? form.slug : slugify(form.name)), [form.slug, form.name])

  // --- Data loading ---
  const loadProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/projects?limit=500', { cache: 'no-store' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to load projects')
      const loaded = (json.data || []) as ProjectRow[]
      setProjects(loaded)
      return loaded
    } catch (e: any) {
      setError(e?.message || 'Failed to load projects')
      setProjects([])
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const loadContentStatus = useCallback(async (projectList: ProjectRow[]) => {
    if (projectList.length === 0) return
    setContentLoading(true)
    try {
      // Batch fetch: get all media in bulk, then bucket client-side by project:<slug> tags
      const [photosRes, videosRes] = await Promise.all([
        fetch(`/api/media/list?limit=500&fileType=image`).then(r => r.ok ? r.json() : { data: [] }),
        fetch(`/api/media/list?limit=500&fileType=video`).then(r => r.ok ? r.json() : { data: [] }),
      ])

      const photos = Array.isArray(photosRes.data) ? photosRes.data : []
      const videos = Array.isArray(videosRes.data) ? videosRes.data : []

      // Check for immersive stories — try fetching from the immersive_stories-related API
      // We'll check if projects have stories by looking at the project detail pages
      let storyProjectSlugs = new Set<string>()
      try {
        const storiesRes = await fetch('/api/stories?limit=500&type=immersive')
        if (storiesRes.ok) {
          const storiesJson = await storiesRes.json()
          const stories = Array.isArray(storiesJson.data) ? storiesJson.data : []
          for (const story of stories) {
            if (story.project_slug) storyProjectSlugs.add(story.project_slug)
            if (story.project_id) {
              const proj = projectList.find(p => p.id === story.project_id)
              if (proj) storyProjectSlugs.add(proj.slug)
            }
          }
        }
      } catch {
        // Stories endpoint may not exist — that's fine
      }

      const statusMap: ContentStatusMap = {}
      for (const proj of projectList) {
        const projectTag = `project:${proj.slug}`
        const projPhotos = photos.filter((p: any) => Array.isArray(p.tags) && p.tags.includes(projectTag))
        const heroPhoto = projPhotos.find((p: any) => Array.isArray(p.tags) && p.tags.includes('hero'))
        const projVideos = videos.filter((v: any) => Array.isArray(v.tags) && v.tags.includes(projectTag))
        const meta = proj.metadata || {}

        statusMap[proj.slug] = {
          hasCover: !!heroPhoto,
          coverUrl: heroPhoto?.public_url,
          photoCount: projPhotos.length,
          hasVideo: projVideos.length > 0,
          hasDescription: !!(proj.description && proj.description.trim().length > 10),
          hasStory: storyProjectSlugs.has(proj.slug),
          hasWebsite: !!(meta.website_url),
        }
      }
      setContentStatus(statusMap)
    } catch (err) {
      console.error('Failed to load content status:', err)
    } finally {
      setContentLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProjects().then(loaded => loadContentStatus(loaded))
  }, [loadProjects, loadContentStatus])

  const refresh = async () => {
    const loaded = await loadProjects()
    await loadContentStatus(loaded)
  }

  // --- Filtering ---
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const status = contentStatus[p.slug]
      switch (activeFilter) {
        case 'missing-cover': return !status?.hasCover
        case 'missing-link': return !status?.hasWebsite
        case 'missing-description': return !status?.hasDescription
        case 'needs-story': return !status?.hasStory
        case 'complete': return completenessScore(status) === TOTAL_CHECKS
        default: return true
      }
    })
  }, [projects, contentStatus, activeFilter])

  // --- Create ---
  const create = async () => {
    const name = form.name.trim()
    if (!name) { setError('Name is required'); return }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug: computedSlug,
          tagline: form.tagline.trim() || null,
          description: form.description.trim() || null,
          status: form.status,
          project_type: form.project_type,
          is_public: form.is_public,
          featured: form.featured,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to create project')
      setForm({ name: '', slug: '', tagline: '', description: '', status: 'in_progress', project_type: 'innovation', is_public: true, featured: false })
      setShowCreateForm(false)
      await refresh()
    } catch (e: any) {
      setError(e?.message || 'Failed to create project')
    } finally {
      setSaving(false)
    }
  }

  // --- Quick cover photo ---
  const handleSetCoverPhoto = async (media: any) => {
    if (!coverPickerSlug) return
    setSettingCover(true)
    const slug = coverPickerSlug
    setCoverPickerSlug(null)
    const projectTag = `project:${slug}`
    try {
      // Remove hero tag from any existing cover for this project
      const heroTags = `${projectTag},hero`
      const currentRes = await fetch(`/api/media/list?limit=10&fileType=image&tags=${encodeURIComponent(heroTags)}`)
      if (currentRes.ok) {
        const current = await currentRes.json()
        const currentIds = (current.data || []).map((m: any) => m.id)
        if (currentIds.length > 0) {
          await fetch('/api/media/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mediaIds: currentIds, removeTags: ['hero'] }),
          })
        }
      }
      // Add project + hero tags to selected photo
      await fetch('/api/media/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaIds: [media.id], addTags: [projectTag, 'hero'] }),
      })
      // Update local state
      setContentStatus(prev => ({
        ...prev,
        [slug]: {
          ...prev[slug],
          hasCover: true,
          coverUrl: media.public_url,
        },
      }))
    } catch (err) {
      console.error('Failed to set cover photo:', err)
      setError('Failed to set cover photo')
    } finally {
      setSettingCover(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/picc/dashboard" className="inline-flex items-center gap-2 text-picc-red hover:text-picc-red/80 mb-4 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>

        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Project Content Hub</h1>
            <p className="text-gray-600 mt-1">Manage content completeness across all PICC projects.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/picc/projects/manage"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Manage
            </Link>
            <button
              onClick={refresh}
              disabled={loading || contentLoading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${(loading || contentLoading) ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-picc-red text-white rounded-lg hover:bg-picc-red/90 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Project
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create Project Form (collapsible) */}
      {showCreateForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Add a project</h2>
            <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Name</div>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30 focus:border-picc-red"
                placeholder="e.g. Photo Studio"
              />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Slug</div>
              <input
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30 focus:border-picc-red"
                placeholder={computedSlug || 'auto-generated'}
              />
              <div className="text-xs text-gray-400 mt-1">Tag: <code className="bg-gray-100 px-1 rounded">project:{computedSlug || '...'}</code></div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Status</div>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30 focus:border-picc-red"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Type</div>
              <select
                value={form.project_type}
                onChange={(e) => setForm((p) => ({ ...p, project_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30 focus:border-picc-red"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs text-gray-500 mb-1">Tagline (optional)</div>
              <input
                value={form.tagline}
                onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30 focus:border-picc-red"
                placeholder="Short punchy summary"
              />
            </div>
            <div className="md:col-span-2">
              <div className="text-xs text-gray-500 mb-1">Description</div>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30 focus:border-picc-red"
                placeholder="Description for the public report and project page"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.is_public}
                  onChange={(e) => setForm((p) => ({ ...p, is_public: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-picc-red focus:ring-2 focus:ring-picc-red/30"
                />
                Public
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-picc-red focus:ring-2 focus:ring-picc-red/30"
                />
                Featured
              </label>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={create}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-picc-red text-white rounded-lg hover:bg-picc-red/90 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create project
            </button>
          </div>
        </div>
      )}

      {/* Overview Dashboard */}
      {!loading && (
        <OverviewDashboard
          projects={projects}
          contentStatus={contentStatus}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400 mr-3" />
          <span className="text-gray-600">Loading projects...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-2">
            {activeFilter === 'all' ? 'No projects found.' : 'No projects match this filter.'}
          </div>
          {activeFilter !== 'all' && (
            <button onClick={() => setActiveFilter('all')} className="text-sm text-picc-red hover:underline">
              Show all projects
            </button>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        /* ---- CARD VIEW ---- */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProjects.map(project => (
            <ProjectContentCard
              key={project.id}
              project={project}
              status={contentStatus[project.slug]}
              onEdit={() => setSlideOverSlug(project.slug)}
              onSetCover={() => setCoverPickerSlug(project.slug)}
            />
          ))}
        </div>
      ) : (
        /* ---- TABLE VIEW ---- */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Name</th>
                  <th className="text-left font-medium px-4 py-3">Type</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-left font-medium px-4 py-3">Content</th>
                  <th className="text-left font-medium px-4 py-3">Details</th>
                  <th className="text-left font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((p) => {
                  const status = contentStatus[p.slug]
                  const score = completenessScore(status)
                  return (
                    <tr key={p.id} className="border-t border-gray-100">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{p.name}</div>
                        <div className="text-xs text-gray-500">
                          <code className="bg-gray-100 px-1 rounded">{p.slug}</code>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 capitalize">{p.project_type || '\u2014'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(p.status)}`}>
                          {(p.status || 'unknown').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${score === TOTAL_CHECKS ? 'bg-green-500' : score >= 4 ? 'bg-amber-500' : 'bg-red-400'}`}
                              style={{ width: `${(score / TOTAL_CHECKS) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{score}/{TOTAL_CHECKS}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5 text-[11px]">
                          {status && (
                            <>
                              <StatusPill ok={status.hasCover} label="Cover" />
                              <StatusPill ok={status.hasDescription} label="Desc" />
                              <StatusPill ok={status.hasWebsite} label="Link" />
                              <StatusPill ok={status.hasStory} label="Story" />
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSlideOverSlug(p.slug)}
                            className="p-1.5 rounded-lg hover:bg-gray-50 border border-gray-200"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5 text-gray-700" />
                          </button>
                          <button
                            onClick={() => setCoverPickerSlug(p.slug)}
                            className="p-1.5 rounded-lg hover:bg-gray-50 border border-gray-200"
                            title="Set cover photo"
                          >
                            <Camera className="w-3.5 h-3.5 text-gray-700" />
                          </button>
                          <Link
                            href={`/picc/projects/${p.slug}`}
                            className="p-1.5 rounded-lg hover:bg-gray-50 border border-gray-200"
                            title="View detail"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-gray-700" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content loading indicator */}
      {contentLoading && !loading && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2 flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading content status...
        </div>
      )}

      {/* Setting cover indicator */}
      {settingCover && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2 flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          Setting cover photo...
        </div>
      )}

      {/* Slide-over for card edit */}
      {slideOverSlug && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSlideOverSlug(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
            onClick={e => e.stopPropagation()}
          >
            <SlideOverEditor
              projectSlug={slideOverSlug}
              projects={projects}
              contentStatus={contentStatus}
              onClose={() => setSlideOverSlug(null)}
              onSaved={refresh}
            />
          </div>
        </div>
      )}

      {/* Media Picker for quick cover photo */}
      <MediaPickerDialog
        open={!!coverPickerSlug}
        kind="image"
        onClose={() => setCoverPickerSlug(null)}
        onPick={handleSetCoverPhoto}
      />
    </div>
  )
}

// --- Slide-over Editor ---
function SlideOverEditor({
  projectSlug,
  projects,
  contentStatus: parentContentStatus,
  onClose,
  onSaved,
}: {
  projectSlug: string
  projects: ProjectRow[]
  contentStatus: ContentStatusMap
  onClose: () => void
  onSaved: () => void
}) {
  const project = projects.find(p => p.slug === projectSlug) || null
  const parentStatus = parentContentStatus[projectSlug]

  const [name, setName] = useState(project?.name || '')
  const [tagline, setTagline] = useState(project?.tagline || '')
  const [description, setDescription] = useState(project?.description || '')
  const [status, setStatus] = useState(project?.status || 'in_progress')
  const [projectType, setProjectType] = useState(project?.project_type || 'innovation')
  const [websiteUrl, setWebsiteUrl] = useState(project?.metadata?.website_url || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Cover photo picker
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false)
  const [settingCover, setSettingCover] = useState(false)

  // Local content status (may be updated by cover photo changes)
  const [localContentStatus, setLocalContentStatus] = useState(parentStatus)

  useEffect(() => {
    setLocalContentStatus(parentContentStatus[projectSlug])
  }, [parentContentStatus, projectSlug])

  const handleSave = async () => {
    if (!project) return
    setSaving(true)
    setSaved(false)
    try {
      const currentMeta = project.metadata || {}
      const updatedMeta = { ...currentMeta }
      if (websiteUrl.trim()) {
        updatedMeta.website_url = websiteUrl.trim()
      } else {
        delete updatedMeta.website_url
      }

      const res = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: project.id,
          name,
          tagline: tagline.trim() || null,
          description: description.trim() || null,
          status,
          project_type: projectType,
          metadata: updatedMeta,
        }),
      })
      if (res.ok) {
        setSaved(true)
        onSaved()
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (err) {
      console.error('Failed to save:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleSetCoverPhoto = async (media: any) => {
    if (!project) return
    setSettingCover(true)
    setPhotoPickerOpen(false)
    try {
      const projectTag = `project:${project.slug}`
      // Remove hero from existing cover
      if (localContentStatus?.hasCover) {
        const heroTags = `${projectTag},hero`
        const currentRes = await fetch(`/api/media/list?limit=10&fileType=image&tags=${encodeURIComponent(heroTags)}`)
        if (currentRes.ok) {
          const current = await currentRes.json()
          const currentIds = (current.data || []).map((m: any) => m.id)
          if (currentIds.length > 0) {
            await fetch('/api/media/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ mediaIds: currentIds, removeTags: ['hero'] }),
            })
          }
        }
      }
      await fetch('/api/media/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaIds: [media.id], addTags: [`project:${project.slug}`, 'hero'] }),
      })
      setLocalContentStatus(prev => prev ? { ...prev, hasCover: true, coverUrl: media.public_url } : prev)
      onSaved()
    } catch (err) {
      console.error('Failed to set cover:', err)
    } finally {
      setSettingCover(false)
    }
  }

  const completedCount = localContentStatus
    ? [localContentStatus.hasCover, localContentStatus.photoCount > 0, localContentStatus.hasVideo, localContentStatus.hasDescription, localContentStatus.hasStory, localContentStatus.hasWebsite].filter(Boolean).length
    : 0

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Edit Project</h2>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {!project ? (
          <p className="text-sm text-gray-400 text-center py-8">Project not found: {projectSlug}</p>
        ) : (
          <>
            {/* Content Status */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-900">Content Status</span>
                {localContentStatus && (
                  <span className="text-xs font-medium text-gray-500">{completedCount}/{TOTAL_CHECKS} complete</span>
                )}
              </div>
              {localContentStatus ? (
                <>
                  <div className="space-y-0.5">
                    <StatusItemSmall label="Cover photo" ok={localContentStatus.hasCover} />
                    <StatusItemSmall label="Gallery photos" ok={localContentStatus.photoCount > 0} detail={localContentStatus.photoCount > 0 ? `${localContentStatus.photoCount}` : undefined} />
                    <StatusItemSmall label="Video" ok={localContentStatus.hasVideo} />
                    <StatusItemSmall label="Description" ok={localContentStatus.hasDescription} />
                    <StatusItemSmall label="Immersive story" ok={localContentStatus.hasStory} />
                    <StatusItemSmall label="Website link" ok={localContentStatus.hasWebsite} />
                  </div>
                  <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${(completedCount / TOTAL_CHECKS) * 100}%` }} />
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-400 py-2">Loading...</div>
              )}
            </div>

            {/* Cover Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Photo</label>
              {localContentStatus?.hasCover && localContentStatus.coverUrl ? (
                <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-2">
                  <img src={localContentStatus.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-[16/9] rounded-lg bg-gray-100 flex items-center justify-center mb-2">
                  <div className="text-center text-gray-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1" />
                    <p className="text-xs">No cover photo</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setPhotoPickerOpen(true)}
                disabled={settingCover}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {settingCover ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Setting cover...</>
                ) : (
                  <><Camera className="w-4 h-4" /> {localContentStatus?.hasCover ? 'Change Cover Photo' : 'Set Cover Photo'}</>
                )}
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-ochre-300 focus:ring-1 focus:ring-picc-ochre-300 focus:outline-none"
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
              <input
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-ochre-300 focus:ring-1 focus:ring-picc-ochre-300 focus:outline-none"
                placeholder="Short punchy summary"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-ochre-300 focus:ring-1 focus:ring-picc-ochre-300 focus:outline-none"
              />
            </div>

            {/* Status + Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-ochre-300 focus:ring-1 focus:ring-picc-ochre-300 focus:outline-none"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={projectType}
                  onChange={e => setProjectType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-ochre-300 focus:ring-1 focus:ring-picc-ochre-300 focus:outline-none"
                >
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Website URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  value={websiteUrl}
                  onChange={e => setWebsiteUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-ochre-300 focus:ring-1 focus:ring-picc-ochre-300 focus:outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-picc-red rounded-lg hover:bg-picc-red/90 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : saved ? (
                <><Check className="w-4 h-4" /> Saved</>
              ) : (
                <><Check className="w-4 h-4" /> Save Changes</>
              )}
            </button>

            {/* Quick Links */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Links</span>
              <Link href={`/picc/projects/${projectSlug}`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <ExternalLink className="w-4 h-4 text-gray-400" /> Project Detail Page
              </Link>
              <Link href={`/picc/projects/${projectSlug}/story-builder`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <BookOpen className="w-4 h-4 text-gray-400" /> Story Builder
              </Link>
              <Link href={`/picc/media/gallery?tag=project:${projectSlug}`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <Camera className="w-4 h-4 text-gray-400" /> Project Photos
              </Link>
              <Link href={`/picc/stories?project=${projectSlug}`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <FileText className="w-4 h-4 text-gray-400" /> Related Stories
              </Link>
              <Link href="/picc/projects/manage" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <Settings className="w-4 h-4 text-gray-400" /> Manage (CRUD)
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Media Picker */}
      <MediaPickerDialog
        open={photoPickerOpen}
        kind="image"
        onClose={() => setPhotoPickerOpen(false)}
        onPick={handleSetCoverPhoto}
      />
    </>
  )
}

function StatusItemSmall({ label, ok, detail }: { label: string; ok: boolean; detail?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        {ok ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />}
        {label}
      </div>
      {detail && <span className="text-xs text-gray-500">{detail}</span>}
    </div>
  )
}
