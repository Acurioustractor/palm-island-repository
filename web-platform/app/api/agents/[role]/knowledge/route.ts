import { NextRequest, NextResponse } from 'next/server'
import { getAgent } from '@/lib/ai/agents'
import type { AgentRole } from '@/lib/ai/agents/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ role: string }> }
) {
  const { role } = await params
  try {
    const agent = getAgent(role as AgentRole)
    const domain = request.nextUrl.searchParams.get('domain') || undefined
    const includeGaps = request.nextUrl.searchParams.get('gaps') === 'true'

    const knowledge = await agent.getKnowledge(domain)

    let gaps = undefined
    if (includeGaps) {
      gaps = await agent.detectKnowledgeGaps()
    }

    return NextResponse.json({ knowledge, gaps })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch knowledge' },
      { status: 500 }
    )
  }
}
