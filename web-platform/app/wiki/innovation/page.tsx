'use client';

import React from 'react';
import Link from 'next/link';
import { Lightbulb, Users, Sparkles, BarChart3, Heart, TrendingUp, Award, BookOpen } from 'lucide-react';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';

interface InnovationProject {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  color: string;
  bgColor: string;
  borderColor: string;
  status: 'Active' | 'Planning' | 'Completed';
  impact: string;
  yearStarted: string;
}

export default function InnovationPage() {
  const projects: InnovationProject[] = [
    {
      id: 'elders-trip',
      title: 'Elders Trip to Hull River',
      description: 'Recording traditional knowledge and return journeys to traditional country with elders, preserving cultural knowledge and strengthening native title evidence.',
      icon: Users,
      href: '/wiki/innovation/elders-trip',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      status: 'Planning',
      impact: 'Cultural preservation & native title',
      yearStarted: '2024',
    },
    {
      id: 'photo-studio',
      title: 'On-Country Photo Studio',
      description: 'Beautiful, dignified photography celebrating community members. Cultural protocols integrated into every photo, creating positive visual narratives.',
      icon: Sparkles,
      href: '/wiki/innovation/photo-studio',
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      status: 'Active',
      impact: 'Dignity & representation',
      yearStarted: '2024',
    },
    {
      id: 'local-server',
      title: 'Palm Island Local Server',
      description: 'Community-controlled data infrastructure ensuring data sovereignty, cultural safety, and resilient local access to community knowledge.',
      icon: BarChart3,
      href: '/wiki/innovation/local-server',
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      status: 'Planning',
      impact: 'Data sovereignty',
      yearStarted: '2024',
    },
    {
      id: 'storm-recovery',
      title: 'Storm Recovery Innovations',
      description: '26 documented stories from 2024 floods showcasing community resilience, experimental programs (Movember, collapsible beds), and service innovation.',
      icon: Heart,
      href: '/wiki/innovation/storm-recovery',
      color: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      status: 'Completed',
      impact: 'Resilience & recovery',
      yearStarted: '2024',
    },
  ];

  const breadcrumbs = [
    { label: 'Wiki', href: '/wiki' },
    { label: 'Innovation', href: '/wiki/innovation' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <Lightbulb className="h-10 w-10 text-amber-600" />
          PICC Innovation Projects
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          Demonstrating Indigenous excellence through community-controlled innovation
        </p>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
          <p className="text-gray-700">
            PICC is pioneering new approaches to community services, knowledge preservation, and
            Indigenous self-determination. Our innovation projects prove that community-controlled
            organizations can lead in technology, cultural preservation, and service delivery.
          </p>
        </div>
      </div>

      {/* Key Innovation Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-amber-50 rounded-lg p-4 text-center border border-amber-200">
          <div className="text-3xl font-bold text-amber-600">4</div>
          <div className="text-sm text-gray-600">Innovation Projects</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
          <div className="text-3xl font-bold text-blue-600">2024</div>
          <div className="text-sm text-gray-600">Innovation Year</div>
        </div>
        <div className="bg-emerald-50 rounded-lg p-4 text-center border border-emerald-200">
          <div className="text-3xl font-bold text-emerald-600">100%</div>
          <div className="text-sm text-gray-600">Community Control</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-200">
          <div className="text-3xl font-bold text-purple-600">26</div>
          <div className="text-sm text-gray-600">Storm Stories</div>
        </div>
      </div>

      {/* Innovation Philosophy */}
      <div className="bg-white rounded-lg border border-stone-300 shadow-sm overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-stone-100 to-amber-50 border-b border-stone-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-amber-600" />
            Why PICC Innovates
          </h2>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg p-6 border border-blue-200">
              <Award className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-bold text-blue-900 mb-2">Cultural Preservation</h3>
              <p className="text-sm text-gray-700">
                Innovation serves culture - using technology to preserve traditional knowledge,
                language, and practices for future generations.
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-6 border border-emerald-200">
              <BarChart3 className="h-8 w-8 text-emerald-600 mb-3" />
              <h3 className="font-bold text-emerald-900 mb-2">Data Sovereignty</h3>
              <p className="text-sm text-gray-700">
                Community owns and controls its data, stories, and knowledge infrastructure -
                no external platforms or dependencies.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
              <Heart className="h-8 w-8 text-purple-600 mb-3" />
              <h3 className="font-bold text-purple-900 mb-2">Service Excellence</h3>
              <p className="text-sm text-gray-700">
                Innovation improves service delivery, outcomes, and community wellbeing -
                proving Indigenous orgs can lead in quality.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Innovation Projects Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Innovation Projects</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={project.href}
              className="group block bg-white rounded-xl border-2 border-stone-300 hover:border-amber-400 overflow-hidden transition-all hover:shadow-lg"
            >
              {/* Project Header */}
              <div className={`${project.bgColor} ${project.borderColor} border-b px-6 py-4`}>
                <div className="flex items-start justify-between mb-2">
                  <project.icon className={`h-8 w-8 ${project.color}`} />
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : project.status === 'Completed'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                <h3 className={`text-xl font-bold ${project.color} group-hover:underline`}>
                  {project.title}
                </h3>
              </div>

              {/* Project Content */}
              <div className="p-6">
                <p className="text-gray-700 mb-4">{project.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-gray-600">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {project.impact}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>{project.yearStarted}</span>
                  </div>
                  <span className="text-amber-600 group-hover:text-amber-700 font-medium">
                    Learn more →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Impact Statement */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl p-8 text-white mb-8">
        <div className="flex items-start gap-4">
          <Lightbulb className="h-12 w-12 flex-shrink-0" />
          <div>
            <h2 className="text-2xl font-bold mb-3">PICC: Leading Indigenous Innovation</h2>
            <p className="text-blue-100 mb-4">
              With 197 staff delivering 16+ integrated services to the community, PICC demonstrates
              that Indigenous-led organizations can achieve excellence at scale. Our innovation
              projects showcase cutting-edge approaches to cultural preservation, data sovereignty,
              and community-controlled service delivery.
            </p>
            <p className="text-blue-100">
              These innovations aren't just for Palm Island - they're designed to be replicated
              across Indigenous communities in Australia and globally, proving that Indigenous
              self-determination works.
            </p>
          </div>
        </div>
      </div>

      {/* Links to Related Pages */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          href="/wiki/achievements"
          className="block p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg hover:shadow-md transition-all group"
        >
          <Award className="h-8 w-8 text-amber-600 mb-2" />
          <h3 className="font-bold text-amber-900 mb-2 group-hover:text-amber-700">
            Achievements
          </h3>
          <p className="text-sm text-gray-700">
            See PICC's community achievements
          </p>
        </Link>
        <Link
          href="/wiki/services"
          className="block p-6 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-lg hover:shadow-md transition-all group"
        >
          <Heart className="h-8 w-8 text-rose-600 mb-2" />
          <h3 className="font-bold text-rose-900 mb-2 group-hover:text-rose-700">
            Services & Programs
          </h3>
          <p className="text-sm text-gray-700">
            Explore PICC's integrated services
          </p>
        </Link>
        <Link
          href="/stories"
          className="block p-6 bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 rounded-lg hover:shadow-md transition-all group"
        >
          <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
          <h3 className="font-bold text-blue-900 mb-2 group-hover:text-blue-700">
            All Stories
          </h3>
          <p className="text-sm text-gray-700">
            Read innovation stories
          </p>
        </Link>
      </div>
    </div>
  );
}
