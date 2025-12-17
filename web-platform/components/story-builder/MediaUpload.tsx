'use client';

import { useState, useCallback, useEffect, useId, useMemo } from 'react';
import { Upload, X, Image as ImageIcon, Video as VideoIcon, Loader2, CheckCircle } from 'lucide-react';

interface MediaUploadProps {
  onUpload: (url: string, type: 'image' | 'video') => void;
  accept?: 'image' | 'video' | 'both';
  label?: string;
  currentUrl?: string;
  projectSlug?: string;
  usageContext?: string;
}

export function MediaUpload({
  onUpload,
  accept = 'both',
  label,
  currentUrl,
  projectSlug,
  usageContext,
}: MediaUploadProps) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [pickerQuery, setPickerQuery] = useState('');
  const [pickerOnlyProject, setPickerOnlyProject] = useState(() => {
    if (!projectSlug) return false
    if (usageContext === 'profile_photo') return false
    return true
  });
  const [pickerItems, setPickerItems] = useState<Array<{ id: string; public_url: string; file_type: string; title?: string; tags?: string[] }>>([]);
  const [pickerOffset, setPickerOffset] = useState(0);
  const [pickerHasMore, setPickerHasMore] = useState(true);
  const [pickerLoadingMore, setPickerLoadingMore] = useState(false);

  const PAGE_SIZE = 80;

  const inferredTypeFromUrl = useMemo(() => {
    if (!currentUrl) return null;
    const lower = currentUrl.toLowerCase();
    const isVideoUrl = /\.(mp4|mov|webm|m4v)(\?|#|$)/.test(lower);
    return isVideoUrl ? 'video' : 'image';
  }, [currentUrl]);

  const isDirectVideoFile = useCallback((url: string) => {
    const lower = String(url || '').toLowerCase().split('#')[0].split('?')[0];
    return /\.(mp4|mov|webm|m4v|ogv|ogg)$/.test(lower);
  }, []);

  const getEmbedUrl = useCallback((url: string) => {
    const value = String(url || '').trim();
    const youtubeMatch = value.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s?]+)/);
    if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=0&rel=0`;
    const vimeoMatch = value.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=0`;
    const descriptShare = value.match(/^https?:\/\/share\.descript\.com\/view\/([A-Za-z0-9]+)/);
    if (descriptShare) return `https://share.descript.com/embed/${descriptShare[1]}`;
    if (value.includes('share.descript.com/embed/')) return value;
    return value;
  }, []);

  useEffect(() => {
    setPreview(currentUrl || null);
    if (!currentUrl) {
      setFileType(null);
      return;
    }

    if (accept === 'image') {
      setFileType('image');
      return;
    }
    if (accept === 'video') {
      setFileType('video');
      return;
    }

    setFileType(inferredTypeFromUrl);
  }, [accept, currentUrl, inferredTypeFromUrl]);

  const loadFromLibrary = useCallback(async (opts?: { reset?: boolean }) => {
    const reset = opts?.reset !== false;
    if (reset) {
      setPickerLoading(true);
      setPickerOffset(0);
      setPickerHasMore(true);
    } else {
      setPickerLoadingMore(true);
    }
    setPickerError(null);
    try {
      const params = new URLSearchParams();
      params.set('limit', String(PAGE_SIZE));
      params.set('offset', String(reset ? 0 : pickerOffset));
      if (accept !== 'both') params.set('fileType', accept);
      const requiredTags: string[] = [];
      if (pickerOnlyProject && projectSlug) requiredTags.push(`project:${projectSlug}`);
      if (requiredTags.length) params.set('tags', requiredTags.join(','));
      const q = pickerQuery.trim();
      if (q) params.set('q', q);

      const res = await fetch(`/api/media/list?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to load media library');
      const items = json?.data || [];
      setPickerItems((prev) => {
        if (reset) return items;
        const seen = new Set(prev.map((p) => p.id));
        const next = [...prev];
        for (const item of items) {
          if (!item?.id || seen.has(item.id)) continue;
          seen.add(item.id);
          next.push(item);
        }
        return next;
      });
      setPickerOffset((prev) => (reset ? PAGE_SIZE : prev + PAGE_SIZE));
      setPickerHasMore(items.length === PAGE_SIZE);
    } catch (e: any) {
      setPickerError(e?.message || 'Failed to load media library');
    } finally {
      setPickerLoading(false);
      setPickerLoadingMore(false);
    }
  }, [PAGE_SIZE, accept, pickerOffset, pickerOnlyProject, pickerQuery, projectSlug]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (accept === 'image' && !isImage) {
      setError('Please select an image file');
      return;
    }
    if (accept === 'video' && !isVideo) {
      setError('Please select a video file');
      return;
    }
    if (!isImage && !isVideo) {
      setError('Please select an image or video file');
      return;
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      setError('File must be less than 50MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('tags', JSON.stringify(['immersive-story']));
      form.append('year', String(new Date().getFullYear()));
      form.append('description', '');
      form.append('collection', 'immersive-story');
      form.append('enableAI', 'false');
      if (projectSlug) form.append('projectSlug', projectSlug);
      if (usageContext) form.append('usageContext', usageContext);

      const res = await fetch('/api/media/upload', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || json?.message || 'Failed to upload file');

      const publicUrl = json?.file?.public_url;
      if (!publicUrl) throw new Error('Upload succeeded but no URL returned');

      setPreview(publicUrl);
      setFileType(isImage ? 'image' : 'video');
      onUpload(publicUrl, isImage ? 'image' : 'video');
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  }, [accept, onUpload, projectSlug, usageContext]);

  const handleRemove = () => {
    setPreview(null);
    setFileType(null);
    onUpload('', 'image');
  };

  const acceptTypes =
    accept === 'image' ? 'image/*' :
    accept === 'video' ? 'video/*' :
    'image/*,video/*';

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-gray-500">
          {projectSlug ? (
            <span>Tip: choose from the library tagged <code className="px-1.5 py-0.5 bg-gray-100 rounded">project:{projectSlug}</code>.</span>
          ) : (
            <span>Tip: use the Media Library to tag and reuse assets.</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setPickerOpen(true);
            void loadFromLibrary({ reset: true });
          }}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          Choose from Library
        </button>
      </div>

      {preview ? (
        <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden">
          {fileType === 'image' ? (
            <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
          ) : isDirectVideoFile(preview) ? (
            <video src={preview} className="w-full h-48 object-cover" controls playsInline />
          ) : (
            <iframe
              src={getEmbedUrl(preview)}
              title="Video preview"
              className="w-full h-48"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          {fileType && (
            <div className="absolute bottom-2 left-2 px-3 py-1 bg-black/70 text-white text-xs rounded-full flex items-center gap-1">
              {fileType === 'image' ? <ImageIcon className="w-3 h-3" /> : <VideoIcon className="w-3 h-3" />}
              <span className="capitalize">{fileType}</span>
              {fileType === 'video' && preview && !isDirectVideoFile(preview) && (
                <span className="ml-1 opacity-80">(embed)</span>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <input
            type="file"
            accept={acceptTypes}
            onChange={handleFileChange}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            id={inputId}
          />
          <label
            htmlFor={inputId}
            className={`
              block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors
              ${uploading ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
            `}
          >
            {uploading ? (
              <>
                <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-3 animate-spin" />
                <p className="text-blue-600 font-medium">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">
                  {accept === 'image' && 'Click to upload image'}
                  {accept === 'video' && 'Click to upload video'}
                  {accept === 'both' && 'Click to upload image or video'}
                </p>
                <p className="text-sm text-gray-500">
                  {accept === 'image' && 'JPG, PNG, GIF up to 50MB'}
                  {accept === 'video' && 'MP4, MOV up to 50MB'}
                  {accept === 'both' && 'Images or videos up to 50MB'}
                </p>
              </>
            )}
          </label>
        </div>
      )}

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {pickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-gray-900">Media Library</div>
                <div className="text-xs text-gray-600">Pick existing media instead of uploading again.</div>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm"
              >
                Close
              </button>
            </div>

            <div className="p-4 border-b border-gray-200 flex flex-wrap items-center gap-3">
              <input
                value={pickerQuery}
                onChange={(e) => setPickerQuery(e.target.value)}
                placeholder="Search title/filename/tags…"
                className="flex-1 min-w-[220px] px-3 py-2 border border-gray-300 rounded-lg"
              />
              {projectSlug && (
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={pickerOnlyProject}
                    onChange={(e) => setPickerOnlyProject(e.target.checked)}
                  />
                  Only this project
                </label>
              )}
              <button
                type="button"
                onClick={() => void loadFromLibrary({ reset: true })}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm"
              >
                Search
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(90vh-132px)]">
              {pickerError && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {pickerError}
                </div>
              )}
              {pickerLoading ? (
                <div className="py-12 text-center text-gray-600">Loading…</div>
              ) : pickerItems.length === 0 ? (
                <div className="py-12 text-center text-gray-600">No media found.</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {pickerItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        const type = item.file_type === 'video' ? 'video' : 'image';
                        setPreview(item.public_url);
                        setFileType(type);
                        onUpload(item.public_url, type);
                        setPickerOpen(false);
                      }}
                      className="group text-left border border-gray-200 rounded-lg overflow-hidden hover:border-blue-400 hover:shadow-sm transition-all bg-white"
                    >
                      <div className="aspect-video bg-gray-100 overflow-hidden">
                        {item.file_type === 'video' ? (
                          isDirectVideoFile(item.public_url) ? (
                            <div className="relative w-full h-full">
                              <video src={item.public_url} className="w-full h-full object-cover" muted playsInline />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="px-2 py-1 rounded bg-black/60 text-white text-xs flex items-center gap-1">
                                  <VideoIcon className="w-3 h-3" />
                                  Video
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700">
                              <div className="px-2 py-1 rounded bg-black/60 text-white text-xs flex items-center gap-1">
                                <VideoIcon className="w-3 h-3" />
                                External video
                              </div>
                            </div>
                          )
                        ) : (
                          <img src={item.public_url} alt={item.title || ''} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="p-2">
                        <div className="text-xs font-semibold text-gray-900 truncate">
                          {item.title || 'Untitled'}
                        </div>
                        <div className="text-[11px] text-gray-500 truncate">
                          {item.tags?.slice(0, 3).join(', ') || ''}
                        </div>
                      </div>
                    </button>
                  ))}
                  </div>

                  {pickerHasMore && (
                    <div className="mt-4 flex justify-center">
                      <button
                        type="button"
                        onClick={() => void loadFromLibrary({ reset: false })}
                        disabled={pickerLoadingMore}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg text-sm disabled:opacity-50 flex items-center gap-2"
                      >
                        {pickerLoadingMore ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading…
                          </>
                        ) : (
                          'Load more'
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
