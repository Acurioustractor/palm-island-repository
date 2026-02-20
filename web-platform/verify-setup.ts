import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verify() {
  console.log('🔍 VERIFYING DATABASE SETUP\n');
  console.log('='.repeat(60));
  
  // Check innovation_projects
  console.log('\n1️⃣ Checking innovation_projects table...');
  const { data: projects, error: projError } = await supabase
    .from('innovation_projects')
    .select('*');
  
  if (projError) {
    console.log('   ❌ Error:', projError.message);
  } else {
    console.log(`   ✅ Found ${projects?.length || 0} innovation projects`);
    projects?.forEach(p => {
      console.log(`      • ${p.name} (${p.status})`);
    });
  }
  
  // Check views
  console.log('\n2️⃣ Checking views...');
  
  const views = [
    'annual_report_timeline',
    'progress_to_20_years', 
    'innovation_dashboard',
    'community_impact_summary'
  ];
  
  for (const view of views) {
    const { data, error } = await supabase.from(view).select('*').limit(1);
    if (error) {
      console.log(`   ❌ ${view}: ${error.message}`);
    } else {
      console.log(`   ✅ ${view}: Accessible`);
    }
  }
  
  // Check annual_report_timeline data
  console.log('\n3️⃣ Checking annual_report_timeline data...');
  const { data: timeline } = await supabase
    .from('annual_report_timeline')
    .select('fiscal_year, era')
    .order('fiscal_year');
  
  if (timeline && timeline.length > 0) {
    console.log(`   ✅ ${timeline.length} annual reports in timeline`);
    
    // Group by era
    const byEra: Record<string, number> = {};
    timeline.forEach((t: any) => {
      byEra[t.era] = (byEra[t.era] || 0) + 1;
    });
    
    Object.entries(byEra).forEach(([era, count]) => {
      console.log(`      • ${era}: ${count} reports`);
    });
  }
  
  // Check progress_to_20_years
  console.log('\n4️⃣ Checking progress_to_20_years...');
  const { data: progress } = await supabase
    .from('progress_to_20_years')
    .select('*')
    .single();
  
  if (progress) {
    console.log('   ✅ 20-year countdown data:');
    console.log(`      • Years elapsed: ${(progress as any).years_elapsed}/20`);
    console.log(`      • Progress: ${(progress as any).percent_complete}%`);
    console.log(`      • Staff: ${(progress as any).current_staff}/${(progress as any).target_staff}`);
    console.log(`      • Services: ${(progress as any).current_services}/${(progress as any).target_services}`);
  }
  
  // Check innovation_dashboard
  console.log('\n5️⃣ Checking innovation_dashboard...');
  const { data: dashboard } = await supabase
    .from('innovation_dashboard')
    .select('name, status, people_impacted, jobs_created');
  
  if (dashboard && dashboard.length > 0) {
    console.log(`   ✅ ${dashboard.length} projects in dashboard`);
    let totalPeople = 0;
    let totalJobs = 0;
    dashboard.forEach((p: any) => {
      totalPeople += p.people_impacted || 0;
      totalJobs += p.jobs_created || 0;
    });
    console.log(`      • Total people impacted: ${totalPeople}`);
    console.log(`      • Total jobs created: ${totalJobs}`);
  }
  
  // Check community_impact_summary
  console.log('\n6️⃣ Checking community_impact_summary...');
  const { data: summary } = await supabase
    .from('community_impact_summary')
    .select('*')
    .single();
  
  if (summary) {
    console.log('   ✅ Community impact data:');
    console.log(`      • Stories: ${(summary as any).total_stories_collected}`);
    console.log(`      • Photos: ${(summary as any).total_photos}`);
    console.log(`      • Partners: ${(summary as any).partner_organizations}`);
    console.log(`      • Active innovations: ${(summary as any).active_innovations}`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ VERIFICATION COMPLETE!');
  console.log('='.repeat(60));
}

verify().catch(console.error);
