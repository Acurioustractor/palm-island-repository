'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { MessageCircle, ArrowRight, Clock } from 'lucide-react';

export function ShareVoiceCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="bg-gradient-to-br from-gray-900 via-[#1e3a5f] to-gray-900 py-24 md:py-32">
      <div className="max-w-4xl mx-auto px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="w-16 h-16 mx-auto mb-8 rounded-full bg-picc-ochre/20 flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-picc-ochre-300" />
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Your Story Matters
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Palm Island&apos;s strength lives in the voices of its people. Share your
            experience, your wisdom, your vision for the future.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/share-voice"
              className="inline-flex items-center gap-3 px-8 py-4 bg-picc-ochre text-white font-semibold rounded-xl hover:bg-picc-ochre-300 transition-colors shadow-lg shadow-picc-ochre/20"
            >
              <MessageCircle className="w-5 h-5" />
              Share Your Voice
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/road-to-20-years"
              className="inline-flex items-center gap-3 px-8 py-4 border border-white/20 text-white font-medium rounded-xl hover:bg-white/10 transition-colors"
            >
              <Clock className="w-5 h-5" />
              Road to 20 Years
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
