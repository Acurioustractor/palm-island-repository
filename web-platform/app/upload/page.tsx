'use client';

import React;
import AppLayout from '@/components/AppLayout';
import React, { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Camera, Mic, FileText, Upload, X, Check, Loader, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type UploadMode = 'photo' | 'text' | 'voice';

export default function UploadPage() {
  const router = useRouter();
  const [mode, setMode] = useState<UploadMode>('photo');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <Loader className="w-12 h-12 text-coral-warm animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-8 mb-8 shadow-2xl">
          <h1 className="text-4xl font-bold mb-2">Share Your Story</h1>
          <p className="text-xl text-purple-100">
            Every voice matters. Every story strengthens our community.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setMode('photo')}
            className={`p-6 rounded-xl transition-all transform hover:scale-105 ${
              mode === 'photo'
                ? 'bg-coral-warm text-white shadow-2xl'
                : 'bg-white text-earth-dark shadow-lg hover:shadow-xl'
            }`}
          >
            <Camera className="w-8 h-8 mx-auto mb-2" />
            <div className="font-bold text-lg">Photos</div>
            <div className="text-sm opacity-90">Upload images</div>
          </button>

          <button
            onClick={() => setMode('text')}
            className={`p-6 rounded-xl transition-all transform hover:scale-105 ${
              mode === 'text'
                ? 'bg-coral-warm text-white shadow-2xl'
                : 'bg-white text-earth-dark shadow-lg hover:shadow-xl'
            }`}
          >
            <FileText className="w-8 h-8 mx-auto mb-2" />
            <div className="font-bold text-lg">Text Story</div>
            <div className="text-sm opacity-90">Write your story</div>
          </button>

          <button
            onClick={() => setMode('voice')}
            className={`p-6 rounded-xl transition-all transform hover:scale-105 ${
              mode === 'voice'
                ? 'bg-coral-warm text-white shadow-2xl'
                : 'bg-white text-earth-dark shadow-lg hover:shadow-xl'
            }`}
          >
            <Mic className="w-8 h-8 mx-auto mb-2" />
            <div className="font-bold text-lg">Voice</div>
            <div className="text-sm opacity-90">Record audio</div>
          </button>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {mode === 'photo' && <PhotoUploadForm user={user} />}
          {mode === 'text' && <TextStoryForm user={user} />}
          {mode === 'voice' && <VoiceRecordingForm user={user} />}
        </div>
      </div>
    </div>
  );
}

function PhotoUploadForm({ user }: { user: any }) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      addFiles(newFiles);
    }
  }

  function addFiles(newFiles: File[]) {
    setFiles(prev => [...prev, ...newFiles]);

    // Create previews
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    );
    addFiles(droppedFiles);
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  }

  async function handleUpload() {
    if (files.length === 0) return;

    setUploading(true);
    const supabase = createClient();

    try {
      // Upload each file to Supabase Storage
      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${index}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('story-media')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('story-media')
          .getPublicUrl(fileName);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      // Create story entry
      const { error: storyError } = await supabase
        .from('stories')
        .insert({
          storyteller_id: user.id,
          title: caption || 'Photo Story',
          content: caption || 'Shared from Palm Island',
          media_type: 'photo',
          access_level: 'public',
          status: 'published',
        });

      if (storyError) throw storyError;

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/storytellers/' + user.id;
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
      setUploading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-ocean-deep mb-2">Photos Uploaded!</h2>
        <p className="text-earth-medium">Redirecting to your profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-ocean-deep flex items-center">
        <Camera className="w-6 h-6 mr-2 text-coral-warm" />
        Upload Photos
      </h2>

      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-4 border-dashed rounded-xl p-12 text-center transition-all ${
          isDragging
            ? 'border-coral-600 bg-purple-50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium text-earth-dark mb-2">
          Drag and drop photos here
        </p>
        <p className="text-sm text-gray-500 mb-4">or</p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-coral-warm hover:bg-ocean-medium text-white font-bold py-3 px-8 rounded-lg transition-all"
        >
          Choose Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Caption */}
      <div>
        <label className="block text-sm font-medium text-earth-dark mb-2">
          Caption (Optional)
        </label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Tell us about these photos..."
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={files.length === 0 || uploading}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {uploading ? (
          <>
            <Loader className="w-5 h-5 mr-2 animate-spin" />
            Uploading {files.length} photo{files.length > 1 ? 's' : ''}...
          </>
        ) : (
          <>
            <Upload className="w-5 h-5 mr-2" />
            Upload {files.length} photo{files.length > 1 ? 's' : ''}
          </>
        )}
      </button>
    </div>
  );
}

function TextStoryForm({ user }: { user: any }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('stories')
        .insert({
          storyteller_id: user.id,
          title,
          content,
          media_type: 'text',
          access_level: 'public',
          status: 'published',
        });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/storytellers/' + user.id;
      }, 2000);
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to submit story. Please try again.');
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-ocean-deep mb-2">Story Published!</h2>
        <p className="text-earth-medium">Redirecting to your profile...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-ocean-deep flex items-center">
        <FileText className="w-6 h-6 mr-2 text-coral-warm" />
        Write Your Story
      </h2>

      <div>
        <label className="block text-sm font-medium text-earth-dark mb-2">
          Story Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your story a title..."
          required
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-earth-dark mb-2">
          Your Story <span className="text-red-500">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your story with the community..."
          required
          rows={12}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
        />
        <p className="text-sm text-gray-500 mt-2">
          {content.length} characters
        </p>
      </div>

      <button
        type="submit"
        disabled={!title || !content || submitting}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Publishing Story...' : 'Publish Story'}
      </button>
    </form>
  );
}

function VoiceRecordingForm({ user }: { user: any }) {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }

  async function handleUpload() {
    if (!audioBlob || !title) return;

    setUploading(true);
    const supabase = createClient();

    try {
      // Upload audio to storage
      const fileName = `${user.id}/${Date.now()}.webm`;
      const { data, error } = await supabase.storage
        .from('story-media')
        .upload(fileName, audioBlob, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('story-media')
        .getPublicUrl(fileName);

      // Create story entry
      const { error: storyError } = await supabase
        .from('stories')
        .insert({
          storyteller_id: user.id,
          title,
          content: 'Voice recording from Palm Island',
          media_type: 'audio',
          access_level: 'public',
          status: 'published',
          metadata: {
            audio_url: publicUrl,
          },
        });

      if (storyError) throw storyError;

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/storytellers/' + user.id;
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
      setUploading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-ocean-deep mb-2">Recording Uploaded!</h2>
        <p className="text-earth-medium">Redirecting to your profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-ocean-deep flex items-center">
        <Mic className="w-6 h-6 mr-2 text-coral-warm" />
        Record Your Voice
      </h2>

      {/* Recording Interface */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8 text-center">
        {!audioBlob ? (
          <>
            <div className={`mx-auto w-32 h-32 rounded-full flex items-center justify-center mb-6 ${
              recording
                ? 'bg-red-500 animate-pulse'
                : 'bg-coral-warm'
            }`}>
              <Mic className="w-16 h-16 text-white" />
            </div>

            {!recording ? (
              <button
                onClick={startRecording}
                className="bg-coral-warm hover:bg-ocean-medium text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Start Recording
              </button>
            ) : (
              <>
                <p className="text-xl font-bold text-ocean-deep mb-4">Recording...</p>
                <button
                  onClick={stopRecording}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  Stop Recording
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <Check className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <p className="text-xl font-bold text-ocean-deep mb-4">Recording Complete!</p>
            <audio src={audioUrl!} controls className="w-full mb-4" />
            <button
              onClick={() => {
                setAudioBlob(null);
                setAudioUrl(null);
              }}
              className="text-coral-warm hover:text-ocean-deep font-medium"
            >
              Record Again
            </button>
          </>
        )}
      </div>

      {/* Title Input (shown after recording) */}
      {audioBlob && (
        <>
          <div>
            <label className="block text-sm font-medium text-earth-dark mb-2">
              Recording Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your recording a title..."
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={!title || uploading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {uploading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Uploading Recording...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Upload Recording
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
