'use client';

import type { ExploreService } from '@/app/(public)/explore/page';

const CATEGORY_COLORS: Record<string, string> = {
  health_wellbeing: '#8B1A1A',
  community_services: '#C8922A',
  social_enterprise: '#5B7B5E',
  governance: '#2D2319',
  cultural: '#B07E22',
  youth: '#4A6A4D',
};

function formatCategory(cat: string) {
  return cat
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ExploreCategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
  serviceCounts,
}: {
  categories: string[];
  activeCategory: string | null;
  onCategoryChange: (cat: string | null) => void;
  serviceCounts: ExploreService[];
}) {
  const countFor = (cat: string | null) => {
    if (!cat) return serviceCounts.length;
    return serviceCounts.filter((s) => s.service_category === cat).length;
  };

  return (
    <div className="flex flex-wrap gap-1.5 max-w-[calc(100vw-460px)]">
      <button
        onClick={() => onCategoryChange(null)}
        className={`
          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
          transition-all duration-200 shadow-sm
          ${!activeCategory
            ? 'bg-gray-900 text-white shadow-md'
            : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md'
          }
        `}
      >
        All
        <span className="opacity-60">{countFor(null)}</span>
      </button>

      {categories.map((cat) => {
        const isActive = activeCategory === cat;
        const color = CATEGORY_COLORS[cat] || '#6366f1';

        return (
          <button
            key={cat}
            onClick={() => onCategoryChange(isActive ? null : cat)}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
              transition-all duration-200 shadow-sm
              ${isActive
                ? 'text-white shadow-md'
                : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md'
              }
            `}
            style={isActive ? { backgroundColor: color } : undefined}
          >
            {!isActive && (
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
            )}
            {formatCategory(cat)}
            <span className="opacity-60">{countFor(cat)}</span>
          </button>
        );
      })}
    </div>
  );
}
