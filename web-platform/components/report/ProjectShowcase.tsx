'use client';

import { useState } from 'react';
import { ScrollReveal, StaggerContainer } from './ScrollReveal';
import {
  ArrowRight, ExternalLink, Play, Image, Calendar,
  Users, Target, Award, ChevronRight, ChevronLeft,
  Quote, Sparkles
} from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: string;
  title: string;
  description: string;
  category?: string;
  status?: 'active' | 'completed' | 'upcoming';
  image?: string;
  video?: string;
  stats?: Array<{ label: string; value: string | number }>;
  highlights?: string[];
  impact?: string;
  testimonial?: {
    quote: string;
    author: string;
    role?: string;
  };
  link?: string;
}

interface ProjectShowcaseProps {
  projects: Project[];
  variant?: 'carousel' | 'grid' | 'featured' | 'magazine';
  showTestimonials?: boolean;
}

export function ProjectShowcase({
  projects,
  variant = 'grid',
  showTestimonials = true,
}: ProjectShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const statusColors = {
    active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
    completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed' },
    upcoming: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Coming Soon' },
  };

  if (variant === 'carousel') {
    const activeProject = projects[activeIndex];

    return (
      <div className="relative">
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] rounded-3xl overflow-hidden">
          <div className="grid lg:grid-cols-2">
            {/* Image/Video side */}
            <div className="relative aspect-square lg:aspect-auto min-h-[400px]">
              {activeProject.image ? (
                <img
                  src={activeProject.image}
                  alt={activeProject.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#2d6a4f] to-[#1e3a5f]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-white/50" />
                    </div>
                  </div>
                </div>
              )}

              {/* Video play button if video exists */}
              {activeProject.video && (
                <button className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl">
                    <Play className="w-8 h-8 text-[#1e3a5f] ml-1" fill="currentColor" />
                  </div>
                </button>
              )}

              {/* Project navigation */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <button
                  onClick={() => setActiveIndex((i) => (i - 1 + projects.length) % projects.length)}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex gap-2">
                  {projects.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i === activeIndex ? 'bg-white' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setActiveIndex((i) => (i + 1) % projects.length)}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content side */}
            <div className="p-8 lg:p-12 text-white">
              <div className="flex items-center gap-3 mb-4">
                {activeProject.category && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {activeProject.category}
                  </span>
                )}
                {activeProject.status && (
                  <span className={`px-3 py-1 rounded-full text-sm ${statusColors[activeProject.status].bg} ${statusColors[activeProject.status].text}`}>
                    {statusColors[activeProject.status].label}
                  </span>
                )}
              </div>

              <h3 className="text-3xl font-bold mb-4">{activeProject.title}</h3>
              <p className="text-white/80 mb-6 leading-relaxed">{activeProject.description}</p>

              {activeProject.stats && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {activeProject.stats.map((stat, i) => (
                    <div key={i} className="text-center p-3 bg-white/10 rounded-xl">
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-xs text-white/70">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {showTestimonials && activeProject.testimonial && (
                <div className="bg-white/10 rounded-xl p-5 mb-6">
                  <Quote className="w-6 h-6 text-white/40 mb-2" />
                  <p className="text-white/90 italic mb-3">{activeProject.testimonial.quote}</p>
                  <div className="text-sm">
                    <span className="font-medium">{activeProject.testimonial.author}</span>
                    {activeProject.testimonial.role && (
                      <span className="text-white/60"> - {activeProject.testimonial.role}</span>
                    )}
                  </div>
                </div>
              )}

              {activeProject.link && (
                <Link
                  href={activeProject.link}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#1e3a5f] rounded-lg font-medium hover:bg-white/90 transition-colors"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div className="space-y-12">
        {projects.map((project, index) => {
          const isReverse = index % 2 === 1;

          return (
            <ScrollReveal
              key={project.id}
              animation={isReverse ? 'fadeLeft' : 'fadeRight'}
              delay={index * 100}
            >
              <div className={`grid lg:grid-cols-2 gap-8 items-center ${isReverse ? 'lg:flex-row-reverse' : ''}`}>
                {/* Image */}
                <div className={`relative ${isReverse ? 'lg:order-2' : ''}`}>
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1e3a5f] to-[#2d6a4f] flex items-center justify-center">
                        <Sparkles className="w-16 h-16 text-white/30" />
                      </div>
                    )}
                  </div>

                  {project.status && (
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[project.status].bg} ${statusColors[project.status].text}`}>
                        {statusColors[project.status].label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className={isReverse ? 'lg:order-1' : ''}>
                  {project.category && (
                    <span className="text-[#2d6a4f] font-medium text-sm mb-2 block">
                      {project.category}
                    </span>
                  )}
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{project.description}</p>

                  {project.highlights && (
                    <ul className="space-y-2 mb-6">
                      {project.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700">
                          <ChevronRight className="w-5 h-5 text-[#2d6a4f] flex-shrink-0 mt-0.5" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  )}

                  {project.stats && (
                    <div className="flex gap-6 mb-6">
                      {project.stats.map((stat, i) => (
                        <div key={i}>
                          <div className="text-2xl font-bold text-[#1e3a5f]">{stat.value}</div>
                          <div className="text-sm text-gray-500">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {project.link && (
                    <Link
                      href={project.link}
                      className="inline-flex items-center gap-2 text-[#1e3a5f] font-medium hover:text-[#2d4a6f] transition-colors"
                    >
                      Learn more about this project
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    );
  }

  if (variant === 'magazine') {
    // First project is large, rest are smaller
    const [featured, ...rest] = projects;

    return (
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Featured project - spans 2 columns */}
        <ScrollReveal animation="fadeUp" className="lg:col-span-2 lg:row-span-2">
          <div className="relative h-full min-h-[500px] rounded-3xl overflow-hidden group">
            {featured.image ? (
              <img
                src={featured.image}
                alt={featured.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f] to-[#2d6a4f]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                {featured.category && (
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                    {featured.category}
                  </span>
                )}
                {featured.status && (
                  <span className={`px-3 py-1 rounded-full text-sm ${statusColors[featured.status].bg} ${statusColors[featured.status].text}`}>
                    {statusColors[featured.status].label}
                  </span>
                )}
              </div>
              <h3 className="text-3xl font-bold mb-3">{featured.title}</h3>
              <p className="text-white/80 line-clamp-2 mb-4">{featured.description}</p>
              {featured.link && (
                <Link
                  href={featured.link}
                  className="inline-flex items-center gap-2 text-white font-medium hover:text-white/80 transition-colors"
                >
                  Read more <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Other projects */}
        {rest.slice(0, 2).map((project, index) => (
          <ScrollReveal key={project.id} animation="fadeUp" delay={100 + index * 100}>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow h-full flex flex-col">
              <div className="relative aspect-video">
                {project.image ? (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1e3a5f]/20 to-[#2d6a4f]/20 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-gray-300" />
                  </div>
                )}
                {project.status && (
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status].bg} ${statusColors[project.status].text}`}>
                      {statusColors[project.status].label}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                {project.category && (
                  <span className="text-[#2d6a4f] text-sm font-medium mb-1">{project.category}</span>
                )}
                <h4 className="font-bold text-gray-900 mb-2">{project.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">{project.description}</p>
                {project.link && (
                  <Link
                    href={project.link}
                    className="text-sm text-[#1e3a5f] font-medium hover:text-[#2d4a6f] transition-colors flex items-center gap-1"
                  >
                    Learn more <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    );
  }

  // Default grid layout
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, index) => (
        <ScrollReveal key={project.id} animation="fadeUp" delay={index * 75}>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all h-full flex flex-col group">
            <div className="relative aspect-video overflow-hidden">
              {project.image ? (
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1e3a5f]/20 to-[#2d6a4f]/20 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-gray-300" />
                </div>
              )}
              {project.status && (
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[project.status].bg} ${statusColors[project.status].text}`}>
                    {statusColors[project.status].label}
                  </span>
                </div>
              )}
            </div>

            <div className="p-6 flex-1 flex flex-col">
              {project.category && (
                <span className="text-[#2d6a4f] text-sm font-medium mb-2">{project.category}</span>
              )}
              <h4 className="text-lg font-bold text-gray-900 mb-2">{project.title}</h4>
              <p className="text-gray-600 text-sm mb-4 flex-1">{project.description}</p>

              {project.stats && (
                <div className="flex gap-4 py-4 border-t border-gray-100 mb-4">
                  {project.stats.slice(0, 3).map((stat, i) => (
                    <div key={i} className="text-center flex-1">
                      <div className="text-lg font-bold text-[#1e3a5f]">{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {project.link && (
                <Link
                  href={project.link}
                  className="inline-flex items-center gap-2 text-[#1e3a5f] font-medium hover:text-[#2d4a6f] transition-colors mt-auto"
                >
                  Learn more <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}

// Project stats summary
interface ProjectStatsSummaryProps {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalImpact?: string;
}

export function ProjectStatsSummary({
  totalProjects,
  activeProjects,
  completedProjects,
  totalImpact,
}: ProjectStatsSummaryProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div>
          <div className="text-3xl font-bold text-[#1e3a5f] mb-1">{totalProjects}</div>
          <div className="text-sm text-gray-600">Total Projects</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-green-600 mb-1">{activeProjects}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-blue-600 mb-1">{completedProjects}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        {totalImpact && (
          <div>
            <div className="text-3xl font-bold text-amber-600 mb-1">{totalImpact}</div>
            <div className="text-sm text-gray-600">People Impacted</div>
          </div>
        )}
      </div>
    </div>
  );
}
