/**
 * ResearchSourcesPanel — client-side filter/search/expand for the
 * research sources block on /picc/library. The page itself stays
 * server-rendered; this island just lets the operator narrow down
 * the inventory without a page reload.
 */
'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, Search, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

export interface ResearchSourceRow {
  id: string
  source_type: string | null
  title: string
  description: string | null
  author: string | null
  publisher: string | null
  publication_date: string | null
  url: string | null
  is_verified: boolean | null
  is_primary_source: boolean | null
  extracted_data: { subtype?: string; impact?: string; provenance?: string; capture_status?: string } | null
}

type StatusFilter = 'all' | 'verified' | 'awaiting'
type PrimaryFilter = 'all' | 'primary' | 'secondary'

const TYPE_LABELS: Record<string, string> = {
  internal_document: 'Internal',
  government_report: 'Government',
  academic_paper: 'Academic',
  news_article: 'News',
  community_voice: 'Community',
}

export default function ResearchSourcesPanel({ sources }: { sources: ResearchSourceRow[] }) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [primaryFilter, setPrimaryFilter] = useState<PrimaryFilter>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const types = useMemo(
    () => Array.from(new Set(sources.map((s) => s.source_type).filter((t): t is string => !!t))).sort(),
    [sources],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sources.filter((s) => {
      if (statusFilter === 'verified' && !s.is_verified) return false
      if (statusFilter === 'awaiting' && s.is_verified) return false
      if (primaryFilter === 'primary' && !s.is_primary_source) return false
      if (primaryFilter === 'secondary' && s.is_primary_source) return false
      if (typeFilter !== 'all' && s.source_type !== typeFilter) return false
      if (q) {
        const haystack = [
          s.title,
          s.description,
          s.author,
          s.publisher,
          s.source_type,
          s.extracted_data?.subtype,
          s.extracted_data?.impact,
          s.extracted_data?.provenance,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [sources, query, statusFilter, primaryFilter, typeFilter])

  const toggleExpand = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <div>
      {/* Filter bar */}
      <div className="rounded-2xl bg-white border border-stone-200 p-4 mb-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, description, author, publisher…"
            className="flex-1 text-sm bg-transparent border-none outline-none placeholder-stone-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-stone-400 hover:text-stone-600"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {/* Status */}
          <div className="inline-flex rounded-lg bg-stone-50 border border-stone-200 overflow-hidden">
            {(
              [
                ['all', `All (${sources.length})`],
                ['verified', `Verified (${sources.filter((s) => s.is_verified).length})`],
                ['awaiting', `Awaiting (${sources.filter((s) => !s.is_verified).length})`],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1.5 transition ${
                  statusFilter === key ? 'bg-[#0B4F6C] text-white' : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Primary */}
          <div className="inline-flex rounded-lg bg-stone-50 border border-stone-200 overflow-hidden">
            {(
              [
                ['all', 'Any'],
                ['primary', `Primary (${sources.filter((s) => s.is_primary_source).length})`],
                ['secondary', `Secondary (${sources.filter((s) => !s.is_primary_source).length})`],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setPrimaryFilter(key)}
                className={`px-3 py-1.5 transition ${
                  primaryFilter === key ? 'bg-[#C8963E] text-white' : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Type */}
          {types.length > 0 && (
            <div className="inline-flex rounded-lg bg-stone-50 border border-stone-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 transition ${
                  typeFilter === 'all' ? 'bg-stone-700 text-white' : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                Any type
              </button>
              {types.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 transition border-l border-stone-200 ${
                    typeFilter === t ? 'bg-stone-700 text-white' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {TYPE_LABELS[t] || t.replace(/_/g, ' ')} ({sources.filter((s) => s.source_type === t).length})
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-[11px] text-stone-500">
          Showing <strong>{filtered.length}</strong> of {sources.length} sources
        </p>
      </div>

      {/* Source list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-400">
            No sources match these filters. Try clearing the search or status filter.
          </div>
        ) : (
          filtered.map((r) => {
            const subtype = r.extracted_data?.subtype || r.source_type || 'document'
            const impact = r.extracted_data?.impact
            const provenance = r.extracted_data?.provenance
            const captureStatus = r.extracted_data?.capture_status
            const isOpen = !!expanded[r.id]
            const desc = r.description || ''
            const truncated = !isOpen && desc.length > 280
            const shown = truncated ? desc.slice(0, 280) + '…' : desc

            return (
              <div key={r.id} className="rounded-xl border border-stone-200 bg-white overflow-hidden">
                {/* Header row */}
                <button
                  type="button"
                  onClick={() => toggleExpand(r.id)}
                  className="w-full text-left px-5 pt-5 pb-3 flex items-start justify-between gap-4 hover:bg-stone-50/50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-stone-800 leading-snug mb-1">
                      {r.title}
                    </h3>
                    <p className="text-[11px] font-mono uppercase tracking-wide text-stone-400">
                      {subtype} · {r.author || 'Author unknown'}
                      {r.publisher && r.publisher !== r.author ? ` · ${r.publisher}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {r.is_primary_source && (
                      <span className="text-[10px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded bg-[#C8963E]/15 text-[#C8963E]">
                        Primary
                      </span>
                    )}
                    {r.is_verified ? (
                      <span className="text-[10px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded bg-green-50 text-green-700 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">
                        Awaiting
                      </span>
                    )}
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-stone-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-400" />
                    )}
                  </div>
                </button>

                {/* Body */}
                <div className="px-5 pb-5">
                  {desc && (
                    <p className="text-sm text-stone-600 leading-relaxed mb-3">
                      {shown}
                      {truncated && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(r.id)}
                          className="ml-1 text-xs text-[#C8963E] hover:underline"
                        >
                          Read more
                        </button>
                      )}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-[11px] pt-3 border-t border-stone-100">
                    {impact && (
                      <span className="text-[#C8963E]">
                        <strong>Impact:</strong> {impact}
                      </span>
                    )}
                    {captureStatus && (
                      <span className="text-amber-600">
                        <strong>Status:</strong> {captureStatus.replace(/_/g, ' ')}
                      </span>
                    )}
                    {r.url && (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0B4F6C] inline-flex items-center gap-1 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Open source
                      </a>
                    )}
                    {provenance && (
                      <span className="text-stone-400 ml-auto truncate max-w-xs">
                        {provenance}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
