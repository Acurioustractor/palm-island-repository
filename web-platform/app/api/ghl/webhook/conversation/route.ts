import { NextRequest, NextResponse } from 'next/server'
import { generateText, stepCountIs } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createServerSupabase } from '@/lib/supabase/client'
import { exploreTools } from '@/lib/explore/tools'
import { getExploreSystemPrompt } from '@/lib/explore/system-prompt'
import { getExpandedContext } from '@/lib/ai/context-builder'
import { expandQuery } from '@/lib/ai/query-expansion'
import { getConversationHistory, shouldEscalate } from '@/lib/messaging/conversation-context'
import { formatResponse } from '@/lib/messaging/format-response'
import { canSendMessage } from '@/lib/messaging/cultural-safety'
import { getGHLClient } from '@/lib/ghl/client'

export const maxDuration = 30

function getChatModel() {
  const minimaxKey = process.env.MINIMAX_API_KEY
  if (minimaxKey) {
    const minimax = createOpenAICompatible({
      name: 'minimax',
      baseURL: 'https://api.minimax.io/v1',
      apiKey: minimaxKey,
    })
    return minimax.chatModel('MiniMax-M2.5')
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (anthropicKey) {
    const provider = createAnthropic({ apiKey: anthropicKey })
    return provider('claude-haiku-4-5-20251001')
  }

  throw new Error('No AI API key configured')
}

/**
 * POST /api/ghl/webhook/conversation
 *
 * Handles question-type messages by running the same AI pipeline
 * as the web chat (tools, RAG, query expansion) but returns a
 * single text response instead of streaming.
 */
export async function POST(request: NextRequest) {
  try {
    const { contactId, conversationId, body, messageType, messageId } = await request.json()

    if (!contactId || !conversationId || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServerSupabase()
    const msgType = (messageType || 'sms') as 'sms' | 'whatsapp' | 'email'

    // Check if we should escalate to human
    const escalation = await shouldEscalate(conversationId)
    if (escalation.escalate) {
      const escalationMsg = formatResponse(
        'It seems like I might not be answering your question well enough. ' +
        'Would you like to speak with someone from the PICC team? ' +
        'Call us on (07) 4770 1177 or email admin@picc.com.au.',
        msgType
      )

      await sendAndLog(supabase, conversationId, contactId, msgType, escalationMsg, 'escalation')
      return NextResponse.json({ sent: true, escalated: true })
    }

    // Load conversation history
    const history = await getConversationHistory(conversationId)

    // Expand query for better search
    let searchQuery = body
    try {
      const expanded = await expandQuery(body, {
        context: 'Palm Island community knowledge base',
        maxAlternatives: 2,
      })
      searchQuery = expanded.expanded || body
    } catch {
      // Non-fatal
    }

    // Get RAG context
    let ragContext = ''
    try {
      const expanded = await getExpandedContext(searchQuery, { limit: 6, maxContextTokens: 10000 })
      ragContext = expanded.context
    } catch (e) {
      console.error('[conversation] Context builder error:', e)
    }

    // Build system prompt — SMS-optimised version
    const basePrompt = getExploreSystemPrompt('community')
    const smsPrompt = `${basePrompt}

## SMS/WhatsApp Response Rules
- Keep responses SHORT — max 3-4 sentences for SMS, max 6-8 for WhatsApp.
- No markdown formatting, no headers, no bullet points, no emojis.
- Plain text only. Write like you're texting a friend.
- No follow-up suggestions (no <follow-ups> tags).
- If the question needs a long answer, give a brief summary and suggest they visit picc.com.au or call (07) 4770 1177 for more detail.
- Always be warm, use community language ("our mob", "here on Palm Island").
${ragContext ? `\n## Retrieved Context\n${ragContext}` : ''}`

    // Build messages array with history
    const messages = [
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: body },
    ]

    // Generate response (non-streaming — single text result after tool use)
    const { text } = await generateText({
      model: getChatModel(),
      system: smsPrompt,
      messages,
      tools: exploreTools,
      stopWhen: stepCountIs(3),
      maxOutputTokens: 500,
    })

    const responseText = text || 'Sorry, I couldn\'t find an answer to that. Try calling us on (07) 4770 1177 or visit picc.com.au.'

    // Format for the message channel
    const formatted = formatResponse(responseText, msgType)

    // Send via GHL and log
    await sendAndLog(supabase, conversationId, contactId, msgType, formatted, 'conversation')

    return NextResponse.json({ sent: true, responseLength: formatted.length })
  } catch (err) {
    console.error('[conversation] Handler error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

async function sendAndLog(
  supabase: ReturnType<typeof createServerSupabase>,
  conversationId: string,
  contactId: string,
  msgType: 'sms' | 'whatsapp' | 'email',
  message: string,
  routedTo: string
) {
  const canSend = await canSendMessage(contactId)
  if (!canSend.allowed) {
    console.log(`[conversation] Cannot send to ${contactId}: ${canSend.reason}`)
    return
  }

  const ghl = getGHLClient()
  if (ghl.isConfigured()) {
    await ghl.sendMessage(conversationId, message, msgType)
  }

  // Log outbound message
  await supabase.from('community_messages').insert({
    ghl_contact_id: contactId,
    ghl_conversation_id: conversationId,
    direction: 'outbound',
    message_type: msgType,
    body: message,
    intent_classified: 'question',
    routed_to: routedTo,
  })
}
