'use client';

import { useRef, useCallback } from 'react';

type TabId = 'services' | 'financials' | 'highlights' | 'preview' | 'stories' | 'board' | 'photos' | 'projects' | 'countdown' | 'overview' | 'trends' | 'pageplan' | 'editions';

interface Tab {
  id: TabId;
  label: string;
  badge?: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  const navRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, currentIndex: number) => {
      let nextIndex: number | null = null;

      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = tabs.length - 1;
      }

      if (nextIndex !== null) {
        e.preventDefault();
        onTabChange(tabs[nextIndex].id);
        // Focus the new tab button
        const buttons = navRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
        buttons?.[nextIndex]?.focus();
      }
    },
    [tabs, onTabChange]
  );

  return (
    <div className="border-b border-gray-200 mb-6 relative">
      <div className="overflow-x-auto scrollbar-hide">
        <nav
          ref={navRef}
          className="flex gap-0 -mb-px"
          role="tablist"
          aria-label="Dashboard sections"
        >
          {tabs.map((tab, index) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                onKeyDown={e => handleKeyDown(e, index)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                className={`flex-shrink-0 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-picc-ochre text-picc-ochre'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.badge && (
                  <span
                    className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                      isActive
                        ? 'bg-warm-100 text-picc-ochre'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
      {/* Right-edge fade gradient for overflow */}
      <div className="absolute right-0 top-0 bottom-px w-8 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden" />
    </div>
  );
}
