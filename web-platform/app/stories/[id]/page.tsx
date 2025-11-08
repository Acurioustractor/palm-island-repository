'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Heart, Calendar, User, MapPin, ArrowLeft, Share2, BookOpen, Crown, Mic } from 'lucide-react';

interface Story {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  story_category: string;
  emotional_theme?: string;
  created_at: string;
  audio_url?: string;
  cultural_context?: string;
  storyteller?: {
    id: string;
    full_name: string;
    preferred_name: string;
    bio?: string;
    profile_image_url?: string;
    is_elder?: boolean;
    traditional_country?: string;
  };
  story_media?: Array<{
    id: string;
    media_type: string;
    file_path: string;
  }>;
}

export default function StoryDetailPage() {
  const params = useParams();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);

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
            audio_url,
            cultural_context,
            storyteller:storyteller_id (
              id,
              full_name,
              preferred_name,
              bio,
              profile_image_url,
              is_elder,
              traditional_country
            ),
            story_media (
              id,
              media_type,
              file_path
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

  // Reading progress tracker
  useEffect(() => {
    const updateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

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

  const estimateReadingTime = (content?: string) => {
    if (!content) return 1;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200); // Average reading speed
    return minutes;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Listening to community voices...</p>
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
            className="btn-primary"
          >
            View All Stories
          </Link>
        </div>
      </div>
    );
  }

  const heroImage = story.story_media?.find(m => m.media_type === 'image')?.file_path;
  const readingTime = estimateReadingTime(story.content);

  return (
    <>
      {/* Skip to Content Link */}
      <a href="#story-content" className="skip-to-content">
        Skip to story content
      </a>

      {/* Reading Progress Indicator */}
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-palm-600 z-50 transition-all duration-150"
        style={{ width: `${readingProgress}%` }}
        role="progressbar"
        aria-valuenow={readingProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
        {/* Immersive Hero Section */}
        <div className="relative h-[70vh] -mt-0 mb-16">
          {/* Hero Image with Gradient Overlay */}
          {heroImage ? (
            <div className="absolute inset-0">
              <img
                src={heroImage}
                className="w-full h-full object-cover"
                alt=""
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-palm-800 via-palm-700 to-palm-600">
              <div className="absolute inset-0 opacity-10"
                   style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)' }} />
            </div>
          )}

          {/* Content over hero */}
          <div className="absolute inset-0 flex items-end">
            <div className="container mx-auto px-4 pb-12">
              <div className="max-w-4xl mx-auto">
                {/* Back button */}
                <Link
                  href="/stories"
                  className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-6 group"
                >
                  <ArrowLeft className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
                  Back to Stories
                </Link>

                {/* Category badge */}
                <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm
                               rounded-full text-sm font-medium mb-4 text-white">
                  {getCategoryLabel(story.story_category)}
                </span>

                {/* Title */}
                <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg text-white animate-fade-in">
                  {story.title}
                </h1>

                {/* Byline */}
                <div className="flex flex-wrap items-center gap-4 text-lg text-white/90">
                  <div className="flex items-center">
                    {story.storyteller?.profile_image_url ? (
                      <img
                        src={story.storyteller.profile_image_url}
                        className="w-12 h-12 rounded-full border-2 border-white mr-3"
                        alt=""
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full border-2 border-white bg-palm-600 flex items-center justify-center text-white font-bold mr-3">
                        {(story.storyteller?.preferred_name || story.storyteller?.full_name || 'C')[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {story.storyteller?.preferred_name || story.storyteller?.full_name || 'Community Voice'}
                        {story.storyteller?.is_elder && (
                          <span className="inline-flex items-center px-2 py-1 bg-palm-800 text-white rounded-full text-xs">
                            <Crown className="w-3 h-3 mr-1" />
                            Elder
                          </span>
                        )}
                      </p>
                      <p className="text-white/70 text-sm">
                        {new Date(story.created_at).toLocaleDateString('en-AU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })} · {readingTime} min read
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Story Content */}
        <article className="container mx-auto px-4 pb-16" id="story-content">
          <div className="max-w-4xl mx-auto">
            {/* Audio Player for Elder Stories */}
            {story.audio_url && story.storyteller?.is_elder && (
              <div className="mb-12 bg-palm-50 border-2 border-palm-200 rounded-xl p-6 animate-fade-in">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Mic className="w-8 h-8 text-palm-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-palm-900 mb-2">
                      Listen to this story in {story.storyteller.preferred_name || story.storyteller.full_name}'s voice
                    </h3>
                    <p className="text-sm text-palm-700 mb-3">
                      Hear the story told with the wisdom and warmth of an Elder's voice.
                    </p>
                    <audio
                      controls
                      className="w-full"
                      style={{ maxWidth: '500px' }}
                    >
                      <source src={story.audio_url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              </div>
            )}

            {/* Main Story Content */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 mb-8 animate-fade-in">
              {story.summary && (
                <blockquote className="text-2xl text-gray-700 italic border-l-4 border-palm-600 pl-6 mb-8 leading-relaxed font-serif">
                  "{story.summary}"
                </blockquote>
              )}

              {story.content ? (
                <div className="prose prose-lg prose-palm max-w-none">
                  <div className="text-gray-800 leading-relaxed whitespace-pre-wrap" style={{ fontSize: '1.125rem', lineHeight: '1.8' }}>
                    {story.content}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 italic">Full story content coming soon...</p>
              )}
            </div>

            {/* Cultural Context Callout */}
            {story.cultural_context && (
              <div className="mb-12 bg-gradient-to-br from-palm-800 to-palm-700 text-white rounded-xl p-8 animate-fade-in">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <BookOpen className="w-6 h-6 mr-3" />
                  Cultural Context
                </h3>
                <p className="text-lg leading-relaxed opacity-95">
                  {story.cultural_context}
                </p>
              </div>
            )}

            {/* Storyteller Bio Card */}
            {story.storyteller && (
              <div className="mb-12 border-t-2 border-gray-200 pt-12 animate-fade-in">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  {story.storyteller.profile_image_url ? (
                    <img
                      src={story.storyteller.profile_image_url}
                      className="w-24 h-24 rounded-full border-4 border-palm-200 flex-shrink-0"
                      alt=""
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full border-4 border-palm-200 bg-gradient-to-br from-palm-500 to-palm-700 flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
                      {(story.storyteller.preferred_name || story.storyteller.full_name)[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                      About {story.storyteller.preferred_name || story.storyteller.full_name}
                      {story.storyteller.is_elder && (
                        <span className="inline-flex items-center px-3 py-1 bg-palm-800 text-white rounded-full text-sm font-medium">
                          <Crown className="w-4 h-4 mr-1" />
                          Elder
                        </span>
                      )}
                    </h3>
                    {story.storyteller.traditional_country && (
                      <p className="text-palm-700 font-medium mb-3">
                        {story.storyteller.traditional_country}
                      </p>
                    )}
                    {story.storyteller.bio && (
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {story.storyteller.bio}
                      </p>
                    )}
                    <Link
                      href={`/storytellers/${story.storyteller.id}`}
                      className="text-palm-600 hover:text-palm-700 font-medium inline-flex items-center group"
                    >
                      View all stories by {story.storyteller.preferred_name || story.storyteller.full_name}
                      <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Related Stories Section - Placeholder */}
            <div className="mb-12 bg-gradient-to-r from-palm-50 to-palm-100 rounded-xl p-8 border-2 border-palm-200">
              <h3 className="text-2xl font-bold text-palm-900 mb-4">More from this storyteller</h3>
              <p className="text-gray-700 mb-4">Discover more stories from our community voices.</p>
              <Link
                href={`/storytellers/${story.storyteller?.id || ''}`}
                className="btn-primary inline-block"
              >
                View More Stories
              </Link>
            </div>

            {/* Share Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center border-2 border-gray-100">
              <Heart className="w-12 h-12 text-palm-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Share This Story</h3>
              <p className="text-gray-600 mb-6">
                Help amplify community voices and celebrate Palm Island's resilience
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button className="btn-primary flex items-center">
                  <Share2 className="h-5 w-5 mr-2" />
                  Share Story
                </button>
                <Link
                  href="/stories/submit"
                  className="btn-secondary inline-flex items-center"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Share Your Story
                </Link>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-12 text-center">
              <Link
                href="/stories"
                className="text-palm-600 hover:text-palm-700 font-medium text-lg inline-flex items-center group"
              >
                <span className="transition-transform group-hover:-translate-x-1">←</span>
                <span className="ml-2">Explore More Community Stories</span>
              </Link>
            </div>
          </div>
        </article>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-palm-800 to-palm-700 text-white py-12 mt-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xl font-medium mb-2">Palm Island Community Stories</p>
            <p className="text-sm text-white/80 italic mb-4">
              Every story is owned by the community, protected by Indigenous data sovereignty
            </p>
            <p className="text-xs text-white/60">Manbarra & Bwgcolman Country</p>
          </div>
        </footer>
      </div>
    </>
  );
}
