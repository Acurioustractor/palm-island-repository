'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import MediaPickerDialog from '@/components/admin/MediaPickerDialog';

interface ServiceOption {
  id: string;
  service_name: string;
  service_slug: string;
  service_category: string;
}

interface CoverPhoto {
  id: string;
  public_url: string;
  original_filename: string;
}

export default function CoverPhotosPage() {
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [coverPhotos, setCoverPhotos] = useState<Record<string, CoverPhoto>>({});
  const [loading, setLoading] = useState(true);
  const [setting, setSetting] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerService, setPickerService] = useState<string>('');
  const [pickerQuery, setPickerQuery] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        const taxRes = await fetch('/api/media/taxonomy', { cache: 'no-store' });
        const taxJson = await taxRes.json().catch(() => ({}));
        const svcList: ServiceOption[] = taxJson.services || [];
        setServices(svcList);

        const covers: Record<string, CoverPhoto> = {};

        // page_context-based covers (what SmartImage reads)
        for (const svc of svcList) {
          const contextRes = await fetch(
            `/api/media/list?pageContext=home&pageSection=service-${svc.service_slug}&featured=true&limit=1`,
            { signal: AbortSignal.timeout(5000) }
          ).catch(() => null);
          const contextJson = await contextRes?.json().catch(() => ({}));
          const contextMedia = contextJson?.data || [];
          if (contextMedia.length > 0) {
            covers[svc.service_slug] = {
              id: contextMedia[0].id,
              public_url: contextMedia[0].public_url,
              original_filename: contextMedia[0].original_filename || '',
            };
          }
        }

        // Tag-based fallback
        const coverRes = await fetch('/api/media/list?tags=hero&limit=200', {
          signal: AbortSignal.timeout(10000),
        });
        const coverJson = await coverRes.json().catch(() => ({}));
        const heroMedia = coverJson?.data || [];
        for (const item of heroMedia) {
          const tags: string[] = item.tags || [];
          for (const tag of tags) {
            if (tag.startsWith('service:')) {
              const slug = tag.replace('service:', '');
              if (!covers[slug]) {
                covers[slug] = {
                  id: item.id,
                  public_url: item.public_url,
                  original_filename: item.original_filename,
                };
              }
            }
          }
        }
        setCoverPhotos(covers);
      } catch (e) {
        console.error('Failed to load cover photos:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSetCover = async (mediaItem: { id: string; public_url: string; original_filename?: string | null }) => {
    if (!pickerService) return;
    setSetting(pickerService);
    setPickerOpen(false);

    try {
      const res = await fetch('/api/media/set-cover-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId: mediaItem.id, serviceSlug: pickerService }),
      });

      if (res.ok) {
        setCoverPhotos(prev => ({
          ...prev,
          [pickerService]: {
            id: mediaItem.id,
            public_url: mediaItem.public_url,
            original_filename: mediaItem.original_filename || '',
          },
        }));
      }
    } catch (e) {
      console.error('Failed to set cover:', e);
    } finally {
      setSetting(null);
      setPickerService('');
    }
  };

  const servicesByCategory = services.reduce<Record<string, ServiceOption[]>>((acc, svc) => {
    const cat = svc.service_category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(svc);
    return acc;
  }, {});

  const totalServices = services.length;
  const coveredServices = services.filter(s => coverPhotos[s.service_slug]).length;
  const progressPct = totalServices > 0 ? Math.round((coveredServices / totalServices) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <Link href="/picc/media" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Media Library
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-3">Cover Photos</h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Manage hero images for all services. Click any service to set or change its cover photo.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-12">
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-sm text-gray-600">
              {coveredServices} of {totalServices} services have cover photos
            </p>
            <p className="text-sm font-medium text-gray-900">{progressPct}%</p>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-gray-900 rounded-full h-1.5 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Services by category */}
        {Object.entries(servicesByCategory).map(([category, svcs]) => (
          <div key={category} className="mb-12">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              {category}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {svcs.map(svc => {
                const cover = coverPhotos[svc.service_slug];
                const isSettingThis = setting === svc.service_slug;

                return (
                  <button
                    key={svc.id}
                    onClick={() => {
                      setPickerService(svc.service_slug);
                      setPickerQuery(svc.service_name.split(/[\s-]+/)[0]);
                      setPickerOpen(true);
                    }}
                    disabled={isSettingThis}
                    className={`group text-left rounded-lg overflow-hidden transition-all hover:shadow-md border ${
                      cover ? 'border-gray-200' : 'border-dashed border-gray-300'
                    }`}
                  >
                    {/* Image */}
                    <div className="aspect-video bg-gray-50 relative">
                      {cover ? (
                        <img
                          src={cover.public_url}
                          alt={svc.service_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs text-gray-400">No cover</span>
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {cover ? 'Change' : 'Set cover'}
                        </span>
                      </div>

                      {isSettingThis && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin text-white" />
                        </div>
                      )}
                    </div>

                    {/* Label */}
                    <div className="px-3 py-2.5">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {svc.service_name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Media Picker Dialog */}
        <MediaPickerDialog
          open={pickerOpen}
          kind="image"
          initialQuery={pickerQuery}
          onClose={() => { setPickerOpen(false); setPickerService(''); setPickerQuery(''); }}
          onPick={handleSetCover}
        />
      </div>
    </div>
  );
}
