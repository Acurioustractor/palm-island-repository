'use client'

import React, { useRef, useEffect } from 'react'
import { Check } from 'lucide-react'
import type { PageConfig } from '@/lib/annual-report/planner-types'

interface PageStripProps {
  pages: Record<string, PageConfig>
  visibleKeys: string[]
  hiddenKeys: string[]
  selectedPageKey: string | null
  onSelectPage: (key: string) => void
}

type PageStatus = 'complete' | 'partial' | 'empty'

function getPageStatus(page: PageConfig): PageStatus {
  const filled = page.slots.filter(s => s.value !== null).length
  if (filled === 0) return 'empty'
  if (filled === page.slots.length) return 'complete'
  return 'partial'
}

function StatusBadge({ status }: { status: PageStatus }) {
  if (status === 'complete') {
    return (
      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
        <Check className="h-3 w-3 text-white" strokeWidth={3} />
      </div>
    )
  }
  if (status === 'partial') {
    return (
      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
        <div className="w-2 h-2 rounded-full bg-white" />
      </div>
    )
  }
  return null
}

function ProgressRing({ filled, total }: { filled: number; total: number }) {
  if (total === 0) return null
  const pct = filled / total
  const r = 10
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct)

  return (
    <svg width="24" height="24" className="flex-shrink-0">
      <circle cx="12" cy="12" r={r} fill="none" stroke="#E5E7EB" strokeWidth="2" />
      {filled > 0 && (
        <circle
          cx="12" cy="12" r={r}
          fill="none"
          stroke={pct === 1 ? '#22C55E' : '#F59E0B'}
          strokeWidth="2"
          strokeDasharray={`${circ}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 12 12)"
        />
      )}
      <text x="12" y="12" textAnchor="middle" dominantBaseline="central" className="text-[7px] font-bold fill-gray-500">
        {filled}
      </text>
    </svg>
  )
}

export function PageStrip({ pages, visibleKeys, hiddenKeys, selectedPageKey, onSelectPage }: PageStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  // Scroll active card into view
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [selectedPageKey])

  const renderCard = (key: string, index: number, dimmed: boolean) => {
    const page = pages[key]
    if (!page) return null
    const isActive = selectedPageKey === key
    const status = getPageStatus(page)
    const filled = page.slots.filter(s => s.value !== null).length

    return (
      <button
        key={key}
        ref={isActive ? activeRef : undefined}
        onClick={() => onSelectPage(key)}
        className={`
          relative flex-shrink-0 w-[120px] rounded-xl overflow-hidden border-2 transition-all
          ${isActive ? 'border-[#0B4F6C] shadow-lg scale-105' : 'border-gray-200 hover:border-gray-300'}
          ${dimmed ? 'opacity-40' : ''}
        `}
        style={{ aspectRatio: '3/4' }}
      >
        {/* Accent color top bar */}
        <div
          className="h-2 w-full"
          style={{ backgroundColor: page.accentColor }}
        />

        {/* Card body */}
        <div className="flex flex-col items-center justify-between p-2 h-[calc(100%-8px)]">
          <div className="text-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase">{index + 1}</span>
            <p className="text-xs font-semibold text-gray-800 leading-tight mt-0.5">{page.label}</p>
          </div>

          <ProgressRing filled={filled} total={page.slots.length} />
        </div>

        {/* Status badge */}
        <StatusBadge status={status} />
      </button>
    )
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-3 px-4 py-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
        style={{ scrollbarWidth: 'thin' }}
      >
        {visibleKeys.map((key, i) => renderCard(key, i, false))}

        {/* Dimmed hidden pages */}
        {hiddenKeys.length > 0 && (
          <>
            <div className="flex-shrink-0 w-px bg-gray-200 my-2" />
            {hiddenKeys.map((key, i) => renderCard(key, visibleKeys.length + i, true))}
          </>
        )}
      </div>
    </div>
  )
}
