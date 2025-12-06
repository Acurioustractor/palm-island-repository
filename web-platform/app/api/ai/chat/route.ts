/**
 * AI Chat API Route
 *
 * Handles chat requests with RAG-based responses
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  generateChatResponse,
  streamChatResponse,
  saveConversation,
  loadConversation,
  getConversationStarters,
  ChatContext
} from '@/lib/ai/chat-assistant'
import { rateLimit, RateLimitType } from '@/lib/ai/rate-limit'

export async function POST(request: NextRequest) {
  // Rate limit: 30 chat messages per minute
  const rateLimitResult = await rateLimit(request, RateLimitType.CHAT)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait before sending more messages.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const { message, conversationId, messages = [], stream = false } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Load existing conversation if ID provided
    let conversationMessages = messages
    if (conversationId && messages.length === 0) {
      const loaded = await loadConversation(conversationId)
      if (loaded) {
        conversationMessages = loaded
      }
    }

    const context: ChatContext = {
      conversationId,
      messages: conversationMessages
    }

    if (stream) {
      // Return streaming response
      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamChatResponse(message, context)) {
              const data = JSON.stringify(chunk) + '\n'
              controller.enqueue(encoder.encode(data))
            }
            controller.close()
          } catch (error) {
            controller.error(error)
          }
        }
      })

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      })
    }

    // Non-streaming response
    const response = await generateChatResponse(message, context)

    // Save conversation
    const updatedMessages = [
      ...conversationMessages,
      { role: 'user' as const, content: message, timestamp: new Date().toISOString() },
      { role: 'assistant' as const, content: response.message, sources: response.sources, timestamp: new Date().toISOString() }
    ]
    await saveConversation(response.conversationId, updatedMessages)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const conversationId = searchParams.get('conversationId')

  if (action === 'starters') {
    return NextResponse.json({
      starters: getConversationStarters()
    })
  }

  if (action === 'load' && conversationId) {
    const messages = await loadConversation(conversationId)
    return NextResponse.json({
      messages: messages || []
    })
  }

  return NextResponse.json(
    { error: 'Invalid action' },
    { status: 400 }
  )
}
