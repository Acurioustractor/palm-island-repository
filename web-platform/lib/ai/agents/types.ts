/**
 * Agent System Types
 * Shared interfaces for all role agents (CMO, CEO, CFO, etc.)
 */

export type AgentRole = 'cmo' | 'ceo' | 'cfo' | 'cdo' | 'cpo' | 'cultural-officer'

export interface AgentConfig {
  role: AgentRole
  title: string
  description: string
  systemPrompt: string
  interviewTemplates: InterviewTemplate[]
  knowledgeDomains: string[]
}

export interface InterviewTemplate {
  id: string
  title: string
  description: string
  questions: string[]
}

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

export interface AgentSession {
  id: string
  agent_role: AgentRole
  title: string | null
  template_id: string | null
  status: 'active' | 'completed' | 'archived'
  messages: AgentMessage[]
  summary: string | null
  metadata: Record<string, unknown>
  user_id: string | null
  created_at: string
  updated_at: string
}

export interface KnowledgeEntry {
  id: string
  agent_role: AgentRole
  domain: string
  key: string
  value: unknown
  source: string | null
  confidence: 'low' | 'medium' | 'high'
  collected_at: string
  expires_at: string | null
  session_id: string | null
  created_at: string
  updated_at: string
}

export interface ActionItem {
  id: string
  agent_role: AgentRole
  session_id: string | null
  title: string
  description: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'done' | 'dismissed'
  due_date: string | null
  assigned_to: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface ChatRequest {
  message: string
  sessionId?: string
  templateId?: string
}

export interface ChatResponse {
  message: string
  sessionId: string
  knowledgeExtracted: KnowledgeEntry[]
  actionItems: ActionItem[]
}

export interface KnowledgeGap {
  domain: string
  description: string
  lastUpdated: string | null
  suggestedQuestions: string[]
}
