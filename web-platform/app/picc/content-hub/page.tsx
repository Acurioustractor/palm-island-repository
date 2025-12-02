'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Newspaper, Calendar, TrendingUp, Users, FileText,
  Plus, Filter, Search, ArrowRight, Clock, Eye,
  Share2, MessageSquare, Sparkles, BarChart3,
  ChevronDown, CheckCircle, AlertCircle
} from 'lucide-react';

// Mock data for demonstration
const mockReleases = [
  {
    id: '1',
    release_type: 'monthly_update',
    release_title: 'November 2024 Community Update',
    release_date: '2024-11-15',
    status: 'published',
    executive_summary: 'This month saw significant progress across youth programs and cultural preservation initiatives...',
    views: 245,
    shares: 18,
    story_count: 4,
  },
  {
    id: '2',
    release_type: 'quarterly_thematic',
    release_title: 'Q3 2024: Youth Development Spotlight',
    release_date: '2024-10-01',
    status: 'published',
    executive_summary: 'A deep dive into our youth development programs and their transformative impact...',
    views: 512,
    shares: 34,
    story_count: 8,
  },
  {
    id: '3',
    release_type: 'service_spotlight',
    release_title: 'Bwgcolman Healing Service: A Year of Growth',
    release_date: '2024-09-15',
    status: 'published',
    executive_summary: 'Celebrating the achievements and stories from our health service...',
    views: 389,
    shares: 22,
    story_count: 6,
  },
  {
    id: '4',
    release_type: 'monthly_update',
    release_title: 'December 2024 Community Update',
    release_date: '2024-12-01',
    status: 'draft',
    executive_summary: 'Draft: Year-end celebrations and looking ahead to 2025...',
    views: 0,
    shares: 0,
    story_count: 2,
  },
];

const mockConversations = [
  {
    id: '1',
    conversation_title: 'Community Listening Tour - Palm Island Central',
    conversation_type: 'listening_tour',
    session_date: '2024-11-10',
    status: 'analyzed',
    participant_count: 45,
    insights_count: 12,
  },
  {
    id: '2',
    conversation_title: 'Youth Services Feedback Session',
    conversation_type: 'service_feedback',
    session_date: '2024-11-05',
    status: 'transcribed',
    participant_count: 28,
    insights_count: 8,
  },
  {
    id: '3',
    conversation_title: 'Elder Wisdom Circle - November',
    conversation_type: 'elder_session',
    session_date: '2024-10-28',
    status: 'integrated',
    participant_count: 15,
    insights_count: 6,
  },
];

const mockSnapshots = [
  {
    id: '1',
    service_name: 'Bwgcolman Healing Service',
    snapshot_date: '2024-11-01',
    people_served: 450,
    change: '+12%',
  },
  {
    id: '2',
    service_name: 'Youth Services',
    snapshot_date: '2024-11-01',
    people_served: 180,
    change: '+8%',
  },
  {
    id: '3',
    service_name: 'Family Wellbeing',
    snapshot_date: '2024-11-01',
    people_served: 95,
    change: '+15%',
  },
];

const releaseTypeLabels: Record<string, string> = {
  monthly_update: 'Monthly Update',
  quarterly_thematic: 'Quarterly Theme',
  service_spotlight: 'Service Spotlight',
  community_milestone: 'Milestone',
  elder_wisdom: 'Elder Wisdom',
  data_snapshot: 'Data Snapshot',
};

const releaseTypeColors: Record<string, string> = {
  monthly_update: 'bg-blue-100 text-blue-700',
  quarterly_thematic: 'bg-purple-100 text-purple-700',
  service_spotlight: 'bg-amber-100 text-amber-700',
  community_milestone: 'bg-green-100 text-green-700',
  elder_wisdom: 'bg-indigo-100 text-indigo-700',
  data_snapshot: 'bg-gray-100 text-gray-700',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  review: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  published: 'bg-green-100 text-green-700',
};

const conversationStatusColors: Record<string, string> = {
  planned: 'bg-gray-100 text-gray-600',
  conducted: 'bg-blue-100 text-blue-700',
  transcribed: 'bg-yellow-100 text-yellow-700',
  analyzed: 'bg-purple-100 text-purple-700',
  integrated: 'bg-green-100 text-green-700',
};

export default function ContentHubPage() {
  const [activeTab, setActiveTab] = useState<'releases' | 'conversations' | 'data'>('releases');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const stats = {
    totalReleases: mockReleases.length,
    publishedReleases: mockReleases.filter(r => r.status === 'published').length,
    totalViews: mockReleases.reduce((sum, r) => sum + r.views, 0),
    totalConversations: mockConversations.length,
    totalInsights: mockConversations.reduce((sum, c) => sum + c.insights_count, 0),
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg">
            <Newspaper className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Content Hub</h1>
            <p className="text-gray-600">Living Ledger - Continuous community narrative ecosystem</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-sm">Releases</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalReleases}</div>
          <div className="text-xs text-green-600">{stats.publishedReleases} published</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Eye className="w-4 h-4" />
            <span className="text-sm">Total Views</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</div>
          <div className="text-xs text-gray-500">All time</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm">Conversations</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalConversations}</div>
          <div className="text-xs text-gray-500">This year</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">Insights</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalInsights}</div>
          <div className="text-xs text-gray-500">Extracted</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Engagement</span>
          </div>
          <div className="text-2xl font-bold text-green-600">+24%</div>
          <div className="text-xs text-gray-500">vs last quarter</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/picc/content-hub/releases/new"
          className="flex items-center gap-4 p-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-colors group"
        >
          <div className="p-2 bg-white/20 rounded-lg">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold">New Content Release</div>
            <div className="text-sm text-teal-100">Monthly, quarterly, or spotlight</div>
          </div>
          <ArrowRight className="w-5 h-5 ml-auto group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/picc/conversations/new"
          className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-colors group"
        >
          <div className="p-2 bg-white/20 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold">Schedule Conversation</div>
            <div className="text-sm text-indigo-100">Community listening session</div>
          </div>
          <ArrowRight className="w-5 h-5 ml-auto group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/picc/content-hub/data/new"
          className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-colors group"
        >
          <div className="p-2 bg-white/20 rounded-lg">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold">Add Data Snapshot</div>
            <div className="text-sm text-amber-100">Service metrics & KPIs</div>
          </div>
          <ArrowRight className="w-5 h-5 ml-auto group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('releases')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'releases'
                ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Content Releases
            </div>
          </button>
          <button
            onClick={() => setActiveTab('conversations')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'conversations'
                ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Community Conversations
            </div>
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'data'
                ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Data Snapshots
            </div>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="review">Under Review</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>
        </div>

        {/* Content Releases Tab */}
        {activeTab === 'releases' && (
          <div className="divide-y divide-gray-100">
            {mockReleases.map((release) => (
              <Link
                key={release.id}
                href={`/picc/content-hub/releases/${release.id}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${releaseTypeColors[release.release_type]}`}>
                      {releaseTypeLabels[release.release_type]}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusColors[release.status]}`}>
                      {release.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{release.release_title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">{release.executive_summary}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(release.release_date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {release.story_count} stories
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {release.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="w-3 h-3" />
                      {release.shares} shares
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </Link>
            ))}
          </div>
        )}

        {/* Community Conversations Tab */}
        {activeTab === 'conversations' && (
          <div className="divide-y divide-gray-100">
            {mockConversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/picc/conversations/${conversation.id}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-indigo-100 text-indigo-700 capitalize">
                      {conversation.conversation_type.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${conversationStatusColors[conversation.status]}`}>
                      {conversation.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{conversation.conversation_title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(conversation.session_date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {conversation.participant_count} participants
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {conversation.insights_count} insights
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </Link>
            ))}
            {mockConversations.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No community conversations yet</p>
                <Link
                  href="/picc/conversations/new"
                  className="inline-flex items-center gap-2 mt-4 text-teal-600 hover:text-teal-700"
                >
                  <Plus className="w-4 h-4" />
                  Schedule your first conversation
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Data Snapshots Tab */}
        {activeTab === 'data' && (
          <div className="p-4">
            <div className="grid md:grid-cols-3 gap-4">
              {mockSnapshots.map((snapshot) => (
                <div
                  key={snapshot.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-900">{snapshot.service_name}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(snapshot.snapshot_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">{snapshot.people_served}</div>
                      <div className="text-xs text-gray-500">People served</div>
                    </div>
                    <span className="px-2 py-1 text-sm font-medium text-green-700 bg-green-100 rounded">
                      {snapshot.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Data Collection Calendar</h4>
              <p className="text-sm text-gray-600 mb-4">
                Schedule regular data snapshots to track service performance over time.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Weekly: Every Monday
                </span>
                <span className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  Monthly: 1st of month
                </span>
                <span className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  Quarterly: Q1-Q4
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* We Heard You Preview */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">We Heard You</h3>
            <p className="text-sm text-gray-600">Community feedback and our responses</p>
          </div>
          <Link
            href="/picc/content-hub/we-heard-you"
            className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            View all feedback
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <MessageSquare className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 font-medium">&ldquo;We need more activities for youth on weekends&rdquo;</p>
                <p className="text-xs text-gray-500 mt-1">Raised by 12 community members</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Addressed
              </span>
            </div>
            <div className="mt-3 pl-11">
              <p className="text-sm text-gray-600">
                <strong>Our response:</strong> We launched Saturday Youth Hub activities in October 2024, now serving 45 young people weekly.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-full">
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 font-medium">&ldquo;More support for elders during hot months&rdquo;</p>
                <p className="text-xs text-gray-500 mt-1">Raised by 8 community members</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded flex items-center gap-1">
                <Clock className="w-3 h-3" />
                In Progress
              </span>
            </div>
            <div className="mt-3 pl-11">
              <p className="text-sm text-gray-600">
                <strong>Our response:</strong> Planning cool spaces program for summer 2024-25 with community hall access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
