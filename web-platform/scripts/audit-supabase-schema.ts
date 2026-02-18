import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getAllTables() {
  console.log('🔍 DISCOVERING ALL TABLES\n');
  console.log('='.repeat(70));
  
  // Query information_schema to get all tables
  const { data: tables, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `
  });
  
  if (error) {
    // Alternative: try querying common tables directly
    console.log('   Trying direct table detection...\n');
    return await discoverTablesByQuery();
  }
  
  return tables;
}

async function discoverTablesByQuery() {
  const commonTables = [
    'stories', 'profiles', 'media_files', 'knowledge_entries',
    'interviews', 'board_members', 'governance_achievements',
    'annual_financials', 'staff_statistics', 'partners',
    'services', 'service_metrics', 'innovation_projects',
    'users', 'people', 'storytellers', 'community_members',
    'data_extraction_log', 'collections', 'collection_items',
    'quotes', 'story_quotes', 'service_story_links',
    'tenant_settings', 'organizations', 'tenants'
  ];
  
  const foundTables = [];
  
  for (const table of commonTables) {
    const { error } = await supabase
      .from(table)
      .select('count', { count: 'exact', head: true });
    
    if (!error) {
      foundTables.push(table);
    }
  }
  
  return foundTables;
}

async function analyzeTable(tableName: string) {
  // Get row count
  const { count, error: countError } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    return { name: tableName, error: countError.message };
  }
  
  // Get sample data to understand structure
  const { data: sample, error: sampleError } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);
  
  const columns = sample && sample.length > 0 ? Object.keys(sample[0]) : [];
  
  return {
    name: tableName,
    rowCount: count || 0,
    columns: columns,
    hasData: count ? count > 0 : false
  };
}

function categorizeTable(table: any) {
  const name = table.name.toLowerCase();
  
  // 20-Year Vision Core Tables
  if (['knowledge_entries', 'innovation_projects', 'stories', 'media_files'].includes(name)) {
    return { category: 'CORE - 20 Year Vision', priority: 'HIGH', action: 'KEEP' };
  }
  
  // Annual Report Tables
  if (['board_members', 'governance_achievements', 'annual_financials', 
       'staff_statistics', 'partners', 'services', 'service_metrics'].includes(name)) {
    return { category: 'Annual Report Data', priority: 'HIGH', action: 'KEEP' };
  }
  
  // People/Profiles
  if (['profiles', 'people', 'storytellers', 'community_members', 'users'].includes(name)) {
    return { category: 'People/Auth', priority: 'MEDIUM', action: 'REVIEW' };
  }
  
  // Story-related
  if (['interviews', 'quotes', 'story_quotes', 'service_story_links'].includes(name)) {
    return { category: 'Story Ecosystem', priority: 'MEDIUM', action: 'REVIEW' };
  }
  
  // Collections
  if (['collections', 'collection_items'].includes(name)) {
    return { category: 'Collections', priority: 'LOW', action: 'MAYBE DROP' };
  }
  
  // System/Tenant
  if (['tenant_settings', 'organizations', 'tenants', 'data_extraction_log'].includes(name)) {
    return { category: 'System/Tenant', priority: 'LOW', action: 'REVIEW' };
  }
  
  return { category: 'Unknown', priority: 'REVIEW', action: 'REVIEW' };
}

async function main() {
  console.log('🚀 SUPABASE SCHEMA AUDIT');
  console.log('='.repeat(70));
  
  const tables = await discoverTablesByQuery();
  
  console.log(`\n📊 Found ${tables.length} tables\n`);
  
  const analysis = [];
  
  for (const tableName of tables) {
    const info = await analyzeTable(tableName);
    const category = categorizeTable(info);
    analysis.push({ ...info, ...category });
  }
  
  // Group by category
  const byCategory: Record<string, any[]> = {};
  analysis.forEach(t => {
    if (!byCategory[t.category]) byCategory[t.category] = [];
    byCategory[t.category].push(t);
  });
  
  // Display grouped
  Object.entries(byCategory).forEach(([category, tables]) => {
    console.log(`\n📁 ${category}`);
    console.log('-'.repeat(70));
    tables.forEach(t => {
      const status = t.hasData ? '✅' : '⚠️';
      console.log(`   ${status} ${t.name.padEnd(30)} ${(t.rowCount || 0).toString().padStart(4)} rows  [${t.action}]`);
    });
  });
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📋 SUMMARY');
  console.log('='.repeat(70));
  
  const keep = analysis.filter(t => t.action === 'KEEP').length;
  const review = analysis.filter(t => t.action === 'REVIEW').length;
  const maybeDrop = analysis.filter(t => t.action === 'MAYBE DROP').length;
  const withData = analysis.filter(t => t.hasData).length;
  const empty = analysis.filter(t => !t.hasData && t.rowCount === 0).length;
  
  console.log(`\n   Total tables: ${analysis.length}`);
  console.log(`   Tables with data: ${withData}`);
  console.log(`   Empty tables: ${empty}`);
  console.log(`   Recommended KEEP: ${keep}`);
  console.log(`   Recommended REVIEW: ${review}`);
  console.log(`   Recommended DROP: ${maybeDrop}`);
  
  // Recommendations
  console.log('\n' + '='.repeat(70));
  console.log('💡 RECOMMENDATIONS FOR 20-YEAR FOCUS');
  console.log('='.repeat(70));
  
  console.log(`
✅ CORE TABLES (Keep - Essential for 20-year vision):
   • knowledge_entries (86 records) - Annual reports, AI search
   • innovation_projects (5 records) - Innovation stories
   • stories (77 records) - Community narratives
   • media_files (1,885 records) - Photos, documents
   • board_members (7 records) - Governance
   • staff_statistics (5 records) - Employment data
   • annual_financials (4 records) - Financial history
   • partners (23 records) - Partnerships
   • service_metrics (41 records) - Service impact

⚠️  REVIEW NEEDED (May be redundant):
   • profiles vs people vs storytellers - Consolidate?
   • interviews - Keep for story generation?
   • quotes/story_quotes - Merge with stories?
   • collections/collection_items - Used? Or use tags?
   • users - Auth only? Keep minimal

🗑️  CANDIDATES FOR CLEANUP:
   • Empty tables with no clear purpose
   • Duplicate people tables
   • Unused system tables
   • Dead relationships

🎯 FOCUSED SCHEMA RECOMMENDATION:
   
   Keep these 12 tables for 20-year vision:
   1. knowledge_entries    - All reports & AI content
   2. innovation_projects  - 6 innovation stories
   3. stories             - 77 community stories
   4. media_files         - 1,885 photos
   5. board_members       - Governance history
   6. staff_statistics    - Employment trends
   7. annual_financials   - Financial history
   8. partners            - 23 organizations
   9. service_metrics     - Impact data
   10. profiles           - People (consolidated)
   11. interviews         - Source material (optional)
   12. collections        - Media organization
`);
  
  return analysis;
}

main().then(analysis => {
  console.log('\n✅ Audit complete!');
}).catch(console.error);
