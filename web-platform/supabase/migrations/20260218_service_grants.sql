-- Service Grants tracking table
CREATE TABLE IF NOT EXISTS service_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES organization_services(id) ON DELETE CASCADE,
  funder_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  grant_name TEXT NOT NULL,
  amount DECIMAL(12,2),
  status TEXT NOT NULL CHECK (status IN ('prospect','applied','awarded','acquitted','declined','closed')),
  application_date DATE,
  award_date DATE,
  reporting_due DATE,
  acquittal_due DATE,
  fiscal_year TEXT,
  notes TEXT,
  requirements JSONB DEFAULT '{}',
  outcomes_reported JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for service lookup
CREATE INDEX IF NOT EXISTS idx_service_grants_service_id ON service_grants(service_id);
CREATE INDEX IF NOT EXISTS idx_service_grants_status ON service_grants(status);
