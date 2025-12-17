'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Calendar, User, MapPin, ArrowLeft, Share2, BookOpen,
  Heart, MessageCircle, Eye, Pencil
} from 'lucide-react';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';
import StoryInfobox from '@/components/wiki/StoryInfobox';
import TableOfContents from '@/components/wiki/TableOfContents';
import RelatedContentSidebar from '@/components/stories/RelatedContentSidebar';
import StoryContentRenderer from '@/components/stories/StoryContentRenderer';
import { StoryCard, StoryGrid } from '@/components/stories/StoryCard';

interface Story {
  id: string;
  title: string;
  excerpt?: string;
  summary?: string;
  content?: string;
  metadata?: any;
  category?: string;
  emotional_theme?: string;
  featured_people?: string[];
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
  const [featuredPeople, setFeaturedPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const showEditLink =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

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

        // Featured people (profiles linked to the story beyond the primary storyteller)
        const featuredIds = Array.isArray((data as any).featured_people)
          ? (data as any).featured_people
          : Array.isArray((data as any)?.metadata?.featured_people)
            ? (data as any).metadata.featured_people
            : [];
        if (featuredIds.length > 0) {
          const { data: people } = await supabase
            .from('profiles')
            .select('id, full_name, preferred_name, profile_image_url, is_elder, is_cultural_advisor, bio')
            .in('id', featuredIds)
            .limit(50);

          const list = Array.isArray(people) ? people : [];
          const byId = new Map(list.map((p: any) => [String(p.id), p]));
          setFeaturedPeople(featuredIds.map((id: any) => byId.get(String(id))).filter(Boolean));
        } else {
          setFeaturedPeople([]);
        }

        // Related stories (by category, then by overlapping featured people)
        const relatedCandidates: any[] = [];

        if (data.category) {
          const { data: relatedByCategory } = await supabase
            .from('stories')
            .select(`
              id,
              title,
              content,
              excerpt,
              created_at,
              story_type,
              category,
              access_level,
              is_public,
              contains_traditional_knowledge,
              elder_approval_required,
              elder_approval_given,
              cultural_sensitivity_level,
              featured_image_url,
              metadata,
              storyteller:storyteller_id (
                id,
                preferred_name,
                full_name,
                is_elder,
                is_cultural_advisor,
                profile_image_url
              )
            `)
            .eq('category', data.category)
            .neq('id', params.id)
            .eq('is_public', true)
            .limit(6);
          if (Array.isArray(relatedByCategory)) relatedCandidates.push(...relatedByCategory);
        }

        if (featuredIds.length > 0) {
          try {
            const { data: relatedByPeople } = await supabase
              .from('stories')
              .select(`
                id,
                title,
                content,
                excerpt,
                created_at,
                story_type,
                category,
                access_level,
                is_public,
                contains_traditional_knowledge,
                elder_approval_required,
                elder_approval_given,
                cultural_sensitivity_level,
                featured_image_url,
                metadata,
                storyteller:storyteller_id (
                  id,
                  preferred_name,
                  full_name,
                  is_elder,
                  is_cultural_advisor,
                  profile_image_url
                )
              `)
              .overlaps('featured_people', featuredIds)
              .neq('id', params.id)
              .eq('is_public', true)
              .limit(6);
            if (Array.isArray(relatedByPeople)) relatedCandidates.push(...relatedByPeople);
          } catch {
            // Backwards compatible: featured_people column may not exist yet.
          }
        }

        const seen = new Set<string>();
        const deduped = relatedCandidates.filter((s: any) => {
          const id = String(s?.id || '');
          if (!id || seen.has(id)) return false;
          seen.add(id);
          return true;
        });

        setRelatedStories(deduped.slice(0, 6));

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

  const sharedByAllElders = String((story as any)?.metadata?.shared_by || '').toLowerCase() === 'all_elders'
  const isElderGroupShared =
    sharedByAllElders || (featuredPeople.length > 1 && featuredPeople.every((p: any) => p?.is_elder))

  const peopleInvolved = (() => {
    const list = featuredPeople
      .map((p: any) => {
        const id = String(p?.id || '').trim()
        const name = String(p?.preferred_name || p?.full_name || '').trim()
        const role = p?.is_elder ? 'Elder' : p?.is_cultural_advisor ? 'Cultural advisor' : undefined
        return { id, name, role }
      })
      .filter((p) => p.id && p.name && !/^\d+$/.test(p.name))

    const byId = new Map<string, (typeof list)[number]>()
    for (const p of list) byId.set(p.id, p)
    return Array.from(byId.values())
  })()

  const infoboxData = {
    shared_by_label:
      isElderGroupShared
        ? 'All Elders'
        : undefined,
    shared_by_href:
      isElderGroupShared
        ? '/elders'
        : undefined,
    storyteller:
      isElderGroupShared
        ? undefined
        : story.storyteller
          ? {
              id: story.storyteller.id,
              name: story.storyteller.full_name,
              preferred_name: story.storyteller.preferred_name,
              profile_image_url: story.storyteller.profile_image_url,
            }
          : undefined,
    people_involved: peopleInvolved,
    date_shared: story.created_at,
    story_date: story.story_date,
    location: story.location,
    categories: story.category ? [getCategoryLabel(story.category)] : [],
    services: story.service ? [story.service] : [],
    people_affected: story.people_affected,
    views: typeof story.views === 'number' && story.views > 0 ? story.views : undefined,
    shares: typeof story.shares === 'number' && story.shares > 0 ? story.shares : undefined,
    cultural_sensitivity: story.cultural_sensitivity_level as any,
    access_level: story.access_level as any,
    elder_approved: story.elder_approval_given,
    media_count: (() => {
      const photos = story.story_media?.filter((m) => m.media_type === 'photo').length || 0
      const videos = story.story_media?.filter((m) => m.media_type === 'video').length || 0
      const audio = story.story_media?.filter((m) => m.media_type === 'audio').length || 0
      if (photos === 0 && videos === 0 && audio === 0) return undefined
      return { photos, videos, audio }
    })(),
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      {/* Back + Edit buttons */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          href="/stories"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Stories
        </Link>
        {showEditLink && (
          <Link
            href={`/picc/stories/${story.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Edit story
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {story.title}
            </h1>

            {(story.excerpt || story.summary) && (
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {story.excerpt || story.summary}
              </p>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pb-6 border-b border-gray-200">
              {isElderGroupShared ? (
                <Link
                  href="/elders"
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                >
                  <User className="h-4 w-4" />
                  All Elders
                </Link>
              ) : story.storyteller ? (
                <Link
                  href={`/wiki/people/${story.storyteller.id}`}
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                >
                  <User className="h-4 w-4" />
                  {story.storyteller.preferred_name || story.storyteller.full_name}
                </Link>
              ) : null}
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
              {typeof story.views === 'number' && story.views > 0 && (
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {story.views} views
                </div>
              )}
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
            <StoryContentRenderer content={story.content || ''} />
          </div>

          {/* Featured People */}
          {featuredPeople.length > 0 && (
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {isElderGroupShared ? 'Elders involved' : 'Featured people'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {featuredPeople.map((p: any) => {
                  const name = String(p.preferred_name || p.full_name || 'Community member').trim() || 'Community member';
                  return (
                    <Link
                      key={p.id}
                      href={`/wiki/people/${p.id}`}
                      className="group flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all"
                    >
                      {p.profile_image_url ? (
                        <img
                          src={p.profile_image_url}
                          alt=""
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold flex-shrink-0">
                          {String(name).trim().slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                            {name}
                          </div>
                          {p.is_elder && (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                              Elder
                            </span>
                          )}
                          {p.is_cultural_advisor && !p.is_elder && (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                              Cultural advisor
                            </span>
                          )}
                        </div>
                        {p.bio && (
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{p.bio}</p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Related Stories (bottom) */}
          {relatedStories.length > 0 && (
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Related stories</h2>
              <StoryGrid columns={3}>
                {relatedStories.slice(0, 6).map((s: any) => (
                  <StoryCard
                    key={s.id}
                    story={s}
                    variant="default"
                    showExcerpt={true}
                    showStorytellerInfo={true}
                    showCulturalWarning={true}
                    showQuote={true}
                  />
                ))}
              </StoryGrid>
            </div>
          )}

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
