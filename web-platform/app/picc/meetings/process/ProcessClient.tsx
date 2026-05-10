'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft, Upload, Loader2, FileAudio, Sparkles, Save,
  CheckCircle, AlertTriangle, Lock, Plus, X,
} from 'lucide-react'

type Stage = 'idle' | 'transcribing' | 'analyzing' | 'editing' | 'submitting' | 'done'

interface Analysis {
  summary: string
  key_themes: string[]
  action_items: string[]
  recommendations: string[]
  extracted_quotes: Array<{
    quote_text: string
    theme: string
    significance: string
  }>
}

const TODAY = () => new Date().toISOString().slice(0, 10)

function defaultGroupFromUrl(group: string | null): {
  group_name: string
  is_sensitive: boolean
  requires_elder_approval: boolean
} {
  const g = (group || 'Elders Group').trim()
  const isElders = /elders/i.test(g)
  return {
    group_name: g,
    is_sensitive: isElders,
    requires_elder_approval: isElders,
  }
}

export default function ProcessMeetingClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const groupParam = searchParams.get('group')
  const defaults = useMemo(() => defaultGroupFromUrl(groupParam), [groupParam])

  const [stage, setStage] = useState<Stage>('idle')
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [transcript, setTranscript] = useState('')
  const [analysis, setAnalysis] = useState<Analysis | null>(null)

  // Form fields
  const [title, setTitle] = useState('')
  const [meetingDate, setMeetingDate] = useState(TODAY())
  const [location, setLocation] = useState('Palm Island')
  const [groupName, setGroupName] = useState(defaults.group_name)
  const [summary, setSummary] = useState('')
  const [keyThemes, setKeyThemes] = useState<string[]>([])
  const [actionItems, setActionItems] = useState<string[]>([])
  const [attendees, setAttendees] = useState<string[]>([])
  const [attendeeInput, setAttendeeInput] = useState('')
  const [eldersSuggestions, setEldersSuggestions] = useState<Array<{ name: string; role: string | null }>>([])
  const [recordedBy, setRecordedBy] = useState('Ben Knight')
  const [isSensitive, setIsSensitive] = useState(defaults.is_sensitive)
  const [requiresElderApproval, setRequiresElderApproval] = useState(defaults.requires_elder_approval)
  const [sensitivityNotes, setSensitivityNotes] = useState('')
  const [relatedProjectSlug, setRelatedProjectSlug] = useState('')

  useEffect(() => {
    setGroupName(defaults.group_name)
    setIsSensitive(defaults.is_sensitive)
    setRequiresElderApproval(defaults.requires_elder_approval)
  }, [defaults])

  useEffect(() => {
    let cancelled = false
    fetch('/api/picc/elders-list', { signal: AbortSignal.timeout(8000) })
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => {
        if (cancelled) return
        const data = Array.isArray(j?.data) ? j.data : []
        setEldersSuggestions(
          data.map((e: any) => ({ name: String(e?.name || '').trim(), role: e?.role || null }))
            .filter((e: any) => e.name)
        )
      })
      .catch(() => { /* offline — no chips */ })
    return () => { cancelled = true }
  }, [])

  const reset = () => {
    setStage('idle')
    setError(null)
    setFile(null)
    setTranscript('')
    setAnalysis(null)
    setTitle('')
    setSummary('')
    setKeyThemes([])
    setActionItems([])
    setAttendees([])
  }

  const handleFile = (f: File | null) => {
    setError(null)
    if (!f) return
    if (f.size > 25 * 1024 * 1024) {
      setError('File is over 25 MB. Split with ffmpeg or trim before uploading.')
      return
    }
    setFile(f)
    if (!title) {
      const stem = f.name.replace(/\.[^.]+$/, '')
      setTitle(stem.replace(/[-_]+/g, ' '))
    }
  }

  const runPipeline = async () => {
    if (!file) {
      setError('Pick an audio file first.')
      return
    }
    setError(null)

    // Step 1: transcribe
    setStage('transcribing')
    let transcriptText = ''
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('timestamps', 'true')
      const res = await fetch('/api/ai/transcribe', { method: 'POST', body: formData })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || `Transcription failed (${res.status})`)
      }
      const json = await res.json()
      transcriptText =
        json?.formatted?.text ||
        json?.transcription?.text ||
        ''
      if (!transcriptText) throw new Error('Transcription returned no text.')
      setTranscript(transcriptText)
    } catch (err: any) {
      setError(err?.message || 'Transcription failed.')
      setStage('idle')
      return
    }

    // Step 2: analyze
    setStage('analyzing')
    try {
      const res = await fetch('/api/interviews/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript_text: transcriptText }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || `Analysis failed (${res.status})`)
      }
      const json = await res.json()
      const a: Analysis = json?.analysis || {}
      setAnalysis(a)
      if (a.summary && !summary) setSummary(a.summary)
      if (Array.isArray(a.key_themes)) setKeyThemes(a.key_themes)
      if (Array.isArray(a.action_items)) setActionItems(a.action_items)
      setStage('editing')
    } catch (err: any) {
      setError(err?.message || 'Analysis failed.')
      setStage('idle')
    }
  }

  const submit = async () => {
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    setError(null)
    setStage('submitting')
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          meeting_date: meetingDate,
          location: location.trim() || 'Palm Island',
          group_name: groupName.trim() || 'Elders Group',
          transcript: transcript || null,
          summary: summary.trim() || null,
          key_themes: keyThemes,
          action_items: actionItems,
          attendees,
          recorded_by: recordedBy.trim() || null,
          is_public: false,
          is_sensitive: isSensitive,
          sensitivity_notes: sensitivityNotes.trim() || null,
          related_project_slug: relatedProjectSlug.trim() || null,
          metadata: {
            requires_elder_approval: requiresElderApproval,
            source: 'meetings/process wrapper',
            ai_analysis: analysis ? {
              recommendations: analysis.recommendations || [],
              quotes_extracted: analysis.extracted_quotes?.length || 0,
            } : null,
          },
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || `Save failed (${res.status})`)
      }
      setStage('done')
    } catch (err: any) {
      setError(err?.message || 'Save failed.')
      setStage('editing')
    }
  }

  const addAttendee = () => {
    const v = attendeeInput.trim()
    if (!v) return
    if (!attendees.includes(v)) setAttendees([...attendees, v])
    setAttendeeInput('')
  }

  const removeAttendee = (name: string) => {
    setAttendees(attendees.filter((a) => a !== name))
  }

  const updateActionItem = (idx: number, value: string) => {
    const next = [...actionItems]
    next[idx] = value
    setActionItems(next)
  }

  const removeActionItem = (idx: number) => {
    setActionItems(actionItems.filter((_, i) => i !== idx))
  }

  const addActionItem = () => {
    setActionItems([...actionItems, ''])
  }

  const updateTheme = (idx: number, value: string) => {
    const next = [...keyThemes]
    next[idx] = value
    setKeyThemes(next)
  }

  const removeTheme = (idx: number) => {
    setKeyThemes(keyThemes.filter((_, i) => i !== idx))
  }

  const addTheme = () => {
    setKeyThemes([...keyThemes, ''])
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <Link
        href="/picc/elders/meetings"
        className="inline-flex items-center gap-2 text-picc-red hover:text-picc-red/80 mb-4 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Elders meetings
      </Link>

      <div className="mb-6">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-2">
          Meeting · capture pipeline
        </p>
        <h1 className="font-serif text-3xl text-stone-800 italic mb-2">Process a meeting recording</h1>
        <p className="text-stone-600 max-w-2xl leading-relaxed">
          Upload audio → transcribe with Whisper → analyse for themes &amp; action items → edit &amp; save.
          Cultural protocol flags default-on for Elders Group meetings.
        </p>
      </div>

      {/* Upload + run */}
      {stage === 'idle' && (
        <div className="rounded-xl border border-stone-200 bg-white p-6 mb-6">
          <label className="block">
            <div className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-2">
              <FileAudio className="w-4 h-4" />
              Audio file (MP3, WAV, M4A, MP4, WebM, OGG · max 25 MB)
            </div>
            <input
              type="file"
              accept="audio/*,video/mp4,video/webm"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-stone-700 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-picc-ochre/10 file:text-picc-ochre file:font-medium hover:file:bg-picc-ochre/20"
            />
          </label>
          {file && (
            <p className="mt-3 text-sm text-stone-600">
              <strong>{file.name}</strong> · {(file.size / (1024 * 1024)).toFixed(1)} MB
            </p>
          )}
          <button
            type="button"
            onClick={runPipeline}
            disabled={!file}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-picc-ochre text-white font-medium disabled:opacity-50 hover:bg-picc-ochre/90"
          >
            <Upload className="w-4 h-4" />
            Transcribe &amp; analyse
          </button>
        </div>
      )}

      {/* Progress */}
      {(stage === 'transcribing' || stage === 'analyzing') && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 mb-6">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-picc-ochre" />
            <div>
              <p className="font-medium text-stone-800">
                {stage === 'transcribing' ? 'Transcribing with Whisper…' : 'Analysing transcript…'}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                {stage === 'transcribing'
                  ? 'About 30s per 10 min of audio.'
                  : 'Extracting summary, themes, and action items.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit form */}
      {(stage === 'editing' || stage === 'submitting') && (
        <div className="space-y-6">
          {/* Cultural protocol banner */}
          {(isSensitive || requiresElderApproval) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-amber-900">Cultural protocol active</p>
                <p className="text-amber-800 mt-1">
                  This meeting is flagged sensitive {requiresElderApproval && 'and requires Elder approval before quotes can be extracted'}.
                  Quote extraction via <code>/api/interviews/analyze</code> will be blocked until approval is recorded.
                </p>
              </div>
            </div>
          )}

          {/* Core fields */}
          <div className="rounded-xl border border-stone-200 bg-white p-6 space-y-4">
            <h2 className="font-semibold text-stone-800">Meeting details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Title">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </Field>
              <Field label="Date">
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </Field>
              <Field label="Location">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </Field>
              <Field label="Group">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </Field>
              <Field label="Recorded by">
                <input
                  type="text"
                  value={recordedBy}
                  onChange={(e) => setRecordedBy(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </Field>
              <Field label="Related project slug (optional)">
                <input
                  type="text"
                  value={relatedProjectSlug}
                  onChange={(e) => setRelatedProjectSlug(e.target.value)}
                  placeholder="bwgcolman-way"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </Field>
            </div>

            <Field label="Summary">
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
              />
            </Field>
          </div>

          {/* Cultural protocol */}
          <div className="rounded-xl border border-stone-200 bg-white p-6 space-y-4">
            <h2 className="font-semibold text-stone-800">Cultural protocol</h2>
            <label className="flex items-start gap-2 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={isSensitive}
                onChange={(e) => setIsSensitive(e.target.checked)}
                className="mt-1"
              />
              <span>
                <strong>Sensitive content</strong> — this meeting touches Elders, ceremony, Sorry Business, or
                cultural knowledge that needs Elder oversight before publication.
              </span>
            </label>
            <label className="flex items-start gap-2 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={requiresElderApproval}
                onChange={(e) => setRequiresElderApproval(e.target.checked)}
                className="mt-1"
              />
              <span>
                <strong>Requires Elder approval</strong> — quote extraction blocked until Elders Group approves.
              </span>
            </label>
            {(isSensitive || requiresElderApproval) && (
              <Field label="Sensitivity notes (what specifically needs review)">
                <textarea
                  value={sensitivityNotes}
                  onChange={(e) => setSensitivityNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. references to Hull River, names of deceased Elders, ceremony details"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </Field>
            )}
          </div>

          {/* Themes */}
          <EditableList
            title="Key themes"
            subtitle="Extracted by AI · edit, add, or remove"
            items={keyThemes}
            onChange={updateTheme}
            onRemove={removeTheme}
            onAdd={addTheme}
            placeholder="e.g. cultural review, governance, healing"
            color="ochre"
          />

          {/* Action items */}
          <EditableList
            title="Action items"
            subtitle="Concrete commitments and follow-ups · one per line"
            items={actionItems}
            onChange={updateActionItem}
            onRemove={removeActionItem}
            onAdd={addActionItem}
            placeholder="e.g. Schedule cultural review with Elders Group by 20 May"
            color="green"
          />

          {/* Attendees */}
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <h2 className="font-semibold text-stone-800 mb-1">Attendees</h2>
            <p className="text-xs text-stone-500 mb-3">
              Tap an Elder below to add, or type any other name (staff, visitor, family).
            </p>

            {/* Elder suggestion chips */}
            {eldersSuggestions.length > 0 && (
              <div className="mb-4">
                <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide mb-2">
                  Elders ({eldersSuggestions.length}) — tap to add
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {eldersSuggestions
                    .filter((e) => !attendees.includes(e.name))
                    .map((e) => (
                      <button
                        key={e.name}
                        type="button"
                        onClick={() => setAttendees([...attendees, e.name])}
                        title={e.role || undefined}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-medium border border-amber-200"
                      >
                        <Plus className="w-3 h-3" />
                        {e.name}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Free-text add */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={attendeeInput}
                onChange={(e) => setAttendeeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addAttendee()
                  }
                }}
                placeholder="Other attendee (staff, visitor, family)…"
                className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm"
              />
              <button
                type="button"
                onClick={addAttendee}
                className="px-3 py-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 text-sm font-medium inline-flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Selected attendees */}
            {attendees.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide mb-2">
                  Selected ({attendees.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {attendees.map((name) => {
                    const isElder = eldersSuggestions.some((e) => e.name === name)
                    return (
                      <span
                        key={name}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${
                          isElder
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {name}
                        <button
                          type="button"
                          onClick={() => removeAttendee(name)}
                          className="text-stone-400 hover:text-stone-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Transcript preview (collapsed by default) */}
          <details className="rounded-xl border border-stone-200 bg-white p-6">
            <summary className="cursor-pointer font-semibold text-stone-800">
              Transcript ({transcript.length.toLocaleString()} chars) — click to view
            </summary>
            <div className="mt-3 max-h-96 overflow-y-auto bg-stone-50 rounded-lg p-3 text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">
              {transcript}
            </div>
          </details>

          {/* AI extras */}
          {analysis && (analysis.recommendations?.length > 0 || analysis.extracted_quotes?.length > 0) && (
            <div className="rounded-xl border border-stone-200 bg-white p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-picc-ochre" />
                <h2 className="font-semibold text-stone-800">AI extras (not saved as fields)</h2>
              </div>
              {analysis.recommendations?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">
                    Follow-up suggestions
                  </p>
                  <ul className="text-sm text-stone-700 space-y-1 list-disc pl-5">
                    {analysis.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
              {analysis.extracted_quotes?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">
                    Quotable lines ({analysis.extracted_quotes.length})
                  </p>
                  <ul className="text-sm text-stone-700 space-y-2">
                    {analysis.extracted_quotes.slice(0, 5).map((q, i) => (
                      <li key={i} className="italic border-l-2 border-picc-ochre pl-3">
                        &ldquo;{q.quote_text}&rdquo;
                        <span className="block not-italic text-xs text-stone-500 mt-1">
                          {q.theme} · {q.significance}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {requiresElderApproval && (
                    <p className="text-xs text-amber-700 mt-3 italic">
                      Quotes are <strong>not</strong> stored in the public quote library yet — Elder approval required first.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={reset}
              className="px-4 py-2 rounded-lg text-stone-600 hover:bg-stone-100 text-sm"
            >
              Discard &amp; restart
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={stage === 'submitting'}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-picc-ochre text-white font-medium disabled:opacity-50 hover:bg-picc-ochre/90"
            >
              {stage === 'submitting' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save meeting
            </button>
          </div>
        </div>
      )}

      {/* Done */}
      {stage === 'done' && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-green-900 mb-1">Meeting saved</h2>
          <p className="text-sm text-green-800 mb-4">
            Visible at <Link href="/picc/elders/meetings" className="underline">/picc/elders/meetings</Link>.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="px-4 py-2 rounded-lg bg-white border border-green-300 text-green-800 hover:bg-green-100 text-sm font-medium"
            >
              Process another
            </button>
            <button
              type="button"
              onClick={() => router.push('/picc/elders/meetings')}
              className="px-4 py-2 rounded-lg bg-picc-ochre text-white text-sm font-medium hover:bg-picc-ochre/90"
            >
              View meetings
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">
            <p className="font-semibold">Something went wrong</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1 block">
        {label}
      </span>
      {children}
    </label>
  )
}

function EditableList({
  title,
  subtitle,
  items,
  onChange,
  onRemove,
  onAdd,
  placeholder,
  color,
}: {
  title: string
  subtitle: string
  items: string[]
  onChange: (idx: number, value: string) => void
  onRemove: (idx: number) => void
  onAdd: () => void
  placeholder: string
  color: 'ochre' | 'green'
}) {
  const accent = color === 'ochre' ? 'text-picc-ochre' : 'text-green-600'
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6">
      <h2 className="font-semibold text-stone-800 mb-1">{title}</h2>
      <p className="text-xs text-stone-500 mb-3">{subtitle}</p>
      {items.length === 0 ? (
        <p className="text-sm text-stone-400 italic mb-3">None — add one below.</p>
      ) : (
        <div className="space-y-2 mb-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className={`mt-2 ${accent}`}>•</span>
              <input
                type="text"
                value={item}
                onChange={(e) => onChange(idx, e.target.value)}
                placeholder={placeholder}
                className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm"
              />
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="text-stone-400 hover:text-red-600 px-2 py-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-1 text-sm text-stone-600 hover:text-picc-ochre"
      >
        <Plus className="w-4 h-4" />
        Add
      </button>
    </div>
  )
}
