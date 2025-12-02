'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_type: string;
  location?: string;
  related_stories?: string[];
}

export default function KnowledgeTimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedYear, setExpandedYear] = useState<number | null>(null);

  useEffect(() => {
    loadTimelineEvents();
  }, []);

  const loadTimelineEvents = async () => {
    try {
      const supabase = createClient();

      // Try to load from stories with dates as timeline events
      const { data: stories } = await supabase
        .from('stories')
        .select('id, title, content, created_at, category, location')
        .order('created_at', { ascending: false });

      // Type for story data from Supabase
      type StoryData = {
        id: string;
        title: string;
        content: string | null;
        created_at: string;
        category: string | null;
        location: string | null;
      };

      // Convert stories to timeline events
      const storiesTyped = (stories || []) as StoryData[];
      const timelineEvents: TimelineEvent[] = storiesTyped.map(story => ({
        id: story.id,
        title: story.title,
        description: story.content?.substring(0, 200) + '...' || '',
        event_date: story.created_at,
        event_type: story.category || 'story',
        location: story.location || undefined
      }));

      setEvents(timelineEvents);
    } catch (error) {
      console.error('Error loading timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group events by year
  const eventsByYear = events.reduce((acc, event) => {
    const year = new Date(event.event_date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(event);
    return acc;
  }, {} as Record<number, TimelineEvent[]>);

  const years = Object.keys(eventsByYear).map(Number).sort((a, b) => b - a);

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'cultural': 'bg-purple-100 text-purple-700 border-purple-300',
      'community': 'bg-blue-100 text-blue-700 border-blue-300',
      'historical': 'bg-amber-100 text-amber-700 border-amber-300',
      'service': 'bg-green-100 text-green-700 border-green-300',
      'story': 'bg-gray-100 text-gray-700 border-gray-300'
    };
    return colors[type] || colors['story'];
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link
        href="/picc/knowledge"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Knowledge Base
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Community Timeline</h1>
        </div>
        <p className="text-gray-600">
          A chronological view of Palm Island stories, events, and milestones
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading timeline...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No timeline events yet</h3>
          <p className="text-gray-600">
            Events will appear here as stories and milestones are added
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {years.map((year) => (
            <div key={year} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedYear(expandedYear === year ? null : year)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-gray-900">{year}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                    {eventsByYear[year].length} events
                  </span>
                </div>
                {expandedYear === year ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {expandedYear === year && (
                <div className="p-4 space-y-4">
                  {eventsByYear[year].map((event, index) => (
                    <div
                      key={event.id}
                      className="flex gap-4 relative"
                    >
                      {/* Timeline connector */}
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        {index < eventsByYear[year].length - 1 && (
                          <div className="w-0.5 h-full bg-gray-300 absolute top-3 left-1.5"></div>
                        )}
                      </div>

                      {/* Event card */}
                      <div className="flex-1 pb-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <span className={`px-2 py-1 text-xs rounded border ${getEventTypeColor(event.event_type)}`}>
                              {event.event_type}
                            </span>
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(event.event_date).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                          {event.location && (
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
