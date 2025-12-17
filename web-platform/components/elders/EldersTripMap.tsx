'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export type TripStop = {
  id: string
  name: string
  description?: string | null
  lat: number
  lng: number
}

type Props = {
  stops: TripStop[]
  className?: string
}

export default function EldersTripMap({ stops, className = '' }: Props) {
  const [activeId, setActiveId] = useState<string | null>(stops[0]?.id || null)
  const active = stops.find((s) => s.id === activeId) || null
  const activeIndex = useMemo(() => (activeId ? stops.findIndex((s) => s.id === activeId) : -1), [activeId, stops])

  const arrowPoints = useMemo(() => {
    if (stops.length < 2) return []
    const pts: Array<{ id: string; lat: number; lng: number; bearing: number }> = []
    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[i]
      const b = stops[i + 1]
      const bearing = (() => {
        // Approx bearing on a sphere
        const toRad = (deg: number) => (deg * Math.PI) / 180
        const toDeg = (rad: number) => (rad * 180) / Math.PI
        const lat1 = toRad(a.lat)
        const lat2 = toRad(b.lat)
        const dLon = toRad(b.lng - a.lng)
        const y = Math.sin(dLon) * Math.cos(lat2)
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)
        const brng = (toDeg(Math.atan2(y, x)) + 360) % 360
        return brng
      })()
      pts.push({
        id: `${a.id}->${b.id}`,
        // Slightly biased toward the next stop so arrows don't sit on top of numbered pins.
        lat: a.lat + (b.lat - a.lat) * 0.6,
        lng: a.lng + (b.lng - a.lng) * 0.6,
        bearing,
      })
    }
    return pts
  }, [stops])

  const polyline = useMemo(() => stops.map((s) => [s.lat, s.lng] as [number, number]), [stops])

  const markerIcon = useMemo(() => {
    return (index: number, active: boolean) =>
      L.divIcon({
        className: '',
        html: `
          <div style="
            width: 36px; height: 36px;
            border-radius: 9999px;
            border: 2px solid ${active ? '#ffffff' : '#e9d5ff'};
            background: ${active ? '#7c3aed' : '#ffffff'};
            color: ${active ? '#ffffff' : '#6d28d9'};
            box-shadow: 0 10px 20px rgba(0,0,0,0.18);
            display: flex; align-items: center; justify-content: center;
            font-weight: 800; font-size: 13px;
          ">${index + 1}</div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      })
  }, [])

  const arrowIcon = useMemo(() => {
    return (bearing: number) =>
      L.divIcon({
        className: '',
        html: `
          <div style="
            width: 26px; height: 26px;
            border-radius: 9999px;
            background: rgba(255,255,255,0.95);
            border: 1px solid rgba(231,229,228,1);
            box-shadow: 0 10px 20px rgba(0,0,0,0.10);
            display: flex; align-items: center; justify-content: center;
          ">
            <div style="
              transform: rotate(${bearing}deg);
              color: #6d28d9;
              font-weight: 900;
              font-size: 14px;
              line-height: 1;
            ">➤</div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      })
  }, [])

  function FitBounds({ points }: { points: TripStop[] }) {
    const map = useMap()
    useEffect(() => {
      if (!map || points.length === 0) return
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]))
      map.fitBounds(bounds.pad(0.25), { animate: true })
    }, [map, points])
    return null
  }

  return (
    <div className={`rounded-2xl overflow-hidden border border-stone-200 bg-white ${className}`}>
      <div className="px-6 pt-5 pb-4 border-b border-stone-200">
        <h3 className="text-lg font-bold text-gray-900">Where the Elders Went</h3>
        <p className="text-sm text-gray-600 mt-1">
          Follow the journey — tap a pin to see each stop.
        </p>
      </div>

      <div className="relative h-[420px]">
        <MapContainer
          center={stops.length ? [stops[0].lat, stops[0].lng] : [-19.0, 146.0]}
          zoom={stops.length ? 8 : 4}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds points={stops} />

          {stops.length >= 2 && (
            <Polyline
              positions={polyline as any}
              pathOptions={{ color: '#7c3aed', weight: 5, opacity: 0.9 }}
            />
          )}

          {arrowPoints.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={arrowIcon(p.bearing)} interactive={false} />
          ))}

          {stops.map((s, idx) => (
            <Marker
              key={s.id}
              position={[s.lat, s.lng]}
              icon={markerIcon(idx, activeId === s.id)}
              eventHandlers={{
                click: () => setActiveId(s.id),
              }}
            />
          ))}
        </MapContainer>

        {active && (
          <div className="absolute left-4 bottom-4 right-4 md:right-auto md:w-[420px] bg-white/95 backdrop-blur rounded-xl border border-stone-200 shadow-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-purple-700">Selected stop</div>
                <div className="text-base font-bold text-gray-900 truncate">{active.name}</div>
                {active.description && <div className="text-sm text-gray-700 mt-1">{active.description}</div>}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (activeIndex <= 0) return
                    setActiveId(stops[activeIndex - 1]?.id || null)
                  }}
                  disabled={activeIndex <= 0}
                  className="p-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50"
                  aria-label="Previous stop"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (activeIndex < 0 || activeIndex >= stops.length - 1) return
                    setActiveId(stops[activeIndex + 1]?.id || null)
                  }}
                  disabled={activeIndex < 0 || activeIndex >= stops.length - 1}
                  className="p-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50"
                  aria-label="Next stop"
                >
                  <ChevronRight className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveId(null)}
                  className="p-2 rounded-lg hover:bg-stone-100 text-gray-700"
                  aria-label="Close stop details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-4 bg-stone-50 border-t border-stone-200">
        <ol className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {stops.map((s, idx) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setActiveId(s.id)}
                className={`w-full text-left rounded-xl border px-3 py-2 transition-colors ${
                  activeId === s.id ? 'bg-white border-purple-300' : 'bg-white/70 border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="font-semibold text-gray-900 truncate">{s.name}</div>
                </div>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
