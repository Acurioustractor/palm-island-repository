'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { X, Search, Loader2, Image as ImageIcon, Film } from 'lucide-react'

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
  metadata?: any
}

export type MediaPickerKind = 'image' | 'video'

type Props = {
  open: boolean
  kind: MediaPickerKind
  onClose: () => void
  onPick: (media: MediaFile) => void
}

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ')
}

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
  return (
    getVimeoThumbFromMeta(item.metadata) ||
    getYoutubeThumb(url) ||
    null
  )
}

export default function MediaPickerDialog({ open, kind, onClose, onPick }: Props) {
  const [items, setItems] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const title = kind === 'image' ? 'Choose a photo' : 'Choose a video'
  const icon = kind === 'image' ? <ImageIcon className="w-5 h-5" /> : <Film className="w-5 h-5" />

  const url = useMemo(() => {
    const params = new URLSearchParams()
    params.set('limit', '60')
    params.set('offset', '0')
    params.set('fileType', kind)
    const q = query.trim()
    if (q) params.set('q', q)
    return `/api/media/list?${params.toString()}`
  }, [kind, query])

  useEffect(() => {
    if (!open) return
    setItems([])
    setError(null)
    setQuery('')
  }, [open, kind])

  useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

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
      } catch (e: any) {
        if (String(e?.name || '') === 'AbortError') return
        setError(e?.message || 'Failed to load media')
        setItems([])
      } finally {
        setLoading(false)
        clearTimeout(timeout)
      }
    }, query.trim() ? 350 : 0) // debounce typing

    return () => {
      clearTimeout(handle)
      clearTimeout(timeout)
      controller.abort()
    }
  }, [open, url, query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                {icon}
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{title}</div>
                <div className="text-xs text-gray-500">
                  Browse your repository,{' '}
                  <Link href="/picc/media/gallery" className="text-picc-red hover:underline" target="_blank" rel="noreferrer">
                    Media Gallery
                  </Link>
                  , or{' '}
                  <Link href="/picc/media/upload" className="text-picc-red hover:underline" target="_blank" rel="noreferrer">
                    upload new media
                  </Link>
                  .
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

          <div className="px-5 py-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={kind === 'image' ? 'Search photos...' : 'Search videos...'}
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-picc-red focus:border-transparent"
              />
            </div>
          </div>

          <div className="max-h-[70vh] overflow-auto p-5">
            {loading ? (
              <div className="py-16 text-center text-gray-600">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
                Loading…
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <div className="text-sm font-semibold text-gray-900 mb-2">Couldn’t load media</div>
                <div className="text-sm text-gray-600 mb-4">{error}</div>
                <div className="text-xs text-gray-500">
                  If you’re not signed in, this works on localhost dev only. You can also open{' '}
                  <Link href="/picc/media/gallery" className="text-picc-red hover:underline" target="_blank" rel="noreferrer">
                    `/picc/media/gallery`
                  </Link>
                  .
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="py-12 text-center text-gray-600">No media found.</div>
            ) : kind === 'image' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {items.map((m) => {
                  const alt = (m.alt_text || m.title || m.original_filename || 'Photo') ?? 'Photo'
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => onPick(m)}
                      className="group text-left rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-warm-200 transition-all bg-white"
                      title={String(alt)}
                    >
                      <div className="aspect-square bg-gray-100 overflow-hidden">
                        <img src={m.public_url} alt={String(alt)} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" />
                      </div>
                      <div className="p-2">
                        <div className="text-xs font-medium text-gray-900 line-clamp-2">
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
                      className={classNames(
                        'group w-full text-left rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-warm-200 transition-all bg-white',
                        'flex gap-3 p-3'
                      )}
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
        </div>
      </div>
    </div>
  )
}
