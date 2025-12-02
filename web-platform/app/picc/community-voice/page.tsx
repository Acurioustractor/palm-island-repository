'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Mic, MessageSquare, Search, Filter, Eye, Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface CommunityStory {
  id: string;
  title: string;
  content: string;
  story_type: string;
  status: string;
  privacy_level: string;
  created_at: string;
  is_anonymous: boolean;
  storyteller_id?: string;
  storyteller_name?: string;
}

export default function CommunityVoicePage() {
  const [stories, setStories] = useState<CommunityStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadCommunityStories();
  }, []);

  const loadCommunityStories = async () => {
    try {
      const supabase = createClient();

      // Load stories where storyteller is "Community Voice" or stories marked as community submissions
      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          title,
          content,
          story_type,
          status,
          privacy_level,
          created_at,
          storyteller_id,
          profiles:storyteller_id (
            full_name,
            preferred_name
          )
        `)
        .or('privacy_level.eq.community,storyteller_id.is.null')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedStories = (data || []).map((story: any) => ({
        id: story.id,
        title: story.title,
        content: story.content,
        story_type: story.story_type,
        status: story.status,
        privacy_level: story.privacy_level,
        created_at: story.created_at,
        is_anonymous: !story.storyteller_id || story.profiles?.full_name === 'Community Voice',
        storyteller_id: story.storyteller_id,
        storyteller_name: story.profiles?.preferred_name || story.profiles?.full_name || 'Anonymous'
      }));

      setStories(formattedStories);
    } catch (error) {
      console.error('Error loading community stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStoryStatus = async (storyId: string, newStatus: string) => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('stories')
        .update({ status: newStatus })
        .eq('id', storyId);

      if (error) throw error;

      alert(`Story ${newStatus} successfully`);
      loadCommunityStories();
    } catch (error: any) {
      console.error('Error updating story:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const deleteStory = async (storyId: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId);

      if (error) throw error;

      alert('Story deleted');
      loadCommunityStories();
    } catch (error: any) {
      console.error('Error deleting story:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || story.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: stories.length,
    pending: stories.filter(s => s.status === 'pending_review' || s.status === 'draft').length,
    published: stories.filter(s => s.status === 'published').length,
    anonymous: stories.filter(s => s.is_anonymous).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading community stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Mic className="w-8 h-8 text-teal-600" />
          <h1 className="text-3xl font-bold text-gray-900">Community Voice</h1>
        </div>
        <p className="text-gray-600 mb-4">
          Stories shared by community members - review and publish community submissions
        </p>

        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <p className="text-sm text-teal-800">
            <strong>Note:</strong> Community Voice includes stories submitted anonymously or by community members.
            Review these stories and publish them to share community perspectives.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Stories</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending Review</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          <div className="text-sm text-gray-600">Published</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">{stats.anonymous}</div>
          <div className="text-sm text-gray-600">Anonymous</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending_review">Pending Review</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Stories List */}
      {filteredStories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No community stories found</h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Community submissions will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredStories.map((story) => (
            <div
              key={story.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{story.title}</h3>

                    {story.is_anonymous && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                        Anonymous
                      </span>
                    )}

                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      story.status === 'published' ? 'bg-green-100 text-green-700' :
                      story.status === 'pending_review' ? 'bg-yellow-100 text-yellow-700' :
                      story.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {story.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span>By: {story.storyteller_name}</span>
                    <span>Type: {story.story_type.replace('_', ' ')}</span>
                    <span>{new Date(story.created_at).toLocaleDateString()}</span>
                  </div>

                  <p className="text-sm text-gray-700 line-clamp-3">
                    {story.content.substring(0, 300)}...
                  </p>
                </div>

                <button
                  onClick={() => deleteStory(story.id)}
                  className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                  title="Delete story"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <Link
                  href={`/stories/${story.id}`}
                  target="_blank"
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-sm"
                >
                  <Eye className="w-4 h-4" />
                  View Full Story
                </Link>

                {story.status === 'pending_review' && (
                  <>
                    <button
                      onClick={() => updateStoryStatus(story.id, 'published')}
                      className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve & Publish
                    </button>

                    <button
                      onClick={() => updateStoryStatus(story.id, 'draft')}
                      className="flex items-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100 transition-colors text-sm"
                    >
                      <Clock className="w-4 h-4" />
                      Move to Draft
                    </button>
                  </>
                )}

                {story.status === 'published' && (
                  <button
                    onClick={() => updateStoryStatus(story.id, 'archived')}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors text-sm"
                  >
                    <XCircle className="w-4 h-4" />
                    Archive
                  </button>
                )}

                {story.status === 'draft' && (
                  <button
                    onClick={() => updateStoryStatus(story.id, 'published')}
                    className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors text-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Publish
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Public Submission Link Info */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-bold text-blue-900 mb-2">Community Submission Form</h3>
        <p className="text-sm text-blue-800 mb-3">
          Community members can submit stories via the public form:
        </p>
        <div className="flex items-center gap-3">
          <code className="flex-1 px-4 py-2 bg-white border border-blue-300 rounded text-sm">
            {typeof window !== 'undefined' ? window.location.origin : ''}/share-voice
          </code>
          <Link
            href="/share-voice"
            target="_blank"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Open Form
          </Link>
        </div>
      </div>
    </div>
  );
}
