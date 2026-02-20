'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, ImageIcon, X, GripVertical, Loader2 } from 'lucide-react';
import MediaPickerDialog from '@/components/admin/MediaPickerDialog';
import { PAGE_SLOTS, type PageSlot } from '@/lib/media/page-slot-config';

interface SlotMedia {
  id: string;
  public_url: string;
  title?: string | null;
  display_order: number;
}

type SlotMap = Record<string, SlotMedia[]>; // key = `${page}:${section}`

function slotKey(slot: PageSlot) {
  return `${slot.page}:${slot.section}`;
}

export default function PageSlotsPage() {
  const [slotMap, setSlotMap] = useState<SlotMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<{ slot: PageSlot; index: number } | null>(null);

  const loadAllSlots = useCallback(async () => {
    setLoading(true);
    try {
      const results: SlotMap = {};
      await Promise.all(
        PAGE_SLOTS.map(async (slot) => {
          const key = slotKey(slot);
          const params = new URLSearchParams({
            pageContext: slot.page,
            pageSection: slot.section,
            limit: String(slot.slots),
            sort: 'display_order',
            fileType: 'image',
          });
          const res = await fetch(`/api/media/list?${params}`);
          if (res.ok) {
            const data = await res.json();
            results[key] = (data.data || []).map((m: any) => ({
              id: m.id,
              public_url: m.public_url,
              title: m.title,
              display_order: m.display_order ?? 0,
            }));
          } else {
            results[key] = [];
          }
        })
      );
      setSlotMap(results);
    } catch (err) {
      console.error('Failed to load slots:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllSlots();
  }, [loadAllSlots]);

  const openPicker = (slot: PageSlot, index: number) => {
    setActiveSlot({ slot, index });
    setPickerOpen(true);
  };

  const assignPhoto = async (mediaId: string, slot: PageSlot, displayOrder: number) => {
    const key = slotKey(slot);
    setSaving(key);
    try {
      // If replacing an existing photo at this index, clear the old one first
      const existing = slotMap[key]?.[displayOrder];
      if (existing && existing.id !== mediaId) {
        await fetch(`/api/media/${existing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page_context: null, page_section: null, display_order: 0 }),
        });
      }

      // Assign the new photo
      await fetch(`/api/media/${mediaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_context: slot.page,
          page_section: slot.section,
          display_order: displayOrder,
        }),
      });

      // Reload this slot's data
      const params = new URLSearchParams({
        pageContext: slot.page,
        pageSection: slot.section,
        limit: String(slot.slots),
        sort: 'display_order',
        fileType: 'image',
      });
      const res = await fetch(`/api/media/list?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSlotMap((prev) => ({
          ...prev,
          [key]: (data.data || []).map((m: any) => ({
            id: m.id,
            public_url: m.public_url,
            title: m.title,
            display_order: m.display_order ?? 0,
          })),
        }));
      }
    } catch (err) {
      console.error('Failed to assign photo:', err);
    } finally {
      setSaving(null);
    }
  };

  const clearSlot = async (slot: PageSlot, mediaId: string) => {
    const key = slotKey(slot);
    setSaving(key);
    try {
      await fetch(`/api/media/${mediaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_context: null, page_section: null, display_order: 0 }),
      });
      setSlotMap((prev) => ({
        ...prev,
        [key]: (prev[key] || []).filter((m) => m.id !== mediaId),
      }));
    } catch (err) {
      console.error('Failed to clear slot:', err);
    } finally {
      setSaving(null);
    }
  };

  const handlePick = (media: { id: string; public_url: string; title?: string | null }) => {
    if (!activeSlot) return;
    setPickerOpen(false);
    assignPhoto(media.id, activeSlot.slot, activeSlot.index);
    setActiveSlot(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/picc/media"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Media Library
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Slots</h1>
          <p className="text-gray-600">
            See where photos appear on the live site and assign them to specific page sections.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-10">
            {PAGE_SLOTS.map((slot) => {
              const key = slotKey(slot);
              const photos = slotMap[key] || [];
              const isSaving = saving === key;
              const emptyCount = Math.max(0, slot.slots - photos.length);

              return (
                <div key={key} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{slot.label}</h2>
                      <p className="text-sm text-gray-500">
                        {photos.length} / {slot.slots} assigned
                        {slot.ordered && ' · ordered'}
                      </p>
                    </div>
                    {isSaving && (
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    )}
                  </div>

                  <div className={`grid gap-4 ${
                    slot.slots === 1
                      ? 'grid-cols-1 max-w-xs'
                      : slot.slots <= 4
                        ? 'grid-cols-2 md:grid-cols-4'
                        : 'grid-cols-3 md:grid-cols-5 lg:grid-cols-6'
                  }`}>
                    {/* Filled slots */}
                    {photos.map((photo, idx) => (
                      <div
                        key={photo.id}
                        className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-picc-red transition-all"
                        onClick={() => openPicker(slot, idx)}
                      >
                        <img
                          src={photo.public_url}
                          alt={photo.title || 'Assigned photo'}
                          className="w-full h-full object-cover"
                        />
                        {slot.ordered && (
                          <div className="absolute top-2 left-2 z-10">
                            <span className="px-2 py-0.5 bg-black/60 text-white text-xs rounded-full font-medium">
                              {idx + 1}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Replace
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearSlot(slot, photo.id);
                          }}
                          className="absolute top-2 right-2 z-10 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Remove from slot"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {/* Empty slots */}
                    {Array.from({ length: emptyCount }).map((_, idx) => (
                      <button
                        key={`empty-${idx}`}
                        onClick={() => openPicker(slot, photos.length + idx)}
                        className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-picc-red hover:text-picc-red transition-colors"
                      >
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-xs font-medium">Add photo</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Media Picker Dialog */}
      <MediaPickerDialog
        open={pickerOpen}
        kind="image"
        onClose={() => {
          setPickerOpen(false);
          setActiveSlot(null);
        }}
        onPick={handlePick}
      />
    </div>
  );
}
