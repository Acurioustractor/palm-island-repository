'use client';

import { useEffect, useState } from 'react';
import { Camera, Film, ChevronLeft, ChevronRight, X } from 'lucide-react';

type MediaItem = {
  id: string;
  public_url: string;
  title: string | null;
  alt_text: string | null;
  file_type: string;
  rating: number | null;
};

interface Props {
  /** Project tag to filter by, e.g. "project:elders-trips" */
  projectTag: string;
  /** Optional additional tags to include in search */
  extraTags?: string[];
  /** Section title */
  title?: string;
  /** Max photos to show */
  limit?: number;
}

export default function ProjectMediaGallery({
  projectTag,
  extraTags,
  title = 'Photo Gallery',
  limit = 12,
}: Props) {
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchMedia() {
      setLoading(true);
      try {
        const tags = [projectTag, ...(extraTags || [])].join(',');

        const [photoRes, videoRes] = await Promise.all([
          fetch(`/api/media/list?tags=${encodeURIComponent(projectTag)}&fileType=image&sort=rating&limit=${limit}`),
          fetch(`/api/media/list?tags=${encodeURIComponent(projectTag)}&fileType=video&limit=8`),
        ]);

        if (photoRes.ok) {
          const data = await photoRes.json();
          setPhotos(Array.isArray(data?.data) ? data.data : []);
        }
        if (videoRes.ok) {
          const data = await videoRes.json();
          setVideos(Array.isArray(data?.data) ? data.data : []);
        }
      } catch {
        // Fail silently — gallery just won't show
      } finally {
        setLoading(false);
      }
    }
    fetchMedia();
  }, [projectTag, extraTags, limit]);

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Camera className="h-6 w-6 text-picc-ochre" />
          {title}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (photos.length === 0 && videos.length === 0) return null;

  return (
    <div className="mb-8">
      {/* Videos section */}
      {videos.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Film className="h-6 w-6 text-picc-red" />
            Videos
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {videos.map((v) => {
              const url = v.public_url;
              // YouTube embed
              const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s?]+)/);
              if (ytMatch?.[1]) {
                return (
                  <div key={v.id} className="rounded-xl overflow-hidden border border-gray-200">
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                        title={v.title || 'Video'}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    {v.title && (
                      <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-900">{v.title}</div>
                    )}
                  </div>
                );
              }
              // Vimeo embed
              const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
              if (vimeoMatch?.[1]) {
                return (
                  <div key={v.id} className="rounded-xl overflow-hidden border border-gray-200">
                    <div className="aspect-video">
                      <iframe
                        src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
                        title={v.title || 'Video'}
                        className="w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    {v.title && (
                      <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-900">{v.title}</div>
                    )}
                  </div>
                );
              }
              // Descript or direct video
              return (
                <div key={v.id} className="rounded-xl overflow-hidden border border-gray-200">
                  <video
                    src={url}
                    controls
                    className="w-full aspect-video bg-black"
                    title={v.title || 'Video'}
                  />
                  {v.title && (
                    <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-900">{v.title}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Photo gallery */}
      {photos.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Camera className="h-6 w-6 text-picc-ochre" />
            {title}
            <span className="text-sm font-normal text-gray-500 ml-1">({photos.length})</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setLightboxIndex(index)}
                className="group aspect-square rounded-lg overflow-hidden bg-gray-100 relative cursor-pointer"
              >
                <img
                  src={photo.public_url}
                  alt={photo.alt_text || photo.title || 'Photo'}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {photo.title && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs line-clamp-2">{photo.title}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
          >
            <X className="w-6 h-6" />
          </button>
          {lightboxIndex > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}
          {lightboxIndex < photos.length - 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
          <div className="max-w-5xl max-h-[90vh] px-12" onClick={(e) => e.stopPropagation()}>
            <img
              src={photos[lightboxIndex].public_url}
              alt={photos[lightboxIndex].alt_text || photos[lightboxIndex].title || 'Photo'}
              className="max-w-full max-h-[85vh] object-contain mx-auto"
            />
            {photos[lightboxIndex].title && (
              <p className="text-white/80 text-center mt-3 text-sm">{photos[lightboxIndex].title}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
