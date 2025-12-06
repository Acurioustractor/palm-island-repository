'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Calendar, User, MapPin, ArrowLeft, Share2, BookOpen,
  Heart, MessageCircle, Eye
} from 'lucide-react';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';
import StoryInfobox from '@/components/wiki/StoryInfobox';
import RelatedContent from '@/components/wiki/RelatedContent';
import TableOfContents from '@/components/wiki/TableOfContents';
import RelatedContentSidebar from '@/components/stories/RelatedContentSidebar';

interface Story {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  category?: string;
  emotional_theme?: string;
  created_at: string;
  story_date?: string;
  location?: string;
  people_affected?: number;
  cultural_sensitivity_level?: string;
  access_level: string;
  elder_approval_given?: boolean;
  views?: number;
  shares?: number;
  storyteller?: {
    id: string;
    full_name: string;
    preferred_name: string;
    profile_image_url?: string;
  };
  organization?: {
    id: string;
    name: string;
    short_name: string;
  };
  service?: {
    id: string;
    name: string;
    service_color?: string;
  };
  story_media?: Array<{
    id: string;
    media_type: string;
    file_path: string;
    supabase_bucket: string;
    caption?: string;
  }>;
}

export default function StoryDetailPage() {
  const params = useParams();
  const [story, setStory] = useState<Story | null>(null);
  const [relatedStories, setRelatedStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStory() {
      try {
        const supabase = createClient();

        // Fetch story with all related data
        const { data, error } = await supabase
          .from('stories')
          .select(`
            *,
            storyteller:storyteller_id (
              id,
              full_name,
              preferred_name,
              profile_image_url
            ),
            organization:organization_id (
              id,
              name,
              short_name
            ),
            service:service_id (
              id,
              name,
              service_color
            ),
            story_media (
              id,
              media_type,
              file_path,
              supabase_bucket,
              caption
            )
          `)
          .eq('id', params.id)
          .single();

        if (error) throw error;

        setStory(data);

        // Fetch related stories (same category)
        if (data.category) {
          const { data: related } = await supabase
            .from('stories')
            .select(`
              id,
              title,
              summary,
              created_at,
              storyteller:storyteller_id (
                preferred_name,
                full_name
              )
            `)
            .eq('category', data.category)
            .neq('id', params.id)
            .eq('is_public', true)
            .limit(6);

          if (related) {
            setRelatedStories(
              related.map((s: any) => ({
                id: s.id,
                title: s.title,
                type: 'story',
                href: `/stories/${s.id}`,
                description: s.summary,
                metadata: {
                  date: s.created_at,
                  author: s.storyteller?.preferred_name || s.storyteller?.full_name,
                },
              }))
            );
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching story:', error);
        setLoading(false);
      }
    }

    fetchStory();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Story not found</h1>
          <Link href="/stories" className="text-blue-600 hover:text-blue-800">
            ← Back to Stories
          </Link>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Stories', href: '/stories', icon: BookOpen },
    { label: getCategoryLabel(story.category || ''), href: `/wiki/categories/${story.category}` },
    { label: story.title, href: `/stories/${story.id}` },
  ];

  const infoboxData = {
    storyteller: story.storyteller,
    date_shared: story.created_at,
    story_date: story.story_date,
    location: story.location,
    categories: story.category ? [getCategoryLabel(story.category)] : [],
    services: story.service ? [story.service] : [],
    people_affected: story.people_affected,
    views: story.views || 0,
    shares: story.shares || 0,
    cultural_sensitivity: story.cultural_sensitivity_level as any,
    access_level: story.access_level as any,
    elder_approved: story.elder_approval_given,
    media_count: {
      photos: story.story_media?.filter(m => m.media_type === 'photo').length || 0,
      videos: story.story_media?.filter(m => m.media_type === 'video').length || 0,
      audio: story.story_media?.filter(m => m.media_type === 'audio').length || 0,
    },
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      {/* Back button */}
      <Link
        href="/stories"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Stories
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {story.title}
            </h1>

            {story.summary && (
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {story.summary}
              </p>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pb-6 border-b border-gray-200">
              {story.storyteller && (
                <Link
                  href={`/wiki/people/${story.storyteller.id}`}
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                >
                  <User className="h-4 w-4" />
                  {story.storyteller.preferred_name || story.storyteller.full_name}
                </Link>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(story.created_at).toLocaleDateString('en-AU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
              {story.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {story.location}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {story.views || 0} views
              </div>
            </div>
          </div>

          {/* Media Gallery */}
          {story.story_media && story.story_media.length > 0 && (
            <div className="space-y-4">
              <h2 id="media" className="text-2xl font-bold text-gray-900">Media</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {story.story_media
                  .filter(m => m.media_type === 'photo')
                  .map((media) => (
                    <div key={media.id} className="relative rounded-lg overflow-hidden">
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${media.supabase_bucket}/${media.file_path}`}
                        alt={media.caption || story.title}
                        className="w-full h-64 object-cover"
                      />
                      {media.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <p className="text-white text-sm">{media.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Story Content */}
          <div className="prose prose-lg max-w-none">
            <h2 id="story">The Story</h2>
            <div className="whitespace-pre-wrap leading-relaxed text-gray-800">
              {story.content}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Heart className="h-4 w-4" />
              Like
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Share2 className="h-4 w-4" />
              Share
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <MessageCircle className="h-4 w-4" />
              Comment
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <StoryInfobox data={infoboxData} />

          {relatedStories.length > 0 && (
            <RelatedContent
              items={relatedStories}
              title="Related Stories"
              maxItems={5}
            />
          )}

          {/* AI-powered related content */}
          <RelatedContentSidebar
            contentId={story.id}
            contentType="story"
          />

          <TableOfContents sticky />
        </aside>
      </div>
    </div>
  );
}

function getCategoryLabel(category: string): string {
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
    economic_development: 'Economic Development',
  };
  return labels[category] || category;
}
