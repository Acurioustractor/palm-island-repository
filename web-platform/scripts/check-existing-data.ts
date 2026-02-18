import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('🔍 CHECKING ALL DATA SOURCES\n');
  console.log('='.repeat(60));
  
  // 1. Check annual report tables
  console.log('\n📊 ANNUAL REPORT TABLES:');
  const tables = [
    'board_members',
    'governance_achievements', 
    'annual_financials',
    'staff_statistics',
    'partners',
    'services',
    'service_metrics',
    'innovation_projects'
  ];
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`   ❌ ${table}: ${error.message}`);
    } else {
      console.log(`   ✅ ${table}: ${count || 0} rows`);
    }
  }
  
  // 2. Check knowledge entries
  console.log('\n📚 KNOWLEDGE ENTRIES:');
  const { data: keData, error: keError } = await supabase
    .from('knowledge_entries')
    .select('entry_type, count(*)')
    .group('entry_type');
  
  if (keError) {
    console.log(`   ❌ Error: ${keError.message}`);
  } else {
    keData?.forEach((row: any) => {
      console.log(`   • ${row.entry_type}: ${row.count}`);
    });
  }
  
  // 3. Check stories
  console.log('\n📖 STORIES:');
  const { data: storyTypes } = await supabase
    .from('stories')
    .select('story_type, count(*)')
    .group('story_type');
  
  storyTypes?.forEach((row: any) => {
    console.log(`   • ${row.story_type}: ${row.count}`);
  });
  
  // 4. Check media
  console.log('\n📸 MEDIA FILES:');
  const { data: mediaTypes } = await supabase
    .from('media_files')
    .select('file_type, count(*)')
    .group('file_type');
  
  mediaTypes?.forEach((row: any) => {
    console.log(`   • ${row.file_type}: ${row.count}`);
  });
  
  // 5. Count annual reports by year
  console.log('\n📅 ANNUAL REPORTS BY YEAR:');
  const { data: arYears } = await supabase
    .from('knowledge_entries')
    .select('fiscal_year')
    .like('slug', 'picc-annual-report%-full-pdf')
    .order('fiscal_year');
  
  arYears?.forEach((row: any) => {
    console.log(`   • ${row.fiscal_year}`);
  });
  
  // 6. Check for views
  console.log('\n👁️  SQL VIEWS:');
  const views = [
    'annual_report_timeline',
    'progress_to_20_years',
    'services_evolution',
    'innovation_dashboard'
  ];
  
  for (const view of views) {
    const { error } = await supabase
      .from(view)
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log(`   ❌ ${view}: Not found`);
    } else {
      console.log(`   ✅ ${view}: Available`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
}

main().catch(console.error);
