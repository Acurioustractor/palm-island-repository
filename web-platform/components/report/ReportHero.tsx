'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface ReportHeroProps {
  title: string;
  subtitle?: string;
  year?: number | string;
  organization?: string;
  tagline?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  backgroundVideoPoster?: string;
  overlay?: 'light' | 'dark' | 'gradient';
  showScrollIndicator?: boolean;
  className?: string;
}

export function ReportHero({
  title,
  subtitle,
  year,
  organization = 'Palm Island Community Company',
  tagline = 'Our Community, Our Future, Our Way',
  backgroundImage,
  backgroundVideo,
  backgroundVideoPoster,
  overlay = 'gradient',
  showScrollIndicator = true,
  className = '',
}: ReportHeroProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const overlayStyles = {
    light: 'bg-white/80',
    dark: 'bg-gray-900/70',
    gradient: 'bg-gradient-to-b from-[#1e3a5f]/90 via-[#1e3a5f]/70 to-[#2d6a4f]/90',
  };

  return (
    <section
      className={`relative min-h-screen flex flex-col items-center justify-center overflow-hidden ${className}`}
    >
      {/* Background Video or Image */}
      {backgroundVideo ? (
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={backgroundVideoPoster || backgroundImage}
            className="absolute inset-0 w-full h-full object-cover scale-105"
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        </div>
      ) : backgroundImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f] via-[#2d4a6f] to-[#2d6a4f]" />
      )}

      {/* Overlay */}
      <div className={`absolute inset-0 ${overlayStyles[overlay]}`} />

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Organization */}
        <p
          className={`text-white/80 uppercase tracking-[0.2em] text-sm mb-6 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {organization}
        </p>

        {/* Main Title */}
        <h1
          className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {title}
        </h1>

        {/* Year */}
        {year && (
          <p
            className={`text-5xl sm:text-6xl md:text-7xl font-light text-white/90 mb-6 transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {year}
          </p>
        )}

        {/* Subtitle */}
        {subtitle && (
          <p
            className={`text-xl sm:text-2xl text-white/90 mb-8 transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {subtitle}
          </p>
        )}

        {/* Tagline */}
        <p
          className={`text-lg text-white/70 italic transition-all duration-700 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          "{tagline}"
        </p>
      </div>

      {/* Scroll Indicator */}
      {showScrollIndicator && (
        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-700 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <button
            onClick={() => {
              window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth',
              });
            }}
            className="flex flex-col items-center gap-2 text-white/60 hover:text-white/90 transition-colors group"
            aria-label="Scroll to explore"
          >
            <span className="text-sm uppercase tracking-wider">Scroll to explore</span>
            <ChevronDown className="w-6 h-6 animate-bounce" />
          </button>
        </div>
      )}
    </section>
  );
}

export default ReportHero;
