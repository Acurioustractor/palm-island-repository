'use client'

import { Quote } from 'lucide-react'

export type QuoteData = {
  id: string
  quoteText: string
  theme?: string | null
  attribution?: string | null
  context?: string | null
  createdAt?: string
}

type QuoteCardProps = {
  quote: QuoteData
  variant?: 'default' | 'compact' | 'featured'
  showTheme?: boolean
  showAttribution?: boolean
  className?: string
}

/**
 * Reusable quote card component for displaying quotes.
 *
 * Variants:
 * - default: Full card with border and background
 * - compact: Inline quote with icon
 * - featured: Large featured quote with emphasis
 */
export default function QuoteCard({
  quote,
  variant = 'default',
  showTheme = true,
  showAttribution = false,
  className = '',
}: QuoteCardProps) {
  if (variant === 'compact') {
    return (
      <div className={`flex items-start gap-3 ${className}`}>
        <Quote className="w-5 h-5 text-picc-ochre flex-shrink-0 mt-0.5" />
        <p className="text-gray-800 italic line-clamp-4">"{quote.quoteText}"</p>
      </div>
    )
  }

  if (variant === 'featured') {
    return (
      <div className={`relative ${className}`}>
        <Quote className="absolute -left-2 -top-2 w-10 h-10 text-warm-200" />
        <blockquote className="relative pl-4 border-l-4 border-picc-ochre">
          <p className="text-xl md:text-2xl text-gray-900 italic leading-relaxed">
            "{quote.quoteText}"
          </p>
          {showAttribution && quote.attribution && (
            <footer className="mt-4 text-gray-700 font-medium">
              — {quote.attribution}
            </footer>
          )}
          {showTheme && quote.theme && (
            <div className="mt-3 inline-flex px-3 py-1 bg-warm-100 text-picc-ochre text-sm font-semibold rounded-full">
              {quote.theme}
            </div>
          )}
        </blockquote>
      </div>
    )
  }

  // Default variant
  return (
    <div className={`rounded-2xl border border-stone-200 bg-stone-50 p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <Quote className="w-4 h-4 text-picc-ochre flex-shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-gray-900 italic">"{quote.quoteText}"</p>
          {showAttribution && quote.attribution && (
            <p className="mt-2 text-sm text-gray-600">— {quote.attribution}</p>
          )}
          {showTheme && quote.theme && (
            <div className="mt-2 text-xs font-semibold text-picc-ochre uppercase tracking-wide">
              {quote.theme}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Group of quotes organized by theme
 */
type QuoteGroupProps = {
  quotes: QuoteData[]
  maxPerTheme?: number
  showAllThemes?: boolean
}

export function QuotesByTheme({ quotes, maxPerTheme = 3, showAllThemes = false }: QuoteGroupProps) {
  // Group quotes by theme
  const byTheme = quotes.reduce<Record<string, QuoteData[]>>((acc, q) => {
    const theme = q.theme || 'Other'
    if (!acc[theme]) acc[theme] = []
    acc[theme].push(q)
    return acc
  }, {})

  const themes = Object.keys(byTheme).sort()
  const displayThemes = showAllThemes ? themes : themes.slice(0, 4)

  if (quotes.length === 0) {
    return (
      <p className="text-gray-600">No quotes found.</p>
    )
  }

  return (
    <div className="space-y-6">
      {displayThemes.map((theme) => (
        <div key={theme}>
          <h5 className="text-sm font-bold text-picc-ochre uppercase tracking-wide mb-3">
            {theme}
          </h5>
          <div className="space-y-3">
            {byTheme[theme].slice(0, maxPerTheme).map((q) => (
              <QuoteCard key={q.id} quote={q} showTheme={false} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
