'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { ExploreServiceSidebar } from './ExploreServiceSidebar';
import { ExploreCategoryFilter } from './ExploreCategoryFilter';
import type { ExploreService } from '@/app/(public)/explore/page';

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

const PALM_ISLAND_CENTER: [number, number] = [-18.7285, 146.5808];
const DEFAULT_ZOOM = 15;

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

export default function ExploreMapClient({
  services,
}: {
  services: ExploreService[];
}) {
  const [selectedService, setSelectedService] = useState<ExploreService | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [media, setMedia] = useState<ServiceMedia[]>([]);
  const [storyQuote, setStoryQuote] = useState<StoryQuote | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mapRef, setMapRef] = useState<any>(null);
  const [mapStyle, setMapStyle] = useState<'satellite' | 'street'>('satellite');

  // Deep-link support via URL search params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const serviceSlug = params.get('service');
    if (serviceSlug && services.length > 0) {
      const svc = services.find((s) => s.slug === serviceSlug);
      if (svc) {
        // Slight delay to let map mount
        setTimeout(() => openService(svc), 500);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const s of services) {
      if (s.service_category) cats.add(s.service_category);
    }
    return Array.from(cats).sort();
  }, [services]);

  const filteredServices = useMemo(() => {
    if (!categoryFilter) return services;
    return services.filter((s) => s.service_category === categoryFilter);
  }, [services, categoryFilter]);

  const markers = useMemo(() => {
    return filteredServices
      .filter((s) => s.latitude != null && s.longitude != null)
      .map((s, i) => ({
        service: s,
        position: [s.latitude!, s.longitude!] as [number, number],
      }));
  }, [filteredServices]);

  // Services without coordinates get placed in a circle
  const fallbackMarkers = useMemo(() => {
    const noCoords = filteredServices.filter((s) => s.latitude == null || s.longitude == null);
    return noCoords.map((s, i) => {
      const angle = (i / Math.max(noCoords.length, 1)) * Math.PI * 2;
      const radius = 0.004;
      return {
        service: s,
        position: [
          PALM_ISLAND_CENTER[0] + radius * Math.cos(angle),
          PALM_ISLAND_CENTER[1] + radius * Math.sin(angle),
        ] as [number, number],
      };
    });
  }, [filteredServices]);

  const allMarkers = useMemo(
    () => [...markers, ...fallbackMarkers],
    [markers, fallbackMarkers]
  );

  const openService = useCallback(async (service: ExploreService) => {
    setSelectedService(service);
    setLoadingDetail(true);
    setMedia([]);
    setStoryQuote(null);

    // Update URL without navigation
    const url = new URL(window.location.href);
    url.searchParams.set('service', service.slug);
    window.history.replaceState({}, '', url.toString());

    // Fly to service on map
    if (mapRef && service.latitude && service.longitude) {
      mapRef.flyTo([service.latitude, service.longitude], 17, {
        duration: 1.2,
      });
    }

    // Fetch media + quote in parallel
    try {
      const [mediaRes, quoteRes] = await Promise.allSettled([
        fetch(`/api/public/service-media?slug=${service.slug}&limit=8`),
        fetch(`/api/public/service-story-quote?slug=${service.slug}`),
      ]);

      if (mediaRes.status === 'fulfilled' && mediaRes.value.ok) {
        const json = await mediaRes.value.json();
        setMedia(json.media || []);
      }

      if (quoteRes.status === 'fulfilled' && quoteRes.value.ok) {
        const json = await quoteRes.value.json();
        if (json.quote) setStoryQuote(json.quote);
      }
    } catch {
      // Silently fail — sidebar still shows static data
    } finally {
      setLoadingDetail(false);
    }
  }, [mapRef]);

  const closeService = useCallback(() => {
    setSelectedService(null);
    setMedia([]);
    setStoryQuote(null);

    // Clear URL param
    const url = new URL(window.location.href);
    url.searchParams.delete('service');
    window.history.replaceState({}, '', url.toString());

    // Zoom back out
    if (mapRef) {
      mapRef.flyTo(PALM_ISLAND_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
    }
  }, [mapRef]);

  // Keyboard: Escape to close
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedService) closeService();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedService, closeService]);

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Map */}
      <div className="absolute inset-0">
        <MapContainer
          center={PALM_ISLAND_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom
          className="h-full w-full z-0"
          whenReady={() => setMounted(true)}
          ref={(ref: any) => {
            if (ref) setMapRef(ref);
          }}
        >
          {mapStyle === 'satellite' ? (
            <TileLayer
              attribution='&copy; Google'
              url={`https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''}`}
              maxZoom={20}
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}
          {mounted &&
            allMarkers.map(({ service, position }) => (
              <ExploreMarker
                key={service.id}
                service={service}
                position={position}
                isActive={selectedService?.id === service.id}
                onClick={() => openService(service)}
              />
            ))}
        </MapContainer>
      </div>

      {/* Category filter overlay */}
      <div className="absolute top-4 left-4 z-[1000]">
        <ExploreCategoryFilter
          categories={categories}
          activeCategory={categoryFilter}
          onCategoryChange={setCategoryFilter}
          serviceCounts={services}
        />
      </div>

      {/* Service count badge */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 shadow-sm">
          {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Map style toggle */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <button
          onClick={() => setMapStyle(mapStyle === 'satellite' ? 'street' : 'satellite')}
          className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 shadow-sm hover:bg-white transition-colors"
        >
          {mapStyle === 'satellite' ? 'Street View' : 'Satellite'}
        </button>
      </div>

      {/* Right sidebar */}
      <AnimatePresence>
        {selectedService && (
          <ExploreServiceSidebar
            service={selectedService}
            media={media}
            storyQuote={storyQuote}
            loading={loadingDetail}
            onClose={closeService}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Muted color palette by service category ────────────────────
// Earthy, warm tones that align with the PICC brand

const MUTED_CATEGORY_COLORS: Record<string, string> = {
  health: '#A67C6D',       // dusty terracotta
  family: '#8B7D6B',       // warm taupe
  community: '#7D8B6A',    // sage olive
  justice: '#8C7A8B',      // muted mauve
  culture: '#B08D57',      // warm ochre
  education: '#6B8A8B',    // dusty teal
  economic: '#9B8B6B',     // sandy brown
  environment: '#6B8B6D',  // muted green
  housing: '#8B8B7D',      // warm grey
  employment: '#7D7B6B',   // stone
  youth: '#6B7D8B',        // steel blue
  other: '#8B8580',        // warm neutral
};

function getMutedColor(service: ExploreService): string {
  const cat = service.service_category || 'other';
  return MUTED_CATEGORY_COLORS[cat] || MUTED_CATEGORY_COLORS.other;
}

// ─── Marker Component ──────────────────────────────────────────
// Hand-drawn style SVG pin with muted earthy colours per category.

function pinSvg(color: string, size: number) {
  // Slightly wobbly hand-drawn pin shape via cubic bezier curves
  return `
    <svg width="${size}" height="${Math.round(size * 1.4)}" viewBox="0 0 40 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#shadow)">
        <path d="
          M20 52
          C20 52 3.5 32 2.8 22
          C2.2 13.5 6 6.5 12 3.5
          C15 2 18 1.2 20 1.2
          C22 1.2 25 2 28 3.5
          C34 6.5 37.8 13.5 37.2 22
          C36.5 32 20 52 20 52Z
        " fill="${color}" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
        <circle cx="20" cy="19" r="7" fill="white" fill-opacity="0.9"/>
        <circle cx="20" cy="19" r="4.5" fill="${color}" fill-opacity="0.6"/>
      </g>
      <defs>
        <filter id="shadow" x="-2" y="-1" width="44" height="60" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.25"/>
        </filter>
      </defs>
    </svg>
  `;
}

function ExploreMarker({
  service,
  position,
  isActive,
  onClick,
}: {
  service: ExploreService;
  position: [number, number];
  isActive: boolean;
  onClick: () => void;
}) {
  const icon = useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    const L = require('leaflet');
    const color = getMutedColor(service);
    const size = isActive ? 38 : 30;
    const h = Math.round(size * 1.4);

    return L.divIcon({
      className: '',
      html: `
        <div style="
          cursor: pointer;
          transition: transform 0.2s;
          transform: ${isActive ? 'scale(1.2)' : 'scale(1)'};
          transform-origin: bottom center;
        ">
          ${pinSvg(color, size)}
        </div>
      `,
      iconSize: [size, h],
      iconAnchor: [size / 2, h],
    });
  }, [service.service_color, isActive]);

  return (
    <Marker position={position} icon={icon} eventHandlers={{ click: onClick }}>
      <Tooltip direction="top" offset={[0, -42]}>
        <span className="font-semibold text-sm">{service.name}</span>
      </Tooltip>
    </Marker>
  );
}
