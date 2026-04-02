'use client'

import { BookOpen, Users, Globe, Network, Star, MapPin, Archive, GraduationCap, Lightbulb } from 'lucide-react'

type PhaseStatus = 'completed' | 'in-progress' | 'planned'

interface Phase {
  years: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  status: PhaseStatus
}

const phases: Phase[] = [
  {
    years: '2024-2025',
    title: 'Foundation',
    description:
      'Recording elder stories, building the digital archive, first cultural trip to Hull River',
    icon: BookOpen,
    status: 'completed',
  },
  {
    years: '2025-2026',
    title: 'Connection',
    description:
      'Youth engagement program, intergenerational workshops, elder-led cultural days',
    icon: Users,
    status: 'in-progress',
  },
  {
    years: '2026-2028',
    title: 'Growth',
    description:
      'Cultural travel ambassador program, elder mentorship pathways, community knowledge sharing',
    icon: Globe,
    status: 'planned',
  },
  {
    years: '2028-2030',
    title: 'Expansion',
    description:
      'Cross-community cultural exchanges, elder-youth paired storytelling, regional partnerships',
    icon: Network,
    status: 'planned',
  },
  {
    years: '2030-2044',
    title: 'Legacy',
    description:
      'Self-sustaining cultural knowledge system, youth become the next knowledge keepers',
    icon: Star,
    status: 'planned',
  },
]

interface Initiative {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const initiatives: Initiative[] = [
  {
    title: 'Cultural Travel Program',
    description: 'Elders travel to share culture, with youth learning alongside',
    icon: MapPin,
  },
  {
    title: 'Digital Story Archive',
    description: "Every elder's voice preserved with PCAP sovereignty",
    icon: Archive,
  },
  {
    title: 'Youth Mentorship',
    description: 'Structured pathways connecting young people with elder wisdom',
    icon: GraduationCap,
  },
  {
    title: 'Community Knowledge Hub',
    description: 'Interactive platform where culture is shared on elder terms',
    icon: Lightbulb,
  },
]

function statusLabel(status: PhaseStatus) {
  switch (status) {
    case 'completed':
      return 'Completed'
    case 'in-progress':
      return 'In Progress'
    case 'planned':
      return 'Planned'
  }
}

function statusClasses(status: PhaseStatus) {
  switch (status) {
    case 'completed':
      return 'bg-green-500/20 text-green-300 border-green-500/30'
    case 'in-progress':
      return 'bg-picc-ochre/20 text-picc-ochre-200 border-picc-ochre/30'
    case 'planned':
      return 'bg-white/10 text-white/60 border-white/20'
  }
}

function nodeClasses(status: PhaseStatus) {
  switch (status) {
    case 'completed':
      return 'bg-green-500 ring-green-500/30'
    case 'in-progress':
      return 'bg-picc-ochre ring-picc-ochre/30 animate-pulse'
    case 'planned':
      return 'bg-white/30 ring-white/10'
  }
}

export default function Next20YearsVision() {
  return (
    <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-[0.15em] font-semibold text-picc-ochre mb-3">
            Looking Forward
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white">The Next 20 Years</h2>
          <p className="mt-4 text-lg text-white/70">
            Elder-led pathways connecting culture, Country, and the next generation
          </p>
        </div>

        {/* Timeline — horizontal on desktop, vertical on mobile */}
        <div className="mb-20">
          {/* Desktop horizontal timeline */}
          <div className="hidden md:block">
            {/* Timeline line */}
            <div className="relative">
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-white/20" />
              <div className="grid grid-cols-5 gap-4">
                {phases.map((phase) => {
                  const Icon = phase.icon
                  return (
                    <div key={phase.years} className="relative flex flex-col items-center">
                      {/* Node */}
                      <div
                        className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ring-4 ${nodeClasses(phase.status)}`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>

                      {/* Content */}
                      <div className="mt-6 text-center">
                        <div className="text-sm font-bold text-picc-ochre">{phase.years}</div>
                        <h3 className="mt-1 text-lg font-bold text-white">{phase.title}</h3>
                        <p className="mt-2 text-sm text-white/60 leading-relaxed">
                          {phase.description}
                        </p>
                        <div className="mt-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusClasses(phase.status)}`}
                          >
                            {statusLabel(phase.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Mobile vertical timeline */}
          <div className="md:hidden space-y-0">
            {phases.map((phase, idx) => {
              const Icon = phase.icon
              const isLast = idx === phases.length - 1
              return (
                <div key={phase.years} className="flex gap-4">
                  {/* Vertical line + node */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ring-4 flex-shrink-0 ${nodeClasses(phase.status)}`}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    {!isLast && <div className="w-0.5 flex-1 bg-white/20 my-1" />}
                  </div>

                  {/* Content */}
                  <div className="pb-8">
                    <div className="text-sm font-bold text-picc-ochre">{phase.years}</div>
                    <h3 className="mt-0.5 text-lg font-bold text-white">{phase.title}</h3>
                    <p className="mt-1 text-sm text-white/60 leading-relaxed">
                      {phase.description}
                    </p>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusClasses(phase.status)}`}
                      >
                        {statusLabel(phase.status)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Key Initiatives — 2x2 grid */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">Key Initiatives</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {initiatives.map((initiative) => {
              const Icon = initiative.icon
              return (
                <div
                  key={initiative.title}
                  className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm p-6 hover:bg-white/[0.12] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-picc-ochre/20 flex-shrink-0">
                      <Icon className="w-5 h-5 text-picc-ochre" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{initiative.title}</h4>
                      <p className="mt-1 text-sm text-white/60 leading-relaxed">
                        {initiative.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-lg text-white/80 italic leading-relaxed">
            &ldquo;This vision belongs to the Elders. Every story shared, every connection made,
            builds the bridge for the next generation.&rdquo;
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <a
              href="/elders/voices-on-country"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-picc-ochre text-white font-semibold hover:bg-picc-ochre/90 transition-colors focus:outline-none focus:ring-2 focus:ring-picc-ochre focus:ring-offset-2 focus:ring-offset-stone-900"
            >
              Voices on Country — Full Project Plan
            </a>
            <a
              href="#youth-engagement"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 border border-white/30 text-white font-semibold hover:bg-white/15 transition-colors"
            >
              Join the Journey
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
