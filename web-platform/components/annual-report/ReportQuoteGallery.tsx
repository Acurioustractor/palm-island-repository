'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  MessageSquareQuote, Plus, Check, X, Upload, Loader2,
  Filter, Search, ChevronDown, Star, ImageIcon
} from 'lucide-react';

export interface ExtractedQuote {
  id: string;
  quote_text: string;
  attribution: string;
  context?: string;
  theme?: string;
  sentiment?: string;
  impact_area?: string;
  photo_url?: string;
  is_validated: boolean;
  suggested_for_report: boolean;
  used_in_report_id?: string;
  display_order?: number;
  created_at: string;
}

interface ReportQuoteGalleryProps {
  reportId: string;
  onQuotesChange?: (quotes: ExtractedQuote[]) => void;
  maxQuotes?: number;
}

export function ReportQuoteGallery({
  reportId,
  onQuotesChange,
  maxQuotes = 10,
}: ReportQuoteGalleryProps) {
  const [assignedQuotes, setAssignedQuotes] = useState<ExtractedQuote[]>([]);
  const [availableQuotes, setAvailableQuotes] = useState<ExtractedQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [themeFilter, setThemeFilter] = useState<string>('');
  const [showAddQuote, setShowAddQuote] = useState(false);

  const themes = ['community', 'services', 'culture', 'history', 'achievement', 'youth', 'employment', 'health'];

  const loadQuotes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/annual-reports/${reportId}/quotes`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load quotes');
      }

      setAssignedQuotes(data.assigned || []);
      setAvailableQuotes(data.available || []);
      onQuotesChange?.(data.assigned || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [reportId, onQuotesChange]);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

  const assignQuote = async (quoteId: string) => {
    try {
      const response = await fetch(`/api/annual-reports/${reportId}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quote_ids: [...assignedQuotes.map(q => q.id), quoteId],
        }),
      });

      if (response.ok) {
        await loadQuotes();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const removeQuote = async (quoteId: string) => {
    try {
      const response = await fetch(
        `/api/annual-reports/${reportId}/quotes?quote_id=${quoteId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        await loadQuotes();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredAvailable = availableQuotes.filter((quote) => {
    const matchesSearch =
      !searchTerm ||
      quote.quote_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.attribution?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTheme = !themeFilter || quote.theme === themeFilter;
    return matchesSearch && matchesTheme;
  });

  const themeColors: Record<string, string> = {
    community: 'bg-purple-100 text-purple-700 border-purple-200',
    services: 'bg-blue-100 text-blue-700 border-blue-200',
    culture: 'bg-amber-100 text-amber-700 border-amber-200',
    history: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    achievement: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    youth: 'bg-pink-100 text-pink-700 border-pink-200',
    employment: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    health: 'bg-green-100 text-green-700 border-green-200',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Assigned Quotes Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquareQuote className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Report Quotes</h3>
              <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                {assignedQuotes.length}/{maxQuotes}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4">
          {assignedQuotes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquareQuote className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No quotes assigned yet.</p>
              <p className="text-sm">Add quotes from the gallery below.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {assignedQuotes.map((quote, index) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  index={index + 1}
                  onRemove={() => removeQuote(quote.id)}
                  themeColors={themeColors}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Available Quotes Gallery */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Quote Gallery</h3>
            <button
              onClick={() => setShowAddQuote(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Manual Quote
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search quotes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="relative">
              <select
                value={themeFilter}
                onChange={(e) => setThemeFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                <option value="">All Themes</option>
                {themes.map((theme) => (
                  <option key={theme} value={theme}>
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="p-4 max-h-[500px] overflow-y-auto">
          {filteredAvailable.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No validated quotes available.</p>
              <p className="text-sm mt-1">
                Validate quotes in the Content Scraper to make them available here.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredAvailable.map((quote) => (
                <AvailableQuoteCard
                  key={quote.id}
                  quote={quote}
                  onAdd={() => assignQuote(quote.id)}
                  disabled={assignedQuotes.length >= maxQuotes}
                  themeColors={themeColors}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Manual Quote Modal */}
      {showAddQuote && (
        <AddQuoteModal
          onClose={() => setShowAddQuote(false)}
          onSave={async (quote) => {
            try {
              const response = await fetch('/api/scraper/quotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...quote, manual: true }),
              });

              if (response.ok) {
                setShowAddQuote(false);
                await loadQuotes();
              }
            } catch (err: any) {
              setError(err.message);
            }
          }}
          themes={themes}
        />
      )}
    </div>
  );
}

// Individual Quote Card (assigned)
function QuoteCard({
  quote,
  index,
  onRemove,
  themeColors,
}: {
  quote: ExtractedQuote;
  index: number;
  onRemove: () => void;
  themeColors: Record<string, string>;
}) {
  return (
    <div className="group relative bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-4 hover:border-purple-300 transition-all">
      <div className="flex gap-4">
        {/* Photo or placeholder */}
        <div className="flex-shrink-0">
          {quote.photo_url ? (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden">
              <Image
                src={quote.photo_url}
                alt={quote.attribution || 'Quote author'}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-lg bg-purple-100 flex items-center justify-center">
              <MessageSquareQuote className="w-8 h-8 text-purple-400" />
            </div>
          )}
        </div>

        {/* Quote content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-gray-900 font-medium line-clamp-2">
              &ldquo;{quote.quote_text}&rdquo;
            </p>
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
              {index}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {quote.attribution && (
              <span className="text-sm font-medium text-gray-700">
                — {quote.attribution}
              </span>
            )}
            {quote.theme && (
              <span
                className={`px-2 py-0.5 text-xs rounded-full border ${
                  themeColors[quote.theme] || 'bg-gray-100 text-gray-600'
                }`}
              >
                {quote.theme}
              </span>
            )}
          </div>

          {quote.context && (
            <p className="mt-2 text-xs text-gray-500 line-clamp-1 italic">
              {quote.context}
            </p>
          )}
        </div>

        {/* Remove button */}
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 hover:bg-red-200 transition-all"
          title="Remove from report"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Available Quote Card (gallery)
function AvailableQuoteCard({
  quote,
  onAdd,
  disabled,
  themeColors,
}: {
  quote: ExtractedQuote;
  onAdd: () => void;
  disabled: boolean;
  themeColors: Record<string, string>;
}) {
  return (
    <div className="group flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all">
      {/* Photo */}
      {quote.photo_url ? (
        <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={quote.photo_url}
            alt={quote.attribution || 'Quote author'}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          <MessageSquareQuote className="w-6 h-6 text-gray-400" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 line-clamp-2">
          &ldquo;{quote.quote_text}&rdquo;
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {quote.attribution && (
            <span className="text-xs font-medium text-gray-600">
              — {quote.attribution}
            </span>
          )}
          {quote.theme && (
            <span
              className={`px-1.5 py-0.5 text-xs rounded border ${
                themeColors[quote.theme] || 'bg-gray-100 text-gray-600'
              }`}
            >
              {quote.theme}
            </span>
          )}
        </div>
      </div>

      {/* Add button */}
      <button
        onClick={onAdd}
        disabled={disabled}
        className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
          disabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
        }`}
        title={disabled ? 'Max quotes reached' : 'Add to report'}
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}

// Add Manual Quote Modal
function AddQuoteModal({
  onClose,
  onSave,
  themes,
}: {
  onClose: () => void;
  onSave: (quote: Partial<ExtractedQuote>) => void;
  themes: string[];
}) {
  const [formData, setFormData] = useState({
    quote_text: '',
    attribution: '',
    context: '',
    theme: '',
    sentiment: 'positive',
    impact_area: '',
    photo_url: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.quote_text.trim()) return;

    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Add Quote</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quote Text *
            </label>
            <textarea
              value={formData.quote_text}
              onChange={(e) =>
                setFormData({ ...formData, quote_text: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter the quote..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attribution
              </label>
              <input
                type="text"
                value={formData.attribution}
                onChange={(e) =>
                  setFormData({ ...formData, attribution: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Who said it?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Theme
              </label>
              <select
                value={formData.theme}
                onChange={(e) =>
                  setFormData({ ...formData, theme: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select theme...</option>
                {themes.map((theme) => (
                  <option key={theme} value={theme}>
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Context
            </label>
            <input
              type="text"
              value={formData.context}
              onChange={(e) =>
                setFormData({ ...formData, context: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="When or where was this said?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sentiment
              </label>
              <select
                value={formData.sentiment}
                onChange={(e) =>
                  setFormData({ ...formData, sentiment: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="positive">Positive</option>
                <option value="inspiring">Inspiring</option>
                <option value="reflective">Reflective</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Impact Area
              </label>
              <select
                value={formData.impact_area}
                onChange={(e) =>
                  setFormData({ ...formData, impact_area: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select area...</option>
                <option value="employment">Employment</option>
                <option value="youth">Youth</option>
                <option value="health">Health</option>
                <option value="culture">Culture</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="community">Community</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.photo_url}
                onChange={(e) =>
                  setFormData({ ...formData, photo_url: e.target.value })
                }
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://..."
              />
              <button
                type="button"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Upload photo (coming soon)"
              >
                <Upload className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {formData.photo_url && (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={formData.photo_url}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formData.quote_text.trim()}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Quote
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
