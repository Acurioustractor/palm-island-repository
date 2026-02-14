import Link from 'next/link';
import {
  Users, Heart, Download, ArrowLeft,
  TrendingUp, Target, Award, Building2, Calendar, DollarSign,
  Activity, Sparkles, ExternalLink, MapPin, Camera
} from 'lucide-react';
import { BespokeIcon } from '@/components/ui/BespokeIcon';
import { createServerSupabase } from '@/lib/supabase/client';
import { FALLBACKS } from '@/lib/stats/current-stats';
import { getFeaturedStories } from '@/lib/stories/utils';
import { getHeroImage } from '@/lib/media/utils';
import { PhotoGallery } from '@/components/report';
import { ServicePinMap } from '@/components/report/ServicePinMap';
import LiveReportEditor from '@/components/report/LiveReportEditor';
import FinancialSummary, { type FinancialData } from '@/components/report/FinancialSummary';
import HighlightsShowcase, { type Highlight, type LeadershipMessage as HighlightLeaderMsg } from '@/components/report/HighlightsShowcase';
import ShareFooterButtons from '@/components/report/ShareFooterButtons';
import nextDynamic from 'next/dynamic';

const InteractiveServiceMap = nextDynamic(
  () => import('@/components/report/InteractiveServiceMap'),
  { ssr: false }
);

// This is a SERVER COMPONENT - fetches real-time data
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LiveAnnualReportPage({
  searchParams,
}: {
  searchParams?: { edit?: string; audience?: string }
}) {
  const supabase = createServerSupabase();

  const { currentFiscalYear, reportingPeriod, reportYear } = getCurrentFiscalYear();
  const editEnabled = process.env.NODE_ENV !== 'production' && searchParams?.edit === '1'
  const audience = (searchParams?.audience || 'public') as 'government' | 'indigenous' | 'public';

  // Fetch real-time data
  const [
    statsData,
    servicesData,
    projectsData,
    thisYearStories,
    fallbackFeaturedStories,
    leadershipData,
    heroImage,
    communityGallery,
    mapImage,
    boardGallery,
    financialsResult,
    previousFinancialsResult,
    highlightsResult,
    linkedStoriesResult,
  ] = await Promise.all([
    fetchCurrentYearStats(supabase),
    fetchAllServices(supabase),
    fetchInnovationProjects(supabase, reportYear),
    fetchThisYearStories(supabase, reportYear, 6),
    getFeaturedStories(8),
    fetchLeadership(supabase),
    getHeroImage('annual-report'),
    fetchCommunityGallery(supabase, currentFiscalYear, 18),
    fetchAnnualReportMapImage(supabase),
    fetchBoardGallery(supabase, currentFiscalYear, 12),
    fetchFinancials(supabase, reportYear),
    fetchFinancials(supabase, reportYear - 1),
    fetchHighlights(supabase, reportYear),
    fetchLinkedStories(supabase, reportYear),
  ]);

  // Prefer linked (curated) stories, then this-year stories, then featured fallback
  const stories = mergeUniqueById(
    linkedStoriesResult,
    mergeUniqueById(thisYearStories, fallbackFeaturedStories, 12),
    6
  );
  const storyIds = stories.map((s: any) => s.id).filter(Boolean);
  const storyImagesById = await fetchStoryImagesById(supabase, storyIds);
  // Also use featured_image_url from story records themselves
  for (const story of stories) {
    if (story.featured_image_url && !storyImagesById[story.id]) {
      storyImagesById[story.id] = story.featured_image_url;
    }
  }

  // Prepare highlights data with leadership messages
  const leadershipMessages: HighlightLeaderMsg[] = [
    ...leadershipData.executive.map((l: any) => ({
      id: l.id,
      full_name: l.full_name,
      position: l.position,
      leadership_type: 'executive',
      message_title: l.message_title || null,
      message_content: l.message_content || null,
      message_excerpt: l.message_excerpt || null,
      featured_quote: l.featured_quote || null,
      photo_url: l.photo_url || null,
    })),
    ...leadershipData.board.map((l: any) => ({
      id: l.id,
      full_name: l.full_name,
      position: l.position,
      leadership_type: 'board',
      message_title: l.message_title || null,
      message_content: l.message_content || null,
      message_excerpt: l.message_excerpt || null,
      featured_quote: l.featured_quote || null,
      photo_url: l.photo_url || null,
    })),
  ];

  // Fetch elder quotes for the quotes section
  const elderQuotes = await fetchElderQuotes(supabase, 6);

  return (
    <div className="min-h-screen bg-white">
      <LiveReportEditor
        enabled={editEnabled}
        reportYear={reportYear}
        fiscalYear={currentFiscalYear}
        heroImage={heroImage}
        mapImage={mapImage}
        boardImages={(boardGallery || []).map((m: any) => ({ id: m.id, public_url: m.public_url }))}
      />
      {/* Hero Section with Live Badge */}
      <section
        className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden"
        style={heroImage ? {
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
          {/* Live Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 rounded-full mb-6 animate-pulse">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-wide">Live Report</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-2xl">
            PICC Annual Report {currentFiscalYear}
          </h1>
          <p className="text-2xl md:text-3xl mb-6 font-light drop-shadow-lg">
            Real-Time Community Impact Dashboard
          </p>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 opacity-90">
            {reportingPeriod}
          </p>

          {/* Action Buttons */}
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
            <Link
              href="/annual-reports"
              className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all inline-flex items-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              View All Years
            </Link>
          </div>
        </div>

        {/* Back Button */}
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center gap-2 text-white hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Home</span>
        </Link>
      </section>

      {/* Real-Time Stats Banner */}
      <section className="bg-gradient-to-r from-picc-ochre to-picc-red text-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard
              icon={Users}
              value={statsData.totalStaff}
              label="Staff Members"
              change="+30% from 2023"
            />
            <StatCard
              icon={Building2}
              value={statsData.totalServices}
              label="Integrated Services"
              change="Holistic support"
            />
            <StatCard
              icon={Heart}
              value={statsData.communityReach}
              label="People Served"
              change="Island-wide impact"
            />
            <StatCard
              icon={TrendingUp}
              value={`$${(statsData.annualBudget / 1000000).toFixed(1)}M`}
              label="Annual Budget"
              change="Community investment"
            />
          </div>
        </div>
      </section>

      {/* Executive Summary */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">
            Executive Summary
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-700 leading-relaxed">
              The {currentFiscalYear} fiscal year represents a transformative period for the
              Palm Island Community Company. With {statsData.totalStaff} dedicated staff members
              delivering {statsData.totalServices}+ integrated services, we continue to strengthen
              our community-controlled approach to holistic wellbeing and self-determination.
            </p>
            <p className="text-xl text-gray-700 leading-relaxed mt-4">
              This live report showcases our ongoing commitment to transparency, innovation,
              and community empowerment. Every statistic, story, and achievement documented here
              reflects the collective strength of our people and our vision for a thriving future.
            </p>
          </div>
        </div>
      </section>

      {/* Highlights & Leadership Messages */}
      {(highlightsResult.length > 0 || leadershipMessages.some((l: any) => l.featured_quote || l.message_excerpt)) && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-warm-100 rounded-full mb-4">
                <Award className="w-5 h-5 text-picc-ochre" />
                <span className="text-sm font-semibold text-picc-ochre uppercase tracking-wide">Highlights</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Key Achievements & Messages
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Milestones and messages from our leadership team
              </p>
            </div>
            <HighlightsShowcase highlights={highlightsResult} leadership={leadershipMessages} />
          </div>
        </section>
      )}

      {/* All Services Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our {statsData.totalServices}+ Integrated Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive, culturally-informed support across every aspect of community life
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicesData.map((service: any, idx: number) => (
              <Link
                key={service.id}
                href={`/services/${service.slug || service.id}`}
                className="block"
              >
                <ServiceCard service={service} index={idx} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Innovation Projects */}
      <section id="projects" className="py-20 bg-gradient-to-br from-warm-50 to-warm-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-warm-100 rounded-full mb-4">
              <Sparkles className="w-5 h-5 text-picc-ochre" />
              <span className="text-sm font-semibold text-picc-ochre uppercase tracking-wide">Innovation</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Innovation Projects ({currentFiscalYear})
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real initiatives from the PICC backend: Photo Studio, Elders Trips, Storm Stories and more.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {projectsData.map((project: any) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/picc/projects"
              className="inline-flex items-center gap-2 px-8 py-4 bg-picc-ochre text-white rounded-full font-semibold text-lg hover:bg-picc-ochre transition-all"
            >
              View all projects
              <ExternalLink className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Community Stories Feed */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Community Voices
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real stories from real people making real impact
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.slice(0, 6).map((story: any) => (
              <StoryCard
                key={story.id}
                story={story}
                storyImage={storyImagesById[story.id]}
                isFeatured={story._is_featured}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full font-semibold text-lg hover:bg-gray-800 transition-all"
            >
              Read All Stories
              <ExternalLink className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Elder Quotes */}
      {elderQuotes.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-warm-50 to-warm-100">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Community Voices
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Words of wisdom from our Elders and community members
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {elderQuotes.map((quote: any) => (
                <div key={quote.id} className="bg-white rounded-2xl p-8 shadow-sm border border-picc-ochre-100 hover:shadow-lg transition-all">
                  <div className="flex items-start gap-4">
                    {quote.photo_url ? (
                      <img
                        src={quote.photo_url}
                        alt={quote.attribution || quote.speaker_name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-picc-ochre-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-picc-ochre-300 to-picc-ochre flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                        {(quote.attribution || quote.speaker_name || '?').charAt(0)}
                      </div>
                    )}
                    <div>
                      <blockquote className="text-gray-800 text-lg italic leading-relaxed mb-3">
                        &ldquo;{quote.quote_text || quote.text}&rdquo;
                      </blockquote>
                      <p className="text-picc-ochre font-semibold">
                        — {quote.attribution || quote.speaker_name}
                      </p>
                      {quote.theme && (
                        <span className="inline-block mt-2 px-3 py-1 bg-picc-ochre-100 text-picc-ochre rounded-full text-xs font-medium">
                          {quote.theme}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Community Photo Gallery (rotates every load) */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full mb-4">
              <Camera className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Community Photos</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Moments from {currentFiscalYear}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Pulled from the Media Library using tags (service, project, FY) and refreshed on every visit.
            </p>
          </div>

          {communityGallery.length > 0 ? (
            <PhotoGallery photos={communityGallery} layout="featured" columns={4} />
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <p className="text-gray-700 font-medium">No gallery images found yet.</p>
              <p className="text-gray-500 mt-1">
                Tag photos with <code className="bg-gray-100 px-1 rounded">annual-report</code> and <code className="bg-gray-100 px-1 rounded">fy:{currentFiscalYear}</code>
                in the Media Library.
              </p>
              <div className="mt-4">
                <Link href="/picc/media/gallery" className="text-picc-red hover:text-picc-red font-medium">
                  Open Media Gallery →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Service Map */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-warm-100 rounded-full mb-4">
              <MapPin className="w-5 h-5 text-picc-red" />
              <span className="text-sm font-semibold text-picc-red uppercase tracking-wide">Explore</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Service Map
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Click a service pin to see photos tagged to that service.
            </p>
          </div>

          <InteractiveServiceMap
            services={servicesData.map((s: any) => ({
              id: s.id,
              name: s.name,
              slug: s.slug,
              description: s.description,
              service_category: s.service_category,
              icon_name: s.icon_name,
              service_color: s.service_color,
              metadata: s.metadata,
              staff_count: s.service_metrics?.[0]?.staff_count || s.staff_count,
              clients_served: s.service_metrics?.[0]?.clients_served || s.clients_served,
              service_metrics: s.service_metrics,
            }))}
          />
        </div>
      </section>

      {/* Leadership & Board */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Leadership & Governance
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Community-elected leaders guiding our vision
            </p>
          </div>

          {/* Board of Directors */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Board of Directors
            </h3>

            {boardGallery.length > 0 && (
              <div className="mb-10">
                <PhotoGallery photos={boardGallery} layout="grid" columns={4} />
              </div>
            )}
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
              {leadershipData.board.map((member: any) => (
                <LeaderCard key={member.id} member={member} />
              ))}
            </div>
          </div>

          {/* Executive Team */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Executive Leadership Team
            </h3>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
              {leadershipData.executive.map((member: any) => (
                <LeaderCard key={member.id} member={member} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Financial Summary Section */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-sage-600" />
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Financial Summary
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transparent, accountable financial management
            </p>
          </div>

          {financialsResult ? (
            <FinancialSummary
              current={financialsResult}
              previous={previousFinancialsResult}
              fiscalYear={currentFiscalYear}
            />
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600 font-medium">Financial data not yet available for {currentFiscalYear}</p>
              <p className="text-gray-500 text-sm mt-1">
                Enter financial data in the admin dashboard to display it here.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Download PDF Section */}
      <PdfDownloadSection reportYear={reportYear} fiscalYear={currentFiscalYear} totalServices={statsData.totalServices} />

      {/* Audience-Specific Banner */}
      {audience !== 'public' && (
        <section className={`py-4 text-center text-sm font-medium ${
          audience === 'government'
            ? 'bg-picc-red text-white'
            : 'bg-picc-ochre text-white'
        }`}>
          {audience === 'government'
            ? 'Viewing: Government & Funders Perspective — Emphasis on accountability, compliance, and outcomes'
            : 'Viewing: Indigenous Organisations Perspective — Emphasis on self-determination and community control'}
        </section>
      )}

      {/* Share & Download Footer */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Share This Report</h3>
              <p className="text-gray-400">Help us celebrate our community&apos;s achievements</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ShareFooterButtons fiscalYear={currentFiscalYear} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Helper Components
function StatCard({ icon: Icon, value, label, change }: any) {
  return (
    <div className="text-center">
      <Icon className="w-8 h-8 mx-auto mb-2 opacity-90" />
      <div className="text-3xl md:text-4xl font-bold mb-1">{value}</div>
      <div className="text-sm font-medium opacity-90 mb-1">{label}</div>
      <div className="text-xs opacity-75">{change}</div>
    </div>
  );
}

function ServiceCard({ service, index }: any) {
  const iconName = getServiceIconName(service);
  return (
    <div
      className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-picc-ochre-300 hover:shadow-xl transition-all"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-stone-50 border border-stone-100">
        <BespokeIcon name={iconName} size={28} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
      <p className="text-gray-600 mb-4 line-clamp-3">{service.description}</p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-picc-ochre font-semibold">
          {service.staff_count || 0} staff
        </span>
        <span className="text-gray-500">
          {service.clients_served || 0} served
        </span>
      </div>
    </div>
  );
}

function ProjectCard({ project }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
      {project.hero_image_url && (
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <img
            src={project.hero_image_url}
            alt={project.name || project.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-8">
        <div className="flex items-start justify-between mb-4">
          <Target className="w-10 h-10 text-picc-ochre" />
          <span className="px-3 py-1 bg-warm-100 text-picc-ochre rounded-full text-sm font-semibold">
            {project.status || 'in_progress'}
          </span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{project.name || project.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{project.tagline || project.description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>Budget: {project.budget_total ? `$${Number(project.budget_total).toLocaleString()}` : 'TBD'}</span>
          <span>•</span>
          <span>{project.project_type || 'innovation'}</span>
        </div>
        {project.slug && (
          <div className="mt-6">
            <Link
              href={`/picc/projects/${project.slug}`}
              className="inline-flex items-center gap-2 text-picc-ochre hover:text-picc-earth-600 font-semibold"
            >
              View project
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        )}
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
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-picc-ochre-300 hover:shadow-xl transition-all">
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-picc-ochre-300 to-picc-ochre flex items-center justify-center text-white font-bold">
                {storytellerName.charAt(0)}
              </div>
            )}
            <div>
              <div className="font-semibold text-gray-900">{storytellerName}</div>
              <div className="text-sm text-gray-500">
                {story.category || 'Community Story'}
              </div>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-picc-ochre transition-colors">
            {story.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3">
            {excerpt ? `${excerpt}${String(story.content || '').length > excerpt.length ? '…' : ''}` : 'Read the full story →'}
          </p>
        </div>
      </div>
    </Link>
  );
}

function LeaderCard({ member }: any) {
  return (
    <div className="bg-white rounded-xl p-6 text-center border border-gray-100 hover:border-picc-ochre-300 hover:shadow-lg transition-all">
      {member.photo_url ? (
        <img
          src={member.photo_url}
          alt={member.full_name}
          className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-warm-100"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-picc-ochre-300 to-picc-ochre mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
          {member.full_name?.charAt(0) || 'P'}
        </div>
      )}
      <h4 className="font-bold text-gray-900 mb-1">{member.full_name}</h4>
      <p className="text-sm text-picc-ochre font-medium mb-2">{member.position}</p>
      {member.bio && (
        <p className="text-xs text-gray-600 line-clamp-3">{member.bio}</p>
      )}
    </div>
  );
}

// Data Fetching Functions
async function fetchCurrentYearStats(supabase: any) {
  // Fetch real current stats from database
  const { data: stats } = await supabase
    .from('organization_stats')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return {
    totalStaff: stats?.staff_count || FALLBACKS.staffCount,
    totalServices: stats?.service_count || FALLBACKS.serviceCount,
    communityReach: stats?.people_served || '3,000+',
    annualBudget: stats?.annual_budget || 45000000
  };
}

async function fetchAllServices(supabase: any) {
  const { data: services } = await supabase
    .from('organization_services')
    .select(`
      id, name, slug, description, service_category, icon_name, service_color, metadata,
      service_metrics (
        fiscal_year, clients_served, sessions_delivered, staff_count,
        key_achievement, headline_stat_value, headline_stat_label
      )
    `)
    .eq('is_active', true)
    .order('name');

  return services || [
    { id: 1, name: 'Child Safety Services', description: 'Protecting and nurturing our youngest community members', service_category: 'children', service_color: '#10b981', staff_count: 15, clients_served: 250 },
    { id: 2, name: 'Youth & Education', description: 'Empowering the next generation through learning', service_category: 'youth', service_color: '#3b82f6', staff_count: 22, clients_served: 400 },
    { id: 3, name: 'Health Services', description: 'Comprehensive primary healthcare and wellbeing', service_category: 'health', service_color: '#ef4444', staff_count: 35, clients_served: 2800 },
    { id: 4, name: 'Housing & Infrastructure', description: 'Safe, quality homes for all community members', service_category: 'housing', service_color: '#f59e0b', staff_count: 18, clients_served: 350 },
    { id: 5, name: 'Employment Services', description: 'Creating pathways to meaningful work', service_category: 'employment', service_color: '#8b5cf6', staff_count: 12, clients_served: 180 },
    { id: 6, name: 'Justice Support', description: 'Legal assistance and rehabilitation programs', service_category: 'justice', service_color: '#6366f1', staff_count: 8, clients_served: 120 },
    { id: 7, name: 'Family Support', description: 'Strengthening family connections and wellbeing', service_category: 'family', service_color: '#ec4899', staff_count: 14, clients_served: 200 },
    { id: 8, name: 'Elder Care', description: 'Honoring and supporting our elders', service_category: 'aged', service_color: '#14b8a6', staff_count: 10, clients_served: 85 },
    { id: 9, name: 'Cultural Programs', description: 'Preserving and celebrating our heritage', service_category: 'culture', service_color: '#f97316', staff_count: 9, clients_served: 500 },
    { id: 10, name: 'Sport & Recreation', description: 'Promoting health through active lifestyles', service_category: 'sport', service_color: '#06b6d4', staff_count: 11, clients_served: 600 },
    { id: 11, name: 'Mental Health', description: 'Culturally-informed counseling and support', service_category: 'mental', service_color: '#10b981', staff_count: 13, clients_served: 220 },
    { id: 12, name: 'Disability Services', description: 'Inclusive support for all abilities', service_category: 'disability', service_color: '#8b5cf6', staff_count: 10, clients_served: 90 },
    { id: 13, name: 'Community Safety', description: 'Creating a secure environment for all', service_category: 'safety', service_color: '#dc2626', staff_count: 16, clients_served: 3000 },
    { id: 14, name: 'Environmental Programs', description: 'Caring for country and sustainability', service_category: 'environment', service_color: '#22c55e', staff_count: 7, clients_served: 1000 },
    { id: 15, name: 'Economic Development', description: 'Building financial independence', service_category: 'economic', service_color: '#eab308', staff_count: 9, clients_served: 150 },
    { id: 16, name: 'Governance & Admin', description: 'Community-led decision making', service_category: 'governance', service_color: '#6366f1', staff_count: 18, clients_served: 3000 },
  ];
}

function getServiceIconName(service: any): import('@/components/ui/BespokeIcon').BespokeIconName {
  const category = String(service?.service_category || '').toLowerCase()
  const iconName = String(service?.icon_name || '').toLowerCase()
  if (iconName.includes('heart') || category.includes('health')) return 'health'
  if (iconName.includes('users') || category.includes('youth')) return 'youth'
  if (category.includes('family')) return 'family'
  if (iconName.includes('star') || category.includes('culture')) return 'culture'
  if (iconName.includes('home') || category.includes('housing')) return 'housing'
  if (iconName.includes('shield') || category.includes('safety')) return 'crisis'
  if (iconName.includes('briefcase') || category.includes('employment')) return 'economic'
  if (iconName.includes('graduation') || category.includes('education')) return 'education'
  if (category.includes('justice')) return 'justice'
  if (category.includes('elder') || category.includes('aged')) return 'aged-care'
  if (category.includes('mental')) return 'mental-health'
  if (category.includes('sport')) return 'sport'
  if (category.includes('disab')) return 'disability'
  if (category.includes('governance')) return 'governance'
  if (category.includes('digital')) return 'digital'
  return 'community'
}

async function fetchInnovationProjects(supabase: any, reportYear: number) {
  const { startDate } = getFiscalYearBounds(reportYear);

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, slug, tagline, description, status, project_type, hero_image_url, budget_total, start_date, target_completion_date, created_at, featured')
    .eq('is_public', true)
    .in('project_type', ['innovation', 'infrastructure', 'cultural', 'research', 'other'])
    .neq('status', 'archived')
    // Prefer current FY projects, but keep featured items even if older.
    .or(`created_at.gte.${startDate},featured.eq.true`)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(6);

  return projects || [
    {
      id: 1,
      title: 'Digital Empathy Ledger',
      description: 'AI-powered knowledge management system capturing community stories, impact data, and cultural knowledge in a secure, community-controlled platform.',
      status: 'Active',
      budget: 450000,
      timeline: '2024-26'
    },
    {
      id: 2,
      title: 'Smart Media Management',
      description: 'Automated photo/video organization system with AI tagging, cultural protocols, and intelligent placement across digital platforms.',
      status: 'Active',
      budget: 180000,
      timeline: '2024-25'
    },
    {
      id: 3,
      title: 'Youth Digital Academy',
      description: 'Technology training and certification program preparing young people for digital economy careers while preserving cultural identity.',
      status: 'Planning',
      budget: 320000,
      timeline: '2025-27'
    },
    {
      id: 4,
      title: 'Renewable Energy Initiative',
      description: 'Solar microgrid installation reducing energy costs while creating local green jobs and environmental stewardship.',
      status: 'Active',
      budget: 2500000,
      timeline: '2024-28'
    },
  ];
}

async function fetchThisYearStories(supabase: any, reportYear: number, limit: number) {
  const { startDate, endDate } = getFiscalYearBounds(reportYear)

  const { data } = await supabase
    .from('stories')
    .select(
      `
      *,
      storyteller:storyteller_id (
        id,
        full_name,
        preferred_name,
        is_elder,
        is_cultural_advisor,
        profile_image_url
      )
    `
    )
    .eq('is_public', true)
    .eq('status', 'published')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('total_score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(Math.max(1, limit))

  return (data || []) as any[]
}

async function fetchBoardGallery(supabase: any, fiscalYear: string, limit: number) {
  const { data } = await supabase
    .from('media_files')
    .select('id, public_url, title, caption, alt_text, tags, file_type, is_public, deleted_at, created_at')
    .eq('is_public', true)
    .is('deleted_at', null)
    .eq('file_type', 'image')
    .overlaps('tags', ['board', 'annual-report', `fy:${fiscalYear}`])
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(80)

  const picked = sample((data || []) as any[], limit)
  return picked.map((img) => ({
    url: img.public_url,
    caption: img.caption || img.title || img.alt_text || undefined,
    category: 'Board',
  }))
}

function mergeUniqueById(primary: any[], fallback: any[], limit: number) {
  const out: any[] = []
  const seen = new Set<string>()

  for (const s of primary || []) {
    if (!s?.id) continue
    if (seen.has(s.id)) continue
    seen.add(s.id)
    out.push(s)
    if (out.length >= limit) return out
  }

  for (const s of fallback || []) {
    if (!s?.id) continue
    if (seen.has(s.id)) continue
    seen.add(s.id)
    out.push(s)
    if (out.length >= limit) return out
  }

  return out
}

async function fetchStoryImagesById(supabase: any, storyIds: string[]) {
  const map: Record<string, string> = {}
  if (!storyIds || storyIds.length === 0) return map

  const { data } = await supabase
    .from('media_files')
    .select('story_id, public_url, is_featured, created_at, deleted_at, is_public, file_type')
    .in('story_id', storyIds)
    .eq('is_public', true)
    .is('deleted_at', null)
    .eq('file_type', 'image')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(200)

  for (const row of (data || []) as any[]) {
    const sid = row.story_id as string | null
    if (!sid) continue
    if (!map[sid]) map[sid] = row.public_url
  }

  return map
}

async function fetchCommunityGallery(supabase: any, fiscalYear: string, limit: number) {
  const primaryTags = ['annual-report', `fy:${fiscalYear}`]

  const candidates = await fetchMediaCandidates(supabase, primaryTags, 180)
  const fallbackCandidates =
    candidates.length > 0
      ? []
      : await fetchMediaCandidates(supabase, ['community', 'event', 'culture', 'youth', 'health'], 180)

  const pool = candidates.length > 0 ? candidates : fallbackCandidates
  const picked = sample(pool, limit)

  return picked.map((img) => ({
    url: img.public_url,
    caption: img.caption || img.title || img.alt_text || undefined,
    category: pickNiceCategory(img.tags),
  }))
}

async function fetchMediaCandidates(supabase: any, tags: string[], limit: number) {
  const { data } = await supabase
    .from('media_files')
    .select('id, public_url, title, caption, alt_text, tags, file_type, is_public, deleted_at, created_at')
    .eq('is_public', true)
    .is('deleted_at', null)
    .eq('file_type', 'image')
    .overlaps('tags', tags)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data || []) as any[]
}

function sample<T>(items: T[], count: number) {
  const arr = items.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
  return arr.slice(0, Math.max(0, count))
}

function pickNiceCategory(tags: any) {
  const list = Array.isArray(tags) ? tags : []
  const ignore = (t: string) =>
    t === 'annual-report' ||
    t.startsWith('fy:') ||
    t.startsWith('service:') ||
    t.startsWith('project:')

  const candidate = list.find((t: string) => typeof t === 'string' && !ignore(t))
  return candidate || undefined
}

async function fetchAnnualReportMapImage(supabase: any) {
  const { data } = await supabase
    .from('media_files')
    .select('public_url')
    .eq('is_public', true)
    .is('deleted_at', null)
    .eq('page_context', 'annual-report')
    .eq('page_section', 'map')
    .eq('file_type', 'image')
    .order('is_featured', { ascending: false })
    .order('display_order', { ascending: true })
    .limit(1)
    .single()

  return (data as any)?.public_url || null
}

function getFiscalYearBounds(reportYear: number) {
  const startYear = reportYear - 1
  const startDate = `${startYear}-07-01`
  const endDate = `${reportYear}-06-30`
  return { startDate, endDate }
}

function getCurrentFiscalYear() {
  const now = new Date()
  const startYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
  const endYear = startYear + 1
  const currentFiscalYear = `${startYear}-${String(endYear).slice(-2)}`
  const reportYear = endYear
  const reportingPeriod = `July 1, ${startYear} - June 30, ${endYear}`
  return { currentFiscalYear, reportingPeriod, reportYear }
}

async function fetchElderQuotes(supabase: any, limit: number) {
  // Try extracted_quotes with photos (include non-validated that have real story photos)
  const { data: extracted } = await supabase
    .from('extracted_quotes')
    .select('id, quote_text, attribution, photo_url, theme, impact_area')
    .not('photo_url', 'is', null)
    .not('used_in_report_id', 'is', null)
    .order('display_order', { ascending: true })
    .limit(limit)

  if (extracted && extracted.length >= 3) return extracted

  // Fallback to elder_quotes table
  const { data: elder } = await supabase
    .from('elder_quotes')
    .select('id, text, speaker_name, speaker_role, theme, category')
    .eq('permission_level', 'public')
    .order('created_at', { ascending: false })
    .limit(limit)

  return (elder || []).map((q: any) => ({
    id: q.id,
    quote_text: q.text,
    attribution: q.speaker_name,
    theme: q.theme || q.category,
    photo_url: null,
  }))
}

async function fetchLeadership(supabase: any) {
  const { data: allLeaders } = await supabase
    .from('leadership')
    .select('*')
    .eq('is_active', true)
    .order('position_order');

  const board = (allLeaders || []).filter((l: any) => l.leadership_type === 'board');
  const executive = (allLeaders || []).filter((l: any) => l.leadership_type === 'executive');

  // Fallback data if database is empty
  if (board.length === 0 && executive.length === 0) {
    return {
      board: [
        { id: 1, full_name: 'Board Chair', position: 'Chairperson', bio: 'Leading community governance' },
        { id: 2, full_name: 'Deputy Chair', position: 'Deputy Chairperson', bio: 'Supporting strategic direction' },
        { id: 3, full_name: 'Board Member', position: 'Director', bio: 'Community representative' },
        { id: 4, full_name: 'Board Member', position: 'Director', bio: 'Community representative' },
      ],
      executive: [
        { id: 5, full_name: 'Rachel Atkinson', position: 'Chief Executive Officer', bio: 'Leading organizational vision and strategy' },
        { id: 6, full_name: 'Executive Member', position: 'Chief Operations Officer', bio: 'Managing daily operations' },
        { id: 7, full_name: 'Executive Member', position: 'Chief Financial Officer', bio: 'Financial stewardship' },
        { id: 8, full_name: 'Executive Member', position: 'Director of Services', bio: 'Service delivery oversight' },
      ]
    };
  }

  return { board, executive };
}

async function fetchFinancials(supabase: any, year: number): Promise<FinancialData | null> {
  const { data } = await supabase
    .from('annual_financials')
    .select('*')
    .eq('fiscal_year', year)
    .limit(1)
    .single();

  return data || null;
}

async function fetchHighlights(supabase: any, reportYear: number): Promise<Highlight[]> {
  // Get the report ID for this year
  const { data: report } = await supabase
    .from('annual_reports')
    .select('id')
    .eq('report_year', reportYear)
    .limit(1)
    .single();

  if (!report?.id) return [];

  const { data } = await supabase
    .from('report_highlights')
    .select('id, title, subtitle, description, impact_achieved, highlight_type, is_featured, display_order, display_style, metrics')
    .eq('report_id', report.id)
    .order('display_order');

  return (data || []) as Highlight[];
}

async function fetchLinkedStories(supabase: any, reportYear: number): Promise<any[]> {
  // Get annual report for this year
  const { data: report } = await supabase
    .from('annual_reports')
    .select('id')
    .eq('report_year', reportYear)
    .limit(1)
    .single();

  if (!report?.id) return [];

  // Fetch linked stories via junction table
  const { data: links } = await supabase
    .from('annual_report_stories')
    .select(`
      story_id,
      is_featured,
      display_order,
      section_placement,
      story:stories (
        *,
        storyteller:storyteller_id (
          id, full_name, preferred_name, is_elder, is_cultural_advisor, profile_image_url
        )
      )
    `)
    .eq('report_id', report.id)
    .order('display_order');

  if (!links || links.length === 0) return [];

  return links
    .filter((link: any) => link.story)
    .map((link: any) => ({
      ...link.story,
      _is_featured: link.is_featured,
      _section: link.section_placement,
      _display_order: link.display_order,
    }));
}

async function fetchPdfUrl(reportYear: number): Promise<{ url: string; updatedAt: string } | null> {
  try {
    const supabase = (await import('@/lib/supabase/client')).createServerSupabase();
    const fileName = `picc-annual-report-${reportYear - 1}-${String(reportYear).slice(-2)}.pdf`;

    const { data } = await supabase.storage
      .from('reports')
      .createSignedUrl(fileName, 3600); // 1 hour

    if (data?.signedUrl) {
      // Get metadata for last modified
      const { data: files } = await supabase.storage
        .from('reports')
        .list('', { search: fileName });

      const file = files?.find((f: any) => f.name === fileName);
      return {
        url: data.signedUrl,
        updatedAt: file?.updated_at || file?.created_at || '',
      };
    }
  } catch {
    // PDF not available yet
  }
  return null;
}

async function PdfDownloadSection({ reportYear, fiscalYear, totalServices }: { reportYear: number; fiscalYear: string; totalServices: number }) {
  const pdf = await fetchPdfUrl(reportYear);

  return (
    <section className="py-20 bg-gradient-to-br from-picc-earth-600 to-picc-earth text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <Download className="w-16 h-16 mx-auto mb-6" />
        <h2 className="text-4xl font-bold mb-6">
          Download Annual Report
        </h2>
        <p className="text-xl mb-8 opacity-90">
          A beautifully designed PDF with all data, stories, and financials
          from the {fiscalYear} reporting period.
        </p>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-8">
          <h3 className="text-2xl font-bold mb-4">Report Includes:</h3>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            {[
              'Real-time statistics and metrics',
              `All ${totalServices}+ service summaries`,
              'Featured community stories',
              'Financial statements and audits',
              'Leadership profiles',
              'Innovation project highlights',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-sage-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">&#10003;</span>
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {pdf ? (
          <div>
            <a
              href={pdf.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-12 py-5 bg-white text-picc-earth-600 rounded-full font-bold text-xl hover:bg-gray-100 transition-all shadow-2xl inline-flex items-center gap-3"
            >
              <Download className="w-6 h-6" />
              Download Annual Report PDF
            </a>
            {pdf.updatedAt && (
              <p className="mt-4 text-sm opacity-75">
                Last generated: {new Date(pdf.updatedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        ) : (
          <div>
            <Link
              href="/picc/report-generator"
              className="px-12 py-5 bg-white text-picc-earth-600 rounded-full font-bold text-xl hover:bg-gray-100 transition-all shadow-2xl inline-flex items-center gap-3"
            >
              <Sparkles className="w-6 h-6" />
              Generate Report PDF
            </Link>
            <p className="mt-4 text-sm opacity-75">
              PDF not yet generated for {fiscalYear}. Use the report generator to create one.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
