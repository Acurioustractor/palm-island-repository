'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Quote as QuoteIcon, Search, CheckCircle, Star, Loader2,
  Filter, RefreshCw, User, BookOpen, Heart, Briefcase,
  Users, GraduationCap, Building, Sparkles, Plus
} from 'lucide-react';

interface Quote {
  id: string;
  quote_text: string;
  attribution: string;
  context?: string;
  theme?: string;
  sentiment?: string;
  impact_area?: string;
  is_validated: boolean;
  suggested_for_report: boolean;
  photo_url?: string;
  created_at: string;
}

interface Stats {
  totalSources: number;
  totalContent: number;
  totalChunks: number;
  totalQuotes: number;
  validatedQuotes: number;
}

const THEMES = [
  { id: 'community', label: 'Community', icon: Users, color: 'bg-blue-500' },
  { id: 'services', label: 'Services', icon: Building, color: 'bg-green-500' },
  { id: 'culture', label: 'Culture', icon: BookOpen, color: 'bg-purple-500' },
  { id: 'history', label: 'History', icon: BookOpen, color: 'bg-amber-500' },
  { id: 'achievement', label: 'Achievement', icon: Star, color: 'bg-yellow-500' },
  { id: 'youth', label: 'Youth', icon: GraduationCap, color: 'bg-pink-500' },
  { id: 'employment', label: 'Employment', icon: Briefcase, color: 'bg-indigo-500' },
  { id: 'health', label: 'Health', icon: Heart, color: 'bg-red-500' },
];

const SENTIMENTS = [
  { id: 'inspiring', label: 'Inspiring', emoji: '✨' },
  { id: 'positive', label: 'Positive', emoji: '😊' },
  { id: 'reflective', label: 'Reflective', emoji: '🤔' },
  { id: 'neutral', label: 'Neutral', emoji: '📝' },
];

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [themeFilter, setThemeFilter] = useState('');
  const [validatedOnly, setValidatedOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const supabase = createClient();

  // Load quotes and stats
  const loadData = async () => {
    setLoading(true);

    try {
      // Load quotes
      const { data: quotesData, error: quotesError } = await supabase
        .from('extracted_quotes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!quotesError && quotesData) {
        setQuotes(quotesData);
      }

      // Load stats from API
      const statsRes = await fetch('/api/scraper/auto-sync');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }

    setLoading(false);
  };

  // Trigger auto-sync
  const triggerSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/scraper/auto-sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        await loadData();
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
    setSyncing(false);
  };

  // Toggle quote validation
  const toggleValidated = async (quote: Quote) => {
    const { error } = await (supabase as any)
      .from('extracted_quotes')
      .update({
        is_validated: !quote.is_validated,
        validated_at: !quote.is_validated ? new Date().toISOString() : null
      })
      .eq('id', quote.id);

    if (!error) {
      setQuotes(quotes.map(q =>
        q.id === quote.id ? { ...q, is_validated: !q.is_validated } : q
      ));
    }
  };

  // Toggle report suggestion
  const toggleReportReady = async (quote: Quote) => {
    const { error } = await (supabase as any)
      .from('extracted_quotes')
      .update({ suggested_for_report: !quote.suggested_for_report })
      .eq('id', quote.id);

    if (!error) {
      setQuotes(quotes.map(q =>
        q.id === quote.id ? { ...q, suggested_for_report: !q.suggested_for_report } : q
      ));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter quotes
  const filteredQuotes = quotes.filter(quote => {
    if (searchQuery && !quote.quote_text.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !quote.attribution?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (themeFilter && quote.theme !== themeFilter) return false;
    if (validatedOnly && !quote.is_validated) return false;
    return true;
  });

  // Get theme info
  const getTheme = (themeId?: string) => THEMES.find(t => t.id === themeId);
  const getSentiment = (sentimentId?: string) => SENTIMENTS.find(s => s.id === sentimentId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Quotes</h1>
          <p className="text-gray-600 mt-1">
            Curated quotes from community stories, news, and content
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Quote
          </button>
          <button
            onClick={triggerSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Content'}
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-4 border">
            <div className="text-2xl font-bold text-blue-600">{stats.totalQuotes}</div>
            <div className="text-sm text-gray-600">Total Quotes</div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="text-2xl font-bold text-green-600">{stats.validatedQuotes}</div>
            <div className="text-sm text-gray-600">Validated</div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="text-2xl font-bold text-purple-600">{stats.totalContent}</div>
            <div className="text-sm text-gray-600">Articles</div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="text-2xl font-bold text-amber-600">{stats.totalSources}</div>
            <div className="text-sm text-gray-600">Sources</div>
          </div>
          <div className="bg-white rounded-lg p-4 border flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="text-sm text-green-600 font-medium">Auto-syncing</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quotes..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Theme Filter */}
          <div className="relative">
            <select
              value={themeFilter}
              onChange={(e) => setThemeFilter(e.target.value)}
              className="appearance-none px-4 py-2 pr-8 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Themes</option>
              {THEMES.map(theme => (
                <option key={theme.id} value={theme.id}>{theme.label}</option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Validated Only */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={validatedOnly}
              onChange={(e) => setValidatedOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Validated only</span>
          </label>
        </div>
      </div>

      {/* Quotes Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredQuotes.map(quote => {
          const theme = getTheme(quote.theme);
          const sentiment = getSentiment(quote.sentiment);

          return (
            <div
              key={quote.id}
              className={`bg-white rounded-lg border p-5 hover:shadow-md transition-shadow ${
                quote.suggested_for_report ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
              {/* Quote Text */}
              <div className="relative mb-4">
                <QuoteIcon className="absolute -top-2 -left-2 h-6 w-6 text-gray-200" />
                <p className="text-gray-800 leading-relaxed pl-4">
                  "{quote.quote_text}"
                </p>
              </div>

              {/* Attribution */}
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {quote.attribution || 'Unknown'}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {theme && (
                  <span className={`px-2 py-1 text-xs rounded-full text-white ${theme.color}`}>
                    {theme.label}
                  </span>
                )}
                {sentiment && (
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                    {sentiment.emoji} {sentiment.label}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t">
                <button
                  onClick={() => toggleValidated(quote)}
                  className={`flex items-center gap-1 text-sm ${
                    quote.is_validated ? 'text-green-600' : 'text-gray-400 hover:text-green-600'
                  }`}
                >
                  <CheckCircle className="h-4 w-4" />
                  {quote.is_validated ? 'Validated' : 'Validate'}
                </button>

                <button
                  onClick={() => toggleReportReady(quote)}
                  className={`flex items-center gap-1 text-sm ${
                    quote.suggested_for_report ? 'text-yellow-600' : 'text-gray-400 hover:text-yellow-600'
                  }`}
                >
                  <Star className="h-4 w-4" />
                  {quote.suggested_for_report ? 'Report Ready' : 'Add to Report'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredQuotes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <QuoteIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || themeFilter
              ? 'Try adjusting your filters'
              : 'Click "Sync Content" to fetch new content and extract quotes'}
          </p>
          <button
            onClick={triggerSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {syncing ? 'Syncing...' : 'Sync Content'}
          </button>
        </div>
      )}

      {/* Add Quote Modal */}
      {showAddModal && (
        <AddQuoteModal
          onClose={() => setShowAddModal(false)}
          onAdd={() => {
            setShowAddModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// Add Quote Modal
function AddQuoteModal({ onClose, onAdd }: { onClose: () => void; onAdd: () => void }) {
  const [form, setForm] = useState({
    quote_text: '',
    attribution: '',
    context: '',
    theme: '',
    sentiment: 'positive',
    impact_area: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/scraper/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manual: true,
          ...form
        })
      });

      if (res.ok) {
        onAdd();
      }
    } catch (error) {
      console.error('Error adding quote:', error);
    }

    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <h2 className="text-xl font-bold mb-4">Add Quote Manually</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quote Text *</label>
            <textarea
              value={form.quote_text}
              onChange={(e) => setForm({ ...form, quote_text: e.target.value })}
              rows={3}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the quote..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attribution *</label>
            <input
              type="text"
              value={form.attribution}
              onChange={(e) => setForm({ ...form, attribution: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Who said this?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Context</label>
            <input
              type="text"
              value={form.context}
              onChange={(e) => setForm({ ...form, context: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Where/when was this said?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
              <select
                value={form.theme}
                onChange={(e) => setForm({ ...form, theme: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select theme</option>
                {THEMES.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sentiment</label>
              <select
                value={form.sentiment}
                onChange={(e) => setForm({ ...form, sentiment: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {SENTIMENTS.map(s => (
                  <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.quote_text || !form.attribution}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Quote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
