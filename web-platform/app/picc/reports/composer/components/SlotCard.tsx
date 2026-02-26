'use client'

import React from 'react'
import { Image, Quote, Hash, Type, UserCircle, BarChart, Check, X } from 'lucide-react'
import type { ContentSlot, SlotType } from '@/lib/annual-report/planner-types'

const SLOT_ICONS: Record<SlotType, React.ElementType> = {
  photo: Image,
  quote: Quote,
  stat: Hash,
  text: Type,
  chart: BarChart,
  person: UserCircle,
}

const TYPE_COLORS: Record<SlotType, string> = {
  photo: '#15803D',
  quote: '#C8963E',
  stat: '#0B4F6C',
  text: '#6B6560',
  chart: '#0EA5E9',
  person: '#E8600A',
}

interface SlotCardProps {
  slot: ContentSlot
  isActive: boolean
  accentColor: string
  onClick: () => void
  onClear: () => void
}

export function SlotCard({ slot, isActive, accentColor, onClick, onClear }: SlotCardProps) {
  const Icon = SLOT_ICONS[slot.type]
  const hasValue = slot.value !== null
  const typeColor = TYPE_COLORS[slot.type]

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all
        ${isActive
          ? 'bg-blue-50 border-2 border-[#0B4F6C]'
          : hasValue
            ? 'bg-green-50/50 border border-green-200 hover:border-green-300'
            : 'bg-white border border-gray-200 hover:border-gray-300'
        }
      `}
    >
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${typeColor}10`, color: typeColor }}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Label + value preview */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-gray-900 truncate">{slot.label}</span>
          {slot.required && (
            <span className="text-[9px] text-red-500 font-bold px-1 py-0.5 bg-red-50 rounded">REQ</span>
          )}
        </div>
        {hasValue && (
          <SlotValuePreview slot={slot} />
        )}
        {!hasValue && (
          <p className="text-xs text-gray-400 mt-0.5">Tap to add</p>
        )}
      </div>

      {/* Status indicator */}
      {hasValue ? (
        <div className="flex items-center gap-1 flex-shrink-0">
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClear() }}
            className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-100 transition-colors"
            title="Clear"
          >
            <X className="h-3 w-3 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex-shrink-0" />
      )}
    </button>
  )
}

function SlotValuePreview({ slot }: { slot: ContentSlot }) {
  const v = slot.value
  if (!v) return null

  switch (v.type) {
    case 'photo':
      return (
        <div className="flex items-center gap-1.5 mt-1">
          {v.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v.url} alt="" className="w-8 h-8 rounded object-cover border border-gray-200" />
          )}
          <span className="text-xs text-gray-500 truncate">{v.caption || 'Photo selected'}</span>
        </div>
      )
    case 'quote':
      return (
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 italic">
          &ldquo;{v.text.slice(0, 50)}{v.text.length > 50 ? '...' : ''}&rdquo;
        </p>
      )
    case 'stat':
      return (
        <p className="text-xs mt-0.5">
          <span className="font-bold text-[#0B4F6C]">{v.value}</span>
          <span className="text-gray-400"> {v.label}</span>
        </p>
      )
    case 'text':
      return (
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
          {v.content.slice(0, 60)}{v.content.length > 60 ? '...' : ''}
        </p>
      )
    case 'chart':
      return <span className="text-xs text-gray-500 mt-0.5">Chart generated</span>
    case 'person':
      return (
        <div className="flex items-center gap-1.5 mt-0.5">
          {v.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v.photoUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
          ) : null}
          <span className="text-xs text-gray-500">{v.name} — {v.role}</span>
        </div>
      )
  }
}
