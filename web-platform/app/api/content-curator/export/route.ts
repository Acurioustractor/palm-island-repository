import { NextRequest, NextResponse } from 'next/server'
import type { ContentCollection, ContentItem } from '@/lib/content-curator/types'

export async function POST(request: NextRequest) {
  try {
    const { name, purpose, items } = (await request.json()) as {
      name: string
      purpose: string
      items: ContentItem[]
    }

    if (!name || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Missing name or items' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    const collection: ContentCollection = {
      id: crypto.randomUUID(),
      name,
      purpose: purpose || 'custom',
      items,
      createdAt: now,
      updatedAt: now,
    }

    // Future: save to Supabase table `content_collections`
    // For now, return the collection as JSON for client-side storage
    return NextResponse.json({ collection })
  } catch (error) {
    console.error('Content curator export error:', error)
    return NextResponse.json(
      { error: 'Failed to export collection' },
      { status: 500 }
    )
  }
}
