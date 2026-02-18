'use client'

import React, { useEffect, useState } from 'react'
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CuratedQuote {
  id: string
  text: string
  author: string | null
  role: string | null
  photo_url: string | null
  theme: string | null
  source: string
  is_elder: boolean
}

interface Props {
  /** Filter quotes by theme */
  theme?: string
  /** Only show featured/report-worthy quotes */
  featured?: boolean
  /** Number of quotes to fetch */
  limit?: number
  /** Display variant */
  variant?: 'carousel' | 'grid' | 'single'
  /** Additional CSS classes */
  className?: string
  /** Show theme badges */
  showThemes?: boolean
}

export function CommunityQuotesSection({
  theme,
  featured = true,
  limit = 6,
  variant = 'carousel',
  className = '',
  showThemes = false,
}: Props) {
  const [quotes, setQuotes] = useState<CuratedQuote[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams()
    if (theme) params.set('theme', theme)
    if (featured) params.set('featured', 'true')
    params.set('limit', String(limit))
    if (variant === 'carousel') params.set('shuffle', 'true')

    fetch(`/api/public/curated-quotes?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setQuotes(data.quotes || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [theme, featured, limit, variant])

  if (loading) {
    return (
      <div className={`py-16 ${className}`}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="h-8 w-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  if (!quotes.length) return null

  const next = () => setActiveIndex((i) => (i + 1) % quotes.length)
  const prev = () => setActiveIndex((i) => (i - 1 + quotes.length) % quotes.length)

  if (variant === 'single') {
    const q = quotes[0]
    return (
      <div className={className}>
        <SingleQuote quote={q} showThemes={showThemes} />
      </div>
    )
  }

  if (variant === 'grid') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {quotes.map((q) => (
          <QuoteCard key={q.id} quote={q} showThemes={showThemes} />
        ))}
      </div>
    )
  }

  // Carousel (default)
  const q = quotes[activeIndex]
  return (
    <section className={`relative py-24 md:py-32 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-warm-50" />
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-picc-ochre rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-picc-red rounded-full blur-[128px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <Quote className="w-12 h-12 text-gray-300 mx-auto mb-10" />
            <blockquote className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight tracking-[-0.02em] mb-10">
              &ldquo;{q.text}&rdquo;
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              {q.photo_url ? (
                <img
                  src={q.photo_url}
                  alt={q.author || ''}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-picc-red to-picc-ochre" />
              )}
              <div className="text-left">
                <div className="font-semibold text-gray-900 text-sm">{q.author || 'Community Member'}</div>
                {q.role && <div className="text-gray-500 text-sm">{q.role}</div>}
              </div>
            </div>
            {showThemes && q.theme && (
              <div className="mt-4">
                <span className="inline-block px-3 py-1 text-xs font-medium bg-warm-100 text-picc-ochre rounded-full capitalize">
                  {q.theme}
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {quotes.length > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={prev}
              className="p-2 rounded-full hover:bg-gray-200/60 transition-colors text-gray-400 hover:text-gray-600"
              aria-label="Previous quote"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-1.5">
              {quotes.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === activeIndex ? 'bg-gray-900' : 'bg-gray-300'
                  }`}
                  aria-label={`Quote ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="p-2 rounded-full hover:bg-gray-200/60 transition-colors text-gray-400 hover:text-gray-600"
              aria-label="Next quote"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

function SingleQuote({ quote: q, showThemes }: { quote: CuratedQuote; showThemes?: boolean }) {
  return (
    <div className="text-center">
      <Quote className="w-10 h-10 text-gray-300 mx-auto mb-6" />
      <blockquote className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight tracking-[-0.01em] mb-6">
        &ldquo;{q.text}&rdquo;
      </blockquote>
      <div className="flex items-center justify-center gap-3">
        {q.photo_url ? (
          <img src={q.photo_url} alt={q.author || ''} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-picc-red to-picc-ochre" />
        )}
        <div className="text-left">
          <div className="font-semibold text-gray-900 text-sm">{q.author || 'Community Member'}</div>
          {q.role && <div className="text-gray-500 text-xs">{q.role}</div>}
        </div>
      </div>
      {showThemes && q.theme && (
        <div className="mt-3">
          <span className="inline-block px-3 py-1 text-xs font-medium bg-warm-100 text-picc-ochre rounded-full capitalize">
            {q.theme}
          </span>
        </div>
      )}
    </div>
  )
}

function QuoteCard({ quote: q, showThemes }: { quote: CuratedQuote; showThemes?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col">
      <Quote className="w-6 h-6 text-picc-ochre mb-4 flex-shrink-0" />
      <p className="text-gray-800 text-base leading-relaxed mb-4 flex-1 line-clamp-5">
        &ldquo;{q.text}&rdquo;
      </p>
      <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
        {q.photo_url ? (
          <img src={q.photo_url} alt={q.author || ''} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-picc-red/20 to-picc-ochre/20" />
        )}
        <div className="min-w-0">
          <div className="font-medium text-gray-900 text-sm truncate">{q.author || 'Community Member'}</div>
          {q.role && <div className="text-gray-500 text-xs truncate">{q.role}</div>}
        </div>
      </div>
      {showThemes && q.theme && (
        <div className="mt-3">
          <span className="inline-block px-2.5 py-0.5 text-xs font-medium bg-warm-50 text-picc-ochre rounded-full capitalize">
            {q.theme}
          </span>
        </div>
      )}
    </div>
  )
}

export default CommunityQuotesSection
