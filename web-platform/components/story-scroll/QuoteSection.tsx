'use client';

import { ScrollReveal } from './ScrollReveal';

interface QuoteSectionProps {
  quote: string;
  author?: string;
  role?: string;
  photoUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  size?: 'large' | 'medium' | 'small';
}

export function QuoteSection({
  quote,
  author,
  role,
  photoUrl,
  backgroundColor = 'bg-gradient-to-br from-warm-50 to-warm-100',
  textColor = 'text-gray-900',
  size = 'large',
}: QuoteSectionProps) {
  const sizeClasses = {
    large: 'text-4xl md:text-6xl',
    medium: 'text-3xl md:text-4xl',
    small: 'text-2xl md:text-3xl',
  };

  return (
    <section className={`${backgroundColor} py-24 md:py-32 lg:py-40 relative overflow-hidden`}>
      <div className="max-w-4xl mx-auto px-6 lg:px-8 relative">
        <ScrollReveal direction="up">
          <div className="text-center">
            {photoUrl && (
              <div className="mb-10 flex justify-center">
                <img
                  src={photoUrl}
                  alt={author || 'Portrait'}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-white/80 shadow-lg"
                  loading="lazy"
                />
              </div>
            )}
            <div className="mb-10">
              <svg
                className="w-12 h-12 text-gray-300 mx-auto"
                fill="currentColor"
                viewBox="0 0 32 32"
              >
                <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14h-6c0-2.2 1.8-4 4-4V8zm16 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-2.2 1.8-4 4-4V8z" />
              </svg>
            </div>
            <blockquote
              className={`${sizeClasses[size]} font-extrabold ${textColor} mb-10 leading-tight tracking-[-0.02em]`}
            >
              &ldquo;{quote}&rdquo;
            </blockquote>
            {(author || role) && (
              <div>
                {author && (
                  <div className="font-semibold text-gray-900 text-sm">{author}</div>
                )}
                {role && <div className="text-gray-500 text-sm mt-1">{role}</div>}
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
