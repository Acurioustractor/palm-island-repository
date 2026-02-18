'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Loader2, MapPin, Navigation, ImageIcon } from 'lucide-react'
import MediaPickerDialog from '@/components/admin/MediaPickerDialog'

// Leaflet requires window — disable SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((m) => m.Marker),
  { ssr: false }
)

const PALM_ISLAND_CENTER: [number, number] = [-18.7285, 146.5808]
const DEFAULT_ZOOM = 15

interface LocationMapPickerProps {
  projectId: string
  metadata: Record<string, any> | null
  onUpdate: (updated: Record<string, any>) => void
}

export default function LocationMapPicker({ projectId, metadata, onUpdate }: LocationMapPickerProps) {
  const existingLat = metadata?.latitude as number | undefined
  const existingLng = metadata?.longitude as number | undefined

  const [lat, setLat] = useState(existingLat != null ? String(existingLat) : '')
  const [lng, setLng] = useState(existingLng != null ? String(existingLng) : '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [geoLocating, setGeoLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [mapRef, setMapRef] = useState<any>(null)

  const hasCoords = lat !== '' && lng !== '' && !isNaN(Number(lat)) && !isNaN(Number(lng))
  const mapCenter: [number, number] = hasCoords
    ? [Number(lat), Number(lng)]
    : PALM_ISLAND_CENTER

  // Draggable marker icon
  const markerIcon = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    const L = require('leaflet')
    return L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    })
  }, [])

  const saveCoordinates = useCallback(async (newLat: number, newLng: number) => {
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      const newMetadata = { ...(metadata || {}), latitude: newLat, longitude: newLng }
      const res = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, metadata: newMetadata }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.data) onUpdate(data.data)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } else {
        setError('Failed to save location')
      }
    } catch {
      setError('Failed to save location')
    }
    setSaving(false)
  }, [projectId, metadata, onUpdate])

  const handleDragEnd = useCallback((e: any) => {
    const pos = e.target.getLatLng()
    const newLat = Math.round(pos.lat * 1000000) / 1000000
    const newLng = Math.round(pos.lng * 1000000) / 1000000
    setLat(String(newLat))
    setLng(String(newLng))
    saveCoordinates(newLat, newLng)
  }, [saveCoordinates])

  const handleManualSave = () => {
    const parsedLat = parseFloat(lat)
    const parsedLng = parseFloat(lng)
    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      setError('Invalid coordinates')
      return
    }
    if (parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
      setError('Coordinates out of range')
      return
    }
    setError(null)
    saveCoordinates(parsedLat, parsedLng)
    // Move map to new position
    if (mapRef) {
      mapRef.flyTo([parsedLat, parsedLng], 16, { duration: 0.8 })
    }
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }
    setGeoLocating(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = Math.round(pos.coords.latitude * 1000000) / 1000000
        const newLng = Math.round(pos.coords.longitude * 1000000) / 1000000
        setLat(String(newLat))
        setLng(String(newLng))
        saveCoordinates(newLat, newLng)
        if (mapRef) {
          mapRef.flyTo([newLat, newLng], 16, { duration: 0.8 })
        }
        setGeoLocating(false)
      },
      () => {
        setError('Could not get your location')
        setGeoLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleExtractFromPhoto = (media: any) => {
    setPhotoPickerOpen(false)
    const mediaLat = media.latitude ?? media.metadata?.latitude
    const mediaLng = media.longitude ?? media.metadata?.longitude
    if (mediaLat != null && mediaLng != null) {
      const newLat = Math.round(Number(mediaLat) * 1000000) / 1000000
      const newLng = Math.round(Number(mediaLng) * 1000000) / 1000000
      setLat(String(newLat))
      setLng(String(newLng))
      saveCoordinates(newLat, newLng)
      if (mapRef) {
        mapRef.flyTo([newLat, newLng], 16, { duration: 0.8 })
      }
    } else {
      setError('This photo has no GPS data')
      setTimeout(() => setError(null), 3000)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Location</h2>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          {saving && <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</>}
          {saved && <span className="text-green-500">Saved</span>}
        </div>
      </div>

      {/* Map */}
      <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height: 280 }}>
        <MapContainer
          center={mapCenter}
          zoom={hasCoords ? 16 : DEFAULT_ZOOM}
          scrollWheelZoom
          className="h-full w-full z-0"
          whenReady={() => setMounted(true)}
          ref={(ref: any) => { if (ref) setMapRef(ref) }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mounted && hasCoords && markerIcon && (
            <Marker
              position={[Number(lat), Number(lng)]}
              draggable={true}
              icon={markerIcon}
              eventHandlers={{ dragend: handleDragEnd }}
            />
          )}
        </MapContainer>
      </div>

      {!hasCoords && (
        <p className="text-xs text-gray-400 text-center">
          Click &ldquo;Use My Location&rdquo; or enter coordinates to place a pin
        </p>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleUseMyLocation}
          disabled={geoLocating}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-picc-red bg-picc-red/10 rounded-lg hover:bg-picc-red/20 transition-colors disabled:opacity-50"
        >
          {geoLocating ? (
            <><Loader2 className="w-3 h-3 animate-spin" /> Locating...</>
          ) : (
            <><Navigation className="w-3 h-3" /> Use My Location</>
          )}
        </button>
        <button
          onClick={() => setPhotoPickerOpen(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <ImageIcon className="w-3 h-3" /> Extract from Photo
        </button>
      </div>

      {/* Manual lat/lng inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Latitude</label>
          <input
            value={lat}
            onChange={e => setLat(e.target.value)}
            placeholder="-18.7285"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Longitude</label>
          <input
            value={lng}
            onChange={e => setLng(e.target.value)}
            placeholder="146.5808"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-picc-red focus:ring-1 focus:ring-picc-red focus:outline-none"
          />
        </div>
      </div>

      <button
        onClick={handleManualSave}
        disabled={saving || !lat || !lng}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-picc-red rounded-lg hover:bg-picc-red/90 transition-colors disabled:opacity-50"
      >
        {saving ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
        ) : (
          <><MapPin className="w-4 h-4" /> Save Location</>
        )}
      </button>

      {error && (
        <p className="text-xs text-red-500 text-center">{error}</p>
      )}

      <MediaPickerDialog
        open={photoPickerOpen}
        kind="image"
        onClose={() => setPhotoPickerOpen(false)}
        onPick={handleExtractFromPhoto}
        initialQuery=""
      />
    </div>
  )
}
