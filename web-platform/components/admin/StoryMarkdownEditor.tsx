'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { Bold, Italic, Link as LinkIcon, Heading2, List, Quote, Image as ImageIcon, Video } from 'lucide-react'
import StoryContentRenderer from '@/components/stories/StoryContentRenderer'
import MediaPickerDialog, { type MediaPickerKind } from '@/components/admin/MediaPickerDialog'

type Props = {
  value: string
  onChange: (next: string) => void
  placeholder?: string
}

function clampSelection(el: HTMLTextAreaElement) {
  const start = Math.max(0, el.selectionStart ?? 0)
  const end = Math.max(start, el.selectionEnd ?? start)
  return { start, end }
}

function replaceRange(input: string, start: number, end: number, insert: string) {
  return input.slice(0, start) + insert + input.slice(end)
}

function wrapSelection(input: string, start: number, end: number, left: string, right: string) {
  const selected = input.slice(start, end)
  const wrapped = left + (selected || '') + right
  const next = replaceRange(input, start, end, wrapped)
  const nextSelectionStart = start + left.length
  const nextSelectionEnd = start + left.length + (selected || '').length
  return { next, nextSelectionStart, nextSelectionEnd }
}

function insertLinePrefix(input: string, start: number, end: number, prefix: string) {
  const before = input.slice(0, start)
  const selected = input.slice(start, end)
  const after = input.slice(end)

  const lines = (selected || '').split('\n')
  const nextSelected = lines.map((l) => (l.trim() ? `${prefix}${l}` : l)).join('\n')
  const next = before + nextSelected + after
  return { next }
}

export default function StoryMarkdownEditor({ value, onChange, placeholder }: Props) {
  const [view, setView] = useState<'split' | 'write' | 'preview'>('split')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const lastSelectionRef = useRef<{ start: number; end: number } | null>(null)
  const [picker, setPicker] = useState<{ open: boolean; kind: MediaPickerKind }>({ open: false, kind: 'image' })

  const canPreview = useMemo(() => (value || '').trim().length > 0, [value])

  const rememberSelection = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    lastSelectionRef.current = clampSelection(el)
  }, [])

  const apply = useCallback(
    (fn: (input: string, start: number, end: number) => { next: string; selStart?: number; selEnd?: number }) => {
      const el = textareaRef.current
      if (!el) return
      const { start, end } = clampSelection(el)
      const { next, selStart, selEnd } = fn(value, start, end)
      onChange(next)

      // Restore selection on next frame.
      requestAnimationFrame(() => {
        if (!textareaRef.current) return
        if (typeof selStart === 'number' && typeof selEnd === 'number') {
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(selStart, selEnd)
        }
      })
    },
    [onChange, value]
  )

  const insertFromPicker = useCallback(
    (kind: MediaPickerKind) => {
      rememberSelection()
      setPicker({ open: true, kind })
    },
    [rememberSelection]
  )

  const applyAtRememberedSelection = useCallback(
    (fn: (input: string, start: number, end: number) => { next: string; selStart?: number; selEnd?: number }) => {
      const sel = lastSelectionRef.current
      if (!sel) return apply(fn)
      const { next, selStart, selEnd } = fn(value, sel.start, sel.end)
      onChange(next)
      requestAnimationFrame(() => {
        if (!textareaRef.current) return
        if (typeof selStart === 'number' && typeof selEnd === 'number') {
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(selStart, selEnd)
        }
      })
    },
    [apply, onChange, value]
  )

  return (
    <div className="space-y-3">
      <MediaPickerDialog
        open={picker.open}
        kind={picker.kind}
        onClose={() => setPicker((p) => ({ ...p, open: false }))}
        onPick={(m) => {
          setPicker((p) => ({ ...p, open: false }))

          const url = String(m.public_url || '').trim()
          if (!url) return

          if (picker.kind === 'image') {
            const alt = String(m.alt_text || m.title || '').replace(/\n/g, ' ').trim()
            applyAtRememberedSelection((input, start, end) => {
              const insert = `\n\n![${alt}](${url})\n\n`
              return { next: replaceRange(input, start, end, insert) }
            })
            return
          }

          applyAtRememberedSelection((input, start, end) => {
            const insert = `\n\n{{embed:${url}}}\n\n`
            return { next: replaceRange(input, start, end, insert) }
          })
        }}
      />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() =>
              apply((i, s, e) => {
                const r = wrapSelection(i, s, e, '**', '**')
                return { next: r.next, selStart: r.nextSelectionStart, selEnd: r.nextSelectionEnd }
              })
            }
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
            Bold
          </button>

          <button
            type="button"
            onClick={() =>
              apply((i, s, e) => {
                const r = wrapSelection(i, s, e, '*', '*')
                return { next: r.next, selStart: r.nextSelectionStart, selEnd: r.nextSelectionEnd }
              })
            }
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
            Italic
          </button>

          <button
            type="button"
            onClick={() =>
              apply((i, s, e) => {
                const selected = i.slice(s, e) || 'link text'
                const href = window.prompt('Link URL:') || ''
                if (!href.trim()) return { next: i }
                const insert = `[${selected}](${href.trim()})`
                return { next: replaceRange(i, s, e, insert) }
              })
            }
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium"
            title="Link"
          >
            <LinkIcon className="w-4 h-4" />
            Link
          </button>

          <button
            type="button"
            onClick={() => apply((i, s, e) => ({ next: insertLinePrefix(i, s, e, '## ').next }))}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium"
            title="Heading"
          >
            <Heading2 className="w-4 h-4" />
            Heading
          </button>

          <button
            type="button"
            onClick={() => apply((i, s, e) => ({ next: insertLinePrefix(i, s, e, '- ').next }))}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium"
            title="Bullets"
          >
            <List className="w-4 h-4" />
            Bullets
          </button>

          <button
            type="button"
            onClick={() => apply((i, s, e) => ({ next: insertLinePrefix(i, s, e, '> ').next }))}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium"
            title="Quote"
          >
            <Quote className="w-4 h-4" />
            Quote
          </button>

          <button
            type="button"
            onClick={() => insertFromPicker('image')}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium"
            title="Insert image"
          >
            <ImageIcon className="w-4 h-4" />
            Image
          </button>

          <button
            type="button"
            onClick={() => insertFromPicker('video')}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium"
            title="Insert video embed"
          >
            <Video className="w-4 h-4" />
            Video
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setView('write')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
              view === 'write' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setView('split')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
              view === 'split' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Split
          </button>
          <button
            type="button"
            onClick={() => setView('preview')}
            disabled={!canPreview}
            className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
              view === 'preview'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            } disabled:opacity-50`}
          >
            Preview
          </button>
        </div>
      </div>

      <div className={`grid gap-4 ${view === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {(view === 'split' || view === 'write') && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'Write your story...'}
            rows={18}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono text-sm"
          />
        )}

        {(view === 'split' || view === 'preview') && (
          <div className="border border-gray-200 rounded-lg bg-white p-4 overflow-auto">
            {canPreview ? (
              <StoryContentRenderer content={value} />
            ) : (
              <div className="text-sm text-gray-500">Nothing to preview yet.</div>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Formatting:{' '}
        <code>**bold**</code>, <code>*italic*</code>, <code>## heading</code>, <code>- list</code>, <code>&gt; quote</code>,{' '}
        <code>[text](url)</code>, <code>{'{{embed:URL}}'}</code>, <code>![caption](image-url)</code>.
      </p>
    </div>
  )
}
