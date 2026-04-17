import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for batch processing

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/** Simplified report-aligned tag taxonomy */
const VALID_TAGS = [
  'community', 'youth', 'culture', 'services', 'staff',
  'landscape', 'event', 'hero-quality', 'portrait', 'group',
  'aerial', 'close-up', 'wide',
] as const

const ANALYSIS_PROMPT = `Analyze this photo from Palm Island (Bwgcolman), an Aboriginal community.

Assign 2-5 tags from ONLY these: community, youth, culture, services, staff, landscape, event, hero-quality, portrait, group, aerial, close-up, wide
- hero-quality: only if high-res, well-composed, suitable as cover/full-page
- portrait: 1 person is the clear subject
- group: 3+ people visible
- landscape: scenery, place, environment with no/minimal people
- aerial: drone or elevated perspective
- close-up: tight framing on subject
- wide: wide-angle or panoramic composition

Return JSON: { "tags": [...], "description": "1-2 sentences", "alt_text": "max 125 chars" }
Return ONLY the JSON, no other text.`

/** Noise tags to remove unconditionally */
const NOISE_TAGS = new Set([
  'photo', 'page-render', 'pdf-extract', 'picc', 'palm-island',
  'annual-report', 'high-resolution', 'bwgcolman', 'aboriginal',
  'indigenous', 'torres-strait', 'queensland',
])

/** Prefixed tags worth keeping */
const VALUABLE_PREFIXES = ['fy:', 'event:', 'person:', 'role:', 'service:']

/** Prefixed tags to strip */
const JUNK_PREFIXES = [
  'section:', 'content:', 'page:', 'audit:', 'source:', 'setting:',
  'program:', 'collection:', 'innovation:', 'profile:', 'usage:',
  'project:', 'subject:',
]

/** Returns true if a tag is noise and should be removed */
function isNoiseTag(tag: string): boolean {
  const lower = tag.toLowerCase()
  // Exact noise match
  if (NOISE_TAGS.has(lower)) return true
  // Pure number tag (e.g. "2024", "001")
  if (/^\d+$/.test(lower)) return true
  // Junk prefix
  if (JUNK_PREFIXES.some((p) => lower.startsWith(p))) return true
  return false
}

/** Returns true if a tag is a valuable prefixed tag that should be preserved across analysis */
function isValuablePrefixedTag(tag: string): boolean {
  const lower = tag.toLowerCase()
  return VALUABLE_PREFIXES.some((p) => lower.startsWith(p))
}

/** Strip noise tags from a tag array, return cleaned tags */
function cleanTags(tags: string[]): string[] {
  return tags.filter((t) => !isNoiseTag(t))
}

/** Check if any tags in the array are noise */
function hasNoiseTags(tags: string[]): boolean {
  return tags.some((t) => isNoiseTag(t))
}

interface BatchResult {
  media_id: string
  success: boolean
  error?: string
  tags?: string[]
  description?: string
  cleaned?: boolean
}

/** Check if a media record has been AI-analyzed (uses metadata JSONB) */
function isAnalyzed(metadata: any): boolean {
  return !!metadata?.ai_analysis?.analyzed_at
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { limit = 10, reanalyze = false, cleanOnly = false } = body as {
      limit?: number
      reanalyze?: boolean
      cleanOnly?: boolean
    }

    const clampedLimit = Math.min(Math.max(1, limit), cleanOnly ? 500 : 50)
    const supabase = getSupabase()

    // --- cleanOnly mode: strip noise tags without AI analysis ---
    if (cleanOnly) {
      const { data: mediaRecords, error: fetchError } = await supabase
        .from('media_files')
        .select('id, tags, metadata')
        .eq('file_type', 'image')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(clampedLimit)

      if (fetchError) throw fetchError
      if (!mediaRecords || mediaRecords.length === 0) {
        return NextResponse.json({ processed: 0, failed: 0, remaining: 0, results: [] })
      }

      // Only process records that actually have noise tags
      const withNoise = mediaRecords.filter((m: any) => {
        const tags = Array.isArray(m.tags) ? m.tags : []
        return hasNoiseTags(tags)
      })

      const results: BatchResult[] = []
      let processed = 0
      let failed = 0

      for (const item of withNoise) {
        try {
          const originalTags: string[] = Array.isArray(item.tags) ? item.tags : []
          const cleaned = cleanTags(originalTags)

          await supabase
            .from('media_files')
            .update({
              tags: cleaned,
              metadata: {
                ...(item.metadata || {}),
                tag_cleanup: {
                  cleaned_at: new Date().toISOString(),
                  removed_count: originalTags.length - cleaned.length,
                },
              },
            })
            .eq('id', item.id)

          processed++
          results.push({
            media_id: item.id,
            success: true,
            tags: cleaned,
            cleaned: true,
          })
        } catch (err: any) {
          failed++
          results.push({
            media_id: item.id,
            success: false,
            error: err?.message || 'Cleanup failed',
          })
        }
      }

      return NextResponse.json({
        processed,
        failed,
        remaining: 0,
        results,
      })
    }

    // --- AI analysis mode ---
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    // Fetch unanalyzed photos directly — page through all records
    // We fetch a larger batch and filter in-memory since metadata JSONB filtering is complex
    const pageSize = 500
    let allUnanalyzed: any[] = []
    let offset = 0

    // Page through all images to find unanalyzed ones
    while (allUnanalyzed.length < clampedLimit) {
      const { data: batch, error: batchError } = await supabase
        .from('media_files')
        .select('id, public_url, tags, metadata')
        .eq('file_type', 'image')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1)

      if (batchError) throw batchError
      if (!batch || batch.length === 0) break

      const unanalyzedInPage = reanalyze
        ? batch
        : batch.filter((m: any) => !isAnalyzed(m.metadata))

      allUnanalyzed.push(...unanalyzedInPage)
      offset += pageSize

      // If we got fewer than pageSize, we've reached the end
      if (batch.length < pageSize) break
    }

    if (allUnanalyzed.length === 0) {
      return NextResponse.json({
        processed: 0,
        failed: 0,
        remaining: 0,
        results: [],
      })
    }

    const toProcess = allUnanalyzed.slice(0, clampedLimit)

    // Get total remaining count
    const { data: countData } = await supabase
      .from('media_files')
      .select('metadata', { count: 'exact' })
      .eq('file_type', 'image')
      .is('deleted_at', null)

    const totalUnanalyzed = countData
      ? countData.filter((m: any) => !isAnalyzed(m.metadata)).length
      : allUnanalyzed.length

    const results: BatchResult[] = []
    let processed = 0
    let failed = 0

    // Process sequentially to avoid rate limits
    for (const item of toProcess) {
      try {
        // Step 1: Strip noise tags, preserve valuable prefixed tags
        const existingTags: string[] = Array.isArray(item.tags) ? item.tags : []
        const preservedTags = existingTags.filter((t) => isValuablePrefixedTag(t))

        // Step 2: AI analysis
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'url', url: item.public_url },
              },
              { type: 'text', text: ANALYSIS_PROMPT },
            ],
          }],
        })

        const aiText = response.content[0].type === 'text' ? response.content[0].text : ''
        const jsonMatch = aiText.match(/\{[\s\S]*\}/)

        if (!jsonMatch) {
          failed++
          results.push({ media_id: item.id, success: false, error: 'No JSON in AI response' })
          continue
        }

        const analysis = JSON.parse(jsonMatch[0])

        // Only keep tags from the valid taxonomy
        const aiTags: string[] = (analysis.tags || [])
          .filter((t: string) => VALID_TAGS.includes(t as any))

        // Step 3: Merge AI tags with preserved prefixed tags (deduplicated)
        const mergedTags = Array.from(new Set([...aiTags, ...preservedTags]))

        const now = new Date().toISOString()

        // Update with merged tags + mark as analyzed in metadata
        await supabase
          .from('media_files')
          .update({
            description: analysis.description || null,
            alt_text: analysis.alt_text || null,
            tags: mergedTags,
            metadata: {
              ...(item.metadata || {}),
              ai_analysis: {
                analyzed_at: now,
              },
            },
          })
          .eq('id', item.id)

        processed++
        results.push({
          media_id: item.id,
          success: true,
          tags: mergedTags,
          description: analysis.description,
        })
      } catch (err: any) {
        failed++
        results.push({
          media_id: item.id,
          success: false,
          error: err?.message || 'Analysis failed',
        })
      }
    }

    return NextResponse.json({
      processed,
      failed,
      remaining: Math.max(0, totalUnanalyzed - processed),
      results,
    })
  } catch (error: any) {
    console.error('Batch analysis error:', error)
    return NextResponse.json(
      { error: error?.message || 'Batch analysis failed' },
      { status: 500 }
    )
  }
}

/** GET - Return stats about analyzed vs unanalyzed media */
export async function GET() {
  try {
    const supabase = getSupabase()

    // Get all image files with metadata and tags for comprehensive stats
    // Page through all records since Supabase defaults to 1000 row limit
    let allImages: any[] = []
    let statsOffset = 0
    const statsPageSize = 1000
    while (true) {
      const { data: batch } = await supabase
        .from('media_files')
        .select('metadata, tags')
        .eq('file_type', 'image')
        .is('deleted_at', null)
        .range(statsOffset, statsOffset + statsPageSize - 1)
      if (!batch || batch.length === 0) break
      allImages.push(...batch)
      if (batch.length < statsPageSize) break
      statsOffset += statsPageSize
    }

    const totalCount = allImages?.length || 0
    const analyzed = allImages?.filter((m: any) => isAnalyzed(m.metadata)).length || 0
    const unanalyzed = totalCount - analyzed

    // Count photos that still have noise tags
    const noiseTagCount = allImages?.filter((m: any) => {
      const tags = Array.isArray(m.tags) ? m.tags : []
      return hasNoiseTags(tags)
    }).length || 0

    // Count photos tagged with audit:junk
    const junkCount = allImages?.filter((m: any) => {
      const tags = Array.isArray(m.tags) ? m.tags : []
      return tags.some((t: string) => t.toLowerCase() === 'audit:junk')
    }).length || 0

    return NextResponse.json({
      total: totalCount,
      analyzed,
      unanalyzed,
      percentTagged: totalCount ? Math.round((analyzed / totalCount) * 100) : 0,
      noiseTagCount,
      junkCount,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to get stats' },
      { status: 500 }
    )
  }
}
