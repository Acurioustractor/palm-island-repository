'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Pencil, Plus, Trash2, X } from 'lucide-react'

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
  created_at?: string | null
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const STATUS_OPTIONS = ['planning', 'in_progress', 'on_hold', 'completed', 'archived'] as const
const TYPE_OPTIONS = ['innovation', 'infrastructure', 'cultural', 'research', 'other'] as const

export default function ManageProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    status: 'in_progress',
    project_type: 'innovation',
    hero_image_url: '',
    is_public: true,
    featured: false,
  })

  const computedSlug = useMemo(() => (form.slug.trim() ? form.slug : slugify(form.name)), [form.slug, form.name])

  const [editModal, setEditModal] = useState<{
    open: boolean
    project: ProjectRow | null
    name: string
    slug: string
    tagline: string
    description: string
    status: string
    project_type: string
    hero_image_url: string
    is_public: boolean
    featured: boolean
  }>({
    open: false,
    project: null,
    name: '',
    slug: '',
    tagline: '',
    description: '',
    status: 'in_progress',
    project_type: 'innovation',
    hero_image_url: '',
    is_public: true,
    featured: false,
  })

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/projects?limit=500', { cache: 'no-store' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to load projects')
      setProjects((json.data || []) as ProjectRow[])
    } catch (e: any) {
      setProjects([])
      setError(e?.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const create = async () => {
    const name = form.name.trim()
    if (!name) return setError('Project name is required')
    const slug = computedSlug.trim()
    if (!slug) return setError('Project slug is required')

    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          tagline: form.tagline.trim() || null,
          description: form.description.trim() || null,
          status: form.status,
          project_type: form.project_type,
          hero_image_url: form.hero_image_url.trim() || null,
          is_public: form.is_public,
          featured: form.featured,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to create project')
      setForm({
        name: '',
        slug: '',
        tagline: '',
        description: '',
        status: 'in_progress',
        project_type: 'innovation',
        hero_image_url: '',
        is_public: true,
        featured: false,
      })
      await load()
    } catch (e: any) {
      setError(e?.message || 'Failed to create project')
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (project: ProjectRow) => {
    setEditModal({
      open: true,
      project,
      name: project.name || '',
      slug: project.slug || '',
      tagline: project.tagline || '',
      description: project.description || '',
      status: project.status || 'in_progress',
      project_type: project.project_type || 'innovation',
      hero_image_url: project.hero_image_url || '',
      is_public: project.is_public !== false,
      featured: project.featured === true,
    })
  }

  const save = async () => {
    if (!editModal.project) return
    const name = editModal.name.trim()
    if (!name) return setError('Project name is required')
    const slug = editModal.slug.trim()
    if (!slug) return setError('Project slug is required')

    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: editModal.project.id,
          name,
          slug,
          tagline: editModal.tagline.trim() || null,
          description: editModal.description.trim() || null,
          status: editModal.status,
          project_type: editModal.project_type,
          hero_image_url: editModal.hero_image_url.trim() || null,
          is_public: editModal.is_public,
          featured: editModal.featured,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to save project')
      setEditModal((p) => ({ ...p, open: false, project: null }))
      await load()
    } catch (e: any) {
      setError(e?.message || 'Failed to save project')
    } finally {
      setSaving(false)
    }
  }

  const archive = async (project: ProjectRow) => {
    if (!confirm(`Archive "${project.name}"? It will be hidden from public listings.`)) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: project.id, status: 'archived' }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to archive project')
      await load()
    } catch (e: any) {
      setError(e?.message || 'Failed to archive project')
    } finally {
      setSaving(false)
    }
  }

  const deleteProject = async (project: ProjectRow) => {
    if (!confirm(`Permanently delete "${project.name}"? This cannot be undone.`)) return
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects?id=${encodeURIComponent(project.id)}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to delete project')
      await load()
    } catch (e: any) {
      setError(e?.message || 'Failed to delete project')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <Link href="/picc/projects" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>

        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Manage Projects</h1>
            <p className="text-gray-600 mt-1">Create, edit, archive, or delete innovation projects.</p>
          </div>
          <Link href="/picc/services" className="text-sm text-blue-600 hover:text-blue-700">
            Manage services →
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Add a project</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Name</div>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Photo Studio"
            />
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1">Slug</div>
            <input
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={computedSlug || 'auto-generated'}
            />
            <div className="text-xs text-gray-400 mt-1">
              Tag format: <code className="bg-gray-100 px-1 rounded">project:{computedSlug || '...'}</code>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="text-xs text-gray-500 mb-1">Tagline (optional)</div>
            <input
              value={form.tagline}
              onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Short punchy summary"
            />
          </div>

          <div className="md:col-span-2">
            <div className="text-xs text-gray-500 mb-1">Description (optional)</div>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Used on the public report and project page"
            />
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1">Status</div>
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1">Type</div>
            <select
              value={form.project_type}
              onChange={(e) => setForm((p) => ({ ...p, project_type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <div className="text-xs text-gray-500 mb-1">Hero image URL (optional)</div>
            <input
              value={form.hero_image_url}
              onChange={(e) => setForm((p) => ({ ...p, hero_image_url: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Paste a media public URL (or add later)"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.is_public}
                onChange={(e) => setForm((p) => ({ ...p, is_public: e.target.checked }))}
              />
              Public
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
              />
              Featured
            </label>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              onClick={create}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {saving ? 'Saving…' : 'Create project'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="font-semibold text-gray-900">Projects ({projects.length})</div>
          <button onClick={load} className="text-sm text-blue-600 hover:text-blue-700" disabled={loading}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-gray-600">Loading…</div>
        ) : projects.length === 0 ? (
          <div className="p-6 text-gray-600">No projects found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Name</th>
                  <th className="text-left font-medium px-4 py-3">Type</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-left font-medium px-4 py-3">Public</th>
                  <th className="text-left font-medium px-4 py-3">Featured</th>
                  <th className="text-left font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-500">
                        <code className="bg-gray-100 px-1 rounded">{p.slug}</code>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.project_type || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{p.status || '—'}</td>
                    <td className="px-4 py-3">{p.is_public === false ? 'No' : 'Yes'}</td>
                    <td className="px-4 py-3">{p.featured ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-2 rounded-lg hover:bg-gray-50 border border-gray-200"
                          title="Edit project"
                        >
                          <Pencil className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                          onClick={() => archive(p)}
                          className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm"
                          disabled={saving}
                          title="Archive (hide from public)"
                        >
                          Archive
                        </button>
                        <button
                          onClick={() => deleteProject(p)}
                          className="p-2 rounded-lg hover:bg-red-50 border border-red-200"
                          title="Delete project"
                          disabled={deleting}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editModal.open && editModal.project && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-gray-900">Edit project</div>
                <div className="text-sm text-gray-500">{editModal.project.id}</div>
              </div>
              <button
                onClick={() => setEditModal((p) => ({ ...p, open: false, project: null }))}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Close"
                disabled={saving}
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Name</div>
                  <input
                    value={editModal.name}
                    onChange={(e) => setEditModal((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Slug</div>
                  <input
                    value={editModal.slug}
                    onChange={(e) => setEditModal((p) => ({ ...p, slug: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">Tagline</div>
                <input
                  value={editModal.tagline}
                  onChange={(e) => setEditModal((p) => ({ ...p, tagline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">Description</div>
                <textarea
                  value={editModal.description}
                  onChange={(e) => setEditModal((p) => ({ ...p, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Status</div>
                  <select
                    value={editModal.status}
                    onChange={(e) => setEditModal((p) => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Type</div>
                  <select
                    value={editModal.project_type}
                    onChange={(e) => setEditModal((p) => ({ ...p, project_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">Hero image URL</div>
                <input
                  value={editModal.hero_image_url}
                  onChange={(e) => setEditModal((p) => ({ ...p, hero_image_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={editModal.is_public}
                    onChange={(e) => setEditModal((p) => ({ ...p, is_public: e.target.checked }))}
                  />
                  Public
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={editModal.featured}
                    onChange={(e) => setEditModal((p) => ({ ...p, featured: e.target.checked }))}
                  />
                  Featured
                </label>
              </div>
            </div>

            <div className="p-5 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setEditModal((p) => ({ ...p, open: false, project: null }))}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={save}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

