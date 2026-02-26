import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getFinancials, formatFiscalYear } from '@/lib/financials/get-financials';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fromYear = parseInt(searchParams.get('from') || '2006');
  const toYear = parseInt(searchParams.get('to') || '2026');

  try {
    // Run all queries in parallel — financials via shared module, rest direct
    const [financialRecords, metricsResult, servicesResult, staffResult] = await Promise.all([
      getFinancials({ limit: 50 }),
      supabase
        .from('service_metrics')
        .select('fiscal_year, clients_served, sessions_delivered')
        .gte('fiscal_year', fromYear)
        .lte('fiscal_year', toYear)
        .then(r => r.data),
      supabase
        .from('organization_services')
        .select('id, created_at')
        .then(r => r.data),
      supabase
        .from('staff_statistics')
        .select('fiscal_year, total_staff, indigenous_staff_count, palm_island_resident_count')
        .gte('fiscal_year', fromYear)
        .lte('fiscal_year', toYear)
        .then(r => r.data),
    ]);

    // Aggregate metrics by fiscal year
    const yearMap: Record<number, {
      clients_served: number;
      sessions_delivered: number;
      revenue: number;
      expenditure: number;
      staff_count: number;
      indigenous_staff: number;
      resident_staff: number;
      services_count: number;
    }> = {};

    for (let y = fromYear; y <= toYear; y++) {
      yearMap[y] = {
        clients_served: 0, sessions_delivered: 0,
        revenue: 0, expenditure: 0,
        staff_count: 0, indigenous_staff: 0, resident_staff: 0,
        services_count: 0
      };
    }

    // Aggregate client data
    if (metricsResult) {
      for (const row of metricsResult) {
        const fy = row.fiscal_year;
        if (yearMap[fy]) {
          yearMap[fy].clients_served += row.clients_served || 0;
          yearMap[fy].sessions_delivered += row.sessions_delivered || 0;
        }
      }
    }

    // Revenue + expenditure from shared financial records
    for (const rec of financialRecords) {
      const fy = rec.fiscal_year;
      if (fy >= fromYear && fy <= toYear && yearMap[fy]) {
        yearMap[fy].revenue += rec.total_income;
        yearMap[fy].expenditure += rec.total_expenditure;
      }
    }

    // Staff data
    if (staffResult) {
      for (const row of staffResult) {
        const fy = row.fiscal_year;
        if (yearMap[fy]) {
          yearMap[fy].staff_count = row.total_staff || 0;
          yearMap[fy].indigenous_staff = row.indigenous_staff_count || 0;
          yearMap[fy].resident_staff = row.palm_island_resident_count || 0;
        }
      }
    }

    // Services count
    const totalServices = servicesResult?.length || 0;
    for (const fy of Object.keys(yearMap).map(Number)) {
      yearMap[fy].services_count = totalServices;
    }

    // Build response with only years that have some data
    const data = Object.entries(yearMap)
      .sort(([a], [b]) => Number(a) - Number(b))
      .filter(([, v]) => v.clients_served > 0 || v.revenue > 0 || v.staff_count > 0)
      .map(([year, vals]) => ({
        fiscal_year: formatFiscalYear(Number(year)),
        fiscal_year_end: Number(year),
        clients_served: vals.clients_served || null,
        sessions_delivered: vals.sessions_delivered || null,
        revenue: vals.revenue || null,
        expenditure: vals.expenditure || null,
        staff_count: vals.staff_count || null,
        indigenous_staff: vals.indigenous_staff || null,
        resident_staff: vals.resident_staff || null,
        services_count: vals.services_count || null,
      }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Trends API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trends data', data: [] },
      { status: 500 }
    );
  }
}
