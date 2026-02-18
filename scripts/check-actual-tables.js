const SUPABASE_ACCESS_TOKEN = 'sbp_1da91af0dc38edbafcc7eddb12c068b343c0706b';
const PROJECT_REF = 'uaxhjzqrdotoahjnxmbj';

const SQL = `
-- Check what tables actually exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
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
    const tables = await response.json();
    console.log('📊 ACTUAL TABLES IN DATABASE:\n');
    tables.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.table_name}`);
    });
    console.log(`\nTotal: ${tables.length} tables`);
  }
}

check();
