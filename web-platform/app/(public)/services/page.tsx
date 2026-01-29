import Link from 'next/link';
import { MapPin, Users, Activity, ArrowRight } from 'lucide-react';
import { createServerSupabase } from '@/lib/supabase/client';
import nextDynamic from 'next/dynamic';

const InteractiveServiceMap = nextDynamic(
  () => import('@/components/report/InteractiveServiceMap'),
  { ssr: false }
);

export const metadata = {
  title: 'Our Services — Palm Island Community Company',
  description: 'Explore PICC\'s 16 integrated services supporting the Palm Island community.',
};

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ServicesIndexPage() {
  const supabase = createServerSupabase();

  // Fetch services (separate from metrics to avoid FK join failures)
  const { data: services } = await supabase
    .from('organization_services')
    .select(`
      id, name, slug, description, service_category,
      icon_name, service_color, metadata
    `)
    .eq('is_active', true)
    .order('name');

  // Fetch metrics separately to avoid join errors if FK not defined
  const serviceIds = (services || []).map((s: any) => s.id);
  const { data: metrics } = serviceIds.length > 0
    ? await supabase
        .from('service_metrics')
        .select('organization_service_id, fiscal_year, clients_served, staff_count, headline_stat_value, headline_stat_label')
        .in('organization_service_id', serviceIds)
        .order('fiscal_year', { ascending: false })
    : { data: [] };

  // Index metrics by service id (latest year first)
  const metricsMap = new Map<string, any>();
  for (const m of (metrics || [])) {
    if (!metricsMap.has(m.organization_service_id)) {
      metricsMap.set(m.organization_service_id, m);
    }
  }

  const allServices = (services || []).map((s: any) => {
    const m = metricsMap.get(s.id);
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
    };
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-wide">Our Services</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            16 Integrated Services
          </h1>
          <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto opacity-90">
            Comprehensive, culturally-informed support across every aspect of community life on Palm Island
          </p>
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

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allServices.map((service: any) => (
              <Link
                key={service.id}
                href={`/services/${service.slug}`}
                className="group block"
              >
                <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-purple-300 hover:shadow-xl transition-all h-full">
                  <div
                    className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
                    style={{ backgroundColor: service.service_color || '#6366f1' }}
                  >
                    <MapPin className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {service.name}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {service.description || 'Supporting the Palm Island community.'}
                  </p>

                  <div className="flex items-center justify-between text-sm mb-4">
                    {service.staff_count ? (
                      <span className="flex items-center gap-1 text-purple-600 font-semibold">
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

                  <div className="flex items-center gap-1 text-purple-700 font-semibold text-sm group-hover:gap-2 transition-all">
                    View service
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
