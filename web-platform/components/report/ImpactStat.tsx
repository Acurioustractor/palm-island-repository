'use client';

import { useEffect, useState, useRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface ImpactStatProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  icon?: LucideIcon;
  description?: string;
  color?: 'earth' | 'ocean' | 'sunrise' | 'growth' | 'coral' | 'white';
  size?: 'sm' | 'md' | 'lg';
  animateOnScroll?: boolean;
  duration?: number;
  className?: string;
}

// Easing function for smooth animation
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function ImpactStat({
  value,
  label,
  prefix = '',
  suffix = '',
  icon: Icon,
  description,
  color = 'white',
  size = 'md',
  animateOnScroll = true,
  duration = 2000,
  className = '',
}: ImpactStatProps) {
  const [displayValue, setDisplayValue] = useState(animateOnScroll ? 0 : value);
  const [hasAnimated, setHasAnimated] = useState(!animateOnScroll);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animateOnScroll || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateValue();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [animateOnScroll, hasAnimated]);

  const animateValue = () => {
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const current = Math.round(easedProgress * value);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  const colorStyles = {
    earth: 'text-[#8b5a2b]',
    ocean: 'text-[#1e3a5f]',
    sunrise: 'text-[#e85d04]',
    growth: 'text-[#2d6a4f]',
    coral: 'text-[#ff6b6b]',
    white: 'text-white',
  };

  const sizeStyles = {
    sm: {
      number: 'text-3xl sm:text-4xl',
      label: 'text-sm',
      icon: 'w-6 h-6',
      padding: 'p-4',
    },
    md: {
      number: 'text-4xl sm:text-5xl',
      label: 'text-base',
      icon: 'w-8 h-8',
      padding: 'p-6',
    },
    lg: {
      number: 'text-5xl sm:text-6xl md:text-7xl',
      label: 'text-lg',
      icon: 'w-10 h-10',
      padding: 'p-8',
    },
  };

  const styles = sizeStyles[size];

  return (
    <div
      ref={ref}
      className={`text-center ${styles.padding} ${className}`}
    >
      {Icon && (
        <div className={`flex justify-center mb-3 ${colorStyles[color]} opacity-80`}>
          <Icon className={styles.icon} />
        </div>
      )}

      <div className={`font-bold ${styles.number} ${colorStyles[color]} mb-2`}>
        {prefix}
        {displayValue.toLocaleString()}
        {suffix}
      </div>

      <div className={`${styles.label} ${color === 'white' ? 'text-white/80' : 'text-gray-600'}`}>
        {label}
      </div>

      {description && (
        <p className={`mt-2 text-sm ${color === 'white' ? 'text-white/60' : 'text-gray-500'}`}>
          {description}
        </p>
      )}
    </div>
  );
}

// Grid wrapper for multiple stats
interface ImpactStatsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  background?: 'light' | 'dark' | 'gradient';
  className?: string;
}

export function ImpactStatsGrid({
  children,
  columns = 4,
  background = 'gradient',
  className = '',
}: ImpactStatsGridProps) {
  const bgStyles = {
    light: 'bg-gray-50',
    dark: 'bg-gray-900',
    gradient: 'bg-gradient-to-br from-[#1e3a5f] via-[#2d4a6f] to-[#2d6a4f]',
  };

  const columnStyles = {
    2: 'grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  return (
    <section className={`py-16 sm:py-24 ${bgStyles[background]} ${className}`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className={`grid ${columnStyles[columns]} gap-6 sm:gap-8`}>
          {children}
        </div>
      </div>
    </section>
  );
}

// Card variant for stats
interface ImpactStatCardProps extends ImpactStatProps {
  glassmorphism?: boolean;
}

export function ImpactStatCard({
  glassmorphism = true,
  ...props
}: ImpactStatCardProps) {
  return (
    <div
      className={`rounded-2xl ${
        glassmorphism
          ? 'bg-white/10 backdrop-blur-sm border border-white/20'
          : 'bg-white shadow-lg border border-gray-200'
      }`}
    >
      <ImpactStat {...props} />
    </div>
  );
}

export default ImpactStat;
