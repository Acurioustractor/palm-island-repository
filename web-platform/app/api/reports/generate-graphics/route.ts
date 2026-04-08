import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { GRAPHIC_PROMPTS, type GraphicPrompt } from '@/lib/annual-report/graphic-prompts'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-2.0-flash-exp'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

const STORAGE_BUCKET = 'platform-media'
const STORAGE_PREFIX = 'report-assets'

/**
 * POST /api/reports/generate-graphics
 *
 * Generate AI illustrations for annual report pages using Gemini,
 * then upload to Supabase Storage.
 *
 * Body: { pages?: string[] } — optional subset of page keys to generate.
 *       If omitted, generates all pages.
 *
 * Returns a streaming NDJSON response with progress updates.
 */
export async function POST(request: NextRequest) {
  // Auth: require login in production
  const isDev = process.env.NODE_ENV === 'development'
  if (!isDev) {
    const supabaseAuth = await createRouteHandlerClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY not configured' },
      { status: 500 }
    )
  }

  const supabase = createServerSupabase()
  let body: { pages?: string[] } = {}
  try {
    body = await request.json()
  } catch {
    // empty body is fine — generate all
  }

  const toGenerate: GraphicPrompt[] = body.pages?.length
    ? GRAPHIC_PROMPTS.filter((p) => body.pages!.includes(p.pageKey))
    : [...GRAPHIC_PROMPTS]

  if (toGenerate.length === 0) {
    return NextResponse.json(
      { error: 'No valid page keys provided' },
      { status: 400 }
    )
  }

  // Stream progress as NDJSON
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'))
      }

      send({ type: 'start', total: toGenerate.length })

      const results: { pageKey: string; url: string; error?: string }[] = []

      for (let i = 0; i < toGenerate.length; i++) {
        const gp = toGenerate[i]
        send({
          type: 'progress',
          index: i,
          total: toGenerate.length,
          pageKey: gp.pageKey,
          label: gp.label,
          status: 'generating',
        })

        try {
          // 1. Generate image with Gemini
          const imageBytes = await generateWithGemini(gp)

          // 2. Upload to Supabase Storage
          const storagePath = `${STORAGE_PREFIX}/${gp.filename}`
          const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(storagePath, imageBytes, {
              contentType: 'image/jpeg',
              upsert: true,
            })

          if (uploadError) {
            throw new Error(`Storage upload failed: ${uploadError.message}`)
          }

          const { data: urlData } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(storagePath)

          const url = urlData.publicUrl
          results.push({ pageKey: gp.pageKey, url })
          send({
            type: 'progress',
            index: i,
            total: toGenerate.length,
            pageKey: gp.pageKey,
            label: gp.label,
            status: 'done',
            url,
          })
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error'
          results.push({ pageKey: gp.pageKey, url: '', error: message })
          send({
            type: 'progress',
            index: i,
            total: toGenerate.length,
            pageKey: gp.pageKey,
            label: gp.label,
            status: 'error',
            error: message,
          })
        }
      }

      send({ type: 'complete', results })
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

/**
 * Call Gemini API to generate an image and return the raw bytes.
 */
async function generateWithGemini(gp: GraphicPrompt): Promise<Buffer> {
  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: gp.prompt,
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['IMAGE', 'TEXT'],
        responseMimeType: 'image/jpeg',
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini API error ${response.status}: ${errorText}`)
  }

  const data = await response.json()

  // Extract image data from response
  const candidates = data.candidates
  if (!candidates?.length) {
    throw new Error('Gemini returned no candidates')
  }

  const parts = candidates[0].content?.parts
  if (!parts?.length) {
    throw new Error('Gemini returned no content parts')
  }

  // Find the image part
  const imagePart = parts.find(
    (p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData?.mimeType?.startsWith('image/')
  )

  if (!imagePart?.inlineData?.data) {
    throw new Error('Gemini response did not contain image data')
  }

  return Buffer.from(imagePart.inlineData.data, 'base64')
}
