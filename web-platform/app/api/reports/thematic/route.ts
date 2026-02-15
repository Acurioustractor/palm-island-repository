import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const VALID_THEMES = [
  'health', 'culture', 'youth', 'education', 'family',
  'economic', 'sport', 'housing', 'community', 'innovation',
  'resilience', 'elders', 'language',
];

export async function POST(req: NextRequest) {
  try {
    const { theme, fiscalYear } = await req.json();

    if (!theme || typeof theme !== 'string') {
      return NextResponse.json({ error: 'Theme is required' }, { status: 400 });
    }

    const normalizedTheme = theme.toLowerCase();
    const fy = fiscalYear || 2025;

    // 1. Find stories matching this theme
    const { data: stories } = await supabase
      .from('stories')
      .select('id, title, excerpt, story_category, created_at, storyteller_id')
      .eq('is_public', true)
      .or(`story_category.ilike.%${normalizedTheme}%,title.ilike.%${normalizedTheme}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    // 2. Find services in this category
    const { data: services } = await supabase
      .from('organization_services')
      .select('id, name, slug, description, service_category')
      .eq('is_active', true)
      .ilike('service_category', `%${normalizedTheme}%`);

    // 3. Find service metrics for matching services
    let metricsData: any[] = [];
    if (services && services.length > 0) {
      const serviceIds = services.map(s => s.id);
      const { data: metrics } = await supabase
        .from('service_metrics')
        .select('*')
        .in('organization_service_id', serviceIds)
        .eq('fiscal_year', fy);

      metricsData = metrics || [];
    }

    // 4. Find quotes matching this theme
    const { data: elderQuotes } = await supabase
      .from('elder_quotes')
      .select('id, text, speaker_name, speaker_role, theme, category')
      .in('permission_level', ['public', 'community'])
      .neq('cultural_sensitivity', 'restricted')
      .or(`theme.ilike.%${normalizedTheme}%,category.ilike.%${normalizedTheme}%`)
      .limit(15);

    const { data: extractedQuotes } = await supabase
      .from('extracted_quotes')
      .select('id, quote_text, attribution, theme, impact_area, is_validated')
      .or('is_validated.eq.true,suggested_for_report.eq.true')
      .or(`theme.ilike.%${normalizedTheme}%,impact_area.ilike.%${normalizedTheme}%`)
      .limit(15);

    // 5. Find media tagged with this theme
    const { data: media } = await supabase
      .from('media_files')
      .select('id, public_url, title, tags, file_type')
      .contains('tags', [normalizedTheme])
      .eq('file_type', 'image')
      .is('deleted_at', null)
      .limit(12);

    // 6. Assemble report structure
    const report = {
      theme: normalizedTheme,
      fiscalYear: fy,
      generatedAt: new Date().toISOString(),

      summary: {
        storyCount: stories?.length || 0,
        serviceCount: services?.length || 0,
        quoteCount: (elderQuotes?.length || 0) + (extractedQuotes?.length || 0),
        mediaCount: media?.length || 0,
      },

      stories: (stories || []).map((s: any) => ({
        id: s.id,
        title: s.title,
        excerpt: s.excerpt,
        category: s.story_category,
        date: s.created_at,
        url: `/stories/${s.id}`,
      })),

      services: (services || []).map((s: any) => {
        const metric = metricsData.find(m => m.organization_service_id === s.id);
        return {
          id: s.id,
          name: s.name,
          slug: s.slug,
          description: s.description,
          category: s.service_category,
          metrics: metric ? {
            clientsServed: metric.clients_served,
            sessionsDelivered: metric.sessions_delivered,
            staffCount: metric.staff_count,
            eventsHeld: metric.events_held,
            keyAchievement: metric.key_achievement,
            headlineStat: metric.headline_stat_value,
            headlineLabel: metric.headline_stat_label,
          } : null,
        };
      }),

      communityVoices: [
        ...(elderQuotes || []).map((q: any) => ({
          id: q.id,
          text: q.text,
          speaker: q.speaker_name,
          role: q.speaker_role,
          theme: q.theme || q.category,
          source: 'elder' as const,
        })),
        ...(extractedQuotes || []).map((q: any) => ({
          id: q.id,
          text: q.quote_text,
          speaker: q.attribution || 'Community Member',
          role: null,
          theme: q.theme || q.impact_area,
          source: 'extracted' as const,
        })),
      ],

      media: (media || []).map((m: any) => ({
        id: m.id,
        url: m.public_url,
        title: m.title,
        tags: m.tags,
      })),
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error('Thematic report error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ themes: VALID_THEMES });
}
