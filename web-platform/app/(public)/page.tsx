import { createServerSupabase } from '@/lib/supabase/client';
import { FALLBACKS } from '@/lib/stats/current-stats';
import HomePageClient from './HomePageClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Innovation project slugs to exclude from the services list
const INNOVATION_SLUGS = ['the-centre', 'photo-studio', 'on-country-photo-studio'];

export type HomeServiceData = {
  name: string;
  slug: string;
  description: string;
  staff: number | null;
  photos: number;
  location: string;
};

export type HomeStats = {
  serviceCount: number;
  totalStaff: number;
  totalPhotos: number;
  storyCount: number;
};

export type InnovationProject = {
  name: string;
  slug: string;
  tagline: string;
  status: 'active' | 'planning' | 'completed';
  impactAreas: string[];
};

export default async function HomePage() {
  const supabase = createServerSupabase();

  // Fetch active services
  const { data: services } = await supabase
    .from('organization_services')
    .select('id, name, slug, description, service_category, metadata')
    .eq('is_active', true)
    .order('name');

  const allServices = services || [];

  // Separate innovation projects from regular services
  const regularServices = allServices.filter(
    (s: any) => !INNOVATION_SLUGS.includes(s.slug)
  );

  // Fetch latest metrics for all services
  const serviceIds = allServices.map((s: any) => s.id);
  const { data: metrics } = serviceIds.length > 0
    ? await supabase
        .from('service_metrics')
        .select('organization_service_id, staff_count')
        .in('organization_service_id', serviceIds)
        .order('fiscal_year', { ascending: false })
    : { data: [] };

  // Index latest metrics by service ID
  const metricsMap = new Map<string, any>();
  for (const m of (metrics || [])) {
    if (!metricsMap.has(m.organization_service_id)) {
      metricsMap.set(m.organization_service_id, m);
    }
  }

  // Count photos per service via tags (service:{slug})
  const photoCountMap = new Map<string, number>();
  for (const s of regularServices) {
    const tag = `service:${(s as any).slug}`;
    const { count } = await supabase
      .from('media_files')
      .select('id', { count: 'exact', head: true })
      .contains('tags', [tag])
      .is('deleted_at', null);
    photoCountMap.set((s as any).slug, count || 0);
  }

  // Total photo count
  const { count: totalPhotos } = await supabase
    .from('media_files')
    .select('id', { count: 'exact', head: true })
    .eq('file_type', 'image')
    .is('deleted_at', null);

  // Total story count
  const { count: storyCount } = await supabase
    .from('stories')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published');

  // Calculate total staff from latest metrics
  let totalStaff = 0;
  metricsMap.forEach((m) => {
    totalStaff += m.staff_count || 0;
  });

  // Build homepage service data — top 6 by photo count, then by name
  const homeServices: HomeServiceData[] = regularServices
    .map((s: any) => {
      const m = metricsMap.get(s.id);
      const location = s.metadata?.location_name || s.service_category || 'Palm Island';
      return {
        name: s.name,
        slug: s.slug,
        description: s.description || 'Supporting the Palm Island community.',
        staff: m?.staff_count || null,
        photos: photoCountMap.get(s.slug) || 0,
        location,
      };
    })
    .sort((a: HomeServiceData, b: HomeServiceData) => b.photos - a.photos)
    .slice(0, 6);

  const stats: HomeStats = {
    serviceCount: regularServices.length,
    totalStaff: totalStaff || FALLBACKS.staffCount,
    totalPhotos: totalPhotos || 0,
    storyCount: storyCount || 0,
  };

  // Innovation projects — sourced from PICC strategic plan
  const innovationProjects: InnovationProject[] = [
    {
      name: 'On-Country Photo Studio',
      slug: 'photo-studio',
      tagline: 'Professional photography preserving community stories on Country',
      status: 'active',
      impactAreas: ['Employment', 'Culture', 'Media'],
    },
    {
      name: 'The Centre — Recycling & Employment',
      slug: 'the-centre',
      tagline: 'Creating sustainable employment through community recycling',
      status: 'active',
      impactAreas: ['Employment', 'Environment', 'Youth'],
    },
    {
      name: 'Elders Cultural Trips',
      slug: 'elders-trips',
      tagline: 'Reconnecting Elders with Country and cultural knowledge',
      status: 'active',
      impactAreas: ['Culture', 'Elders', 'Wellbeing'],
    },
    {
      name: 'On-Country Server',
      slug: 'local-server',
      tagline: 'Data sovereignty through locally-hosted community infrastructure',
      status: 'planning',
      impactAreas: ['Technology', 'Sovereignty', 'Innovation'],
    },
  ];

  return (
    <HomePageClient
      services={homeServices}
      stats={stats}
      innovationProjects={innovationProjects}
    />
  );
}
