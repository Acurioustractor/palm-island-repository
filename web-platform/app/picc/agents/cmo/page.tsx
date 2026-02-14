'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Send,
  Bot,
  User,
  Loader2,
  Plus,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Brain,
  ClipboardList,
  MessageSquare,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface Session {
  id: string
  title: string | null
  template_id: string | null
  status: string
  messages: Message[]
  created_at: string
}

interface KnowledgeEntry {
  id: string
  domain: string
  key: string
  value: unknown
  updated_at: string
}

interface KnowledgeGap {
  domain: string
  description: string
  lastUpdated: string | null
}

interface ActionItemData {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  created_at: string
}

interface Template {
  id: string
  title: string
  description: string
  questions: string[]
}

interface Stats {
  totalKnowledge: number
  openActions: number
  totalSessions: number
  knowledgeGaps: number
}

const TEMPLATES: Template[] = [
  {
    id: 'quarterly-review',
    title: 'Quarterly Marketing Review',
    description: 'Comprehensive review of marketing activities for the quarter.',
    questions: [],
  },
  {
    id: 'quick-capture',
    title: 'Quick Content Capture',
    description: 'Fast capture of a story, event, or content opportunity.',
    questions: [],
  },
  {
    id: 'media-captioning',
    title: 'Media Captioning Session',
    description: 'Walk through uncaptioned photos and add context.',
    questions: [],
  },
]

export default function CMODashboard() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([])
  const [gaps, setGaps] = useState<KnowledgeGap[]>([])
  const [actionItems, setActionItems] = useState<ActionItemData[]>([])
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set())
  const [sessions, setSessions] = useState<Session[]>([])
  const [showTemplates, setShowTemplates] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchData = useCallback(async () => {
    try {
      const [knowledgeRes, actionsRes, sessionsRes] = await Promise.all([
        fetch('/api/agents/cmo/knowledge?gaps=true'),
        fetch('/api/agents/cmo/actions?status=open'),
        fetch('/api/agents/cmo/sessions'),
      ])

      if (knowledgeRes.ok) {
        const kData = await knowledgeRes.json()
        setKnowledge(kData.knowledge || [])
        setGaps(kData.gaps || [])
      }
      if (actionsRes.ok) {
        const aData = await actionsRes.json()
        setActionItems(aData)
      }
      if (sessionsRes.ok) {
        const sData = await sessionsRes.json()
        setSessions(sData)
      }

      setStats({
        totalKnowledge: knowledge.length,
        openActions: actionItems.length,
        totalSessions: sessions.length,
        knowledgeGaps: gaps.length,
      })
    } catch (error) {
      console.error('Failed to fetch agent data:', error)
    }
  }, [knowledge.length, actionItems.length, sessions.length, gaps.length])

  useEffect(() => {
    fetchData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startSession = async (templateId?: string) => {
    try {
      const template = templateId
        ? TEMPLATES.find((t) => t.id === templateId)
        : null
      const res = await fetch('/api/agents/cmo/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: template ? template.title : 'CMO Chat',
          templateId,
        }),
      })

      if (!res.ok) throw new Error('Failed to create session')
      const session = await res.json()
      setActiveSessionId(session.id)
      setMessages([])
      setShowTemplates(false)

      // Send initial message for template sessions
      if (template) {
        await sendMessage(
          `Starting: ${template.title}. Please begin the interview.`,
          session.id
        )
      }
    } catch (error) {
      console.error('Failed to start session:', error)
    }
  }

  const resumeSession = (session: Session) => {
    setActiveSessionId(session.id)
    setMessages(session.messages || [])
    setShowTemplates(false)
  }

  const sendMessage = async (text: string, sessionId?: string) => {
    const sid = sessionId || activeSessionId
    if (!sid) return

    setIsLoading(true)
    const userMsg: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])

    try {
      const res = await fetch('/api/agents/cmo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId: sid }),
      })

      if (!res.ok) throw new Error('Chat failed')
      const data = await res.json()

      const assistantMsg: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMsg])

      // Refresh sidebar data if knowledge or actions were extracted
      if (
        (data.knowledgeExtracted && data.knowledgeExtracted.length > 0) ||
        (data.actionItems && data.actionItems.length > 0)
      ) {
        fetchData()
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const text = input.trim()
    setInput('')
    await sendMessage(text)
  }

  const toggleActionItem = async (item: ActionItemData) => {
    const newStatus = item.status === 'done' ? 'open' : 'done'
    try {
      await fetch('/api/agents/cmo/actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, status: newStatus }),
      })
      setActionItems((prev) =>
        prev
          .map((a) => (a.id === item.id ? { ...a, status: newStatus } : a))
          .filter((a) => a.status !== 'done')
      )
    } catch (error) {
      console.error('Failed to update action item:', error)
    }
  }

  const toggleDomain = (domain: string) => {
    setExpandedDomains((prev) => {
      const next = new Set(prev)
      if (next.has(domain)) next.delete(domain)
      else next.add(domain)
      return next
    })
  }

  // Group knowledge by domain
  const knowledgeByDomain: Record<string, KnowledgeEntry[]> = {}
  for (const k of knowledge) {
    if (!knowledgeByDomain[k.domain]) knowledgeByDomain[k.domain] = []
    knowledgeByDomain[k.domain].push(k)
  }

  const priorityColor: Record<string, string> = {
    urgent: 'text-red-600',
    high: 'text-orange-600',
    medium: 'text-yellow-600',
    low: 'text-gray-500',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-picc-ochre rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CMO Agent</h1>
              <p className="text-sm text-gray-500">
                Marketing intelligence & content capture
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-2 px-4 py-2 bg-picc-ochre text-white rounded-lg hover:bg-picc-ochre transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              New Interview
            </button>
          </div>
        </div>
      </div>

      {/* Template Selector */}
      {showTemplates && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Choose Interview Template
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => startSession(t.id)}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:border-picc-ochre-300 hover:bg-warm-100 transition-all"
                >
                  <div className="font-medium text-gray-900">{t.title}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {t.description}
                  </div>
                </button>
              ))}
              <button
                onClick={() => startSession()}
                className="text-left p-4 border border-dashed border-gray-300 rounded-lg hover:border-picc-ochre-300 hover:bg-warm-100 transition-all"
              >
                <div className="font-medium text-gray-900">Free Chat</div>
                <div className="text-sm text-gray-500 mt-1">
                  Open conversation with the CMO agent.
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Brain className="w-4 h-4 text-picc-ochre" />
            <span className="font-medium">{knowledge.length}</span> facts
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <ClipboardList className="w-4 h-4 text-orange-500" />
            <span className="font-medium">{actionItems.length}</span> open
            actions
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MessageSquare className="w-4 h-4 text-picc-red" />
            <span className="font-medium">{sessions.length}</span> sessions
          </div>
          {gaps.length > 0 && (
            <div className="flex items-center gap-2 text-picc-ochre">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">{gaps.length}</span> knowledge gaps
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Chat Panel (60%) */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 flex flex-col" style={{ minHeight: '600px' }}>
            {activeSessionId ? (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-400 py-12">
                      <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Start the conversation...</p>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="flex-shrink-0 w-8 h-8 bg-warm-100 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-picc-ochre" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                      {msg.role === 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-warm-100 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-picc-ochre" />
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-gray-200 p-4">
                  <form onSubmit={handleSubmit} className="flex gap-3">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:border-picc-ochre-300 focus:outline-none text-sm"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="px-4 py-2.5 bg-picc-ochre text-white rounded-lg hover:bg-picc-ochre transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                <Bot className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  CMO Agent Ready
                </h2>
                <p className="text-gray-500 mb-6 max-w-md">
                  Start an interview to capture marketing knowledge, or resume a
                  previous session.
                </p>
                <button
                  onClick={() => setShowTemplates(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-picc-ochre text-white rounded-lg hover:bg-picc-ochre transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Start Interview
                </button>

                {/* Recent sessions */}
                {sessions.length > 0 && (
                  <div className="mt-8 w-full max-w-md">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Recent Sessions
                    </h3>
                    <div className="space-y-2">
                      {sessions.slice(0, 5).map((s) => (
                        <button
                          key={s.id}
                          onClick={() => resumeSession(s)}
                          className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="text-sm font-medium text-gray-900">
                            {s.title || 'Untitled Session'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(s.created_at).toLocaleDateString()} &middot;{' '}
                            {s.status}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar (40%) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Knowledge Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4 text-picc-ochre" />
                Knowledge Status
              </h3>

              {Object.keys(knowledgeByDomain).length === 0 && gaps.length === 0 && (
                <p className="text-sm text-gray-400">
                  No knowledge collected yet. Start an interview to capture
                  marketing intelligence.
                </p>
              )}

              {/* Gaps first */}
              {gaps.map((gap) => (
                <div
                  key={gap.domain}
                  className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-0"
                >
                  <AlertTriangle className="w-4 h-4 text-picc-ochre-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {gap.domain}
                    </div>
                    <div className="text-xs text-picc-ochre">
                      {gap.description}
                    </div>
                  </div>
                </div>
              ))}

              {/* Knowledge by domain */}
              {Object.entries(knowledgeByDomain).map(([domain, entries]) => (
                <div
                  key={domain}
                  className="border-b border-gray-100 last:border-0"
                >
                  <button
                    onClick={() => toggleDomain(domain)}
                    className="flex items-center justify-between w-full py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-gray-900">
                        {domain}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({entries.length})
                      </span>
                    </div>
                    {expandedDomains.has(domain) ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  {expandedDomains.has(domain) && (
                    <div className="ml-6 pb-2 space-y-1">
                      {entries.map((e) => (
                        <div key={e.id} className="text-xs text-gray-600">
                          <span className="font-medium">{e.key}:</span>{' '}
                          {typeof e.value === 'string'
                            ? e.value
                            : JSON.stringify(e.value)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Items */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-orange-500" />
                Action Items
              </h3>

              {actionItems.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No open action items. The agent will create tasks during
                  interviews.
                </p>
              ) : (
                <div className="space-y-2">
                  {actionItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-0"
                    >
                      <button
                        onClick={() => toggleActionItem(item)}
                        className="mt-0.5 flex-shrink-0"
                      >
                        {item.status === 'done' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-300 hover:text-green-400 transition-colors" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-900">
                          {item.title}
                        </div>
                        {item.description && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {item.description}
                          </div>
                        )}
                        <div
                          className={`text-xs mt-1 ${priorityColor[item.priority] || 'text-gray-400'}`}
                        >
                          {item.priority}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
