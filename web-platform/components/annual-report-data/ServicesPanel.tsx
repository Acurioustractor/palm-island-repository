'use client';

import { useState, useMemo } from 'react';
import { Download, Search } from 'lucide-react';
import ServiceMetricsTable from './ServiceMetricsTable';

interface ServiceMetric {
  organization_service_id: string;
  service_name: string;
  service_slug: string | null;
  service_category: string | null;
  metrics: {
    id?: string;
    clients_served: number | null;
    sessions_delivered: number | null;
    events_held: number | null;
    staff_count: number | null;
    key_achievement: string | null;
    headline_stat_value: string | null;
    headline_stat_label: string | null;
  } | null;
}

interface ServicesPanelProps {
  services: ServiceMetric[];
  previousServices: ServiceMetric[];
  fiscalYear: number;
  onSave: (data: any) => Promise<void>;
}

export default function ServicesPanel({
  services,
  previousServices,
  fiscalYear,
  onSave,
}: ServicesPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = useMemo(
    () => Array.from(new Set(services.map(s => s.service_category || 'Other'))).sort(),
    [services]
  );

  const filteredServices = useMemo(() => {
    let result = services;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => s.service_name.toLowerCase().includes(q));
    }

    if (categoryFilter !== 'all') {
      result = result.filter(s => (s.service_category || 'Other') === categoryFilter);
    }

    return result;
  }, [services, searchQuery, categoryFilter]);

  const filteredPrevious = useMemo(() => {
    const filteredIds = new Set(filteredServices.map(s => s.organization_service_id));
    return previousServices.filter(s => filteredIds.has(s.organization_service_id));
  }, [previousServices, filteredServices]);

  const exportCSV = () => {
    const headers = [
      'Service',
      'Category',
      'Clients Served',
      'Sessions',
      'Events',
      'Staff',
      'Headline Stat',
      'Key Achievement',
    ];
    const rows = services.map(s => [
      s.service_name,
      s.service_category || '',
      s.metrics?.clients_served ?? '',
      s.metrics?.sessions_delivered ?? '',
      s.metrics?.events_held ?? '',
      s.metrics?.staff_count ?? '',
      s.metrics?.headline_stat_value ?? '',
      s.metrics?.key_achievement ?? '',
    ]);

    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `service-metrics-${fiscalYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search services..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-purple-400 focus:outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-purple-400 focus:outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ml-auto"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Instruction */}
      <p className="text-xs text-gray-500 mb-3">
        Click any cell to edit. Data auto-saves on blur.
      </p>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <ServiceMetricsTable
          services={filteredServices}
          fiscalYear={fiscalYear}
          previousYearServices={filteredPrevious}
          onSave={onSave}
        />
      </div>
    </div>
  );
}
