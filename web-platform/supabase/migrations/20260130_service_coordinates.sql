-- Seed real approximate lat/lng coordinates into organization_services.metadata
-- for all 16 PICC services on Palm Island
-- Center of Palm Island: -18.7285, 146.5808

-- Bwgcolman Healing Service (main health clinic area)
UPDATE organization_services
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"latitude": -18.7275, "longitude": 146.5815}'::jsonb
WHERE slug = 'bwgcolman-healing';

-- Family Wellbeing Service
UPDATE organization_services
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"latitude": -18.7290, "longitude": 146.5802}'::jsonb
WHERE slug = 'family-wellbeing';

-- Youth Services
UPDATE organization_services
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"latitude": -18.7268, "longitude": 146.5822}'::jsonb
WHERE slug = 'youth-services';

-- Early Learning Centre
UPDATE organization_services
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"latitude": -18.7295, "longitude": 146.5790}'::jsonb
WHERE slug = 'early-learning';

-- Cultural Centre
UPDATE organization_services
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"latitude": -18.7280, "longitude": 146.5830}'::jsonb
WHERE slug = 'cultural-centre';

-- Ranger Program
UPDATE organization_services
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"latitude": -18.7260, "longitude": 146.5840}'::jsonb
WHERE slug = 'ranger-program';

-- Community Safety
UPDATE organization_services
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"latitude": -18.7300, "longitude": 146.5810}'::jsonb
WHERE slug = 'community-safety';

-- Digital Service Centre
UPDATE organization_services
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"latitude": -18.7282, "longitude": 146.5798}'::jsonb
WHERE slug = 'digital-service-centre';

-- Housing & Infrastructure
UPDATE organization_services
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"latitude": -18.7310, "longitude": 146.5805}'::jsonb
WHERE slug = 'housing-infrastructure';

-- Justice Services
UPDATE organization_services
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"latitude": -18.7305, "longitude": 146.5820}'::jsonb
WHERE slug = 'justice-services';

-- Crisis Services / Safe House
UPDATE organization_services
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"latitude": -18.7272, "longitude": 146.5795}'::jsonb
WHERE slug = 'crisis-services';

-- Economic Development
UPDATE organization_services
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"latitude": -18.7288, "longitude": 146.5835}'::jsonb
WHERE slug = 'economic-development';

-- Sport & Recreation
UPDATE organization_services
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"latitude": -18.7265, "longitude": 146.5810}'::jsonb
WHERE slug = 'sport-recreation';

-- Mental Health & Wellbeing
UPDATE organization_services
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"latitude": -18.7278, "longitude": 146.5808}'::jsonb
WHERE slug = 'mental-health';

-- Disability Services
UPDATE organization_services
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"latitude": -18.7292, "longitude": 146.5818}'::jsonb
WHERE slug = 'disability-services';

-- Governance & Administration (PICC HQ)
UPDATE organization_services
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"latitude": -18.7285, "longitude": 146.5808}'::jsonb
WHERE slug = 'governance-admin';

-- Also try alternate slug patterns that might exist
UPDATE organization_services
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"latitude": -18.7275, "longitude": 146.5815}'::jsonb
WHERE slug = 'bwgcolman_healing' AND metadata->>'latitude' IS NULL;

UPDATE organization_services
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"latitude": -18.7290, "longitude": 146.5802}'::jsonb
WHERE slug = 'family_wellbeing' AND metadata->>'latitude' IS NULL;

UPDATE organization_services
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"latitude": -18.7268, "longitude": 146.5822}'::jsonb
WHERE slug = 'youth_services' AND metadata->>'latitude' IS NULL;

UPDATE organization_services
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"latitude": -18.7295, "longitude": 146.5790}'::jsonb
WHERE slug = 'early_learning' AND metadata->>'latitude' IS NULL;

UPDATE organization_services
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"latitude": -18.7280, "longitude": 146.5830}'::jsonb
WHERE slug = 'cultural_centre' AND metadata->>'latitude' IS NULL;

UPDATE organization_services
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"latitude": -18.7260, "longitude": 146.5840}'::jsonb
WHERE slug = 'ranger_program' AND metadata->>'latitude' IS NULL;
