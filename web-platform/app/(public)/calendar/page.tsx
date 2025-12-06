'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Star, MapPin, ArrowRight, Filter } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Cultural Calendar</h1>
          <p className="text-xl text-purple-100 max-w-2xl">
            Stay connected with community events, cultural celebrations, and important dates
            for Palm Island and First Nations peoples across Australia.
          </p>
        </div>
      </div>

      {/* Today's Significance */}
      {todayInfo?.message && (
        <div className="bg-yellow-50 border-b border-yellow-100">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-semibold text-yellow-800">Today's Significance</h2>
                <p className="text-yellow-700">{todayInfo.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Widget */}
          <div className="lg:col-span-2">
            <CulturalCalendar />
          </div>

          {/* Upcoming Events */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Upcoming Events
                </h2>

                {/* Filter */}
                <div className="mt-3">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {EVENT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">
                    Loading events...
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No upcoming events
                  </div>
                ) : (
                  filteredEvents.map(event => (
                    <div key={event.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="text-center min-w-[50px]">
                          <div className="text-2xl font-bold text-purple-600">
                            {new Date(event.date).getDate()}
                          </div>
                          <div className="text-xs text-gray-500 uppercase">
                            {new Date(event.date).toLocaleDateString('en-AU', { month: 'short' })}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {event.title}
                          </h3>
                          {event.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                              {event.description}
                            </p>
                          )}
                          {event.location && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </p>
                          )}
                          <span className={`
                            inline-block mt-2 text-xs px-2 py-0.5 rounded capitalize
                            ${event.type === 'national' ? 'bg-yellow-100 text-yellow-800' :
                              event.type === 'cultural' ? 'bg-purple-100 text-purple-800' :
                              event.type === 'health' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'}
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

            {/* Quick Links */}
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Important Dates</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="flex items-center justify-between text-gray-600 hover:text-purple-600">
                  <span>NAIDOC Week 2024</span>
                  <span className="text-gray-400">Jul 7-14</span>
                </a>
                <a href="#" className="flex items-center justify-between text-gray-600 hover:text-purple-600">
                  <span>National Sorry Day</span>
                  <span className="text-gray-400">May 26</span>
                </a>
                <a href="#" className="flex items-center justify-between text-gray-600 hover:text-purple-600">
                  <span>Reconciliation Week</span>
                  <span className="text-gray-400">May 27 - Jun 3</span>
                </a>
                <a href="#" className="flex items-center justify-between text-gray-600 hover:text-purple-600">
                  <span>Mabo Day</span>
                  <span className="text-gray-400">Jun 3</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
