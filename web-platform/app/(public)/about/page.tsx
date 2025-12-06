import React from "react";
import { ChevronRight, Users, Heart, TrendingUp, Globe, BookOpen, Target, Star, Building, Phone, Mail, MapPin, Play, Quote, Video } from "lucide-react";
import Link from "next/link";
import { getHeroImage, getPageMedia, getFeaturedPageMedia, getLeadershipPhotos, getServicePhotos, getTestimonialPhotos, getTimelinePhotos } from "@/lib/media/utils";
import { getPageStories } from "@/lib/stories/utils";

export default async function AboutPage() {
  const heroImage = await getHeroImage("about");
  const visionImage = await getPageMedia({ pageContext: "about", pageSection: "vision", limit: 1 });
  const timelinePhotos = await getTimelinePhotos();
  const ceoVideo = await getFeaturedPageMedia("about", "ceo-video", "video");
  const leadershipPhotos = await getLeadershipPhotos();
  const servicePhotos = await getServicePhotos();
  const servicesVideo = await getFeaturedPageMedia("about", "services-video", "video");
  const testimonialPhotos = await getTestimonialPhotos();
  const elderStories = await getPageStories({
    pageContext: 'about',
    pageSection: 'elder-stories',
    limit: 4
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Background Image */}
      <section
        className="relative h-[600px] flex items-center justify-center overflow-hidden"
        style={heroImage ? {
          backgroundImage: `linear-gradient(rgba(31, 41, 55, 0.7), rgba(31, 41, 55, 0.8)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      >
        {!heroImage && (
          <div className="absolute inset-0 bg-gray-900">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-90"></div>
          </div>
        )}

        <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Palm Island Community Company
          </h1>
          <p className="text-2xl md:text-3xl mb-4 italic">
            From Colonial Control to Community Sovereignty
          </p>
          <p className="text-xl md:text-2xl mb-8 font-light">
            Where ancient wisdom meets contemporary innovation
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/annual-reports" className="px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all">
              Our Journey
            </Link>
            <Link href="/share-voice" className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all">
              Share Your Story
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronRight className="w-8 h-8 text-white rotate-90" />
        </div>
      </section>

      {/* Vision Statement - Full width with image */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                A Living Testament to Transformation
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                "In the heart of the Coral Sea lies an island that refuses to be defined by its colonial past. Palm Island Community Company stands as proof that when a community takes control of its own destiny, transformation isn't just possible—it's inevitable."
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We see each challenge not as a barrier but as an invitation to innovate, each service not as charity but as sovereignty in action. This is PICC: Community control as revolutionary act.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden h-96">
              {visionImage[0] ? (
                <img
                  src={visionImage[0].public_url}
                  alt={visionImage[0].alt_text || 'PICC Building'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Building className="w-24 h-24 mx-auto mb-4" />
                    <p className="text-sm">PICC Building / Community Photo</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Impact Numbers - Visual cards */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">The Numbers Tell Our Story</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Each number represents a life touched, a family strengthened, a future secured
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
              <div className="text-6xl font-bold text-gray-900 mb-2">197</div>
              <div className="text-lg font-semibold text-gray-800 mb-2">Community Members Employed</div>
              <div className="text-sm text-gray-600 mb-4">+30% from 2023</div>
              <p className="text-sm text-gray-700 italic">Each job represents a family lifted, a young person seeing possibility</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
              <div className="text-6xl font-bold text-gray-900 mb-2">80%+</div>
              <div className="text-lg font-semibold text-gray-800 mb-2">Indigenous Workforce</div>
              <div className="text-sm text-gray-600 mb-4">Maintained since establishment</div>
              <p className="text-sm text-gray-700 italic">True self-determination means our people serving our people</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
              <div className="text-6xl font-bold text-gray-900 mb-2">$5.8M</div>
              <div className="text-lg font-semibold text-gray-800 mb-2">Annual Local Wages</div>
              <div className="text-sm text-gray-600 mb-4">$9.75M total economic output</div>
              <p className="text-sm text-gray-700 italic">Money that stays on Palm Island, building generational wealth</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
              <div className="text-6xl font-bold text-gray-900 mb-2">2,283</div>
              <div className="text-lg font-semibold text-gray-800 mb-2">Health Clients Served</div>
              <div className="text-sm text-gray-600 mb-4">17,488 episodes of care</div>
              <p className="text-sm text-gray-700 italic">Every number is a life touched, a family strengthened</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
              <div className="text-6xl font-bold text-gray-900 mb-2">16+</div>
              <div className="text-lg font-semibold text-gray-800 mb-2">Integrated Services</div>
              <div className="text-sm text-gray-600 mb-4">Holistic support ecosystem</div>
              <p className="text-sm text-gray-700 italic">Because human needs don't fit in bureaucratic boxes</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
              <div className="text-6xl font-bold text-gray-900 mb-2">2021</div>
              <div className="text-lg font-semibold text-gray-800 mb-2">Community Control Achieved</div>
              <div className="text-sm text-gray-600 mb-4">Historic self-determination milestone</div>
              <p className="text-sm text-gray-700 italic">The year we took our destiny into our own hands</p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Quote Callout 1 */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Quote className="w-16 h-16 mx-auto mb-6 opacity-50" />
          <blockquote className="text-3xl md:text-4xl font-bold mb-6 italic">
            "Everything we do is for, with, and because of the people of this beautiful community"
          </blockquote>
          <p className="text-xl text-gray-300">— Rachel Atkinson, CEO</p>
        </div>
      </section>

      {/* Our Philosophy - Three pillars */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Our Guiding Principles</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gray-50 w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Star className="w-12 h-12 text-gray-900" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Philosophy</h3>
              <p className="text-gray-700 leading-relaxed">
                We operate from abundance, not deficit. Every Palm Islander carries strengths, knowledge, and potential. Our role is to create conditions where these gifts flourish.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gray-50 w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Heart className="w-12 h-12 text-gray-900" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Method</h3>
              <p className="text-gray-700 leading-relaxed">
                Integrated services that wrap around families like a warm embrace. No wrong door, no gaps to fall through—just seamless support that honors the complexity of human need.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gray-50 w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Target className="w-12 h-12 text-gray-900" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Promise</h3>
              <p className="text-gray-700 leading-relaxed">
                Every decision, every service, every innovation emerges from and returns to community. This is sovereignty in practice—Palm Islanders determining Palm Island futures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Historical Journey Timeline with Images */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">From Colonial Control to Community Sovereignty</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            The journey of Palm Island Community Company cannot be separated from the journey of Palm Island itself—a story of resilience that transforms historical trauma into contemporary triumph.
          </p>

          <div className="space-y-12">
            {/* Timeline items with photos */}
            {[
              {
                era: 'Ancient Foundations',
                period: 'Time Immemorial',
                description: 'The Manbarra people live in harmony with the Palm Islands, their Dreamtime stories telling of Rainbow Serpent fragments forming the archipelago.',
                significance: 'Cultural bedrock that sustains us still',
                icon: Globe,
                index: 0
              },
              {
                era: 'Colonial Disruption',
                period: '1914-1918',
                description: "Palm Island designated as Aboriginal reserve, then transformed into a place of forced relocation for 'troublesome' Aboriginal people from across Queensland.",
                significance: 'From 57 language groups, the Bwgcolman identity emerges: "Many tribes, one people"',
                icon: BookOpen,
                index: 1
              },
              {
                era: 'Resistance & Resilience',
                period: '1957',
                description: 'The Magnificent Seven lead a five-day strike against oppressive conditions, facing exile but igniting a movement for dignity and rights.',
                significance: 'Courage that echoes through generations',
                icon: Users,
                index: 2
              },
              {
                era: 'Transition Period',
                period: '1975-2005',
                description: 'Dormitories close, Protection Act ends, community gains local government status. Slow dismantling of colonial control structures.',
                significance: 'Each victory building toward self-governance',
                icon: TrendingUp,
                index: 3
              },
              {
                era: 'PICC Genesis',
                period: '2007',
                description: 'Palm Island Community Company established with dual government-community ownership. Rachel Atkinson appointed as sole employee.',
                significance: 'Planting seeds of transformation',
                icon: Building,
                index: 4
              },
              {
                era: 'Community Sovereignty',
                period: '2021-Present',
                description: "Full community control achieved. PICC now wholly owned by Palm Islanders, becoming the island's second-largest employer.",
                significance: 'Self-determination realized, but the journey continues',
                icon: Star,
                index: 5
              }
            ].map((item, idx) => {
              const photo = timelinePhotos[idx];
              const Icon = item.icon;
              const isEven = idx % 2 === 0;

              return (
                <div key={idx} className="grid md:grid-cols-2 gap-8 items-center">
                  <div className={isEven ? 'order-2 md:order-1' : ''}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900">{item.era}</h3>
                          <span className="text-sm font-medium bg-gray-200 text-gray-700 px-3 py-1 rounded-full">
                            {item.period}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{item.description}</p>
                        <p className="text-sm italic text-gray-600">
                          <strong>Significance:</strong> {item.significance}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={isEven ? 'order-1 md:order-2' : ''}>
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden h-64">
                      {photo ? (
                        <img
                          src={photo.public_url}
                          alt={photo.alt_text || item.era}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center text-gray-400">
                            <Icon className="w-16 h-16 mx-auto mb-2" />
                            <p className="text-sm">{item.era} image</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Link to Annual Reports */}
          <div className="mt-12 text-center">
            <Link href="/annual-reports" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full font-semibold text-lg hover:bg-gray-800 transition-all">
              <BookOpen className="w-5 h-5" />
              Explore 15 Years of Annual Reports
            </Link>
          </div>
        </div>
      </section>

      {/* Video Section - CEO Story */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Hear From Our CEO</h2>
            <p className="text-xl text-gray-600">
              Rachel Atkinson shares the story of PICC's transformation
            </p>
          </div>

          <div className="aspect-video bg-gray-900 rounded-2xl flex items-center justify-center">
            {ceoVideo ? (
              <video
                controls
                className="w-full h-full rounded-2xl"
                poster={ceoVideo.public_url}
              >
                <source src={ceoVideo.public_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="text-center text-white">
                <Play className="w-24 h-24 mx-auto mb-4" />
                <p className="text-lg">Video: Rachel Atkinson - The PICC Story</p>
                <p className="text-sm text-gray-400 mt-2">(Video to be embedded here)</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Leadership - Rachel Atkinson + Board */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">The Architects of Transformation</h2>

          {/* CEO Spotlight */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 aspect-square overflow-hidden">
                {leadershipPhotos[0] ? (
                  <img
                    src={leadershipPhotos[0].public_url}
                    alt={leadershipPhotos[0].alt_text || 'Rachel Atkinson'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <Users className="w-24 h-24 mx-auto mb-2" />
                      <p className="text-sm">Rachel Atkinson headshot</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Rachel Atkinson</h3>
              <p className="text-xl font-medium text-gray-700 mb-4">Chief Executive Officer</p>
              <p className="text-lg text-gray-700 mb-6">
                A proud Yorta Yorta woman carrying the legacy of activists William Cooper and Sir Douglas Nicholls, Rachel has transformed PICC from a single-employee operation to Palm Island's largest non-government employer. Her greatest triumph: achieving full community control in 2021.
              </p>

              <div className="bg-white rounded-2xl border-l-4 border-gray-900 p-6 mb-6">
                <Quote className="w-8 h-8 text-gray-400 mb-3" />
                <p className="text-lg italic text-gray-800">
                  "Everything we do is for, with, and because of the people of this beautiful community"
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3 text-lg">Transformational Achievements:</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-gray-900 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">Grew organization from 1 to 197 employees</span>
                  </div>
                  <div className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-gray-900 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">80%+ Aboriginal and Torres Strait Islander workforce</span>
                  </div>
                  <div className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-gray-900 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">Secured full community control</span>
                  </div>
                  <div className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-gray-900 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">$5.8 million in local wages annually</span>
                  </div>
                  <div className="flex items-start md:col-span-2">
                    <ChevronRight className="h-5 w-5 text-gray-900 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">Reduced Aboriginal child removals through integrated services</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Board Members Grid */}
          <h3 className="text-3xl font-bold text-gray-900 mb-8">Board of Directors: Guardians of Community Vision</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Luella Bligh',
                position: 'Chair',
                description: 'Leading PICC through its historic transition to full community control, Luella embodies the spirit of self-determination.',
                quote: "A future where Palm Island's governance reflects the wisdom of its people",
                index: 1
              },
              {
                name: 'Allan Palm Island',
                position: 'Traditional Owner Director',
                description: 'Holding the inaugural position for the Manbarra people, Allan bridges ancient wisdom with contemporary innovation.',
                quote: 'Creating spaces where young people reconnect with their cultural strength',
                index: 2
              },
              {
                name: 'Rhonda Phillips',
                position: 'Director',
                description: 'With PICC since its 2007 inception, Rhonda brings four decades of transformative experience in Indigenous governance.',
                quote: 'Systems that serve people, not the other way around',
                index: 3
              },
              {
                name: 'Harriet Hulthen',
                position: 'Director',
                description: "Born and raised on Palm Island, Harriet's journey exemplifies homegrown leadership and commitment to justice.",
                quote: 'Every Palm Islander having pathways to justice and opportunity',
                index: 4
              },
              {
                name: 'Raymond W. Palmer Snr',
                position: 'Director',
                description: 'A proud Bwgcolman man who has never left his island home, bringing the perspective of deep roots and community heartbeat.',
                quote: 'Our children learning on Country, from Country',
                index: 5
              },
              {
                name: 'Matthew Lindsay',
                position: 'Company Secretary',
                description: "As a Fellow CPA and AICD Graduate, Matthew ensures PICC's vision is supported by robust financial governance.",
                quote: 'Financial systems that enable community dreams',
                index: 6
              }
            ].map((member, idx) => {
              const photo = leadershipPhotos[member.index];

              return (
                <div key={idx} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="aspect-square bg-gray-100">
                    {photo ? (
                      <img
                        src={photo.public_url}
                        alt={photo.alt_text || member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h4>
                    <p className="text-sm font-medium text-gray-600 mb-3">{member.position}</p>
                    <p className="text-sm text-gray-700 mb-3">{member.description}</p>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <Quote className="w-4 h-4 text-gray-400 mb-1" />
                      <p className="text-xs italic text-gray-600">"{member.quote}"</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================
          ELDER STORIES: Voices of Wisdom and Heritage
          PURPOSE: Showcase elder stories using intelligent placement
          CONTEXT: About page - cultural emphasis with elder wisdom
          DATABASE: page_context='about', page_section='elder-stories'
          ALGORITHM: Cultural (45%) + Quality (25%) + Engagement (15%) + Recency (10%) + Diversity (5%)
          FILTERS: Elder storytellers only, min quality 70%, unique storytellers
          ================================================================ */}
      {elderStories && elderStories.length > 0 && (
        <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Voices of Our Elders
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Wisdom, heritage, and lived experience from the knowledge keepers of our community
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {elderStories.map((story) => {
                const featuredImage = story.story_media?.[0]?.url || story.featured_image_url;
                const keyQuote = story.metadata?.key_quotes?.[0] || story.excerpt;

                return (
                  <Link
                    key={story.id}
                    href={`/stories/${story.id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100"
                  >
                    {featuredImage && (
                      <div className="aspect-video bg-gray-100 overflow-hidden">
                        <img
                          src={featuredImage}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      {story.story_type && (
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full mb-3">
                          {story.story_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      )}

                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-picc-teal transition-colors">
                        {story.title}
                      </h3>

                      {keyQuote && (
                        <blockquote className="text-gray-600 italic mb-4 line-clamp-3 border-l-4 border-picc-teal pl-4">
                          "{keyQuote.replace(/^["']|["']$/g, '')}"
                        </blockquote>
                      )}

                      <div className="flex items-center gap-3 mt-4">
                        {story.storyteller?.profile_image_url && (
                          <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-purple-200">
                            <img
                              src={story.storyteller.profile_image_url}
                              alt={story.storyteller.preferred_name || story.storyteller.full_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">
                            {story.storyteller?.preferred_name || story.storyteller?.full_name || 'Elder'}
                          </p>
                          {story.storyteller?.is_elder && (
                            <p className="text-sm text-purple-600 font-medium">Elder & Knowledge Keeper</p>
                          )}
                        </div>

                        {story.contains_traditional_knowledge && (
                          <div className="ml-auto">
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                              🛡️ Cultural Knowledge
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/stories?filter=elders"
                className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
              >
                <BookOpen className="w-5 h-5" />
                Explore All Elder Stories
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Community Quote Callout 2 */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Quote className="w-16 h-16 mx-auto mb-6 opacity-50" />
          <blockquote className="text-3xl md:text-4xl font-bold mb-6 italic">
            "We operate from abundance, not deficit. Every Palm Islander carries strengths, knowledge, and potential."
          </blockquote>
          <p className="text-xl text-gray-300">— PICC Philosophy</p>
        </div>
      </section>

      {/* Services & Programs with Images */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">An Ecosystem of Care & Capability</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            From birth to elder years, from crisis to celebration, from healing to economic empowerment—we meet our community wherever they are on their journey
          </p>

          {/* Service Category 1 - Healing & Wellbeing */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 pb-3 border-b-2 border-gray-100">Healing & Wellbeing</h3>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Service 1 */}
              <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                <div className="aspect-video bg-white">
                  {servicePhotos[0] ? (
                    <img
                      src={servicePhotos[0].public_url}
                      alt={servicePhotos[0].alt_text || 'Bwgcolman Healing Service'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Heart className="w-16 h-16 mx-auto mb-2" />
                        <p className="text-sm">Bwgcolman Healing Service photo</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Bwgcolman Healing Service</h4>
                  <p className="text-sm font-medium text-gray-600 italic mb-4">Where Western Medicine Meets Ancient Wisdom</p>
                  <p className="text-gray-700 mb-4">
                    Our renamed Primary Health Centre embodies the fusion of clinical excellence with cultural healing. Serving 2,283 clients with 17,488 episodes of care, we don't just treat illness—we nurture wholeness.
                  </p>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">2,283</div>
                      <div className="text-xs text-gray-600">Clients</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">17,488</div>
                      <div className="text-xs text-gray-600">Episodes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">779</div>
                      <div className="text-xs text-gray-600">Health Checks</div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    07 4445 4401 | medicaladmin@picc.com.au
                  </div>
                </div>
              </div>

              {/* Service 2 */}
              <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                <div className="aspect-video bg-white">
                  {servicePhotos[1] ? (
                    <img
                      src={servicePhotos[1].public_url}
                      alt={servicePhotos[1].alt_text || 'SEWB program'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Heart className="w-16 h-16 mx-auto mb-2" />
                        <p className="text-sm">SEWB program photo</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Social & Emotional Wellbeing</h4>
                  <p className="text-sm font-medium text-gray-600 italic mb-4">Healing the Spirit, Strengthening the Mind</p>
                  <p className="text-gray-700">
                    Mental health support grounded in cultural understanding, recognizing that true wellbeing flows from connection to Country, culture, and community.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Service Category 2 - Family Constellation */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 pb-3 border-b-2 border-gray-100">Family Constellation</h3>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Services 3-5 */}
              {[
                {
                  title: 'Children & Family Centre',
                  subtitle: "Nurturing Tomorrow's Leaders",
                  description: 'More than childcare—a sacred space where culture is transmitted through play.',
                  phone: '07 4791 4018',
                  index: 2
                },
                {
                  title: 'Family Wellbeing Centre',
                  subtitle: 'Strengthening Community Fabric',
                  description: "Supporting families through life's challenges with practical skills and kinship connections.",
                  phone: '07 4791 4050',
                  index: 3
                },
                {
                  title: 'Bwgcolman Way',
                  subtitle: 'Revolutionary Self-Determination',
                  description: 'Groundbreaking delegated authority model where Palm Islanders make decisions about their own children.',
                  note: 'Launching 2024',
                  index: 4
                }
              ].map((service, idx) => {
                const photo = servicePhotos[service.index];
                const Icon = idx === 0 ? Users : idx === 1 ? Heart : Target;

                return (
                  <div key={idx} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                    <div className="aspect-video bg-white">
                      {photo ? (
                        <img
                          src={photo.public_url}
                          alt={photo.alt_text || service.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center text-gray-400">
                            <Icon className="w-16 h-16 mx-auto mb-2" />
                            <p className="text-sm">{service.title}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h4>
                      <p className="text-sm font-medium text-gray-600 italic mb-3">{service.subtitle}</p>
                      <p className="text-sm text-gray-700 mb-3">{service.description}</p>
                      {service.phone && (
                        <div className="text-xs text-gray-600">
                          <Phone className="h-3 w-3 inline mr-1" />
                          {service.phone}
                        </div>
                      )}
                      {service.note && (
                        <div className="text-xs font-medium text-gray-900">{service.note}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Service Category 3 - Economic Sovereignty */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 pb-3 border-b-2 border-gray-100">Economic Sovereignty</h3>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Services 6-7 */}
              {[
                {
                  title: 'Digital Service Centre',
                  subtitle: 'Palm Island Connecting Australia',
                  description: '21 local workers now provide customer service to First Nations people nationwide. From a remote island to a digital hub—this is economic transformation in action.',
                  stats: [{ value: '21', label: 'Full-time positions' }, { value: '#2', label: 'Indigenous digital center in Australia' }],
                  index: 5
                },
                {
                  title: 'Social Enterprises',
                  subtitle: 'Community Wealth Through Community Work',
                  description: 'Our bakery, fuel station, mechanics shop, and retail center keep money circulating locally while providing essential services.',
                  stats: [{ value: '44', label: 'Staff (record high)' }],
                  note: 'Bakery • Fuel • Mechanics • Coffee • Variety Store',
                  index: 6
                }
              ].map((service, idx) => {
                const photo = servicePhotos[service.index];

                return (
                  <div key={idx} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                    <div className="aspect-video bg-white">
                      {photo ? (
                        <img
                          src={photo.public_url}
                          alt={photo.alt_text || service.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center text-gray-400">
                            <Building className="w-16 h-16 mx-auto mb-2" />
                            <p className="text-sm">{service.title} photo</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">{service.title}</h4>
                      <p className="text-sm font-medium text-gray-600 italic mb-4">{service.subtitle}</p>
                      <p className="text-gray-700 mb-4">{service.description}</p>
                      <div className={`grid grid-cols-${service.stats.length} gap-4`}>
                        {service.stats.map((stat, sidx) => (
                          <div key={sidx}>
                            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                            <div className="text-xs text-gray-600">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                      {service.note && (
                        <div className="text-xs text-gray-600 mt-2">{service.note}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Video Section - Services in Action */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Services in Action</h2>
            <p className="text-xl text-gray-600">
              See how PICC's integrated services transform lives
            </p>
          </div>

          <div className="aspect-video bg-gray-900 rounded-2xl flex items-center justify-center">
            {servicesVideo ? (
              <video
                controls
                className="w-full h-full rounded-2xl"
                poster={servicesVideo.public_url}
              >
                <source src={servicesVideo.public_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="text-center text-white">
                <Play className="w-24 h-24 mx-auto mb-4" />
                <p className="text-lg">Video: A Day at PICC - Services Tour</p>
                <p className="text-sm text-gray-400 mt-2">(Video to be embedded here)</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Community Voices - Testimonials with Photos */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">Voices of Transformation</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Real stories from community members about PICC's impact
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                quote: "If I can do it, you can. Country provides and we witness it every day through PICC's support.",
                name: 'Community Member',
                role: 'Youth Program Participant',
                index: 0
              },
              {
                quote: "We feel powerful as an all-woman team. PICC showed us we're not just capable, we're unstoppable.",
                name: 'Community Member',
                role: 'Digital Service Centre Team',
                index: 1
              },
              {
                quote: 'No place like home. Every visit feels like returning to where I truly belong.',
                name: 'Community Member',
                role: 'Returning Resident',
                index: 2
              },
              {
                quote: "We're all one people. PICC understands that and brings us together in ways that honor our journey.",
                name: 'Community Member',
                role: 'Elder & Cultural Advisor',
                index: 3
              }
            ].map((testimonial, idx) => {
              const photo = testimonialPhotos[testimonial.index];

              return (
                <div key={idx} className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                  <Quote className="w-12 h-12 text-gray-300 mb-4" />
                  <blockquote className="text-xl font-medium text-gray-800 mb-6 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-gray-200 overflow-hidden">
                      {photo ? (
                        <img
                          src={photo.public_url}
                          alt={photo.alt_text || testimonial.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link href="/stories" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full font-semibold text-lg hover:bg-gray-800 transition-all">
              <BookOpen className="w-5 h-5" />
              Read More Community Stories
            </Link>
          </div>
        </div>
      </section>

      {/* Future Initiatives */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">Horizons of Possibility</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            The journey from survival to thrival continues, and every Palm Islander is part of writing the next chapter
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Youth Digital Futures',
                budget: '$180,000',
                description: 'Expand digital literacy and create pathways from classroom to career in technology sectors. Building on Digital Service Centre success.',
                outcomes: ['60 youth trained in digital skills', 'Direct employment pathways', 'Technology infrastructure upgrades']
              },
              {
                title: 'Bwgcolman Way Implementation',
                budget: '$250,000',
                description: 'Fully operationalize community-controlled child protection decision-making, keeping families together and children connected to culture.',
                outcomes: ['Trained community case workers', 'Cultural protocols established', 'Reduced child removals']
              },
              {
                title: 'Cultural Heritage Living Centre',
                budget: '$120,000',
                description: 'Create spaces where knowledge transmission happens naturally, where Elders teach and youth learn in culturally grounded ways.',
                outcomes: ['Documented cultural practices', 'Intergenerational programs', 'Cultural tourism opportunities']
              },
              {
                title: 'Storytelling Sovereignty Project',
                budget: '$50,000',
                description: 'Document and preserve community narratives that reshape external perceptions and strengthen internal identity.',
                outcomes: ['Digital story archive (20-30 stories)', '6 trained community storytellers', 'Expanded cultural documentation']
              }
            ].map((initiative, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">{initiative.title}</h3>
                    <span className="bg-gray-100 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                      {initiative.budget}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-3">{initiative.description}</p>
                </div>
                <div className="p-6 bg-gray-50">
                  <h4 className="font-bold text-gray-900 mb-2 text-sm">Expected Outcomes:</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {initiative.outcomes.map((outcome, oidx) => (
                      <li key={oidx} className="flex items-start">
                        <ChevronRight className="h-4 w-4 text-gray-600 mt-0.5 mr-1 flex-shrink-0" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & CTA */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Connect With PICC</h2>
            <p className="text-xl text-gray-600">
              Ready to be part of Palm Island's transformation story?
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <Phone className="w-12 h-12 text-gray-900 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-700 mb-3">Speak with our team about services, employment, or partnerships</p>
              <a href="tel:0744214300" className="text-lg font-semibold text-gray-900 hover:underline">
                (07) 4421 4300
              </a>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <Mail className="w-12 h-12 text-gray-900 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-700 mb-3">Get in touch for inquiries, recruitment, or more information</p>
              <a href="mailto:recruitment@picc.com.au" className="text-lg font-semibold text-gray-900 hover:underline">
                recruitment@picc.com.au
              </a>
            </div>
          </div>

          <div className="text-center space-y-4">
            <Link href="/share-voice" className="inline-block px-8 py-4 bg-gray-900 text-white rounded-full font-semibold text-lg hover:bg-gray-800 transition-all mr-4">
              Share Your Story
            </Link>
            <Link href="/annual-reports" className="inline-block px-8 py-4 border-2 border-gray-900 text-gray-900 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all">
              View Our Journey
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-2">Palm Island Community Company</h3>
          <p className="text-gray-300 italic mb-4">
            "Deeply committed to the principles of community control and self-determination."
          </p>
          <p className="text-sm text-gray-400">
            ACN 640 793 728 | Manbarra & Bwgcolman Country
          </p>
        </div>
      </footer>
    </div>
  );
}
