'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  Image,
  FileText,
  Quote,
  Video,
  Users,
  Sparkles,
  Check,
  X,
  Search,
  Filter,
  Download,
  Save,
  ChevronUp,
  ChevronDown,
  Trash2,
  Zap,
  Loader2,
} from 'lucide-react'
import type {
  ContentItem,
  ContentType,
  ContentRecommendation,
  CurationContext,
  ContentCollection,
} from '@/lib/content-curator/types'

const PURPOSES = [
  { value: 'annual-report', label: 'Annual Report' },
  { value: 'elders-page', label: 'Elders Page' },
  { value: 'celebration', label: 'Celebration' },
  { value: 'grant-package', label: 'Grant Package' },
  { value: 'custom', label: 'Custom' },
] as const

const AUDIENCES = [
  { value: 'community', label: 'Community' },
  { value: 'funder', label: 'Funder' },
  { value: 'youth', label: 'Youth' },
  { value: 'board', label: 'Board' },
] as const

const TYPE_CONFIG: Record<
  ContentType,
  { label: string; icon: typeof FileText; color: string }
> = {
  story: { label: 'Stories', icon: FileText, color: 'bg-blue-100 text-blue-700' },
  quote: { label: 'Quotes', icon: Quote, color: 'bg-purple-100 text-purple-700' },
  photo: { label: 'Photos', icon: Image, color: 'bg-green-100 text-green-700' },
  video: { label: 'Videos', icon: Video, color: 'bg-red-100 text-red-700' },
  person: { label: 'People', icon: Users, color: 'bg-amber-100 text-amber-700' },
  milestone: { label: 'Milestones', icon: Zap, color: 'bg-indigo-100 text-indigo-700' },
}

interface Props {
  initialContent: ContentItem[]
}

export default function ContentCuratorClient({ initialContent }: Props) {
  const [items] = useState<ContentItem[]>(initialContent)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectedOrder, setSelectedOrder] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<
    Map<string, ContentRecommendation>
  >(new Map())
  const [search, setSearch] = useState('')
  const [activeTypes, setActiveTypes] = useState<Set<ContentType>>(
    () => new Set<ContentType>(['story', 'quote', 'photo', 'video', 'person', 'milestone'])
  )
  const [audience, setAudience] = useState('community')
  const [purpose, setPurpose] = useState('annual-report')
  const [collectionName, setCollectionName] = useState('')
  const [loadingRecommend, setLoadingRecommend] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [savedCollections, setSavedCollections] = useState<ContentCollection[]>([])
  const [toast, setToast] = useState<string | null>(null)

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (!activeTypes.has(item.type)) return false
      if (search) {
        const q = search.toLowerCase()
        const matchesSearch =
          item.title.toLowerCase().includes(q) ||
          item.preview.toLowerCase().includes(q) ||
          item.author?.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
        if (!matchesSearch) return false
      }
      return true
    })
  }, [items, activeTypes, search])

  const selectedItems = useMemo(() => {
    const map = new Map(items.map((i) => [i.id, i]))
    return selectedOrder.filter((id) => selectedIds.has(id)).map((id) => map.get(id)!)
  }, [items, selectedIds, selectedOrder])

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const item of selectedItems) {
      counts[item.type] = (counts[item.type] || 0) + 1
    }
    return counts
  }, [selectedItems])

  const toggleType = useCallback((type: ContentType) => {
    setActiveTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }, [])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
    setSelectedOrder((prev) => {
      if (prev.includes(id)) return prev
      return [...prev, id]
    })
  }, [])

  const removeSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setSelectedOrder((prev) => prev.filter((i) => i !== id))
  }, [])

  const moveItem = useCallback((id: string, direction: 'up' | 'down') => {
    setSelectedOrder((prev) => {
      const idx = prev.indexOf(id)
      if (idx === -1) return prev
      const newIdx = direction === 'up' ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[newIdx]] = [next[newIdx], next[idx]]
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
    setSelectedOrder([])
  }, [])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  const handleRecommend = useCallback(async () => {
    setLoadingRecommend(true)
    try {
      const context: CurationContext = {
        page: purpose,
        audience,
        maxItems: 12,
      }
      const res = await fetch('/api/content-curator/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, available: filteredItems.slice(0, 60) }),
      })
      if (!res.ok) throw new Error('Failed to get recommendations')
      const data = await res.json()
      const map = new Map<string, ContentRecommendation>()
      for (const rec of data.recommendations ?? []) {
        map.set(rec.item.id, rec)
      }
      setRecommendations(map)
      showToast(`${map.size} items recommended by AI`)
    } catch (err) {
      console.error(err)
      showToast('Failed to get recommendations')
    } finally {
      setLoadingRecommend(false)
    }
  }, [filteredItems, purpose, audience, showToast])

  const handleAutoSelect = useCallback(
    (n: number) => {
      const topItems = filteredItems.slice(0, n)
      const newIds = new Set(selectedIds)
      const newOrder = [...selectedOrder]
      for (const item of topItems) {
        newIds.add(item.id)
        if (!newOrder.includes(item.id)) {
          newOrder.push(item.id)
        }
      }
      setSelectedIds(newIds)
      setSelectedOrder(newOrder)
      showToast(`Auto-selected top ${topItems.length} items`)
    },
    [filteredItems, selectedIds, selectedOrder, showToast]
  )

  const handleExport = useCallback(async () => {
    if (selectedItems.length === 0) {
      showToast('No items selected')
      return
    }
    setLoadingExport(true)
    try {
      const res = await fetch('/api/content-curator/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: collectionName || `${purpose} collection`,
          purpose,
          items: selectedItems,
        }),
      })
      if (!res.ok) throw new Error('Failed to export')
      const data = await res.json()
      const collection: ContentCollection = data.collection
      setSavedCollections((prev) => [...prev, collection])
      // Also save to localStorage
      try {
        const existing = JSON.parse(
          localStorage.getItem('picc-content-collections') || '[]'
        )
        existing.push(collection)
        localStorage.setItem(
          'picc-content-collections',
          JSON.stringify(existing)
        )
      } catch {
        // localStorage may be unavailable
      }
      showToast(`Collection "${collection.name}" saved`)
    } catch (err) {
      console.error(err)
      showToast('Failed to export collection')
    } finally {
      setLoadingExport(false)
    }
  }, [selectedItems, collectionName, purpose, showToast])

  const loadCollection = useCallback(
    (collection: ContentCollection) => {
      const ids = new Set(collection.items.map((i) => i.id))
      setSelectedIds(ids)
      setSelectedOrder(collection.items.map((i) => i.id))
      setCollectionName(collection.name)
      setPurpose(collection.purpose)
      showToast(`Loaded "${collection.name}"`)
    },
    [showToast]
  )

  // Load saved collections from localStorage on mount
  useState(() => {
    try {
      const stored = localStorage.getItem('picc-content-collections')
      if (stored) {
        setSavedCollections(JSON.parse(stored))
      }
    } catch {
      // ignore
    }
  })

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Header */}
      <div className="bg-stone-900 text-white px-6 py-5">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Content Curator
            </h1>
            <p className="text-stone-400 text-sm mt-1">
              Browse, curate, and package content for any purpose
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-stone-400">Purpose:</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="rounded-xl bg-stone-800 border border-stone-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-picc-ochre"
            >
              {PURPOSES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-white border-b border-stone-200 px-6 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center gap-4 flex-wrap">
          {/* Type toggles */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            {(Object.keys(TYPE_CONFIG) as ContentType[]).map((type) => {
              const cfg = TYPE_CONFIG[type]
              const Icon = cfg.icon
              const active = activeTypes.has(type)
              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? cfg.color
                      : 'bg-stone-100 text-stone-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cfg.label}
                </button>
              )
            })}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-[360px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search content..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-picc-ochre focus:border-transparent"
            />
          </div>

          {/* Audience */}
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="rounded-xl border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-picc-ochre"
          >
            {AUDIENCES.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>

          {/* AI Recommend */}
          <button
            onClick={handleRecommend}
            disabled={loadingRecommend}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loadingRecommend ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Get AI Recommendations
          </button>

          {/* Auto-select */}
          <button
            onClick={() => handleAutoSelect(10)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-sm font-medium transition-colors"
          >
            <Zap className="w-4 h-4" />
            Auto-Select Top 10
          </button>
        </div>
      </div>

      {/* Main split view */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Left panel — available content */}
          <div className="flex-[3] min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-stone-800">
                Available Content
                <span className="text-stone-400 font-normal ml-2 text-sm">
                  ({filteredItems.length} items)
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => {
                const isSelected = selectedIds.has(item.id)
                const rec = recommendations.get(item.id)
                const cfg = TYPE_CONFIG[item.type]
                const Icon = cfg.icon

                return (
                  <button
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
                    className={`group relative text-left rounded-2xl border-2 transition-all hover:shadow-md ${
                      isSelected
                        ? 'border-picc-ochre bg-amber-50/50 shadow-sm'
                        : rec
                        ? 'border-amber-400 bg-white shadow-sm'
                        : 'border-stone-200 bg-white'
                    }`}
                  >
                    {/* Image thumbnail */}
                    {item.imageUrl && item.type !== 'video' && (
                      <div className="aspect-[16/10] overflow-hidden rounded-t-2xl bg-stone-100">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-3">
                      {/* Type badge + score */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}
                        >
                          <Icon className="w-3 h-3" />
                          {cfg.label.slice(0, -1)}
                        </span>
                        <span className="text-xs font-semibold text-stone-500">
                          {item.score}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-medium text-sm text-stone-800 leading-snug line-clamp-2">
                        {item.title}
                      </h3>

                      {/* Preview */}
                      <p className="text-xs text-stone-500 mt-1 line-clamp-3">
                        {item.preview || 'No preview available'}
                      </p>

                      {/* Author + date */}
                      {(item.author || item.date) && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-stone-400">
                          {item.author && <span>{item.author}</span>}
                          {item.date && (
                            <span>
                              {new Date(item.date).toLocaleDateString('en-AU', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                      )}

                      {/* AI recommendation reason */}
                      {rec && (
                        <div className="mt-2 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200">
                          <p className="text-xs text-amber-700 flex items-start gap-1">
                            <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {rec.reason}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Selected check */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-picc-ochre text-white flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-16 text-stone-400">
                <Filter className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  No content matches your filters. Try adjusting your search or
                  type toggles.
                </p>
              </div>
            )}
          </div>

          {/* Right panel — selected content */}
          <div className="flex-[2] min-w-[320px]">
            <div className="sticky top-6">
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm">
                <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
                  <h2 className="font-semibold text-stone-800">
                    Selected
                    <span className="text-stone-400 font-normal ml-1">
                      ({selectedItems.length})
                    </span>
                  </h2>
                  {selectedItems.length > 0 && (
                    <button
                      onClick={clearSelection}
                      className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>

                {/* Type breakdown */}
                {selectedItems.length > 0 && (
                  <div className="px-4 py-2 border-b border-stone-100 flex flex-wrap gap-2">
                    {Object.entries(typeCounts).map(([type, count]) => {
                      const cfg = TYPE_CONFIG[type as ContentType]
                      return (
                        <span
                          key={type}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}
                        >
                          {count} {cfg.label}
                        </span>
                      )
                    })}
                  </div>
                )}

                {/* Selected items list */}
                <div className="max-h-[520px] overflow-y-auto">
                  {selectedItems.length === 0 ? (
                    <div className="px-4 py-10 text-center text-stone-400 text-sm">
                      Click content cards to select items
                    </div>
                  ) : (
                    <ul className="divide-y divide-stone-100">
                      {selectedItems.map((item, idx) => {
                        const cfg = TYPE_CONFIG[item.type]
                        const Icon = cfg.icon
                        return (
                          <li
                            key={item.id}
                            className="px-4 py-2.5 flex items-center gap-3 group hover:bg-stone-50"
                          >
                            <span className="text-xs text-stone-300 w-5 text-right font-mono">
                              {idx + 1}
                            </span>
                            <span
                              className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.color}`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-stone-700 truncate">
                                {item.title}
                              </p>
                              {item.author && (
                                <p className="text-xs text-stone-400 truncate">
                                  {item.author}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  moveItem(item.id, 'up')
                                }}
                                disabled={idx === 0}
                                className="p-1 rounded hover:bg-stone-200 disabled:opacity-30"
                              >
                                <ChevronUp className="w-3.5 h-3.5 text-stone-500" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  moveItem(item.id, 'down')
                                }}
                                disabled={idx === selectedItems.length - 1}
                                className="p-1 rounded hover:bg-stone-200 disabled:opacity-30"
                              >
                                <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeSelected(item.id)
                                }}
                                className="p-1 rounded hover:bg-red-100"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              </button>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>

                {/* Export section */}
                <div className="px-4 py-3 border-t border-stone-100 space-y-3">
                  <input
                    type="text"
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
                    placeholder="Collection name..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-picc-ochre focus:border-transparent"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleExport}
                      disabled={loadingExport || selectedItems.length === 0}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-picc-ochre hover:bg-picc-ochre/90 text-white text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {loadingExport ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save Collection
                    </button>
                    <button
                      onClick={() => {
                        const json = JSON.stringify(selectedItems, null, 2)
                        const blob = new Blob([json], {
                          type: 'application/json',
                        })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `${collectionName || 'collection'}.json`
                        a.click()
                        URL.revokeObjectURL(url)
                        showToast('Downloaded as JSON')
                      }}
                      disabled={selectedItems.length === 0}
                      className="px-3 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-sm transition-colors disabled:opacity-50"
                    >
                      <Download className="w-4 h-4 text-stone-500" />
                    </button>
                  </div>

                  {/* Load saved collections */}
                  {savedCollections.length > 0 && (
                    <div>
                      <label className="text-xs text-stone-400 block mb-1">
                        Load saved collection:
                      </label>
                      <select
                        onChange={(e) => {
                          const coll = savedCollections.find(
                            (c) => c.id === e.target.value
                          )
                          if (coll) loadCollection(coll)
                        }}
                        defaultValue=""
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-picc-ochre"
                      >
                        <option value="" disabled>
                          Select a collection...
                        </option>
                        {savedCollections.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.items.length} items)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-300">
          {toast}
        </div>
      )}
    </div>
  )
}
