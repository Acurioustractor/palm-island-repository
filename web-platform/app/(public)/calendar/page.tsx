'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Star, MapPin, ArrowRight } from 'lucide-react';
import CulturalCalendar from '@/components/calendar/CulturalCalendar';
import { C } from '@/components/annual-report/2024-25/almanac/tokens';

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
    <div className="min-h-screen" style={{ backgroundColor: C.shell }}>
      {/* Editorial Hero */}
      <section className="editorial-section" style={{ backgroundColor: '#FFFFFF', borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p
            className="font-bold uppercase mb-4"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            Community · Country
          </p>
          <h1
            className="font-fraunces font-bold mb-6"
            style={{ color: C.ocean, fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1.05 }}
          >
            Cultural calendar
          </h1>
          <p
            className="font-fraunces max-w-2xl"
            style={{ color: C.driftwood, fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: 1.55 }}
          >
            Stay connected with community events, cultural celebrations, and important dates for
            Palm Island and First Nations peoples across Australia.
          </p>
        </div>
      </section>

      {/* Today's Significance */}
      {todayInfo?.message && (
        <div style={{ backgroundColor: C.sand, borderBottom: `1px solid ${C.border}` }}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: C.starGold }} />
              <div>
                <p
                  className="font-bold uppercase mb-1"
                  style={{ color: C.turtleRed, fontSize: 10, letterSpacing: '0.25em' }}
                >
                  Today&apos;s significance
                </p>
                <p className="font-fraunces" style={{ color: C.earth, fontSize: 14, lineHeight: 1.5 }}>
                  {todayInfo.message}
                </p>
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
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}`, borderTopWidth: 3, borderTopColor: C.ochre }}>
              <div className="p-5" style={{ borderBottom: `1px solid ${C.border}` }}>
                <p
                  className="font-bold uppercase mb-3 inline-flex items-center gap-2"
                  style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.25em' }}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Upcoming events
                </p>

                <div>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all"
                    style={{ border: `1px solid ${C.border}`, color: C.earth, backgroundColor: '#FFFFFF' }}
                  >
                    {EVENT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                {loading ? (
                  <div className="p-8 text-center font-fraunces italic" style={{ color: C.muted, fontSize: 14 }}>
                    Loading events…
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="p-8 text-center font-fraunces italic" style={{ color: C.muted, fontSize: 14 }}>
                    No upcoming events.
                  </div>
                ) : (
                  filteredEvents.map(event => (
                    <div key={event.id} className="p-4 transition-colors" style={{ borderTop: `1px solid ${C.border}` }}>
                      <div className="flex items-start gap-3">
                        <div className="text-center min-w-[50px]">
                          <div className="font-fraunces font-bold leading-none" style={{ color: C.ocean, fontSize: 28 }}>
                            {new Date(event.date).getDate()}
                          </div>
                          <div
                            className="font-bold uppercase mt-1"
                            style={{ color: C.muted, fontSize: 10, letterSpacing: '0.2em' }}
                          >
                            {new Date(event.date).toLocaleDateString('en-AU', { month: 'short' })}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-fraunces font-bold truncate" style={{ color: C.ocean, fontSize: 15 }}>
                            {event.title}
                          </h3>
                          {event.description && (
                            <p
                              className="font-fraunces line-clamp-2 mt-1"
                              style={{ color: C.driftwood, fontSize: 13, lineHeight: 1.5 }}
                            >
                              {event.description}
                            </p>
                          )}
                          {event.location && (
                            <p className="mt-1 flex items-center gap-1" style={{ color: C.muted, fontSize: 11 }}>
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </p>
                          )}
                          <span
                            className="inline-block mt-2 px-2 py-0.5 rounded-full capitalize font-bold uppercase"
                            style={{ backgroundColor: C.ochre + '22', color: C.ochre, fontSize: 10, letterSpacing: '0.15em' }}
                          >
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
            <div className="mt-6 rounded-2xl p-5" style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}` }}>
              <p
                className="font-bold uppercase mb-4"
                style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
              >
                Important dates
              </p>
              <div className="space-y-3">
                {[
                  { name: `NAIDOC Week ${new Date().getFullYear()}`, date: 'First week of July' },
                  { name: 'National Sorry Day', date: 'May 26' },
                  { name: 'Reconciliation Week', date: 'May 27 – Jun 3' },
                  { name: 'Mabo Day', date: 'Jun 3' },
                  { name: 'Coming of the Light', date: 'Jul 1' },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between font-fraunces"
                    style={{ color: C.driftwood, fontSize: 14 }}
                  >
                    <span>{item.name}</span>
                    <span style={{ color: C.muted, fontSize: 12 }}>{item.date}</span>
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
