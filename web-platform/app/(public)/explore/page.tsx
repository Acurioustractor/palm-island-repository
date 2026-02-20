import { Metadata } from 'next';
import nextDynamic from 'next/dynamic';
import { createServerSupabase } from '@/lib/supabase/client';

const ExploreMapClient = nextDynamic(
  () => import('@/components/explore/ExploreMapClient'),
  { ssr: false, loading: () => <MapSkeleton /> }
);

export const metadata: Metadata = {
  title: 'Explore Palm Island — PICC',
  description:
    'Explore Palm Island Community Company services on an interactive map. Discover stories, photos, and impact across the community.',
};

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface ExploreService {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  service_category: string | null;
  service_color: string | null;
  latitude: number | null;
  longitude: number | null;
  hero_photo: { public_url: string; alt_text: string | null } | null;
  stats: {
    staff_count: number | null;
    clients_served: number | null;
    key_achievement: string | null;
  } | null;
}

export default async function ExplorePage() {
  const supabase = createServerSupabase();

  // Fetch services with coordinates
  const { data: services } = await supabase
    .from('organization_services')
    .select('id, name, slug, description, service_category, service_color, metadata')
    .eq('is_active', true)
    .order('name');

  const serviceIds = (services || []).map((s: any) => s.id);
  const serviceSlugs = (services || []).map((s: any) => s.slug).filter(Boolean);

  // Hero photos (single query)
  const heroTags = serviceSlugs.map((slug: string) => `service:${slug}`);
  const { data: heroPhotos } = heroTags.length > 0
    ? await supabase
        .from('media_files')
        .select('public_url, alt_text, title, tags')
        .eq('file_type', 'image')
        .is('deleted_at', null)
        .contains('tags', ['hero'])
        .overlaps('tags', heroTags)
        .limit(100)
    : { data: [] };

  const heroMap = new Map<string, { public_url: string; alt_text: string | null }>();
  for (const photo of heroPhotos || []) {
    const serviceTag = (photo.tags || []).find(
      (t: string) => t.startsWith('service:') && t !== 'service'
    );
    if (serviceTag) {
      const slug = serviceTag.replace('service:', '');
      if (!heroMap.has(slug)) {
        heroMap.set(slug, {
          public_url: photo.public_url,
          alt_text: photo.alt_text || photo.title || null,
        });
      }
    }
  }

  // Latest metrics
  const { data: metrics } = serviceIds.length > 0
    ? await supabase
        .from('service_metrics')
        .select('organization_service_id, clients_served, staff_count, key_achievement, headline_stat_value, headline_stat_label')
        .in('organization_service_id', serviceIds)
        .order('fiscal_year', { ascending: false })
    : { data: [] };

  const metricsMap = new Map<string, any>();
  for (const m of metrics || []) {
    if (!metricsMap.has(m.organization_service_id)) {
      metricsMap.set(m.organization_service_id, m);
    }
  }

  const exploreServices: ExploreService[] = (services || []).map((s: any) => {
    const m = metricsMap.get(s.id);
    const lat = Number(s.metadata?.latitude ?? s.metadata?.lat);
    const lng = Number(s.metadata?.longitude ?? s.metadata?.lng);

    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: s.description,
      service_category: s.service_category,
      service_color: s.service_color,
      latitude: Number.isFinite(lat) ? lat : null,
      longitude: Number.isFinite(lng) ? lng : null,
      hero_photo: heroMap.get(s.slug) || null,
      stats: m
        ? {
            staff_count: m.staff_count,
            clients_served: m.clients_served,
            key_achievement: m.key_achievement || (m.headline_stat_value
              ? `${m.headline_stat_value} ${m.headline_stat_label || ''}`.trim()
              : null),
          }
        : null,
    };
  });

  return <ExploreMapClient services={exploreServices} />;
}

function MapSkeleton() {
  return (
    <div className="h-[calc(100vh-4rem)] w-full bg-gradient-to-br from-picc-earth to-picc-earth-700 flex items-center justify-center">
      <div className="text-center text-white/80">
        <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Loading map...</p>
      </div>
    </div>
  );
}
