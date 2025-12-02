'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Film,
  Search,
  Plus,
  Play,
  Pencil,
  Trash2,
  Youtube,
  ExternalLink,
  Star,
  Tag,
  Calendar,
  MapPin,
  Check,
  X
} from 'lucide-react';
import Link from 'next/link';

interface ExternalVideo {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  platform: 'youtube' | 'vimeo' | 'facebook' | 'tiktok' | 'other';
  video_id: string | null;
  thumbnail_url: string | null;
  category: string | null;
  tags: string[];
  event_name: string | null;
  event_date: string | null;
  location: string | null;
  is_featured: boolean;
  is_public: boolean;
  is_hero_eligible: boolean;
  view_count: number;
  use_count: number;
  created_at: string;
}

// Helper to extract video ID from URL
function extractVideoId(url: string): { platform: string; videoId: string | null } {
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s?]+)/);
  if (youtubeMatch) {
    return { platform: 'youtube', videoId: youtubeMatch[1] };
  }
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return { platform: 'vimeo', videoId: vimeoMatch[1] };
  }
  // Facebook
  if (url.includes('facebook.com') || url.includes('fb.watch')) {
    return { platform: 'facebook', videoId: null };
  }
  // TikTok
  if (url.includes('tiktok.com')) {
    return { platform: 'tiktok', videoId: null };
  }
  return { platform: 'other', videoId: null };
}

// Get thumbnail from video URL
function getThumbnailUrl(platform: string, videoId: string | null): string | null {
  if (platform === 'youtube' && videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return null;
}

export default function ExternalVideosPage() {
  const [videos, setVideos] = useState<ExternalVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<ExternalVideo | null>(null);
  const [tableExists, setTableExists] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    category: '',
    event_name: '',
    event_date: '',
    location: '',
    tags: '',
    is_featured: false,
    is_public: true,
    is_hero_eligible: false,
  });

  const categories = [
    'Community Events',
    'Elder Stories',
    'Health Services',
    'Youth Programs',
    'Safe Haven',
    'Employment & Training',
    'Innovation Projects',
    'Storm Recovery',
    'Cultural Programs',
    'Leadership',
    'Facilities',
    'Awards & Recognition'
  ];

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/external-videos');
      const result = await response.json();

      if (result.error) {
        console.error('Error loading videos:', result.error);
        return;
      }

      if (result.tableExists === false) {
        setTableExists(false);
        return;
      }

      setVideos(result.data || []);
      setTableExists(true);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { platform, videoId } = extractVideoId(formData.video_url);
    const thumbnail = getThumbnailUrl(platform, videoId);

    const videoData = {
      title: formData.title,
      description: formData.description || null,
      video_url: formData.video_url,
      platform,
      video_id: videoId,
      thumbnail_url: thumbnail,
      category: formData.category || null,
      event_name: formData.event_name || null,
      event_date: formData.event_date || null,
      location: formData.location || null,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      is_featured: formData.is_featured,
      is_public: formData.is_public,
      is_hero_eligible: formData.is_hero_eligible,
    };

    try {
      if (editingVideo) {
        const response = await fetch('/api/external-videos', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingVideo.id, ...videoData }),
        });
        const result = await response.json();
        if (result.error) throw new Error(result.error);
      } else {
        const response = await fetch('/api/external-videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(videoData),
        });
        const result = await response.json();
        if (result.error) throw new Error(result.error);
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        video_url: '',
        category: '',
        event_name: '',
        event_date: '',
        location: '',
        tags: '',
        is_featured: false,
        is_public: true,
        is_hero_eligible: false,
      });
      setShowAddForm(false);
      setEditingVideo(null);
      loadVideos();
    } catch (error: any) {
      console.error('Error saving video:', error);
      alert(`Failed to save video: ${error.message}`);
    }
  };

  const handleEdit = (video: ExternalVideo) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || '',
      video_url: video.video_url,
      category: video.category || '',
      event_name: video.event_name || '',
      event_date: video.event_date || '',
      location: video.location || '',
      tags: video.tags.join(', '),
      is_featured: video.is_featured,
      is_public: video.is_public,
      is_hero_eligible: video.is_hero_eligible,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const response = await fetch(`/api/external-videos?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      loadVideos();
    } catch (error: any) {
      console.error('Error deleting video:', error);
      alert(`Failed to delete video: ${error.message}`);
    }
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesCategory = filterCategory === 'all' || video.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return <Youtube className="w-5 h-5 text-red-600" />;
      default:
        return <Film className="w-5 h-5 text-purple-600" />;
    }
  };

  // Table doesn't exist - show setup instructions
  if (!tableExists && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/picc/media" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Media Library
          </Link>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Film className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">External Videos Table Not Found</h1>
            <p className="text-gray-600 mb-6">
              The external_videos table needs to be created in your Supabase database.
              Run the migration SQL to enable this feature.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
              <h3 className="font-medium text-gray-900 mb-2">To set up:</h3>
              <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                <li>Go to your Supabase Dashboard</li>
                <li>Open the SQL Editor</li>
                <li>Run the migration from: <code className="bg-gray-200 px-1 rounded">lib/empathy-ledger/media-repository.sql</code></li>
                <li>Refresh this page</li>
              </ol>
            </div>

            <Link
              href="https://supabase.com/dashboard"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open Supabase Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/picc/media" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Media Library
          </Link>

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Film className="h-8 w-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">External Videos</h1>
            </div>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingVideo(null);
                setFormData({
                  title: '',
                  description: '',
                  video_url: '',
                  category: '',
                  event_name: '',
                  event_date: '',
                  location: '',
                  tags: '',
                  is_featured: false,
                  is_public: true,
                  is_hero_eligible: false,
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Video Link
            </button>
          </div>
          <p className="text-gray-600">
            Manage YouTube, Vimeo, and other external video links for annual reports and website
          </p>
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingVideo ? 'Edit Video' : 'Add New Video Link'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingVideo(null);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Supports YouTube, Vimeo, Facebook, and TikTok</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Leaders Trip 2024: Building Connections"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this video shows..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    >
                      <option value="">Select category...</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Name
                    </label>
                    <input
                      type="text"
                      value={formData.event_name}
                      onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                      placeholder="e.g., Leaders Trip 2024"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Date
                    </label>
                    <input
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Palm Island"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="leadership, community, 2024 (comma separated)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                </div>

                {/* Checkboxes */}
                <div className="flex flex-wrap gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-4 h-4 text-[#1e3a5f] rounded focus:ring-[#1e3a5f]"
                    />
                    <span className="text-sm text-gray-700">Featured video</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_public}
                      onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                      className="w-4 h-4 text-[#1e3a5f] rounded focus:ring-[#1e3a5f]"
                    />
                    <span className="text-sm text-gray-700">Public</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_hero_eligible}
                      onChange={(e) => setFormData({ ...formData, is_hero_eligible: e.target.checked })}
                      className="w-4 h-4 text-[#1e3a5f] rounded focus:ring-[#1e3a5f]"
                    />
                    <span className="text-sm text-gray-700">Hero eligible</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingVideo(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors"
                  >
                    {editingVideo ? 'Update Video' : 'Add Video'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f]"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Total Videos</div>
            <div className="text-2xl font-bold text-gray-900">{videos.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Featured</div>
            <div className="text-2xl font-bold text-gray-900">
              {videos.filter(v => v.is_featured).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Hero Eligible</div>
            <div className="text-2xl font-bold text-gray-900">
              {videos.filter(v => v.is_hero_eligible).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Categories</div>
            <div className="text-2xl font-bold text-gray-900">
              {new Set(videos.map(v => v.category).filter(Boolean)).size}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading videos...</p>
          </div>
        )}

        {/* Videos Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div key={video.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-900 relative overflow-hidden">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1e3a5f] to-[#2d6a4f] flex items-center justify-center">
                      <Play className="w-16 h-16 text-white/50" />
                    </div>
                  )}

                  {/* Overlay with play button */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a
                      href={video.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/90 rounded-full p-4 hover:bg-white transition-colors"
                    >
                      <Play className="w-8 h-8 text-[#1e3a5f] fill-current" />
                    </a>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-2">
                    {getPlatformIcon(video.platform)}
                  </div>
                  {video.is_featured && (
                    <div className="absolute top-2 right-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {video.description}
                    </p>
                  )}

                  {/* Meta info */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {video.category && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        <Tag className="w-3 h-3" />
                        {video.category}
                      </span>
                    )}
                    {video.event_date && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        <Calendar className="w-3 h-3" />
                        {new Date(video.event_date).toLocaleDateString()}
                      </span>
                    )}
                    {video.location && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        <MapPin className="w-3 h-3" />
                        {video.location}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {video.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                      {video.tags.length > 3 && (
                        <span className="px-2 py-0.5 text-gray-400 text-xs">
                          +{video.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <a
                      href={video.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#2d4a6f] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Watch
                    </a>
                    <button
                      onClick={() => handleEdit(video)}
                      className="p-2 text-gray-600 hover:text-[#1e3a5f] hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredVideos.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Film className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No videos found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterCategory !== 'all'
                ? 'Try adjusting your search or filter'
                : 'Add your first video link to get started'}
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Video Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
