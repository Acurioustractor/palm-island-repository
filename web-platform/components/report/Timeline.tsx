'use client';

import { useState } from 'react';
import { ScrollReveal } from './ScrollReveal';
import {
  Calendar, Star, Flag, Award, Users, Heart, Building,
  Sparkles, CheckCircle, ChevronDown, ChevronUp
} from 'lucide-react';

interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
  category?: 'milestone' | 'achievement' | 'event' | 'launch' | 'partnership';
  icon?: string;
  image?: string;
  stats?: { label: string; value: string | number }[];
}

interface TimelineProps {
  events: TimelineEvent[];
  variant?: 'vertical' | 'horizontal' | 'compact';
  showImages?: boolean;
}

export function Timeline({ events, variant = 'vertical', showImages = true }: TimelineProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const categoryColors = {
    milestone: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Flag },
    achievement: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Award },
    event: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Calendar },
    launch: { bg: 'bg-green-100', text: 'text-green-700', icon: Sparkles },
    partnership: { bg: 'bg-rose-100', text: 'text-rose-700', icon: Users },
  };

  if (variant === 'horizontal') {
    return (
      <div className="relative">
        {/* Horizontal line */}
        <div className="absolute top-10 left-0 right-0 h-1 bg-gradient-to-r from-[#1e3a5f] via-[#2d6a4f] to-[#8b5a2b]" />

        <div className="flex overflow-x-auto pb-8 pt-4 gap-6 snap-x snap-mandatory scrollbar-hide">
          {events.map((event, index) => {
            const category = event.category || 'event';
            const CategoryIcon = categoryColors[category].icon;

            return (
              <ScrollReveal key={index} animation="fadeUp" delay={index * 100}>
                <div className="flex-shrink-0 w-64 snap-center">
                  {/* Dot */}
                  <div className="relative flex justify-center mb-4">
                    <div className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-4 border-[#1e3a5f]" />
                  </div>

                  {/* Content */}
                  <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[category].bg} ${categoryColors[category].text}`}>
                        {category}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">{event.date}</div>
                    <h4 className="font-bold text-gray-900 mb-2">{event.title}</h4>
                    {event.description && (
                      <p className="text-sm text-gray-600 line-clamp-3">{event.description}</p>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="space-y-3">
        {events.map((event, index) => {
          const category = event.category || 'event';
          const CategoryIcon = categoryColors[category].icon;

          return (
            <ScrollReveal key={index} animation="fadeRight" delay={index * 50}>
              <div
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryColors[category].bg}`}>
                  <CategoryIcon className={`w-5 h-5 ${categoryColors[category].text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{event.title}</h4>
                  <p className="text-sm text-gray-500">{event.date}</p>
                </div>
                {event.description && (
                  expandedIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )
                )}
              </div>
              {expandedIndex === index && event.description && (
                <div className="ml-14 pl-4 border-l-2 border-gray-200 py-3">
                  <p className="text-gray-600">{event.description}</p>
                  {event.stats && (
                    <div className="flex gap-4 mt-3">
                      {event.stats.map((stat, i) => (
                        <div key={i} className="text-sm">
                          <span className="font-bold text-[#1e3a5f]">{stat.value}</span>
                          <span className="text-gray-500 ml-1">{stat.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </ScrollReveal>
          );
        })}
      </div>
    );
  }

  // Default vertical timeline
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-6 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#1e3a5f] via-[#2d6a4f] to-[#8b5a2b]" />

      <div className="space-y-12">
        {events.map((event, index) => {
          const category = event.category || 'event';
          const CategoryIcon = categoryColors[category].icon;
          const isLeft = index % 2 === 0;

          return (
            <ScrollReveal
              key={index}
              animation={isLeft ? 'fadeRight' : 'fadeLeft'}
              delay={index * 100}
            >
              <div className={`relative flex items-start gap-6 md:gap-12 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                {/* Dot */}
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-4 border-[#1e3a5f] z-10" />

                {/* Content */}
                <div className={`ml-14 md:ml-0 md:w-1/2 ${isLeft ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                  <div className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-100 ${isLeft ? 'md:mr-4' : 'md:ml-4'}`}>
                    <div className={`flex items-center gap-3 mb-3 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryColors[category].bg}`}>
                        <CategoryIcon className={`w-5 h-5 ${categoryColors[category].text}`} />
                      </div>
                      <span className="text-sm text-gray-500 font-medium">{event.date}</span>
                    </div>

                    <h4 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h4>

                    {event.image && showImages && (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                    )}

                    {event.description && (
                      <p className="text-gray-600 mb-4">{event.description}</p>
                    )}

                    {event.stats && (
                      <div className={`flex gap-4 pt-4 border-t border-gray-100 ${isLeft ? 'md:justify-end' : ''}`}>
                        {event.stats.map((stat, i) => (
                          <div key={i} className="text-center">
                            <div className="text-xl font-bold text-[#1e3a5f]">{stat.value}</div>
                            <div className="text-xs text-gray-500">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );
}

// Year-in-review timeline
interface YearInReviewProps {
  year: number;
  highlights: Array<{
    month: string;
    events: TimelineEvent[];
  }>;
}

export function YearInReview({ year, highlights }: YearInReviewProps) {
  return (
    <div className="relative">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">{year} In Review</h2>
        <p className="text-gray-600">A look back at our year of achievements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {highlights.map((monthData, index) => (
          <ScrollReveal key={index} animation="fadeUp" delay={index * 75}>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
              <div className="text-sm font-medium text-[#2d6a4f] mb-3">{monthData.month}</div>
              <div className="space-y-3">
                {monthData.events.map((event, eventIndex) => (
                  <div key={eventIndex} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-gray-900">{event.title}</h5>
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}

// Milestone counter
interface MilestoneCounterProps {
  milestones: Array<{
    label: string;
    value: number;
    suffix?: string;
    description?: string;
  }>;
}

export function MilestoneCounter({ milestones }: MilestoneCounterProps) {
  return (
    <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] rounded-3xl p-8 md:p-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {milestones.map((milestone, index) => (
          <ScrollReveal key={index} animation="scale" delay={index * 100}>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {milestone.value.toLocaleString()}{milestone.suffix}
              </div>
              <div className="text-white/90 font-medium">{milestone.label}</div>
              {milestone.description && (
                <div className="text-white/60 text-sm mt-1">{milestone.description}</div>
              )}
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
