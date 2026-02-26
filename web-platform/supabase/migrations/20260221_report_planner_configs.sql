-- Report Planner Configs — stores content planner configurations
-- Each row represents a saved planner state for a fiscal year + audience combo.

CREATE TABLE IF NOT EXISTS report_planner_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_year TEXT NOT NULL,
  audience TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for quick lookups by year + audience
CREATE INDEX IF NOT EXISTS idx_planner_configs_year_audience
  ON report_planner_configs (fiscal_year, audience);

-- Enable RLS
ALTER TABLE report_planner_configs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (admin page)
CREATE POLICY "Authenticated users can manage planner configs"
  ON report_planner_configs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
