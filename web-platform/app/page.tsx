import Link from 'next/link';
import { Globe, Server, Heart, BookOpen, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      {/* Skip to Content Link - Accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-4xl">
          <main id="main-content">
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="font-bold text-blue-900 mb-4">
                Palm Island Community Repository
              </h1>
              <p className="text-2xl text-gray-700 mb-2">
                Manbarra & Bwgcolman Country
              </p>
              <p className="text-xl text-gray-600 italic">
                Community-controlled storytelling, impact measurement, and data sovereignty
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
              <Link
                href="/stories"
                prefetch={true}
                className="group bg-gradient-to-br from-palm-400 to-palm-600 hover:from-palm-500 hover:to-palm-700 p-8 rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-palm-200/50 text-white"
              >
                <div className="flex items-center mb-4">
                  <BookOpen className="w-10 h-10 mr-3 transition-transform group-hover:scale-110" />
                  <h2 className="text-2xl font-bold">Stories</h2>
                </div>
                <p className="mb-4 text-white/90">
                  Read powerful stories of resilience, hope, and transformation.
                </p>
                <div className="font-bold text-lg group-hover:translate-x-1 transition-transform inline-flex items-center">
                  View Stories →
                </div>
              </Link>

              <Link
                href="/storytellers"
                prefetch={true}
                className="group bg-gradient-to-br from-palm-500 to-palm-700 hover:from-palm-600 hover:to-palm-800 p-8 rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-palm-200/50 text-white"
              >
                <div className="flex items-center mb-4">
                  <Users className="w-10 h-10 mr-3 transition-transform group-hover:scale-110" />
                  <h2 className="text-2xl font-bold">Storytellers</h2>
                </div>
                <p className="mb-4 text-white/90">
                  Meet the voices of our community and their journeys.
                </p>
                <div className="font-bold text-lg group-hover:translate-x-1 transition-transform inline-flex items-center">
                  View Storytellers →
                </div>
              </Link>

              <Link
                href="/about"
                prefetch={true}
                className="group bg-white hover:bg-blue-50 p-8 rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-blue-500"
              >
                <div className="flex items-center mb-4">
                  <Globe className="w-8 h-8 text-blue-600 mr-3 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                  <h2 className="text-2xl font-bold text-blue-900">About PICC</h2>
                </div>
                <p className="text-gray-700 mb-4">
                  Learn about our journey from colonial control to community sovereignty.
                </p>
                <div className="text-blue-600 font-medium group-hover:text-blue-800 group-hover:translate-x-1 transition-all inline-flex items-center">
                  Learn More →
                </div>
              </Link>

              <Link
                href="/dashboard"
                prefetch={true}
                className="group bg-white hover:bg-green-50 p-8 rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-green-500"
              >
                <div className="flex items-center mb-4">
                  <Server className="w-8 h-8 text-green-600 mr-3 transition-transform group-hover:scale-110" />
                  <h2 className="text-2xl font-bold text-green-900">Dashboard</h2>
                </div>
                <p className="text-gray-700 mb-4">
                  Track impact metrics and community data insights.
                </p>
                <div className="text-green-600 font-medium group-hover:text-green-800 group-hover:translate-x-1 transition-all inline-flex items-center">
                  View Dashboard →
                </div>
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-xl mb-6 border-2 border-palm-100 hover:border-palm-300 transition-all duration-300 animate-fade-in">
              <div className="flex items-center mb-4">
                <Heart className="w-6 h-6 text-palm-600 mr-3 animate-pulse" />
                <h2 className="text-2xl font-bold text-gray-800">Share Your Story</h2>
              </div>
              <p className="text-gray-700 mb-4">
                Every Palm Islander has a story. Your voice matters. Share your experiences, wisdom, and vision
                for our community's future.
              </p>
              <Link
                href="/stories/submit"
                prefetch={true}
                className="inline-block bg-palm-600 hover:bg-palm-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                Submit Your Story
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6 animate-slide-up">
              <div className="bg-blue-900 text-white p-6 rounded-lg text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="text-4xl font-bold mb-2">197</div>
                <div className="text-sm">Staff Members</div>
                <div className="text-xs text-blue-200 mt-1">+30% from 2023</div>
              </div>
              <div className="bg-green-800 text-white p-6 rounded-lg text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="text-4xl font-bold mb-2">16+</div>
                <div className="text-sm">Integrated Services</div>
                <div className="text-xs text-green-200 mt-1">Holistic support</div>
              </div>
              <div className="bg-palm-800 text-white p-6 rounded-lg text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="text-4xl font-bold mb-2">100%</div>
                <div className="text-sm">Community Controlled</div>
                <div className="text-xs text-palm-200 mt-1">Since 2021</div>
              </div>
            </div>

            <div className="space-y-4 animate-fade-in">
              <Link
                href="/about#stories"
                prefetch={true}
                className="block bg-gradient-to-r from-palm-50 to-palm-100 p-6 rounded-lg hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-palm-200"
              >
                <div className="flex items-center">
                  <BookOpen className="w-6 h-6 text-palm-700 mr-3 transition-transform hover:scale-110" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-palm-900">Community Stories</h3>
                    <p className="text-sm text-gray-700">Read stories of hope, resilience, and transformation from Palm Islanders</p>
                  </div>
                  <span className="text-palm-700 font-medium">Read Stories →</span>
                </div>
              </Link>

              <div className="bg-white p-6 rounded-lg shadow-lg text-left border-2 border-gray-100 hover:border-palm-200 transition-all duration-300">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Platform Status</h2>
                <ul className="space-y-2 text-gray-700">
                  <li>✅ <strong>31 stories imported</strong> (26 storm stories + 6 PICC services)</li>
                  <li>✅ <strong>Database deployed</strong> with full schema</li>
                  <li>✅ <strong>Story Server dashboard</strong> built and ready</li>
                  <li>✅ <strong>Indigenous data sovereignty</strong> frameworks integrated</li>
                  <li>🚧 <strong>Coming soon:</strong> Story submission, photo upload, annual report generation</li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-palm-50 to-blue-50 p-6 rounded-lg text-left border-2 border-transparent hover:border-palm-200 transition-all duration-300">
                <h3 className="text-lg font-bold text-palm-800 mb-2">About This Platform</h3>
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
          </main>
        </div>
      </div>
    </>
  )
}
