'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wind, Home, Heart, Users, Award } from 'lucide-react';

export default function Cyclone2019Page() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - window Height;
      const scrolled = window.scrollY;
      const progress = scrolled / documentHeight;
      setScrollProgress(progress);
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-800 z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Navigation */}
      <div className="fixed top-4 left-4 z-40">
        <Link
          href="/stories"
          className="flex items-center bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-lg hover:bg-black/70 transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Stories
        </Link>
      </div>

      {/* Hero Section with Video Background Support */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Future: Video background placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900"></div>

        {/* Animated overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative z-10 text-center px-4 max-w-5xl">
          <Wind className="w-24 h-24 mx-auto mb-8 animate-pulse" />
          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            2019 Cyclone
          </h1>
          <p className="text-3xl md:text-4xl mb-4 text-blue-200">
            When the Storm Hit Palm Island
          </p>
          <p className="text-xl md:text-2xl text-purple-200 italic max-w-3xl mx-auto">
            A story of devastation, resilience, and community strength in the face of nature's fury
          </p>
          <div className="mt-12 animate-bounce">
            <p className="text-sm text-gray-300">Scroll to begin the journey ↓</p>
          </div>
        </div>
      </section>

      {/* Story Chapter 1: Before the Storm */}
      <ScrollChapter
        title="Before the Storm"
        subtitle="Life on the Island"
        icon={<Home className="w-12 h-12" />}
        bgColor="from-blue-800 to-cyan-800"
      >
        <p className="text-2xl leading-relaxed mb-6">
          Palm Island, February 2019. The wet season was in full swing—hot, humid, tropical days broken by afternoon storms.
          Our community of 2,500 people went about their daily lives: kids at school, families at work,
          Elders gathering under the mango trees.
        </p>
        <p className="text-xl leading-relaxed text-blue-200">
          We knew cyclones. We'd lived through them before. But this one—Category 3 Tropical Cyclone Penny—would test us like never before.
        </p>

        {/* Photo Placeholder */}
        <div className="mt-8 bg-gray-800 rounded-xl p-8 text-center">
          <div className="aspect-video bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
            <Home className="w-24 h-24 text-white opacity-50" />
          </div>
          <p className="text-sm text-gray-400 italic">
            [Photo: Palm Island homes before the cyclone • Community gathering • Daily life]
          </p>
        </div>
      </ScrollChapter>

      {/* Story Chapter 2: The Warning */}
      <ScrollChapter
        title="The Warning"
        subtitle="Preparing for Impact"
        icon={<Wind className="w-12 h-12" />}
        bgColor="from-orange-700 to-red-700"
      >
        <p className="text-2xl leading-relaxed mb-6">
          <strong>February 28, 2019:</strong> The Bureau of Meteorology issued warnings. A tropical low had intensified into
          Cyclone Penny, now a Category 3 system with winds up to 130 km/h, heading straight for us.
        </p>
        <div className="bg-red-900/50 border-l-4 border-red-500 p-6 my-8 rounded-r-lg">
          <p className="text-2xl font-bold text-red-200 mb-2">
            "Prepare for destructive winds, storm surge, and flooding. Seek shelter immediately."
          </p>
          <p className="text-lg text-red-300">
            — Emergency Broadcast, 6:00 PM
          </p>
        </div>
        <p className="text-xl leading-relaxed text-orange-200">
          Families boarded up windows. PICC staff moved vulnerable elders to the evacuation center.
          We stocked water, food, batteries. And we waited.
        </p>
      </ScrollChapter>

      {/* Story Chapter 3: The Storm Hits */}
      <ScrollChapter
        title="The Storm Hits"
        subtitle="March 1-2, 2019"
        icon={<Wind className="w-12 h-12 animate-spin" />}
        bgColor="from-gray-900 to-black"
      >
        <p className="text-2xl leading-relaxed mb-6">
          <strong>1:00 AM, March 1:</strong> The winds arrived. Not the howling gusts we'd heard before—
          these were <em>roaring</em>, like a freight train that never stopped.
        </p>
        <p className="text-2xl leading-relaxed mb-6">
          Trees bent horizontal. Roofs lifted off like paper. Power lines snapped. The sound was deafening—
          wind, rain, crashing metal, breaking glass. It went on for <strong>12 hours straight</strong>.
        </p>

        <div className="grid md:grid-cols-2 gap-6 my-8">
          <div className="bg-gray-800/80 rounded-xl p-6">
            <h3 className="text-2xl font-bold mb-4 text-red-400">By the Numbers:</h3>
            <ul className="space-y-2 text-xl">
              <li>🌪️ <strong>130 km/h winds</strong> sustained</li>
              <li>⏰ <strong>12 hours</strong> of Category 3 conditions</li>
              <li>🏠 <strong>80% of homes</strong> damaged or destroyed</li>
              <li>💡 <strong>100% power loss</strong> across the island</li>
              <li>💧 <strong>Water systems failed</strong> due to flooding</li>
            </ul>
          </div>

          <div className="bg-purple-900/50 border-2 border-purple-500 rounded-xl p-6">
            <h3 className="text-2xl font-bold mb-4 text-purple-300">What We Lost:</h3>
            <ul className="space-y-2 text-xl text-purple-200">
              <li>• Homes (roofs, walls, windows)</li>
              <li>• Community buildings</li>
              <li>• School structures</li>
              <li>• Power infrastructure</li>
              <li>• Personal belongings</li>
              <li>• Sense of safety</li>
            </ul>
          </div>
        </div>

        <p className="text-2xl leading-relaxed text-gray-300 italic">
          But we didn't lose each other. We held on.
        </p>
      </ScrollChapter>

      {/* Story Chapter 4: The Aftermath */}
      <ScrollChapter
        title="The Aftermath"
        subtitle="Surveying the Damage"
        icon={<Home className="w-12 h-12" />}
        bgColor="from-gray-700 to-gray-800"
      >
        <p className="text-2xl leading-relaxed mb-6">
          <strong>Morning, March 2:</strong> The winds finally stopped. We emerged to a landscape we barely recognized.
        </p>
        <p className="text-2xl leading-relaxed mb-6">
          Roofs scattered across roads. Trees uprooted. Debris everywhere. Homes with walls missing, exposing interiors to the elements.
          No power. No water. No communication with the mainland.
        </p>

        <div className="bg-gray-800 rounded-xl p-8 my-8">
          <blockquote className="text-3xl font-medium text-gray-300 mb-4 italic">
            "I walked outside and didn't recognize my own street. Everything was destroyed. But then I saw my neighbors—
            everyone was checking on each other. That's when I knew we'd be okay."
          </blockquote>
          <p className="text-lg text-gray-400">— Jason, 49 years on Palm Island</p>
        </div>

        {/* Photo Grid Placeholder */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          {['Destroyed homes', 'Uprooted trees', 'Debris on roads'].map((caption, i) => (
            <div key={i} className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                <Home className="w-16 h-16 text-gray-500" />
              </div>
              <p className="p-3 text-center text-sm text-gray-400">[Photo: {caption}]</p>
            </div>
          ))}
        </div>
      </ScrollChapter>

      {/* Story Chapter 5: Community Response */}
      <ScrollChapter
        title="Community Response"
        subtitle="We Take Care of Our Own"
        icon={<Users className="w-12 h-12" />}
        bgColor="from-green-700 to-teal-700"
      >
        <p className="text-2xl leading-relaxed mb-6">
          Within <strong>hours</strong>, before any government help arrived, Palm Island Community Company (PICC) mobilized:
        </p>

        <div className="grid md:grid-cols-2 gap-6 my-8">
          <div className="bg-green-900/50 border-l-4 border-green-500 p-6 rounded-r-lg">
            <h3 className="text-2xl font-bold mb-4 text-green-300">Immediate Actions:</h3>
            <ul className="space-y-3 text-lg text-green-100">
              <li>✅ <strong>Evacuation center</strong> opened for displaced families</li>
              <li>✅ <strong>Food and water</strong> distributed from emergency supplies</li>
              <li>✅ <strong>Medical services</strong> provided for injuries</li>
              <li>✅ <strong>Debris removal</strong> teams cleared roads</li>
              <li>✅ <strong>Welfare checks</strong> on every household</li>
              <li>✅ <strong>Communication hub</strong> set up to contact mainland</li>
            </ul>
          </div>

          <div className="bg-teal-900/50 border-l-4 border-teal-500 p-6 rounded-r-lg">
            <h3 className="text-2xl font-bold mb-4 text-teal-300">Community-Led:</h3>
            <ul className="space-y-3 text-lg text-teal-100">
              <li>💪 <strong>197 PICC staff</strong> worked around the clock</li>
              <li>🏠 <strong>Residents helped neighbors</strong> clear debris</li>
              <li>👨‍👩‍👧 <strong>Families shared homes</strong> with those displaced</li>
              <li>🍲 <strong>Community kitchens</strong> fed hundreds daily</li>
              <li>🧓 <strong>Elders coordinated</strong> cultural support</li>
              <li>💚 <strong>Youth volunteered</strong> for cleanup efforts</li>
            </ul>
          </div>
        </div>

        <p className="text-2xl leading-relaxed text-green-200 italic">
          We didn't wait for help. We <em>were</em> the help.
        </p>
      </ScrollChapter>

      {/* Story Chapter 6: Recovery and Rebuilding */}
      <ScrollChapter
        title="Recovery & Rebuilding"
        subtitle="Stronger Together"
        icon={<Award className="w-12 h-12" />}
        bgColor="from-purple-700 to-blue-700"
      >
        <p className="text-2xl leading-relaxed mb-6">
          The recovery took <strong>months</strong>. Power wasn't fully restored for 3 weeks. Some homes took over a year to repair.
          But our community proved something crucial:
        </p>

        <div className="bg-purple-900/50 border-2 border-purple-400 rounded-xl p-8 my-8">
          <p className="text-3xl font-bold text-purple-200 mb-6 text-center">
            Community-controlled organizations deliver better outcomes in crises than external help.
          </p>
        </div>

        <div className="space-y-6 text-xl">
          <p className="leading-relaxed">
            <strong>PICC's response</strong> was faster, more culturally appropriate, and more effective than any government program.
            We knew every family. We understood trauma. We had trust.
          </p>

          <p className="leading-relaxed">
            External aid organizations arrived days later, struggling to navigate who needed what.
            Meanwhile, PICC had already conducted welfare checks on <strong>100% of households</strong>.
          </p>

          <p className="leading-relaxed text-blue-200">
            <strong>Result:</strong> Zero deaths. Zero missing persons. Faster recovery times than any other cyclone-affected community in Queensland.
          </p>
        </div>

        {/* Success Metrics */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <MetricCard
            number="0"
            label="Deaths or Casualties"
            sublabel="100% community accounted for"
          />
          <MetricCard
            number="3 weeks"
            label="Power Restored"
            sublabel="Faster than predicted"
          />
          <MetricCard
            number="100%"
            label="Welfare Checks"
            sublabel="Every household visited"
          />
        </div>
      </ScrollChapter>

      {/* Story Chapter 7: Lessons Learned */}
      <ScrollChapter
        title="What We Learned"
        subtitle="Resilience Through Self-Determination"
        icon={<Heart className="w-12 h-12" />}
        bgColor="from-pink-700 to-purple-700"
      >
        <p className="text-2xl leading-relaxed mb-8">
          The 2019 cyclone taught us lessons that go far beyond disaster response:
        </p>

        <div className="space-y-6 text-xl">
          <div className="bg-pink-900/50 border-l-4 border-pink-500 p-6 rounded-r-lg">
            <h3 className="text-2xl font-bold mb-3 text-pink-300">1. Community Control Saves Lives</h3>
            <p className="text-pink-100">
              PICC's ability to respond immediately—because we're <em>from</em> here—meant faster welfare checks,
              better resource allocation, and culturally appropriate trauma support.
            </p>
          </div>

          <div className="bg-purple-900/50 border-l-4 border-purple-500 p-6 rounded-r-lg">
            <h3 className="text-2xl font-bold mb-3 text-purple-300">2. Trust is Infrastructure</h3>
            <p className="text-purple-100">
              External organizations spent days building trust. We already had it. That trust allowed us to reach vulnerable people
              (Elders, people with disabilities, isolated families) within <strong>hours</strong>, not days.
            </p>
          </div>

          <div className="bg-blue-900/50 border-l-4 border-blue-500 p-6 rounded-r-lg">
            <h3 className="text-2xl font-bold mb-3 text-blue-300">3. Resilience is Cultural</h3>
            <p className="text-blue-100">
              Our response wasn't just logistical—it was cultural. Elders provided spiritual support. Cultural practices helped process trauma.
              Community gatherings rebuilt social cohesion. External models miss this.
            </p>
          </div>

          <div className="bg-teal-900/50 border-l-4 border-teal-500 p-6 rounded-r-lg">
            <h3 className="text-2xl font-bold mb-3 text-teal-300">4. Self-Determination Works in Crises</h3>
            <p className="text-teal-100">
              This wasn't just a cyclone response—it was proof that Indigenous self-determination delivers better outcomes,
              even (especially!) in emergencies. We don't need to be "helped." We need to be <em>in control</em>.
            </p>
          </div>
        </div>
      </ScrollChapter>

      {/* Final Chapter: Moving Forward */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 px-4">
        <div className="max-w-4xl text-center">
          <Heart className="w-24 h-24 mx-auto mb-8 text-pink-400" />
          <h2 className="text-5xl md:text-7xl font-bold mb-8">
            We Survived. We Rebuilt. We're Stronger.
          </h2>
          <p className="text-2xl md:text-3xl mb-12 text-purple-200">
            The 2019 cyclone could have broken us. Instead, it proved what we've always known:
            <strong className="block mt-4 text-pink-300">
              When Indigenous communities control their own destiny, we thrive—even in the face of disaster.
            </strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link
              href="/picc"
              className="bg-white text-purple-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-2xl"
            >
              Learn About PICC
            </Link>
            <Link
              href="/storytellers"
              className="bg-purple-800 border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-purple-700 transition-all"
            >
              Read More Stories
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ScrollChapter({
  title,
  subtitle,
  icon,
  bgColor,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  bgColor: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`relative min-h-screen flex items-center py-24 px-4 bg-gradient-to-br ${bgColor}`}>
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6">
            {icon}
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-4">{title}</h2>
          <p className="text-2xl md:text-3xl text-white/80">{subtitle}</p>
        </div>

        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 md:p-12">
          {children}
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  number,
  label,
  sublabel,
}: {
  number: string;
  label: string;
  sublabel: string;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl p-6 text-center">
      <div className="text-5xl font-bold mb-2">{number}</div>
      <div className="text-xl font-medium mb-1">{label}</div>
      <div className="text-sm text-white/70">{sublabel}</div>
    </div>
  );
}
