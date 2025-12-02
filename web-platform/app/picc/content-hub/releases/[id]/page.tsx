'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  ArrowLeft, Calendar, Eye, Share2, FileText, Edit,
  Clock, Users, CheckCircle, AlertCircle, Sparkles
} from 'lucide-react';

interface ContentRelease {
  id: string;
  release_type: string;
  release_title: string;
  release_slug: string;
  release_date: string;
  status: string;
  executive_summary: string;
  community_context: string;
  impact_highlight: string;
  story_ids: string[];
  include_in_annual_report: boolean;
  annual_report_year: number;
  created_at: string;
}

export default function ReleaseDetailPage() {
  const params = useParams();
  const releaseId = params.id as string;

  const [release, setRelease] = useState<ContentRelease | null>(null);
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<any[]>([]);

  useEffect(() => {
    loadRelease();
  }, [releaseId]);

  const loadRelease = async () => {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('content_releases')
        .select('*')
        .eq('id', releaseId)
        .single();

      if (error) throw error;

      // Cast to ContentRelease type
      const releaseData = data as unknown as ContentRelease;
      setRelease(releaseData);

      // Load associated stories if any
      if (releaseData?.story_ids && releaseData.story_ids.length > 0) {
        const { data: storiesData } = await supabase
          .from('stories')
          .select('id, title, content, category, created_at')
          .in('id', releaseData.story_ids);

        setStories(storiesData || []);
      }
    } catch (error) {
      console.error('Error loading release:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-yellow-100 text-yellow-700';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getReleaseTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'monthly_update': 'Monthly Update',
      'quarterly_thematic': 'Quarterly Theme',
      'service_spotlight': 'Service Spotlight',
      'annual_report_section': 'Annual Report Section',
      'special_feature': 'Special Feature'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading release...</p>
        </div>
      </div>
    );
  }

  if (!release) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Release Not Found</h2>
          <p className="text-gray-600 mb-4">This content release doesn't exist or has been removed.</p>
          <Link
            href="/picc/content-hub"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Content Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Back Link */}
      <Link
        href="/picc/content-hub"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Content Hub
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                {getReleaseTypeLabel(release.release_type)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(release.status)}`}>
                {release.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{release.release_title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(release.release_date).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {stories.length} stories
              </span>
              {release.include_in_annual_report && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Included in {release.annual_report_year} Annual Report
                </span>
              )}
            </div>
          </div>
          <Link
            href={`/picc/content-hub/releases/${release.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
        </div>
      </div>

      {/* Content Sections */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Executive Summary */}
          {release.executive_summary && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Executive Summary
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{release.executive_summary}</p>
            </div>
          )}

          {/* Community Context */}
          {release.community_context && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Community Context
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{release.community_context}</p>
            </div>
          )}

          {/* Impact Highlight */}
          {release.impact_highlight && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Impact Highlight</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{release.impact_highlight}</p>
            </div>
          )}

          {/* Stories */}
          {stories.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Included Stories</h2>
              <div className="space-y-4">
                {stories.map((story) => (
                  <div key={story.id} className="border-l-4 border-purple-500 pl-4 py-2">
                    <h3 className="font-semibold text-gray-900">{story.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{story.content}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-gray-100 rounded">{story.category}</span>
                      <span>{new Date(story.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Release Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Created</span>
                <span className="font-medium">{new Date(release.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Release Date</span>
                <span className="font-medium">{new Date(release.release_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Stories</span>
                <span className="font-medium">{stories.length}</span>
              </div>
              {release.release_slug && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Slug</span>
                  <span className="font-mono text-xs">{release.release_slug}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">
              {release.status === 'draft' && (
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <CheckCircle className="w-4 h-4" />
                  Publish Release
                </button>
              )}
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
