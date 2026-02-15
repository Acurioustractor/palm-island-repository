'use client'

import { Clock, Flag } from 'lucide-react'
import type { TimelineEvent } from './ToolResultRenderer'

interface TimelineDisplayProps {
  events: TimelineEvent[]
  dateRange: { from: string; to: string }
  darkMode?: boolean
}

export function TimelineDisplay({ events, dateRange, darkMode = false }: TimelineDisplayProps) {
  if (!events || events.length === 0) {
    return (
      <div className={`my-4 rounded-2xl p-6 text-center text-sm ${
        darkMode ? 'bg-white/[0.04] text-white/40' : 'bg-gray-50 text-gray-500'
      }`}>
        No timeline events found for this period.
      </div>
    )
  }

  const grouped = events.reduce<Record<string, TimelineEvent[]>>((acc, event) => {
    const fy = event.fiscal_year || 'Unknown'
    if (!acc[fy]) acc[fy] = []
    acc[fy].push(event)
    return acc
  }, {})

  const sortedYears = Object.keys(grouped).sort()

  return (
    <div className={`my-2 rounded-2xl overflow-hidden ${
      darkMode
        ? 'bg-white/[0.04] border border-white/[0.06]'
        : 'bg-white border border-gray-100'
    }`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${
        darkMode
          ? 'bg-white/[0.02] border-white/[0.04]'
          : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-100'
      }`}>
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${darkMode ? 'text-white/30' : 'text-gray-500'}`} />
          <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
            Timeline: {dateRange.from} to {dateRange.to}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-6 py-4">
        <div className="relative">
          {/* Vertical line */}
          <div className={`absolute left-3 top-2 bottom-2 w-px ${darkMode ? 'bg-white/[0.08]' : 'bg-gray-200'}`} />

          <div className="space-y-6">
            {sortedYears.map(year => (
              <div key={year} className="relative pl-10">
                {/* Year marker */}
                <div className={`absolute left-0 top-0 w-7 h-7 rounded-full flex items-center justify-center ${
                  darkMode
                    ? 'bg-picc-ochre/10 border-2 border-picc-ochre/30'
                    : 'bg-warm-100 border-2 border-warm-300'
                }`}>
                  <Flag className={`w-3 h-3 ${darkMode ? 'text-picc-ochre-400' : 'text-warm-600'}`} />
                </div>

                <div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-picc-ochre-400' : 'text-warm-700'}`}>{year}</span>
                  <ul className="mt-2 space-y-1.5">
                    {grouped[year].map(event => (
                      <li key={event.id} className={`text-sm flex gap-2 ${darkMode ? 'text-white/70' : 'text-gray-700'}`}>
                        <span className={`mt-0.5 ${darkMode ? 'text-white/20' : 'text-gray-300'}`}>&#x2022;</span>
                        <span>{event.achievement_text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
