'use client'

/**
 * HullRiverMap — the foundational journey.
 *
 * Two pins: Tully Heads (where the Hull River Settlement was) and Great
 * Palm Island (where Bwgcolman community formed after the 1918 cyclone
 * transfer). A dashed line connects them.
 *
 * Centered between the two points; light tiles to keep focus on the
 * journey, not the geography.
 */

import dynamic from 'next/dynamic'

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
const Polyline = dynamic(
  () => import('react-leaflet').then((m) => m.Polyline),
  { ssr: false },
)

// Hull River Settlement was at the mouth of the Hull River, near present-
// day Tully Heads in Far North Queensland. Coordinates approximate the
// historical settlement location.
const HULL_RIVER: [number, number] = [-17.95, 146.08]
const PALM_ISLAND: [number, number] = [-18.7285, 146.5808]
const CENTER: [number, number] = [
  (HULL_RIVER[0] + PALM_ISLAND[0]) / 2,
  (HULL_RIVER[1] + PALM_ISLAND[1]) / 2,
]

function pinSvg(color: string, label: string) {
  return `
    <svg width="32" height="44" viewBox="0 0 40 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 52 C20 52 3.5 32 2.8 22 C2.2 13.5 6 6.5 12 3.5 C15 2 18 1.2 20 1.2 C22 1.2 25 2 28 3.5 C34 6.5 37.8 13.5 37.2 22 C36.5 32 20 52 20 52Z"
            fill="${color}" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
      <text x="20" y="24" font-family="Georgia, serif" font-size="13" font-weight="700" fill="white" text-anchor="middle">${label}</text>
    </svg>
  `
}

export default function HullRiverMap() {
  return (
    <div
      className="rounded-2xl overflow-hidden border bg-white"
      style={{ borderColor: '#E8E6E3' }}
    >
      <div style={{ height: 480 }}>
        <MapContainer
          center={CENTER}
          zoom={9}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          <Polyline
            positions={[HULL_RIVER, PALM_ISLAND]}
            pathOptions={{
              color: '#8B6F47',
              weight: 2.5,
              dashArray: '8 8',
              opacity: 0.7,
            }}
          />

          {/* Hull River pin */}
          {(() => {
            if (typeof window === 'undefined') return null
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const L = require('leaflet')
            const hullIcon = L.divIcon({
              html: pinSvg('#8B1A1A', 'H'),
              className: 'hull-river-pin',
              iconSize: [32, 44],
              iconAnchor: [16, 44],
            })
            const palmIcon = L.divIcon({
              html: pinSvg('#2D5F4F', 'P'),
              className: 'palm-island-pin',
              iconSize: [32, 44],
              iconAnchor: [16, 44],
            })
            return (
              <>
                <Marker position={HULL_RIVER} icon={hullIcon}>
                  <Tooltip direction="top" offset={[0, -36]} permanent>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: 12 }}>
                      <strong>Hull River Settlement</strong>
                      <div style={{ fontSize: 10, color: '#666' }}>
                        1914 — established
                      </div>
                      <div style={{ fontSize: 10, color: '#666' }}>
                        1918 — destroyed by cyclone
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
                <Marker position={PALM_ISLAND} icon={palmIcon}>
                  <Tooltip direction="top" offset={[0, -36]} permanent>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: 12 }}>
                      <strong>Great Palm Island</strong>
                      <div style={{ fontSize: 10, color: '#666' }}>
                        1918 — transfer
                      </div>
                      <div style={{ fontSize: 10, color: '#666' }}>
                        1919 — formally gazetted as Reserve
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
              </>
            )
          })()}
        </MapContainer>
      </div>
      <div
        className="px-5 py-3 text-[11px] flex items-center justify-between"
        style={{ color: '#6B6560', borderTop: '1px solid #E8E6E3' }}
      >
        <span>
          The 1918 transfer: about 70 km south-east from Hull River to Great
          Palm Island.
        </span>
        <span className="italic">Bwgcolman: many tribes, one people.</span>
      </div>
    </div>
  )
}
