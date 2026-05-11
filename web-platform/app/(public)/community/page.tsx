import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase/client';
import { Mic, BookOpen, Users, Heart, ArrowRight, Sparkles, Image as ImageIcon } from 'lucide-react';
import { FALLBACKS } from '@/lib/stats/current-stats';
import { getHeroImage, getHeroVideo, getPageMedia } from '@/lib/media/utils';
import VideoHero from '@/components/video/VideoHero';
import { assetUrl } from '@/lib/media/asset-url';
import { C } from '@/components/annual-report/2024-25/almanac/tokens';

export const dynamic = 'force-dynamic'
export default async function CommunityPage() {
  const supabase = createServerSupabase();

  // Fetch media from Supabase
  const heroImage = await getHeroImage('community');
  const heroVideo = await getHeroVideo('community');
  const programImages = await getPageMedia({
    pageContext: 'community',
    pageSection: 'programs',
    fileType: 'image',
    limit: 3
  });
  const storytellersImage = await getPageMedia({
    pageContext: 'community',
    pageSection: 'storytellers',
    fileType: 'image',
    limit: 1
  });

  // Get story count
  const { count: storyCount } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .eq('access_level', 'public')
    .eq('status', 'published');

  // Get storyteller count
  const { count: storytellerCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'storyteller');

  // Get recent stories (latest 3)
  const { data: recentStories } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      category,
      created_at,
      storyteller_id,
      profiles!inner(full_name, preferred_name)
    `)
    .eq('access_level', 'public')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      {true ? (
        <VideoHero
          videoSrc={heroVideo?.public_url || assetUrl('/hero-assets/clips/elders-on-country.mp4')}
          overlay="gradient-brand"
          height="tall"
          parallax
          aria-label="Palm Island Community"
        >
          <div className="text-center text-white max-w-5xl mx-auto">
            <p
              className="font-bold uppercase mb-4"
              style={{ color: '#F5E9D0', fontSize: 11, letterSpacing: '0.3em', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
            >
              Community
            </p>
            <h1
              className="font-fraunces font-bold mb-6"
              style={{ fontSize: 'clamp(40px, 6.5vw, 76px)', lineHeight: 1.05, textShadow: '0 2px 14px rgba(0,0,0,0.5)' }}
            >
              This is your community
            </h1>
            <p
              className="font-fraunces italic mb-4"
              style={{ color: 'rgba(255,255,255,0.92)', fontSize: 'clamp(18px, 2.5vw, 28px)', textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}
            >
              Your stories. Your voice. Your future.
            </p>
            <p
              className="font-fraunces max-w-3xl mx-auto mb-12 leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(16px, 2vw, 19px)', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
            >
              Every Palm Islander has a story worth sharing. Read stories from your neighbours,
              friends, and family. Add your own voice to strengthen our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/share-voice"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-bold uppercase text-xs hover:opacity-90 transition"
                style={{ backgroundColor: '#FFFFFF', color: C.ocean, letterSpacing: '0.15em' }}
              >
                <Mic className="w-3.5 h-3.5" />
                Share your voice
              </Link>
              <Link
                href="/stories"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-bold uppercase text-xs hover:bg-white/15 transition"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.4)', letterSpacing: '0.15em' }}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Read stories
              </Link>
            </div>
          </div>
        </VideoHero>
      ) : (
        <section
          className="relative bg-white border-b border-gray-100 editorial-section"
          style={heroImage ? {
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.95)), url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {
            background: 'linear-gradient(135deg, #f8f6f4 0%, #ede8e3 50%, #f0ece8 100%)'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
              Community
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.02em] leading-[1.1] mt-4 mb-6 text-gray-900">
              This Is YOUR Community
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-gray-500">
              YOUR Stories, YOUR Voice, YOUR Future
            </p>
            <p className="text-lg max-w-3xl mx-auto text-gray-600 mb-12 leading-relaxed">
              Every Palm Islander has a story worth sharing. Read stories from your neighbors,
              friends, and family. Add your own voice to strengthen our community.
            </p>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/share-voice"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white hover:bg-gray-800 font-semibold rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-gray-900/20"
              >
                <Mic className="w-5 h-5" />
                <span>Share Your Voice</span>
              </Link>
              <Link
                href="/stories"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-gray-200 hover:border-gray-900 text-gray-900 font-semibold rounded-full transition-all"
              >
                <BookOpen className="w-5 h-5" />
                <span>Read Stories</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Impact Stats */}
      <section className="editorial-section" style={{ backgroundColor: C.shell }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p
              className="font-bold uppercase mb-3"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              The collective archive
            </p>
            <h2
              className="font-fraunces font-bold mb-3"
              style={{ color: C.ocean, fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 1.1 }}
            >
              Our community voice
            </h2>
            <p className="font-fraunces" style={{ color: C.driftwood, fontSize: 17, lineHeight: 1.55 }}>
              Together, we&apos;re building a powerful collection of stories.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { value: `${storyCount || FALLBACKS.storyCount}+`, label: 'Stories shared', sub: 'And growing every day', accent: C.ochre },
              { value: `${storytellerCount || 28}+`, label: 'Community voices', sub: 'Real stories, real people', accent: C.ocean },
              { value: '100%', label: 'Community owned', sub: 'Your data, your control', accent: C.turtleRed },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-7 rounded-2xl"
                style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}`, borderTopWidth: 3, borderTopColor: stat.accent }}
              >
                <div
                  className="font-fraunces font-bold leading-none mb-3"
                  style={{ color: C.ocean, fontSize: 'clamp(36px, 4vw, 56px)' }}
                >
                  {stat.value}
                </div>
                <p
                  className="font-bold uppercase mb-2"
                  style={{ color: stat.accent, fontSize: 11, letterSpacing: '0.25em' }}
                >
                  {stat.label}
                </p>
                <p className="font-fraunces" style={{ color: C.driftwood, fontSize: 13, lineHeight: 1.5 }}>
                  {stat.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Stories */}
      <section className="editorial-section" style={{ backgroundColor: '#FFFFFF', borderTop: `1px solid ${C.border}` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p
              className="font-bold uppercase mb-4"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Recent voices
            </p>
            <h2
              className="font-fraunces font-bold mb-3"
              style={{ color: C.ocean, fontSize: 'clamp(32px, 4.5vw, 44px)', lineHeight: 1.1 }}
            >
              Latest community stories
            </h2>
            <p className="font-fraunces" style={{ color: C.driftwood, fontSize: 18, lineHeight: 1.55 }}>
              Fresh voices from Palm Island.
            </p>
          </div>

          {recentStories && recentStories.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {recentStories.map((story: any) => (
                <Link
                  key={story.id}
                  href={`/stories/${story.id}`}
                  className="group p-6 rounded-2xl transition-all"
                  style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}`, borderTopWidth: 3, borderTopColor: C.ochre }}
                >
                  <p
                    className="font-bold uppercase mb-3 inline-flex items-center gap-2"
                    style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.2em' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.ochre }} />
                    {story.category || 'Community story'}
                  </p>
                  <h3
                    className="font-fraunces font-bold mb-3"
                    style={{ color: C.ocean, fontSize: 21, lineHeight: 1.2 }}
                  >
                    {story.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-4" style={{ color: C.driftwood, fontSize: 13 }}>
                    <Users className="w-3.5 h-3.5" />
                    <span>{story.profiles?.preferred_name || story.profiles?.full_name || 'Community Voice'}</span>
                  </div>
                  <div
                    className="font-bold uppercase flex items-center gap-1.5"
                    style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.15em' }}
                  >
                    Read story
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-12 rounded-2xl"
              style={{ backgroundColor: C.shell, border: `1px solid ${C.border}` }}
            >
              <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: C.muted }} />
              <p className="font-fraunces mb-6" style={{ color: C.driftwood, fontSize: 16 }}>
                No stories yet. Be the first to share!
              </p>
              <Link
                href="/share-voice"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-bold uppercase text-xs hover:opacity-90 transition"
                style={{ backgroundColor: C.ocean, color: '#FBF8EE', letterSpacing: '0.15em' }}
              >
                <Mic className="w-3.5 h-3.5" />
                Share your story
              </Link>
            </div>
          )}

          <div className="text-center">
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-bold uppercase text-xs hover:opacity-90 transition"
              style={{ backgroundColor: C.ocean, color: '#FBF8EE', letterSpacing: '0.15em' }}
            >
              View all stories
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How to Share Your Voice */}
      <section className="editorial-section" style={{ backgroundColor: C.shell, borderTop: `1px solid ${C.border}` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p
              className="font-bold uppercase mb-4"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Add your voice
            </p>
            <h2
              className="font-fraunces font-bold mb-3"
              style={{ color: C.ocean, fontSize: 'clamp(32px, 4.5vw, 44px)', lineHeight: 1.1 }}
            >
              Three ways to share your voice
            </h2>
            <p className="font-fraunces" style={{ color: C.driftwood, fontSize: 18, lineHeight: 1.55 }}>
              Choose the way that works best for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Write Your Story */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden text-center">
              {/* Image */}
              <div className="relative h-48 w-full bg-gray-50">
                {programImages[0] ? (
                  <img
                    src={programImages[0].public_url}
                    alt={programImages[0].alt_text || 'Write Your Story'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <BookOpen className="w-12 h-12 text-gray-300" />
                  </div>
                )}
              </div>

              <div className="p-8">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-8 h-8 text-gray-900" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Write Your Story</h3>
                <p className="text-gray-600 mb-6">
                  Type out your story in your own words. Take your time, edit as you go.
                </p>
              </div>
            </div>

            {/* Record Your Voice */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden text-center">
              {/* Image */}
              <div className="relative h-48 w-full bg-gray-50">
                {programImages[1] ? (
                  <img
                    src={programImages[1].public_url}
                    alt={programImages[1].alt_text || 'Record Your Voice'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <Mic className="w-12 h-12 text-gray-300" />
                  </div>
                )}
              </div>

              <div className="p-8">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mic className="w-8 h-8 text-gray-900" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Record Your Voice</h3>
                <p className="text-gray-600 mb-6">
                  Speak your story into your phone or computer. Just like having a yarn.
                </p>
              </div>
            </div>

            {/* Upload a Video */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden text-center">
              {/* Image */}
              <div className="relative h-48 w-full bg-gray-50">
                {programImages[2] ? (
                  <img
                    src={programImages[2].public_url}
                    alt={programImages[2].alt_text || 'Upload a Video'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <Sparkles className="w-12 h-12 text-gray-300" />
                  </div>
                )}
              </div>

              <div className="p-8">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-gray-900" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Upload a Video</h3>
                <p className="text-gray-600 mb-6">
                  Record yourself telling your story on video. Show your face, share your emotion.
                </p>
              </div>
            </div>
          </div>

          <div
            className="p-8 rounded-2xl max-w-2xl mx-auto"
            style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}`, borderTopWidth: 3, borderTopColor: C.turtleRed }}
          >
            <p
              className="font-bold uppercase mb-2 text-center"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Your control · cultural protocol
            </p>
            <h3
              className="font-fraunces font-bold mb-6 text-center"
              style={{ color: C.ocean, fontSize: 24, lineHeight: 1.2 }}
            >
              Your story, your choice
            </h3>
            <ul className="space-y-3 mb-8" style={{ color: C.driftwood, fontSize: 15, lineHeight: 1.55 }}>
              {[
                "Share anonymously or with your name — it's up to you",
                'Your story will be reviewed before being published',
                'You keep control of your story and can request changes anytime',
                'All submissions follow cultural protocols and community guidelines',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 font-fraunces">
                  <Heart className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: C.ochre }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="text-center">
              <Link
                href="/share-voice"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-bold uppercase text-xs hover:opacity-90 transition"
                style={{ backgroundColor: C.ocean, color: '#FBF8EE', letterSpacing: '0.15em' }}
              >
                <Mic className="w-3.5 h-3.5" />
                Share your voice now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Storytellers */}
      <section className="editorial-section bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Meet Our Storytellers
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Real people from Palm Island sharing their experiences, wisdom, and vision
                for our community's future.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                From elders sharing cultural knowledge to young people speaking about their
                hopes and dreams, every voice matters. Every story strengthens our community.
              </p>
              <Link
                href="/storytellers"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-gray-900/20"
              >
                <Users className="w-5 h-5" />
                <span>View All Storytellers</span>
              </Link>
            </div>

            {/* Storytellers Card with Optional Image */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              {/* Optional storytellers image */}
              {storytellersImage && storytellersImage.length > 0 && (
                <div className="relative h-64 w-full">
                  <img
                    src={storytellersImage[0].public_url}
                    alt={storytellersImage[0].alt_text || 'Community storytellers'}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-8">
                <div className="text-center mb-6">
                <div className="text-6xl font-bold text-gray-900 mb-2">{storytellerCount || 28}+</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Community Members Sharing Their Stories</div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100">
                      <Users className="w-5 h-5 text-gray-900" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Community Voice</div>
                      <div className="text-sm text-gray-600">Share anonymously</div>
                    </div>
                  </div>
                </div>
                  <p className="text-sm text-gray-600 text-center italic">
                    Plus named storytellers sharing their journeys, wisdom, and experiences
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
