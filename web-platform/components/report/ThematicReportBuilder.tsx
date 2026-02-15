'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BespokeIcon } from '@/components/ui/BespokeIcon';
import { Loader2, Download, BookOpen, Users, Quote, Image } from 'lucide-react';

const THEMES = [
  { value: 'health', label: 'Health & Wellbeing', emoji: '🏥' },
  { value: 'culture', label: 'Culture & Heritage', emoji: '🎨' },
  { value: 'youth', label: 'Youth Programs', emoji: '🌱' },
  { value: 'education', label: 'Education & Training', emoji: '📚' },
  { value: 'family', label: 'Family Services', emoji: '👨‍👩‍👧‍👦' },
  { value: 'economic', label: 'Economic Development', emoji: '💼' },
  { value: 'sport', label: 'Sport & Recreation', emoji: '⚽' },
  { value: 'housing', label: 'Housing', emoji: '🏠' },
  { value: 'community', label: 'Community Programs', emoji: '🤝' },
  { value: 'innovation', label: 'Innovation', emoji: '💡' },
  { value: 'elders', label: 'Elders', emoji: '🌿' },
  { value: 'language', label: 'Language & Identity', emoji: '🗣️' },
];

interface ThematicReport {
  theme: string;
  fiscalYear: number;
  generatedAt: string;
  summary: {
    storyCount: number;
    serviceCount: number;
    quoteCount: number;
    mediaCount: number;
  };
  stories: Array<{
    id: string;
    title: string;
    excerpt?: string;
    category?: string;
    date: string;
    url: string;
  }>;
  services: Array<{
    id: string;
    name: string;
    description?: string;
    category?: string;
    metrics?: {
      clientsServed?: number;
      sessionsDelivered?: number;
      staffCount?: number;
      eventsHeld?: number;
      keyAchievement?: string;
      headlineStat?: string;
      headlineLabel?: string;
    } | null;
  }>;
  communityVoices: Array<{
    id: string;
    text: string;
    speaker: string;
    role?: string | null;
    theme?: string;
    source: 'elder' | 'extracted';
  }>;
  media: Array<{
    id: string;
    url: string;
    title?: string;
  }>;
}

interface ThematicReportBuilderProps {
  className?: string;
}

export default function ThematicReportBuilder({ className = '' }: ThematicReportBuilderProps) {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [fiscalYear, setFiscalYear] = useState(2025);
  const [report, setReport] = useState<ThematicReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    if (!selectedTheme) return;
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch('/api/reports/thematic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: selectedTheme, fiscalYear }),
      });

      if (!res.ok) throw new Error('Failed to generate report');
      const data = await res.json();
      setReport(data);
    } catch (err) {
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `picc-thematic-report-${report.theme}-fy${report.fiscalYear}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={className}>
      {/* Theme Selection */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-picc-earth mb-4">1. Choose a Theme</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {THEMES.map(theme => (
            <button
              key={theme.value}
              onClick={() => setSelectedTheme(theme.value)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-left transition-all ${
                selectedTheme === theme.value
                  ? 'bg-picc-ochre text-white border-picc-ochre shadow-md'
                  : 'bg-white/60 text-picc-earth border-warm-200 hover:border-picc-ochre hover:shadow-sm'
              }`}
            >
              <span className="text-xl">{theme.emoji}</span>
              <span className="text-sm font-medium">{theme.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fiscal Year */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-picc-earth mb-4">2. Fiscal Year</h2>
        <div className="flex gap-2">
          {[2023, 2024, 2025].map(yr => (
            <button
              key={yr}
              onClick={() => setFiscalYear(yr)}
              className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                fiscalYear === yr
                  ? 'bg-picc-ochre text-white border-picc-ochre'
                  : 'bg-white/60 text-picc-earth-300 border-warm-200 hover:border-picc-ochre'
              }`}
            >
              FY {yr - 1}-{String(yr).slice(2)}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="mb-8">
        <button
          onClick={generateReport}
          disabled={!selectedTheme || loading}
          className="px-6 py-3 bg-gradient-to-r from-picc-ochre to-picc-red text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating report...
            </>
          ) : (
            <>
              <BespokeIcon name="story" size={20} />
              Generate Thematic Report
            </>
          )}
        </button>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>

      {/* Report Preview */}
      {report && (
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-picc-earth to-picc-earth-700 text-white rounded-2xl p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/60 uppercase tracking-wider mb-1">Thematic Report</p>
                <h1 className="text-3xl font-bold font-serif capitalize mb-2">
                  {THEMES.find(t => t.value === report.theme)?.label || report.theme}
                </h1>
                <p className="text-white/70">
                  FY {report.fiscalYear - 1}-{String(report.fiscalYear).slice(2)} &middot; Generated {new Date(report.generatedAt).toLocaleDateString('en-AU')}
                </p>
              </div>
              <button
                onClick={exportJSON}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm"
              >
                <Download className="w-4 h-4" />
                Export JSON
              </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
              <div className="text-center">
                <p className="text-2xl font-bold">{report.summary.storyCount}</p>
                <p className="text-sm text-white/70">Stories</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{report.summary.serviceCount}</p>
                <p className="text-sm text-white/70">Services</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{report.summary.quoteCount}</p>
                <p className="text-sm text-white/70">Quotes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{report.summary.mediaCount}</p>
                <p className="text-sm text-white/70">Photos</p>
              </div>
            </div>
          </div>

          {/* Key Stories */}
          {report.stories.length > 0 && (
            <div className="bg-white/80 border border-warm-200 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-picc-earth flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-picc-ochre" />
                Key Stories ({report.stories.length})
              </h2>
              <div className="space-y-3">
                {report.stories.slice(0, 8).map(story => (
                  <Link
                    key={story.id}
                    href={story.url}
                    className="block p-4 border border-warm-200 rounded-xl hover:border-picc-ochre hover:bg-warm-50 transition-all"
                  >
                    <h3 className="font-semibold text-picc-earth">{story.title}</h3>
                    {story.excerpt && (
                      <p className="text-sm text-picc-earth-300 mt-1 line-clamp-2">{story.excerpt}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-picc-earth-200">
                      {story.category && <span className="capitalize">{story.category}</span>}
                      <span>{new Date(story.date).toLocaleDateString('en-AU')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Service Data */}
          {report.services.length > 0 && (
            <div className="bg-white/80 border border-warm-200 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-picc-earth flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-picc-ochre" />
                Service Data ({report.services.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.services.map(svc => (
                  <div key={svc.id} className="border border-warm-200 rounded-xl p-4">
                    <h3 className="font-semibold text-picc-earth mb-1">{svc.name}</h3>
                    {svc.description && (
                      <p className="text-sm text-picc-earth-300 mb-3 line-clamp-2">{svc.description}</p>
                    )}
                    {svc.metrics && (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {svc.metrics.headlineStat && (
                          <div className="col-span-2 bg-picc-ochre-50 rounded-lg p-2">
                            <span className="font-bold text-picc-ochre">{svc.metrics.headlineStat}</span>
                            {svc.metrics.headlineLabel && (
                              <span className="text-picc-earth-300 ml-1">{svc.metrics.headlineLabel}</span>
                            )}
                          </div>
                        )}
                        {svc.metrics.clientsServed != null && (
                          <div>
                            <span className="font-bold text-picc-earth">{svc.metrics.clientsServed.toLocaleString()}</span>
                            <span className="text-picc-earth-300 ml-1 text-xs">clients</span>
                          </div>
                        )}
                        {svc.metrics.staffCount != null && (
                          <div>
                            <span className="font-bold text-picc-earth">{svc.metrics.staffCount}</span>
                            <span className="text-picc-earth-300 ml-1 text-xs">staff</span>
                          </div>
                        )}
                        {svc.metrics.keyAchievement && (
                          <div className="col-span-2 text-xs text-sage-700 bg-sage-50 rounded p-2">
                            {svc.metrics.keyAchievement}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Community Voices */}
          {report.communityVoices.length > 0 && (
            <div className="bg-white/80 border border-warm-200 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-picc-earth flex items-center gap-2 mb-4">
                <Quote className="w-5 h-5 text-picc-ochre" />
                Community Voices ({report.communityVoices.length})
              </h2>
              <div className="columns-1 sm:columns-2 gap-4 space-y-4">
                {report.communityVoices.slice(0, 10).map(voice => (
                  <div key={voice.id} className="break-inside-avoid bg-warm-50 rounded-xl p-4 border border-warm-200">
                    <BespokeIcon name="quote" size={16} className="text-picc-ochre opacity-40 mb-2" />
                    <p className="text-picc-earth italic font-serif">
                      &ldquo;{voice.text}&rdquo;
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm font-medium text-picc-earth">{voice.speaker}</span>
                      {voice.role && (
                        <span className="text-xs text-picc-earth-300">&middot; {voice.role}</span>
                      )}
                      {voice.source === 'elder' && (
                        <span className="px-1.5 py-0.5 bg-picc-ochre-100 text-picc-ochre-700 text-xs rounded">Elder</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Media Gallery */}
          {report.media.length > 0 && (
            <div className="bg-white/80 border border-warm-200 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-picc-earth flex items-center gap-2 mb-4">
                <Image className="w-5 h-5 text-picc-ochre" />
                Media Gallery ({report.media.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {report.media.map(m => (
                  <div key={m.id} className="aspect-square rounded-xl overflow-hidden bg-warm-100">
                    <img
                      src={m.url}
                      alt={m.title || ''}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state if nothing found */}
          {report.summary.storyCount === 0 &&
           report.summary.serviceCount === 0 &&
           report.summary.quoteCount === 0 && (
            <div className="text-center py-12 text-picc-earth-300">
              <BespokeIcon name="search" size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">No content found for this theme and fiscal year.</p>
              <p className="text-sm mt-2">Try a different theme or fiscal year combination.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
