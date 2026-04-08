-- Job Opportunities Table for PICC
-- Enables chatbot to answer questions about jobs, training, and employment pathways

CREATE TABLE IF NOT EXISTS job_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Job Details
  title TEXT NOT NULL,
  description TEXT,
  employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'casual', 'contract', 'traineeship', 'apprenticeship', 'volunteer')),
  category TEXT CHECK (category IN ('health', 'community_services', 'administration', 'trades', 'hospitality', 'retail', 'digital', 'education', 'cultural', 'construction', 'other')),
  
  -- Requirements
  requirements TEXT[],
  experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'any')),
  
  -- Location
  location TEXT, -- 'Palm Island', 'Townsville', 'Remote'
  is_remote BOOLEAN DEFAULT false,
  
  -- Training/Pathway Details
  includes_training BOOLEAN DEFAULT false,
  training_details TEXT,
  qualification_obtained TEXT,
  
  -- Status & Timing
  status TEXT CHECK (status IN ('open', 'coming_soon', 'closed', 'ongoing')) DEFAULT 'open',
  closing_date DATE,
  start_date DATE,
  
  -- Contact/Application
  contact_email TEXT,
  contact_phone TEXT,
  application_link TEXT,
  
  -- Source tracking
  source TEXT, -- 'PICC HR', 'External', 'Partner'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_job_opportunities_org ON job_opportunities(organization_id);
CREATE INDEX IF NOT EXISTS idx_job_opportunities_status ON job_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_job_opportunities_category ON job_opportunities(category);
CREATE INDEX IF NOT EXISTS idx_job_opportunities_type ON job_opportunities(employment_type);

-- RLS
ALTER TABLE job_opportunities ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access for open positions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_opportunities' AND policyname = 'Public read job opportunities') THEN
    CREATE POLICY "Public read job opportunities" ON job_opportunities
      FOR SELECT USING (status IN ('open', 'ongoing'));
  END IF;
END $$;

-- Policy: Service role full access
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_opportunities' AND policyname = 'Service role manage job opportunities') THEN
    CREATE POLICY "Service role manage job opportunities" ON job_opportunities
      FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
  END IF;
END $$;

-- Seed some initial job opportunities based on existing PICC data
DO $$
DECLARE
  picc_org_id UUID;
  econ_service_id UUID;
  digital_service_id UUID;
BEGIN
  -- Get PICC organization ID
  SELECT id INTO picc_org_id FROM organizations WHERE short_name = 'PICC' LIMIT 1;
  
  IF picc_org_id IS NOT NULL THEN
    -- Get service IDs for linking
    SELECT id INTO econ_service_id FROM organization_services WHERE organization_id = picc_org_id AND slug = 'economic_development' LIMIT 1;
    SELECT id INTO digital_service_id FROM organization_services WHERE organization_id = picc_org_id AND slug = 'digital_services' LIMIT 1;
    
    -- Insert Digital Service Centre opportunities
    INSERT INTO job_opportunities (
      organization_id, title, description, employment_type, category,
      requirements, experience_level, location, is_remote, includes_training,
      training_details, qualification_obtained, status, contact_email, source
    ) VALUES
    (
      picc_org_id, 
      'Digital Service Centre Agent (Telstra)',
      'Work as a customer service representative taking Telstra calls from across Australia. Join our team of 21 Palm Islanders in this pioneering remote community employment initiative.',
      'full_time',
      'digital',
      ARRAY['Year 10 completion', 'Good communication skills', 'Computer literacy'],
      'entry',
      'Palm Island',
      false,
      true,
      '12-week TAFE course + 5-week Telstra intro + ongoing Certificate III in Business while working',
      'Certificate III in Business',
      'open',
      'admin@picc.com.au',
      'PICC HR'
    ),
    (
      picc_org_id,
      'Digital Service Centre - Trainee',
      'Start your career in customer service and technology. Full training provided with wages during training. Pathway to permanent position.',
      'traineeship',
      'digital',
      ARRAY['Year 10 completion', 'Willingness to learn', 'Reliable'],
      'entry',
      'Palm Island',
      false,
      true,
      'TAFE-provided training with wages from day one',
      'Certificate III in Business',
      'open',
      'admin@picc.com.au',
      'PICC HR'
    ),
    (
      picc_org_id,
      'Social Enterprise Worker - Construction & Maintenance',
      'Work in our community-owned construction and maintenance business. Real skills, real work, real pathways.',
      'full_time',
      'construction',
      ARRAY['Current drivers licence preferred', 'Physical ability'],
      'any',
      'Palm Island',
      false,
      false,
      NULL,
      NULL,
      'ongoing',
      'admin@picc.com.au',
      'PICC HR'
    ),
    (
      picc_org_id,
      'Store/Retail Worker - Community Shop',
      'Work at the PICC Community Shop - the only full-service supermarket on island. Customer service, stock management, community connection.',
      'full_time',
      'retail',
      ARRAY['Year 10 completion', 'Customer service skills'],
      'entry',
      'Palm Island',
      false,
      false,
      NULL,
      NULL,
      'ongoing',
      'admin@picc.com.au',
      'PICC HR'
    );
    
    -- Insert upcoming opportunities (coming soon)
    INSERT INTO job_opportunities (
      organization_id, title, description, employment_type, category,
      requirements, experience_level, location, is_remote, includes_training,
      training_details, qualification_obtained, status, start_date, source
    ) VALUES
    (
      picc_org_id,
      'Hospitality Trainee - Commercial Kitchen (The Centre)',
      'Train in our commercial kitchen facility being built at The Station in Townsville. Learn hospitality skills while earning. Pathways to employment in tourism and food services.',
      'traineeship',
      'hospitality',
      NULL,
      'entry',
      'Townsville',
      false,
      true,
      'Accredited hospitality training with practical work experience',
      'Certificate II/III in Hospitality',
      'coming_soon',
      '2025-07-01',
      'PICC HR'
    ),
    (
      picc_org_id,
      'Manufacturing Worker - Bed Base Production (The Station)',
      'Join our circular economy manufacturing team. Produce recycled bed bases from mattress waste. First of its kind on Palm Island with export potential.',
      'full_time',
      'trades',
      NULL,
      'entry',
      'Townsville',
      false,
      true,
      'On-the-job manufacturing training provided',
      'Manufacturing certificate',
      'coming_soon',
      '2026-01-01',
      'PICC HR'
    ),
    (
      picc_org_id,
      'Youth Diversionary Program Worker',
      'Support young people through alternative to detention programs. Use culture, sport, and education to create pathways away from the justice system.',
      'full_time',
      'community_services',
      ARRAY['Community Services qualification preferred', 'Working with Children Check'],
      'mid',
      'Townsville',
      false,
      false,
      NULL,
      NULL,
      'coming_soon',
      '2025-09-01',
      'PICC HR'
    );
    
    RAISE NOTICE 'Seeded job opportunities for PICC';
  ELSE
    RAISE WARNING 'PICC organization not found, skipping job opportunities seed';
  END IF;
END $$;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_job_opportunities_updated_at
  BEFORE UPDATE ON job_opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index for filtering expired/upcoming jobs
CREATE INDEX IF NOT EXISTS idx_job_opportunities_closing_date ON job_opportunities (closing_date);