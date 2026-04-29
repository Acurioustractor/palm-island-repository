'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { PoolVoice } from '@/lib/services/el-coverage'

export interface AlmanacVoice {
  id: string
  speaker_name: string
  speaker_role: string | null
  service_slug: string | null
  theme: string | null
  quote: string
  context: string | null
  consent_status: 'pending' | 'verbal' | 'signed' | 'declined'
  captured_by: string | null
  captured_at: string | null
  source: string | null
  el_storyteller_id: string | null
  photo_url: string | null
  status: 'draft' | 'review' | 'approved' | 'published' | 'declined'
  notes: string | null
  created_at: string
  updated_at: string
}

export interface VoiceContext {
  extracted_total: number
  extracted_ready: number
  elder_public: number
  visions_approved: number
}

const STATUS_COLOUR: Record<AlmanacVoice['status'], { bg: string; label: string }> = {
  draft:     { bg: 'bg-stone-200 text-stone-700',     label: '○ draft' },
  review:    { bg: 'bg-amber-200 text-amber-900',     label: '◐ review' },
  approved:  { bg: 'bg-emerald-200 text-emerald-900', label: '✓ approved' },
  published: { bg: 'bg-emerald-600 text-white',       label: '★ published' },
  declined:  { bg: 'bg-stone-300 text-stone-600',     label: '✗ declined' },
}

const CONSENT_COLOUR: Record<AlmanacVoice['consent_status'], { bg: string; label: string }> = {
  pending:  { bg: 'bg-stone-200 text-stone-700',     label: '◌ pending' },
  verbal:   { bg: 'bg-amber-200 text-amber-900',     label: '◐ verbal' },
  signed:   { bg: 'bg-emerald-200 text-emerald-900', label: '✓ signed' },
  declined: { bg: 'bg-red-200 text-red-900',         label: '✗ declined' },
}

type Filter = 'active' | 'all' | 'draft' | 'review' | 'approved' | 'published'

interface Props {
  voices: AlmanacVoice[]
  context: VoiceContext
  target: number
  services: { slug: string; name: string }[]
  pool: PoolVoice[]
}

export default function VoicesClient({ voices: initial, context, target, services, pool }: Props) {
  const [voices, setVoices] = useState<AlmanacVoice[]>(initial)
  const [filter, setFilter] = useState<Filter>('active')
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [showPool, setShowPool] = useState(false)
  const [poolService, setPoolService] = useState<string>('')
  const [poolSearch, setPoolSearch] = useState('')
  const [importing, setImporting] = useState<string | null>(null)
  const importedQuoteIds = useMemo(
    () => new Set(voices.map((v) => v.notes?.match(/quote ([0-9a-f-]+)/i)?.[1]).filter(Boolean) as string[]),
    [voices],
  )

  async function importFromPool(item: PoolVoice) {
    setImporting(item.id)
    try {
      const res = await fetch('/api/almanac/voices/import', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          el_quote_id: item.id,
          speaker_name: item.speaker_name,
          speaker_role: item.speaker_role,
          quote: item.quote,
          service_slug: item.service_slugs[0] ?? null,
          photo_url: item.photo_url,
          storyteller_id: item.storyteller_id,
        }),
      })
      if (res.ok) {
        const { voice } = await res.json()
        setVoices((prev) => [voice, ...prev])
      } else {
        const err = await res.json().catch(() => ({}))
        alert(`Import failed: ${err.error ?? res.statusText}`)
      }
    } finally {
      setImporting(null)
    }
  }

  // ── Mutations ──
  async function saveVoice(payload: Partial<AlmanacVoice>) {
    const res = await fetch('/api/almanac/voices', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      alert(`Save failed: ${err.error ?? res.statusText}`)
      return null
    }
    const { voice } = await res.json()
    setVoices((prev) => {
      const ix = prev.findIndex((v) => v.id === voice.id)
      if (ix >= 0) {
        const next = [...prev]
        next[ix] = voice
        return next
      }
      return [voice, ...prev]
    })
    return voice as AlmanacVoice
  }

  async function deleteVoice(id: string) {
    if (!confirm('Delete this voice? Cannot be undone.')) return
    const res = await fetch(`/api/almanac/voices/${id}`, { method: 'DELETE' })
    if (res.ok) setVoices((prev) => prev.filter((v) => v.id !== id))
  }

  async function patchStatus(id: string, status: AlmanacVoice['status']) {
    setVoices((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)))
    await saveVoice({ id, status })
  }

  async function patchConsent(id: string, consent_status: AlmanacVoice['consent_status']) {
    setVoices((prev) => prev.map((v) => (v.id === id ? { ...v, consent_status } : v)))
    await saveVoice({ id, consent_status })
  }

  // ── Derived ──
  const filtered = useMemo(() => {
    return voices.filter((v) => {
      if (filter === 'all') return true
      if (filter === 'active') return v.status !== 'declined' && v.status !== 'published'
      return v.status === filter
    })
  }, [voices, filter])

  const stats = useMemo(() => {
    const counted = voices.filter((v) => v.status !== 'declined').length
    const published = voices.filter((v) => v.status === 'published').length
    const approved = voices.filter((v) => v.status === 'approved').length
    const review = voices.filter((v) => v.status === 'review').length
    const draft = voices.filter((v) => v.status === 'draft').length
    const consentBlockers = voices.filter(
      (v) => v.status !== 'declined' && (v.consent_status === 'pending' || v.consent_status === 'verbal'),
    ).length
    const pct = Math.min(100, Math.round((counted / target) * 100))
    return { counted, published, approved, review, draft, consentBlockers, pct }
  }, [voices, target])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-2">
          Internal · Almanac · Voices
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-stone-800 italic mb-3">
          20-Voice Sprint
        </h1>
        <p className="text-stone-600 max-w-2xl leading-relaxed">
          Track every <em>new</em> voice captured for the 2024-25 almanac. Add as
          you capture, mark consent, push through draft → review → approved →
          published. Existing quote pools sit in the right column for reference.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* ── Main column ── */}
        <div className="space-y-6">
          {/* Progress card */}
          <div className="rounded-2xl border-2 border-stone-200 bg-stone-50 p-6">
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <div>
                <div className="text-xs font-semibold tracking-[0.2em] uppercase text-stone-500 mb-1">
                  Sprint progress
                </div>
                <div className="font-serif text-5xl text-stone-800 italic">
                  {stats.counted}<span className="text-2xl text-stone-500"> / {target}</span>
                </div>
              </div>
              <div className="flex gap-6 text-sm">
                <Stat label="Published" value={stats.published} tone="emerald" />
                <Stat label="Approved" value={stats.approved} tone="emerald" />
                <Stat label="Review" value={stats.review} tone="amber" />
                <Stat label="Draft" value={stats.draft} />
                <Stat
                  label="Consent open"
                  value={stats.consentBlockers}
                  tone={stats.consentBlockers ? 'red' : 'stone'}
                />
              </div>
            </div>
            <div className="mt-4 h-2 w-full rounded-full bg-stone-200 overflow-hidden">
              <div
                className={`h-full transition-all ${stats.pct >= 100 ? 'bg-emerald-500' : 'bg-picc-ochre'}`}
                style={{ width: `${stats.pct}%` }}
              />
            </div>
          </div>

          {/* Filter + Add */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              {(['active', 'all', 'draft', 'review', 'approved', 'published'] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-sm transition ${
                    filter === f ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {f === 'active' && '○ Active'}
                  {f === 'all' && '· All'}
                  {f === 'draft' && '○ Draft'}
                  {f === 'review' && '◐ Review'}
                  {f === 'approved' && '✓ Approved'}
                  {f === 'published' && '★ Published'}
                  {' '}({
                    f === 'active' ? voices.filter(v => v.status !== 'declined' && v.status !== 'published').length :
                    f === 'all' ? voices.length :
                    voices.filter(v => v.status === f).length
                  })
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPool(!showPool)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  showPool ? 'bg-stone-800 text-white' : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
                }`}
              >
                {showPool ? '× Hide' : '↓ Pull from EL'} ({pool.length})
              </button>
              <button
                onClick={() => setShowAdd(true)}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
              >
                + Add voice
              </button>
            </div>
          </div>

          {/* EL pool browser */}
          {showPool && (
            <PoolBrowser
              pool={pool}
              services={services}
              importedIds={importedQuoteIds}
              importing={importing}
              poolService={poolService}
              setPoolService={setPoolService}
              poolSearch={poolSearch}
              setPoolSearch={setPoolSearch}
              onImport={importFromPool}
            />
          )}

          {/* Add form */}
          {showAdd && (
            <VoiceForm
              services={services}
              onCancel={() => setShowAdd(false)}
              onSave={async (payload) => {
                const saved = await saveVoice(payload)
                if (saved) setShowAdd(false)
              }}
            />
          )}

          {/* List */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-stone-500 border-2 border-dashed border-stone-200 rounded-xl">
              {voices.length === 0
                ? 'No voices captured yet. Click "+ Add voice" to start the sprint.'
                : 'Nothing matches this filter.'}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((v) =>
                editing === v.id ? (
                  <VoiceForm
                    key={v.id}
                    services={services}
                    voice={v}
                    onCancel={() => setEditing(null)}
                    onSave={async (payload) => {
                      const saved = await saveVoice({ ...payload, id: v.id })
                      if (saved) setEditing(null)
                    }}
                  />
                ) : (
                  <VoiceRow
                    key={v.id}
                    voice={v}
                    services={services}
                    onEdit={() => setEditing(v.id)}
                    onDelete={() => deleteVoice(v.id)}
                    onStatus={(s) => patchStatus(v.id, s)}
                    onConsent={(c) => patchConsent(v.id, c)}
                  />
                ),
              )}
            </div>
          )}
        </div>

        {/* ── Sidebar: existing voice context ── */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="text-xs font-semibold tracking-[0.15em] uppercase text-stone-500 mb-3">
              Existing pools
            </div>
            <ContextRow label="Extracted quotes" total={context.extracted_total} ready={context.extracted_ready} note="ready = validated + suggested" />
            <ContextRow label="Elder quotes (public)" total={context.elder_public} />
            <ContextRow label="Community visions (approved)" total={context.visions_approved} />
            <p className="text-xs text-stone-500 mt-4 leading-relaxed">
              The 20-voice target is for <em>new</em> captures. Pull from these
              pools if filler is needed, but track new captures here so consent
              + sprint progress is auditable.
            </p>
          </div>

          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600 space-y-2">
            <div className="font-semibold text-stone-800">Quick links</div>
            <Link href="/picc/voices" className="block text-picc-ochre hover:underline">All voices →</Link>
            <Link href="/picc/almanac/checklist" className="block text-picc-ochre hover:underline">Pre-publish checklist →</Link>
            <Link href="/picc/almanac/photos" className="block text-picc-ochre hover:underline">Photo slots →</Link>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Stat({ label, value, tone = 'stone' }: { label: string; value: number; tone?: 'stone' | 'emerald' | 'red' | 'amber' }) {
  const colour =
    tone === 'emerald' ? 'text-emerald-700' :
    tone === 'red' ? 'text-red-700' :
    tone === 'amber' ? 'text-amber-700' :
    'text-stone-700'
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-stone-500">{label}</div>
      <div className={`text-2xl font-serif ${colour}`}>{value}</div>
    </div>
  )
}

function ContextRow({ label, total, ready, note }: { label: string; total: number; ready?: number; note?: string }) {
  return (
    <div className="py-2 border-b border-stone-100 last:border-0">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-stone-700">{label}</span>
        <span className="font-serif text-lg text-stone-800">{total}</span>
      </div>
      {ready !== undefined && (
        <div className="text-xs text-stone-500 mt-0.5">{ready} {note ?? 'ready'}</div>
      )}
    </div>
  )
}

interface RowProps {
  voice: AlmanacVoice
  services: { slug: string; name: string }[]
  onEdit: () => void
  onDelete: () => void
  onStatus: (s: AlmanacVoice['status']) => void
  onConsent: (c: AlmanacVoice['consent_status']) => void
}

function VoiceRow({ voice, services, onEdit, onDelete, onStatus, onConsent }: RowProps) {
  const serviceName = voice.service_slug
    ? services.find((s) => s.slug === voice.service_slug)?.name ?? voice.service_slug
    : null
  const dimmed = voice.status === 'declined'

  return (
    <div className={`rounded-lg border p-4 bg-white border-stone-200 ${dimmed ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap mb-1">
            <span className="font-serif text-lg text-stone-800">{voice.speaker_name}</span>
            {voice.speaker_role && <span className="text-sm text-stone-500">· {voice.speaker_role}</span>}
            {serviceName && (
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-900 border border-sky-200">
                {serviceName}
              </span>
            )}
            {voice.theme && (
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-100 text-violet-900 border border-violet-200">
                {voice.theme}
              </span>
            )}
          </div>
          <blockquote className="text-stone-700 italic border-l-2 border-stone-300 pl-3 mt-2">
            &ldquo;{voice.quote}&rdquo;
          </blockquote>
          {voice.context && (
            <p className="text-xs text-stone-500 mt-2 leading-relaxed">{voice.context}</p>
          )}
          <div className="flex gap-3 text-xs text-stone-500 mt-2 flex-wrap">
            {voice.captured_by && <span>Captured by {voice.captured_by}</span>}
            {voice.captured_at && <span>· {voice.captured_at}</span>}
            {voice.source && <span>· via {voice.source}</span>}
          </div>
          {voice.notes && (
            <div className="mt-2 text-xs bg-amber-50 border-l-2 border-amber-400 px-2 py-1 text-stone-700 italic">
              {voice.notes}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 items-end shrink-0">
          <select
            value={voice.status}
            onChange={(e) => onStatus(e.target.value as AlmanacVoice['status'])}
            className={`text-xs px-2 py-1.5 rounded border-0 cursor-pointer ${STATUS_COLOUR[voice.status].bg}`}
          >
            {(Object.keys(STATUS_COLOUR) as AlmanacVoice['status'][]).map((s) => (
              <option key={s} value={s}>{STATUS_COLOUR[s].label}</option>
            ))}
          </select>
          <select
            value={voice.consent_status}
            onChange={(e) => onConsent(e.target.value as AlmanacVoice['consent_status'])}
            className={`text-xs px-2 py-1.5 rounded border-0 cursor-pointer ${CONSENT_COLOUR[voice.consent_status].bg}`}
          >
            {(Object.keys(CONSENT_COLOUR) as AlmanacVoice['consent_status'][]).map((c) => (
              <option key={c} value={c}>Consent: {CONSENT_COLOUR[c].label}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button onClick={onEdit} className="text-xs text-stone-500 hover:text-stone-800">✎ Edit</button>
            <button onClick={onDelete} className="text-xs text-red-500 hover:text-red-700">🗑</button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface FormProps {
  voice?: AlmanacVoice
  services: { slug: string; name: string }[]
  onCancel: () => void
  onSave: (payload: Partial<AlmanacVoice>) => Promise<void>
}

function VoiceForm({ voice, services, onCancel, onSave }: FormProps) {
  const [draft, setDraft] = useState<Partial<AlmanacVoice>>(voice ?? {
    speaker_name: '',
    quote: '',
    consent_status: 'pending',
    status: 'draft',
  })
  const [saving, setSaving] = useState(false)

  return (
    <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50/50 p-5 space-y-3">
      <div className="text-xs font-semibold tracking-[0.15em] uppercase text-emerald-800">
        {voice ? 'Edit voice' : 'New voice'}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Speaker name *" required>
          <input
            value={draft.speaker_name ?? ''}
            onChange={(e) => setDraft({ ...draft, speaker_name: e.target.value })}
            className="w-full px-3 py-2 rounded border border-stone-300 bg-white text-sm"
          />
        </Field>
        <Field label="Role / title">
          <input
            value={draft.speaker_role ?? ''}
            onChange={(e) => setDraft({ ...draft, speaker_role: e.target.value })}
            placeholder="e.g. CFC Manager · Aged Care client · Elder"
            className="w-full px-3 py-2 rounded border border-stone-300 bg-white text-sm"
          />
        </Field>
        <Field label="Service">
          <select
            value={draft.service_slug ?? ''}
            onChange={(e) => setDraft({ ...draft, service_slug: e.target.value || null })}
            className="w-full px-3 py-2 rounded border border-stone-300 bg-white text-sm"
          >
            <option value="">— none —</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>{s.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Theme">
          <input
            value={draft.theme ?? ''}
            onChange={(e) => setDraft({ ...draft, theme: e.target.value })}
            placeholder="e.g. safety · culture · family · health"
            className="w-full px-3 py-2 rounded border border-stone-300 bg-white text-sm"
          />
        </Field>
      </div>

      <Field label="Quote *" required>
        <textarea
          value={draft.quote ?? ''}
          onChange={(e) => setDraft({ ...draft, quote: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 rounded border border-stone-300 bg-white text-sm"
        />
      </Field>

      <Field label="Context (longer story / why it matters)">
        <textarea
          value={draft.context ?? ''}
          onChange={(e) => setDraft({ ...draft, context: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 rounded border border-stone-300 bg-white text-sm"
        />
      </Field>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Field label="Captured by">
          <input
            value={draft.captured_by ?? ''}
            onChange={(e) => setDraft({ ...draft, captured_by: e.target.value })}
            className="w-full px-3 py-2 rounded border border-stone-300 bg-white text-sm"
          />
        </Field>
        <Field label="Captured at">
          <input
            type="date"
            value={draft.captured_at ?? ''}
            onChange={(e) => setDraft({ ...draft, captured_at: e.target.value })}
            className="w-full px-3 py-2 rounded border border-stone-300 bg-white text-sm"
          />
        </Field>
        <Field label="Source">
          <select
            value={draft.source ?? ''}
            onChange={(e) => setDraft({ ...draft, source: e.target.value || null })}
            className="w-full px-3 py-2 rounded border border-stone-300 bg-white text-sm"
          >
            <option value="">—</option>
            <option value="interview">Interview</option>
            <option value="workshop">Workshop</option>
            <option value="phone">Phone</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="Consent">
          <select
            value={draft.consent_status ?? 'pending'}
            onChange={(e) => setDraft({ ...draft, consent_status: e.target.value as AlmanacVoice['consent_status'] })}
            className="w-full px-3 py-2 rounded border border-stone-300 bg-white text-sm"
          >
            <option value="pending">◌ Pending</option>
            <option value="verbal">◐ Verbal</option>
            <option value="signed">✓ Signed</option>
            <option value="declined">✗ Declined</option>
          </select>
        </Field>
      </div>

      <Field label="Internal notes">
        <input
          value={draft.notes ?? ''}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          className="w-full px-3 py-2 rounded border border-stone-300 bg-white text-sm"
        />
      </Field>

      <div className="flex gap-2 pt-2">
        <button
          disabled={saving || !draft.speaker_name || !draft.quote}
          onClick={async () => {
            setSaving(true)
            await onSave(draft)
            setSaving(false)
          }}
          className="px-4 py-2 rounded bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : voice ? 'Save changes' : 'Add voice'}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded text-sm text-stone-600 hover:text-stone-900">
          Cancel
        </button>
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-stone-600 mb-1 block">
        {label}{required && <span className="text-red-600 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  )
}

interface PoolBrowserProps {
  pool: PoolVoice[]
  services: { slug: string; name: string }[]
  importedIds: Set<string>
  importing: string | null
  poolService: string
  setPoolService: (s: string) => void
  poolSearch: string
  setPoolSearch: (s: string) => void
  onImport: (item: PoolVoice) => void
}

function PoolBrowser({
  pool, services, importedIds, importing, poolService, setPoolService, poolSearch, setPoolSearch, onImport,
}: PoolBrowserProps) {
  const filtered = useMemo(() => {
    const q = poolSearch.toLowerCase().trim()
    return pool.filter((p) => {
      if (poolService && !p.service_slugs.includes(poolService)) return false
      if (!q) return true
      return (
        p.quote.toLowerCase().includes(q) ||
        p.speaker_name.toLowerCase().includes(q) ||
        (p.speaker_role ?? '').toLowerCase().includes(q)
      )
    })
  }, [pool, poolSearch, poolService])

  return (
    <div className="rounded-lg border-2 border-stone-300 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs font-semibold tracking-[0.15em] uppercase text-stone-700">
            Existing voices in EL v2
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            One click brings a quote into the sprint as <em>review</em> with consent <em>verbal</em>.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={poolService}
            onChange={(e) => setPoolService(e.target.value)}
            className="px-2 py-1.5 rounded border border-stone-300 bg-white text-xs"
          >
            <option value="">All services</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>{s.name}</option>
            ))}
          </select>
          <input
            value={poolSearch}
            onChange={(e) => setPoolSearch(e.target.value)}
            placeholder="Search quote / speaker…"
            className="px-2 py-1.5 rounded border border-stone-300 bg-white text-xs w-56"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-stone-500 text-sm">
          {pool.length === 0 ? 'No EL v2 voices available — check API connection.' : 'Nothing matches.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
          {filtered.map((p) => {
            const already = importedIds.has(p.id)
            return (
              <div key={p.id} className="rounded border border-stone-200 p-3 bg-stone-50/50">
                <div className="flex items-start gap-3">
                  {p.photo_url && (
                    <img src={p.photo_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-serif text-sm text-stone-800">{p.speaker_name}</div>
                    {p.speaker_role && <div className="text-[11px] text-stone-500">{p.speaker_role}</div>}
                  </div>
                </div>
                <blockquote className="text-sm text-stone-700 italic border-l-2 border-stone-300 pl-2 mt-2 line-clamp-4">
                  &ldquo;{p.quote}&rdquo;
                </blockquote>
                <div className="flex items-center justify-between mt-2 gap-2">
                  <div className="flex flex-wrap gap-1">
                    {p.service_slugs.slice(0, 3).map((slug) => (
                      <span key={slug} className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-900">
                        {services.find((s) => s.slug === slug)?.name ?? slug}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => onImport(p)}
                    disabled={already || importing === p.id}
                    className={`text-xs px-2 py-1 rounded ${
                      already
                        ? 'bg-stone-200 text-stone-500'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50'
                    }`}
                  >
                    {already ? '✓ imported' : importing === p.id ? '…' : '+ Import'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
