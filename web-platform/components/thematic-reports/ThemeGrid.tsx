'use client'

import { useState } from 'react'
import type { ThemeDefinition, ThemeCategory } from '@/lib/themes/types'
import { THEME_CATEGORY_LABELS, THEME_CATEGORY_ORDER } from '@/lib/themes/theme-definitions'
import { ThemeCard } from './ThemeCard'

interface ThemeGridProps {
  themes: ThemeDefinition[]
  counts: Record<string, { stories: number; photos: number }>
}

export function ThemeGrid({ themes, counts }: ThemeGridProps) {
  const [activeCategory, setActiveCategory] = useState<ThemeCategory | 'all'>('all')

  const filtered = activeCategory === 'all'
    ? themes
    : themes.filter(t => t.category === activeCategory)

  return (
    <div>
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeCategory === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({themes.length})
        </button>
        {THEME_CATEGORY_ORDER.map(cat => {
          const count = themes.filter(t => t.category === cat).length
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {THEME_CATEGORY_LABELS[cat]} ({count})
            </button>
          )
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(theme => (
          <ThemeCard
            key={theme.slug}
            theme={theme}
            counts={counts[theme.slug]}
          />
        ))}
      </div>
    </div>
  )
}
