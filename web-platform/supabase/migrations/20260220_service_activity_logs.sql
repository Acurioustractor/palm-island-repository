-- Service Activity Logs: periodic (monthly/weekly/quarterly) snapshots of service activity
-- Enables tracking between annual reports

CREATE TABLE IF NOT EXISTS service_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES organization_services(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('weekly', 'monthly', 'quarterly')) DEFAULT 'monthly',
  clients_served INTEGER,
  sessions_delivered INTEGER,
  events_held INTEGER,
  staff_active INTEGER,
  notes TEXT,
  entered_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(service_id, period_start, period_type)
);

-- Index for fast lookups by service and date range
CREATE INDEX IF NOT EXISTS idx_activity_logs_service_period
  ON service_activity_logs(service_id, period_start DESC);

-- Enable RLS
ALTER TABLE service_activity_logs ENABLE ROW LEVEL SECURITY;

-- Public read access (for dashboards)
CREATE POLICY "Public read access" ON service_activity_logs
  FOR SELECT USING (true);

-- Authenticated users can insert/update
CREATE POLICY "Authenticated insert" ON service_activity_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated update" ON service_activity_logs
  FOR UPDATE USING (auth.role() = 'authenticated');
