import Link from 'next/link';
import {
  TrendingUp, Users, Globe, Heart, Lightbulb, ArrowRight,
  BookOpen, Award, Target, Mic, Mail
} from 'lucide-react';

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 text-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Indigenous Self-Determination at Scale
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-blue-100">
              From Colonial Control to Community Sovereignty
            </p>
            <p className="text-lg text-blue-50 mb-8 max-w-3xl">
              Palm Island Community Company (PICC) proves that community-controlled services work.
              We're not just providing services—we're transforming what's possible for Indigenous
              communities across Australia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-900 hover:bg-blue-50 font-bold rounded-lg shadow-lg transition-all"
              >
                <span>Our Story</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/subscribe"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white text-white font-semibold rounded-lg transition-all"
              >
                <Mail className="w-5 h-5" />
                <span>Subscribe to Updates</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Numbers */}
      <section className="py-16 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Impact by the Numbers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real outcomes for a real community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-blue-600">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="text-5xl font-bold text-gray-900">197</div>
              </div>
              <div className="text-gray-700 font-semibold mb-1">Staff Members</div>
              <div className="text-sm text-green-600">+30% growth from 2023</div>
              <p className="text-sm text-gray-600 mt-3">
                Creating employment and economic opportunity within the community
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-teal-600">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-8 h-8 text-teal-600" />
                <div className="text-5xl font-bold text-gray-900">16+</div>
              </div>
              <div className="text-gray-700 font-semibold mb-1">Integrated Services</div>
              <div className="text-sm text-gray-500">Holistic community support</div>
              <p className="text-sm text-gray-600 mt-3">
                From child protection to aged care, addressing the whole community
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-purple-600">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-8 h-8 text-purple-600" />
                <div className="text-5xl font-bold text-gray-900">100%</div>
              </div>
              <div className="text-gray-700 font-semibold mb-1">Community Controlled</div>
              <div className="text-sm text-purple-600">Since 2021</div>
              <p className="text-sm text-gray-600 mt-3">
                Indigenous-led governance ensuring culturally appropriate services
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-pink-600">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8 text-pink-600" />
                <div className="text-5xl font-bold text-gray-900">$5.8M</div>
              </div>
              <div className="text-gray-700 font-semibold mb-1">Annual Wages Paid</div>
              <div className="text-sm text-gray-500">Keeping money local</div>
              <p className="text-sm text-gray-600 mt-3">
                Economic multiplier effect strengthening the entire community
              </p>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-blue-900 to-purple-900 text-white p-8 rounded-xl">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-4">Cost Savings & Economic Impact</h3>
              <p className="text-lg text-blue-100 mb-6">
                Community-controlled impact measurement eliminates dependence on external consultants,
                saving <span className="font-bold text-white">$40,000 - $115,000 annually</span> while
                building internal capacity and data sovereignty.
              </p>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold mb-2">$40k-115k</div>
                  <div className="text-sm text-blue-200">Annual savings on consultants</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">100%</div>
                  <div className="text-sm text-blue-200">Data sovereignty achieved</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">197</div>
                  <div className="text-sm text-blue-200">Local jobs created & sustained</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Innovation Showcase */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Leading Innovation
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              PICC is pioneering approaches that are changing what's possible for Indigenous communities
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Story Server Project */}
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 p-8 rounded-xl border border-blue-100 hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Story Server Project</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Community-controlled storytelling platform enabling data sovereignty, impact measurement,
                and cultural preservation. Built by and for Palm Island.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 mb-6">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>31+ community stories captured and preserved</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Full data sovereignty and community control</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Annual savings of $40k-115k on external consultants</span>
                </li>
              </ul>
              <Link
                href="/wiki/innovation/local-server"
                className="inline-flex items-center gap-2 text-blue-700 font-semibold hover:text-blue-900 transition-colors"
              >
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Bwgcolman Way */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-xl border border-purple-100 hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Heart className="w-6 h-6 text-purple-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Bwgcolman Way</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Culturally appropriate child protection model that keeps families together while ensuring
                children's safety. A national model for Indigenous child welfare.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 mb-6">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Family preservation while ensuring safety</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Cultural protocols integrated into all practices</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Community-led decision making and governance</span>
                </li>
              </ul>
              <Link
                href="/wiki/services"
                className="inline-flex items-center gap-2 text-purple-700 font-semibold hover:text-purple-900 transition-colors"
              >
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* On-Country Photo Studio */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-xl border border-green-100 hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-green-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">On-Country Photo Studio</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Professional photography studio on Palm Island enabling community members to document
                their stories, culture, and achievements without leaving Country.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 mb-6">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Professional documentation on Country</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Community-owned visual storytelling</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Cultural preservation through imagery</span>
                </li>
              </ul>
              <Link
                href="/wiki/innovation/photo-studio"
                className="inline-flex items-center gap-2 text-green-700 font-semibold hover:text-green-900 transition-colors"
              >
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Elders Trip Innovation */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-xl border border-orange-100 hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Users className="w-6 h-6 text-orange-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Elders Cultural Trips</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Connecting elders to Country while documenting traditional knowledge, strengthening
                cultural continuity, and supporting healthy aging.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 mb-6">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Traditional knowledge preservation</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Intergenerational knowledge transfer</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Cultural healing and connection</span>
                </li>
              </ul>
              <Link
                href="/wiki/innovation/elders-trip"
                className="inline-flex items-center gap-2 text-orange-700 font-semibold hover:text-orange-900 transition-colors"
              >
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/wiki/innovation"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <span>Explore All Innovations</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Community Stories */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Hear Directly from Our Community
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                The real impact of PICC is best told through the voices of Palm Islanders themselves.
              </p>
              <p className="text-gray-700 mb-8">
                Read stories of resilience, hope, and transformation from community members. Stories
                about overcoming challenges, celebrating culture, and building a stronger future together.
              </p>
              <Link
                href="/stories"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
              >
                <BookOpen className="w-5 h-5" />
                <span>Read Community Stories</span>
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
              <div className="mb-6">
                <div className="text-5xl font-bold text-blue-900 mb-2">31+</div>
                <div className="text-gray-700 font-semibold">Stories Shared</div>
                <div className="text-sm text-gray-600">Real voices, real experiences</div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <Mic className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-semibold text-gray-900">Community Voice</div>
                    <div className="text-sm text-gray-600">Anonymous stories from the community</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                  <div>
                    <div className="font-semibold text-gray-900">Named Storytellers</div>
                    <div className="text-sm text-gray-600">Personal journeys and wisdom</div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 italic text-center">
                "Every story strengthens our community and shows the world what's possible when
                Indigenous people lead."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stay Connected */}
      <section className="py-16 bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stay Connected with Our Journey
          </h2>
          <p className="text-lg text-blue-100 mb-4">
            Subscribe to receive updates about PICC's work, community stories, and our ongoing innovations
          </p>
          <p className="text-blue-200 mb-8">
            Join supporters from across Australia and around the world
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              href="/subscribe"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-900 hover:bg-blue-50 font-bold rounded-lg shadow-lg transition-all"
            >
              <Mail className="w-5 h-5" />
              <span>Subscribe to Newsletter</span>
            </Link>
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white text-white font-semibold rounded-lg transition-all"
            >
              <BookOpen className="w-5 h-5" />
              <span>Read Stories</span>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <Award className="w-8 h-8 mx-auto mb-3" />
              <div className="font-semibold mb-1">Monthly Impact Updates</div>
              <div className="text-blue-200">See the latest achievements and milestones</div>
            </div>
            <div>
              <BookOpen className="w-8 h-8 mx-auto mb-3" />
              <div className="font-semibold mb-1">Featured Stories</div>
              <div className="text-blue-200">Powerful stories from the community</div>
            </div>
            <div>
              <Lightbulb className="w-8 h-8 mx-auto mb-3" />
              <div className="font-semibold mb-1">Innovation Highlights</div>
              <div className="text-blue-200">Learn about new projects and approaches</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
