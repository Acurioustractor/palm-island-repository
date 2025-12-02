'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, PieChart, Lightbulb, RefreshCw, Loader2,
  MessageSquareQuote, BookOpen, Sparkles, TrendingUp,
  Users, Heart, Briefcase, GraduationCap, Building2, Leaf
} from 'lucide-react';

interface AnalysisResult {
  summary: {
    total_quotes: number;
    total_stories: number;
    themes_covered: string[];
    impact_areas: string[];
    sentiment_breakdown: Record<string, number>;
  };
  key_themes: {
    theme: string;
    count: number;
    representative_quote?: string;
    insight: string;
  }[];
  impact_analysis: {
    area: string;
    story_count: number;
    quote_count: number;
    highlights: string[];
  }[];
  ai_narrative: string;
  recommendations: string[];
  generated_at: string;
}

interface ReportAnalysisDashboardProps {
  reportId: string;
  onGenerateSection?: (type: string, content: string) => void;
}

const impactIcons: Record<string, React.ElementType> = {
  employment: Briefcase,
  youth: GraduationCap,
  health: Heart,
  culture: Sparkles,
  infrastructure: Building2,
  community: Users,
  environment: Leaf,
};

const themeColors: Record<string, { bg: string; text: string; border: string }> = {
  community: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  services: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  culture: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  history: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  achievement: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  youth: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
  employment: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  health: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
};

export function ReportAnalysisDashboard({
  reportId,
  onGenerateSection,
}: ReportAnalysisDashboardProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingType, setGeneratingType] = useState<string | null>(null);

  const loadAnalysis = useCallback(async (regenerate = false) => {
    try {
      if (regenerate) {
        setRegenerating(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch(
        `/api/annual-reports/${reportId}/analyze${regenerate ? '?regenerate=true' : ''}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load analysis');
      }

      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  }, [reportId]);

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  const generateSection = async (type: string, params?: Record<string, string>) => {
    try {
      setGeneratingType(type);

      const response = await fetch(`/api/annual-reports/${reportId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis_type: type, ...params }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      onGenerateSection?.(type, data.result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGeneratingType(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Analyzing report content...</p>
        </div>
      </div>
    );
  }

  if (error && !analysis) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={() => loadAnalysis()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!analysis) return null;

  const totalContent = analysis.summary.total_quotes + analysis.summary.total_stories;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-xl">
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Content Analysis</h2>
            <p className="text-sm text-gray-500">
              Generated {new Date(analysis.generated_at).toLocaleDateString('en-AU')}
            </p>
          </div>
        </div>
        <button
          onClick={() => loadAnalysis(true)}
          disabled={regenerating}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
          Regenerate
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={MessageSquareQuote}
          label="Quotes"
          value={analysis.summary.total_quotes}
          color="purple"
        />
        <StatCard
          icon={BookOpen}
          label="Stories"
          value={analysis.summary.total_stories}
          color="blue"
        />
        <StatCard
          icon={PieChart}
          label="Themes"
          value={analysis.summary.themes_covered.length}
          color="amber"
        />
        <StatCard
          icon={TrendingUp}
          label="Impact Areas"
          value={analysis.summary.impact_areas.length}
          color="green"
        />
      </div>

      {/* AI Narrative */}
      {analysis.ai_narrative && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">AI-Generated Narrative</h3>
          </div>
          <div className="prose prose-purple max-w-none">
            {analysis.ai_narrative.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
          {onGenerateSection && (
            <button
              onClick={() => generateSection('executive_summary')}
              disabled={generatingType === 'executive_summary'}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {generatingType === 'executive_summary' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Generate Executive Summary
            </button>
          )}
        </div>
      )}

      {/* Theme Analysis */}
      {analysis.key_themes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-amber-600" />
              Theme Breakdown
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {analysis.key_themes.map((themeData) => {
                const colors = themeColors[themeData.theme] || {
                  bg: 'bg-gray-100',
                  text: 'text-gray-700',
                  border: 'border-gray-200',
                };
                const percentage = Math.round(
                  (themeData.count / analysis.summary.total_quotes) * 100
                );

                return (
                  <div key={themeData.theme} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text} border ${colors.border} capitalize`}
                        >
                          {themeData.theme}
                        </span>
                        <span className="text-sm text-gray-500">
                          {themeData.count} quote{themeData.count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {percentage}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colors.bg.replace('100', '500')}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {/* Representative quote */}
                    {themeData.representative_quote && (
                      <div className="mt-2 pl-4 border-l-2 border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-sm text-gray-600 italic line-clamp-2">
                          &ldquo;{themeData.representative_quote}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sentiment Breakdown */}
      {Object.keys(analysis.summary.sentiment_breakdown).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Sentiment Analysis</h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(analysis.summary.sentiment_breakdown).map(
              ([sentiment, count]) => (
                <div
                  key={sentiment}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg"
                >
                  <span className="text-2xl">
                    {sentiment === 'positive'
                      ? '✨'
                      : sentiment === 'inspiring'
                      ? '🌟'
                      : sentiment === 'reflective'
                      ? '💭'
                      : '📝'}
                  </span>
                  <div>
                    <div className="font-medium text-gray-900 capitalize">
                      {sentiment}
                    </div>
                    <div className="text-sm text-gray-500">
                      {count} quote{count !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Impact Analysis */}
      {analysis.impact_analysis.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Impact Areas
            </h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysis.impact_analysis.map((impact) => {
                const Icon = impactIcons[impact.area] || TrendingUp;
                const hasContent =
                  impact.story_count > 0 || impact.quote_count > 0;

                return (
                  <div
                    key={impact.area}
                    className={`p-4 rounded-xl border transition-all ${
                      hasContent
                        ? 'border-green-200 bg-green-50 hover:border-green-300'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`p-2 rounded-lg ${
                          hasContent ? 'bg-green-100' : 'bg-gray-100'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            hasContent ? 'text-green-600' : 'text-gray-400'
                          }`}
                        />
                      </div>
                      <div className="font-medium text-gray-900 capitalize">
                        {impact.area}
                      </div>
                    </div>

                    <div className="flex gap-4 text-sm mb-3">
                      <div>
                        <span className="font-semibold text-gray-900">
                          {impact.story_count}
                        </span>
                        <span className="text-gray-500 ml-1">stories</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">
                          {impact.quote_count}
                        </span>
                        <span className="text-gray-500 ml-1">quotes</span>
                      </div>
                    </div>

                    {impact.highlights.length > 0 && (
                      <div className="border-t border-green-200 pt-3 mt-3">
                        <p className="text-xs text-gray-600 italic line-clamp-2">
                          &ldquo;{impact.highlights[0]}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-gray-900">AI Recommendations</h3>
          </div>
          <ul className="space-y-3">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-200 text-amber-800 text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <p className="text-gray-700">{rec}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No Content Message */}
      {totalContent === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <MessageSquareQuote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Content to Analyze
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Add quotes and stories to this report to generate insights and analysis.
          </p>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: 'purple' | 'blue' | 'amber' | 'green';
}) {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    green: 'bg-green-100 text-green-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-600">{label}</div>
        </div>
      </div>
    </div>
  );
}
