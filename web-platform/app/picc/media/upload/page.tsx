'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Upload as UploadIcon, Image, Film, Music, File, X, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface UploadFile {
  file: File;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  progress: number;
}

export default function MediaUploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [bucket, setBucket] = useState('story-media');
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    tags: '',
    location: ''
  });

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

    const hasNonImage = selectedFiles.some(f => !f.type.startsWith('image/'));
    if (hasNonImage && bucket !== 'story-media') {
      setBucket('story-media');
    }

    const newFiles: UploadFile[] = selectedFiles.map(file => {
      const uploadFile: UploadFile = {
        file,
        status: 'pending',
        progress: 0
      };

      // Generate preview for images
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

  const uploadFiles = async () => {
    if (files.length === 0) {
      alert('Please select files to upload');
      return;
    }

    setUploading(true);

    const supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    for (let i = 0; i < files.length; i++) {
      const uploadFile = files[i];

      // Update status to uploading
      setFiles(prev => prev.map((f, idx) =>
        idx === i ? { ...f, status: 'uploading' as const, progress: 0 } : f
      ));

      try {
        const contentType = normalizeStorageMimeType(uploadFile.file);
        const fileType = getFileType(contentType || uploadFile.file.type);
        const uploadBucket = fileType === 'image' ? bucket : 'story-media';
        const uploadBody = toUploadBody(uploadFile.file, contentType);

        // Generate unique filename
        const fileExt = uploadFile.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = fileName;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from(uploadBucket)
          .upload(filePath, uploadBody, {
            cacheControl: '3600',
            upsert: false,
            ...(contentType ? { contentType } : {})
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(uploadBucket)
          .getPublicUrl(filePath);

        // Get file dimensions for images
        let width, height;
        if (uploadFile.file.type.startsWith('image/')) {
          const dimensions = await getImageDimensions(uploadFile.file);
          width = dimensions.width;
          height = dimensions.height;
        }

        // Insert metadata into media_files table
        const { error: dbError } = await supabase
          .from('media_files')
          .insert({
            filename: fileName,
            original_filename: uploadFile.file.name,
            file_path: filePath,
            bucket_name: uploadBucket,
            public_url: publicUrl,
            file_type: fileType,
            mime_type: contentType || uploadFile.file.type,
            file_size: uploadFile.file.size,
            width,
            height,
            uploaded_by: user?.id,
            title: metadata.title || uploadFile.file.name,
            description: metadata.description || null,
            location: metadata.location || null,
            tags: metadata.tags ? metadata.tags.split(',').map(t => t.trim()) : [],
            metadata: {
              ...(contentType && contentType !== uploadFile.file.type
                ? { original_mime_type: uploadFile.file.type }
                : {}),
            },
            tenant_id: '9c4e5de2-d80a-4e0b-8a89-1bbf09485532'
          });

        if (dbError) {
          console.error('Database error:', dbError);
          // Don't throw - file is uploaded, just metadata failed
        }

        // Update status to success
        setFiles(prev => prev.map((f, idx) =>
          idx === i ? { ...f, status: 'success' as const, progress: 100 } : f
        ));

      } catch (error: any) {
        console.error('Upload error:', error);
        const message =
          typeof error?.message === 'string' && error.message.includes('mime type')
            ? `${error.message} (Tip: for videos, use the “Immersive Story Media” bucket; .mov files may need converting to .mp4.)`
            : error?.message;
        setFiles(prev => prev.map((f, idx) =>
          idx === i ? { ...f, status: 'error' as const, error: message } : f
        ));
      }
    }

    setUploading(false);

    // Check if all uploads succeeded
    const allSuccess = files.every(f => f.status === 'success');
    if (allSuccess) {
      alert('All files uploaded successfully!');
      // Reset
      setFiles([]);
      setMetadata({ title: '', description: '', tags: '', location: '' });
    }
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
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

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/picc/media"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Media Library
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <UploadIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Upload Media</h1>
        </div>
        <p className="text-gray-600">
          Upload photos, videos, and audio files to your media library
        </p>
      </div>

      {/* Upload Form */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Upload Area */}
        <div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Select Files</h2>

            {/* Storage Bucket Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload To
              </label>
              <select
                value={bucket}
                onChange={(e) => setBucket(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="story-images">Story Images</option>
                <option value="profile-images">Profile Photos</option>
                <option value="story-media">Immersive Story Media</option>
              </select>
            </div>

            {/* File Input */}
            <label className="cursor-pointer block">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-700 font-medium mb-1">Click to upload files</p>
                <p className="text-sm text-gray-500">or drag and drop</p>
                <p className="text-xs text-gray-400 mt-2">
                  Images, short videos, audio files (for long videos, use Video Links; for best web playback, upload MP4 — iPhone .mov may need converting)
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

          {/* Metadata Fields */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Metadata (Optional)</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={metadata.title}
                  onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Descriptive title for these files"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={metadata.description}
                  onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="What's in these files?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={metadata.tags}
                  onChange={(e) => setMetadata({ ...metadata, tags: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., community, event, culture"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={metadata.location}
                  onChange={(e) => setMetadata({ ...metadata, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Where were these taken?"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: File List */}
        <div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Selected Files ({files.length})
            </h2>

            {files.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <File className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No files selected</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {files.map((uploadFile, index) => {
                  const Icon = getFileIcon(getFileType(uploadFile.file.type));

                  return (
                    <div
                      key={index}
                      className={`border rounded-lg p-3 ${
                        uploadFile.status === 'success' ? 'border-green-300 bg-green-50' :
                        uploadFile.status === 'error' ? 'border-red-300 bg-red-50' :
                        uploadFile.status === 'uploading' ? 'border-blue-300 bg-blue-50' :
                        'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Preview/Icon */}
                        <div className="flex-shrink-0">
                          {uploadFile.preview ? (
                            <img
                              src={uploadFile.preview}
                              alt={uploadFile.file.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                              <Icon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {uploadFile.file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(uploadFile.file.size)}
                          </p>

                          {/* Status */}
                          {uploadFile.status === 'uploading' && (
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${uploadFile.progress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {uploadFile.status === 'error' && (
                            <p className="text-xs text-red-600 mt-1">
                              {uploadFile.error || 'Upload failed'}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0">
                          {uploadFile.status === 'success' && (
                            <Check className="w-5 h-5 text-green-600" />
                          )}
                          {uploadFile.status === 'error' && (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          )}
                          {uploadFile.status === 'pending' && (
                            <button
                              onClick={() => removeFile(index)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                            >
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
            {files.length > 0 && (
              <button
                onClick={uploadFiles}
                disabled={uploading || files.every(f => f.status === 'success')}
                className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length > 1 ? 's' : ''}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
