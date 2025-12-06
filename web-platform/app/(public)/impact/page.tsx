import Link from 'next/link';
import {
  TrendingUp, Users, Globe, Heart, Lightbulb, ArrowRight,
  BookOpen, Award, Target, Mic, Mail, Calendar, BarChart3, Image as ImageIcon
} from 'lucide-react';
import { getHeroImage, getPageMedia } from '@/lib/media/utils';

export default async function ImpactPage() {
  // Fetch media from Supabase
  const heroImage = await getHeroImage('impact');
  const innovationPhotos = await getPageMedia({
    pageContext: 'impact',
    pageSection: 'innovation',
    fileType: 'image',
    limit: 4
  });
  const communityStoryImage = await getPageMedia({
    pageContext: 'impact',
    pageSection: 'community-stories',
    fileType: 'image',
    limit: 1
  });
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
              Indigenous Self-Determination at Scale
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-gray-600">
              From Colonial Control to Community Sovereignty
            </p>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl leading-relaxed">
              Palm Island Community Company (PICC) proves that community-controlled services work.
              We're not just providing services—we're transforming what's possible for Indigenous
              communities across Australia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white hover:bg-gray-800 font-semibold rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-gray-900/20"
              >
                <span>Our Story</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/subscribe"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border border-gray-200 hover:border-gray-900 text-gray-900 font-semibold rounded-full transition-all"
              >
                <Mail className="w-5 h-5" />
                <span>Subscribe to Updates</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Numbers */}
      <section className="py-20 bg-white">
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
            <div className="bg-white border border-gray-100 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-8 h-8 text-gray-900" />
                <div className="text-5xl font-bold text-gray-900">197</div>
              </div>
              <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">Staff Members</div>
              <div className="text-xs text-gray-400 mb-3">+30% growth from 2023</div>
              <p className="text-sm text-gray-600">
                Creating employment and economic opportunity within the community
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-8 h-8 text-gray-900" />
                <div className="text-5xl font-bold text-gray-900">16+</div>
              </div>
              <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">Integrated Services</div>
              <div className="text-xs text-gray-400 mb-3">Holistic community support</div>
              <p className="text-sm text-gray-600">
                From child protection to aged care, addressing the whole community
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-8 h-8 text-gray-900" />
                <div className="text-5xl font-bold text-gray-900">100%</div>
              </div>
              <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">Community Controlled</div>
              <div className="text-xs text-gray-400 mb-3">Since 2021</div>
              <p className="text-sm text-gray-600">
                Indigenous-led governance ensuring culturally appropriate services
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8 text-gray-900" />
                <div className="text-5xl font-bold text-gray-900">$5.8M</div>
              </div>
              <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">Annual Wages Paid</div>
              <div className="text-xs text-gray-400 mb-3">Keeping money local</div>
              <p className="text-sm text-gray-600">
                Economic multiplier effect strengthening the entire community
              </p>
            </div>
          </div>

          <div className="mt-12 bg-white border border-gray-100 rounded-2xl p-8">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Cost Savings & Economic Impact</h3>
              <p className="text-lg text-gray-600 mb-6">
                Community-controlled impact measurement eliminates dependence on external consultants,
                saving <span className="font-bold text-gray-900">$40,000 - $115,000 annually</span> while
                building internal capacity and data sovereignty.
              </p>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold mb-2 text-gray-900">$40k-115k</div>
                  <div className="text-sm text-gray-500">Annual savings on consultants</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2 text-gray-900">100%</div>
                  <div className="text-sm text-gray-500">Data sovereignty achieved</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2 text-gray-900">197</div>
                  <div className="text-sm text-gray-500">Local jobs created & sustained</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Reporting Section (NEW) */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                15 Years of Transparent Reporting
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Every annual report from 2009 to 2024 is digitized, searchable, and accessible.
                We believe in full transparency about our work, our growth, and our challenges.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Our interactive timeline lets you explore our journey through 346 images, read
                full reports, and even ask our AI assistant questions about specific years or services.
              </p>
              <Link
                href="/annual-reports"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-gray-900/20"
              >
                <Calendar className="w-5 h-5" />
                <span>Explore Timeline</span>
              </Link>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-6 h-6 text-gray-900" />
                  <div className="text-4xl font-bold text-gray-900">15</div>
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">
                  Annual Reports Published
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Complete transparency from 2009 to 2024
                </p>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-6 h-6 text-gray-900" />
                  <div className="text-4xl font-bold text-gray-900">346</div>
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">
                  Images Digitized
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Visual documentation of our journey
                </p>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Lightbulb className="w-6 h-6 text-gray-900" />
                  <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">
                    AI-Powered Search
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Ask questions about any year, service, or achievement
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Innovation Showcase */}
      <section className="py-20 bg-white border-t border-gray-100">
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
            <div className="bg-white border border-gray-200 hover:border-gray-900 rounded-2xl transition-all overflow-hidden">
              {/* Image */}
              <div className="relative h-48 w-full bg-gray-50">
                {innovationPhotos[0] ? (
                  <img
                    src={innovationPhotos[0].public_url}
                    alt={innovationPhotos[0].alt_text || 'Story Server Project'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <BookOpen className="w-16 h-16 mb-2" />
                    <p className="text-sm">Story Server image</p>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <BookOpen className="w-6 h-6 text-gray-900" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Story Server Project</h3>
                </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Community-controlled storytelling platform enabling data sovereignty, impact measurement,
                and cultural preservation. Built by and for Palm Island.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mt-2 flex-shrink-0"></div>
                  <span>31+ community stories captured and preserved</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Full data sovereignty and community control</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Annual savings of $40k-115k on external consultants</span>
                </li>
              </ul>
                <Link
                  href="/wiki/innovation/local-server"
                  className="inline-flex items-center gap-2 text-gray-900 font-semibold hover:gap-3 transition-all"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Bwgcolman Way */}
            <div className="bg-white border border-gray-200 hover:border-gray-900 rounded-2xl transition-all overflow-hidden">
              {/* Image */}
              <div className="relative h-48 w-full bg-gray-50">
                {innovationPhotos[1] ? (
                  <img
                    src={innovationPhotos[1].public_url}
                    alt={innovationPhotos[1].alt_text || 'Bwgcolman Way'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <Heart className="w-16 h-16 mb-2" />
                    <p className="text-sm">Bwgcolman Way image</p>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <Heart className="w-6 h-6 text-gray-900" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Bwgcolman Way</h3>
                </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Culturally appropriate child protection model that keeps families together while ensuring
                children's safety. A national model for Indigenous child welfare.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Family preservation while ensuring safety</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Cultural protocols integrated into all practices</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Community-led decision making and governance</span>
                </li>
              </ul>
                <Link
                  href="/wiki/services"
                  className="inline-flex items-center gap-2 text-gray-900 font-semibold hover:gap-3 transition-all"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* On-Country Photo Studio */}
            <div className="bg-white border border-gray-200 hover:border-gray-900 rounded-2xl transition-all overflow-hidden">
              {/* Image */}
              <div className="relative h-48 w-full bg-gray-50">
                {innovationPhotos[2] ? (
                  <img
                    src={innovationPhotos[2].public_url}
                    alt={innovationPhotos[2].alt_text || 'On-Country Photo Studio'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <Lightbulb className="w-16 h-16 mb-2" />
                    <p className="text-sm">Photo Studio image</p>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <Lightbulb className="w-6 h-6 text-gray-900" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">On-Country Photo Studio</h3>
                </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Professional photography studio on Palm Island enabling community members to document
                their stories, culture, and achievements without leaving Country.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Professional documentation on Country</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Community-owned visual storytelling</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Cultural preservation through imagery</span>
                </li>
              </ul>
                <Link
                  href="/wiki/innovation/photo-studio"
                  className="inline-flex items-center gap-2 text-gray-900 font-semibold hover:gap-3 transition-all"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Elders Trip Innovation */}
            <div className="bg-white border border-gray-200 hover:border-gray-900 rounded-2xl transition-all overflow-hidden">
              {/* Image */}
              <div className="relative h-48 w-full bg-gray-50">
                {innovationPhotos[3] ? (
                  <img
                    src={innovationPhotos[3].public_url}
                    alt={innovationPhotos[3].alt_text || 'Elders Cultural Trips'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <Users className="w-16 h-16 mb-2" />
                    <p className="text-sm">Elders trips image</p>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <Users className="w-6 h-6 text-gray-900" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Elders Cultural Trips</h3>
                </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Connecting elders to Country while documenting traditional knowledge, strengthening
                cultural continuity, and supporting healthy aging.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Traditional knowledge preservation</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Intergenerational knowledge transfer</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Cultural healing and connection</span>
                </li>
              </ul>
                <Link
                  href="/wiki/innovation/elders-trip"
                  className="inline-flex items-center gap-2 text-gray-900 font-semibold hover:gap-3 transition-all"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/wiki/innovation"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-gray-900/20"
            >
              <span>Explore All Innovations</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Community Stories */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Hear Directly from Our Community
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                The real impact of PICC is best told through the voices of Palm Islanders themselves.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Read stories of resilience, hope, and transformation from community members. Stories
                about overcoming challenges, celebrating culture, and building a stronger future together.
              </p>
              <Link
                href="/stories"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-gray-900/20"
              >
                <BookOpen className="w-5 h-5" />
                <span>Read Community Stories</span>
              </Link>
            </div>

            {/* Community Stories Card with Optional Image */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              {/* Optional featured community story image */}
              {communityStoryImage && communityStoryImage.length > 0 && (
                <div className="relative h-64 w-full">
                  <img
                    src={communityStoryImage[0].public_url}
                    alt={communityStoryImage[0].alt_text || 'Community story'}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-8">
                <div className="mb-6">
                <div className="text-5xl font-bold text-gray-900 mb-2">31+</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Stories Shared</div>
                <div className="text-xs text-gray-400">Real voices, real experiences</div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Mic className="w-6 h-6 text-gray-900" />
                  <div>
                    <div className="font-semibold text-gray-900">Community Voice</div>
                    <div className="text-sm text-gray-600">Anonymous stories from the community</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Users className="w-6 h-6 text-gray-900" />
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
        </div>
      </section>

      {/* Stay Connected */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Stay Connected with Our Journey
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            Subscribe to receive updates about PICC's work, community stories, and our ongoing innovations
          </p>
          <p className="text-gray-500 mb-8">
            Join supporters from across Australia and around the world
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/subscribe"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white hover:bg-gray-800 font-semibold rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-gray-900/20"
            >
              <Mail className="w-5 h-5" />
              <span>Subscribe to Newsletter</span>
            </Link>
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-gray-200 hover:border-gray-900 text-gray-900 font-semibold rounded-full transition-all"
            >
              <BookOpen className="w-5 h-5" />
              <span>Read Stories</span>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <Award className="w-8 h-8 mx-auto mb-3 text-gray-900" />
              <div className="font-semibold mb-1 text-gray-900">Monthly Impact Updates</div>
              <div className="text-gray-500 text-sm">See the latest achievements and milestones</div>
            </div>
            <div>
              <BookOpen className="w-8 h-8 mx-auto mb-3 text-gray-900" />
              <div className="font-semibold mb-1 text-gray-900">Featured Stories</div>
              <div className="text-gray-500 text-sm">Powerful stories from the community</div>
            </div>
            <div>
              <Lightbulb className="w-8 h-8 mx-auto mb-3 text-gray-900" />
              <div className="font-semibold mb-1 text-gray-900">Innovation Highlights</div>
              <div className="text-gray-500 text-sm">Learn about new projects and approaches</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
