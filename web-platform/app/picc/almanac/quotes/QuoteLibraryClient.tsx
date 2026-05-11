'use client'

import { useState, useMemo } from 'react'
import { Copy, Check, Search, Star, Award } from 'lucide-react'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'
import type { ELQuote } from '@/lib/almanac/quote-library'

export interface ScoredQuote extends ELQuote {
  score: number
}

const THEME_COLORS: Record<string, string> = {
  history: '#8B1A1A',
  culture: '#15803D',
  connection: '#0EA5E9',
  resilience: '#0B4F6C',
  community: '#C8963E',
  elders: '#6B6560',
  achievement: '#F5A623',
  youth: '#0EA5E9',
  services: '#15803D',
  education: '#0B4F6C',
  untagged: '#A39E99',
}

const SENTIMENT_COLORS: Record<string, string> = {
  positive: '#15803D',
  reflective: '#0EA5E9',
  inspiring: '#C8963E',
  hopeful: '#F5A623',
  resilient: '#0B4F6C',
  somber: '#6B6560',
}

export default function QuoteLibraryClient({ quotes }: { quotes: ScoredQuote[] }) {
  const [query, setQuery] = useState('')
  const [theme, setTheme] = useState<string | null>(null)
  const [speaker, setSpeaker] = useState<string | null>(null)
  const [onlySFR, setOnlySFR] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const themes = useMemo(() => {
    const set = new Set<string>()
    for (const q of quotes) set.add(q.theme ?? 'untagged')
    return Array.from(set).sort()
  }, [quotes])

  const speakers = useMemo(() => {
    const set = new Set<string>()
    for (const q of quotes) set.add(q.storyteller_name)
    return Array.from(set).sort()
  }, [quotes])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return quotes.filter((x) => {
      if (theme && (x.theme ?? 'untagged') !== theme) return false
      if (speaker && x.storyteller_name !== speaker) return false
      if (onlySFR && !x.suggested_for_report) return false
      if (!query) return true
      return (
        x.quote_text.toLowerCase().includes(q) ||
        (x.context ?? '').toLowerCase().includes(q) ||
        x.storyteller_name.toLowerCase().includes(q)
      )
    })
  }, [quotes, query, theme, speaker, onlySFR])

  async function copyText(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      setTimeout(() => setCopied(null), 1800)
    } catch {}
  }

  return (
    <>
      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div
          className="flex items-center gap-2 flex-1 min-w-[240px] px-3 py-2 rounded-md"
          style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}` }}
        >
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: C.muted }} />
          <input
            type="text"
            placeholder="Search quote, context, or speaker…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 outline-none text-sm bg-transparent"
            style={{ color: C.earth }}
          />
        </div>
        <button
          onClick={() => setOnlySFR((v) => !v)}
          className="px-3 py-2 rounded-md text-xs font-bold uppercase inline-flex items-center gap-1.5"
          style={{
            backgroundColor: onlySFR ? C.mangrove : '#FFFFFF',
            color: onlySFR ? '#FFFFFF' : C.mangrove,
            border: `1px solid ${C.mangrove}66`,
            letterSpacing: '0.1em',
          }}
        >
          <Star className="w-3 h-3" />
          {onlySFR ? 'Showing suggested only' : 'Show suggested only'}
        </button>
        <span className="text-xs font-bold uppercase" style={{ color: C.muted, letterSpacing: '0.2em' }}>
          {filtered.length} shown
        </span>
      </div>

      {/* Theme pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setTheme(null)}
          className="px-2.5 py-1 rounded text-xs font-bold uppercase"
          style={{
            backgroundColor: theme === null ? C.ocean : '#FFFFFF',
            color: theme === null ? '#FFFFFF' : C.ocean,
            border: `1px solid ${theme === null ? C.ocean : C.border}`,
            letterSpacing: '0.1em',
          }}
        >
          All themes
        </button>
        {themes.map((t) => {
          const active = theme === t
          const color = THEME_COLORS[t] ?? C.muted
          return (
            <button
              key={t}
              onClick={() => setTheme(active ? null : t)}
              className="px-2.5 py-1 rounded text-xs font-bold uppercase"
              style={{
                backgroundColor: active ? color : '#FFFFFF',
                color: active ? '#FFFFFF' : color,
                border: `1px solid ${active ? color : color + '66'}`,
                letterSpacing: '0.1em',
              }}
            >
              {t} ({quotes.filter((q) => (q.theme ?? 'untagged') === t).length})
            </button>
          )
        })}
      </div>

      {/* Speaker pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSpeaker(null)}
          className="px-2.5 py-1 rounded text-[11px] font-bold"
          style={{
            backgroundColor: speaker === null ? C.turtleRed : '#FFFFFF',
            color: speaker === null ? '#FFFFFF' : C.turtleRed,
            border: `1px solid ${speaker === null ? C.turtleRed : C.border}`,
          }}
        >
          All speakers
        </button>
        {speakers.map((s) => {
          const active = speaker === s
          const count = quotes.filter((q) => q.storyteller_name === s).length
          return (
            <button
              key={s}
              onClick={() => setSpeaker(active ? null : s)}
              className="px-2.5 py-1 rounded text-[11px] font-bold"
              style={{
                backgroundColor: active ? C.turtleRed : '#FFFFFF',
                color: active ? '#FFFFFF' : C.turtleRed,
                border: `1px solid ${active ? C.turtleRed : C.border}`,
              }}
            >
              {s} ({count})
            </button>
          )
        })}
      </div>

      {/* Quotes */}
      <div className="space-y-3">
        {filtered.map((q) => (
          <QuoteCard key={q.id} quote={q} copied={copied === q.id} onCopy={() => copyText(q.quote_text, q.id)} />
        ))}
        {filtered.length === 0 && (
          <p className="text-center font-fraunces py-12" style={{ color: C.muted }}>
            No quotes match. Adjust the filters.
          </p>
        )}
      </div>
    </>
  )
}

function QuoteCard({ quote, copied, onCopy }: { quote: ScoredQuote; copied: boolean; onCopy: () => void }) {
  const themeColor = THEME_COLORS[quote.theme ?? 'untagged'] ?? C.muted
  const sentColor = SENTIMENT_COLORS[quote.sentiment ?? ''] ?? C.muted
  return (
    <article
      className="rounded-lg p-5"
      style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="px-2 py-0.5 rounded text-[10px] font-bold"
            style={{
              backgroundColor: themeColor + '14',
              color: themeColor,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {quote.theme ?? 'untagged'}
          </span>
          {quote.sentiment && (
            <span
              className="px-2 py-0.5 rounded text-[10px] italic"
              style={{ backgroundColor: sentColor + '12', color: sentColor }}
            >
              {quote.sentiment}
            </span>
          )}
          {quote.suggested_for_report && (
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1"
              style={{ backgroundColor: C.mangrove + '14', color: C.mangrove }}
              title="Flagged suggested-for-report in EL"
            >
              <Star className="w-3 h-3" /> SUGGESTED
            </span>
          )}
          {quote.is_validated && (
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1"
              style={{ backgroundColor: C.turtleRed + '14', color: C.turtleRed }}
              title="Cultural review complete"
            >
              <Award className="w-3 h-3" /> VALIDATED
            </span>
          )}
        </div>
        <span className="text-xs font-bold" style={{ color: C.muted }} title="Annual-report fit score">
          score: {quote.score}
        </span>
      </div>

      <blockquote
        className="font-fraunces italic mb-3"
        style={{ color: C.earth, fontSize: 18, lineHeight: 1.45 }}
      >
        "{quote.quote_text}"
      </blockquote>

      {quote.context && (
        <p className="text-xs italic font-fraunces mb-3" style={{ color: C.driftwood, lineHeight: 1.5 }}>
          {quote.context}
        </p>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm" style={{ color: C.ocean }}>
          — <strong>{quote.storyteller_name}</strong>
          <span style={{ color: C.muted }}> · {quote.quote_text.length} chars</span>
        </p>
        <button
          onClick={onCopy}
          className="px-3 py-1.5 rounded text-xs font-bold inline-flex items-center gap-1.5"
          style={{
            backgroundColor: copied ? C.mangrove : C.ocean,
            color: '#FFFFFF',
          }}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy quote text'}
        </button>
      </div>
    </article>
  )
}
