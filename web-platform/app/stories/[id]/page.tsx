'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Heart, Calendar, User, MapPin, ArrowLeft, Share2, Image as ImageIcon, Video, Mic } from 'lucide-react';

interface Story {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  story_category: string;
  emotional_theme?: string;
  created_at: string;
  storyteller?: {
    full_name: string;
    preferred_name: string;
    bio?: string;
  };
}

export default function StoryDetailPage() {
  const params = useParams();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStory() {
      try {
        const supabase = createClient();

        const { data, error } = await supabase
          .from('stories')
          .select(`
            id,
            title,
            summary,
            content,
            story_category,
            emotional_theme,
            created_at,
            storyteller:storyteller_id (
              full_name,
              preferred_name,
              bio
            )
          `)
          .eq('id', params.id)
          .eq('is_public', true)
          .single();

        if (error) throw error;

        setStory(data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching story:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    if (params.id) {
      fetchStory();
    }
  }, [params.id]);

  const emotionColors: Record<string, { bg: string; text: string; accent: string }> = {
    hope_aspiration: { bg: 'bg-pink-50', text: 'text-pink-900', accent: 'bg-pink-500' },
    pride_accomplishment: { bg: 'bg-purple-50', text: 'text-purple-900', accent: 'bg-purple-500' },
    connection_belonging: { bg: 'bg-blue-50', text: 'text-blue-900', accent: 'bg-blue-500' },
    resilience: { bg: 'bg-green-50', text: 'text-green-900', accent: 'bg-green-500' },
    healing: { bg: 'bg-teal-50', text: 'text-teal-900', accent: 'bg-teal-500' },
    empowerment: { bg: 'bg-orange-50', text: 'text-orange-900', accent: 'bg-orange-500' },
    innovation: { bg: 'bg-indigo-50', text: 'text-indigo-900', accent: 'bg-indigo-500' },
  };

  const getEmotionLabel = (theme?: string) => {
    const labels: Record<string, string> = {
      hope_aspiration: 'Hope & Aspiration',
      pride_accomplishment: 'Pride & Achievement',
      connection_belonging: 'Connection & Belonging',
      resilience: 'Transformative Resilience',
      healing: 'Healing',
      empowerment: 'Empowerment',
      innovation: 'Innovation',
    };
    return theme ? labels[theme] || 'Community Spirit' : 'Community Spirit';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      mens_health: "Men's Health",
      womens_health: "Women's Health",
      elder_care: 'Elder Care',
      youth: 'Youth',
      community: 'Community',
      health: 'Health',
      culture: 'Culture',
      education: 'Education',
      housing: 'Housing',
      justice: 'Justice',
      environment: 'Environment',
      family_support: 'Family Support',
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading story...</p>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Story Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "We couldn't find the story you're looking for."}
          </p>
          <Link
            href="/stories"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all"
          >
            View All Stories
          </Link>
        </div>
      </div>
    );
  }

  const emotionTheme = story.emotional_theme || 'resilience';
  const colors = emotionColors[emotionTheme] || emotionColors.resilience;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/stories"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Stories
            </Link>
            <Link
              href="/"
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Home
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Image/Video Section */}
      <div className={`${colors.bg} py-16 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-teal-400/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className={`inline-block px-4 py-2 ${colors.accent} text-white rounded-full font-medium mb-4`}>
              {getEmotionLabel(story.emotional_theme)}
            </div>
            <h1 className={`text-4xl md:text-5xl font-bold ${colors.text} mb-4`}>
              {story.title}
            </h1>

            {story.summary && (
              <p className="text-xl text-gray-700 italic mb-6 leading-relaxed">
                "{story.summary}"
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-4 text-gray-600">
              <div className="flex items-center bg-white/80 px-4 py-2 rounded-lg">
                <User className="h-5 w-5 mr-2" />
                <span className="font-medium">
                  {story.storyteller?.preferred_name || story.storyteller?.full_name || 'Community Voice'}
                </span>
              </div>
              <div className="flex items-center bg-white/80 px-4 py-2 rounded-lg">
                <Calendar className="h-5 w-5 mr-2" />
                <span>{new Date(story.created_at).toLocaleDateString('en-AU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center bg-white/80 px-4 py-2 rounded-lg">
                <MapPin className="h-5 w-5 mr-2" />
                <span>Palm Island</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {getCategoryLabel(story.story_category)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Story Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Main Story Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 mb-8">
            {story.content ? (
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {story.content}
                </div>
              </div>
            ) : (
              <p className="text-gray-600 italic">Full story content coming soon...</p>
            )}

            {/* Media Placeholder - TODO: Add real media */}
            <div className="mt-8 grid md:grid-cols-2 gap-4">
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Photos coming soon</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Videos coming soon</p>
              </div>
            </div>
          </div>

          {/* Storyteller Bio */}
          {story.storyteller && (
            <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-center mb-4">
                <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                  {(story.storyteller.preferred_name || story.storyteller.full_name || 'C')[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {story.storyteller.preferred_name || story.storyteller.full_name}
                  </h3>
                  <p className="text-gray-600">Storyteller</p>
                </div>
              </div>
              {story.storyteller.bio && (
                <p className="text-gray-700 leading-relaxed">{story.storyteller.bio}</p>
              )}
            </div>
          )}

          {/* Share & Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Share This Story</h3>
            <p className="text-gray-600 mb-6">
              Help amplify community voices and celebrate Palm Island's resilience
            </p>
            <div className="flex justify-center gap-4">
              <button className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all">
                <Share2 className="h-5 w-5 mr-2" />
                Share Story
              </button>
              <Link
                href="/stories/submit"
                className="flex items-center bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-all"
              >
                <Heart className="h-5 w-5 mr-2" />
                Share Your Story
              </Link>
            </div>
          </div>

          {/* Related Stories CTA */}
          <div className="mt-8 text-center">
            <Link
              href="/stories"
              className="inline-block text-blue-600 hover:text-blue-800 font-medium text-lg"
            >
              ← Explore More Community Stories
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-medium mb-2">Palm Island Community Stories</p>
          <p className="text-sm text-gray-300 italic">
            Every story is owned by the community, protected by Indigenous data sovereignty
          </p>
          <p className="text-xs text-gray-400 mt-4">Manbarra & Bwgcolman Country</p>
        </div>
      </footer>
    </div>
  );
}
