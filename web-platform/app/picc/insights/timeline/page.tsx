'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar, Lightbulb, Award, Users, Heart, Sparkles, TrendingUp,
  BarChart3, Globe, Camera, BookOpen, Zap
} from 'lucide-react';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';

interface TimelineEvent {
  year: string;
  month?: string;
  title: string;
  description: string;
  category: 'milestone' | 'innovation' | 'achievement' | 'service';
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  borderColor: string;
  link?: string;
}

export default function TimelinePage() {
  const events: TimelineEvent[] = [
    {
      year: '2021',
      title: 'PICC Achieves 100% Community Control',
      description: 'Palm Island Community Company takes over all services from Queensland Government, becoming 100% community-controlled with 197 staff delivering 16+ integrated services.',
      category: 'milestone',
      icon: Award,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-300',
      link: '/wiki/history',
    },
    {
      year: '2023',
      title: 'Community Knowledge Platform Initiated',
      description: 'Development begins on digital knowledge infrastructure to preserve cultural wisdom, document service impact, and demonstrate Indigenous data sovereignty.',
      category: 'innovation',
      icon: Lightbulb,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
    },
    {
      year: '2024',
      month: 'February',
      title: 'Storm Recovery Innovation',
      description: '26 stories documented from February floods, showcasing 7 innovative recovery programs including $1.9M Movember Men\'s Program. Demonstrated community-led disaster response excellence.',
      category: 'achievement',
      icon: Heart,
      color: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-300',
      link: '/wiki/innovation/storm-recovery',
    },
    {
      year: '2024',
      month: 'Mid-Year',
      title: 'Photo Studio Launch',
      description: 'On-country photo studio established with professional equipment. Dignity-centered photography challenging deficit narratives, with cultural protocols built into every step.',
      category: 'innovation',
      icon: Camera,
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-300',
      link: '/wiki/innovation/photo-studio',
    },
    {
      year: '2024',
      month: 'Q3',
      title: 'Elders Trip to Hull River Planning',
      description: 'Comprehensive planning for return journeys to traditional country with elders. Multi-media documentation approach designed to strengthen native title and preserve traditional knowledge.',
      category: 'innovation',
      icon: Users,
      color: 'text-teal-700',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-300',
      link: '/wiki/innovation/elders-trip',
    },
    {
      year: '2024',
      month: 'Q4',
      title: 'Data Sovereignty Infrastructure',
      description: 'Local server architecture designed for true Indigenous data sovereignty. Physical infrastructure on Palm Island ensuring community control over cultural knowledge and service data.',
      category: 'innovation',
      icon: BarChart3,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-300',
      link: '/wiki/innovation/local-server',
    },
    {
      year: '2024',
      month: 'November',
      title: 'World-Class Knowledge Infrastructure',
      description: 'Comprehensive wiki system deployed with innovation showcase, analytics dashboard, profile management, and pattern analysis. Proving Indigenous organizations can lead in technology and knowledge management.',
      category: 'achievement',
      icon: Sparkles,
      color: 'text-indigo-700',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-300',
      link: '/wiki/innovation',
    },
    {
      year: 'Future',
      title: 'Replication & Impact',
      description: 'PICC\'s innovations being replicated by other Indigenous communities. Model demonstrates that community-controlled services, data sovereignty, and knowledge preservation work at scale.',
      category: 'milestone',
      icon: Globe,
      color: 'text-blue-700',
      bgColor: 'bg-gradient-to-br from-blue-50 to-purple-50',
      borderColor: 'border-blue-300',
    },
  ];

  const breadcrumbs = [
    { label: 'Wiki', href: '/wiki' },
    { label: 'Insights', href: '/analytics' },
    { label: 'Innovation Timeline', href: '/insights/timeline' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <Calendar className="h-10 w-10 text-blue-600" />
          PICC Innovation Timeline
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          The journey from community control to Indigenous excellence in technology, knowledge, and service delivery
        </p>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <p className="text-gray-700 text-lg">
            This timeline showcases Palm Island Community Company's evolution as a leader in Indigenous self-determination,
            innovation, and knowledge management. Each milestone proves that community-controlled organizations can achieve
            excellence at scale.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-12 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-200 via-purple-200 to-emerald-200"></div>

        {/* Events */}
        <div className="space-y-12">
          {events.map((event, idx) => (
            <div key={idx} className="relative pl-32">
              {/* Year/Month Marker */}
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-blue-500 shadow-xl flex flex-col items-center justify-center z-10">
                  <div className="text-lg font-bold text-blue-600">{event.year}</div>
                  {event.month && (
                    <div className="text-xs text-gray-600">{event.month}</div>
                  )}
                </div>
              </div>

              {/* Event Card */}
              <div className={`${event.bgColor} ${event.borderColor} border-2 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all`}>
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-14 h-14 ${event.bgColor} rounded-xl flex items-center justify-center border-2 ${event.borderColor}`}>
                    <event.icon className={`h-7 w-7 ${event.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    {/* Category Badge */}
                    <div className="mb-3">
                      <span className={`px-3 py-1 ${event.bgColor} ${event.color} rounded-full text-xs font-bold uppercase tracking-wide border ${event.borderColor}`}>
                        {event.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className={`text-2xl font-bold ${event.color} mb-3`}>
                      {event.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Link */}
                    {event.link && (
                      <Link
                        href={event.link}
                        className={`inline-flex items-center gap-2 ${event.color} hover:underline font-medium`}
                      >
                        Learn more
                        <TrendingUp className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Impact Summary */}
      <div className="mt-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0 w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
            <Zap className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">From Community Control to Indigenous Excellence</h2>
            <p className="text-blue-100 mb-4">
              Since achieving 100% community control in 2021, PICC has pioneered innovations that prove Indigenous
              self-determination works at scale. With 197 staff delivering 16+ integrated services, PICC demonstrates
              that community-controlled organizations can lead in technology, cultural preservation, and service delivery.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold mb-1">4</div>
                <div className="text-blue-100 text-sm">Innovation Projects</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold mb-1">$1.9M</div>
                <div className="text-blue-100 text-sm">Movember Funding</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold mb-1">26</div>
                <div className="text-blue-100 text-sm">Storm Stories</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <Link
          href="/wiki/innovation"
          className="block p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg hover:shadow-md transition-all group"
        >
          <Lightbulb className="h-8 w-8 text-amber-600 mb-3" />
          <h3 className="font-bold text-amber-900 mb-2 group-hover:text-amber-700">
            View All Innovations
          </h3>
          <p className="text-sm text-gray-700">
            Explore detailed documentation of each innovation project
          </p>
        </Link>

        <Link
          href="/wiki/achievements"
          className="block p-6 bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-200 rounded-lg hover:shadow-md transition-all group"
        >
          <Award className="h-8 w-8 text-blue-600 mb-3" />
          <h3 className="font-bold text-blue-900 mb-2 group-hover:text-blue-700">
            Community Achievements
          </h3>
          <p className="text-sm text-gray-700">
            See PICC's accomplishments and impact metrics
          </p>
        </Link>

        <Link
          href="/analytics"
          className="block p-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg hover:shadow-md transition-all group"
        >
          <BarChart3 className="h-8 w-8 text-purple-600 mb-3" />
          <h3 className="font-bold text-purple-900 mb-2 group-hover:text-purple-700">
            Analytics Dashboard
          </h3>
          <p className="text-sm text-gray-700">
            View real-time metrics and insights
          </p>
        </Link>
      </div>
    </div>
  );
}
