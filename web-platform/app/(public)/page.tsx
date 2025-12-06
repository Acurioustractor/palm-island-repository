import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { Users, Building2, Heart, BookOpen, Calendar, Bot, Quote, Shield } from 'lucide-react';
import { getHeroImage, getPageMedia, getFeaturedPageMedia } from '@/lib/media/utils';
import { getElderStories, getPageStories } from '@/lib/stories/utils';
import HomeStats from './HomeStats';
import ElderStoryCard from '@/components/stories/ElderStoryCard';
import StoryCarousel from '@/components/stories/StoryCarousel';

export default async function HomePage() {
  // ============================================================================
  // STRATEGIC MEDIA FETCHING
  // ============================================================================

  // 1. HERO: Video OR Photo for emotional connection
  const heroVideo = await getFeaturedPageMedia('home', 'hero', 'video');
  const heroImage = await getHeroImage('home');

  // 2. STATS: Photos of people behind the numbers (humanize data)
  const statsPhotos = await getPageMedia({
    pageContext: 'home',
    pageSection: 'stats',
    fileType: 'image',
    limit: 4
  });

  // 3. FEATURES: Service-specific photos for cards (make abstract tangible)
  const featureImages = await getPageMedia({
    pageContext: 'home',
    pageSection: 'features',
    fileType: 'image',
    limit: 6
  });

  // 4. COMMUNITY GALLERY: Action shots showing programs in action
  const communityPhotos = await getPageMedia({
    pageContext: 'home',
    pageSection: 'gallery',
    fileType: 'image',
    limit: 6
  });

  // 5. TESTIMONIALS: Portraits + optional videos for trust/authenticity
  const testimonialPhotos = await getPageMedia({
    pageContext: 'home',
    pageSection: 'testimonials',
    fileType: 'image',
    limit: 3
  });

  // 6. QUOTE BACKGROUNDS: Large photos for quote sections
  const quoteBackground = await getPageMedia({
    pageContext: 'home',
    pageSection: 'quotes',
    fileType: 'image',
    limit: 1
  });

  // 7. CTA BACKGROUNDS: Action photos for call-to-action sections
  const ctaBackground = await getPageMedia({
    pageContext: 'home',
    pageSection: 'cta',
    fileType: 'image',
    limit: 1
  });

  // 8. ELDER STORIES: Featured elder stories with quotes
  const elderStories = await getElderStories(3);

  // 9. FEATURED CAROUSEL: Intelligently-placed featured stories
  const carouselStories = await getPageStories({
    pageContext: 'home',
    pageSection: 'featured',
    limit: 6
  });

  return (
    <div className="min-h-screen bg-white">

      {/* ================================================================
          HERO SECTION
          PURPOSE: Immediate emotional connection, set tone
          MEDIA: Video (autoplay, muted, loop) OR Photo background
          WHY: Video creates immersion, photo provides fallback
          DATABASE: page_context='home', page_section='hero'
          ================================================================ */}
      <section className="relative h-[85vh] min-h-[700px] flex items-center justify-center overflow-hidden">

        {/* Video Background (if available) */}
        {heroVideo ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={heroVideo.public_url} type="video/mp4" />
          </video>
        ) : heroImage ? (
          // Photo Fallback
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
        ) : (
          // Gradient Fallback
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        )}

        {/* Dark overlay for text readability - 60% opacity */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

        {/* Vignette effect */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)'
        }} />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 drop-shadow-2xl leading-tight">
            Palm Island Community Repository
          </h1>
          <p className="text-2xl md:text-3xl lg:text-4xl mb-6 font-light drop-shadow-lg">
            Manbarra & Bwgcolman Country
          </p>
          <p className="text-lg md:text-xl lg:text-2xl max-w-4xl mx-auto mb-12 drop-shadow-lg leading-relaxed">
            Community-controlled storytelling, impact measurement, and data sovereignty
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/stories"
              className="px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all shadow-2xl"
            >
              Read Stories
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all"
            >
              About PICC
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* ================================================================
          IMPACT STATS with ICONS
          PURPOSE: Clear visual representation of key metrics
          MEDIA: Icons instead of photos for cleaner presentation
          WHY: Icons are more scalable and work better for stats
          ================================================================ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

            {/* Stat 1: Staff Members */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">197</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Staff Members</div>
              <div className="text-xs text-gray-400 mt-1">+30% from 2023</div>
            </div>

            {/* Stat 2: Services */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">16+</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Integrated Services</div>
              <div className="text-xs text-gray-400 mt-1">Holistic support</div>
            </div>

            {/* Stat 3: Community Controlled */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
              <Heart className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">100%</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Community Controlled</div>
              <div className="text-xs text-gray-400 mt-1">Since 2021</div>
            </div>

            {/* Stat 4: Stories */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">31+</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Stories Shared</div>
              <div className="text-xs text-gray-400 mt-1">And growing</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          FEATURED STORIES CAROUSEL
          PURPOSE: Showcase intelligently-placed featured community stories
          MEDIA: Auto-advancing carousel with high-quality stories
          WHY: Highlight diverse stories using multi-factor scoring
          DATABASE: page_context='home', page_section='featured'
          ALGORITHM: Quality (35%) + Engagement (30%) + Cultural (15%) + Recency (10%) + Diversity (10%)
          ================================================================ */}
      {carouselStories && carouselStories.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Featured Community Stories
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover the voices, experiences, and wisdom of our community members through their powerful stories
              </p>
            </div>

            <StoryCarousel
              stories={carouselStories}
              autoplay={true}
              interval={5000}
              className="mb-8"
            />

            <div className="text-center mt-8">
              <Link
                href="/stories"
                className="inline-flex items-center gap-2 px-8 py-4 bg-picc-teal text-white rounded-full font-semibold hover:bg-picc-navy transition-colors shadow-lg hover:shadow-xl"
              >
                <BookOpen className="w-5 h-5" />
                Explore All Stories
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          ELDER WISDOM STORIES
          PURPOSE: Showcase elder voices with quotes and profile images
          MEDIA: Story cards with quotes that link to full stories
          WHY: Connect readers to elder wisdom directly
          DATABASE: Stories from elders with is_elder=true
          ================================================================ */}
      {elderStories && elderStories.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Shield className="w-10 h-10 text-purple-600" />
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Voices of Our Elders
                </h2>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Wisdom, knowledge, and guidance from community elders
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {elderStories.slice(0, 3).map((story) => {
                // Extract key quote from metadata - get a SHORT one
                const metadata = (story as any).metadata;
                const quotes = metadata?.key_quotes || [];
                const keyQuote = quotes.find((q: string) => q.length < 100) || quotes[0];
                const storytellerName = story.storyteller?.preferred_name || story.storyteller?.full_name || 'Elder';
                const profileImageUrl = story.storyteller?.profile_image_url;

                return (
                  <ElderStoryCard
                    key={story.id}
                    storyId={story.id}
                    storytellerName={storytellerName}
                    profileImageUrl={profileImageUrl}
                    keyQuote={keyQuote}
                    storyTitle={story.title}
                  />
                );
              })}
            </div>

            {/* Link to all stories */}
            <div className="text-center mt-12">
              <Link
                href="/stories"
                className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-full font-semibold text-lg hover:bg-purple-700 transition-all shadow-lg"
              >
                <BookOpen className="w-5 h-5" />
                Read All Community Stories
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          QUOTE SECTION with PHOTO BACKGROUND
          PURPOSE: Emotional reinforcement of community voice
          MEDIA: Large community photo as background
          WHY: Connect quote to real faces, make message tangible
          DATABASE: page_context='home', page_section='quotes'
          ================================================================ */}
      <section
        className="py-20 relative overflow-hidden"
        style={quoteBackground[0] ? {
          backgroundImage: `url(${quoteBackground[0].public_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/80" />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <Quote className="w-16 h-16 mx-auto mb-6 opacity-50" />
          <blockquote className="text-3xl md:text-4xl font-bold mb-6 italic leading-relaxed">
            "Everything we do is for, with, and because of the people of this beautiful community"
          </blockquote>
          <p className="text-xl text-gray-300">— Rachel Atkinson, CEO</p>
        </div>
      </section>

      {/* ================================================================
          FEATURE CARDS with PHOTO BACKGROUNDS
          PURPOSE: Make services tangible through visual evidence
          MEDIA: Service-specific photos as card backgrounds
          WHY: Annual reports/library/AI are abstract - photos make real
          DATABASE: page_context='home', page_section='features'
          ================================================================ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Our Journey
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              15 years of growth through interactive reports, comprehensive knowledge, and AI assistance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">

            {/* Card 1: Annual Reports - WITH PHOTO BACKGROUND */}
            <Link href="/annual-reports" className="group">
              <div className="bg-white rounded-2xl border border-gray-200 hover:border-gray-900 overflow-hidden transition-all h-full flex flex-col shadow-lg hover:shadow-2xl">
                <div
                  className="aspect-video relative flex items-center justify-center bg-cover bg-center"
                  style={featureImages[0] ? { backgroundImage: `url(${featureImages[0].public_url})` } : undefined}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-purple-700/80" />
                  <div className="text-white text-center z-10 relative p-6">
                    <Calendar className="w-16 h-16 mx-auto mb-4 drop-shadow-lg" />
                    <div className="text-6xl font-bold drop-shadow-lg">15</div>
                    <div className="text-xl font-semibold drop-shadow-lg">Annual Reports</div>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    Interactive Timeline
                  </h3>
                  <p className="text-gray-600 mb-4 flex-1">
                    Navigate 15 years of growth, achievements, and community control.
                    264+ images, full-text search, and AI-powered Q&A.
                  </p>
                  <div className="flex items-center text-gray-900 font-semibold group-hover:gap-2 transition-all">
                    Explore Timeline →
                  </div>
                </div>
              </div>
            </Link>

            {/* Card 2: Knowledge Library - WITH PHOTO BACKGROUND */}
            <Link href="/wiki/stories" className="group">
              <div className="bg-white rounded-2xl border border-gray-200 hover:border-gray-900 overflow-hidden transition-all h-full flex flex-col shadow-lg hover:shadow-2xl">
                <div
                  className="aspect-video relative flex items-center justify-center bg-cover bg-center"
                  style={featureImages[1] ? { backgroundImage: `url(${featureImages[1].public_url})` } : undefined}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-600/80 to-teal-700/80" />
                  <BookOpen className="w-24 h-24 text-white relative z-10 drop-shadow-2xl" />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                    Knowledge Library
                  </h3>
                  <p className="text-gray-600 mb-4 flex-1">
                    Browse historical events, services, financial records, and deep insights
                    into PICC's operations and impact.
                  </p>
                  <div className="flex items-center text-gray-900 font-semibold group-hover:gap-2 transition-all">
                    Browse Library →
                  </div>
                </div>
              </div>
            </Link>

            {/* Card 3: AI Chat - WITH PHOTO BACKGROUND */}
            <Link href="/chat" className="group">
              <div className="bg-white rounded-2xl border border-gray-200 hover:border-gray-900 overflow-hidden transition-all h-full flex flex-col shadow-lg hover:shadow-2xl">
                <div
                  className="aspect-video relative flex items-center justify-center bg-cover bg-center"
                  style={featureImages[2] ? { backgroundImage: `url(${featureImages[2].public_url})` } : undefined}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-600/80 to-red-700/80" />
                  <Bot className="w-24 h-24 text-white relative z-10 drop-shadow-2xl" />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    Ask AI
                  </h3>
                  <p className="text-gray-600 mb-4 flex-1">
                    AI-powered assistant with deep knowledge of PICC's history, services,
                    and community programs. Get instant answers.
                  </p>
                  <div className="flex items-center text-gray-900 font-semibold group-hover:gap-2 transition-all">
                    Ask Questions →
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Stats Bar */}
          <Suspense fallback={<div className="text-center py-8">Loading stats...</div>}>
            <HomeStats />
          </Suspense>
        </div>
      </section>

      {/* ================================================================
          FEATURED VIDEO
          PURPOSE: Showcase community stories through video
          MEDIA: Featured video from media library
          WHY: Video creates emotional connection and shows real community
          DATABASE: page_context='home', page_section='hero', file_type='video'
          ================================================================ */}
      {heroVideo && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {heroVideo.title || 'Community Stories'}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Hear directly from Palm Islanders about our journey
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {/* Descript Embedded Video Player */}
              <div
                className="relative rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  left: 0,
                  width: '100%',
                  height: 0,
                  position: 'relative',
                  paddingBottom: '56.25%'
                }}
              >
                <iframe
                  src={heroVideo.public_url.replace('/view/', '/embed/')}
                  style={{
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    border: 0
                  }}
                  allowFullScreen
                  allow="encrypted-media *; fullscreen *;"
                  title={heroVideo.title || 'Community Story'}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          COMMUNITY IN ACTION GALLERY
          PURPOSE: Visual proof of diverse programs happening
          MEDIA: Grid of action shots from different programs/events
          WHY: Show community isn't abstract - it's people doing things
          DATABASE: page_context='home', page_section='gallery'
          ================================================================ */}
      {communityPhotos && communityPhotos.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Community in Action
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Real programs, real people, real impact across our services
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {communityPhotos.map((photo, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow group cursor-pointer"
                >
                  <img
                    src={photo.public_url}
                    alt={photo.alt_text || photo.title || `Community activity ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <p className="text-white text-sm font-medium">{photo.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          CTA SECTION with PHOTO BACKGROUND
          PURPOSE: Visual call-to-action showing what's possible
          MEDIA: Action photo of community engagement
          WHY: Show actual outcome of clicking - people sharing stories
          DATABASE: page_context='home', page_section='cta'
          ================================================================ */}
      <section
        className="py-20 relative overflow-hidden"
        style={ctaBackground[0] ? {
          backgroundImage: `url(${ctaBackground[0].public_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-900/90" />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Share Your Voice with Our Community
          </h2>
          <p className="text-lg mb-8 text-gray-100">
            Every Palm Islander has a story. Your voice strengthens our collective journey.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/share-voice"
              className="px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all shadow-2xl"
            >
              Share Your Story
            </Link>
            <Link
              href="/stories"
              className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all"
            >
              Read Stories
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
