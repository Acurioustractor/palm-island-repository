'use client'

import Link from 'next/link'
import { THEME_CATEGORY_LABELS } from '@/lib/themes/theme-definitions'
import type { ThemeDefinition } from '@/lib/themes/types'

interface ThemeCardProps {
  theme: ThemeDefinition
  counts?: { stories: number; photos: number }
}

export function ThemeCard({ theme, counts }: ThemeCardProps) {
  return (
    <Link
      href={`/thematic-reports/${theme.slug}`}
      className="group block rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 ease-elegant bg-white"
    >
      {/* Hero gradient */}
      <div className={`h-40 bg-gradient-to-br ${theme.color} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
        <div className="absolute bottom-3 left-4">
          <span className="inline-block px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
            {THEME_CATEGORY_LABELS[theme.category]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-picc-red transition-colors">
          {theme.title}
        </h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {theme.subtitle}
        </p>

        {counts && (counts.stories > 0 || counts.photos > 0) && (
          <div className="flex gap-3 text-xs text-gray-400">
            {counts.stories > 0 && (
              <span>{counts.stories} {counts.stories === 1 ? 'story' : 'stories'}</span>
            )}
            {counts.photos > 0 && (
              <span>{counts.photos} photos</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
