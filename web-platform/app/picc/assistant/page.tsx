'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Send,
  Bot,
  User,
  Sparkles,
  FileText,
  ExternalLink,
  Loader2,
  Search,
  TrendingUp,
  Calendar,
  Users,
  BarChart3,
  FileBarChart,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; url: string }>;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "G'day! I'm your PICC intelligence assistant. I have access to all 15 years of annual reports, community stories, service data, and analytics. How can I help you today?",
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
      } catch (error) {
        // Hero image is optional, fail silently
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

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Call the chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      // Add assistant message with sources
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.response,
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

  const quickActions = [
    {
      icon: BarChart3,
      label: 'Get Latest Stats',
      query: 'What are the latest statistics across all PICC services?',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      icon: TrendingUp,
      label: 'Analyze Trends',
      query: 'What trends can you identify in PICC services over the past 3 years?',
      color: 'from-purple-500 to-pink-600',
    },
    {
      icon: Users,
      label: 'Community Impact',
      query: 'Summarize PICC\'s community impact in the last annual report',
      color: 'from-green-500 to-emerald-600',
    },
    {
      icon: FileBarChart,
      label: 'Generate Report Brief',
      query: 'Create a brief summary of PICC achievements for a funder report',
      color: 'from-orange-500 to-red-600',
    },
    {
      icon: Calendar,
      label: 'Recent Activity',
      query: 'What major programs or initiatives were launched in the past year?',
      color: 'from-amber-500 to-orange-600',
    },
    {
      icon: Search,
      label: 'Find Specific Data',
      query: 'Help me find specific data about [health/housing/education] services',
      color: 'from-indigo-500 to-blue-600',
    },
  ];

  const handleQuickAction = (query: string) => {
    setInput(query);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <section
        className="border-b border-gray-100 py-12"
        style={heroImage ? {
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.95)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Intelligence Assistant
                </h1>
                <p className="text-gray-500 mt-1">
                  Staff research and analysis tool
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/picc/analytics"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Analytics
              </Link>
              <Link
                href="/annual-reports"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
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
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-6">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.query)}
                      className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 hover:border-gray-900 rounded-xl transition-colors text-left group focus:outline-none focus:ring-4 focus:ring-gray-900/10"
                    >
                      <Icon className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                        {action.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">

            {/* Messages Area */}
            <div className="space-y-12 mb-32">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-6 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div className={`max-w-2xl ${message.role === 'user' ? 'text-right' : ''}`}>
                    <p className={`text-lg leading-relaxed whitespace-pre-wrap ${
                      message.role === 'user' ? 'text-gray-900 font-medium' : 'text-gray-700'
                    }`}>
                      {message.content}
                    </p>

                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                          Sources
                        </div>
                        <div className="space-y-2">
                          {message.sources.map((source, idx) => (
                            <Link
                              key={idx}
                              href={source.url}
                              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>{source.title}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-6 justify-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-lg">Analyzing...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-6">
              <div className="max-w-7xl mx-auto px-6 sm:px-8">
                <div className="lg:pl-[calc(25%+3rem)]">
                  <form onSubmit={handleSubmit} className="flex gap-4">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about data, trends, or request analysis..."
                      className="flex-1 px-6 py-4 border border-gray-200 rounded-full focus:border-gray-400 focus:outline-none text-lg disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="px-8 py-4 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors font-medium disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-gray-900/20"
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
