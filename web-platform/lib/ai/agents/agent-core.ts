/**
 * Agent Core
 * Base class providing knowledge CRUD, session management, chat with context injection,
 * knowledge gap detection, and action item management.
 */

import Anthropic from '@anthropic-ai/sdk'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { PICC_KNOWLEDGE_BASE } from '@/lib/picc-knowledge-base'
import type {
  AgentConfig,
  AgentRole,
  AgentMessage,
  AgentSession,
  KnowledgeEntry,
  ActionItem,
  KnowledgeGap,
} from './types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export class AgentCore {
  protected config: AgentConfig

  constructor(config: AgentConfig) {
    this.config = config
  }

  get role(): AgentRole {
    return this.config.role
  }

  // --- Knowledge CRUD ---

  async getKnowledge(domain?: string): Promise<KnowledgeEntry[]> {
    const supabase = await createRouteHandlerClient()
    let query = (supabase as any)
      .from('agent_knowledge')
      .select('*')
      .eq('agent_role', this.config.role)
      .order('updated_at', { ascending: false })

    if (domain) {
      query = query.eq('domain', domain)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []) as KnowledgeEntry[]
  }

  async upsertKnowledge(
    domain: string,
    key: string,
    value: unknown,
    source: string = 'interview',
    sessionId?: string
  ): Promise<KnowledgeEntry> {
    const supabase = await createRouteHandlerClient()
    const { data, error } = await (supabase as any)
      .from('agent_knowledge')
      .upsert(
        {
          agent_role: this.config.role,
          domain,
          key,
          value: JSON.stringify(value),
          source,
          confidence: 'high',
          collected_at: new Date().toISOString(),
          session_id: sessionId,
        },
        { onConflict: 'agent_role,domain,key' }
      )
      .select()
      .single()

    if (error) throw error
    return data as KnowledgeEntry
  }

  // --- Session Management ---

  async listSessions(status?: string): Promise<AgentSession[]> {
    const supabase = await createRouteHandlerClient()
    let query = (supabase as any)
      .from('agent_sessions')
      .select('*')
      .eq('agent_role', this.config.role)
      .order('updated_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []) as AgentSession[]
  }

  async getSession(sessionId: string): Promise<AgentSession | null> {
    const supabase = await createRouteHandlerClient()
    const { data, error } = await (supabase as any)
      .from('agent_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (error) return null
    return data as AgentSession
  }

  async createSession(
    title?: string,
    templateId?: string,
    userId?: string
  ): Promise<AgentSession> {
    const supabase = await createRouteHandlerClient()
    const { data, error } = await (supabase as any)
      .from('agent_sessions')
      .insert({
        agent_role: this.config.role,
        title: title || `${this.config.title} Session`,
        template_id: templateId,
        status: 'active',
        messages: [],
        user_id: userId,
      })
      .select()
      .single()

    if (error) throw error
    return data as AgentSession
  }

  async appendMessage(
    sessionId: string,
    message: AgentMessage
  ): Promise<void> {
    const session = await this.getSession(sessionId)
    if (!session) throw new Error('Session not found')

    const messages = [...session.messages, message]
    const supabase = await createRouteHandlerClient()
    const { error } = await (supabase as any)
      .from('agent_sessions')
      .update({ messages })
      .eq('id', sessionId)

    if (error) throw error
  }

  async completeSession(sessionId: string, summary: string): Promise<void> {
    const supabase = await createRouteHandlerClient()
    const { error } = await (supabase as any)
      .from('agent_sessions')
      .update({ status: 'completed', summary })
      .eq('id', sessionId)

    if (error) throw error
  }

  // --- Chat ---

  async chat(
    userMessage: string,
    sessionId: string
  ): Promise<{
    response: string
    knowledgeExtracted: Array<{ domain: string; key: string; value: unknown }>
    actionItems: Array<{ title: string; priority: string; description: string }>
  }> {
    // Get session context
    const session = await this.getSession(sessionId)
    if (!session) throw new Error('Session not found')

    // Get existing knowledge for context
    const knowledge = await this.getKnowledge()
    const knowledgeSummary = this.formatKnowledgeContext(knowledge)

    // Get knowledge gaps
    const gaps = await this.detectKnowledgeGaps()
    const gapSummary = gaps.length > 0
      ? `\n\nKnowledge Gaps (areas needing information):\n${gaps.map(g => `- ${g.domain}: ${g.description}`).join('\n')}`
      : ''

    // Build org context
    const orgContext = `Organisation: ${PICC_KNOWLEDGE_BASE.organization.name}\nMission: ${PICC_KNOWLEDGE_BASE.organization.mission}\nLocation: ${PICC_KNOWLEDGE_BASE.organization.location.island}, ${PICC_KNOWLEDGE_BASE.organization.location.state}`

    // Build messages for Anthropic
    const systemPrompt = `${this.config.systemPrompt}\n\n--- Organisation Context ---\n${orgContext}\n\n--- Current Knowledge ---\n${knowledgeSummary}${gapSummary}\n\n--- Instructions ---\nAfter responding to the user, output a JSON block with any new knowledge or action items extracted. Use this exact format at the end of your response:\n\n<extracted>\n{"knowledge": [{"domain": "...", "key": "...", "value": "..."}], "actions": [{"title": "...", "priority": "low|medium|high|urgent", "description": "..."}]}\n</extracted>\n\nIf nothing was extracted, output: <extracted>{"knowledge": [], "actions": []}</extracted>`

    const history: Array<{ role: 'user' | 'assistant'; content: string }> =
      session.messages.slice(-10).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))

    history.push({ role: 'user', content: userMessage })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      system: systemPrompt,
      messages: history,
    })

    const fullResponse =
      response.content[0].type === 'text' ? response.content[0].text : ''

    // Parse extracted data
    const { displayMessage, knowledgeExtracted, actionItems } =
      this.parseResponse(fullResponse)

    // Save messages
    const now = new Date().toISOString()
    await this.appendMessage(sessionId, {
      role: 'user',
      content: userMessage,
      timestamp: now,
    })
    await this.appendMessage(sessionId, {
      role: 'assistant',
      content: displayMessage,
      timestamp: now,
    })

    // Store extracted knowledge
    for (const k of knowledgeExtracted) {
      await this.upsertKnowledge(k.domain, k.key, k.value, 'interview', sessionId)
    }

    // Create action items
    for (const a of actionItems) {
      await this.createActionItem(
        a.title,
        a.description,
        a.priority as 'low' | 'medium' | 'high' | 'urgent',
        sessionId
      )
    }

    return { response: displayMessage, knowledgeExtracted, actionItems }
  }

  private parseResponse(fullResponse: string): {
    displayMessage: string
    knowledgeExtracted: Array<{ domain: string; key: string; value: unknown }>
    actionItems: Array<{ title: string; priority: string; description: string }>
  } {
    const extractedMatch = fullResponse.match(
      /<extracted>([\s\S]*?)<\/extracted>/
    )
    let displayMessage = fullResponse
    let knowledgeExtracted: Array<{ domain: string; key: string; value: unknown }> = []
    let actionItems: Array<{ title: string; priority: string; description: string }> = []

    if (extractedMatch) {
      displayMessage = fullResponse
        .replace(/<extracted>[\s\S]*?<\/extracted>/, '')
        .trim()

      try {
        const parsed = JSON.parse(extractedMatch[1])
        knowledgeExtracted = parsed.knowledge || []
        actionItems = parsed.actions || []
      } catch {
        // Failed to parse extraction — that's fine, just skip
      }
    }

    return { displayMessage, knowledgeExtracted, actionItems }
  }

  private formatKnowledgeContext(knowledge: KnowledgeEntry[]): string {
    if (knowledge.length === 0) return 'No knowledge collected yet.'

    const byDomain: Record<string, KnowledgeEntry[]> = {}
    for (const k of knowledge) {
      if (!byDomain[k.domain]) byDomain[k.domain] = []
      byDomain[k.domain].push(k)
    }

    return Object.entries(byDomain)
      .map(
        ([domain, entries]) =>
          `${domain}:\n${entries.map((e) => `  - ${e.key}: ${JSON.stringify(e.value)}`).join('\n')}`
      )
      .join('\n\n')
  }

  // --- Knowledge Gap Detection ---

  async detectKnowledgeGaps(): Promise<KnowledgeGap[]> {
    const knowledge = await this.getKnowledge()
    const coveredDomains = new Set(knowledge.map((k) => k.domain))
    const gaps: KnowledgeGap[] = []

    for (const domain of this.config.knowledgeDomains) {
      if (!coveredDomains.has(domain)) {
        gaps.push({
          domain,
          description: `No knowledge collected for "${domain}"`,
          lastUpdated: null,
          suggestedQuestions: this.getSuggestedQuestions(domain),
        })
      } else {
        // Check staleness (> 90 days)
        const domainEntries = knowledge.filter((k) => k.domain === domain)
        const newest = domainEntries.sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )[0]
        const daysSinceUpdate = Math.floor(
          (Date.now() - new Date(newest.updated_at).getTime()) /
            (1000 * 60 * 60 * 24)
        )
        if (daysSinceUpdate > 90) {
          gaps.push({
            domain,
            description: `Knowledge for "${domain}" is ${daysSinceUpdate} days old`,
            lastUpdated: newest.updated_at,
            suggestedQuestions: this.getSuggestedQuestions(domain),
          })
        }
      }
    }

    return gaps
  }

  protected getSuggestedQuestions(_domain: string): string[] {
    return [`What's the current status of ${_domain}?`]
  }

  // --- Action Items ---

  async listActionItems(status?: string): Promise<ActionItem[]> {
    const supabase = await createRouteHandlerClient()
    let query = (supabase as any)
      .from('agent_action_items')
      .select('*')
      .eq('agent_role', this.config.role)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []) as ActionItem[]
  }

  async createActionItem(
    title: string,
    description: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    sessionId?: string
  ): Promise<ActionItem> {
    const supabase = await createRouteHandlerClient()
    const { data, error } = await (supabase as any)
      .from('agent_action_items')
      .insert({
        agent_role: this.config.role,
        session_id: sessionId,
        title,
        description,
        priority,
      })
      .select()
      .single()

    if (error) throw error
    return data as ActionItem
  }

  async updateActionItem(
    id: string,
    updates: Partial<Pick<ActionItem, 'status' | 'priority' | 'assigned_to'>>
  ): Promise<ActionItem> {
    const supabase = await createRouteHandlerClient()
    const { data, error } = await (supabase as any)
      .from('agent_action_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as ActionItem
  }

  // --- Stats ---

  async getStats(): Promise<{
    totalKnowledge: number
    openActions: number
    totalSessions: number
    knowledgeGaps: number
  }> {
    const [knowledge, actions, sessions, gaps] = await Promise.all([
      this.getKnowledge(),
      this.listActionItems('open'),
      this.listSessions(),
      this.detectKnowledgeGaps(),
    ])

    return {
      totalKnowledge: knowledge.length,
      openActions: actions.length,
      totalSessions: sessions.length,
      knowledgeGaps: gaps.length,
    }
  }
}
