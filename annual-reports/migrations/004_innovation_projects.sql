-- Migration: Innovation Projects Table
-- Stores PICC innovation stories for 20-year vision showcase

CREATE TABLE IF NOT EXISTS innovation_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  description text,
  innovation_type text[],
  start_date date,
  status text DEFAULT 'active',
  
  -- Impact metrics
  people_impacted integer DEFAULT 0,
  jobs_created integer DEFAULT 0,
  revenue_generated decimal(12,2),
  environmental_impact jsonb,
  
  -- Media
  hero_image_url text,
  gallery_images text[],
  video_url text,
  
  -- Connections
  related_story_ids uuid[],
  related_service_id uuid REFERENCES services(id),
  
  -- Narrative
  challenge text,
  solution text,
  outcome text,
  future_vision text,
  
  -- Metadata
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE innovation_projects ENABLE ROW LEVEL SECURITY;

-- Create policy for public read
CREATE POLICY "Innovation projects are viewable by everyone" 
ON innovation_projects FOR SELECT 
USING (true);

-- Create policy for authenticated insert/update
CREATE POLICY "Authenticated users can manage innovation projects" 
ON innovation_projects FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_innovation_projects_category ON innovation_projects(category);
CREATE INDEX idx_innovation_projects_status ON innovation_projects(status);
CREATE INDEX idx_innovation_projects_tags ON innovation_projects USING gin(tags);

-- Insert current innovation projects
INSERT INTO innovation_projects (
  slug, name, category, description, innovation_type, 
  start_date, status, tags, challenge, solution, outcome, future_vision
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
  'Loss of connection to traditional country and intergenerational knowledge gap.',
  'Organized elder-led journeys to Hull River with cultural documentation and youth participation.',
  'Revived cultural practices, documented elder knowledge, strengthened youth connection to country.',
  'Expand to regular on-country programs and establish cultural knowledge archive.'
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
  'Manual processing of 15 years of annual reports would take months.',
  'Built automated pipeline using AI to extract text, generate summaries, and create searchable embeddings.',
  '270 pages digitized, 86 knowledge entries created, semantic search enabled across all reports.',
  'Extend AI capabilities to extract insights and generate predictive analytics.'
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
  'Limited professional photography documenting community and culture.',
  'Established on-country photo studio with professional equipment and training programs.',
  '323 professional photos captured, 20+ elder portraits, youth trained in photography.',
  'Expand to commercial photography services and multimedia production.'
),
(
  'community-stories-platform',
  'Community Stories Collection Platform',
  'participatory',
  'Community-controlled storytelling and cultural preservation platform with AI-assisted story generation from interviews.',
  ARRAY['participatory-media', 'cultural-preservation', 'community-control', 'ai'],
  '2024-01-01',
  'active',
  ARRAY['stories', 'community', 'culture', 'participation', 'interviews'],
  'Community narratives controlled by external media. Loss of cultural stories.',
  'Built platform for community-controlled storytelling with interview transcription and AI assistance.',
  '77 stories collected, 24 elder wisdom stories, 33 interviews transcribed, 10 AI-generated stories.',
  'Scale to include video storytelling and immersive cultural experiences.'
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
  'Plastic waste accumulation and limited manufacturing employment on island.',
  'Establish recycling facility to convert plastic waste into durable beds for community and export.',
  NULL,
  'Produce 500+ beds annually, create 10+ manufacturing jobs, export to other communities.'
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
  'Limited youth employment pathways and hospitality training opportunities.',
  'Build commercial kitchen with accredited training programs and catering business.',
  NULL,
  'Train 50+ youth annually, achieve 80% employment placement rate, serve 100+ catering events.'
);

-- Create view for innovation dashboard
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

-- Add comments
COMMENT ON TABLE innovation_projects IS 'PICC innovation projects and initiatives for 20-year vision showcase';
COMMENT ON COLUMN innovation_projects.innovation_type IS 'Array of innovation categories (e.g., ai, cultural, manufacturing)';
COMMENT ON COLUMN innovation_projects.environmental_impact IS 'JSON with metrics like tons_recycled, waste_diverted, etc.';
