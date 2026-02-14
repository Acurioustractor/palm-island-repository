'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface Milestone {
  year: string;
  title: string;
  description: string;
  era: 'founding' | 'growth' | 'innovation' | 'today';
  photo?: string;
  storyLink?: string;
}

const ERA_COLORS = {
  founding: { bg: 'bg-picc-ochre-500', text: 'text-picc-ochre', light: 'bg-picc-ochre-50', border: 'border-picc-ochre-200' },
  growth: { bg: 'bg-sage-500', text: 'text-emerald-700', light: 'bg-sage-50', border: 'border-emerald-200' },
  innovation: { bg: 'bg-picc-ochre', text: 'text-picc-ochre', light: 'bg-warm-100', border: 'border-warm-200' },
  today: { bg: 'bg-picc-red', text: 'text-picc-red', light: 'bg-warm-50', border: 'border-warm-200' },
};

const ERA_LABELS = {
  founding: 'Founding',
  growth: 'Growth',
  innovation: 'Innovation',
  today: 'Today',
};

export default function MilestoneTimeline({ milestones }: { milestones: Milestone[] }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  let currentEra = '';

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2" />

      <div className="space-y-8">
        {milestones.map((milestone, idx) => {
          const colors = ERA_COLORS[milestone.era];
          const isLeft = idx % 2 === 0;
          const showEraLabel = milestone.era !== currentEra;
          if (showEraLabel) currentEra = milestone.era;

          return (
            <div key={idx}>
              {/* Era label */}
              {showEraLabel && (
                <div className="flex justify-center mb-6">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${colors.bg} text-white`}>
                    {ERA_LABELS[milestone.era]}
                  </span>
                </div>
              )}

              {/* Milestone */}
              <div className={`relative flex items-start gap-6 md:gap-12 ${
                isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}>
                {/* Content */}
                <div className={`flex-1 ml-12 md:ml-0 ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
                  <div
                    className={`inline-block rounded-xl p-5 border ${colors.light} ${colors.border} cursor-pointer transition-all hover:shadow-md`}
                    onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-bold ${colors.text}`}>{milestone.year}</span>
                      {expandedIndex === idx ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{milestone.title}</h3>
                    {expandedIndex === idx && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 leading-relaxed">{milestone.description}</p>
                        {milestone.photo && (
                          <div className="mt-3 rounded-lg overflow-hidden">
                            <img
                              src={milestone.photo}
                              alt={milestone.title}
                              className="w-full h-40 object-cover"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Dot */}
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white shadow-md z-10"
                  style={{ backgroundColor: milestone.era === 'founding' ? '#f59e0b' : milestone.era === 'growth' ? '#5B7B5E' : milestone.era === 'innovation' ? '#C8922A' : '#8B1A1A' }}
                />

                {/* Spacer for other side */}
                <div className="flex-1 hidden md:block" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
