'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Calendar, User, MapPin, ArrowLeft, Share2, BookOpen,
  Heart, MessageCircle, Eye, Play
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ScrollReveal } from '@/components/story-scroll/ScrollReveal';
import { getEmbedUrl, isDirectVideoFile, guessVideoMimeType } from '@/components/story-scroll/videoEmbed';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';
import StoryInfobox from '@/components/wiki/StoryInfobox';
import RelatedContent from '@/components/wiki/RelatedContent';
import TableOfContents from '@/components/wiki/TableOfContents';

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
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg text-gray-500">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Story not found</h1>
          <Link href="/stories" className="animated-underline text-gray-500 hover:text-gray-900 transition-colors duration-300">
            &larr; Back to Stories
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
    storyteller: story.storyteller ? {
      id: story.storyteller.id,
      name: story.storyteller.full_name,
      preferred_name: story.storyteller.preferred_name,
      profile_image_url: story.storyteller.profile_image_url,
    } : undefined,
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

  // Separate media by type
  const photos = story.story_media?.filter(m => m.media_type === 'photo') || [];
  const videos = story.story_media?.filter(m => m.media_type === 'video') || [];
  const featuredPhoto = photos[0];
  const galleryPhotos = photos.slice(featuredPhoto ? 1 : 0);

  const getMediaUrl = (media: { supabase_bucket: string; file_path: string }) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${media.supabase_bucket}/${media.file_path}`;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section — full-width with featured image */}
      {featuredPhoto ? (
        <StoryHero
          title={story.title}
          category={getCategoryLabel(story.category || '')}
          imageUrl={getMediaUrl(featuredPhoto)}
          storyteller={story.storyteller}
          date={story.created_at}
        />
      ) : (
        /* Minimal hero without image */
        <div className="bg-white pt-8 pb-4">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <Breadcrumbs items={breadcrumbs} className="mb-6" />
            <Link
              href="/stories"
              className="animated-underline inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors duration-300 mb-10"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Stories
            </Link>
          </div>
        </div>
      )}

      {/* Story Header — below hero */}
      <ScrollReveal>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-10 pb-10">
          {!featuredPhoto && (
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-[-0.02em] leading-[1.1] mb-5">
                {story.title}
              </h1>
            </div>
          )}

          {featuredPhoto && (
            <div className="max-w-7xl">
              <Breadcrumbs items={breadcrumbs} className="mb-6" />
              <Link
                href="/stories"
                className="animated-underline inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors duration-300"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Stories
              </Link>
            </div>
          )}

          {/* Pull Quote — summary as editorial quote */}
          {story.summary && (
            <div className="max-w-3xl mt-8">
              <blockquote className="relative pl-6 border-l-4 border-gray-900">
                <p className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-[-0.02em] leading-[1.2] italic">
                  &ldquo;{story.summary}&rdquo;
                </p>
              </blockquote>
            </div>
          )}

          {/* Meta info */}
          <div className="max-w-3xl mt-8">
            <div className="flex flex-wrap items-center gap-5 text-sm text-gray-400 pb-8 border-b border-gray-100">
              {story.storyteller && (
                <Link
                  href={`/wiki/people/${story.storyteller.id}`}
                  className="animated-underline flex items-center gap-2 hover:text-gray-900 transition-colors duration-300"
                >
                  <User className="h-3.5 w-3.5" />
                  {story.storyteller.preferred_name || story.storyteller.full_name}
                </Link>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(story.created_at).toLocaleDateString('en-AU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
              {story.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  {story.location}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Eye className="h-3.5 w-3.5" />
                {story.views || 0} views
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Photo Gallery */}
            {galleryPhotos.length > 0 && (
              <ScrollReveal>
                <div className="space-y-4">
                  <div className={`grid gap-4 ${galleryPhotos.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                    {galleryPhotos.map((media, index) => (
                      <ScrollReveal key={media.id} delay={index * 0.1}>
                        <div className="relative rounded-2xl overflow-hidden group aspect-[4/3]">
                          <img
                            src={getMediaUrl(media)}
                            alt={media.caption || story.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-elegant"
                          />
                          {media.caption && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                              <p className="text-white text-sm p-4 font-medium">{media.caption}</p>
                            </div>
                          )}
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Video Sections */}
            {videos.map((video, index) => (
              <ScrollReveal key={video.id} delay={0.2}>
                <div className="rounded-2xl overflow-hidden shadow-xl bg-gray-900">
                  <div className="aspect-video">
                    {isDirectVideoFile(getMediaUrl(video)) ? (
                      <video
                        className="w-full h-full object-cover"
                        controls
                        playsInline
                      >
                        <source
                          src={getMediaUrl(video)}
                          {...(guessVideoMimeType(getMediaUrl(video)) ? { type: guessVideoMimeType(getMediaUrl(video)) } : {})}
                        />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <iframe
                        src={getEmbedUrl(getMediaUrl(video))}
                        title={video.caption || 'Story video'}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>
                  {video.caption && (
                    <div className="px-6 py-4">
                      <p className="text-gray-400 text-sm">{video.caption}</p>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}

            {/* Story Content */}
            <ScrollReveal>
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap leading-[1.8] text-gray-700 text-lg">
                  {story.content}
                </div>
              </div>
            </ScrollReveal>

            {/* Actions */}
            <ScrollReveal>
              <div className="flex items-center gap-3 pt-8 border-t border-gray-100">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 hover:scale-[0.97] active:scale-95 transition-all duration-300 ease-elegant">
                  <Heart className="h-4 w-4" />
                  Like
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-full hover:bg-gray-200 transition-all duration-300 ease-elegant">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-full hover:bg-gray-200 transition-all duration-300 ease-elegant">
                  <MessageCircle className="h-4 w-4" />
                  Comment
                </button>
              </div>
            </ScrollReveal>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <ScrollReveal direction="right" delay={0.3}>
              <StoryInfobox data={infoboxData} />
            </ScrollReveal>

            {relatedStories.length > 0 && (
              <ScrollReveal direction="right" delay={0.4}>
                <RelatedContent
                  items={relatedStories}
                  title="Related Stories"
                  maxItems={5}
                />
              </ScrollReveal>
            )}

            <ScrollReveal direction="right" delay={0.5}>
              <TableOfContents sticky />
            </ScrollReveal>
          </aside>
        </div>
      </div>
    </div>
  );
}

/** Full-width hero with parallax effect for stories with a featured image */
function StoryHero({
  title,
  category,
  imageUrl,
  storyteller,
  date,
}: {
  title: string;
  category: string;
  imageUrl: string;
  storyteller?: Story['storyteller'];
  date: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.05]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={ref} className="relative h-[70vh] md:h-[80vh] overflow-hidden">
      {/* Background Image with parallax */}
      <motion.div style={{ scale }} className="absolute inset-0 w-full h-full">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      </motion.div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 h-full flex flex-col justify-end px-6 lg:px-8 pb-16 max-w-7xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {category && (
            <div className="inline-block mb-4">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-white/70">
                {category}
              </span>
            </div>
          )}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-[-0.02em] leading-[1.05] max-w-4xl mb-6">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
            {storyteller && (
              <span className="flex items-center gap-2">
                <User className="h-3.5 w-3.5" />
                {storyteller.preferred_name || storyteller.full_name}
              </span>
            )}
            <span className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(date).toLocaleDateString('en-AU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </motion.div>
      </motion.div>
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
