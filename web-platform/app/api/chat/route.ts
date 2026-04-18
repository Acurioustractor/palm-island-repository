import { streamText, stepCountIs, convertToModelMessages } from 'ai'
import { exploreTools } from '@/lib/explore/tools'
import { getExploreSystemPrompt } from '@/lib/explore/system-prompt'
import { rateLimit, RateLimitType } from '@/lib/ai/rate-limit'
import { getExpandedContext } from '@/lib/ai/context-builder'
import { expandQuery } from '@/lib/ai/query-expansion'
import { logChatMessage } from '@/lib/chat/session-logger'
import { getTextModel } from '@/lib/ai/models'

export const maxDuration = 60

function getChatModel() {
  return getTextModel()
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

  const modelMessages = await convertToModelMessages(trimmedMessages)

  const doStream = (model: ReturnType<typeof getChatModel>) => {
    return streamText({
      model,
      system: systemWithRAG,
      messages: modelMessages,
      tools: exploreTools,
      stopWhen: stepCountIs(5),
      onError: ({ error }) => {
        console.error('Stream error from model:', error)
      },
    })
  }

  // Try primary model; on failure, fall back to Anthropic
  const primaryModel = getChatModel()
  const result = doStream(primaryModel)

  // Use a TransformStream to detect errors in the first chunk and retry with fallback
  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()
  const reader = result.toUIMessageStreamResponse().body!.getReader()

  const pump = async () => {
    let firstChunk = true
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          await writer.close()
          return
        }

        // First chunk: just check for auth errors and surface them — no Anthropic
        // fallback here; Anthropic budget is exhausted, silent failover would
        // bill us. Surface the error to the client instead.
        if (firstChunk) {
          firstChunk = false
          const text = new TextDecoder().decode(value)
          if (text.includes('error') && text.includes('authorized_error')) {
            console.error('MiniMax model auth failed — no fallback configured')
            reader.cancel()
            await writer.close()
            return
          }
        }

        await writer.write(value)
      }
    } catch (err) {
      console.error('Stream pump error:', err)
      await writer.close()
    }
  }

  pump()

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
