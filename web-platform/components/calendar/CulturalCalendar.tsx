'use client';

import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Star, MapPin, Users } from 'lucide-react';

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

interface CulturalCalendarProps {
  initialEvents?: CulturalEvent[];
  showUpcoming?: boolean;
  compact?: boolean;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  community: 'bg-blue-500',
  cultural: 'bg-purple-500',
  national: 'bg-yellow-500',
  local: 'bg-green-500',
  health: 'bg-red-500',
  education: 'bg-indigo-500',
  sports: 'bg-orange-500',
  memorial: 'bg-gray-500',
  celebration: 'bg-pink-500'
};

export default function CulturalCalendar({
  initialEvents,
  showUpcoming = true,
  compact = false
}: CulturalCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CulturalEvent[]>(initialEvents || []);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initialEvents);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    if (!initialEvents) {
      fetchEvents();
    }
  }, [year, month]);

  async function fetchEvents() {
    setLoading(true);
    try {
      const response = await fetch(`/api/calendar?action=month&year=${year}&month=${month + 1}`);
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
    setLoading(false);
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const monthName = currentDate.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getEventsForDate = (day: number): CulturalEvent[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => {
      const eventDate = event.date.split('T')[0];
      if (eventDate === dateStr) return true;
      if (event.endDate) {
        const start = new Date(event.date);
        const end = new Date(event.endDate);
        const current = new Date(dateStr);
        return current >= start && current <= end;
      }
      return false;
    });
  };

  const selectedEvents = selectedDate
    ? events.filter(e => {
        const eventDate = e.date.split('T')[0];
        if (eventDate === selectedDate) return true;
        if (e.endDate) {
          const start = new Date(e.date);
          const end = new Date(e.endDate);
          const current = new Date(selectedDate);
          return current >= start && current <= end;
        }
        return false;
      })
    : [];

  if (compact) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Upcoming Events
        </h3>
        <div className="space-y-3">
          {events.slice(0, 5).map(event => (
            <div key={event.id} className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${EVENT_TYPE_COLORS[event.type] || 'bg-gray-400'}`} />
              <div>
                <p className="font-medium text-gray-900 text-sm">{event.title}</p>
                <p className="text-xs text-gray-500">
                  {new Date(event.date).toLocaleDateString('en-AU', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </p>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <p className="text-sm text-gray-500">No upcoming events</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-white">{monthName}</h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = getEventsForDate(day);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={`
                  aspect-square p-1 rounded-lg transition-all
                  ${isToday ? 'ring-2 ring-purple-500' : ''}
                  ${isSelected ? 'bg-purple-100' : 'hover:bg-gray-100'}
                `}
              >
                <div className="h-full flex flex-col">
                  <span className={`text-sm ${isToday ? 'font-bold text-purple-600' : 'text-gray-700'}`}>
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-auto justify-center">
                      {dayEvents.slice(0, 3).map((event, idx) => (
                        <div
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full ${EVENT_TYPE_COLORS[event.type] || 'bg-gray-400'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Events */}
      {selectedDate && selectedEvents.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            {new Date(selectedDate).toLocaleDateString('en-AU', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
          </h3>
          <div className="space-y-3">
            {selectedEvents.map(event => (
              <div key={event.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1 ${EVENT_TYPE_COLORS[event.type] || 'bg-gray-400'}`} />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    )}
                    {event.location && (
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </p>
                    )}
                    {event.culturalSignificance && (
                      <div className="mt-2 p-2 bg-purple-50 rounded text-xs text-purple-700">
                        <Star className="w-3 h-3 inline mr-1" />
                        {event.culturalSignificance}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="border-t border-gray-200 p-4">
        <h4 className="text-xs font-medium text-gray-500 mb-2">Event Types</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(EVENT_TYPE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-xs text-gray-600 capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
