'use client'

import { useEffect, useMemo, useState } from 'react'
import { Image as ImageIcon, Map as MapIcon, Plus, X } from 'lucide-react'

type MediaRow = {
  id: string
  public_url: string
  title?: string | null
  caption?: string | null
  alt_text?: string | null
  tags?: string[] | null
  file_type?: string | null
}

export default function LiveReportEditor(props: {
  enabled: boolean
  reportYear: number
  fiscalYear: string
  heroImage: string | null
  mapImage: string | null
  boardImages: Array<{ id: string; public_url: string }>
}) {
  const { enabled, reportYear, fiscalYear, heroImage, mapImage, boardImages } = props

  const [panelOpen, setPanelOpen] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [picker, setPicker] = useState<{
    open: boolean
    mode: 'hero' | 'map' | 'board'
    q: string
    loading: boolean
    results: MediaRow[]
  }>({ open: false, mode: 'hero', q: '', loading: false, results: [] })

  const tagsForFY = useMemo(() => ['annual-report', `fy:${fiscalYear}`], [fiscalYear])

  useEffect(() => {
    if (!picker.open) return
    let cancelled = false
    ;(async () => {
      setPicker((p) => ({ ...p, loading: true }))
      try {
        const params = new URLSearchParams()
        params.set('fileType', 'image')
        params.set('limit', '60')
        if (picker.q.trim()) params.set('q', picker.q.trim())
        const res = await fetch(`/api/media/search?${params.toString()}`, { cache: 'no-store' })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json?.error || 'Failed to search media')
        if (cancelled) return
        setPicker((p) => ({ ...p, results: (json.data || []) as MediaRow[] }))
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to search media')
      } finally {
        if (!cancelled) setPicker((p) => ({ ...p, loading: false }))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [picker.open, picker.q])

  if (!enabled) return null

  const closePicker = () => setPicker((p) => ({ ...p, open: false, q: '', results: [] }))

  const setFeatured = async (mediaId: string, pageSection: 'hero' | 'map') => {
    setBusy('Saving…')
    setError(null)
    try {
      const res = await fetch('/api/media/feature', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          mediaId,
          pageContext: 'annual-report',
          pageSection,
          fileType: 'image',
          addTags: tagsForFY,
          mergeContextMetadata: { report_year: reportYear, fiscal_year: fiscalYear },
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to update featured media')
      window.location.reload()
    } catch (e: any) {
      setError(e?.message || 'Failed to update featured media')
    } finally {
      setBusy(null)
    }
  }

  const addBoardImage = async (mediaId: string) => {
    setBusy('Adding…')
    setError(null)
    try {
      const res = await fetch('/api/media/bulk', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          mediaIds: [mediaId],
          addTags: ['board', ...tagsForFY],
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to tag board image')
      window.location.reload()
    } catch (e: any) {
      setError(e?.message || 'Failed to tag board image')
    } finally {
      setBusy(null)
    }
  }

  const removeBoardImage = async (mediaId: string) => {
    setBusy('Removing…')
    setError(null)
    try {
      const res = await fetch('/api/media/bulk', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          mediaIds: [mediaId],
          removeTags: ['board'],
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to remove board tag')
      window.location.reload()
    } catch (e: any) {
      setError(e?.message || 'Failed to remove board tag')
    } finally {
      setBusy(null)
    }
  }

  const onPick = async (m: MediaRow) => {
    if (!m?.id) return
    if (picker.mode === 'hero') return setFeatured(m.id, 'hero')
    if (picker.mode === 'map') return setFeatured(m.id, 'map')
    return addBoardImage(m.id)
  }

  return (
    <div className="fixed bottom-4 right-4 z-[60] print:hidden">
      {panelOpen ? (
        <div className="w-[360px] rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900">Edit mode</div>
              <div className="text-xs text-gray-500">Annual Report {fiscalYear}</div>
            </div>
            <button
              onClick={() => setPanelOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label="Close editor"
            >
              <X className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          {error && <div className="px-4 py-2 text-sm text-red-700 bg-red-50 border-b border-red-100">{error}</div>}

          <div className="p-4 space-y-4">
            <div className="rounded-xl border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Hero image
                </div>
                <button
                  onClick={() => setPicker({ open: true, mode: 'hero', q: '', loading: false, results: [] })}
                  className="text-sm text-picc-red hover:text-picc-red"
                  disabled={Boolean(busy)}
                >
                  Change
                </button>
              </div>
              {heroImage ? (
                <img src={heroImage} alt="" className="w-full h-28 object-cover rounded-lg border border-gray-100" />
              ) : (
                <div className="w-full h-28 rounded-lg bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center text-sm text-gray-500">
                  No hero image set
                </div>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <MapIcon className="w-4 h-4" /> Map image
                </div>
                <button
                  onClick={() => setPicker({ open: true, mode: 'map', q: '', loading: false, results: [] })}
                  className="text-sm text-picc-red hover:text-picc-red"
                  disabled={Boolean(busy)}
                >
                  Change
                </button>
              </div>
              {mapImage ? (
                <img src={mapImage} alt="" className="w-full h-28 object-cover rounded-lg border border-gray-100" />
              ) : (
                <div className="w-full h-28 rounded-lg bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center text-sm text-gray-500">
                  No map image set
                </div>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-gray-900">Board gallery</div>
                <button
                  onClick={() => setPicker({ open: true, mode: 'board', q: '', loading: false, results: [] })}
                  className="inline-flex items-center gap-1 text-sm text-picc-red hover:text-picc-red"
                  disabled={Boolean(busy)}
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              {boardImages.length === 0 ? (
                <div className="text-sm text-gray-600">No board images tagged yet.</div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {boardImages.slice(0, 9).map((b) => (
                    <button
                      key={b.id}
                      onClick={() => removeBoardImage(b.id)}
                      className="relative group"
                      title="Remove from board gallery"
                      disabled={Boolean(busy)}
                    >
                      <img src={b.public_url} alt="" className="w-full h-16 object-cover rounded-lg border border-gray-100" />
                      <div className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/40 transition-colors" />
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                          <X className="w-4 h-4 text-gray-800" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-2 text-xs text-gray-500">
                Uses tags <code className="bg-gray-100 px-1 rounded">board</code>,{' '}
                <code className="bg-gray-100 px-1 rounded">annual-report</code>,{' '}
                <code className="bg-gray-100 px-1 rounded">fy:{fiscalYear}</code>
              </div>
            </div>

            {busy && <div className="text-sm text-gray-600">{busy}</div>}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setPanelOpen(true)}
          className="px-4 py-2 rounded-full bg-gray-900 text-white shadow-lg hover:bg-gray-800"
        >
          Edit report
        </button>
      )}

      {picker.open && (
        <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden border border-gray-200 shadow-2xl">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-3">
              <div className="font-semibold text-gray-900">
                Pick an image ({picker.mode === 'hero' ? 'Hero' : picker.mode === 'map' ? 'Map' : 'Board'})
              </div>
              <button onClick={closePicker} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Close picker">
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            <div className="p-4 border-b border-gray-200">
              <input
                value={picker.q}
                onChange={(e) => setPicker((p) => ({ ...p, q: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red"
                placeholder="Search by title/caption…"
              />
              <div className="text-xs text-gray-500 mt-2">
                Tip: search “board”, “elders”, “storm”, “photo studio”, or a person’s name.
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[60vh]">
              {picker.loading ? (
                <div className="text-gray-600">Loading…</div>
              ) : picker.results.length === 0 ? (
                <div className="text-gray-600">No results.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {picker.results.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => onPick(m)}
                      className="text-left rounded-xl border border-gray-200 overflow-hidden hover:border-picc-red-300 hover:shadow-sm transition-all"
                      title={m.title || m.caption || m.alt_text || ''}
                    >
                      <img src={m.public_url} alt="" className="w-full h-28 object-cover bg-gray-50" />
                      <div className="p-2">
                        <div className="text-xs font-medium text-gray-900 truncate">{m.title || m.caption || 'Untitled'}</div>
                        <div className="text-[11px] text-gray-500 truncate">{m.file_type || 'image'}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

