'use client'

export function guessVideoMimeType(url: string) {
  const clean = String(url || '').split('#')[0]?.split('?')[0] || ''
  const ext = clean.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'mp4':
      return 'video/mp4'
    case 'webm':
      return 'video/webm'
    case 'mov':
      return 'video/quicktime'
    case 'm4v':
      return 'video/x-m4v'
    case 'ogv':
    case 'ogg':
      return 'video/ogg'
    default:
      return undefined
  }
}

export function isDirectVideoFile(url: string) {
  return !!guessVideoMimeType(url)
}

export function getEmbedUrl(url: string, opts?: { autoplay?: boolean }) {
  const autoplay = opts?.autoplay === true
  const value = String(url || '').trim()

  // YouTube
  const youtubeMatch = value.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s?]+)/)
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=${autoplay ? 1 : 0}&rel=0`
  }

  // Vimeo
  const vimeoMatch = value.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=${autoplay ? 1 : 0}`
  }

  // Descript share links
  const descriptShare = value.match(/^https?:\/\/share\.descript\.com\/view\/([A-Za-z0-9]+)/)
  if (descriptShare) {
    const id = descriptShare[1]
    const q = autoplay ? '?autoplay=1' : ''
    return `https://share.descript.com/embed/${id}${q}`
  }

  // If it's already an embed link, allow it through.
  if (value.includes('share.descript.com/embed/')) return value

  return value
}
