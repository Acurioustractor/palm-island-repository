const SUPABASE_ACCESS_TOKEN = 'sbp_1da91af0dc38edbafcc7eddb12c068b343c0706b';
const PROJECT_REF = 'uaxhjzqrdotoahjnxmbj';

const SQL = `
-- CRITICAL FIX: Create services for orphaned service_metrics
-- services table is EMPTY but service_metrics has 41 records!

-- First, let's see what's in service_metrics
-- SELECT DISTINCT metadata->>'service_name' as service_name, COUNT(*) 
-- FROM service_metrics 
-- WHERE service_id IS NULL 
-- GROUP BY metadata->>'service_name';

-- Create services for orphaned metrics
INSERT INTO services (name, category, description, is_active)
SELECT DISTINCT 
  COALESCE(NULLIF(metadata->>'service_name', ''), 'PICC Service'),
  COALESCE(metadata->>'category', 'general'),
  'Auto-created from service_metrics data (fiscal year: ' || fiscal_year || ')',
  true
FROM service_metrics
WHERE service_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM services 
    WHERE name = COALESCE(NULLIF(metadata->>'service_name', ''), 'PICC Service')
  )
ON CONFLICT (name) DO NOTHING;

-- Update service_metrics to reference the new services
UPDATE service_metrics sm
SET service_id = s.id
FROM services s
WHERE sm.service_id IS NULL
AND s.name = COALESCE(NULLIF(sm.metadata->>'service_name', ''), 'PICC Service');

-- Verify the fix
SELECT 
  'Services created' as check_type,
  COUNT(*) as count
FROM services;
`;

async function executeSQL() {
  console.log('🔧 EXECUTING CRITICAL FIX: Services Table');
  console.log('='.repeat(60));
  
  try {
    const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: SQL })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.log('❌ Failed:', error);
      return false;
    }
    
    const result = await response.json();
    console.log('✅ SQL executed successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));
    return true;
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

executeSQL();
