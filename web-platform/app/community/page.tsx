import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase/client';
import { Mic, BookOpen, Users, Heart, ArrowRight, Sparkles } from 'lucide-react';

export default async function CommunityPage() {
  const supabase = createServerSupabase();

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-700 via-blue-700 to-blue-800 text-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            This Is YOUR Community
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-blue-100">
            YOUR Stories, YOUR Voice, YOUR Future
          </p>
          <p className="text-lg max-w-3xl mx-auto text-blue-50 mb-12">
            Every Palm Islander has a story worth sharing. Read stories from your neighbors,
            friends, and family. Add your own voice to strengthen our community.
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/share-voice"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Mic className="w-5 h-5" />
              <span>Share Your Voice</span>
            </Link>
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white text-white font-semibold rounded-lg transition-all"
            >
              <BookOpen className="w-5 h-5" />
              <span>Read Stories</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Our Community Voice
            </h2>
            <p className="text-gray-600">Together, we're building a powerful collection of stories</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
              <div className="text-5xl font-bold text-pink-900 mb-2">{storyCount || 31}+</div>
              <div className="text-sm text-gray-700">Stories Shared</div>
              <div className="text-xs text-pink-600 mt-1">And growing every day</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl">
              <div className="text-5xl font-bold text-blue-900 mb-2">28+</div>
              <div className="text-sm text-gray-700">Community Voices</div>
              <div className="text-xs text-blue-600 mt-1">Real stories, real people</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <div className="text-5xl font-bold text-green-900 mb-2">100%</div>
              <div className="text-sm text-gray-700">Community Owned</div>
              <div className="text-xs text-green-600 mt-1">Your data, your control</div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Stories */}
      <section className="py-16">
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
                  className="group bg-white p-6 rounded-xl shadow-md hover:shadow-xl border border-gray-100 hover:border-blue-300 transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      {story.category || 'Community Story'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {story.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{story.profiles?.preferred_name || story.profiles?.full_name || 'Community Voice'}</span>
                  </div>
                  <div className="mt-4 text-blue-600 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                    <span>Read Story</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No stories yet. Be the first to share!</p>
              <Link
                href="/share-voice"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
              >
                <Mic className="w-4 h-4" />
                <span>Share Your Story</span>
              </Link>
            </div>
          )}

          <div className="text-center">
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <span>View All Stories</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How to Share Your Voice */}
      <section className="py-16 bg-gradient-to-br from-pink-50 to-purple-50">
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
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Write Your Story</h3>
              <p className="text-gray-700 mb-6">
                Type out your story in your own words. Take your time, edit as you go.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mic className="w-8 h-8 text-pink-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Record Your Voice</h3>
              <p className="text-gray-700 mb-6">
                Speak your story into your phone or computer. Just like having a yarn.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-purple-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Upload a Video</h3>
              <p className="text-gray-700 mb-6">
                Record yourself telling your story on video. Show your face, share your emotion.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Your Story, Your Choice
            </h3>
            <ul className="space-y-3 text-gray-700 mb-6">
              <li className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                <span>Share anonymously or with your name - it's up to you</span>
              </li>
              <li className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                <span>Your story will be reviewed before being published</span>
              </li>
              <li className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                <span>You keep control of your story and can request changes anytime</span>
              </li>
              <li className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                <span>All submissions follow cultural protocols and community guidelines</span>
              </li>
            </ul>
            <div className="text-center">
              <Link
                href="/share-voice"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Mic className="w-5 h-5" />
                <span>Share Your Voice Now</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Storytellers */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Meet Our Storytellers
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Real people from Palm Island sharing their experiences, wisdom, and vision
                for our community's future.
              </p>
              <p className="text-gray-700 mb-8">
                From elders sharing cultural knowledge to young people speaking about their
                hopes and dreams, every voice matters. Every story strengthens our community.
              </p>
              <Link
                href="/storytellers"
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-all"
              >
                <Users className="w-5 h-5" />
                <span>View All Storytellers</span>
              </Link>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-8 rounded-xl border border-teal-100">
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-teal-900 mb-2">28+</div>
                <div className="text-gray-700">Community Members Sharing Their Stories</div>
              </div>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-teal-700" />
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
      </section>
    </div>
  );
}
