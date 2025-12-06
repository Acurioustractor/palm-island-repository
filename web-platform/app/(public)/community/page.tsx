import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase/client';
import { Mic, BookOpen, Users, Heart, ArrowRight, Sparkles, Image as ImageIcon } from 'lucide-react';
import { getHeroImage, getPageMedia } from '@/lib/media/utils';

export default async function CommunityPage() {
  const supabase = createServerSupabase();

  // Fetch media from Supabase
  const heroImage = await getHeroImage('community');
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
    .eq('is_public', true);

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
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="relative bg-white border-b border-gray-100 py-20 lg:py-32"
        style={heroImage ? {
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.95)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
            This Is YOUR Community
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-gray-600">
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

      {/* Impact Stats */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Our Community Voice
            </h2>
            <p className="text-gray-600">Together, we're building a powerful collection of stories</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white border border-gray-100 rounded-2xl">
              <div className="text-5xl font-bold text-gray-900 mb-2">{storyCount || 31}+</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Stories Shared</div>
              <div className="text-xs text-gray-400 mt-1">And growing every day</div>
            </div>
            <div className="text-center p-8 bg-white border border-gray-100 rounded-2xl">
              <div className="text-5xl font-bold text-gray-900 mb-2">28+</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Community Voices</div>
              <div className="text-xs text-gray-400 mt-1">Real stories, real people</div>
            </div>
            <div className="text-center p-8 bg-white border border-gray-100 rounded-2xl">
              <div className="text-5xl font-bold text-gray-900 mb-2">100%</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Community Owned</div>
              <div className="text-xs text-gray-400 mt-1">Your data, your control</div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Stories */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Latest Community Stories
            </h2>
            <p className="text-lg text-gray-600">
              Fresh voices from Palm Island
            </p>
          </div>

          {recentStories && recentStories.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {recentStories.map((story: any) => (
                <Link
                  key={story.id}
                  href={`/stories/${story.id}`}
                  className="group bg-white p-6 rounded-2xl border border-gray-200 hover:border-gray-900 transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                    <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                      {story.category || 'Community Story'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {story.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{story.profiles?.preferred_name || story.profiles?.full_name || 'Community Voice'}</span>
                  </div>
                  <div className="mt-4 text-gray-900 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                    <span>Read Story</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No stories yet. Be the first to share!</p>
              <Link
                href="/share-voice"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-gray-900/20"
              >
                <Mic className="w-4 h-4" />
                <span>Share Your Story</span>
              </Link>
            </div>
          )}

          <div className="text-center">
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-gray-200 hover:border-gray-900 text-gray-900 font-semibold rounded-full transition-all"
            >
              <span>View All Stories</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How to Share Your Voice */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Three Ways to Share Your Voice
            </h2>
            <p className="text-lg text-gray-600">
              Choose the way that works best for you
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
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <BookOpen className="w-16 h-16 mb-2" />
                    <p className="text-sm">Write story image</p>
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
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <Mic className="w-16 h-16 mb-2" />
                    <p className="text-sm">Record voice image</p>
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
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <Sparkles className="w-16 h-16 mb-2" />
                    <p className="text-sm">Upload video image</p>
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

          <div className="bg-white border border-gray-100 p-8 rounded-2xl max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Your Story, Your Choice
            </h3>
            <ul className="space-y-3 text-gray-600 mb-6">
              <li className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                <span>Share anonymously or with your name - it's up to you</span>
              </li>
              <li className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                <span>Your story will be reviewed before being published</span>
              </li>
              <li className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                <span>You keep control of your story and can request changes anytime</span>
              </li>
              <li className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                <span>All submissions follow cultural protocols and community guidelines</span>
              </li>
            </ul>
            <div className="text-center">
              <Link
                href="/share-voice"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white hover:bg-gray-800 font-semibold rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-gray-900/20"
              >
                <Mic className="w-5 h-5" />
                <span>Share Your Voice Now</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Storytellers */}
      <section className="py-20 bg-white border-t border-gray-100">
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
                <div className="text-6xl font-bold text-gray-900 mb-2">28+</div>
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
                      <div className="text-sm text-gray-600">23 anonymous stories</div>
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
