'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { User, BookOpen, MapPin, Search, UserPlus, ArrowRight } from 'lucide-react';
import VideoHero from '@/components/video/VideoHero';
import { assetUrl } from '@/lib/media/asset-url';
import { C } from '@/components/annual-report/2024-25/almanac/tokens';

interface Storyteller {
  id: string;
  full_name: string;
  preferred_name: string;
  profile_image_url?: string;
  bio?: string;
  location?: string;
  date_of_birth?: string;
  created_at: string;
  story_count?: number;
}

export default function StorytellerGalleryPage() {
  const [storytellers, setStorytellers] = useState<Storyteller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchStorytellers() {
      try {
        const supabase = createClient();

        const { data: stories, error } = await supabase
          .from('stories')
          .select(`
            id,
            storyteller:storyteller_id (
              id,
              full_name,
              preferred_name,
              profile_image_url,
              bio,
              location,
              date_of_birth,
              created_at
            )
          `)
          .eq('organization_id', '3c2011b9-f80d-4289-b300-0cd383cff479')
          .eq('is_public', true)
          .not('storyteller_id', 'is', null);

        if (error) throw error;

        const storytellerMap = new Map<string, Storyteller>();

        stories?.forEach((story: any) => {
          if (story.storyteller && story.storyteller.id) {
            const existing = storytellerMap.get(story.storyteller.id);
            if (existing) {
              existing.story_count = (existing.story_count || 0) + 1;
            } else {
              storytellerMap.set(story.storyteller.id, {
                ...story.storyteller,
                story_count: 1,
              });
            }
          }
        });

        const uniqueStorytellers = Array.from(storytellerMap.values()).sort((a, b) =>
          (a.preferred_name || a.full_name).localeCompare(b.preferred_name || b.full_name)
        );

        setStorytellers(uniqueStorytellers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching storytellers:', error);
        setLoading(false);
      }
    }

    fetchStorytellers();
  }, []);

  const filteredStorytellers = storytellers.filter(storyteller => {
    const matchesSearch = !searchQuery ||
      storyteller.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      storyteller.preferred_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      storyteller.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.shell }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 mx-auto mb-4" style={{ borderBottom: `2px solid ${C.ocean}` }}></div>
          <p className="font-fraunces italic" style={{ color: C.driftwood }}>Loading storytellers…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.shell }}>
      {/* Video Hero */}
      <VideoHero
        videoSrc={assetUrl("/hero-assets/clips/kids-beach.mp4")}
        overlay="gradient-brand"
        height="medium"
        parallax
        aria-label="Community Storytellers"
      >
        <div className="text-center text-white max-w-5xl mx-auto">
          <p
            className="font-bold uppercase mb-4"
            style={{ color: '#F5E9D0', fontSize: 11, letterSpacing: '0.3em', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
          >
            Voices of Palm Island
          </p>
          <h1
            className="font-fraunces font-bold mb-6"
            style={{ fontSize: 'clamp(36px, 6vw, 72px)', lineHeight: 1.05, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
          >
            Community storytellers
          </h1>
          <p
            className="font-fraunces max-w-2xl mx-auto mb-2"
            style={{ color: 'rgba(255,255,255,0.92)', fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: 1.55, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
          >
            The voices of Palm Island — sharing knowledge, experience, and vision.
          </p>
          <p className="font-fraunces italic" style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
            Manbarra &amp; Bwgcolman Country
          </p>
        </div>
      </VideoHero>

      {/* Stats Bar */}
      <section className="py-10" style={{ backgroundColor: '#FFFFFF', borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: storytellers.length, label: 'Active storytellers', accent: C.ochre },
              { value: storytellers.reduce((sum, s) => sum + (s.story_count || 0), 0), label: 'Total stories', accent: C.ocean },
              { value: storytellers.filter(s => s.profile_image_url).length, label: 'With photos', accent: C.mangrove },
              { value: '100%', label: 'Community owned', accent: C.turtleRed },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className="font-fraunces font-bold leading-none"
                  style={{ color: C.ocean, fontSize: 'clamp(28px, 3.5vw, 40px)' }}
                >
                  {stat.value}
                </div>
                <div
                  className="font-bold uppercase mt-3"
                  style={{ color: stat.accent, fontSize: 11, letterSpacing: '0.25em' }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4" style={{ color: C.muted }} />
            <input
              type="text"
              placeholder="Search storytellers by name or location…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
              style={{ border: `1px solid ${C.border}`, backgroundColor: '#FFFFFF', color: C.earth }}
            />
          </div>
          <Link
            href="/share-voice"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-bold uppercase text-xs hover:opacity-90 transition"
            style={{ backgroundColor: C.ocean, color: '#FBF8EE', letterSpacing: '0.15em' }}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Share your voice
          </Link>
        </div>
      </section>

      {/* Storytellers Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        {filteredStorytellers.length === 0 ? (
          <div className="text-center py-16 rounded-2xl" style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}` }}>
            <p className="font-fraunces italic" style={{ color: C.driftwood }}>No storytellers found. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStorytellers.map((storyteller) => (
              <Link
                key={storyteller.id}
                href={`/stories?storyteller=${storyteller.id}`}
                className="group rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-500"
                style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}`, borderTopWidth: 3, borderTopColor: C.ochre }}
              >
                {/* Profile Photo or Avatar */}
                <div className="h-64 relative overflow-hidden" style={{ backgroundColor: C.shell }}>
                  {storyteller.profile_image_url ? (
                    <img
                      src={storyteller.profile_image_url}
                      alt={storyteller.preferred_name || storyteller.full_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div
                        className="h-28 w-28 rounded-full flex items-center justify-center font-fraunces font-bold text-4xl"
                        style={{ backgroundColor: C.ochre + '22', color: C.ochre }}
                      >
                        {(storyteller.preferred_name || storyteller.full_name)
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3
                    className="font-fraunces font-bold mb-1 transition-colors"
                    style={{ color: C.ocean, fontSize: 22, lineHeight: 1.2 }}
                  >
                    {storyteller.preferred_name || storyteller.full_name}
                  </h3>

                  {storyteller.preferred_name && storyteller.preferred_name !== storyteller.full_name && (
                    <p className="mb-3" style={{ color: C.muted, fontSize: 13 }}>{storyteller.full_name}</p>
                  )}

                  {storyteller.location && (
                    <div className="flex items-center mb-2" style={{ color: C.driftwood, fontSize: 13 }}>
                      <MapPin className="h-3.5 w-3.5 mr-1.5" />
                      <span>{storyteller.location}</span>
                    </div>
                  )}

                  {storyteller.bio && (
                    <p
                      className="font-fraunces line-clamp-3 leading-relaxed mb-4"
                      style={{ color: C.driftwood, fontSize: 14 }}
                    >
                      {storyteller.bio}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
                    <div className="flex items-center" style={{ color: C.ocean }}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span className="font-fraunces font-bold" style={{ fontSize: 17 }}>{storyteller.story_count}</span>
                      <span className="ml-1.5" style={{ color: C.driftwood, fontSize: 12 }}>
                        {storyteller.story_count === 1 ? 'story' : 'stories'}
                      </span>
                    </div>
                    <span
                      className="font-bold uppercase flex items-center gap-1"
                      style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.15em' }}
                    >
                      View
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section
        className="editorial-section text-white"
        style={{ background: `linear-gradient(135deg, ${C.midnight}, ${C.earth})` }}
      >
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <p
            className="font-bold uppercase mb-4"
            style={{ color: C.ochre, fontSize: 11, letterSpacing: '0.3em' }}
          >
            Join us
          </p>
          <h2
            className="font-fraunces font-bold mb-6"
            style={{ fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.1 }}
          >
            Become a storyteller
          </h2>
          <p
            className="font-fraunces mb-10 max-w-2xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.6 }}
          >
            Every Palm Islander has a story worth sharing. Join our community of storytellers and
            help preserve our collective knowledge and experience.
          </p>
          <Link
            href="/stories/submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-bold uppercase text-xs hover:opacity-90 transition"
            style={{ backgroundColor: '#FFFFFF', color: C.ocean, letterSpacing: '0.15em' }}
          >
            Share your story now
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
