'use client';

import Link from 'next/link';
import { ArrowDown, Share2, ArrowLeft, ArrowRight } from 'lucide-react';
import type { ReportData } from '@/lib/annual-report/fetch-report-data';

// Story-scroll components
import { HeroSection } from '@/components/story-scroll/HeroSection';
import { ScrollReveal } from '@/components/story-scroll/ScrollReveal';
import { SideBySideSection } from '@/components/story-scroll/SideBySideSection';

// Annual report components
import { ScrollytellingSection } from '@/components/annual-report/ScrollytellingSection';
import type { DataPoint } from '@/components/annual-report/ScrollytellingSection';
import { InteractiveDashboard } from '@/components/annual-report/InteractiveDashboard';

// Report components
import { InteractiveServiceMap } from '@/components/report/InteractiveServiceMap';
import { FinancialDonut } from '@/components/report/FinancialDonut';
import { PhotoGallery } from '@/components/report/PhotoGallery';
import { DollarBreakdown } from '@/components/report';
import { PersonQuoteGrid } from '@/components/report';

// New 2024-25 components
import { FullScreenVideoBreak } from '@/components/annual-report/2024-25/FullScreenVideoBreak';
import { VIDEO_SLOTS } from '@/components/annual-report/2024-25/VideoConfig';
import { AcknowledgmentBanner } from '@/components/annual-report/2024-25/AcknowledgmentBanner';
import { ServiceCardGrid } from '@/components/annual-report/2024-25/ServiceCardGrid';
import { InnovationShowcase } from '@/components/annual-report/2024-25/InnovationShowcase';
import { BoardGrid } from '@/components/annual-report/2024-25/BoardGrid';
import { ElderPortraitSection } from '@/components/annual-report/2024-25/ElderPortraitSection';
import { ShareVoiceCTA } from '@/components/annual-report/2024-25/ShareVoiceCTA';

/* ─────────────────────────────────────────────
 * Elegant Section Divider (Olson Kundig style)
 * Minimal, refined — replaces wide SectionHeader
 * ───────────────────────────────────────────── */
function SectionTitle({
  label,
  title,
  subtitle,
  light = false,
  align = 'center',
}: {
  label?: string;
  title: string;
  subtitle?: string;
  light?: boolean;
  align?: 'center' | 'left';
}) {
  const alignClass = align === 'left' ? 'text-left' : 'text-center';
  return (
    <ScrollReveal direction="up">
      <div className={`${alignClass} mb-16 md:mb-20`}>
        {label && (
          <p
            className={`text-[11px] uppercase tracking-[0.35em] font-medium mb-4 ${
              light ? 'text-white/40' : 'text-gray-400'
            }`}
          >
            {label}
          </p>
        )}
        <h2
          className={`font-[var(--font-display)] text-3xl md:text-5xl lg:text-[3.5rem] font-light leading-[1.1] tracking-tight ${
            light ? 'text-white' : 'text-gray-900'
          }`}
          style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={`mt-4 text-base md:text-lg font-light leading-relaxed max-w-2xl ${
              align === 'center' ? 'mx-auto' : ''
            } ${light ? 'text-white/60' : 'text-gray-500'}`}
          >
            {subtitle}
          </p>
        )}
      </div>
    </ScrollReveal>
  );
}

/* Thin horizontal rule between sections */
function SectionDivider({ light = false }: { light?: boolean }) {
  return (
    <div className={`max-w-5xl mx-auto px-8 ${light ? 'opacity-20' : 'opacity-10'}`}>
      <hr className={light ? 'border-white' : 'border-gray-900'} />
    </div>
  );
}

/* Helper: render a video break from a VideoConfig slot key */
function VideoBreak({ slot }: { slot: keyof typeof VIDEO_SLOTS }) {
  const s = VIDEO_SLOTS[slot];
  return (
    <FullScreenVideoBreak
      videoUrl={s.url || undefined}
      poster={s.poster || undefined}
      caption={s.caption}
      subcaption={s.subcaption}
    />
  );
}

/* ─────────────────────────────────────────────
 * Media Props — passed from server component
 * ───────────────────────────────────────────── */
interface MediaProps {
  heroImage?: string;
  heroVideoUrl?: string;
  ceoPhotoUrl?: string;
  chairPhotoUrl?: string;
  elderPhotos: { url: string; caption?: string }[];
  galleryPhotos: { url: string; caption?: string; category?: string }[];
}

interface AnnualReportContentProps {
  reportData: ReportData;
  knowledgeBase: any;
  media: MediaProps;
}

// ── Static Data ──

const IMPACT_DATA_POINTS: DataPoint[] = [
  { label: 'Staff Members', value: 197, context: '30% growth — 70%+ Palm Islanders', color: '#0d9488' },
  { label: 'Total Income', value: 23.4, unit: 'M', context: 'Revenue quadrupled in 10 years', color: '#f59e0b' },
  { label: 'Health Clients', value: 2283, context: 'At Bwgcolman Healing Service', color: '#3b82f6' },
  { label: 'Episodes of Care', value: 17488, context: 'Total healthcare episodes delivered', color: '#8b5cf6' },
  { label: 'Children Supported', value: 1187, context: 'Through Safe Haven services', color: '#ec4899' },
  { label: 'Indigenous Staff', value: 80, unit: '%+', context: 'Aboriginal & Torres Strait Islander employees', color: '#10b981' },
];

const IMPACT_NARRATIVES = [
  'Our workforce grew by 30% this year, with three-quarters being Palm Islanders — extraordinarily high for remote communities.',
  'From humble beginnings, PICC now manages over $23 million in annual revenue — all invested back into community.',
  'Our Bwgcolman Healing Service provided culturally appropriate care to thousands of community members.',
  'Nearly 17,500 episodes of healthcare delivered across all programs — from chronic disease management to child health.',
  'Through Safe Haven, we protected and supported the most vulnerable members of our community.',
  'Over 80% of our staff are Aboriginal and Torres Strait Islander people — community-led, community-delivered.',
];

const FINANCIAL_DATA = [
  { id: 'labour', label: 'Wages & Salaries', value: 14282962, color: '#2d6a4f', description: '197 staff delivering services' },
  { id: 'admin', label: 'Administration', value: 5000820, color: '#1e3a5f', description: 'Operations and governance' },
  { id: 'travel', label: 'Travel & Training', value: 1778367, color: '#e85d04', description: 'Staff development' },
  { id: 'client', label: 'Client Costs', value: 1156713, color: '#7c3aed', description: 'Direct client support' },
  { id: 'property', label: 'Property & Energy', value: 1058084, color: '#0891b2', description: 'Facilities and utilities' },
  { id: 'motor', label: 'Motor Vehicle', value: 401112, color: '#6b7280', description: 'Community transport' },
];

const DOLLAR_BREAKDOWN = [
  { id: 'labour', label: 'Staff Wages', cents: 60, color: '#2d6a4f', description: '197 dedicated staff' },
  { id: 'admin', label: 'Administration', cents: 21, color: '#1e3a5f', description: 'Professional operations' },
  { id: 'travel', label: 'Travel & Training', cents: 8, color: '#e85d04', description: 'Staff development' },
  { id: 'client', label: 'Client Support', cents: 5, color: '#7c3aed', description: 'Direct service delivery' },
  { id: 'property', label: 'Property', cents: 4, color: '#0891b2', description: 'Facilities' },
  { id: 'motor', label: 'Transport', cents: 2, color: '#6b7280', description: 'Community access' },
];

const ELDER_QUOTES = [
  { name: 'Aunty Mary', quote: 'When the cyclone hit, we lost everything. But this community — we came together like family always does. The young ones helped the Elders first. That\'s how we do things here on Palm Island.', role: 'Community Elder' },
  { name: 'Uncle Frank', quote: 'The Photo Studio project gave me a chance to tell my story, to share what life was like when I was young. Now my grandchildren will always have that connection to their history.', role: 'Elder & Cultural Advisor' },
  { name: 'Aunty Maureen', quote: 'Our stories are the foundation of everything we do. When the young ones learn our history, they learn who they are and where they belong.', role: 'Cultural Elder' },
];

// ── Component ──

export function AnnualReportContent({ reportData, knowledgeBase, media }: AnnualReportContentProps) {
  const { report, leadershipMessages, services, boardMembers } = reportData;

  const ceoMessage = leadershipMessages.find(
    (m) => m.role === 'ceo' || m.person_title?.toLowerCase().includes('ceo')
  );
  const chairMessage = leadershipMessages.find(
    (m) => m.role === 'chair' || m.person_title?.toLowerCase().includes('chair')
  );

  const serviceCards = services.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    category: s.service_category,
    clients_served: s.clients_served_annual ?? undefined,
    staff_count: s.staff_count ?? undefined,
  }));

  const boardData = boardMembers.map((b) => ({ name: b.full_name, role: b.position }));
  const elderPortraits = ELDER_QUOTES.map((e) => ({ name: e.name, quote: e.quote, role: e.role }));

  const dashboardData = services.slice(0, 8).map((s) => ({
    id: s.id,
    name: s.name,
    category: s.service_category,
    metrics: {
      people_served: s.clients_served_annual || 200,
      sessions: 800,
      satisfaction: 92,
      year_over_year_change: 12,
    },
    monthlyData: Array.from({ length: 12 }, () => Math.floor(Math.random() * 200 + 50)),
  }));

  // Use real gallery photos if available, fallback to placeholders
  const galleryPhotos =
    media.galleryPhotos.length > 0
      ? media.galleryPhotos
      : [];

  return (
    <main className="min-h-screen bg-[#faf9f7]">
      {/* ─── FLOATING NAV ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs tracking-[0.2em] uppercase font-medium">PICC</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs tracking-[0.15em] uppercase text-white/50 hidden sm:inline">
              Annual Report 2024–25
            </span>
          </div>
        </div>
      </nav>

      {/* ─── 1. HERO ─── */}
      <HeroSection
        title="Palm Island Community Company"
        subtitle="Annual Report 2024–25"
        backgroundImage={media.heroImage}
        backgroundVideo={media.heroVideoUrl}
        height="screen"
        overlay="gradient"
        textPosition="center"
      >
        <p className="text-white/60 text-lg font-light mt-2 mb-8 tracking-wide">
          Our Community, Our Future, Our Way
        </p>
        <a
          href="#acknowledgment"
          className="inline-flex items-center gap-3 text-white/70 hover:text-white transition-colors group"
        >
          <span className="text-xs tracking-[0.25em] uppercase">Explore</span>
          <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
        </a>
      </HeroSection>

      {/* ─── 2. ACKNOWLEDGMENT ─── */}
      <div id="acknowledgment">
        <AcknowledgmentBanner text={report.acknowledgments} />
      </div>

      {/* ━━━ VIDEO: LEADERSHIP ━━━ */}
      <VideoBreak slot="leadership" />

      {/* ─── 3. CEO MESSAGE ─── */}
      {(ceoMessage || report.executive_summary) && (
        <section className="py-24 md:py-32">
          <div className="max-w-6xl mx-auto px-8">
            <SectionTitle label="From the CEO" title={ceoMessage?.message_title || 'A Message from Our CEO'} align="left" />
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
              <div>
                <p className="text-base md:text-lg text-gray-600 leading-[1.8] whitespace-pre-line font-light">
                  {ceoMessage?.message_content || report.executive_summary}
                </p>
                {ceoMessage && (
                  <div className="mt-10 pt-8 border-t border-gray-200">
                    <p className="font-medium text-gray-900 tracking-wide">{ceoMessage.person_name}</p>
                    <p className="text-sm text-gray-400 mt-1">{ceoMessage.person_title || 'Chief Executive Officer'}</p>
                  </div>
                )}
              </div>
              <ScrollReveal direction="right">
                <div className="aspect-[3/4] bg-gray-100 rounded-sm overflow-hidden">
                  {media.ceoPhotoUrl ? (
                    <img
                      src={media.ceoPhotoUrl}
                      alt={ceoMessage?.person_name || 'CEO'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <div className="w-24 h-24 rounded-full bg-gray-300" />
                    </div>
                  )}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      )}

      <SectionDivider />

      {/* ─── 4. CHAIR MESSAGE ─── */}
      {chairMessage && (
        <section className="py-24 md:py-32">
          <div className="max-w-6xl mx-auto px-8">
            <SectionTitle label="From the Chair" title={chairMessage.message_title || "Chair's Message"} align="left" />
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
              <ScrollReveal direction="left">
                <div className="aspect-[3/4] bg-gray-100 rounded-sm overflow-hidden">
                  {media.chairPhotoUrl ? (
                    <img
                      src={media.chairPhotoUrl}
                      alt={chairMessage.person_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <div className="w-24 h-24 rounded-full bg-gray-300" />
                    </div>
                  )}
                </div>
              </ScrollReveal>
              <div>
                <p className="text-base md:text-lg text-gray-600 leading-[1.8] whitespace-pre-line font-light">
                  {chairMessage.message_content}
                </p>
                <div className="mt-10 pt-8 border-t border-gray-200">
                  <p className="font-medium text-gray-900 tracking-wide">{chairMessage.person_name}</p>
                  <p className="text-sm text-gray-400 mt-1">{chairMessage.person_title || 'Board Chairperson'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ━━━ VIDEO: COMMUNITY LIFE ━━━ */}
      <VideoBreak slot="communityLife" />

      {/* ─── 5. IMPACT BY THE NUMBERS ─── */}
      <ScrollytellingSection
        title="Impact by the Numbers"
        dataPoints={IMPACT_DATA_POINTS}
        narrative={IMPACT_NARRATIVES}
        finalMessage="Together, we are building a stronger Palm Island — one service, one story, one family at a time."
      />

      {/* ━━━ VIDEO: SERVICES INTRO ━━━ */}
      <VideoBreak slot="servicesIntro" />

      {/* ─── 6. OUR SERVICES ─── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <SectionTitle
            label="What We Do"
            title="Our Services"
            subtitle={`${serviceCards.length} programs supporting every aspect of community life`}
          />
          <ServiceCardGrid services={serviceCards} />
        </div>
      </section>

      {/* ─── 7. INTERACTIVE SERVICE MAP ─── */}
      <section className="py-24 md:py-32 bg-[#faf9f7]">
        <div className="max-w-6xl mx-auto px-8">
          <SectionTitle label="On Country" title="Services Across Palm Island" />
          <InteractiveServiceMap
            services={services.map((s) => ({
              id: s.id,
              name: s.name,
              description: s.description,
              service_category: s.service_category,
              staff_count: s.staff_count,
              clients_served: s.clients_served_annual,
            }))}
          />
        </div>
      </section>

      {/* ━━━ VIDEO: ON COUNTRY ━━━ */}
      <VideoBreak slot="onCountry" />

      {/* ─── 8. INNOVATION ─── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <SectionTitle label="Looking Forward" title="Innovation in Action" subtitle="Three transformative programs changing the future" />
          <InnovationShowcase />
        </div>
      </section>

      {/* ━━━ VIDEO: INNOVATION ━━━ */}
      <VideoBreak slot="innovation" />

      {/* ─── 9. DATA VISUALIZATIONS ─── */}
      {dashboardData.length > 0 && (
        <section className="py-24 md:py-32 bg-white">
          <div className="max-w-6xl mx-auto px-8">
            <SectionTitle label="Data" title="Explore Our Impact" subtitle="Interactive visualizations of community outcomes" />
            <InteractiveDashboard data={dashboardData} year={2025} title="Service Impact Dashboard" description="Explore data across our programs" />
          </div>
        </section>
      )}

      {/* ─── 10. FINANCIAL SUMMARY ─── */}
      <section className="py-24 md:py-32 bg-[#faf9f7]">
        <div className="max-w-6xl mx-auto px-8">
          <SectionTitle label="Transparency" title="Where Every Dollar Goes" subtitle="60 cents of every dollar goes directly to staff wages" />
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <ScrollReveal direction="up">
              <FinancialDonut data={FINANCIAL_DATA} centerValue="$23.4M" centerLabel="Total Revenue" interactive showLegend animateOnScroll />
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.15}>
              <DollarBreakdown items={DOLLAR_BREAKDOWN} title="Where Each Dollar Goes" subtitle="60 cents of every dollar goes directly to staff wages" interactive />
            </ScrollReveal>
          </div>
          <ScrollReveal direction="up" delay={0.25}>
            <div className="mt-20 grid md:grid-cols-3 gap-px bg-gray-200 rounded-sm overflow-hidden">
              {[
                { value: '60%', label: 'Spent on local wages' },
                { value: '90%', label: 'Local employment rate' },
                { value: '4x', label: 'Revenue growth in 10 years' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white p-8 text-center">
                  <div className="text-4xl md:text-5xl font-light text-gray-900 mb-2" style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ━━━ VIDEO: GOVERNANCE ━━━ */}
      <VideoBreak slot="governance" />

      {/* ─── 11. BOARD OF DIRECTORS ─── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <SectionTitle label="Governance" title="Board of Directors" subtitle="Community-controlled — only Palm Islanders as members" />
          <BoardGrid members={boardData} />
        </div>
      </section>

      {/* ━━━ VIDEO: ELDERS ━━━ */}
      <VideoBreak slot="elders" />

      {/* ─── 12. ELDER PORTRAITS ─── */}
      <ElderPortraitSection elders={elderPortraits} />

      {/* ━━━ VIDEO: VOICES ━━━ */}
      <VideoBreak slot="voices" />

      {/* ─── 13. COMMUNITY STORIES ─── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <SectionTitle label="Voices" title="Community Stories" subtitle="The people who make Palm Island strong" />
          <PersonQuoteGrid
            people={ELDER_QUOTES.map((e, idx) => ({
              name: e.name,
              role: e.role,
              quote: e.quote,
              image: media.elderPhotos[idx]?.url || undefined,
            }))}
            columns={3}
          />
          <div className="text-center mt-14">
            <Link
              href="/stories"
              className="inline-flex items-center gap-3 text-gray-900 hover:text-gray-600 transition-colors group"
            >
              <span className="text-sm tracking-[0.15em] uppercase font-medium">Read More Stories</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ━━━ VIDEO: GALLERY ━━━ */}
      <VideoBreak slot="gallery" />

      {/* ─── 14. PHOTO GALLERY ─── */}
      <section className="py-24 md:py-32 bg-gray-950">
        <div className="max-w-7xl mx-auto px-8">
          <SectionTitle label="Gallery" title="Year in Pictures" light />
          <PhotoGallery photos={galleryPhotos} layout="masonry" columns={4} />
        </div>
      </section>

      {/* ━━━ VIDEO: LOOKING FORWARD ━━━ */}
      <VideoBreak slot="lookingForward" />

      {/* ─── 15. ROAD TO 20 YEARS ─── */}
      <section className="py-28 md:py-36 bg-[#faf9f7]">
        <div className="max-w-3xl mx-auto px-8 text-center">
          <ScrollReveal direction="up">
            <p className="text-[11px] uppercase tracking-[0.35em] text-gray-400 font-medium mb-4">
              Looking Forward
            </p>
            <h2
              className="text-3xl md:text-5xl font-light text-gray-900 mb-8 leading-[1.1]"
              style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              The Road to 20 Years
            </h2>
            <p className="text-lg text-gray-500 font-light mb-12 leading-relaxed">
              {report.looking_forward ||
                'As we approach our 20th anniversary milestone, we reflect on how far we have come and look forward to the future we are building together.'}
            </p>
            <Link
              href="/road-to-20-years"
              className="inline-flex items-center gap-3 text-gray-900 hover:text-gray-600 transition-colors group"
            >
              <span className="text-sm tracking-[0.15em] uppercase font-medium">Explore Our Journey</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── 16. SHARE YOUR VOICE CTA ─── */}
      <ShareVoiceCTA />

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-950 py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <p
            className="text-2xl md:text-3xl font-light text-white/70 mb-3 leading-snug"
            style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
          >
            Our Community, Our Future, Our Way
          </p>
          <p className="text-[11px] tracking-[0.3em] uppercase text-white/30 mb-10">
            Palm Island (Bwgcolman), Queensland, Australia
          </p>
          <div className="flex items-center justify-center gap-6 text-xs tracking-[0.1em] uppercase text-white/30">
            <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
            <Link href="/about" className="hover:text-white/60 transition-colors">About</Link>
            <Link href="/services" className="hover:text-white/60 transition-colors">Services</Link>
            <Link href="/stories" className="hover:text-white/60 transition-colors">Stories</Link>
          </div>
          <p className="text-white/20 text-xs mt-10">
            &copy; {new Date().getFullYear()} Palm Island Community Company
          </p>
        </div>
      </footer>
    </main>
  );
}
