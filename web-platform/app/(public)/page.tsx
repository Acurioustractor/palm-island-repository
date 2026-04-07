import { createServerSupabase } from '@/lib/supabase/client';
import { FALLBACKS } from '@/lib/stats/current-stats';
import { getELQuotes, getELStats, groupQuotesByAuthor } from '@/lib/empathy-ledger/el-server';
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
  category: string;
  coverImage: string | null;
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
  coverImage: string | null;
};

export type HomeVoice = {
  text: string;
  author: string;
  theme: string | null;
  count: number;
};

export type HomeELStats = {
  quotes: number;
  transcripts: number;
  storytellers: number;
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

  // Count photos and fetch hero images per service via tags (service:{slug})
  const photoCountMap = new Map<string, number>();
  const coverImageMap = new Map<string, string>();
  for (const s of regularServices) {
    const tag = `service:${(s as any).slug}`;
    const [{ count }, { data: heroPhotos }] = await Promise.all([
      supabase
        .from('media_files')
        .select('id', { count: 'exact', head: true })
        .contains('tags', [tag])
        .is('deleted_at', null),
      supabase
        .from('media_files')
        .select('public_url')
        .contains('tags', [tag, 'hero'])
        .eq('file_type', 'image')
        .is('deleted_at', null)
        .order('rating', { ascending: false, nullsFirst: false })
        .order('is_featured', { ascending: false })
        .limit(1),
    ]);
    photoCountMap.set((s as any).slug, count || 0);
    if (heroPhotos?.[0]?.public_url) {
      coverImageMap.set((s as any).slug, heroPhotos[0].public_url);
    }
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
      // Format category for display
      const categoryMap: Record<string, string> = {
        health: 'Health & Wellbeing',
        education: 'Education',
        community: 'Community',
        economic: 'Economic Development',
        youth: 'Youth',
        justice: 'Justice',
        housing: 'Housing',
        wellbeing: 'Wellbeing',
        culture: 'Culture',
        family: 'Family',
        disability: 'Disability',
      };
      const category = categoryMap[s.service_category] || s.service_category || 'Community';

      // Truncate description to first sentence or 120 chars for consistency
      const rawDesc = s.description || 'Supporting the Palm Island community.';
      const firstSentence = rawDesc.match(/^[^.!?]+[.!?]/)?.[0] || rawDesc;
      const description = firstSentence.length > 140 ? firstSentence.slice(0, 137) + '...' : firstSentence;

      return {
        name: s.name,
        slug: s.slug,
        description,
        staff: m?.staff_count || null,
        photos: photoCountMap.get(s.slug) || 0,
        category,
        coverImage: coverImageMap.get(s.slug) || null,
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

  // Innovation projects — from projects table
  const { data: projectsData } = await supabase
    .from('projects')
    .select('name, slug, tagline, description, status, impact_areas, is_public, hero_image_url')
    .eq('is_public', true)
    .eq('project_type', 'innovation')
    .in('status', ['active', 'in_progress'])
    .order('featured', { ascending: false })
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(4);

  const innovationProjects: InnovationProject[] = (projectsData || []).map((p: any) => ({
    name: p.name,
    slug: p.slug || '',
    tagline: p.tagline || p.description?.slice(0, 120) || '',
    status: (['active', 'in_progress'].includes(p.status) ? 'active' : p.status === 'completed' ? 'completed' : 'planning') as 'active' | 'planning' | 'completed',
    impactAreas: (p.impact_areas || []).map((a: string) => a.charAt(0).toUpperCase() + a.slice(1)),
    coverImage: p.hero_image_url || null,
  }));

  // Gallery photos — pick 1 featured image per service for diversity
  const galleryPhotos: { id: string; public_url: string; title: string | null; alt_text: string | null }[] = [];
  const usedServiceSlugs = regularServices.map((s: any) => s.slug).sort(() => Math.random() - 0.5);
  for (const slug of usedServiceSlugs) {
    if (galleryPhotos.length >= 8) break;
    const tag = `service:${slug}`;
    const { data: photos } = await supabase
      .from('media_files')
      .select('id, public_url, title, alt_text')
      .contains('tags', [tag])
      .eq('file_type', 'image')
      .eq('is_public', true)
      .is('deleted_at', null)
      .order('rating', { ascending: false, nullsFirst: false })
      .order('is_featured', { ascending: false })
      .limit(1);
    if (photos?.[0]) {
      galleryPhotos.push(photos[0]);
    }
  }
  // Fill remaining slots with any featured photos not already included
  if (galleryPhotos.length < 8) {
    const existingIds = galleryPhotos.map(p => p.id);
    const { data: extras } = await supabase
      .from('media_files')
      .select('id, public_url, title, alt_text')
      .eq('file_type', 'image')
      .eq('is_featured', true)
      .eq('is_public', true)
      .is('deleted_at', null)
      .not('id', 'in', `(${existingIds.join(',')})`)
      .order('rating', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(8 - galleryPhotos.length);
    galleryPhotos.push(...(extras || []));
  }

  // ─── Empathy Ledger voices for the homepage ───
  const elQuotes = await getELQuotes({ limit: 200, minImpact: 70 }).catch(() => []);
  const elStats = await getELStats().catch(() => ({ quotes: 0, transcripts: 0, stories: 0, media: 0 }));
  const grouped = groupQuotesByAuthor(elQuotes);

  // Pick 4 voices: prefer named speakers, dedupe by author, pull their best quote
  const voices: HomeVoice[] = [];
  const seenAuthors = new Set<string>();
  for (const q of elQuotes) {
    const raw = (q.author_name || '').trim();
    const name = !raw || raw.toLowerCase() === 'unknown' ? 'Community Member' : raw;
    if (seenAuthors.has(name)) continue;
    if (!q.quote_text || q.quote_text.length < 40 || q.quote_text.length > 320) continue;
    seenAuthors.add(name);
    voices.push({
      text: q.quote_text,
      author: name,
      theme: Array.isArray(q.themes) && q.themes.length > 0 ? q.themes[0] : null,
      count: grouped.get(name)?.length || 1,
    });
    if (voices.length >= 6) break;
  }

  const homeELStats: HomeELStats = {
    quotes: elStats.quotes,
    transcripts: elStats.transcripts,
    storytellers: grouped.size,
  };

  return (
    <HomePageClient
      services={homeServices}
      stats={stats}
      innovationProjects={innovationProjects}
      galleryPhotos={galleryPhotos}
      voices={voices}
      elStats={homeELStats}
    />
  );
}
