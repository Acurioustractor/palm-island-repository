'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Send, Bot, User, Sparkles, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { getHeroImage } from '@/lib/media/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; url: string }>;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "G'day! I'm here to help you explore PICC's 15-year journey of community-led impact. Ask me about our services, programs, annual reports, or community stories. What would you like to know?",
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
        const image = await getHeroImage('chat');
        setHeroImage(image);
      } catch (error) {
        console.error('Error fetching hero image:', error);
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

  const suggestedQuestions = [
    "What services does PICC provide to the community?",
    "Tell me about PICC's health programs",
    "What was accomplished in the 2023-24 annual report?",
    "How has PICC grown over the past 15 years?",
    "What housing services are available?",
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Hero Section */}
      <section
        className="border-b border-gray-100 py-16"
        style={heroImage ? {
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.95)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      >
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Ask PICC
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Explore 15 years of community-led impact through conversation
            </p>
          </div>
        </div>
      </section>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-20">

        {/* Messages Area */}
        <div className="space-y-12 mb-20">
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
                <span className="text-lg">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-6">
          <div className="max-w-4xl mx-auto px-6 sm:px-8">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about PICC's services, programs, or impact..."
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

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="mb-32">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6">
              Try asking about
            </h3>
            <div className="space-y-3">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInput(question);
                    inputRef.current?.focus();
                  }}
                  className="w-full text-left px-6 py-4 border border-gray-200 hover:border-gray-900 rounded-2xl transition-colors text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-900/10"
                >
                  {question}
                </button>
              ))}
            </div>

            {/* Footer Links */}
            <div className="mt-16 pt-8 border-t border-gray-100 text-center">
              <p className="text-gray-500 mb-2">
                Or explore visually:{' '}
                <Link href="/annual-reports" className="text-gray-900 hover:underline font-medium">
                  Timeline
                </Link>
                {' · '}
                <Link href="/stories" className="text-gray-900 hover:underline font-medium">
                  Stories
                </Link>
              </p>
              <p className="text-xs text-gray-400 mt-4">
                Powered by Claude Sonnet · All responses include citations
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
