'use client';

import React from 'react';
import Link from 'next/link';
import { Users, MapPin, BookOpen, Camera, Heart, Lightbulb, Award, Globe, Video, Map } from 'lucide-react';
import { BespokeIcon } from '@/components/ui/BespokeIcon';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';
import ProjectMediaGallery from '@/components/wiki/ProjectMediaGallery';

export default function EldersTripPage() {
  const breadcrumbs = [
    { label: 'Wiki', href: '/wiki' },
    { label: 'Innovation', href: '/wiki/innovation' },
    { label: 'Elders Trip', href: '/wiki/innovation/elders-trip' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-10 w-10 text-picc-red" />
          <h1 className="text-4xl font-bold text-gray-900">
            Elders Trip to Hull River
          </h1>
        </div>
        <p className="text-xl text-gray-600 mb-4">
          Recording traditional knowledge through return journeys to traditional country
        </p>
        <div className="flex flex-wrap gap-3">
          <span className="px-4 py-2 bg-picc-ochre-100 text-picc-earth rounded-lg border border-picc-ochre-300 font-medium">
            Status: Planning
          </span>
          <span className="px-4 py-2 bg-warm-100 text-picc-earth rounded-lg border border-picc-red-300 font-medium">
            Year Started: 2024
          </span>
          <span className="px-4 py-2 bg-sage-100 text-emerald-800 rounded-lg border border-sage-300 font-medium">
            Impact: Cultural Preservation & Native Title
          </span>
        </div>
      </div>

      {/* Vision Statement */}
      <div className="bg-gradient-to-r from-warm-50 to-picc-ochre-50 border border-warm-200 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="h-6 w-6 text-picc-red" />
          Vision
        </h2>
        <p className="text-gray-700 text-lg mb-4">
          The Elders Trip to Hull River project documents return journeys to traditional Manbarra
          country, recording traditional knowledge, place names, stories, and cultural practices
          directly from elders who hold this knowledge.
        </p>
        <p className="text-gray-600">
          This creates living records that serve multiple purposes: preserving cultural knowledge
          for future generations, strengthening native title evidence, and demonstrating the deep,
          continuing connection of Manbarra people to their traditional country.
        </p>
      </div>

      {/* Key Objectives */}
      <div className="bg-white rounded-lg border border-stone-300 shadow-sm overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-stone-100 to-warm-50 border-b border-stone-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">Key Objectives</h2>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <BookOpen className="h-6 w-6 text-picc-red flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Knowledge Preservation</h3>
                <p className="text-sm text-gray-600">
                  Record traditional place names, songlines, cultural practices, and oral histories
                  before they are lost. Create high-quality audio/video documentation with full
                  cultural protocols and elder permission.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Award className="h-6 w-6 text-sage-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Native Title Evidence</h3>
                <p className="text-sm text-gray-600">
                  Strengthen native title claims by documenting continuous connection to country,
                  traditional laws, customs, and knowledge systems that have been maintained across
                  generations.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Users className="h-6 w-6 text-picc-ochre flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Intergenerational Learning</h3>
                <p className="text-sm text-gray-600">
                  Bring younger community members on trips to learn directly from elders in country,
                  strengthening cultural transmission and creating mentorship opportunities.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Heart className="h-6 w-6 text-picc-red flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Elder Wellbeing</h3>
                <p className="text-sm text-gray-600">
                  Support elders to return to country, strengthening their spiritual and emotional
                  wellbeing while honoring their role as knowledge keepers and cultural authorities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Innovation Elements */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-picc-ochre" />
          What Makes This Innovative
        </h2>
        <div className="space-y-4">
          <div className="bg-picc-ochre-50 border border-picc-ochre-200 rounded-lg p-6">
            <h3 className="font-bold text-picc-earth mb-2 flex items-center gap-2">
              <Video className="h-5 w-5 inline" />
              Multi-Media Documentation
            </h3>
            <p className="text-gray-700 text-sm">
              Using professional-grade recording equipment (4K video, spatial audio, GPS mapping)
              to create archival-quality records that meet both cultural and legal evidentiary standards.
              All recordings managed under strict cultural protocols with elder control over access and use.
            </p>
          </div>
          <div className="bg-warm-50 border border-warm-200 rounded-lg p-6">
            <h3 className="font-bold text-picc-earth mb-2 flex items-center gap-2">
              <Map className="h-5 w-5 inline" />
              Digital Mapping Integration
            </h3>
            <p className="text-gray-700 text-sm">
              GPS-tagged traditional place names and cultural sites, integrated into GIS systems
              for native title purposes while maintaining cultural sensitivity. Community controls
              what information is public vs. restricted.
            </p>
          </div>
          <div className="bg-sage-50 border border-sage-200 rounded-lg p-6">
            <h3 className="font-bold text-sage-900 mb-2 flex items-center gap-2">
              <BespokeIcon name="knowledge" size={20} className="inline" />
              Living Knowledge Base
            </h3>
            <p className="text-gray-700 text-sm">
              Recordings stored in community-controlled digital infrastructure (Palm Island Local Server),
              not external platforms. Ensures data sovereignty and cultural safety while enabling future
              access for education, research, and legal purposes.
            </p>
          </div>
          <div className="bg-warm-100 border border-warm-200 rounded-lg p-6">
            <h3 className="font-bold text-picc-earth-600 mb-2 flex items-center gap-2">
              <Users className="h-5 w-5 inline" />
              Collaborative Methodology
            </h3>
            <p className="text-gray-700 text-sm">
              Co-designed with elders to ensure cultural protocols are followed. Elders decide what
              is recorded, who can access recordings, and how knowledge is shared. This isn't extractive
              research - it's community-controlled knowledge preservation.
            </p>
          </div>
        </div>
      </div>

      {/* Implementation Plan */}
      <div className="bg-white rounded-lg border border-stone-300 shadow-sm overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-stone-100 to-picc-ochre-50 border-b border-stone-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">Implementation Plan</h2>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-warm-100 rounded-lg flex items-center justify-center border border-picc-red-300">
                <span className="text-picc-red font-bold">1</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">Elder Consultation (Current Phase)</h3>
                <p className="text-sm text-gray-600">
                  Meeting with elders to understand what knowledge should be recorded, what protocols
                  must be followed, and who should participate in trips. Establishing consent frameworks
                  and access controls.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-picc-ochre-100 rounded-lg flex items-center justify-center border border-picc-ochre-300">
                <span className="text-picc-ochre font-bold">2</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">Equipment & Training</h3>
                <p className="text-sm text-gray-600">
                  Procure recording equipment (cameras, audio recorders, GPS units) and train community
                  members in professional documentation techniques. Ensure all technical staff understand
                  cultural protocols.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center border border-sage-300">
                <span className="text-sage-700 font-bold">3</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">Pilot Trip</h3>
                <p className="text-sm text-gray-600">
                  Conduct first return journey with 2-3 elders, documenting the process and refining
                  methodology. Test equipment, protocols, and workflows before scaling up.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-warm-100 rounded-lg flex items-center justify-center border border-picc-ochre-300">
                <span className="text-picc-ochre-700 font-bold">4</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">Ongoing Program</h3>
                <p className="text-sm text-gray-600">
                  Regular trips (2-4 per year) with different elders to systematically document traditional
                  country. Build comprehensive knowledge base over 3-5 years while elders are able to travel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expected Outcomes */}
      <div className="bg-gradient-to-r from-sage-50 to-picc-ochre-50 border border-sage-200 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Expected Outcomes</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-sage-600 text-lg">✓</span>
            <p className="text-gray-700">
              <strong>100+ hours</strong> of elder knowledge recordings archived with cultural protocols
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-sage-600 text-lg">✓</span>
            <p className="text-gray-700">
              <strong>200+ traditional place names</strong> documented and GPS-mapped for native title
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-sage-600 text-lg">✓</span>
            <p className="text-gray-700">
              <strong>20+ young people</strong> trained in cultural knowledge and documentation
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-sage-600 text-lg">✓</span>
            <p className="text-gray-700">
              <strong>Strengthened native title</strong> evidence through documented continuous connection
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-sage-600 text-lg">✓</span>
            <p className="text-gray-700">
              <strong>Educational resources</strong> for schools, cultural programs, and community
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-sage-600 text-lg">✓</span>
            <p className="text-gray-700">
              <strong>Replicable model</strong> for other Indigenous communities to preserve knowledge
            </p>
          </div>
        </div>
      </div>

      {/* Photo Gallery & Videos */}
      <ProjectMediaGallery
        projectTag="project:elders-trips"
        title="Elders Trip Gallery"
        limit={16}
      />

      {/* Links to Related Pages */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          href="/wiki/culture"
          className="block p-6 bg-gradient-to-r from-warm-50 to-picc-ochre-50 border border-warm-200 rounded-lg hover:shadow-md transition-all group"
        >
          <Globe className="h-8 w-8 text-picc-red mb-2" />
          <h3 className="font-bold text-picc-earth mb-2 group-hover:text-picc-red">
            Culture & Language
          </h3>
          <p className="text-sm text-gray-700">
            Learn about Manbarra culture
          </p>
        </Link>
        <Link
          href="/wiki/people?filter=elder"
          className="block p-6 bg-gradient-to-r from-warm-100 to-warm-50 border border-warm-200 rounded-lg hover:shadow-md transition-all group"
        >
          <Users className="h-8 w-8 text-picc-ochre mb-2" />
          <h3 className="font-bold text-picc-earth-600 mb-2 group-hover:text-picc-ochre-700">
            Meet Our Elders
          </h3>
          <p className="text-sm text-gray-700">
            Knowledge keepers and cultural authorities
          </p>
        </Link>
        <Link
          href="/wiki/innovation"
          className="block p-6 bg-gradient-to-r from-picc-ochre-50 to-orange-50 border border-picc-ochre-200 rounded-lg hover:shadow-md transition-all group"
        >
          <Lightbulb className="h-8 w-8 text-picc-ochre mb-2" />
          <h3 className="font-bold text-picc-earth mb-2 group-hover:text-picc-ochre">
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
