'use client';

import { useState, useEffect, useRef } from 'react';

interface DonutSegment {
  id: string;
  label: string;
  value: number;
  color: string;
  description?: string;
}

interface FinancialDonutProps {
  data: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
  interactive?: boolean;
  showLegend?: boolean;
  animateOnScroll?: boolean;
  onSegmentClick?: (segment: DonutSegment) => void;
  className?: string;
}

export function FinancialDonut({
  data,
  size = 280,
  strokeWidth = 40,
  centerLabel,
  centerValue,
  interactive = true,
  showLegend = true,
  animateOnScroll = true,
  onSegmentClick,
  className = '',
}: FinancialDonutProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [animationProgress, setAnimationProgress] = useState(animateOnScroll ? 0 : 1);
  const ref = useRef<SVGSVGElement>(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Animate on scroll into view
  useEffect(() => {
    if (!animateOnScroll) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate from 0 to 1 over 1.5 seconds
            const duration = 1500;
            const startTime = performance.now();

            const animate = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Ease out cubic
              const eased = 1 - Math.pow(1 - progress, 3);
              setAnimationProgress(eased);

              if (progress < 1) {
                requestAnimationFrame(animate);
              }
            };

            requestAnimationFrame(animate);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [animateOnScroll]);

  // Calculate segment positions
  let currentAngle = -90; // Start from top
  const segments = data.map((segment) => {
    const percentage = segment.value / total;
    const angle = percentage * 360 * animationProgress;
    const startAngle = currentAngle;
    currentAngle += angle;

    return {
      ...segment,
      percentage,
      startAngle,
      angle,
    };
  });

  // Convert angle to SVG arc path
  const polarToCartesian = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: size / 2 + radius * Math.cos(rad),
      y: size / 2 + radius * Math.sin(rad),
    };
  };

  const describeArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(endAngle);
    const end = polarToCartesian(startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    ].join(' ');
  };

  const hoveredData = hoveredSegment
    ? segments.find((s) => s.id === hoveredSegment)
    : null;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Donut Chart */}
      <div className="relative">
        <svg
          ref={ref}
          width={size}
          height={size}
          className="transform -rotate-0"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />

          {/* Segments */}
          {segments.map((segment) => {
            if (segment.angle <= 0) return null;

            const isHovered = hoveredSegment === segment.id;
            const scale = isHovered ? 1.05 : 1;

            return (
              <g key={segment.id}>
                <path
                  d={describeArc(segment.startAngle, segment.startAngle + segment.angle)}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="butt"
                  className={`transition-all duration-300 ${interactive ? 'cursor-pointer' : ''}`}
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'center',
                    opacity: hoveredSegment && !isHovered ? 0.5 : 1,
                  }}
                  onMouseEnter={() => interactive && setHoveredSegment(segment.id)}
                  onMouseLeave={() => interactive && setHoveredSegment(null)}
                  onClick={() => onSegmentClick?.(segment)}
                />
              </g>
            );
          })}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {hoveredData ? (
            <>
              <span className="text-3xl font-bold text-gray-900">
                {(hoveredData.percentage * 100).toFixed(0)}%
              </span>
              <span className="text-sm text-gray-600 text-center max-w-[120px]">
                {hoveredData.label}
              </span>
            </>
          ) : (
            <>
              {centerValue && (
                <span className="text-2xl font-bold text-gray-900">{centerValue}</span>
              )}
              {centerLabel && (
                <span className="text-sm text-gray-500">{centerLabel}</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-sm">
          {segments.map((segment) => (
            <div
              key={segment.id}
              className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
                interactive ? 'cursor-pointer hover:bg-gray-50' : ''
              } ${hoveredSegment === segment.id ? 'bg-gray-50' : ''}`}
              onMouseEnter={() => interactive && setHoveredSegment(segment.id)}
              onMouseLeave={() => interactive && setHoveredSegment(null)}
              onClick={() => onSegmentClick?.(segment)}
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: segment.color }}
              />
              <div className="min-w-0">
                <div className="font-medium text-gray-800 text-sm truncate">
                  {segment.label}
                </div>
                <div className="text-xs text-gray-500">
                  ${segment.value.toLocaleString()} ({(segment.percentage * 100).toFixed(0)}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hovered description */}
      {hoveredData?.description && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg max-w-sm text-center">
          <p className="text-sm text-gray-600">{hoveredData.description}</p>
        </div>
      )}
    </div>
  );
}

// Simple percentage bars for mobile/accessible alternative
interface FinancialBarsProps {
  data: DonutSegment[];
  showPercentages?: boolean;
  className?: string;
}

export function FinancialBars({
  data,
  showPercentages = true,
  className = '',
}: FinancialBarsProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const sorted = [...data].sort((a, b) => b.value - a.value);

  return (
    <div className={`space-y-4 ${className}`}>
      {sorted.map((item) => {
        const percentage = (item.value / total) * 100;

        return (
          <div key={item.id}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
              <span className="text-sm text-gray-500">
                ${item.value.toLocaleString()}
                {showPercentages && ` (${percentage.toFixed(0)}%)`}
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FinancialDonut;
