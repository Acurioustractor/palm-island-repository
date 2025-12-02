'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Quote as QuoteIcon, Search, Filter, Star, CheckCircle,
  User, Loader2, Plus, X, ChevronDown, Sparkles, FileText, Save
} from 'lucide-react';
import { StorytellerQuoteCard } from '@/components/storyteller/StorytellerQuoteCard';

interface AnnualReport {
  id: string;
  title: string;
  report_year: number;
  status: string;
}

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
  used_in_report_id?: string;
  display_order?: number;
  profile_id?: string;
  profile?: {
    id: string;
    full_name: string;
    preferred_name?: string;
    is_elder?: boolean;
    profile_image_url?: string;
  };
  created_at: string;
}

const themes = [
  'community', 'services', 'culture', 'history', 'achievement',
  'resilience', 'youth', 'elders', 'innovation', 'connection'
];

const impactAreas = [
  'community_wellbeing', 'cultural_preservation', 'youth_development',
  'employment', 'health', 'education', 'housing', 'environment'
];

export default function ReportQuotesPage() {
  const params = useParams();
  const reportId = params.id as string;

  const [report, setReport] = useState<AnnualReport | null>(null);
  const [allQuotes, setAllQuotes] = useState<ExtractedQuote[]>([]);
  const [selectedQuotes, setSelectedQuotes] = useState<ExtractedQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [themeFilter, setThemeFilter] = useState<string>('');
  const [impactAreaFilter, setImpactAreaFilter] = useState<string>('');
  const [showValidatedOnly, setShowValidatedOnly] = useState(false);
  const [showSuggestedOnly, setShowSuggestedOnly] = useState(false);

  const supabase = createClient();

  const loadData = useCallback(async () => {
    setLoading(true);

    // Load report
    const { data: reportData } = await supabase
      .from('annual_reports')
      .select('id, title, report_year, status')
      .eq('id', reportId)
      .single();

    if (reportData) {
      setReport(reportData);
    }

    // Load all validated/suggested quotes with profile info
    const { data: quotesData } = await (supabase as any)
      .from('extracted_quotes')
      .select(`
        *,
        profile:profile_id(id, full_name, preferred_name, is_elder, profile_image_url)
      `)
      .or('is_validated.eq.true,suggested_for_report.eq.true')
      .order('created_at', { ascending: false });

    if (quotesData) {
      setAllQuotes(quotesData);

      // Load quotes already in this report
      const reportQuotes = quotesData.filter((q: ExtractedQuote) => q.used_in_report_id === reportId);
      setSelectedQuotes(reportQuotes.sort((a: ExtractedQuote, b: ExtractedQuote) =>
        (a.display_order || 0) - (b.display_order || 0)
      ));
    }

    setLoading(false);
  }, [reportId, supabase]);

  useEffect(() => {
    if (reportId) {
      loadData();
    }
  }, [reportId, loadData]);

  const filteredQuotes = allQuotes.filter(quote => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesText = quote.quote_text.toLowerCase().includes(query);
      const matchesName = quote.profile?.full_name?.toLowerCase().includes(query) ||
                         quote.profile?.preferred_name?.toLowerCase().includes(query) ||
                         quote.attribution?.toLowerCase().includes(query);
      if (!matchesText && !matchesName) return false;
    }

    if (themeFilter && quote.theme !== themeFilter) return false;
    if (impactAreaFilter && quote.impact_area !== impactAreaFilter) return false;
    if (showValidatedOnly && !quote.is_validated) return false;
    if (showSuggestedOnly && !quote.suggested_for_report) return false;

    return true;
  });

  const addQuoteToReport = (quote: ExtractedQuote) => {
    if (!selectedQuotes.find(q => q.id === quote.id)) {
      setSelectedQuotes([...selectedQuotes, { ...quote, display_order: selectedQuotes.length }]);
    }
  };

  const removeQuoteFromReport = (quoteId: string) => {
    setSelectedQuotes(selectedQuotes.filter(q => q.id !== quoteId));
  };

  const moveQuote = (index: number, direction: 'up' | 'down') => {
    const newQuotes = [...selectedQuotes];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newQuotes.length) return;

    [newQuotes[index], newQuotes[newIndex]] = [newQuotes[newIndex], newQuotes[index]];
    setSelectedQuotes(newQuotes.map((q, i) => ({ ...q, display_order: i })));
  };

  const saveQuotesToReport = async () => {
    setSaving(true);

    try {
      // First, clear any quotes previously assigned to this report
      await (supabase as any)
        .from('extracted_quotes')
        .update({ used_in_report_id: null, display_order: null })
        .eq('used_in_report_id', reportId);

      // Then, assign selected quotes
      for (let i = 0; i < selectedQuotes.length; i++) {
        await (supabase as any)
          .from('extracted_quotes')
          .update({
            used_in_report_id: reportId,
            display_order: i
          })
          .eq('id', selectedQuotes[i].id);
      }

      alert(`Saved ${selectedQuotes.length} quotes to the report!`);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save quotes');
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        <p className="text-gray-500 mt-2">Loading quotes...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Report not found</p>
        <Link href="/picc/annual-reports" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/picc/annual-reports`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Annual Reports
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Select Quotes for Report</h1>
            <p className="text-gray-600 mt-1">{report.title} ({report.report_year})</p>
          </div>
          <button
            onClick={saveQuotesToReport}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 font-medium flex items-center gap-2 disabled:opacity-50 shadow-lg"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Selection ({selectedQuotes.length})
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Quote Browser - Left side */}
        <div className="lg:col-span-3">
          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
            <div className="flex flex-wrap gap-3">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search quotes or storytellers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Theme Filter */}
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

              {/* Impact Area Filter */}
              <select
                value={impactAreaFilter}
                onChange={(e) => setImpactAreaFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
              >
                <option value="">All Impact Areas</option>
                {impactAreas.map(area => (
                  <option key={area} value={area}>{area.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            {/* Toggle Filters */}
            <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showValidatedOnly}
                  onChange={(e) => setShowValidatedOnly(e.target.checked)}
                  className="rounded text-amber-600"
                />
                <span className="text-sm text-gray-600">Validated only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSuggestedOnly}
                  onChange={(e) => setShowSuggestedOnly(e.target.checked)}
                  className="rounded text-amber-600"
                />
                <span className="text-sm text-gray-600">Report-suggested only</span>
              </label>
            </div>
          </div>

          {/* Quote List */}
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{filteredQuotes.length} quotes available</p>

            {filteredQuotes.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <QuoteIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No quotes match your filters</p>
              </div>
            ) : (
              filteredQuotes.map(quote => {
                const isSelected = selectedQuotes.some(q => q.id === quote.id);

                return (
                  <div
                    key={quote.id}
                    className={`bg-white border rounded-xl p-5 transition-all ${
                      isSelected
                        ? 'border-amber-300 bg-amber-50 ring-2 ring-amber-200'
                        : 'border-gray-200 hover:border-amber-200'
                    }`}
                  >
                    {/* Storyteller Info */}
                    {quote.profile && (
                      <div className="flex items-center gap-3 mb-3">
                        {quote.profile.profile_image_url ? (
                          <img
                            src={quote.profile.profile_image_url}
                            alt={quote.profile.preferred_name || quote.profile.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                            {(quote.profile.preferred_name || quote.profile.full_name).charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {quote.profile.preferred_name || quote.profile.full_name}
                            </span>
                            {quote.profile.is_elder && (
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                                Elder
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{quote.attribution}</span>
                        </div>
                      </div>
                    )}

                    {/* Quote */}
                    <blockquote className="text-gray-700 italic mb-3">
                      "{quote.quote_text}"
                    </blockquote>

                    {/* Tags & Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        {quote.theme && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                            {quote.theme}
                          </span>
                        )}
                        {quote.impact_area && (
                          <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded-full">
                            {quote.impact_area.replace(/_/g, ' ')}
                          </span>
                        )}
                        {quote.is_validated && (
                          <span className="flex items-center gap-1 text-green-600 text-xs">
                            <CheckCircle className="w-3 h-3" />
                            Validated
                          </span>
                        )}
                        {quote.suggested_for_report && (
                          <span className="flex items-center gap-1 text-amber-600 text-xs">
                            <Star className="w-3 h-3" />
                            Suggested
                          </span>
                        )}
                      </div>

                      {isSelected ? (
                        <button
                          onClick={() => removeQuoteFromReport(quote.id)}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          Remove
                        </button>
                      ) : (
                        <button
                          onClick={() => addQuoteToReport(quote)}
                          className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm hover:bg-amber-200 flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add to Report
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Quotes - Right side */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Report Quotes
              </h2>
              <span className="px-3 py-1 bg-amber-200 text-amber-800 rounded-full text-sm font-medium">
                {selectedQuotes.length} selected
              </span>
            </div>

            {selectedQuotes.length === 0 ? (
              <div className="text-center py-8">
                <QuoteIcon className="w-10 h-10 mx-auto text-amber-300 mb-3" />
                <p className="text-amber-700 text-sm">
                  Click "Add to Report" to select quotes
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {selectedQuotes.map((quote, index) => (
                  <div
                    key={quote.id}
                    className="bg-white border border-amber-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 italic line-clamp-3">
                          "{quote.quote_text}"
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          — {quote.attribution || quote.profile?.preferred_name || quote.profile?.full_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-amber-100">
                      <div className="flex gap-1">
                        <button
                          onClick={() => moveQuote(index, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-amber-100 rounded disabled:opacity-30"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveQuote(index, 'down')}
                          disabled={index === selectedQuotes.length - 1}
                          className="p-1 hover:bg-amber-100 rounded disabled:opacity-30"
                          title="Move down"
                        >
                          ↓
                        </button>
                      </div>
                      <button
                        onClick={() => removeQuoteFromReport(quote.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Save Button */}
            {selectedQuotes.length > 0 && (
              <button
                onClick={saveQuotesToReport}
                disabled={saving}
                className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save to Report
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
