'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface BoardMember {
  name: string;
  role: string;
  photoUrl?: string;
}

interface BoardGridProps {
  members: BoardMember[];
}

const DEFAULT_MEMBERS: BoardMember[] = [
  { name: 'Luella Bligh', role: 'Chair' },
  { name: 'Rhonda Phillips', role: 'Director' },
  { name: 'Allan Palm Island', role: 'Director' },
  { name: 'Matthew Lindsay', role: 'Company Secretary' },
  { name: 'Harriet Hulthen', role: 'Director' },
  { name: 'Raymond W. Palmer Snr', role: 'Director' },
  { name: 'Cassie Lang', role: 'Director' },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter((w) => w.length > 0 && w[0] === w[0].toUpperCase())
    .map((w) => w[0])
    .slice(0, 2)
    .join('');
}

export function BoardGrid({ members }: BoardGridProps) {
  const items = members.length > 0 ? members : DEFAULT_MEMBERS;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div ref={ref} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
      {items.map((member, index) => (
        <motion.div
          key={member.name}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: index * 0.08 }}
          className="text-center group"
        >
          <div className="relative w-28 h-28 md:w-36 md:h-36 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-[#1e3a5f] to-[#2d6a4f] shadow-lg group-hover:shadow-xl transition-shadow">
            {member.photoUrl ? (
              <img
                src={member.photoUrl}
                alt={member.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl md:text-3xl font-bold text-white/80">
                  {getInitials(member.name)}
                </span>
              </div>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 text-sm md:text-base">
            {member.name}
          </h3>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">{member.role}</p>
        </motion.div>
      ))}
    </div>
  );
}
