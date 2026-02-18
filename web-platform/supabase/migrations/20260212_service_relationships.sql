-- ============================================================================
-- SERVICE RELATIONSHIPS & PARTNER-SERVICE LINKS
-- Enables force-directed network graph connecting all organizational domains
-- ============================================================================

-- 1. Service-to-Service Relationships
CREATE TABLE IF NOT EXISTS service_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_service_id UUID NOT NULL REFERENCES organization_services(id) ON DELETE CASCADE,
  target_service_id UUID NOT NULL REFERENCES organization_services(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('referral', 'shared_staff', 'co_located', 'program_link')),
  strength DECIMAL(3,2) DEFAULT 0.50 CHECK (strength BETWEEN 0 AND 1),
  fiscal_year INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_service_id, target_service_id, relationship_type, fiscal_year)
);

CREATE INDEX IF NOT EXISTS idx_service_rel_source ON service_relationships(source_service_id);
CREATE INDEX IF NOT EXISTS idx_service_rel_target ON service_relationships(target_service_id);
CREATE INDEX IF NOT EXISTS idx_service_rel_fy ON service_relationships(fiscal_year);

ALTER TABLE service_relationships ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_relationships' AND policyname = 'Service relationships publicly readable') THEN
    CREATE POLICY "Service relationships publicly readable" ON service_relationships FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_relationships' AND policyname = 'Authenticated manage service relationships') THEN
    CREATE POLICY "Authenticated manage service relationships" ON service_relationships FOR ALL TO authenticated USING (true);
  END IF;
END $$;

-- 2. Partner-to-Service Links
CREATE TABLE IF NOT EXISTS partner_service_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES organization_services(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL CHECK (link_type IN ('funds', 'collaborates', 'refers')),
  fiscal_year INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partner_id, service_id, link_type, fiscal_year)
);

CREATE INDEX IF NOT EXISTS idx_psl_partner ON partner_service_links(partner_id);
CREATE INDEX IF NOT EXISTS idx_psl_service ON partner_service_links(service_id);

ALTER TABLE partner_service_links ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partner_service_links' AND policyname = 'Partner service links publicly readable') THEN
    CREATE POLICY "Partner service links publicly readable" ON partner_service_links FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partner_service_links' AND policyname = 'Authenticated manage partner service links') THEN
    CREATE POLICY "Authenticated manage partner service links" ON partner_service_links FOR ALL TO authenticated USING (true);
  END IF;
END $$;

-- ============================================================================
-- SEED RELATIONSHIPS based on known service groupings
-- ============================================================================

DO $$
DECLARE
  picc_org_id UUID;
  -- Service IDs
  healing_id UUID;
  family_id UUID;
  youth_id UUID;
  women_id UUID;
  justice_id UUID;
  crisis_id UUID;
  digital_id UUID;
  econ_id UUID;
  elder_id UUID;
  mental_id UUID;
  disability_id UUID;
  -- Partner IDs
  qld_health_id UUID;
  niaa_id UUID;
  telstra_id UUID;
  jcu_id UUID;
  checkup_id UUID;
  nqphn_id UUID;
  child_safety_id UUID;
  snaicc_id UUID;
BEGIN
  SELECT id INTO picc_org_id FROM organizations WHERE short_name = 'PICC' LIMIT 1;
  IF picc_org_id IS NULL THEN RAISE NOTICE 'PICC org not found, skipping seeds'; RETURN; END IF;

  -- Resolve service IDs (try both slug patterns)
  SELECT id INTO healing_id FROM organization_services WHERE organization_id = picc_org_id AND (slug = 'bwgcolman-healing' OR slug = 'bwgcolman_healing') LIMIT 1;
  SELECT id INTO family_id FROM organization_services WHERE organization_id = picc_org_id AND (slug = 'family-wellbeing' OR slug = 'family_wellbeing') LIMIT 1;
  SELECT id INTO youth_id FROM organization_services WHERE organization_id = picc_org_id AND (slug = 'youth-services' OR slug = 'youth_services') LIMIT 1;
  SELECT id INTO women_id FROM organization_services WHERE organization_id = picc_org_id AND (slug = 'womens-services' OR slug = 'womens_services') LIMIT 1;
  SELECT id INTO justice_id FROM organization_services WHERE organization_id = picc_org_id AND (slug = 'justice-services' OR slug = 'community_justice') LIMIT 1;
  SELECT id INTO crisis_id FROM organization_services WHERE organization_id = picc_org_id AND (slug = 'crisis-services' OR slug = 'crisis_services') LIMIT 1;
  SELECT id INTO digital_id FROM organization_services WHERE organization_id = picc_org_id AND (slug = 'digital-service-centre' OR slug = 'digital_services') LIMIT 1;
  SELECT id INTO econ_id FROM organization_services WHERE organization_id = picc_org_id AND (slug = 'economic-development' OR slug = 'economic_development') LIMIT 1;
  SELECT id INTO elder_id FROM organization_services WHERE organization_id = picc_org_id AND (slug = 'elder-support' OR slug = 'elder_support') LIMIT 1;
  SELECT id INTO mental_id FROM organization_services WHERE organization_id = picc_org_id AND (slug = 'mental-health' OR slug = 'mental_health') LIMIT 1;
  SELECT id INTO disability_id FROM organization_services WHERE organization_id = picc_org_id AND (slug = 'disability-services' OR slug = 'disability_services') LIMIT 1;

  -- Health cluster: healing ↔ mental health ↔ elder ↔ disability
  IF healing_id IS NOT NULL AND mental_id IS NOT NULL THEN
    INSERT INTO service_relationships (source_service_id, target_service_id, relationship_type, strength, fiscal_year)
    VALUES (healing_id, mental_id, 'referral', 0.85, 2025) ON CONFLICT DO NOTHING;
  END IF;
  IF healing_id IS NOT NULL AND elder_id IS NOT NULL THEN
    INSERT INTO service_relationships (source_service_id, target_service_id, relationship_type, strength, fiscal_year)
    VALUES (healing_id, elder_id, 'referral', 0.70, 2025) ON CONFLICT DO NOTHING;
  END IF;
  IF healing_id IS NOT NULL AND disability_id IS NOT NULL THEN
    INSERT INTO service_relationships (source_service_id, target_service_id, relationship_type, strength, fiscal_year)
    VALUES (healing_id, disability_id, 'referral', 0.60, 2025) ON CONFLICT DO NOTHING;
  END IF;
  IF mental_id IS NOT NULL AND elder_id IS NOT NULL THEN
    INSERT INTO service_relationships (source_service_id, target_service_id, relationship_type, strength, fiscal_year)
    VALUES (mental_id, elder_id, 'referral', 0.65, 2025) ON CONFLICT DO NOTHING;
  END IF;

  -- Family cluster: family ↔ youth ↔ women ↔ crisis
  IF family_id IS NOT NULL AND youth_id IS NOT NULL THEN
    INSERT INTO service_relationships (source_service_id, target_service_id, relationship_type, strength, fiscal_year)
    VALUES (family_id, youth_id, 'referral', 0.80, 2025) ON CONFLICT DO NOTHING;
  END IF;
  IF family_id IS NOT NULL AND women_id IS NOT NULL THEN
    INSERT INTO service_relationships (source_service_id, target_service_id, relationship_type, strength, fiscal_year)
    VALUES (family_id, women_id, 'referral', 0.75, 2025) ON CONFLICT DO NOTHING;
  END IF;
  IF women_id IS NOT NULL AND crisis_id IS NOT NULL THEN
    INSERT INTO service_relationships (source_service_id, target_service_id, relationship_type, strength, fiscal_year)
    VALUES (women_id, crisis_id, 'referral', 0.90, 2025) ON CONFLICT DO NOTHING;
  END IF;
  IF family_id IS NOT NULL AND crisis_id IS NOT NULL THEN
    INSERT INTO service_relationships (source_service_id, target_service_id, relationship_type, strength, fiscal_year)
    VALUES (family_id, crisis_id, 'referral', 0.70, 2025) ON CONFLICT DO NOTHING;
  END IF;

  -- Crisis cluster: crisis ↔ justice ↔ women
  IF crisis_id IS NOT NULL AND justice_id IS NOT NULL THEN
    INSERT INTO service_relationships (source_service_id, target_service_id, relationship_type, strength, fiscal_year)
    VALUES (crisis_id, justice_id, 'referral', 0.80, 2025) ON CONFLICT DO NOTHING;
  END IF;
  IF justice_id IS NOT NULL AND women_id IS NOT NULL THEN
    INSERT INTO service_relationships (source_service_id, target_service_id, relationship_type, strength, fiscal_year)
    VALUES (justice_id, women_id, 'referral', 0.65, 2025) ON CONFLICT DO NOTHING;
  END IF;

  -- Economic cluster: digital ↔ economic development
  IF digital_id IS NOT NULL AND econ_id IS NOT NULL THEN
    INSERT INTO service_relationships (source_service_id, target_service_id, relationship_type, strength, fiscal_year)
    VALUES (digital_id, econ_id, 'program_link', 0.90, 2025) ON CONFLICT DO NOTHING;
  END IF;

  -- Cross-cluster: healing ↔ family (health referrals to family support)
  IF healing_id IS NOT NULL AND family_id IS NOT NULL THEN
    INSERT INTO service_relationships (source_service_id, target_service_id, relationship_type, strength, fiscal_year)
    VALUES (healing_id, family_id, 'referral', 0.60, 2025) ON CONFLICT DO NOTHING;
  END IF;

  -- Partner-Service Links
  SELECT id INTO qld_health_id FROM partners WHERE organization_id = picc_org_id AND name ILIKE '%Queensland Health%' LIMIT 1;
  SELECT id INTO niaa_id FROM partners WHERE organization_id = picc_org_id AND name ILIKE '%NIAA%' LIMIT 1;
  SELECT id INTO telstra_id FROM partners WHERE organization_id = picc_org_id AND name ILIKE '%Telstra%' LIMIT 1;
  SELECT id INTO jcu_id FROM partners WHERE organization_id = picc_org_id AND name ILIKE '%James Cook%' LIMIT 1;
  SELECT id INTO checkup_id FROM partners WHERE organization_id = picc_org_id AND name ILIKE '%CheckUP%' LIMIT 1;
  SELECT id INTO nqphn_id FROM partners WHERE organization_id = picc_org_id AND name ILIKE '%Primary Health Network%' LIMIT 1;
  SELECT id INTO child_safety_id FROM partners WHERE organization_id = picc_org_id AND name ILIKE '%Child Safety%' LIMIT 1;
  SELECT id INTO snaicc_id FROM partners WHERE organization_id = picc_org_id AND name ILIKE '%SNAICC%' LIMIT 1;

  IF qld_health_id IS NOT NULL AND healing_id IS NOT NULL THEN
    INSERT INTO partner_service_links (partner_id, service_id, link_type, fiscal_year)
    VALUES (qld_health_id, healing_id, 'funds', 2025) ON CONFLICT DO NOTHING;
  END IF;
  IF niaa_id IS NOT NULL AND healing_id IS NOT NULL THEN
    INSERT INTO partner_service_links (partner_id, service_id, link_type, fiscal_year)
    VALUES (niaa_id, healing_id, 'funds', 2025) ON CONFLICT DO NOTHING;
  END IF;
  IF telstra_id IS NOT NULL AND digital_id IS NOT NULL THEN
    INSERT INTO partner_service_links (partner_id, service_id, link_type, fiscal_year)
    VALUES (telstra_id, digital_id, 'collaborates', 2025) ON CONFLICT DO NOTHING;
  END IF;
  IF jcu_id IS NOT NULL AND healing_id IS NOT NULL THEN
    INSERT INTO partner_service_links (partner_id, service_id, link_type, fiscal_year)
    VALUES (jcu_id, healing_id, 'collaborates', 2025) ON CONFLICT DO NOTHING;
  END IF;
  IF checkup_id IS NOT NULL AND healing_id IS NOT NULL THEN
    INSERT INTO partner_service_links (partner_id, service_id, link_type, fiscal_year)
    VALUES (checkup_id, healing_id, 'funds', 2025) ON CONFLICT DO NOTHING;
  END IF;
  IF nqphn_id IS NOT NULL AND healing_id IS NOT NULL THEN
    INSERT INTO partner_service_links (partner_id, service_id, link_type, fiscal_year)
    VALUES (nqphn_id, healing_id, 'funds', 2025) ON CONFLICT DO NOTHING;
  END IF;
  IF child_safety_id IS NOT NULL AND family_id IS NOT NULL THEN
    INSERT INTO partner_service_links (partner_id, service_id, link_type, fiscal_year)
    VALUES (child_safety_id, family_id, 'funds', 2025) ON CONFLICT DO NOTHING;
  END IF;
  IF snaicc_id IS NOT NULL AND family_id IS NOT NULL THEN
    INSERT INTO partner_service_links (partner_id, service_id, link_type, fiscal_year)
    VALUES (snaicc_id, family_id, 'collaborates', 2025) ON CONFLICT DO NOTHING;
  END IF;

  RAISE NOTICE 'Service relationships and partner links seeded for org: %', picc_org_id;
END $$;

-- Verify
SELECT 'service_relationships' as tbl, count(*) FROM service_relationships
UNION ALL SELECT 'partner_service_links', count(*) FROM partner_service_links;
