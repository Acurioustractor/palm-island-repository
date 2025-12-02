'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  ArrowLeft, Save, X, Calendar, FileText, Sparkles,
  Plus, Trash2
} from 'lucide-react';

interface Story {
  id: string;
  title: string;
  category: string;
}

export default function NewReleasePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStories, setSelectedStories] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    release_type: 'monthly_update',
    release_title: '',
    release_slug: '',
    release_date: new Date().toISOString().split('T')[0],
    status: 'draft',
    executive_summary: '',
    community_context: '',
    impact_highlight: '',
    include_in_annual_report: false,
    annual_report_year: new Date().getFullYear()
  });

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('stories')
      .select('id, title, category')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(50);

    setStories(data || []);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      release_title: title,
      release_slug: generateSlug(title)
    });
  };

  const toggleStory = (storyId: string) => {
    setSelectedStories(prev =>
      prev.includes(storyId)
        ? prev.filter(id => id !== storyId)
        : [...prev, storyId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const supabase = createClient();

      const { data, error } = await (supabase
        .from('content_releases') as any)
        .insert({
          ...formData,
          story_ids: selectedStories,
          tenant_id: process.env.NEXT_PUBLIC_TENANT_ID,
          organization_id: process.env.NEXT_PUBLIC_ORGANIZATION_ID
        })
        .select()
        .single();

      if (error) throw error;

      alert('Release created successfully!');
      router.push(`/picc/content-hub/releases/${data.id}`);
    } catch (error: any) {
      console.error('Error creating release:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        href="/picc/content-hub"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Content Hub
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Create Content Release</h1>
        </div>
        <p className="text-gray-600">
          Create a new content release to share stories and updates with your community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Release Details</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Release Type *
              </label>
              <select
                required
                value={formData.release_type}
                onChange={(e) => setFormData({ ...formData, release_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="monthly_update">Monthly Update</option>
                <option value="quarterly_thematic">Quarterly Theme</option>
                <option value="service_spotlight">Service Spotlight</option>
                <option value="special_feature">Special Feature</option>
                <option value="annual_report_section">Annual Report Section</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Release Date *
              </label>
              <input
                type="date"
                required
                value={formData.release_date}
                onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Release Title *
            </label>
            <input
              type="text"
              required
              value={formData.release_title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., November 2024 Community Update"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Slug
            </label>
            <input
              type="text"
              value={formData.release_slug}
              onChange={(e) => setFormData({ ...formData, release_slug: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              placeholder="auto-generated-from-title"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.include_in_annual_report}
                  onChange={(e) => setFormData({ ...formData, include_in_annual_report: e.target.checked })}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Include in Annual Report</span>
              </label>
              {formData.include_in_annual_report && (
                <input
                  type="number"
                  value={formData.annual_report_year}
                  onChange={(e) => setFormData({ ...formData, annual_report_year: parseInt(e.target.value) })}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Content</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Executive Summary
            </label>
            <textarea
              value={formData.executive_summary}
              onChange={(e) => setFormData({ ...formData, executive_summary: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Brief overview of this release..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Community Context
            </label>
            <textarea
              value={formData.community_context}
              onChange={(e) => setFormData({ ...formData, community_context: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Background context for this release..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Impact Highlight
            </label>
            <textarea
              value={formData.impact_highlight}
              onChange={(e) => setFormData({ ...formData, impact_highlight: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Key impact or achievement to highlight..."
            />
          </div>
        </div>

        {/* Story Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Select Stories ({selectedStories.length} selected)
          </h2>

          {stories.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No published stories available</p>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {stories.map((story) => (
                <label
                  key={story.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedStories.includes(story.id)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedStories.includes(story.id)}
                    onChange={() => toggleStory(story.id)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{story.title}</p>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {story.category}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <Link
            href="/picc/content-hub"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Release
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
