'use client';

import React, { useState } from 'react';
import {
  FileText, ArrowLeft, Download, Eye, Share2,
  Calendar, Users, Tag, BarChart3, BookOpen, Heart,
  Check, ExternalLink, Printer, Play, Image, MapPin
} from 'lucide-react';
import Link from 'next/link';

// Import scrollytelling components
import {
  StoryContainer,
  HeroSection,
  TextSection,
  QuoteSection,
  TimelineSection
} from '@/components/story-scroll';

// Demo data - this is what a real report would look like
const demoReport = {
  id: 'demo-2024',
  title: 'Palm Island Community Company Annual Report 2024',
  subtitle: 'Our Community, Our Future, Our Way',
  theme: 'Community Strength & Cultural Resilience',
  report_year: 2024,
  reporting_period_start: '2024-01-01',
  reporting_period_end: '2024-12-31',
  status: 'published',
  executive_summary: `2024 has been a transformative year for Palm Island Community Company. Through the dedication of our staff, the wisdom of our elders, and the energy of our youth, we have strengthened our community in ways that will resonate for generations to come.

This year, we collected 47 community stories from 23 storytellers, capturing the voices of our people and preserving our shared history. From the Storm Recovery Photo Studio project to the Elders' Cultural Trip, our innovative programs have demonstrated that community-controlled services deliver real, lasting impact.

Key achievements include:
• Launched the Community Photo Studio, training 12 local photographers
• Completed the Storm Recovery documentation project with 200+ historical photos preserved
• Hosted 8 cultural events connecting elders with youth
• Expanded our employment services, placing 34 community members in jobs

We thank our funders, partners, and most importantly, our community members who make this work possible.`,
  year_highlights: [
    'Launched Community Photo Studio with 12 trained photographers',
    'Preserved 200+ historical photos through Storm Recovery project',
    'Connected 156 youth with elder mentors through cultural programs',
    'Achieved 89% satisfaction rate across all community services',
    'Published first-ever digital story collection on community platform'
  ],
  statistics: {
    total_stories: 47,
    unique_storytellers: 23,
    stories_by_category: {
      'culture': 15,
      'elders': 12,
      'youth': 8,
      'innovation': 7,
      'health': 5
    }
  },
  metadata: {
    funder_name: 'NIAA & Community Partners',
    generated_at: '2024-11-25T00:00:00Z'
  }
};

const demoStories = [
  {
    id: '1',
    title: 'Aunty Marlene\'s Language Revival Journey',
    content: `"When I was a girl, we weren't allowed to speak our language at school. They would punish us. Now I teach it to the young ones every week, and when I hear them speaking our words, my heart fills up. This is what healing looks like - taking back what was taken from us, one word at a time."

Aunty Marlene has been teaching traditional language classes for 15 years. This year, her program expanded to include 45 students, the largest cohort ever.`,
    category: 'culture',
    storyteller: 'Aunty Marlene Thompson',
    is_featured: true,
    media: {
      type: 'image',
      url: '/images/demo/language-class.jpg',
      caption: 'Aunty Marlene teaching traditional language to youth'
    }
  },
  {
    id: '2',
    title: 'Storm Recovery: Rebuilding Together',
    content: `"After Cyclone Kirrily, we lost so much. But the Photo Studio team came and helped us document what happened. Now we have a record - not just of the damage, but of how we came together. Every photo tells a story of community strength."

The Storm Recovery project captured 200+ photos documenting both the destruction and the remarkable community response that followed.`,
    category: 'innovation',
    storyteller: 'Marcus Johnson',
    is_featured: true,
    media: {
      type: 'video',
      url: '/videos/demo/storm-recovery.mp4',
      caption: 'Community members rebuilding after the storm'
    }
  },
  {
    id: '3',
    title: 'Youth Leading the Way',
    content: `"I never thought I'd be a leader. But through the PICC youth program, I learned that leadership isn't about having all the answers - it's about listening to your community and taking action. Now I'm mentoring younger kids, showing them what's possible."

Jayden, 19, completed the Youth Leadership program this year and now mentors 5 younger participants.`,
    category: 'youth',
    storyteller: 'Jayden Williams',
    is_featured: true,
    media: {
      type: 'image',
      url: '/images/demo/youth-leadership.jpg',
      caption: 'Jayden with his mentee group'
    }
  },
  {
    id: '4',
    title: 'Uncle Tom\'s Fishing Knowledge',
    content: `"My grandfather taught me to read the tides, the birds, the clouds. Now I teach the young fellas the same way. This knowledge isn't in any book - it's been passed down for thousands of years. When they catch their first fish using traditional methods, I see the pride in their eyes."

Uncle Tom runs weekly fishing trips that combine traditional knowledge with practical skills training.`,
    category: 'elders',
    storyteller: 'Uncle Tom Murray',
    is_featured: false
  },
  {
    id: '5',
    title: 'Health & Wellbeing: Walking Together',
    content: `"The morning walking group started with just three of us. Now we have 25 regulars. It's not just about fitness - it's about connection. We yarn, we laugh, we support each other. Some days the walk is the only time someone might have a real conversation."

The Walking Together program has seen a 40% increase in participation this year.`,
    category: 'health',
    storyteller: 'Sarah Mitchell',
    is_featured: false
  }
];

const demoTimeline = [
  { date: 'January 2024', title: 'Community Photo Studio Launch', description: 'Official opening with 12 photographers trained' },
  { date: 'March 2024', title: 'Cyclone Kirrily Response', description: 'Emergency documentation and community support activated' },
  { date: 'May 2024', title: 'Elders Cultural Trip', description: '15 elders visited significant cultural sites' },
  { date: 'July 2024', title: 'Youth Leadership Graduation', description: '18 young people completed leadership program' },
  { date: 'September 2024', title: 'NAIDOC Week Celebrations', description: 'Largest community gathering in 5 years' },
  { date: 'November 2024', title: 'Story Platform Launch', description: 'Digital archive goes live with 47 stories' }
];

const demoMedia = [
  { type: 'image', url: '/api/placeholder/400/300', caption: 'Community Photo Studio opening day' },
  { type: 'image', url: '/api/placeholder/400/300', caption: 'Elders Cultural Trip to Country' },
  { type: 'image', url: '/api/placeholder/400/300', caption: 'Youth Leadership graduation ceremony' },
  { type: 'image', url: '/api/placeholder/400/300', caption: 'NAIDOC Week community gathering' },
  { type: 'image', url: '/api/placeholder/400/300', caption: 'Walking Together program participants' },
  { type: 'image', url: '/api/placeholder/400/300', caption: 'Language class in action' }
];

export default function DemoReportPage() {
  const [viewMode, setViewMode] = useState<'scroll' | 'print'>('scroll');

  const handleExportPDF = () => {
    window.print();
  };

  const featuredStories = demoStories.filter(s => s.is_featured);
  const otherStories = demoStories.filter(s => !s.is_featured);

  // Print-friendly view
  if (viewMode === 'print') {
    return (
      <div className="min-h-screen bg-white">
        {/* Control Bar */}
        <div className="fixed top-0 left-0 right-0 bg-gray-900 text-white p-4 z-50 print:hidden">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setViewMode('scroll')}
              className="flex items-center gap-2 text-sm hover:text-purple-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Interactive View
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
            >
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* Print Content */}
        <div className="max-w-4xl mx-auto p-8 pt-20 print:pt-0">
          {/* Cover */}
          <div className="text-center mb-12 pb-8 border-b-4 border-purple-600">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{demoReport.title}</h1>
            <p className="text-xl text-purple-600 mb-4">{demoReport.subtitle}</p>
            <p className="text-gray-600">
              {new Date(demoReport.reporting_period_start).toLocaleDateString()} - {new Date(demoReport.reporting_period_end).toLocaleDateString()}
            </p>
          </div>

          {/* Executive Summary */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-purple-600" />
              Executive Summary
            </h2>
            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
              {demoReport.executive_summary}
            </div>
          </section>

          {/* Impact at a Glance */}
          <section className="mb-12 bg-purple-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              Impact at a Glance
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-3xl font-bold text-purple-600">{demoReport.statistics.total_stories}</div>
                <div className="text-sm text-gray-600">Community Stories</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-3xl font-bold text-purple-600">{demoReport.statistics.unique_storytellers}</div>
                <div className="text-sm text-gray-600">Storytellers</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {Object.keys(demoReport.statistics.stories_by_category).length}
                </div>
                <div className="text-sm text-gray-600">Impact Areas</div>
              </div>
            </div>
          </section>

          {/* Stories */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Heart className="h-6 w-6 text-purple-600" />
              Community Voices
            </h2>
            <div className="space-y-8">
              {demoStories.map((story) => (
                <div key={story.id} className="border-l-4 border-purple-600 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{story.title}</h3>
                  <p className="text-gray-700 mb-2 whitespace-pre-wrap">{story.content}</p>
                  <p className="text-sm text-purple-600 italic">— {story.storyteller}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Scrollytelling view
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Control Bar */}
      <div className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm p-4 z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/picc/reports"
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Link>

          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-900 text-yellow-300">
              Demo Report
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('print')}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white border border-gray-700 rounded-lg hover:border-gray-500"
            >
              <Printer className="h-4 w-4" />
              Print View
            </button>
          </div>
        </div>
      </div>

      {/* Scrollytelling Content */}
      <StoryContainer className="pt-16">
        {/* Hero Section */}
        <HeroSection
          title={demoReport.title}
          subtitle={demoReport.subtitle}
          overlay="dark"
          height="screen"
        />

        {/* Executive Summary */}
        <TextSection
          title="Executive Summary"
          backgroundColor="#ffffff"
          content={
            <div className="prose max-w-3xl mx-auto">
              <p className="text-lg text-gray-700 whitespace-pre-wrap leading-relaxed">
                {demoReport.executive_summary}
              </p>
            </div>
          }
        />

        {/* Impact Stats Section */}
        <div className="bg-gradient-to-br from-purple-900 to-purple-700 py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-12">Impact at a Glance</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
                <div className="text-5xl font-bold text-white mb-2">
                  {demoReport.statistics.total_stories}
                </div>
                <div className="text-purple-200">Stories Collected</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
                <div className="text-5xl font-bold text-white mb-2">
                  {demoReport.statistics.unique_storytellers}
                </div>
                <div className="text-purple-200">Storytellers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
                <div className="text-5xl font-bold text-white mb-2">
                  200+
                </div>
                <div className="text-purple-200">Photos Preserved</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
                <div className="text-5xl font-bold text-white mb-2">
                  89%
                </div>
                <div className="text-purple-200">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Year Highlights */}
        <TextSection
          title="Year Highlights"
          backgroundColor="#f9fafb"
          content={
            <div className="max-w-2xl mx-auto">
              <ul className="space-y-4">
                {demoReport.year_highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-3 text-lg">
                    <div className="p-1 bg-green-100 rounded-full mt-1">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          }
        />

        {/* Timeline Section */}
        <div className="bg-white py-24">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">2024 Timeline</h2>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-purple-200" />
              <div className="space-y-12">
                {demoTimeline.map((item, index) => (
                  <div key={index} className={`flex items-center gap-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                      <div className="bg-gray-50 rounded-lg p-6 inline-block">
                        <div className="text-sm text-purple-600 font-medium mb-1">{item.date}</div>
                        <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                    <div className="w-4 h-4 rounded-full bg-purple-600 border-4 border-white shadow relative z-10" />
                    <div className="flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Featured Stories Section */}
        <TextSection
          title="Featured Community Voices"
          backgroundColor="#ffffff"
          content={
            <p className="text-center text-gray-600 max-w-2xl mx-auto">
              These stories represent the heart of our community's journey this year.
            </p>
          }
        />

        {featuredStories.map((story) => (
          <div key={story.id} className="bg-gradient-to-br from-gray-900 to-gray-800 py-24">
            <div className="max-w-4xl mx-auto px-6">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <span className="text-purple-400 text-sm uppercase tracking-wider mb-2 block">
                    {story.category}
                  </span>
                  <h3 className="text-2xl font-bold text-white mb-4">{story.title}</h3>
                  <blockquote className="text-xl text-gray-300 leading-relaxed italic mb-6">
                    "{story.content.split('"')[1]}"
                  </blockquote>
                  <p className="text-gray-400 mb-4">
                    {story.content.split('\n\n')[1]}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                      {story.storyteller.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-white font-medium">{story.storyteller}</div>
                      <div className="text-gray-400 text-sm">Community Member</div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  {story.media?.type === 'video' ? (
                    <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                      <Play className="h-16 w-16 text-white/50" />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                      <Image className="h-16 w-16 text-white/30" />
                    </div>
                  )}
                  {story.media?.caption && (
                    <p className="text-gray-400 text-sm mt-2 text-center">{story.media.caption}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Photo Gallery */}
        <div className="bg-gray-100 py-24">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Photo Gallery</h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Moments captured throughout 2024, documenting our community's journey.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {demoMedia.map((media, index) => (
                <div key={index} className="group relative aspect-[4/3] bg-gray-300 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image className="h-12 w-12 text-gray-400" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <p className="text-white text-sm p-4">{media.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* More Stories */}
        <div className="bg-white py-16">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">More Community Stories</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {otherStories.map((story) => (
                <div key={story.id} className="bg-gray-50 rounded-xl p-6">
                  <span className="text-xs text-purple-600 uppercase tracking-wider">{story.category}</span>
                  <h3 className="font-semibold text-gray-900 mt-2 mb-3">{story.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {story.content.substring(0, 200)}...
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    {story.storyteller}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Stories by Impact Area</h2>
            <div className="grid md:grid-cols-5 gap-4">
              {Object.entries(demoReport.statistics.stories_by_category).map(([category, count]) => (
                <div key={category} className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-purple-600">{count}</div>
                  <div className="text-sm text-gray-600 capitalize">{category}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Acknowledgments */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 py-24">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Thank You</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              We acknowledge and thank {demoReport.metadata.funder_name} for their continued support of Palm Island Community Company. We also thank all community members who shared their stories, the elders who guide our work, and every person who contributed to making 2024 a year of growth and resilience.
            </p>
            <div className="flex items-center justify-center gap-4 text-gray-400">
              <MapPin className="h-5 w-5" />
              <span>Palm Island, Queensland</span>
            </div>
            <div className="mt-8 text-gray-500 text-sm">
              Report generated November 2024
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 py-8 text-center">
          <p className="text-gray-500 text-sm">
            Palm Island Community Company &copy; {demoReport.report_year}
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Our Community, Our Future, Our Way
          </p>
        </div>
      </StoryContainer>
    </div>
  );
}
