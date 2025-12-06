'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowLeft, Check, AlertCircle, Mic, PenTool } from 'lucide-react';
import StoryBuilder from '@/components/stories/StoryBuilder';
import VoiceRecorderWidget from '@/components/stories/VoiceRecorderWidget';

type StoryMode = 'choose' | 'voice' | 'written';

export default function ShareStoryPage() {
  const [mode, setMode] = useState<StoryMode>('choose');
  const [submitted, setSubmitted] = useState(false);
  const [savedStory, setSavedStory] = useState<{
    title: string;
    content: string;
    summary: string;
    category?: string;
  } | null>(null);

  const handleComplete = async (story: {
    title: string;
    content: string;
    summary: string;
    category: string;
    answers: Record<string, string>;
  }) => {
    // In a real app, save to Supabase here
    console.log('Story completed:', story);
    setSavedStory(story);
    setSubmitted(true);
  };

  const handleVoiceComplete = async (result: {
    audioBlob: Blob;
    audioUrl: string;
    duration: number;
    transcription: { text: string };
    storyDraft?: { title: string; content: string; summary: string };
  }) => {
    if (result.storyDraft) {
      setSavedStory(result.storyDraft);
      setSubmitted(true);
    }
  };

  if (submitted && savedStory) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Thank You for Sharing!
            </h1>
            <p className="text-gray-600 mb-6">
              Your story "{savedStory.title}" has been submitted for review.
              Our team will review it and it will be published to the community soon.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Story Preview</h3>
              <p className="text-sm text-gray-600">{savedStory.summary}</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">What happens next?</p>
                  <ul className="mt-1 text-amber-700 space-y-1">
                    <li>• Our team will review your story</li>
                    <li>• We may contact you for any clarifications</li>
                    <li>• Once approved, your story will be published</li>
                    <li>• You'll be notified when it's live</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/stories"
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                View All Stories
              </Link>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setSavedStory(null);
                  setMode('choose');
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Share Another Story
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12">
        <div className="container mx-auto px-4">
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 text-purple-200 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Stories
          </Link>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            Share Your Story
          </h1>
          <p className="text-purple-100 max-w-xl">
            Your stories matter. Share your experiences, wisdom, and memories
            with the Palm Island community and future generations.
          </p>
        </div>
      </div>

      {/* Story Input Section */}
      <div className="container mx-auto px-4 py-12">
        {mode === 'choose' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-8">
              How would you like to share your story?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => setMode('voice')}
                className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-purple-500 hover:shadow-lg transition-all text-left group"
              >
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <Mic className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Record Your Voice
                </h3>
                <p className="text-gray-600 text-sm">
                  Speak your story naturally. We'll transcribe it and help you polish it.
                  Perfect for oral histories and elder stories.
                </p>
              </button>

              <button
                onClick={() => setMode('written')}
                className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-purple-500 hover:shadow-lg transition-all text-left group"
              >
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                  <PenTool className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Write Your Story
                </h3>
                <p className="text-gray-600 text-sm">
                  Answer guided questions to craft your story. AI helps you
                  develop your thoughts into a complete narrative.
                </p>
              </button>
            </div>
          </div>
        )}

        {mode === 'voice' && (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setMode('choose')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to options
            </button>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Record Your Story
            </h2>
            <VoiceRecorderWidget onComplete={handleVoiceComplete} />
          </div>
        )}

        {mode === 'written' && (
          <div>
            <div className="max-w-4xl mx-auto mb-6">
              <button
                onClick={() => setMode('choose')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to options
              </button>
            </div>
            <StoryBuilder onComplete={handleComplete} />
          </div>
        )}
      </div>

      {/* Why Share Section */}
      <div className="bg-white border-t border-gray-200 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Why Share Your Story?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌟</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Preserve Culture</h3>
              <p className="text-sm text-gray-600">
                Your stories help preserve cultural knowledge and traditions
                for future generations.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Connect Community</h3>
              <p className="text-sm text-gray-600">
                Stories bring people together and help community members
                learn from each other.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💪</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Inspire Others</h3>
              <p className="text-sm text-gray-600">
                Your experiences can help and inspire others facing
                similar journeys.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
