import Link from 'next/link';
import { Suspense } from 'react';
import {
  Users, Briefcase, Heart, Download, Share2, FileText, ArrowLeft,
  TrendingUp, Target, Award, Building2, Calendar, DollarSign,
  BarChart3, Activity, Sparkles, ExternalLink
} from 'lucide-react';
import { createServerComponentClient } from '@/lib/supabase/server';
import { getRecentStories, getFeaturedStories } from '@/lib/stories/utils';
import { getHeroImage, getPageMedia } from '@/lib/media/utils';

// This is a SERVER COMPONENT - fetches real-time data
export default async function LiveAnnualReportPage() {
  const supabase = await createServerComponentClient();

  // Fetch real-time data
  const [
    statsData,
    servicesData,
    projectsData,
    featuredStories,
    leadershipData,
    heroImage
  ] = await Promise.all([
    fetchCurrentYearStats(supabase),
    fetchAllServices(supabase),
    fetchInnovationProjects(supabase),
    getFeaturedStories(6),
    fetchLeadership(supabase),
    getHeroImage('annual-report')
  ]);

  const currentFiscalYear = '2024-25';
  const reportingPeriod = 'July 1, 2024 - June 30, 2025';

  return (
    <div className="min-h-screen bg-white">
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
            <button className="px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all shadow-2xl inline-flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download PDF
            </button>
            <button className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all inline-flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Generate Full Report
            </button>
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
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-8">
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
            {servicesData.map((service, idx) => (
              <ServiceCard key={service.id} service={service} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* Innovation Projects */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Innovation</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Transformative Projects
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Leading-edge initiatives driving positive change
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {projectsData.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
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
            {featuredStories.slice(0, 6).map((story: any) => (
              <StoryCard key={story.id} story={story} />
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
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
              {leadershipData.board.map((member) => (
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
              {leadershipData.executive.map((member) => (
                <LeaderCard key={member.id} member={member} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Financial Documents Section */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Financial Reports & Documents
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transparent, audited financial documentation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FinancialDocCard
              title="Annual Financial Statement"
              description="Comprehensive financial overview for FY {currentFiscalYear}"
              icon={FileText}
              fileSize="2.4 MB"
              downloadUrl="/documents/financials/picc-financial-statement-2024-25.pdf"
            />
            <FinancialDocCard
              title="Auditor's Report"
              description="Independent audit report by Ernst & Young"
              icon={Award}
              fileSize="1.8 MB"
              downloadUrl="/documents/financials/picc-audit-report-2024-25.pdf"
            />
            <FinancialDocCard
              title="Budget Breakdown"
              description="Detailed service-by-service budget allocation"
              icon={BarChart3}
              fileSize="1.2 MB"
              downloadUrl="/documents/financials/picc-budget-breakdown-2024-25.pdf"
            />
            <FinancialDocCard
              title="Impact Metrics Report"
              description="Quantified community outcomes and ROI analysis"
              icon={TrendingUp}
              fileSize="3.1 MB"
              downloadUrl="/documents/financials/picc-impact-metrics-2024-25.pdf"
            />
          </div>
        </div>
      </section>

      {/* PDF Generation Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-6">
            Generate Complete Annual Report
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Create a beautifully designed, professionally formatted PDF report
            with all current data, stories, and financials.
          </p>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold mb-4">Report Includes:</h3>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span>Real-time statistics and metrics</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span>All {statsData.totalServices}+ service summaries</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span>Featured community stories</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span>Financial statements and audits</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span>Leadership profiles</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span>Innovation project highlights</span>
              </div>
            </div>
          </div>

          <button className="px-12 py-5 bg-white text-purple-900 rounded-full font-bold text-xl hover:bg-gray-100 transition-all shadow-2xl inline-flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            Generate Full Report PDF
            <span className="text-sm opacity-75">(Coming Soon)</span>
          </button>

          <p className="mt-6 text-sm opacity-75">
            Integration with Figma/Canva for automated report generation
          </p>
        </div>
      </section>

      {/* Share & Download Footer */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Share This Report</h3>
              <p className="text-gray-400">Help us celebrate our community's achievements</p>
            </div>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full inline-flex items-center gap-2 transition-all">
                <Share2 className="w-5 h-5" />
                Share
              </button>
              <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-full inline-flex items-center gap-2 transition-all">
                <Download className="w-5 h-5" />
                Download Report
              </button>
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
  return (
    <div
      className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-purple-300 hover:shadow-xl transition-all"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
        style={{ backgroundColor: service.service_color || '#6366f1' }}
      >
        <span className="text-2xl">
          {service.icon || '🏢'}
        </span>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
      <p className="text-gray-600 mb-4 line-clamp-3">{service.description}</p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-purple-600 font-semibold">
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
      <div className="p-8">
        <div className="flex items-start justify-between mb-4">
          <Target className="w-10 h-10 text-purple-600" />
          <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold">
            {project.status || 'Active'}
          </span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{project.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>Budget: ${project.budget?.toLocaleString() || 'TBD'}</span>
          <span>•</span>
          <span>{project.timeline || '2024-25'}</span>
        </div>
      </div>
    </div>
  );
}

function StoryCard({ story }: any) {
  const storytellerName = story.storyteller?.preferred_name || story.storyteller?.full_name || 'Community Member';

  return (
    <Link href={`/stories/${story.id}`} className="group block">
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-purple-300 hover:shadow-xl transition-all">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center text-white font-bold">
              {storytellerName.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{storytellerName}</div>
              <div className="text-sm text-gray-500">
                {story.category || 'Community Story'}
              </div>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {story.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3">{story.summary}</p>
        </div>
      </div>
    </Link>
  );
}

function LeaderCard({ member }: any) {
  return (
    <div className="bg-white rounded-xl p-6 text-center border border-gray-100 hover:border-purple-300 hover:shadow-lg transition-all">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
        {member.full_name?.charAt(0) || 'P'}
      </div>
      <h4 className="font-bold text-gray-900 mb-1">{member.full_name}</h4>
      <p className="text-sm text-purple-600 font-medium mb-2">{member.position}</p>
      {member.bio && (
        <p className="text-xs text-gray-600 line-clamp-3">{member.bio}</p>
      )}
    </div>
  );
}

function FinancialDocCard({ title, description, icon: Icon, fileSize, downloadUrl }: any) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-green-400 hover:shadow-lg transition-all group">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-green-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
            {title}
          </h4>
          <p className="text-sm text-gray-600 mb-3">{description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{fileSize}</span>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-all">
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      </div>
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
    totalStaff: stats?.staff_count || 197,
    totalServices: stats?.service_count || 16,
    communityReach: stats?.people_served || '3,000+',
    annualBudget: stats?.annual_budget || 45000000
  };
}

async function fetchAllServices(supabase: any) {
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('name');

  return services || [
    { id: 1, name: 'Child Safety Services', description: 'Protecting and nurturing our youngest community members', icon: '👶', service_color: '#10b981', staff_count: 15, clients_served: 250 },
    { id: 2, name: 'Youth & Education', description: 'Empowering the next generation through learning', icon: '🎓', service_color: '#3b82f6', staff_count: 22, clients_served: 400 },
    { id: 3, name: 'Health Services', description: 'Comprehensive primary healthcare and wellbeing', icon: '🏥', service_color: '#ef4444', staff_count: 35, clients_served: 2800 },
    { id: 4, name: 'Housing & Infrastructure', description: 'Safe, quality homes for all community members', icon: '🏠', service_color: '#f59e0b', staff_count: 18, clients_served: 350 },
    { id: 5, name: 'Employment Services', description: 'Creating pathways to meaningful work', icon: '💼', service_color: '#8b5cf6', staff_count: 12, clients_served: 180 },
    { id: 6, name: 'Justice Support', description: 'Legal assistance and rehabilitation programs', icon: '⚖️', service_color: '#6366f1', staff_count: 8, clients_served: 120 },
    { id: 7, name: 'Family Support', description: 'Strengthening family connections and wellbeing', icon: '👨‍👩‍👧‍👦', service_color: '#ec4899', staff_count: 14, clients_served: 200 },
    { id: 8, name: 'Elder Care', description: 'Honoring and supporting our elders', icon: '🌳', service_color: '#14b8a6', staff_count: 10, clients_served: 85 },
    { id: 9, name: 'Cultural Programs', description: 'Preserving and celebrating our heritage', icon: '🎨', service_color: '#f97316', staff_count: 9, clients_served: 500 },
    { id: 10, name: 'Sport & Recreation', description: 'Promoting health through active lifestyles', icon: '⚽', service_color: '#06b6d4', staff_count: 11, clients_served: 600 },
    { id: 11, name: 'Mental Health', description: 'Culturally-informed counseling and support', icon: '💚', service_color: '#10b981', staff_count: 13, clients_served: 220 },
    { id: 12, name: 'Disability Services', description: 'Inclusive support for all abilities', icon: '♿', service_color: '#8b5cf6', staff_count: 10, clients_served: 90 },
    { id: 13, name: 'Community Safety', description: 'Creating a secure environment for all', icon: '🛡️', service_color: '#dc2626', staff_count: 16, clients_served: 3000 },
    { id: 14, name: 'Environmental Programs', description: 'Caring for country and sustainability', icon: '🌿', service_color: '#22c55e', staff_count: 7, clients_served: 1000 },
    { id: 15, name: 'Economic Development', description: 'Building financial independence', icon: '📈', service_color: '#eab308', staff_count: 9, clients_served: 150 },
    { id: 16, name: 'Governance & Admin', description: 'Community-led decision making', icon: '🏛️', service_color: '#6366f1', staff_count: 18, clients_served: 3000 },
  ];
}

async function fetchInnovationProjects(supabase: any) {
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'active')
    .eq('is_innovation', true)
    .order('created_at', { ascending: false })
    .limit(4);

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
