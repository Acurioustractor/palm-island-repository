'use client'

import { useState, type ReactNode } from 'react'
import { useAdmin } from '@/lib/admin/AdminContext'
import ServiceMetricsQuickEdit from './ServiceMetricsQuickEdit'
import MediaPickerDialog from './MediaPickerDialog'
import {
  X, Pencil, Loader2, Check, Camera, BookOpen, ExternalLink,
  Image as ImageIcon, MapPin, Navigation, CheckCircle2, XCircle
} from 'lucide-react'
import Link from 'next/link'

interface AdminServiceCardProps {
  serviceSlug: string
  children: ReactNode
}

interface ServiceData {
  id: string
  name: string
  slug: string
  description: string | null
  service_category: string | null
  metadata?: Record<string, any> | null
}

interface ContentStatus {
  coverPhoto: { has: boolean; url?: string }
  galleryPhotos: number
  hasVideo: boolean
  descriptionFilled: boolean
  hasMetrics: boolean
  hasGeo: boolean
  storyCount: number
}

function getCurrentFY(): string {
  const now = new Date()
  const startYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
  const endYear = startYear + 1
  return `${startYear}-${String(endYear).slice(-2)}`
}

function StatusItem({ label, ok, detail }: { label: string; ok: boolean; detail?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        {ok ? (
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
        ) : (
          <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />
        )}
        {label}
      </div>
      {detail && (
        <span className="text-xs text-gray-500">{detail}</span>
      )}
    </div>
  )
}

export default function AdminServiceCard({ serviceSlug, children }: AdminServiceCardProps) {
  const { isAdmin, isEditMode } = useAdmin()
  const [slideOverOpen, setSlideOverOpen] = useState(false)
  const [service, setService] = useState<ServiceData | null>(null)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Content status
  const [contentStatus, setContentStatus] = useState<ContentStatus | null>(null)
  const [loadingContent, setLoadingContent] = useState(false)

  // Cover photo picker
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false)
  const [settingCover, setSettingCover] = useState(false)

  // Geo location
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [geoSaving, setGeoSaving] = useState(false)
  const [geoSaved, setGeoSaved] = useState(false)
  const [geoLocating, setGeoLocating] = useState(false)

  const currentFY = getCurrentFY()

  if (!isAdmin || !isEditMode) {
    return <>{children}</>
  }

  const openEditor = async () => {
    setSlideOverOpen(true)
    if (service) return

    setLoading(true)
    try {
      const res = await fetch(`/api/services`)
      if (res.ok) {
        const data = await res.json()
        const found = (data.services || []).find((s: any) => s.slug === serviceSlug)
        if (found) {
          setService(found)
          setName(found.name || '')
          setDescription(found.description || '')
          // Load geo from metadata
          const meta = found.metadata || {}
          setLat(meta.latitude ? String(meta.latitude) : '')
          setLng(meta.longitude ? String(meta.longitude) : '')
          // Load content status
          loadContentStatus(found.slug)
        }
      }
    } catch (err) {
      console.error('Failed to load service:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadContentStatus = async (slug: string) => {
    setLoadingContent(true)
    try {
      const serviceTag = `service:${slug}`
      const heroTags = `${serviceTag},hero`

      // Fetch media counts via /api/media/list — uses `tags` (CSV) param, returns `count`
      const [photosRes, videosRes, heroRes, servicesRes] = await Promise.all([
        fetch(`/api/media/list?limit=1&fileType=image&tags=${encodeURIComponent(serviceTag)}`).then(r => r.ok ? r.json() : { count: 0 }),
        fetch(`/api/media/list?limit=1&fileType=video&tags=${encodeURIComponent(serviceTag)}`).then(r => r.ok ? r.json() : { count: 0 }),
        fetch(`/api/media/list?limit=1&fileType=image&tags=${encodeURIComponent(heroTags)}`).then(r => r.ok ? r.json() : { data: [] }),
        fetch(`/api/services`).then(r => r.ok ? r.json() : { services: [] }),
      ])

      const svc = (servicesRes.services || []).find((s: any) => s.slug === slug)
      const meta = svc?.metadata || {}

      setContentStatus({
        coverPhoto: {
          has: Array.isArray(heroRes.data) && heroRes.data.length > 0,
          url: heroRes.data?.[0]?.public_url,
        },
        galleryPhotos: photosRes.count || 0,
        hasVideo: (videosRes.count || 0) > 0,
        descriptionFilled: !!(svc?.description && svc.description.trim().length > 10),
        hasMetrics: false,
        hasGeo: !!(meta.latitude && meta.longitude),
        storyCount: 0,
      })
    } catch (err) {
      console.error('Failed to load content status:', err)
    } finally {
      setLoadingContent(false)
    }
  }

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
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (err) {
      console.error('Failed to save service:', err)
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

      // First, remove 'hero' tag from any existing cover photo for this service
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

      // Add service tag + hero tag to the selected photo
      await fetch('/api/media/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaIds: [media.id],
          addTags: [serviceTag, 'hero'],
        }),
      })

      // Update content status
      setContentStatus(prev => prev ? {
        ...prev,
        coverPhoto: { has: true, url: media.public_url },
      } : prev)
    } catch (err) {
      console.error('Failed to set cover photo:', err)
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
        body: JSON.stringify({
          metadata: { ...currentMeta, latitude, longitude, location_name: currentMeta.location_name },
        }),
      })
      if (res.ok) {
        setGeoSaved(true)
        setContentStatus(prev => prev ? { ...prev, hasGeo: true } : prev)
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
      (err) => {
        console.error('Geolocation error:', err)
        setGeoLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const completedCount = contentStatus
    ? [
        contentStatus.coverPhoto.has,
        contentStatus.galleryPhotos > 0,
        contentStatus.hasVideo,
        contentStatus.descriptionFilled,
        contentStatus.hasGeo,
      ].filter(Boolean).length
    : 0
  const totalChecks = 5

  return (
    <>
      <div className="relative group/admin cursor-pointer" onClick={openEditor}>
        {children}
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover/admin:opacity-100 transition-opacity">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-picc-red/90 backdrop-blur-sm text-white text-xs font-medium rounded-full shadow-lg">
            <Pencil className="w-3 h-3" />
            Edit Service
          </div>
        </div>
        <div className="absolute inset-0 border-2 border-transparent group-hover/admin:border-picc-red/30 rounded-[inherit] pointer-events-none transition-colors" />
      </div>

      {/* Slide-over Panel */}
      {slideOverOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSlideOverOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Edit Service</h2>
              <button
                onClick={() => setSlideOverOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
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
                  {/* Content Completeness */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-900">Content Status</span>
                      {contentStatus && (
                        <span className="text-xs font-medium text-gray-500">
                          {completedCount}/{totalChecks} complete
                        </span>
                      )}
                    </div>
                    {loadingContent ? (
                      <div className="flex items-center gap-2 py-2 text-sm text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Checking content...
                      </div>
                    ) : contentStatus ? (
                      <div className="space-y-0.5">
                        <StatusItem label="Cover photo" ok={contentStatus.coverPhoto.has} />
                        <StatusItem label="Gallery photos" ok={contentStatus.galleryPhotos > 0} detail={contentStatus.galleryPhotos > 0 ? `${contentStatus.galleryPhotos}` : undefined} />
                        <StatusItem label="Video" ok={contentStatus.hasVideo} />
                        <StatusItem label="Description" ok={contentStatus.descriptionFilled} />
                        <StatusItem label="Geo coordinates" ok={contentStatus.hasGeo} />
                      </div>
                    ) : null}

                    {/* Progress bar */}
                    {contentStatus && (
                      <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all duration-500"
                          style={{ width: `${(completedCount / totalChecks) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Cover Photo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cover Photo</label>
                    {contentStatus?.coverPhoto.has && contentStatus.coverPhoto.url ? (
                      <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-2">
                        <img
                          src={contentStatus.coverPhoto.url}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
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
                        <input
                          value={lat}
                          onChange={e => setLat(e.target.value)}
                          placeholder="-19.7298"
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-picc-ochre-300 focus:ring-1 focus:ring-picc-ochre-300 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                        <input
                          value={lng}
                          onChange={e => setLng(e.target.value)}
                          placeholder="146.5814"
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-picc-ochre-300 focus:ring-1 focus:ring-picc-ochre-300 focus:outline-none"
                        />
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

                  {/* Metrics */}
                  <div className="border-t border-gray-100 pt-4">
                    <ServiceMetricsQuickEdit
                      serviceId={service.id}
                      serviceName={service.name}
                      fiscalYear={currentFY}
                    />
                  </div>

                  {/* Quick Links */}
                  <div className="border-t border-gray-100 pt-4 space-y-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Links</span>
                    <Link
                      href={`/picc/media/gallery?serviceFilter=${serviceSlug}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Camera className="w-4 h-4 text-gray-400" />
                      Service Photos
                      <ExternalLink className="w-3 h-3 text-gray-300 ml-auto" />
                    </Link>
                    <Link
                      href={`/picc/stories?service=${serviceSlug}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      Related Stories
                      <ExternalLink className="w-3 h-3 text-gray-300 ml-auto" />
                    </Link>
                    <Link
                      href={`/services/${serviceSlug}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                      View Public Page
                      <ExternalLink className="w-3 h-3 text-gray-300 ml-auto" />
                    </Link>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">
                  Service not found: {serviceSlug}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Media Picker for Cover Photo */}
      <MediaPickerDialog
        open={photoPickerOpen}
        kind="image"
        onClose={() => setPhotoPickerOpen(false)}
        onPick={handleSetCoverPhoto}
      />
    </>
  )
}
