'use client';

import { ReactNode, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Printer } from 'lucide-react';

/* ─────────────────────────────────────────────
 * SectionTitle — Olson Kundig–style editorial heading
 * uppercase tracking label + large serif heading + subtitle
 * ───────────────────────────────────────────── */
export function SectionTitle({
  label,
  title,
  subtitle,
  light = false,
  align = 'center',
}: {
  label?: string;
  title: string;
  subtitle?: string;
  light?: boolean;
  align?: 'center' | 'left';
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const alignClass = align === 'left' ? 'text-left' : 'text-center';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`${alignClass} mb-16 md:mb-20`}
    >
      {label && (
        <p
          className={`text-[11px] uppercase tracking-[0.35em] font-medium mb-4 ${
            light ? 'text-white/40' : 'text-gray-400'
          }`}
        >
          {label}
        </p>
      )}
      <h2
        className={`text-3xl md:text-5xl lg:text-[3.5rem] font-light leading-[1.1] tracking-tight ${
          light ? 'text-white' : 'text-gray-900'
        }`}
        style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 text-base md:text-lg font-light leading-relaxed max-w-2xl ${
            align === 'center' ? 'mx-auto' : ''
          } ${light ? 'text-white/60' : 'text-gray-500'}`}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
 * SectionDivider — Thin horizontal rule
 * ───────────────────────────────────────────── */
export function SectionDivider({ light = false }: { light?: boolean }) {
  return (
    <div className={`max-w-5xl mx-auto px-8 ${light ? 'opacity-20' : 'opacity-10'}`}>
      <hr className={light ? 'border-white' : 'border-gray-900'} />
    </div>
  );
}

/* ─────────────────────────────────────────────
 * ImpactNumber — Large editorial stat with context
 * ───────────────────────────────────────────── */
export function ImpactNumber({
  value,
  label,
  context,
  delay = 0,
}: {
  value: string | number;
  label: string;
  context: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className="text-center"
    >
      <div
        className="text-5xl md:text-7xl font-light text-gray-900 mb-2"
        style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
      >
        {value}
      </div>
      <div className="text-sm uppercase tracking-[0.2em] text-gray-500 font-medium mb-2">
        {label}
      </div>
      <p className="text-sm text-gray-400 font-light max-w-[200px] mx-auto">
        {context}
      </p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
 * ScrollRevealWrapper — For wrapping server content
 * ───────────────────────────────────────────── */
export function ScrollRevealWrapper({
  children,
  direction = 'up',
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const offsets = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...offsets[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
 * CommunityVisionCard
 * ───────────────────────────────────────────── */
export function CommunityVisionCard({
  vision,
  contributor,
  delay = 0,
}: {
  vision: string;
  contributor?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-sm p-8 border border-picc-ochre/10"
    >
      <blockquote className="text-lg text-gray-700 leading-relaxed font-light italic mb-4">
        &ldquo;{vision}&rdquo;
      </blockquote>
      {contributor && (
        <p className="text-sm text-picc-ochre font-medium">
          &mdash; {contributor}
        </p>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
 * PrintButton — Uses window.print()
 * ───────────────────────────────────────────── */
export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-picc-earth-600 transition-all inline-flex items-center gap-2"
    >
      <Printer className="w-5 h-5" />
      Print This Report
    </button>
  );
}
