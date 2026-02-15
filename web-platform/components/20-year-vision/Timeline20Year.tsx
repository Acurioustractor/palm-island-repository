/**
 * PICC 20-Year Vision Timeline Component
 * 
 * Visualizes 18 years of history (2009-2026) with countdown to 20-year milestone (2029)
 * 
 * Data Sources:
 * - knowledge_entries (annual reports)
 * - annual_report_timeline (SQL view)
 * - progress_to_20_years (SQL view)
 * - innovation_highlights (SQL view)
 */

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Types
interface TimelineEra {
  name: string;
  years: string;
  color: string;
  description: string;
  reports: AnnualReport[];
}

interface AnnualReport {
  fiscal_year: string;
  title: string;
  summary: string;
  era: string;
  era_color: string;
}

interface ProgressMetrics {
  years_elapsed: number;
  years_remaining: number;
  percent_complete: number;
  current_staff: number;
  target_staff: number;
  staff_progress_pct: number;
  current_services: number;
  target_services: number;
  services_progress_pct: number;
  current_stories: number;
  target_stories: number;
  stories_progress_pct: number;
  current_indigenous_pct: number;
}

interface InnovationHighlight {
  category: string;
  period: string;
  metric_value: number;
  metric_label: string;
  unit: string;
  color: string;
}

// Main Component
export default function Timeline20Year() {
  const [eras, setEras] = useState<TimelineEra[]>([]);
  const [progress, setProgress] = useState<ProgressMetrics | null>(null);
  const [highlights, setHighlights] = useState<InnovationHighlight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch timeline data
    const { data: timelineData } = await supabase
      .from('annual_report_timeline')
      .select('*')
      .order('fiscal_year');

    // Fetch progress metrics
    const { data: progressData } = await supabase
      .from('progress_to_20_years')
      .select('*')
      .single();

    // Fetch innovation highlights
    const { data: highlightsData } = await supabase
      .from('innovation_highlights')
      .select('*')
      .order('period');

    // Group reports by era
    const groupedEras = groupByEra(timelineData || []);
    setEras(groupedEras);
    setProgress(progressData);
    setHighlights(highlightsData || []);
    setLoading(false);
  }

  function groupByEra(reports: AnnualReport[]): TimelineEra[] {
    const eraMap: Record<string, TimelineEra> = {
      'Foundation': {
        name: 'Foundation Era',
        years: '2009-2012',
        color: '#F59E0B',
        description: 'Establishing community control and first services',
        reports: []
      },
      'Growth': {
        name: 'Growth Era',
        years: '2013-2018',
        color: '#8B5CF6',
        description: 'Expanding services, governance, and infrastructure',
        reports: []
      },
      'Transition': {
        name: 'Transition Era',
        years: '2019-2020',
        color: '#10B981',
        description: 'Planning and achieving full community control',
        reports: []
      },
      'Community-Led': {
        name: 'Community-Led Era',
        years: '2021-2029',
        color: '#3B82F6',
        description: 'Self-determination, innovation, and sustainable growth',
        reports: []
      }
    };

    reports.forEach(report => {
      if (eraMap[report.era]) {
        eraMap[report.era].reports.push(report);
      }
    });

    return Object.values(eraMap);
  }

  if (loading) return <div className="p-8 text-center">Loading 20-year journey...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <header className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">
          PICC: 18 Years of Community-Led Impact
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          From foundation to innovation — our journey toward 20 years
        </p>
        
        {/* Countdown Widget */}
        {progress && <CountdownWidget progress={progress} />}
      </header>

      {/* Timeline */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Our Journey</h2>
        <div className="space-y-8">
          {eras.map((era, index) => (
            <EraSection key={era.name} era={era} index={index} />
          ))}
        </div>
      </section>

      {/* Innovation Metrics */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Innovation Highlights</h2>
        <InnovationGrid highlights={highlights} />
      </section>

      {/* Goals for 2029 */}
      {progress && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Vision 2029</h2>
          <Goals2029 progress={progress} />
        </section>
      )}
    </div>
  );
}

// Sub-components

function CountdownWidget({ progress }: { progress: ProgressMetrics }) {
  return (
    <div className="bg-gradient-to-r from-picc-earth to-picc-red text-white rounded-2xl p-8 max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <div className="text-5xl font-bold mb-2">
          {progress.years_elapsed}/20
        </div>
        <div className="text-lg opacity-90">
          Years of Community-Led Excellence
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white/20 rounded-full h-4 mb-4">
        <div 
          className="bg-white rounded-full h-4 transition-all duration-1000"
          style={{ width: `${progress.percent_complete}%` }}
        />
      </div>

      <div className="flex justify-between text-sm opacity-90">
        <span>2009: Founded</span>
        <span>{progress.percent_complete}% Complete</span>
        <span>2029: 20 Years</span>
      </div>

      <div className="mt-6 text-center">
        <span className="inline-block bg-white/20 rounded-full px-4 py-2">
          {progress.years_remaining} years, {Math.floor((progress.years_remaining % 1) * 12)} months to go
        </span>
      </div>
    </div>
  );
}

function EraSection({ era, index }: { era: TimelineEra; index: number }) {
  const isEven = index % 2 === 0;

  return (
    <div className="relative">
      {/* Era Header */}
      <div 
        className="flex items-center gap-4 mb-4"
        style={{ flexDirection: isEven ? 'row' : 'row-reverse' }}
      >
        <div 
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: era.color }}
        />
        <div 
          className="px-4 py-2 rounded-lg text-white font-bold"
          style={{ backgroundColor: era.color }}
        >
          {era.name}
        </div>
        <span className="text-gray-500">{era.years}</span>
      </div>

      {/* Era Description */}
      <p className="text-gray-600 mb-4 ml-8">{era.description}</p>

      {/* Annual Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ml-8">
        {era.reports.map(report => (
          <div 
            key={report.fiscal_year}
            className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <div className="text-sm font-bold text-gray-500 mb-1">
              {report.fiscal_year}
            </div>
            <h4 className="font-semibold mb-2 line-clamp-2">
              {report.title}
            </h4>
            <p className="text-sm text-gray-600 line-clamp-3">
              {report.summary || 'Annual report for ' + report.fiscal_year}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InnovationGrid({ highlights }: { highlights: InnovationHighlight[] }) {
  // Group by category
  const byCategory = highlights.reduce((acc, h) => {
    if (!acc[h.category]) acc[h.category] = [];
    acc[h.category].push(h);
    return acc;
  }, {} as Record<string, InnovationHighlight[]>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Object.entries(byCategory).map(([category, items]) => (
        <div key={category} className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4 capitalize">
            {category.replace('_', ' ')}
          </h3>
          <div className="space-y-3">
            {items.slice(-3).map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-gray-600">{item.period}</span>
                <span 
                  className="font-bold"
                  style={{ color: item.color }}
                >
                  {item.unit === 'percent' 
                    ? `${item.metric_value}%` 
                    : item.metric_value.toLocaleString()
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Goals2029({ progress }: { progress: ProgressMetrics }) {
  const goals = [
    { 
      label: 'Staff', 
      current: progress.current_staff, 
      target: progress.target_staff,
      progress: progress.staff_progress_pct,
      unit: 'people'
    },
    { 
      label: 'Services', 
      current: progress.current_services, 
      target: progress.target_services,
      progress: progress.services_progress_pct,
      unit: 'services'
    },
    { 
      label: 'Stories', 
      current: progress.current_stories, 
      target: progress.target_stories,
      progress: progress.stories_progress_pct,
      unit: 'stories'
    },
    { 
      label: 'Indigenous Employment', 
      current: progress.current_indigenous_pct, 
      target: 85,
      progress: (progress.current_indigenous_pct / 85) * 100,
      unit: 'percent'
    },
  ];

  return (
    <div className="bg-gray-50 rounded-2xl p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {goals.map(goal => (
          <div key={goal.label} className="text-center">
            <div className="text-3xl font-bold text-picc-red mb-1">
              {goal.current}
              <span className="text-lg text-gray-400"> / {goal.target}</span>
            </div>
            <div className="text-sm text-gray-600 mb-3">{goal.label}</div>
            
            {/* Mini progress bar */}
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-picc-red rounded-full h-2 transition-all"
                style={{ width: `${Math.min(goal.progress, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(goal.progress)}% to target
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600">
          These targets represent PICC's commitment to sustainable community-led growth 
          and self-determination by our 20-year anniversary.
        </p>
      </div>
    </div>
  );
}
