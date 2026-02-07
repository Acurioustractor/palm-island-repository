'use client';

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
  // Weighted: Services 35%, Financials 15%, Highlights 10%, Stories 15%, Board 10%, Photos 10%, Projects 5%
  const servicePercent = totalServices > 0 ? servicesWithData / totalServices : 0;
  const financialsPercent = financialsDone ? 1 : 0;
  const highlightsPercent = highlightsCount > 0 ? 1 : 0;
  const storiesPercent = storiesCount > 0 ? 1 : 0;
  const boardPercent = boardMembersCount > 0 ? 1 : 0;
  const photosPercent = photosCount > 0 ? 1 : 0;
  const projectsPercent = projectsFeaturedCount > 0 ? 1 : 0;

  const overall = Math.round(
    servicePercent * 35 +
    financialsPercent * 15 +
    highlightsPercent * 10 +
    storiesPercent * 15 +
    boardPercent * 10 +
    photosPercent * 10 +
    projectsPercent * 5
  );

  const barColor =
    overall >= 80 ? 'bg-emerald-500' : overall >= 40 ? 'bg-amber-500' : 'bg-red-500';

  const chips: { tab: TabId; label: string; done: boolean; detail: string }[] = [
    {
      tab: 'services',
      label: 'Services',
      done: servicesWithData === totalServices && totalServices > 0,
      detail: `${servicesWithData}/${totalServices}`,
    },
    {
      tab: 'financials',
      label: 'Financials',
      done: financialsDone,
      detail: financialsDone ? '\u2713' : '--',
    },
    {
      tab: 'highlights',
      label: 'Highlights',
      done: highlightsCount > 0,
      detail: `${highlightsCount}`,
    },
    {
      tab: 'stories',
      label: 'Stories',
      done: storiesCount > 0,
      detail: `${storiesCount}`,
    },
    {
      tab: 'board',
      label: 'Board',
      done: boardMembersCount > 0,
      detail: `${boardMembersCount}`,
    },
    {
      tab: 'photos',
      label: 'Photos',
      done: photosCount > 0,
      detail: `${photosCount}`,
    },
    {
      tab: 'projects',
      label: 'Innovation',
      done: projectsFeaturedCount > 0,
      detail: `${projectsFeaturedCount}`,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
      {/* Progress bar */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex-1 bg-gray-100 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${overall}%` }}
          />
        </div>
        <span className="text-sm font-bold text-gray-700 w-16 text-right">
          {overall}% Complete
        </span>
      </div>

      {/* Clickable chips */}
      <div className="flex flex-wrap gap-2">
        {chips.map(chip => (
          <button
            key={chip.tab}
            onClick={() => onChipClick(chip.tab)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors hover:bg-gray-50"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                chip.done ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            />
            {chip.label} {chip.detail}
          </button>
        ))}
      </div>
    </div>
  );
}
