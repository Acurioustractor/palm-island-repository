const SUPABASE_ACCESS_TOKEN = 'sbp_1da91af0dc38edbafcc7eddb12c068b343c0706b';
const PROJECT_REF = 'uaxhjzqrdotoahjnxmbj';

const SQL = `
-- ============================================
-- PHASE 2: DECIDE ON OPTIONAL TABLES
-- ============================================

-- 1. CHECK INTERVIEWS (33 records)
SELECT 
  'INTERVIEWS' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN raw_transcript IS NOT NULL THEN 1 END) as with_transcripts,
  COUNT(CASE WHEN stories_created > 0 THEN 1 END) as generated_stories,
  '✅ RECOMMENDATION: KEEP' as recommendation,
  'Valuable source material for AI story generation' as reason
FROM interviews

UNION ALL

-- 2. CHECK COLLECTIONS
SELECT 
  'COLLECTIONS',
  (SELECT COUNT(*) FROM collections),
  (SELECT COUNT(*) FROM collection_items),
  NULL,
  CASE 
    WHEN (SELECT COUNT(*) FROM collection_items) > 0 THEN '✅ RECOMMENDATION: KEEP'
    ELSE '🤔 REVIEW: May migrate to tags'
  END,
  CASE 
    WHEN (SELECT COUNT(*) FROM collection_items) > 0 THEN '347 items exist - actively used'
    ELSE 'Empty - consider migration'
  END

UNION ALL

-- 3. CHECK ORGANIZATIONS
SELECT 
  'ORGANIZATIONS',
  (SELECT COUNT(*) FROM organizations),
  (SELECT COUNT(*) FROM profiles WHERE organization_id IS NOT NULL)
  + (SELECT COUNT(*) FROM stories WHERE organization_id IS NOT NULL)
  + (SELECT COUNT(*) FROM media_files WHERE organization_id IS NOT NULL),
  NULL,
  CASE 
    WHEN (SELECT COUNT(*) FROM profiles WHERE organization_id IS NOT NULL) > 0
      OR (SELECT COUNT(*) FROM stories WHERE organization_id IS NOT NULL) > 0
      OR (SELECT COUNT(*) FROM media_files WHERE organization_id IS NOT NULL) > 0
    THEN '⚠️  RECOMMENDATION: REVIEW REFERENCES'
    ELSE '🤔 RECOMMENDATION: CHECK FURTHER'
  END,
  'Check if org_id is used in other tables'
;

-- Show actual collection usage
SELECT 
  c.name as collection_name,
  COUNT(ci.id) as item_count,
  c.description
FROM collections c
LEFT JOIN collection_items ci ON c.id = ci.collection_id
GROUP BY c.id, c.name, c.description
ORDER BY item_count DESC;

-- Show organization usage details
SELECT 
  'profiles' as table_name,
  COUNT(*) as records_with_org_id
FROM profiles 
WHERE organization_id IS NOT NULL

UNION ALL

SELECT 
  'stories',
  COUNT(*)
FROM stories 
WHERE organization_id IS NOT NULL

UNION ALL

SELECT 
  'media_files',
  COUNT(*)
FROM media_files 
WHERE organization_id IS NOT NULL

UNION ALL

SELECT 
  'interviews',
  COUNT(*)
FROM interviews 
WHERE organization_id IS NOT NULL;
`;

async function decide() {
  console.log('📊 PHASE 2: DECIDING ON OPTIONAL TABLES\n');
  console.log('='.repeat(70));
  
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: SQL })
  });
  
  if (response.ok) {
    const result = await response.json();
    console.log('\n📋 DECISION SUMMARY:\n');
    result.slice(0, 3).forEach((row) => {
      console.log(`${row.table_name}:`);
      console.log(`  Records: ${row.total_records}`);
      console.log(`  ${row.recommendation}`);
      console.log(`  Reason: ${row.reason}`);
      console.log('');
    });
    
    if (result.length > 3) {
      console.log('\n📁 COLLECTIONS DETAIL:');
      result.slice(3).forEach((row) => {
        if (row.collection_name) {
          console.log(`  • ${row.collection_name}: ${row.item_count} items`);
        }
      });
    }
  } else {
    console.log('Error:', await response.text());
  }
}

decide();
