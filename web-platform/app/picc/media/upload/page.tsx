'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Upload as UploadIcon, Image, Film, Music, File, X, Check, AlertCircle, ArrowLeft, MapPin, Link2, ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface UploadFile {
  file: File;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  progress: number;
}

interface ServiceOption {
  slug: string;
  name: string;
}

export default function MediaUploadPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>}>
      <MediaUploadContent />
    </Suspense>
  );
}

function MediaUploadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [bucket] = useState('story-media');
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [selectedService, setSelectedService] = useState(searchParams.get('service') || '');
  const [markAsHero, setMarkAsHero] = useState(false);
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    tags: '',
    location: ''
  });

  // Video link state
  const [videoLinkOpen, setVideoLinkOpen] = useState(false);
  const [videoLinkUrl, setVideoLinkUrl] = useState('');
  const [videoLinkTitle, setVideoLinkTitle] = useState('');
  const [videoLinkDesc, setVideoLinkDesc] = useState('');
  const [videoLinkSubmitting, setVideoLinkSubmitting] = useState(false);
  const [videoLinkResult, setVideoLinkResult] = useState<{ success?: boolean; message?: string } | null>(null);

  // Load services list
  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(d => {
        const list = (d.services || [])
          .filter((s: any) => s.is_active !== false)
          .sort((a: any, b: any) => a.name.localeCompare(b.name))
          .map((s: any) => ({ slug: s.slug, name: s.name }));
        setServices(list);
      })
      .catch(() => {});
  }, []);

  const normalizeStorageMimeType = (file: File): string | undefined => {
    const name = file.name.toLowerCase();
    const ext = name.includes('.') ? name.split('.').pop() : '';
    const reported = file.type || '';
    if (reported === 'video/quicktime' || ext === 'mov') return 'video/mp4';
    if (!reported && ext === 'mp4') return 'video/mp4';
    if (!reported && ext === 'webm') return 'video/webm';
    return reported || undefined;
  };

  const toUploadBody = (file: File, contentType?: string): Blob | File => {
    if (!contentType) return file;
    if (contentType === file.type) return file;
    return new Blob([file], { type: contentType });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newFiles: UploadFile[] = selectedFiles.map(file => {
      const uploadFile: UploadFile = { file, status: 'pending', progress: 0 };
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          uploadFile.preview = reader.result as string;
          setFiles(prev => [...prev]);
        };
        reader.readAsDataURL(file);
      }
      return uploadFile;
    });
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const newFiles: UploadFile[] = droppedFiles.map(file => {
      const uploadFile: UploadFile = { file, status: 'pending', progress: 0 };
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          uploadFile.preview = reader.result as string;
          setFiles(prev => [...prev]);
        };
        reader.readAsDataURL(file);
      }
      return uploadFile;
    });
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileType = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Film;
      case 'audio': return Music;
      default: return File;
    }
  };

  // Build tags based on service selection + user tags
  const buildTags = (isFirstFile: boolean): string[] => {
    const tags: string[] = [];
    if (selectedService) {
      tags.push(`service:${selectedService}`, 'service-photo', 'palm-island');
      if (markAsHero && isFirstFile) tags.push('hero');
    }
    if (metadata.tags) {
      metadata.tags.split(',').map(t => t.trim()).filter(Boolean).forEach(t => tags.push(t));
    }
    return tags;
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setUploadedCount(0);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const pendingFiles = files.filter(f => f.status === 'pending');

    for (let i = 0; i < pendingFiles.length; i++) {
      const uploadFile = pendingFiles[i];
      const fileIndex = files.indexOf(uploadFile);

      setFiles(prev => prev.map((f, idx) =>
        idx === fileIndex ? { ...f, status: 'uploading' as const, progress: 0 } : f
      ));

      try {
        const contentType = normalizeStorageMimeType(uploadFile.file);
        const fileType = getFileType(contentType || uploadFile.file.type);
        const uploadBody = toUploadBody(uploadFile.file, contentType);

        // Organize into service folder if service selected
        const fileExt = uploadFile.file.name.split('.').pop();
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const folder = selectedService ? `picc-website/service-photos/${selectedService}` : 'picc-website/uploads';
        const filePath = `${folder}/${uniqueName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, uploadBody, {
            cacheControl: '3600',
            upsert: false,
            ...(contentType ? { contentType } : {})
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        let width, height;
        if (uploadFile.file.type.startsWith('image/')) {
          const dimensions = await getImageDimensions(uploadFile.file);
          width = dimensions.width;
          height = dimensions.height;
        }

        const tags = buildTags(i === 0);

        const { error: dbError } = await supabase
          .from('media_files')
          .insert({
            filename: uniqueName,
            original_filename: uploadFile.file.name,
            file_path: filePath,
            bucket_name: bucket,
            public_url: publicUrl,
            file_type: fileType,
            mime_type: contentType || uploadFile.file.type,
            file_size: uploadFile.file.size,
            width,
            height,
            uploaded_by: user?.id,
            title: metadata.title || uploadFile.file.name.replace(/\.[^.]+$/, ''),
            description: metadata.description || null,
            location: metadata.location || null,
            tags,
            metadata: {
              upload_source: selectedService ? 'service-bulk-upload' : 'media-upload',
              ...(selectedService ? { service_slug: selectedService } : {}),
              ...(contentType && contentType !== uploadFile.file.type
                ? { original_mime_type: uploadFile.file.type }
                : {}),
            },
            tenant_id: '9c4e5de2-d80a-4e0b-8a89-1bbf09485532'
          });

        if (dbError) console.error('Database error:', dbError);

        setFiles(prev => prev.map((f, idx) =>
          idx === fileIndex ? { ...f, status: 'success' as const, progress: 100 } : f
        ));
        setUploadedCount(prev => prev + 1);

      } catch (error: any) {
        console.error('Upload error:', error);
        const message =
          typeof error?.message === 'string' && error.message.includes('mime type')
            ? `${error.message} (Tip: .mov files may need converting to .mp4)`
            : error?.message;
        setFiles(prev => prev.map((f, idx) =>
          idx === fileIndex ? { ...f, status: 'error' as const, error: message } : f
        ));
      }
    }

    setUploading(false);
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.src = URL.createObjectURL(file);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleVideoLinkSubmit = async () => {
    if (!videoLinkUrl.trim()) return;
    setVideoLinkSubmitting(true);
    setVideoLinkResult(null);
    try {
      const tags = metadata.tags ? metadata.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      const res = await fetch('/api/media/add-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: videoLinkUrl.trim(),
          title: videoLinkTitle.trim() || undefined,
          description: videoLinkDesc.trim() || undefined,
          tags,
          service_slug: selectedService || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setVideoLinkResult({ success: true, message: 'Video link added successfully' });
        setVideoLinkUrl('');
        setVideoLinkTitle('');
        setVideoLinkDesc('');
      } else {
        setVideoLinkResult({ success: false, message: data.error || 'Failed to add video link' });
      }
    } catch (err: any) {
      setVideoLinkResult({ success: false, message: err.message || 'Network error' });
    }
    setVideoLinkSubmitting(false);
  };

  const pendingCount = files.filter(f => f.status === 'pending').length;
  const successCount = files.filter(f => f.status === 'success').length;
  const serviceName = services.find(s => s.slug === selectedService)?.name;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/picc/media/gallery"
          className="inline-flex items-center gap-2 text-picc-red hover:text-picc-red/80 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gallery
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <UploadIcon className="w-8 h-8 text-picc-red" />
          <h1 className="text-3xl font-bold text-gray-900">Upload Media</h1>
        </div>
        <p className="text-gray-600">
          Bulk upload photos for services, projects, or the general media library
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Upload Area + Options */}
        <div className="space-y-6">
          {/* Service Assignment */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Assign to Service</h2>
            <p className="text-sm text-gray-500 mb-4">Photos will be auto-tagged and filed into the service folder</p>

            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/20 focus:border-picc-red text-sm"
            >
              <option value="">No service (general upload)</option>
              {services.map(s => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </select>

            {selectedService && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  Photos will be tagged: <code className="bg-green-100 px-1 rounded">service:{selectedService}</code> + <code className="bg-green-100 px-1 rounded">service-photo</code>
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Folder: picc-website/service-photos/{selectedService}/
                </p>
                <label className="flex items-center gap-2 mt-2 text-sm text-green-800">
                  <input
                    type="checkbox"
                    checked={markAsHero}
                    onChange={e => setMarkAsHero(e.target.checked)}
                    className="rounded border-green-300 text-picc-red focus:ring-picc-red"
                  />
                  Set first photo as cover (hero tag)
                </label>
              </div>
            )}
          </div>

          {/* Drop zone */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Select Files</h2>
            <label
              className="cursor-pointer block"
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-picc-red hover:bg-warm-50 transition-colors">
                <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-700 font-medium mb-1">Click to select or drag and drop</p>
                <p className="text-sm text-gray-500">Select multiple files at once</p>
                <p className="text-xs text-gray-400 mt-2">
                  Images, videos, audio — .mov files may need converting to .mp4
                </p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*,video/*,audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {/* Add Video Link */}
          <div className="bg-white rounded-lg border border-gray-200">
            <button
              onClick={() => setVideoLinkOpen(!videoLinkOpen)}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-picc-red" />
                <h2 className="text-lg font-bold text-gray-900">Add Video Link</h2>
              </div>
              {videoLinkOpen ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>
            {videoLinkOpen && (
              <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500">
                  Add a YouTube, Vimeo, or other external video link without uploading a file.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Video URL *</label>
                  <input
                    type="url"
                    value={videoLinkUrl}
                    onChange={e => setVideoLinkUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/20 focus:border-picc-red text-sm"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={videoLinkTitle}
                    onChange={e => setVideoLinkTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/20 focus:border-picc-red text-sm"
                    placeholder="Video title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={videoLinkDesc}
                    onChange={e => setVideoLinkDesc(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/20 focus:border-picc-red text-sm"
                    placeholder="Brief description"
                  />
                </div>

                {selectedService && (
                  <p className="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                    Will be tagged with <code className="bg-green-100 px-1 rounded">service:{selectedService}</code>
                  </p>
                )}

                {videoLinkResult && (
                  <div className={`p-3 rounded-lg text-sm ${
                    videoLinkResult.success
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    {videoLinkResult.success ? (
                      <div className="flex items-center gap-2"><Check className="w-4 h-4" /> {videoLinkResult.message}</div>
                    ) : (
                      <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {videoLinkResult.message}</div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleVideoLinkSubmit}
                  disabled={videoLinkSubmitting || !videoLinkUrl.trim()}
                  className="w-full px-4 py-2.5 bg-picc-red text-white rounded-lg hover:bg-picc-red/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {videoLinkSubmitting ? 'Adding...' : 'Add Video Link'}
                </button>
              </div>
            )}
          </div>

          {/* Extra metadata */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Extra Details (Optional)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Extra Tags</label>
                <input
                  type="text"
                  value={metadata.tags}
                  onChange={(e) => setMetadata({ ...metadata, tags: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/20 focus:border-picc-red text-sm"
                  placeholder="e.g., community, event, 2024"
                />
                <p className="text-xs text-gray-400 mt-1">Comma-separated, added alongside service tags</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={metadata.description}
                  onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/20 focus:border-picc-red text-sm"
                  placeholder="What's in these photos?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={metadata.location}
                    onChange={(e) => setMetadata({ ...metadata, location: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red/20 focus:border-picc-red text-sm"
                    placeholder="Palm Island"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: File List */}
        <div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Files ({files.length})
              </h2>
              {files.length > 0 && !uploading && (
                <button
                  onClick={() => setFiles([])}
                  className="text-xs text-gray-400 hover:text-red-500"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Progress summary */}
            {uploading && (
              <div className="mb-4 p-3 bg-warm-50 border border-picc-red/20 rounded-lg">
                <p className="text-sm font-medium text-picc-red">
                  Uploading {uploadedCount + 1} of {pendingCount + successCount}...
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-picc-red h-2 rounded-full transition-all"
                    style={{ width: `${((uploadedCount) / (pendingCount + successCount)) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {successCount > 0 && !uploading && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-700">
                  {successCount} file{successCount > 1 ? 's' : ''} uploaded successfully
                  {serviceName && ` to ${serviceName}`}
                </p>
              </div>
            )}

            {files.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <File className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No files selected</p>
                <p className="text-xs text-gray-400 mt-1">Select a service above, then add photos</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {files.map((uploadFile, index) => {
                  const Icon = getFileIcon(getFileType(uploadFile.file.type));
                  return (
                    <div
                      key={index}
                      className={`border rounded-lg p-2.5 ${
                        uploadFile.status === 'success' ? 'border-green-300 bg-green-50' :
                        uploadFile.status === 'error' ? 'border-red-300 bg-red-50' :
                        uploadFile.status === 'uploading' ? 'border-picc-red/30 bg-warm-50' :
                        'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {uploadFile.preview ? (
                            <img src={uploadFile.preview} alt="" className="w-12 h-12 object-cover rounded" />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                              <Icon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{uploadFile.file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(uploadFile.file.size)}</p>
                          {markAsHero && selectedService && index === 0 && uploadFile.status !== 'error' && (
                            <span className="inline-block text-[10px] bg-picc-red/10 text-picc-red px-1.5 py-0.5 rounded mt-0.5">COVER</span>
                          )}
                          {uploadFile.status === 'uploading' && (
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div className="bg-picc-red h-1.5 rounded-full animate-pulse w-2/3" />
                            </div>
                          )}
                          {uploadFile.status === 'error' && (
                            <p className="text-xs text-red-600 mt-0.5">{uploadFile.error || 'Failed'}</p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {uploadFile.status === 'success' && <Check className="w-5 h-5 text-green-600" />}
                          {uploadFile.status === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                          {uploadFile.status === 'pending' && (
                            <button onClick={() => removeFile(index)} className="text-gray-400 hover:text-red-600">
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Upload Button */}
            {pendingCount > 0 && (
              <button
                onClick={uploadFiles}
                disabled={uploading}
                className="w-full mt-4 px-6 py-3 bg-picc-red text-white rounded-lg hover:bg-picc-red/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {uploading
                  ? `Uploading ${uploadedCount + 1} of ${pendingCount + uploadedCount}...`
                  : `Upload ${pendingCount} Photo${pendingCount > 1 ? 's' : ''}${serviceName ? ` to ${serviceName}` : ''}`
                }
              </button>
            )}

            {/* Done - go to service */}
            {successCount > 0 && !uploading && pendingCount === 0 && selectedService && (
              <Link
                href={`/picc/services?slug=${selectedService}`}
                className="block w-full mt-3 px-6 py-2.5 text-center border border-picc-red text-picc-red rounded-lg hover:bg-warm-50 transition-colors text-sm font-medium"
              >
                View {serviceName} in Services
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
