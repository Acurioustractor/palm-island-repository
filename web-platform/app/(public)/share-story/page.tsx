'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import StoryBuilder from '@/components/stories/StoryBuilder';

export default function ShareStoryPage() {
  const [submitted, setSubmitted] = useState(false);
  const [savedStory, setSavedStory] = useState<{
    title: string;
    content: string;
    summary: string;
    category: string;
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

      {/* Story Builder */}
      <div className="container mx-auto px-4 py-12">
        <StoryBuilder onComplete={handleComplete} />
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
