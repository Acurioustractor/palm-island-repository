import { NextResponse } from 'next/server';
import { fetchFinancials, fetchStaffStatistics, fetchServiceMetrics } from '@/lib/data-intelligence/queries';
import { pearsonCorrelation, interpretCorrelation } from '@/lib/data-intelligence/calculations';
import type { CorrelationPair } from '@/lib/data-intelligence/types';

export async function GET() {
  try {
    const [financials, staff, metrics] = await Promise.all([
      fetchFinancials(),
      fetchStaffStatistics(),
      fetchServiceMetrics(),
    ]);

    // Align by fiscal year
    const years = new Set<number>();
    financials.forEach((f: any) => years.add(f.fiscal_year));
    staff.forEach((s: any) => years.add(s.fiscal_year));
    const sortedYears = Array.from(years).sort();

    const finMap = new Map(financials.map((f: any) => [f.fiscal_year, f]));
    const staffMap = new Map(staff.map((s: any) => [s.fiscal_year, s]));

    // Aggregate service metrics by year
    const metricsMap = new Map<number, number>();
    for (const m of metrics) {
      metricsMap.set(m.fiscal_year, (metricsMap.get(m.fiscal_year) || 0) + (m.clients_served || 0));
    }

    // Build aligned arrays
    const staffCounts: number[] = [];
    const incomeSeries: number[] = [];
    const clientsSeries: number[] = [];
    const indigenousCounts: number[] = [];

    for (const year of sortedYears) {
      const s = staffMap.get(year);
      const f = finMap.get(year);
      const c = metricsMap.get(year);

      if (s && f) {
        staffCounts.push(s.total_staff || 0);
        incomeSeries.push(f.total_income || 0);
        clientsSeries.push(c || 0);
        indigenousCounts.push(s.indigenous_staff_count || 0);
      }
    }

    const correlations: CorrelationPair[] = [];

    // Staff ↔ Income
    if (staffCounts.length >= 3) {
      const r = pearsonCorrelation(staffCounts, incomeSeries);
      correlations.push({
        metricA: 'Total Staff',
        metricB: 'Total Income',
        correlation: Math.round(r * 100) / 100,
        dataPoints: staffCounts.length,
        interpretation: interpretCorrelation(r),
      });
    }

    // Staff ↔ Clients
    if (staffCounts.length >= 3 && clientsSeries.some(c => c > 0)) {
      const r = pearsonCorrelation(staffCounts, clientsSeries);
      correlations.push({
        metricA: 'Total Staff',
        metricB: 'Clients Served',
        correlation: Math.round(r * 100) / 100,
        dataPoints: staffCounts.length,
        interpretation: interpretCorrelation(r),
      });
    }

    // Income ↔ Clients
    if (incomeSeries.length >= 3 && clientsSeries.some(c => c > 0)) {
      const r = pearsonCorrelation(incomeSeries, clientsSeries);
      correlations.push({
        metricA: 'Total Income',
        metricB: 'Clients Served',
        correlation: Math.round(r * 100) / 100,
        dataPoints: incomeSeries.length,
        interpretation: interpretCorrelation(r),
      });
    }

    // Indigenous Staff ↔ Income
    if (indigenousCounts.length >= 3) {
      const r = pearsonCorrelation(indigenousCounts, incomeSeries);
      correlations.push({
        metricA: 'Indigenous Staff',
        metricB: 'Total Income',
        correlation: Math.round(r * 100) / 100,
        dataPoints: indigenousCounts.length,
        interpretation: interpretCorrelation(r),
      });
    }

    // Indigenous % ↔ Staff Growth
    if (staffCounts.length >= 3) {
      const indigenousPct = staffCounts.map((s, i) => s > 0 ? (indigenousCounts[i] / s) * 100 : 0);
      const r = pearsonCorrelation(indigenousPct, staffCounts);
      correlations.push({
        metricA: 'Indigenous Staff %',
        metricB: 'Total Staff',
        correlation: Math.round(r * 100) / 100,
        dataPoints: staffCounts.length,
        interpretation: interpretCorrelation(r),
      });
    }

    return NextResponse.json({
      correlations,
      dataYears: sortedYears.map(y => `${y - 1}-${String(y).slice(2)}`),
    });
  } catch (error) {
    console.error('Correlations API error:', error);
    return NextResponse.json({ error: 'Failed to compute correlations' }, { status: 500 });
  }
}
