import { NextRequest, NextResponse } from 'next/server'
import { getAgent } from '@/lib/ai/agents'
import { rateLimit, RateLimitType } from '@/lib/ai/rate-limit'
import type { AgentRole } from '@/lib/ai/agents/types'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ role: string }> }
) {
  const { role } = await params
  const rl = await rateLimit(request, RateLimitType.CHAT)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', retryAfter: rl.retryAfter },
      { status: 429 }
    )
  }

  try {
    const agent = getAgent(role as AgentRole)
    const { message, sessionId } = await request.json()

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'message and sessionId are required' },
        { status: 400 }
      )
    }

    const result = await agent.chat(message, sessionId)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Chat failed' },
      { status: 500 }
    )
  }
}
