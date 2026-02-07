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
    const status = request.nextUrl.searchParams.get('status') || undefined
    const items = await agent.listActionItems(status)
    return NextResponse.json(items)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch action items' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ role: string }> }
) {
  const { role } = await params
  try {
    const agent = getAgent(role as AgentRole)
    const { id, ...updates } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    const item = await agent.updateActionItem(id, updates)
    return NextResponse.json(item)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update action item' },
      { status: 500 }
    )
  }
}
