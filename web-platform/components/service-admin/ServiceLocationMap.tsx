'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Loader2, Save, Search } from 'lucide-react'

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
const Tooltip = dynamic(
  () => import('react-leaflet').then((m) => m.Tooltip),
  { ssr: false }
)

const PALM_ISLAND_CENTER: [number, number] = [-18.7285, 146.5808]
const DEFAULT_ZOOM = 15

const CATEGORY_COLORS: Record<string, string> = {
  health: '#A67C6D',
  family: '#8B7D6B',
  community: '#7D8B6A',
  justice: '#8C7A8B',
  culture: '#B08D57',
  education: '#6B8A8B',
  economic: '#9B8B6B',
  environment: '#6B8B6D',
  housing: '#8B8B7D',
  employment: '#7D7B6B',
  youth: '#6B7D8B',
  other: '#8B8580',
}

type ServiceRow = {
  id: string
  name: string
  slug: string
  service_category: string | null
  metadata?: Record<string, any> | null
}

interface ServiceLocationMapProps {
  services: ServiceRow[]
  onServiceUpdated?: () => void
}

function pinSvg(color: string, size: number) {
  return `
    <svg width="${size}" height="${Math.round(size * 1.4)}" viewBox="0 0 40 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#shadow-${color.replace('#', '')})">
        <path d="
          M20 52
          C20 52 3.5 32 2.8 22
          C2.2 13.5 6 6.5 12 3.5
          C15 2 18 1.2 20 1.2
          C22 1.2 25 2 28 3.5
          C34 6.5 37.8 13.5 37.2 22
          C36.5 32 20 52 20 52Z
        " fill="${color}" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
        <circle cx="20" cy="19" r="7" fill="white" fill-opacity="0.9"/>
        <circle cx="20" cy="19" r="4.5" fill="${color}" fill-opacity="0.6"/>
      </g>
      <defs>
        <filter id="shadow-${color.replace('#', '')}" x="-2" y="-1" width="44" height="60" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.25"/>
        </filter>
      </defs>
    </svg>
  `
}

// Child of MapContainer — uses useMap() to fly to a target position
const MapFlyTo = dynamic(
  () => Promise.resolve(function MapFlyToInner({ target }: { target: [number, number] | null }) {
    const { useMap } = require('react-leaflet')
    const map = useMap()
    useEffect(() => {
      if (!target) return
      map.flyTo(target, 18, { duration: 0.8 })
    }, [target, map])
    return null
  }),
  { ssr: false }
)

export default function ServiceLocationMap({ services, onServiceUpdated }: ServiceLocationMapProps) {
  const [mounted, setMounted] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  // Optimistic position overrides keyed by service id
  const [positionOverrides, setPositionOverrides] = useState<Record<string, [number, number]>>({})
  // Search / fly-to state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return services.slice().sort((a, b) => a.name.localeCompare(b.name))
    const q = searchQuery.toLowerCase()
    return services
      .filter((s) => s.name.toLowerCase().includes(q) || s.slug.includes(q) || s.service_category?.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [services, searchQuery])

  const handleSelectService = useCallback((service: ServiceRow) => {
    const override = positionOverrides[service.id]
    const lat = override ? override[0] : service.metadata?.latitude
    const lng = override ? override[1] : service.metadata?.longitude
    if (lat != null && lng != null) {
      setFlyTarget([lat, lng])
    }
    setSearchOpen(false)
    setSearchQuery('')
  }, [positionOverrides])

  const markers = useMemo(() => {
    const withCoords = services.filter(
      (s) => positionOverrides[s.id] || (s.metadata?.latitude != null && s.metadata?.longitude != null)
    )
    const withoutCoords = services.filter(
      (s) => !positionOverrides[s.id] && (s.metadata?.latitude == null || s.metadata?.longitude == null)
    )

    // Place services without coords in a circle south of center
    const fallback = withoutCoords.map((s, i) => {
      const angle = (i / Math.max(withoutCoords.length, 1)) * Math.PI * 2
      const radius = 0.003
      return {
        service: s,
        position: [
          PALM_ISLAND_CENTER[0] - 0.006 + radius * Math.cos(angle),
          PALM_ISLAND_CENTER[1] + radius * Math.sin(angle),
        ] as [number, number],
        hasCoords: false,
      }
    })

    const real = withCoords.map((s) => ({
      service: s,
      position: positionOverrides[s.id] || [s.metadata!.latitude, s.metadata!.longitude] as [number, number],
      hasCoords: true,
    }))

    // Offset overlapping markers so stacked pins are visible
    const allMarkers = [...real, ...fallback]
    const seen = new Map<string, number>()
    const OFFSET = 0.00015 // ~15m spread
    for (const m of allMarkers) {
      const key = `${m.position[0].toFixed(4)},${m.position[1].toFixed(4)}`
      const count = seen.get(key) || 0
      if (count > 0) {
        const angle = (count * Math.PI * 2) / 5 + Math.PI / 4
        m.position = [
          m.position[0] + OFFSET * Math.cos(angle),
          m.position[1] + OFFSET * Math.sin(angle),
        ]
      }
      seen.set(key, count + 1)
    }

    return allMarkers
  }, [services, positionOverrides])

  const savePosition = useCallback(
    async (service: ServiceRow, lat: number, lng: number) => {
      // Optimistically update the marker position so it doesn't snap back
      setPositionOverrides((prev) => ({ ...prev, [service.id]: [lat, lng] }))
      setSaving(service.id)
      setLastSaved(null)
      try {
        const currentMeta = service.metadata || {}
        const res = await fetch(`/api/services/${service.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metadata: { ...currentMeta, latitude: lat, longitude: lng },
          }),
        })
        if (res.ok) {
          setLastSaved(service.name)
          setTimeout(() => setLastSaved(null), 2000)
          onServiceUpdated?.()
        }
      } catch (err) {
        console.error('Failed to save position:', err)
      } finally {
        setSaving(null)
      }
    },
    [onServiceUpdated]
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50 gap-3">
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-gray-500">
            {markers.filter((m) => m.hasCoords).length} located
          </span>
          <span className="text-xs text-gray-400">
            {markers.filter((m) => !m.hasCoords).length} unlocated (grey circle)
          </span>
        </div>

        {/* Search dropdown */}
        <div ref={searchRef} className="relative">
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5">
            <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Find service..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true) }}
              onFocus={() => setSearchOpen(true)}
              className="w-40 text-xs bg-transparent outline-none placeholder-gray-400"
            />
          </div>
          {searchOpen && (
            <div className="absolute right-0 top-full mt-1 w-64 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {searchResults.length === 0 ? (
                <div className="px-3 py-2 text-xs text-gray-400">No services found</div>
              ) : (
                searchResults.map((s) => {
                  const hasGeo = !!(positionOverrides[s.id] || (s.metadata?.latitude != null && s.metadata?.longitude != null))
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleSelectService(s)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center justify-between gap-2 border-b border-gray-50 last:border-0"
                    >
                      <span className="font-medium text-gray-800 truncate">{s.name}</span>
                      {hasGeo ? (
                        <span className="text-[10px] text-green-600 flex-shrink-0">GPS</span>
                      ) : (
                        <span className="text-[10px] text-gray-400 flex-shrink-0">no GPS</span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          {saving && (
            <span className="flex items-center gap-1 text-gray-500">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving...
            </span>
          )}
          {lastSaved && (
            <span className="flex items-center gap-1 text-green-600">
              <Save className="w-3 h-3" /> Saved {lastSaved}
            </span>
          )}
          {!saving && !lastSaved && (
            <span className="text-gray-400">Drag pins to reposition</span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-4 py-2 border-b border-gray-100">
        {Object.entries(CATEGORY_COLORS)
          .filter(([cat]) => services.some((s) => (s.service_category || 'other') === cat))
          .map(([cat, color]) => (
            <span key={cat} className="flex items-center gap-1 text-[11px] text-gray-600">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              {cat}
            </span>
          ))}
      </div>

      {/* Map */}
      <div style={{ height: 600 }}>
        <MapContainer
          center={PALM_ISLAND_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom
          className="h-full w-full z-0"
          whenReady={() => setMounted(true)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapFlyTo target={flyTarget} />
          {mounted &&
            markers.map(({ service, position, hasCoords }) => (
              <DraggableServiceMarker
                key={service.id}
                service={service}
                position={position}
                hasCoords={hasCoords}
                onDragEnd={(lat, lng) => savePosition(service, lat, lng)}
              />
            ))}
        </MapContainer>
      </div>
    </div>
  )
}

function DraggableServiceMarker({
  service,
  position,
  hasCoords,
  onDragEnd,
}: {
  service: ServiceRow
  position: [number, number]
  hasCoords: boolean
  onDragEnd: (lat: number, lng: number) => void
}) {
  const icon = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    const L = require('leaflet')
    const cat = service.service_category || 'other'
    const color = hasCoords
      ? CATEGORY_COLORS[cat] || CATEGORY_COLORS.other
      : '#999999'
    const size = 30
    const h = Math.round(size * 1.4)

    return L.divIcon({
      className: '',
      html: `<div style="cursor: grab;">${pinSvg(color, size)}</div>`,
      iconSize: [size, h],
      iconAnchor: [size / 2, h],
    })
  }, [service.service_category, hasCoords])

  const handleDragEnd = useCallback(
    (e: any) => {
      const pos = e.target.getLatLng()
      const lat = Math.round(pos.lat * 1000000) / 1000000
      const lng = Math.round(pos.lng * 1000000) / 1000000
      onDragEnd(lat, lng)
    },
    [onDragEnd]
  )

  return (
    <Marker
      position={position}
      draggable
      icon={icon}
      eventHandlers={{ dragend: handleDragEnd }}
    >
      <Tooltip direction="top" offset={[0, -42]}>
        <div className="text-xs">
          <div className="font-semibold">{service.name}</div>
          {hasCoords ? (
            <div className="text-gray-500">
              {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </div>
          ) : (
            <div className="text-amber-600">No coordinates — drag to place</div>
          )}
        </div>
      </Tooltip>
    </Marker>
  )
}
