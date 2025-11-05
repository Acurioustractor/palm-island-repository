'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Camera, Mic, Heart, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SubmitStoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    story_category: 'community',
    emotional_theme: 'hope_aspiration',
    story_type: 'community_story'
  });

  const categories = [
    { value: 'community', label: 'Community' },
    { value: 'health', label: 'Health' },
    { value: 'mens_health', label: "Men's Health" },
    { value: 'womens_health', label: "Women's Health" },
    { value: 'elder_care', label: 'Elder Care' },
    { value: 'youth', label: 'Youth' },
    { value: 'culture', label: 'Culture' },
    { value: 'education', label: 'Education' },
    { value: 'housing', label: 'Housing' },
    { value: 'justice', label: 'Justice' },
    { value: 'environment', label: 'Environment' },
    { value: 'family_support', label: 'Family Support' }
  ];

  const emotions = [
    { value: 'hope_aspiration', label: 'Hope & Aspiration', color: 'pink' },
    { value: 'pride_accomplishment', label: 'Pride & Achievement', color: 'purple' },
    { value: 'connection_belonging', label: 'Connection & Belonging', color: 'blue' },
    { value: 'resilience', label: 'Transformative Resilience', color: 'green' },
    { value: 'healing', label: 'Healing', color: 'teal' },
    { value: 'empowerment', label: 'Empowerment', color: 'orange' },
    { value: 'innovation', label: 'Innovation', color: 'indigo' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // For now, use a placeholder profile ID
      // In production, this would come from authenticated user
      const { data: communityProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('full_name', 'Community Voice')
        .single();

      if (!communityProfile) {
        throw new Error('Could not find Community Voice profile');
      }

      const { error: insertError } = await supabase
        .from('stories')
        .insert({
          ...formData,
          storyteller_id: communityProfile.id,
          author_id: communityProfile.id,
          privacy_level: 'public',
          is_public: true,
          status: 'draft', // Start as draft
          published_at: null
        });

      if (insertError) throw insertError;

      setSubmitted(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err: any) {
      console.error('Error submitting story:', err);
      setError(err.message || 'Failed to submit story');
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-green-900 mb-4">
            Story Submitted!
          </h1>
          <p className="text-gray-700 mb-6">
            Your story has been saved as a draft and will be reviewed before publishing.
          </p>
          <p className="text-sm text-gray-600">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-2">
              <Heart className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-blue-900">
                Share Your Story
              </h1>
            </div>
            <p className="text-gray-600">
              Your voice matters. Share your experience, insight, or journey with the Palm Island community.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Story Title */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Story Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Give your story a meaningful title..."
            />
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Summary (1-2 sentences) *
            </label>
            <textarea
              required
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Briefly summarize your story in one or two sentences..."
            />
          </div>

          {/* Full Story */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Full Story *
            </label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Share your story in as much detail as you'd like..."
            />
            <p className="text-sm text-gray-500 mt-2">
              Write from the heart. Your authentic voice is what makes this story powerful.
            </p>
          </div>

          {/* Category */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Story Category *
            </label>
            <select
              required
              value={formData.story_category}
              onChange={(e) => setFormData({ ...formData, story_category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Emotional Theme */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              What emotion does this story capture? *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {emotions.map(emotion => (
                <button
                  key={emotion.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, emotional_theme: emotion.value })}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.emotional_theme === emotion.value
                      ? `border-${emotion.color}-500 bg-${emotion.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-800">{emotion.label}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {emotion.value === 'hope_aspiration' && 'Forward-looking, dreams, possibilities'}
                    {emotion.value === 'pride_accomplishment' && 'Success, achievement, excellence'}
                    {emotion.value === 'connection_belonging' && 'Community, family, home'}
                    {emotion.value === 'resilience' && 'Overcoming, transformation, strength'}
                    {emotion.value === 'healing' && 'Recovery, growth, wellness'}
                    {emotion.value === 'empowerment' && 'Agency, voice, leadership'}
                    {emotion.value === 'innovation' && 'Creativity, solutions, progress'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Future: Photo/Audio Upload */}
          <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
            <h3 className="font-bold text-gray-700 mb-2">Coming Soon</h3>
            <div className="flex gap-4">
              <div className="flex items-center text-gray-500">
                <Camera className="w-5 h-5 mr-2" />
                <span className="text-sm">Photo Upload</span>
              </div>
              <div className="flex items-center text-gray-500">
                <Mic className="w-5 h-5 mr-2" />
                <span className="text-sm">Audio Recording</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:transform-none"
            >
              {loading ? 'Submitting...' : 'Submit Story'}
            </button>
            <Link
              href="/dashboard"
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancel
            </Link>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>
              Your story will be saved as a draft and reviewed before publishing.
            </p>
            <p className="mt-1">
              All stories remain 100% community-owned and controlled.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
