'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getHeroImage } from '@/lib/media/utils';
import { useRouter } from 'next/navigation';
import {
  Mic, Video, FileText, Send, User, Shield, Heart,
  CheckCircle, AlertCircle, Upload, X, Play, Pause
} from 'lucide-react';

export default function ShareYourVoicePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'text' | 'audio' | 'video'>('text');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    yourName: '',
    category: 'community',
    consent: false,
  });

  // Media state
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [heroImage, setHeroImage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchHeroImage() {
      try {
        const image = await getHeroImage('share-voice');
        setHeroImage(image);
      } catch (error) {
        console.error('Error fetching hero image:', error);
      }
    }
    fetchHeroImage();
  }, []);

  // Audio recording
  async function startAudioRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      setError('Could not access microphone. Please check permissions.');
    }
  }

  function stopAudioRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.consent) {
      setError('Please provide consent to share your story');
      return;
    }

    setSubmitting(true);
    setError(null);

    const supabase = createClient();

    try {
      // Get or create "Community Voice" profile
      const communityVoiceId = '9adbdb0b-20bb-466d-abe6-7de1a36addb7'; // Your existing Community Voice ID

      let storytellerId = communityVoiceId;

      // If they provided a name, create/find their profile
      if (!isAnonymous && formData.yourName.trim()) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('full_name', formData.yourName)
          .single();

        if (existingProfile) {
          storytellerId = existingProfile.id;
        } else {
          const { data: newProfile, error: profileError } = await supabase
            .from('profiles')
            .insert({
              full_name: formData.yourName,
              preferred_name: formData.yourName.split(' ')[0],
              storyteller_type: 'community_member',
              location: 'Palm Island',
              profile_visibility: 'public',
              show_in_directory: true,
            })
            .select()
            .single();

          if (profileError) throw profileError;
          storytellerId = newProfile.id;
        }
      }

      // Create the story
      const storyData = {
        storyteller_id: storytellerId,
        title: formData.title,
        content: formData.content,
        category: formData.category,
        story_type: 'community_story',
        status: 'submitted', // Goes to review first
        access_level: 'community',
        is_public: false, // Needs approval
        metadata: {
          submission_type: activeTab,
          anonymous: isAnonymous,
        },
      };

      const { data: story, error: storyError } = await supabase
        .from('stories')
        .insert([storyData])
        .select()
        .single();

      if (storyError) throw storyError;

      // Upload media if present
      if (activeTab === 'audio' && audioBlob) {
        const fileName = `audio/${story.id}/${Date.now()}.webm`;
        const { error: uploadError } = await supabase.storage
          .from('story-videos') // Using videos bucket for audio too
          .upload(fileName, audioBlob);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('story-videos')
            .getPublicUrl(fileName);

          await supabase.from('story_media').insert({
            story_id: story.id,
            media_type: 'audio',
            file_path: fileName,
            supabase_bucket: 'story-videos',
            file_name: 'voice-recording.webm',
            file_size: audioBlob.size,
          });
        }
      }

      if (activeTab === 'video' && videoFile) {
        const fileName = `video/${story.id}/${Date.now()}.${videoFile.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage
          .from('story-videos')
          .upload(fileName, videoFile);

        if (!uploadError) {
          await supabase.from('story_media').insert({
            story_id: story.id,
            media_type: 'video',
            file_path: fileName,
            supabase_bucket: 'story-videos',
            file_name: videoFile.name,
            file_size: videoFile.size,
          });
        }
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to submit story');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-2xl w-full text-center">
          <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Yadu! Thank You!
          </h1>
          <p className="text-xl text-gray-700 mb-6">
            Your story has been submitted and will be reviewed by our team.
          </p>
          <p className="text-gray-600 mb-8">
            {isAnonymous
              ? "Your story will be shared as part of our Community Voice collection."
              : "We'll review your story and it will appear under your name once approved."}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({ title: '', content: '', yourName: '', category: 'community', consent: false });
                setAudioBlob(null);
                setVideoFile(null);
              }}
              className="px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-900/20"
            >
              Share Another Story
            </button>
            <button
              onClick={() => router.push('/stories')}
              className="px-6 py-3 border border-gray-200 hover:border-gray-900 text-gray-700 hover:text-gray-900 rounded-full transition-colors"
            >
              View Stories
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div
          className="text-center mb-12 rounded-2xl py-12 px-4"
          style={heroImage ? {
            backgroundImage: `linear-gradient(rgba(249, 250, 251, 0.92), rgba(249, 250, 251, 0.95)), url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : undefined}
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Share Your Voice
          </h1>
          <p className="text-xl text-gray-700 mb-2">
            Every story matters. Every voice strengthens our community.
          </p>
          <p className="text-gray-600 italic">
            Manbarra & Bwgcolman Country • Palm Island
          </p>
        </div>

        {/* Cultural Protocol Notice */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-lg mb-8">
          <div className="flex items-start gap-3">
            <Heart className="h-6 w-6 text-amber-700 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-amber-900 mb-2">Cultural Protocols</h3>
              <p className="text-amber-800 text-sm">
                Stories containing traditional knowledge or sensitive cultural content will be reviewed by
                Elders and Cultural Advisors before being shared. Your voice will be respected and protected.
              </p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="grid grid-cols-3 border-b border-gray-100">
            <button
              onClick={() => setActiveTab('text')}
              className={`px-6 py-4 flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'text'
                  ? 'bg-gray-900 text-white border-b-2 border-gray-900'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span className="font-medium">Write</span>
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`px-6 py-4 flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'audio'
                  ? 'bg-gray-900 text-white border-b-2 border-gray-900'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Mic className="h-5 w-5" />
              <span className="font-medium">Record Voice</span>
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`px-6 py-4 flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'video'
                  ? 'bg-gray-900 text-white border-b-2 border-gray-900'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Video className="h-5 w-5" />
              <span className="font-medium">Record Video</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Anonymous Toggle */}
            <div className="mb-8 bg-gray-50 rounded-lg p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded mt-1"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <span className="font-bold text-gray-900">Share Anonymously as "Community Voice"</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your story will be part of our collective community voice. No name will be attached.
                  </p>
                </div>
              </label>

              {!isAnonymous && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={formData.yourName}
                    onChange={(e) => setFormData({ ...formData, yourName: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-full focus:border-gray-400 focus:outline-none transition-colors"
                  />
                </div>
              )}
            </div>

            {/* Story Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Story Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Give your story a title..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-full focus:border-gray-400 focus:outline-none transition-colors"
              />
            </div>

            {/* Content based on tab */}
            {activeTab === 'text' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Story *
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={12}
                  placeholder="Share your story, experience, or knowledge..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-gray-400 focus:outline-none transition-colors font-serif"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {formData.content.length} characters
                </p>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Voice Recording
                </label>

                {!audioBlob ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    {!isRecording ? (
                      <>
                        <Mic className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <button
                          type="button"
                          onClick={startAudioRecording}
                          className="px-8 py-4 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors text-lg font-medium focus:outline-none focus:ring-4 focus:ring-gray-900/20"
                        >
                          Start Recording
                        </button>
                        <p className="text-sm text-gray-500 mt-4">
                          Click to start recording your voice
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="h-16 w-16 bg-red-500 rounded-full mx-auto mb-4 animate-pulse" />
                        <p className="text-3xl font-mono font-bold text-red-600 mb-4">
                          {formatTime(recordingTime)}
                        </p>
                        <button
                          type="button"
                          onClick={stopAudioRecording}
                          className="px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-lg font-medium"
                        >
                          Stop Recording
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-purple-600" />
                        <span className="font-medium text-purple-900">Recording Complete</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAudioBlob(null);
                          setRecordingTime(0);
                        }}
                        className="text-purple-600 hover:text-purple-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <audio controls src={URL.createObjectURL(audioBlob)} className="w-full" />
                  </div>
                )}

                {/* Optional text description */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add a brief description (optional)
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={4}
                    placeholder="Add any additional context or details..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-gray-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {activeTab === 'video' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Video Upload
                </label>

                {!videoFile ? (
                  <label className="block border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-colors">
                    <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <span className="text-lg font-medium text-gray-700 block mb-2">
                      Click to Upload Video
                    </span>
                    <span className="text-sm text-gray-500">
                      MP4, MOV, or other video formats
                    </span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setVideoFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-teal-600" />
                        <div>
                          <p className="font-medium text-teal-900">{videoFile.name}</p>
                          <p className="text-sm text-teal-700">
                            {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setVideoFile(null)}
                        className="text-teal-600 hover:text-teal-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    {videoFile && (
                      <video
                        controls
                        src={URL.createObjectURL(videoFile)}
                        className="w-full rounded-lg"
                      />
                    )}
                  </div>
                )}

                {/* Optional text description */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add a brief description (optional)
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={4}
                    placeholder="Add any additional context or details..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-gray-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Category */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Story Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-full focus:border-gray-400 focus:outline-none transition-colors"
              >
                <option value="community">Community Life</option>
                <option value="culture">Culture & Language</option>
                <option value="health">Health & Wellbeing</option>
                <option value="youth">Youth & Education</option>
                <option value="family">Family & Elders</option>
                <option value="environment">Land & Environment</option>
              </select>
            </div>

            {/* Consent */}
            <div className="mb-8">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.consent}
                  onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded mt-1"
                />
                <div className="text-sm text-gray-700">
                  <span className="font-medium">I consent to sharing this story</span>
                  <p className="text-gray-600 mt-1">
                    I understand this story will be reviewed and may be shared with the Palm Island community
                    and used for reporting purposes. Stories containing traditional knowledge will require
                    Elder approval before being published.
                  </p>
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || (activeTab === 'audio' && !audioBlob && !formData.content) || (activeTab === 'video' && !videoFile && !formData.content)}
              className="w-full px-8 py-4 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-gray-900/20"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-6 w-6" />
                  Share Your Voice
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center text-gray-600">
          <p className="mb-2">
            Stories are reviewed for cultural protocols before being published
          </p>
          <p className="text-sm">
            Your voice matters • Your story strengthens our community
          </p>
        </div>
      </div>
    </div>
  );
}
