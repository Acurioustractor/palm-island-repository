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
    { value: 'hope_aspiration', label: 'Hope & Aspiration', desc: 'Forward-looking, dreams, possibilities' },
    { value: 'pride_accomplishment', label: 'Pride & Achievement', desc: 'Success, achievement, excellence' },
    { value: 'connection_belonging', label: 'Connection & Belonging', desc: 'Community, family, home' },
    { value: 'resilience', label: 'Transformative Resilience', desc: 'Overcoming, transformation, strength' },
    { value: 'healing', label: 'Healing', desc: 'Recovery, growth, wellness' },
    { value: 'empowerment', label: 'Empowerment', desc: 'Agency, voice, leadership' },
    { value: 'innovation', label: 'Innovation', desc: 'Creativity, solutions, progress' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

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
          storyteller_id: communityProfile.id,
          collected_by: communityProfile.id,
          title: formData.title,
          content: formData.content,
          excerpt: formData.summary,
          category: formData.story_category,
          story_type: formData.story_type,
          access_level: 'public',
          is_public: false,
          status: 'submitted',
          contains_traditional_knowledge: false,
          cultural_sensitivity_level: 'low',
          tags: ['community-submission'],
          metadata: {
            emotional_theme: formData.emotional_theme,
            submission_source: 'public_form',
            submitted_at: new Date().toISOString(),
          },
        });

      if (insertError) throw insertError;

      setSubmitted(true);
      setTimeout(() => {
        router.push('/stories');
      }, 2000);

    } catch (err: any) {
      console.error('Error submitting story:', err);
      setError(err.message || 'Failed to submit story');
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-gray-900 mx-auto mb-6" />
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-[-0.02em] mb-4">
            Story Submitted
          </h1>
          <p className="text-gray-500 mb-6 leading-relaxed">
            Your story has been saved as a draft and will be reviewed before publishing.
          </p>
          <p className="text-sm text-gray-400">
            Redirecting to stories...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Editorial Hero */}
      <section className="py-12 md:py-16 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <Link
            href="/stories"
            className="animated-underline inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 text-sm font-medium transition-colors duration-300 mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Stories
          </Link>

          <span className="block text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
            Your Voice
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-[-0.02em] leading-[1.1] mt-4 mb-4">
            Share Your Story
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Your voice matters. Share your experience, insight, or journey with the Palm Island community.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 px-5 py-4 rounded-2xl text-sm">
                {error}
              </div>
            )}

            {/* Story Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-gray-400 mb-2">
                Story Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-300 ease-elegant text-lg"
                placeholder="Give your story a meaningful title..."
              />
            </div>

            {/* Summary */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-gray-400 mb-2">
                Summary (1-2 sentences) *
              </label>
              <textarea
                required
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-300 ease-elegant"
                placeholder="Briefly summarize your story in one or two sentences..."
              />
            </div>

            {/* Full Story */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-gray-400 mb-2">
                Your Full Story *
              </label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-300 ease-elegant"
                placeholder="Share your story in as much detail as you'd like..."
              />
              <p className="text-sm text-gray-400 mt-2">
                Write from the heart. Your authentic voice is what makes this story powerful.
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-gray-400 mb-2">
                Story Category *
              </label>
              <select
                required
                value={formData.story_category}
                onChange={(e) => setFormData({ ...formData, story_category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-300 ease-elegant"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Emotional Theme */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-gray-400 mb-4">
                What emotion does this story capture? *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {emotions.map(emotion => (
                  <button
                    key={emotion.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, emotional_theme: emotion.value })}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 ease-elegant text-left ${
                      formData.emotional_theme === emotion.value
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 text-sm">{emotion.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{emotion.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Future: Photo/Audio Upload */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-dashed border-gray-200">
              <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400 mb-3">More Ways to Share</h3>
              <div className="flex gap-6">
                <div className="flex items-center text-gray-400">
                  <Camera className="w-4 h-4 mr-2" />
                  <span className="text-sm">Photo Upload</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Mic className="w-4 h-4 mr-2" />
                  <span className="text-sm">Audio Recording</span>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 ease-elegant hover:scale-[0.98] active:scale-95 disabled:hover:scale-100"
              >
                {loading ? 'Submitting...' : 'Submit Story'}
              </button>
              <Link
                href="/stories"
                className="px-8 py-4 border border-gray-200 text-gray-600 font-semibold rounded-full hover:border-gray-900 hover:text-gray-900 transition-all duration-300 ease-elegant"
              >
                Cancel
              </Link>
            </div>

            <div className="text-center text-sm text-gray-400">
              <p>Your story will be saved as a draft and reviewed before publishing.</p>
              <p className="mt-1">All stories remain 100% community-owned and controlled.</p>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
