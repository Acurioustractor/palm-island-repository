'use client';

import { useEffect, useState, RefObject } from 'react';

interface TimelineNavigationProps {
  timeline: Array<{
    fiscalYear: string;
    era: string;
    color: string;
  }>;
  scrollContainerRef: RefObject<HTMLDivElement>;
}

export default function TimelineNavigation({ timeline, scrollContainerRef }: TimelineNavigationProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollWidth = container.scrollWidth - container.clientWidth;
      const scrollLeft = container.scrollLeft;
      const progress = scrollWidth > 0 ? (scrollLeft / scrollWidth) * 100 : 0;
      setScrollProgress(progress);
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => container.removeEventListener('scroll', handleScroll);
  }, [scrollContainerRef]);

  const scrollToYear = (index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = 400; // Approximate width including gap
    const scrollPosition = index * cardWidth;

    container.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
  };

  const getEraColor = (color: string) => {
    const colors: Record<string, string> = {
      amber: '#d97706',
      purple: '#9333ea',
      green: '#16a34a',
      blue: '#2563eb'
    };
    return colors[color] || '#6b7280';
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-6">
      <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-sm font-medium text-gray-700">Timeline Progress:</div>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
          <div className="text-sm text-gray-600">{Math.round(scrollProgress)}%</div>
        </div>

        {/* Mini Timeline */}
        <div className="flex gap-1">
          {timeline.map((year, index) => (
            <button
              key={year.fiscalYear}
              onClick={() => scrollToYear(index)}
              className="flex-1 min-w-0 group relative"
              title={year.fiscalYear}
            >
              <div
                className="h-8 rounded transition-all hover:h-10"
                style={{
                  backgroundColor: getEraColor(year.color),
                  opacity: 0.7
                }}
              />
              <div className="absolute inset-x-0 -bottom-6 text-xs text-gray-600 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                {year.fiscalYear}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-600"></div>
            <span className="text-gray-600">Foundation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-600"></div>
            <span className="text-gray-600">Growth</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-600"></div>
            <span className="text-gray-600">Transition</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-600"></div>
            <span className="text-gray-600">Community Controlled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
