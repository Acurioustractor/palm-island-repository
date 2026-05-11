'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Send, Check, RefreshCw, Copy } from 'lucide-react'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'

interface Suggestion {
  nodeId: string
  spreadId: string
  spreadLabel: string
  targetLabel: string
  pencilPath: string | null
  file: string | null
  print_score: string | null
  reason: string
}

const PRINT_COLOR: Record<string, string> = {
  fullbleed: '#15803D',
  halfpage: '#0EA5E9',
  quarterpage: '#C8963E',
  thumbnail: '#A39E99',
  'too-small': '#8B1A1A',
  unknown: '#6B6560',
}

export default function AutoFillClient() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [counts, setCounts] = useState<{ total: number; matched: number; skipped: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [queuing, setQueuing] = useState(false)
  const [queued, setQueued] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  async function loadPreview() {
    setLoading(true)
    try {
      const r = await fetch('/api/pencil/auto-fill')
      const j = await r.json()
      setSuggestions(j.suggestions ?? [])
      setCounts(j.counts ?? null)
    } finally {
      setLoading(false)
    }
  }

  async function queueAll() {
    if (!confirm('Queue all suggested pushes to Pencil? You can still review the queue and remove individual entries before processing.')) return
    setQueuing(true)
    try {
      const r = await fetch('/api/pencil/auto-fill', { method: 'POST' })
      const j = await r.json()
      setQueued(j.queued ?? 0)
      // Refresh preview
      loadPreview()
    } finally {
      setQueuing(false)
    }
  }

  async function copyMagicPhrase() {
    try {
      await navigator.clipboard.writeText('process pencil queue')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  useEffect(() => {
    loadPreview()
  }, [])

  // Group suggestions by spread for visual scan
  const bySpread = suggestions.reduce((acc, s) => {
    const arr = acc.get(s.spreadLabel) ?? []
    arr.push(s)
    acc.set(s.spreadLabel, arr)
    return acc
  }, new Map<string, Suggestion[]>())

  return (
    <>
      {/* Hero CTA */}
      <section
        className="rounded-xl p-8 mb-8"
        style={{
          background: `linear-gradient(135deg, ${C.ocean}, ${C.ocean}DD)`,
          color: '#FFFFFF',
        }}
      >
        <div className="flex items-start justify-between flex-wrap gap-6 mb-4">
          <div className="flex-1 min-w-[260px]">
            <p
              className="font-bold uppercase mb-2"
              style={{ color: '#FFFFFFAA', fontSize: 10, letterSpacing: '0.3em' }}
            >
              ONE CLICK
            </p>
            <h2 className="font-fraunces font-bold mb-3" style={{ fontSize: 32, lineHeight: 1.1 }}>
              {counts ? (
                <>
                  Auto-fill {counts.matched} of {counts.total} placeholders
                </>
              ) : (
                'Loading…'
              )}
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.5, maxWidth: 540 }}>
              {counts && counts.skipped > 0
                ? `${counts.skipped} placeholders won't be filled — usually portrait slots that need a specific person's photo. Add those manually after.`
                : 'Every placeholder in the v2 cluster gets the best print-ready photo we have for it.'}
            </p>
          </div>
          <button
            onClick={queueAll}
            disabled={queuing || loading || (counts?.matched ?? 0) === 0}
            className="px-6 py-4 rounded-lg font-bold text-base inline-flex items-center gap-2 transition-colors disabled:opacity-60"
            style={{
              backgroundColor: queued !== null ? C.mangrove : C.ochre,
              color: '#FFFFFF',
              minWidth: 220,
              justifyContent: 'center',
            }}
          >
            {queuing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Queuing…
              </>
            ) : queued !== null ? (
              <>
                <Check className="w-5 h-5" /> Queued {queued} pushes
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Auto-fill all spreads
              </>
            )}
          </button>
        </div>
      </section>

      {/* Step 2 — show only after queueing */}
      {queued !== null && (
        <section
          className="rounded-xl p-6 mb-8"
          style={{ backgroundColor: C.ochre + '12', border: `2px dashed ${C.ochre}` }}
        >
          <p
            className="font-bold uppercase mb-2"
            style={{ color: C.ochre, fontSize: 11, letterSpacing: '0.3em' }}
          >
            STEP 2 · TYPE THIS IN YOUR CLAUDE CODE CHAT
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <code
              className="px-4 py-3 rounded-lg text-lg font-bold"
              style={{
                backgroundColor: '#FFFFFF',
                color: C.ocean,
                border: `1px solid ${C.border}`,
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              process pencil queue
            </code>
            <button
              onClick={copyMagicPhrase}
              className="px-4 py-3 rounded-lg font-bold inline-flex items-center gap-2"
              style={{
                backgroundColor: copied ? C.mangrove : C.ocean,
                color: '#FFFFFF',
              }}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy phrase'}
            </button>
          </div>
          <p
            className="mt-3 text-sm font-fraunces italic"
            style={{ color: C.earth, lineHeight: 1.4 }}
          >
            Paste it into your Claude Code chat. Claude will read the queue and apply{' '}
            {queued} image fills via Pencil MCP. Takes about 10 seconds. Refresh Pencil
            to see the result.
          </p>
        </section>
      )}

      {/* Preview list grouped by spread */}
      <section>
        <h2
          className="font-fraunces font-bold mb-4"
          style={{ color: C.ocean, fontSize: 24, lineHeight: 1.2 }}
        >
          What will happen
        </h2>
        {loading ? (
          <p className="text-sm font-fraunces italic" style={{ color: C.muted }}>
            Loading suggestions…
          </p>
        ) : (
          <div className="space-y-6">
            {Array.from(bySpread.entries()).map(([spread, items]) => (
              <article
                key={spread}
                className="rounded-xl p-5"
                style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}` }}
              >
                <h3
                  className="font-fraunces font-bold mb-3 pb-2 border-b"
                  style={{ color: C.ocean, fontSize: 18, lineHeight: 1.2, borderColor: C.border }}
                >
                  {spread}
                </h3>
                <div className="space-y-2">
                  {items.map((s) => (
                    <div
                      key={s.nodeId}
                      className="flex items-start gap-3 py-2"
                      style={{ opacity: s.pencilPath ? 1 : 0.5 }}
                    >
                      <span
                        className="font-mono text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: C.shell, color: C.muted, border: `1px solid ${C.border}` }}
                      >
                        {s.nodeId}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-fraunces"
                          style={{ color: C.earth, lineHeight: 1.4 }}
                        >
                          <strong style={{ color: C.ocean }}>{s.targetLabel}</strong>
                          {s.pencilPath ? (
                            <>
                              {' '}
                              ← <code style={{ color: C.ocean }}>{s.file}</code>
                            </>
                          ) : (
                            <span style={{ color: C.turtleRed }}> · skip</span>
                          )}
                        </p>
                        <p className="text-xs mt-0.5 italic" style={{ color: C.muted }}>
                          {s.reason}
                        </p>
                      </div>
                      {s.print_score && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
                          style={{
                            backgroundColor: PRINT_COLOR[s.print_score] + '14',
                            color: PRINT_COLOR[s.print_score],
                            border: `1px solid ${PRINT_COLOR[s.print_score]}44`,
                          }}
                        >
                          {s.print_score}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Refresh */}
      <div className="mt-8 text-center">
        <button
          onClick={loadPreview}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs hover:bg-stone-50"
          style={{ color: C.muted, border: `1px solid ${C.border}` }}
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh suggestions
        </button>
      </div>
    </>
  )
}
