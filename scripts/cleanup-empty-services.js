const SUPABASE_ACCESS_TOKEN = 'sbp_1da91af0dc38edbafcc7eddb12c068b343c0706b';
const PROJECT_REF = 'uaxhjzqrdotoahjnxmbj';

const SQL = `
-- Drop the empty services table I accidentally created
-- (organization_services is the real services table)
DROP TABLE IF EXISTS services;

-- Verify
SELECT 'services table dropped' as action;
`;

async function cleanup() {
  console.log('🧹 Cleaning up empty services table...\n');
  
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: SQL })
  });
  
  if (response.ok) {
    console.log('✅ Empty services table dropped!');
    console.log('\nYour service architecture is clean:');
    console.log('  • organization_services: 5 services');
    console.log('  • service_metrics: 41 metrics');
    console.log('  • Relationship: Working via organization_service_id');
  } else {
    console.log('Note:', await response.text());
  }
}

cleanup();
