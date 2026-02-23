'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState, useRef, useEffect, useCallback, FormEvent, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2, ArrowUp } from 'lucide-react'
import { MessageRenderer } from '@/components/explore/MessageRenderer'
import ChatSourceCards from '@/components/chat/ChatSourceCards'
import ChatRelatedContent from '@/components/chat/ChatRelatedContent'
import { BespokeIcon, type BespokeIconName } from '@/components/ui/BespokeIcon'
import { extractSourcesFromMessage } from '@/lib/chat/extract-sources'

const STARTERS: Array<{ text: string; icon: BespokeIconName }> = [
  { text: 'What is The Centre and The Station project?', icon: 'story' },
  { text: 'Show me highlights from the annual report', icon: 'timeline' },
  { text: 'Tell me the history of Palm Island and Hull River', icon: 'community' },
  { text: 'What are the plans for the next 20 years?', icon: 'quote' },
  { text: 'What do Elders say about the future?', icon: 'photo' },
  { text: "I have a vision for Palm Island's future", icon: 'health' },
]

export default function ChatPage() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  const [input, setInput] = useState('')
  const [mounted, setMounted] = useState(false)
  const [heroVisible, setHeroVisible] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isLoading = status === 'streaming' || status === 'submitted'
  const hasMessages = messages.length > 0

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (hasMessages) setHeroVisible(false)
  }, [hasMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const form = e.currentTarget.closest('form')
      if (form) form.requestSubmit()
    }
  }

  // Extract sources from the latest assistant message's tool results
  const latestAssistantSources = useMemo(() => {
    const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant')
    if (!lastAssistant) return []
    return extractSourcesFromMessage(lastAssistant)
  }, [messages])

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
          <div className="flex items-center gap-4 text-sm">
            <Link href="/stories" className="text-picc-earth-300 hover:text-picc-ochre transition-colors">Stories</Link>
            <Link href="/services" className="text-picc-earth-300 hover:text-picc-ochre transition-colors">Services</Link>
            <Link href="/timeline" className="text-picc-earth-300 hover:text-picc-ochre transition-colors">Timeline</Link>
            <Link href="/voices" className="text-picc-earth-300 hover:text-picc-ochre transition-colors">Voices</Link>
          </div>
        </div>
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

        {/* Starter prompts */}
        <div className={`mt-10 px-6 max-w-2xl mx-auto w-full transition-all duration-500 delay-150 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {STARTERS.map((starter) => (
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

        {/* Footer links */}
        <div className={`mt-8 text-center transition-all duration-500 delay-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-xs text-picc-earth-200">
            Powered by Palm AI · Responses include citations
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
                <div key={message.id}>
                  <MessageRenderer message={message} darkMode={false} />

                  {/* Source cards after assistant messages with tool results */}
                  {message.role === 'assistant' && (() => {
                    const sources = extractSourcesFromMessage(message)
                    if (sources.length === 0) return null
                    return (
                      <div className="mt-3 ml-11">
                        <ChatSourceCards sources={sources} compact />
                      </div>
                    )
                  })()}

                  {/* Related content after the latest assistant message */}
                  {message.role === 'assistant' && index === messages.length - 1 && latestAssistantSources.length > 0 && (
                    <div className="mt-4 ml-11">
                      <ChatRelatedContent sources={latestAssistantSources} />
                    </div>
                  )}
                </div>
              ))}

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
