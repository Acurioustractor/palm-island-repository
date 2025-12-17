'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Loader2, Pencil, Trash2, X, Check } from 'lucide-react'

type ServiceRow = {
  id: string
  name: string
  slug: string
  service_category: string | null
  description: string | null
  is_active: boolean | null
  metadata?: any
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [mergeState, setMergeState] = useState<{ fromId: string; toId: string; merging: boolean }>({
    fromId: '',
    toId: '',
    merging: false,
  })

  const [form, setForm] = useState({
    name: '',
    slug: '',
    service_category: '',
    description: '',
    is_active: true,
    map_x: '',
    map_y: '',
  })

  const computedSlug = useMemo(() => (form.slug.trim() ? form.slug : slugify(form.name)), [form.slug, form.name])
  const computedMeta = useMemo(() => {
    const hasX = form.map_x.trim() !== ''
    const hasY = form.map_y.trim() !== ''
    const mx = hasX ? Number(form.map_x) : NaN
    const my = hasY ? Number(form.map_y) : NaN
    const metadata: Record<string, unknown> = {}
    if (hasX && Number.isFinite(mx)) metadata.map_x = mx
    if (hasY && Number.isFinite(my)) metadata.map_y = my
    return metadata
  }, [form.map_x, form.map_y])

  const [pinEdits, setPinEdits] = useState<Record<string, { map_x: string; map_y: string; saving?: boolean }>>({})
  const [editModal, setEditModal] = useState<{
    open: boolean
    service: ServiceRow | null
    name: string
    slug: string
    service_category: string
    description: string
    is_active: boolean
    map_x: string
    map_y: string
  }>({
    open: false,
    service: null,
    name: '',
    slug: '',
    service_category: '',
    description: '',
    is_active: true,
    map_x: '',
    map_y: '',
  })

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/services', { cache: 'no-store' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to load services')
      const loaded = (json.services || []) as ServiceRow[]
      setServices(loaded)
      setPinEdits((prev) => {
        const next: Record<string, { map_x: string; map_y: string; saving?: boolean }> = { ...prev }
        for (const s of loaded) {
          if (next[s.id]) continue
          const mx = s?.metadata?.map_x
          const my = s?.metadata?.map_y
          next[s.id] = {
            map_x: typeof mx === 'number' ? String(mx) : (mx ? String(mx) : ''),
            map_y: typeof my === 'number' ? String(my) : (my ? String(my) : ''),
          }
        }
        return next
      })
    } catch (e: any) {
      setError(e?.message || 'Failed to load services')
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const create = async () => {
    const name = form.name.trim()
    if (!name) {
      setError('Name is required')
      return
    }
    setError(null)
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug: computedSlug,
          service_category: form.service_category.trim() || undefined,
          description: form.description.trim() || undefined,
          is_active: form.is_active,
          metadata: Object.keys(computedMeta).length ? computedMeta : undefined,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to create service')

      setForm({ name: '', slug: '', service_category: '', description: '', is_active: true, map_x: '', map_y: '' })
      await load()
    } catch (e: any) {
      setError(e?.message || 'Failed to create service')
    }
  }

  const savePins = async (service: ServiceRow) => {
    const edit = pinEdits[service.id]
    if (!edit) return

    const mx = edit.map_x.trim() === '' ? undefined : Number(edit.map_x)
    const my = edit.map_y.trim() === '' ? undefined : Number(edit.map_y)
    const inRange = (v: number) => v >= 0 && v <= 1
    if (
      (mx !== undefined && (!Number.isFinite(mx) || !inRange(mx))) ||
      (my !== undefined && (!Number.isFinite(my) || !inRange(my)))
    ) {
      setError('Map X/Y must be numbers between 0 and 1 (e.g. 0.52).')
      return
    }

    const metadata = { ...(service.metadata || {}) }
    if (mx === undefined) delete (metadata as any).map_x
    else (metadata as any).map_x = mx
    if (my === undefined) delete (metadata as any).map_y
    else (metadata as any).map_y = my

    setPinEdits((p) => ({ ...p, [service.id]: { ...edit, saving: true } }))
    setError(null)
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to save pin')
      await load()
    } catch (e: any) {
      setError(e?.message || 'Failed to save pin')
    } finally {
      setPinEdits((p) => ({ ...p, [service.id]: { ...p[service.id], saving: false } }))
    }
  }

  const openEdit = (service: ServiceRow) => {
    const mx = service?.metadata?.map_x
    const my = service?.metadata?.map_y
    setEditModal({
      open: true,
      service,
      name: service.name || '',
      slug: service.slug || '',
      service_category: service.service_category || '',
      description: service.description || '',
      is_active: Boolean(service.is_active),
      map_x: typeof mx === 'number' ? String(mx) : (mx ? String(mx) : ''),
      map_y: typeof my === 'number' ? String(my) : (my ? String(my) : ''),
    })
  }

  const saveService = async () => {
    if (!editModal.service) return
    const name = editModal.name.trim()
    const slug = editModal.slug.trim()
    if (!name) return setError('Service name is required')
    if (!slug) return setError('Service slug is required')

    const mx = editModal.map_x.trim() === '' ? undefined : Number(editModal.map_x)
    const my = editModal.map_y.trim() === '' ? undefined : Number(editModal.map_y)
    const inRange = (v: number) => v >= 0 && v <= 1
    if (
      (mx !== undefined && (!Number.isFinite(mx) || !inRange(mx))) ||
      (my !== undefined && (!Number.isFinite(my) || !inRange(my)))
    ) {
      setError('Map X/Y must be numbers between 0 and 1 (e.g. 0.52).')
      return
    }

    const metadata = { ...(editModal.service.metadata || {}) }
    if (mx === undefined) delete (metadata as any).map_x
    else (metadata as any).map_x = mx
    if (my === undefined) delete (metadata as any).map_y
    else (metadata as any).map_y = my

    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/services/${editModal.service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          service_category: editModal.service_category.trim() || null,
          description: editModal.description.trim() || null,
          is_active: editModal.is_active,
          metadata,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to save service')
      setEditModal((p) => ({ ...p, open: false, service: null }))
      await load()
    } catch (e: any) {
      setError(e?.message || 'Failed to save service')
    } finally {
      setSaving(false)
    }
  }

  const deactivateService = async (service: ServiceRow) => {
    if (!confirm(`Deactivate "${service.name}"? It will disappear from dropdowns but remain in history.`)) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: false }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to deactivate service')
      await load()
    } catch (e: any) {
      setError(e?.message || 'Failed to deactivate service')
    } finally {
      setSaving(false)
    }
  }

  const deleteService = async (service: ServiceRow, force: boolean) => {
    const label = force ? 'DELETE (force)' : 'delete'
    if (!confirm(`Permanently ${label} "${service.name}"? This cannot be undone.`)) return
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/services/${service.id}${force ? '?force=1' : ''}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = json?.error || 'Failed to delete service'
        const refs = json?.references
        if (res.status === 409 && refs) {
          throw new Error(`${msg} References: ${Object.entries(refs).map(([k, v]) => `${k}=${v}`).join(', ')}`)
        }
        throw new Error(msg)
      }
      await load()
    } catch (e: any) {
      setError(e?.message || 'Failed to delete service')
    } finally {
      setDeleting(false)
    }
  }

  const mergeServices = async () => {
    const fromId = mergeState.fromId.trim()
    const toId = mergeState.toId.trim()
    if (!fromId || !toId) return setError('Pick both a "from" and "to" service to merge.')
    if (fromId === toId) return setError('Pick two different services to merge.')
    if (!confirm('Merge duplicates? This moves links (stories/profiles/etc) and deactivates the old service.')) return

    setMergeState((p) => ({ ...p, merging: true }))
    setError(null)
    try {
      const res = await fetch('/api/services/merge', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ fromId, toId }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Merge failed')
      setMergeState({ fromId: '', toId: '', merging: false })
      await load()
    } catch (e: any) {
      setError(e?.message || 'Merge failed')
      setMergeState((p) => ({ ...p, merging: false }))
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <Link href="/picc/media" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Media
        </Link>

        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Services</h1>
            <p className="text-gray-600 mt-1">Create and manage PICC services used for tagging and reporting.</p>
          </div>
          <Link href="/picc/projects/manage" className="text-sm text-blue-600 hover:text-blue-700">
            Manage projects →
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Add a service</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Name</div>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Bwgcolman Healing Service"
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
            <div className="text-xs text-gray-400 mt-1">Tag format will be: <code className="bg-gray-100 px-1 rounded">service:{computedSlug || '...'}</code></div>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1">Category (optional)</div>
            <input
              value={form.service_category}
              onChange={(e) => setForm((p) => ({ ...p, service_category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. health, family, youth, culture"
            />
          </div>

          <div className="md:col-span-2">
            <div className="text-xs text-gray-500 mb-1">Description (optional)</div>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Short description used in reports / directory"
            />
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1">Map X (0–1, optional)</div>
            <input
              value={form.map_x}
              onChange={(e) => setForm((p) => ({ ...p, map_x: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 0.52"
            />
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1">Map Y (0–1, optional)</div>
            <input
              value={form.map_y}
              onChange={(e) => setForm((p) => ({ ...p, map_y: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 0.44"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            Active
          </label>

          <button
            onClick={create}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create service
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6">
        <h2 className="font-semibold text-gray-900 mb-2">Merge duplicate services</h2>
        <p className="text-sm text-gray-600 mb-4">
          Moves links (stories, profiles, members, snapshots) from one service to another, then deactivates the old one.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">From (duplicate to remove)</div>
            <select
              value={mergeState.fromId}
              onChange={(e) => setMergeState((p) => ({ ...p, fromId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select service…</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.slug})
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">To (keep)</div>
            <select
              value={mergeState.toId}
              onChange={(e) => setMergeState((p) => ({ ...p, toId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select service…</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.slug})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={mergeServices}
            disabled={mergeState.merging}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {mergeState.merging ? 'Merging…' : 'Merge'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">All services</h2>
          <button onClick={load} className="text-sm text-blue-600 hover:text-blue-700">
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-6 flex items-center gap-2 text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading…
          </div>
        ) : services.length === 0 ? (
          <div className="p-6 text-gray-600">No services found. Add your first service above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Name</th>
                  <th className="text-left font-medium px-4 py-3">Category</th>
                  <th className="text-left font-medium px-4 py-3">Slug</th>
                  <th className="text-left font-medium px-4 py-3">Map X</th>
                  <th className="text-left font-medium px-4 py-3">Map Y</th>
                  <th className="text-left font-medium px-4 py-3">Pins</th>
                  <th className="text-left font-medium px-4 py-3">Active</th>
                  <th className="text-left font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-gray-900">{s.name}</td>
                    <td className="px-4 py-3 text-gray-700">{s.service_category || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">
                      <code className="bg-gray-100 px-1 rounded">{s.slug}</code>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={pinEdits[s.id]?.map_x ?? ''}
                        onChange={(e) => setPinEdits((p) => ({ ...p, [s.id]: { ...(p[s.id] || { map_y: '' }), map_x: e.target.value, map_y: p[s.id]?.map_y ?? '' } }))}
                        className="w-24 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0.5"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={pinEdits[s.id]?.map_y ?? ''}
                        onChange={(e) => setPinEdits((p) => ({ ...p, [s.id]: { ...(p[s.id] || { map_x: '' }), map_y: e.target.value, map_x: p[s.id]?.map_x ?? '' } }))}
                        className="w-24 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0.5"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => savePins(s)}
                        disabled={pinEdits[s.id]?.saving}
                        className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      >
                        {pinEdits[s.id]?.saving ? 'Saving…' : 'Save'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {s.is_active ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-green-100 text-green-700">Yes</span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(s)}
                          className="p-2 rounded-lg hover:bg-gray-50 border border-gray-200"
                          title="Edit service"
                        >
                          <Pencil className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                          onClick={() => deactivateService(s)}
                          className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm"
                          disabled={saving}
                          title="Deactivate (hide from dropdowns)"
                        >
                          Deactivate
                        </button>
                        <button
                          onClick={() => deleteService(s, false)}
                          className="p-2 rounded-lg hover:bg-red-50 border border-red-200"
                          title="Delete service"
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

      {editModal.open && editModal.service && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-gray-900">Edit service</div>
                <div className="text-sm text-gray-500">{editModal.service.id}</div>
              </div>
              <button
                onClick={() => setEditModal((p) => ({ ...p, open: false, service: null }))}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Close"
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
                <div className="text-xs text-gray-400 mt-1">
                  Tag format: <code className="bg-gray-100 px-1 rounded">service:{editModal.slug || '...'}</code>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">Category</div>
                <input
                  value={editModal.service_category}
                  onChange={(e) => setEditModal((p) => ({ ...p, service_category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-end gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={editModal.is_active}
                    onChange={(e) => setEditModal((p) => ({ ...p, is_active: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  Active
                </label>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">Map X (0–1)</div>
                <input
                  value={editModal.map_x}
                  onChange={(e) => setEditModal((p) => ({ ...p, map_x: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 0.52"
                />
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">Map Y (0–1)</div>
                <input
                  value={editModal.map_y}
                  onChange={(e) => setEditModal((p) => ({ ...p, map_y: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 0.44"
                />
              </div>

              <div className="md:col-span-2">
                <div className="text-xs text-gray-500 mb-1">Description</div>
                <textarea
                  value={editModal.description}
                  onChange={(e) => setEditModal((p) => ({ ...p, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-5 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => editModal.service && deactivateService(editModal.service)}
                  className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm"
                  disabled={saving}
                >
                  Deactivate
                </button>
                <button
                  onClick={() => editModal.service && deleteService(editModal.service, false)}
                  className="px-3 py-2 rounded-lg border border-red-200 hover:bg-red-50 text-red-700 text-sm"
                  disabled={deleting || saving}
                >
                  Delete
                </button>
                <button
                  onClick={() => editModal.service && deleteService(editModal.service, true)}
                  className="px-3 py-2 rounded-lg border border-red-200 hover:bg-red-50 text-red-700 text-sm"
                  disabled={deleting || saving}
                  title="Force delete even if referenced"
                >
                  Force delete
                </button>
              </div>
              <button
                onClick={saveService}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-2"
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
