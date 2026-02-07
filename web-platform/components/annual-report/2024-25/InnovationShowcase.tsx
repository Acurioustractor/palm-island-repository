'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, Wifi, Baby, ChevronRight } from 'lucide-react';

interface Innovation {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: 'delegated-authority' | 'digital-centre' | 'first-1000-days';
  stats?: { label: string; value: string }[];
  color: string;
}

const DEFAULT_INNOVATIONS: Innovation[] = [
  {
    id: 'delegated-authority',
    title: 'Delegated Authority',
    tagline: 'Bwgcolman Way: Empowered and Resilient',
    description:
      'Community now decides care arrangements for children who cannot stay at home. A decades-long goal achieved through the Child Protection Act, with $107.8 million in funding over 4 years.',
    icon: 'delegated-authority',
    stats: [
      { label: 'Funding', value: '$107.8M' },
      { label: 'Period', value: '2023-2028' },
    ],
    color: '#1e3a5f',
  },
  {
    id: 'digital-centre',
    title: 'Digital Service Centre',
    tagline: 'Telstra Partnership',
    description:
      'Employment program and digital connectivity hub supporting 50 languages. Staff complete 12-week TAFE, 5-week Telstra training, and Cert III Business qualification.',
    icon: 'digital-centre',
    stats: [
      { label: 'Staff', value: '21' },
      { label: 'Languages', value: '50' },
    ],
    color: '#0d9488',
  },
  {
    id: 'first-1000-days',
    title: 'First 1,000 Days',
    tagline: 'Best Start in Life',
    description:
      'Intensive support for families during the critical first 1,000 days of a child\'s life. Team includes a child health nurse, Aboriginal health worker, and GP with maternal and child health focus.',
    icon: 'first-1000-days',
    stats: [
      { label: 'Launched', value: 'April 2024' },
      { label: 'Children Q1-Q2', value: '711' },
    ],
    color: '#7c3aed',
  },
];

const ICONS: Record<string, React.ElementType> = {
  'delegated-authority': Landmark,
  'digital-centre': Wifi,
  'first-1000-days': Baby,
};

interface InnovationShowcaseProps {
  innovations?: Innovation[];
}

export function InnovationShowcase({ innovations }: InnovationShowcaseProps) {
  const items = innovations || DEFAULT_INNOVATIONS;
  const [activeId, setActiveId] = useState(items[0].id);
  const active = items.find((i) => i.id === activeId) || items[0];
  const Icon = ICONS[active.icon] || Landmark;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {items.map((item) => {
          const TabIcon = ICONS[item.icon] || Landmark;
          return (
            <button
              key={item.id}
              onClick={() => setActiveId(item.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeId === item.id
                  ? 'text-white shadow-lg'
                  : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
              }`}
              style={
                activeId === item.id
                  ? { backgroundColor: item.color }
                  : undefined
              }
            >
              <TabIcon className="w-4 h-4" />
              {item.title}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
        >
          <div className="p-8 md:p-12">
            <div className="flex items-start gap-6">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${active.color}15` }}
              >
                <Icon className="w-7 h-7" style={{ color: active.color }} />
              </div>
              <div className="flex-1">
                <p
                  className="text-sm font-medium uppercase tracking-wider mb-1"
                  style={{ color: active.color }}
                >
                  {active.tagline}
                </p>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {active.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {active.description}
                </p>

                {active.stats && active.stats.length > 0 && (
                  <div className="flex flex-wrap gap-6 mt-6">
                    {active.stats.map((stat) => (
                      <div key={stat.label}>
                        <div
                          className="text-2xl font-bold"
                          style={{ color: active.color }}
                        >
                          {stat.value}
                        </div>
                        <div className="text-sm text-gray-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
