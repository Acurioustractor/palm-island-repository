'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  X,
  Users,
  Activity,
  ExternalLink,
  Quote,
  MapPin,
  Navigation,
  Loader2,
  ImageIcon,
} from 'lucide-react';
import type { ExploreService } from '@/app/(public)/explore/page';

interface ServiceMedia {
  id: string;
  public_url: string;
  title?: string;
  caption?: string;
  alt_text?: string;
}

interface StoryQuote {
  text: string;
  author: string;
}

export function ExploreServiceSidebar({
  service,
  media,
  storyQuote,
  loading,
  onClose,
}: {
  service: ExploreService;
  media: ServiceMedia[];
  storyQuote: StoryQuote | null;
  loading: boolean;
  onClose: () => void;
}) {
  const color = service.service_color || '#C8922A';

  const directionsUrl =
    service.latitude && service.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${service.latitude},${service.longitude}`
      : null;

  return (
    <motion.div
      initial={{ x: 440, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 440, opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="absolute top-0 right-0 h-full w-full sm:w-[420px] z-[1001] flex flex-col bg-white shadow-2xl"
    >
      {/* Hero image / header */}
      <div className="relative shrink-0">
        {service.hero_photo ? (
          <div className="relative aspect-[16/10] overflow-hidden">
            <img
              src={service.hero_photo.public_url}
              alt={service.hero_photo.alt_text || service.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div
                className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold text-white/90 mb-2"
                style={{ backgroundColor: `${color}cc` }}
              >
                {service.service_category?.replace(/_/g, ' ') || 'Service'}
              </div>
              <h2 className="text-2xl font-bold text-white leading-tight">
                {service.name}
              </h2>
            </div>
          </div>
        ) : (
          <div
            className="aspect-[16/10] flex flex-col items-center justify-center"
            style={{ backgroundColor: `${color}15` }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
              style={{ backgroundColor: color }}
            >
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div
              className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2"
              style={{ color, backgroundColor: `${color}20` }}
            >
              {service.service_category?.replace(/_/g, ' ') || 'Service'}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center px-4">
              {service.name}
            </h2>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-5 space-y-5">
          {/* Description */}
          {service.description && (
            <p className="text-gray-600 text-sm leading-relaxed">
              {service.description}
            </p>
          )}

          {/* Stats */}
          {service.stats && (
            <div className="flex flex-wrap gap-3">
              {service.stats.staff_count != null && (
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                  <Users className="w-4 h-4 text-picc-ochre" />
                  <span className="text-sm">
                    <strong>{service.stats.staff_count}</strong>{' '}
                    <span className="text-gray-500">staff</span>
                  </span>
                </div>
              )}
              {service.stats.clients_served != null && (
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                  <Activity className="w-4 h-4 text-picc-red" />
                  <span className="text-sm">
                    <strong>{service.stats.clients_served.toLocaleString()}</strong>{' '}
                    <span className="text-gray-500">served</span>
                  </span>
                </div>
              )}
              {service.stats.key_achievement && (
                <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                  {service.stats.key_achievement}
                </div>
              )}
            </div>
          )}

          {/* Story quote */}
          {storyQuote && (
            <div className="bg-warm-50 rounded-xl p-4 border-l-4 border-picc-ochre-300">
              <Quote className="w-4 h-4 text-picc-ochre-300 mb-2" />
              <p className="text-gray-800 italic text-sm leading-relaxed mb-2">
                &ldquo;{storyQuote.text}&rdquo;
              </p>
              <p className="text-picc-ochre text-xs font-semibold">
                — {storyQuote.author}
              </p>
            </div>
          )}

          {/* Photo gallery */}
          {loading ? (
            <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading photos...
            </div>
          ) : media.length > 0 ? (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Photos
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {media.slice(0, 6).map((m) => (
                  <div
                    key={m.id}
                    className="aspect-square rounded-lg overflow-hidden bg-gray-100 group cursor-pointer"
                  >
                    <img
                      src={m.public_url}
                      alt={m.alt_text || m.title || 'Service photo'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
              {media.length > 6 && (
                <p className="text-xs text-gray-400 mt-2 text-center">
                  +{media.length - 6} more photos
                </p>
              )}
            </div>
          ) : !loading && (
            <div className="flex items-center gap-2 text-gray-300 text-sm py-2">
              <ImageIcon className="w-4 h-4" />
              No photos yet
            </div>
          )}
        </div>
      </div>

      {/* Action buttons (sticky bottom) */}
      <div className="shrink-0 border-t border-gray-100 p-4 bg-white flex gap-3">
        <Link
          href={`/services/${service.slug}`}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
        >
          Learn More
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        {directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            Directions
          </a>
        )}
      </div>
    </motion.div>
  );
}
