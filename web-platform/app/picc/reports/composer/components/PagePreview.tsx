'use client'

import React from 'react'
import { Image, Quote, Hash, Type, UserCircle, BarChart, Plus } from 'lucide-react'
import type { PageConfig, ContentSlot, SlotType } from '@/lib/annual-report/planner-types'

interface PagePreviewProps {
  page: PageConfig
  pageKey: string
  activeSlotId: string | null
  onSlotClick: (slot: ContentSlot) => void
}

const SLOT_ICONS: Record<SlotType, React.ElementType> = {
  photo: Image,
  quote: Quote,
  stat: Hash,
  text: Type,
  chart: BarChart,
  person: UserCircle,
}

function SlotHotspot({
  slot,
  isActive,
  onClick,
  className = '',
  style,
}: {
  slot: ContentSlot
  isActive: boolean
  onClick: () => void
  className?: string
  style?: React.CSSProperties
}) {
  const hasValue = slot.value !== null
  const Icon = SLOT_ICONS[slot.type]

  if (hasValue) {
    return (
      <button
        onClick={onClick}
        className={`relative group rounded-lg overflow-hidden transition-all ${
          isActive ? 'ring-2 ring-[#0B4F6C] ring-offset-2' : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1'
        } ${className}`}
        style={style}
      >
        <FilledSlotContent slot={slot} />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 text-[10px] font-medium text-white bg-black/60 px-2 py-1 rounded-full transition-opacity">
            Change
          </span>
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center gap-1.5
        border-2 border-dashed rounded-lg transition-all cursor-pointer
        ${isActive
          ? 'border-[#0B4F6C] bg-blue-50'
          : 'border-gray-300 hover:border-[#0B4F6C] hover:bg-blue-50/50'
        }
        ${className}
      `}
      style={style}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isActive ? 'bg-[#0B4F6C] text-white' : 'bg-gray-100 text-gray-400'
      }`}>
        <Plus className="h-4 w-4" />
      </div>
      <span className="text-[10px] font-medium text-gray-500 text-center px-1 leading-tight">
        {slot.label}
      </span>
      {slot.required && (
        <span className="text-[8px] text-red-400 font-bold">REQUIRED</span>
      )}
    </button>
  )
}

function FilledSlotContent({ slot }: { slot: ContentSlot }) {
  const v = slot.value
  if (!v) return null

  switch (v.type) {
    case 'photo':
      return (
        <div className="w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={v.url} alt={v.caption || ''} className="w-full h-full object-cover" />
        </div>
      )
    case 'quote':
      return (
        <div className="w-full h-full p-3 flex flex-col justify-center bg-amber-50">
          <Quote className="h-4 w-4 text-[#C8963E] mb-1 flex-shrink-0" />
          <p className="text-[11px] text-gray-700 italic leading-relaxed line-clamp-3">
            {v.text}
          </p>
          {v.author && (
            <p className="text-[9px] text-gray-500 mt-1 font-medium">— {v.author}</p>
          )}
        </div>
      )
    case 'stat':
      return (
        <div className="w-full h-full p-3 flex flex-col items-center justify-center bg-[#0B4F6C]/5">
          <span className="text-xl font-bold text-[#0B4F6C]">{v.value}</span>
          {v.unit && <span className="text-[9px] text-[#0B4F6C]/60">{v.unit}</span>}
          <span className="text-[9px] text-gray-500 mt-0.5 text-center">{v.label}</span>
        </div>
      )
    case 'text':
      return (
        <div className="w-full h-full p-3 flex flex-col justify-center">
          <p className="text-[10px] text-gray-600 leading-relaxed line-clamp-4">{v.content}</p>
        </div>
      )
    case 'chart':
      return (
        <div className="w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={v.url} alt="Chart" className="w-full h-full object-contain bg-white" />
        </div>
      )
    case 'person':
      return (
        <div className="w-full h-full p-2 flex flex-col items-center justify-center gap-1">
          {v.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500">
              {v.name.charAt(0)}
            </div>
          )}
          <span className="text-[9px] font-medium text-gray-700 text-center">{v.name}</span>
          <span className="text-[8px] text-gray-400">{v.role}</span>
        </div>
      )
  }
}

// ── Page layout templates ────────────────────────────

function CoverLayout({ page, activeSlotId, onSlotClick }: PagePreviewProps) {
  const heroSlot = page.slots.find(s => s.id === 'cover-hero')
  const titleSlot = page.slots.find(s => s.id === 'cover-title')

  return (
    <div className="relative w-full h-full bg-[#0B4F6C] overflow-hidden">
      {/* Hero photo as background */}
      {heroSlot && (
        <SlotHotspot
          slot={heroSlot}
          isActive={activeSlotId === heroSlot.id}
          onClick={() => onSlotClick(heroSlot)}
          className="absolute inset-0"
        />
      )}
      {/* Title overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-xs font-bold text-white/80 uppercase tracking-wider mb-1">
          Palm Island Community Company
        </p>
        {titleSlot && (
          <SlotHotspot
            slot={titleSlot}
            isActive={activeSlotId === titleSlot.id}
            onClick={() => onSlotClick(titleSlot)}
            className="min-h-[32px] w-full"
            style={{ background: 'transparent', border: titleSlot.value ? 'none' : undefined }}
          />
        )}
        {!titleSlot?.value && (
          <p className="text-lg font-bold text-white/40">Annual Report 2024-25</p>
        )}
      </div>
    </div>
  )
}

function PhotoSpreadLayout({ page, activeSlotId, onSlotClick }: PagePreviewProps) {
  const largeSlot = page.slots.find(s => s.id === 'photos-large')
  const gridSlots = page.slots.filter(s => s.id.startsWith('photos-grid'))

  return (
    <div className="w-full h-full flex flex-col gap-2 p-3">
      <p className="text-[9px] font-bold text-[#C8963E] uppercase tracking-wider">Our Community</p>
      {largeSlot && (
        <SlotHotspot
          slot={largeSlot}
          isActive={activeSlotId === largeSlot.id}
          onClick={() => onSlotClick(largeSlot)}
          className="w-full flex-1 min-h-[120px]"
        />
      )}
      <div className="grid grid-cols-4 gap-2">
        {gridSlots.map(slot => (
          <SlotHotspot
            key={slot.id}
            slot={slot}
            isActive={activeSlotId === slot.id}
            onClick={() => onSlotClick(slot)}
            className="aspect-square"
          />
        ))}
      </div>
    </div>
  )
}

function NumbersLayout({ page, activeSlotId, onSlotClick }: PagePreviewProps) {
  const heroPhoto = page.slots.find(s => s.id === 'numbers-hero')
  const heroStat = page.slots.find(s => s.id === 'numbers-hero-stat')
  const largeStats = page.slots.filter(s => s.id.startsWith('numbers-stat-'))
  const keyMetrics = page.slots.filter(s => s.id.startsWith('numbers-key-'))
  const chart = page.slots.find(s => s.id === 'numbers-chart')

  return (
    <div className="w-full h-full flex flex-col gap-2 p-3">
      <p className="text-[9px] font-bold text-[#C8963E] uppercase tracking-wider">Year in Numbers</p>

      {/* Hero row: photo + big stat */}
      <div className="flex gap-2">
        {heroPhoto && (
          <SlotHotspot
            slot={heroPhoto}
            isActive={activeSlotId === heroPhoto.id}
            onClick={() => onSlotClick(heroPhoto)}
            className="w-1/2 aspect-[4/3]"
          />
        )}
        {heroStat && (
          <SlotHotspot
            slot={heroStat}
            isActive={activeSlotId === heroStat.id}
            onClick={() => onSlotClick(heroStat)}
            className="w-1/2 aspect-[4/3]"
          />
        )}
      </div>

      {/* Large stats grid */}
      <div className="grid grid-cols-4 gap-1.5">
        {largeStats.map(slot => (
          <SlotHotspot
            key={slot.id}
            slot={slot}
            isActive={activeSlotId === slot.id}
            onClick={() => onSlotClick(slot)}
            className="aspect-square"
          />
        ))}
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-4 gap-1.5">
        {keyMetrics.map(slot => (
          <SlotHotspot
            key={slot.id}
            slot={slot}
            isActive={activeSlotId === slot.id}
            onClick={() => onSlotClick(slot)}
            className="aspect-[3/2]"
          />
        ))}
      </div>

      {/* Chart */}
      {chart && (
        <SlotHotspot
          slot={chart}
          isActive={activeSlotId === chart.id}
          onClick={() => onSlotClick(chart)}
          className="w-full h-16"
        />
      )}
    </div>
  )
}

function CommunityVoicesLayout({ page, activeSlotId, onSlotClick }: PagePreviewProps) {
  const featured = page.slots.find(s => s.id === 'cv-featured')
  const others = page.slots.filter(s => s.id !== 'cv-featured')

  return (
    <div className="w-full h-full flex flex-col gap-2 p-3 bg-[#FEF3C7]/30">
      <p className="text-[9px] font-bold text-[#C8963E] uppercase tracking-wider">Community Voices</p>

      {/* Featured quote - large */}
      {featured && (
        <SlotHotspot
          slot={featured}
          isActive={activeSlotId === featured.id}
          onClick={() => onSlotClick(featured)}
          className="w-full min-h-[80px]"
        />
      )}

      {/* Grid of other quotes */}
      <div className="grid grid-cols-2 gap-2 flex-1">
        {others.map(slot => (
          <SlotHotspot
            key={slot.id}
            slot={slot}
            isActive={activeSlotId === slot.id}
            onClick={() => onSlotClick(slot)}
            className="min-h-[60px]"
          />
        ))}
      </div>
    </div>
  )
}

function MessagesLayout({ page, activeSlotId, onSlotClick }: PagePreviewProps) {
  const ceoSlots = page.slots.filter(s => s.id.startsWith('msg-ceo'))
  const chairSlots = page.slots.filter(s => s.id.startsWith('msg-chair'))

  return (
    <div className="w-full h-full flex flex-col gap-3 p-3">
      <p className="text-[9px] font-bold text-[#C8963E] uppercase tracking-wider">Messages</p>

      {/* CEO section */}
      <div className="flex-1">
        <p className="text-[9px] font-semibold text-gray-500 mb-1.5">CEO Message</p>
        <div className="grid grid-cols-2 gap-1.5">
          {ceoSlots.map(slot => (
            <SlotHotspot
              key={slot.id}
              slot={slot}
              isActive={activeSlotId === slot.id}
              onClick={() => onSlotClick(slot)}
              className="min-h-[48px]"
            />
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200" />

      {/* Chair section */}
      <div className="flex-1">
        <p className="text-[9px] font-semibold text-gray-500 mb-1.5">Chair Message</p>
        <div className="grid grid-cols-2 gap-1.5">
          {chairSlots.map(slot => (
            <SlotHotspot
              key={slot.id}
              slot={slot}
              isActive={activeSlotId === slot.id}
              onClick={() => onSlotClick(slot)}
              className="min-h-[48px]"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function GovernanceLayout({ page, activeSlotId, onSlotClick }: PagePreviewProps) {
  const people = page.slots.filter(s => s.type === 'person')
  const text = page.slots.find(s => s.type === 'text')

  return (
    <div className="w-full h-full flex flex-col gap-2 p-3">
      <p className="text-[9px] font-bold text-[#C8963E] uppercase tracking-wider">Board of Directors</p>

      <div className="grid grid-cols-4 gap-2 flex-1">
        {people.map(slot => (
          <SlotHotspot
            key={slot.id}
            slot={slot}
            isActive={activeSlotId === slot.id}
            onClick={() => onSlotClick(slot)}
            className="min-h-[64px]"
          />
        ))}
      </div>

      {text && (
        <SlotHotspot
          slot={text}
          isActive={activeSlotId === text.id}
          onClick={() => onSlotClick(text)}
          className="w-full min-h-[40px]"
        />
      )}
    </div>
  )
}

function FinancialsLayout({ page, activeSlotId, onSlotClick }: PagePreviewProps) {
  const stats = page.slots.filter(s => s.type === 'stat')
  const charts = page.slots.filter(s => s.type === 'chart')

  return (
    <div className="w-full h-full flex flex-col gap-2 p-3">
      <p className="text-[9px] font-bold text-[#C8963E] uppercase tracking-wider">{page.label}</p>

      <div className="grid grid-cols-3 gap-1.5">
        {stats.map(slot => (
          <SlotHotspot
            key={slot.id}
            slot={slot}
            isActive={activeSlotId === slot.id}
            onClick={() => onSlotClick(slot)}
            className="aspect-square"
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 flex-1">
        {charts.map(slot => (
          <SlotHotspot
            key={slot.id}
            slot={slot}
            isActive={activeSlotId === slot.id}
            onClick={() => onSlotClick(slot)}
            className="min-h-[60px]"
          />
        ))}
      </div>
    </div>
  )
}

/** Generic layout for pages without a specialized template */
function GenericLayout({ page, activeSlotId, onSlotClick }: PagePreviewProps) {
  // Group slots by type for visual layout
  const photoSlots = page.slots.filter(s => s.type === 'photo')
  const quoteSlots = page.slots.filter(s => s.type === 'quote')
  const statSlots = page.slots.filter(s => s.type === 'stat')
  const textSlots = page.slots.filter(s => s.type === 'text')
  const chartSlots = page.slots.filter(s => s.type === 'chart')
  const personSlots = page.slots.filter(s => s.type === 'person')

  return (
    <div className="w-full h-full flex flex-col gap-2 p-3">
      <p className="text-[9px] font-bold text-[#C8963E] uppercase tracking-wider">{page.label}</p>

      {/* Photos row */}
      {photoSlots.length > 0 && (
        <div className={`grid gap-2 ${photoSlots.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {photoSlots.map(slot => (
            <SlotHotspot
              key={slot.id}
              slot={slot}
              isActive={activeSlotId === slot.id}
              onClick={() => onSlotClick(slot)}
              className="aspect-video"
            />
          ))}
        </div>
      )}

      {/* People row */}
      {personSlots.length > 0 && (
        <div className={`grid gap-2 ${personSlots.length <= 3 ? `grid-cols-${personSlots.length}` : 'grid-cols-4'}`}>
          {personSlots.map(slot => (
            <SlotHotspot
              key={slot.id}
              slot={slot}
              isActive={activeSlotId === slot.id}
              onClick={() => onSlotClick(slot)}
              className="min-h-[64px]"
            />
          ))}
        </div>
      )}

      {/* Stats row */}
      {statSlots.length > 0 && (
        <div className={`grid gap-1.5 ${statSlots.length <= 2 ? 'grid-cols-2' : statSlots.length <= 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
          {statSlots.map(slot => (
            <SlotHotspot
              key={slot.id}
              slot={slot}
              isActive={activeSlotId === slot.id}
              onClick={() => onSlotClick(slot)}
              className="aspect-square"
            />
          ))}
        </div>
      )}

      {/* Quotes */}
      {quoteSlots.length > 0 && (
        <div className={`grid gap-2 ${quoteSlots.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {quoteSlots.map(slot => (
            <SlotHotspot
              key={slot.id}
              slot={slot}
              isActive={activeSlotId === slot.id}
              onClick={() => onSlotClick(slot)}
              className="min-h-[60px]"
            />
          ))}
        </div>
      )}

      {/* Charts */}
      {chartSlots.length > 0 && (
        <div className="grid gap-2 grid-cols-2">
          {chartSlots.map(slot => (
            <SlotHotspot
              key={slot.id}
              slot={slot}
              isActive={activeSlotId === slot.id}
              onClick={() => onSlotClick(slot)}
              className="min-h-[60px]"
            />
          ))}
        </div>
      )}

      {/* Text blocks */}
      {textSlots.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {textSlots.map(slot => (
            <SlotHotspot
              key={slot.id}
              slot={slot}
              isActive={activeSlotId === slot.id}
              onClick={() => onSlotClick(slot)}
              className="w-full min-h-[40px]"
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Route to correct layout ──────────────────────────

const LAYOUT_MAP: Record<string, React.FC<PagePreviewProps>> = {
  cover: CoverLayout,
  photos: PhotoSpreadLayout,
  numbers: NumbersLayout,
  communityVoices: CommunityVoicesLayout,
  messages: MessagesLayout,
  governance: GovernanceLayout,
  financials: FinancialsLayout,
  financialDetail: FinancialsLayout,
}

export function PagePreview(props: PagePreviewProps) {
  const Layout = LAYOUT_MAP[props.pageKey] || GenericLayout

  return (
    <div className="w-[380px] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200" style={{ aspectRatio: '210/297' }}>
      <Layout {...props} />
    </div>
  )
}
