'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { BespokeIcon } from '@/components/ui/BespokeIcon';
import ChatMarkdown from '@/components/chat/ChatMarkdown';
import ChatSourceCards from '@/components/chat/ChatSourceCards';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    id: string;
    type: string;
    title: string;
    snippet: string;
    url?: string;
  }>;
  timestamp?: string;
}

interface ChatWidgetProps {
  position?: 'bottom-right' | 'bottom-left';
  welcomeMessage?: string;
}

export default function ChatWidget({
  position = 'bottom-right',
  welcomeMessage = "Welcome to Palm Island Community Company. Ask me about our services, community stories, or 17 years of impact on Manbarra and Bwgcolman Country."
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: welcomeMessage }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [starters, setStarters] = useState<string[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/unified/chat?action=starters')
      .then(res => res.json())
      .then(data => setStarters(data.starters || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/unified/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationId,
          messages: messages.filter(m => m.role !== 'assistant' || m.content !== welcomeMessage)
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      setConversationId(data.conversationId);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        sources: data.sources,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble right now. Please try again in a moment."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const positionClasses = position === 'bottom-right'
    ? 'right-4 sm:right-6'
    : 'left-4 sm:left-6';

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 sm:bottom-6 ${positionClasses} z-50 p-4 bg-picc-ochre text-white rounded-full shadow-lg hover:bg-picc-ochre-600 transition-all hover:scale-105 ${isOpen ? 'hidden' : ''}`}
        aria-label="Open chat"
      >
        <span className="text-white font-bold text-lg font-serif">P</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-4 sm:bottom-6 ${positionClasses} z-50 w-[calc(100vw-2rem)] sm:w-96 h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-warm-200`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-picc-ochre to-picc-ochre-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm font-serif">P</span>
              <span className="font-semibold">Palm Island Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-picc-ochre text-white rounded-br-md'
                    : 'bg-warm-50 text-picc-earth border border-warm-200 rounded-bl-md'
                }`}>
                  {msg.role === 'assistant' ? (
                    <ChatMarkdown content={msg.content} className="text-sm [&_p]:text-sm [&_p]:mb-1" />
                  ) : (
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  )}

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-warm-200/50">
                      <ChatSourceCards sources={msg.sources.slice(0, 3)} compact />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-warm-50 border border-warm-200 rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-picc-ochre" />
                </div>
              </div>
            )}

            {/* Conversation starters */}
            {messages.length === 1 && starters.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-picc-earth-300 text-center">Try asking:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {starters.slice(0, 4).map((starter, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(starter)}
                      className="text-xs bg-warm-100 text-picc-ochre-700 px-3 py-1.5 rounded-full hover:bg-warm-200 transition-colors"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-warm-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Palm Island..."
                className="flex-1 px-4 py-2 border border-warm-200 rounded-full text-sm focus:ring-2 focus:ring-picc-ochre focus:border-picc-ochre outline-none text-picc-earth placeholder:text-picc-earth-200"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 bg-picc-ochre text-white rounded-full hover:bg-picc-ochre-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
