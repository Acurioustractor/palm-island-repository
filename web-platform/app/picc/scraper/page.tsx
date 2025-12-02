'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  Quote as QuoteIcon, Search, Filter, Star, CheckCircle, X,
  Loader2, ExternalLink, Calendar, Tag, TrendingUp, RefreshCw,
  FileText, User, Sparkles, BookOpen, Globe, Clock, ChevronDown
} from 'lucide-react';

interface ExtractedQuote {
  id: string;
  quote_text: string;
  attribution: string;
  context?: string;
  theme?: string;
  sentiment?: string;
  impact_area?: string;
  is_validated: boolean;
  suggested_for_report: boolean;
  source_url?: string;
  created_at: string;
  profile?: {
    id: string;
    full_name: string;
    preferred_name?: string;
  };
}

interface ContentChunk {
  id: string;
  title: string;
  content: string;
  url: string;
  source_name: string;
  published_at?: string;
  is_quotable: boolean;
  topics?: string[];
  created_at: string;
}

interface ContentSource {
  id: string;
  name: string;
  source_url: string;
  source_type: string;
  last_scraped_at?: string;
  is_active: boolean;
}

const themes = ['community', 'services', 'culture', 'history', 'achievement', 'resilience', 'youth', 'elders', 'innovation', 'connection'];

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<ExtractedQuote[]>([]);
  const [content, setContent] = useState<ContentChunk[]>([]);
  const [sources, setSources] = useState<ContentSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [themeFilter, setThemeFilter] = useState('');
  const [showValidatedOnly, setShowValidatedOnly] = useState(false);
  const [showReportOnly, setShowReportOnly] = useState(false);

  // View state
  const [selectedContent, setSelectedContent] = useState<ContentChunk | null>(null);

  const supabase = createClient();

  const loadData = useCallback(async () => {
    setLoading(true);

    // Load quotes
    const { data: quotesData } = await (supabase as any)
      .from('extracted_quotes')
      .select(`
        *,
        profile:profile_id(id, full_name, preferred_name)
      `)
      .order('created_at', { ascending: false })
      .limit(200);

    if (quotesData) {
      setQuotes(quotesData);
    }

    // Load recent content
    const { data: contentData } = await (supabase as any)
      .from('content_chunks')
      .select('id, title, content, url, source_name, published_at, is_quotable, topics, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (contentData) {
      setContent(contentData);
    }

    // Load sources (just for stats)
    const { data: sourcesData } = await (supabase as any)
      .from('content_sources')
      .select('*')
      .eq('is_active', true);

    if (sourcesData) {
      setSources(sourcesData);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter quotes
  const filteredQuotes = quotes.filter(quote => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!quote.quote_text.toLowerCase().includes(query) &&
          !quote.attribution?.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (themeFilter && quote.theme !== themeFilter) return false;
    if (showValidatedOnly && !quote.is_validated) return false;
    if (showReportOnly && !quote.suggested_for_report) return false;
    return true;
  });

  // Stats
  const validatedCount = quotes.filter(q => q.is_validated).length;
  const reportReadyCount = quotes.filter(q => q.suggested_for_report).length;
  const recentContentCount = content.filter(c => {
    const created = new Date(c.created_at);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return created > weekAgo;
  }).length;

  const validateQuote = async (quoteId: string, validated: boolean) => {
    await (supabase as any)
      .from('extracted_quotes')
      .update({ is_validated: validated })
      .eq('id', quoteId);

    setQuotes(quotes.map(q => q.id === quoteId ? { ...q, is_validated: validated } : q));
  };

  const toggleReportSuggestion = async (quoteId: string, suggested: boolean) => {
    await (supabase as any)
      .from('extracted_quotes')
      .update({ suggested_for_report: suggested })
      .eq('id', quoteId);

    setQuotes(quotes.map(q => q.id === quoteId ? { ...q, suggested_for_report: suggested } : q));
  };

  const extractQuotesFromContent = async (chunk: ContentChunk) => {
    setExtracting(chunk.id);

    try {
      const response = await fetch('/api/content/extract-quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_id: chunk.id,
          content_text: chunk.content,
          source_name: chunk.source_name,
          source_url: chunk.url
        })
      });

      const result = await response.json();

      if (result.success) {
        loadData(); // Reload to get new quotes
      }
    } catch (error) {
      console.error('Extract error:', error);
    }

    setExtracting(null);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600" />
        <p className="text-gray-500 mt-2">Loading content...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Community Quotes</h1>
        <p className="text-gray-600 mt-1">
          Powerful voices from your community for annual reports and stories
        </p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <QuoteIcon className="w-5 h-5 text-amber-600" />
            <span className="text-2xl font-bold text-amber-700">{quotes.length}</span>
          </div>
          <div className="text-sm text-amber-600">Total Quotes</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold text-green-700">{validatedCount}</span>
          </div>
          <div className="text-sm text-green-600">Validated</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-purple-600" />
            <span className="text-2xl font-bold text-purple-700">{reportReadyCount}</span>
          </div>
          <div className="text-sm text-purple-600">Report Ready</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold text-blue-700">{recentContentCount}</span>
          </div>
          <div className="text-sm text-blue-600">New Articles (7d)</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quotes List - Priority View */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search quotes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <select
                value={themeFilter}
                onChange={(e) => setThemeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
              >
                <option value="">All Themes</option>
                {themes.map(theme => (
                  <option key={theme} value={theme}>{theme}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showValidatedOnly}
                  onChange={(e) => setShowValidatedOnly(e.target.checked)}
                  className="rounded text-amber-600"
                />
                <span className="text-sm text-gray-600">Validated</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showReportOnly}
                  onChange={(e) => setShowReportOnly(e.target.checked)}
                  className="rounded text-amber-600"
                />
                <span className="text-sm text-gray-600">Report Ready</span>
              </label>
            </div>
          </div>

          {/* Quotes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">{filteredQuotes.length} Quotes</h2>
              <Link
                href="/picc/annual-reports"
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                Add to Reports →
              </Link>
            </div>

            {filteredQuotes.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <QuoteIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">No quotes found</p>
                <p className="text-sm text-gray-400">
                  Quotes are automatically extracted from content sources
                </p>
              </div>
            ) : (
              filteredQuotes.slice(0, 20).map(quote => (
                <div
                  key={quote.id}
                  className={`bg-white border rounded-xl p-5 transition-all ${
                    quote.suggested_for_report
                      ? 'border-amber-300 bg-amber-50/30'
                      : quote.is_validated
                        ? 'border-green-200'
                        : 'border-gray-200'
                  }`}
                >
                  <blockquote className="text-gray-700 italic mb-3 text-lg leading-relaxed">
                    "{quote.quote_text}"
                  </blockquote>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-gray-600 font-medium">
                        — {quote.attribution || 'Community Voice'}
                      </span>
                      {quote.theme && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                          {quote.theme}
                        </span>
                      )}
                      {quote.source_url && (
                        <a
                          href={quote.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Source
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => validateQuote(quote.id, !quote.is_validated)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          quote.is_validated
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <CheckCircle className="w-3 h-3" />
                        {quote.is_validated ? 'Validated' : 'Validate'}
                      </button>
                      <button
                        onClick={() => toggleReportSuggestion(quote.id, !quote.suggested_for_report)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          quote.suggested_for_report
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Star className="w-3 h-3" />
                        {quote.suggested_for_report ? 'Report Ready' : 'For Report'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {filteredQuotes.length > 20 && (
              <p className="text-center text-sm text-gray-500 py-4">
                Showing 20 of {filteredQuotes.length} quotes
              </p>
            )}
          </div>
        </div>

        {/* Sidebar - Content & Sources */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-6 text-white">
            <h3 className="font-bold mb-2">Ready for Reports?</h3>
            <p className="text-amber-100 text-sm mb-4">
              {reportReadyCount} quotes ready to add to your annual report
            </p>
            <Link
              href="/picc/annual-reports"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-amber-600 rounded-lg font-medium hover:bg-amber-50"
            >
              <FileText className="w-4 h-4" />
              Go to Reports
            </Link>
          </div>

          {/* Content Sources Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                Content Sources
              </h3>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Auto-syncing
              </span>
            </div>

            <div className="space-y-2 text-sm">
              {sources.slice(0, 5).map(source => (
                <div key={source.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-gray-700 truncate flex-1">{source.name}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {source.last_scraped_at
                      ? new Date(source.last_scraped_at).toLocaleDateString()
                      : 'Pending'
                    }
                  </span>
                </div>
              ))}
            </div>

            {sources.length > 5 && (
              <p className="text-xs text-gray-400 mt-3 text-center">
                +{sources.length - 5} more sources
              </p>
            )}

            <p className="text-xs text-gray-500 mt-4 pt-3 border-t border-gray-100">
              Content is automatically collected from {sources.length} sources on a weekly/monthly schedule
            </p>
          </div>

          {/* Recent Content */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gray-400" />
              Recent Articles
            </h3>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {content.slice(0, 10).map(chunk => (
                <div
                  key={chunk.id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => setSelectedContent(chunk)}
                >
                  <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                    {chunk.title || 'Untitled'}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{chunk.source_name}</span>
                    {chunk.published_at && (
                      <>
                        <span>•</span>
                        <span>{new Date(chunk.published_at).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Help */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2">How it works</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                Content is automatically collected from news & community sources
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                AI extracts meaningful quotes from the content
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                Validate quotes and mark them for annual reports
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Content Detail Modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedContent.title}</h2>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <span>{selectedContent.source_name}</span>
                  {selectedContent.url && (
                    <a
                      href={selectedContent.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Source
                    </a>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedContent(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-96">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {selectedContent.content}
              </p>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedContent.topics?.map((topic, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {topic}
                  </span>
                ))}
              </div>
              <button
                onClick={() => {
                  extractQuotesFromContent(selectedContent);
                  setSelectedContent(null);
                }}
                disabled={extracting === selectedContent.id}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 flex items-center gap-2"
              >
                {extracting === selectedContent.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Extract Quotes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
