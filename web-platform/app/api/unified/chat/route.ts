/**
 * Unified Chat API
 *
 * Consolidates /api/chat and /api/ai/chat into one canonical endpoint.
 * Supports both single-message and conversation-based requests.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  generateChatResponse,
  streamChatResponse,
  saveConversation,
  loadConversation,
  getConversationStarters,
  ChatContext,
  ChatMessage
} from '@/lib/ai/chat-assistant'
import { rateLimit, RateLimitType } from '@/lib/ai/rate-limit'
import { discoverConnections } from '@/lib/ai/related-content'

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
    const {
      message,
      messages = [],
      conversationId,
      stream = false
    } = body as {
      message?: string
      messages?: ChatMessage[]
      conversationId?: string
      stream?: boolean
    }

    // Accept either single message (widget style) or messages array (page style)
    const userMessage = message || messages.filter(m => m.role === 'user').pop()?.content

    if (!userMessage || typeof userMessage !== 'string') {
      return NextResponse.json(
        { error: 'Message is required (provide "message" string or "messages" array with at least one user message)' },
        { status: 400 }
      )
    }

    // Build conversation context
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
      // Streaming response
      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamChatResponse(userMessage, context)) {
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
    const response = await generateChatResponse(userMessage, context)

    // Save conversation
    const updatedMessages: ChatMessage[] = [
      ...conversationMessages,
      { role: 'user', content: userMessage, timestamp: new Date().toISOString() },
      { role: 'assistant', content: response.message, sources: response.sources, timestamp: new Date().toISOString() }
    ]
    await saveConversation(response.conversationId, updatedMessages)

    // Attempt AI connection discovery (non-blocking, best-effort)
    // Only run if we have 2+ sources with enough content
    let suggestedConnections: Array<{ fromId: string; toId: string; relationship: string; confidence: number }> = []
    const discoverableSources = response.sources.filter(s => s.id && s.title)
    if (discoverableSources.length >= 2) {
      try {
        const items = discoverableSources.slice(0, 4).map(s => ({
          id: s.id,
          title: s.title,
          content: s.snippet || s.title,
          type: s.type
        }))
        // Race against a 3-second timeout so we don't delay the response
        suggestedConnections = await Promise.race([
          discoverConnections(items),
          new Promise<typeof suggestedConnections>(resolve => setTimeout(() => resolve([]), 3000))
        ])
      } catch {
        // Connection discovery is optional — fail silently
      }
    }

    return NextResponse.json({
      message: response.message,
      sources: response.sources,
      conversationId: response.conversationId,
      suggestedQuestions: response.suggestedQuestions,
      ...(suggestedConnections.length > 0 && { suggestedConnections })
    })
  } catch (error: unknown) {
    console.error('Unified chat API error:', error)
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
    { error: 'Invalid action. Use: starters, load' },
    { status: 400 }
  )
}
