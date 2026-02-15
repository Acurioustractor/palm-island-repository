'use client';

import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface ServiceLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  serviceType?: string;
  clientsServed?: number;
}

interface ServiceMapProps {
  services: ServiceLocation[];
  height?: number;
}

const TYPE_COLORS: Record<string, string> = {
  health: '#EF4444',
  community: '#8B1A1A',
  social_enterprise: '#5B7B5E',
  family: '#C8922A',
  justice: '#F59E0B',
  cultural: '#EC4899',
};

export default function ServiceMap({ services, height = 400 }: ServiceMapProps) {
  // Palm Island center
  const center: [number, number] = [-18.7285, 146.5808];

  if (services.length === 0) {
    return (
      <div className="flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200" style={{ height }}>
        <span className="text-gray-500 text-sm">No service locations available</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height }}>
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {services.map(svc => (
          <CircleMarker
            key={svc.id}
            center={[svc.lat, svc.lng]}
            radius={svc.clientsServed ? Math.max(6, Math.min(16, Math.sqrt(svc.clientsServed) * 0.3)) : 8}
            pathOptions={{
              color: '#fff',
              weight: 2,
              fillColor: TYPE_COLORS[svc.serviceType || ''] || '#8B1A1A',
              fillOpacity: 0.8,
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{svc.name}</div>
                {svc.serviceType && (
                  <div className="text-gray-500 capitalize">{svc.serviceType.replace('_', ' ')}</div>
                )}
                {svc.clientsServed && (
                  <div className="text-picc-red">{svc.clientsServed.toLocaleString()} clients</div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
