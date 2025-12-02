import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getRAGContext } from '@/lib/scraper'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT = `You are a helpful and knowledgeable assistant for Palm Island Community Company (PICC) and the Palm Island community.

Your role is to:
- Answer questions about Palm Island, its history, culture, and community
- Provide information about PICC services and programs
- Help community members understand available resources
- Share knowledge about the island's heritage and people
- Support annual report preparation and community documentation

Guidelines:
- Be respectful and culturally sensitive at all times
- Use information from the context provided below when available
- If you're not certain about something, say so honestly
- Acknowledge the traditional owners, the Manbarra and Bwgcolman people
- Use plain, accessible language
- Cite sources when possible

Context from PICC knowledge base:
{CONTEXT}

Available sources:
{SOURCES}`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, stream = false } = body as {
      messages: Message[]
      stream?: boolean
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Get the latest user message for RAG
    const lastUserMessage = messages
      .filter(m => m.role === 'user')
      .pop()

    if (!lastUserMessage) {
      return NextResponse.json(
        { error: 'No user message found' },
        { status: 400 }
      )
    }

    // Retrieve relevant context
    const ragResult = await getRAGContext(lastUserMessage.content, {
      limit: 5,
      maxContextTokens: 2000
    })

    // Build the system prompt with context
    const systemPrompt = SYSTEM_PROMPT
      .replace('{CONTEXT}', ragResult.context || 'No specific context available.')
      .replace('{SOURCES}', ragResult.sources.map(s => `- ${s.title}`).join('\n') || 'No sources available.')

    // Format messages for Anthropic
    const anthropicMessages = messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }))

    if (stream) {
      // Streaming response
      const encoder = new TextEncoder()

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            const stream = await anthropic.messages.stream({
              model: 'claude-sonnet-4-5-20250929',
              max_tokens: 1024,
              system: systemPrompt,
              messages: anthropicMessages
            })

            for await (const event of stream) {
              if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                const text = event.delta.text
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
              }
            }

            // Send sources at the end
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              done: true,
              sources: ragResult.sources
            })}\n\n`))
            controller.close()
          } catch (error: any) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`))
            controller.close()
          }
        }
      })

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      })
    } else {
      // Non-streaming response
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        system: systemPrompt,
        messages: anthropicMessages
      })

      const assistantMessage = response.content[0].type === 'text'
        ? response.content[0].text
        : ''

      return NextResponse.json({
        response: assistantMessage,
        sources: ragResult.sources,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens
        }
      })
    }
  } catch (error: any) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    )
  }
}

// GET - Health check and stats
export async function GET() {
  try {
    const { getCorpusStats } = await import('@/lib/scraper')
    const stats = await getCorpusStats()

    return NextResponse.json({
      status: 'healthy',
      model: 'claude-sonnet-4-5-20250929',
      corpus: stats
    })
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', error: error.message },
      { status: 500 }
    )
  }
}
