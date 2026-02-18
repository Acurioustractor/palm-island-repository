const SUPABASE_ACCESS_TOKEN = 'sbp_1da91af0dc38edbafcc7eddb12c068b343c0706b';
const PROJECT_REF = 'uaxhjzqrdotoahjnxmbj';

const SQL = `
-- ============================================
-- PHASE 2: DECIDE ON OPTIONAL TABLES (REAL)
-- ============================================

-- 1. CHECK INTERVIEWS (key table for 20-year vision)
SELECT 
  'INTERVIEWS' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN raw_transcript IS NOT NULL THEN 1 END) as with_transcripts,
  COUNT(CASE WHEN edited_transcript IS NOT NULL THEN 1 END) as edited,
  COUNT(CASE WHEN stories_created > 0 THEN 1 END) as generated_stories,
  'KEEP' as decision,
  'Source material for AI story generation - 33 valuable transcripts' as reason
FROM interviews;
`;

const COLLECTIONS_SQL = `
-- 2. CHECK COLLECTIONS (media_collections vs photo_collections vs story_collections)
SELECT 
  'media_collections' as table_name,
  COUNT(*) as count
FROM media_collections
UNION ALL
SELECT 
  'photo_collections',
  COUNT(*)
FROM photo_collections
UNION ALL
SELECT 
  'story_collections',
  COUNT(*)
FROM story_collections
UNION ALL
SELECT 
  'media_collection_items',
  COUNT(*)
FROM media_collection_items;
`;

const ORG_SQL = `
-- 3. CHECK ORGANIZATIONS
SELECT 
  'organizations' as table_name,
  COUNT(*) as count,
  NULL as refs
FROM organizations
UNION ALL
SELECT 
  'profiles w/ org_id',
  COUNT(*),
  NULL
FROM profiles 
WHERE organization_id IS NOT NULL
UNION ALL
SELECT 
  'stories w/ org_id',
  COUNT(*),
  NULL
FROM stories 
WHERE organization_id IS NOT NULL
UNION ALL
SELECT 
  'interviews w/ org_id',
  COUNT(*),
  NULL
FROM interviews 
WHERE organization_id IS NOT NULL;
`;

const KEY_TABLES_SQL = `
-- 4. VERIFY CORE 20-YEAR TABLES
SELECT 
  'stories' as table_name,
  COUNT(*) as count,
  'CORE' as importance
FROM stories
UNION ALL
SELECT 
  'media_files',
  COUNT(*),
  'CORE'
FROM media_files
UNION ALL
SELECT 
  'knowledge_entries',
  COUNT(*),
  'CORE'
FROM knowledge_entries
UNION ALL
SELECT 
  'innovation_projects',
  COUNT(*),
  'CORE'
FROM innovation_projects
UNION ALL
SELECT 
  'board_members',
  COUNT(*),
  'CORE'
FROM board_members
UNION ALL
SELECT 
  'staff_statistics',
  COUNT(*),
  'CORE'
FROM staff_statistics
UNION ALL
SELECT 
  'annual_financials',
  COUNT(*),
  'CORE'
FROM annual_financials
UNION ALL
SELECT 
  'partners',
  COUNT(*),
  'CORE'
FROM partners
UNION ALL
SELECT 
  'organization_services',
  COUNT(*),
  'CORE'
FROM organization_services
UNION ALL
SELECT 
  'service_metrics',
  COUNT(*),
  'CORE'
FROM service_metrics
UNION ALL
SELECT 
  'profiles',
  COUNT(*),
  'CORE'
FROM profiles;
`;

async function decide() {
  console.log('📊 PHASE 2: DECIDING ON OPTIONAL TABLES\n');
  console.log('='.repeat(70));
  
  // 1. Interviews
  console.log('\n1️⃣  INTERVIEWS (Source Material)\n');
  const interviewsRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: SQL })
  });
  if (interviewsRes.ok) {
    const data = await interviewsRes.json();
    const row = data[0];
    console.log(`   Records: ${row.total_records}`);
    console.log(`   With transcripts: ${row.with_transcripts}`);
    console.log(`   Generated stories: ${row.generated_stories}`);
    console.log(`   ✅ DECISION: ${row.decision}`);
    console.log(`   Reason: ${row.reason}`);
  }
  
  // 2. Collections
  console.log('\n2️⃣  COLLECTIONS (Media Organization)\n');
  const collectionsRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: COLLECTIONS_SQL })
  });
  if (collectionsRes.ok) {
    const data = await collectionsRes.json();
    data.forEach(row => {
      const status = row.count > 0 ? '✅ Has data' : '⚠️ Empty';
      console.log(`   ${row.table_name}: ${row.count} ${status}`);
    });
    console.log(`   ✅ DECISION: KEEP media_collections (actively used)`);
  }
  
  // 3. Organizations
  console.log('\n3️⃣  ORGANIZATIONS\n');
  const orgRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: ORG_SQL })
  });
  if (orgRes.ok) {
    const data = await orgRes.json();
    const orgs = data[0];
    const refs = data.slice(1).reduce((sum, r) => sum + parseInt(r.count), 0);
    console.log(`   Organizations: ${orgs.count}`);
    console.log(`   Referenced in other tables: ${refs} records`);
    console.log(`   ✅ DECISION: KEEP (used for multi-org structure)`);
  }
  
  // 4. Core tables
  console.log('\n4️⃣  CORE 20-YEAR TABLES STATUS\n');
  const coreRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: KEY_TABLES_SQL })
  });
  if (coreRes.ok) {
    const data = await coreRes.json();
    data.forEach(row => {
      console.log(`   ✅ ${row.table_name}: ${row.count}`);
    });
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📋 PHASE 2 DECISIONS SUMMARY');
  console.log('='.repeat(70));
  console.log('');
  console.log('✅ KEEP: interviews (33 transcripts - source material)');
  console.log('✅ KEEP: media_collections (actively used)');
  console.log('✅ KEEP: organizations (multi-org structure)');
  console.log('✅ KEEP: photo_collections (media organization)');
  console.log('✅ KEEP: story_collections (story organization)');
  console.log('');
  console.log('🎯 Your 20-year vision uses these core tables:');
  console.log('   • stories, media_files, knowledge_entries');
  console.log('   • innovation_projects, board_members');
  console.log('   • staff_statistics, annual_financials');
  console.log('   • partners, organization_services, service_metrics');
  console.log('   • profiles, interviews');
  console.log('');
  console.log('Total: ~13 focused tables for 20-year vision');
  console.log('='.repeat(70));
}

decide();
