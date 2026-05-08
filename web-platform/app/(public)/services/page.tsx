import Link from 'next/link';
import Image from 'next/image';
import { Users, Activity, ArrowRight, Camera, Film, Quote } from 'lucide-react';
import { createServerSupabase } from '@/lib/supabase/client';
import { getHeroImage, getHeroVideo } from '@/lib/media/utils';
import { BespokeIcon } from '@/components/ui/BespokeIcon';
import { getServiceIcon } from '@/lib/services/service-icons';
import nextDynamic from 'next/dynamic';
import AdminServiceCard from '@/components/admin/AdminServiceCard';
import { assetUrl } from '@/lib/media/asset-url';
import { getELQuotes, getELStats } from '@/lib/empathy-ledger/el-server';
import { getPiccServices } from '@/lib/services/el-services';

const InteractiveServiceMap = nextDynamic(
  () => import('@/components/report/InteractiveServiceMap'),
  { ssr: false }
);

export const metadata = {
  title: 'Our Services — Palm Island Community Company',
  description: 'Explore PICC\'s integrated services supporting the Palm Island community.',
};

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ServicesIndexPage() {
  const supabase = createServerSupabase();

  // Fetch hero media for the page
  const [heroImage, heroVideo] = await Promise.all([
    getHeroImage('services'),
    getHeroVideo('services'),
  ]);

  // EL v2 is the canonical roster (Phase 1 of the migration). PICC
  // `organization_services` is now ONLY consulted to resolve PICC's
  // service_metrics rows by slug (since service_metrics still keys on
  // PICC's organization_services.id). Drift between PICC's table and EL
  // means out-of-sync service lists — we read EL as truth.
  const elServices = await getPiccServices({ status: 'active' }).catch(() => []);

  // Resolve PICC organization_services.id by slug so service_metrics
  // can be joined. Best-effort — no metric loss if a slug isn't in
  // PICC's table; the service still surfaces from EL with its cover.
  const { data: piccServiceRefs } = await supabase
    .from('organization_services')
    .select('id, slug');
  const piccIdBySlug = new Map<string, string>();
  for (const r of (piccServiceRefs || []) as Array<{ id: string; slug: string }>) {
    piccIdBySlug.set(r.slug, r.id);
  }

  const piccIds = elServices
    .map((s) => piccIdBySlug.get(s.slug))
    .filter((id): id is string => !!id);
  const { data: metrics } = piccIds.length > 0
    ? await supabase
        .from('service_metrics')
        .select('organization_service_id, fiscal_year, clients_served, staff_count, headline_stat_value, headline_stat_label')
        .in('organization_service_id', piccIds)
        .order('fiscal_year', { ascending: false })
    : { data: [] };

  // Index metrics by EL slug (latest year first) by reverse-resolving
  // through the slug↔picc-id map.
  const piccSlugById = new Map<string, string>();
  for (const r of (piccServiceRefs || []) as Array<{ id: string; slug: string }>) {
    piccSlugById.set(r.id, r.slug);
  }
  const metricsBySlug = new Map<string, any>();
  for (const m of (metrics || [])) {
    const slug = piccSlugById.get((m as any).organization_service_id);
    if (slug && !metricsBySlug.has(slug)) metricsBySlug.set(slug, m);
  }

  // The list of services is the EL canonical roster. Drop the PICC
  // organization_services fetch — it's not the source any more.
  const services = elServices.map((e) => ({
    id: e.id,
    name: e.name,
    slug: e.slug,
    description: e.description,
    service_category: e.service_category,
    // EL doesn't carry these PICC-only display fields; fall back to
    // sensible defaults so existing JSX doesn't break.
    icon_name: null as string | null,
    service_color: null as string | null,
    metadata: {} as Record<string, unknown>,
  }));

  // Cover photo seed: EL `image_url` is canonical (set on 23/26
  // services). PICC media_files `service:<slug> + hero` tagged photos
  // can override below — they're editor-pinned hero shots.
  const coverPhotoBySlug = new Map<string, { url: string; alt: string | null }>();
  for (const e of elServices) {
    if (e.image_url) coverPhotoBySlug.set(e.slug, { url: e.image_url, alt: e.name });
  }

  // Cover photo + photo/video counts per service. Cover priority:
  //   1. PICC media_files `service:<slug> + hero` (editor-pinned)
  //   2. EL canonical image_url (already seeded into coverPhotoBySlug)
  // Photo + video counts come from PICC media_files (still legacy media).
  const photoCountMap = new Map<string, number>();
  const videoCountMap = new Map<string, number>();

  for (const s of services) {
    const serviceTag = `service:${s.slug}`;

    // Editor-pinned PICC hero (overrides EL image_url when present)
    const { data: heroPhotos } = await supabase
      .from('media_files')
      .select('public_url, alt_text, title')
      .contains('tags', [serviceTag, 'hero'])
      .eq('file_type', 'image')
      .is('deleted_at', null)
      .order('rating', { ascending: false, nullsFirst: false })
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1);

    if (heroPhotos && heroPhotos.length > 0) {
      coverPhotoBySlug.set(s.slug, {
        url: heroPhotos[0].public_url,
        alt: heroPhotos[0].alt_text || heroPhotos[0].title || null,
      });
    }

    // Photo count
    const { count: photoCount } = await supabase
      .from('media_files')
      .select('id', { count: 'exact', head: true })
      .contains('tags', [serviceTag])
      .eq('file_type', 'image')
      .is('deleted_at', null);
    photoCountMap.set((s as any).slug, photoCount || 0);

    // Video count
    const { count: videoCount } = await supabase
      .from('media_files')
      .select('id', { count: 'exact', head: true })
      .contains('tags', [serviceTag])
      .eq('file_type', 'video')
      .is('deleted_at', null);
    videoCountMap.set((s as any).slug, videoCount || 0);
  }

  // ─── Empathy Ledger voices for services ───
  // Pull all PICC quotes and match each service to relevant voices by keywords
  const elQuotes = await getELQuotes({ limit: 600, minImpact: 30 }).catch(() => []);
  const elStats = await getELStats().catch(() => ({ quotes: 0, transcripts: 0, stories: 0, media: 0 }));

  // Service-to-keyword mapping for EL quote matching
  const serviceKeywords: Record<string, string[]> = {
    'safe-house': ['safe house', 'children', 'safe', 'kids', 'home'],
    'womens-service': ['women', 'shelter', 'safe', 'family violence', 'domestic'],
    'family_wellbeing': ['family', 'wellbeing', 'parenting', 'mums'],
    'ferdy-s-haven': ['ferdy', 'healing', 'women'],
    'bwgcolman-healing': ['health', 'healing', 'medical', 'doctor', 'clinic', 'bwgcolman'],
    'bwgcolman-way': ['child protection', 'community control', 'delegated', 'bwgcolman way'],
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

  function findQuoteForService(slug: string): any | null {
    const keywords = serviceKeywords[slug] || [];
    if (keywords.length === 0) return null;

    // Find quotes whose text contains any of the service keywords
    const candidates: any[] = [];
    for (const q of elQuotes) {
      const text = (q.quote_text || '').toLowerCase();
      if (!text || text.length < 30 || text.length > 280) continue;
      if (keywords.some(kw => text.includes(kw))) {
        candidates.push(q);
      }
    }

    // Sort by impact, prefer named voices
    candidates.sort((a, b) => {
      const aNamed = a.author_name && a.author_name.toLowerCase() !== 'unknown' ? 1 : 0;
      const bNamed = b.author_name && b.author_name.toLowerCase() !== 'unknown' ? 1 : 0;
      if (aNamed !== bNamed) return bNamed - aNamed;
      return (b.impact_score || 0) - (a.impact_score || 0);
    });

    return candidates[0] || null;
  }

  const allServices = services.map((s) => {
    const m = metricsBySlug.get(s.slug);
    const elQuote = findQuoteForService(s.slug);
    const cover = coverPhotoBySlug.get(s.slug);
    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: s.description,
      service_category: s.service_category,
      icon_name: s.icon_name,
      service_color: s.service_color,
      metadata: s.metadata,
      staff_count: m?.staff_count || null,
      clients_served: m?.clients_served || null,
      cover_photo: cover ? { public_url: cover.url, alt_text: cover.alt } : null,
      photo_count: photoCountMap.get(s.slug) || 0,
      has_video: (videoCountMap.get(s.slug) || 0) > 0,
      el_quote: elQuote ? {
        text: elQuote.quote_text,
        author: elQuote.author_name && elQuote.author_name.toLowerCase() !== 'unknown'
          ? elQuote.author_name
          : 'Community Member',
      } : null,
    };
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative text-white py-20 overflow-hidden">
        {/* Background video or image */}
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src={heroVideo?.public_url || assetUrl('/hero-assets/clips/daycare-celebration.mp4')}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-picc-earth-600/85 via-picc-earth-600/75 to-picc-earth/85" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
            <BespokeIcon name="community" size={16} darkMode />
            <span className="text-sm font-semibold uppercase tracking-wide">Our Services</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            {allServices.length} Integrated Services
          </h1>
          <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto opacity-90 mb-8">
            Comprehensive, culturally-informed support across every aspect of community life on Palm Island
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-sm">
            <Quote className="w-4 h-4 text-picc-ochre" />
            <span className="text-white/80">{elStats.quotes} community voices captured</span>
          </div>
        </div>
      </section>

      {/* Interactive Map */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Service Map</h2>
            <p className="text-gray-600">Click a pin to explore each service</p>
          </div>
          <InteractiveServiceMap services={allServices} />
        </div>
      </section>

      {/* Services Grid — every PICC service, every cover from EL canonical */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allServices.map((service: any) => (
              <AdminServiceCard key={service.id} serviceSlug={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group block"
                >
                  <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-picc-ochre-300 hover:shadow-xl transition-all h-full">
                    {/* Cover Photo */}
                    {service.cover_photo ? (
                      <div className="aspect-[16/9] relative overflow-hidden">
                        <Image
                          src={service.cover_photo.public_url}
                          alt={service.cover_photo.alt_text || service.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        {/* Photo/video badges on cover */}
                        <div className="absolute bottom-3 right-3 flex gap-2">
                          {service.photo_count > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                              <Camera className="w-3 h-3" />
                              {service.photo_count}
                            </span>
                          )}
                          {service.has_video && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                              <Film className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-[16/9] relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center"
                          style={{ backgroundColor: service.service_color || '#C8922A' }}
                        >
                          <BespokeIcon name={getServiceIcon(service.slug)} size={32} darkMode />
                        </div>
                        {/* Photo/video badges on placeholder */}
                        {(service.photo_count > 0 || service.has_video) && (
                          <div className="absolute bottom-3 right-3 flex gap-2">
                            {service.photo_count > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-200 rounded-full text-gray-600 text-xs font-medium">
                                <Camera className="w-3 h-3" />
                                {service.photo_count}
                              </span>
                            )}
                            {service.has_video && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-200 rounded-full text-gray-600 text-xs font-medium">
                                <Film className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-picc-ochre transition-colors flex items-center gap-2">
                        <BespokeIcon name={getServiceIcon(service.slug)} size={24} />
                        {service.name}
                      </h3>

                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {service.description || 'Supporting the Palm Island community.'}
                      </p>

                      {service.el_quote && (
                        <div className="mb-4 pl-3 border-l-2 border-picc-ochre/40">
                          <p className="text-xs italic text-gray-500 leading-relaxed line-clamp-3">
                            &ldquo;{service.el_quote.text}&rdquo;
                          </p>
                          <p className="text-[11px] text-picc-ochre mt-1 font-medium">
                            — {service.el_quote.author}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm mb-4">
                        {service.staff_count ? (
                          <span className="flex items-center gap-1 text-picc-ochre font-semibold">
                            <Users className="w-4 h-4" />
                            {service.staff_count} staff
                          </span>
                        ) : <span />}
                        {service.clients_served ? (
                          <span className="flex items-center gap-1 text-gray-500">
                            <Activity className="w-4 h-4" />
                            {service.clients_served} served
                          </span>
                        ) : <span />}
                      </div>

                      <div className="flex items-center gap-1 text-picc-ochre font-semibold text-sm group-hover:gap-2 transition-all">
                        View service
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </AdminServiceCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
