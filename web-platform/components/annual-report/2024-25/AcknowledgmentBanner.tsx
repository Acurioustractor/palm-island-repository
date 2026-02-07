'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface AcknowledgmentBannerProps {
  text?: string;
}

const DEFAULT_ACKNOWLEDGMENT =
  'We acknowledge the Manbarra and Bwgcolman peoples as the Traditional Custodians of Great Palm Island and pay our respects to Elders past, present, and emerging. We honour the 42 language groups whose descendants call this island home.';

export function AcknowledgmentBanner({ text }: AcknowledgmentBannerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="bg-[#fefdfb] py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.25, 0.4, 0.25, 1] }}
        >
          {/* Decorative line */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-12 h-px bg-amber-700/40" />
            <div className="w-2 h-2 rounded-full bg-amber-700/40" />
            <div className="w-12 h-px bg-amber-700/40" />
          </div>

          <h2 className="text-sm uppercase tracking-[0.3em] text-amber-800/70 font-medium mb-6">
            Acknowledgment of Country
          </h2>

          <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-light italic">
            {text || DEFAULT_ACKNOWLEDGMENT}
          </p>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="w-12 h-px bg-amber-700/40" />
            <div className="w-2 h-2 rounded-full bg-amber-700/40" />
            <div className="w-12 h-px bg-amber-700/40" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
