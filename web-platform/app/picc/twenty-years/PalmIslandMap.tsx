/**
 * PalmIslandMap — read-only public-facing map of every PICC service
 * with a GPS pin set in EL canonical. Used in /picc/twenty-years as
 * Section 02b ("Where the work happens"). Coordinates flow from the
 * /picc/services/map admin → EL canonical → here.
 */
'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'

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

function pinSvg(color: string) {
  return `
    <svg width="28" height="40" viewBox="0 0 40 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 52 C20 52 3.5 32 2.8 22 C2.2 13.5 6 6.5 12 3.5 C15 2 18 1.2 20 1.2 C22 1.2 25 2 28 3.5 C34 6.5 37.8 13.5 37.2 22 C36.5 32 20 52 20 52Z"
            fill="${color}" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="20" cy="19" r="6" fill="white" fill-opacity="0.95"/>
    </svg>
  `
}

export interface PinService {
  id: string
  slug: string
  name: string
  service_category: string | null
  latitude: number
  longitude: number
}

export default function PalmIslandMap({ services }: { services: PinService[] }) {
  const center = useMemo<[number, number]>(() => {
    if (services.length === 0) return PALM_ISLAND_CENTER
    const lat = services.reduce((a, s) => a + s.latitude, 0) / services.length
    const lng = services.reduce((a, s) => a + s.longitude, 0) / services.length
    return [lat, lng]
  }, [services])

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid #E8E6E3', backgroundColor: '#fff' }}
    >
      <div style={{ height: 480 }}>
        <MapContainer
          center={center}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          {services.map((s) => {
            const colour = CATEGORY_COLORS[s.service_category || 'other'] || CATEGORY_COLORS.other
            let icon: any = undefined
            if (typeof window !== 'undefined') {
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              const L = require('leaflet')
              icon = L.divIcon({
                html: pinSvg(colour),
                className: 'picc-twenty-pin',
                iconSize: [28, 40],
                iconAnchor: [14, 40],
              })
            }
            return (
              <Marker key={s.id} position={[s.latitude, s.longitude]} icon={icon}>
                <Tooltip direction="top" offset={[0, -32]} opacity={0.95}>
                  <div style={{ fontFamily: 'Inter, system-ui', fontSize: 12 }}>
                    <strong style={{ color: '#0B4F6C' }}>{s.name}</strong>
                    {s.service_category && (
                      <div style={{ color: colour, fontSize: 10, marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {s.service_category}
                      </div>
                    )}
                  </div>
                </Tooltip>
              </Marker>
            )
          })}
        </MapContainer>
      </div>
      <div
        className="px-5 py-3 text-[11px] flex items-center justify-between"
        style={{ color: '#6B6560', borderTop: '1px solid #E8E6E3' }}
      >
        <span>
          {services.length} services placed on Country. Tap any pin for the name.
        </span>
        <a
          href="/picc/services/map"
          className="font-bold uppercase tracking-widest hover:underline"
          style={{ color: '#C8963E', letterSpacing: '0.2em' }}
        >
          Edit positions →
        </a>
      </div>
    </div>
  )
}
