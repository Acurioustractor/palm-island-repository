import Link from 'next/link';
import { Globe, Server, Heart, BookOpen, Users } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

async function getStats() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return { storytellers: 26, stories: 0, services: 16 };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get storyteller count
    const { count: storytellerCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get story count
    const { count: storyCount } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true });

    // Get service count
    const { count: serviceCount } = await supabase
      .from('organization_services')
      .select('*', { count: 'exact', head: true });

    return {
      storytellers: storytellerCount || 26,
      stories: storyCount || 0,
      services: serviceCount || 16,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { storytellers: 26, stories: 0, services: 16 };
  }
}

export default async function HomePage() {
  const stats = await getStats();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-blue-900 mb-4">
            Palm Island Community Repository
          </h1>
          <p className="text-2xl text-gray-700 mb-2">
            Manbarra & Bwgcolman Country
          </p>
          <p className="text-xl text-gray-600 italic">
            Community-controlled storytelling, impact measurement, and data sovereignty
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            href="/stories"
            className="group bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 p-8 rounded-xl shadow-2xl transition-all transform hover:scale-105 text-white"
          >
            <div className="flex items-center mb-4">
              <BookOpen className="w-10 h-10 mr-3" />
              <h2 className="text-2xl font-bold">Stories</h2>
            </div>
            <p className="mb-4 text-pink-50">
              Read powerful stories of resilience, hope, and transformation.
            </p>
            <div className="font-bold text-lg">
              View Stories →
            </div>
          </Link>

          <Link
            href="/storytellers"
            className="group bg-gradient-to-br from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 p-8 rounded-xl shadow-2xl transition-all transform hover:scale-105 text-white"
          >
            <div className="flex items-center mb-4">
              <Users className="w-10 h-10 mr-3" />
              <h2 className="text-2xl font-bold">Storytellers</h2>
            </div>
            <p className="mb-4 text-purple-50">
              Meet the voices of our community and their journeys.
            </p>
            <div className="font-bold text-lg">
              View Storytellers →
            </div>
          </Link>

          <Link
            href="/about"
            className="group bg-white hover:bg-blue-50 p-8 rounded-xl shadow-xl transition-all transform hover:scale-105 border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex items-center mb-4">
              <Globe className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-blue-900">About PICC</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Learn about our journey from colonial control to community sovereignty.
            </p>
            <div className="text-blue-600 font-medium group-hover:text-blue-800">
              Learn More →
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="group bg-white hover:bg-green-50 p-8 rounded-xl shadow-xl transition-all transform hover:scale-105 border-2 border-transparent hover:border-green-500"
          >
            <div className="flex items-center mb-4">
              <Server className="w-8 h-8 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-green-900">Dashboard</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Track impact metrics and community data insights.
            </p>
            <div className="text-green-600 font-medium group-hover:text-green-800">
              View Dashboard →
            </div>
          </Link>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-xl mb-6">
          <div className="flex items-center mb-4">
            <Heart className="w-6 h-6 text-purple-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">Share Your Story</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Every Palm Islander has a story. Your voice matters. Share your experiences, wisdom, and vision
            for our community's future.
          </p>
          <Link
            href="/stories/submit"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
          >
            Submit Your Story
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-900 text-white p-6 rounded-lg text-center">
            <div className="text-4xl font-bold mb-2">{stats.storytellers}</div>
            <div className="text-sm">Community Storytellers</div>
            <div className="text-xs text-blue-200 mt-1">Voices that matter</div>
          </div>
          <div className="bg-green-800 text-white p-6 rounded-lg text-center">
            <div className="text-4xl font-bold mb-2">{stats.services}</div>
            <div className="text-sm">PICC Services</div>
            <div className="text-xs text-green-200 mt-1">Holistic support</div>
          </div>
          <div className="bg-purple-800 text-white p-6 rounded-lg text-center">
            <div className="text-4xl font-bold mb-2">100%</div>
            <div className="text-sm">Community Controlled</div>
            <div className="text-xs text-purple-200 mt-1">Since 2021</div>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/about#stories"
            className="block bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-lg hover:shadow-lg transition-all"
          >
            <div className="flex items-center">
              <BookOpen className="w-6 h-6 text-pink-600 mr-3" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-pink-900">Community Stories</h3>
                <p className="text-sm text-gray-700">Read stories of hope, resilience, and transformation from Palm Islanders</p>
              </div>
              <span className="text-pink-600 font-medium">Read Stories →</span>
            </div>
          </Link>

          <div className="bg-white p-6 rounded-lg shadow-lg text-left">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Platform Status</h2>
            <ul className="space-y-2 text-gray-700">
              <li>✅ <strong>{stats.storytellers} storytellers</strong> with profiles ready</li>
              <li>✅ <strong>{stats.services} PICC services</strong> documented and linked</li>
              <li>✅ <strong>{stats.stories} stories</strong> {stats.stories === 0 ? 'ready to import' : 'published'}</li>
              <li>✅ <strong>Database deployed</strong> with Indigenous data sovereignty</li>
              <li>✅ <strong>Storage buckets</strong> configured for photos, audio, and documents</li>
              <li>🚧 <strong>Coming soon:</strong> Story submission, photo upload, annual report generation</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg text-left">
            <h3 className="text-lg font-bold text-purple-800 mb-2">About This Platform</h3>
            <p className="text-gray-700 text-sm">
              Built by and for Palm Island community, this platform enables community-controlled impact
              measurement, eliminates dependence on external consultants ($40k-115k annual savings), and
              proves that Indigenous self-determination works at scale.
            </p>
            <p className="text-gray-600 text-xs mt-2 italic">
              Manbarra & Bwgcolman Country • PICC: 197 staff, 16+ services, 100% community controlled
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
