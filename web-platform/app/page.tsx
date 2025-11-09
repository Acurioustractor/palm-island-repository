import Link from 'next/link';
import { Users, Globe, Building2, ArrowRight, Heart, BookOpen, TrendingUp, Mic } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-teal-800 to-blue-900 text-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Palm Island Community Repository
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-blue-100">
            Manbarra & Bwgcolman Country
          </p>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-blue-50 mb-12">
            Community-controlled storytelling, impact measurement, and data sovereignty
          </p>

          {/* Three Audience Pathways */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16">
            {/* Community Members */}
            <Link
              href="/community"
              className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white/30 hover:border-white p-8 rounded-xl transition-all transform hover:scale-105"
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <Users className="w-8 h-8" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-3">Palm Island Community</h2>
              <p className="text-blue-50 mb-6 text-sm">
                Read stories, share your voice, and celebrate our community
              </p>
              <div className="flex items-center justify-center gap-2 text-white font-semibold">
                <span>Explore Stories</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* PICC Staff */}
            <Link
              href="/picc/dashboard"
              className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white/30 hover:border-white p-8 rounded-xl transition-all transform hover:scale-105"
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <Building2 className="w-8 h-8" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-3">PICC Staff & Supporters</h2>
              <p className="text-blue-50 mb-6 text-sm">
                Manage content, analytics, and community engagement
              </p>
              <div className="flex items-center justify-center gap-2 text-white font-semibold">
                <span>Access Dashboard</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Broader Community */}
            <Link
              href="/impact"
              className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white/30 hover:border-white p-8 rounded-xl transition-all transform hover:scale-105"
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <Globe className="w-8 h-8" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-3">Friends & Supporters</h2>
              <p className="text-blue-50 mb-6 text-sm">
                See our impact, stay connected, and support our work
              </p>
              <div className="flex items-center justify-center gap-2 text-white font-semibold">
                <span>See Our Impact</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Numbers */}
      <section className="py-12 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-900 mb-2">197</div>
              <div className="text-sm text-gray-600">Staff Members</div>
              <div className="text-xs text-green-600 mt-1">+30% from 2023</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-teal-900 mb-2">16+</div>
              <div className="text-sm text-gray-600">Integrated Services</div>
              <div className="text-xs text-gray-500 mt-1">Holistic support</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple-900 mb-2">100%</div>
              <div className="text-sm text-gray-600">Community Controlled</div>
              <div className="text-xs text-purple-600 mt-1">Since 2021</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-pink-900 mb-2">31+</div>
              <div className="text-sm text-gray-600">Stories Shared</div>
              <div className="text-xs text-gray-500 mt-1">And growing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Community Stories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Voices from Palm Island sharing experiences, wisdom, and vision for our future
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Story Card 1 */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-8 rounded-xl border border-pink-100 hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-pink-600" />
                <span className="text-sm font-semibold text-pink-900">Community Voice</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Stories of Resilience & Hope
              </h3>
              <p className="text-gray-700 mb-6">
                Read powerful stories from our community members about overcoming challenges,
                celebrating culture, and building a stronger future together.
              </p>
              <Link
                href="/stories"
                className="inline-flex items-center gap-2 text-pink-700 font-semibold hover:text-pink-900 transition-colors"
              >
                <span>Read Stories</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Share Your Voice CTA */}
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 p-8 rounded-xl border border-blue-100 hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 mb-4">
                <Mic className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">Your Voice Matters</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Share Your Story
              </h3>
              <p className="text-gray-700 mb-6">
                Every Palm Islander has a story. Share your experiences through text, voice
                recording, or video. Your story can inspire and strengthen our community.
              </p>
              <Link
                href="/share-voice"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <Mic className="w-4 h-4" />
                <span>Share Your Voice</span>
              </Link>
            </div>
          </div>

          {/* View All Stories Button */}
          <div className="text-center">
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold rounded-lg transition-all"
            >
              <span>View All Stories</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* About PICC */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                About Palm Island Community Company
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                PICC is a community-controlled organization providing essential services and
                support to the people of Palm Island (Manbarra & Bwgcolman Country).
              </p>
              <p className="text-gray-700 mb-8">
                From colonial control to community sovereignty, our journey represents
                Indigenous self-determination at scale. We prove that community-controlled
                services work, eliminating dependence on external consultants and keeping
                resources within our community.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
              >
                <span>Learn More About PICC</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-600">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="w-6 h-6 text-blue-600" />
                  <h3 className="font-bold text-gray-900">Community Controlled</h3>
                </div>
                <p className="text-sm text-gray-700">
                  100% Indigenous-led governance ensuring culturally appropriate services
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-teal-600">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-teal-600" />
                  <h3 className="font-bold text-gray-900">Growing Impact</h3>
                </div>
                <p className="text-sm text-gray-700">
                  197 staff members (+30% from 2023) providing 16+ integrated services
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-600">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="w-6 h-6 text-purple-600" />
                  <h3 className="font-bold text-gray-900">Data Sovereignty</h3>
                </div>
                <p className="text-sm text-gray-700">
                  Community-owned data and storytelling infrastructure proving innovation at scale
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stay Connected with Our Journey
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Subscribe to receive updates about community stories, PICC achievements, and our ongoing work
          </p>
          <Link
            href="/subscribe"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-900 hover:bg-blue-50 font-semibold rounded-lg shadow-lg transition-all"
          >
            <span>Subscribe to Updates</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
