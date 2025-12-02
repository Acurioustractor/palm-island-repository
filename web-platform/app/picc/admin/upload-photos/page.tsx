'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, Check, X, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface Story {
  id: string;
  title: string;
  story_category: string;
}

export default function UploadPhotosPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStories() {
      const supabase = createClient();
      const { data } = await supabase
        .from('stories')
        .select('id, title, story_category')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      setStories(data || []);
    }

    fetchStories();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedStory) {
      setError('Please select both a story and a photo');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();

      // 1. Upload to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${selectedStory}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('story-images')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // 2. Create story_media record
      const { error: dbError } = await supabase
        .from('story_media')
        .insert({
          story_id: selectedStory,
          media_type: 'photo',
          file_path: fileName,
          supabase_bucket: 'story-images',
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          is_public: true,
          display_order: 0,
        });

      if (dbError) throw dbError;

      setSuccess(true);
      setSelectedFile(null);
      setPreview(null);
      setSelectedStory('');

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-blue-900 mb-2">Upload Photos to Stories</h1>
            <p className="text-gray-600">Add beautiful images to your community stories</p>
          </div>
          <Link
            href="/stories"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all"
          >
            View Stories
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8">
          {/* Story Selection */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              1. Select Story
            </label>
            <select
              value={selectedStory}
              onChange={(e) => setSelectedStory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a story...</option>
              {stories.map((story) => (
                <option key={story.id} value={story.id}>
                  {story.title} ({story.story_category})
                </option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              2. Select Photo
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-all cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {preview ? (
                  <div className="space-y-4">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg shadow-lg"
                    />
                    <p className="text-sm text-gray-600">{selectedFile?.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile!.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-16 w-16 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-gray-700">Click to upload photo</p>
                      <p className="text-sm text-gray-500">PNG, JPG, WEBP up to 10MB</p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || !selectedStory || uploading}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Uploading...
              </>
            ) : (
              <>
                <ImageIcon className="h-5 w-5 mr-2" />
                Upload Photo to Story
              </>
            )}
          </button>

          {/* Success Message */}
          {success && (
            <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-center">
              <Check className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <p className="font-bold text-green-800">Photo uploaded successfully!</p>
                <p className="text-sm text-green-700">The photo will now appear on the story card.</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center">
              <X className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <p className="font-bold text-red-800">Upload failed</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-bold text-blue-900 mb-3">📸 Photo Upload Instructions</h2>
          <ol className="space-y-2 text-sm text-gray-700">
            <li>1. Select a story from the dropdown</li>
            <li>2. Click the upload area to choose a photo from your computer</li>
            <li>3. Preview the photo to make sure it looks good</li>
            <li>4. Click "Upload Photo to Story"</li>
            <li>5. The photo will appear on the story card in the Stories Gallery!</li>
          </ol>
          <div className="mt-4 p-4 bg-white rounded border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-800">
              💡 <strong>Tip:</strong> Photos are stored in Supabase Storage bucket: <code className="bg-gray-100 px-2 py-1 rounded">story-images</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
