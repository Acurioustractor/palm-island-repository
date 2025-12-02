'use client';

import { useState } from 'react';
import { ScrollReveal } from './ScrollReveal';

interface BreakdownItem {
  id: string;
  label: string;
  cents: number; // Out of 100
  color: string;
  description?: string;
  linkedStory?: {
    id: string;
    title: string;
  };
}

interface DollarBreakdownProps {
  items: BreakdownItem[];
  title?: string;
  subtitle?: string;
  showLabels?: boolean;
  interactive?: boolean;
  className?: string;
}

export function DollarBreakdown({
  items,
  title = 'Where Your Dollar Goes',
  subtitle = 'If you gave $1, here\'s how it was spent:',
  showLabels = true,
  interactive = true,
  className = '',
}: DollarBreakdownProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Sort by cents descending
  const sortedItems = [...items].sort((a, b) => b.cents - a.cents);

  return (
    <div className={`${className}`}>
      {(title || subtitle) && (
        <div className="mb-8 text-center">
          {title && (
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          )}
          {subtitle && (
            <p className="text-gray-600">{subtitle}</p>
          )}
        </div>
      )}

      <div className="space-y-4">
        {sortedItems.map((item, index) => (
          <ScrollReveal
            key={item.id}
            animation="fadeLeft"
            delay={index * 100}
          >
            <div
              className={`group ${interactive ? 'cursor-pointer' : ''}`}
              onMouseEnter={() => interactive && setHoveredItem(item.id)}
              onMouseLeave={() => interactive && setHoveredItem(null)}
            >
              {/* Label row */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800">{item.label}</span>
                <span className="font-bold text-lg" style={{ color: item.color }}>
                  {item.cents}¢
                </span>
              </div>

              {/* Bar */}
              <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-lg transition-all duration-500 ease-out"
                  style={{
                    width: `${item.cents}%`,
                    backgroundColor: item.color,
                    opacity: hoveredItem && hoveredItem !== item.id ? 0.5 : 1,
                  }}
                />

                {/* Pattern overlay for visual interest */}
                <div
                  className="absolute inset-y-0 left-0 rounded-lg opacity-10"
                  style={{
                    width: `${item.cents}%`,
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 20px)',
                  }}
                />
              </div>

              {/* Description (shown on hover or always if showLabels) */}
              {item.description && (
                <div
                  className={`mt-2 text-sm text-gray-600 transition-all duration-300 ${
                    hoveredItem === item.id || !interactive
                      ? 'opacity-100 max-h-20'
                      : 'opacity-0 max-h-0 overflow-hidden'
                  }`}
                >
                  {item.description}
                  {item.linkedStory && (
                    <a
                      href={`#story-${item.linkedStory.id}`}
                      className="ml-2 text-blue-600 hover:text-blue-700 underline"
                    >
                      Read story →
                    </a>
                  )}
                </div>
              )}
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Total verification */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Total</span>
          <span className="font-bold text-gray-800">
            {sortedItems.reduce((sum, item) => sum + item.cents, 0)}¢ = $1.00
          </span>
        </div>
      </div>
    </div>
  );
}

// Compact horizontal version
interface DollarBarProps {
  items: BreakdownItem[];
  showLegend?: boolean;
  className?: string;
}

export function DollarBar({
  items,
  showLegend = true,
  className = '',
}: DollarBarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className={className}>
      {/* Stacked bar */}
      <div className="h-12 rounded-xl overflow-hidden flex shadow-inner bg-gray-100">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative h-full transition-all duration-300 cursor-pointer group"
            style={{
              width: `${item.cents}%`,
              backgroundColor: item.color,
              opacity: hoveredItem && hoveredItem !== item.id ? 0.6 : 1,
            }}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {/* Tooltip */}
            <div
              className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap transition-all duration-200 ${
                hoveredItem === item.id
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-2 pointer-events-none'
              }`}
            >
              <div className="font-bold">{item.label}</div>
              <div className="text-gray-300">{item.cents}¢ per dollar</div>
              {/* Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="mt-4 flex flex-wrap gap-4 justify-center">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 text-sm"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-700">{item.label}</span>
              <span className="text-gray-500">({item.cents}¢)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DollarBreakdown;
