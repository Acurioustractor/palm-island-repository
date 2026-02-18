const SUPABASE_ACCESS_TOKEN = 'sbp_1da91af0dc38edbafcc7eddb12c068b343c0706b';
const PROJECT_REF = 'uaxhjzqrdotoahjnxmbj';

const CHECK_TABLES = `
-- Check if organization_services table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%service%';
`;

const CHECK_SERVICES = `
-- Check what's in services table
SELECT * FROM services LIMIT 10;
`;

const CHECK_ORG_SERVICES = `
-- Check organization_services if exists
SELECT * FROM organization_services LIMIT 5;
`;

async function check() {
  console.log('🔍 Checking service-related tables...\n');
  
  // Check what service tables exist
  const tablesResponse = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: CHECK_TABLES })
  });
  
  if (tablesResponse.ok) {
    const tables = await tablesResponse.json();
    console.log('Service-related tables found:');
    tables.forEach((t) => {
      console.log(`  • ${t.table_name}`);
    });
  }
  
  // Check services table
  console.log('\n📊 Services table:');
  const servicesResponse = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: CHECK_SERVICES })
  });
  
  if (servicesResponse.ok) {
    const services = await servicesResponse.json();
    console.log(`  Found ${services.length} services`);
    services.slice(0, 5).forEach((s) => {
      console.log(`    • ${s.name}`);
    });
  }
  
  // Check organization_services
  console.log('\n📊 Organization services:');
  const orgServicesResponse = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: CHECK_ORG_SERVICES })
  });
  
  if (orgServicesResponse.ok) {
    const orgServices = await orgServicesResponse.json();
    console.log(`  Found ${orgServices.length} organization services`);
    console.log(JSON.stringify(orgServices.slice(0, 3), null, 2));
  } else {
    console.log('  organization_services table may not exist or is empty');
  }
}

check();
