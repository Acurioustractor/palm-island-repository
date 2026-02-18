'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Camera, Check, Loader2, MapPin, Navigation, Pencil, Save, Upload,
  Image as ImageIcon
} from 'lucide-react'
import MediaPickerDialog from '@/components/admin/MediaPickerDialog'
import type { ServiceData } from './ServiceAdminDetail'

type Props = {
  service: ServiceData
  onUpdate: (updated: Partial<ServiceData>) => void
}

const CATEGORIES = [
  'health', 'family', 'youth', 'culture', 'justice', 'housing',
  'education', 'economic', 'community', 'sport', 'environment', 'other',
]

export default function OverviewTab({ service, onUpdate }: Props) {
  const [name, setName] = useState(service.name)
  const [description, setDescription] = useState(service.description || '')
  const [category, setCategory] = useState(service.service_category || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Cover photo
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [coverLoading, setCoverLoading] = useState(true)
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false)
  const [settingCover, setSettingCover] = useState(false)

  // Location
  const [lat, setLat] = useState(service.metadata?.latitude ? String(service.metadata.latitude) : '')
  const [lng, setLng] = useState(service.metadata?.longitude ? String(service.metadata.longitude) : '')
  const [geoSaving, setGeoSaving] = useState(false)
  const [geoSaved, setGeoSaved] = useState(false)
  const [geoLocating, setGeoLocating] = useState(false)

  // Contact
  const [contactEmail, setContactEmail] = useState(service.metadata?.contact_email || '')
  const [contactPhone, setContactPhone] = useState(service.metadata?.contact_phone || '')
  const [contactPerson, setContactPerson] = useState(service.metadata?.contact_person || '')

  // Direct upload
  const [uploading, setUploading] = useState(false)
  const [gpsPhotoUrl, setGpsPhotoUrl] = useState<string | null>(null)
  const [gpsMessage, setGpsMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Quick stats
  const [stats, setStats] = useState<any>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // Load cover photo + GPS reference photo
  useEffect(() => {
    const serviceTag = `service:${service.slug}`
    const loadCover = async () => {
      setCoverLoading(true)
      try {
        const heroTags = `${serviceTag},hero`
        const res = await fetch(`/api/media/list?limit=1&fileType=image&tags=${encodeURIComponent(heroTags)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.data?.[0]?.public_url) {
            setCoverUrl(data.data[0].public_url)
          }
        }
      } catch {}
      setCoverLoading(false)
    }
    const loadGpsPhoto = async () => {
      try {
        const gpsTags = `${serviceTag},gps-reference`
        const res = await fetch(`/api/media/list?limit=1&fileType=image&tags=${encodeURIComponent(gpsTags)}&sort=newest`)
        if (res.ok) {
          const data = await res.json()
          if (data.data?.[0]?.public_url) {
            setGpsPhotoUrl(data.data[0].public_url)
          }
        }
      } catch {}
    }
    loadCover()
    loadGpsPhoto()
  }, [service.slug])

  // Load current FY stats
  useEffect(() => {
    const loadStats = async () => {
      setStatsLoading(true)
      try {
        const res = await fetch('/api/annual-report-data/metrics')
        if (res.ok) {
          const data = await res.json()
          const metrics = (data.metrics || []).find(
            (m: any) => m.organization_service_id === service.id && m.fiscal_year === '2024-25'
          )
          setStats(metrics || null)
        }
      } catch {}
      setStatsLoading(false)
    }
    loadStats()
  }, [service.id])

  // Auto-save field on blur
  const saveField = useCallback(async (fields: Record<string, unknown>) => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      if (res.ok) {
        const data = await res.json()
        onUpdate(data.service)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch {}
    setSaving(false)
  }, [service.id, onUpdate])

  const handleNameBlur = () => {
    if (name.trim() !== service.name) saveField({ name: name.trim() })
  }

  const handleDescriptionBlur = () => {
    if (description.trim() !== (service.description || '')) saveField({ description: description.trim() || null })
  }

  const handleCategoryChange = (val: string) => {
    setCategory(val)
    saveField({ service_category: val || null })
  }

  const handleContactSave = () => {
    const meta = { ...(service.metadata || {}) }
    if (contactEmail.trim()) meta.contact_email = contactEmail.trim()
    else delete meta.contact_email
    if (contactPhone.trim()) meta.contact_phone = contactPhone.trim()
    else delete meta.contact_phone
    if (contactPerson.trim()) meta.contact_person = contactPerson.trim()
    else delete meta.contact_person
    saveField({ metadata: meta })
  }

  const handleSetCoverPhoto = async (media: any) => {
    setSettingCover(true)
    setPhotoPickerOpen(false)
    const serviceTag = `service:${service.slug}`
    try {
      // Remove existing hero tag
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
      // Add service + hero tags
      await fetch('/api/media/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaIds: [media.id], addTags: [serviceTag, 'hero'] }),
      })
      setCoverUrl(media.public_url)
    } catch (err) {
      console.error('Failed to set cover:', err)
    }
    setSettingCover(false)
  }

  const handleSaveGeo = async () => {
    const latitude = parseFloat(lat)
    const longitude = parseFloat(lng)
    if (isNaN(latitude) || isNaN(longitude)) return
    setGeoSaving(true)
    setGeoSaved(false)
    try {
      const meta = { ...(service.metadata || {}), latitude, longitude }
      const res = await fetch(`/api/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata: meta }),
      })
      if (res.ok) {
        const data = await res.json()
        onUpdate(data.service)
        setGeoSaved(true)
        setTimeout(() => setGeoSaved(false), 2000)
      }
    } catch {}
    setGeoSaving(false)
  }

  const handleUploadGpsPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const serviceTag = `service:${service.slug}`
      const formData = new FormData()
      formData.append('file', file)
      formData.append('tags', JSON.stringify([serviceTag, 'gps-reference']))
      formData.append('title', `${service.name} — Location Photo`)

      const res = await fetch('/api/media/upload', { method: 'POST', body: formData })
      const data = await res.json()

      // Handle duplicate — reuse existing file and tag it for this service
      let media: any
      if (res.status === 409 && data.duplicate) {
        media = data.duplicate
        // Ensure the existing file gets the service + gps-reference tags
        await fetch('/api/media/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mediaIds: [media.id], addTags: [serviceTag, 'gps-reference'] }),
        })
      } else if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      } else {
        media = data.file
      }

      // Always show the uploaded photo
      if (media.public_url) {
        setGpsPhotoUrl(media.public_url)
      }

      if (media.latitude && media.longitude) {
        setLat(String(media.latitude))
        setLng(String(media.longitude))
        // Auto-save GPS to the service
        const meta = { ...(service.metadata || {}), latitude: media.latitude, longitude: media.longitude }
        const geoRes = await fetch(`/api/services/${service.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metadata: meta }),
        })
        if (geoRes.ok) {
          const geoData = await geoRes.json()
          onUpdate(geoData.service)
          setGeoSaved(true)
          setTimeout(() => setGeoSaved(false), 3000)
        }
      } else {
        setGpsMessage('No GPS data found in this photo. You can enter coordinates manually or try a photo taken with location services enabled.')
        setTimeout(() => setGpsMessage(null), 6000)
      }
    } catch (err) {
      console.error('Upload failed:', err)
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return
    setGeoLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6))
        setLng(pos.coords.longitude.toFixed(6))
        setGeoLocating(false)
      },
      () => setGeoLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column: Main info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Cover Photo */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="aspect-[16/7] bg-gray-100 relative">
            {coverLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
              </div>
            ) : coverUrl ? (
              <img src={coverUrl} alt={service.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-300">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">No cover photo</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setPhotoPickerOpen(true)}
              disabled={settingCover}
              className="absolute bottom-3 right-3 inline-flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm text-sm font-medium text-gray-700 rounded-lg hover:bg-white transition-colors shadow-sm disabled:opacity-50"
            >
              {settingCover ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Setting...</>
              ) : (
                <><Camera className="w-4 h-4" /> {coverUrl ? 'Change' : 'Set Cover'}</>
              )}
            </button>
          </div>
        </div>

        {/* Name & Description */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Details</h2>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              {saving && <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</>}
              {saved && <><Check className="w-3 h-3 text-green-500" /> Saved</>}
              {!saving && !saved && 'Auto-saves on blur'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onBlur={handleNameBlur}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none"
              placeholder="Short description used in reports and directory"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={e => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none bg-white"
            >
              <option value="">Select category...</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Contact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Contact Person</label>
              <input
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                onBlur={handleContactSave}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none"
                placeholder="e.g. Jane Smith"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <input
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                onBlur={handleContactSave}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none"
                placeholder="service@picc.org.au"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Phone</label>
              <input
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                onBlur={handleContactSave}
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none"
                placeholder="07 4770 1234"
              />
            </div>
          </div>
        </div>

        {/* GPS Location */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Location</h2>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Latitude</label>
              <input
                value={lat}
                onChange={e => setLat(e.target.value)}
                placeholder="-19.7298"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Longitude</label>
              <input
                value={lng}
                onChange={e => setLng(e.target.value)}
                placeholder="146.5814"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveGeo}
              disabled={geoSaving || !lat || !lng}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-picc-red rounded-lg hover:bg-picc-red/90 transition-colors disabled:opacity-50"
            >
              {geoSaving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : geoSaved ? (
                <><Check className="w-4 h-4" /> Saved</>
              ) : (
                <><MapPin className="w-4 h-4" /> Save Location</>
              )}
            </button>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500 mb-2">Or upload a geotagged photo to set the pin automatically:</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUploadGpsPhoto}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Reading GPS...</>
              ) : (
                <><Upload className="w-4 h-4" /> Upload Geotagged Photo</>
              )}
            </button>
            {gpsMessage && (
              <p className="mt-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">{gpsMessage}</p>
            )}
            {gpsPhotoUrl && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1.5">Current GPS reference photo:</p>
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  <img src={gpsPhotoUrl} alt="GPS reference" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right column: Quick stats */}
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            FY 2024-25 Snapshot
          </h2>
          {statsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
            </div>
          ) : stats ? (
            <div className="space-y-3">
              <StatRow label="Clients Served" value={stats.clients_served} />
              <StatRow label="Staff" value={stats.staff_count} />
              <StatRow label="Sessions" value={stats.sessions_delivered} />
              <StatRow label="Events" value={stats.events_held} />
              {stats.key_achievement && (
                <div className="pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Key Achievement</div>
                  <p className="text-sm text-gray-700">{stats.key_achievement}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No metrics data yet</p>
          )}
        </div>

        {/* Service Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Info</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Slug</span>
              <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{service.slug}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Media Tag</span>
              <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">service:{service.slug}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className={`text-xs font-medium ${service.is_active !== false ? 'text-green-600' : 'text-gray-400'}`}>
                {service.is_active !== false ? 'Active' : 'Inactive'}
              </span>
            </div>
            {service.metadata?.latitude && service.metadata?.longitude && (
              <div className="flex justify-between">
                <span className="text-gray-500">GPS</span>
                <span className="text-xs text-gray-600">
                  {Number(service.metadata.latitude).toFixed(4)}, {Number(service.metadata.longitude).toFixed(4)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <MediaPickerDialog
        open={photoPickerOpen}
        kind="image"
        onClose={() => setPhotoPickerOpen(false)}
        onPick={handleSetCoverPhoto}
        initialQuery={service.name}
      />
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: number | null | undefined }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-lg font-semibold text-gray-900">
        {value != null ? value.toLocaleString() : <span className="text-gray-300">&mdash;</span>}
      </span>
    </div>
  )
}
