'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Bold, Italic, Link as LinkIcon, Heading2, List, Quote, Image as ImageIcon, Video, Code } from 'lucide-react'
import MediaPickerDialog from '@/components/admin/MediaPickerDialog'
import StoryContentRenderer from '@/components/stories/StoryContentRenderer'

type Props = {
  value: string
  onChange: (next: string) => void
  placeholder?: string
}

type Mode = 'rich' | 'source' | 'preview'

function isDirectVideoUrl(url: string) {
  const u = String(url || '').trim()
  return /\.(mp4|webm|mov|m4v)(?:\?|#|$)/i.test(u)
}

function isDescriptUrl(url: string) {
  try {
    const hostname = new URL(String(url), 'https://example.com').hostname
    if (/(^|\.)descript\.com$/i.test(hostname)) return true
  } catch {
    // ignore
  }
  return /descript\.com/i.test(String(url || ''))
}

function normalizeDescriptUrl(url: string) {
  const u = String(url || '').trim()
  if (!u) return u
  if (!/descript\.com/i.test(u)) return u
  return u.replace(/\/view\//i, '/embed/')
}

function youtubeEmbedUrl(url: string) {
  const m = String(url || '').match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s?]+)/)
  if (!m?.[1]) return null
  return `https://www.youtube.com/embed/${m[1]}`
}

function vimeoEmbedUrl(url: string) {
  const m = String(url || '').match(/vimeo\.com\/(\d+)/)
  if (!m?.[1]) return null
  return `https://player.vimeo.com/video/${m[1]}`
}

function normalizeVideoEmbedUrl(url: string) {
  const u = String(url || '').trim()
  if (!u) return u
  const yt = youtubeEmbedUrl(u)
  if (yt) return yt
  const vm = vimeoEmbedUrl(u)
  if (vm) return vm
  if (isDescriptUrl(u)) return normalizeDescriptUrl(u)
  return u
}

function isHtml(value: string) {
  const s = String(value || '').trim()
  return /^<([a-z][a-z0-9-]*)(\s|>)/i.test(s)
}

function escapeHtml(s: string) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function inlineToHtml(text: string) {
  let out = escapeHtml(text)
  // Links: [text](url)
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (_m, label, href) => `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`)
  // Bold: **text**
  out = out.replace(/\*\*([^*]+)\*\*/g, (_m, inner) => `<strong>${escapeHtml(inner)}</strong>`)
  // Italic: *text*
  out = out.replace(/\*([^*]+)\*/g, (_m, inner) => `<em>${escapeHtml(inner)}</em>`)
  return out
}

function textToInitialHtml(input: string) {
  const lines = String(input || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const blocks: string[] = []
  let paragraph: string[] = []
  let list: string[] = []
  let quote: string[] = []

  const flushParagraph = () => {
    const t = paragraph.join(' ').replace(/\s+/g, ' ').trim()
    paragraph = []
    if (!t) return
    blocks.push(`<p>${inlineToHtml(t)}</p>`)
  }
  const flushList = () => {
    const items = list.map((x) => x.trim()).filter(Boolean)
    list = []
    if (!items.length) return
    blocks.push(`<ul>${items.map((i) => `<li>${inlineToHtml(i)}</li>`).join('')}</ul>`)
  }
  const flushQuote = () => {
    const t = quote.join(' ').replace(/\s+/g, ' ').trim()
    quote = []
    if (!t) return
    blocks.push(`<blockquote><p>${inlineToHtml(t)}</p></blockquote>`)
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const t = String(raw || '').trimEnd()
    const trimmed = t.trim()
    const prevBlank = i === 0 ? true : !String(lines[i - 1] || '').trim()
    const nextBlank = i === lines.length - 1 ? true : !String(lines[i + 1] || '').trim()

    if (!trimmed) {
      flushQuote()
      flushList()
      flushParagraph()
      continue
    }

    const embedMatch = trimmed.match(/^\{\{\s*embed\s*:\s*(.+?)\s*\}\}$/i)
    if (embedMatch?.[1]) {
      flushQuote()
      flushList()
      flushParagraph()
      const url = String(embedMatch[1]).trim()
      if (isDirectVideoUrl(url)) blocks.push(`<video controls src="${escapeHtml(url)}"></video>`)
      else blocks.push(`<iframe src="${escapeHtml(url)}" allowfullscreen></iframe>`)
      continue
    }

    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
    if (imgMatch?.[2]) {
      flushQuote()
      flushList()
      flushParagraph()
      blocks.push(`<img src="${escapeHtml(imgMatch[2].trim())}" alt="${escapeHtml(imgMatch[1] || '')}" />`)
      continue
    }

    if (trimmed.startsWith('# ')) {
      flushQuote()
      flushList()
      flushParagraph()
      blocks.push(`<h1>${inlineToHtml(trimmed.replace(/^#\s+/, ''))}</h1>`)
      continue
    }
    if (trimmed.startsWith('## ')) {
      flushQuote()
      flushList()
      flushParagraph()
      blocks.push(`<h2>${inlineToHtml(trimmed.replace(/^##\s+/, ''))}</h2>`)
      continue
    }
    if (trimmed.startsWith('### ')) {
      flushQuote()
      flushList()
      flushParagraph()
      blocks.push(`<h3>${inlineToHtml(trimmed.replace(/^###\s+/, ''))}</h3>`)
      continue
    }

    // "Heading-like" line between blank lines (mirrors StoryContentRenderer back-compat)
    if (prevBlank && nextBlank && trimmed.length <= 42 && !/[.:!?]$/.test(trimmed)) {
      flushQuote()
      flushList()
      flushParagraph()
      blocks.push(`<h2>${inlineToHtml(trimmed)}</h2>`)
      continue
    }

    if (trimmed.startsWith('> ')) {
      flushList()
      flushParagraph()
      quote.push(trimmed.replace(/^>\s+/, ''))
      continue
    }

    const liMatch = trimmed.match(/^(?:-|\*)\s+(.*)$/)
    if (liMatch?.[1]) {
      flushQuote()
      flushParagraph()
      list.push(liMatch[1])
      continue
    }

    flushQuote()
    flushList()
    paragraph.push(trimmed)
  }

  flushQuote()
  flushList()
  flushParagraph()

  return blocks.join('\n')
}

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ')
}

export default function StoryRichTextEditor({ value, onChange, placeholder }: Props) {
  const [mode, setMode] = useState<Mode>('rich')
  const [picker, setPicker] = useState<{ open: boolean; kind: 'image' | 'video' }>({ open: false, kind: 'image' })
  const editorRef = useRef<HTMLDivElement | null>(null)
  const savedRangeRef = useRef<Range | null>(null)

  const richHtmlValue = useMemo(() => {
    if (isHtml(value)) return value
    return textToInitialHtml(value)
  }, [value])

  // Keep the contentEditable surface in sync when switching modes.
  useEffect(() => {
    if (mode !== 'rich') return
    const el = editorRef.current
    if (!el) return
    if (el.innerHTML !== richHtmlValue) el.innerHTML = richHtmlValue
  }, [mode, richHtmlValue])

  const saveRange = useCallback(() => {
    const sel = window.getSelection?.()
    if (!sel || sel.rangeCount === 0) return
    savedRangeRef.current = sel.getRangeAt(0).cloneRange()
  }, [])

  const restoreRange = useCallback(() => {
    const r = savedRangeRef.current
    if (!r) return
    const sel = window.getSelection?.()
    if (!sel) return
    sel.removeAllRanges()
    sel.addRange(r)
  }, [])

  const exec = useCallback((cmd: string, arg?: string) => {
    editorRef.current?.focus()
    try {
      document.execCommand(cmd, false, arg)
    } catch {
      // ignore
    }
  }, [])

  const openPicker = useCallback((kind: 'image' | 'video') => {
    saveRange()
    setPicker({ open: true, kind })
  }, [saveRange])

  const insertNodeAtCursor = useCallback((node: Node) => {
    restoreRange()
    const sel = window.getSelection?.()
    if (!sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    range.deleteContents()
    range.insertNode(node)
    // Move cursor after inserted node
    range.setStartAfter(node)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)
  }, [restoreRange])

  const handlePick = useCallback((media: any) => {
    setPicker((p) => ({ ...p, open: false }))
    const url = String(media?.public_url || '').trim()
    if (!url) return

    if (picker.kind === 'image') {
      const img = document.createElement('img')
      img.src = url
      img.alt = String(media?.alt_text || media?.title || '').trim()
      img.style.maxWidth = '100%'
      img.style.height = 'auto'
      insertNodeAtCursor(img)
      const el = editorRef.current
      if (el) onChange(el.innerHTML)
      return
    }

    if (isDirectVideoUrl(url)) {
      const video = document.createElement('video')
      video.controls = true
      video.src = url
      video.style.maxWidth = '100%'
      insertNodeAtCursor(video)
      const el = editorRef.current
      if (el) onChange(el.innerHTML)
      return
    }

    const iframe = document.createElement('iframe')
    iframe.src = normalizeVideoEmbedUrl(url)
    iframe.allowFullscreen = true
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture')
    iframe.style.width = '100%'
    iframe.style.aspectRatio = '16 / 9'
    insertNodeAtCursor(iframe)
    const el = editorRef.current
    if (el) onChange(el.innerHTML)
  }, [insertNodeAtCursor, onChange, picker.kind])

  const toolbar = (
    <div className="sticky top-20 z-30 bg-white/95 backdrop-blur border border-gray-200 rounded-lg px-3 py-2 flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => exec('bold')}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
          Bold
        </button>
        <button
          type="button"
          onClick={() => exec('italic')}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
          Italic
        </button>
        <button
          type="button"
          onClick={() => {
            const href = window.prompt('Link URL:')
            if (!href?.trim()) return
            exec('createLink', href.trim())
          }}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium"
          title="Link"
        >
          <LinkIcon className="w-4 h-4" />
          Link
        </button>
        <button
          type="button"
          onClick={() => exec('formatBlock', 'H2')}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium"
          title="Heading"
        >
          <Heading2 className="w-4 h-4" />
          Heading
        </button>
        <button
          type="button"
          onClick={() => exec('insertUnorderedList')}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium"
          title="Bullets"
        >
          <List className="w-4 h-4" />
          Bullets
        </button>
        <button
          type="button"
          onClick={() => exec('formatBlock', 'BLOCKQUOTE')}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium"
          title="Quote"
        >
          <Quote className="w-4 h-4" />
          Quote
        </button>
        <button
          type="button"
          onClick={() => openPicker('image')}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium"
          title="Insert image"
        >
          <ImageIcon className="w-4 h-4" />
          Photo
        </button>
        <button
          type="button"
          onClick={() => openPicker('video')}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium"
          title="Insert video"
        >
          <Video className="w-4 h-4" />
          Video
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMode('rich')}
          className={classNames(
            'px-3 py-2 rounded-lg text-sm font-semibold border',
            mode === 'rich'
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          )}
        >
          Rich
        </button>
        <button
          type="button"
          onClick={() => setMode('source')}
          className={classNames(
            'px-3 py-2 rounded-lg text-sm font-semibold border inline-flex items-center gap-2',
            mode === 'source'
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          )}
          title="Edit HTML source"
        >
          <Code className="w-4 h-4" />
          Source
        </button>
        <button
          type="button"
          onClick={() => setMode('preview')}
          className={classNames(
            'px-3 py-2 rounded-lg text-sm font-semibold border',
            mode === 'preview'
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          )}
        >
          Preview
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-3">
      <MediaPickerDialog
        open={picker.open}
        kind={picker.kind}
        onClose={() => setPicker((p) => ({ ...p, open: false }))}
        onPick={handlePick}
      />

      {toolbar}

      {mode === 'rich' ? (
        <div
          className="border border-gray-300 rounded-lg bg-white p-4 min-h-[320px] focus-within:ring-2 focus-within:ring-blue-500"
          onMouseUp={saveRange}
          onKeyUp={saveRange}
        >
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={() => {
              const el = editorRef.current
              if (!el) return
              onChange(el.innerHTML)
            }}
            onBlur={() => {
              const el = editorRef.current
              if (!el) return
              onChange(el.innerHTML)
            }}
            data-placeholder={placeholder || 'Write your story...'}
            className={classNames(
              'prose max-w-none outline-none',
              'min-h-[280px]',
              '[&:empty:before]:content-[attr(data-placeholder)] [&:empty:before]:text-gray-400 [&:empty:before]:pointer-events-none'
            )}
          />
        </div>
      ) : mode === 'source' ? (
        <textarea
          value={isHtml(value) ? value : richHtmlValue}
          onChange={(e) => onChange(e.target.value)}
          rows={16}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono text-sm"
          placeholder="<p>...</p>"
        />
      ) : (
        <div className="border border-gray-200 rounded-lg bg-white p-4 overflow-auto">
          <StoryContentRenderer content={value} />
        </div>
      )}
    </div>
  )
}
