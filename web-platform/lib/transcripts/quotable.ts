const TIME_RANGE_REGEX =
  /^\s*\d{1,2}:\d{2}:\d{2}(?:[.,]\d{1,3})?\s*-->\s*\d{1,2}:\d{2}:\d{2}(?:[.,]\d{1,3})?\s*$/

const LEADING_TIME_REGEX =
  /^\s*(?:\[\s*)?(?:\d{1,2}:)?\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d{1,3})?(?:\s*\])?\s*[-–—]?\s*/i

const INLINE_TIME_REGEX = /\b\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d{1,3})?\b/

const SPEAKER_LABEL_REGEX =
  /^\s*(?:(?:speaker\s*\d+)|(?:interviewer)|(?:interviewee)|(?:facilitator)|(?:host)|(?:narrator)|(?:participant))\s*[:\-–—]\s*/i

const ALL_CAPS_LABEL_REGEX = /^\s*[A-Z][A-Z\s]{1,25}\s*[:\-–—]\s*/

export function looksLikeTimecode(text: string) {
  const s = String(text || '')
  if (!s) return false
  if (TIME_RANGE_REGEX.test(s)) return true
  if (LEADING_TIME_REGEX.test(s)) return true
  return INLINE_TIME_REGEX.test(s) && /-->|^\s*\[/.test(s)
}

export function cleanTranscript(input: string) {
  const raw = String(input || '')
  if (!raw) return ''

  const lines = raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')

  const cleaned: string[] = []

  for (let line of lines) {
    line = String(line || '').trim()
    if (!line) {
      cleaned.push('')
      continue
    }

    if (line === 'WEBVTT') continue
    if (/^\d+$/.test(line)) continue
    if (TIME_RANGE_REGEX.test(line)) continue

    line = line.replace(LEADING_TIME_REGEX, '')
    line = line.replace(SPEAKER_LABEL_REGEX, '')
    if (ALL_CAPS_LABEL_REGEX.test(line)) line = line.replace(ALL_CAPS_LABEL_REGEX, '')

    line = line.replace(/\s+/g, ' ').trim()
    if (!line) continue
    cleaned.push(line)
  }

  // Collapse multiple blank lines.
  const joined = cleaned.join('\n').replace(/\n{3,}/g, '\n\n').trim()
  return joined
}

export function cleanupQuoteText(input: string) {
  let s = String(input || '').replace(/\s+/g, ' ').trim()
  s = s.replace(/^["'“”]+/, '').replace(/["'“”]+$/, '').trim()
  s = s.replace(/^\s*[-–—•]+\s*/g, '')
  s = s.replace(/\s*\[(?:music|laughter|applause|inaudible|crosstalk)\]\s*/gi, ' ')
  s = s.replace(/\s+/g, ' ').trim()
  return s
}

export function isLikelyJunkQuote(input: string) {
  const s = cleanupQuoteText(input)
  if (!s) return true
  if (looksLikeTimecode(s)) return true
  if (/^[-–—]+$/.test(s)) return true
  if (/(https?:\/\/|www\.)/i.test(s)) return true
  if (/\b(um+|uh+|erm+)\b/i.test(s) && s.split(/\s+/).length < 10) return true
  if (s.length < 40) return true
  if (s.length > 320) return true
  return false
}

function scoreQuoteText(input: string) {
  const s = cleanupQuoteText(input)
  if (!s) return -1
  if (isLikelyJunkQuote(s)) return -100

  const words = s.split(/\s+/).filter(Boolean)
  const wordCount = words.length

  let score = 0

  // Prefer complete, readable quotes.
  if (/[.!?]"?$/.test(s)) score += 3
  if (wordCount >= 12 && wordCount <= 42) score += 4
  if (wordCount < 12) score -= 2
  if (wordCount > 55) score -= 3

  // Prefer first-person voice and community/culture language.
  if (/\b(i|we|my|our|us)\b/i.test(s)) score += 2
  if (/\b(country|culture|community|elders?|young|youth|family|mob|respect|healing|connection)\b/i.test(s)) score += 2
  if (/\b(proud|grateful|strong|resilient|hope|healed|love|joy)\b/i.test(s)) score += 1

  // Penalize noisy punctuation / numbers.
  const digitCount = (s.match(/\d/g) || []).length
  if (digitCount >= 6) score -= 2
  if (/[{}<>]/.test(s)) score -= 2

  return score
}

export function pickBestQuotes<T extends { quote_text: string }>(quotes: T[], max: number) {
  const seen = new Set<string>()
  const scored = quotes
    .map((q) => ({ q, score: scoreQuoteText(q.quote_text) }))
    .filter((x) => x.score > -50)
    .sort((a, b) => b.score - a.score)

  const picked: T[] = []
  for (const { q } of scored) {
    const key = cleanupQuoteText(q.quote_text).toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    picked.push(q)
    if (picked.length >= max) break
  }
  return picked
}

export function extractQuoteCandidatesFromTranscript(transcript: string, max = 8) {
  const cleaned = cleanTranscript(transcript)
  if (!cleaned) return []

  // Split by paragraphs first; then sentences if punctuation exists.
  const paragraphs = cleaned.split(/\n{2,}/g).map((p) => p.replace(/\n/g, ' ').trim()).filter(Boolean)
  const candidates: string[] = []

  for (const p of paragraphs) {
    const parts = /[.!?]/.test(p)
      ? p.split(/(?<=[.!?])\s+/g).map((s) => s.trim()).filter(Boolean)
      : [p]
    for (const part of parts) candidates.push(part)
  }

  const cleanedCandidates = candidates
    .map(cleanupQuoteText)
    .filter((s) => !isLikelyJunkQuote(s))

  return pickBestQuotes(cleanedCandidates.map((quote_text) => ({ quote_text })), max).map((q) => q.quote_text)
}

