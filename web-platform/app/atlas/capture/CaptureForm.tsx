'use client'

import { useState } from 'react'
import { Loader2, Check, AlertCircle } from 'lucide-react'

type Kind = 'text' | 'voice' | 'photo' | 'youth-art' | 'elder'
type Role = 'community' | 'youth' | 'elder' | 'anonymous'

interface KindOption {
  key: Kind
  label: string
  hint: string
  enabled: boolean
}

const KINDS: ReadonlyArray<KindOption> = [
  { key: 'text', label: 'A thought', hint: 'Words, a memory, a reflection.', enabled: true },
  { key: 'elder', label: 'Elder knowledge', hint: 'Priority review queue.', enabled: true },
  { key: 'youth-art', label: 'Youth voice / art', hint: 'Requires parent/Elder co-sign.', enabled: true },
  { key: 'voice', label: 'Voice note', hint: 'Recording — coming Stage 4.5.', enabled: false },
  { key: 'photo', label: 'Photo', hint: 'Upload — coming Stage 4.5.', enabled: false },
]

const ROLES: ReadonlyArray<{ key: Role; label: string }> = [
  { key: 'anonymous', label: 'Prefer not to say' },
  { key: 'community', label: 'Community member' },
  { key: 'youth', label: 'Young person' },
  { key: 'elder', label: 'Elder' },
]

export default function CaptureForm() {
  const [kind, setKind] = useState<Kind>('text')
  const [role, setRole] = useState<Role>('anonymous')
  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  )
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setError(null)
    try {
      const res = await fetch('/api/atlas/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          name: name.trim(),
          kind,
          contributor_role: role,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'submission failed')
      setStatus('sent')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'submission failed')
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-xl border border-sage-200 bg-white p-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
          style={{ backgroundColor: '#E7EFE4' }}>
          <Check className="w-6 h-6" style={{ color: '#2D5F4F' }} />
        </div>
        <div className="font-serif text-lg text-charcoal mb-1">Thank you.</div>
        <p className="text-sm text-stone-700 leading-relaxed">
          Your contribution is now in the PICC review queue. A staff member
          or Elder will see it within a few days. If it&rsquo;s right for the
          Atlas, you&rsquo;ll see it appear after community approval.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus('idle')
            setText('')
            setName('')
          }}
          className="mt-4 text-xs underline text-sage-700"
        >
          Share another
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-stone-200 bg-white p-5 space-y-5"
    >
      {/* Kind selector */}
      <fieldset>
        <legend className="text-[11px] uppercase tracking-wide text-stone-500 font-semibold mb-2">
          What kind of contribution?
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {KINDS.map((k) => {
            const active = kind === k.key
            return (
              <button
                key={k.key}
                type="button"
                disabled={!k.enabled}
                onClick={() => setKind(k.key)}
                className="text-left rounded-md border px-3 py-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={
                  active
                    ? {
                        backgroundColor: '#E7EFE4',
                        borderColor: '#2D5F4F',
                        color: '#2D5F4F',
                      }
                    : { borderColor: '#E8E6E3', color: '#2C2C2C' }
                }
              >
                <div className="text-sm font-semibold">{k.label}</div>
                <div className="text-[10.5px] text-stone-600 mt-0.5">
                  {k.hint}
                </div>
              </button>
            )
          })}
        </div>
      </fieldset>

      {/* Text content */}
      <div>
        <label
          htmlFor="capture-text"
          className="block text-[11px] uppercase tracking-wide text-stone-500 font-semibold mb-1"
        >
          What do you want to share?
        </label>
        <textarea
          id="capture-text"
          required
          rows={5}
          maxLength={2500}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="A memory of growing up. A service that helped your family. A vision for the next 20 years. Anything."
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2"
          style={{ minHeight: 120 }}
        />
        <div className="text-[10.5px] text-stone-500 mt-1 text-right">
          {text.length} / 2500
        </div>
      </div>

      {/* Optional name + role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="capture-name"
            className="block text-[11px] uppercase tracking-wide text-stone-500 font-semibold mb-1"
          >
            Your name (optional)
          </label>
          <input
            id="capture-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Anonymous"
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="capture-role"
            className="block text-[11px] uppercase tracking-wide text-stone-500 font-semibold mb-1"
          >
            Your role
          </label>
          <select
            id="capture-role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm bg-white"
          >
            {ROLES.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cultural protocol note */}
      <div
        className="text-[11px] text-stone-700 leading-relaxed rounded-md p-3"
        style={{ backgroundColor: '#FBF6EE' }}
      >
        <strong>How review works:</strong> nothing publishes automatically.
        Elder contributions are prioritised. Youth submissions wait for a
        parent or Elder co-sign before they go live. If your contribution
        touches culturally restricted material, it stays in the archive
        but is not displayed on the public Atlas.
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] text-stone-500">
          By submitting, you consent to PICC reviewing and (if approved)
          displaying this contribution.
        </div>
        <button
          type="submit"
          disabled={status === 'sending' || text.trim().length === 0}
          className="rounded-md px-4 py-2 font-semibold text-white text-sm disabled:opacity-50 inline-flex items-center gap-1.5"
          style={{ backgroundColor: '#2D5F4F' }}
        >
          {status === 'sending' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {status === 'sending' ? 'Sending…' : 'Send to PICC review'}
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 inline-flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </form>
  )
}
