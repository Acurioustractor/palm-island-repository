/**
 * /voices/ask — submit a question to the PICC team and the community.
 *
 * Lighter-weight flow than /share-voice (which is for stories /
 * recordings). Questions go into the same stories table with:
 *   story_type: 'community_story'
 *   category:   'question'
 *   is_public:  false  (admin reviews, then publishes the answer)
 *   metadata:   { is_question: true, question_status: 'open',
 *                 answer: null, asker_name?, anonymous? }
 *
 * Answered questions render publicly at /voices/questions.
 */
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Send, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react'

const QUESTION_TOPICS = [
  { value: 'general', label: 'General' },
  { value: 'services', label: 'PICC services' },
  { value: 'culture', label: 'Culture & Country' },
  { value: 'history', label: 'Palm Island history' },
  { value: 'governance', label: 'Governance & decisions' },
  { value: 'other', label: 'Something else' },
]

export default function AskQuestionPage() {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    question: '',
    topic: 'general',
    askerName: '',
    isAnonymous: true,
    consent: false,
  })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.question.trim() || form.question.trim().length < 10) {
      setError('Please ask a question of at least 10 characters.')
      return
    }
    if (!form.consent) {
      setError('Please confirm consent before submitting.')
      return
    }

    setSubmitting(true)
    try {
      const supabase = createClient()
      const trimmed = form.question.trim()

      const { error: insertError } = await supabase.from('stories').insert([
        {
          title: trimmed.slice(0, 80) + (trimmed.length > 80 ? '…' : ''),
          content: trimmed,
          story_type: 'community_story',
          category: 'question',
          status: 'submitted',
          access_level: 'community',
          is_public: false,
          metadata: {
            submission_type: 'question',
            is_question: true,
            question_status: 'open',
            answer: null,
            topic: form.topic,
            anonymous: form.isAnonymous,
            asker_name: form.isAnonymous ? null : form.askerName.trim() || null,
            consent_given: true,
          },
        },
      ])

      if (insertError) throw insertError
      setSubmitted(true)
    } catch (err: any) {
      setError(err?.message || 'Something went wrong submitting your question. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-warm-50 flex items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-picc-ochre mb-6" />
          <h1 className="font-fraunces text-3xl text-stone-800 mb-3">Question received.</h1>
          <p className="text-stone-600 leading-relaxed">
            The PICC team reviews community questions and answers each one publicly.
            You&rsquo;ll see your question (and the answer) appear on the questions page
            once it&rsquo;s been answered.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/voices/questions"
              className="px-5 py-2.5 rounded-full bg-picc-ochre text-white font-bold uppercase tracking-widest text-xs"
            >
              View answered questions
            </Link>
            <Link
              href="/voices"
              className="px-5 py-2.5 rounded-full border border-stone-300 text-stone-700 font-bold uppercase tracking-widest text-xs"
            >
              Back to voices
            </Link>
          </div>
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
            <HelpCircle className="w-10 h-10" />
            <h1 className="text-4xl font-bold font-serif">Ask a question</h1>
          </div>
          <p className="text-lg text-white/85 max-w-2xl">
            Wondering about something the community has been talking about? PICC
            services, culture, history, governance — ask anything. The PICC team
            reads every question, and answered ones become public so the next
            person finds their answer too.
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={onSubmit}
        className="max-w-3xl mx-auto px-6 sm:px-8 py-12 flex flex-col gap-6"
      >
        {/* Question */}
        <Field label="Your question" required>
          <textarea
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            placeholder="What would you like to ask?"
            className="w-full border border-stone-300 rounded px-3 py-3 bg-white min-h-[140px] text-base"
            maxLength={1000}
          />
          <p className="text-xs text-stone-500 mt-1">
            {form.question.length} / 1000 characters
          </p>
        </Field>

        {/* Topic */}
        <Field label="Topic">
          <select
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            className="w-full border border-stone-300 rounded px-3 py-2 bg-white"
          >
            {QUESTION_TOPICS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>

        {/* Anonymous toggle + name */}
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={form.isAnonymous}
              onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })}
              className="mt-1"
            />
            <div>
              <div className="font-bold text-stone-800">Ask anonymously</div>
              <p className="text-sm text-stone-600">
                Your question appears as &ldquo;Community member&rdquo; — no name attached.
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
                value={form.askerName}
                onChange={(e) => setForm({ ...form, askerName: e.target.value })}
                placeholder="How would you like to be credited?"
                className="w-full border border-stone-300 rounded px-3 py-2 bg-white"
                maxLength={80}
              />
            </div>
          )}
        </div>

        {/* Consent */}
        <label className="flex items-start gap-3 bg-white border border-stone-200 rounded p-4">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => setForm({ ...form, consent: e.target.checked })}
            className="mt-1"
          />
          <span className="text-sm text-stone-700 leading-relaxed">
            I&rsquo;m happy for my question to be published publicly alongside the
            answer. PICC may lightly edit for clarity. I understand answered
            questions will appear on the questions page.
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
          {submitting ? 'Submitting…' : 'Submit question'}
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
