import { NextRequest, NextResponse } from 'next/server';
import { fetchFinancials, fetchStaffStatistics, fetchServiceMetrics } from '@/lib/data-intelligence/queries';
import { yoyGrowth, cagr, linearRegression } from '@/lib/data-intelligence/calculations';
import type { TrendPoint, GrowthMetric } from '@/lib/data-intelligence/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fromYear = parseInt(searchParams.get('from') || '2020');
  const toYear = parseInt(searchParams.get('to') || '2026');
  const includeProjections = searchParams.get('projections') === 'true';

  try {
    const [financials, staff, metrics] = await Promise.all([
      fetchFinancials(fromYear, toYear),
      fetchStaffStatistics(fromYear, toYear),
      fetchServiceMetrics(),
    ]);

    // Build trend points by fiscal year
    const yearSet = new Set<number>();
    financials.forEach((f: any) => yearSet.add(f.fiscal_year));
    staff.forEach((s: any) => yearSet.add(s.fiscal_year));
    const years = Array.from(yearSet).sort();

    const financialMap = new Map(financials.map((f: any) => [f.fiscal_year, f]));
    const staffMap = new Map(staff.map((s: any) => [s.fiscal_year, s]));

    // Aggregate service metrics by year
    const metricsMap = new Map<number, { clients: number; sessions: number }>();
    for (const m of metrics) {
      const fy = m.fiscal_year;
      const existing = metricsMap.get(fy) || { clients: 0, sessions: 0 };
      existing.clients += m.clients_served || 0;
      existing.sessions += m.sessions_delivered || 0;
      metricsMap.set(fy, existing);
    }

    const trendPoints: TrendPoint[] = years.map(year => {
      const fin = financialMap.get(year);
      const sta = staffMap.get(year);
      const met = metricsMap.get(year);
      const totalExpenditure = fin
        ? (fin.labour_costs || 0) + (fin.administration_expenses || 0) +
          (fin.property_energy_expenses || 0) + (fin.motor_vehicle_expenses || 0) +
          (fin.travel_training_expenses || 0) + (fin.client_related_costs || 0)
        : null;

      return {
        fiscal_year: `${year - 1}-${String(year).slice(2)}`,
        fiscal_year_end: year,
        income: fin?.total_income || null,
        expenditure: totalExpenditure,
        net_result: fin && totalExpenditure !== null ? (fin.total_income || 0) - totalExpenditure : null,
        total_assets: fin ? (fin.current_assets || 0) + (fin.non_current_assets || 0) : null,
        net_assets: fin ? (fin.current_assets || 0) + (fin.non_current_assets || 0) - (fin.current_liabilities || 0) - (fin.non_current_liabilities || 0) : null,
        total_staff: sta?.total_staff || null,
        indigenous_staff: sta?.indigenous_staff_count || null,
        resident_staff: sta?.palm_island_resident_count || null,
        clients_served: met?.clients || null,
        sessions_delivered: met?.sessions || null,
      };
    });

    // Compute growth metrics
    const growthMetrics: GrowthMetric[] = [];

    if (staff.length >= 2) {
      const latest = staff[staff.length - 1];
      const prev = staff[staff.length - 2];
      const first = staff[0];
      growthMetrics.push({
        label: 'Staff Count',
        current: latest.total_staff,
        previous: prev.total_staff,
        yoyGrowth: yoyGrowth(latest.total_staff, prev.total_staff),
        cagr: staff.length > 2 ? cagr(first.total_staff, latest.total_staff, staff.length - 1) : undefined,
      });
    }

    if (financials.length >= 2) {
      const latest = financials[financials.length - 1];
      const prev = financials[financials.length - 2];
      const first = financials[0];
      growthMetrics.push({
        label: 'Revenue',
        current: latest.total_income,
        previous: prev.total_income,
        yoyGrowth: yoyGrowth(latest.total_income, prev.total_income),
        cagr: financials.length > 2 ? cagr(first.total_income, latest.total_income, financials.length - 1) : undefined,
      });
    }

    // Optional linear projections
    let projections: TrendPoint[] | undefined;
    if (includeProjections && trendPoints.length >= 3) {
      const staffValues = trendPoints.map(p => (p.total_staff as number) || 0).filter(v => v > 0);
      const incomeValues = trendPoints.map(p => (p.income as number) || 0).filter(v => v > 0);
      const xVals = Array.from({ length: staffValues.length }, (_, i) => i);

      const staffReg = linearRegression(xVals, staffValues);
      const incomeReg = linearRegression(xVals, incomeValues);
      const lastYear = years[years.length - 1];

      projections = [1, 2].map(offset => ({
        fiscal_year: `${lastYear + offset - 1}-${String(lastYear + offset).slice(2)}`,
        fiscal_year_end: lastYear + offset,
        total_staff: Math.round(staffReg.predict(staffValues.length - 1 + offset)),
        income: Math.round(incomeReg.predict(incomeValues.length - 1 + offset)),
        projected: true,
      }));
    }

    return NextResponse.json({
      data: trendPoints,
      growthMetrics,
      projections,
      yearRange: { from: years[0], to: years[years.length - 1] },
    });
  } catch (error) {
    console.error('Enhanced trends API error:', error);
    return NextResponse.json({ error: 'Failed to fetch trends data' }, { status: 500 });
  }
}
