'use client';

import { ScrollReveal } from './ScrollReveal';
import { Calendar, Check } from 'lucide-react';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  isComplete?: boolean;
}

interface TimelineSectionProps {
  title?: string;
  events: TimelineEvent[];
  backgroundColor?: string;
}

export function TimelineSection({
  title,
  events,
  backgroundColor = 'bg-gray-50',
}: TimelineSectionProps) {
  return (
    <section className={`${backgroundColor} py-20`}>
      <div className="max-w-4xl mx-auto px-8">
        {title && (
          <ScrollReveal direction="up">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-16 text-center">
              {title}
            </h2>
          </ScrollReveal>
        )}

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 via-purple-600 to-pink-600" />

          {/* Events */}
          <div className="space-y-12">
            {events.map((event, index) => (
              <ScrollReveal key={index} direction="right" delay={index * 0.1}>
                <div className="relative pl-20">
                  {/* Icon */}
                  <div className={`absolute left-0 w-16 h-16 rounded-full flex items-center justify-center ${
                    event.isComplete
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                      : 'bg-gradient-to-br from-blue-600 to-purple-600'
                  } shadow-lg`}>
                    {event.icon || (
                      event.isComplete ? (
                        <Check className="w-8 h-8 text-white" />
                      ) : (
                        <Calendar className="w-8 h-8 text-white" />
                      )
                    )}
                  </div>

                  {/* Content */}
                  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
                    <div className="text-sm font-semibold text-blue-600 mb-2">
                      {event.date}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-700">
                      {event.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
