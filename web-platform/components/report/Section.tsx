'use client';

import { ScrollReveal } from './ScrollReveal';

interface SectionProps {
  children: React.ReactNode;
  background?: 'white' | 'light' | 'dark' | 'earth' | 'gradient' | 'ocean';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  id?: string;
  className?: string;
}

export function Section({
  children,
  background = 'white',
  padding = 'lg',
  id,
  className = '',
}: SectionProps) {
  const bgStyles = {
    white: 'bg-white',
    light: 'bg-[#f8f6f3]',
    dark: 'bg-gray-900 text-white',
    earth: 'bg-gradient-to-br from-[#fdf8f3] to-[#f5e6d3]',
    gradient: 'bg-gradient-to-br from-[#1e3a5f] via-[#2d4a6f] to-[#2d6a4f] text-white',
    ocean: 'bg-gradient-to-br from-[#1e3a5f] to-[#0c1a22] text-white',
  };

  const paddingStyles = {
    sm: 'py-8 sm:py-12',
    md: 'py-12 sm:py-16',
    lg: 'py-16 sm:py-24',
    xl: 'py-24 sm:py-32',
  };

  return (
    <section
      id={id}
      className={`${bgStyles[background]} ${paddingStyles[padding]} ${className}`}
    >
      <div className="max-w-6xl mx-auto px-6">
        {children}
      </div>
    </section>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  light?: boolean;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  align = 'center',
  light = false,
  className = '',
}: SectionHeaderProps) {
  const alignStyles = {
    left: 'text-left',
    center: 'text-center mx-auto',
  };

  return (
    <ScrollReveal animation="fadeUp" className={`mb-12 max-w-2xl ${alignStyles[align]} ${className}`}>
      <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${light ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-lg ${light ? 'text-white/80' : 'text-gray-600'}`}>
          {subtitle}
        </p>
      )}
    </ScrollReveal>
  );
}

// Divider component for visual separation
interface DividerProps {
  variant?: 'line' | 'dots' | 'wave';
  color?: 'light' | 'dark';
  className?: string;
}

export function Divider({
  variant = 'line',
  color = 'light',
  className = '',
}: DividerProps) {
  const colorStyles = {
    light: 'border-gray-200',
    dark: 'border-gray-700',
  };

  if (variant === 'dots') {
    return (
      <div className={`flex justify-center gap-2 py-8 ${className}`}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              color === 'light' ? 'bg-gray-300' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    );
  }

  if (variant === 'wave') {
    return (
      <div className={`py-8 ${className}`}>
        <svg
          viewBox="0 0 1200 30"
          className={`w-full h-6 ${color === 'light' ? 'text-gray-200' : 'text-gray-700'}`}
          preserveAspectRatio="none"
        >
          <path
            d="M0,15 Q300,30 600,15 T1200,15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>
    );
  }

  return (
    <hr className={`border-t ${colorStyles[color]} my-12 ${className}`} />
  );
}

// Full-width background section (breaks out of container)
interface FullWidthSectionProps {
  children: React.ReactNode;
  background?: string;
  backgroundImage?: string;
  overlay?: boolean;
  className?: string;
}

export function FullWidthSection({
  children,
  background = 'bg-gray-50',
  backgroundImage,
  overlay = false,
  className = '',
}: FullWidthSectionProps) {
  return (
    <div className={`relative ${background} ${className}`}>
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      {overlay && (
        <div className="absolute inset-0 bg-black/50" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export default Section;
