'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, X, Users, Activity, ExternalLink, Quote, ImageIcon } from 'lucide-react';
import Link from 'next/link';

// Leaflet requires window — disable SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((m) => m.Marker),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('react-leaflet').then((m) => m.Tooltip),
  { ssr: false }
);

type ServiceMapItem = {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  service_category?: string | null;
  icon_name?: string | null;
  service_color?: string | null;
  staff_count?: number | null;
  clients_served?: number | null;
  metadata?: any;
  service_metrics?: any[];
};

type ServiceMedia = {
  id: string;
  public_url: string;
  title?: string;
  caption?: string;
};

const PALM_ISLAND_CENTER: [number, number] = [-18.7285, 146.5808];
const DEFAULT_ZOOM = 15;

function getLatLng(service: ServiceMapItem, index: number, total: number): [number, number] {
  const lat = Number(service?.metadata?.latitude ?? service?.metadata?.lat);
  const lng = Number(service?.metadata?.longitude ?? service?.metadata?.lng);

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return [lat, lng];
  }

  // Fallback: arrange in a circle around center
  const angle = (index / total) * Math.PI * 2;
  const radius = 0.003;
  return [
    PALM_ISLAND_CENTER[0] + radius * Math.cos(angle),
    PALM_ISLAND_CENTER[1] + radius * Math.sin(angle),
  ];
}

function getMetric(service: ServiceMapItem, key: string) {
  const metrics = service.service_metrics;
  if (Array.isArray(metrics) && metrics.length > 0) {
    return metrics[0]?.[key];
  }
  return null;
}

export function InteractiveServiceMap({
  services,
}: {
  services: ServiceMapItem[];
}) {
  const [activeService, setActiveService] = useState<ServiceMapItem | null>(null);
  const [media, setMedia] = useState<ServiceMedia[]>([]);
  const [storyQuote, setStoryQuote] = useState<{ text: string; author: string } | null>(null);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mounted, setMounted] = useState(false);

  const markers = useMemo(() => {
    return services.map((s, i) => ({
      service: s,
      position: getLatLng(s, i, services.length),
    }));
  }, [services]);

  const openService = async (service: ServiceMapItem) => {
    setActiveService(service);
    setLoadingMedia(true);
    setStoryQuote(null);
    const slug = service.slug || service.metadata?.slug;
    if (!slug) {
      setLoadingMedia(false);
      return;
    }

    try {
      const [mediaRes, storyRes] = await Promise.allSettled([
        fetch(`/api/public/service-media?slug=${slug}&limit=8`),
        fetch(`/api/public/service-story-quote?slug=${slug}`),
      ]);

      if (mediaRes.status === 'fulfilled' && mediaRes.value.ok) {
        const json = await mediaRes.value.json();
        setMedia(json.media || []);
      } else {
        setMedia([]);
      }

      if (storyRes.status === 'fulfilled' && storyRes.value.ok) {
        const json = await storyRes.value.json();
        if (json.quote) {
          setStoryQuote(json.quote);
        }
      }
    } catch {
      setMedia([]);
    } finally {
      setLoadingMedia(false);
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
      {/* Map */}
      <div className="h-[520px] w-full bg-gradient-to-br from-[#1e3a5f] to-[#2d6a4f]">
        <MapContainer
          center={PALM_ISLAND_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={false}
          className="h-full w-full z-0"
          whenReady={() => setMounted(true)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mounted &&
            markers.map(({ service, position }) => (
              <ServiceMarker
                key={service.id}
                service={service}
                position={position}
                isActive={activeService?.id === service.id}
                onClick={() => openService(service)}
              />
            ))}
        </MapContainer>
      </div>

      {/* Detail Drawer */}
      {activeService && (
        <div className="border-t border-gray-200 bg-white p-6 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: activeService.service_color || '#C8922A' }}
                >
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{activeService.name}</h3>
                  <span className="text-sm text-gray-500 capitalize">
                    {activeService.service_category?.replace(/_/g, ' ') || 'Service'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveService(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {activeService.description && (
              <p className="text-gray-600 mb-4 line-clamp-3">{activeService.description}</p>
            )}

            {/* Metrics */}
            <div className="flex gap-6 mb-4">
              {(getMetric(activeService, 'staff_count') || activeService.staff_count) && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-picc-ochre" />
                  <span className="font-semibold">
                    {getMetric(activeService, 'staff_count') || activeService.staff_count}
                  </span>
                  <span className="text-gray-500">staff</span>
                </div>
              )}
              {(getMetric(activeService, 'clients_served') || activeService.clients_served) && (
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-picc-red" />
                  <span className="font-semibold">
                    {getMetric(activeService, 'clients_served') || activeService.clients_served}
                  </span>
                  <span className="text-gray-500">served</span>
                </div>
              )}
              {getMetric(activeService, 'key_achievement') && (
                <div className="text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full">
                  {getMetric(activeService, 'key_achievement')}
                </div>
              )}
            </div>

            {/* Story Quote */}
            {storyQuote && (
              <div className="bg-warm-100 rounded-xl p-4 mb-4 border-l-4 border-picc-ochre-300">
                <Quote className="w-5 h-5 text-picc-ochre-300 mb-2" />
                <p className="text-gray-800 italic text-sm leading-relaxed mb-2">
                  &ldquo;{storyQuote.text}&rdquo;
                </p>
                <p className="text-picc-ochre text-xs font-semibold">
                  — {storyQuote.author}
                </p>
              </div>
            )}

            {/* Photos */}
            {loadingMedia ? (
              <div className="text-sm text-gray-500">Loading photos...</div>
            ) : media.length > 0 ? (
              <div className="grid grid-cols-4 gap-3 mb-4">
                {media.slice(0, 4).map((m) => (
                  <div key={m.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={m.public_url}
                      alt={m.title || m.caption || 'Service photo'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}

            {/* Link to service page */}
            {(activeService.slug || activeService.metadata?.slug) && (
              <Link
                href={`/services/${activeService.slug || activeService.metadata?.slug}`}
                className="inline-flex items-center gap-2 text-picc-ochre hover:text-picc-earth-600 font-semibold text-sm"
              >
                View full service page
                <ExternalLink className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ServiceMarker({
  service,
  position,
  isActive,
  onClick,
}: {
  service: ServiceMapItem;
  position: [number, number];
  isActive: boolean;
  onClick: () => void;
}) {
  // We need to create the icon dynamically on the client
  const icon = useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    const L = require('leaflet');
    const color = service.service_color || '#C8922A';
    const size = isActive ? 40 : 32;
    return L.divIcon({
      className: '',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background-color: ${color};
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
          transform: ${isActive ? 'scale(1.2)' : 'scale(1)'};
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }, [service.service_color, isActive]);

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={{ click: onClick }}
    >
      <Tooltip direction="top" offset={[0, -20]}>
        <span className="font-semibold">{service.name}</span>
      </Tooltip>
    </Marker>
  );
}

export default InteractiveServiceMap;
