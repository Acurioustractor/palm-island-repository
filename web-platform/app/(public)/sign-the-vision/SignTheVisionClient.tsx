'use client'

import { useState } from 'react'
import { C, SECTION_COLOURS } from '@/components/annual-report/2024-25/almanac/tokens'

interface ApprovedVision {
  id: string
  vision_text: string
  category: string
  author_name: string | null
  is_anonymous: boolean
}

interface Props {
  approved: ApprovedVision[]
  usingFallback: boolean
}

const CATEGORIES: Array<{ key: string; label: string; help: string }> = [
  { key: 'culture', label: 'Culture', help: 'Country, language, ceremony, story' },
  { key: 'youth', label: 'Youth', help: 'Children, schools, futures' },
  { key: 'services', label: 'Services', help: 'Health, family, justice, aged care' },
  { key: 'governance', label: 'Governance', help: 'Decision-making, community control' },
  { key: 'economic', label: 'Economic', help: 'Jobs, business, revenue staying on island' },
  { key: 'environment', label: 'Environment', help: 'Land, sea, climate' },
  { key: 'other', label: 'Other', help: 'Anything else that matters' },
]

function categoryColour(category: string): string {
  const map: Record<string, keyof typeof SECTION_COLOURS> = {
    services: 'all',
    culture: 'governance',
    youth: 'youth',
    economic: 'economic',
    environment: 'healthWellbeing',
    governance: 'governance',
    other: 'all',
  }
  return SECTION_COLOURS[map[category] ?? 'all']
}

export default function SignTheVisionClient({ approved, usingFallback }: Props) {
  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [category, setCategory] = useState<string>('other')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<{ id: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [endorseId, setEndorseId] = useState<string | null>(null)

  const charCount = text.length
  const maxLen = 600
  const minLen = 4
  const tooLong = charCount > maxLen

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (charCount < minLen) {
      setError(`Vision needs at least ${minLen} characters`)
      return
    }
    if (tooLong) {
      setError(`Keep it under ${maxLen} characters`)
      return
    }
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        vision_text: endorseId
          ? `Endorsing: ${text.trim()}`
          : text.trim(),
        category,
        is_anonymous: anonymous || !name.trim(),
        author_name: anonymous ? null : name.trim() || null,
        source: 'signing-canvas',
      }
      if (endorseId && !endorseId.startsWith('fallback-')) {
        payload.related_themes = [`endorses:${endorseId}`]
      }
      const res = await fetch('/api/community-visions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || `Submission failed (${res.status})`)
      }
      const data = await res.json()
      setSubmitted({ id: data.id })
      setText('')
      setName('')
      setEndorseId(null)
      setAnonymous(false)
    } catch (err: any) {
      setError(err?.message || 'Submission failed — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <section className="px-6 md:px-12 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-baseline justify-between mb-6">
            <h2
              className="font-fraunces font-bold"
              style={{ color: C.ocean, fontSize: 28 }}
            >
              Visions already on the canvas
            </h2>
            {usingFallback && (
              <span className="text-xs" style={{ color: C.driftwood }}>
                Showing the founding six — DB is empty.
              </span>
            )}
          </div>
          <p className="text-sm mb-6" style={{ color: C.driftwood }}>
            Tap any vision to add yours alongside it.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approved.map((v) => {
              const active = endorseId === v.id
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setEndorseId(active ? null : v.id)
                    setCategory(v.category || 'other')
                    if (!active) {
                      const el = document.getElementById('sign-form')
                      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }}
                  className="text-left p-5 rounded-md border transition"
                  style={{
                    borderColor: active ? categoryColour(v.category) : C.driftwood,
                    backgroundColor: active ? '#fff8e7' : '#fff',
                    boxShadow: active ? '0 2px 0 0 ' + categoryColour(v.category) : 'none',
                  }}
                >
                  <div
                    className="uppercase font-bold mb-2"
                    style={{
                      color: categoryColour(v.category),
                      fontSize: 10,
                      letterSpacing: '0.3em',
                    }}
                  >
                    {v.category}
                  </div>
                  <p
                    className="font-fraunces leading-snug"
                    style={{ color: C.ocean, fontSize: 18 }}
                  >
                    “{v.vision_text}”
                  </p>
                  <div className="mt-3 text-xs" style={{ color: C.driftwood }}>
                    {active ? 'Selected — your voice will be added alongside this.' : 'Tap to endorse'}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section id="sign-form" className="px-6 md:px-12 py-12" style={{ backgroundColor: C.shell }}>
        <div className="max-w-3xl mx-auto">
          <h2
            className="font-fraunces font-bold mb-2"
            style={{ color: C.ocean, fontSize: 32 }}
          >
            {endorseId ? 'Add your voice alongside this vision' : 'Share your vision'}
          </h2>
          <p className="text-sm mb-6" style={{ color: C.driftwood }}>
            {endorseId
              ? 'You can echo the vision in your own words, or add what you would change.'
              : 'What do you want for Palm Island in 20 years? One sentence is enough.'}
          </p>

          {submitted ? (
            <div
              className="p-6 rounded-md border-2"
              style={{ borderColor: C.mangrove, backgroundColor: '#fff' }}
            >
              <div
                className="uppercase font-bold mb-2"
                style={{ color: C.mangrove, fontSize: 11, letterSpacing: '0.3em' }}
              >
                Received
              </div>
              <h3 className="font-fraunces font-bold mb-2" style={{ color: C.ocean, fontSize: 24 }}>
                Thank you — your voice is on the canvas.
              </h3>
              <p className="text-sm mb-4" style={{ color: C.driftwood }}>
                Elders will review this contribution before it lights up
                publicly on the next-20 canvas. Reference: {submitted.id.slice(0, 8)}.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(null)}
                className="text-sm font-bold uppercase tracking-widest hover:opacity-80"
                style={{ color: C.turtleRed }}
              >
                Add another →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  className="block uppercase font-bold mb-2"
                  style={{ color: C.driftwood, fontSize: 11, letterSpacing: '0.3em' }}
                >
                  Your vision
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="In 20 years, Palm Island…"
                  rows={4}
                  className="w-full p-4 rounded-md border font-fraunces text-lg leading-relaxed focus:outline-none focus:ring-2"
                  style={{
                    borderColor: C.driftwood,
                    backgroundColor: '#fff',
                    color: C.ocean,
                  }}
                  maxLength={maxLen + 200}
                  required
                />
                <div className="mt-1 flex justify-between text-xs" style={{ color: tooLong ? C.coral : C.driftwood }}>
                  <span>{minLen}–{maxLen} characters</span>
                  <span>{charCount} / {maxLen}</span>
                </div>
              </div>

              <div>
                <label
                  className="block uppercase font-bold mb-2"
                  style={{ color: C.driftwood, fontSize: 11, letterSpacing: '0.3em' }}
                >
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => {
                    const sel = category === c.key
                    return (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => setCategory(c.key)}
                        title={c.help}
                        className="px-3 py-2 rounded-full border text-sm transition"
                        style={{
                          borderColor: sel ? categoryColour(c.key) : C.driftwood,
                          backgroundColor: sel ? categoryColour(c.key) : '#fff',
                          color: sel ? '#fff' : C.ocean,
                          fontWeight: sel ? 600 : 400,
                        }}
                      >
                        {c.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block uppercase font-bold mb-2"
                    style={{ color: C.driftwood, fontSize: 11, letterSpacing: '0.3em' }}
                  >
                    Your name (optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={anonymous}
                    placeholder="e.g. Rachel Atkinson"
                    className="w-full p-3 rounded-md border focus:outline-none focus:ring-2"
                    style={{
                      borderColor: C.driftwood,
                      backgroundColor: anonymous ? '#f5f5f5' : '#fff',
                      color: C.ocean,
                    }}
                    maxLength={120}
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 text-sm cursor-pointer" style={{ color: C.ocean }}>
                    <input
                      type="checkbox"
                      checked={anonymous}
                      onChange={(e) => setAnonymous(e.target.checked)}
                      className="w-5 h-5"
                    />
                    Sign anonymously
                  </label>
                </div>
              </div>

              {error && (
                <div
                  className="p-3 rounded-md text-sm"
                  style={{ backgroundColor: '#fef2f2', color: C.coral }}
                >
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                {endorseId && (
                  <button
                    type="button"
                    onClick={() => setEndorseId(null)}
                    className="text-sm font-bold uppercase tracking-widest hover:opacity-80"
                    style={{ color: C.driftwood }}
                  >
                    ← Stop endorsing
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting || charCount < minLen || tooLong}
                  className="ml-auto px-8 py-3 rounded-md font-bold uppercase tracking-widest transition disabled:opacity-50"
                  style={{
                    backgroundColor: C.ocean,
                    color: '#fff',
                    fontSize: 13,
                    letterSpacing: '0.2em',
                  }}
                >
                  {submitting ? 'Sending…' : 'Sign the vision'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
