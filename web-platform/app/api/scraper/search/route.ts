import { NextRequest, NextResponse } from 'next/server'
import { hybridSearch, getRAGContext, getCorpusStats } from '@/lib/scraper'

// GET - Search scraped content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')
    const includeKnowledge = searchParams.get('include_knowledge') !== 'false'

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      )
    }

    const results = await hybridSearch(query, {
      limit,
      includeKnowledgeBase: includeKnowledge
    })

    return NextResponse.json(results)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Get RAG context for a question
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, maxTokens = 2000, limit = 10 } = body

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    const result = await getRAGContext(question, {
      limit,
      maxContextTokens: maxTokens
    })

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
