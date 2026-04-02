'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { ChevronLeft, ChevronRight, MapPin, Navigation } from 'lucide-react'

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

// Brand colours
const OCHRE = '#C8963E'
const EARTH = '#2D2319'
const CREAM = '#FEF3C7'
const WHITE = '#FFFFFF'

function createStopIcon(index: number, isActive: boolean, isVisited: boolean) {
  const size = isActive ? 44 : 36
  const bg = isActive ? OCHRE : isVisited ? EARTH : WHITE
  const border = isActive ? WHITE : OCHRE
  const textColor = isActive ? WHITE : isVisited ? OCHRE : EARTH
  const shadow = isActive
    ? '0 4px 20px rgba(200,150,62,0.5)'
    : '0 2px 12px rgba(0,0,0,0.15)'
  const scale = isActive ? 'transform: scale(1.0);' : 'transform: scale(0.85);'

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: ${size}px; height: ${size}px;
        border-radius: 50%;
        border: 3px solid ${border};
        background: ${bg};
        color: ${textColor};
        box-shadow: ${shadow};
        display: flex; align-items: center; justify-content: center;
        font-weight: 800; font-size: ${isActive ? 16 : 14}px;
        font-family: system-ui, -apple-system, sans-serif;
        transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
        ${scale}
        cursor: pointer;
        position: relative;
      ">
        ${index + 1}
        ${isActive ? `<div style="
          position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%);
          width: 8px; height: 8px; background: ${OCHRE}; border-radius: 50%;
          animation: pulse 2s infinite;
        "></div>` : ''}
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.5; transform: translateX(-50%) scale(1.5); }
        }
      </style>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function FlyToStop({ stop }: { stop: TripStop | null }) {
  const map = useMap()
  useEffect(() => {
    if (!stop || !map) return
    map.flyTo([stop.lat, stop.lng], 10, {
      duration: 1.2,
      easeLinearity: 0.25,
    })
  }, [map, stop])
  return null
}

function FitBounds({ points }: { points: TripStop[] }) {
  const map = useMap()
  useEffect(() => {
    if (!map || points.length === 0) return
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]))
    map.fitBounds(bounds.pad(0.3), { animate: true, duration: 1 })
  }, [map, points])
  return null
}

// Journey narrative for each stop
const STOP_NARRATIVES: Record<string, { emoji: string; narrative: string }> = {
  'Palm Island': {
    emoji: '🏝️',
    narrative: 'The journey begins here — departing from Country, carrying the strength of community.',
  },
  'Lucinda': {
    emoji: '⛴️',
    narrative: 'Crossing the water by barge, the way generations have travelled between island and mainland.',
  },
  'Ingham': {
    emoji: '🛤️',
    narrative: 'Passing through sugar country, where many families have deep connections and history.',
  },
  'Hull River': {
    emoji: '🌿',
    narrative: 'The heart of the journey — returning to the mission site where families were held. A place of memory, grief, and reclamation.',
  },
}

export default function EldersTripMap({ stops, className = '' }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const activeStop = stops[activeIndex] || null
  const visitedStops = useMemo(() => new Set(
    stops.slice(0, activeIndex + 1).map(s => s.id)
  ), [stops, activeIndex])

  const polyline = useMemo(
    () => stops.map((s) => [s.lat, s.lng] as [number, number]),
    [stops]
  )

  // Animated path up to current stop
  const activePath = useMemo(
    () => stops.slice(0, activeIndex + 1).map((s) => [s.lat, s.lng] as [number, number]),
    [stops, activeIndex]
  )

  const goNext = useCallback(() => {
    setActiveIndex((i) => Math.min(i + 1, stops.length - 1))
  }, [stops.length])

  const goPrev = useCallback(() => {
    setActiveIndex((i) => Math.max(i - 1, 0))
  }, [])

  // Auto-play journey
  useEffect(() => {
    if (!isPlaying) return
    if (activeIndex >= stops.length - 1) {
      setIsPlaying(false)
      return
    }
    const timer = setTimeout(goNext, 3000)
    return () => clearTimeout(timer)
  }, [isPlaying, activeIndex, stops.length, goNext])

  const getNarrative = (name: string) => {
    for (const [key, val] of Object.entries(STOP_NARRATIVES)) {
      if (name.toLowerCase().includes(key.toLowerCase())) return val
    }
    return { emoji: '📍', narrative: '' }
  }

  const progress = stops.length > 1 ? (activeIndex / (stops.length - 1)) * 100 : 0

  return (
    <div className={`rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-sm ${className}`}>
      {/* Header with journey progress */}
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-picc-ochre" />
              The Journey
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Follow the Elders from Palm Island to Hull River and back
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (isPlaying) {
                setIsPlaying(false)
              } else {
                setActiveIndex(0)
                setIsPlaying(true)
              }
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              isPlaying
                ? 'bg-stone-100 text-gray-700 hover:bg-stone-200'
                : 'bg-picc-ochre text-white hover:bg-picc-ochre/90'
            }`}
          >
            {isPlaying ? 'Pause' : 'Play Journey'}
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-4 relative">
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-picc-ochre to-picc-red rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {stops.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => { setActiveIndex(idx); setIsPlaying(false) }}
                className="group flex flex-col items-center"
              >
                <div
                  className={`w-3 h-3 rounded-full border-2 transition-all ${
                    idx === activeIndex
                      ? 'bg-picc-ochre border-picc-ochre scale-125'
                      : idx < activeIndex
                      ? 'bg-picc-earth border-picc-earth'
                      : 'bg-white border-stone-300 group-hover:border-picc-ochre'
                  }`}
                />
                <span className={`text-[10px] mt-1 font-medium transition-colors ${
                  idx === activeIndex ? 'text-picc-ochre' : 'text-gray-400 group-hover:text-gray-600'
                }`}>
                  {s.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative h-[460px]">
        <MapContainer
          center={stops.length ? [stops[0].lat, stops[0].lng] : [-19.0, 146.0]}
          zoom={9}
          scrollWheelZoom={false}
          zoomControl={false}
          className="h-full w-full"
          style={{ background: '#f0ebe3' }}
        >
          {/* Warm-toned map tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png"
          />

          <FitBounds points={stops} />
          {activeStop && <FlyToStop stop={activeStop} />}

          {/* Full route (faded) */}
          {stops.length >= 2 && (
            <Polyline
              positions={polyline}
              pathOptions={{
                color: OCHRE,
                weight: 3,
                opacity: 0.2,
                dashArray: '8 12',
              }}
            />
          )}

          {/* Active path (solid, animated) */}
          {activePath.length >= 2 && (
            <Polyline
              positions={activePath}
              pathOptions={{
                color: OCHRE,
                weight: 4,
                opacity: 0.8,
              }}
            />
          )}

          {/* Stop markers */}
          {stops.map((s, idx) => (
            <Marker
              key={s.id}
              position={[s.lat, s.lng]}
              icon={createStopIcon(idx, activeIndex === idx, visitedStops.has(s.id))}
              eventHandlers={{
                click: () => { setActiveIndex(idx); setIsPlaying(false) },
              }}
            />
          ))}
        </MapContainer>

        {/* Story panel overlay */}
        {activeStop && (
          <div className="absolute left-4 bottom-4 right-4 md:right-auto md:max-w-[440px] animate-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200 shadow-2xl overflow-hidden">
              {/* Stop header */}
              <div className="bg-gradient-to-r from-picc-earth to-picc-earth/90 px-5 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-picc-ochre text-white flex items-center justify-center font-bold text-sm">
                      {activeIndex + 1}
                    </div>
                    <div>
                      <div className="text-white font-bold">{activeStop.name}</div>
                      <div className="text-white/60 text-xs">Stop {activeIndex + 1} of {stops.length}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={goPrev}
                      disabled={activeIndex <= 0}
                      className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-all"
                      aria-label="Previous stop"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={activeIndex >= stops.length - 1}
                      className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-all"
                      aria-label="Next stop"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Stop content */}
              <div className="px-5 py-4">
                {activeStop.description && (
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {activeStop.description}
                  </p>
                )}
                {getNarrative(activeStop.name).narrative && (
                  <p className="text-gray-600 text-sm mt-2 italic leading-relaxed">
                    <span className="mr-1">{getNarrative(activeStop.name).emoji}</span>
                    {getNarrative(activeStop.name).narrative}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stop selector strip */}
      <div className="px-4 py-3 bg-gradient-to-b from-stone-50 to-white border-t border-stone-100">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {stops.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => { setActiveIndex(idx); setIsPlaying(false) }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border whitespace-nowrap transition-all ${
                activeIndex === idx
                  ? 'bg-picc-earth text-white border-picc-earth shadow-md'
                  : idx < activeIndex
                  ? 'bg-warm-100 text-picc-earth border-picc-ochre/30 hover:border-picc-ochre'
                  : 'bg-white text-gray-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                activeIndex === idx
                  ? 'bg-picc-ochre text-white'
                  : idx < activeIndex
                  ? 'bg-picc-earth text-picc-ochre'
                  : 'bg-stone-100 text-stone-500'
              }`}>
                {idx + 1}
              </div>
              <span className="font-semibold text-sm">{s.name}</span>
              {idx < activeIndex && (
                <MapPin className="w-3 h-3 text-picc-ochre flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
