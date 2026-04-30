'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Plus, Star, StarOff, Trash2, GripVertical, AlertCircle, Edit3, Save, X } from 'lucide-react'
import type { FeaturedTheme, ThemeUsage } from './page'

interface Props {
  initialFeatured: FeaturedTheme[]
  topThemes: ThemeUsage[]
}

export default function FeaturedThemesClient({ initialFeatured, topThemes }: Props) {
  const [featured, setFeatured] = useState(initialFeatured)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftTheme, setDraftTheme] = useState('')
  const [draftNote, setDraftNote] = useState('')
  const [draftFY, setDraftFY] = useState('')

  const featuredSet = new Set(featured.map((f) => f.theme))

  async function feature(theme: string, fiscalYear?: string, note?: string) {
    setBusy(true)
    setError(null)
    try {
      const supabase = createClient()
      const maxOrder = featured.reduce((m, f) => Math.max(m, f.display_order), 0)
      const { data, error: insertError } = await supabase
        .from('featured_themes')
        .insert({
          theme: theme.toLowerCase().trim(),
          curator_note: note?.trim() || null,
          display_order: maxOrder + 10,
          fiscal_year: fiscalYear?.trim() || null,
          is_active: true,
        })
        .select()
        .single()
      if (insertError) throw insertError
      setFeatured((prev) => [...prev, data as FeaturedTheme].sort((a, b) => a.display_order - b.display_order))
    } catch (err: any) {
      setError(err?.message || 'Failed to feature theme.')
    } finally {
      setBusy(false)
    }
  }

  async function toggleActive(id: string, current: boolean) {
    setBusy(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('featured_themes')
        .update({ is_active: !current })
        .eq('id', id)
      if (updateError) throw updateError
      setFeatured((prev) =>
        prev.map((f) => (f.id === id ? { ...f, is_active: !current } : f)),
      )
    } catch (err: any) {
      setError(err?.message || 'Failed to toggle.')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Remove this featured theme? The underlying quotes/theme stays.')) return
    setBusy(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error: delError } = await supabase
        .from('featured_themes')
        .delete()
        .eq('id', id)
      if (delError) throw delError
      setFeatured((prev) => prev.filter((f) => f.id !== id))
    } catch (err: any) {
      setError(err?.message || 'Failed to remove.')
    } finally {
      setBusy(false)
    }
  }

  function startEdit(f: FeaturedTheme) {
    setEditingId(f.id)
    setDraftTheme(f.theme)
    setDraftNote(f.curator_note || '')
    setDraftFY(f.fiscal_year || '')
  }

  function cancelEdit() {
    setEditingId(null)
    setDraftTheme('')
    setDraftNote('')
    setDraftFY('')
  }

  async function saveEdit(id: string) {
    setBusy(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('featured_themes')
        .update({
          theme: draftTheme.toLowerCase().trim(),
          curator_note: draftNote.trim() || null,
          fiscal_year: draftFY.trim() || null,
        })
        .eq('id', id)
      if (updateError) throw updateError
      setFeatured((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, theme: draftTheme.toLowerCase().trim(), curator_note: draftNote.trim() || null, fiscal_year: draftFY.trim() || null }
            : f,
        ),
      )
      cancelEdit()
    } catch (err: any) {
      setError(err?.message || 'Failed to save.')
    } finally {
      setBusy(false)
    }
  }

  async function move(id: string, direction: 'up' | 'down') {
    const idx = featured.findIndex((f) => f.id === id)
    if (idx === -1) return
    const swap = direction === 'up' ? idx - 1 : idx + 1
    if (swap < 0 || swap >= featured.length) return
    setBusy(true)
    try {
      const supabase = createClient()
      const a = featured[idx]
      const b = featured[swap]
      await Promise.all([
        supabase.from('featured_themes').update({ display_order: b.display_order }).eq('id', a.id),
        supabase.from('featured_themes').update({ display_order: a.display_order }).eq('id', b.id),
      ])
      const swapped = [...featured]
      swapped[idx] = { ...a, display_order: b.display_order }
      swapped[swap] = { ...b, display_order: a.display_order }
      setFeatured(swapped.sort((x, y) => x.display_order - y.display_order))
    } catch (err: any) {
      setError(err?.message || 'Failed to reorder.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-10">
        <div className="mb-8">
          <Link
            href="/picc"
            className="text-xs uppercase font-bold tracking-widest hover:opacity-80 text-stone-500"
          >
            ← Admin
          </Link>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mt-6 mb-2">
            Internal · Themes
          </p>
          <h1 className="font-fraunces text-3xl md:text-4xl text-stone-800 italic mb-3">
            Featured themes
          </h1>
          <p className="text-stone-600 max-w-2xl leading-relaxed">
            Lift specific themes to the top of{' '}
            <Link href="/voices/pulse" className="text-picc-ochre hover:underline">
              /voices/pulse
            </Link>{' '}
            with an optional curator note. The wider thematic aggregation stays
            real-time (every validated quote gets counted regardless). Featuring
            doesn&rsquo;t create themes — it editorially elevates them.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Featured list */}
        <section className="mb-10">
          <h2 className="font-fraunces text-xl text-stone-800 mb-4">
            Featured · {featured.length}
          </h2>
          {featured.length === 0 ? (
            <div className="rounded-md bg-amber-50 border border-amber-200 p-6 text-sm text-stone-700">
              No themes featured yet. Pick one from the suggestions below.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {featured.map((f, i) => {
                const editing = editingId === f.id
                return (
                  <article
                    key={f.id}
                    className="bg-white border border-stone-200 rounded-md p-4 flex flex-col gap-3"
                  >
                    {editing ? (
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-stone-500 block mb-1">Theme</label>
                            <input
                              type="text"
                              value={draftTheme}
                              onChange={(e) => setDraftTheme(e.target.value)}
                              className="w-full border border-stone-300 rounded px-3 py-2 text-sm bg-white"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-stone-500 block mb-1">Fiscal year</label>
                            <input
                              type="text"
                              value={draftFY}
                              onChange={(e) => setDraftFY(e.target.value)}
                              placeholder="2024-25 (or blank)"
                              className="w-full border border-stone-300 rounded px-3 py-2 text-sm bg-white"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase tracking-widest text-stone-500 block mb-1">Curator note</label>
                          <textarea
                            value={draftNote}
                            onChange={(e) => setDraftNote(e.target.value)}
                            rows={3}
                            placeholder="Why does this theme matter this period?"
                            className="w-full border border-stone-300 rounded px-3 py-2 text-sm bg-white"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(f.id)}
                            disabled={busy}
                            className="px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest bg-emerald-600 text-white hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            <Save className="w-3.5 h-3.5" />
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest bg-stone-200 text-stone-700 hover:bg-stone-300 inline-flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col gap-0.5 pt-1">
                            <button
                              onClick={() => move(f.id, 'up')}
                              disabled={busy || i === 0}
                              className="text-stone-400 hover:text-stone-700 disabled:opacity-30 text-xs"
                              aria-label="Move up"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => move(f.id, 'down')}
                              disabled={busy || i === featured.length - 1}
                              className="text-stone-400 hover:text-stone-700 disabled:opacity-30 text-xs"
                              aria-label="Move down"
                            >
                              ▼
                            </button>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${f.is_active ? 'bg-emerald-600 text-white' : 'bg-stone-300 text-stone-700'}`}>
                                {f.is_active ? '✓ active' : '◌ inactive'}
                              </span>
                              <h3 className="font-fraunces text-lg text-stone-800 capitalize">
                                {f.theme}
                              </h3>
                              {f.fiscal_year && (
                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-stone-100 text-stone-700">
                                  FY {f.fiscal_year}
                                </span>
                              )}
                            </div>
                            {f.curator_note && (
                              <p className="text-sm text-stone-600 leading-relaxed">
                                {f.curator_note}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleActive(f.id, f.is_active)}
                              disabled={busy}
                              className="p-1.5 rounded text-stone-500 hover:text-stone-800 hover:bg-stone-100"
                              aria-label={f.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {f.is_active ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => startEdit(f)}
                              className="p-1.5 rounded text-stone-500 hover:text-stone-800 hover:bg-stone-100"
                              aria-label="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => remove(f.id)}
                              disabled={busy}
                              className="p-1.5 rounded text-stone-500 hover:text-red-600 hover:bg-stone-100"
                              aria-label="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {/* Suggest from top themes */}
        <section>
          <h2 className="font-fraunces text-xl text-stone-800 mb-2">
            Top themes from validated quotes · {topThemes.length}
          </h2>
          <p className="text-sm text-stone-600 mb-4">
            Click a theme to feature it. Already-featured themes are filtered out.
          </p>
          <div className="flex flex-wrap gap-2">
            {topThemes
              .filter((t) => !featuredSet.has(t.theme))
              .map((t) => (
                <button
                  key={t.theme}
                  onClick={() => feature(t.theme)}
                  disabled={busy}
                  className="px-3 py-1.5 rounded-full border border-stone-300 bg-white text-sm capitalize hover:border-picc-ochre hover:bg-picc-ochre/5 inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3 h-3" />
                  {t.theme}
                  <span className="text-stone-400 text-xs">· {t.count}</span>
                </button>
              ))}
          </div>
        </section>
      </div>
    </main>
  )
}
