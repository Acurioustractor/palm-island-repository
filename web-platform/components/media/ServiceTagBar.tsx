'use client';

import { Loader2 } from 'lucide-react';

interface Service {
  id: string;
  service_name: string;
  service_slug: string;
  service_category: string;
}

interface ServiceTagBarProps {
  services: Service[];
  selectedCount: number;
  loading: boolean;
  onAssign: (serviceSlug: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Health & Wellbeing': 'bg-sage-100 text-sage-700 hover:bg-sage-200 border-sage-200',
  'Family & Children': 'bg-warm-100 text-picc-red hover:bg-warm-200 border-warm-200',
  'Justice & Safety': 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200',
  'Culture & Community': 'bg-picc-ochre-100 text-picc-ochre-700 hover:bg-picc-ochre-200 border-picc-ochre-200',
  'Education & Training': 'bg-warm-100 text-picc-ochre hover:bg-warm-200 border-warm-200',
  'Economic Development': 'bg-sage-100 text-sage-700 hover:bg-sage-200 border-sage-200',
  'Corporate': 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200',
};

function getColorClass(category: string): string {
  return CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200';
}

export default function ServiceTagBar({ services, selectedCount, loading, onAssign }: ServiceTagBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Quick assign service to {selectedCount} selected:
        </span>
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {services.map(svc => (
          <button
            key={svc.id}
            onClick={() => onAssign(svc.service_slug)}
            disabled={loading}
            className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors disabled:opacity-50 ${getColorClass(svc.service_category)}`}
          >
            {svc.service_name}
          </button>
        ))}
      </div>
    </div>
  );
}
