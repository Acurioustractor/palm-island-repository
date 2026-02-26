'use client'

import React from 'react'
import { shouldShow, type ReportAudience } from '@/lib/annual-report/audience-config'
import type { PageConfig } from '@/lib/annual-report/planner-types'
import { Image, FileText, MessageSquare, BarChart3, Camera, Star, Users, Heart, Shield, DollarSign, Lightbulb, Clock, Eye } from 'lucide-react'

const PAGE_ICONS: Record<string, React.ElementType> = {
  cover: Image,
  acknowledgement: FileText,
  messages: MessageSquare,
  numbers: BarChart3,
  photos: Camera,
  highlights: Star,
  communityVoices: Users,
  youthVoices: Heart,
  resilience: Shield,
  floodStories: Shield,
  governance: Users,
  compliance: FileText,
  directorsReport: FileText,
  services: Lightbulb,
  innovation: Lightbulb,
  financials: DollarSign,
  financialDetail: DollarSign,
  journey: Clock,
  nextTwenty: Eye,
  backCover: Image,
}

/** Find the first photo slot with a URL assigned — used for tile thumbnails */
function getHeroPhotoUrl(page: PageConfig): string | null {
  for (const slot of page.slots) {
    if (slot.value?.type === 'photo' && slot.value.url) {
      return slot.value.url
    }
  }
  return null
}

interface PageGridProps {
  pages: Record<string, PageConfig>
  orderedKeys: string[]
  audience: ReportAudience
  selectedPageKey: string | null
  onSelectPage: (key: string) => void
}

export function PageGrid({ pages, orderedKeys, audience, selectedPageKey, onSelectPage }: PageGridProps) {
  return (
    <div className="grid grid-cols-4 xl:grid-cols-5 gap-3">
      {orderedKeys.map((key) => {
        const page = pages[key]
        if (!page) return null

        const isIncluded = shouldShow(key, audience)
        const isSelected = selectedPageKey === key
        const Icon = PAGE_ICONS[key] || FileText

        // Count filled slots
        const filled = page.slots.filter((s) => s.value !== null).length
        const total = page.slots.length
        const allFilled = total > 0 && filled === total
        const partialFilled = filled > 0 && filled < total
        const heroUrl = getHeroPhotoUrl(page)

        // Color-coded border
        const borderColor = isSelected
          ? 'border-[#0B4F6C]'
          : !isIncluded
            ? 'border-dashed border-gray-200'
            : allFilled
              ? 'border-green-400'
              : partialFilled
                ? 'border-amber-300'
                : 'border-gray-200'

        return (
          <button
            key={key}
            onClick={() => onSelectPage(key)}
            className={`
              relative rounded-xl border-2 p-3 text-left transition-all
              ${borderColor}
              ${isSelected
                ? 'bg-blue-50 ring-2 ring-blue-100 shadow-md'
                : isIncluded
                  ? 'bg-white hover:shadow-sm'
                  : 'bg-gray-50 opacity-50'
              }
              ${!isSelected && isIncluded ? 'hover:border-gray-400' : ''}
            `}
          >
            {/* Page number badge */}
            <div className="absolute -top-2 -left-1 text-[10px] font-bold text-gray-400 bg-white px-1.5 rounded-full border border-gray-200">
              {orderedKeys.indexOf(key) + 1}
            </div>

            {/* Accent bar */}
            <div
              className="w-full h-1 rounded-full mb-2.5"
              style={{ backgroundColor: page.accentColor }}
            />

            {/* Page thumbnail area — show hero photo if assigned */}
            <div className="flex items-center justify-center h-16 mb-2 rounded-lg bg-gray-50 overflow-hidden">
              {heroUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <Icon className="h-6 w-6 text-gray-400" style={isIncluded ? { color: page.accentColor } : undefined} />
              )}
            </div>

            {/* Label */}
            <div className="text-xs font-semibold text-gray-900 truncate mb-0.5">
              {page.label}
            </div>

            {/* Slot progress */}
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: total > 0 ? `${(filled / total) * 100}%` : '0%',
                    backgroundColor: allFilled ? '#22c55e' : partialFilled ? '#f59e0b' : page.accentColor,
                  }}
                />
              </div>
              <span className={`text-[10px] font-medium ${
                allFilled ? 'text-green-600' : partialFilled ? 'text-amber-600' : 'text-gray-400'
              }`}>
                {filled}/{total}
              </span>
            </div>

            {/* Excluded overlay label */}
            {!isIncluded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-medium text-gray-400 bg-white/90 px-2 py-0.5 rounded-full">
                  Not in audience
                </span>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
