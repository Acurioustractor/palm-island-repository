import { streamText, stepCountIs, convertToModelMessages } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { exploreTools } from '@/lib/explore/tools'
import { getExploreSystemPrompt } from '@/lib/explore/system-prompt'
import { rateLimit, RateLimitType } from '@/lib/ai/rate-limit'
import { getExpandedContext } from '@/lib/ai/context-builder'
import { expandQuery } from '@/lib/ai/query-expansion'
import { logChatMessage } from '@/lib/chat/session-logger'

export const maxDuration = 60

function getChatModel() {
  // Primary: MiniMax M2.5 via OpenAI-compatible API (~95% cheaper than Sonnet)
  const minimaxKey = process.env.MINIMAX_API_KEY
  if (minimaxKey) {
    const minimax = createOpenAICompatible({
      name: 'minimax',
      baseURL: 'https://api.minimax.io/v1',
      apiKey: minimaxKey,
    })
    return minimax.chatModel('MiniMax-M2.5')
  }

  // Fallback: Claude Haiku (cheapest Anthropic option)
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (anthropicKey) {
    const provider = createAnthropic({ apiKey: anthropicKey })
    return provider('claude-haiku-4-5-20251001')
  }

  throw new Error('No AI API key configured (MINIMAX_API_KEY or ANTHROPIC_API_KEY)')
}

export async function POST(request: Request) {
  const { success, retryAfter } = await rateLimit(request, RateLimitType.CHAT)
  if (!success) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded', retryAfter }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const { messages, sessionId, audience } = await request.json()

  // Extract latest user message for RAG context
  const latestUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === 'user')
  const userText = typeof latestUserMsg?.content === 'string'
    ? latestUserMsg.content
    : Array.isArray(latestUserMsg?.content)
      ? latestUserMsg.content.map((p: { text?: string }) => p.text || '').join(' ')
      : ''

  // Log user message to chat_sessions (fire-and-forget)
  if (sessionId && userText) {
    logChatMessage(sessionId, 'user', userText, audience).catch(() => {})
  }

  // Expand query for better search (typo correction, synonyms)
  let searchQuery = userText
  try {
    const expanded = await expandQuery(userText, {
      context: 'Palm Island community knowledge base',
      maxAlternatives: 2
    })
    searchQuery = expanded.expanded || userText
  } catch (e) {
    // Non-fatal — use original query
  }

  // Get context from all data tables (15K token budget — sufficient for MiniMax/Haiku)
  let ragContext = ''
  let ragSources: Array<{ title: string; url: string; type: string }> = []
  try {
    const expanded = await getExpandedContext(searchQuery, { limit: 8, maxContextTokens: 15000 })
    ragContext = expanded.context
    ragSources = expanded.sources
  } catch (e) {
    console.error('Context builder error:', e)
  }

  // Build audience-aware system prompt
  const basePrompt = getExploreSystemPrompt(audience || 'community')

  // Build dynamic system prompt with RAG context appended
  const systemWithRAG = ragContext
    ? `${basePrompt}

## Retrieved Context (from knowledge base)
${ragContext}

## Source Attribution
When you use information from the retrieved context above, mention the source naturally. Available sources:
${ragSources.map(s => `- ${s.title} (${s.type}): ${s.url}`).join('\n')}
`
    : basePrompt

  // Trim conversation history if it's getting too long (~80K tokens)
  const estimatedTokens = JSON.stringify(messages).length / 4
  const trimmedMessages = estimatedTokens > 80_000
    ? messages.slice(-20)
    : messages

  try {
    const result = streamText({
      model: getChatModel(),
      system: systemWithRAG,
      messages: await convertToModelMessages(trimmedMessages),
      tools: exploreTools,
      stopWhen: stepCountIs(5),
    })

    return result.toUIMessageStreamResponse()
  } catch (error: any) {
    console.error('Chat stream error:', error)
    return new Response(
      JSON.stringify({ error: error?.message || 'Chat failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
