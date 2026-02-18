const SUPABASE_ACCESS_TOKEN = 'sbp_1da91af0dc38edbafcc7eddb12c068b343c0706b';
const PROJECT_REF = 'uaxhjzqrdotoahjnxmbj';

const SQL = `
-- Actual counts
SELECT 'organization_services' as table_name, COUNT(*) as count FROM organization_services
UNION ALL
SELECT 'service_metrics', COUNT(*) FROM service_metrics
UNION ALL
SELECT 'services (empty)', COUNT(*) FROM services;

-- Check unique services in service_metrics
SELECT DISTINCT sm.key_achievement, sm.headline_stat_label
FROM service_metrics sm
WHERE sm.headline_stat_label IS NOT NULL
LIMIT 20;
`;

async function check() {
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
    console.log('📊 ACTUAL COUNTS:');
    console.log(JSON.stringify(result, null, 2));
  }
}

check();
