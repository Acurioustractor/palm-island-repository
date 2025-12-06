'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, Download, Image as ImageIcon, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
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
  const [expandedYear, setExpandedYear] = useState<string | null>(null);
  const [currentEra, setCurrentEra] = useState<string>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTimelineData();
  }, []);

  const loadTimelineData = async () => {
    try {
      const response = await fetch('/api/knowledge/annual-reports');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error loading timeline:', error);
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

  const filteredTimeline = data?.timeline.filter(year =>
    currentEra === 'all' || year.era === currentEra
  ) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading PICC's journey...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No timeline data available</h3>
          <p className="text-gray-600">Unable to load annual reports timeline</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/picc/knowledge"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Knowledge Base
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-7 h-7 text-blue-600" />
                  Annual Reports Timeline
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {data.stats.yearsSpanned} • {data.stats.totalReports} Reports • {data.stats.totalImages} Images
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/picc/media/collections/annual-reports-images"
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <ImageIcon className="w-4 h-4" />
                View Gallery ({data.stats.totalImages})
              </Link>
            </div>
          </div>

          {/* Era Filter */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            <button
              onClick={() => setCurrentEra('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                currentEra === 'all'
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All Years ({data.timeline.length})
            </button>
            {Object.entries(data.eras).map(([key, era]: [string, any]) => (
              <button
                key={key}
                onClick={() => setCurrentEra(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  currentEra === key
                    ? `bg-${era.color}-600 text-white shadow-lg`
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
                style={currentEra === key ? {
                  backgroundColor:
                    era.color === 'amber' ? '#d97706' :
                    era.color === 'purple' ? '#9333ea' :
                    era.color === 'green' ? '#16a34a' :
                    era.color === 'blue' ? '#2563eb' : undefined
                } : undefined}
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
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg border border-gray-200 transition-all hover:scale-110"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <button
          onClick={() => scrollToYear('right')}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg border border-gray-200 transition-all hover:scale-110"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>

        {/* Horizontal Scroll */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scroll-smooth px-6 py-12"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="flex gap-6 pb-4" style={{ minWidth: 'min-content' }}>
            {filteredTimeline.map((year, index) => (
              <TimelineCard
                key={year.id}
                year={year}
                index={index}
                onExpand={() => setExpandedYear(year.fiscalYear)}
              />
            ))}

            {/* End Cap */}
            <div className="flex-shrink-0 w-96 h-[500px] flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl border-2 border-blue-200 scroll-snap-align-start">
              <div className="text-center p-8">
                <Calendar className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {data.stats.totalReports} Years of Impact
                </h3>
                <p className="text-gray-600 mb-6">
                  {data.stats.totalImages} visual moments captured
                </p>
                <Link
                  href="/picc/media/collections/annual-reports-images"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ImageIcon className="w-5 h-5" />
                  Explore Full Gallery
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
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 grid md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">About This Timeline</h4>
            <p className="text-sm text-gray-600">
              Visual journey through PICC's 15 years of service to Palm Island community, from establishment to community control.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Explore Further</h4>
            <div className="space-y-2 text-sm">
              <Link href="/picc/knowledge" className="block text-blue-600 hover:text-blue-700">
                → Search Knowledge Base
              </Link>
              <Link href="/picc/media/gallery" className="block text-blue-600 hover:text-blue-700">
                → Browse Media Library
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Download Reports</h4>
            <p className="text-sm text-gray-600">
              Click any year card to view details and download the full PDF report.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
