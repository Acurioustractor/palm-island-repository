import Link from 'next/link';
import {
  Download, ArrowLeft,
  Target, DollarSign,
  Sparkles, ExternalLink,
} from 'lucide-react';
import { BespokeIcon } from '@/components/ui/BespokeIcon';
import { getServiceIcon } from '@/lib/services/service-icons';
import { FINANCIALS, MILESTONES } from '@/lib/stats/current-stats';
import { type CuratedQuote } from '@/lib/quotes/get-curated-quotes';
import { PhotoGallery } from '@/components/report';
import LiveReportEditor from '@/components/report/LiveReportEditor';
import FinancialSummary, { type FinancialData } from '@/components/report/FinancialSummary';
import ShareFooterButtons from '@/components/report/ShareFooterButtons';
import { AcknowledgmentBanner } from '@/components/annual-report/2024-25/AcknowledgmentBanner';
import {
  SectionTitle,
  SectionDivider,
  ImpactNumber,
  ScrollRevealWrapper,
  CommunityVisionCard,
  PrintButton,
} from '@/components/annual-report/live/EditorialComponents';
import { createServerComponentClient } from '@/lib/supabase/server';
import { assetUrl } from '@/lib/media/asset-url';

import { fetchLiveReportData, getCurrentFiscalYear } from '@/lib/annual-report/fetch-live-report-data';
import { parseAudience, shouldShowWebSection, type ReportAudience, AUDIENCE_CONFIGS } from '@/lib/annual-report/audience-config';

// This is a SERVER COMPONENT - fetches real-time data
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LiveAnnualReportPage({
  searchParams,
}: {
  searchParams?: { edit?: string; audience?: string }
}) {
  const { currentFiscalYear, reportingPeriod, reportYear } = getCurrentFiscalYear();
  const editEnabled = process.env.NODE_ENV !== 'production' && searchParams?.edit === '1';
  const audience = parseAudience(searchParams?.audience);

  // Single data fetch — composes all existing utilities
  const data = await fetchLiveReportData(currentFiscalYear);

  // Extract commonly used fields
  const { reportData, liveStats, curatedQuotes, galleryPhotos, boardPhotos, stories, storyImages, heroImage, mapImage, communityVisions } = data;

  // Stats for display
  const totalStaff = liveStats.staff;
  const totalServices = liveStats.services;
  const annualBudget = liveStats.income;

  // Find CEO and Chair from leadership messages
  const ceoLeader = reportData.leadershipMessages.find(
    (l) => l.role === 'ceo' || l.person_title?.toLowerCase().includes('ceo') || l.person_title?.toLowerCase().includes('chief executive')
  );
  const chairLeader = reportData.leadershipMessages.find(
    (l) => l.role === 'chair' || l.person_title?.toLowerCase().includes('chair')
  );

  // Financial data — fetch directly from annual_financials for the FinancialSummary component
  const financialsData = await fetchFinancialsForYear(reportYear);
  const previousFinancials = await fetchFinancialsForYear(reportYear - 1);

  // Audience label for banner
  const audienceLabel = audience ? AUDIENCE_CONFIGS[audience]?.coverSubtitle : null;

  return (
    <div className="min-h-screen bg-[#faf9f7] print:bg-white">
      <LiveReportEditor
        enabled={editEnabled}
        reportYear={reportYear}
        fiscalYear={currentFiscalYear}
        heroImage={heroImage}
        mapImage={mapImage}
        boardImages={(boardPhotos || []).map((p) => ({ id: p.url, public_url: p.url }))}
      />

      {/* ─── 1. HERO ─── */}
      <section
        className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden print:hidden"
      >
        <video
          autoPlay muted loop playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          src={assetUrl("/hero-assets/clips/mountain-panorama.mp4")}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/50 font-medium mb-6">
            Annual Report {currentFiscalYear}
          </p>

          <h1
            className="text-5xl md:text-7xl font-light mb-6 drop-shadow-2xl leading-[1.05]"
            style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
          >
            Our Community, Our Future, Our Way
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 text-white/70 font-light">
            {reportingPeriod}
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href={`/annual-report/${reportYear}`}
              className="px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all shadow-2xl inline-flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </Link>
            <Link
              href="/picc/report-generator"
              className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all inline-flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Generate Full Report
            </Link>
          </div>
        </div>

        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors print:hidden"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs tracking-[0.2em] uppercase font-medium">PICC</span>
        </Link>
      </section>

      {/* ─── Print-only hero ─── */}
      <div className="hidden print:block py-12 text-center border-b border-gray-200">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          PICC Annual Report {currentFiscalYear}
        </h1>
        <p className="text-lg text-gray-600">{reportingPeriod}</p>
      </div>

      {/* ─── 2. ACKNOWLEDGMENT OF COUNTRY ─── */}
      <AcknowledgmentBanner />

      <SectionDivider />

      {/* ─── 3. CEO / CHAIR WELCOME ─── */}
      {shouldShowWebSection('messages', audience) && (
        <>
          {(ceoLeader || chairLeader) ? (
            <section className="py-24 md:py-32 bg-white print:py-12">
              <div className="max-w-6xl mx-auto px-8">
                <SectionTitle label="Welcome" title="Messages from Our Leaders" />

                <div className="grid md:grid-cols-2 gap-12 md:gap-20">
                  {ceoLeader && (ceoLeader.message_content || ceoLeader.message_excerpt || ceoLeader.featured_quote) && (
                    <ScrollRevealWrapper direction="up" delay={0}>
                      <div className="flex flex-col items-start">
                        {ceoLeader.photo_url && (
                          <img
                            src={ceoLeader.photo_url}
                            alt={ceoLeader.person_name}
                            className="w-20 h-20 rounded-full object-cover mb-6 border-2 border-warm-100"
                          />
                        )}
                        <p className="text-base md:text-lg text-gray-600 leading-[1.8] font-light mb-6">
                          {ceoLeader.message_content || ceoLeader.message_excerpt || ceoLeader.featured_quote}
                        </p>
                        <div className="pt-6 border-t border-gray-200">
                          <p className="font-medium text-gray-900 tracking-wide">{ceoLeader.person_name}</p>
                          <p className="text-sm text-gray-400 mt-1">{ceoLeader.person_title || 'Chief Executive Officer'}</p>
                        </div>
                      </div>
                    </ScrollRevealWrapper>
                  )}

                  {chairLeader && (chairLeader.message_content || chairLeader.message_excerpt || chairLeader.featured_quote) && (
                    <ScrollRevealWrapper direction="up" delay={0.15}>
                      <div className="flex flex-col items-start">
                        {chairLeader.photo_url && (
                          <img
                            src={chairLeader.photo_url}
                            alt={chairLeader.person_name}
                            className="w-20 h-20 rounded-full object-cover mb-6 border-2 border-warm-100"
                          />
                        )}
                        <p className="text-base md:text-lg text-gray-600 leading-[1.8] font-light mb-6">
                          {chairLeader.message_content || chairLeader.message_excerpt || chairLeader.featured_quote}
                        </p>
                        <div className="pt-6 border-t border-gray-200">
                          <p className="font-medium text-gray-900 tracking-wide">{chairLeader.person_name}</p>
                          <p className="text-sm text-gray-400 mt-1">{chairLeader.person_title || 'Board Chairperson'}</p>
                        </div>
                      </div>
                    </ScrollRevealWrapper>
                  )}
                </div>

                {/* Fallback if leaders exist but no message content */}
                {!ceoLeader?.message_content && !ceoLeader?.message_excerpt && !ceoLeader?.featured_quote &&
                 !chairLeader?.message_content && !chairLeader?.message_excerpt && !chairLeader?.featured_quote && (
                  <div className="max-w-4xl mx-auto">
                    <p className="text-xl text-gray-600 leading-relaxed font-light">
                      Messages from our leadership are being prepared for the {currentFiscalYear} annual report.
                    </p>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section className="py-24 md:py-32 bg-white print:py-12">
              <div className="max-w-4xl mx-auto px-8">
                <SectionTitle label="Welcome" title="Our Year in Review" />
                <p className="text-xl text-gray-600 leading-relaxed font-light">
                  Messages from our leadership are being prepared for the {currentFiscalYear} annual report.
                </p>
              </div>
            </section>
          )}

          <SectionDivider />
        </>
      )}

      {/* ─── 4. IMPACT NUMBERS ─── */}
      {shouldShowWebSection('numbers', audience) && (
        <>
          <section className="py-24 md:py-32 bg-[#faf9f7] print:py-12">
            <div className="max-w-6xl mx-auto px-8">
              <SectionTitle
                label="Impact"
                title="By the Numbers"
                subtitle="Real data from our community, updated in real-time"
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-16">
                <ImpactNumber
                  value={`${totalStaff}+`}
                  label="Staff Members"
                  context="Our biggest team yet"
                  delay={0}
                />
                <ImpactNumber
                  value={totalServices}
                  label="Integrated Services"
                  context="Holistic community support"
                  delay={0.1}
                />
                <ImpactNumber
                  value="3,000+"
                  label="People Served"
                  context="Island-wide impact"
                  delay={0.2}
                />
                <ImpactNumber
                  value={`$${(annualBudget / 1000000).toFixed(1)}M`}
                  label="Annual Budget"
                  context="Invested in community"
                  delay={0.3}
                />
              </div>
            </div>
          </section>

          <SectionDivider />
        </>
      )}

      {/* ─── 5. COMMUNITY VOICES (Stories + Elder Quotes merged) ─── */}
      {shouldShowWebSection('communityVoices', audience) && (stories.length > 0 || curatedQuotes.length > 0) && (
        <>
          <section className="py-24 md:py-32 bg-white print:py-12">
            <div className="max-w-7xl mx-auto px-8">
              <SectionTitle
                label="Voices"
                title="Community Voices"
                subtitle="Real stories from real people making real impact"
              />

              {stories.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                  {stories.slice(0, 6).map((story: any) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      storyImage={storyImages[story.id]}
                      isFeatured={story._is_featured}
                    />
                  ))}
                </div>
              )}

              {curatedQuotes.length > 0 && (
                <>
                  <div className="mb-12 mt-8">
                    <h3
                      className="text-2xl font-light text-gray-900 text-center mb-2"
                      style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
                    >
                      Elder Wisdom
                    </h3>
                    <p className="text-sm text-gray-400 text-center uppercase tracking-[0.2em]">
                      Words from our Elders and community members
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {curatedQuotes.slice(0, 6).map((quote: CuratedQuote) => (
                      <ScrollRevealWrapper key={quote.id} direction="up">
                        <div className="bg-[#faf9f7] rounded-sm p-8 border border-picc-ochre/10">
                          <div className="flex items-start gap-4">
                            {quote.photo_url ? (
                              <img
                                src={quote.photo_url}
                                alt={quote.speaker_name || 'Elder'}
                                className="w-14 h-14 rounded-full object-cover border-2 border-picc-ochre/20 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-picc-ochre/30 to-picc-ochre flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                                {(quote.speaker_name || '?').charAt(0)}
                              </div>
                            )}
                            <div>
                              <blockquote className="text-gray-700 text-lg italic leading-relaxed mb-3 font-light">
                                &ldquo;{quote.quote}&rdquo;
                              </blockquote>
                              <p className="text-picc-ochre font-medium text-sm">
                                &mdash; {quote.speaker_name || 'Community Member'}
                                {quote.speaker_role && <span className="text-gray-400 font-normal"> &middot; {quote.speaker_role}</span>}
                              </p>
                              {quote.theme && (
                                <span className="inline-block mt-2 px-3 py-1 bg-picc-ochre/10 text-picc-ochre rounded-full text-xs font-medium">
                                  {quote.theme}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </ScrollRevealWrapper>
                    ))}
                  </div>
                </>
              )}

              <div className="text-center mt-14">
                <Link
                  href="/stories"
                  className="inline-flex items-center gap-2 text-sm tracking-[0.15em] uppercase font-medium text-gray-900 hover:text-gray-600 transition-colors"
                >
                  Read All Stories
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>

          <SectionDivider />
        </>
      )}

      {/* ─── 6. OUR SERVICES ─── */}
      {shouldShowWebSection('services', audience) && reportData.services.length > 0 && (
        <>
          <section className="py-24 md:py-32 bg-[#faf9f7] print:py-12">
            <div className="max-w-7xl mx-auto px-8">
              <SectionTitle
                label="What We Do"
                title="Our Services"
                subtitle={`${totalServices}+ programs supporting every aspect of community life`}
              />

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reportData.services.map((service: any, idx: number) => (
                  <ServiceCard key={service.id} service={service} index={idx} />
                ))}
              </div>
            </div>
          </section>

          <SectionDivider />
        </>
      )}

      {/* ─── 7. PHOTO GALLERY ─── */}
      {shouldShowWebSection('photos', audience) && (
        <>
          <section className="py-24 md:py-32 bg-gray-950 print:bg-white print:py-12">
            <div className="max-w-7xl mx-auto px-8">
              <SectionTitle
                label="Gallery"
                title={`Year in Pictures`}
                subtitle={`Moments from ${currentFiscalYear}`}
                light
              />

              {galleryPhotos.length > 0 ? (
                <PhotoGallery photos={galleryPhotos} layout="featured" columns={4} />
              ) : (
                <div className="text-center py-12 bg-white/5 rounded-sm border border-white/10">
                  <p className="text-white/70 font-medium">No gallery images found yet.</p>
                  <p className="text-white/40 mt-1 text-sm">
                    Tag photos with <code className="bg-white/10 px-1 rounded">annual-report</code> and <code className="bg-white/10 px-1 rounded">fy:{currentFiscalYear}</code> in the Media Library.
                  </p>
                  <div className="mt-4">
                    <Link href="/picc/media/gallery" className="text-picc-ochre hover:text-picc-ochre/80 font-medium text-sm">
                      Open Media Gallery &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* ─── 8. INNOVATION PROJECTS ─── */}
      {shouldShowWebSection('innovation', audience) && reportData.innovationProjects.length > 0 && (
        <>
          <SectionDivider />
          <section id="projects" className="py-24 md:py-32 bg-white print:py-12">
            <div className="max-w-7xl mx-auto px-8">
              <SectionTitle
                label="Innovation"
                title="Innovation in Action"
                subtitle={`Real initiatives from ${currentFiscalYear}`}
              />

              <div className="grid md:grid-cols-2 gap-8">
                {reportData.innovationProjects.map((project: any) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>

              <div className="text-center mt-14">
                <Link
                  href="/picc/projects"
                  className="inline-flex items-center gap-2 text-sm tracking-[0.15em] uppercase font-medium text-gray-900 hover:text-gray-600 transition-colors"
                >
                  View all projects
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        </>
      )}

      <SectionDivider />

      {/* ─── 9. LEADERSHIP & GOVERNANCE ─── */}
      {shouldShowWebSection('governance', audience) && (reportData.boardMembers.length > 0 || reportData.leadershipMessages.length > 0) && (
        <>
          <section className="py-24 md:py-32 bg-[#faf9f7] print:py-12">
            <div className="max-w-7xl mx-auto px-8">
              <SectionTitle
                label="Governance"
                title="Leadership & Governance"
                subtitle="Community-elected leaders guiding our vision"
              />

              {reportData.boardMembers.length > 0 && (
                <div className="mb-16">
                  <h3
                    className="text-2xl font-light text-gray-900 mb-8 text-center"
                    style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
                  >
                    Board of Directors
                  </h3>

                  {boardPhotos.length > 0 && (
                    <div className="mb-10">
                      <PhotoGallery photos={boardPhotos} layout="grid" columns={4} />
                    </div>
                  )}
                  <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {reportData.boardMembers.map((member: any) => (
                      <LeaderCard key={member.id} member={member} />
                    ))}
                  </div>
                </div>
              )}

              {reportData.leadershipMessages.filter((l) => l.role !== 'ceo' && l.role !== 'chair').length > 0 && (
                <div>
                  <h3
                    className="text-2xl font-light text-gray-900 mb-8 text-center"
                    style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
                  >
                    Executive Leadership Team
                  </h3>
                  <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {reportData.leadershipMessages
                      .filter((l) => l.role !== 'ceo' && l.role !== 'chair')
                      .map((member: any) => (
                        <LeaderCard key={member.id} member={{ ...member, full_name: member.person_name, position: member.person_title }} />
                      ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <SectionDivider />
        </>
      )}

      {/* ─── 10. FINANCIAL TRANSPARENCY ─── */}
      {shouldShowWebSection('financials', audience) && (
        <>
          <section className="py-24 md:py-32 bg-white print:py-12">
            <div className="max-w-5xl mx-auto px-8">
              <SectionTitle
                label="Transparency"
                title="Financial Summary"
                subtitle="Transparent, accountable financial management"
              />

              {financialsData ? (
                <FinancialSummary
                  current={financialsData}
                  previous={previousFinancials}
                  fiscalYear={currentFiscalYear}
                />
              ) : (
                <div className="text-center py-12 bg-[#faf9f7] rounded-sm border border-gray-200">
                  <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-600 font-medium">Financial data not yet available for {currentFiscalYear}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Enter financial data in the admin dashboard to display it here.
                  </p>
                </div>
              )}
            </div>
          </section>

          <SectionDivider />
        </>
      )}

      {/* ─── 11. LOOKING FORWARD — 20-Year Vision ─── */}
      {shouldShowWebSection('vision', audience) && (
        <section className="py-28 md:py-36 bg-gradient-to-br from-picc-earth-600/5 to-picc-ochre/5 print:py-12">
          <div className="max-w-5xl mx-auto px-8">
            <SectionTitle
              label="Looking Forward"
              title="The Next Twenty Years"
              subtitle={`Year ${MILESTONES.currentYear} of our 20-year journey — ${MILESTONES.yearsRemaining} years to our milestone`}
            />

            {communityVisions.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-8 mb-16">
                {communityVisions.map((vision: any, idx: number) => (
                  <CommunityVisionCard
                    key={vision.id}
                    vision={vision.vision_text}
                    contributor={vision.author_name}
                    delay={idx * 0.1}
                  />
                ))}
              </div>
            ) : (
              <ScrollRevealWrapper direction="up">
                <p className="text-lg text-gray-500 font-light text-center max-w-2xl mx-auto mb-16 leading-relaxed">
                  As we approach our 20th anniversary milestone, we reflect on how far we have come
                  and look forward to the future we are building together &mdash; a future shaped by
                  community voices and shared aspirations.
                </p>
              </ScrollRevealWrapper>
            )}

            <ScrollRevealWrapper direction="up" delay={0.2}>
              <div className="text-center">
                <Link
                  href="/road-to-20-years"
                  className="inline-flex items-center gap-2 text-sm tracking-[0.15em] uppercase font-medium text-gray-900 hover:text-gray-600 transition-colors"
                >
                  Explore Our Journey
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </ScrollRevealWrapper>
          </div>
        </section>
      )}

      {/* ─── 12. DOWNLOAD & SHARE ─── */}
      <PdfDownloadSection reportYear={reportYear} fiscalYear={currentFiscalYear} totalServices={totalServices} />

      {/* Audience-Specific Banner */}
      {audience && (
        <section className="py-4 text-center text-sm font-medium print:hidden bg-picc-ochre text-white">
          Viewing: {audience.charAt(0).toUpperCase() + audience.slice(1)} Perspective
        </section>
      )}

      {/* Share Footer */}
      <section className="py-16 bg-gray-950 text-white print:hidden">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3
                className="text-2xl font-light mb-2"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                Share This Report
              </h3>
              <p className="text-gray-500 text-sm">Help us celebrate our community&apos;s achievements</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ShareFooterButtons fiscalYear={currentFiscalYear} />
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-[11px] tracking-[0.3em] uppercase text-white/30">
              Palm Island (Bwgcolman), Queensland, Australia
            </p>
            <p className="text-white/20 text-xs mt-3">
              &copy; {new Date().getFullYear()} Palm Island Community Company
            </p>
          </div>
        </div>
      </section>

      {/* ─── PRINT STYLES ─── */}
      <style>{`
        @media print {
          nav, .print\\:hidden, video, iframe, button, [data-radix-portal] {
            display: none !important;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          section {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          img {
            max-width: 100% !important;
            max-height: 400px !important;
          }
          .bg-gray-950, .bg-gradient-to-b, .bg-gradient-to-br {
            background: white !important;
            color: #111 !important;
          }
          h1, h2, h3 {
            page-break-after: avoid;
            break-after: avoid;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Helper Components ───

function ServiceCard({ service, index }: any) {
  const iconName = getServiceIcon(service.slug || service.name || '');
  return (
    <div
      className="bg-white border border-gray-100 rounded-sm p-6 hover:border-picc-ochre/30 hover:shadow-lg transition-all"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center bg-stone-50 border border-stone-100">
        <BespokeIcon name={iconName} size={28} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
      <p className="text-gray-500 mb-4 line-clamp-3 text-sm font-light">{service.description}</p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-picc-ochre font-medium">
          {service.staff_count || 0} staff
        </span>
        <span className="text-gray-400">
          {service.clients_served_annual || service.clients_served || 0} served
        </span>
      </div>
    </div>
  );
}

function ProjectCard({ project }: any) {
  return (
    <div className="bg-[#faf9f7] rounded-sm overflow-hidden hover:shadow-lg transition-all border border-gray-100">
      {project.hero_image_url && (
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <img
            src={project.hero_image_url}
            alt={project.title || project.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-8">
        <div className="flex items-start justify-between mb-4">
          <Target className="w-8 h-8 text-picc-ochre" />
          <span className="px-3 py-1 bg-picc-ochre/10 text-picc-ochre rounded-full text-xs font-medium uppercase tracking-wider">
            {project.status || 'in_progress'}
          </span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{project.title || project.name}</h3>
        <p className="text-gray-500 mb-4 line-clamp-3 font-light">{project.impact_summary || project.description}</p>
      </div>
    </div>
  );
}

function StoryCard({ story, storyImage, isFeatured }: any) {
  const storytellerName = story.storyteller?.preferred_name || story.storyteller?.full_name || 'Community Member';
  const storytellerImage = story.storyteller?.profile_image_url || null;
  const excerpt = String(story.content || '').trim().slice(0, 180);

  return (
    <Link href={`/stories/${story.id}`} className="group block">
      <div className="bg-[#faf9f7] border border-gray-100 rounded-sm overflow-hidden hover:border-picc-ochre/30 hover:shadow-lg transition-all">
        {storyImage && (
          <div className="relative h-44 bg-gray-100 overflow-hidden">
            <img
              src={storyImage}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {isFeatured && (
              <span className="absolute top-2 right-2 px-2 py-1 bg-picc-ochre text-white text-xs font-bold rounded-full">
                Featured
              </span>
            )}
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            {storytellerImage ? (
              <img
                src={storytellerImage}
                alt={storytellerName}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-picc-ochre/30 to-picc-ochre flex items-center justify-center text-white font-bold">
                {storytellerName.charAt(0)}
              </div>
            )}
            <div>
              <div className="font-medium text-gray-900 text-sm">{storytellerName}</div>
              <div className="text-xs text-gray-400">
                {story.category || 'Community Story'}
              </div>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-picc-ochre transition-colors">
            {story.title}
          </h3>
          <p className="text-gray-500 text-sm line-clamp-3 font-light">
            {excerpt ? `${excerpt}${String(story.content || '').length > excerpt.length ? '...' : ''}` : 'Read the full story'}
          </p>
        </div>
      </div>
    </Link>
  );
}

function LeaderCard({ member }: any) {
  return (
    <div className="bg-white rounded-sm p-6 text-center border border-gray-100 hover:border-picc-ochre/30 hover:shadow-lg transition-all">
      {member.photo_url ? (
        <img
          src={member.photo_url}
          alt={member.full_name}
          className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-warm-100"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-picc-ochre/30 to-picc-ochre mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
          {member.full_name?.charAt(0) || 'P'}
        </div>
      )}
      <h4 className="font-bold text-gray-900 mb-1">{member.full_name}</h4>
      <p className="text-sm text-picc-ochre font-medium mb-2">{member.position}</p>
      {member.bio && (
        <p className="text-xs text-gray-500 line-clamp-3 font-light">{member.bio}</p>
      )}
    </div>
  );
}

// ─── Financial data helper ───

async function fetchFinancialsForYear(year: number): Promise<FinancialData | null> {
  try {
    const supabase = await createServerComponentClient();
    const { data } = await (supabase as any)
      .from('annual_financials')
      .select('*')
      .eq('fiscal_year', year)
      .limit(1)
      .single();
    return data || null;
  } catch {
    return null;
  }
}

// ─── PDF Download Section (async server component) ───

async function PdfDownloadSection({ reportYear, fiscalYear, totalServices }: { reportYear: number; fiscalYear: string; totalServices: number }) {
  let pdf: { url: string; updatedAt: string } | null = null;
  try {
    const supabase = await createServerComponentClient();
    const fileName = `picc-annual-report-${reportYear - 1}-${String(reportYear).slice(-2)}.pdf`;
    const { data } = await (supabase as any).storage
      .from('reports')
      .createSignedUrl(fileName, 3600);

    if (data?.signedUrl) {
      const { data: files } = await (supabase as any).storage
        .from('reports')
        .list('', { search: fileName });
      const file = files?.find((f: any) => f.name === fileName);
      pdf = {
        url: data.signedUrl,
        updatedAt: file?.updated_at || file?.created_at || '',
      };
    }
  } catch {
    // PDF not available yet
  }

  return (
    <section className="py-24 md:py-32 bg-gradient-to-br from-picc-earth-600 to-picc-earth text-white print:hidden">
      <div className="max-w-4xl mx-auto px-8 text-center">
        <SectionTitle label="Download" title="Get the Full Report" light />

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-sm p-8 mb-10">
          <h3 className="text-xl font-medium mb-4">Report Includes:</h3>
          <div className="grid md:grid-cols-2 gap-4 text-left text-sm">
            {[
              'Real-time statistics and metrics',
              `All ${totalServices}+ service summaries`,
              'Featured community stories',
              'Financial statements and audits',
              'Leadership profiles',
              'Innovation project highlights',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-picc-ochre flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">&#10003;</span>
                </div>
                <span className="text-white/80">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          {pdf ? (
            <a
              href={pdf.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-4 bg-white text-picc-earth-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl inline-flex items-center gap-3"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </a>
          ) : (
            <Link
              href="/picc/report-generator"
              className="px-10 py-4 bg-white text-picc-earth-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl inline-flex items-center gap-3"
            >
              <Sparkles className="w-5 h-5" />
              Generate Report PDF
            </Link>
          )}
          <PrintButton />
        </div>

        {pdf?.updatedAt && (
          <p className="mt-4 text-sm text-white/50">
            Last generated: {new Date(pdf.updatedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}
      </div>
    </section>
  );
}
