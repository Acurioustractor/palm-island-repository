import { notFound } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/client';
import { ServiceStoryPage } from '@/components/services/ServiceStoryPage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabase();
  const { data: services } = await supabase
    .from('organization_services')
    .select('name, description')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .limit(1);

  const service = services?.[0];
  if (!service) return { title: 'Service Not Found' };

  return {
    title: `${service.name} — PICC Services`,
    description: service.description || `Learn about ${service.name} on Palm Island.`,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createServerSupabase();

  // Fetch service (use limit(1) instead of single() to handle duplicate slugs)
  const { data: serviceRows } = await supabase
    .from('organization_services')
    .select(`
      id, name, slug, description, service_category,
      service_color, icon_name, metadata
    `)
    .eq('slug', params.slug)
    .eq('is_active', true)
    .limit(1);

  const service = serviceRows?.[0];
  if (!service) {
    notFound();
  }

  // Parallel data fetching
  const [metricsResult, storiesResult, mediaResult, heroResult, videoResult] = await Promise.all([
    // Service metrics
    supabase
      .from('service_metrics')
      .select('fiscal_year, clients_served, sessions_delivered, staff_count, events_held, key_achievement, headline_stat_value, headline_stat_label')
      .eq('organization_service_id', service.id)
      .order('fiscal_year', { ascending: false })
      .limit(3),

    // Related stories (via service_id or tags)
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
      .order('total_score', { ascending: false })
      .limit(6),

    // Service media
    supabase
      .from('media_files')
      .select('id, public_url, title, caption, alt_text, file_type')
      .eq('is_public', true)
      .is('deleted_at', null)
      .overlaps('tags', [`service:${params.slug}`])
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20),

    // Hero image for this service
    supabase
      .from('media_files')
      .select('public_url')
      .eq('is_public', true)
      .is('deleted_at', null)
      .eq('file_type', 'image')
      .overlaps('tags', [`service:${params.slug}`, 'hero'])
      .order('is_featured', { ascending: false })
      .limit(1),

    // Service video
    supabase
      .from('media_files')
      .select('public_url')
      .eq('is_public', true)
      .is('deleted_at', null)
      .eq('file_type', 'video')
      .overlaps('tags', [`service:${params.slug}`])
      .order('is_featured', { ascending: false })
      .limit(1),
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
      .contains('tags', [`service:${params.slug}`])
      .order('total_score', { ascending: false })
      .limit(6);
    stories = tagStories || [];
  }

  // Normalize storyteller from Supabase join (may be array or object)
  const normalizedStories = stories.map((s: any) => ({
    ...s,
    storyteller: Array.isArray(s.storyteller) ? s.storyteller[0] || null : s.storyteller || null,
  }));

  return (
    <ServiceStoryPage
      service={{
        id: service.id,
        name: service.name,
        slug: service.slug,
        description: service.description,
        service_category: service.service_category,
        service_color: service.service_color,
        icon_name: service.icon_name,
        metadata: service.metadata,
      }}
      metrics={metricsResult.data || []}
      stories={normalizedStories}
      media={mediaResult.data || []}
      heroImage={heroResult.data?.[0]?.public_url || null}
      videoUrl={videoResult.data?.[0]?.public_url || null}
    />
  );
}
