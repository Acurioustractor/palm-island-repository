'use client'

import React from 'react'

type EmbedProvider = 'youtube' | 'vimeo' | 'descript' | 'unknown'

function looksLikeHtml(content: string) {
  const s = String(content || '').trim()
  if (!s) return false
  // Very small heuristic: if it starts with a tag, treat as HTML.
  return /^<([a-z][a-z0-9-]*)(\s|>)/i.test(s)
}

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
  // Descript share links
  // https://share.descript.com/view/<id> -> https://share.descript.com/embed/<id>
  // https://descript.com/view/<id>      -> https://descript.com/embed/<id>
  return u.replace(/\/view\//i, '/embed/')
}

function youtubeEmbedUrl(url: string) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s?]+)/)
  if (!m) return null
  return `https://www.youtube.com/embed/${m[1]}`
}

function vimeoEmbedUrl(url: string) {
  const m = url.match(/vimeo\.com\/(\d+)/)
  if (!m) return null
  return `https://player.vimeo.com/video/${m[1]}`
}

function descriptEmbedUrl(url: string) {
  if (!/descript\.com/i.test(url)) return null
  return normalizeDescriptUrl(url)
}

function getEmbedUrl(url: string) {
  const u = String(url || '').trim()
  if (!u) return u
  const yt = youtubeEmbedUrl(u)
  if (yt) return yt
  const vm = vimeoEmbedUrl(u)
  if (vm) return vm
  const desc = descriptEmbedUrl(u)
  if (desc) return desc
  return u
}

function parseEmbed(url: string) {
  const u = String(url || '').trim()
  const yt = youtubeEmbedUrl(u)
  if (yt) return { provider: 'youtube' as const, src: yt }
  const vimeo = vimeoEmbedUrl(u)
  if (vimeo) return { provider: 'vimeo' as const, src: vimeo }
  const desc = descriptEmbedUrl(u)
  if (desc) return { provider: 'descript' as const, src: desc }
  return { provider: 'unknown' as const, src: u }
}

function escapeText(s: string) {
  return String(s || '')
}

function renderInline(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = []
  let i = 0
  const s = String(text || '')

  const pushText = (t: string) => {
    if (!t) return
    out.push(escapeText(t))
  }

  while (i < s.length) {
    // Link: [text](url)
    if (s[i] === '[') {
      const close = s.indexOf(']', i + 1)
      const openParen = close !== -1 ? s.indexOf('(', close + 1) : -1
      const closeParen = openParen !== -1 ? s.indexOf(')', openParen + 1) : -1
      if (close !== -1 && openParen === close + 1 && closeParen !== -1) {
        const label = s.slice(i + 1, close)
        const href = s.slice(openParen + 1, closeParen).trim()
        if (href) {
          out.push(
            <a
              key={`link-${i}`}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-picc-red hover:text-picc-earth underline underline-offset-2"
            >
              {label || href}
            </a>
          )
          i = closeParen + 1
          continue
        }
      }
    }

    // Bold: **text**
    if (s.startsWith('**', i)) {
      const end = s.indexOf('**', i + 2)
      if (end !== -1) {
        const inner = s.slice(i + 2, end)
        out.push(
          <strong key={`b-${i}`} className="font-semibold text-gray-900">
            {inner}
          </strong>
        )
        i = end + 2
        continue
      }
    }

    // Italic: *text*
    if (s[i] === '*') {
      const end = s.indexOf('*', i + 1)
      if (end !== -1 && !s.startsWith('**', i)) {
        const inner = s.slice(i + 1, end)
        out.push(
          <em key={`i-${i}`} className="italic">
            {inner}
          </em>
        )
        i = end + 1
        continue
      }
    }

    // Default: accumulate until next token start.
    const nextCandidates = [
      s.indexOf('[', i + 1),
      s.indexOf('**', i + 1),
      s.indexOf('*', i + 1),
    ].filter((n) => n !== -1)
    const next = nextCandidates.length ? Math.min(...nextCandidates) : -1
    if (next === -1) {
      pushText(s.slice(i))
      break
    }
    pushText(s.slice(i, next))
    i = next
  }

  return out
}

function isHeadingLike(line: string) {
  const t = String(line || '').trim()
  if (!t) return false
  if (t.length > 42) return false
  if (/[.:!?]$/.test(t)) return false
  return /^[A-Za-z][A-Za-z0-9 '&/()-]{0,60}$/.test(t)
}

type Block =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'image'; alt: string; url: string }
  | { type: 'embed'; url: string }

function parseBlocks(content: string): Block[] {
  const lines = String(content || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const blocks: Block[] = []
  let buf: string[] = []
  let listBuf: string[] = []
  let quoteBuf: string[] = []

  const flushParagraph = () => {
    const t = buf.join(' ').replace(/\s+/g, ' ').trim()
    buf = []
    if (t) blocks.push({ type: 'paragraph', text: t })
  }
  const flushList = () => {
    const items = listBuf.map((x) => x.trim()).filter(Boolean)
    listBuf = []
    if (items.length) blocks.push({ type: 'list', items })
  }
  const flushQuote = () => {
    const t = quoteBuf.join(' ').replace(/\s+/g, ' ').trim()
    quoteBuf = []
    if (t) blocks.push({ type: 'quote', text: t })
  }

  for (let idx = 0; idx < lines.length; idx++) {
    const raw = lines[idx]
    const line = String(raw || '').trimEnd()
    const t = line.trim()
    const prevBlank = idx === 0 ? true : !String(lines[idx - 1] || '').trim()
    const nextBlank = idx === lines.length - 1 ? true : !String(lines[idx + 1] || '').trim()

    // Blank line: flush buffers.
    if (!t) {
      flushQuote()
      flushList()
      flushParagraph()
      continue
    }

    // Embed token: {{embed:URL}}
    const embedMatch = t.match(/^\{\{\s*embed\s*:\s*(.+?)\s*\}\}$/i)
    if (embedMatch?.[1]) {
      flushQuote()
      flushList()
      flushParagraph()
      blocks.push({ type: 'embed', url: embedMatch[1] })
      continue
    }

    // Image line: ![alt](url)
    const imgMatch = t.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
    if (imgMatch?.[2]) {
      flushQuote()
      flushList()
      flushParagraph()
      blocks.push({ type: 'image', alt: imgMatch[1] || '', url: imgMatch[2] })
      continue
    }

    // Headings
    if (t.startsWith('# ')) {
      flushQuote()
      flushList()
      flushParagraph()
      blocks.push({ type: 'heading', level: 1, text: t.replace(/^#\s+/, '') })
      continue
    }
    if (t.startsWith('## ')) {
      flushQuote()
      flushList()
      flushParagraph()
      blocks.push({ type: 'heading', level: 2, text: t.replace(/^##\s+/, '') })
      continue
    }
    if (t.startsWith('### ')) {
      flushQuote()
      flushList()
      flushParagraph()
      blocks.push({ type: 'heading', level: 3, text: t.replace(/^###\s+/, '') })
      continue
    }

    // Heading-like single line between blank lines (back-compat for older drafts)
    if (prevBlank && nextBlank && isHeadingLike(t)) {
      flushQuote()
      flushList()
      flushParagraph()
      blocks.push({ type: 'heading', level: 2, text: t })
      continue
    }

    // Blockquote
    if (t.startsWith('> ')) {
      flushList()
      flushParagraph()
      quoteBuf.push(t.replace(/^>\s+/, ''))
      continue
    }

    // List item
    const liMatch = t.match(/^(?:-|\*)\s+(.*)$/)
    if (liMatch?.[1]) {
      flushQuote()
      flushParagraph()
      listBuf.push(liMatch[1])
      continue
    }

    // Paragraph continuation
    flushQuote()
    flushList()
    buf.push(t)
  }

  flushQuote()
  flushList()
  flushParagraph()
  return blocks
}

type HtmlNode = React.ReactNode

function safeUrl(url: string | null | undefined) {
  const u = String(url || '').trim()
  if (!u) return null
  if (/^https?:\/\//i.test(u)) return u
  return null
}

function renderSafeHtml(content: string): HtmlNode[] {
  const html = String(content || '')
  const out: HtmlNode[] = []

  if (typeof window === 'undefined') return out
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const body = doc.body

  const walk = (node: ChildNode, key: string): HtmlNode | null => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || ''
    if (node.nodeType !== Node.ELEMENT_NODE) return null

    const el = node as HTMLElement
    const tag = el.tagName.toLowerCase()
    const children = Array.from(el.childNodes).map((c, i) => walk(c, `${key}-${i}`)).filter((x) => x !== null)

    if (tag === 'p') return <p key={key} className="text-gray-800 leading-relaxed">{children}</p>
    if (tag === 'br') return <br key={key} />
    if (tag === 'strong' || tag === 'b') return <strong key={key} className="font-semibold text-gray-900">{children}</strong>
    if (tag === 'em' || tag === 'i') return <em key={key} className="italic">{children}</em>
    if (tag === 'h1') return <h2 key={key} className="text-3xl font-bold text-gray-900">{children}</h2>
    if (tag === 'h2') return <h2 key={key} className="text-2xl font-bold text-gray-900">{children}</h2>
    if (tag === 'h3') return <h3 key={key} className="text-xl font-bold text-gray-900">{children}</h3>
    if (tag === 'ul') return <ul key={key} className="list-disc pl-6 space-y-2 text-gray-800">{children}</ul>
    if (tag === 'ol') return <ol key={key} className="list-decimal pl-6 space-y-2 text-gray-800">{children}</ol>
    if (tag === 'li') return <li key={key} className="leading-relaxed">{children}</li>
    if (tag === 'blockquote') {
      return (
        <blockquote key={key} className="border-l-4 border-picc-ochre-300 bg-warm-100/40 px-4 py-3 rounded-r-lg">
          <div className="text-gray-800 italic leading-relaxed">{children}</div>
        </blockquote>
      )
    }
    if (tag === 'a') {
      const href = safeUrl(el.getAttribute('href'))
      if (!href) return <span key={key}>{children}</span>
      return (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-picc-red hover:text-picc-earth underline underline-offset-2"
        >
          {children.length ? children : href}
        </a>
      )
    }
    if (tag === 'img') {
      const src = safeUrl(el.getAttribute('src'))
      if (!src) return null
      const alt = el.getAttribute('alt') || 'Story image'
      return (
        <figure key={key} className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <img src={src} alt={alt} className="w-full h-auto object-cover" />
          {alt ? <figcaption className="px-4 py-3 text-sm text-gray-600">{alt}</figcaption> : null}
        </figure>
      )
    }
    if (tag === 'iframe') {
      const src = safeUrl(el.getAttribute('src'))
      if (!src) return null
      const embedSrc = getEmbedUrl(src)
      return (
        <div key={key} className="rounded-xl overflow-hidden border border-gray-200 bg-black">
          <div className="aspect-video">
            <iframe
              src={embedSrc}
              title="Video embed"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )
    }
    if (tag === 'video') {
      const src = safeUrl(el.getAttribute('src'))
      if (src) {
        return (
          <div key={key} className="rounded-xl overflow-hidden border border-gray-200 bg-black">
            <video src={src} controls className="w-full h-auto" />
          </div>
        )
      }
      // Handle <video><source src="..."></video>
      const source = el.querySelector('source')?.getAttribute('src')
      const s = safeUrl(source)
      if (!s) return null
      return (
        <div key={key} className="rounded-xl overflow-hidden border border-gray-200 bg-black">
          <video src={s} controls className="w-full h-auto" />
        </div>
      )
    }

    // Default: unwrap unknown tags (drop the element but keep text).
    return <React.Fragment key={key}>{children}</React.Fragment>
  }

  Array.from(body.childNodes).forEach((n, i) => {
    const rendered = walk(n, `h-${i}`)
    if (rendered !== null) out.push(rendered)
  })

  return out
}

export default function StoryContentRenderer({ content }: { content: string }) {
  const isHtml = React.useMemo(() => looksLikeHtml(content), [content])
  const blocks = React.useMemo(() => (isHtml ? [] : parseBlocks(content)), [content, isHtml])
  const htmlNodes = React.useMemo(() => (isHtml ? renderSafeHtml(content) : []), [content, isHtml])

  return (
    <div className="space-y-5">
      {isHtml ? htmlNodes : null}
      {blocks.map((b, idx) => {
        if (b.type === 'heading') {
          const base =
            b.level === 1
              ? 'text-3xl font-bold text-gray-900'
              : b.level === 2
                ? 'text-2xl font-bold text-gray-900'
                : 'text-xl font-bold text-gray-900'
          return (
            <h2 key={`h-${idx}`} className={base}>
              {b.text}
            </h2>
          )
        }

        if (b.type === 'paragraph') {
          return (
            <p key={`p-${idx}`} className="text-gray-800 leading-relaxed">
              {renderInline(b.text)}
            </p>
          )
        }

        if (b.type === 'quote') {
          return (
            <blockquote key={`q-${idx}`} className="border-l-4 border-picc-ochre-300 bg-warm-100/40 px-4 py-3 rounded-r-lg">
              <p className="text-gray-800 italic leading-relaxed">{renderInline(b.text)}</p>
            </blockquote>
          )
        }

        if (b.type === 'list') {
          return (
            <ul key={`ul-${idx}`} className="list-disc pl-6 space-y-2 text-gray-800">
              {b.items.map((item, j) => (
                <li key={`li-${idx}-${j}`} className="leading-relaxed">
                  {renderInline(item)}
                </li>
              ))}
            </ul>
          )
        }

        if (b.type === 'image') {
          return (
            <figure key={`img-${idx}`} className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <img src={b.url} alt={b.alt || 'Story image'} className="w-full h-auto object-cover" />
              {b.alt ? <figcaption className="px-4 py-3 text-sm text-gray-600">{b.alt}</figcaption> : null}
            </figure>
          )
        }

        if (b.type === 'embed') {
          const parsed = parseEmbed(b.url)
          const providerLabel: Record<EmbedProvider, string> = {
            youtube: 'YouTube',
            vimeo: 'Vimeo',
            descript: 'Descript',
            unknown: 'Video',
          }

          if (isDirectVideoUrl(parsed.src)) {
            return (
              <div key={`e-${idx}`} className="rounded-xl overflow-hidden border border-gray-200 bg-black">
                <video src={parsed.src} controls className="w-full h-auto" />
              </div>
            )
          }

          if (parsed.provider === 'unknown') {
            return (
              <div key={`e-${idx}`} className="rounded-xl border border-gray-200 bg-white p-4">
                <a
                  href={parsed.src}
                  target="_blank"
                  rel="noreferrer"
                  className="text-picc-red hover:text-picc-earth underline underline-offset-2"
                >
                  {parsed.src}
                </a>
              </div>
            )
          }

          return (
            <div key={`e-${idx}`} className="rounded-xl overflow-hidden border border-gray-200 bg-black">
              <div className="aspect-video">
                <iframe
                  src={parsed.src}
                  title={`${providerLabel[parsed.provider]} embed`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )
        }

        return null
      })}
    </div>
  )
}
