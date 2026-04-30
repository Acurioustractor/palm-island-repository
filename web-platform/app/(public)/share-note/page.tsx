/**
 * /share-note — public quick-capture for short observations.
 *
 * Lighter than /share-voice (no recording / no title required) and
 * lighter than /share-story (no narrative arc). Just a thought, a
 * reaction, an observation — short text + optional name + consent.
 *
 * Stored in stories with:
 *   story_type:   'community_story'
 *   category:     'note'
 *   is_public:    false  (admin reviews; published notes appear on
 *                          /voices/notes)
 *   metadata:     { submission_type: 'note', is_note: true,
 *                   anonymous, asker_name?, consent_given }
 */
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Send, CheckCircle, AlertCircle, StickyNote } from 'lucide-react'

export default function ShareNotePage() {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    note: '',
    yourName: '',
    isAnonymous: true,
    consent: false,
  })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const trimmed = form.note.trim()
    if (trimmed.length < 5) {
      setError('Just a few words is fine — at least 5 characters please.')
      return
    }
    if (!form.consent) {
      setError('Please confirm consent before submitting.')
      return
    }

    setSubmitting(true)
    try {
      const supabase = createClient()
      const titleSnippet = trimmed.slice(0, 60) + (trimmed.length > 60 ? '…' : '')
      const { error: insertError } = await supabase.from('stories').insert([
        {
          title: titleSnippet,
          content: trimmed,
          story_type: 'community_story',
          category: 'note',
          status: 'submitted',
          access_level: 'community',
          is_public: false,
          metadata: {
            submission_type: 'note',
            is_note: true,
            anonymous: form.isAnonymous,
            asker_name: form.isAnonymous ? null : form.yourName.trim() || null,
            consent_given: true,
          },
        },
      ])
      if (insertError) throw insertError
      setSubmitted(true)
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-warm-50 flex items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-picc-ochre mb-6" />
          <h1 className="font-fraunces text-3xl text-stone-800 mb-3">Thanks for the note.</h1>
          <p className="text-stone-600 leading-relaxed">
            Short and meaningful. The PICC team reads every note and the published
            ones surface on the voices page.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link
              href="/voices"
              className="px-5 py-2.5 rounded-full bg-picc-ochre text-white font-bold uppercase tracking-widest text-xs"
            >
              Back to voices
            </Link>
            <Link
              href="/share-note"
              className="px-5 py-2.5 rounded-full border border-stone-300 text-stone-700 font-bold uppercase tracking-widest text-xs"
              onClick={() => setSubmitted(false)}
            >
              Add another note
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-warm-50">
      <div className="bg-gradient-to-r from-picc-earth to-picc-earth-700 text-white py-16">
        <div className="max-w-3xl mx-auto px-6 sm:px-8">
          <div className="flex items-center gap-3 mb-3">
            <StickyNote className="w-10 h-10" />
            <h1 className="text-4xl font-bold font-serif">Leave a note</h1>
          </div>
          <p className="text-lg text-white/85 max-w-2xl">
            A thought, a reaction, an observation — anything you want to leave for
            the community without writing a whole story. Short is fine.
          </p>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="max-w-3xl mx-auto px-6 sm:px-8 py-12 flex flex-col gap-6"
      >
        <Field label="Your note" required>
          <textarea
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="A thought, a reaction, an observation…"
            rows={6}
            className="w-full border border-stone-300 rounded px-3 py-3 bg-white"
            maxLength={500}
          />
          <p className="text-xs text-stone-500 mt-1">{form.note.length} / 500</p>
        </Field>

        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={form.isAnonymous}
              onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })}
              className="mt-1"
            />
            <div>
              <div className="font-bold text-stone-800">Submit anonymously</div>
              <p className="text-sm text-stone-600">
                Appears as &ldquo;Community member&rdquo; — no name attached.
              </p>
            </div>
          </label>
          {!form.isAnonymous && (
            <div className="mt-4">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500 block mb-2">
                Your name
              </label>
              <input
                type="text"
                value={form.yourName}
                onChange={(e) => setForm({ ...form, yourName: e.target.value })}
                placeholder="How would you like to be credited?"
                className="w-full border border-stone-300 rounded px-3 py-2 bg-white"
                maxLength={80}
              />
            </div>
          )}
        </div>

        <label className="flex items-start gap-3 bg-white border border-stone-200 rounded p-4">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => setForm({ ...form, consent: e.target.checked })}
            className="mt-1"
          />
          <span className="text-sm text-stone-700 leading-relaxed">
            I&rsquo;m happy for my note to be reviewed by PICC and, if appropriate,
            published on the public voices page with credit (or anonymously).
          </span>
        </label>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="bg-picc-ochre text-white px-6 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-2 self-start"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Submitting…' : 'Leave note'}
        </button>
      </form>
    </main>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-widest text-stone-500">
        {label}
        {required && <span className="text-picc-red ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}
