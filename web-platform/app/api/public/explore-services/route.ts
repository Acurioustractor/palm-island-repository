import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET() {
  try {
    const supabase = getServerClient();

    // 1. All active services
    const { data: services, error: sErr } = await supabase
      .from('organization_services')
      .select('id, name, slug, description, service_category, icon_name, service_color, metadata')
      .eq('is_active', true)
      .order('name');

    if (sErr) throw sErr;
    if (!services || services.length === 0) {
      return NextResponse.json({ services: [] });
    }

    const serviceIds = services.map((s) => s.id);
    const serviceSlugs = services.map((s) => s.slug).filter(Boolean);

    // 2. Hero photos for all services (single query)
    // Get all photos tagged 'hero' that also have any service tag
    const heroTags = serviceSlugs.map((slug) => `service:${slug}`);
    const { data: heroPhotos } = await supabase
      .from('media_files')
      .select('public_url, alt_text, title, tags')
      .eq('file_type', 'image')
      .is('deleted_at', null)
      .contains('tags', ['hero'])
      .overlaps('tags', heroTags)
      .limit(100);

    // Index hero photos by service slug
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

    // 3. Latest metrics per service
    const { data: metrics } = await supabase
      .from('service_metrics')
      .select('organization_service_id, fiscal_year, clients_served, staff_count, headline_stat_value, headline_stat_label, key_achievement')
      .in('organization_service_id', serviceIds)
      .order('fiscal_year', { ascending: false });

    const metricsMap = new Map<string, any>();
    for (const m of metrics || []) {
      if (!metricsMap.has(m.organization_service_id)) {
        metricsMap.set(m.organization_service_id, m);
      }
    }

    // 4. Assemble response
    const result = services.map((s) => {
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
              key_achievement: m.key_achievement || m.headline_stat_value
                ? `${m.headline_stat_value} ${m.headline_stat_label || ''}`.trim()
                : null,
            }
          : null,
      };
    });

    return NextResponse.json({ services: result });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to load services' },
      { status: 500 }
    );
  }
}
