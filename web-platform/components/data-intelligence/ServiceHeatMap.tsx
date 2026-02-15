'use client';

import React, { useMemo } from 'react';

interface ServiceHeatMapProps {
  data: {
    serviceId: string;
    serviceName: string;
    metrics: Record<string, number | null>;
  }[];
  metricLabels: string[];
}

function getHeatColor(value: number): string {
  // 0 = light, 1 = dark
  if (value <= 0) return '#F3F4F6';
  if (value < 0.25) return '#DBEAFE';
  if (value < 0.5) return '#93C5FD';
  if (value < 0.75) return '#3B82F6';
  return '#1D4ED8';
}

function getTextColor(value: number): string {
  return value >= 0.5 ? '#FFFFFF' : '#374151';
}

export default function ServiceHeatMap({ data, metricLabels }: ServiceHeatMapProps) {
  // Normalize each metric column 0-1
  const normalizedData = useMemo(() => {
    const maxByMetric: Record<string, number> = {};
    for (const label of metricLabels) {
      maxByMetric[label] = Math.max(
        ...data.map(d => Math.abs(d.metrics[label] || 0)),
        1
      );
    }

    return data.map(d => ({
      ...d,
      normalized: Object.fromEntries(
        metricLabels.map(label => [
          label,
          (d.metrics[label] || 0) / maxByMetric[label],
        ])
      ),
    }));
  }, [data, metricLabels]);

  if (data.length === 0) {
    return <div className="text-gray-500 text-sm p-4">No service metrics available.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left p-2 text-gray-600 font-medium sticky left-0 bg-white">Service</th>
            {metricLabels.map(label => (
              <th key={label} className="p-2 text-gray-600 font-medium text-center whitespace-nowrap">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {normalizedData.map(row => (
            <tr key={row.serviceId}>
              <td className="p-2 font-medium text-gray-900 sticky left-0 bg-white whitespace-nowrap max-w-[160px] truncate">
                {row.serviceName}
              </td>
              {metricLabels.map(label => {
                const norm = row.normalized[label] || 0;
                const raw = row.metrics[label];
                return (
                  <td
                    key={label}
                    className="p-2 text-center transition-colors"
                    style={{
                      backgroundColor: getHeatColor(norm),
                      color: getTextColor(norm),
                    }}
                    title={`${row.serviceName}: ${raw ?? 'N/A'}`}
                  >
                    {raw !== null && raw !== undefined
                      ? typeof raw === 'number' && raw >= 1000
                        ? `${(raw / 1000).toFixed(1)}k`
                        : raw
                      : '—'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
