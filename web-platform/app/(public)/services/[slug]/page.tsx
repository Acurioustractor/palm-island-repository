import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createServerSupabase } from '@/lib/supabase/client';
import { ServiceStoryPage } from '@/components/services/ServiceStoryPage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServerSupabase();
  const { data: services } = await supabase
    .from('organization_services')
    .select('name, description')
    .eq('slug', slug)
    .eq('is_active', true)
    .limit(1);

  const service = services?.[0];
  if (!service) return { title: 'Service Not Found' };

  return {
    title: `${service.name} — Palm Island Community Company`,
    description: service.description || `Learn about ${service.name} at PICC.`,
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = createServerSupabase();

  // Fetch service
  const { data: serviceRows } = await supabase
    .from('organization_services')
    .select(`
      id, name, slug, description, service_category,
      service_color, icon_name, metadata
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .limit(1);

  const service = serviceRows?.[0];
  if (!service) {
    notFound();
  }

  const serviceTag = `service:${slug}`;

  // Parallel data fetching — cast wide net for all available media
  const [
    metricsResult,
    storiesResult,
    galleryResult,
    heroImageResult,
    heroVideoResult,
    serviceVideosResult,
    externalVideosResult,
  ] = await Promise.all([
    // Service metrics
    supabase
      .from('service_metrics')
      .select('fiscal_year, clients_served, sessions_delivered, staff_count, events_held, key_achievement, headline_stat_value, headline_stat_label')
      .eq('organization_service_id', service.id)
      .order('fiscal_year', { ascending: false }),

    // Related stories via service_id
    supabase
      .from('stories')
      .select(`
        id, title, content, quote_text, summary,
        storyteller:storyteller_id (
          full_name, preferred_name, profile_image_url, is_elder
        )
      `)
      .eq('service_id', service.id)
      .eq('access_level', 'public')
      .eq('status', 'published')
      .limit(6),

    // Gallery images — generous limit, ordered by rating then featured then newest
    supabase
      .from('media_files')
      .select('id, public_url, title, caption, alt_text, file_type, is_featured, tags, rating')
      .contains('tags', [serviceTag])
      .eq('file_type', 'image')
      .is('deleted_at', null)
      .order('rating', { ascending: false, nullsFirst: false })
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(24),

    // Hero image — tagged service + hero, prefer highest rated
    supabase
      .from('media_files')
      .select('public_url')
      .contains('tags', [serviceTag, 'hero'])
      .eq('file_type', 'image')
      .is('deleted_at', null)
      .order('rating', { ascending: false, nullsFirst: false })
      .limit(1),

    // Hero video — tagged service + hero, file_type video
    supabase
      .from('media_files')
      .select('public_url')
      .contains('tags', [serviceTag, 'hero'])
      .eq('file_type', 'video')
      .is('deleted_at', null)
      .limit(1),

    // Service-tagged videos (direct uploads or internal)
    supabase
      .from('media_files')
      .select('id, public_url, title, caption, alt_text, file_type, is_featured, tags')
      .contains('tags', [serviceTag])
      .eq('file_type', 'video')
      .is('deleted_at', null)
      .order('is_featured', { ascending: false })
      .limit(4),

    // External videos tagged with service (e.g. elder videos, Descript embeds)
    supabase
      .from('media_files')
      .select('id, public_url, title, caption, alt_text, file_type, is_featured, tags')
      .contains('tags', [serviceTag, 'external-video'])
      .is('deleted_at', null)
      .order('is_featured', { ascending: false })
      .limit(4),
  ]);

  // If no stories via service_id, try tag-based fallback
  let stories = storiesResult.data || [];
  if (stories.length === 0) {
    const { data: tagStories } = await supabase
      .from('stories')
      .select(`
        id, title, content, quote_text, summary,
        storyteller:storyteller_id (
          full_name, preferred_name, profile_image_url, is_elder
        )
      `)
      .eq('access_level', 'public')
      .eq('status', 'published')
      .contains('tags', [serviceTag])
      .limit(6);
    stories = tagStories || [];
  }

  // Normalize storyteller from Supabase join (may be array or object)
  const normalizedStories = stories.map((s: any) => ({
    ...s,
    storyteller: Array.isArray(s.storyteller) ? s.storyteller[0] || null : s.storyteller || null,
  }));

  // Hero image with fallback: hero-tagged → first featured image → first any image
  const heroImage =
    heroImageResult.data?.[0]?.public_url ||
    galleryResult.data?.find((m: any) => m.is_featured)?.public_url ||
    galleryResult.data?.[0]?.public_url ||
    null;

  // Hero video: hero-tagged video → null (don't auto-promote section videos to hero)
  const heroVideo = heroVideoResult.data?.[0]?.public_url || null;

  // Merge all videos (service-tagged + external), deduplicate by id
  const allVideos = [...(serviceVideosResult.data || []), ...(externalVideosResult.data || [])];
  const seenVideoIds = new Set<string>();
  const uniqueVideos = allVideos.filter((v: any) => {
    if (seenVideoIds.has(v.id)) return false;
    seenVideoIds.add(v.id);
    return true;
  });

  // Primary video for the video section (first non-hero video, or first video)
  const primaryVideoUrl = uniqueVideos[0]?.public_url || null;

  return (
    <ServiceStoryPage
      service={service}
      metrics={metricsResult.data || []}
      stories={normalizedStories}
      media={galleryResult.data || []}
      heroImage={heroImage}
      heroVideo={heroVideo}
      videos={uniqueVideos}
      videoUrl={primaryVideoUrl}
    />
  );
}
