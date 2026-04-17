import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { cleanTranscript, cleanupQuoteText, isLikelyJunkQuote } from '@/lib/transcripts/quotable'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

interface ExtractedQuote {
  quote_text: string
  context: string
  theme: string
  sentiment: string | null
  impact_area: string
  significance: string
  suggested_for_report: boolean
  evidence_segments?: number[]
}

interface TranscriptAnalysis {
  summary: string
  key_themes: string[]
  extracted_quotes: ExtractedQuote[]
  recommendations: string[]
  total_quotes_found: number
}

type Segment = { segment_index: number; text: string }

function truncateForModel(text: string, maxChars = 24000) {
  const s = String(text || '')
  if (s.length <= maxChars) return s
  const head = Math.floor(maxChars * 0.65)
  const tail = maxChars - head
  return `${s.slice(0, head)}\n\n[... transcript truncated ...]\n\n${s.slice(-tail)}`
}

function looksLikeEncryptedTranscript(input: string) {
  const s = String(input || '').trim()
  if (s.length < 80) return false
  if (/\s/.test(s)) return false
  if (s.startsWith('gAAAA') && /^[A-Za-z0-9_-]+$/.test(s)) return true
  return false
}

function chunkTextBySentence(input: string, maxLen = 420) {
  const s = String(input || '').replace(/\s+/g, ' ').trim()
  if (!s) return []
  if (s.length <= maxLen) return [s]

  const parts = /[.!?]/.test(s)
    ? s.split(/(?<=[.!?])\s+/g).map((t) => t.trim()).filter(Boolean)
    : [s]

  const chunks: string[] = []
  let buf = ''
  for (const part of parts) {
    if (!buf) {
      buf = part
      continue
    }
    if ((buf + ' ' + part).length <= maxLen) {
      buf = buf + ' ' + part
      continue
    }
    chunks.push(buf)
    buf = part
  }
  if (buf) chunks.push(buf)

  // Hard-wrap any remaining very long chunk.
  const hardWrapped: string[] = []
  for (const c of chunks) {
    if (c.length <= maxLen * 1.6) {
      hardWrapped.push(c)
      continue
    }
    for (let i = 0; i < c.length; i += maxLen) {
      hardWrapped.push(c.slice(i, i + maxLen).trim())
    }
  }
  return hardWrapped.filter(Boolean)
}

function buildTranscriptSegments(transcript: string, maxSegments = 400): Segment[] {
  const cleaned = cleanTranscript(transcript)
  if (!cleaned) return []

  const paragraphs = cleaned
    .split(/\n{2,}/g)
    .map((p) => p.replace(/\n/g, ' ').trim())
    .filter(Boolean)

  const segments: Segment[] = []
  for (const p of paragraphs) {
    const chunks = chunkTextBySentence(p, 420)
    for (const text of chunks) {
      segments.push({ segment_index: segments.length, text })
      if (segments.length >= maxSegments) return segments
    }
  }
  return segments
}

function pickSegmentsForModel(segments: Segment[], max = 120) {
  if (segments.length <= max) return segments
  const head = Math.floor(max * 0.65)
  const tail = max - head
  return [...segments.slice(0, head), ...segments.slice(-tail)]
}

const ALLOWED_EXTRACTED_QUOTE_SENTIMENTS = new Set(['positive', 'neutral', 'negative', 'inspiring', 'reflective'])

function normalizeExtractedQuoteSentiment(input: unknown): string | null {
  const raw = String(input ?? '').trim().toLowerCase()
  if (!raw) return null
  if (ALLOWED_EXTRACTED_QUOTE_SENTIMENTS.has(raw)) return raw

  // Common model outputs / synonyms → DB-allowed values (or NULL to satisfy CHECK constraints).
  if (/inspir|hope|determin|empower|uplift/.test(raw)) return 'inspiring'
  if (/reflect|thought|nostalg|bittersweet|mixed|complex/.test(raw)) return 'reflective'
  if (/grate|proud|happy|joy|optim/.test(raw)) return 'positive'
  if (/sad|ang|fear|worr|neg/.test(raw)) return 'negative'
  if (/neut/.test(raw)) return 'neutral'

  return null
}

function normalizeAndFilterQuotes(quotes: ExtractedQuote[]) {
  const seen = new Set<string>()
  const cleaned: ExtractedQuote[] = []

  for (const q of Array.isArray(quotes) ? quotes : []) {
    const quoteText = cleanupQuoteText(q?.quote_text || '')
    if (!quoteText || isLikelyJunkQuote(quoteText)) continue
    const key = quoteText.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)

    const evidenceSegments = Array.isArray((q as any)?.evidence_segments)
      ? (q as any).evidence_segments
          .map((n: any) => Number(n))
          .filter((n: any) => Number.isInteger(n) && n >= 0)
          .slice(0, 6)
      : []

    cleaned.push({
      ...q,
      quote_text: quoteText,
      context: String(q?.context || '').trim(),
      theme: String(q?.theme || '').trim(),
      sentiment: normalizeExtractedQuoteSentiment((q as any)?.sentiment),
      impact_area: String(q?.impact_area || '').trim(),
      significance: String(q?.significance || '').trim(),
      suggested_for_report: Boolean(q?.suggested_for_report),
      evidence_segments: evidenceSegments,
    })
  }

  return cleaned
}

async function insertQuotesWithSchemaFallback(supabase: any, rows: any[]) {
  if (!rows.length) return { inserted: 0, data: [] as any[], error: null as any }

  const attempt = async (payload: any[]) => (supabase as any).from('extracted_quotes').insert(payload).select()

  let payload = rows
  let lastError: any = null

  for (let i = 0; i < 4; i++) {
    const res = await attempt(payload)
    if (!res?.error) return { inserted: (res?.data || []).length, data: res?.data || [], error: null }

    lastError = res.error
    const message = String(res.error?.message || '')
    const missingCol =
      message.match(/Could not find the '([^']+)' column/i)?.[1] ||
      message.match(/column \"([^\"]+)\" of relation \"extracted_quotes\" does not exist/i)?.[1] ||
      null

    if (!missingCol) break

    payload = payload.map((r) => {
      const next = { ...r }
      delete next[missingCol]
      return next
    })
  }

  return { inserted: 0, data: [] as any[], error: lastError }
}

// POST - Analyze an interview transcript and extract quotes
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { interview_id, transcript_text, storyteller_id, storyteller_name } = body

    if (!transcript_text && !interview_id) {
      return NextResponse.json(
        { error: 'Either transcript_text or interview_id is required' },
        { status: 400 }
      )
    }

    let transcript = transcript_text
    let interviewData: any = null
    let profileId = storyteller_id
    let profileName = storyteller_name

    // If interview_id provided, fetch the interview
    if (interview_id) {
      const { data, error } = await (supabase as any)
        .from('interviews')
        .select(`
          *,
          storyteller:storyteller_id(id, full_name, preferred_name)
        `)
        .eq('id', interview_id)
        .single()

      if (error || !data) {
        return NextResponse.json(
          { error: 'Interview not found' },
          { status: 404 }
        )
      }

      interviewData = data

      // Respect cultural protocol flags before extracting quotable content.
      if (data?.can_be_quoted === false) {
        return NextResponse.json(
          { error: 'This interview is marked as not quotable' },
          { status: 403 }
        )
      }
      if (data?.requires_elder_approval === true && !data?.approved_at) {
        return NextResponse.json(
          { error: 'Elder approval is required before quotes can be extracted' },
          { status: 403 }
        )
      }
      if (String(data?.privacy_level || '').toLowerCase() === 'restricted') {
        return NextResponse.json(
          { error: 'This interview is restricted and cannot be analyzed for quotes' },
          { status: 403 }
        )
      }

      transcript = data.edited_transcript || data.raw_transcript
      profileId = data.storyteller_id
      profileName = data.storyteller?.preferred_name || data.storyteller?.full_name || 'Community Member'
    }

    if (!transcript) {
      return NextResponse.json(
        { error: 'No transcript content found' },
        { status: 400 }
      )
    }

    if (looksLikeEncryptedTranscript(transcript)) {
      return NextResponse.json(
        { error: 'Transcript appears to be encrypted; decrypt it before analysis' },
        { status: 400 }
      )
    }

    const allSegments = buildTranscriptSegments(transcript, 400)
    const segmentsForModel = pickSegmentsForModel(allSegments, 120)
    const segmentTextForModel = segmentsForModel.map((s) => `[${s.segment_index}] ${s.text}`).join('\n')

    // Use Claude to analyze the transcript
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Analyze these interview transcript segments from ${profileName || 'a community member'} at Palm Island Community Company. Extract meaningful, print-ready quotes for annual reports, community stories, and immersive story experiences.

TRANSCRIPT SEGMENTS (each line starts with a segment index in brackets):
${truncateForModel(segmentTextForModel, 24000)}

Please analyze and return JSON in this exact format:
{
  "summary": "A 2-3 sentence summary of the interview content and main points discussed",
  "key_themes": ["array", "of", "main", "themes", "discussed"],
  "extracted_quotes": [
    {
      "quote_text": "A direct quote from the transcript (light grammar cleanup OK), with NO timestamps/timecodes, NO speaker labels, and no filler like 'um/uh' unless meaningful",
      "context": "Brief context about what prompted this quote or what it relates to",
      "theme": "One of: community | services | culture | history | achievement | resilience | youth | elders | innovation | connection",
      "sentiment": "One of: positive | neutral | negative | inspiring | reflective",
      "impact_area": "One of: community_wellbeing | cultural_preservation | youth_development | employment | health | education | housing | environment",
      "significance": "Why this quote is meaningful or impactful",
      "suggested_for_report": true or false - whether this quote would work well in an annual report,
      "evidence_segments": [0, 12] - array of 1-3 segment indices (from the transcript segments above) that support this quote
    }
  ],
  "recommendations": ["Suggestions for follow-up questions or stories to explore based on this interview"]
}

Guidelines:
- Extract 3-10 meaningful quotes depending on transcript length
- Each quote should stand alone and be 12-45 words where possible
- Prioritize quotes that show community impact, personal growth, cultural connection, or gratitude
- Clean up quotes for readability but maintain authentic voice
- Look for quotes that tell a story or express emotion
- Flag the most powerful quotes as suggested_for_report: true
- Do NOT include timestamps (e.g., 00:01:23), time ranges, or speaker tags (e.g., "Interviewer:", "Speaker 1:")
- For each quote, include evidence_segments that point to where the quote comes from (or the strongest supporting context)
- Be culturally respectful and sensitive to Indigenous perspectives
- Recognize the strength and resilience of the Palm Island community

Return ONLY the JSON, no other text.`
      }]
    })

    // Parse the AI response
    const aiText = response.content[0].type === 'text' ? response.content[0].text : ''
    let analysis: TranscriptAnalysis

    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiText)
      return NextResponse.json(
        { error: 'Failed to parse AI analysis' },
        { status: 500 }
      )
    }

    analysis.extracted_quotes = normalizeAndFilterQuotes(analysis.extracted_quotes)

    // Upsert transcript segments for provenance (best-effort; does nothing if table doesn't exist)
    const segmentIdByIndex = new Map<number, string>()
    const segmentTextByIndex = new Map<number, string>()
    for (const s of allSegments) segmentTextByIndex.set(s.segment_index, s.text)

    if (interview_id && allSegments.length > 0) {
      try {
        const payload = allSegments.map((s) => ({
          interview_id,
          segment_index: s.segment_index,
          segment_text: s.text,
        }))
        const { data: segRows } = await (supabase as any)
          .from('interview_segments')
          .upsert(payload, { onConflict: 'interview_id,segment_index' })
          .select('id, segment_index')
        for (const row of Array.isArray(segRows) ? segRows : []) {
          segmentIdByIndex.set(Number(row.segment_index), String(row.id))
        }
      } catch {
        // ignore - optional feature
      }
    }

    // Store extracted quotes in the database
    const quotesToInsert = analysis.extracted_quotes.map((quote) => ({
      profile_id: profileId || null,
      interview_id: interview_id || null,
      quote_text: quote.quote_text,
      attribution: profileName || 'Community Member',
      context: quote.context,
      theme: quote.theme,
      sentiment: quote.sentiment,
      impact_area: quote.impact_area,
      suggested_for_report: quote.suggested_for_report,
      is_validated: false, // Requires manual validation
      tenant_id: '9c4e5de2-d80a-4e0b-8a89-1bbf09485532',
      metadata: {
        significance: quote.significance,
        source: interview_id ? 'interview' : 'direct_transcript',
        interview_id: interview_id || null,
        evidence_segments: Array.isArray(quote.evidence_segments) ? quote.evidence_segments : [],
        extraction_date: new Date().toISOString()
      }
    }))

    let insertedQuoteRows: any[] = []
    if (quotesToInsert.length > 0) {
      const { data: inserted, error: insertError } = await insertQuotesWithSchemaFallback(supabase, quotesToInsert)
      if (insertError) console.error('Error inserting quotes:', insertError)
      insertedQuoteRows = inserted || []
    }

    // Store citations (best-effort; does nothing if table doesn't exist)
    if (interview_id && insertedQuoteRows.length > 0) {
      try {
        const quoteIdByText = new Map<string, string>()
        for (const row of insertedQuoteRows) {
          const key = cleanupQuoteText(String(row?.quote_text || '')).toLowerCase()
          if (key) quoteIdByText.set(key, String(row.id))
        }

        const citations: any[] = []
        for (const q of analysis.extracted_quotes) {
          const key = cleanupQuoteText(q.quote_text || '').toLowerCase()
          const quoteId = quoteIdByText.get(key)
          if (!quoteId) continue

          const evidence = Array.isArray(q.evidence_segments) ? q.evidence_segments : []
          for (const idx of evidence) {
            const segmentIndex = Number(idx)
            if (!Number.isInteger(segmentIndex) || segmentIndex < 0) continue
            citations.push({
              quote_id: quoteId,
              interview_id,
              segment_id: segmentIdByIndex.get(segmentIndex) || null,
              segment_index: segmentIndex,
              excerpt: segmentTextByIndex.get(segmentIndex) || null,
              metadata: {
                source: 'ai',
                collected_at: new Date().toISOString(),
              },
            })
          }
        }

        if (citations.length > 0) {
          await (supabase as any).from('extracted_quote_citations').insert(citations)
        }
      } catch {
        // ignore - optional feature
      }
    }

    // Store a review artifact snapshot (best-effort)
    if (interview_id) {
      try {
        await (supabase as any).from('interview_review_artifacts').insert({
          interview_id,
          profile_id: profileId || null,
          artifact_type: 'quote_library',
          title: `Quote library: ${profileName || 'Interview'}`,
          status: 'draft',
          visibility: 'internal',
          content: {
            summary: analysis.summary,
            key_themes: analysis.key_themes,
            recommendations: analysis.recommendations,
            extracted_quotes: analysis.extracted_quotes,
            segments_used_for_model: segmentsForModel.map((s) => s.segment_index),
          },
          metadata: {
            model: 'claude-sonnet-4-6',
            generated_at: new Date().toISOString(),
          },
        })
      } catch {
        // ignore - optional feature
      }
    }

    // Update interview with analysis if interview_id provided
    if (interview_id) {
      await (supabase as any)
        .from('interviews')
        .update({
          key_themes: analysis.key_themes,
          interview_notes: analysis.summary,
          status: 'transcribed',
          metadata: {
            ai_analysis: {
              summary: analysis.summary,
              key_themes: analysis.key_themes,
              quotes_extracted: analysis.extracted_quotes.length,
              recommendations: analysis.recommendations,
              analyzed_at: new Date().toISOString()
            }
          }
        })
        .eq('id', interview_id)
    }

    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        total_quotes_found: analysis.extracted_quotes.length
      },
      quotes_stored: quotesToInsert.length,
      interview_id
    })

  } catch (error: any) {
    console.error('Transcript analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze transcript' },
      { status: 500 }
    )
  }
}

// GET - Get analysis for an interview
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const interview_id = searchParams.get('interview_id')
    const storyteller_id = searchParams.get('storyteller_id')

    const supabase = getSupabase()

    const fetchQuotesForInterview = async (interviewId: string) => {
      // Prefer the dedicated column when present, but fall back to legacy metadata storage.
      try {
        const direct = await (supabase as any)
          .from('extracted_quotes')
          .select('*')
          .eq('interview_id', interviewId)
          .order('created_at')

        if (!direct?.error) {
          const rows = Array.isArray(direct?.data) ? direct.data : []
          if (rows.length > 0) return rows
        } else {
          const message = String(direct.error?.message || '')
          const missingCol =
            message.match(/Could not find the '([^']+)' column/i)?.[1] ||
            message.match(/column \"([^\"]+)\" of relation \"extracted_quotes\" does not exist/i)?.[1] ||
            null
          if (missingCol && missingCol !== 'interview_id') {
            // Some other schema mismatch; don't hide it behind the fallback.
            throw direct.error
          }
        }
      } catch {
        // fall through to metadata lookup
      }

      const legacy = await (supabase as any)
        .from('extracted_quotes')
        .select('*')
        .eq('metadata->>interview_id', interviewId)
        .order('created_at')
      if (!legacy?.error) return Array.isArray(legacy?.data) ? legacy.data : []
      return []
    }

    if (interview_id) {
      // Get specific interview analysis
      const { data: interview } = await (supabase as any)
        .from('interviews')
        .select('id, interview_title, key_themes, interview_notes, metadata')
        .eq('id', interview_id)
        .single()

      const quotes = await fetchQuotesForInterview(interview_id)

      return NextResponse.json({
        interview,
        quotes: quotes || [],
        analysis: interview?.metadata?.ai_analysis
      })
    }

    if (storyteller_id) {
      // Get all quotes for a storyteller
      const { data: quotes } = await (supabase as any)
        .from('extracted_quotes')
        .select('*')
        .eq('profile_id', storyteller_id)
        .order('created_at', { ascending: false })

      const { data: interviews } = await (supabase as any)
        .from('interviews')
        .select('id, interview_title, interview_date, key_themes, status')
        .eq('storyteller_id', storyteller_id)
        .order('interview_date', { ascending: false })

      return NextResponse.json({
        quotes: quotes || [],
        interviews: interviews || [],
        total_quotes: quotes?.length || 0
      })
    }

    return NextResponse.json(
      { error: 'Either interview_id or storyteller_id is required' },
      { status: 400 }
    )

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
