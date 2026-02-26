'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Loader2, Star, SlidersHorizontal, X } from 'lucide-react'
import type { PhotoSlotValue } from '@/lib/annual-report/planner-types'

interface MediaFile {
  id: string
  url: string
  caption: string | null
  title: string | null
  tags: string[]
  rating: number | null
  is_featured: boolean
  original_filename: string | null
  width: number | null
  height: number | null
}

interface PhotoPickerProps {
  currentValue: PhotoSlotValue | null
  onSelect: (photo: Omit<PhotoSlotValue, 'type'>) => void
  pageContext?: string
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top Rated' },
] as const

const RATING_OPTIONS = [
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
  { value: 5, label: '5' },
] as const

/** Map report page keys to relevant AI tags for auto-filtering */
const PAGE_TAG_MAP: Record<string, string[]> = {
  cover:            ['hero-quality', 'landscape'],
  communityVoices:  ['community', 'group'],
  youthVoices:      ['youth'],
  services:         ['services'],
  innovation:       ['services'],
  governance:       ['staff', 'portrait'],
  messages:         ['staff', 'portrait'],
  directorsReport:  ['staff', 'portrait'],
  photos:           ['hero-quality'],
  highlights:       ['community', 'event'],
  acknowledgement:  ['culture'],
  journey:          ['culture'],
  backCover:        ['landscape'],
}

const SUGGESTED_PAGE_SIZE = 6
const PAGE_SIZE = 24

export function PhotoPicker({ currentValue, onSelect, pageContext }: PhotoPickerProps) {
  const [suggestedPhotos, setSuggestedPhotos] = useState<MediaFile[]>([])
  const [photos, setPhotos] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSuggested, setLoadingSuggested] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [sort, setSort] = useState<string>('newest')
  const [minRating, setMinRating] = useState(0)
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const contextTags = pageContext ? PAGE_TAG_MAP[pageContext] : undefined

  const buildParams = useCallback((currentOffset: number, overrideTags?: string) => {
    const params = new URLSearchParams({
      fileType: 'image',
      limit: String(PAGE_SIZE),
      offset: String(currentOffset),
      sort,
    })
    if (activeSearch) params.set('q', activeSearch)
    if (minRating > 0) params.set('minRating', String(minRating))
    if (featuredOnly) params.set('featured', 'true')
    if (overrideTags) params.set('tags', overrideTags)
    return params
  }, [sort, activeSearch, minRating, featuredOnly])

  const parseItems = (data: any[]): MediaFile[] =>
    data.map((m: any) => ({
      id: m.id,
      url: m.public_url || m.storage_url || '',
      caption: m.caption,
      title: m.title,
      tags: m.tags || [],
      rating: m.rating,
      is_featured: m.is_featured,
      original_filename: m.original_filename,
      width: m.width,
      height: m.height,
    }))

  // Fetch suggested photos based on page context
  useEffect(() => {
    if (!contextTags || contextTags.length === 0) {
      setSuggestedPhotos([])
      return
    }

    let cancelled = false
    setLoadingSuggested(true)

    const fetchSuggested = async () => {
      try {
        // Fetch photos matching any of the context tags
        const params = new URLSearchParams({
          fileType: 'image',
          limit: String(SUGGESTED_PAGE_SIZE),
          offset: '0',
          sort: 'rating',
          tags: contextTags.join(','),
        })
        const res = await fetch(`/api/media/list?${params}`)
        if (!res.ok) throw new Error('Fetch failed')
        const data = await res.json()
        if (!cancelled) {
          setSuggestedPhotos(parseItems(data.data || []))
        }
      } catch {
        if (!cancelled) setSuggestedPhotos([])
      } finally {
        if (!cancelled) setLoadingSuggested(false)
      }
    }

    fetchSuggested()
    return () => { cancelled = true }
  }, [contextTags?.join(',')])

  const fetchPhotos = useCallback(async (offset: number, append: boolean) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    append ? setLoadingMore(true) : setLoading(true)

    try {
      const res = await fetch(`/api/media/list?${buildParams(offset)}`, { signal: controller.signal })
      if (!res.ok) throw new Error('Fetch failed')
      const data = await res.json()
      const items = parseItems(data.data || [])

      setPhotos(prev => append ? [...prev, ...items] : items)
      setTotalCount(data.count || 0)
    } catch (err: any) {
      if (err?.name !== 'AbortError') console.error('Photo fetch failed:', err)
    } finally {
      append ? setLoadingMore(false) : setLoading(false)
    }
  }, [buildParams])

  // Load on mount and when filters change
  useEffect(() => {
    fetchPhotos(0, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, minRating, featuredOnly, activeSearch])

  const handleSearch = () => setActiveSearch(searchQuery.trim())
  const handleClearSearch = () => { setSearchQuery(''); setActiveSearch('') }
  const handleLoadMore = () => fetchPhotos(photos.length, true)

  const hasMore = photos.length < totalCount

  // IDs of suggested photos so we can exclude from "All photos" if desired
  const suggestedIds = new Set(suggestedPhotos.map(p => p.id))

  const renderPhotoCard = (photo: MediaFile) => (
    <button
      key={photo.id}
      onClick={() =>
        onSelect({
          mediaFileId: photo.id,
          url: photo.url,
          caption: photo.caption || undefined,
          tags: photo.tags,
        })
      }
      onMouseEnter={() => setHoveredId(photo.id)}
      onMouseLeave={() => setHoveredId(null)}
      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
        currentValue?.mediaFileId === photo.id
          ? 'border-[#0B4F6C] ring-1 ring-blue-200'
          : 'border-transparent hover:border-gray-300'
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt={photo.caption || photo.title || ''}
        className="w-full h-full object-cover"
        loading="lazy"
      />

      {hoveredId === photo.id && (
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-1.5 text-white">
          {photo.width && photo.height && (
            <span className="text-[9px] opacity-80">{photo.width}&times;{photo.height}</span>
          )}
          {photo.rating != null && photo.rating > 0 && (
            <span className="text-[9px] flex items-center gap-0.5">
              <Star className="h-2 w-2 fill-amber-400 text-amber-400" />
              {photo.rating}
            </span>
          )}
        </div>
      )}

      {photo.is_featured && hoveredId !== photo.id && (
        <div className="absolute top-1 right-1">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400 drop-shadow" />
        </div>
      )}

      {currentValue?.mediaFileId === photo.id && (
        <div className="absolute inset-0 bg-[#0B4F6C]/20 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-[#0B4F6C] flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
    </button>
  )

  return (
    <div>
      {/* Search bar */}
      <div className="flex gap-1.5 mb-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search photos..."
            className="w-full text-xs border border-gray-200 rounded-md pl-2 pr-7 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0B4F6C]"
          />
          {activeSearch && (
            <button
              onClick={handleClearSearch}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-300 hover:text-gray-500"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          className="px-2 py-1 text-gray-500 hover:text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50"
        >
          <Search className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Filter chips row */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <button
          onClick={() => setFeaturedOnly(!featuredOnly)}
          className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
            featuredOnly
              ? 'bg-amber-50 text-amber-700 border-amber-300'
              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
          }`}
        >
          <Star className="h-2.5 w-2.5" />
          Featured
        </button>

        {RATING_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setMinRating(minRating === opt.value ? 0 : opt.value)}
            className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
              minRating === opt.value
                ? 'bg-[#0B4F6C] text-white border-[#0B4F6C]'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            {opt.label} stars
          </button>
        ))}

        <div className="ml-auto flex items-center gap-1">
          <SlidersHorizontal className="h-2.5 w-2.5 text-gray-400" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-[10px] border border-gray-200 rounded px-1 py-0.5 text-gray-600 focus:outline-none"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Suggested photos for page context */}
      {contextTags && contextTags.length > 0 && !activeSearch && (
        <div className="mb-3">
          <div className="text-[10px] font-medium text-[#0B4F6C] mb-1">
            Suggested for this page
          </div>
          {loadingSuggested ? (
            <div className="flex items-center justify-center h-16">
              <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
            </div>
          ) : suggestedPhotos.length === 0 ? (
            <p className="text-[10px] text-gray-400 py-2">No suggested photos yet</p>
          ) : (
            <div className="grid grid-cols-3 gap-1.5 mb-1">
              {suggestedPhotos.map(renderPhotoCard)}
            </div>
          )}
          <div className="border-b border-gray-100 mt-1" />
        </div>
      )}

      {/* Result count */}
      {!loading && (
        <div className="text-[10px] text-gray-400 mb-1.5">
          {totalCount} photo{totalCount !== 1 ? 's' : ''} found
          {activeSearch && <span> for &ldquo;{activeSearch}&rdquo;</span>}
        </div>
      )}

      {/* Photo grid */}
      {loading ? (
        <div className="flex items-center justify-center h-24">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      ) : photos.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">No photos found</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-1.5 max-h-52 overflow-auto">
            {photos.map(renderPhotoCard)}
          </div>

          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="w-full mt-2 py-1.5 text-xs text-[#0B4F6C] hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading...
                </>
              ) : (
                <>Load more ({totalCount - photos.length} remaining)</>
              )}
            </button>
          )}
        </>
      )}
    </div>
  )
}
