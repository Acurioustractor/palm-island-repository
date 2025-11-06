'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Lightbulb, Quote, MessageSquare, Sparkles, ArrowRight } from 'lucide-react';

export default function ResearchPage() {
  const features = [
    {
      title: 'Semantic Search',
      description: 'Search stories and documents using natural language. Ask questions and find content by meaning, not just keywords.',
      icon: Search,
      href: '/research/semantic-search',
      color: 'from-blue-500 to-cyan-500',
      available: true
    },
    {
      title: 'Theme Explorer',
      description: 'Discover themes and topics across the archive. Explore connections between stories and understand patterns.',
      icon: Lightbulb,
      href: '/research/themes',
      color: 'from-purple-500 to-pink-500',
      available: false
    },
    {
      title: 'Quote Finder',
      description: 'Find powerful quotes and key passages. Search by topic, theme, or sentiment to discover impactful moments.',
      icon: Quote,
      href: '/research/quotes',
      color: 'from-orange-500 to-red-500',
      available: false
    },
    {
      title: 'Research Assistant',
      description: 'Chat with an AI assistant to explore the archive. Ask questions, get summaries, and discover connections.',
      icon: MessageSquare,
      href: '/research/assistant',
      color: 'from-green-500 to-teal-500',
      available: false
    }
  ];

  return (
    
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-ocean-deep to-ocean-medium text-white py-16">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-12 h-12 text-coral-warm" />
              <h1 className="text-4xl md:text-5xl font-bold">
                AI-Powered Analysis
              </h1>
            </div>
            <p className="text-xl text-white max-w-3xl mb-8">
              Explore the Palm Island Story Archive with powerful AI tools. Search by meaning,
              discover themes, find quotes, and chat with an intelligent research assistant.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/research/semantic-search"
                className="btn-primary flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Try Semantic Search
              </Link>
              <Link
                href="/stories"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-bold transition-all flex items-center gap-2"
              >
                Browse Stories
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-ocean-deep mb-4">
              Research Tools
            </h2>
            <p className="text-lg text-earth-medium max-w-3xl">
              Choose from our suite of AI-powered tools to explore the archive in new ways.
              Each tool offers unique insights into the stories and documents.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`card-modern p-8 ${
                    feature.available
                      ? 'hover:shadow-xl cursor-pointer'
                      : 'opacity-60'
                  } transition-all relative overflow-hidden`}
                >
                  {/* Background Gradient */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 rounded-full transform translate-x-16 -translate-y-16`}></div>

                  {/* Content */}
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      {!feature.available && (
                        <span className="px-3 py-1 bg-earth-bg text-earth-medium text-xs font-medium rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl font-bold text-ocean-deep mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-earth-dark mb-6">
                      {feature.description}
                    </p>

                    {feature.available ? (
                      <Link
                        href={feature.href}
                        className="inline-flex items-center gap-2 text-coral-warm font-medium hover:text-ocean-medium transition-colors"
                      >
                        Get Started
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <div className="text-earth-medium font-medium">
                        In Development
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-earth-bg py-16">
          <div className="max-w-7xl mx-auto px-8">
            <h2 className="text-3xl font-bold text-ocean-deep mb-8 text-center">
              How Analysis Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-coral-warm text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold text-ocean-deep mb-2">
                  Understanding Content
                </h3>
                <p className="text-earth-medium">
                  AI reads and understands the meaning of every story and document in the archive
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-coral-warm text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold text-ocean-deep mb-2">
                  Finding Connections
                </h3>
                <p className="text-earth-medium">
                  The system identifies themes, patterns, and relationships across different stories
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-coral-warm text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold text-ocean-deep mb-2">
                  Delivering Insights
                </h3>
                <p className="text-earth-medium">
                  You get relevant results based on meaning, not just matching keywords
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy & Ethics */}
        <div className="max-w-4xl mx-auto px-8 py-16">
          <div className="card-modern p-8 bg-gradient-to-br from-ocean-deep/5 to-coral-warm/5">
            <h3 className="text-2xl font-bold text-ocean-deep mb-4">
              Privacy & Ethical AI
            </h3>
            <div className="space-y-3 text-earth-dark">
              <p className="flex items-start gap-3">
                <span className="text-coral-warm text-xl">•</span>
                <span>All stories remain within the Palm Island Story Server - we don't share your data with third parties</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-coral-warm text-xl">•</span>
                <span>AI tools respect the same access permissions as the regular archive</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-coral-warm text-xl">•</span>
                <span>Search history is private and only visible to you</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-coral-warm text-xl">•</span>
                <span>Community stories are treated with respect and cultural sensitivity</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    
  );
}
