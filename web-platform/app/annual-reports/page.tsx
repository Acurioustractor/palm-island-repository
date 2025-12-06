'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, Download, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import TimelineCard from './components/TimelineCard';
import TimelineNavigation from './components/TimelineNavigation';
import YearExpanded from './components/YearExpanded';

interface TimelineYear {
  id: string;
  fiscalYear: string;
  slug: string;
  title: string;
  subtitle?: string;
  summary?: string;
  category?: string;
  era: string;
  color: string;
  theme: string;
  imageCount: number;
  heroImages: any[];
  pdfPath: string;
  pdfSize?: number;
  keywords: string[];
}

interface TimelineData {
  timeline: TimelineYear[];
  eras: Record<string, any>;
  stats: {
    totalReports: number;
    totalImages: number;
    yearsSpanned: string;
    eras: number;
  };
}

export default function AnnualReportsTimelinePage() {
  const [data, setData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedYear, setExpandedYear] = useState<string | null>(null);
  const [currentEra, setCurrentEra] = useState<string>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTimelineData();
  }, []);

  const loadTimelineData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/knowledge/annual-reports');

      if (!response.ok) {
        throw new Error(`Failed to load timeline: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.timeline) {
        throw new Error('Invalid response format');
      }

      setData(result);
    } catch (err) {
      console.error('Error loading timeline:', err);
      setError(err instanceof Error ? err.message : 'Failed to load timeline');
    } finally {
      setLoading(false);
    }
  };

  const scrollToYear = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 400;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const filteredTimeline = data?.timeline?.filter(year =>
    currentEra === 'all' || year.era === currentEra
  ) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading PICC's journey...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Timeline</h3>
          <p className="text-gray-600 mb-4">{error || 'No timeline data available'}</p>
          <button
            onClick={loadTimelineData}
            className="px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-900/20"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div
        className="relative bg-white border-b border-gray-100 py-16"
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Calendar className="w-16 h-16 text-gray-900 mx-auto mb-4" />
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            PICC Timeline
          </h1>
          <p className="text-xl text-gray-700 mb-2">
            15 Years of Community Leadership & Transformation
          </p>
          <p className="text-gray-600 italic">
            {data.stats.yearsSpanned} • {data.stats.totalReports} Annual Reports • {data.stats.totalImages} Images
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Home
              </Link>
              <div className="h-6 w-px bg-gray-200"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-7 h-7 text-gray-900" />
                  PICC Annual Reports Timeline
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {data.stats.yearsSpanned} • {data.stats.totalReports} Reports • {data.stats.totalImages} Images
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm text-gray-500">{data.stats.totalImages} Images Extracted</span>
            </div>
          </div>

          {/* Era Filter */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            <button
              onClick={() => setCurrentEra('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                currentEra === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-900'
              }`}
            >
              All Years ({data.timeline.length})
            </button>
            {Object.entries(data.eras).map(([key, era]: [string, any]) => (
              <button
                key={key}
                onClick={() => setCurrentEra(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  currentEra === key
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-900'
                }`}
              >
                {era.name} ({era.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="relative">
        {/* Navigation Arrows */}
        <button
          onClick={() => scrollToYear('left')}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 p-3 rounded-full shadow-lg border border-gray-200 transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-gray-900/10"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </button>
        <button
          onClick={() => scrollToYear('right')}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 p-3 rounded-full shadow-lg border border-gray-200 transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-gray-900/10"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 text-gray-900" />
        </button>

        {/* Horizontal Scroll */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scroll-smooth px-6 py-12 snap-x snap-mandatory overflow-scrolling-touch"
        >
          <div className="flex gap-6 pb-4 min-w-min">
            {filteredTimeline.map((year, index) => (
              <TimelineCard
                key={year.id}
                year={year}
                index={index}
                onExpand={() => setExpandedYear(year.fiscalYear)}
              />
            ))}

            {/* End Cap */}
            <div className="flex-shrink-0 w-96 h-[500px] flex items-center justify-center bg-white border-2 border-gray-200 rounded-2xl snap-start">
              <div className="text-center p-8">
                <Calendar className="w-16 h-16 text-gray-900 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {data.stats.totalReports} Years of Impact
                </h3>
                <p className="text-gray-600 mb-6">
                  {data.stats.totalImages} visual moments captured
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-900/20"
                >
                  Explore More
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mini Navigation */}
        <TimelineNavigation
          timeline={filteredTimeline}
          scrollContainerRef={scrollContainerRef}
        />
      </div>

      {/* Expanded Year Modal */}
      {expandedYear && (
        <YearExpanded
          fiscalYear={expandedYear}
          yearData={data.timeline.find(y => y.fiscalYear === expandedYear)}
          onClose={() => setExpandedYear(null)}
          onNavigate={(direction) => {
            const currentIndex = data.timeline.findIndex(y => y.fiscalYear === expandedYear);
            if (direction === 'next' && currentIndex < data.timeline.length - 1) {
              setExpandedYear(data.timeline[currentIndex + 1].fiscalYear);
            } else if (direction === 'prev' && currentIndex > 0) {
              setExpandedYear(data.timeline[currentIndex - 1].fiscalYear);
            }
          }}
        />
      )}

      {/* Bottom Info Banner */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 grid md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">About This Timeline</h4>
            <p className="text-sm text-gray-600">
              Visual journey through PICC's 15 years of service to Palm Island community, from establishment to community control.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Download Reports</h4>
            <p className="text-sm text-gray-600">
              Click "View Details" on any year card to download the full PDF annual report.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Explore Images</h4>
            <p className="text-sm text-gray-600">
              {data.stats.totalImages} images extracted from reports showing programs, people, facilities, and milestones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
