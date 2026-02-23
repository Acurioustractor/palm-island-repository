'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Quote } from 'lucide-react'
import type { QuoteData } from './ToolResultRenderer'

interface QuoteCarouselProps {
  quotes: QuoteData[]
  darkMode?: boolean
}

const darkAccents = [
  'from-picc-ochre/8 to-picc-ochre/3',
  'from-picc-red/8 to-picc-red/3',
  'from-sage/8 to-sage/3',
  'from-blue-500/8 to-blue-500/3',
  'from-purple-500/8 to-purple-500/3',
]

const lightBg = [
  'bg-warm-50',
  'bg-blue-50',
  'bg-emerald-50',
  'bg-amber-50',
  'bg-rose-50',
  'bg-purple-50',
]

export function QuoteCarousel({ quotes, darkMode = false }: QuoteCarouselProps) {
  if (!quotes || quotes.length === 0) {
    return (
      <div className={`my-4 rounded-2xl p-6 text-center text-sm ${
        darkMode ? 'bg-white/[0.04] text-white/40' : 'bg-gray-50 text-gray-500'
      }`}>
        No quotes found for this topic.
      </div>
    )
  }

  return (
    <div className="my-2 space-y-3">
      {quotes.map((quote, i) => (
        <div
          key={quote.id}
          className={`rounded-2xl p-6 relative overflow-hidden ${
            darkMode
              ? `bg-gradient-to-br ${darkAccents[i % darkAccents.length]} border border-white/[0.04]`
              : lightBg[i % lightBg.length]
          }`}
        >
          {/* Large decorative quote mark */}
          <Quote className={`absolute top-4 right-4 w-12 h-12 ${darkMode ? 'text-white/[0.03]' : 'text-black/5'}`} />

          <blockquote className="relative z-10">
            <p className={`text-base sm:text-lg font-medium leading-relaxed italic ${
              darkMode ? 'text-white/80' : 'text-gray-800'
            }`}>
              &ldquo;{quote.text}&rdquo;
            </p>

            {/* Attribution */}
            <footer className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {quote.speakerImage && (
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white/20">
                    <Image
                      src={quote.speakerImage}
                      alt={quote.speakerName || 'Speaker'}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  {quote.speakerName && (
                    <div className={`text-sm font-semibold ${darkMode ? 'text-white/70' : 'text-gray-800'}`}>
                      {quote.speakerName}
                    </div>
                  )}
                  {quote.storyTitle && quote.storyId && (
                    <Link
                      href={`/stories/${quote.storyId}`}
                      className={`text-xs transition-colors ${
                        darkMode ? 'text-white/40 hover:text-picc-ochre-300' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      From: <span className="font-medium">{quote.storyTitle}</span>
                    </Link>
                  )}
                </div>
              </div>
              {quote.themes && quote.themes.length > 0 && (
                <div className="flex gap-1.5">
                  {quote.themes.slice(0, 3).map(theme => (
                    <span
                      key={theme}
                      className={`px-2 py-0.5 rounded-full text-xs capitalize ${
                        darkMode ? 'bg-white/[0.06] text-white/40' : 'bg-white/60 text-gray-500'
                      }`}
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              )}
            </footer>
          </blockquote>
        </div>
      ))}
    </div>
  )
}
