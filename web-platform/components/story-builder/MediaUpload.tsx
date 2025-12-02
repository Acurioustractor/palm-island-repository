'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, X, Image as ImageIcon, Video as VideoIcon, Loader2, CheckCircle } from 'lucide-react';

interface MediaUploadProps {
  onUpload: (url: string, type: 'image' | 'video') => void;
  accept?: 'image' | 'video' | 'both';
  label?: string;
  currentUrl?: string;
}

export function MediaUpload({ onUpload, accept = 'both', label, currentUrl }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);

  const supabase = createClient();

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
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `stories/${fileName}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('story-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('story-media')
        .getPublicUrl(filePath);

      setPreview(publicUrl);
      setFileType(isImage ? 'image' : 'video');
      onUpload(publicUrl, isImage ? 'image' : 'video');
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  }, [accept, onUpload, supabase]);

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

      {preview ? (
        <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden">
          {fileType === 'image' ? (
            <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
          ) : (
            <video src={preview} className="w-full h-48 object-cover" controls />
          )}
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-2 px-3 py-1 bg-black/70 text-white text-xs rounded-full flex items-center gap-1">
            {fileType === 'image' ? <ImageIcon className="w-3 h-3" /> : <VideoIcon className="w-3 h-3" />}
            <span className="capitalize">{fileType}</span>
          </div>
        </div>
      ) : (
        <div className="relative">
          <input
            type="file"
            accept={acceptTypes}
            onChange={handleFileChange}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            id="media-upload"
          />
          <label
            htmlFor="media-upload"
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
    </div>
  );
}
