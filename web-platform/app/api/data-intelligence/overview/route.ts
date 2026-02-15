import { NextResponse } from 'next/server';
import { fetchFinancials, fetchStaffStatistics, fetchServices, fetchPartners } from '@/lib/data-intelligence/queries';
import { yoyGrowth, formatCurrency } from '@/lib/data-intelligence/calculations';
import type { OverviewKPI } from '@/lib/data-intelligence/types';

export async function GET() {
  try {
    const [financials, staff, services, partners] = await Promise.all([
      fetchFinancials(),
      fetchStaffStatistics(),
      fetchServices(),
      fetchPartners(),
    ]);

    // Get latest and previous year
    const latestFinancial = financials[financials.length - 1];
    const prevFinancial = financials.length > 1 ? financials[financials.length - 2] : null;
    const latestStaff = staff[staff.length - 1];
    const prevStaff = staff.length > 1 ? staff[staff.length - 2] : null;

    const totalExpenditure = latestFinancial
      ? (latestFinancial.labour_costs || 0) +
        (latestFinancial.administration_expenses || 0) +
        (latestFinancial.property_energy_expenses || 0) +
        (latestFinancial.motor_vehicle_expenses || 0) +
        (latestFinancial.travel_training_expenses || 0) +
        (latestFinancial.client_related_costs || 0)
      : 0;

    const totalAssets = latestFinancial
      ? (latestFinancial.current_assets || 0) + (latestFinancial.non_current_assets || 0)
      : 0;
    const totalLiabilities = latestFinancial
      ? (latestFinancial.current_liabilities || 0) + (latestFinancial.non_current_liabilities || 0)
      : 0;
    const netAssets = totalAssets - totalLiabilities;
    const liquidityRatio = (latestFinancial?.current_liabilities || 0) > 0
      ? (latestFinancial?.current_assets || 0) / (latestFinancial.current_liabilities || 1)
      : 0;
    const labourRatio = totalExpenditure > 0
      ? ((latestFinancial?.labour_costs || 0) / totalExpenditure) * 100
      : 0;

    const kpis: OverviewKPI[] = [
      {
        label: 'Total Staff',
        value: latestStaff?.total_staff || 0,
        previousValue: prevStaff?.total_staff || 0,
        change: latestStaff && prevStaff ? yoyGrowth(latestStaff.total_staff, prevStaff.total_staff) : 0,
        changeLabel: 'vs prior year',
        icon: 'Users',
        color: 'blue',
      },
      {
        label: 'Total Income',
        value: formatCurrency(latestFinancial?.total_income || 0),
        previousValue: prevFinancial ? formatCurrency(prevFinancial.total_income || 0) : undefined,
        change: latestFinancial && prevFinancial ? yoyGrowth(latestFinancial.total_income, prevFinancial.total_income) : 0,
        changeLabel: 'vs prior year',
        icon: 'DollarSign',
        color: 'green',
      },
      {
        label: 'Active Services',
        value: services.filter((s: any) => s.is_active !== false).length,
        icon: 'Building2',
        color: 'purple',
      },
      {
        label: 'Net Assets',
        value: formatCurrency(netAssets),
        icon: 'Landmark',
        color: 'amber',
      },
      {
        label: 'Partners',
        value: partners.length,
        icon: 'Handshake',
        color: 'teal',
      },
      {
        label: 'Indigenous Staff %',
        value: latestStaff && latestStaff.total_staff > 0
          ? `${Math.round((latestStaff.indigenous_staff_count / latestStaff.total_staff) * 100)}%`
          : 'N/A',
        icon: 'Heart',
        color: 'rose',
      },
    ];

    const ratios = {
      liquidityRatio: Math.round(liquidityRatio * 100) / 100,
      labourRatio: Math.round(labourRatio * 10) / 10,
      netSurplusDeficit: (latestFinancial?.total_income || 0) - totalExpenditure,
      expenseToIncomeRatio: latestFinancial?.total_income
        ? Math.round((totalExpenditure / latestFinancial.total_income) * 1000) / 10
        : 0,
    };

    return NextResponse.json({
      kpis,
      ratios,
      fiscalYear: latestFinancial?.fiscal_year || null,
    });
  } catch (error) {
    console.error('Overview API error:', error);
    return NextResponse.json({ error: 'Failed to fetch overview data' }, { status: 500 });
  }
}
