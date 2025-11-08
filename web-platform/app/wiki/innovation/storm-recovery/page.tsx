'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Heart, TrendingUp, Award, BookOpen, Users, Lightbulb, Sparkles } from 'lucide-react';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';

interface StormStory {
  id: string;
  title: string;
  summary?: string;
  story_category?: string;
  created_at: string;
}

export default function StormRecoveryPage() {
  const [stormStories, setStormStories] = useState<StormStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStormStories() {
      const supabase = createClient();

      // Fetch storm-related stories
      // In real implementation, you'd filter by a storm_recovery tag or category
      const { data, error } = await supabase
        .from('stories')
        .select('id, title, summary, story_category, created_at, is_public')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(26);

      if (error) {
        console.error('Error fetching storm stories:', error);
      } else {
        setStormStories(data || []);
      }

      setLoading(false);
    }

    fetchStormStories();
  }, []);

  const breadcrumbs = [
    { label: 'Wiki', href: '/wiki' },
    { label: 'Innovation', href: '/wiki/innovation' },
    { label: 'Storm Recovery', href: '/wiki/innovation/storm-recovery' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="h-10 w-10 text-rose-600" />
          <h1 className="text-4xl font-bold text-gray-900">
            Storm Recovery Innovations
          </h1>
        </div>
        <p className="text-xl text-gray-600 mb-4">
          Community resilience and innovation during 2024 February floods
        </p>
        <div className="flex flex-wrap gap-3">
          <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg border border-blue-300 font-medium">
            Status: Completed
          </span>
          <span className="px-4 py-2 bg-rose-100 text-rose-800 rounded-lg border border-rose-300 font-medium">
            Event: February 2024 Floods
          </span>
          <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-300 font-medium">
            Impact: Resilience & Recovery
          </span>
        </div>
      </div>

      {/* Context */}
      <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="h-6 w-6 text-rose-600" />
          The Story
        </h2>
        <p className="text-gray-700 text-lg mb-4">
          In February 2024, Palm Island experienced severe flooding that damaged homes, infrastructure,
          and community facilities. Rather than waiting for external help, PICC and the community
          responded with innovative, community-led recovery programs that demonstrated resilience
          and self-determination.
        </p>
        <p className="text-gray-600">
          More importantly, the community documented this journey - creating 26 detailed stories
          that capture not just the crisis, but the innovation, leadership, and community strength
          that emerged in response. This documentation itself is an innovation: turning crisis into
          knowledge, and knowledge into policy impact.
        </p>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-rose-50 rounded-lg p-4 text-center border border-rose-200">
          <div className="text-3xl font-bold text-rose-600">26</div>
          <div className="text-sm text-gray-600">Stories Documented</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
          <div className="text-3xl font-bold text-blue-600">7</div>
          <div className="text-sm text-gray-600">Innovation Programs</div>
        </div>
        <div className="bg-emerald-50 rounded-lg p-4 text-center border border-emerald-200">
          <div className="text-3xl font-bold text-emerald-600">6</div>
          <div className="text-sm text-gray-600">Story Categories</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 text-center border border-amber-200">
          <div className="text-3xl font-bold text-amber-600">100%</div>
          <div className="text-sm text-gray-600">Community-Led</div>
        </div>
      </div>

      {/* Innovation Programs */}
      <div className="bg-white rounded-lg border border-stone-300 shadow-sm overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-stone-100 to-rose-50 border-b border-stone-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-amber-600" />
            Innovative Recovery Programs
          </h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Movember Men's Program */}
          <div className="border-l-4 border-blue-400 bg-blue-50 p-6 rounded-r-lg">
            <div className="flex items-start gap-4">
              <div className="text-4xl">👨</div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 text-lg mb-2">
                  Movember Men's Recovery Program
                </h3>
                <p className="text-gray-700 text-sm mb-3">
                  $1.9 million over 5 years to support men affected by floods and trauma. Combines
                  mental health support with practical recovery assistance, delivered by and for
                  Aboriginal men.
                </p>
                <div className="bg-white rounded p-3 text-xs text-gray-600">
                  <strong>Innovation:</strong> First dedicated men's recovery program in Queensland
                  funded by Movember. Recognizes that disaster recovery requires culturally specific,
                  gender-aware approaches rather than one-size-fits-all solutions.
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible Beds */}
          <div className="border-l-4 border-emerald-400 bg-emerald-50 p-6 rounded-r-lg">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🛏️</div>
              <div className="flex-1">
                <h3 className="font-bold text-emerald-900 text-lg mb-2">
                  Experimental Collapsible Beds
                </h3>
                <p className="text-gray-700 text-sm mb-3">
                  Trial of innovative collapsible bed frames distributed to families who lost furniture
                  in floods. Provides immediate sleeping solutions while permanent replacements are
                  arranged.
                </p>
                <div className="bg-white rounded p-3 text-xs text-gray-600">
                  <strong>Innovation:</strong> Rapid response with experimental technology. Willingness
                  to trial new solutions rather than wait for "proven" options demonstrates agility
                  and community-centered decision making.
                </div>
              </div>
            </div>
          </div>

          {/* Washing Machine Distribution */}
          <div className="border-l-4 border-purple-400 bg-purple-50 p-6 rounded-r-lg">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🧺</div>
              <div className="flex-1">
                <h3 className="font-bold text-purple-900 text-lg mb-2">
                  Washing Machine Distribution
                </h3>
                <p className="text-gray-700 text-sm mb-3">
                  Community-coordinated distribution of washing machines to families who lost appliances.
                  Prioritized families with young children and those with health needs.
                </p>
                <div className="bg-white rounded p-3 text-xs text-gray-600">
                  <strong>Innovation:</strong> Community-led needs assessment and distribution rather
                  than top-down allocation. Demonstrates local knowledge is more effective than
                  external agencies for determining who needs what.
                </div>
              </div>
            </div>
          </div>

          {/* Orange Sky Partnership */}
          <div className="border-l-4 border-amber-400 bg-amber-50 p-6 rounded-r-lg">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🚐</div>
              <div className="flex-1">
                <h3 className="font-bold text-amber-900 text-lg mb-2">
                  Orange Sky Mobile Laundry
                </h3>
                <p className="text-gray-700 text-sm mb-3">
                  Partnership with Orange Sky to provide mobile laundry services while washing
                  machines were unavailable. Maintained dignity and hygiene during recovery period.
                </p>
                <div className="bg-white rounded p-3 text-xs text-gray-600">
                  <strong>Innovation:</strong> Creative partnership with external organization
                  typically focused on homelessness. Shows adaptability in leveraging existing
                  services for disaster recovery context.
                </div>
              </div>
            </div>
          </div>

          {/* Food Distribution */}
          <div className="border-l-4 border-rose-400 bg-rose-50 p-6 rounded-r-lg">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🍌</div>
              <div className="flex-1">
                <h3 className="font-bold text-rose-900 text-lg mb-2">
                  Quality Food Distribution Network
                </h3>
                <p className="text-gray-700 text-sm mb-3">
                  Partnership with Woolworths to distribute fresh produce (including quality bananas)
                  to affected families. Rejected low-quality "charity food" in favor of dignified,
                  nutritious options.
                </p>
                <div className="bg-white rounded p-3 text-xs text-gray-600">
                  <strong>Innovation:</strong> Insisted on quality rather than accepting substandard
                  "disaster food." Demonstrates that disaster recovery should maintain dignity and
                  nutrition, not just survival.
                </div>
              </div>
            </div>
          </div>

          {/* Elder Governance */}
          <div className="border-l-4 border-teal-400 bg-teal-50 p-6 rounded-r-lg">
            <div className="flex items-start gap-4">
              <div className="text-4xl">👴</div>
              <div className="flex-1">
                <h3 className="font-bold text-teal-900 text-lg mb-2">
                  Elder-Led Recovery Governance
                </h3>
                <p className="text-gray-700 text-sm mb-3">
                  Elders provided cultural guidance and decision-making authority throughout recovery.
                  Ensured traditional protocols and community values guided all recovery efforts.
                </p>
                <div className="bg-white rounded p-3 text-xs text-gray-600">
                  <strong>Innovation:</strong> Centering cultural authority in disaster management
                  rather than defaulting to government or emergency services protocols. Shows
                  Indigenous governance can lead crisis response.
                </div>
              </div>
            </div>
          </div>

          {/* Documentation Innovation */}
          <div className="border-l-4 border-indigo-400 bg-indigo-50 p-6 rounded-r-lg">
            <div className="flex items-start gap-4">
              <div className="text-4xl">📖</div>
              <div className="flex-1">
                <h3 className="font-bold text-indigo-900 text-lg mb-2">
                  Systematic Story Documentation
                </h3>
                <p className="text-gray-700 text-sm mb-3">
                  Rather than just recovering, the community documented 26 detailed stories covering
                  every aspect of the crisis and response. These stories now inform policy and
                  demonstrate community capability.
                </p>
                <div className="bg-white rounded p-3 text-xs text-gray-600">
                  <strong>Innovation:</strong> Treating lived experience as valuable knowledge to
                  be systematically captured and shared. This documentation is now used for funding
                  applications, policy advocacy, and replication by other communities.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Story Categories */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          Documented Story Categories
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-blue-900 mb-2">Men's Programs & Recovery (4 stories)</h3>
            <p className="text-sm text-gray-700">
              Movember partnership, men's group activities, trauma support, and recovery programs
              specifically designed for Aboriginal men.
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
            <h3 className="font-bold text-emerald-900 mb-2">Infrastructure & Housing (7 stories)</h3>
            <p className="text-sm text-gray-700">
              Damage assessment, housing repairs, collapsible beds, washing machines, and material
              support for affected families.
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="font-bold text-purple-900 mb-2">Elder Wisdom & Governance (4 stories)</h3>
            <p className="text-sm text-gray-700">
              Elder leadership during crisis, cultural protocols in recovery, traditional knowledge
              applied to modern challenges.
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h3 className="font-bold text-amber-900 mb-2">Community Services (3 stories)</h3>
            <p className="text-sm text-gray-700">
              PICC service continuity during crisis, playgroup support for children, family
              wellbeing programs during stress.
            </p>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-6">
            <h3 className="font-bold text-rose-900 mb-2">Historical Context & Systems (4 stories)</h3>
            <p className="text-sm text-gray-700">
              How historical trauma and systemic disadvantage compound natural disasters, and why
              self-determination is the solution.
            </p>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
            <h3 className="font-bold text-teal-900 mb-2">Cultural Preservation (4 stories)</h3>
            <p className="text-sm text-gray-700">
              Protecting cultural items and knowledge during floods, land rights issues, traditional
              connections to country.
            </p>
          </div>
        </div>
      </div>

      {/* Policy Impact */}
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-emerald-600" />
          Policy & Funding Impact
        </h2>
        <p className="text-gray-700 mb-4">
          The documented storm stories have already generated significant impact:
        </p>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="text-emerald-600 text-xl">✓</span>
            <div>
              <strong className="text-gray-900">$1.9M Movember Funding:</strong>
              <span className="text-gray-700 text-sm ml-2">
                Stories of men's trauma and recovery secured major multi-year funding for men's programs
              </span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-emerald-600 text-xl">✓</span>
            <div>
              <strong className="text-gray-900">Government Disaster Response:</strong>
              <span className="text-gray-700 text-sm ml-2">
                Documentation influenced Queensland government disaster recovery protocols for
                Indigenous communities
              </span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-emerald-600 text-xl">✓</span>
            <div>
              <strong className="text-gray-900">Replication by Other Communities:</strong>
              <span className="text-gray-700 text-sm ml-2">
                Other Indigenous communities now using PICC's documentation approach for their own
                disaster recovery
              </span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-emerald-600 text-xl">✓</span>
            <div>
              <strong className="text-gray-900">Academic Recognition:</strong>
              <span className="text-gray-700 text-sm ml-2">
                Stories used as case study in disaster management and Indigenous governance research
              </span>
            </div>
          </li>
        </ul>
      </div>

      {/* Storm Stories (if loaded) */}
      {!loading && stormStories.length > 0 && (
        <div className="bg-white rounded-lg border border-stone-300 shadow-sm overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-stone-100 to-blue-50 border-b border-stone-200 px-6 py-4">
            <h2 className="text-2xl font-bold text-gray-900">Browse Storm Recovery Stories</h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              {stormStories.slice(0, 6).map((story) => (
                <Link
                  key={story.id}
                  href={`/stories/${story.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-rose-300 hover:bg-rose-50/50 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-rose-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-rose-700 mb-1">
                        {story.title}
                      </h3>
                      {story.summary && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {story.summary}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/stories"
                className="inline-block px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-semibold"
              >
                View All Stories →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Links to Related Pages */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          href="/wiki/services"
          className="block p-6 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-lg hover:shadow-md transition-all group"
        >
          <Heart className="h-8 w-8 text-rose-600 mb-2" />
          <h3 className="font-bold text-rose-900 mb-2 group-hover:text-rose-700">
            PICC Services
          </h3>
          <p className="text-sm text-gray-700">
            Services that led recovery
          </p>
        </Link>
        <Link
          href="/wiki/achievements"
          className="block p-6 bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 rounded-lg hover:shadow-md transition-all group"
        >
          <Award className="h-8 w-8 text-blue-600 mb-2" />
          <h3 className="font-bold text-blue-900 mb-2 group-hover:text-blue-700">
            Achievements
          </h3>
          <p className="text-sm text-gray-700">
            See all community achievements
          </p>
        </Link>
        <Link
          href="/wiki/innovation"
          className="block p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg hover:shadow-md transition-all group"
        >
          <Lightbulb className="h-8 w-8 text-amber-600 mb-2" />
          <h3 className="font-bold text-amber-900 mb-2 group-hover:text-amber-700">
            All Innovation Projects
          </h3>
          <p className="text-sm text-gray-700">
            See other PICC innovations
          </p>
        </Link>
      </div>
    </div>
  );
}
