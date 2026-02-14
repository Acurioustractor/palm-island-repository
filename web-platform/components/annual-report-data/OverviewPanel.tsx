'use client';

import { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Heart,
  Shield,
  Users,
  Lightbulb,
  Leaf,
  Building,
  BookOpen,
  Star,
  TrendingUp,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

interface Theme {
  title: string;
  icon: string;
  summary: string;
  key_stats: string[];
  related_sections: string[];
}

interface Overview {
  executive_summary: string;
  themes: Theme[];
  strengths: string[];
  opportunities: string[];
}

interface OverviewPanelProps {
  reportId: string | null;
  fyLabel: string;
  onNavigateTab?: (tab: string) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  heart: <Heart className="w-5 h-5" />,
  shield: <Shield className="w-5 h-5" />,
  users: <Users className="w-5 h-5" />,
  lightbulb: <Lightbulb className="w-5 h-5" />,
  leaf: <Leaf className="w-5 h-5" />,
  building: <Building className="w-5 h-5" />,
  book: <BookOpen className="w-5 h-5" />,
  star: <Star className="w-5 h-5" />,
};

const THEME_COLORS = [
  { bg: 'bg-warm-50', border: 'border-warm-200', icon: 'text-picc-ochre', badge: 'bg-warm-100 text-picc-ochre' },
  { bg: 'bg-sage-50', border: 'border-sage-200', icon: 'text-sage-600', badge: 'bg-sage-100 text-sage-700' },
  { bg: 'bg-warm-50', border: 'border-warm-200', icon: 'text-picc-red', badge: 'bg-warm-100 text-picc-red' },
  { bg: 'bg-picc-ochre-50', border: 'border-picc-ochre-200', icon: 'text-picc-ochre', badge: 'bg-picc-ochre-100 text-picc-ochre' },
  { bg: 'bg-warm-50', border: 'border-picc-red-200', icon: 'text-picc-red', badge: 'bg-warm-100 text-picc-red' },
  { bg: 'bg-warm-50', border: 'border-warm-200', icon: 'text-picc-ochre', badge: 'bg-warm-100 text-picc-ochre' },
];

export default function OverviewPanel({ reportId, fyLabel, onNavigateTab }: OverviewPanelProps) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/annual-report-data/overview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fy_label: fyLabel, report_id: reportId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Generation failed');
      }
      const data = await res.json();
      setOverview(data.overview);
      setGeneratedAt(data.generated_at);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!overview && !loading && !error) {
    return (
      <div className="max-w-4xl">
        <div className="bg-gradient-to-br from-warm-50 to-warm-100 rounded-2xl border border-warm-200 p-12 text-center">
          <Sparkles className="w-12 h-12 text-picc-ochre-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            AI-Generated Thematic Overview
          </h2>
          <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
            Generate a comprehensive summary of all annual report data, organised into
            themes like Health &amp; Wellbeing, Cultural Strength, Innovation, and more.
          </p>
          <button
            onClick={generate}
            className="inline-flex items-center gap-2 px-6 py-3 bg-picc-ochre text-white font-medium rounded-xl hover:bg-picc-ochre-600 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Generate Overview
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl">
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-picc-ochre mx-auto mb-4" />
          <p className="text-sm text-gray-600">Analysing report data and generating thematic overview...</p>
          <p className="text-xs text-gray-400 mt-1">This may take 10-15 seconds</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-red-800">Generation failed</div>
            <div className="text-sm text-red-700 mt-1">{error}</div>
          </div>
        </div>
        <button
          onClick={generate}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-picc-ochre border border-warm-200 rounded-lg hover:bg-warm-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (!overview) return null;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header with regenerate */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-picc-ochre" />
            Thematic Overview — FY {fyLabel}
          </h2>
          {generatedAt && (
            <p className="text-xs text-gray-400 mt-0.5">
              Generated {new Date(generatedAt).toLocaleString()}
            </p>
          )}
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-picc-ochre border border-warm-200 rounded-lg hover:bg-warm-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Regenerate
        </button>
      </div>

      {/* Executive Summary */}
      <div className="bg-gradient-to-br from-picc-ochre to-picc-earth rounded-2xl p-6 text-white">
        <h3 className="text-sm font-medium text-warm-200 uppercase tracking-wider mb-2">
          Executive Summary
        </h3>
        <p className="text-base leading-relaxed">
          {overview.executive_summary}
        </p>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {overview.themes.map((theme, idx) => {
          const colors = THEME_COLORS[idx % THEME_COLORS.length];
          return (
            <div key={idx} className={`${colors.bg} rounded-xl border ${colors.border} p-5`}>
              <div className="flex items-start gap-3 mb-3">
                <div className={`${colors.icon} mt-0.5`}>
                  {ICON_MAP[theme.icon] || <Star className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{theme.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{theme.summary}</p>
                </div>
              </div>

              {theme.key_stats.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {theme.key_stats.map((stat, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <TrendingUp className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      {stat}
                    </div>
                  ))}
                </div>
              )}

              {theme.related_sections.length > 0 && onNavigateTab && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-200/50">
                  {theme.related_sections.map(section => (
                    <button
                      key={section}
                      onClick={() => onNavigateTab(section)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${colors.badge} hover:opacity-80 transition-opacity`}
                    >
                      {section}
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Strengths & Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-sage-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Key Strengths
          </h3>
          <ul className="space-y-2">
            {overview.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-400 flex-shrink-0 mt-1.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-picc-red uppercase tracking-wider mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Opportunities
          </h3>
          <ul className="space-y-2">
            {overview.opportunities.map((o, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-picc-red-300 flex-shrink-0 mt-1.5" />
                {o}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
