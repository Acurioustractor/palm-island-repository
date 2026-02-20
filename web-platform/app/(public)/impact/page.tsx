import { createServerSupabase } from '@/lib/supabase/client';
import { getLiveStats } from '@/lib/stats/get-live-stats';
import { getHeroImage, getHeroVideo } from '@/lib/media/utils';
import ImpactPageClient from './ImpactPageClient';

export default async function ImpactPage() {
  const supabase = createServerSupabase();

  const [stats, heroImage, heroVideo, financialsResult, staffResult, serviceMetricsResult] =
    await Promise.all([
      getLiveStats(),
      getHeroImage('impact'),
      getHeroVideo('impact'),

      // All historical financials with expense breakdown
      supabase
        .from('annual_financials')
        .select('fiscal_year, total_income, labour_costs, administration_expenses, travel_training_expenses, client_related_costs, property_energy_expenses, motor_vehicle_expenses')
        .order('fiscal_year', { ascending: true }),

      // All historical staff stats
      supabase
        .from('staff_statistics')
        .select('fiscal_year, total_staff, indigenous_staff_count')
        .order('fiscal_year', { ascending: true }),

      // Service metrics (aggregate per fiscal year)
      supabase
        .from('service_metrics')
        .select('fiscal_year, clients_served, sessions_delivered'),
    ]);

  // Shape financial history with expense breakdown
  const incomeHistory = (financialsResult.data ?? []).map((row) => ({
    year: String(row.fiscal_year),
    income: Number(row.total_income || 0),
    labour: Number(row.labour_costs || 0),
    admin: Number(row.administration_expenses || 0),
    travel: Number(row.travel_training_expenses || 0),
    clientCosts: Number(row.client_related_costs || 0),
    property: Number(row.property_energy_expenses || 0),
    vehicles: Number(row.motor_vehicle_expenses || 0),
  }));

  // Latest year expense breakdown for the bar chart
  const latestFinancials = incomeHistory[incomeHistory.length - 1];
  const expenseBreakdown = latestFinancials ? {
    labourCosts: { amount: latestFinancials.labour, pct: 0 },
    adminExpenses: { amount: latestFinancials.admin, pct: 0 },
    travelTraining: { amount: latestFinancials.travel, pct: 0 },
    clientCosts: { amount: latestFinancials.clientCosts, pct: 0 },
    propertyEnergy: { amount: latestFinancials.property, pct: 0 },
    motorVehicle: { amount: latestFinancials.vehicles, pct: 0 },
  } : null;

  // Calculate percentages from total expenses
  if (expenseBreakdown) {
    const totalExpenses = Object.values(expenseBreakdown).reduce((s, v) => s + v.amount, 0);
    if (totalExpenses > 0) {
      for (const val of Object.values(expenseBreakdown)) {
        val.pct = Math.round((val.amount / totalExpenses) * 100);
      }
    }
  }

  // Shape staff history: [{year: "2022", staff: 152, indigenous: 122}, ...]
  const staffHistory = (staffResult.data ?? []).map((row) => ({
    year: String(row.fiscal_year),
    staff: row.total_staff,
    indigenous: row.indigenous_staff_count ?? 0,
  }));

  // Aggregate service metrics by fiscal year
  const servicesByYear: Record<number, { clients: number; sessions: number }> = {};
  for (const row of serviceMetricsResult.data ?? []) {
    const fy = row.fiscal_year;
    if (!servicesByYear[fy]) servicesByYear[fy] = { clients: 0, sessions: 0 };
    servicesByYear[fy].clients += row.clients_served ?? 0;
    servicesByYear[fy].sessions += row.sessions_delivered ?? 0;
  }
  // Find latest year with service data
  const latestServiceYear = Math.max(...Object.keys(servicesByYear).map(Number));
  const latestServiceData = servicesByYear[latestServiceYear] ?? {
    clients: 0,
    sessions: 0,
  };

  return (
    <ImpactPageClient
      staffTotal={stats.staff.total}
      staffIndigenousPct={stats.staff.indigenousPct}
      servicesTotal={stats.services.total}
      incomeDisplay={stats.financials.incomeDisplay}
      fiscalYear={stats.fiscalYear}
      heroImage={heroImage}
      heroVideoSrc={heroVideo?.public_url || null}
      incomeHistory={incomeHistory}
      expenseBreakdown={expenseBreakdown}
      staffHistory={staffHistory}
      latestServiceData={latestServiceData}
      latestServiceYear={isFinite(latestServiceYear) ? String(latestServiceYear) : null}
    />
  );
}
