'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { X, Search, Loader2, Image as ImageIcon, Film, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'

type MediaFile = {
  id: string
  public_url: string
  file_type: 'image' | 'video' | 'audio' | 'document' | 'other'
  mime_type?: string | null
  original_filename?: string | null
  title?: string | null
  description?: string | null
  alt_text?: string | null
  tags?: string[] | null
  created_at?: string | null
  width?: number | null
  height?: number | null
  metadata?: any
}

export type MediaPickerKind = 'image' | 'video'

type SortOption = 'newest' | 'oldest' | 'filename' | 'size'

type Props = {
  open: boolean
  kind: MediaPickerKind
  onClose: () => void
  onPick: (media: MediaFile) => void
  /** Called with array when multiSelect is true */
  onPickMultiple?: (media: MediaFile[]) => void
  /** Allow selecting multiple items at once */
  multiSelect?: boolean
  /** Pre-fill search box when dialog opens (e.g. service name) */
  initialQuery?: string
}

const PAGE_SIZE = 60

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'filename', label: 'Filename' },
  { value: 'size', label: 'Largest' },
]

const TAG_FILTERS = [
  { value: '', label: 'All' },
  { value: 'professional-photography', label: 'Professional' },
  { value: 'event', label: 'Events' },
  { value: 'hero', label: 'Heroes' },
  { value: 'annual-report', label: 'Annual Report' },
  { value: 'community', label: 'Community' },
]

function getYoutubeThumb(url: string) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s?]+)/)
  if (!m?.[1]) return null
  return `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg`
}

function getVimeoThumbFromMeta(meta: any) {
  const t = meta?.thumbnail_url || meta?.external_video?.thumbnail_url
  return typeof t === 'string' && t.trim() ? t.trim() : null
}

function getVideoThumb(item: MediaFile) {
  const url = String(item.public_url || '').trim()
  return getVimeoThumbFromMeta(item.metadata) || getYoutubeThumb(url) || null
}

export default function MediaPickerDialog({ open, kind, onClose, onPick, onPickMultiple, multiSelect, initialQuery }: Props) {
  const [items, setItems] = useState<MediaFile[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [sort, setSort] = useState<SortOption>('newest')
  const [tagFilter, setTagFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const title = multiSelect
    ? (kind === 'image' ? 'Select photos' : 'Select videos')
    : (kind === 'image' ? 'Choose a photo' : 'Choose a video')
  const icon = kind === 'image' ? <ImageIcon className="w-5 h-5" /> : <Film className="w-5 h-5" />

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const url = useMemo(() => {
    const params = new URLSearchParams()
    params.set('limit', String(PAGE_SIZE))
    params.set('offset', String(page * PAGE_SIZE))
    params.set('fileType', kind)
    params.set('sort', sort)
    const q = query.trim()
    if (q) params.set('q', q)
    if (tagFilter) params.set('tags', tagFilter)
    return `/api/media/list?${params.toString()}`
  }, [kind, query, page, sort, tagFilter])

  // Reset on open
  useEffect(() => {
    if (!open) return
    setItems([])
    setError(null)
    setQuery(initialQuery || '')
    setPage(0)
    setSort('newest')
    setTagFilter('')
    setShowFilters(false)
    setSelected(new Set())
  }, [open, kind, initialQuery])

  // Reset page when filters change
  useEffect(() => {
    setPage(0)
  }, [query, sort, tagFilter])

  // Fetch data
  useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const handle = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(url, { signal: controller.signal })
        if (!res.ok) {
          const text = await res.text().catch(() => '')
          throw new Error(text || `Failed to load media (${res.status})`)
        }
        const payload = await res.json().catch(() => ({} as any))
        const data = Array.isArray(payload?.data) ? payload.data : []
        setItems(data)
        setTotalCount(typeof payload?.count === 'number' ? payload.count : data.length)
      } catch (e: any) {
        if (String(e?.name || '') === 'AbortError') return
        setError(e?.message || 'Failed to load media')
        setItems([])
        setTotalCount(0)
      } finally {
        setLoading(false)
        clearTimeout(timeout)
      }
    }, query.trim() ? 350 : 0)

    return () => {
      clearTimeout(handle)
      clearTimeout(timeout)
      controller.abort()
    }
  }, [open, url])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!open) return
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowRight' && page < totalPages - 1) setPage(p => p + 1)
    if (e.key === 'ArrowLeft' && page > 0) setPage(p => p - 1)
  }, [open, page, totalPages, onClose])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col" style={{ maxHeight: '90vh' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                {icon}
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{title}</div>
                <div className="text-xs text-gray-500">
                  {totalCount > 0 && !loading && (
                    <span className="font-medium text-gray-700">{totalCount.toLocaleString()} results</span>
                  )}
                  {totalCount > 0 && !loading && ' · '}
                  <Link href="/picc/media/gallery" className="text-picc-red hover:underline" target="_blank" rel="noreferrer">
                    Gallery
                  </Link>
                  {' · '}
                  <Link href="/picc/media/upload" className="text-picc-red hover:underline" target="_blank" rel="noreferrer">
                    Upload
                  </Link>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search + Filter bar */}
          <div className="px-5 py-3 border-b border-gray-200 flex-shrink-0 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={kind === 'image' ? 'Search photos by name, description...' : 'Search videos...'}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-picc-red focus:border-transparent text-sm"
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 rounded-lg border text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  showFilters || tagFilter ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </div>

            {/* Expandable filter row */}
            {showFilters && (
              <div className="flex flex-wrap items-center gap-4">
                {/* Tag filter chips */}
                <div className="flex flex-wrap gap-1.5">
                  {TAG_FILTERS.map(tf => (
                    <button
                      key={tf.value}
                      type="button"
                      onClick={() => setTagFilter(tf.value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        tagFilter === tf.value
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs text-gray-500">Sort:</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    className="text-xs bg-white border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-picc-red"
                  >
                    {SORT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-5">
            {loading ? (
              <div className="py-16 text-center text-gray-600">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
                Loading…
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <div className="text-sm font-semibold text-gray-900 mb-2">Couldn't load media</div>
                <div className="text-sm text-gray-600 mb-4">{error}</div>
                <div className="text-xs text-gray-500">
                  If you're not signed in, this works on localhost dev only. You can also open{' '}
                  <Link href="/picc/media/gallery" className="text-picc-red hover:underline" target="_blank" rel="noreferrer">
                    `/picc/media/gallery`
                  </Link>
                  .
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="py-12 text-center text-gray-600">
                <p className="mb-2">No media found.</p>
                <p className="text-sm text-gray-400">Try a different search term or remove filters.</p>
              </div>
            ) : kind === 'image' ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {items.map((m) => {
                  const alt = (m.alt_text || m.title || m.original_filename || 'Photo') ?? 'Photo'
                  const dims = m.width && m.height ? `${m.width}×${m.height}` : null
                  const isSelected = selected.has(m.id)
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        if (multiSelect) {
                          setSelected(prev => {
                            const next = new Set(prev)
                            if (next.has(m.id)) next.delete(m.id)
                            else next.add(m.id)
                            return next
                          })
                        } else {
                          onPick(m)
                        }
                      }}
                      className={`group text-left rounded-lg border overflow-hidden hover:shadow-md transition-all bg-white ${
                        isSelected ? 'border-picc-red ring-2 ring-picc-red/30' : 'border-gray-200 hover:border-warm-300'
                      }`}
                      title={`${String(alt)}${dims ? ` (${dims})` : ''}`}
                    >
                      <div className="aspect-square bg-gray-100 overflow-hidden relative">
                        <img src={m.public_url} alt={String(alt)} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform" />
                        {/* Multi-select checkbox */}
                        {multiSelect && (
                          <div className={`absolute top-1.5 left-1.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-picc-red border-picc-red' : 'bg-white/80 border-gray-300 group-hover:border-gray-400'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        )}
                        {/* Tags overlay on hover */}
                        {Array.isArray(m.tags) && m.tags.length > 0 && (
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex flex-wrap gap-0.5">
                              {m.tags.slice(0, 3).map((t) => (
                                <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
                                  {t}
                                </span>
                              ))}
                              {m.tags.length > 3 && (
                                <span className="text-[9px] px-1.5 py-0.5 text-white/70">+{m.tags.length - 3}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="px-2 py-1.5">
                        <div className="text-[11px] font-medium text-gray-900 line-clamp-1">
                          {String(m.title || m.original_filename || 'Photo')}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((m) => {
                  const thumb = getVideoThumb(m)
                  const label = String(m.title || m.original_filename || 'Video')
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => onPick(m)}
                      className="group w-full text-left rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-warm-200 transition-all bg-white flex gap-3 p-3"
                      title={label}
                    >
                      <div className="w-28 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                        {thumb ? (
                          <img src={thumb} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Film className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-gray-900 line-clamp-2">{label}</div>
                        <div className="text-xs text-gray-600 line-clamp-1">{String(m.public_url || '')}</div>
                        {Array.isArray(m.tags) && m.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {m.tags.slice(0, 3).map((t) => (
                              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Multi-select action bar */}
          {multiSelect && selected.size > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-picc-red/5 flex-shrink-0">
              <p className="text-sm font-medium text-gray-700">
                {selected.size} photo{selected.size !== 1 ? 's' : ''} selected
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const selectedItems = items.filter(m => selected.has(m.id))
                    if (onPickMultiple) onPickMultiple(selectedItems)
                    else selectedItems.forEach(m => onPick(m))
                    onClose()
                  }}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-picc-red rounded-lg hover:bg-picc-red/90"
                >
                  Add {selected.size} Photo{selected.size !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          )}

          {/* Pagination footer */}
          {totalCount > PAGE_SIZE && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <p className="text-xs text-gray-500">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount.toLocaleString()}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 7) {
                    pageNum = i
                  } else if (page < 3) {
                    pageNum = i
                  } else if (page > totalPages - 4) {
                    pageNum = totalPages - 7 + i
                  } else {
                    pageNum = page - 3 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                        pageNum === page
                          ? 'bg-gray-900 text-white'
                          : 'hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  )
                })}

                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
