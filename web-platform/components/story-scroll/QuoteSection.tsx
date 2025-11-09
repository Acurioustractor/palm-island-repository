'use client';

import { ScrollReveal } from './ScrollReveal';

interface QuoteSectionProps {
  quote: string;
  author?: string;
  role?: string;
  backgroundColor?: string;
  textColor?: string;
  size?: 'large' | 'medium' | 'small';
}

export function QuoteSection({
  quote,
  author,
  role,
  backgroundColor = 'bg-gradient-to-br from-blue-50 to-purple-50',
  textColor = 'text-gray-900',
  size = 'large',
}: QuoteSectionProps) {
  const sizeClasses = {
    large: 'text-4xl md:text-6xl',
    medium: 'text-3xl md:text-4xl',
    small: 'text-2xl md:text-3xl',
  };

  return (
    <section className={`${backgroundColor} py-24`}>
      <div className="max-w-5xl mx-auto px-8">
        <ScrollReveal direction="up">
          <div className="text-center">
            <div className="mb-8">
              <svg
                className="w-16 h-16 text-blue-600/20 mx-auto"
                fill="currentColor"
                viewBox="0 0 32 32"
              >
                <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14h-6c0-2.2 1.8-4 4-4V8zm16 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-2.2 1.8-4 4-4V8z" />
              </svg>
            </div>
            <blockquote
              className={`${sizeClasses[size]} font-bold ${textColor} mb-8 leading-tight`}
            >
              "{quote}"
            </blockquote>
            {(author || role) && (
              <div className="text-lg text-gray-600">
                {author && (
                  <div className="font-semibold text-gray-900">{author}</div>
                )}
                {role && <div className="text-gray-600">{role}</div>}
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
