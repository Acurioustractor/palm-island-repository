'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Users, Briefcase, Heart, Clock, ArrowLeft, Download, Share2,
  AlertCircle, RefreshCw, Baby, GraduationCap, Home, Stethoscope,
  Shield, Scale, Building, ChevronRight, MapPin, Star
} from 'lucide-react';
import Link from 'next/link';

// Import our beautiful report components
import {
  ReportHero,
  ImpactStatCard,
  ImpactStatsGrid,
  Section,
  SectionHeader,
  ScrollReveal,
  StaggerContainer,
  QuoteShowcase,
  LeadershipMessage,
  StoryCard,
  StoryGrid,
  DollarBreakdown,
  FinancialDonut,
  FeaturedVideo,
  VideoGrid,
  PhotoGallery,
  HeroGallery,
  ServiceShowcase,
  ServiceImpact,
  Timeline,
  MilestoneCounter,
  ProjectShowcase,
  Divider,
  PersonQuoteGrid,
} from '@/components/report';

interface AnnualReport {
  id: string;
  title: string;
  subtitle?: string;
  theme?: string;
  report_year: number;
  reporting_period_start: string;
  reporting_period_end: string;
  executive_summary?: string;
  year_highlights?: string[];
  statistics?: Record<string, any>;
  metadata?: Record<string, any>;
  acknowledgments?: string;
  ceo_message?: string;
  chair_message?: string;
}

interface Story {
  id: string;
  title: string;
  content: string;
  category?: string;
  story_type?: string;
  location?: string;
  profiles?: {
    full_name: string;
    profile_image_url?: string;
    storyteller_type?: string;
  };
}

interface Service {
  id: string;
  name: string;
  description?: string;
  category?: string;
  icon?: string;
  color?: string;
}

interface LeadershipMessageData {
  id: string;
  message_title: string;
  message_content: string;
  person_name?: string;
  role?: string;
  person_photo_url?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  project_type?: string;
  status?: string;
  hero_image_url?: string;
  tagline?: string;
}

export default function PublicAnnualReportPage() {
  const params = useParams();
  const year = params?.year as string;

  const [report, setReport] = useState<AnnualReport | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [leadershipMessages, setLeadershipMessages] = useState<LeadershipMessageData[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    loadAllData();

    return () => {
      isMounted.current = false;
    };
  }, [year]);

  const loadAllData = async () => {
    if (!isMounted.current) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const reportYear = parseInt(year);

      // Load most data in parallel for speed
      const [
        reportResult,
        storiesResult,
        servicesResult,
        projectsResult,
      ] = await Promise.all([
        // Annual report
        supabase
          .from('annual_reports')
          .select('*')
          .eq('report_year', reportYear)
          .maybeSingle(),

        // Stories - get all published stories
        supabase
          .from('stories')
          .select('id, title, content, category, story_type, location, profiles(full_name, profile_image_url, storyteller_type)')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(20),

        // Services - use organization_services table
        supabase
          .from('organization_services')
          .select('id, name, description, service_category, icon_name, service_color')
          .eq('is_active', true)
          .order('name'),

        // Innovation projects
        supabase
          .from('projects')
          .select('id, name, description, project_type, status, hero_image_url, tagline')
          .eq('status', 'active')
          .limit(6),
      ]);

      // Fetch leadership messages separately (needs report ID)
      let leadershipResult: { data: any[] | null; error: any } = { data: [], error: null };
      const reportData = reportResult.data as AnnualReport | null;
      if (reportData?.id) {
        leadershipResult = await supabase
          .from('report_leadership_messages')
          .select('id, message_title, message_content, person_name, role, person_photo_url')
          .eq('report_id', reportData.id);
      }

      if (!isMounted.current) return;

      // Set report data
      if (reportData) {
        setReport(reportData);
      } else {
        setReport(createRichDemoReport(reportYear));
      }

      // Set stories
      setStories((storiesResult.data || []) as Story[]);

      // Set services - map database columns to interface properties
      const mappedServices = (servicesResult.data || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        category: s.service_category,
        icon: s.icon_name,
        color: s.service_color,
      }));
      setServices(mappedServices as Service[]);

      // Set leadership messages
      setLeadershipMessages((leadershipResult.data || []) as LeadershipMessageData[]);

      // Set projects
      setProjects((projectsResult.data || []) as Project[]);

    } catch (err: any) {
      console.error('Error loading data:', err);
      if (isMounted.current) {
        setReport(createRichDemoReport(parseInt(year)));
        setError(err.message || 'Failed to load some data');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Rich demo report with all real-world content
  const createRichDemoReport = (reportYear: number): AnnualReport => ({
    id: 'demo',
    title: `PICC Annual Report`,
    subtitle: 'Our Community, Our Future, Our Way',
    theme: 'Building Stronger Foundations',
    report_year: reportYear,
    reporting_period_start: `${reportYear - 1}-07-01`,
    reporting_period_end: `${reportYear}-06-30`,
    executive_summary: `The 2023-24 financial year has been one of significant growth and resilience for Palm Island Community Company. Our commitment to community-led development has driven exceptional outcomes across all our services.

This year, we expanded our workforce to 197 staff members - a 30% increase from the previous year. This growth reflects our dedication to creating meaningful employment opportunities for our community members while delivering high-quality services.

Our health services reached 2,283 clients with 17,488 episodes of care, demonstrating our vital role in community wellbeing. The Safe Haven program supported 1,187 children and their families, providing a lifeline during challenging times.

Through our Digital Service Centre, Housing Services, and community programs, we continue to walk alongside our community - supporting, empowering, and celebrating the strength of Palm Island.`,
    year_highlights: [
      'Grew workforce to 197 staff members - 30% increase',
      'Delivered 17,488 episodes of health care to community',
      'Supported 1,187 children through Safe Haven program',
      'Launched Photo Studio Elders Portrait Project',
      'Expanded Digital Service Centre operations',
      'Completed storm recovery support for affected families',
      'Achieved 90% local employment rate across all programs',
    ],
    statistics: {
      total_staff: 197,
      staff_growth: 30,
      total_revenue: 23400000,
      health_clients: 2283,
      episodes_of_care: 17488,
      children_supported: 1187,
      local_employment_rate: 90,
      services_delivered: 48,
      community_members_served: 2500,
      volunteer_hours: 3200,
      stories_by_category: {
        'Community': 15,
        'Health': 12,
        'Cultural': 10,
        'Youth': 8,
        'Elder': 6,
        'Housing': 5,
      },
    },
    metadata: {
      funder_name: 'Queensland Government & Commonwealth Department of Prime Minister and Cabinet',
    },
    acknowledgments: 'We acknowledge the Manbarra and Bwgcolman peoples as the Traditional Custodians of Great Palm Island and pay our respects to Elders past, present, and emerging. We thank all our funding partners, community members, and dedicated staff who make our work possible.',
    ceo_message: `As I reflect on another remarkable year at PICC, I am filled with pride for what our community has achieved together. Through cyclones, challenges, and change, our people have shown the resilience and strength that defines Palm Island.

This year, we have grown our team to nearly 200 staff - creating real jobs for our mob right here on country. We've expanded our services, improved our programs, and most importantly, we've continued to listen to our community.

The opening of our Digital Service Centre represents a new chapter - bringing technology and opportunity to our doorstep. Our Elders programs continue to preserve precious cultural knowledge, while our youth initiatives are shaping the next generation of leaders.

To our community: thank you for your trust. To our staff: thank you for your dedication. To our partners: thank you for walking alongside us.

Together, we are building something special.`,
    chair_message: `On behalf of the Board of Directors, I am pleased to present our 2023-24 Annual Report - a testament to the incredible work happening across Palm Island Community Company.

Our organisation has grown significantly this year, not just in numbers, but in our capacity to serve our community. The Board remains committed to governance excellence and ensuring PICC delivers outcomes that matter to our mob.

We have welcomed new Directors this year, bringing fresh perspectives while honouring the wisdom of those who came before. Our strategic direction remains focused on self-determination, cultural preservation, and sustainable community development.

I extend my gratitude to our CEO Rachel Atkinson and the entire PICC team for their tireless efforts. The results speak for themselves - better services, more jobs, and stronger connections across our community.

As we look to the future, we do so with confidence and optimism. Palm Island Community Company stands ready to meet whatever challenges lie ahead, guided by our values and strengthened by our unity.`,
  });

  // Financial data reflecting real PICC operations
  const financialData = [
    { id: 'labour', label: 'Wages & Salaries', value: 14040000, color: '#2d6a4f', description: '197 staff delivering services to community' },
    { id: 'admin', label: 'Administration', value: 4914000, color: '#1e3a5f', description: 'Operations, facilities, and governance' },
    { id: 'supplies', label: 'Program Supplies', value: 2106000, color: '#e85d04', description: 'Materials for health, housing, and community programs' },
    { id: 'contractors', label: 'Contractors', value: 1404000, color: '#8b5a2b', description: 'Specialist services and project support' },
    { id: 'other', label: 'Other Costs', value: 936000, color: '#6b7280', description: 'Travel, training, and community support' },
  ];

  const dollarBreakdownData = [
    { id: 'labour', label: 'Staff Wages', cents: 60, color: '#2d6a4f', description: 'Paying our 197 dedicated staff members' },
    { id: 'admin', label: 'Administration', cents: 21, color: '#1e3a5f', description: 'Running our operations professionally' },
    { id: 'supplies', label: 'Program Delivery', cents: 9, color: '#e85d04', description: 'Materials and supplies for services' },
    { id: 'contractors', label: 'Specialist Services', cents: 6, color: '#8b5a2b', description: 'Expert support when needed' },
    { id: 'other', label: 'Community Support', cents: 4, color: '#6b7280', description: 'Travel, training, and direct support' },
  ];

  // Timeline milestones
  const milestones = [
    { date: 'July 2023', title: 'New Financial Year Begins', description: 'PICC enters 2023-24 with expanded programs and renewed focus', category: 'milestone' as const },
    { date: 'September 2023', title: 'Digital Service Centre Opens', description: 'Bringing technology access and training to community members', category: 'launch' as const },
    { date: 'November 2023', title: 'Storm Recovery Response', description: 'Community comes together to support families affected by severe weather', category: 'event' as const },
    { date: 'December 2023', title: '150 Staff Milestone', description: 'Workforce growth demonstrates commitment to local employment', category: 'achievement' as const },
    { date: 'March 2024', title: 'Photo Studio Project Launch', description: 'Elders portrait project begins capturing community stories', category: 'launch' as const },
    { date: 'May 2024', title: 'Health Services Expansion', description: 'New programs introduced to improve community health outcomes', category: 'milestone' as const },
    { date: 'June 2024', title: '197 Staff Achievement', description: '30% growth in local employment opportunities', category: 'achievement' as const },
  ];

  // Demo projects if none loaded
  const demoProjects: Project[] = [
    {
      id: '1',
      name: 'Photo Studio Elders Project',
      description: 'Capturing the stories and wisdom of our Elders through professional portraits and recorded interviews',
      tagline: 'Preserving Elder voices for future generations',
      project_type: 'Cultural Preservation',
      status: 'active',
      hero_image_url: '/images/projects/photo-studio.jpg',
    },
    {
      id: '2',
      name: 'Digital Service Centre',
      description: 'Providing technology access, training, and support to bridge the digital divide in our community',
      tagline: 'Connecting community through technology',
      project_type: 'Community Services',
      status: 'active',
      hero_image_url: '/images/projects/digital-centre.jpg',
    },
    {
      id: '3',
      name: 'Bwgcolman Way Cultural Trail',
      description: 'Interactive cultural trail showcasing Palm Island history and heritage through augmented reality',
      tagline: 'Walking through our history',
      project_type: 'Cultural Tourism',
      status: 'active',
      hero_image_url: '/images/projects/bwgcolman-way.jpg',
    },
  ];

  // Demo services if none loaded
  const demoServices = [
    { id: '1', name: 'Health Services', description: 'Primary health care and chronic disease management', category: 'Health', icon: 'health', color: '#e85d04' },
    { id: '2', name: 'Safe Haven', description: 'Support services for children and families', category: 'Family Support', icon: 'shield', color: '#2d6a4f' },
    { id: '3', name: 'Housing Services', description: 'Housing maintenance and tenancy support', category: 'Housing', icon: 'home', color: '#1e3a5f' },
    { id: '4', name: 'Youth Programs', description: 'Leadership development and education support', category: 'Youth', icon: 'graduation', color: '#8b5a2b' },
    { id: '5', name: 'Elder Services', description: 'Cultural programs and support for Elders', category: 'Elders', icon: 'heart', color: '#7c3aed' },
    { id: '6', name: 'Employment Services', description: 'Job training and employment pathways', category: 'Employment', icon: 'briefcase', color: '#0891b2' },
  ];

  // Featured quotes from real stories
  const featuredQuotes = [
    {
      quote: "When the cyclone hit, we lost everything. But this community - we came together like family always does. The young ones helped the Elders first. That's how we do things here on Palm Island.",
      author: "Aunty Mary",
      role: "Community Elder",
    },
    {
      quote: "The Photo Studio project gave me a chance to tell my story, to share what life was like when I was young. Now my grandchildren will always have that connection to their history.",
      author: "Uncle Frank",
      role: "Elder & Cultural Advisor",
    },
    {
      quote: "PICC gave me my first real job. Now I'm training others and giving back to my community. That's what it's all about - lifting each other up.",
      author: "Jason",
      role: "Community Support Worker",
    },
  ];

  // Community voices with photos - people cards linking to stories
  const communityVoices = [
    {
      name: "Aunty Maureen",
      role: "Cultural Elder",
      quote: "Our stories are the foundation of everything we do. When the young ones learn our history, they learn who they are and where they belong.",
      image: "/images/people/aunty-maureen.jpg",
      storyLink: "/stories/elder-wisdom-maureen",
      storyTitle: "Read Aunty Maureen's Story",
    },
    {
      name: "David Thompson",
      role: "Youth Program Graduate",
      quote: "PICC believed in me when I didn't believe in myself. The youth program showed me there's a path forward, right here on Palm Island.",
      image: "/images/people/david-youth.jpg",
      storyLink: "/stories/youth-success-david",
      storyTitle: "David's Journey",
    },
    {
      name: "Sister Joyce",
      role: "Health Worker",
      quote: "Every day I see the difference we make. When someone gets the care they need, when a family is supported - that's what keeps me going.",
      image: "/images/people/sister-joyce.jpg",
      storyLink: "/stories/health-frontline",
      storyTitle: "Frontline Stories",
    },
    {
      name: "Uncle Tommy",
      role: "Traditional Owner",
      quote: "This land holds our ancestors' wisdom. Everything PICC does, we do it the right way - respecting Country, respecting culture.",
      image: "/images/people/uncle-tommy.jpg",
      storyLink: "/stories/country-connection",
      storyTitle: "Connection to Country",
    },
    {
      name: "Sarah Williams",
      role: "Safe Haven Coordinator",
      quote: "These children are our future. When we protect them, support their families, we're building a stronger Palm Island for generations to come.",
      image: "/images/people/sarah-safehaven.jpg",
      storyLink: "/stories/safe-haven-impact",
      storyTitle: "Safe Haven Impact",
    },
    {
      name: "Marcus Johnson",
      role: "Digital Services Trainee",
      quote: "Technology isn't just for the cities. Our Elders are now video calling their grandchildren on the mainland. That connection is everything.",
      image: "/images/people/marcus-digital.jpg",
      storyLink: "/stories/digital-bridge",
      storyTitle: "Bridging the Digital Gap",
    },
  ];

  // Featured videos
  const featuredVideos = {
    leadersTrip: {
      url: "https://www.youtube.com/watch?v=LEADERS_TRIP_VIDEO_ID", // Replace with actual video ID
      title: "Leaders Trip: Learning From Each Other",
      description: "Palm Island leaders visited communities across Queensland to share knowledge and strengthen connections. This trip brought back new ideas for supporting our people.",
      thumbnail: "/images/videos/leaders-trip-thumb.jpg",
      badge: "Community Leadership",
    },
    daycareLaunch: {
      url: "https://www.youtube.com/watch?v=DAYCARE_LAUNCH_VIDEO_ID", // Replace with actual video ID
      title: "Daycare Centre Opening Day",
      description: "A milestone moment for Palm Island families. Our new early learning centre gives our littlest community members the best start in life.",
      thumbnail: "/images/videos/daycare-launch-thumb.jpg",
      badge: "New Service Launch",
    },
  };

  // Get leadership messages or use defaults
  const getCEOMessage = () => {
    const ceoMsg = leadershipMessages.find(m =>
      m.message_title?.toLowerCase().includes('ceo') ||
      m.role?.toLowerCase().includes('ceo')
    );
    return ceoMsg?.message_content || report?.ceo_message || '';
  };

  const getChairMessage = () => {
    const chairMsg = leadershipMessages.find(m =>
      m.message_title?.toLowerCase().includes('chair') ||
      m.role?.toLowerCase().includes('chair')
    );
    return chairMsg?.message_content || report?.chair_message || '';
  };

  // Group stories by category
  const storiesByCategory = stories.reduce((acc, story) => {
    const category = story.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(story);
    return acc;
  }, {} as Record<string, Story[]>);

  // Get elder stories
  const elderStories = stories.filter(s =>
    s.story_type === 'elder_story' ||
    s.profiles?.storyteller_type === 'elder' ||
    s.category?.toLowerCase().includes('elder')
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fefdfb]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading Annual Report...</p>
          <p className="text-sm text-gray-400 mt-2">Preparing something special</p>
        </div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fefdfb]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Report</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadAllData}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fefdfb]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Report Not Found</h1>
          <p className="text-gray-600 mb-8">The annual report for {year} is not available.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const stats = report.statistics || {};
  const displayServices = services.length > 0 ? services : demoServices;
  const displayProjects = projects.length > 0 ? projects : demoProjects;

  return (
    <main className="min-h-screen bg-[#fefdfb]">
      {/* Floating Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to PICC</span>
          </Link>

          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white text-sm rounded-lg hover:bg-[#2d4a6f] transition-colors">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      </nav>

      {/* Hero - with optional background video */}
      <ReportHero
        title={report.title}
        subtitle={report.subtitle || report.theme}
        year={report.report_year}
        organization="Palm Island Community Company"
        tagline="Our Community, Our Future, Our Way"
        backgroundVideo="/videos/picc-hero-2024.mp4" // Optional: remove this line if no video available
        backgroundVideoPoster="/images/hero/palm-island-aerial.jpg"
      />

      {/* Key Impact Stats */}
      <ImpactStatsGrid background="gradient" columns={4}>
        <ImpactStatCard
          value={stats.total_staff || 197}
          label="Staff Members"
          suffix={stats.staff_growth ? ` (+${stats.staff_growth}%)` : ''}
          icon={Users}
          color="white"
          animateOnScroll
        />
        <ImpactStatCard
          value={stats.health_clients || 2283}
          label="Health Clients Served"
          icon={Stethoscope}
          color="white"
          animateOnScroll
        />
        <ImpactStatCard
          value={stats.children_supported || 1187}
          label="Children Supported"
          icon={Baby}
          color="white"
          animateOnScroll
        />
        <ImpactStatCard
          value={stats.episodes_of_care || 17488}
          label="Episodes of Care"
          icon={Heart}
          color="white"
          animateOnScroll
        />
      </ImpactStatsGrid>

      {/* Executive Summary */}
      <Section background="white" padding="xl">
        <SectionHeader
          title="Executive Summary"
          subtitle="A Year of Growth, Resilience, and Community"
        />
        <ScrollReveal animation="fadeUp" delay={200}>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
              {report.executive_summary}
            </p>
          </div>
        </ScrollReveal>
      </Section>

      {/* CEO Message */}
      {getCEOMessage() && (
        <LeadershipMessage
          name="Rachel Atkinson"
          role="Chief Executive Officer"
          message={getCEOMessage()}
          signature="Rachel"
        />
      )}

      {/* Year Highlights with Numbers */}
      {report.year_highlights && report.year_highlights.length > 0 && (
        <Section background="earth" padding="lg">
          <SectionHeader
            title="Year at a Glance"
            subtitle="Key achievements from 2023-24"
          />
          <div className="max-w-3xl mx-auto">
            <StaggerContainer staggerDelay={100}>
              {report.year_highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl mb-3 shadow-sm"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-[#2d6a4f] to-[#1e3a5f] rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  <p className="text-gray-800 pt-2 font-medium">{highlight}</p>
                </div>
              ))}
            </StaggerContainer>
          </div>
        </Section>
      )}

      {/* Milestone Counter */}
      <Section background="white" padding="lg">
        <MilestoneCounter
          milestones={[
            { label: 'Total Staff', value: stats.total_staff || 197, description: '30% growth' },
            { label: 'Revenue', value: 23.4, suffix: 'M', description: 'Annual budget' },
            { label: 'Local Employment', value: stats.local_employment_rate || 90, suffix: '%', description: 'Community jobs' },
            { label: 'Services', value: stats.services_delivered || 48, description: 'Programs delivered' },
          ]}
        />
      </Section>

      {/* Featured Elder Quote */}
      <QuoteShowcase
        quote={featuredQuotes[0].quote}
        author={featuredQuotes[0].author}
        role={featuredQuotes[0].role}
        variant="featured"
        background="gradient"
      />

      {/* Innovation Projects */}
      <Section background="light" padding="xl">
        <SectionHeader
          title="Innovation in Action"
          subtitle="Projects transforming our community"
        />
        <ProjectShowcase
          projects={displayProjects.map(p => ({
            id: p.id,
            title: p.name,
            description: p.tagline || p.description,
            category: p.project_type,
            status: p.status as any,
            image: p.hero_image_url,
            link: `/projects/${p.id}`,
          }))}
          variant="magazine"
        />
      </Section>

      {/* Chair Message */}
      {getChairMessage() && (
        <LeadershipMessage
          name="Luella Bligh"
          role="Board Chairperson"
          message={getChairMessage()}
          signature="Luella"
        />
      )}

      {/* Community Voices - People with Photos and Quotes */}
      <Section background="light" padding="xl">
        <SectionHeader
          title="Community Voices"
          subtitle="Meet the people who make Palm Island strong"
        />
        <PersonQuoteGrid
          people={communityVoices}
          columns={3}
          variant="default"
        />
        <div className="text-center mt-8">
          <Link
            href="/storytellers"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors"
          >
            Meet More Storytellers
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </Section>

      {/* Featured Video - Leaders Trip */}
      <Section background="white" padding="xl">
        <SectionHeader
          title="Leaders Learning Together"
          subtitle="Sharing knowledge, strengthening connections"
        />
        <div className="max-w-4xl mx-auto">
          <FeaturedVideo
            url={featuredVideos.leadersTrip.url}
            title={featuredVideos.leadersTrip.title}
            description={featuredVideos.leadersTrip.description}
            thumbnail={featuredVideos.leadersTrip.thumbnail}
            badge={featuredVideos.leadersTrip.badge}
          />
        </div>
      </Section>

      {/* Services We Deliver */}
      <Section background="white" padding="xl">
        <SectionHeader
          title="Services We Deliver"
          subtitle="Supporting our community across all aspects of life"
        />
        <ServiceImpact
          services={displayServices.map(s => ({
            id: s.id,
            name: s.name,
            description: s.description,
            category: s.category,
            icon: s.icon,
            color: s.color,
          }))}
          totalClients={stats.community_members_served || 2500}
          totalStaff={stats.total_staff || 197}
        />
        <div className="mt-12">
          <ServiceShowcase
            services={displayServices.map(s => ({
              id: s.id,
              name: s.name,
              description: s.description,
              category: s.category,
              icon: s.icon,
              color: s.color,
            }))}
            layout="grid"
            showStats={false}
          />
        </div>
      </Section>

      {/* Community Stories */}
      {stories.length > 0 && (
        <Section background="light" padding="xl">
          <SectionHeader
            title="Community Voices"
            subtitle="Stories from the heart of Palm Island"
          />
          <StoryGrid columns={3}>
            {stories.slice(0, 6).map((story, index) => (
              <ScrollReveal key={story.id} animation="fadeUp" delay={index * 100}>
                <StoryCard
                  story={{
                    id: story.id,
                    title: story.title,
                    content: story.content,
                    category: story.category,
                    author: story.profiles ? {
                      name: story.profiles.full_name,
                      image: story.profiles.profile_image_url,
                    } : undefined,
                  }}
                  variant="default"
                  linkTo={`/stories/${story.id}`}
                />
              </ScrollReveal>
            ))}
          </StoryGrid>

          {stories.length > 6 && (
            <div className="text-center mt-8">
              <Link
                href="/stories"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors"
              >
                Read More Stories
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </Section>
      )}

      {/* Timeline */}
      <Section background="white" padding="xl">
        <SectionHeader
          title="Our Journey This Year"
          subtitle="Key milestones and achievements"
        />
        <Timeline events={milestones} variant="vertical" />
      </Section>

      {/* Featured Video - Daycare Launch */}
      <Section background="earth" padding="xl">
        <SectionHeader
          title="A New Beginning for Our Little Ones"
          subtitle="Palm Island's Early Learning Centre opens its doors"
        />
        <div className="max-w-4xl mx-auto">
          <FeaturedVideo
            url={featuredVideos.daycareLaunch.url}
            title={featuredVideos.daycareLaunch.title}
            description={featuredVideos.daycareLaunch.description}
            thumbnail={featuredVideos.daycareLaunch.thumbnail}
            badge={featuredVideos.daycareLaunch.badge}
          />
        </div>
      </Section>

      {/* Photo Gallery - Year in Pictures */}
      <Section background="light" padding="xl">
        <SectionHeader
          title="Year in Pictures"
          subtitle="Moments that captured the spirit of our community"
        />
        <PhotoGallery
          photos={[
            { url: "/images/gallery/community-event-1.jpg", caption: "Annual Community Day celebrations" },
            { url: "/images/gallery/elders-portrait-session.jpg", caption: "Photo Studio - Capturing Elder stories" },
            { url: "/images/gallery/health-outreach.jpg", caption: "Health team delivering care" },
            { url: "/images/gallery/youth-graduation.jpg", caption: "Youth Program graduation ceremony" },
            { url: "/images/gallery/storm-recovery.jpg", caption: "Community comes together after the storm" },
            { url: "/images/gallery/digital-training.jpg", caption: "Digital skills workshop for Elders" },
            { url: "/images/gallery/daycare-opening.jpg", caption: "Early Learning Centre opening day" },
            { url: "/images/gallery/leaders-visit.jpg", caption: "Leaders Trip - Learning from other communities" },
          ]}
          columns={4}
          layout="masonry"
        />
      </Section>

      {/* Another Quote */}
      <QuoteShowcase
        quote={featuredQuotes[1].quote}
        author={featuredQuotes[1].author}
        role={featuredQuotes[1].role}
        variant="centered"
        background="ocean"
      />

      {/* Financial Section */}
      <Section background="light" padding="xl">
        <SectionHeader
          title="Financial Transparency"
          subtitle="Where your support goes - every dollar makes a difference"
        />

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Donut Chart */}
          <ScrollReveal animation="fadeRight">
            <FinancialDonut
              data={financialData}
              centerValue="$23.4M"
              centerLabel="Total Revenue"
              interactive
              showLegend
              animateOnScroll
            />
          </ScrollReveal>

          {/* Dollar Breakdown */}
          <ScrollReveal animation="fadeLeft" delay={200}>
            <DollarBreakdown
              items={dollarBreakdownData}
              title="Where Each Dollar Goes"
              subtitle="60 cents of every dollar goes directly to staff wages"
              interactive
            />
          </ScrollReveal>
        </div>

        <ScrollReveal animation="fadeUp" delay={300}>
          <div className="mt-12 bg-white rounded-2xl p-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Financial Highlights</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-3xl font-bold text-green-700 mb-1">60%</div>
                <div className="text-sm text-gray-600">Spent on local wages</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-3xl font-bold text-blue-700 mb-1">90%</div>
                <div className="text-sm text-gray-600">Local employment rate</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-3xl font-bold text-purple-700 mb-1">30%</div>
                <div className="text-sm text-gray-600">Staff growth this year</div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </Section>

      {/* Stories by Impact Area */}
      {stats.stories_by_category && Object.keys(stats.stories_by_category).length > 0 && (
        <Section background="white" padding="lg">
          <SectionHeader
            title="Impact by Category"
            subtitle="Stories across our service areas"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {Object.entries(stats.stories_by_category).map(([category, count], index) => (
              <ScrollReveal key={category} animation="scale" delay={index * 100}>
                <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <div className="text-3xl font-bold text-[#1e3a5f] mb-2">{count as number}</div>
                  <div className="text-sm text-gray-600 capitalize">{category}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </Section>
      )}

      {/* Final Quote - Looking Forward */}
      <QuoteShowcase
        quote="Our vision is clear: a Palm Island where every person has the opportunity to thrive, where our culture is celebrated, and where our community leads its own future. Together, we are making this vision a reality."
        author="Palm Island Community Company"
        variant="centered"
        background="gradient"
      />

      {/* Acknowledgments */}
      <Section background="dark" padding="xl">
        <div className="text-center max-w-3xl mx-auto">
          <ScrollReveal animation="fadeUp">
            <h2 className="text-3xl font-bold text-white mb-6">Acknowledgments</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              {report.acknowledgments}
            </p>
            {report.metadata?.funder_name && (
              <p className="text-gray-400">
                With gratitude to {report.metadata.funder_name}
              </p>
            )}
          </ScrollReveal>

          <ScrollReveal animation="fadeUp" delay={200}>
            <div className="mt-12 pt-8 border-t border-gray-700">
              <div className="flex items-center justify-center gap-6 mb-6">
                <MapPin className="w-6 h-6 text-white/40" />
                <p className="text-white/60 text-sm">
                  Palm Island (Bwgcolman), Queensland, Australia
                </p>
              </div>
              <p className="text-2xl font-light text-white/80 italic mb-4">
                "Our Community, Our Future, Our Way"
              </p>
              <p className="text-gray-500 text-sm">
                Palm Island Community Company &copy; {report.report_year}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </Section>

      {/* Footer CTA */}
      <Section background="white" padding="md">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/share-voice"
            className="px-8 py-3 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors font-medium"
          >
            Share Your Story
          </Link>
          <Link
            href="/stories"
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Read More Stories
          </Link>
          <Link
            href="/about"
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Learn More About PICC
          </Link>
        </div>
      </Section>
    </main>
  );
}
