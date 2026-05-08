/**
 * DraftDescriptionButton — calls /api/admin/draft-description and
 * shows three brand-voice candidate descriptions for Narelle to copy.
 *
 * Used inline in the /picc/services/coverage and /picc/projects/coverage
 * action rows. Surfaces only when an entity has DRAFT-marked or thin
 * description (decision happens server-side in the page).
 */
'use client'

import { useState } from 'react'

interface Props {
  type: 'service' | 'project'
  slug: string
  name: string
}

export default function DraftDescriptionButton({ type, slug, name }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [candidates, setCandidates] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  async function generate() {
    setLoading(true)
    setError(null)
    setCandidates([])
    try {
      const res = await fetch('/api/admin/draft-description', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ type, slug }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setCandidates(data.candidates || [])
    } catch (e: any) {
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  async function copy(text: string, index: number) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true)
          if (candidates.length === 0 && !loading) generate()
        }}
        className="px-2.5 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap hover:opacity-90 transition"
        style={{
          borderColor: '#7C3AED',
          color: '#7C3AED',
          letterSpacing: '0.15em',
          backgroundColor: '#fff',
        }}
        title="AI-draft a brand-voice description"
      >
        ✨ Draft
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto"
            style={{ border: '1px solid #E8E6E3' }}
          >
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: '1px solid #E8E6E3', backgroundColor: '#F7F6F4' }}
            >
              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest" style={{ color: '#7C3AED', letterSpacing: '0.2em' }}>
                  Brand-voice draft · {type}
                </div>
                <div className="font-fraunces font-bold mt-1" style={{ color: '#0B4F6C', fontSize: 18 }}>
                  {name}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm px-3 py-1.5 rounded hover:bg-stone-100"
                style={{ color: '#6B6560' }}
              >
                Close
              </button>
            </div>

            <div className="p-6">
              {loading && (
                <div className="flex flex-col items-center py-12 gap-3">
                  <div
                    className="w-8 h-8 border-4 rounded-full animate-spin"
                    style={{ borderColor: '#7C3AED33', borderTopColor: '#7C3AED' }}
                  />
                  <p className="text-sm" style={{ color: '#6B6560' }}>
                    Drafting three Service-register options…
                  </p>
                </div>
              )}

              {error && (
                <div
                  className="p-4 rounded-md text-sm"
                  style={{ backgroundColor: '#FEE', color: '#8B1A1A', border: '1px solid #FCC' }}
                >
                  <strong>Error:</strong> {error}
                  <button
                    type="button"
                    onClick={generate}
                    className="ml-3 px-2 py-0.5 rounded font-bold underline"
                    style={{ color: '#8B1A1A' }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loading && candidates.length > 0 && (
                <div className="flex flex-col gap-4">
                  <p className="text-xs italic" style={{ color: '#6B6560' }}>
                    Three candidates in the Service register (per BRAND.md). Pick one, edit if needed, paste into EL admin.
                  </p>
                  {candidates.map((c, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-md"
                      style={{ backgroundColor: '#F7F6F4', border: '1px solid #E8E6E3' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className="text-[10px] uppercase font-bold tracking-widest"
                          style={{ color: '#0B4F6C', letterSpacing: '0.2em' }}
                        >
                          Option {i + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => copy(c, i)}
                          className="text-xs px-3 py-1 rounded font-bold uppercase tracking-widest"
                          style={{
                            backgroundColor: copiedIndex === i ? '#22C55E' : '#0B4F6C',
                            color: '#fff',
                            letterSpacing: '0.15em',
                          }}
                        >
                          {copiedIndex === i ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: '#2D2319' }}>
                        {c}
                      </p>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={generate}
                    className="self-end text-xs px-3 py-1.5 rounded font-bold uppercase tracking-widest border"
                    style={{ borderColor: '#7C3AED', color: '#7C3AED', letterSpacing: '0.15em' }}
                  >
                    Regenerate
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
