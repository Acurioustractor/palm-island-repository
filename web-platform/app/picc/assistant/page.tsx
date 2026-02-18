'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Send, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { BespokeIcon, type BespokeIconName } from '@/components/ui/BespokeIcon';
import ChatMarkdown from '@/components/chat/ChatMarkdown';
import ChatSourceCards from '@/components/chat/ChatSourceCards';
import ChatRelatedContent from '@/components/chat/ChatRelatedContent';

interface Source {
  id?: string;
  title: string;
  url?: string;
  type?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Welcome to the PICC Intelligence Assistant. I have access to 17 years of annual reports, community stories, service data, financials, and analytics across Palm Island Community Company. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    async function fetchHeroImage() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('media_files')
          .select('public_url')
          .eq('page_context', 'assistant')
          .eq('page_section', 'hero')
          .eq('is_public', true)
          .eq('is_featured', true)
          .limit(1)
          .single();
        if (data?.public_url) {
          setHeroImage(data.public_url);
        }
      } catch {
        // Hero image is optional
      }
    }
    fetchHeroImage();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch('/api/unified/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          messages: messages.filter(m => m.role !== 'assistant' || m.content !== "Welcome to the PICC Intelligence Assistant. I have access to 17 years of annual reports, community stories, service data, financials, and analytics across Palm Island Community Company. How can I help you today?"),
          stream: false,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
          sources: data.sources || [],
        },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, I encountered an error. Please try again or contact support if the problem persists.",
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const quickActions: Array<{ icon: BespokeIconName; label: string; query: string }> = [
    {
      icon: 'economic',
      label: 'Get Latest Stats',
      query: 'What are the latest statistics across all PICC services?',
    },
    {
      icon: 'timeline',
      label: 'Analyze Trends',
      query: 'What trends can you identify in PICC services over the past 3 years?',
    },
    {
      icon: 'community',
      label: 'Community Impact',
      query: "Summarize PICC's community impact in the last annual report",
    },
    {
      icon: 'knowledge',
      label: 'Generate Report Brief',
      query: 'Create a brief summary of PICC achievements for a funder report',
    },
    {
      icon: 'culture',
      label: 'Recent Activity',
      query: 'What major programs or initiatives were launched in the past year?',
    },
    {
      icon: 'search',
      label: 'Find Specific Data',
      query: 'Help me find specific data about [health/housing/education] services',
    },
  ];

  const handleQuickAction = (query: string) => {
    setInput(query);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-cream">
      {/* Header */}
      <section
        className="border-b border-warm-200 py-12"
        style={heroImage ? {
          backgroundImage: `linear-gradient(rgba(245, 230, 211, 0.92), rgba(253, 248, 238, 0.95)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12">
                <Image src="/logo/picc-logo-full.png" alt="PICC" width={48} height={48} className="object-contain" style={{ mixBlendMode: 'multiply' }} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-picc-earth">
                  Intelligence Assistant
                </h1>
                <p className="text-picc-earth-300 mt-1">
                  Staff research and analysis tool
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/picc/analytics"
                className="text-sm text-picc-earth-300 hover:text-picc-earth transition-colors font-medium"
              >
                Analytics
              </Link>
              <Link
                href="/annual-reports"
                className="text-sm text-picc-earth-300 hover:text-picc-earth transition-colors font-medium"
              >
                Timeline
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h3 className="text-xs font-semibold text-picc-earth-300 uppercase tracking-wider mb-6">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.query)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white/60 border border-warm-200 hover:border-picc-ochre rounded-xl transition-all text-left group focus:outline-none focus:ring-4 focus:ring-picc-ochre/10"
                  >
                    <BespokeIcon name={action.icon} size={28} />
                    <span className="text-sm text-picc-earth group-hover:text-picc-earth transition-colors">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">

            {/* Messages Area */}
            <div className="space-y-10 mb-32">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-4 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-10 h-10 bg-picc-ochre rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg font-serif">P</span>
                    </div>
                  )}

                  <div className={`max-w-2xl ${message.role === 'user' ? '' : ''}`}>
                    {message.role === 'user' ? (
                      <div className="bg-picc-ochre text-white rounded-2xl rounded-br-md px-5 py-3">
                        <p className="text-lg leading-relaxed">{message.content}</p>
                      </div>
                    ) : (
                      <div className="bg-white/80 border border-warm-200 rounded-2xl rounded-bl-md px-5 py-4">
                        <ChatMarkdown content={message.content} />

                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-warm-100">
                            <ChatSourceCards sources={message.sources} />
                          </div>
                        )}
                      </div>
                    )}

                    {message.role === 'assistant' && message.sources && index === messages.length - 1 && (
                      <ChatRelatedContent sources={message.sources} />
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-10 h-10 bg-warm-200 rounded-full flex items-center justify-center">
                      <BespokeIcon name="person" size={28} />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-picc-earth rounded-full flex items-center justify-center">
                    <BespokeIcon name="campfire" size={20} darkMode />
                  </div>
                  <div className="flex items-center gap-3 text-picc-earth-300">
                    <Loader2 className="w-5 h-5 animate-spin text-picc-ochre" />
                    <span className="text-lg">Analyzing...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-warm-200 py-6">
              <div className="max-w-7xl mx-auto px-6 sm:px-8">
                <div className="lg:pl-[calc(25%+3rem)]">
                  <form onSubmit={handleSubmit} className="flex gap-4">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about data, trends, or request analysis..."
                      className="flex-1 px-6 py-4 border border-warm-200 rounded-full focus:border-picc-ochre focus:outline-none focus:ring-4 focus:ring-picc-ochre/10 text-lg text-picc-earth placeholder:text-picc-earth-200 disabled:bg-warm-50 disabled:cursor-not-allowed transition-all"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="px-8 py-4 bg-picc-ochre text-white rounded-full hover:bg-picc-ochre-600 transition-colors font-medium disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-picc-ochre/20"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
