/**
 * ServicesMapEditor — client island for the drag-to-position map.
 *
 * Saves through /api/admin/service-location which writes to BOTH:
 *   1. EL canonical services.latitude/longitude/address (source of truth)
 *   2. PICC organization_services.metadata.latitude/longitude (mirror)
 *
 * Optimistic UI: updates local position immediately on drag-end, fires
 * the save in the background, surfaces success/error per-row.
 */
'use client'

import { useCallback, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { Check, Loader2, AlertCircle, MapPin } from 'lucide-react'

const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false },
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false },
)
const Marker = dynamic(
  () => import('react-leaflet').then((m) => m.Marker),
  { ssr: false },
)
const Tooltip = dynamic(
  () => import('react-leaflet').then((m) => m.Tooltip),
  { ssr: false },
)

const PALM_ISLAND_CENTER: [number, number] = [-18.7285, 146.5808]
const DEFAULT_ZOOM = 14

const CATEGORY_COLORS: Record<string, string> = {
  health: '#C8963E',
  family: '#A67C6D',
  community: '#0B4F6C',
  justice: '#8B1A1A',
  culture: '#8C7A8B',
  education: '#0B4F6C',
  economic: '#F5A623',
  environment: '#16A34A',
  housing: '#8B8B7D',
  employment: '#7D7B6B',
  youth: '#0EA5E9',
  other: '#6B6560',
}

function pinSvg(color: string, size = 32) {
  return `
    <svg width="${size}" height="${Math.round(size * 1.4)}" viewBox="0 0 40 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 52 C20 52 3.5 32 2.8 22 C2.2 13.5 6 6.5 12 3.5 C15 2 18 1.2 20 1.2 C22 1.2 25 2 28 3.5 C34 6.5 37.8 13.5 37.2 22 C36.5 32 20 52 20 52Z"
            fill="${color}" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="20" cy="19" r="7" fill="white" fill-opacity="0.9"/>
      <circle cx="20" cy="19" r="4.5" fill="${color}" fill-opacity="0.7"/>
    </svg>
  `
}

interface ServiceRow {
  id: string
  slug: string
  name: string
  service_category: string | null
  latitude: number | null
  longitude: number | null
  address: string | null
  hasGeo: boolean
}

interface Props {
  services: ServiceRow[]
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export default function ServicesMapEditor({ services }: Props) {
  // Local position overrides + save state per service
  const [overrides, setOverrides] = useState<Record<string, [number, number]>>({})
  const [saveState, setSaveState] = useState<Record<string, SaveState>>({})
  const [saveError, setSaveError] = useState<Record<string, string>>({})
  const [activeId, setActiveId] = useState<string | null>(null)

  const placedServices = useMemo(
    () => services.filter((s) => overrides[s.id] || (s.latitude != null && s.longitude != null)),
    [services, overrides],
  )
  const unplacedServices = useMemo(
    () => services.filter((s) => !overrides[s.id] && (s.latitude == null || s.longitude == null)),
    [services, overrides],
  )

  const handleDragEnd = useCallback(
    async (svc: ServiceRow, e: any) => {
      const { lat, lng } = e.target.getLatLng()
      const next: [number, number] = [lat, lng]
      setOverrides((prev) => ({ ...prev, [svc.id]: next }))
      setSaveState((prev) => ({ ...prev, [svc.id]: 'saving' }))
      setSaveError((prev) => ({ ...prev, [svc.id]: '' }))

      try {
        const res = await fetch('/api/admin/service-location', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            service_id: svc.id,
            slug: svc.slug,
            latitude: lat,
            longitude: lng,
            address: svc.address ?? null,
          }),
        })
        const json = await res.json().catch(() => ({}))
        if (res.ok) {
          setSaveState((prev) => ({ ...prev, [svc.id]: 'saved' }))
          setTimeout(() => setSaveState((p) => ({ ...p, [svc.id]: 'idle' })), 2200)
        } else {
          setSaveState((prev) => ({ ...prev, [svc.id]: 'error' }))
          const msg =
            json?.el?.error || json?.picc?.error || json?.error || `HTTP ${res.status}`
          setSaveError((prev) => ({ ...prev, [svc.id]: msg }))
        }
      } catch (err: any) {
        setSaveState((prev) => ({ ...prev, [svc.id]: 'error' }))
        setSaveError((prev) => ({ ...prev, [svc.id]: err?.message || String(err) }))
      }
    },
    [],
  )

  const placePin = useCallback(
    (svc: ServiceRow) => {
      // Place at island centre + small jitter so multiple unplaced services
      // don't stack exactly on top of each other.
      const jitter = (i: number) => (i % 5) * 0.0008 - 0.0016
      const idx = unplacedServices.findIndex((s) => s.id === svc.id)
      const next: [number, number] = [
        PALM_ISLAND_CENTER[0] + jitter(idx),
        PALM_ISLAND_CENTER[1] + jitter(idx + 2),
      ]
      setOverrides((prev) => ({ ...prev, [svc.id]: next }))
      setActiveId(svc.id)
      void handleDragEnd(svc, { target: { getLatLng: () => ({ lat: next[0], lng: next[1] }) } })
    },
    [unplacedServices, handleDragEnd],
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Map */}
      <div className="lg:col-span-8">
        <div className="rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid #E8E6E3' }}>
          <div style={{ height: 600 }}>
            <MapContainer
              center={PALM_ISLAND_CENTER}
              zoom={DEFAULT_ZOOM}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              {placedServices.map((s) => {
                const pos: [number, number] = overrides[s.id] || [s.latitude!, s.longitude!]
                const colour = CATEGORY_COLORS[s.service_category || 'other'] || CATEGORY_COLORS.other
                let icon: any = undefined
                if (typeof window !== 'undefined') {
                  // eslint-disable-next-line @typescript-eslint/no-require-imports
                  const L = require('leaflet')
                  icon = L.divIcon({
                    html: pinSvg(colour, activeId === s.id ? 40 : 32),
                    className: 'picc-service-pin',
                    iconSize: [activeId === s.id ? 40 : 32, activeId === s.id ? 56 : 44],
                    iconAnchor: [activeId === s.id ? 20 : 16, activeId === s.id ? 56 : 44],
                  })
                }
                return (
                  <Marker
                    key={s.id}
                    position={pos}
                    draggable
                    icon={icon}
                    eventHandlers={{
                      dragstart: () => setActiveId(s.id),
                      dragend: (e: any) => handleDragEnd(s, e),
                      click: () => setActiveId(s.id),
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -32]} opacity={0.95}>
                      <div style={{ fontFamily: 'Inter, system-ui', fontSize: 12 }}>
                        <strong style={{ color: '#0B4F6C' }}>{s.name}</strong>
                        <div style={{ color: '#6B6560', fontSize: 10, marginTop: 2 }}>
                          {pos[0].toFixed(5)}, {pos[1].toFixed(5)}
                        </div>
                      </div>
                    </Tooltip>
                  </Marker>
                )
              })}
            </MapContainer>
          </div>
          <div className="px-5 py-3 text-[11px] flex items-center justify-between" style={{ color: '#6B6560', borderTop: '1px solid #E8E6E3' }}>
            <span>Drag any pin to set position. Saves automatically to EL + PICC.</span>
            <span style={{ color: '#0B4F6C' }}>{placedServices.length} placed</span>
          </div>
        </div>
      </div>

      {/* Sidebar — service list */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div>
          <p
            className="uppercase font-bold mb-2"
            style={{ color: '#C8963E', fontSize: 10, letterSpacing: '0.3em' }}
          >
            Awaiting placement · {unplacedServices.length}
          </p>
          <div className="rounded-xl bg-white" style={{ border: '1px solid #E8E6E3' }}>
            {unplacedServices.length === 0 ? (
              <p className="p-4 text-sm italic" style={{ color: '#6B6560' }}>
                Every service is placed. Nice.
              </p>
            ) : (
              unplacedServices.map((s, i) => {
                const colour = CATEGORY_COLORS[s.service_category || 'other'] || CATEGORY_COLORS.other
                return (
                  <button
                    key={s.id}
                    onClick={() => placePin(s)}
                    className={`w-full text-left flex items-center gap-3 p-3 hover:bg-stone-50 transition ${i > 0 ? 'border-t' : ''}`}
                    style={{ borderColor: '#E8E6E3' }}
                  >
                    <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: colour }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate" style={{ color: '#0B4F6C', fontSize: 13 }}>
                        {s.name}
                      </div>
                      {s.service_category && (
                        <div className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: '#6B6560' }}>
                          {s.service_category}
                        </div>
                      )}
                    </div>
                    <span
                      className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded"
                      style={{ backgroundColor: colour + '22', color: colour, letterSpacing: '0.15em' }}
                    >
                      Place
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>

        <div>
          <p
            className="uppercase font-bold mb-2"
            style={{ color: '#16A34A', fontSize: 10, letterSpacing: '0.3em' }}
          >
            Placed · {placedServices.length}
          </p>
          <div className="rounded-xl bg-white max-h-[400px] overflow-y-auto" style={{ border: '1px solid #E8E6E3' }}>
            {placedServices.map((s, i) => {
              const colour = CATEGORY_COLORS[s.service_category || 'other'] || CATEGORY_COLORS.other
              const state = saveState[s.id] || 'idle'
              const err = saveError[s.id]
              const pos = overrides[s.id] || [s.latitude!, s.longitude!]
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveId(s.id)}
                  className={`w-full text-left flex items-center gap-3 p-3 hover:bg-stone-50 transition ${i > 0 ? 'border-t' : ''}`}
                  style={{
                    borderColor: '#E8E6E3',
                    backgroundColor: activeId === s.id ? '#0B4F6C08' : undefined,
                  }}
                >
                  <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: colour }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate" style={{ color: '#0B4F6C', fontSize: 13 }}>
                      {s.name}
                    </div>
                    <div className="text-[10px] mt-0.5 font-mono" style={{ color: '#6B6560' }}>
                      {pos[0].toFixed(4)}, {pos[1].toFixed(4)}
                    </div>
                    {err && (
                      <div className="text-[10px] mt-1 flex items-center gap-1" style={{ color: '#8B1A1A' }}>
                        <AlertCircle className="w-3 h-3" /> {err.slice(0, 60)}
                      </div>
                    )}
                  </div>
                  {state === 'saving' && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" style={{ color: '#C8963E' }} />
                  )}
                  {state === 'saved' && (
                    <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#16A34A' }} />
                  )}
                  {state === 'error' && (
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#8B1A1A' }} />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
