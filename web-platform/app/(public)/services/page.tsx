import { createServerSupabase } from '@/lib/supabase/client';
import { getHeroImage, getHeroVideo } from '@/lib/media/utils';
import nextDynamic from 'next/dynamic';
import { assetUrl } from '@/lib/media/asset-url';
import { getELQuotes, getELStats } from '@/lib/empathy-ledger/el-server';
import { getPiccServices } from '@/lib/services/el-services';
import ServicesGrid from './ServicesGrid';

const InteractiveServiceMap = nextDynamic(
  () => import('@/components/report/InteractiveServiceMap'),
  { ssr: false }
);

import { ogMeta } from '@/lib/seo/og';

export const metadata = ogMeta({
  title: 'Services — Palm Island Community Company',
  description: '26 active services across health, family, justice, youth, education, and economic life — community-controlled, on Country.',
  path: '/services',
});

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
    // EL canonical lat/lng surfaces here so InteractiveServiceMap
    // renders pins set via /picc/services/map. Falls through to {}
    // for services without coordinates yet.
    metadata: {
      ...(e.latitude != null && e.longitude != null
        ? { latitude: e.latitude, longitude: e.longitude }
        : {}),
      ...(e.address ? { address: e.address } : {}),
    } as Record<string, unknown>,
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

  // Headline numbers for the hero stat row
  const totalStaff = allServices.reduce((acc: number, s: any) => acc + (s.staff_count || 0), 0);
  const totalClients = allServices.reduce((acc: number, s: any) => acc + (s.clients_served || 0), 0);
  const servicesWithCovers = allServices.filter((s: any) => !!s.cover_photo).length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FBF8EE' }}>
      {/* Hero — Saltwater & Earth, video underlay, ochre on ocean */}
      <section className="relative overflow-hidden" style={{ minHeight: '78vh' }}>
        {/* Background video */}
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src={heroVideo?.public_url || assetUrl('/hero-assets/clips/daycare-celebration.mp4')}
        />
        {/* Saltwater overlay — ocean wash, not earth mud */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(11,79,108,0.92) 0%, rgba(11,79,108,0.78) 55%, rgba(45,35,25,0.85) 100%)',
          }}
        />
        {/* Subtle vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 35%, rgba(0,0,0,0.35) 100%)' }}
        />

        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-4xl">
            <p
              className="uppercase font-bold mb-5"
              style={{ color: '#F5A623', fontSize: 11, letterSpacing: '0.35em' }}
            >
              EL canonical · Every active service
            </p>
            <h1
              className="font-fraunces font-bold leading-[1.02] mb-5"
              style={{ color: '#FBF8EE', fontSize: 'clamp(40px, 6.5vw, 84px)' }}
            >
              {allServices.length} services.
              <br />
              <span style={{ color: '#C8963E' }}>One Country.</span>
            </h1>
            <p
              className="italic mb-7 max-w-2xl"
              style={{
                color: '#F5A623',
                fontFamily: 'Caveat, cursive',
                fontSize: 'clamp(20px, 2.6vw, 30px)',
                lineHeight: 1.25,
              }}
            >
              every door open, every program run by us, every cover photo from our own archive
            </p>
            <p
              className="max-w-2xl mb-10 leading-relaxed"
              style={{ color: '#FBF8EEDD', fontSize: 'clamp(16px, 1.5vw, 19px)' }}
            >
              Palm Island Community Company runs an integrated service system across health, family,
              justice, youth, education, and economic life — all on Country, all community-controlled,
              all wired into the Empathy Ledger so the data behind each service stays current and true.
            </p>

            {/* Hero stat row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
              <HeroStat label="Active services" value={allServices.length} />
              <HeroStat label="With cover photos" value={servicesWithCovers} />
              <HeroStat label="Staff across all programs" value={totalStaff || '—'} />
              <HeroStat label="Community voices" value={elStats.quotes} />
            </div>
          </div>
        </div>

        {/* Soft fade to body */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(251,248,238,0) 0%, rgba(251,248,238,1) 100%)' }}
        />
      </section>

      {/* Interactive Map */}
      <section className="py-20" style={{ backgroundColor: '#F7F6F4' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <p
              className="uppercase font-bold mb-3"
              style={{ color: '#8B1A1A', fontSize: 11, letterSpacing: '0.3em' }}
            >
              Where the work happens
            </p>
            <h2
              className="font-fraunces font-bold leading-tight mb-3"
              style={{ color: '#0B4F6C', fontSize: 'clamp(32px, 5vw, 48px)' }}
            >
              26 services on Country.
            </h2>
            <p
              className="italic"
              style={{
                color: '#C8963E',
                fontFamily: 'Caveat, cursive',
                fontSize: 'clamp(18px, 2.2vw, 24px)',
              }}
            >
              every pin a real shopfront, a real building, a real spot
            </p>
            <p className="mt-3 text-sm max-w-xl mx-auto" style={{ color: '#6B6560' }}>
              Click any pin to open the service. Coordinates are set in EL canonical and
              stay synced with the live archive.
            </p>
          </div>
          <InteractiveServiceMap services={allServices} />
        </div>
      </section>

      {/* Services Grid — interactive island with category filter + sort */}
      <ServicesGrid services={allServices} />
    </div>
  );
}

// ── Hero stat helper ────────────────────────────────────────────────
function HeroStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div
      className="border-l-2 pl-4 py-1"
      style={{ borderColor: 'rgba(245,166,35,0.55)' }}
    >
      <div
        className="font-fraunces font-bold leading-none"
        style={{ color: '#FBF8EE', fontSize: 'clamp(28px, 3.4vw, 40px)' }}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div
        className="uppercase font-bold mt-1.5"
        style={{ color: '#FBF8EE99', fontSize: 10, letterSpacing: '0.25em' }}
      >
        {label}
      </div>
    </div>
  );
}
