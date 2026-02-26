'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Search, Loader2 } from 'lucide-react'
import type { QuoteSlotValue } from '@/lib/annual-report/planner-types'

interface QuoteResult {
  id: string
  text: string
  author: string | null
  role: string | null
  photo_url: string | null
  source_table: string
  theme: string | null
}

interface QuotePickerProps {
  currentValue: QuoteSlotValue | null
  onSelect: (quote: Omit<QuoteSlotValue, 'type'>) => void
}

const THEMES = [
  { id: 'all', label: 'All' },
  { id: 'elder', label: 'Elder Wisdom' },
  { id: 'story', label: 'Stories' },
  { id: 'vision', label: 'Community Vision' },
  { id: 'youth', label: 'Youth' },
  { id: 'resilience', label: 'Resilience' },
]

export function QuotePicker({ currentValue, onSelect }: QuotePickerProps) {
  const [quotes, setQuotes] = useState<QuoteResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [activeTheme, setActiveTheme] = useState('all')

  const loadQuotes = useCallback(async (theme?: string, query?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '20' })
      if (theme && theme !== 'all') params.set('theme', theme)
      if (query) params.set('q', query)
      const res = await fetch(`/api/report-planner/quotes?${params}`)
      if (res.ok) {
        const data = await res.json()
        setQuotes(data.quotes || [])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadQuotes()
  }, [loadQuotes])

  const handleThemeClick = (theme: string) => {
    setActiveTheme(theme)
    loadQuotes(theme, searchText || undefined)
  }

  const handleSearch = () => {
    loadQuotes(activeTheme, searchText || undefined)
  }

  return (
    <div>
      {/* Search */}
      <div className="flex gap-1.5 mb-2">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search quotes..."
          className="flex-1 text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0B4F6C]"
        />
        <button
          onClick={handleSearch}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <Search className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Theme pills */}
      <div className="flex flex-wrap gap-1 mb-2">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeClick(theme.id)}
            className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
              activeTheme === theme.id
                ? 'bg-[#C8963E] text-white border-[#C8963E]'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            {theme.label}
          </button>
        ))}
      </div>

      {/* Quote list */}
      {loading ? (
        <div className="flex items-center justify-center h-24">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      ) : quotes.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">No quotes found</p>
      ) : (
        <div className="space-y-1.5 max-h-60 overflow-auto">
          {quotes.map((q) => {
            const isSelected = currentValue?.sourceId === q.id
            return (
              <button
                key={q.id}
                onClick={() =>
                  onSelect({
                    sourceTable: q.source_table as QuoteSlotValue['sourceTable'],
                    sourceId: q.id,
                    text: q.text,
                    author: q.author,
                    role: q.role,
                    photoUrl: q.photo_url,
                  })
                }
                className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-[#C8963E] bg-amber-50'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">
                  &ldquo;{q.text}&rdquo;
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  {q.photo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={q.photo_url} alt="" className="w-4 h-4 rounded-full object-cover" />
                  )}
                  <span className="text-[10px] text-gray-400">
                    — {q.author || 'Anonymous'}{q.role ? `, ${q.role}` : ''}
                  </span>
                  {q.theme && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded-full ml-auto">
                      {q.theme}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
