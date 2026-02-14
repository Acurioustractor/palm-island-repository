'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Star, MapPin, ArrowRight } from 'lucide-react';
import CulturalCalendar from '@/components/calendar/CulturalCalendar';

interface CulturalEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  type: string;
  location?: string;
  culturalSignificance?: string;
  isPublic: boolean;
}

const EVENT_TYPES = [
  { value: 'all', label: 'All Events' },
  { value: 'national', label: 'National Days' },
  { value: 'cultural', label: 'Cultural Events' },
  { value: 'community', label: 'Community' },
  { value: 'health', label: 'Health Programs' },
  { value: 'education', label: 'Education' },
  { value: 'sports', label: 'Sports' }
];

export default function CalendarPage() {
  const [upcomingEvents, setUpcomingEvents] = useState<CulturalEvent[]>([]);
  const [todayInfo, setTodayInfo] = useState<{ events: CulturalEvent[]; message: string | null } | null>(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [upcomingRes, todayRes] = await Promise.all([
        fetch('/api/calendar?action=upcoming&count=10'),
        fetch('/api/calendar?action=today')
      ]);

      const upcomingData = await upcomingRes.json();
      const todayData = await todayRes.json();

      setUpcomingEvents(upcomingData.events || []);
      setTodayInfo(todayData);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
    setLoading(false);
  }

  const filteredEvents = filter === 'all'
    ? upcomingEvents
    : upcomingEvents.filter(e => e.type === filter);

  return (
    <div className="min-h-screen bg-white">
      {/* Editorial Hero */}
      <section className="editorial-section border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
            Community
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-[-0.02em] leading-[1.1] mt-4 mb-6">
            Cultural Calendar
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
            Stay connected with community events, cultural celebrations, and important dates
            for Palm Island and First Nations peoples across Australia.
          </p>
        </div>
      </section>

      {/* Today's Significance */}
      {todayInfo?.message && (
        <div className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-gray-900 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">Today&apos;s Significance</h2>
                <p className="text-gray-500 text-sm">{todayInfo.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Calendar Widget */}
          <div className="lg:col-span-2">
            <CulturalCalendar />
          </div>

          {/* Upcoming Events */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" />
                  Upcoming Events
                </h2>

                <div className="mt-3">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-300 ease-elegant"
                  >
                    {EVENT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="divide-y divide-gray-50">
                {loading ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    Loading events...
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    No upcoming events
                  </div>
                ) : (
                  filteredEvents.map(event => (
                    <div key={event.id} className="p-4 hover:bg-gray-50/50 transition-colors duration-300 ease-elegant">
                      <div className="flex items-start gap-3">
                        <div className="text-center min-w-[50px]">
                          <div className="text-2xl font-extrabold text-gray-900 tracking-[-0.02em]">
                            {new Date(event.date).getDate()}
                          </div>
                          <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                            {new Date(event.date).toLocaleDateString('en-AU', { month: 'short' })}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate text-sm">
                            {event.title}
                          </h3>
                          {event.description && (
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                              {event.description}
                            </p>
                          )}
                          {event.location && (
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </p>
                          )}
                          <span className={`
                            inline-block mt-2 text-xs px-2 py-0.5 rounded-full capitalize font-medium
                            ${event.type === 'national' ? 'bg-gray-100 text-gray-700' :
                              event.type === 'cultural' ? 'bg-gray-100 text-gray-700' :
                              event.type === 'health' ? 'bg-gray-100 text-gray-700' :
                              'bg-gray-100 text-gray-700'}
                          `}>
                            {event.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Important Dates */}
            <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400 mb-4">
                Important Dates
              </h3>
              <div className="space-y-3 text-sm">
                {[
                  { name: `NAIDOC Week ${new Date().getFullYear()}`, date: 'First week of July' },
                  { name: 'National Sorry Day', date: 'May 26' },
                  { name: 'Reconciliation Week', date: 'May 27 - Jun 3' },
                  { name: 'Mabo Day', date: 'Jun 3' },
                  { name: 'Coming of the Light', date: 'Jul 1' },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-gray-600">
                    <span className="animated-underline cursor-pointer hover:text-gray-900 transition-colors duration-300">{item.name}</span>
                    <span className="text-gray-400 text-xs">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
