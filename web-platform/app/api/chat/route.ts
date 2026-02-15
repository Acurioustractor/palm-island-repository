import { streamText, stepCountIs, convertToModelMessages } from 'ai'
import { minimax } from 'vercel-minimax-ai-provider'
import { exploreTools } from '@/lib/explore/tools'
import { EXPLORE_SYSTEM_PROMPT } from '@/lib/explore/system-prompt'
import { rateLimit, RateLimitType } from '@/lib/ai/rate-limit'
import { getExpandedContext } from '@/lib/ai/context-builder'

export const maxDuration = 60

export async function POST(request: Request) {
  const { success, retryAfter } = await rateLimit(request, RateLimitType.CHAT)
  if (!success) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded', retryAfter }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const { messages } = await request.json()

  // Extract latest user message for RAG context
  const latestUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === 'user')
  const userText = typeof latestUserMsg?.content === 'string'
    ? latestUserMsg.content
    : Array.isArray(latestUserMsg?.content)
      ? latestUserMsg.content.map((p: { text?: string }) => p.text || '').join(' ')
      : ''

  // Get RAG context from expanded context builder
  let ragContext = ''
  let ragSources: Array<{ title: string; url: string; type: string }> = []
  try {
    const expanded = await getExpandedContext(userText, { limit: 5, maxContextTokens: 3000 })
    ragContext = expanded.context
    ragSources = expanded.sources
  } catch (e) {
    console.error('RAG context error:', e)
  }

  // Build dynamic system prompt with RAG context appended
  const systemWithRAG = ragContext
    ? `${EXPLORE_SYSTEM_PROMPT}

## Retrieved Context (from knowledge base)
${ragContext}

## Source Attribution
When you use information from the retrieved context above, mention the source naturally. Available sources:
${ragSources.map(s => `- ${s.title} (${s.type}): ${s.url}`).join('\n')}
`
    : EXPLORE_SYSTEM_PROMPT

  const result = streamText({
    model: minimax('MiniMax-M2'),
    system: systemWithRAG,
    messages: await convertToModelMessages(messages),
    tools: exploreTools,
    stopWhen: stepCountIs(5),
  })

  return result.toUIMessageStreamResponse()
}
