'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Loader2, Pencil, Trash2, X, Check,
  LayoutGrid, List, Camera, MapPin, Navigation, Image as ImageIcon,
  FileText, CheckCircle2, XCircle, Filter, RefreshCw
} from 'lucide-react'
import MediaPickerDialog from '@/components/admin/MediaPickerDialog'

type ServiceRow = {
  id: string
  name: string
  slug: string
  service_category: string | null
  description: string | null
  is_active: boolean | null
  metadata?: any
}

type ContentStatusMap = Record<string, {
  hasCover: boolean
  coverUrl?: string
  photoCount: number
  hasVideo: boolean
  hasDescription: boolean
  hasGeo: boolean
}>

type ViewMode = 'cards' | 'table'
type FilterMode = 'all' | 'missing-cover' | 'missing-geo' | 'missing-description' | 'complete'

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function completenessScore(status: ContentStatusMap[string] | undefined): number {
  if (!status) return 0
  return [status.hasCover, status.photoCount > 0, status.hasVideo, status.hasDescription, status.hasGeo]
    .filter(Boolean).length
}

// --- Overview Dashboard ---
function OverviewDashboard({
  services,
  contentStatus,
  activeFilter,
  setActiveFilter,
  viewMode,
  setViewMode,
}: {
  services: ServiceRow[]
  contentStatus: ContentStatusMap
  activeFilter: FilterMode
  setActiveFilter: (f: FilterMode) => void
  viewMode: ViewMode
  setViewMode: (v: ViewMode) => void
}) {
  const active = services.filter(s => s.is_active !== false)
  const inactive = services.filter(s => s.is_active === false)

  const complete = active.filter(s => completenessScore(contentStatus[s.slug]) === 5)
  const needsAttention = active.length - complete.length

  const filters: { key: FilterMode; label: string; count?: number }[] = [
    { key: 'all', label: 'All', count: services.length },
    { key: 'missing-cover', label: 'Missing Cover', count: services.filter(s => !contentStatus[s.slug]?.hasCover).length },
    { key: 'missing-geo', label: 'Missing Geo', count: services.filter(s => !contentStatus[s.slug]?.hasGeo).length },
    { key: 'missing-description', label: 'Missing Description', count: services.filter(s => !contentStatus[s.slug]?.hasDescription).length },
    { key: 'complete', label: 'Complete', count: complete.length },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-6">
      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-6 mb-4">
        <div>
          <div className="text-2xl font-bold text-gray-900">{services.length}</div>
          <div className="text-xs text-gray-500">Total Services</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">{active.length}</div>
          <div className="text-xs text-gray-500">Active</div>
        </div>
        {inactive.length > 0 && (
          <div>
            <div className="text-2xl font-bold text-gray-400">{inactive.length}</div>
            <div className="text-xs text-gray-500">Inactive</div>
          </div>
        )}
        <div className="ml-auto text-sm text-gray-600">
          <span className="font-semibold text-green-600">{complete.length}</span> fully set up
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

// --- Service Content Card ---
function ServiceContentCard({
  service,
  status,
  onEdit,
  onSetCover,
  onLocate,
}: {
  service: ServiceRow
  status: ContentStatusMap[string] | undefined
  onEdit: () => void
  onSetCover: () => void
  onLocate: () => void
}) {
  const score = completenessScore(status)
  const isInactive = service.is_active === false

  return (
    <div className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${isInactive ? 'border-gray-200 opacity-60' : 'border-gray-200'}`}>
      {/* Cover photo */}
      <div className="aspect-[16/9] bg-gray-100 relative overflow-hidden">
        {status?.hasCover && status.coverUrl ? (
          <img src={status.coverUrl} alt={service.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-gray-300">
              <ImageIcon className="w-10 h-10 mx-auto mb-1" />
              <p className="text-xs">No cover photo</p>
            </div>
          </div>
        )}
        {isInactive && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-gray-900/70 text-white text-xs rounded-full">
            Inactive
          </div>
        )}
        {service.service_category && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
            {service.service_category}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-1">{service.name}</h3>

        {/* Progress bar */}
        {status && (
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
        )}

        {/* Status icons row */}
        {status && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] mb-3">
            <StatusPill ok={status.hasCover} label="Cover" />
            <StatusPill ok={status.photoCount > 0} label="Photos" />
            <StatusPill ok={status.hasVideo} label="Video" />
            <StatusPill ok={status.hasDescription} label="Desc" />
            <StatusPill ok={status.hasGeo} label="Geo" />
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
          <button
            onClick={onLocate}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            title="Set GPS location"
          >
            <MapPin className="w-3 h-3" />
          </button>
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
export default function ServicesPage() {
  const [services, setServices] = useState<ServiceRow[]>([])
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

  // Create service form
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    name: '',
    slug: '',
    service_category: '',
    description: '',
    is_active: true,
    map_x: '',
    map_y: '',
  })

  // Table view state
  const [mergeState, setMergeState] = useState<{ fromId: string; toId: string; merging: boolean }>({
    fromId: '',
    toId: '',
    merging: false,
  })
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
  const [pinEdits, setPinEdits] = useState<Record<string, { map_x: string; map_y: string; saving?: boolean }>>({})

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

  // --- Data loading ---
  const loadServices = useCallback(async () => {
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
      return loaded
    } catch (e: any) {
      setError(e?.message || 'Failed to load services')
      setServices([])
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const loadContentStatus = useCallback(async (serviceList: ServiceRow[]) => {
    if (serviceList.length === 0) return
    setContentLoading(true)
    try {
      // Batch fetch: get all media tagged with service:* in one call per type
      // We fetch photos and videos with service tags, plus hero-tagged photos
      const slugs = serviceList.map(s => s.slug)

      // For each service, we need: cover (hero), photo count, video presence
      // Strategy: fetch all service-tagged media in bulk, then bucket client-side
      const [photosRes, videosRes] = await Promise.all([
        fetch(`/api/media/list?limit=500&fileType=image`).then(r => r.ok ? r.json() : { data: [] }),
        fetch(`/api/media/list?limit=500&fileType=video`).then(r => r.ok ? r.json() : { data: [] }),
      ])

      const photos = Array.isArray(photosRes.data) ? photosRes.data : []
      const videos = Array.isArray(videosRes.data) ? videosRes.data : []

      const statusMap: ContentStatusMap = {}
      for (const svc of serviceList) {
        const serviceTag = `service:${svc.slug}`
        const svcPhotos = photos.filter((p: any) => Array.isArray(p.tags) && p.tags.includes(serviceTag))
        const heroPhoto = svcPhotos.find((p: any) => Array.isArray(p.tags) && p.tags.includes('hero'))
        const svcVideos = videos.filter((v: any) => Array.isArray(v.tags) && v.tags.includes(serviceTag))
        const meta = svc.metadata || {}

        statusMap[svc.slug] = {
          hasCover: !!heroPhoto,
          coverUrl: heroPhoto?.public_url,
          photoCount: svcPhotos.length,
          hasVideo: svcVideos.length > 0,
          hasDescription: !!(svc.description && svc.description.trim().length > 10),
          hasGeo: !!(meta.latitude && meta.longitude),
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
    loadServices().then(loaded => loadContentStatus(loaded))
  }, [loadServices, loadContentStatus])

  const refresh = async () => {
    const loaded = await loadServices()
    await loadContentStatus(loaded)
  }

  // --- Filtering ---
  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const status = contentStatus[s.slug]
      switch (activeFilter) {
        case 'missing-cover': return !status?.hasCover
        case 'missing-geo': return !status?.hasGeo
        case 'missing-description': return !status?.hasDescription
        case 'complete': return completenessScore(status) === 5
        default: return true
      }
    })
  }, [services, contentStatus, activeFilter])

  // --- CRUD operations ---
  const create = async () => {
    const name = form.name.trim()
    if (!name) { setError('Name is required'); return }
    setSaving(true)
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
      setShowCreateForm(false)
      await refresh()
    } catch (e: any) {
      setError(e?.message || 'Failed to create service')
    } finally {
      setSaving(false)
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
      await refresh()
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
          name, slug,
          service_category: editModal.service_category.trim() || null,
          description: editModal.description.trim() || null,
          is_active: editModal.is_active,
          metadata,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to save service')
      setEditModal((p) => ({ ...p, open: false, service: null }))
      await refresh()
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
      await refresh()
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
      await refresh()
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
      await refresh()
    } catch (e: any) {
      setError(e?.message || 'Merge failed')
      setMergeState((p) => ({ ...p, merging: false }))
    }
  }

  // --- Quick actions from card view ---
  const handleSetCoverPhoto = async (media: any) => {
    if (!coverPickerSlug) return
    setSettingCover(true)
    setCoverPickerSlug(null)
    const serviceTag = `service:${coverPickerSlug}`
    try {
      // Remove hero tag from any existing cover
      const heroTags = `${serviceTag},hero`
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
      // Add service + hero tags to selected photo
      await fetch('/api/media/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaIds: [media.id], addTags: [serviceTag, 'hero'] }),
      })
      // Update local state
      setContentStatus(prev => ({
        ...prev,
        [coverPickerSlug!]: {
          ...prev[coverPickerSlug!],
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

  const handleLocate = async (service: ServiceRow) => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        try {
          const currentMeta = service.metadata || {}
          const res = await fetch(`/api/services/${service.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              metadata: { ...currentMeta, latitude, longitude },
            }),
          })
          if (res.ok) {
            setContentStatus(prev => ({
              ...prev,
              [service.slug]: { ...prev[service.slug], hasGeo: true },
            }))
          }
        } catch (err) {
          console.error('Failed to save location:', err)
          setError('Failed to save location')
        }
      },
      (err) => {
        console.error('Geolocation error:', err)
        setError('Could not get your location. Make sure location access is allowed.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
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
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Service Content Hub</h1>
            <p className="text-gray-600 mt-1">Manage content completeness across all PICC services.</p>
          </div>
          <div className="flex items-center gap-2">
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
              Add Service
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

      {/* Create Service Form (collapsible) */}
      {showCreateForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Add a service</h2>
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
                placeholder="e.g. Bwgcolman Healing Service"
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
              <div className="text-xs text-gray-400 mt-1">Tag: <code className="bg-gray-100 px-1 rounded">service:{computedSlug || '...'}</code></div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Category</div>
              <input
                value={form.service_category}
                onChange={(e) => setForm((p) => ({ ...p, service_category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30 focus:border-picc-red"
                placeholder="e.g. health, family, youth, culture"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-picc-red focus:ring-2 focus:ring-picc-red/30"
                />
                Active
              </label>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs text-gray-500 mb-1">Description</div>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30 focus:border-picc-red"
                placeholder="Short description used in reports / directory"
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
              Create service
            </button>
          </div>
        </div>
      )}

      {/* Overview Dashboard */}
      {!loading && (
        <OverviewDashboard
          services={services}
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
          <span className="text-gray-600">Loading services...</span>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-2">
            {activeFilter === 'all' ? 'No services found.' : 'No services match this filter.'}
          </div>
          {activeFilter !== 'all' && (
            <button onClick={() => setActiveFilter('all')} className="text-sm text-picc-red hover:underline">
              Show all services
            </button>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        /* ---- CARD VIEW ---- */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredServices.map(service => (
            <ServiceContentCard
              key={service.id}
              service={service}
              status={contentStatus[service.slug]}
              onEdit={() => setSlideOverSlug(service.slug)}
              onSetCover={() => setCoverPickerSlug(service.slug)}
              onLocate={() => handleLocate(service)}
            />
          ))}
        </div>
      ) : (
        /* ---- TABLE VIEW ---- */
        <div className="space-y-6">
          {/* Merge section */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30"
                >
                  <option value="">Select service...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.slug})</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">To (keep)</div>
                <select
                  value={mergeState.toId}
                  onChange={(e) => setMergeState((p) => ({ ...p, toId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30"
                >
                  <option value="">Select service...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.slug})</option>
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
                {mergeState.merging ? 'Merging...' : 'Merge'}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left font-medium px-4 py-3">Name</th>
                    <th className="text-left font-medium px-4 py-3">Category</th>
                    <th className="text-left font-medium px-4 py-3">Slug</th>
                    <th className="text-left font-medium px-4 py-3">Content</th>
                    <th className="text-left font-medium px-4 py-3">Map X</th>
                    <th className="text-left font-medium px-4 py-3">Map Y</th>
                    <th className="text-left font-medium px-4 py-3">Pins</th>
                    <th className="text-left font-medium px-4 py-3">Active</th>
                    <th className="text-left font-medium px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.map((s) => {
                    const status = contentStatus[s.slug]
                    const score = completenessScore(status)
                    return (
                      <tr key={s.id} className="border-t border-gray-100">
                        <td className="px-4 py-3 text-gray-900 font-medium">{s.name}</td>
                        <td className="px-4 py-3 text-gray-700">{s.service_category || '\u2014'}</td>
                        <td className="px-4 py-3 text-gray-700">
                          <code className="bg-gray-100 px-1 rounded text-xs">{s.slug}</code>
                        </td>
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
                          <input
                            value={pinEdits[s.id]?.map_x ?? ''}
                            onChange={(e) => setPinEdits((p) => ({ ...p, [s.id]: { ...(p[s.id] || { map_y: '' }), map_x: e.target.value, map_y: p[s.id]?.map_y ?? '' } }))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30 text-xs"
                            placeholder="0.5"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            value={pinEdits[s.id]?.map_y ?? ''}
                            onChange={(e) => setPinEdits((p) => ({ ...p, [s.id]: { ...(p[s.id] || { map_x: '' }), map_y: e.target.value, map_x: p[s.id]?.map_x ?? '' } }))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30 text-xs"
                            placeholder="0.5"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => savePins(s)}
                            disabled={pinEdits[s.id]?.saving}
                            className="px-2 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-xs"
                          >
                            {pinEdits[s.id]?.saving ? 'Saving...' : 'Save'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          {s.is_active ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">Yes</span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">No</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-gray-50 border border-gray-200" title="Edit">
                              <Pencil className="w-3.5 h-3.5 text-gray-700" />
                            </button>
                            <button onClick={() => deactivateService(s)} className="px-2 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs" disabled={saving}>
                              Deactivate
                            </button>
                            <button onClick={() => deleteService(s, false)} className="p-1.5 rounded-lg hover:bg-red-50 border border-red-200" title="Delete" disabled={deleting}>
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

      {/* Slide-over for card edit (reuses AdminServiceCard pattern) */}
      {slideOverSlug && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSlideOverSlug(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
            onClick={e => e.stopPropagation()}
          >
            <SlideOverEditor
              serviceSlug={slideOverSlug}
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

      {/* Edit modal for table view */}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30"
                />
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Slug</div>
                <input
                  value={editModal.slug}
                  onChange={(e) => setEditModal((p) => ({ ...p, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30"
                />
                <div className="text-xs text-gray-400 mt-1">Tag: <code className="bg-gray-100 px-1 rounded">service:{editModal.slug || '...'}</code></div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Category</div>
                <input
                  value={editModal.service_category}
                  onChange={(e) => setEditModal((p) => ({ ...p, service_category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30"
                />
              </div>
              <div className="flex items-end gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={editModal.is_active}
                    onChange={(e) => setEditModal((p) => ({ ...p, is_active: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-picc-red"
                  />
                  Active
                </label>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Map X (0-1)</div>
                <input
                  value={editModal.map_x}
                  onChange={(e) => setEditModal((p) => ({ ...p, map_x: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30"
                  placeholder="e.g. 0.52"
                />
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Map Y (0-1)</div>
                <input
                  value={editModal.map_y}
                  onChange={(e) => setEditModal((p) => ({ ...p, map_y: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30"
                  placeholder="e.g. 0.44"
                />
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-gray-500 mb-1">Description</div>
                <textarea
                  value={editModal.description}
                  onChange={(e) => setEditModal((p) => ({ ...p, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/30"
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => editModal.service && deactivateService(editModal.service)} className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm" disabled={saving}>
                  Deactivate
                </button>
                <button onClick={() => editModal.service && deleteService(editModal.service, false)} className="px-3 py-2 rounded-lg border border-red-200 hover:bg-red-50 text-red-700 text-sm" disabled={deleting || saving}>
                  Delete
                </button>
                <button onClick={() => editModal.service && deleteService(editModal.service, true)} className="px-3 py-2 rounded-lg border border-red-200 hover:bg-red-50 text-red-700 text-sm" disabled={deleting || saving} title="Force delete even if referenced">
                  Force delete
                </button>
              </div>
              <button
                onClick={saveService}
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

// --- Slide-over Editor (for card view) ---
// Replicates AdminServiceCard's slide-over logic but standalone
function SlideOverEditor({
  serviceSlug,
  onClose,
  onSaved,
}: {
  serviceSlug: string
  onClose: () => void
  onSaved: () => void
}) {
  const [service, setService] = useState<ServiceRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Content status
  const [contentStatus, setContentStatus] = useState<{
    coverPhoto: { has: boolean; url?: string }
    galleryPhotos: number
    hasVideo: boolean
    descriptionFilled: boolean
    hasGeo: boolean
  } | null>(null)
  const [loadingContent, setLoadingContent] = useState(false)

  // Cover photo picker
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false)
  const [settingCover, setSettingCover] = useState(false)

  // Geo
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [geoSaving, setGeoSaving] = useState(false)
  const [geoSaved, setGeoSaved] = useState(false)
  const [geoLocating, setGeoLocating] = useState(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/services')
        if (!res.ok) return
        const data = await res.json()
        const found = (data.services || []).find((s: any) => s.slug === serviceSlug)
        if (!found) return

        setService(found)
        setName(found.name || '')
        setDescription(found.description || '')
        const meta = found.metadata || {}
        setLat(meta.latitude ? String(meta.latitude) : '')
        setLng(meta.longitude ? String(meta.longitude) : '')

        // Load content status
        setLoadingContent(true)
        try {
          const serviceTag = `service:${found.slug}`
          const heroTags = `${serviceTag},hero`
          const [photosRes, videosRes, heroRes] = await Promise.all([
            fetch(`/api/media/list?limit=1&fileType=image&tags=${encodeURIComponent(serviceTag)}`).then(r => r.ok ? r.json() : { count: 0 }),
            fetch(`/api/media/list?limit=1&fileType=video&tags=${encodeURIComponent(serviceTag)}`).then(r => r.ok ? r.json() : { count: 0 }),
            fetch(`/api/media/list?limit=1&fileType=image&tags=${encodeURIComponent(heroTags)}`).then(r => r.ok ? r.json() : { data: [] }),
          ])
          setContentStatus({
            coverPhoto: {
              has: Array.isArray(heroRes.data) && heroRes.data.length > 0,
              url: heroRes.data?.[0]?.public_url,
            },
            galleryPhotos: photosRes.count || 0,
            hasVideo: (videosRes.count || 0) > 0,
            descriptionFilled: !!(found.description && found.description.trim().length > 10),
            hasGeo: !!(found.metadata?.latitude && found.metadata?.longitude),
          })
        } catch (err) {
          console.error('Failed to load content status:', err)
        } finally {
          setLoadingContent(false)
        }
      } catch (err) {
        console.error('Failed to load service:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [serviceSlug])

  const handleSave = async () => {
    if (!service) return
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
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
    if (!service) return
    setSettingCover(true)
    setPhotoPickerOpen(false)
    try {
      const serviceTag = `service:${service.slug}`
      if (contentStatus?.coverPhoto.has) {
        const heroTags = `${serviceTag},hero`
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
        body: JSON.stringify({ mediaIds: [media.id], addTags: [serviceTag, 'hero'] }),
      })
      setContentStatus(prev => prev ? { ...prev, coverPhoto: { has: true, url: media.public_url } } : prev)
      onSaved()
    } catch (err) {
      console.error('Failed to set cover:', err)
    } finally {
      setSettingCover(false)
    }
  }

  const handleSaveGeo = async () => {
    if (!service) return
    const latitude = parseFloat(lat)
    const longitude = parseFloat(lng)
    if (isNaN(latitude) || isNaN(longitude)) return
    setGeoSaving(true)
    setGeoSaved(false)
    try {
      const currentMeta = service.metadata || {}
      const res = await fetch(`/api/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata: { ...currentMeta, latitude, longitude } }),
      })
      if (res.ok) {
        setGeoSaved(true)
        setContentStatus(prev => prev ? { ...prev, hasGeo: true } : prev)
        onSaved()
        setTimeout(() => setGeoSaved(false), 2000)
      }
    } catch (err) {
      console.error('Failed to save geo:', err)
    } finally {
      setGeoSaving(false)
    }
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return
    setGeoLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(6))
        setLng(position.coords.longitude.toFixed(6))
        setGeoLocating(false)
      },
      () => setGeoLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const completedCount = contentStatus
    ? [contentStatus.coverPhoto.has, contentStatus.galleryPhotos > 0, contentStatus.hasVideo, contentStatus.descriptionFilled, contentStatus.hasGeo].filter(Boolean).length
    : 0

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Edit Service</h2>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : service ? (
          <>
            {/* Content Status */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-900">Content Status</span>
                {contentStatus && (
                  <span className="text-xs font-medium text-gray-500">{completedCount}/5 complete</span>
                )}
              </div>
              {loadingContent ? (
                <div className="flex items-center gap-2 py-2 text-sm text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking content...
                </div>
              ) : contentStatus ? (
                <>
                  <div className="space-y-0.5">
                    <StatusItemSmall label="Cover photo" ok={contentStatus.coverPhoto.has} />
                    <StatusItemSmall label="Gallery photos" ok={contentStatus.galleryPhotos > 0} detail={contentStatus.galleryPhotos > 0 ? `${contentStatus.galleryPhotos}` : undefined} />
                    <StatusItemSmall label="Video" ok={contentStatus.hasVideo} />
                    <StatusItemSmall label="Description" ok={contentStatus.descriptionFilled} />
                    <StatusItemSmall label="Geo coordinates" ok={contentStatus.hasGeo} />
                  </div>
                  <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${(completedCount / 5) * 100}%` }} />
                  </div>
                </>
              ) : null}
            </div>

            {/* Cover Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Photo</label>
              {contentStatus?.coverPhoto.has && contentStatus.coverPhoto.url ? (
                <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-2">
                  <img src={contentStatus.coverPhoto.url} alt="Cover" className="w-full h-full object-cover" />
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
                  <><Camera className="w-4 h-4" /> {contentStatus?.coverPhoto.has ? 'Change Cover Photo' : 'Set Cover Photo'}</>
                )}
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                onBlur={handleSave}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-ochre-300 focus:ring-1 focus:ring-picc-ochre-300 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                onBlur={handleSave}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-ochre-300 focus:ring-1 focus:ring-picc-ochre-300 focus:outline-none"
              />
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                {saving && <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</>}
                {saved && <><Check className="w-3 h-3 text-green-500" /> Saved</>}
                {!saving && !saved && 'Auto-saves on blur'}
              </div>
            </div>

            {/* Category */}
            {service.service_category && (
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                Category: <span className="font-medium text-gray-800">{service.service_category}</span>
              </div>
            )}

            {/* Geo Location */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">Location</span>
                <button
                  onClick={handleUseMyLocation}
                  disabled={geoLocating}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-picc-red bg-picc-red/10 rounded-full hover:bg-picc-red/20 transition-colors disabled:opacity-50"
                >
                  {geoLocating ? (
                    <><Loader2 className="w-3 h-3 animate-spin" /> Locating...</>
                  ) : (
                    <><Navigation className="w-3 h-3" /> Use My Location</>
                  )}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                  <input value={lat} onChange={e => setLat(e.target.value)} placeholder="-19.7298" className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                  <input value={lng} onChange={e => setLng(e.target.value)} placeholder="146.5814" className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
              <button
                onClick={handleSaveGeo}
                disabled={geoSaving || !lat || !lng}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-picc-ochre rounded-lg hover:bg-picc-ochre/90 transition-colors disabled:opacity-50"
              >
                {geoSaving ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                ) : geoSaved ? (
                  <><Check className="w-3.5 h-3.5" /> Saved</>
                ) : (
                  <><MapPin className="w-3.5 h-3.5" /> Save Location</>
                )}
              </button>
            </div>

            {/* Quick Links */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Links</span>
              <Link href={`/picc/media/gallery?serviceFilter=${serviceSlug}`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <Camera className="w-4 h-4 text-gray-400" /> Service Photos
              </Link>
              <Link href={`/picc/stories?service=${serviceSlug}`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <FileText className="w-4 h-4 text-gray-400" /> Related Stories
              </Link>
              <Link href={`/services/${serviceSlug}`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" /> View Public Page
              </Link>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">Service not found: {serviceSlug}</p>
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
