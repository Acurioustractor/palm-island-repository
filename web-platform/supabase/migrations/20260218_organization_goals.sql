-- Organization Goals — tracks PICC's strategic targets (DIRECTION mode)
-- Supports the Vision Board admin and public 20-year pages

CREATE TABLE IF NOT EXISTS organization_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_key TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  current_value NUMERIC,
  target_value NUMERIC,
  target_year INTEGER,
  unit TEXT,
  display_order INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Link innovation projects to goals
CREATE TABLE IF NOT EXISTS innovation_goal_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  goal_id UUID REFERENCES organization_goals(id) ON DELETE CASCADE,
  contribution_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, goal_id)
);

-- Enable RLS
ALTER TABLE organization_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE innovation_goal_links ENABLE ROW LEVEL SECURITY;

-- Public read for published goals
CREATE POLICY "Public can read public goals"
  ON organization_goals FOR SELECT
  USING (is_public = true);

-- Authenticated users can manage goals
CREATE POLICY "Authenticated users can manage goals"
  ON organization_goals FOR ALL
  USING (auth.role() = 'authenticated');

-- Authenticated users can manage goal links
CREATE POLICY "Authenticated users can manage goal links"
  ON innovation_goal_links FOR ALL
  USING (auth.role() = 'authenticated');

-- Public can read goal links
CREATE POLICY "Public can read goal links"
  ON innovation_goal_links FOR SELECT
  USING (true);

-- Seed with current known values
INSERT INTO organization_goals (goal_key, category, label, current_value, target_value, target_year, unit, display_order) VALUES
  ('staff_total', 'workforce', 'Total Staff', 197, 300, 2029, 'people', 1),
  ('staff_indigenous_pct', 'workforce', 'Indigenous Staff', 82, 85, 2029, '%', 2),
  ('services_total', 'services', 'Integrated Services', 20, 50, 2029, 'services', 3),
  ('total_income', 'financial', 'Annual Income', 23400335, 40000000, 2029, '$', 4),
  ('community_programs', 'services', 'Community Programs', 8, 15, 2029, 'programs', 5),
  ('social_enterprises', 'economic', 'Social Enterprises', 3, 8, 2029, 'enterprises', 6)
ON CONFLICT (goal_key) DO NOTHING;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_organization_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organization_goals_updated_at
  BEFORE UPDATE ON organization_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_goals_updated_at();
