const SUPABASE_ACCESS_TOKEN = 'sbp_1da91af0dc38edbafcc7eddb12c068b343c0706b';
const PROJECT_REF = 'uaxhjzqrdotoahjnxmbj';

// Step 1: Create the services table
const CREATE_TABLE_SQL = `
-- Create services table if it doesn't exist
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Services are viewable by everyone" 
ON services FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage services" 
ON services FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
`;

// Step 2: Insert services from service_metrics
const INSERT_SERVICES_SQL = `
-- Insert services based on service_metrics data
INSERT INTO services (name, category, description, is_active)
SELECT DISTINCT 
  COALESCE(NULLIF(metadata->>'service_name', ''), 'PICC Service'),
  COALESCE(metadata->>'category', 'general'),
  'Service tracked since ' || fiscal_year,
  true
FROM service_metrics
WHERE NOT EXISTS (
  SELECT 1 FROM services 
  WHERE name = COALESCE(NULLIF(service_metrics.metadata->>'service_name', ''), 'PICC Service')
)
ON CONFLICT (name) DO NOTHING;
`;

// Step 3: Update service_metrics to link to services
const UPDATE_METRICS_SQL = `
-- Update service_metrics to reference services
UPDATE service_metrics sm
SET service_id = s.id
FROM services s
WHERE sm.service_id IS NULL
AND (
  s.name = COALESCE(NULLIF(sm.metadata->>'service_name', ''), 'PICC Service')
  OR s.name = 'PICC Service'
);
`;

// Step 4: Verify
const VERIFY_SQL = `
-- Verify the fix
SELECT 
  'Services table' as check_type,
  COUNT(*) as count
FROM services
UNION ALL
SELECT 
  'Service metrics with service_id',
  COUNT(*)
FROM service_metrics
WHERE service_id IS NOT NULL
UNION ALL
SELECT 
  'Service metrics without service_id',
  COUNT(*)
FROM service_metrics
WHERE service_id IS NULL;
`;

async function executeStep(name, sql) {
  console.log(`\n📌 ${name}`);
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.log('   ⚠️:', error.substring(0, 200));
      return false;
    }
    
    const result = await response.json();
    console.log('   ✅ Success');
    if (result && result.length > 0) {
      console.log('   Result:', JSON.stringify(result, null, 2).substring(0, 300));
    }
    return true;
    
  } catch (error) {
    console.log('   ❌ Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔧 CRITICAL FIX: Creating Services Table');
  console.log('='.repeat(60));
  
  await executeStep('Step 1: Create services table', CREATE_TABLE_SQL);
  await executeStep('Step 2: Insert services from metrics', INSERT_SERVICES_SQL);
  await executeStep('Step 3: Update service_metrics links', UPDATE_METRICS_SQL);
  await executeStep('Step 4: Verify fix', VERIFY_SQL);
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ CRITICAL FIX COMPLETE!');
  console.log('='.repeat(60));
}

main();
