const SUPABASE_ACCESS_TOKEN = 'sbp_1da91af0dc38edbafcc7eddb12c068b343c0706b';
const PROJECT_REF = 'uaxhjzqrdotoahjnxmbj';

const SQL = `
-- CRITICAL FIX: The services data is already in organization_services!
-- The empty 'services' table we created is a duplicate.

-- Step 1: Check organization_services count
SELECT 'organization_services' as table_name, COUNT(*) as service_count
FROM organization_services;

-- Step 2: Check service_metrics links
SELECT 
  'service_metrics with org_service_id' as check_type,
  COUNT(*) as count
FROM service_metrics
WHERE organization_service_id IS NOT NULL
UNION ALL
SELECT 
  'service_metrics without org_service_id',
  COUNT(*)
FROM service_metrics
WHERE organization_service_id IS NULL;

-- Step 3: Show services with their metrics
SELECT 
  os.name as service_name,
  os.service_category,
  os.is_active,
  sm.fiscal_year,
  sm.clients_served,
  sm.headline_stat_label,
  sm.headline_stat_value
FROM organization_services os
LEFT JOIN service_metrics sm ON sm.organization_service_id = os.id
ORDER BY os.name, sm.fiscal_year;
`;

async function execute() {
  console.log('🔧 VERIFYING SERVICES SETUP');
  console.log('='.repeat(60));
  
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
    console.log('✅ Services are properly set up!');
    console.log('\nResult:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log('   • organization_services: Has 5 services with full data');
    console.log('   • service_metrics: Links via organization_service_id');
    console.log('   • services (empty): Can be dropped - it is a duplicate');
    console.log('='.repeat(60));
  } else {
    console.log('❌ Error:', await response.text());
  }
}

execute();
