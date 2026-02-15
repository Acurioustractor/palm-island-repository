'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Camera, CheckCircle2, AlertCircle, Star, Printer } from 'lucide-react';

interface ServiceOption {
  id: string;
  service_name: string;
  service_slug: string;
  service_category: string;
}

interface ServicePhotoStatus {
  count: number;
  hasCover: boolean;
}

interface PhotoShootChecklistProps {
  services: ServiceOption[];
}

const CATEGORY_ORDER = [
  'Health & Wellbeing',
  'Family & Children',
  'Justice & Safety',
  'Culture & Community',
  'Education & Training',
  'Economic Development',
  'Corporate',
];

const CATEGORY_COLORS: Record<string, string> = {
  'Health & Wellbeing': 'text-sage-700',
  'Family & Children': 'text-picc-red',
  'Justice & Safety': 'text-red-700',
  'Culture & Community': 'text-picc-ochre',
  'Education & Training': 'text-picc-ochre',
  'Economic Development': 'text-sage-700',
  'Corporate': 'text-gray-700',
};

export default function PhotoShootChecklist({ services }: PhotoShootChecklistProps) {
  const [expanded, setExpanded] = useState(true);
  const [photoStatus, setPhotoStatus] = useState<Record<string, ServicePhotoStatus>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        // Fetch all service-tagged media in one query
        const res = await fetch('/api/media/list?limit=1000&tags=', {
          signal: AbortSignal.timeout(10000),
        });
        const json = await res.json().catch(() => ({}));
        const allMedia = json?.data || [];

        const status: Record<string, ServicePhotoStatus> = {};
        for (const svc of services) {
          status[svc.service_slug] = { count: 0, hasCover: false };
        }

        for (const item of allMedia) {
          const tags: string[] = item.tags || [];
          const isHero = tags.includes('hero');
          for (const tag of tags) {
            if (tag.startsWith('service:')) {
              const slug = tag.replace('service:', '');
              if (status[slug]) {
                status[slug].count++;
                if (isHero) status[slug].hasCover = true;
              }
            }
          }
        }

        setPhotoStatus(status);
      } catch (e) {
        console.error('Failed to load photo status:', e);
      } finally {
        setLoading(false);
      }
    };

    if (services.length > 0) loadStatus();
  }, [services]);

  const servicesByCategory = services.reduce<Record<string, ServiceOption[]>>((acc, svc) => {
    const cat = svc.service_category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(svc);
    return acc;
  }, {});

  const sortedCategories = Object.keys(servicesByCategory).sort(
    (a, b) => (CATEGORY_ORDER.indexOf(a) ?? 99) - (CATEGORY_ORDER.indexOf(b) ?? 99)
  );

  const totalServices = services.length;
  const servicesWithPhotos = Object.values(photoStatus).filter(s => s.count > 0).length;
  const servicesWithCovers = Object.values(photoStatus).filter(s => s.hasCover).length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 print:border-none">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors print:hidden"
      >
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-picc-red" />
          <h3 className="font-semibold text-gray-900">Photo Shoot Checklist</h3>
          <span className="text-xs bg-warm-100 text-picc-red px-2 py-0.5 rounded-full">
            {servicesWithPhotos}/{totalServices}
          </span>
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          {/* Shot guidelines */}
          <div className="bg-warm-50 rounded-lg p-3 mb-4 text-xs text-gray-600 print:bg-gray-50">
            <p className="font-semibold text-gray-700 mb-1">Shot Guidelines:</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>Landscape orientation (16:9)</li>
              <li>Show building/activity/people</li>
              <li>Good lighting, morning or late afternoon</li>
              <li>Min 2000px width for hero images</li>
              <li>Ask permission before photographing people</li>
            </ul>
          </div>

          {/* Progress */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
            <div className="bg-gray-50 rounded p-2 text-center">
              <div className="font-bold text-gray-900">{servicesWithPhotos}/{totalServices}</div>
              <div className="text-gray-500">Have photos</div>
            </div>
            <div className="bg-gray-50 rounded p-2 text-center">
              <div className="font-bold text-gray-900">{servicesWithCovers}/{totalServices}</div>
              <div className="text-gray-500">Have covers</div>
            </div>
          </div>

          {/* Checklist by category */}
          {loading ? (
            <p className="text-sm text-gray-500 text-center py-4">Loading status...</p>
          ) : (
            <div className="space-y-4">
              {sortedCategories.map(category => (
                <div key={category}>
                  <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${CATEGORY_COLORS[category] || 'text-gray-500'}`}>
                    {category}
                  </h4>
                  <div className="space-y-1">
                    {servicesByCategory[category].map(svc => {
                      const status = photoStatus[svc.service_slug] || { count: 0, hasCover: false };
                      const hasPhotos = status.count > 0;

                      return (
                        <div
                          key={svc.id}
                          className="flex items-center gap-2 text-sm py-1"
                        >
                          {/* Checkbox indicator */}
                          {hasPhotos ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                          )}

                          {/* Service name */}
                          <span className={`flex-1 ${hasPhotos ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                            {svc.service_name}
                          </span>

                          {/* Photo count */}
                          {hasPhotos && (
                            <span className="text-xs text-gray-400">{status.count}</span>
                          )}

                          {/* Cover indicator */}
                          {status.hasCover ? (
                            <Star className="w-3.5 h-3.5 text-picc-ochre flex-shrink-0" />
                          ) : hasPhotos ? (
                            <span title="No cover photo"><AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" /></span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Print button */}
          <button
            onClick={() => window.print()}
            className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors print:hidden"
          >
            <Printer className="w-4 h-4" />
            Print Checklist
          </button>
        </div>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body > *:not(.print-checklist) { display: none !important; }
          .print-checklist { display: block !important; }
        }
      `}</style>
    </div>
  );
}
