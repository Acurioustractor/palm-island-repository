const SUPABASE_ACCESS_TOKEN = 'sbp_1da91af0dc38edbafcc7eddb12c068b343c0706b';
const PROJECT_REF = 'uaxhjzqrdotoahjnxmbj';

const SQL = `
-- Check service_metrics structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'service_metrics'
ORDER BY ordinal_position;
`;

const SAMPLE_DATA = `
-- Check sample data
SELECT * FROM service_metrics LIMIT 3;
`;

async function check() {
  console.log('🔍 Checking service_metrics table structure...\n');
  
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
    console.log('Columns in service_metrics:');
    result.forEach((col) => {
      console.log(`  • ${col.column_name}: ${col.data_type}`);
    });
  } else {
    console.log('Error:', await response.text());
  }
  
  // Check sample data
  console.log('\n📊 Sample data:');
  const sampleResponse = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: SAMPLE_DATA })
  });
  
  if (sampleResponse.ok) {
    const sample = await sampleResponse.json();
    console.log(JSON.stringify(sample, null, 2).substring(0, 1000));
  }
}

check();
