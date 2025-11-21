'use client';

import { ReactNode } from 'react';
import { ScrollReveal } from './ScrollReveal';

interface TextSectionProps {
  title?: string;
  subtitle?: string;
  content: ReactNode;
  backgroundColor?: string;
  maxWidth?: 'narrow' | 'medium' | 'wide';
  textAlign?: 'left' | 'center';
}

export function TextSection({
  title,
  subtitle,
  content,
  backgroundColor = 'bg-white',
  maxWidth = 'medium',
  textAlign = 'left',
}: TextSectionProps) {
  const maxWidthClasses = {
    narrow: 'max-w-2xl',
    medium: 'max-w-4xl',
    wide: 'max-w-6xl',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center mx-auto',
  };

  return (
    <section className={`${backgroundColor} py-20`}>
      <div className={`${maxWidthClasses[maxWidth]} mx-auto px-8`}>
        {title && (
          <ScrollReveal direction="up">
            <h2 className={`text-3xl md:text-5xl font-bold text-gray-900 mb-4 ${alignClasses[textAlign]}`}>
              {title}
            </h2>
          </ScrollReveal>
        )}

        {subtitle && (
          <ScrollReveal direction="up" delay={0.1}>
            <p className={`text-xl text-gray-600 mb-8 ${alignClasses[textAlign]}`}>
              {subtitle}
            </p>
          </ScrollReveal>
        )}

        <ScrollReveal direction="up" delay={0.2}>
          <div className={`prose prose-lg max-w-none ${alignClasses[textAlign]}`}>
            {content}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
