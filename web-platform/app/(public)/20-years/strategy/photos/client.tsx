'use client'

import { useState } from 'react'

const PILLARS = [
  { id: 'sovereign-story', name: 'Sovereign Story', short: 'Story', color: '#C8963E' },
  { id: 'culture-of-care', name: 'Culture of Care', short: 'Care', color: '#0B4F6C' },
  { id: 'elder-authority', name: 'Elder Authority', short: 'Elders', color: '#B85C38' },
  { id: 'next-generation', name: 'Next Generation', short: 'Youth', color: '#5F8F71' },
  { id: 'community-control', name: 'Community Control', short: 'Control', color: '#6B5D50' },
]

interface Photo {
  id: string
  url: string
  alt_text: string | null
  display_name: string | null
  original_filename: string | null
}

export default function PhotoPickerClient({
  photos,
  totalCount,
  currentPage,
  totalPages,
}: {
  photos: Photo[]
  totalCount: number
  currentPage: number
  totalPages: number
}) {
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')

  const filtered = search
    ? photos.filter(p =>
        (p.display_name || p.original_filename || p.alt_text || '')
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : photos

  function selectPhoto(pillarId: string, url: string) {
    setSelected(prev => ({ ...prev, [pillarId]: url }))
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-serif text-stone-800 mb-2">Strategy Photo Picker</h1>
        <p className="text-stone-500 mb-8">
          {totalCount} PICC photos from the Empathy Ledger · Page {currentPage + 1} of {totalPages}. Hover a photo, pick a pillar.
        </p>

        {/* Selected photos */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {PILLARS.map(p => (
            <div key={p.id} className="rounded-xl border-2 overflow-hidden" style={{ borderColor: p.color }}>
              {selected[p.id] ? (
                <img src={selected[p.id]} alt={p.name} className="w-full h-32 object-cover" />
              ) : (
                <div className="w-full h-32 bg-stone-100 flex items-center justify-center text-stone-300 text-sm">
                  No photo
                </div>
              )}
              <div className="p-2 text-center text-xs font-semibold" style={{ color: p.color }}>
                {p.name}
              </div>
            </div>
          ))}
        </div>

        {/* Output URLs */}
        {Object.keys(selected).length > 0 && (
          <div className="mb-8 p-4 bg-white rounded-xl border border-stone-200">
            <p className="text-xs font-bold text-stone-500 mb-2">Selected photo URLs:</p>
            <pre className="text-xs text-stone-600 whitespace-pre-wrap select-all">
              {JSON.stringify(selected, null, 2)}
            </pre>
          </div>
        )}

        {/* Search */}
        <input
          type="text"
          placeholder="Search photos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-stone-200 mb-4 text-sm"
        />

        {/* Photo grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map(photo => (
            <div key={photo.id} className="group relative">
              <img
                src={photo.url}
                alt={photo.alt_text || photo.display_name || ''}
                className="w-full h-36 object-cover rounded-lg"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 rounded-lg transition-all flex flex-col justify-end opacity-0 group-hover:opacity-100">
                <div className="p-2">
                  <p className="text-white text-[10px] truncate mb-1.5">
                    {photo.display_name || photo.original_filename || 'Untitled'}
                  </p>
                  <div className="flex gap-1 flex-wrap">
                    {PILLARS.map(p => (
                      <button
                        key={p.id}
                        onClick={() => selectPhoto(p.id, photo.url)}
                        className="text-[9px] px-2 py-1 rounded-full text-white font-medium hover:brightness-110 transition-all"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.short}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 mt-8">
          {currentPage > 0 && (
            <a
              href={`?page=${currentPage - 1}`}
              className="px-4 py-2 rounded-lg bg-stone-200 text-stone-700 text-sm hover:bg-stone-300"
            >
              ← Previous
            </a>
          )}
          <span className="text-sm text-stone-500">
            Showing {filtered.length} on this page · Page {currentPage + 1} of {totalPages}
          </span>
          {currentPage < totalPages - 1 && (
            <a
              href={`?page=${currentPage + 1}`}
              className="px-4 py-2 rounded-lg bg-stone-200 text-stone-700 text-sm hover:bg-stone-300"
            >
              Next →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
