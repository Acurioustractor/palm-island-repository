'use client';

import React from 'react';

interface GaugeChartProps {
  value: number;
  max: number;
  label: string;
  unit?: string;
  color?: string;
  size?: number;
  thresholds?: { warn: number; danger: number };
}

export default function GaugeChart({
  value,
  max,
  label,
  unit = '',
  color,
  size = 140,
  thresholds,
}: GaugeChartProps) {
  const normalized = Math.min(value / max, 1);
  const angle = normalized * 180;

  // Auto color based on thresholds
  const getColor = () => {
    if (color) return color;
    if (!thresholds) return '#3B82F6';
    if (value >= thresholds.danger) return '#EF4444';
    if (value >= thresholds.warn) return '#F59E0B';
    return '#10B981';
  };

  const r = size / 2 - 12;
  const cx = size / 2;
  const cy = size / 2 + 5;

  // Arc path
  const startAngle = Math.PI;
  const endAngle = Math.PI - (angle * Math.PI) / 180;
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = angle > 180 ? 1 : 0;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        {/* Background arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={10}
          strokeLinecap="round"
        />
        {/* Value arc */}
        {value > 0 && (
          <path
            d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
            fill="none"
            stroke={getColor()}
            strokeWidth={10}
            strokeLinecap="round"
          />
        )}
        {/* Value text */}
        <text
          x={cx}
          y={cy - 5}
          textAnchor="middle"
          className="fill-gray-900 font-bold"
          fontSize={size / 5}
        >
          {typeof value === 'number' ? (value % 1 === 0 ? value : value.toFixed(1)) : value}
          {unit && <tspan fontSize={size / 8} className="fill-gray-500">{unit}</tspan>}
        </text>
      </svg>
      <div className="text-xs text-gray-500 mt-1 text-center">{label}</div>
    </div>
  );
}
