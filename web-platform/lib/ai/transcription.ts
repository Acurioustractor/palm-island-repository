/**
 * Video/Audio Transcription Service
 *
 * Uses OpenAI Whisper API to transcribe audio and video content.
 * Supports automatic language detection and timestamps.
 */

import { aiCache, CACHE_TTL } from './cache'

export interface TranscriptionSegment {
  id: number
  start: number
  end: number
  text: string
  confidence?: number
}

export interface TranscriptionResult {
  text: string
  language: string
  duration: number
  segments: TranscriptionSegment[]
  words?: Array<{
    word: string
    start: number
    end: number
  }>
}

export interface TranscriptionOptions {
  language?: string
  prompt?: string
  includeTimestamps?: boolean
  includeWords?: boolean
}

/**
 * Transcribe audio/video file using Whisper API
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  filename: string,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured')
  }

  const {
    language,
    prompt = 'This is a recording from Palm Island, Queensland, Australia. It may include Indigenous Australian voices and cultural content.',
    includeTimestamps = true,
    includeWords = false
  } = options

  // Create form data
  const formData = new FormData()

  // Convert buffer to blob
  const blob = new Blob([audioBuffer], { type: getMimeType(filename) })
  formData.append('file', blob, filename)
  formData.append('model', 'whisper-1')
  formData.append('response_format', 'verbose_json')

  if (language) {
    formData.append('language', language)
  }

  if (prompt) {
    formData.append('prompt', prompt)
  }

  if (includeWords) {
    formData.append('timestamp_granularities[]', 'word')
    formData.append('timestamp_granularities[]', 'segment')
  }

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    },
    body: formData
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Whisper API error: ${error}`)
  }

  const data = await response.json()

  return {
    text: data.text,
    language: data.language,
    duration: data.duration,
    segments: (data.segments || []).map((seg: any, idx: number) => ({
      id: idx,
      start: seg.start,
      end: seg.end,
      text: seg.text.trim(),
      confidence: seg.avg_logprob ? Math.exp(seg.avg_logprob) : undefined
    })),
    words: data.words
  }
}

/**
 * Transcribe from URL (downloads first)
 */
export async function transcribeFromUrl(
  url: string,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  // Download the file
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  const filename = url.split('/').pop() || 'audio.mp3'

  return transcribeAudio(buffer, filename, options)
}

/**
 * Get MIME type from filename
 */
function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop()
  const mimeTypes: Record<string, string> = {
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    m4a: 'audio/m4a',
    wav: 'audio/wav',
    webm: 'video/webm',
    ogg: 'audio/ogg',
    flac: 'audio/flac'
  }
  return mimeTypes[ext || ''] || 'audio/mpeg'
}

/**
 * Format transcription with timestamps for display
 */
export function formatTranscriptionWithTimestamps(
  result: TranscriptionResult,
  options: {
    format?: 'srt' | 'vtt' | 'text' | 'html'
    includeTimestamps?: boolean
  } = {}
): string {
  const { format = 'text', includeTimestamps = true } = options

  switch (format) {
    case 'srt':
      return result.segments.map((seg, i) =>
        `${i + 1}\n${formatSrtTime(seg.start)} --> ${formatSrtTime(seg.end)}\n${seg.text}\n`
      ).join('\n')

    case 'vtt':
      return 'WEBVTT\n\n' + result.segments.map(seg =>
        `${formatVttTime(seg.start)} --> ${formatVttTime(seg.end)}\n${seg.text}\n`
      ).join('\n')

    case 'html':
      return result.segments.map(seg =>
        `<p data-start="${seg.start}" data-end="${seg.end}">
          ${includeTimestamps ? `<span class="timestamp">[${formatDisplayTime(seg.start)}]</span> ` : ''}
          ${seg.text}
        </p>`
      ).join('\n')

    case 'text':
    default:
      if (includeTimestamps) {
        return result.segments.map(seg =>
          `[${formatDisplayTime(seg.start)}] ${seg.text}`
        ).join('\n')
      }
      return result.text
  }
}

/**
 * Format time for SRT (HH:MM:SS,mmm)
 */
function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.round((seconds % 1) * 1000)
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`
}

/**
 * Format time for VTT (HH:MM:SS.mmm)
 */
function formatVttTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.round((seconds % 1) * 1000)
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(ms, 3)}`
}

/**
 * Format time for display (MM:SS or H:MM:SS)
 */
function formatDisplayTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  if (h > 0) {
    return `${h}:${pad(m)}:${pad(s)}`
  }
  return `${m}:${pad(s)}`
}

function pad(num: number, size: number = 2): string {
  return num.toString().padStart(size, '0')
}

/**
 * Extract key moments/highlights from transcription
 */
export async function extractHighlights(
  transcription: TranscriptionResult,
  options: {
    count?: number
    minDuration?: number
    maxDuration?: number
  } = {}
): Promise<Array<{
  title: string
  description: string
  start: number
  end: number
  text: string
}>> {
  const { count = 5, minDuration = 10, maxDuration = 60 } = options

  // Use Claude to identify key moments
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  })

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 800,
      system: `You are analyzing a video/audio transcription from Palm Island community content.
Identify the most important or interesting moments that would make good highlights or clips.

Respond with JSON:
{
  "highlights": [
    {
      "title": "Short title",
      "description": "Why this moment is significant",
      "segment_start": 0,
      "segment_end": 5
    }
  ]
}

segment_start and segment_end are segment indices (0-based).`,
      messages: [{
        role: 'user',
        content: `Transcription segments:
${transcription.segments.map((s, i) => `[${i}] ${formatDisplayTime(s.start)}: ${s.text}`).join('\n')}

Find ${count} highlight moments (each ${minDuration}-${maxDuration} seconds).`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (!jsonMatch) return []

    const parsed = JSON.parse(jsonMatch[0])

    return (parsed.highlights || []).map((h: any) => {
      const startSeg = transcription.segments[h.segment_start] || transcription.segments[0]
      const endSeg = transcription.segments[h.segment_end] || transcription.segments[transcription.segments.length - 1]

      const segmentTexts = transcription.segments
        .slice(h.segment_start, h.segment_end + 1)
        .map(s => s.text)
        .join(' ')

      return {
        title: h.title,
        description: h.description,
        start: startSeg.start,
        end: endSeg.end,
        text: segmentTexts
      }
    })
  } catch (error) {
    console.error('Error extracting highlights:', error)
    return []
  }
}

/**
 * Search within transcription
 */
export function searchTranscription(
  transcription: TranscriptionResult,
  query: string
): Array<TranscriptionSegment & { matchScore: number }> {
  const queryLower = query.toLowerCase()
  const queryWords = queryLower.split(/\s+/)

  return transcription.segments
    .map(segment => {
      const textLower = segment.text.toLowerCase()
      let matchScore = 0

      // Exact phrase match
      if (textLower.includes(queryLower)) {
        matchScore += 10
      }

      // Word matches
      for (const word of queryWords) {
        if (textLower.includes(word)) {
          matchScore += 2
        }
      }

      return { ...segment, matchScore }
    })
    .filter(s => s.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
}
