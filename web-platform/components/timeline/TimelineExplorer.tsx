'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { BespokeIcon, type BespokeIconName } from '@/components/ui/BespokeIcon';

interface TimelineEvent {
  id: string;
  type: 'story' | 'milestone' | 'service' | 'media' | 'quote';
  title: string;
  description?: string;
  date: string;
  year: number;
  url?: string;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
}

const TYPE_CONFIG: Record<string, { icon: BespokeIconName; color: string; dotColor: string; label: string }> = {
  story: { icon: 'story', color: 'text-picc-earth', dotColor: 'bg-picc-red', label: 'Story' },
  milestone: { icon: 'campfire', color: 'text-picc-ochre', dotColor: 'bg-picc-ochre', label: 'Milestone' },
  service: { icon: 'community', color: 'text-picc-earth', dotColor: 'bg-sage-500', label: 'Service' },
  media: { icon: 'photo', color: 'text-picc-earth-300', dotColor: 'bg-warm-400', label: 'Photo' },
  quote: { icon: 'quote', color: 'text-picc-ochre', dotColor: 'bg-picc-ochre', label: 'Quote' },
};

interface TimelineExplorerProps {
  className?: string;
}

export default function TimelineExplorer({ className = '' }: TimelineExplorerProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [byYear, setByYear] = useState<Record<number, TimelineEvent[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());
  const [activeTypes, setActiveTypes] = useState<Set<string>>(
    new Set(['story', 'milestone', 'service', 'media', 'quote'])
  );

  useEffect(() => {
    async function loadTimeline() {
      try {
        const types = Array.from(activeTypes).join(',');
        const res = await fetch(`/api/timeline?from=2010&to=2026&types=${types}`);
        if (!res.ok) return;
        const data = await res.json();
        setEvents(data.events || []);
        setByYear(data.byYear || {});

        // Auto-expand the most recent 2 years
        const years = Object.keys(data.byYear || {}).map(Number).sort((a, b) => b - a);
        setExpandedYears(new Set(years.slice(0, 2)));
      } catch {
        // Fail gracefully
      } finally {
        setLoading(false);
      }
    }

    loadTimeline();
  }, [activeTypes]);

  const toggleYear = (year: number) => {
    setExpandedYears(prev => {
      const next = new Set(prev);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });
  };

  const toggleType = (type: string) => {
    setActiveTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const sortedYears = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-20 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-picc-ochre mx-auto mb-4" />
          <p className="text-picc-earth-300">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Type Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {Object.entries(TYPE_CONFIG).map(([type, config]) => (
          <button
            key={type}
            onClick={() => toggleType(type)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
              activeTypes.has(type)
                ? 'bg-picc-ochre text-white border-picc-ochre'
                : 'bg-white/60 text-picc-earth-300 border-warm-200 hover:border-picc-ochre'
            }`}
          >
            <BespokeIcon name={config.icon} size={18} />
            <span>{config.label}s</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-8 text-sm text-picc-earth-300">
        <span><strong className="text-picc-earth">{events.length}</strong> events</span>
        <span><strong className="text-picc-earth">{sortedYears.length}</strong> years</span>
        {sortedYears.length > 0 && (
          <span>{sortedYears[sortedYears.length - 1]} — {sortedYears[0]}</span>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-picc-ochre via-warm-300 to-warm-200" />

        {sortedYears.map(year => {
          const yearEvents = byYear[year] || [];
          const isExpanded = expandedYears.has(year);

          return (
            <div key={year} className="mb-6">
              {/* Year marker */}
              <button
                onClick={() => toggleYear(year)}
                className="relative flex items-center gap-4 mb-3 group"
              >
                <div className="w-12 h-12 rounded-full bg-picc-ochre text-white flex items-center justify-center font-bold text-sm font-serif z-10 group-hover:scale-110 transition-transform">
                  {year}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-picc-earth">{year}</span>
                  <span className="text-sm text-picc-earth-300">
                    {yearEvents.length} event{yearEvents.length !== 1 ? 's' : ''}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-picc-earth-300" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-picc-earth-300" />
                  )}
                </div>
              </button>

              {/* Events for this year */}
              {isExpanded && (
                <div className="ml-6 pl-10 space-y-4 border-l-0">
                  {yearEvents.map(event => {
                    const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.story;

                    return (
                      <div key={event.id} className="relative">
                        {/* Dot on timeline */}
                        <div className={`absolute -left-[2.85rem] top-3 w-3 h-3 rounded-full ${config.dotColor} ring-2 ring-white`} />

                        {/* Event card */}
                        <div className="bg-white/80 border border-warm-200 rounded-xl p-4 hover:shadow-sm transition-all">
                          <div className="flex items-start gap-3">
                            <BespokeIcon name={config.icon} size={24} className="flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.dotColor} text-white`}>
                                  {config.label}
                                </span>
                                <span className="text-xs text-picc-earth-200">
                                  {new Date(event.date).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}
                                </span>
                              </div>

                              {event.url ? (
                                <Link href={event.url} className="text-picc-earth font-medium hover:text-picc-ochre transition-colors">
                                  {event.title}
                                </Link>
                              ) : (
                                <p className="text-picc-earth font-medium">{event.title}</p>
                              )}

                              {event.description && (
                                <p className="text-sm text-picc-earth-300 mt-1 line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                            </div>

                            {/* Thumbnail for media events */}
                            {event.imageUrl && (
                              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                                <Image
                                  src={event.imageUrl}
                                  alt=""
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {sortedYears.length === 0 && (
          <div className="text-center py-16 text-picc-earth-300">
            <BespokeIcon name="timeline" size={48} className="mx-auto mb-4 opacity-50" />
            <p>No events found for the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
