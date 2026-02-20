'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { BespokeIcon } from '@/components/ui/BespokeIcon';
import { getServiceIcon } from '@/lib/services/service-icons';

interface ServiceCard {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  category?: string;
  icon_name?: string;
  service_color?: string;
  clients_served?: number;
  staff_count?: number;
}

interface ServiceCardGridProps {
  services: ServiceCard[];
}

const CATEGORY_COLORS: Record<string, string> = {
  health: '#0d9488',
  family: '#7c3aed',
  crisis: '#dc2626',
  justice: '#1e3a5f',
  economic: '#d97706',
  youth: '#2563eb',
  disability: '#059669',
  safety: '#e11d48',
};

export function ServiceCardGrid({ services }: ServiceCardGridProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service, index) => {
        const color = service.service_color || CATEGORY_COLORS[service.category || ''] || '#6b7280';
        const slug = service.slug || service.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        return (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: Math.min(index * 0.05, 1) }}
          >
            <Link
              href={`/services/${slug}`}
              className="group block p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <BespokeIcon name={getServiceIcon(slug)} size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-[#1e3a5f] transition-colors">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  {(service.clients_served || service.staff_count) && (
                    <div className="flex items-center gap-3 mt-2">
                      {service.clients_served && (
                        <span className="text-xs font-medium" style={{ color }}>
                          {service.clients_served.toLocaleString()} clients
                        </span>
                      )}
                      {service.staff_count && (
                        <span className="text-xs text-gray-400">
                          {service.staff_count} staff
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
