'use client';

import { Quote } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

interface QuoteShowcaseProps {
  quote: string;
  author: string;
  role?: string;
  image?: string;
  variant?: 'centered' | 'side' | 'featured';
  background?: 'light' | 'dark' | 'earth' | 'gradient' | 'ocean';
  className?: string;
}

export function QuoteShowcase({
  quote,
  author,
  role,
  image,
  variant = 'centered',
  background = 'light',
  className = '',
}: QuoteShowcaseProps) {
  const bgStyles = {
    light: 'bg-[#fdf8f3]',
    dark: 'bg-gray-900 text-white',
    earth: 'bg-gradient-to-br from-[#8b5a2b]/10 to-[#6f4722]/10',
    gradient: 'bg-gradient-to-br from-[#1e3a5f] to-[#2d6a4f] text-white',
    ocean: 'bg-gradient-to-br from-[#1e3a5f] to-[#0c1a22] text-white',
  };

  const textStyles = {
    light: 'text-gray-800',
    dark: 'text-white',
    earth: 'text-gray-800',
    gradient: 'text-white',
    ocean: 'text-white',
  };

  const subTextStyles = {
    light: 'text-gray-600',
    dark: 'text-gray-300',
    earth: 'text-gray-600',
    gradient: 'text-white/80',
    ocean: 'text-white/80',
  };

  if (variant === 'featured') {
    return (
      <section className={`py-20 sm:py-32 ${bgStyles[background]} ${className}`}>
        <div className="max-w-5xl mx-auto px-6">
          <ScrollReveal animation="scale">
            <div className="relative">
              {/* Large quote marks */}
              <Quote
                className={`absolute -top-8 -left-4 w-16 h-16 ${
                  background === 'light' || background === 'earth'
                    ? 'text-[#8b5a2b]/20'
                    : 'text-white/20'
                }`}
              />

              <blockquote className="relative z-10">
                <p
                  className={`text-2xl sm:text-3xl md:text-4xl font-light leading-relaxed ${textStyles[background]} mb-8`}
                >
                  "{quote}"
                </p>

                <footer className="flex items-center gap-4">
                  {image && (
                    <img
                      src={image}
                      alt={author}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                    />
                  )}
                  <div>
                    <cite className={`not-italic font-bold text-lg ${textStyles[background]}`}>
                      {author}
                    </cite>
                    {role && (
                      <p className={`text-sm ${subTextStyles[background]}`}>{role}</p>
                    )}
                  </div>
                </footer>
              </blockquote>
            </div>
          </ScrollReveal>
        </div>
      </section>
    );
  }

  if (variant === 'side') {
    return (
      <div className={`flex items-start gap-6 ${className}`}>
        {image && (
          <ScrollReveal animation="fadeRight">
            <img
              src={image}
              alt={author}
              className="w-20 h-20 rounded-full object-cover flex-shrink-0"
            />
          </ScrollReveal>
        )}
        <ScrollReveal animation="fadeLeft" delay={100}>
          <div className="flex-1">
            <Quote className="w-8 h-8 text-[#8b5a2b]/30 mb-2" />
            <blockquote>
              <p className="text-lg text-gray-700 italic mb-4">"{quote}"</p>
              <footer>
                <cite className="not-italic font-bold text-gray-900">{author}</cite>
                {role && <span className="text-gray-500 ml-2">— {role}</span>}
              </footer>
            </blockquote>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  // Default: centered variant
  return (
    <section className={`py-16 sm:py-24 ${bgStyles[background]} ${className}`}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <ScrollReveal animation="fadeUp">
          <Quote
            className={`w-12 h-12 mx-auto mb-6 ${
              background === 'light' || background === 'earth'
                ? 'text-[#8b5a2b]/30'
                : 'text-white/30'
            }`}
          />

          <blockquote>
            <p className={`text-xl sm:text-2xl italic leading-relaxed ${textStyles[background]} mb-8`}>
              "{quote}"
            </p>

            <footer className="flex flex-col items-center gap-3">
              {image && (
                <img
                  src={image}
                  alt={author}
                  className="w-14 h-14 rounded-full object-cover"
                />
              )}
              <div>
                <cite className={`not-italic font-bold ${textStyles[background]}`}>
                  {author}
                </cite>
                {role && (
                  <p className={`text-sm ${subTextStyles[background]}`}>{role}</p>
                )}
              </div>
            </footer>
          </blockquote>
        </ScrollReveal>
      </div>
    </section>
  );
}

// Leadership message component - special variant for CEO/Chair messages
interface LeadershipMessageProps {
  name: string;
  role: string;
  image?: string;
  message: string;
  signature?: string;
  className?: string;
}

export function LeadershipMessage({
  name,
  role,
  image,
  message,
  signature,
  className = '',
}: LeadershipMessageProps) {
  return (
    <section className={`py-16 sm:py-24 ${className}`}>
      <div className="max-w-5xl mx-auto px-6">
        <ScrollReveal animation="fadeUp">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Message from Our {role}
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-5 gap-8 items-start">
          {/* Photo column */}
          <ScrollReveal animation="fadeRight" className="md:col-span-2">
            <div className="relative">
              {image ? (
                <img
                  src={image}
                  alt={name}
                  className="w-full aspect-[4/5] object-cover rounded-2xl shadow-xl"
                />
              ) : (
                <div className="w-full aspect-[4/5] bg-gradient-to-br from-[#1e3a5f] to-[#2d6a4f] rounded-2xl shadow-xl flex items-center justify-center">
                  <span className="text-6xl font-bold text-white/30">
                    {name.charAt(0)}
                  </span>
                </div>
              )}

              {/* Name card overlay */}
              <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-4">
                <p className="font-bold text-gray-900">{name}</p>
                <p className="text-sm text-gray-500">{role}</p>
              </div>
            </div>
          </ScrollReveal>

          {/* Message column */}
          <ScrollReveal animation="fadeLeft" delay={200} className="md:col-span-3">
            <div className="prose prose-lg max-w-none">
              <Quote className="w-10 h-10 text-[#8b5a2b]/30 mb-4" />

              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {message}
              </div>

              {signature && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="font-script text-2xl text-gray-800 italic">
                    {signature}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{name}</p>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

export default QuoteShowcase;
