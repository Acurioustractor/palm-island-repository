const SUPABASE_ACCESS_TOKEN = 'sbp_1da91af0dc38edbafcc7eddb12c068b343c0706b';
const PROJECT_REF = 'uaxhjzqrdotoahjnxmbj';

const SQL = `
-- Create innovation_projects table
CREATE TABLE IF NOT EXISTS innovation_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  description text,
  innovation_type text[],
  start_date date,
  status text DEFAULT 'active',
  people_impacted integer DEFAULT 0,
  jobs_created integer DEFAULT 0,
  revenue_generated decimal(12,2),
  hero_image_url text,
  gallery_images text[],
  tags text[],
  challenge text,
  solution text,
  outcome text,
  future_vision text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE innovation_projects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Innovation projects are viewable by everyone" 
ON innovation_projects FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage innovation projects" 
ON innovation_projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_innovation_projects_category ON innovation_projects(category);
CREATE INDEX idx_innovation_projects_status ON innovation_projects(status);

-- Insert innovation projects
INSERT INTO innovation_projects (
  slug, name, category, description, innovation_type, 
  start_date, status, tags, people_impacted, jobs_created,
  challenge, solution, outcome, future_vision
) VALUES
(
  'elders-hull-river',
  'Elders Hull River On-Country Journey',
  'cultural',
  'Elder-led cultural revitalization through traditional country visits to Hull River.',
  ARRAY['cultural-revival', 'on-country', 'intergenerational-knowledge'],
  '2024-01-01', 'active', ARRAY['elders', 'culture', 'heritage', 'on-country'],
  20, 0,
  'Loss of connection to traditional country',
  'Organized elder-led journeys with documentation',
  'Revived cultural practices, documented elder knowledge',
  'Expand to regular on-country programs'
),
(
  'automated-annual-reports',
  'AI-Powered Annual Report System',
  'digital',
  'Automated extraction and AI indexing of 15 years of annual reports.',
  ARRAY['ai', 'automation', 'digital-transformation'],
  '2025-01-01', 'active', ARRAY['innovation', 'ai', 'reports', 'digital'],
  100, 0,
  'Manual processing would take months',
  'Built AI pipeline for extraction and search',
  '270 pages digitized, 86 entries created',
  'Extend AI for insights and analytics'
),
(
  'on-country-photo-studio',
  'On-Country Professional Photography',
  'creative',
  'Professional photo studio capturing elder portraits and cultural moments.',
  ARRAY['creative-industries', 'skills-development'],
  '2025-10-01', 'active', ARRAY['photography', 'elders', 'creative', 'culture'],
  323, 3,
  'Limited professional photography on island',
  'Established on-country studio with training',
  '323 photos, 20+ elder portraits',
  'Expand to commercial services'
),
(
  'recycling-bed-manufacturing',
  'The Centre: Plastic Recycling Bed Manufacturing',
  'manufacturing',
  'Circular economy manufacturing from plastic waste to beds.',
  ARRAY['circular-economy', 'manufacturing', 'sustainability'],
  '2025-01-01', 'planning', ARRAY['recycling', 'manufacturing', 'the-centre'],
  0, 0,
  'Plastic waste and limited manufacturing jobs',
  'Recycling facility for bed production',
  null,
  '500+ beds annually, 10+ jobs'
),
(
  'kitchen-youth-employment',
  'The Centre: Commercial Kitchen & Youth Employment',
  'training',
  'Commercial kitchen training for youth employment pathways.',
  ARRAY['hospitality', 'youth-employment', 'training'],
  '2025-01-01', 'planning', ARRAY['kitchen', 'youth', 'employment', 'training'],
  0, 0,
  'Limited youth employment pathways',
  'Kitchen with accredited training programs',
  null,
  '50+ youth trained annually'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = now();

-- Create views
CREATE OR REPLACE VIEW annual_report_timeline AS
SELECT 
  ke.fiscal_year,
  ke.title,
  ke.summary,
  ke.keywords,
  ke.created_at as indexed_at,
  CASE 
    WHEN ke.fiscal_year BETWEEN '2009-10' AND '2012-13' THEN 'Foundation'
    WHEN ke.fiscal_year BETWEEN '2013-14' AND '2018-19' THEN 'Growth'
    WHEN ke.fiscal_year BETWEEN '2019-20' AND '2020-21' THEN 'Transition'
    WHEN ke.fiscal_year >= '2021-22' THEN 'Community-Led'
  END as era,
  CASE 
    WHEN ke.fiscal_year BETWEEN '2009-10' AND '2012-13' THEN '#F59E0B'
    WHEN ke.fiscal_year BETWEEN '2013-14' AND '2018-19' THEN '#8B5CF6'
    WHEN ke.fiscal_year BETWEEN '2019-20' AND '2020-21' THEN '#10B981'
    WHEN ke.fiscal_year >= '2021-22' THEN '#3B82F6'
  END as era_color
FROM knowledge_entries ke
WHERE ke.entry_type = 'document'
  AND ke.category = 'annual-report'
  AND ke.fiscal_year IS NOT NULL
ORDER BY ke.fiscal_year;

CREATE OR REPLACE VIEW progress_to_20_years AS
SELECT 
  '2009-07-01'::date as start_date,
  '2029-07-01'::date as target_date,
  CURRENT_DATE as today,
  EXTRACT(YEAR FROM AGE(CURRENT_DATE, '2009-07-01'::date)) as years_elapsed,
  EXTRACT(YEAR FROM AGE('2029-07-01'::date, CURRENT_DATE)) as years_remaining,
  ROUND(EXTRACT(EPOCH FROM AGE(CURRENT_DATE, '2009-07-01'::date)) / 
    EXTRACT(EPOCH FROM AGE('2029-07-01'::date, '2009-07-01'::date)) * 100, 1) as percent_complete,
  197 as current_staff, 300 as target_staff, ROUND(197.0 / 300 * 100, 1) as staff_progress_pct,
  16 as current_services, 20 as target_services, ROUND(16.0 / 20 * 100, 1) as services_progress_pct,
  77 as current_stories, 150 as target_stories, ROUND(77.0 / 150 * 100, 1) as stories_progress_pct,
  82.2 as current_indigenous_pct, 85.0 as target_indigenous_pct, ROUND(82.2 / 85 * 100, 1) as indigenous_progress_pct;

CREATE OR REPLACE VIEW innovation_dashboard AS
SELECT 
  ip.*,
  CASE 
    WHEN ip.jobs_created > 0 AND ip.people_impacted > 0 
    THEN ROUND(ip.people_impacted::numeric / ip.jobs_created, 1)
    ELSE 0 
  END as impact_per_job,
  CASE ip.status
    WHEN 'active' THEN 1
    WHEN 'planning' THEN 2
    ELSE 4
  END as status_order
FROM innovation_projects ip
ORDER BY status_order, ip.start_date DESC;

CREATE OR REPLACE VIEW community_impact_summary AS
SELECT 
  'FY2024' as reporting_period,
  (SELECT COUNT(*) FROM stories WHERE status = 'published') as total_stories_collected,
  (SELECT COUNT(*) FROM media_files WHERE file_type = 'image') as total_photos,
  (SELECT COUNT(*) FROM partners) as partner_organizations,
  (SELECT COUNT(*) FROM innovation_projects WHERE status = 'active') as active_innovations,
  (SELECT SUM(people_impacted) FROM innovation_projects) as total_people_impacted,
  (SELECT SUM(jobs_created) FROM innovation_projects) as total_jobs_created;
`;

async function executeSQL() {
  console.log('🚀 Attempting to execute SQL via Supabase Management API...\n');
  
  try {
    // Try using the Supabase Management API
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
      console.log('❌ Management API failed:', error);
      console.log('\n⚠️  Trying alternative method...\n');
      return false;
    }
    
    const result = await response.json();
    console.log('✅ SQL executed successfully!');
    console.log('Result:', result);
    return true;
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

executeSQL();
