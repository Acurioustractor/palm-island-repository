'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Heart, BookOpen, Search, Building, Users } from 'lucide-react';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';

interface Service {
  id: string;
  service_name: string;
  service_description?: string;
  service_color?: string;
  icon_name?: string;
  story_count: number;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchServices() {
      const supabase = createClient();

      // Fetch all services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .order('service_name');

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
        setLoading(false);
        return;
      }

      // Count stories for each service
      const servicesWithCounts = await Promise.all(
        (servicesData || []).map(async (service) => {
          const { count } = await supabase
            .from('stories')
            .select('id', { count: 'exact', head: true })
            .eq('service_id', service.id)
            .eq('is_public', true);

          return {
            ...service,
            story_count: count || 0,
          };
        })
      );

      setServices(servicesWithCounts);
      setLoading(false);
    }

    fetchServices();
  }, []);

  const filteredServices = services.filter((service) =>
    service.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.service_description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStories = services.reduce((sum, s) => sum + s.story_count, 0);

  const breadcrumbs = [
    { label: 'Wiki', href: '/wiki' },
    { label: 'Services', href: '/wiki/services' },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <Heart className="h-10 w-10 text-rose-600" />
          PICC Services & Programs
        </h1>
        <p className="text-xl text-gray-600">
          Integrated community services supporting Palm Island
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search services and programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-rose-50 rounded-lg p-4 text-center border border-rose-200">
          <div className="text-3xl font-bold text-rose-600">{services.length}</div>
          <div className="text-sm text-gray-600">Total Services</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
          <div className="text-3xl font-bold text-blue-600">{totalStories}</div>
          <div className="text-sm text-gray-600">Related Stories</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
          <div className="text-3xl font-bold text-green-600">197</div>
          <div className="text-sm text-gray-600">Staff Members</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 text-center border border-amber-200">
          <div className="text-3xl font-bold text-amber-600">
            {filteredServices.length}
          </div>
          <div className="text-sm text-gray-600">Showing</div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-xl border-2 border-gray-200 hover:border-amber-500 overflow-hidden transition-all hover:shadow-lg group"
          >
            {/* Service Header */}
            <div
              className="h-24 flex items-center justify-center relative overflow-hidden"
              style={{
                backgroundColor: service.service_color || '#6B7280',
              }}
            >
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                {service.icon_name ? (
                  <div className="text-5xl">{service.icon_name}</div>
                ) : (
                  <Building className="h-12 w-12 text-white" />
                )}
              </div>
            </div>

            {/* Service Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-700 transition-colors">
                {service.service_name}
              </h3>

              {service.service_description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {service.service_description}
                </p>
              )}

              {/* Story Count */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center text-amber-600">
                  <BookOpen className="h-5 w-5 mr-2" />
                  <span className="font-bold text-lg">{service.story_count}</span>
                  <span className="text-sm ml-1 text-gray-600">
                    {service.story_count === 1 ? 'story' : 'stories'}
                  </span>
                </div>

                {service.story_count > 0 && (
                  <Link
                    href={`/stories?service=${service.id}`}
                    className="text-sm font-medium text-amber-700 hover:text-amber-900 hover:underline"
                  >
                    View stories →
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No results */}
      {filteredServices.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No services found
          </h3>
          <p className="text-gray-600">Try adjusting your search</p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <Users className="h-8 w-8 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-blue-900 mb-2">
              About PICC Services
            </h3>
            <p className="text-gray-700 text-sm mb-2">
              Palm Island Community Company (PICC) provides over 16 integrated services
              supporting our community's health, education, culture, and wellbeing.
            </p>
            <p className="text-gray-600 text-sm">
              With 197 staff members, PICC represents 100% community-controlled service
              delivery, proving that Indigenous self-determination works at scale.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
