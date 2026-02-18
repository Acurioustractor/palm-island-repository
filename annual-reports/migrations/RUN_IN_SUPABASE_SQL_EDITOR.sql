-- ============================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- 20-Year Vision Data Setup
-- ============================================

-- 1. Create innovation_projects table
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
  environmental_impact jsonb,
  hero_image_url text,
  gallery_images text[],
  video_url text,
  related_story_ids uuid[],
  related_service_id uuid,
  challenge text,
  solution text,
  outcome text,
  future_vision text,
  tags text[],
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
CREATE INDEX idx_innovation_projects_tags ON innovation_projects USING gin(tags);

-- 2. Insert innovation projects
INSERT INTO innovation_projects (
  slug, name, category, description, innovation_type, 
  start_date, status, tags, people_impacted, jobs_created,
  challenge, solution, outcome, future_vision
) VALUES
(
  'elders-hull-river',
  'Elders Hull River On-Country Journey',
  'cultural',
  'Elder-led cultural revitalization through traditional country visits to Hull River. Reviving intergenerational knowledge transfer and on-country cultural practices.',
  ARRAY['cultural-revival', 'on-country', 'intergenerational-knowledge'],
  '2024-01-01',
  'active',
  ARRAY['elders', 'culture', 'heritage', 'on-country', 'hull-river'],
  20,
  0,
  'Loss of connection to traditional country and intergenerational knowledge gap',
  'Organized elder-led journeys to Hull River with cultural documentation and youth participation',
  'Revived cultural practices, documented elder knowledge, strengthened youth connection to country',
  'Expand to regular on-country programs and establish cultural knowledge archive'
),
(
  'automated-annual-reports',
  'AI-Powered Annual Report System',
  'digital',
  'Automated extraction and AI indexing of 15 years of annual reports. First Indigenous organization using AI for report processing and semantic search.',
  ARRAY['ai', 'automation', 'digital-transformation', 'knowledge-management'],
  '2025-01-01',
  'active',
  ARRAY['innovation', 'ai', 'reports', 'digital', 'automation'],
  100,
  0,
  'Manual processing of 15 years of annual reports would take months',
  'Built automated pipeline using AI to extract text, generate summaries, and create searchable embeddings',
  '270 pages digitized, 86 knowledge entries created, semantic search enabled across all reports',
  'Extend AI capabilities to extract insights and generate predictive analytics'
),
(
  'on-country-photo-studio',
  'On-Country Professional Photography',
  'creative',
  'Professional photo studio capturing elder portraits and cultural moments on Palm Island. Skills development in creative industries.',
  ARRAY['creative-industries', 'skills-development', 'cultural-preservation', 'economic-development'],
  '2025-10-01',
  'active',
  ARRAY['photography', 'elders', 'creative', 'culture', 'portraits'],
  323,
  3,
  'Limited professional photography documenting community and culture',
  'Established on-country photo studio with professional equipment and training programs',
  '323 professional photos captured, 20+ elder portraits, youth trained in photography',
  'Expand to commercial photography services and multimedia production'
),
(
  'recycling-bed-manufacturing',
  'The Centre: Plastic Recycling Bed Manufacturing',
  'manufacturing',
  'Circular economy manufacturing converting plastic waste to beds. First of its kind on Palm Island with export potential.',
  ARRAY['circular-economy', 'manufacturing', 'sustainability', 'employment', 'waste-reduction'],
  '2025-01-01',
  'planning',
  ARRAY['recycling', 'manufacturing', 'the-centre', 'sustainability', 'beds'],
  0,
  0,
  'Plastic waste accumulation and limited manufacturing employment on island',
  'Establish recycling facility to convert plastic waste into durable beds for community and export',
  null,
  'Produce 500+ beds annually, create 10+ manufacturing jobs, export to other communities'
),
(
  'kitchen-youth-employment',
  'The Centre: Commercial Kitchen & Youth Employment',
  'training',
  'Commercial kitchen training facility creating youth employment pathways through hospitality skills and catering services.',
  ARRAY['hospitality', 'youth-employment', 'training', 'food', 'skills-development'],
  '2025-01-01',
  'planning',
  ARRAY['kitchen', 'youth', 'employment', 'training', 'the-centre', 'hospitality'],
  0,
  0,
  'Limited youth employment pathways and hospitality training opportunities',
  'Build commercial kitchen with accredited training programs and catering business',
  null,
  'Train 50+ youth annually, achieve 80% employment placement rate, serve 100+ catering events'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = now();

-- 3. Create views for 20-year visualization

-- View: Annual Report Timeline
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

-- View: Progress to 20 Years
CREATE OR REPLACE VIEW progress_to_20_years AS
SELECT 
  '2009-07-01'::date as start_date,
  '2029-07-01'::date as target_date,
  CURRENT_DATE as today,
  EXTRACT(YEAR FROM AGE(CURRENT_DATE, '2009-07-01'::date)) as years_elapsed,
  EXTRACT(YEAR FROM AGE('2029-07-01'::date, CURRENT_DATE)) as years_remaining,
  ROUND(EXTRACT(EPOCH FROM AGE(CURRENT_DATE, '2009-07-01'::date)) / 
    EXTRACT(EPOCH FROM AGE('2029-07-01'::date, '2009-07-01'::date)) * 100, 1) as percent_complete,
  197 as current_staff,
  300 as target_staff,
  ROUND(197.0 / 300 * 100, 1) as staff_progress_pct,
  16 as current_services,
  20 as target_services,
  ROUND(16.0 / 20 * 100, 1) as services_progress_pct,
  77 as current_stories,
  150 as target_stories,
  ROUND(77.0 / 150 * 100, 1) as stories_progress_pct,
  82.2 as current_indigenous_pct,
  85.0 as target_indigenous_pct,
  ROUND(82.2 / 85 * 100, 1) as indigenous_progress_pct;

-- View: Innovation Dashboard
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
    WHEN 'completed' THEN 3
    ELSE 4
  END as status_order
FROM innovation_projects ip
ORDER BY status_order, ip.start_date DESC;

-- View: Community Impact Summary
CREATE OR REPLACE VIEW community_impact_summary AS
SELECT 
  'FY2024' as reporting_period,
  (SELECT COUNT(*) FROM stories WHERE status = 'published') as total_stories_collected,
  (SELECT COUNT(*) FROM media_files WHERE file_type = 'image') as total_photos,
  (SELECT COUNT(DISTINCT storyteller_id) FROM stories WHERE status = 'published') as unique_storytellers,
  (SELECT COUNT(*) FROM partners) as partner_organizations,
  (SELECT COUNT(*) FROM innovation_projects WHERE status = 'active') as active_innovations,
  (SELECT SUM(people_impacted) FROM innovation_projects) as total_people_impacted,
  (SELECT SUM(jobs_created) FROM innovation_projects) as total_jobs_created;

-- Comments
COMMENT ON TABLE innovation_projects IS 'PICC innovation projects for 20-year vision showcase';
COMMENT ON VIEW annual_report_timeline IS 'Complete timeline of annual reports with era categorization';
COMMENT ON VIEW progress_to_20_years IS 'Current progress toward 2029 20-year anniversary goals';
COMMENT ON VIEW innovation_dashboard IS 'Innovation projects with impact metrics';
COMMENT ON VIEW community_impact_summary IS 'High-level community impact metrics';

-- ============================================
-- DONE! Now query with:
-- SELECT * FROM annual_report_timeline;
-- SELECT * FROM progress_to_20_years;
-- SELECT * FROM innovation_dashboard;
-- SELECT * FROM community_impact_summary;
-- ============================================
