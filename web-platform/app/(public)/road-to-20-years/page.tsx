import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calendar, Users, Heart, Award, BookOpen } from 'lucide-react';
import MilestoneTimeline, { Milestone } from '@/components/road-to-20-years/MilestoneTimeline';
import VisionSection from '@/components/road-to-20-years/VisionSection';
import { SERVICES } from '@/lib/stats/current-stats';
import { getLiveStats } from '@/lib/stats/get-live-stats';
import { getCuratedQuotes } from '@/lib/quotes/get-curated-quotes';
import VideoHero from '@/components/video/VideoHero';
import { assetUrl } from '@/lib/media/asset-url';
import { C } from '@/components/annual-report/2024-25/almanac/tokens';

export const metadata: Metadata = {
  title: 'Road to 20 Years | Palm Island Community Company',
  description: 'Celebrating PICC\'s journey from community control to 20 years of self-determined service delivery on Palm Island.',
};

function buildMilestones(staffTotal: number, servicesTotal: number, incomeDisplay: string): Milestone[] {
  return [
    {
      year: '1914',
      title: 'Palm Island Gazetted',
      description: 'Palm Island gazetted as an Aboriginal reserve. Hull River Settlement established on Djiru people\'s land near present-day Mission Beach.',
      era: 'founding',
    },
    {
      year: '1918',
      title: 'Hull River to Palm Island',
      description: 'After a devastating Category 5 cyclone destroyed Hull River Settlement on 10 March 1918, residents were transferred to Palm Island. Over the following decades, people from 42 language groups were brought to the island.',
      era: 'founding',
    },
    {
      year: '2021',
      title: 'Community Control Begins',
      description: 'On 30 September 2021, PICC transitions to full community control — Aboriginal and Torres Strait Islander community-controlled organisation. Palm Islanders determining their own futures.',
      era: 'growth',
    },
    {
      year: '2022',
      title: 'Bwgcolman Healing Service Launched',
      description: 'Culturally appropriate medical and healing services established, combining Western medicine with traditional healing practices. Over 2,283 clients served in the first full year.',
      era: 'growth',
    },
    {
      year: '2023',
      title: 'Delegated Authority Blueprint',
      description: 'PICC launches its Delegated Authority blueprint — a groundbreaking model for community-controlled child protection that puts Palm Island families at the centre of decision-making.',
      era: 'innovation',
    },
    {
      year: '2023',
      title: 'Digital Service Centre Opens',
      description: 'The Digital Service Centre brings technology access and digital literacy to Palm Island, helping community members connect with government services, education, and employment opportunities.',
      era: 'innovation',
    },
    {
      year: '2024',
      title: 'First 1,000 Days Program',
      description: 'The First 1,000 Days program established to support families from pregnancy through a child\'s second birthday — the most critical development window.',
      era: 'innovation',
    },
    {
      year: '2025',
      title: `${staffTotal} Staff, ${servicesTotal} Services`,
      description: `PICC grows to ${staffTotal} staff members delivering ${servicesTotal} services across health, family, justice, culture, education, and economic development. Total income reaches ${incomeDisplay}.`,
      era: 'today',
    },
    {
      year: '2026',
      title: 'Road to 20 Years',
      description: 'Looking ahead to PICC\'s 20th anniversary in 2029. Building on the foundation of self-determination, cultural strength, and community-led innovation.',
      era: 'today',
    },
  ];
}

const INNOVATION_SPOTLIGHTS = [
  {
    title: 'Digital Service Centre',
    description: 'Bridging the digital divide on Palm Island with technology access, literacy programs, and connected government services.',
    color: 'from-picc-ochre to-picc-ochre',
  },
  {
    title: 'Elders Cultural Trips',
    description: 'Reconnecting Elders with Country through cultural trips that strengthen identity, share knowledge across generations, and honour traditional connections.',
    color: 'from-picc-ochre to-picc-red',
  },
  {
    title: 'Delegated Authority',
    description: 'A nationally-recognised model putting community in control of child protection decisions — designed on Palm Island, now inspiring others.',
    color: 'from-picc-earth to-picc-ochre',
  },
  {
    title: 'First 1,000 Days',
    description: 'Supporting families during the most critical developmental window, combining maternal health, nutrition, and cultural connection from pregnancy to age two.',
    color: 'from-picc-red to-picc-red',
  },
];

export default async function RoadTo20YearsPage() {
  const [stats, communityQuotes] = await Promise.all([
    getLiveStats(),
    getCuratedQuotes({ limit: 3 }),
  ]);

  const MILESTONES = buildMilestones(stats.staff.total, stats.services.total, stats.financials.incomeDisplay);

  const VISION_GOALS = [
    {
      title: 'Service Expansion',
      description: `Grow from ${stats.services.total} to ${SERVICES.target2029}+ community services, including new mental health, aged care, and youth development programs designed by and for Palm Islanders.`,
      icon: 'expansion' as const,
    },
    {
      title: 'Technology & Innovation',
      description: 'Expand the Digital Service Centre model, build a connected health platform, and use data to drive better outcomes while respecting cultural protocols.',
      icon: 'technology' as const,
    },
    {
      title: 'Community Sovereignty',
      description: 'Deepen the Delegated Authority model so Palm Island families lead all decisions about their children, justice, health, and community wellbeing.',
      icon: 'community' as const,
    },
    {
      title: 'Healing & Wellbeing',
      description: 'Strengthen Bwgcolman healing approaches that weave traditional knowledge with contemporary practice, addressing intergenerational trauma with cultural strength.',
      icon: 'wellbeing' as const,
    },
  ];

  const BY_THE_NUMBERS = [
    { value: `${stats.staff.total}`, label: 'Staff Members', icon: Users },
    { value: `${stats.services.total}`, label: 'Services Delivered', icon: Heart },
    { value: stats.financials.incomeDisplay, label: 'Annual Income', icon: Award },
    { value: '42', label: 'Language Groups United', icon: BookOpen },
    { value: '2,283', label: 'Health Clients Served', icon: Heart },
    { value: '6,698', label: 'Placement Nights (Family Care)', icon: Users },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.shell }}>
      {/* Hero */}
      <VideoHero
        videoSrc={assetUrl("/video/road-to-20-years.mp4")}
        videoSrcMobile={assetUrl("/video/road-to-20-years-mobile.mp4")}
        poster={assetUrl("/video/road-to-20-years-poster.jpg")}
        overlay="cinematic"
        height="tall"
        parallax
        aria-label="Road to 20 Years"
      >
        <div className="text-center text-white max-w-4xl mx-auto">
          <p
            className="font-bold uppercase mb-6 inline-flex items-center gap-2"
            style={{ color: '#F5E9D0', fontSize: 11, letterSpacing: '0.3em', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
          >
            <Calendar className="w-3.5 h-3.5" />
            Community control since 2021
          </p>
          <h1
            className="font-fraunces font-bold mb-6"
            style={{ fontSize: 'clamp(48px, 8vw, 96px)', lineHeight: 1.05, textShadow: '0 2px 14px rgba(0,0,0,0.5)' }}
          >
            The road to<br />
            <span style={{ color: C.ochre }}>20 years</span>
          </h1>
          <p
            className="font-fraunces max-w-3xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.92)', fontSize: 'clamp(18px, 2.5vw, 26px)', lineHeight: 1.55, textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}
          >
            From Hull River to community control — Palm Island Community Company&apos;s journey of
            resilience, self-determination, and community-led innovation.
          </p>
          <p
            className="font-fraunces italic mt-8"
            style={{ color: C.ochre, fontSize: 'clamp(16px, 2vw, 22px)', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
          >
            &ldquo;Our community, our future, our way.&rdquo;
          </p>
        </div>
      </VideoHero>

      {/* Interactive Timeline */}
      <section className="py-20 px-4" style={{ backgroundColor: C.shell }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="font-bold uppercase mb-4"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              The path so far
            </p>
            <h2
              className="font-fraunces font-bold mb-4"
              style={{ color: C.ocean, fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.1 }}
            >
              Our journey
            </h2>
            <p
              className="font-fraunces max-w-2xl mx-auto"
              style={{ color: C.driftwood, fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.55 }}
            >
              From the founding of Palm Island through to today&apos;s community-controlled future.
            </p>
          </div>
          <MilestoneTimeline milestones={MILESTONES} />
        </div>
      </section>

      {/* By the Numbers */}
      <section className="py-20 px-4" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p
              className="font-bold uppercase mb-4"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              The impact
            </p>
            <h2
              className="font-fraunces font-bold mb-4"
              style={{ color: C.ocean, fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.1 }}
            >
              By the numbers
            </h2>
            <p className="font-fraunces" style={{ color: C.driftwood, fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.55 }}>
              The impact of community-controlled service delivery.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {BY_THE_NUMBERS.map((stat, idx) => {
              const Icon = stat.icon;
              const accents = [C.ochre, C.ocean, C.starGold, C.mangrove, C.turtleRed, C.coral];
              const accent = accents[idx % accents.length];
              return (
                <div
                  key={idx}
                  className="text-center p-6 rounded-2xl"
                  style={{ backgroundColor: C.shell, border: `1px solid ${C.border}`, borderTopWidth: 3, borderTopColor: accent }}
                >
                  <Icon className="w-7 h-7 mx-auto mb-3" style={{ color: accent }} />
                  <div
                    className="font-fraunces font-bold mb-2 leading-none"
                    style={{ color: C.ocean, fontSize: 'clamp(28px, 3vw, 38px)' }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="font-bold uppercase"
                    style={{ color: accent, fontSize: 11, letterSpacing: '0.2em' }}
                  >
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Innovation Spotlight */}
      <section className="py-20 px-4" style={{ backgroundColor: C.shell }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p
              className="font-bold uppercase mb-4"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Community-designed
            </p>
            <h2
              className="font-fraunces font-bold mb-4"
              style={{ color: C.ocean, fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.1 }}
            >
              Innovation spotlight
            </h2>
            <p
              className="font-fraunces max-w-2xl mx-auto"
              style={{ color: C.driftwood, fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.55 }}
            >
              Community-designed programs that are making a difference.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {INNOVATION_SPOTLIGHTS.map((project, idx) => (
              <div
                key={idx}
                className={`bg-gradient-to-br ${project.color} rounded-2xl p-8 text-white`}
              >
                <h3
                  className="font-fraunces font-bold mb-3"
                  style={{ fontSize: 26, lineHeight: 1.2 }}
                >
                  {project.title}
                </h3>
                <p className="font-fraunces leading-relaxed" style={{ color: 'rgba(255,255,255,0.92)', fontSize: 16 }}>{project.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Looking Forward */}
      <section className="py-20 px-4" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p
              className="font-bold uppercase mb-4"
              style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
            >
              The next chapter
            </p>
            <h2
              className="font-fraunces font-bold mb-4"
              style={{ color: C.ocean, fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.1 }}
            >
              Looking forward
            </h2>
            <p
              className="font-fraunces max-w-2xl mx-auto"
              style={{ color: C.driftwood, fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.55 }}
            >
              Our goals for the next chapter of community-controlled service delivery.
            </p>
          </div>
          <VisionSection goals={VISION_GOALS} />
        </div>
      </section>

      {/* Community Voices */}
      {communityQuotes.length > 0 && (
        <section
          className="py-20 px-4 text-white"
          style={{ background: `linear-gradient(135deg, ${C.earth}, ${C.midnight})` }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p
                className="font-bold uppercase mb-4"
                style={{ color: C.ochre, fontSize: 11, letterSpacing: '0.3em' }}
              >
                In our voices
              </p>
              <h2
                className="font-fraunces font-bold mb-4"
                style={{ fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.1 }}
              >
                Community voices
              </h2>
              <p
                className="font-fraunces"
                style={{ color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: 1.55 }}
              >
                What Palm Islanders say about their community company.
              </p>
            </div>
            <div className={`grid grid-cols-1 gap-6 ${communityQuotes.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
              {communityQuotes.map((q) => (
                <div
                  key={q.id}
                  className="rounded-2xl p-6"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  <p
                    className="font-fraunces italic mb-4 leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.95)', fontSize: 17 }}
                  >
                    &ldquo;{q.quote}&rdquo;
                  </p>
                  <p
                    className="font-bold uppercase"
                    style={{ color: C.ochre, fontSize: 11, letterSpacing: '0.2em' }}
                  >
                    — {q.speaker_name || q.speaker_role || 'Community member'}
                    {q.speaker_name && q.speaker_role ? ` · ${q.speaker_role}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-4" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p
            className="font-bold uppercase mb-4"
            style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
          >
            Add your voice
          </p>
          <h2
            className="font-fraunces font-bold mb-8"
            style={{ color: C.ocean, fontSize: 'clamp(28px, 4.5vw, 40px)', lineHeight: 1.1 }}
          >
            Be part of the journey
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/share-voice"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-bold uppercase text-xs hover:opacity-90 transition"
              style={{ backgroundColor: C.ocean, color: '#FBF8EE', letterSpacing: '0.15em' }}
            >
              Share your story
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/annual-report/live"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-bold uppercase text-xs hover:opacity-90 transition"
              style={{ backgroundColor: 'transparent', color: C.ocean, border: `2px solid ${C.ocean}`, letterSpacing: '0.15em' }}
            >
              View annual report
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
