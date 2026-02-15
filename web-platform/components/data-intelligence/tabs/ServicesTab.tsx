'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import ServiceHeatMap from '../ServiceHeatMap';
import { Treemap, ResponsiveContainer, Tooltip, Rectangle } from 'recharts';

const ServiceMap = dynamic(() => import('../ServiceMap'), { ssr: false });

interface ServiceData {
  id: string;
  name: string;
  slug: string;
  clients_served: number;
  sessions_delivered: number;
  staff_count: number;
  lat?: number;
  lng?: number;
  serviceType?: string;
}

export default function ServicesTab() {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Fetch network data which includes service nodes with metrics
        const res = await fetch('/api/data-intelligence/network?domains=service');
        if (res.ok) {
          const data = await res.json();
          const serviceNodes = (data.nodes || [])
            .filter((n: any) => n.type === 'service')
            .map((n: any) => ({
              id: n.id,
              name: n.label,
              slug: n.metadata?.slug || '',
              clients_served: n.metadata?.clientsServed || 0,
              sessions_delivered: n.metadata?.sessionsDelivered || 0,
              staff_count: n.metadata?.staffCount || 0,
              serviceType: n.metadata?.serviceType || 'community',
            }));
          setServices(serviceNodes);
        }
      } catch (e) {
        console.error('Failed to load service data:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  // Heat map data
  const heatMapData = services.map(s => ({
    serviceId: s.id,
    serviceName: s.name,
    metrics: {
      Clients: s.clients_served || null,
      Sessions: s.sessions_delivered || null,
      Staff: s.staff_count || null,
    },
  }));

  // Treemap data (sized by clients served)
  const treemapData = services
    .filter(s => s.clients_served > 0)
    .map(s => ({
      name: s.name.length > 20 ? s.name.substring(0, 18) + '...' : s.name,
      size: s.clients_served,
      fullName: s.name,
    }));

  // Map locations (Palm Island coordinates from migration data)
  const mapServices = services.map((s, i) => ({
    id: s.id,
    name: s.name,
    lat: -18.7275 + (i * 0.0003),
    lng: 146.5808 + ((i % 4) * 0.0004),
    serviceType: s.serviceType,
    clientsServed: s.clients_served,
  }));

  const TREEMAP_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#6366F1', '#14B8A6'];

  return (
    <div className="space-y-6">
      {/* Service Heat Map */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Performance Heatmap</h3>
        <ServiceHeatMap
          data={heatMapData}
          metricLabels={['Clients', 'Sessions', 'Staff']}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Treemap */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Delivery by Volume</h3>
          <div className="h-64">
            {treemapData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={treemapData}
                  dataKey="size"
                  aspectRatio={4 / 3}
                  stroke="#fff"
                >
                  <Tooltip
                    formatter={(value: number, _name: string, props: any) => [
                      `${value.toLocaleString()} clients`,
                      props.payload?.fullName || props.payload?.name
                    ]}
                  />
                </Treemap>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">No client data available</div>
            )}
          </div>
        </div>

        {/* Geographic Map */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Locations — Palm Island</h3>
          <ServiceMap services={mapServices} height={256} />
        </div>
      </div>

      {/* Service Summary Table */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-600">Service</th>
                <th className="text-right py-2 text-gray-600">Clients</th>
                <th className="text-right py-2 text-gray-600">Sessions</th>
                <th className="text-right py-2 text-gray-600">Staff</th>
              </tr>
            </thead>
            <tbody>
              {services
                .sort((a, b) => (b.clients_served || 0) - (a.clients_served || 0))
                .map((s, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2 font-medium text-gray-900">{s.name}</td>
                    <td className="py-2 text-right">{s.clients_served ? s.clients_served.toLocaleString() : '—'}</td>
                    <td className="py-2 text-right">{s.sessions_delivered ? s.sessions_delivered.toLocaleString() : '—'}</td>
                    <td className="py-2 text-right">{s.staff_count || '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
