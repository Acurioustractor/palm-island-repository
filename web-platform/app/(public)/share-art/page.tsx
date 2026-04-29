/**
 * /share-art — public submission for community-made artwork.
 *
 * Mirrors /share-voice but for visual contributions. Submitter uploads
 * an image, names what it is, optionally credits themselves, and gives
 * consent. Lands in PICC's media_files table with:
 *   media_type = 'artwork'
 *   page_context = 'community-art'
 *   is_public = false  (admin reviews before promoting)
 *   tags = ['community-art', 'submission']
 *
 * Admins review at /picc/design-system/submissions (not in this commit).
 */
'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Upload, CheckCircle, AlertCircle, Heart } from 'lucide-react'

const ART_TYPES = [
  { value: 'icon', label: 'Icon / symbol' },
  { value: 'drawing', label: 'Drawing' },
  { value: 'painting', label: 'Painting' },
  { value: 'photo-art', label: 'Photographic art' },
  { value: 'mixed-media', label: 'Mixed media' },
  { value: 'other', label: 'Other' },
]

export default function ShareArtPage() {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    artType: 'drawing',
    artistName: '',
    isAnonymous: false,
    relatedTo: '',
    consent: false,
  })
  const [file, setFile] = useState<File | null>(null)

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null
    setFile(f)
    if (f) {
      const reader = new FileReader()
      reader.onload = () => setPreviewUrl(reader.result as string)
      reader.readAsDataURL(f)
    } else {
      setPreviewUrl(null)
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!file) {
      setError('Please add an image of your artwork.')
      return
    }
    if (!form.title.trim()) {
      setError('Please give your artwork a title.')
      return
    }
    if (!form.consent) {
      setError('Please confirm consent before submitting.')
      return
    }

    setSubmitting(true)
    try {
      const supabase = createClient()

      // Storage upload — public bucket so the URL works without signed access
      const ext = file.name.split('.').pop() || 'png'
      const filename = `community-art/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('platform-media')
        .upload(filename, file, { upsert: false })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('platform-media').getPublicUrl(filename)
      const publicUrl = urlData.publicUrl

      // Metadata row
      const artistDisplay = form.isAnonymous ? 'Anonymous' : form.artistName.trim() || 'Anonymous'
      const { error: insertError } = await supabase.from('media_files').insert({
        public_url: publicUrl,
        title: form.title.trim(),
        caption: form.description.trim() || null,
        alt_text: form.title.trim(),
        file_type: 'image',
        media_type: 'artwork',
        page_context: 'community-art',
        attribution: artistDisplay,
        is_featured: false,
        is_public: false,
        tags: ['community-art', 'submission', form.artType, ...(form.relatedTo ? [`related:${form.relatedTo}`] : [])],
        metadata: {
          submitted_via: 'share-art',
          art_type: form.artType,
          related_to: form.relatedTo || null,
          consent_given: true,
        },
      })
      if (insertError) throw insertError

      setSubmitted(true)
    } catch (err: any) {
      setError(err?.message || 'Something went wrong submitting your artwork. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-warm-50 flex items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-picc-ochre mb-6" />
          <h1 className="font-fraunces text-3xl text-stone-800 mb-3">Thank you for sharing.</h1>
          <p className="text-stone-600 leading-relaxed">
            Your artwork has been received. The PICC design team reviews community
            submissions and will be in touch if it&apos;s selected for use across the
            platform.
          </p>
          <a
            href="/voices"
            className="inline-block mt-8 text-sm font-bold uppercase tracking-widest text-picc-ochre hover:underline"
          >
            ← Back to voices
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-warm-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-picc-earth to-picc-earth-700 text-white py-16">
        <div className="max-w-3xl mx-auto px-6 sm:px-8">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="w-10 h-10" />
            <h1 className="text-4xl font-bold font-serif">Share your artwork</h1>
          </div>
          <p className="text-lg text-white/85 max-w-2xl">
            Drawings, icons, paintings, photographic art — bespoke pieces from Palm
            Island community members shape the visual language of PICC. Submit yours,
            and if approved, it carries through services and projects across the platform.
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={onSubmit}
        className="max-w-3xl mx-auto px-6 sm:px-8 py-12 flex flex-col gap-6"
      >
        {/* Image upload */}
        <Field label="Artwork image" required>
          <label className="border-2 border-dashed border-stone-300 rounded-md p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-picc-ochre bg-white transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="preview" className="max-h-64 rounded" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-stone-400" />
                <span className="text-sm text-stone-600">Click to choose an image</span>
                <span className="text-xs text-stone-400">PNG, JPG, or WEBP · up to 10MB</span>
              </>
            )}
            {file && (
              <span className="text-xs text-picc-ochre">{file.name}</span>
            )}
          </label>
        </Field>

        {/* Title */}
        <Field label="Title" required>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="What is this piece?"
            className="w-full border border-stone-300 rounded px-3 py-2 bg-white"
            maxLength={120}
          />
        </Field>

        {/* Description */}
        <Field label="Description (optional)">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Tell us about the piece — meaning, story, who or what it represents."
            className="w-full border border-stone-300 rounded px-3 py-2 bg-white min-h-[120px]"
            maxLength={1000}
          />
        </Field>

        {/* Type */}
        <Field label="Art type">
          <select
            value={form.artType}
            onChange={(e) => setForm({ ...form, artType: e.target.value })}
            className="w-full border border-stone-300 rounded px-3 py-2 bg-white"
          >
            {ART_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>

        {/* Related to */}
        <Field label="Related to a service or project (optional)">
          <input
            type="text"
            value={form.relatedTo}
            onChange={(e) => setForm({ ...form, relatedTo: e.target.value })}
            placeholder="e.g. bwgcolman-way, elders-on-country, 1000-days"
            className="w-full border border-stone-300 rounded px-3 py-2 bg-white"
            maxLength={80}
          />
        </Field>

        {/* Artist name */}
        <Field label="Artist name (optional)">
          <input
            type="text"
            value={form.artistName}
            onChange={(e) => setForm({ ...form, artistName: e.target.value })}
            placeholder="How would you like to be credited?"
            disabled={form.isAnonymous}
            className="w-full border border-stone-300 rounded px-3 py-2 bg-white disabled:bg-stone-100 disabled:text-stone-400"
            maxLength={80}
          />
          <label className="flex items-center gap-2 mt-2 text-sm text-stone-600">
            <input
              type="checkbox"
              checked={form.isAnonymous}
              onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })}
            />
            Submit anonymously
          </label>
        </Field>

        {/* Consent */}
        <label className="flex items-start gap-3 bg-white border border-stone-200 rounded p-4">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => setForm({ ...form, consent: e.target.checked })}
            className="mt-1"
          />
          <span className="text-sm text-stone-700 leading-relaxed">
            I confirm I made this artwork (or have permission to share it) and grant
            PICC consent to review, display, and reproduce it across the PICC platform
            with credit. I understand my submission will be reviewed before any
            public use.
          </span>
        </label>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="bg-picc-ochre text-white px-6 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-2 self-start"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Submitting…' : 'Submit artwork'}
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
