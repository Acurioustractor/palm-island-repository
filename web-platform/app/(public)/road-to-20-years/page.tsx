import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calendar, Users, Heart, Award, BookOpen } from 'lucide-react';
import MilestoneTimeline, { Milestone } from '@/components/road-to-20-years/MilestoneTimeline';
import VisionSection from '@/components/road-to-20-years/VisionSection';

export const metadata: Metadata = {
  title: 'Road to 20 Years | Palm Island Community Company',
  description: 'Celebrating PICC\'s journey from community control to 20 years of self-determined service delivery on Palm Island.',
};

const MILESTONES: Milestone[] = [
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
    title: '197 Staff, 33 Services',
    description: 'PICC grows to 197 staff members delivering 33 services across health, family, justice, culture, education, and economic development. Total income reaches $23.4 million.',
    era: 'today',
  },
  {
    year: '2026',
    title: 'Road to 20 Years',
    description: 'Looking ahead to PICC\'s 20th anniversary of community control in 2041. Building on the foundation of self-determination, cultural strength, and community-led innovation.',
    era: 'today',
  },
];

const VISION_GOALS = [
  {
    title: 'Service Expansion',
    description: 'Grow from 33 to 40+ community services, including new mental health, aged care, and youth development programs designed by and for Palm Islanders.',
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
  { value: '197', label: 'Staff Members', icon: Users },
  { value: '33', label: 'Services Delivered', icon: Heart },
  { value: '$23.4M', label: 'Annual Income', icon: Award },
  { value: '42', label: 'Language Groups United', icon: BookOpen },
  { value: '2,283', label: 'Health Clients Served', icon: Heart },
  { value: '6,698', label: 'Placement Nights (Family Care)', icon: Users },
];

const INNOVATION_SPOTLIGHTS = [
  {
    title: 'Digital Service Centre',
    description: 'Bridging the digital divide on Palm Island with technology access, literacy programs, and connected government services.',
    color: 'from-purple-600 to-indigo-600',
  },
  {
    title: 'Elders Cultural Trips',
    description: 'Reconnecting Elders with Country through cultural trips that strengthen identity, share knowledge across generations, and honour traditional connections.',
    color: 'from-amber-600 to-orange-600',
  },
  {
    title: 'Delegated Authority',
    description: 'A nationally-recognised model putting community in control of child protection decisions — designed on Palm Island, now inspiring others.',
    color: 'from-emerald-600 to-teal-600',
  },
  {
    title: 'First 1,000 Days',
    description: 'Supporting families during the most critical developmental window, combining maternal health, nutrition, and cultural connection from pregnancy to age two.',
    color: 'from-rose-600 to-pink-600',
  },
];

export default function RoadTo20YearsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(139,92,246,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59,130,246,0.3) 0%, transparent 50%)',
          }} />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6">
            <Calendar className="w-4 h-4" />
            Community Control Since 2021
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            The Road to<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              20 Years
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            From Hull River to community control — Palm Island Community Company&apos;s journey of resilience, self-determination, and community-led innovation.
          </p>
          <p className="mt-6 text-lg text-purple-300 italic">
            &ldquo;Our Community, Our Future, Our Way&rdquo;
          </p>
        </div>
      </section>

      {/* Interactive Timeline */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From the founding of Palm Island through to today&apos;s community-controlled future
            </p>
          </div>
          <MilestoneTimeline milestones={MILESTONES} />
        </div>
      </section>

      {/* By the Numbers */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">By the Numbers</h2>
            <p className="text-xl text-gray-600">
              The impact of community-controlled service delivery
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {BY_THE_NUMBERS.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="text-center p-6 bg-gray-50 rounded-2xl">
                  <Icon className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Innovation Spotlight */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Innovation Spotlight</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Community-designed programs that are making a difference
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {INNOVATION_SPOTLIGHTS.map((project, idx) => (
              <div
                key={idx}
                className={`bg-gradient-to-br ${project.color} rounded-2xl p-8 text-white`}
              >
                <h3 className="text-2xl font-bold mb-3">{project.title}</h3>
                <p className="text-white/90 leading-relaxed">{project.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Looking Forward */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Looking Forward</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our goals for the next chapter of community-controlled service delivery
            </p>
          </div>
          <VisionSection goals={VISION_GOALS} />
        </div>
      </section>

      {/* Community Voices */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-900 to-gray-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Community Voices</h2>
            <p className="text-xl text-purple-200">
              What Palm Islanders say about their community company
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <p className="text-white/90 italic mb-4 leading-relaxed">
                &ldquo;For the first time, we&apos;re making decisions about our own community. That&apos;s what self-determination looks like.&rdquo;
              </p>
              <p className="text-purple-300 text-sm font-semibold">— Community Elder</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <p className="text-white/90 italic mb-4 leading-relaxed">
                &ldquo;PICC brought healing services that understand our culture. They don&apos;t just treat the body — they heal the spirit.&rdquo;
              </p>
              <p className="text-purple-300 text-sm font-semibold">— Health Service Client</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <p className="text-white/90 italic mb-4 leading-relaxed">
                &ldquo;Working at PICC means working for my own people. Every day I know I&apos;m making a difference for Palm Island families.&rdquo;
              </p>
              <p className="text-purple-300 text-sm font-semibold">— PICC Staff Member</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Be Part of the Journey</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/share-voice"
              className="inline-flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold"
            >
              Share Your Story
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/annual-report/live"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-purple-300 hover:text-purple-700 transition-colors font-semibold"
            >
              View Annual Report
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
