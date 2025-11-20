'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Mail, Plus, Eye, Send, ArrowLeft, Calendar, Users } from 'lucide-react';
import Link from 'next/link';

interface Story {
  id: string;
  title: string;
  content: string;
  created_at: string;
  storyteller_id: string;
  image_url?: string;
}

export default function NewsletterPage() {
  const supabase = createClientComponentClient();
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStories, setSelectedStories] = useState<Set<string>>(new Set());
  const [newsletterTitle, setNewsletterTitle] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    loadRecentStories();
  }, []);

  const loadRecentStories = async () => {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setStories(data);
    }
  };

  const toggleStory = (storyId: string) => {
    const newSelected = new Set(selectedStories);
    if (newSelected.has(storyId)) {
      newSelected.delete(storyId);
    } else {
      newSelected.add(storyId);
    }
    setSelectedStories(newSelected);
  };

  const generateNewsletter = () => {
    if (!newsletterTitle || selectedStories.size === 0) {
      alert('Please add a title and select at least one story');
      return;
    }
    setPreview(true);
  };

  const selectedStoriesList = stories.filter(s => selectedStories.has(s.id));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/picc/content-studio" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Content Studio
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <Mail className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Newsletter Builder</h1>
          </div>
          <p className="text-gray-600">Create community newsletters from published stories</p>
        </div>

        {!preview ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Newsletter Configuration */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Newsletter Details</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Newsletter Title
                    </label>
                    <input
                      type="text"
                      value={newsletterTitle}
                      onChange={(e) => setNewsletterTitle(e.target.value)}
                      placeholder="PICC Stories - January 2024"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Introduction
                    </label>
                    <textarea
                      value={introduction}
                      onChange={(e) => setIntroduction(e.target.value)}
                      placeholder="Welcome to this month's newsletter..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Selected Stories</span>
                      <span className="font-semibold text-gray-900">{selectedStories.size}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-gray-600">Total Stories</span>
                      <span className="font-semibold text-gray-900">{stories.length}</span>
                    </div>

                    <button
                      onClick={generateNewsletter}
                      disabled={selectedStories.size === 0 || !newsletterTitle}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Preview Newsletter
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Story Selection */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Stories to Include</h2>
              <div className="space-y-3">
                {stories.map((story) => (
                  <div
                    key={story.id}
                    onClick={() => toggleStory(story.id)}
                    className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-all ${
                      selectedStories.has(story.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedStories.has(story.id)}
                        onChange={() => {}}
                        className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{story.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {story.content.substring(0, 200)}...
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {new Date(story.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Preview */
          <div>
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setPreview(false)}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Editor
              </button>
              <button
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-all flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Send Newsletter
              </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-3xl mx-auto">
              {/* Newsletter Header */}
              <div className="text-center mb-8 pb-8 border-b border-gray-200">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{newsletterTitle}</h1>
                <p className="text-gray-600">{new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>

              {/* Introduction */}
              {introduction && (
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{introduction}</p>
                </div>
              )}

              {/* Stories */}
              <div className="space-y-8">
                {selectedStoriesList.map((story, index) => (
                  <div key={story.id} className="pb-8 border-b border-gray-200 last:border-0">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">{story.title}</h2>
                    {story.image_url && (
                      <img
                        src={story.image_url}
                        alt={story.title}
                        className="w-full rounded-lg mb-4"
                      />
                    )}
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {story.content.substring(0, 500)}...
                    </p>
                    <div className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Read full story →
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
                <p>Palm Island Community Company</p>
                <p className="mt-1">Community-controlled storytelling and impact</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
