'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState, useRef, useEffect, useCallback, FormEvent, useMemo, memo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2, ArrowUp, Menu, X, ThumbsUp, ThumbsDown, Mic, MicOff, Send } from 'lucide-react'
import { MessageRenderer } from '@/components/explore/MessageRenderer'
import ChatSourceCards from '@/components/chat/ChatSourceCards'
import ChatRelatedContent from '@/components/chat/ChatRelatedContent'
import { BespokeIcon, type BespokeIconName } from '@/components/ui/BespokeIcon'
import { extractSourcesFromMessage } from '@/lib/chat/extract-sources'

// ─── Types ──────────────────────────────────────────────────────────────────

type Audience = 'community' | 'funder' | 'partner' | 'staff'

const AUDIENCES: Array<{ id: Audience; label: string; description: string }> = [
  { id: 'community', label: 'Community', description: 'Palm Island resident or community member' },
  { id: 'funder', label: 'Funder', description: 'Government or funding partner' },
  { id: 'partner', label: 'Partner', description: 'Partner organisation' },
  { id: 'staff', label: 'Staff', description: 'PICC team member' },
]

const STARTERS_BY_AUDIENCE: Record<Audience, Array<{ text: string; icon: BespokeIconName }>> = {
  community: [
    { text: 'What services are available on Palm Island?', icon: 'health' },
    { text: 'What is The Centre and The Station project?', icon: 'story' },
    { text: 'Tell me the history of Palm Island and Hull River', icon: 'community' },
    { text: 'What do Elders say about the future?', icon: 'photo' },
    { text: 'What programs are there for young people?', icon: 'quote' },
    { text: "I have a vision for Palm Island's future", icon: 'timeline' },
  ],
  funder: [
    { text: 'Show me highlights from the annual report', icon: 'timeline' },
    { text: 'What are the financial results for 2024-25?', icon: 'quote' },
    { text: 'How many people does PICC employ?', icon: 'community' },
    { text: 'What are the key service outcomes this year?', icon: 'health' },
    { text: 'Tell me about governance and compliance', icon: 'story' },
    { text: 'What are the plans for the next 20 years?', icon: 'photo' },
  ],
  partner: [
    { text: 'What is The Centre and The Station project?', icon: 'story' },
    { text: 'How can organisations partner with PICC?', icon: 'community' },
    { text: 'What programs are running right now?', icon: 'health' },
    { text: 'Show me the innovation projects', icon: 'timeline' },
    { text: 'What are the plans for the next 20 years?', icon: 'quote' },
    { text: 'Tell me about the youth pathways program', icon: 'photo' },
  ],
  staff: [
    { text: 'Show me the latest service metrics', icon: 'health' },
    { text: 'What did the community say this week?', icon: 'community' },
    { text: 'Show me highlights from the annual report', icon: 'timeline' },
    { text: 'What is the content readiness for the annual report?', icon: 'story' },
    { text: 'Give me an overview of all innovation projects', icon: 'quote' },
    { text: 'Who are the board members and leadership?', icon: 'photo' },
  ],
}

// ─── Follow-up parsing ──────────────────────────────────────────────────────

function extractFollowUps(message: import('ai').UIMessage): string[] {
  const textParts = message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map(p => p.text)
    .join('')
  const match = textParts.match(/<follow-ups>([^<]*)<\/follow-ups>/)
  if (!match) return []
  return match[1].split('|').map(q => q.trim()).filter(q => q.length > 0).slice(0, 3)
}

// ─── Session ID ─────────────────────────────────────────────────────────────

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  const key = 'palm-ai-session-id'
  try {
    let id = sessionStorage.getItem(key)
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem(key, id)
    }
    return id
  } catch {
    // Safari private browsing or storage disabled
    return crypto.randomUUID()
  }
}

// ─── Voice Input Hook ───────────────────────────────────────────────────────

function useVoiceInput(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef<any>(null)
  const onResultRef = useRef(onResult)
  onResultRef.current = onResult

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setSupported(!!SpeechRecognition)
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-AU'
      recognition.onresult = (e: any) => {
        const transcript = e.results[0]?.[0]?.transcript
        if (transcript) onResultRef.current(transcript)
        setListening(false)
      }
      recognition.onerror = () => setListening(false)
      recognition.onend = () => setListening(false)
      recognitionRef.current = recognition
    }
  }, [])

  const toggle = useCallback(() => {
    if (!recognitionRef.current) return
    if (listening) {
      recognitionRef.current.stop()
      setListening(false)
    } else {
      recognitionRef.current.start()
      setListening(true)
    }
  }, [listening])

  return { listening, supported, toggle }
}

// ─── Feedback Component ─────────────────────────────────────────────────────

function FeedbackButtons({ sessionId, messageIndex, onNegativeFeedback }: {
  sessionId: string
  messageIndex: number
  onNegativeFeedback?: () => void
}) {
  const [submitted, setSubmitted] = useState<'helpful' | 'not_helpful' | null>(null)

  const submit = async (rating: 'helpful' | 'not_helpful') => {
    setSubmitted(rating)
    if (rating === 'not_helpful' && onNegativeFeedback) {
      onNegativeFeedback()
    }
    try {
      await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, messageIndex, rating }),
      })
    } catch {
      // Non-fatal
    }
  }

  if (submitted) {
    return (
      <span className="text-xs text-picc-earth-200 ml-11">
        {submitted === 'helpful' ? 'Thanks for the feedback.' : 'Noted. We\'ll work on improving.'}
      </span>
    )
  }

  return (
    <div className="flex gap-1.5 ml-11 mt-1">
      <button
        onClick={() => submit('helpful')}
        className="p-1 rounded-md text-picc-earth-200 hover:text-green-600 hover:bg-green-50 transition-colors"
        title="Helpful"
        aria-label="Mark response as helpful"
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => submit('not_helpful')}
        className="p-1 rounded-md text-picc-earth-200 hover:text-red-500 hover:bg-red-50 transition-colors"
        title="Not helpful"
        aria-label="Mark response as not helpful"
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ─── Contact Opt-In Component ───────────────────────────────────────────────

function ContactOptIn({ sessionId, reason }: { sessionId: string; reason: 'negative_feedback' | 'escalation' | 'contact_interest' }) {
  const [state, setState] = useState<'idle' | 'form' | 'submitting' | 'submitted' | 'dismissed'>('form')
  const [name, setName] = useState('')
  const [phoneOrEmail, setPhoneOrEmail] = useState('')

  const handleSubmit = async () => {
    if (!name.trim() || !phoneOrEmail.trim()) return
    setState('submitting')
    try {
      await fetch('/api/chat/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          name: name.trim(),
          phoneOrEmail: phoneOrEmail.trim(),
          reason,
        }),
      })
      setState('submitted')
    } catch {
      setState('form')
    }
  }

  if (state === 'dismissed' || state === 'idle') return null

  if (state === 'submitted') {
    return (
      <div className="ml-11 mt-3 px-4 py-3 rounded-2xl bg-green-50 border border-green-200">
        <p className="text-sm text-green-800">Thanks — someone from PICC will be in touch.</p>
      </div>
    )
  }

  return (
    <div className="ml-11 mt-3 px-4 py-4 rounded-2xl bg-warm-50 border border-warm-200">
      <p className="text-sm font-medium text-picc-earth mb-1">Want us to get back to you?</p>
      <p className="text-xs text-picc-earth-300 mb-3">Leave your details and we&apos;ll follow up.</p>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-warm-200 bg-white text-sm text-picc-earth placeholder:text-picc-earth-200 focus:outline-none focus:border-picc-ochre focus:ring-2 focus:ring-picc-ochre/10"
        />
        <input
          type="text"
          placeholder="Phone or email"
          value={phoneOrEmail}
          onChange={e => setPhoneOrEmail(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-warm-200 bg-white text-sm text-picc-earth placeholder:text-picc-earth-200 focus:outline-none focus:border-picc-ochre focus:ring-2 focus:ring-picc-ochre/10"
        />
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || !phoneOrEmail.trim() || state === 'submitting'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-picc-ochre text-white text-xs font-medium hover:bg-picc-ochre-600 disabled:opacity-40 transition-colors"
        >
          <Send className="w-3 h-3" />
          {state === 'submitting' ? 'Sending...' : 'Send'}
        </button>
        <button
          onClick={() => setState('dismissed')}
          className="px-3 py-1.5 rounded-lg text-xs text-picc-earth-300 hover:bg-warm-100 transition-colors"
        >
          No thanks
        </button>
      </div>
    </div>
  )
}

// ─── Memoised Message ───────────────────────────────────────────────────────

// Detect if a message contains an escalateToHuman or collectContactDetails tool invocation
function hasContactTrigger(message: import('ai').UIMessage): 'escalation' | 'contact_interest' | null {
  for (const p of message.parts) {
    const part = p as Record<string, unknown>
    if (typeof part.type !== 'string') continue
    // Check all possible AI SDK formats
    const toolNames = ['escalateToHuman', 'collectContactDetails']
    for (const toolName of toolNames) {
      if (part.type === `tool-${toolName}`) return toolName === 'escalateToHuman' ? 'escalation' : 'contact_interest'
      if (part.toolName === toolName) return toolName === 'escalateToHuman' ? 'escalation' : 'contact_interest'
      if (part.type === 'tool-invocation') {
        const inv = part.toolInvocation as Record<string, unknown> | undefined
        if (inv?.toolName === toolName) return toolName === 'escalateToHuman' ? 'escalation' : 'contact_interest'
      }
    }
  }
  return null
}

const MemoMessage = memo(function MemoMessage({
  message,
  isLast,
  latestAssistantSources,
  sessionId,
  messageIndex,
  onFollowUp,
  sessionHasEscalation,
  sessionContactTrigger,
}: {
  message: import('ai').UIMessage
  isLast: boolean
  latestAssistantSources: Array<{ title: string; url: string; type: string }>
  sessionId: string
  messageIndex: number
  onFollowUp?: (text: string) => void
  sessionHasEscalation: boolean
  sessionContactTrigger: 'escalation' | 'contact_interest' | null
}) {
  const [showContactOptIn, setShowContactOptIn] = useState(false)

  const sources = useMemo(
    () => message.role === 'assistant' ? extractSourcesFromMessage(message) : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [message.id, message.parts.length]
  )

  const followUps = useMemo(
    () => message.role === 'assistant' && isLast ? extractFollowUps(message) : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [message.id, message.parts.length, isLast]
  )

  // Show contact opt-in on the last assistant message if escalation or contact collection detected
  const showEscalationForm = message.role === 'assistant' && isLast && sessionHasEscalation
  const contactReason: 'negative_feedback' | 'escalation' | 'contact_interest' = sessionContactTrigger === 'contact_interest'
    ? 'contact_interest'
    : showEscalationForm ? 'escalation' : 'negative_feedback'

  return (
    <div>
      <MessageRenderer message={message} darkMode={false} />
      {sources.length > 0 && (
        <div className="mt-3 ml-11">
          <ChatSourceCards sources={sources} compact />
        </div>
      )}
      {message.role === 'assistant' && isLast && latestAssistantSources.length > 0 && (
        <div className="mt-4 ml-11">
          <ChatRelatedContent sources={latestAssistantSources} />
        </div>
      )}
      {message.role === 'assistant' && isLast && (
        <FeedbackButtons
          sessionId={sessionId}
          messageIndex={messageIndex}
          onNegativeFeedback={() => setShowContactOptIn(true)}
        />
      )}
      {(showContactOptIn || showEscalationForm) && (
        <ContactOptIn sessionId={sessionId} reason={contactReason} />
      )}
      {followUps.length > 0 && onFollowUp && (
        <div className="mt-3 ml-11 flex flex-wrap gap-2">
          {followUps.map((q, i) => (
            <button
              key={i}
              onClick={() => onFollowUp(q)}
              className="text-xs px-3 py-1.5 rounded-full bg-warm-100 text-picc-earth-300 hover:bg-picc-ochre/10 hover:text-picc-ochre border border-warm-200 hover:border-picc-ochre/30 transition-all duration-200"
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}, (prev, next) => {
  // Custom comparator: skip re-render for non-streaming (completed) messages
  if (prev.message.id !== next.message.id) return false
  if (prev.isLast !== next.isLast) return false
  if (prev.messageIndex !== next.messageIndex) return false
  if (prev.sessionHasEscalation !== next.sessionHasEscalation) return false
  if (prev.sessionContactTrigger !== next.sessionContactTrigger) return false
  // During streaming the last message keeps changing — always re-render it
  if (next.isLast) return false
  // For completed messages, parts count change means tool results arrived
  if (prev.message.parts.length !== next.message.parts.length) return false
  return true
})

// ─── Main Chat Page ─────────────────────────────────────────────────────────

export default function ChatPage() {
  const [sessionId] = useState(getOrCreateSessionId)
  const [audience, setAudience] = useState<Audience>('community')

  const transport = useMemo(
    () => new DefaultChatTransport({
      api: '/api/chat',
      body: { sessionId, audience },
    }),
    [sessionId, audience]
  )

  const { messages, sendMessage, setMessages, status, error } = useChat({ transport })

  const [input, setInput] = useState('')
  const [mounted, setMounted] = useState(false)
  const [heroVisible, setHeroVisible] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isLoading = status === 'streaming' || status === 'submitted'
  const hasMessages = messages.length > 0

  // Track if any message in the session contains an escalation or contact collection trigger
  // Must depend on total parts count — tool parts arrive mid-stream on existing messages
  const totalPartsCount = messages.reduce((sum, m) => sum + m.parts.length, 0)
  const sessionContactTrigger = useMemo(
    () => {
      for (const m of messages) {
        if (m.role !== 'assistant') continue
        const trigger = hasContactTrigger(m)
        if (trigger) return trigger
      }
      return null
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [messages.length, totalPartsCount]
  )
  const sessionHasEscalation = sessionContactTrigger !== null

  const handleVoiceResult = useCallback((text: string) => {
    setInput(prev => prev ? `${prev} ${text}` : text)
  }, [])
  const voice = useVoiceInput(handleVoiceResult)

  const handleNewChat = useCallback(() => {
    setMessages([])
    setInput('')
    setHeroVisible(true)
    // Generate fresh session ID
    try { sessionStorage.removeItem('palm-ai-session-id') } catch {}
  }, [setMessages])

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (hasMessages) setHeroVisible(false)
  }, [hasMessages])

  // Scroll to bottom — debounced to avoid jitter during streaming
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastMessageCountRef = useRef(0)
  useEffect(() => {
    const isNewMessage = messages.length !== lastMessageCountRef.current
    lastMessageCountRef.current = messages.length

    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)

    if (isNewMessage) {
      // New message: scroll immediately
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    } else {
      // Streaming token: debounce scroll to every 300ms
      scrollTimerRef.current = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
      }, 300)
    }

    return () => { if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current) }
  }, [messages])

  const handleInputChange = useCallback((value: string) => {
    setInput(value)
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px'
    }
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
    await sendMessage({ text })
  }

  const handleStarterSelect = async (text: string) => {
    if (isLoading) return
    await sendMessage({ text })
  }

  const handleFollowUp = useCallback(async (text: string) => {
    if (isLoading) return
    await sendMessage({ text })
  }, [isLoading, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const form = e.currentTarget.closest('form')
      if (form) form.requestSubmit()
    }
  }

  // Extract sources from the latest assistant message's tool results
  // Stabilize: only recompute when message count or last message parts change
  const lastAssistantId = messages.length > 0
    ? [...messages].reverse().find(m => m.role === 'assistant')?.id
    : undefined
  const lastAssistantPartsLen = messages.length > 0
    ? [...messages].reverse().find(m => m.role === 'assistant')?.parts.length
    : 0
  const latestAssistantSources = useMemo(() => {
    const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant')
    if (!lastAssistant) return []
    return extractSourcesFromMessage(lastAssistant)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastAssistantId, lastAssistantPartsLen])

  // Voice button component (reused in both input bars)
  const VoiceButton = voice.supported ? (
    <button
      type="button"
      onClick={voice.toggle}
      className={`flex-shrink-0 p-2 rounded-xl transition-all duration-200 ${
        voice.listening
          ? 'bg-red-100 text-red-600 animate-pulse'
          : 'text-picc-earth-200 hover:text-picc-ochre hover:bg-warm-50'
      }`}
      title={voice.listening ? 'Stop listening' : 'Voice input'}
    >
      {voice.listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </button>
  ) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-cream flex flex-col">
      {/* Top nav bar */}
      <nav className="border-b border-warm-200 bg-white/60 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-picc-earth hover:text-picc-ochre transition-colors">
            <Image
              src="/logo/picc-logo-full.png"
              alt="PICC"
              width={32}
              height={32}
              className="object-contain"
              style={{ mixBlendMode: 'multiply' }}
            />
            <span className="font-semibold text-sm">Home</span>
          </Link>
          <div className="hidden sm:flex items-center gap-4 text-sm">
            <Link href="/stories" className="text-picc-earth-300 hover:text-picc-ochre transition-colors">Stories</Link>
            <Link href="/services" className="text-picc-earth-300 hover:text-picc-ochre transition-colors">Services</Link>
            <Link href="/timeline" className="text-picc-earth-300 hover:text-picc-ochre transition-colors">Timeline</Link>
            <Link href="/voices" className="text-picc-earth-300 hover:text-picc-ochre transition-colors">Voices</Link>
            {hasMessages && (
              <button onClick={handleNewChat} className="ml-2 px-3 py-1 rounded-full text-xs font-medium bg-picc-ochre/10 text-picc-ochre hover:bg-picc-ochre/20 transition-colors">
                New chat
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 sm:hidden">
            {hasMessages && (
              <button onClick={handleNewChat} className="px-2.5 py-1 rounded-full text-xs font-medium bg-picc-ochre/10 text-picc-ochre">
                New
              </button>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 text-picc-earth-300 hover:text-picc-ochre">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="sm:hidden border-t border-warm-200 px-6 py-3 flex flex-col gap-2 text-sm bg-white/80">
            <Link href="/stories" onClick={() => setMenuOpen(false)} className="text-picc-earth-300 hover:text-picc-ochre py-1">Stories</Link>
            <Link href="/services" onClick={() => setMenuOpen(false)} className="text-picc-earth-300 hover:text-picc-ochre py-1">Services</Link>
            <Link href="/timeline" onClick={() => setMenuOpen(false)} className="text-picc-earth-300 hover:text-picc-ochre py-1">Timeline</Link>
            <Link href="/voices" onClick={() => setMenuOpen(false)} className="text-picc-earth-300 hover:text-picc-ochre py-1">Voices</Link>
          </div>
        )}
      </nav>

      {/* Hero / Welcome State */}
      <div
        className={`flex-1 flex flex-col items-center justify-center transition-all duration-700 ease-out ${
          heroVisible ? 'opacity-100' : 'opacity-0 scale-95 pointer-events-none absolute inset-0 z-[-1]'
        }`}
      >
        <div className={`text-center px-6 max-w-3xl mx-auto transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex justify-center mb-6">
            <Image
              src="/logo/picc-logo-full.png"
              alt="Palm Island Community Company"
              width={100}
              height={100}
              className="object-contain"
              style={{ mixBlendMode: 'multiply' }}
              priority
            />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-picc-earth font-serif">
            Ask Palm AI
          </h1>

          <p className="mt-4 text-lg sm:text-xl text-picc-earth-300 max-w-xl mx-auto leading-relaxed">
            Discover 17 years of community-led impact through stories, photos, data, and the voices of our people.
          </p>
        </div>

        {/* Audience selector */}
        <div className={`mt-6 px-6 max-w-2xl mx-auto w-full transition-all duration-500 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-xs text-picc-earth-200 text-center mb-2">I am a...</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {AUDIENCES.map((a) => (
              <button
                key={a.id}
                onClick={() => setAudience(a.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                  audience === a.id
                    ? 'bg-picc-ochre text-white border-picc-ochre shadow-sm'
                    : 'bg-white/60 text-picc-earth-300 border-warm-200 hover:border-picc-ochre/30 hover:bg-white'
                }`}
                title={a.description}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Starter prompts */}
        <div className={`mt-8 px-6 max-w-2xl mx-auto w-full transition-all duration-500 delay-150 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {STARTERS_BY_AUDIENCE[audience].map((starter) => (
              <button
                key={starter.text}
                onClick={() => handleStarterSelect(starter.text)}
                disabled={isLoading}
                className="group text-left px-4 py-3.5 rounded-2xl bg-white/60 border border-warm-200 hover:bg-white hover:border-picc-ochre/30 hover:shadow-sm transition-all duration-300 flex items-center gap-3"
              >
                <BespokeIcon name={starter.icon} size={24} />
                <span className="text-sm text-picc-earth-300 group-hover:text-picc-earth transition-colors leading-snug">
                  {starter.text}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Input bar — hero state */}
        <div className={`mt-8 px-6 max-w-2xl mx-auto w-full transition-all duration-500 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <form onSubmit={handleSubmit}>
            <div className="flex items-end gap-2 bg-white border border-warm-200 rounded-2xl px-4 py-3 focus-within:border-picc-ochre focus-within:ring-4 focus-within:ring-picc-ochre/10 transition-all duration-300 shadow-sm">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about Palm Island..."
                rows={1}
                className="flex-1 bg-transparent text-picc-earth placeholder:text-picc-earth-200 text-[15px] leading-relaxed focus:outline-none resize-none"
                disabled={isLoading}
              />
              {VoiceButton}
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex-shrink-0 p-2 rounded-xl bg-picc-ochre text-white disabled:opacity-20 hover:bg-picc-ochre-600 transition-all duration-200"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowUp className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer links + consent */}
        <div className={`mt-8 text-center transition-all duration-500 delay-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-xs text-picc-earth-200">
            Powered by Palm AI · Responses include citations
          </p>
          <p className="text-xs text-picc-earth-200/60 mt-1">
            Conversations help us improve. No personal data is stored.
          </p>
        </div>
      </div>

      {/* Conversation State */}
      {hasMessages && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages area */}
          <div
            className="flex-1 overflow-y-auto"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(139,115,85,0.2) transparent' }}
          >
            <div className="max-w-3xl mx-auto w-full px-6 py-6 space-y-6">
              {messages.map((message, index) => (
                <MemoMessage
                  key={message.id}
                  message={message}
                  isLast={index === messages.length - 1}
                  latestAssistantSources={latestAssistantSources}
                  sessionId={sessionId}
                  messageIndex={index}
                  onFollowUp={!isLoading ? handleFollowUp : undefined}
                  sessionHasEscalation={sessionHasEscalation}
                  sessionContactTrigger={sessionContactTrigger}
                />
              ))}

              {/* Error banner */}
              {error && !isLoading && (
                <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-red-800">Something went wrong. Try again.</p>
                  </div>
                  <button
                    onClick={() => {
                      const lastUser = [...messages].reverse().find(m => m.role === 'user')
                      if (lastUser) {
                        const text = lastUser.parts
                          .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
                          .map(p => p.text)
                          .join(' ')
                        if (text) sendMessage({ text })
                      }
                    }}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Streaming indicator */}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-warm-100 flex items-center justify-center">
                    <div className="flex gap-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-picc-ochre animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-picc-ochre animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-picc-ochre animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input bar — conversation state */}
          <div className="flex-shrink-0 border-t border-warm-200 bg-white/90 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6 py-4">
              <div className="flex items-end gap-2 bg-white border border-warm-200 rounded-2xl px-4 py-3 focus-within:border-picc-ochre focus-within:ring-4 focus-within:ring-picc-ochre/10 transition-all duration-300">
                <textarea
                  value={input}
                  onChange={e => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a follow-up..."
                  rows={1}
                  className="flex-1 bg-transparent text-picc-earth placeholder:text-picc-earth-200 text-[15px] leading-relaxed focus:outline-none resize-none"
                  disabled={isLoading}
                />
                {VoiceButton}
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="flex-shrink-0 p-2 rounded-xl bg-picc-ochre text-white disabled:opacity-20 hover:bg-picc-ochre-600 transition-all duration-200"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowUp className="w-4 h-4" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
