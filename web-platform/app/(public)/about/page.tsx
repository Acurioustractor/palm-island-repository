import React from "react";
import { ChevronRight, Users, Star, Heart, Target, Phone, Mail, Quote, BookOpen } from "lucide-react";
import Link from "next/link";
import { getLiveStats } from "@/lib/stats/get-live-stats";
import { MILESTONES } from "@/lib/stats/current-stats";
import VideoHero from "@/components/video/VideoHero";
import { getHeroVideo, getMediaByTags } from "@/lib/media/utils";
import { CommunityQuotesSection } from "@/components/quotes/CommunityQuotesSection";
import AboutCountdownSection from "@/components/about/AboutCountdownSection";
import { createServerSupabase } from "@/lib/supabase/client";
import { assetUrl } from "@/lib/media/asset-url";

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'About PICC — Palm Island Community Company',
  description: 'Bwgcolman — many tribes, one people. PICC is Palm Island\'s community-controlled anchor institution, built across 17 years from a hybrid public company into a member-controlled organisation.',
};

export default async function AboutPage() {
  const supabase = createServerSupabase();

  const stats = await getLiveStats();
  const heroVideo = await getHeroVideo("about");
  const boardPortraits = await getMediaByTags(['board-member', 'portrait']);

  // CEO photo from leadership table
  const { data: ceoRecord } = await supabase
    .from('leadership')
    .select('photo_url')
    .eq('leadership_type', 'executive')
    .eq('is_active', true)
    .order('position_order')
    .limit(1)
    .maybeSingle();
  const rachelPhoto = ceoRecord?.photo_url ? { public_url: ceoRecord.photo_url, alt_text: 'Rachel Atkinson, CEO' } : null;

  // Board members
  const { data: boardMembers } = await supabase
    .from('leadership')
    .select('id, full_name, position, bio, photo_url, featured_quote, leadership_type')
    .eq('is_active', true)
    .eq('leadership_type', 'board')
    .order('position_order');

  return (
    <div className="relative min-h-screen bg-white">
      {/* 1. Video Hero */}
      <VideoHero
        videoSrc={heroVideo?.public_url || assetUrl('/hero-assets/clips/palm-island-aerial.mp4')}
        overlay="gradient-brand"
        height="tall"
        parallax
        aria-label="About Palm Island Community Company"
      >
        <div className="text-center text-white max-w-5xl mx-auto">
          <p className="text-sm font-semibold tracking-widest uppercase text-white/70 mb-4">About PICC</p>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Palm Island Community Company
          </h1>
          <p className="text-xl md:text-2xl mb-8 font-light">
            Year {MILESTONES.currentYear} of a 20-year journey
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/20-years" className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg hover:scale-[0.97] active:scale-95 transition-all duration-300 ease-elegant shadow-2xl shadow-black/20">
              Our Journey
            </Link>
            <Link href="/share-voice" className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full font-semibold text-lg hover:bg-white/20 transition-all duration-300 ease-elegant">
              Share Your Story
            </Link>
          </div>
        </div>
      </VideoHero>

      {/* 2. Who We Are (merged vision + principles) */}
      <section className="editorial-section bg-warm-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-picc-earth tracking-[-0.02em] mb-6">
                A Living Testament to Transformation
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                In the heart of the Coral Sea lies an island that refuses to be defined by its colonial past. Palm Island Community Company stands as proof that when a community takes control of its own destiny, transformation isn&apos;t just possible&mdash;it&apos;s inevitable.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We see each challenge not as a barrier but as an invitation to innovate, each service not as charity but as sovereignty in action. This is PICC: Community control as revolutionary act.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden h-96">
              <img
                src={assetUrl("/hero-assets/stills/pier-turquoise.jpg")}
                alt="Palm Island pier and turquoise waters"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Compact 3-pillar row */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center border border-warm-200">
                <Star className="w-8 h-8 text-picc-ocean" />
              </div>
              <h3 className="text-lg font-bold text-picc-earth mb-2">Our Philosophy</h3>
              <p className="text-sm text-gray-600">We operate from abundance, not deficit. Every Palm Islander carries strengths, knowledge, and potential.</p>
            </div>
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center border border-warm-200">
                <Heart className="w-8 h-8 text-picc-ocean" />
              </div>
              <h3 className="text-lg font-bold text-picc-earth mb-2">Our Method</h3>
              <p className="text-sm text-gray-600">Integrated services that wrap around families. No wrong door, no gaps&mdash;just seamless support.</p>
            </div>
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center border border-warm-200">
                <Target className="w-8 h-8 text-picc-ocean" />
              </div>
              <h3 className="text-lg font-bold text-picc-earth mb-2">Our Promise</h3>
              <p className="text-sm text-gray-600">Every decision emerges from and returns to community. Sovereignty in practice.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 Bwgcolman — Cultural foundation */}
      <section className="editorial-section bg-[#FAF8F5]">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-3 text-center">
            Cultural Foundation
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-picc-earth tracking-[-0.02em] text-center mb-8 font-serif italic">
            Bwgcolman — many tribes, one people
          </h2>
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <p className="text-lg text-gray-700 leading-relaxed mb-5">
                Palm Island was gazetted as an Aboriginal reserve in 1914. In the decades that followed, Aboriginal and Torres Strait Islander people were forcibly removed here from <strong>more than 70 Nations</strong> across Queensland.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Out of that history, a single community formed. <strong>Bwgcolman</strong> is the name Palm Islanders use for themselves — commonly glossed as <em>&ldquo;many tribes, one people.&rdquo;</em> The <strong>Manbarra</strong> are the Traditional Owners of this country. PICC&apos;s constitution reserves a board seat for a Manbarra-nominated director, and membership is open to Manbarra and Bwgcolman people aged 18 and over.
              </p>
            </div>
            <div className="bg-[#0B4F6C] text-white rounded-2xl p-8">
              <Quote className="w-8 h-8 text-picc-ochre mb-4 opacity-80" />
              <p className="font-serif italic text-xl md:text-2xl leading-relaxed mb-4">
                Community control on Palm is not just an administrative model. It is a self-determination response to a long history of imposed control.
              </p>
              <p className="text-xs text-white/60 border-l-2 border-picc-ochre pl-3">
                From the PICC sector-context research, 10 April 2026
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Impact Numbers */}
      <section className="editorial-section bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-picc-earth tracking-[-0.02em] text-center mb-4">The Numbers Tell Our Story</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Each number represents a life touched, a family strengthened, a future secured
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-warm-50 rounded-2xl p-8 text-center border border-warm-200">
              <div className="text-5xl font-extrabold text-picc-ocean tracking-tight mb-2">{stats.staff.total}</div>
              <div className="text-lg font-semibold text-gray-800 mb-1">Staff Employed</div>
              <p className="text-sm text-gray-600">Each job represents a family lifted</p>
            </div>

            <div className="bg-warm-50 rounded-2xl p-8 text-center border border-warm-200">
              <div className="text-5xl font-extrabold text-picc-ocean tracking-tight mb-2">{stats.staff.indigenousPct}%</div>
              <div className="text-lg font-semibold text-gray-800 mb-1">Indigenous Workforce</div>
              <p className="text-sm text-gray-600">Our people serving our people</p>
            </div>

            <div className="bg-warm-50 rounded-2xl p-8 text-center border border-warm-200">
              <div className="text-5xl font-extrabold text-picc-ocean tracking-tight mb-2">{stats.financials.incomeDisplay}</div>
              <div className="text-lg font-semibold text-gray-800 mb-1">Annual Income</div>
              <p className="text-sm text-gray-600">Community-controlled investment</p>
            </div>

            <div className="bg-warm-50 rounded-2xl p-8 text-center border border-warm-200">
              <div className="text-5xl font-extrabold text-picc-ocean tracking-tight mb-2">{stats.services.active}</div>
              <div className="text-lg font-semibold text-gray-800 mb-1">Integrated Services</div>
              <p className="text-sm text-gray-600">Holistic support ecosystem</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CEO Quote Callout */}
      <section className="py-20 md:py-24 px-4 bg-gradient-to-br from-picc-earth-700 via-picc-earth to-picc-red text-white">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <Quote className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <blockquote className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-6 tracking-[-0.02em] leading-tight">
            &ldquo;Everything we do is for, with, and because of the people of this beautiful community&rdquo;
          </blockquote>
          <p className="text-lg text-white/70">Rachel Atkinson, CEO</p>
        </div>
      </section>

      {/* 5. Our Story Timeline */}
      <section className="editorial-section bg-warm-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-picc-earth tracking-[-0.02em] mb-4 text-center">From Colonial Control to Community Sovereignty</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            The journey of Palm Island Community Company cannot be separated from the journey of Palm Island itself
          </p>

          <div className="space-y-12">
            {[
              {
                era: 'Ancient Foundations',
                period: 'Time Immemorial',
                description: 'The Manbarra people live in harmony with the Palm Islands, their Dreamtime stories telling of Rainbow Serpent fragments forming the archipelago.',
                significance: 'Cultural bedrock that sustains us still',
                image: 'https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/annual-report-2024/1771305448200-t2zjnm-img-001.jpg',
                alt: 'Palm Island beach panorama — Manbarra Country',
              },
              {
                era: 'Colonial Disruption',
                period: '1914-1918',
                description: "Palm Island designated as Aboriginal reserve, then transformed into a place of forced relocation for 'troublesome' Aboriginal people from across Queensland.",
                significance: 'From 57 language groups, the Bwgcolman identity emerges: "Many tribes, one people"',
                image: 'https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/elders-trip-2025/pier-turquoise-b.jpg',
                alt: 'Palm Island from the water — the view of arrivals',
              },
              {
                era: 'Resistance & Resilience',
                period: '1957',
                description: 'The Magnificent Seven lead a five-day strike against oppressive conditions, facing exile but igniting a movement for dignity and rights.',
                significance: 'Courage that echoes through generations',
                image: 'https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/annual-reports/2012-13/annual-report-2012-13-img-000.jpg',
                alt: 'Palm Island community — strength through generations',
              },
              {
                era: 'Transition Period',
                period: '1975-2005',
                description: 'Dormitories close, Protection Act ends, community gains local government status. Slow dismantling of colonial control structures.',
                significance: 'Each victory building toward self-governance',
                image: 'https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/annual-reports/2021-22/annual-report-2021-22-img-005.jpg',
                alt: 'Cultural centre — community gathering and cultural expression',
              },
              {
                era: 'PICC Genesis',
                period: '2007-2009',
                description: 'Palm Island Community Company established. Rachel Atkinson appointed as sole employee in 2007, with formal service delivery beginning in 2009.',
                significance: 'Planting seeds of transformation',
                image: 'https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/1764215451340-cif9ut.jpg',
                alt: 'Rachel Atkinson — PICC founding CEO',
              },
              {
                era: 'Community Sovereignty',
                period: '2021-Present',
                description: "Full community control achieved. PICC now wholly owned by Palm Islanders, becoming the island's second-largest employer.",
                significance: 'Self-determination realized, but the journey continues',
                image: 'https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/picc-website/service-photos/20240410-IMG_6282.jpg',
                alt: 'PICC staff at Community Hub — community sovereignty in action',
              },
            ].map((item, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={idx} className="grid md:grid-cols-2 gap-8 items-center">
                  <div className={isEven ? 'order-2 md:order-1' : ''}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-picc-ocean rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-picc-earth">{item.era}</h3>
                          <span className="text-sm font-medium bg-picc-ochre/10 text-picc-ochre-700 px-3 py-1 rounded-full">
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
                    <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden h-64">
                      <img
                        src={item.image}
                        alt={item.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link href="/20-years" className="inline-flex items-center gap-2 px-8 py-4 bg-picc-ocean text-white rounded-full font-semibold text-lg hover:bg-picc-ocean-600 hover:scale-[0.97] active:scale-95 transition-all duration-300 ease-elegant">
              <BookOpen className="w-5 h-5" />
              Explore {stats.milestones.yearsOperating} Years of Impact
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Community Story Video */}
      <section className="editorial-section bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-picc-earth tracking-[-0.02em] mb-4">Our Community Story</h2>
            <p className="text-xl text-gray-600">
              The story of Palm Island Community Company in the community&apos;s own words
            </p>
          </div>
          <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden">
            <iframe
              src="https://share.descript.com/embed/hKKOfLKaapn"
              className="w-full h-full"
              allow="autoplay; fullscreen"
              title="Palm Island Community Story"
            />
          </div>
        </div>
      </section>

      {/* 7. Leadership */}
      <section className="editorial-section bg-gradient-to-b from-white to-warm-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-picc-earth tracking-[-0.02em] text-center mb-12">The Architects of Transformation</h2>

          {/* CEO Spotlight */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="md:col-span-1">
              <div className="bg-warm-50 rounded-2xl border border-warm-200 aspect-square overflow-hidden">
                {rachelPhoto ? (
                  <img
                    src={rachelPhoto.public_url}
                    alt={rachelPhoto.alt_text || 'Rachel Atkinson, CEO'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-warm-50 to-warm-100">
                    <Users className="w-16 h-16 text-gray-300" />
                  </div>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-3xl font-extrabold text-picc-ocean tracking-tight mb-2">Rachel Atkinson</h3>
              <p className="text-xl font-medium text-gray-700 mb-4">Chief Executive Officer</p>
              <p className="text-lg text-gray-700 mb-6">
                A proud Yorta Yorta woman carrying the legacy of activists William Cooper and Sir Douglas Nicholls, Rachel has transformed PICC from a single-employee operation to Palm Island&apos;s largest non-government employer. Her greatest triumph: achieving full community control in 2021.
              </p>

              <div className="bg-warm-50 rounded-2xl border-l-4 border-picc-ochre p-6 mb-6">
                <Quote className="w-8 h-8 text-gray-400 mb-3" />
                <p className="text-lg italic text-gray-800">
                  &ldquo;Everything we do is for, with, and because of the people of this beautiful community&rdquo;
                </p>
              </div>

              <div>
                <h4 className="font-bold text-picc-earth mb-3 text-lg">Transformational Achievements:</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    `Grew organization from 1 to ${stats.staff.total} employees`,
                    '80%+ Aboriginal and Torres Strait Islander workforce',
                    'Secured full community control',
                    '$5.8 million in local wages annually',
                    'Reduced Aboriginal child removals through integrated services',
                  ].map((text, i) => (
                    <div key={i} className={`flex items-start ${i === 4 ? 'md:col-span-2' : ''}`}>
                      <ChevronRight className="h-5 w-5 text-picc-ochre mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Board Members Grid */}
          <h3 className="text-3xl font-extrabold text-picc-ocean tracking-tight mb-8">Board of Directors: Guardians of Community Vision</h3>
          {(boardMembers && boardMembers.length > 0) ? (
            <div className="grid md:grid-cols-3 gap-8">
              {boardMembers.map((member: any) => {
                const personTag = 'person:' + member.full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
                const photo = member.photo_url
                  || boardPortraits.find((p: any) => Array.isArray(p.tags) && p.tags.includes(personTag))?.public_url
                  || null;

                return (
                  <div key={member.id} className="bg-warm-50 rounded-2xl border border-warm-200 overflow-hidden">
                    <div className="aspect-square bg-warm-100">
                      {photo ? (
                        <img src={photo} alt={member.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h4 className="text-xl font-bold text-picc-earth mb-1">{member.full_name}</h4>
                      <p className="text-sm font-medium text-gray-600 mb-3">{member.position}</p>
                      {member.bio && <p className="text-sm text-gray-700 mb-3">{member.bio}</p>}
                      {member.featured_quote && (
                        <div className="bg-white rounded-xl p-3 border border-warm-200">
                          <Quote className="w-4 h-4 text-gray-400 mb-1" />
                          <p className="text-xs italic text-gray-600">&ldquo;{member.featured_quote}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Board member information coming soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* 8. Community Voices */}
      <CommunityQuotesSection featured limit={6} variant="carousel" />

      {/* 9. 20-Year Vision + Countdown */}
      <AboutCountdownSection
        currentYear={stats.milestones.currentYear}
        yearsRemaining={stats.milestones.yearsRemaining}
        progressPct={stats.milestones.progressPct}
        staffTotal={stats.staff.total}
        servicesActive={stats.services.active}
        incomeDisplay={stats.financials.incomeDisplay}
      />

      {/* 10. Connect CTA */}
      <section className="editorial-section bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-picc-earth tracking-[-0.02em] mb-4">Be Part of Our Story</h2>
            <p className="text-xl text-gray-600">
              Ready to be part of Palm Island&apos;s transformation story?
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-warm-50 rounded-2xl p-8 border border-warm-200">
              <Phone className="w-12 h-12 text-picc-ocean mb-4" />
              <h3 className="text-xl font-bold text-picc-earth mb-2">Call Us</h3>
              <p className="text-gray-700 mb-3">Speak with our team about services, employment, or partnerships</p>
              <a href="tel:0744214300" className="text-lg font-semibold text-gray-900 hover:underline">
                (07) 4421 4300
              </a>
            </div>

            <div className="bg-warm-50 rounded-2xl p-8 border border-warm-200">
              <Mail className="w-12 h-12 text-picc-ocean mb-4" />
              <h3 className="text-xl font-bold text-picc-earth mb-2">Email Us</h3>
              <p className="text-gray-700 mb-3">Get in touch for inquiries, recruitment, or more information</p>
              <a href="mailto:recruitment@picc.com.au" className="text-lg font-semibold text-gray-900 hover:underline">
                recruitment@picc.com.au
              </a>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/share-voice" className="inline-flex items-center gap-3 px-8 py-4 bg-picc-ocean text-white rounded-full font-semibold text-lg hover:bg-picc-ocean-600 hover:scale-[0.97] active:scale-95 transition-all duration-300 ease-elegant">
              Share Your Story
            </Link>
            <Link href="/services" className="inline-flex items-center gap-3 px-8 py-4 border-2 border-picc-ocean text-picc-ocean rounded-full font-semibold text-lg hover:bg-picc-ocean/5 transition-all duration-300 ease-elegant">
              Explore Services
            </Link>
            <Link href="/annual-report/live" className="inline-flex items-center gap-2 text-picc-ocean font-semibold hover:underline py-4">
              View Annual Report &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
