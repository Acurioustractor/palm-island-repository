'use client';

import { useState, useEffect } from 'react';

type TabId = 'services' | 'financials' | 'highlights' | 'preview' | 'stories' | 'board' | 'photos' | 'projects' | 'countdown' | 'overview';

interface OverallProgressProps {
  servicesWithData: number;
  totalServices: number;
  financialsDone: boolean;
  highlightsCount: number;
  storiesCount: number;
  boardMembersCount: number;
  photosCount: number;
  projectsFeaturedCount: number;
  onChipClick: (tab: TabId) => void;
}

const SEGMENT_COLORS = [
  'bg-picc-red',       // Services
  'bg-sage-500',       // Financials
  'bg-picc-ochre',     // Highlights
  'bg-picc-ochre',     // Stories
  'bg-picc-red-300',   // Board
  'bg-picc-ochre-300', // Photos
  'bg-picc-earth-500', // Projects
];

export default function OverallProgress({
  servicesWithData,
  totalServices,
  financialsDone,
  highlightsCount,
  storiesCount,
  boardMembersCount,
  photosCount,
  projectsFeaturedCount,
  onChipClick,
}: OverallProgressProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const servicePercent = totalServices > 0 ? servicesWithData / totalServices : 0;
  const financialsPercent = financialsDone ? 1 : 0;
  const highlightsPercent = highlightsCount > 0 ? 1 : 0;
  const storiesPercent = storiesCount > 0 ? 1 : 0;
  const boardPercent = boardMembersCount > 0 ? 1 : 0;
  const photosPercent = photosCount > 0 ? 1 : 0;
  const projectsPercent = projectsFeaturedCount > 0 ? 1 : 0;

  const weights = [35, 15, 10, 15, 10, 10, 5];
  const percents = [servicePercent, financialsPercent, highlightsPercent, storiesPercent, boardPercent, photosPercent, projectsPercent];

  const overall = Math.round(
    percents.reduce((sum, p, i) => sum + p * weights[i], 0)
  );

  const chips: { tab: TabId; label: string; done: boolean; detail: string; weight: number; percent: number; color: string }[] = [
    {
      tab: 'services',
      label: 'Services',
      done: servicesWithData === totalServices && totalServices > 0,
      detail: `${servicesWithData}/${totalServices}`,
      weight: 35,
      percent: servicePercent,
      color: SEGMENT_COLORS[0],
    },
    {
      tab: 'financials',
      label: 'Financials',
      done: financialsDone,
      detail: financialsDone ? '\u2713' : '--',
      weight: 15,
      percent: financialsPercent,
      color: SEGMENT_COLORS[1],
    },
    {
      tab: 'highlights',
      label: 'Highlights',
      done: highlightsCount > 0,
      detail: `${highlightsCount}`,
      weight: 10,
      percent: highlightsPercent,
      color: SEGMENT_COLORS[2],
    },
    {
      tab: 'stories',
      label: 'Stories',
      done: storiesCount > 0,
      detail: `${storiesCount}`,
      weight: 15,
      percent: storiesPercent,
      color: SEGMENT_COLORS[3],
    },
    {
      tab: 'board',
      label: 'Board',
      done: boardMembersCount > 0,
      detail: `${boardMembersCount}`,
      weight: 10,
      percent: boardPercent,
      color: SEGMENT_COLORS[4],
    },
    {
      tab: 'photos',
      label: 'Photos',
      done: photosCount > 0,
      detail: `${photosCount}`,
      weight: 10,
      percent: photosPercent,
      color: SEGMENT_COLORS[5],
    },
    {
      tab: 'projects',
      label: 'Innovation',
      done: projectsFeaturedCount > 0,
      detail: `${projectsFeaturedCount}`,
      weight: 5,
      percent: projectsPercent,
      color: SEGMENT_COLORS[6],
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
      {/* Segmented progress bar */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex-1 flex gap-0.5 h-3 bg-gray-100 rounded-full overflow-hidden">
          {chips.map(chip => (
            <div
              key={chip.tab}
              className={`transition-all duration-700 ease-out ${
                chip.percent > 0 ? chip.color : 'bg-gray-200'
              }`}
              style={{
                width: `${chip.weight}%`,
                opacity: animated ? 1 : 0,
                transform: animated ? 'scaleX(1)' : 'scaleX(0)',
                transformOrigin: 'left',
              }}
            />
          ))}
        </div>
        <span className="text-sm font-bold text-gray-700 w-16 text-right">
          {overall}%
        </span>
      </div>

      {/* Clickable chips with mini progress */}
      <div className="flex flex-wrap gap-2">
        {chips.map(chip => (
          <button
            key={chip.tab}
            onClick={() => onChipClick(chip.tab)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors hover:bg-gray-50"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                chip.done ? chip.color : 'bg-gray-300'
              }`}
            />
            <span>{chip.label}</span>
            <span className="text-gray-400">{chip.detail}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
