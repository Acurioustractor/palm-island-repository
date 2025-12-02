'use client';

import { useEffect, useRef, useState } from 'react';

type AnimationType = 'fadeUp' | 'fadeDown' | 'fadeLeft' | 'fadeRight' | 'fade' | 'scale' | 'slideUp';

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
  className?: string;
  disabled?: boolean;
}

const animations: Record<AnimationType, { initial: string; animate: string }> = {
  fadeUp: {
    initial: 'opacity-0 translate-y-8',
    animate: 'opacity-100 translate-y-0',
  },
  fadeDown: {
    initial: 'opacity-0 -translate-y-8',
    animate: 'opacity-100 translate-y-0',
  },
  fadeLeft: {
    initial: 'opacity-0 translate-x-8',
    animate: 'opacity-100 translate-x-0',
  },
  fadeRight: {
    initial: 'opacity-0 -translate-x-8',
    animate: 'opacity-100 translate-x-0',
  },
  fade: {
    initial: 'opacity-0',
    animate: 'opacity-100',
  },
  scale: {
    initial: 'opacity-0 scale-95',
    animate: 'opacity-100 scale-100',
  },
  slideUp: {
    initial: 'opacity-0 translate-y-16',
    animate: 'opacity-100 translate-y-0',
  },
};

export function ScrollReveal({
  children,
  animation = 'fadeUp',
  delay = 0,
  duration = 500,
  threshold = 0.1,
  once = true,
  className = '',
  disabled = false,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(disabled);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              observer.disconnect();
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, once, disabled]);

  const { initial, animate } = animations[animation];

  return (
    <div
      ref={ref}
      className={`transition-all ${isVisible ? animate : initial} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
    </div>
  );
}

// Stagger children animation wrapper
interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  animation?: AnimationType;
  className?: string;
}

export function StaggerContainer({
  children,
  staggerDelay = 100,
  animation = 'fadeUp',
  className = '',
}: StaggerContainerProps) {
  return (
    <div className={className}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <ScrollReveal
              key={index}
              animation={animation}
              delay={index * staggerDelay}
            >
              {child}
            </ScrollReveal>
          ))
        : children}
    </div>
  );
}

// Parallax effect component
interface ParallaxProps {
  children: React.ReactNode;
  speed?: number; // 0.1 to 0.5 recommended
  className?: string;
}

export function Parallax({ children, speed = 0.2, className = '' }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const elementTop = rect.top + scrollY;
      const viewportHeight = window.innerHeight;

      // Calculate parallax offset
      const relativeScroll = scrollY - elementTop + viewportHeight;
      const parallaxOffset = relativeScroll * speed;

      setOffset(parallaxOffset);
    };

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <div
        style={{
          transform: `translateY(${offset}px)`,
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default ScrollReveal;
