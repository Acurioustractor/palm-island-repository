'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Calendar, MapPin, Users, Search, ChevronDown, ChevronUp,
  Tag, Loader2, FileText, CheckCircle,
} from 'lucide-react';

interface MeetingNote {
  id: string;
  title: string;
  meeting_date: string;
  location: string;
  group_name: string;
  summary: string | null;
  key_themes: string[];
  action_items: string[];
  attendees: string[];
  recorded_by: string | null;
  is_public: boolean;
  related_project_slug: string | null;
  created_at: string;
}

interface MeetingDetail extends MeetingNote {
  transcript: string | null;
  is_sensitive: boolean;
  sensitivity_notes: string | null;
  metadata: Record<string, unknown>;
}

export default function EldersMeetingsPage() {
  const [meetings, setMeetings] = useState<MeetingNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedMeeting, setExpandedMeeting] = useState<MeetingDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    const loadMeetings = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('group', 'Elders Group');
        if (searchQuery.trim()) params.set('q', searchQuery.trim());

        const res = await fetch(`/api/meetings?${params}`, { signal: AbortSignal.timeout(10000) });
        const json = await res.json();
        setMeetings(json.data || []);
      } catch (err) {
        console.error('Failed to load meetings:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(loadMeetings, searchQuery ? 400 : 0);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedMeeting(null);
      return;
    }

    setExpandedId(id);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/meetings/${id}`, { signal: AbortSignal.timeout(10000) });
      const json = await res.json();
      setExpandedMeeting(json.data || null);
    } catch (err) {
      console.error('Failed to load meeting detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/picc/media"
          className="inline-flex items-center gap-2 text-picc-red hover:text-picc-red/80 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Elders Group Meetings</h1>
        <p className="text-gray-600 mt-1">
          A dated collection of meeting reflections, discussions, and action items from the Elders Group.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-picc-red mb-2" />
          <p className="text-gray-500">Loading meetings...</p>
        </div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-700 font-medium mb-1">
            {searchQuery ? 'No meetings match your search' : 'No meetings recorded yet'}
          </p>
          <p className="text-gray-500">
            Meeting reflections and transcripts will appear here once added.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 mb-2">{meetings.length} meeting(s) recorded</p>

          {meetings.map((meeting) => {
            const isExpanded = expandedId === meeting.id;

            return (
              <div
                key={meeting.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Meeting header - clickable */}
                <button
                  type="button"
                  onClick={() => toggleExpand(meeting.id)}
                  className="w-full text-left p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-gray-900">{meeting.title}</h2>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {formatDate(meeting.meeting_date)}
                        </span>
                        {meeting.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            {meeting.location}
                          </span>
                        )}
                        {meeting.attendees.length > 0 && (
                          <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            {meeting.attendees.length} attendees
                          </span>
                        )}
                      </div>
                      {meeting.summary && (
                        <p className="mt-2 text-sm text-gray-700 line-clamp-2">{meeting.summary}</p>
                      )}
                      {meeting.key_themes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {meeting.key_themes.map((theme) => (
                            <span
                              key={theme}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-picc-ochre/10 text-picc-ochre"
                            >
                              <Tag className="w-3 h-3" />
                              {theme}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                    )}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-5 bg-gray-50">
                    {loadingDetail ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading full transcript...
                      </div>
                    ) : expandedMeeting ? (
                      <div className="space-y-6">
                        {/* Action items */}
                        {expandedMeeting.action_items.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Action Items</h3>
                            <ul className="space-y-1.5">
                              {expandedMeeting.action_items.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Attendees */}
                        {expandedMeeting.attendees.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Attendees</h3>
                            <div className="flex flex-wrap gap-2">
                              {expandedMeeting.attendees.map((name) => (
                                <span
                                  key={name}
                                  className="px-2.5 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700"
                                >
                                  {name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Transcript */}
                        {expandedMeeting.transcript && (
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Full Transcript</h3>
                            <div className="bg-white rounded-lg border border-gray-200 p-4 max-h-[600px] overflow-y-auto">
                              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {expandedMeeting.transcript}
                              </div>
                            </div>
                          </div>
                        )}

                        {expandedMeeting.recorded_by && (
                          <p className="text-xs text-gray-400">
                            Recorded by {expandedMeeting.recorded_by}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Could not load meeting details.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
