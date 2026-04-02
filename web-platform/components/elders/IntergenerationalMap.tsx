'use client'

import { useState, useCallback, useMemo } from 'react'
import { Users, MapPin, ChevronDown, ChevronUp, ArrowDown } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CulturalGroup = {
  id: string
  name: string
  homeland: string
  homelandRegion: string
  color: string
  elderCount: number
  youthCount: number
  description?: string
}

type Props = {
  groups?: CulturalGroup[]
  className?: string
}

// ---------------------------------------------------------------------------
// Default data
// ---------------------------------------------------------------------------

const DEFAULT_GROUPS: CulturalGroup[] = [
  { id: 'bwgcolman', name: 'Bwgcolman', homeland: 'Palm Island', homelandRegion: 'palm-island', color: '#C17817', elderCount: 3, youthCount: 12, description: 'Traditional custodians of Great Palm Island' },
  { id: 'manbarra', name: 'Manbarra', homeland: 'Palm Island & Halifax Bay', homelandRegion: 'palm-island', color: '#D4922A', elderCount: 2, youthCount: 8, description: 'Sea people of Halifax Bay and surrounding islands' },
  { id: 'birri-gubba', name: 'Birri-Gubba', homeland: 'Bowen to Sarina', homelandRegion: 'bowen', color: '#8B6914', elderCount: 1, youthCount: 6 },
  { id: 'nywaigi', name: 'Nywaigi', homeland: 'Ingham & Herbert River', homelandRegion: 'ingham', color: '#6B8E23', elderCount: 1, youthCount: 5 },
  { id: 'warrgamay', name: 'Warrgamay', homeland: 'Cardwell & Hinchinbrook', homelandRegion: 'cardwell', color: '#2E8B57', elderCount: 0, youthCount: 4 },
  { id: 'wulgurukaba', name: 'Wulgurukaba', homeland: 'Townsville & Magnetic Island', homelandRegion: 'townsville', color: '#4682B4', elderCount: 1, youthCount: 7 },
  { id: 'gugu-badhun', name: 'Gugu Badhun', homeland: 'Valley of Lagoons', homelandRegion: 'inland', color: '#9370DB', elderCount: 0, youthCount: 3 },
  { id: 'other', name: 'Other Groups', homeland: 'Various', homelandRegion: 'various', color: '#808080', elderCount: 0, youthCount: 10, description: 'Over 40 language groups were relocated to Palm Island' },
]

// ---------------------------------------------------------------------------
// Homeland region positions (outer ring)
// ---------------------------------------------------------------------------

type HomelandRegion = {
  label: string
  angle: number // degrees, 0 = top
}

const HOMELAND_REGIONS: Record<string, HomelandRegion> = {
  'palm-island':  { label: 'Palm Island (Home)', angle: 0 },
  'bowen':        { label: 'Bowen — Sarina', angle: 50 },
  'ingham':       { label: 'Ingham / Herbert River', angle: 100 },
  'cardwell':     { label: 'Cardwell / Hinchinbrook', angle: 150 },
  'townsville':   { label: 'Townsville Region', angle: 210 },
  'inland':       { label: 'Valley of Lagoons (Inland)', angle: 270 },
  'various':      { label: 'Various Homelands', angle: 320 },
}

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

const CX = 400
const CY = 380
const GROUP_RING_R = 180
const HOMELAND_RING_R = 310
const CENTER_R = 50

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function nodeRadius(g: CulturalGroup) {
  return 28 + (g.elderCount + g.youthCount) * 1.2
}

// ---------------------------------------------------------------------------
// SVG sub-components
// ---------------------------------------------------------------------------

function CenterHub() {
  return (
    <g>
      {/* Outer glow */}
      <circle cx={CX} cy={CY} r={CENTER_R + 6} fill="none" stroke="#C8922A" strokeWidth={2} opacity={0.3} />
      <circle cx={CX} cy={CY} r={CENTER_R + 12} fill="none" stroke="#C8922A" strokeWidth={1} opacity={0.15} />
      {/* Main circle */}
      <circle cx={CX} cy={CY} r={CENTER_R} fill="#C8922A" />
      <circle cx={CX} cy={CY} r={CENTER_R} fill="url(#centerGradient)" />
      {/* Label */}
      <text x={CX} y={CY - 8} textAnchor="middle" fill="white" fontSize={13} fontWeight={700} fontFamily="Inter, sans-serif">
        Palm Island
      </text>
      <text x={CX} y={CY + 10} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize={9} fontFamily="Inter, sans-serif">
        Bwgcolman
      </text>
    </g>
  )
}

function ConnectionPath({
  group,
  groupPos,
  homelandPos,
}: {
  group: CulturalGroup
  groupPos: { x: number; y: number }
  homelandPos: { x: number; y: number }
}) {
  // Bezier control point — pull toward center for a nice curve
  const cpx = (groupPos.x + homelandPos.x) / 2 + (CX - (groupPos.x + homelandPos.x) / 2) * 0.3
  const cpy = (groupPos.y + homelandPos.y) / 2 + (CY - (groupPos.y + homelandPos.y) / 2) * 0.3

  return (
    <path
      d={`M ${groupPos.x} ${groupPos.y} Q ${cpx} ${cpy} ${homelandPos.x} ${homelandPos.y}`}
      fill="none"
      stroke={group.color}
      strokeWidth={1.5}
      strokeDasharray="6 4"
      opacity={0.45}
    />
  )
}

function HomelandLabel({ region, pos }: { region: HomelandRegion; pos: { x: number; y: number } }) {
  // Determine text-anchor based on position
  const anchor = pos.x < CX - 40 ? 'end' : pos.x > CX + 40 ? 'start' : 'middle'
  return (
    <g>
      <circle cx={pos.x} cy={pos.y} r={5} fill="#5B7B5E" opacity={0.7} />
      <text
        x={pos.x + (anchor === 'start' ? 10 : anchor === 'end' ? -10 : 0)}
        y={pos.y + 4}
        textAnchor={anchor}
        fill="#5B7B5E"
        fontSize={10}
        fontFamily="Inter, sans-serif"
        fontWeight={500}
      >
        {region.label}
      </text>
    </g>
  )
}

function GroupNode({
  group,
  pos,
  r,
  isSelected,
  isHovered,
  onHover,
  onLeave,
  onClick,
}: {
  group: CulturalGroup
  pos: { x: number; y: number }
  r: number
  isSelected: boolean
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
  onClick: () => void
}) {
  const scale = isHovered ? 1.1 : isSelected ? 1.05 : 1
  return (
    <g
      style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
      transform={`translate(${pos.x}, ${pos.y}) scale(${scale}) translate(${-pos.x}, ${-pos.y})`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {/* Selection ring */}
      {isSelected && (
        <circle cx={pos.x} cy={pos.y} r={r + 5} fill="none" stroke={group.color} strokeWidth={2.5} opacity={0.6} />
      )}
      {/* Node background */}
      <circle cx={pos.x} cy={pos.y} r={r} fill={group.color} opacity={0.9} />
      {/* Inner ring showing generational layers */}
      <circle cx={pos.x} cy={pos.y} r={r * 0.65} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
      <circle cx={pos.x} cy={pos.y} r={r * 0.35} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
      {/* Group name */}
      <text x={pos.x} y={pos.y - 4} textAnchor="middle" fill="white" fontSize={10} fontWeight={700} fontFamily="Inter, sans-serif">
        {group.name}
      </text>
      {/* Counts */}
      <text x={pos.x} y={pos.y + 9} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize={8} fontFamily="Inter, sans-serif">
        {group.elderCount > 0 ? `${group.elderCount}E` : ''}{group.elderCount > 0 && group.youthCount > 0 ? ' · ' : ''}{group.youthCount > 0 ? `${group.youthCount}Y` : ''}
      </text>
      {/* Connection line to center */}
      <line x1={pos.x} y1={pos.y} x2={CX} y2={CY} stroke={group.color} strokeWidth={1} opacity={0.2} />
    </g>
  )
}

function HoverTooltip({ group, pos }: { group: CulturalGroup; pos: { x: number; y: number } }) {
  const tooltipW = 200
  const tooltipH = group.description ? 78 : 60
  // Position above the node
  const tx = Math.max(10, Math.min(pos.x - tooltipW / 2, 800 - tooltipW - 10))
  const ty = pos.y - nodeRadius(group) - tooltipH - 12

  return (
    <g>
      {/* Shadow */}
      <rect x={tx - 1} y={ty - 1} width={tooltipW + 2} height={tooltipH + 2} rx={8} fill="rgba(0,0,0,0.1)" />
      {/* Background */}
      <rect x={tx} y={ty} width={tooltipW} height={tooltipH} rx={7} fill="#2D2319" stroke={group.color} strokeWidth={1} />
      {/* Content */}
      <text x={tx + 12} y={ty + 18} fill="white" fontSize={12} fontWeight={700} fontFamily="Inter, sans-serif">
        {group.name}
      </text>
      <text x={tx + 12} y={ty + 33} fill="#C8922A" fontSize={10} fontFamily="Inter, sans-serif">
        <tspan fontWeight={500}>Homeland:</tspan> {group.homeland}
      </text>
      <text x={tx + 12} y={ty + 48} fill="rgba(255,255,255,0.7)" fontSize={10} fontFamily="Inter, sans-serif">
        Elders: {group.elderCount} · Youth: {group.youthCount}
      </text>
      {group.description && (
        <text x={tx + 12} y={ty + 63} fill="rgba(255,255,255,0.55)" fontSize={9} fontFamily="Inter, sans-serif">
          {group.description.length > 38 ? group.description.slice(0, 38) + '...' : group.description}
        </text>
      )}
    </g>
  )
}

// ---------------------------------------------------------------------------
// Hull River historical callout
// ---------------------------------------------------------------------------

function HullRiverCallout() {
  const x = 610
  const y = 90
  return (
    <g>
      <rect x={x} y={y} width={175} height={84} rx={8} fill="#2D2319" stroke="#C8922A" strokeWidth={1} opacity={0.95} />
      <text x={x + 12} y={y + 18} fill="#C8922A" fontSize={10} fontWeight={700} fontFamily="Inter, sans-serif">
        Hull River, 1918
      </text>
      <text x={x + 12} y={y + 33} fill="rgba(255,255,255,0.8)" fontSize={9} fontFamily="Inter, sans-serif">
        Cyclone destroyed Hull River
      </text>
      <text x={x + 12} y={y + 45} fill="rgba(255,255,255,0.8)" fontSize={9} fontFamily="Inter, sans-serif">
        Mission. Residents forcibly
      </text>
      <text x={x + 12} y={y + 57} fill="rgba(255,255,255,0.8)" fontSize={9} fontFamily="Inter, sans-serif">
        relocated to Palm Island.
      </text>
      <text x={x + 12} y={y + 72} fill="rgba(255,255,255,0.5)" fontSize={8} fontFamily="Inter, sans-serif">
        Over 40 language groups displaced
      </text>
    </g>
  )
}

// ---------------------------------------------------------------------------
// Generational detail panel
// ---------------------------------------------------------------------------

function GenerationalDetail({
  group,
  onClose,
}: {
  group: CulturalGroup
  onClose: () => void
}) {
  return (
    <div className="mt-6 rounded-xl border border-warm-300 bg-warm-50 p-6 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: group.color }} />
          <h3 className="text-lg font-bold text-picc-earth">{group.name}</h3>
          <span className="text-sm text-picc-earth/60">— {group.homeland}</span>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-sm text-picc-earth/50 hover:text-picc-earth transition-colors"
        >
          <ChevronUp className="w-4 h-4" />
          Close
        </button>
      </div>

      {group.description && (
        <p className="text-sm text-picc-earth/70 mb-5">{group.description}</p>
      )}

      {/* Generational flow visualization */}
      <div className="grid grid-cols-3 gap-4">
        {/* Elders layer */}
        <div className="rounded-lg bg-picc-ochre-100 border border-picc-ochre-200 p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-picc-ochre" />
            <span className="text-xs font-semibold text-picc-ochre-700 uppercase tracking-wide">Elders</span>
          </div>
          <p className="text-3xl font-bold text-picc-ochre-700">{group.elderCount}</p>
          <p className="text-xs text-picc-ochre-600 mt-1">Knowledge keepers</p>
          {group.elderCount === 0 && (
            <p className="text-[10px] text-picc-ochre-400 mt-2 italic">No recorded elders yet</p>
          )}
        </div>

        {/* Adults layer */}
        <div className="rounded-lg bg-warm-100 border border-warm-200 p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-warm-500" />
            <span className="text-xs font-semibold text-warm-700 uppercase tracking-wide">Adults</span>
          </div>
          <p className="text-3xl font-bold text-warm-700">--</p>
          <p className="text-xs text-warm-600 mt-1">Cultural carriers</p>
          <p className="text-[10px] text-warm-400 mt-2 italic">Data coming soon</p>
        </div>

        {/* Youth layer */}
        <div className="rounded-lg bg-sage-100 border border-sage-200 p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-sage" />
            <span className="text-xs font-semibold text-sage-700 uppercase tracking-wide">Youth</span>
          </div>
          <p className="text-3xl font-bold text-sage-700">{group.youthCount}</p>
          <p className="text-xs text-sage-600 mt-1">Next generation</p>
        </div>
      </div>

      {/* Knowledge flow arrows */}
      <div className="flex items-center justify-center gap-2 mt-4 text-picc-earth/40">
        <ArrowDown className="w-4 h-4" />
        <span className="text-xs">Knowledge flows across generations through stories, language, and ceremony</span>
        <ArrowDown className="w-4 h-4" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function IntergenerationalMap({ groups, className }: Props) {
  const data = groups ?? DEFAULT_GROUPS
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const selectedGroup = useMemo(() => data.find((g) => g.id === selectedId) ?? null, [data, selectedId])

  // Distribute groups evenly around the ring
  const groupPositions = useMemo(() => {
    const step = 360 / data.length
    return data.map((g, i) => ({
      group: g,
      pos: polarToXY(CX, CY, GROUP_RING_R, i * step),
      r: nodeRadius(g),
    }))
  }, [data])

  // Compute homeland positions on the outer ring
  const homelandPositions = useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {}
    for (const [key, region] of Object.entries(HOMELAND_REGIONS)) {
      map[key] = polarToXY(CX, CY, HOMELAND_RING_R, region.angle)
    }
    return map
  }, [])

  const handleClick = useCallback(
    (id: string) => {
      setSelectedId((prev) => (prev === id ? null : id))
    },
    [],
  )

  return (
    <div className={`${className ?? ''}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-picc-earth flex items-center gap-3">
          <Users className="w-6 h-6 text-picc-ochre" />
          Intergenerational Connections
        </h2>
        <p className="text-sm text-picc-earth/60 mt-1">
          Tracing cultural knowledge across generations and Country
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 mb-4 text-xs text-picc-earth/70">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-picc-ochre" />
          Elders
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-warm-500" />
          Adults
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-sage" />
          Youth
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-sage-600" />
          Homeland region
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-6 border-t border-dashed border-picc-ochre/50" />
          Connection to Country
        </span>
      </div>

      {/* SVG Map */}
      <div className="relative w-full overflow-hidden rounded-xl border border-warm-200 bg-warm-50">
        <svg
          viewBox="0 0 800 760"
          className="w-full h-auto"
          style={{ maxHeight: '600px' }}
          role="img"
          aria-label="Intergenerational connections map showing Palm Island cultural groups and their homeland connections"
        >
          <defs>
            {/* Center gradient */}
            <radialGradient id="centerGradient" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
            </radialGradient>
            {/* Subtle background pattern */}
            <pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="0.5" fill="#C8922A" opacity="0.08" />
            </pattern>
          </defs>

          {/* Background */}
          <rect width="800" height="760" fill="#FDF8F0" />
          <rect width="800" height="760" fill="url(#dotPattern)" />

          {/* Concentric guide rings */}
          <circle cx={CX} cy={CY} r={GROUP_RING_R} fill="none" stroke="#C8922A" strokeWidth={0.5} opacity={0.12} />
          <circle cx={CX} cy={CY} r={HOMELAND_RING_R} fill="none" stroke="#5B7B5E" strokeWidth={0.5} opacity={0.1} strokeDasharray="4 6" />

          {/* Layer 2: Connection paths to homelands */}
          {groupPositions.map(({ group, pos }) => {
            const hlPos = homelandPositions[group.homelandRegion]
            if (!hlPos) return null
            return <ConnectionPath key={`conn-${group.id}`} group={group} groupPos={pos} homelandPos={hlPos} />
          })}

          {/* Homeland labels */}
          {Object.entries(HOMELAND_REGIONS).map(([key, region]) => {
            const pos = homelandPositions[key]
            return <HomelandLabel key={key} region={region} pos={pos} />
          })}

          {/* Center hub */}
          <CenterHub />

          {/* Layer 1: Cultural group nodes */}
          {groupPositions.map(({ group, pos, r }) => (
            <GroupNode
              key={group.id}
              group={group}
              pos={pos}
              r={r}
              isSelected={selectedId === group.id}
              isHovered={hoveredId === group.id}
              onHover={() => setHoveredId(group.id)}
              onLeave={() => setHoveredId(null)}
              onClick={() => handleClick(group.id)}
            />
          ))}

          {/* Hover tooltip */}
          {hoveredId && hoveredId !== selectedId && (() => {
            const item = groupPositions.find((gp) => gp.group.id === hoveredId)
            if (!item) return null
            return <HoverTooltip group={item.group} pos={item.pos} />
          })()}

          {/* Hull River callout */}
          <HullRiverCallout />

          {/* Instruction text */}
          <text x={CX} y={730} textAnchor="middle" fill="#2D2319" fontSize={11} opacity={0.35} fontFamily="Inter, sans-serif">
            Click a cultural group to explore generational connections
          </text>
        </svg>
      </div>

      {/* Selected group detail panel */}
      {selectedGroup && (
        <GenerationalDetail
          group={selectedGroup}
          onClose={() => setSelectedId(null)}
        />
      )}

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-picc-ochre-50 border border-picc-ochre-100 py-3">
          <p className="text-2xl font-bold text-picc-ochre-700">
            {data.reduce((sum, g) => sum + g.elderCount, 0)}
          </p>
          <p className="text-xs text-picc-ochre-600">Recorded Elders</p>
        </div>
        <div className="rounded-lg bg-warm-50 border border-warm-100 py-3">
          <p className="text-2xl font-bold text-warm-700">{data.length}</p>
          <p className="text-xs text-warm-600">Cultural Groups</p>
        </div>
        <div className="rounded-lg bg-sage-50 border border-sage-100 py-3">
          <p className="text-2xl font-bold text-sage-700">
            {data.reduce((sum, g) => sum + g.youthCount, 0)}
          </p>
          <p className="text-xs text-sage-600">Youth Connected</p>
        </div>
      </div>
    </div>
  )
}
