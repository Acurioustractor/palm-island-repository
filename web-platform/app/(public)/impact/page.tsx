import { getLiveStats } from '@/lib/stats/get-live-stats';
import ImpactPageClient from './ImpactPageClient';

export default async function ImpactPage() {
  const stats = await getLiveStats();

  return (
    <ImpactPageClient
      staffTotal={stats.staff.total}
      staffIndigenousPct={stats.staff.indigenousPct}
      servicesTotal={stats.services.total}
      incomeDisplay={stats.financials.incomeDisplay}
      fiscalYear={stats.fiscalYear}
    />
  );
}
