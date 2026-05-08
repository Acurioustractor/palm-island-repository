import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createServerSupabase } from '@/lib/supabase/client';
import { ServiceStoryPage } from '@/components/services/ServiceStoryPage';
import { ServiceConnections, type ConnectedStoryteller, type ConnectedProject } from '@/components/services/ServiceConnections';
import { getELQuotes } from '@/lib/empathy-ledger/el-server';
import { getPiccServices } from '@/lib/services/el-services';
import { getPiccStorytellers } from '@/lib/empathy-ledger/el-storytellers';
import { getPiccProjects } from '@/lib/empathy-ledger/el-projects';

// Service slug → keywords for EL quote matching
const SERVICE_KEYWORDS: Record<string, string[]> = {
  'safe-house': ['safe house', 'children', 'safe', 'kids', 'placement'],
  'womens-service': ['women', 'shelter', 'safe', 'family violence', 'domestic'],
  'family_wellbeing': ['family', 'wellbeing', 'parenting', 'mums'],
  'ferdy-s-haven': ['ferdy', 'healing', 'women', 'support'],
  'bwgcolman-healing': ['health', 'healing', 'medical', 'doctor', 'clinic', 'bwgcolman'],
  'bwgcolman-way': ['child protection', 'community control', 'delegated', 'bwgcolman way', 'self-determination'],
  'first-1000-days': ['baby', 'babies', 'first', 'days', 'maternal', 'pregnancy'],
  'early_learning': ['early learning', 'daycare', 'childcare', 'playgroup'],
  'early-childhood-services': ['daycare', 'childcare', 'cfc', 'early childhood', 'children'],
  'youth-service': ['youth', 'young', 'kids', 'school', 'teen', 'footy', 'sport'],
  'sport-recreation': ['sport', 'footy', 'recreation', 'team'],
  'community-justice-group': ['justice', 'court', 'legal', 'community justice'],
  'diversionary-service': ['mens', 'diversionary', 'sober', 'drink', 'safe'],
  'cultural_centre': ['cultural', 'culture', 'art', 'painting', 'workshop'],
  'cultural-programs': ['culture', 'language', 'tradition', 'cultural'],
  'elder_support': ['elder', 'old people', 'aged care', 'eldercare'],
  'community-hub': ['community', 'hub', 'event', 'gathering'],
  'mechanic': ['mechanic', 'car', 'workshop', 'vehicle'],
  'construction-maintenance': ['construction', 'maintenance', 'building', 'workshop'],
  'digital_services': ['digital', 'computer', 'technology', 'online'],
  'blue-card-service': ['blue card', 'check', 'screening'],
  'safe-haven': ['safe haven', 'children', 'haven'],
  'family-care-service': ['family', 'care', 'children'],
  'family-participation-program': ['family', 'participation'],
  'ndis-service': ['ndis', 'disability'],
  'sewb-service': ['wellbeing', 'mental', 'emotional'],
  'womens-healing-service': ['women', 'healing'],
  'mens_programs': ['men', 'mens', 'group'],
  'children-s-lunch-progam': ['lunch', 'school', 'food', 'breakfast'],
  'store-retail': ['store', 'shop', 'retail'],
  'dfv-service': ['dv', 'violence', 'family violence', 'safe'],
  // Added April 2026 — active services missing from map after EL alignment pass
  'aged-care-services': ['aged care', 'elder', 'elders', 'old people', 'aged', 'eldercare'],
  'bwgcolman-education-engagement-attainment-initiative': ['school', 'education', 'student', 'attendance', 'engagement officer', 'classroom', 'beai'],
  'children-and-family-centre': ['cfc', 'children and family', 'family centre', 'children and family centre'],
  'logistics': ['logistics', 'catering', 'supply', 'equipment'],
  'men-s-group': ['men', "men's group", 'mens group', 'fathers', 'brothers', 'healing the spirit'],
  'palm-island-community-connection': ['community connection', 'outreach', 'community engagement'],
  'social-enterprises': ['enterprise', 'social enterprise', 'employment', 'workforce', 'jobs'],
};

async function getServiceVoices(slug: string, limit: number = 6) {
  const keywords = SERVICE_KEYWORDS[slug] || [];
  if (keywords.length === 0) return [];

  const elQuotes = await getELQuotes({ limit: 600, minImpact: 30 }).catch(() => []);

  const matches = elQuotes
    .filter(q => {
      const text = (q.quote_text || '').toLowerCase();
      if (!text || text.length < 30 || text.length > 320) return false;
      return keywords.some(kw => text.includes(kw));
    })
    .sort((a, b) => {
      const aNamed = a.author_name && a.author_name.toLowerCase() !== 'unknown' ? 1 : 0;
      const bNamed = b.author_name && b.author_name.toLowerCase() !== 'unknown' ? 1 : 0;
      if (aNamed !== bNamed) return bNamed - aNamed;
      return (b.impact_score || 0) - (a.impact_score || 0);
    });

  // Dedupe by author + truncate text
  const seen = new Set<string>();
  const result: { text: string; author: string; theme: string | null }[] = [];
  for (const q of matches) {
    const raw = (q.author_name || '').trim();
    const author = !raw || raw.toLowerCase() === 'unknown' ? 'Community Member' : raw;
    const key = `${author}::${(q.quote_text || '').slice(0, 40)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({
      text: q.quote_text || '',
      author,
      theme: Array.isArray(q.themes) && q.themes.length > 0 ? q.themes[0] : null,
    });
    if (result.length >= limit) break;
  }
  return result;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  // EL canonical first (the index links use EL slugs like 'bwg-way',
  // 'aged', '1000d'). Fall back to PICC organization_services for any
  // legacy slug that's still on the older long-form names.
  const elServices = await getPiccServices({ status: 'active' }).catch(() => []);
  const elService = elServices.find((s) => s.slug === slug);
  if (elService) {
    return {
      title: `${elService.name} — Palm Island Community Company`,
      description: elService.description || `Learn about ${elService.name} at PICC.`,
    };
  }
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

  // EL canonical first — the /services index links use EL slugs.
  const elServices = await getPiccServices({ status: 'active' }).catch(() => []);
  const elService = elServices.find((s) => s.slug === slug);

  // Fall back to PICC organization_services for any legacy long-form
  // slug (e.g. 'bwgcolman-way' instead of 'bwg-way') so old links still work.
  let service: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    service_category: string | null;
    service_color: string | null;
    icon_name: string | null;
    metadata: Record<string, unknown>;
  } | undefined;

  if (elService) {
    service = {
      id: elService.id,
      name: elService.name,
      slug: elService.slug,
      description: elService.description,
      service_category: elService.service_category,
      service_color: null,
      icon_name: null,
      metadata: {},
    };
  } else {
    const { data: serviceRows } = await supabase
      .from('organization_services')
      .select(`
        id, name, slug, description, service_category,
        service_color, icon_name, metadata
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .limit(1);
    service = serviceRows?.[0] as typeof service;
  }

  if (!service) {
    notFound();
  }

  const serviceTag = `service:${slug}`;

  // Parallel data fetching — cast wide net for all available media + EL voices
  const elVoicesPromise = getServiceVoices(slug, 6)
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

  // Hero image fallback chain — EL canonical first, then PICC media_files.
  // EL image_url is set on 23 of 26 active services (canonical cover); the
  // legacy service-tagged hero in PICC media_files is the override when an
  // editor has hand-picked a different shot. Order intent:
  //   PICC service:<slug>+hero (editor pick)  ← if present, wins
  //   → EL canonical image_url               ← default, broad coverage
  //   → first featured image in gallery
  //   → first any image
  const elImageUrl = elServices.find((s) => s.slug === slug)?.image_url || null;
  const heroImage =
    heroImageResult.data?.[0]?.public_url ||
    elImageUrl ||
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

  // Resolve EL voices
  const elVoices = await elVoicesPromise;

  // Connected storytellers + projects via shared-storyteller bridge.
  // Don't fail the page if EL is slow — empty arrays render nothing.
  const [connectedStorytellers, allProjects] = await Promise.all([
    getPiccStorytellers({ service: slug, limit: 200 }).catch(() => []),
    getPiccProjects({ status: 'all' }).catch(() => []),
  ]);

  // Map storyteller-IDs in this service so we can score project overlap.
  const storytellerIdSet = new Set(connectedStorytellers.map((s) => s.id));

  // Pull every storyteller (so we can see project_slugs across roster
  // and identify which projects share storytellers with this service).
  const allStorytellers = await getPiccStorytellers({ limit: 500 }).catch(() => []);

  const projectShare = new Map<string, number>();
  for (const st of allStorytellers) {
    if (!storytellerIdSet.has(st.id)) continue;
    for (const ps of st.project_slugs ?? []) {
      projectShare.set(ps, (projectShare.get(ps) || 0) + 1);
    }
  }

  const connectedProjects: ConnectedProject[] = [];
  for (const p of allProjects) {
    const share = projectShare.get(p.slug) || 0;
    if (share === 0) continue;
    connectedProjects.push({
      slug: p.slug,
      name: p.name,
      description: p.description,
      cover_image_url: p.cover_image_url,
      status: p.status,
      shared_storyteller_count: share,
    });
  }
  connectedProjects.sort((a, b) => b.shared_storyteller_count - a.shared_storyteller_count);

  const renderableStorytellers: ConnectedStoryteller[] = connectedStorytellers
    .filter((s) => !!s.photo_url || s.quote_count > 0)
    .map((s) => ({
      id: s.id,
      slug: s.slug,
      display_name: s.display_name,
      role: s.role,
      photo_url: s.photo_url,
      is_elder: s.is_elder,
      quote_count: s.quote_count,
    }))
    .sort((a, b) => Number(b.is_elder) - Number(a.is_elder) || b.quote_count - a.quote_count);

  // Approved community-submitted artwork tagged related:<slug>. Lights up
  // the new "Bespoke pieces about this work" section. Submissions arrive via
  // /share-art and are approved at /picc/design-system/submissions.
  const { data: bespokeArtRows } = await supabase
    .from('media_files')
    .select('id, public_url, title, caption, attribution, metadata')
    .eq('page_context', 'community-art')
    .eq('is_public', true)
    .is('deleted_at', null)
    .contains('tags', [`related:${slug}`])
    .order('created_at', { ascending: false })
    .limit(12);

  return (
    <>
      <ServiceStoryPage
        service={service}
        metrics={metricsResult.data || []}
        stories={normalizedStories}
        media={galleryResult.data || []}
        heroImage={heroImage}
        heroVideo={heroVideo}
        videos={uniqueVideos}
        bespokeArt={bespokeArtRows || []}
        videoUrl={primaryVideoUrl}
        elVoices={elVoices}
      />
      <ServiceConnections
        serviceSlug={service.slug}
        serviceName={service.name}
        serviceColour={service.service_color || undefined}
        storytellers={renderableStorytellers}
        projects={connectedProjects}
      />
    </>
  );
}
