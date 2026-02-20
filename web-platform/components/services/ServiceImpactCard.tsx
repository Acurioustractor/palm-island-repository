'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Users, Calendar, Award } from 'lucide-react';
import { BespokeIcon } from '@/components/ui/BespokeIcon';
import { getServiceIcon } from '@/lib/services/service-icons';
import Link from 'next/link';

export interface ServiceImpactData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  service_category?: string;
  metrics?: {
    fiscal_year: number;
    clients_served?: number;
    sessions_delivered?: number;
    events_held?: number;
    staff_count?: number;
    key_achievement?: string;
    headline_stat_value?: string;
    headline_stat_label?: string;
  };
  story_count: number;
  quote_count: number;
  featured_quote?: string;
  featured_quote_speaker?: string;
}

const CATEGORY_STYLES: Record<string, { bg: string; accent: string }> = {
  health: { bg: 'bg-sage-50', accent: 'text-sage-600' },
  education: { bg: 'bg-picc-ochre-50', accent: 'text-picc-ochre' },
  culture: { bg: 'bg-warm-100', accent: 'text-picc-red' },
  youth: { bg: 'bg-picc-red-50', accent: 'text-picc-red' },
  family: { bg: 'bg-warm-50', accent: 'text-picc-earth' },
  economic: { bg: 'bg-warm-50', accent: 'text-picc-ochre' },
  sport: { bg: 'bg-sage-50', accent: 'text-sage-700' },
  housing: { bg: 'bg-warm-100', accent: 'text-picc-earth' },
  community: { bg: 'bg-warm-50', accent: 'text-picc-ochre' },
};

interface ServiceImpactCardProps {
  service: ServiceImpactData;
  className?: string;
}

export default function ServiceImpactCard({ service, className = '' }: ServiceImpactCardProps) {
  const [expanded, setExpanded] = useState(false);
  const category = service.service_category?.toLowerCase() || 'community';
  const styles = CATEGORY_STYLES[category] || CATEGORY_STYLES.community;
  const metrics = service.metrics;

  return (
    <div className={`bg-white/90 border border-warm-200 rounded-2xl overflow-hidden hover:shadow-md transition-all ${className}`}>
      {/* Header */}
      <div className={`${styles.bg} px-6 py-4 border-b border-warm-200`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BespokeIcon name={getServiceIcon(service.slug)} size={22} />
              <h3 className="font-semibold text-picc-earth font-serif text-lg">{service.name}</h3>
            </div>
            {service.service_category && (
              <span className={`text-xs font-medium ${styles.accent} capitalize`}>
                {service.service_category}
              </span>
            )}
          </div>

          {/* Headline stat */}
          {metrics?.headline_stat_value && (
            <div className="text-right">
              <p className="text-2xl font-bold text-picc-ochre">{metrics.headline_stat_value}</p>
              {metrics.headline_stat_label && (
                <p className="text-xs text-picc-earth-300">{metrics.headline_stat_label}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {metrics?.clients_served != null && (
            <div className="text-center">
              <p className="text-xl font-bold text-picc-earth">{metrics.clients_served.toLocaleString()}</p>
              <p className="text-xs text-picc-earth-300">Clients</p>
            </div>
          )}
          {metrics?.sessions_delivered != null && (
            <div className="text-center">
              <p className="text-xl font-bold text-picc-earth">{metrics.sessions_delivered.toLocaleString()}</p>
              <p className="text-xs text-picc-earth-300">Sessions</p>
            </div>
          )}
          {metrics?.staff_count != null && (
            <div className="text-center">
              <p className="text-xl font-bold text-picc-earth">{metrics.staff_count}</p>
              <p className="text-xs text-picc-earth-300">Staff</p>
            </div>
          )}
          {metrics?.events_held != null && (
            <div className="text-center">
              <p className="text-xl font-bold text-picc-earth">{metrics.events_held}</p>
              <p className="text-xs text-picc-earth-300">Events</p>
            </div>
          )}
        </div>

        {/* Stories + quotes count */}
        <div className="flex items-center gap-4 text-sm text-picc-earth-300">
          {service.story_count > 0 && (
            <span className="flex items-center gap-1">
              <BespokeIcon name="story" size={14} />
              {service.story_count} stories
            </span>
          )}
          {service.quote_count > 0 && (
            <span className="flex items-center gap-1">
              <BespokeIcon name="quote" size={14} />
              {service.quote_count} quotes
            </span>
          )}
        </div>

        {/* Expandable section */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 mt-3 text-sm text-picc-ochre hover:underline"
        >
          {expanded ? 'Less' : 'More details'}
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <div className="mt-4 space-y-4">
            {service.description && (
              <p className="text-sm text-picc-earth-300">{service.description}</p>
            )}

            {metrics?.key_achievement && (
              <div className="flex items-start gap-2 bg-sage-50 rounded-xl p-3">
                <Award className="w-5 h-5 text-sage-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-sage-700 mb-1">Key Achievement</p>
                  <p className="text-sm text-picc-earth">{metrics.key_achievement}</p>
                </div>
              </div>
            )}

            {service.featured_quote && (
              <div className="bg-warm-50 rounded-xl p-4">
                <BespokeIcon name="quote" size={16} className="text-picc-ochre opacity-40 mb-2" />
                <p className="text-sm text-picc-earth italic font-serif">
                  &ldquo;{service.featured_quote}&rdquo;
                </p>
                {service.featured_quote_speaker && (
                  <p className="text-xs text-picc-earth-300 mt-2">— {service.featured_quote_speaker}</p>
                )}
              </div>
            )}

            <Link
              href={`/services`}
              className="inline-flex items-center gap-1 text-sm text-picc-ochre hover:underline font-medium"
            >
              View service details →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
