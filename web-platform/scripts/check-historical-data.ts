import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const s = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check annual_financials
  const { data: fin } = await s.from('annual_financials').select('*').order('fiscal_year');
  console.log('=== ANNUAL FINANCIALS ===');
  console.log('Count:', fin?.length);
  for (const f of fin || []) {
    console.log(f.fiscal_year, '| income:', f.total_income, '| expense:', f.total_expenditure, '| staff:', f.total_staff);
  }

  // Check staff_statistics
  const { data: staff } = await s.from('staff_statistics').select('*').order('fiscal_year');
  console.log('\n=== STAFF STATISTICS ===');
  for (const st of staff || []) {
    console.log(st.fiscal_year, '| total:', st.total_staff, '| indigenous:', st.indigenous_staff, '| pct:', st.indigenous_percentage);
  }

  // Check service_metrics by fiscal year
  const { data: sm } = await s.from('service_metrics').select('fiscal_year, clients_served, sessions_delivered').order('fiscal_year');
  const byYear: Record<string, { clients: number; sessions: number; count: number }> = {};
  for (const m of sm || []) {
    if (!byYear[m.fiscal_year]) byYear[m.fiscal_year] = { clients: 0, sessions: 0, count: 0 };
    byYear[m.fiscal_year].clients += m.clients_served || 0;
    byYear[m.fiscal_year].sessions += m.sessions_delivered || 0;
    byYear[m.fiscal_year].count++;
  }
  console.log('\n=== SERVICE METRICS BY YEAR ===');
  for (const [year, data] of Object.entries(byYear)) {
    console.log(year, '| services:', data.count, '| clients:', data.clients, '| sessions:', data.sessions);
  }
}
main().catch(console.error);
