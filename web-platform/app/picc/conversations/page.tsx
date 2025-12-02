'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users, Calendar, MessageSquare, Plus, Search, Filter,
  ArrowRight, Clock, MapPin, Sparkles, CheckCircle,
  AlertCircle, User, FileText, ChevronDown, Eye,
  Mic, FileAudio, Brain, TrendingUp
} from 'lucide-react';

// Mock data
const mockConversations = [
  {
    id: '1',
    conversation_title: 'Community Listening Tour - Palm Island Central',
    conversation_type: 'listening_tour',
    session_date: '2024-11-10',
    session_start_time: '10:00',
    session_end_time: '12:30',
    location: 'Community Hall',
    status: 'analyzed',
    participant_count: 45,
    elder_present: true,
    facilitator_names: ['Sarah Johnson', 'Michael Brown'],
    themes_identified: ['Youth activities', 'Elder support', 'Health access'],
    key_quotes: [
      'We need more programs for our young people on weekends',
      'The healing service has made such a difference to our family',
    ],
    insights_count: 12,
    priority_issues: ['Weekend youth programs', 'Elder transport', 'Mental health support'],
  },
  {
    id: '2',
    conversation_title: 'Youth Services Feedback Session',
    conversation_type: 'service_feedback',
    session_date: '2024-11-05',
    session_start_time: '14:00',
    session_end_time: '16:00',
    location: 'Youth Centre',
    status: 'transcribed',
    participant_count: 28,
    elder_present: false,
    facilitator_names: ['Emma Williams'],
    themes_identified: ['Sport programs', 'Cultural activities', 'Education support'],
    key_quotes: [
      'More basketball and footy would be great',
      'We want to learn more about our culture and language',
    ],
    insights_count: 8,
    priority_issues: ['Sport facilities', 'Cultural programs'],
  },
  {
    id: '3',
    conversation_title: 'Elder Wisdom Circle - November',
    conversation_type: 'elder_session',
    session_date: '2024-10-28',
    session_start_time: '09:00',
    session_end_time: '11:00',
    location: 'Community Centre',
    status: 'integrated',
    participant_count: 15,
    elder_present: true,
    facilitator_names: ['Uncle Tom'],
    themes_identified: ['Traditional knowledge', 'Language preservation', 'Story sharing'],
    key_quotes: [
      'Our stories must be passed down to the young ones',
      'The old ways of healing are still important today',
    ],
    insights_count: 6,
    priority_issues: ['Language programs', 'Intergenerational activities'],
  },
  {
    id: '4',
    conversation_title: 'Health Services Town Hall',
    conversation_type: 'town_hall',
    session_date: '2024-12-05',
    session_start_time: '18:00',
    session_end_time: '20:00',
    location: 'Community Hall',
    status: 'planned',
    participant_count: 0,
    elder_present: false,
    facilitator_names: ['Health Team'],
    themes_identified: [],
    key_quotes: [],
    insights_count: 0,
    priority_issues: [],
  },
];

const conversationTypeConfig: Record<string, { label: string; color: string; icon: typeof Users }> = {
  listening_tour: { label: 'Listening Tour', color: 'bg-blue-100 text-blue-700', icon: Users },
  town_hall: { label: 'Town Hall', color: 'bg-purple-100 text-purple-700', icon: Users },
  focus_group: { label: 'Focus Group', color: 'bg-green-100 text-green-700', icon: Users },
  elder_session: { label: 'Elder Session', color: 'bg-amber-100 text-amber-700', icon: User },
  youth_forum: { label: 'Youth Forum', color: 'bg-pink-100 text-pink-700', icon: Users },
  service_feedback: { label: 'Service Feedback', color: 'bg-teal-100 text-teal-700', icon: MessageSquare },
  planning_workshop: { label: 'Planning Workshop', color: 'bg-indigo-100 text-indigo-700', icon: FileText },
};

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  planned: { label: 'Planned', color: 'bg-gray-100 text-gray-600', icon: Clock },
  conducted: { label: 'Conducted', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  transcribed: { label: 'Transcribed', color: 'bg-yellow-100 text-yellow-700', icon: FileAudio },
  analyzed: { label: 'Analyzed', color: 'bg-purple-100 text-purple-700', icon: Brain },
  integrated: { label: 'Integrated', color: 'bg-green-100 text-green-700', icon: CheckCircle },
};

export default function ConversationsPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredConversations = mockConversations.filter(c => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (filterType !== 'all' && c.conversation_type !== filterType) return false;
    if (searchQuery && !c.conversation_title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: mockConversations.length,
    planned: mockConversations.filter(c => c.status === 'planned').length,
    analyzed: mockConversations.filter(c => c.status === 'analyzed' || c.status === 'integrated').length,
    totalParticipants: mockConversations.reduce((sum, c) => sum + c.participant_count, 0),
    totalInsights: mockConversations.reduce((sum, c) => sum + c.insights_count, 0),
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Community Conversations</h1>
              <p className="text-gray-600">Listening to and learning from our community</p>
            </div>
          </div>
          <Link
            href="/picc/conversations/new"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Conversation
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm">Total Sessions</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-500">This year</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Upcoming</span>
          </div>
          <div className="text-2xl font-bold text-indigo-600">{stats.planned}</div>
          <div className="text-xs text-gray-500">Planned</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Brain className="w-4 h-4" />
            <span className="text-sm">Analyzed</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.analyzed}</div>
          <div className="text-xs text-gray-500">Ready for reports</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-sm">Participants</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</div>
          <div className="text-xs text-gray-500">Voices heard</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">Insights</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.totalInsights}</div>
          <div className="text-xs text-gray-500">Extracted</div>
        </div>
      </div>

      {/* Workflow Pipeline */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">Conversation Pipeline</h3>
        <div className="flex items-center justify-between">
          {['planned', 'conducted', 'transcribed', 'analyzed', 'integrated'].map((status, index) => {
            const config = statusConfig[status];
            const count = mockConversations.filter(c => c.status === status).length;
            return (
              <div key={status} className="flex items-center">
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full ${config.color} flex items-center justify-center mx-auto mb-2`}>
                    <span className="text-lg font-bold">{count}</span>
                  </div>
                  <div className="text-xs font-medium text-gray-600 capitalize">{config.label}</div>
                </div>
                {index < 4 && (
                  <ArrowRight className="w-5 h-5 text-gray-300 mx-4" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="planned">Planned</option>
              <option value="conducted">Conducted</option>
              <option value="transcribed">Transcribed</option>
              <option value="analyzed">Analyzed</option>
              <option value="integrated">Integrated</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="listening_tour">Listening Tour</option>
              <option value="town_hall">Town Hall</option>
              <option value="elder_session">Elder Session</option>
              <option value="youth_forum">Youth Forum</option>
              <option value="service_feedback">Service Feedback</option>
              <option value="focus_group">Focus Group</option>
            </select>
          </div>
        </div>

        {/* Conversations List */}
        <div className="divide-y divide-gray-100">
          {filteredConversations.map((conversation) => {
            const typeConfig = conversationTypeConfig[conversation.conversation_type] || conversationTypeConfig.focus_group;
            const statConfig = statusConfig[conversation.status];
            const isExpanded = expandedId === conversation.id;
            const StatusIcon = statConfig.icon;

            return (
              <div key={conversation.id} className="hover:bg-gray-50/50 transition-colors">
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : conversation.id)}
                >
                  <div className={`p-3 rounded-lg ${typeConfig.color.replace('text-', 'bg-').replace('700', '100')}`}>
                    <typeConfig.icon className={`w-5 h-5 ${typeConfig.color.split(' ')[1]}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${typeConfig.color}`}>
                        {typeConfig.label}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded flex items-center gap-1 ${statConfig.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statConfig.label}
                      </span>
                      {conversation.elder_present && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-700">
                          Elder Present
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate">{conversation.conversation_title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(conversation.session_date).toLocaleDateString()}
                        {conversation.session_start_time && ` at ${conversation.session_start_time}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {conversation.location}
                      </span>
                      {conversation.participant_count > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {conversation.participant_count} participants
                        </span>
                      )}
                      {conversation.insights_count > 0 && (
                        <span className="flex items-center gap-1 text-purple-600">
                          <Sparkles className="w-3 h-3" />
                          {conversation.insights_count} insights
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/picc/conversations/${conversation.id}`}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 bg-gray-50/50">
                    <div className="ml-16 space-y-4">
                      {/* Themes */}
                      {conversation.themes_identified.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Themes Identified</h4>
                          <div className="flex flex-wrap gap-2">
                            {conversation.themes_identified.map((theme, i) => (
                              <span key={i} className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-full">
                                {theme}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Key Quotes */}
                      {conversation.key_quotes.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Key Quotes</h4>
                          <div className="space-y-2">
                            {conversation.key_quotes.map((quote, i) => (
                              <blockquote key={i} className="pl-4 border-l-2 border-indigo-300 text-sm text-gray-600 italic">
                                &ldquo;{quote}&rdquo;
                              </blockquote>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Priority Issues */}
                      {conversation.priority_issues.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Priority Issues</h4>
                          <div className="flex flex-wrap gap-2">
                            {conversation.priority_issues.map((issue, i) => (
                              <span key={i} className="px-3 py-1 text-sm bg-amber-100 text-amber-700 rounded-full flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {issue}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Facilitators */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Facilitators</h4>
                        <div className="flex flex-wrap gap-2">
                          {conversation.facilitator_names.map((name, i) => (
                            <span key={i} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-2">
                        <Link
                          href={`/picc/conversations/${conversation.id}`}
                          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          View Full Details
                        </Link>
                        {conversation.status !== 'planned' && (
                          <Link
                            href={`/picc/conversations/${conversation.id}/insights`}
                            className="px-4 py-2 bg-purple-100 text-purple-700 text-sm rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-1"
                          >
                            <Sparkles className="w-4 h-4" />
                            Manage Insights
                          </Link>
                        )}
                        {conversation.status === 'planned' && (
                          <Link
                            href={`/picc/conversations/${conversation.id}/capture`}
                            className="px-4 py-2 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1"
                          >
                            <Mic className="w-4 h-4" />
                            Start Capture
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredConversations.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No conversations match your filters</p>
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setFilterType('all');
                  setSearchQuery('');
                }}
                className="mt-2 text-indigo-600 hover:text-indigo-700"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
        <h3 className="font-bold text-gray-900 mb-3">Community Conversation Best Practices</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg h-fit">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Include Elders</h4>
              <p className="text-sm text-gray-600">Ensure elder presence for cultural guidance and approval</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="p-2 bg-purple-100 rounded-lg h-fit">
              <Mic className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Record with Consent</h4>
              <p className="text-sm text-gray-600">Always get permission before recording conversations</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="p-2 bg-green-100 rounded-lg h-fit">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Close the Loop</h4>
              <p className="text-sm text-gray-600">Report back on actions taken from feedback</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
