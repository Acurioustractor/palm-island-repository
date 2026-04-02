import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { ContentItem, ContentRecommendation, CurationContext } from '@/lib/content-curator/types'

export const maxDuration = 30

function fallbackRecommendations(
  available: ContentItem[],
  context: CurationContext
): ContentRecommendation[] {
  const maxItems = context.maxItems ?? 12
  const sorted = [...available].sort((a, b) => b.score - a.score)
  return sorted.slice(0, maxItems).map((item) => ({
    item,
    reason: `High relevance score (${item.score}/100)`,
    confidence: item.score,
  }))
}

export async function POST(request: NextRequest) {
  try {
    const { context, available } = (await request.json()) as {
      context: CurationContext
      available: ContentItem[]
    }

    if (!context || !available || !Array.isArray(available)) {
      return NextResponse.json(
        { error: 'Missing context or available items' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      // Fallback: sort by score
      return NextResponse.json({
        recommendations: fallbackRecommendations(available, context),
      })
    }

    const anthropic = new Anthropic({ apiKey })

    // Summarize available content for the prompt (keep token count reasonable)
    const summary = available.slice(0, 60).map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      preview: item.preview.slice(0, 120),
      author: item.author,
      tags: item.tags,
      score: item.score,
    }))

    const maxItems = context.maxItems ?? 12

    const systemPrompt = `You are a content curator for Palm Island Community Company (PICC), an Indigenous community organisation on Palm Island, Queensland. Given the page context and available content items, recommend the best items to feature.

Consider:
- Cultural significance and community relevance
- Visual quality and storytelling impact
- Audience relevance (${context.audience})
- Diversity of content types and voices
- Recency and timeliness

The page purpose is: ${context.page}
${context.theme ? `Theme focus: ${context.theme}` : ''}

Return a JSON array of recommendations. Each recommendation has:
- "id": the content item ID
- "reason": 1 sentence explaining why this item is recommended
- "confidence": 0-100 score

Return at most ${maxItems} items. Return ONLY valid JSON, no markdown fences.`

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Here are the available content items:\n\n${JSON.stringify(summary, null, 2)}\n\nRecommend the best items for this page.`,
        },
      ],
    })

    const text =
      response.content[0].type === 'text' ? response.content[0].text : ''

    let parsed: Array<{ id: string; reason: string; confidence: number }>
    try {
      parsed = JSON.parse(text)
    } catch {
      // Try extracting JSON from response
      const match = text.match(/\[[\s\S]*\]/)
      if (match) {
        parsed = JSON.parse(match[0])
      } else {
        return NextResponse.json({
          recommendations: fallbackRecommendations(available, context),
        })
      }
    }

    const itemMap = new Map(available.map((item) => [item.id, item]))
    const recommendations: ContentRecommendation[] = []

    for (const rec of parsed) {
      const item = itemMap.get(rec.id)
      if (item) {
        recommendations.push({
          item,
          reason: rec.reason,
          confidence: rec.confidence ?? item.score,
        })
      }
    }

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error('Content curator recommend error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}
