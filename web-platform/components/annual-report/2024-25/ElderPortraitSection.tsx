'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface ElderPortrait {
  name: string;
  quote: string;
  photoUrl?: string;
  role?: string;
}

interface ElderPortraitSectionProps {
  elders: ElderPortrait[];
}

export function ElderPortraitSection({ elders }: ElderPortraitSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  if (elders.length === 0) return null;

  // Show up to 6 elder portraits
  const displayElders = elders.slice(0, 6);
  // Feature first elder large, rest in grid
  const featured = displayElders[0];
  const rest = displayElders.slice(1);

  return (
    <section ref={ref} className="bg-gray-900 py-20 md:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-sm uppercase tracking-[0.3em] text-amber-400/80 font-medium mb-4">
            Our Elders
          </h2>
          <p className="text-3xl md:text-5xl font-bold text-white">
            Wisdom &amp; Guidance
          </p>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-lg">
            The voices of our Elders guide everything we do. Their stories carry the
            knowledge of generations.
          </p>
        </motion.div>

        {/* Featured elder */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col md:flex-row items-center gap-10 mb-16"
        >
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden flex-shrink-0 ring-4 ring-amber-500/30 shadow-2xl">
            {featured.photoUrl ? (
              <img
                src={featured.photoUrl}
                alt={featured.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center">
                <span className="text-4xl font-bold text-white/60">
                  {featured.name.split(' ').map((w) => w[0]).join('')}
                </span>
              </div>
            )}
          </div>
          <div className="text-center md:text-left">
            <blockquote className="text-xl md:text-2xl text-gray-200 font-light italic leading-relaxed">
              &ldquo;{featured.quote}&rdquo;
            </blockquote>
            <div className="mt-6">
              <div className="font-semibold text-white text-lg">{featured.name}</div>
              {featured.role && (
                <div className="text-amber-400/80 text-sm">{featured.role}</div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Remaining elders grid */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((elder, index) => (
              <motion.div
                key={elder.name}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-amber-500/20">
                    {elder.photoUrl ? (
                      <img
                        src={elder.photoUrl}
                        alt={elder.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center">
                        <span className="text-sm font-bold text-white/60">
                          {elder.name.split(' ').map((w) => w[0]).join('')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{elder.name}</div>
                    {elder.role && (
                      <div className="text-amber-400/60 text-xs">{elder.role}</div>
                    )}
                  </div>
                </div>
                <blockquote className="mt-4 text-gray-300 text-sm italic leading-relaxed line-clamp-4">
                  &ldquo;{elder.quote}&rdquo;
                </blockquote>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
