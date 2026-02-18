import { NextRequest, NextResponse } from 'next/server'
import { updateAllEmbeddings } from '@/lib/ai/embeddings'

export const runtime = 'nodejs'
export const maxDuration = 120

const VALID_TYPES = ['story', 'knowledge', 'person', 'annual_report', 'service'] as const

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const contentType = body.type as (typeof VALID_TYPES)[number]

    if (!contentType || !VALID_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    const result = await updateAllEmbeddings(contentType)

    return NextResponse.json({
      type: contentType,
      processed: result.processed,
      errors: result.errors,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}
