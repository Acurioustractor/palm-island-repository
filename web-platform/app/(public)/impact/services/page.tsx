'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import ServiceImpactCard, { type ServiceImpactData } from '@/components/services/ServiceImpactCard';
import { BespokeIcon } from '@/components/ui/BespokeIcon';
import Link from 'next/link';

export default function ServiceImpactPage() {
  const [services, setServices] = useState<ServiceImpactData[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      // 1. Load active services
      const { data: svcData } = await supabase
        .from('organization_services')
        .select('id, name, slug, description, service_category, is_active')
        .eq('is_active', true)
        .order('name');

      if (!svcData) {
        setLoading(false);
        return;
      }

      // 2. Load latest metrics for each service
      const { data: metricsData } = await supabase
        .from('service_metrics')
        .select('organization_service_id, fiscal_year, clients_served, sessions_delivered, events_held, staff_count, key_achievement, headline_stat_value, headline_stat_label')
        .order('fiscal_year', { ascending: false });

      // Index metrics by service ID (latest year only)
      const metricsMap = new Map<string, any>();
      if (metricsData) {
        metricsData.forEach((m: any) => {
          if (!metricsMap.has(m.organization_service_id)) {
            metricsMap.set(m.organization_service_id, m);
          }
        });
      }

      // 3. Count stories per service via service_story_links
      const { data: storyLinks } = await supabase
        .from('service_story_links')
        .select('service_name');

      const storyCountMap = new Map<string, number>();
      if (storyLinks) {
        storyLinks.forEach((link: any) => {
          storyCountMap.set(link.service_name, (storyCountMap.get(link.service_name) || 0) + 1);
        });
      }

      // 4. Count quotes per service theme/category
      const { data: elderQuotes } = await supabase
        .from('elder_quotes')
        .select('category, text, speaker_name')
        .in('permission_level', ['public', 'community'])
        .neq('cultural_sensitivity', 'restricted');

      const quoteByCat = new Map<string, { count: number; text?: string; speaker?: string }>();
      if (elderQuotes) {
        elderQuotes.forEach((q: any) => {
          const cat = q.category?.toLowerCase();
          if (!cat) return;
          const existing = quoteByCat.get(cat);
          if (!existing) {
            quoteByCat.set(cat, { count: 1, text: q.text, speaker: q.speaker_name });
          } else {
            existing.count++;
          }
        });
      }

      // 5. Assemble service data
      const assembled: ServiceImpactData[] = svcData.map((svc: any) => {
        const metrics = metricsMap.get(svc.id);
        const cat = svc.service_category?.toLowerCase();
        const quoteData = cat ? quoteByCat.get(cat) : undefined;

        return {
          id: svc.id,
          name: svc.name,
          slug: svc.slug,
          description: svc.description || undefined,
          service_category: svc.service_category || undefined,
          metrics: metrics ? {
            fiscal_year: metrics.fiscal_year,
            clients_served: metrics.clients_served ?? undefined,
            sessions_delivered: metrics.sessions_delivered ?? undefined,
            events_held: metrics.events_held ?? undefined,
            staff_count: metrics.staff_count ?? undefined,
            key_achievement: metrics.key_achievement || undefined,
            headline_stat_value: metrics.headline_stat_value || undefined,
            headline_stat_label: metrics.headline_stat_label || undefined,
          } : undefined,
          story_count: storyCountMap.get(svc.name) || 0,
          quote_count: quoteData?.count || 0,
          featured_quote: quoteData?.text,
          featured_quote_speaker: quoteData?.speaker,
        };
      });

      // Sort: services with metrics first, then by story count
      assembled.sort((a, b) => {
        if (a.metrics && !b.metrics) return -1;
        if (!a.metrics && b.metrics) return 1;
        return b.story_count - a.story_count;
      });

      setServices(assembled);
      setLoading(false);
    }

    loadData();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    services.forEach(s => {
      if (s.service_category) cats.add(s.service_category);
    });
    return Array.from(cats).sort();
  }, [services]);

  const filtered = categoryFilter
    ? services.filter(s => s.service_category === categoryFilter)
    : services;

  // Aggregate stats
  const totals = useMemo(() => {
    let clients = 0, staff = 0, sessions = 0;
    services.forEach(s => {
      if (s.metrics?.clients_served) clients += s.metrics.clients_served;
      if (s.metrics?.staff_count) staff += s.metrics.staff_count;
      if (s.metrics?.sessions_delivered) sessions += s.metrics.sessions_delivered;
    });
    return { clients, staff, sessions, services: services.length };
  }, [services]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-50 to-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-picc-ochre mx-auto mb-4" />
          <p className="text-picc-earth-300">Loading service impact data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-cream">
      {/* Hero */}
      <div className="bg-gradient-to-r from-picc-earth to-picc-earth-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="flex items-center gap-3 mb-3">
            <BespokeIcon name="community" size={40} />
            <h1 className="text-4xl font-bold font-serif">Service Impact</h1>
          </div>
          <p className="text-lg text-white/80 max-w-2xl">
            How PICC&apos;s services are making a difference across Palm Island —
            real metrics, real stories, real impact.
          </p>

          {/* Aggregate banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8 bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div>
              <p className="text-3xl font-bold">{totals.services}</p>
              <p className="text-sm text-white/70">Active Services</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{totals.staff > 0 ? totals.staff.toLocaleString() : '—'}</p>
              <p className="text-sm text-white/70">Total Staff</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{totals.clients > 0 ? totals.clients.toLocaleString() : '—'}</p>
              <p className="text-sm text-white/70">Clients Served</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{totals.sessions > 0 ? totals.sessions.toLocaleString() : '—'}</p>
              <p className="text-sm text-white/70">Sessions Delivered</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-12">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setCategoryFilter(null)}
            className={`px-3 py-1.5 rounded-xl border text-sm transition-all ${
              !categoryFilter
                ? 'bg-picc-ochre text-white border-picc-ochre'
                : 'bg-white/60 text-picc-earth-300 border-warm-200 hover:border-picc-ochre'
            }`}
          >
            All Services
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat === categoryFilter ? null : cat)}
              className={`px-3 py-1.5 rounded-xl border text-sm capitalize transition-all ${
                categoryFilter === cat
                  ? 'bg-picc-ochre text-white border-picc-ochre'
                  : 'bg-white/60 text-picc-earth-300 border-warm-200 hover:border-picc-ochre'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Service cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(service => (
            <ServiceImpactCard key={service.id} service={service} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-picc-earth-300">
            <BespokeIcon name="community" size={48} className="mx-auto mb-4 opacity-50" />
            <p>No services found for this category.</p>
          </div>
        )}

        {/* Back link */}
        <div className="mt-12 text-center">
          <Link
            href="/impact"
            className="inline-flex items-center gap-2 text-picc-ochre hover:underline font-medium"
          >
            ← Back to Impact Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
