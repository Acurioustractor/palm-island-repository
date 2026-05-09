'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Loader2, Pencil, Trash2, X, Check,
  LayoutGrid, List, Camera, Image as ImageIcon,
  CheckCircle2, XCircle, Filter, RefreshCw, Lightbulb
} from 'lucide-react'
import MediaPickerDialog from '@/components/admin/MediaPickerDialog'

type ProjectRow = {
  id: string
  name: string
  slug: string
  tagline: string | null
  description: string | null
  status: string
  project_type: string | null
  start_date: string | null
  target_completion_date: string | null
  actual_completion_date: string | null
  hero_image_url: string | null
  is_public: boolean
  featured: boolean
  created_at: string
  updated_at: string
}

type ViewMode = 'cards' | 'table'
type FilterMode = 'all' | 'active' | 'planning' | 'completed' | 'missing-hero' | 'missing-description'

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
  in_progress: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
  planning: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Planning' },
  completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' },
}

function completenessScore(project: ProjectRow): number {
  return [
    !!project.hero_image_url,
    !!(project.description && project.description.trim().length > 10),
    !!project.tagline,
    !!project.start_date,
    project.status === 'active' || project.status === 'in_progress' || project.status === 'completed',
  ].filter(Boolean).length
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${ok ? 'text-green-600' : 'text-gray-400'}`}>
      {ok ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {label}
    </span>
  )
}

// --- Overview Dashboard ---
function OverviewDashboard({
  projects,
  activeFilter,
  setActiveFilter,
  viewMode,
  setViewMode,
}: {
  projects: ProjectRow[]
  activeFilter: FilterMode
  setActiveFilter: (f: FilterMode) => void
  viewMode: ViewMode
  setViewMode: (v: ViewMode) => void
}) {
  const active = projects.filter(p => p.status === 'active' || p.status === 'in_progress')
  const planning = projects.filter(p => p.status === 'planning')
  const completed = projects.filter(p => p.status === 'completed')

  const filters: { key: FilterMode; label: string; count?: number }[] = [
    { key: 'all', label: 'All', count: projects.length },
    { key: 'active', label: 'Active', count: active.length },
    { key: 'planning', label: 'Planning', count: planning.length },
    { key: 'completed', label: 'Completed', count: completed.length },
    { key: 'missing-hero', label: 'Missing Hero', count: projects.filter(p => !p.hero_image_url).length },
    { key: 'missing-description', label: 'Missing Description', count: projects.filter(p => !p.description || p.description.trim().length <= 10).length },
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
          <div className="text-xs text-gray-500">Active</div>
        </div>
        {planning.length > 0 && (
          <div>
            <div className="text-2xl font-bold text-amber-600">{planning.length}</div>
            <div className="text-xs text-gray-500">Planning</div>
          </div>
        )}
        {completed.length > 0 && (
          <div>
            <div className="text-2xl font-bold text-blue-600">{completed.length}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
        )}
        <div className="ml-auto text-sm text-gray-600">
          <span className="font-semibold text-green-600">
            {projects.filter(p => completenessScore(p) === 5).length}
          </span>{' '}
          fully set up
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
  onEdit,
  onSetHero,
}: {
  project: ProjectRow
  onEdit: () => void
  onSetHero: () => void
}) {
  const score = completenessScore(project)
  const status = statusColors[project.status] || statusColors.planning

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Hero image */}
      <div className="aspect-[16/9] bg-gray-100 relative overflow-hidden">
        {project.hero_image_url ? (
          <img src={project.hero_image_url} alt={project.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-gray-300">
              <ImageIcon className="w-10 h-10 mx-auto mb-1" />
              <p className="text-xs">No hero image</p>
            </div>
          </div>
        )}
        <div className={`absolute top-2 left-2 px-2 py-0.5 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
          {status.label}
        </div>
        {project.featured && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
            Featured
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
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden mr-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  score === 5 ? 'bg-green-500' : score >= 3 ? 'bg-amber-500' : 'bg-red-400'
                }`}
                style={{ width: `${(score / 5) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-500">{score}/5</span>
          </div>
        </div>

        {/* Status icons row */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] mb-3">
          <StatusPill ok={!!project.hero_image_url} label="Hero" />
          <StatusPill ok={!!(project.description && project.description.trim().length > 10)} label="Desc" />
          <StatusPill ok={!!project.tagline} label="Tagline" />
          <StatusPill ok={!!project.start_date} label="Date" />
          <StatusPill ok={project.status !== 'planning'} label="Active" />
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <Link
            href={`/picc/innovation/${project.slug}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-picc-red border border-picc-red rounded-lg hover:bg-picc-red/90 transition-colors"
          >
            View Detail
          </Link>
          <button
            onClick={onEdit}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            title="Edit project"
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            onClick={onSetHero}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            title="Set hero image"
          >
            <Camera className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Main Page ---
export default function InnovationAdminPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [activeFilter, setActiveFilter] = useState<FilterMode>('all')

  // Media picker for quick "Set Hero"
  const [heroPickerSlug, setHeroPickerSlug] = useState<string | null>(null)
  const [settingHero, setSettingHero] = useState(false)

  // Delete state
  const [deleting, setDeleting] = useState(false)

  // Edit modal
  const [editModal, setEditModal] = useState<{
    open: boolean
    project: ProjectRow | null
    name: string
    slug: string
    tagline: string
    description: string
    status: string
  }>({ open: false, project: null, name: '', slug: '', tagline: '', description: '', status: 'planning' })

  // Create project form
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    status: 'planning',
    project_type: 'innovation',
  })

  const computedSlug = useMemo(() => (
    form.slug.trim() ? form.slug :
    form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  ), [form.slug, form.name])

  // --- Data loading ---
  const loadProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/projects', { cache: 'no-store' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to load projects')
      setProjects((json.data || []) as ProjectRow[])
    } catch (e: any) {
      setError(e?.message || 'Failed to load projects')
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  // --- Filtering ---
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      switch (activeFilter) {
        case 'active': return p.status === 'active' || p.status === 'in_progress'
        case 'planning': return p.status === 'planning'
        case 'completed': return p.status === 'completed'
        case 'missing-hero': return !p.hero_image_url
        case 'missing-description': return !p.description || p.description.trim().length <= 10
        default: return true
      }
    })
  }, [projects, activeFilter])

  // --- Create project ---
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
          tagline: form.tagline.trim() || undefined,
          description: form.description.trim() || undefined,
          status: form.status,
          project_type: form.project_type,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to create project')
      setForm({ name: '', slug: '', tagline: '', description: '', status: 'planning', project_type: 'innovation' })
      setShowCreateForm(false)
      await loadProjects()
    } catch (e: any) {
      setError(e?.message || 'Failed to create project')
    } finally {
      setSaving(false)
    }
  }

  // --- Set hero image via media picker ---
  const handleSetHeroImage = async (media: any) => {
    if (!heroPickerSlug) return
    setSettingHero(true)
    const project = projects.find(p => p.slug === heroPickerSlug)
    setHeroPickerSlug(null)
    if (!project) { setSettingHero(false); return }
    try {
      const res = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: project.id, hero_image_url: media.public_url }),
      })
      if (res.ok) {
        setProjects(prev => prev.map(p =>
          p.id === project.id ? { ...p, hero_image_url: media.public_url } : p
        ))
      }
    } catch (err) {
      console.error('Failed to set hero image:', err)
      setError('Failed to set hero image')
    } finally {
      setSettingHero(false)
    }
  }

  const openEdit = (project: ProjectRow) => {
    setEditModal({
      open: true,
      project,
      name: project.name,
      slug: project.slug,
      tagline: project.tagline || '',
      description: project.description || '',
      status: project.status,
    })
  }

  const saveProject = async () => {
    if (!editModal.project) return
    const name = editModal.name.trim()
    const slug = editModal.slug.trim()
    if (!name) { setError('Project name is required'); return }
    if (!slug) { setError('Project slug is required'); return }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editModal.project.id,
          name,
          slug,
          tagline: editModal.tagline.trim() || null,
          description: editModal.description.trim() || null,
          status: editModal.status,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to save project')
      setEditModal(p => ({ ...p, open: false, project: null }))
      await loadProjects()
    } catch (e: any) {
      setError(e?.message || 'Failed to save project')
    } finally {
      setSaving(false)
    }
  }

  const deleteProject = async (project: ProjectRow) => {
    if (!confirm(`Permanently delete "${project.name}"? This cannot be undone.`)) return
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects?id=${project.id}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to delete project')
      setEditModal(p => ({ ...p, open: false, project: null }))
      await loadProjects()
    } catch (e: any) {
      setError(e?.message || 'Failed to delete project')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/picc/dashboard"
          className="inline-flex items-center gap-2 mb-4 text-xs uppercase font-bold tracking-widest hover:opacity-80"
          style={{ color: '#6B6560', letterSpacing: '0.2em' }}
        >
          <ArrowLeft className="w-3 h-3" />
          Dashboard
        </Link>

        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p
              className="uppercase font-bold mb-2"
              style={{ color: '#8B1A1A', fontSize: 11, letterSpacing: '0.3em' }}
            >
              PICC admin · innovation
            </p>
            <div className="flex items-center gap-3">
              <Lightbulb className="w-7 h-7" style={{ color: '#C8963E' }} />
              <h1
                className="font-fraunces font-bold leading-tight"
                style={{ color: '#0B4F6C', fontSize: 'clamp(28px, 4vw, 40px)' }}
              >
                Innovation projects.
              </h1>
            </div>
            <p className="mt-2 text-sm" style={{ color: '#6B6560' }}>
              5 active + planning. The pipeline of where the platform is heading.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadProjects}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:opacity-90 transition disabled:opacity-50"
              style={{ border: '1px solid #E8E6E3', color: '#6B6560' }}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-widest rounded-md hover:opacity-90 transition"
              style={{ backgroundColor: '#0B4F6C', color: '#FBF8EE', letterSpacing: '0.15em' }}
            >
              <Plus className="w-4 h-4" />
              Add project
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

      {/* Create Project Form */}
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
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30 focus:border-picc-red"
                placeholder="e.g. Community Digital Hub"
              />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Slug</div>
              <input
                value={form.slug}
                onChange={(e) => setForm(p => ({ ...p, slug: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30 focus:border-picc-red"
                placeholder={computedSlug || 'auto-generated'}
              />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Tagline</div>
              <input
                value={form.tagline}
                onChange={(e) => setForm(p => ({ ...p, tagline: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30 focus:border-picc-red"
                placeholder="A short tagline for the project"
              />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Status</div>
              <select
                value={form.status}
                onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30 focus:border-picc-red bg-white"
              >
                <option value="planning">Planning</option>
                <option value="in_progress">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs text-gray-500 mb-1">Description</div>
              <textarea
                value={form.description}
                onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30 focus:border-picc-red"
                placeholder="What is this project about?"
              />
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
              onEdit={() => openEdit(project)}
              onSetHero={() => setHeroPickerSlug(project.slug)}
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
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-left font-medium px-4 py-3">Tagline</th>
                  <th className="text-left font-medium px-4 py-3">Start Date</th>
                  <th className="text-left font-medium px-4 py-3">Content</th>
                  <th className="text-left font-medium px-4 py-3">Public</th>
                  <th className="text-left font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map(p => {
                  const score = completenessScore(p)
                  const status = statusColors[p.status] || statusColors.planning
                  return (
                    <tr key={p.id} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-900 font-medium">{p.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{p.tagline || '\u2014'}</td>
                      <td className="px-4 py-3 text-gray-600">{p.start_date || '\u2014'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${score === 5 ? 'bg-green-500' : score >= 3 ? 'bg-amber-500' : 'bg-red-400'}`}
                              style={{ width: `${(score / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{score}/5</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {p.is_public ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">Yes</span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/picc/innovation/${p.slug}`}
                            className="px-2 py-1.5 rounded-lg border border-picc-red bg-picc-red text-white hover:bg-picc-red/90 text-xs font-medium"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1.5 rounded-lg hover:bg-gray-50 border border-gray-200"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5 text-gray-700" />
                          </button>
                          <button
                            onClick={() => setHeroPickerSlug(p.slug)}
                            className="p-1.5 rounded-lg hover:bg-gray-50 border border-gray-200"
                            title="Set hero image"
                          >
                            <Camera className="w-3.5 h-3.5 text-gray-700" />
                          </button>
                          <button
                            onClick={() => deleteProject(p)}
                            className="p-1.5 rounded-lg hover:bg-red-50 border border-red-200"
                            title="Delete"
                            disabled={deleting}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </button>
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

      {/* Setting hero indicator */}
      {settingHero && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2 flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          Setting hero image...
        </div>
      )}

      {/* Media Picker for quick hero image */}
      <MediaPickerDialog
        open={!!heroPickerSlug}
        kind="image"
        onClose={() => setHeroPickerSlug(null)}
        onPick={handleSetHeroImage}
      />

      {/* Edit modal */}
      {editModal.open && editModal.project && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-gray-900">Edit project</div>
                <div className="text-sm text-gray-500">{editModal.project.slug}</div>
              </div>
              <button
                onClick={() => setEditModal(p => ({ ...p, open: false, project: null }))}
                className="p-2 rounded-lg hover:bg-gray-100"
                disabled={saving}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Name</div>
                <input
                  value={editModal.name}
                  onChange={e => setEditModal(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30 focus:border-picc-red"
                />
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Slug</div>
                <input
                  value={editModal.slug}
                  onChange={e => setEditModal(p => ({ ...p, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30 focus:border-picc-red"
                />
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Tagline</div>
                <input
                  value={editModal.tagline}
                  onChange={e => setEditModal(p => ({ ...p, tagline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30 focus:border-picc-red"
                />
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Status</div>
                <select
                  value={editModal.status}
                  onChange={e => setEditModal(p => ({ ...p, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30 focus:border-picc-red bg-white"
                >
                  <option value="planning">Planning</option>
                  <option value="in_progress">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-gray-500 mb-1">Description</div>
                <textarea
                  value={editModal.description}
                  onChange={e => setEditModal(p => ({ ...p, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30 focus:border-picc-red"
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => editModal.project && deleteProject(editModal.project)}
                className="px-3 py-2 rounded-lg border border-red-200 hover:bg-red-50 text-red-700 text-sm"
                disabled={deleting || saving}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={saveProject}
                disabled={saving}
                className="px-4 py-2 bg-picc-red text-white rounded-lg hover:bg-picc-red/90 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
