import { NextRequest, NextResponse } from 'next/server'
import { getAgent } from '@/lib/ai/agents'
import type { AgentRole } from '@/lib/ai/agents/types'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ role: string }> }
) {
  const { role } = await params
  try {
    const agent = getAgent(role as AgentRole)
    const sessions = await agent.listSessions()
    return NextResponse.json(sessions)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to list sessions' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ role: string }> }
) {
  const { role } = await params
  try {
    const agent = getAgent(role as AgentRole)
    const body = await request.json()
    const session = await agent.createSession(
      body.title,
      body.templateId,
      body.userId
    )
    return NextResponse.json(session)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create session' },
      { status: 500 }
    )
  }
}
