'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, Check, AlertCircle, Mic, Square, X, Image as ImageIcon } from 'lucide-react'

type Kind = 'text' | 'voice' | 'photo' | 'youth-art' | 'elder'
type Role = 'community' | 'youth' | 'elder' | 'anonymous'

interface KindOption {
  key: Kind
  label: string
  hint: string
}

const KINDS: ReadonlyArray<KindOption> = [
  { key: 'text', label: 'A thought', hint: 'Words, a memory, a reflection.' },
  { key: 'voice', label: 'Voice note', hint: 'Record up to 5 minutes.' },
  { key: 'photo', label: 'Photo', hint: 'A picture worth saving.' },
  { key: 'elder', label: 'Elder knowledge', hint: 'Priority review queue.' },
  { key: 'youth-art', label: 'Youth voice / art', hint: 'Parent/Elder co-sign before publish.' },
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
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  // Media state
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [recording, setRecording] = useState(false)
  const [recDuration, setRecDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recTimerRef = useRef<number | null>(null)

  useEffect(() => () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    if (photoPreview) URL.revokeObjectURL(photoPreview)
  }, [audioUrl, photoPreview])

  async function startRecording() {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      audioChunksRef.current = []
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }
      rec.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        if (audioUrl) URL.revokeObjectURL(audioUrl)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((t) => t.stop())
      }
      rec.start()
      mediaRecorderRef.current = rec
      setRecording(true)
      setRecDuration(0)
      recTimerRef.current = window.setInterval(() => {
        setRecDuration((d) => {
          const next = d + 1
          // auto-stop at 5 minutes
          if (next >= 300 && mediaRecorderRef.current?.state === 'recording') {
            stopRecording()
          }
          return next
        })
      }, 1000)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not start recording — check microphone permission.',
      )
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    if (recTimerRef.current) {
      clearInterval(recTimerRef.current)
      recTimerRef.current = null
    }
    setRecording(false)
  }

  function clearAudio() {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioBlob(null)
    setAudioUrl(null)
    setRecDuration(0)
  }

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function clearPhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  async function uploadMedia(file: Blob, filename: string): Promise<string | null> {
    const form = new FormData()
    form.append('file', new File([file], filename, { type: file.type }))
    const res = await fetch('/api/atlas/capture/media', {
      method: 'POST',
      body: form,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'upload failed')
    return data.url
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (text.trim().length === 0 && !audioBlob && !photoFile) {
      setError('Add text, a voice note, or a photo before sending.')
      return
    }
    setStatus('sending')
    setError(null)
    try {
      let mediaUrl: string | null = null
      if (kind === 'voice' && audioBlob) {
        mediaUrl = await uploadMedia(audioBlob, `capture-${Date.now()}.webm`)
      } else if ((kind === 'photo' || kind === 'youth-art') && photoFile) {
        mediaUrl = await uploadMedia(photoFile, photoFile.name)
      }
      const res = await fetch('/api/atlas/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim() || `[${kind} capture]`,
          name: name.trim(),
          kind,
          contributor_role: role,
          media_url: mediaUrl,
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
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
          style={{ backgroundColor: '#E7EFE4' }}
        >
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
            clearAudio()
            clearPhoto()
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
                onClick={() => setKind(k.key)}
                className="text-left rounded-md border px-3 py-2 transition"
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
                <div className="text-[10.5px] text-stone-600 mt-0.5">{k.hint}</div>
              </button>
            )
          })}
        </div>
      </fieldset>

      {/* Voice recorder — only for voice + elder kinds */}
      {(kind === 'voice' || kind === 'elder') && (
        <div className="rounded-md border border-stone-200 p-3 bg-stone-50">
          <div className="text-[11px] uppercase tracking-wide text-stone-500 font-semibold mb-2">
            Voice note {kind === 'elder' && '(optional)'}
          </div>
          {!audioBlob ? (
            <div className="flex items-center gap-3">
              {!recording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md font-semibold text-white text-sm"
                  style={{ backgroundColor: '#8B1A1A' }}
                >
                  <Mic className="w-4 h-4" />
                  Start recording
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md font-semibold text-white text-sm"
                    style={{ backgroundColor: '#2D5F4F' }}
                  >
                    <Square className="w-4 h-4" />
                    Stop
                  </button>
                  <span className="text-sm font-mono text-stone-700">
                    {Math.floor(recDuration / 60)}:{String(recDuration % 60).padStart(2, '0')}
                  </span>
                  <span className="inline-block w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: '#8B1A1A' }} />
                </>
              )}
              <div className="text-[10.5px] text-stone-500">
                Up to 5 minutes. Microphone permission required.
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              {audioUrl && <audio controls src={audioUrl} className="flex-1" />}
              <button
                type="button"
                onClick={clearAudio}
                className="text-xs text-stone-600 inline-flex items-center gap-1 hover:text-charcoal"
              >
                <X className="w-3.5 h-3.5" />
                clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* Photo uploader — for photo + youth-art kinds */}
      {(kind === 'photo' || kind === 'youth-art') && (
        <div className="rounded-md border border-stone-200 p-3 bg-stone-50">
          <div className="text-[11px] uppercase tracking-wide text-stone-500 font-semibold mb-2">
            Photo {kind === 'youth-art' && '/ art'}
          </div>
          {!photoFile ? (
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md font-semibold text-white text-sm cursor-pointer"
              style={{ backgroundColor: '#2D5F4F' }}>
              <ImageIcon className="w-4 h-4" />
              Choose a photo
              <input
                type="file"
                accept="image/*"
                onChange={onPhotoChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex items-start gap-3">
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt=""
                  className="w-24 h-24 rounded-md object-cover"
                />
              )}
              <div className="flex-1 text-xs text-stone-600">
                <div className="font-medium">{photoFile.name}</div>
                <div className="text-[10.5px] text-stone-500">
                  {(photoFile.size / 1024).toFixed(0)} KB
                </div>
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="mt-1 text-stone-600 inline-flex items-center gap-1 hover:text-charcoal"
                >
                  <X className="w-3.5 h-3.5" />
                  clear
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Text content */}
      <div>
        <label
          htmlFor="capture-text"
          className="block text-[11px] uppercase tracking-wide text-stone-500 font-semibold mb-1"
        >
          {kind === 'voice' ? 'Optional caption' : kind === 'photo' || kind === 'youth-art' ? 'Caption / description' : 'What do you want to share?'}
        </label>
        <textarea
          id="capture-text"
          rows={5}
          maxLength={2500}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="A memory of growing up. A service that helped your family. A vision for the next 20 years. Anything."
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2"
          style={{ minHeight: 100 }}
        />
        <div className="text-[10.5px] text-stone-500 mt-1 text-right">
          {text.length} / 2500
        </div>
      </div>

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

      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] text-stone-500">
          By submitting, you consent to PICC reviewing and (if approved)
          displaying this contribution.
        </div>
        <button
          type="submit"
          disabled={
            status === 'sending' ||
            (text.trim().length === 0 && !audioBlob && !photoFile)
          }
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
