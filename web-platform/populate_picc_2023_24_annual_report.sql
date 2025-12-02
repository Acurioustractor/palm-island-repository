-- ============================================================================
-- PICC 2023-24 Annual Report Data Population Script
-- Source: Palm Island Community Company Annual Report 2023-2024
-- ============================================================================
-- This script populates the database with actual data from the PICC Annual Report
-- Run this against your Supabase database to enable the impact dashboard
-- ============================================================================

-- ============================================================================
-- STEP 1: Ensure PICC Organization Exists with Complete Data
-- ============================================================================

-- First, update or insert the PICC organization with complete data from the report
INSERT INTO organizations (
  id,
  name,
  legal_name,
  short_name,
  organization_type,
  tagline,
  mission_statement,
  primary_location,
  traditional_country,
  language_groups,
  website,
  email,
  phone,
  postal_address,
  physical_address,
  established_date,
  abn,
  indigenous_controlled,
  governance_model,
  empathy_ledger_enabled,
  annual_reports_enabled,
  impact_tracking_enabled,
  has_cultural_protocols,
  elder_approval_required,
  default_story_access_level,
  metadata
) VALUES (
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Palm Island Community Company',
  'Palm Island Community Company Limited',
  'PICC',
  'aboriginal_community',
  'Our Community, Our Future, Our Way',
  'Delivering culturally appropriate, community-controlled services that strengthen Palm Island families, preserve culture, and build a thriving future for all generations. The Palm Island Community Company is deeply committed to the principles of community control and self-determination.',
  'Palm Island',
  'Manbarra Country',
  ARRAY['Manbarra', 'Bwgcolman'],
  'https://www.picc.com.au',
  'info@picc.com.au',
  '07 4421 4300',
  'PO Box 1415, Townsville QLD 4810, Australia',
  '61-73 Sturt Street, Townsville QLD 4810',
  '2009-01-01',
  '640 793 728',
  TRUE,
  'community_controlled',
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  'community',
  '{
    "acn": "640 793 728",
    "acknowledgement_of_country": "The Palm Island Community Company acknowledges the Traditional Owners of Palm Island, the Manbarra people. We also acknowledge the many First Nations persons who were forcibly removed to Palm Island, and we recognise these persons and their descendants as the historical Bwgcolman people. We recognise the continued connection of the Manbarra and Bwgcolman peoples to the land and waters of this beautiful island. We pay respect to Manbarra and Bwgcolman Elders, their ancestors, all First Nations peoples, and our ancestors who walk in the Dreamtime."
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  legal_name = EXCLUDED.legal_name,
  short_name = EXCLUDED.short_name,
  mission_statement = EXCLUDED.mission_statement,
  website = EXCLUDED.website,
  phone = EXCLUDED.phone,
  postal_address = EXCLUDED.postal_address,
  physical_address = EXCLUDED.physical_address,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- ============================================================================
-- STEP 2: Create Board Members and Leadership Profiles
-- ============================================================================

-- CEO: Rachel Atkinson
INSERT INTO profiles (
  id, full_name, preferred_name, community_role, storyteller_type,
  location, bio, is_elder, profile_visibility, primary_organization_id
) VALUES (
  'b0000000-0000-0000-0000-000000000001'::uuid,
  'Rachel Atkinson',
  'Rachel',
  'Chief Executive Officer',
  'service_provider',
  'Palm Island',
  'CEO of Palm Island Community Company. In 2018/19 wrote, "Now that our first decade is behind us, watch this space for what we will achieve in our second." Champion of community control and delegated authority for child protection decisions.',
  FALSE,
  'public',
  'a0000000-0000-0000-0000-000000000001'::uuid
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  community_role = EXCLUDED.community_role,
  bio = EXCLUDED.bio,
  updated_at = NOW();

-- Chair: Luella Bligh
INSERT INTO profiles (
  id, full_name, preferred_name, community_role, storyteller_type,
  location, bio, is_elder, profile_visibility, primary_organization_id
) VALUES (
  'b0000000-0000-0000-0000-000000000002'::uuid,
  'Luella Bligh',
  'Luella',
  'Chair of the Board',
  'elder',
  'Palm Island',
  'In her fifth year as Chair of the Board, deeply committed to ensuring PICC remains the exemplary service provider that Palm Island deserves. Conscious of the responsibility to the people of Palm Island, ensuring that the company is well-managed, sustainable, and progressing in the right direction.',
  TRUE,
  'public',
  'a0000000-0000-0000-0000-000000000001'::uuid
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  community_role = EXCLUDED.community_role,
  bio = EXCLUDED.bio,
  updated_at = NOW();

-- Board Member: Rhonda Phillips
INSERT INTO profiles (
  id, full_name, community_role, storyteller_type, location, profile_visibility, primary_organization_id
) VALUES (
  'b0000000-0000-0000-0000-000000000003'::uuid,
  'Rhonda Phillips',
  'Director',
  'community_member',
  'Palm Island',
  'public',
  'a0000000-0000-0000-0000-000000000001'::uuid
) ON CONFLICT (id) DO NOTHING;

-- Board Member: Allan Palm Island
INSERT INTO profiles (
  id, full_name, community_role, storyteller_type, location, profile_visibility, primary_organization_id
) VALUES (
  'b0000000-0000-0000-0000-000000000004'::uuid,
  'Allan Palm Island',
  'Director',
  'community_member',
  'Palm Island',
  'public',
  'a0000000-0000-0000-0000-000000000001'::uuid
) ON CONFLICT (id) DO NOTHING;

-- Company Secretary: Matthew Lindsay
INSERT INTO profiles (
  id, full_name, community_role, storyteller_type, location, profile_visibility, primary_organization_id
) VALUES (
  'b0000000-0000-0000-0000-000000000005'::uuid,
  'Matthew Lindsay',
  'Company Secretary',
  'service_provider',
  'Palm Island',
  'public',
  'a0000000-0000-0000-0000-000000000001'::uuid
) ON CONFLICT (id) DO NOTHING;

-- Board Member: Harriet Hulthen
INSERT INTO profiles (
  id, full_name, community_role, storyteller_type, location, profile_visibility, primary_organization_id
) VALUES (
  'b0000000-0000-0000-0000-000000000006'::uuid,
  'Harriet Hulthen',
  'Director',
  'community_member',
  'Palm Island',
  'public',
  'a0000000-0000-0000-0000-000000000001'::uuid
) ON CONFLICT (id) DO NOTHING;

-- Board Member: Raymond W. Palmer Snr
INSERT INTO profiles (
  id, full_name, community_role, storyteller_type, location, is_elder, profile_visibility, primary_organization_id
) VALUES (
  'b0000000-0000-0000-0000-000000000007'::uuid,
  'Raymond W. Palmer Snr',
  'Director',
  'elder',
  'Palm Island',
  TRUE,
  'public',
  'a0000000-0000-0000-0000-000000000001'::uuid
) ON CONFLICT (id) DO NOTHING;

-- Board Member: Cassie Lang
INSERT INTO profiles (
  id, full_name, community_role, storyteller_type, location, profile_visibility, primary_organization_id
) VALUES (
  'b0000000-0000-0000-0000-000000000008'::uuid,
  'Cassie Lang',
  'Director',
  'community_member',
  'Palm Island',
  'public',
  'a0000000-0000-0000-0000-000000000001'::uuid
) ON CONFLICT (id) DO NOTHING;

-- Key Staff: Jeanie Sam (Manager of Children and Youth Services)
INSERT INTO profiles (
  id, full_name, preferred_name, community_role, storyteller_type, location, bio, profile_visibility, primary_organization_id
) VALUES (
  'b0000000-0000-0000-0000-000000000009'::uuid,
  'Jeanie Sam',
  'Jeanie',
  'Manager of Children and Youth Services',
  'service_provider',
  'Palm Island',
  'Manager of PICC Children and Youth Services. Presented "Proud Bwgcolman Youth" at the 2023 SNAICC Conference, proposing an alternative approach to tackling the complex issues driving the over-representation of Aboriginal and Torres Strait Islander children in the youth justice system.',
  'public',
  'a0000000-0000-0000-0000-000000000001'::uuid
) ON CONFLICT (id) DO NOTHING;

-- Key Staff: Dee Ann Sailor
INSERT INTO profiles (
  id, full_name, preferred_name, community_role, storyteller_type, location, bio, profile_visibility, primary_organization_id
) VALUES (
  'b0000000-0000-0000-0000-000000000010'::uuid,
  'Dee Ann Sailor',
  'Dee Ann',
  'Youth Services Staff',
  'service_provider',
  'Palm Island',
  'Co-presented "Proud Bwgcolman Youth" at the 2023 SNAICC Conference, sharing a hopeful narrative about Palm Island young people.',
  'public',
  'a0000000-0000-0000-0000-000000000001'::uuid
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 3: Create Organization Services (16 Services from Annual Report)
-- ============================================================================

-- Delete existing services for PICC and recreate with accurate data
DELETE FROM organization_services WHERE organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid;

INSERT INTO organization_services (
  id, organization_id, name, slug, description, service_category,
  is_active, service_color, icon_name, metadata
) VALUES
-- 1. Bwgcolman Healing Service (Primary Health)
(
  'c0000000-0000-0000-0000-000000000001'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Bwgcolman Healing Service',
  'bwgcolman-healing',
  'Comprehensive primary healthcare integrating traditional and modern medicine. Renamed from Primary Health Centre in early 2024 after extensive community consultation. RACGP accredited general practice clinic with wide range of health services including GP, specialist and allied health services.',
  'health',
  TRUE,
  '#E74C3C',
  'heart-pulse',
  '{
    "former_name": "Primary Health Centre",
    "renamed_date": "2024-01",
    "accreditation": "RACGP Quality Practice Accreditation (2024-2027)",
    "programs": [
      "Integrated Team Care (ITC)",
      "Communicable Infections Program",
      "ARF/RHD Program",
      "Eldercare Connector Program",
      "Growing Deadly Families (GDF)",
      "GP After Hours (Mon-Thu 5pm-9pm)"
    ],
    "metrics_2023_24": {
      "total_clients": 2283,
      "aboriginal_tsi_clients": 1935,
      "episodes_of_care": 17488,
      "health_checks_715": 779,
      "child_health_checks": 128,
      "team_care_arrangements": 308,
      "gp_management_plans": 293
    }
  }'::jsonb
),
-- 2. Community Justice Group
(
  'c0000000-0000-0000-0000-000000000002'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Community Justice Group',
  'community-justice-group',
  'Auspiced by PICC since 2008. Includes the general program and the Domestic and Family Violence Enhancement Program. Provides ongoing assistance to community members dealing with the criminal justice system.',
  'justice',
  TRUE,
  '#C0392B',
  'scale-balanced',
  '{
    "auspiced_since": 2008,
    "staff_positions": ["Coordinator (part-time)", "Administration Assistant (part-time)", "DFV Support Worker x2 (part-time)"],
    "programs": ["General Program", "Domestic and Family Violence Enhancement Program"]
  }'::jsonb
),
-- 3. Digital Service Centre
(
  'c0000000-0000-0000-0000-000000000003'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Digital Service Centre',
  'digital-service-centre',
  'Opened in 2023, provides sales and customer service for Telstra landline, mobile and Internet products for Aboriginal and Torres Strait Islander customers. Can connect callers with interpreters for about fifty First Nations languages. Second of its kind in Australia after Cherbourg.',
  'other',
  TRUE,
  '#34495E',
  'laptop',
  '{
    "launched": "2023-06-16",
    "first_calls": "2023-10-23",
    "staff_count": 21,
    "capacity": 30,
    "location": "Retail Centre, Main Street",
    "partners": ["Telstra", "Palm Island Aboriginal Shire Council", "State of Queensland", "Advance Queensland"],
    "training": "12-week TAFE course + 5-week Telstra intro + Certificate III in Business",
    "pilot_end_date": "2025-01-31"
  }'::jsonb
),
-- 4. Diversionary Service
(
  'c0000000-0000-0000-0000-000000000004'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Diversionary Service',
  'diversionary-service',
  'Provides diversionary support services to community members to reduce interactions with the justice system.',
  'justice',
  TRUE,
  '#9B59B6',
  'arrows-split-up-and-left',
  '{
    "metrics_2023_24": {
      "q1_service_users": 175,
      "q2_service_users": 143,
      "q3_service_users": 182
    }
  }'::jsonb
),
-- 5. Early Childhood Services (CFC)
(
  'c0000000-0000-0000-0000-000000000005'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Early Childhood Services',
  'early-childhood-services',
  'Quality early childhood education and care through the Children and Family Centre (CFC). Presented "The Storyline of the Palm Island Children and Family Centre" at the 2023 SNAICC Conference in Darwin.',
  'education',
  TRUE,
  '#F39C12',
  'school',
  '{
    "also_known_as": "Children and Family Centre (CFC)",
    "metrics_2023_24": {
      "q1_children": 405,
      "q2_children": 306
    },
    "conference_presentation": "SNAICC 2023 - The Storyline of the Palm Island Children and Family Centre"
  }'::jsonb
),
-- 6. Family Care Service
(
  'c0000000-0000-0000-0000-000000000006'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Family Care Service',
  'family-care-service',
  'Provides care and support services for families and children in need of out-of-home care placement.',
  'family',
  TRUE,
  '#3498DB',
  'house-chimney-user',
  '{
    "metrics_2023_24": {
      "q1_service_users": 16,
      "q2_service_users": 23,
      "q3_service_users": 21,
      "q4_service_users": 21,
      "total_placement_nights": 6698
    }
  }'::jsonb
),
-- 7. Family Participation Program
(
  'c0000000-0000-0000-0000-000000000007'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Family Participation Program',
  'family-participation-program',
  'Supports families to participate in decisions about their children and maintain connections.',
  'family',
  TRUE,
  '#1ABC9C',
  'people-roof',
  '{
    "metrics_2023_24": {
      "q1_families": 14,
      "q2_families": 18,
      "q3_families": 18,
      "q4_families": 9
    }
  }'::jsonb
),
-- 8. Family Wellbeing Centre
(
  'c0000000-0000-0000-0000-000000000008'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Family Wellbeing Centre',
  'family-wellbeing-centre',
  'Provides comprehensive family support and wellbeing services to strengthen families on Palm Island.',
  'family',
  TRUE,
  '#9B59B6',
  'users',
  '{
    "metrics_2023_24": {
      "q1_families": 20,
      "q2_families": 20,
      "q3_families": 23,
      "q4_families": 15
    }
  }'::jsonb
),
-- 9. NDIS Service
(
  'c0000000-0000-0000-0000-000000000009'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'NDIS Service',
  'ndis-service',
  'National Disability Insurance Scheme support coordination, community connection and access services. Moved to new Aitkenvale office in February 2024 for better client service in Townsville region.',
  'other',
  TRUE,
  '#16A085',
  'wheelchair',
  '{
    "townsville_office": "Aitkenvale (from February 2024)",
    "palm_island_location": "Retail Centre upstairs",
    "collocated_with": "Women''s Healing Service",
    "metrics_2023_24": {
      "q1_access_support": 116,
      "q2_access_support": 70,
      "q3_access_support": 209,
      "q4_access_support": 173,
      "q1_planning_meetings": 3,
      "q2_planning_meetings": 8,
      "q3_planning_meetings": 3,
      "q4_planning_meetings": 12
    }
  }'::jsonb
),
-- 10. Safe Haven
(
  'c0000000-0000-0000-0000-000000000010'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Safe Haven',
  'safe-haven',
  'Provides safe accommodation and support for children and young people who need a safe place to stay.',
  'youth',
  TRUE,
  '#27AE60',
  'shield-halved',
  '{
    "metrics_2023_24": {
      "q1_children_supported": 355,
      "q2_children_supported": 299,
      "q3_children_supported": 255,
      "q4_children_supported": 278
    }
  }'::jsonb
),
-- 11. Safe House
(
  'c0000000-0000-0000-0000-000000000011'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Safe House',
  'safe-house',
  'Emergency accommodation and support for those escaping domestic and family violence.',
  'family',
  TRUE,
  '#E67E22',
  'house-lock',
  '{
    "metrics_2023_24": {
      "q1_service_users": 5,
      "q2_service_users": 4,
      "q3_service_users": 6,
      "q4_service_users": 9,
      "total_placement_nights": 1439
    }
  }'::jsonb
),
-- 12. Social and Emotional Wellbeing Service
(
  'c0000000-0000-0000-0000-000000000012'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Social and Emotional Wellbeing Service',
  'sewb-service',
  'Provides mental health and social emotional wellbeing support services to community members.',
  'health',
  TRUE,
  '#8E44AD',
  'brain',
  '{}'::jsonb
),
-- 13. Specialist Domestic and Family Violence Service
(
  'c0000000-0000-0000-0000-000000000013'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Specialist Domestic and Family Violence Service',
  'dfv-service',
  'Specialist support for those affected by domestic and family violence.',
  'family',
  TRUE,
  '#C0392B',
  'hand-holding-heart',
  '{}'::jsonb
),
-- 14. Women''s Healing Service
(
  'c0000000-0000-0000-0000-000000000014'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Women''s Healing Service',
  'womens-healing-service',
  'Remodelled in 2024 to provide better services to women resident, or at risk of being resident, in the Townsville Women''s Correctional Centre. Operates three programs: Re-entry Program, Women on Remand Program, and Early Intervention Program.',
  'family',
  TRUE,
  '#E91E63',
  'venus',
  '{
    "funded_by": "Department of Justice and the Attorney-General",
    "townsville_office": "Aitkenvale",
    "collocated_with": "NDIS Service",
    "remodelled": "2024",
    "programs": [
      "Re-entry Program (women leaving custody)",
      "Women on Remand Program (women awaiting trial)",
      "Early Intervention Program (women at risk - Palm Island)"
    ],
    "metrics_2023_24": {
      "q3_women_served": 19,
      "q4_women_served": 86,
      "note": "Service remodelled Jul 2023 - Feb 2024, no data Q1-Q2"
    }
  }'::jsonb
),
-- 15. Women''s Service
(
  'c0000000-0000-0000-0000-000000000015'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Women''s Service',
  'womens-service',
  'Support services specifically for women, including accommodation and outreach support.',
  'family',
  TRUE,
  '#E91E63',
  'female',
  '{
    "metrics_2023_24": {
      "q1_staying": 21,
      "q2_staying": 16,
      "q3_staying": 22,
      "q4_staying": 15,
      "q1_support_not_staying": 35,
      "q2_support_not_staying": 44,
      "q3_support_not_staying": 51,
      "q4_support_not_staying": 44
    }
  }'::jsonb
),
-- 16. Youth Service
(
  'c0000000-0000-0000-0000-000000000016'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Youth Service',
  'youth-service',
  'Youth development, leadership, and support programs. Offers Young Offenders Support Service, Indigenous Youth Connection to Culture Program, Tackling Indigenous Smoking program, and Digital Footprint Program.',
  'youth',
  TRUE,
  '#3498DB',
  'users-between-lines',
  '{
    "programs": [
      "Young Offenders Support Service",
      "Indigenous Youth Connection to Culture Program",
      "Tackling Indigenous Smoking",
      "Digital Footprint Program"
    ],
    "program_focus": "Preventing interactions with criminal justice system and promoting healthy lifestyles"
  }'::jsonb
);

-- ============================================================================
-- STEP 4: Create Organization Members (Link profiles to org with roles)
-- ============================================================================

-- Clear existing memberships and recreate
DELETE FROM organization_members WHERE organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid;

INSERT INTO organization_members (organization_id, profile_id, role, can_approve_stories, can_manage_reports, can_view_analytics, can_manage_members, is_active)
VALUES
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'b0000000-0000-0000-0000-000000000001'::uuid, 'admin', TRUE, TRUE, TRUE, TRUE, TRUE),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'b0000000-0000-0000-0000-000000000002'::uuid, 'board_member', TRUE, TRUE, TRUE, FALSE, TRUE),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'b0000000-0000-0000-0000-000000000003'::uuid, 'board_member', FALSE, FALSE, TRUE, FALSE, TRUE),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'b0000000-0000-0000-0000-000000000004'::uuid, 'board_member', FALSE, FALSE, TRUE, FALSE, TRUE),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'b0000000-0000-0000-0000-000000000005'::uuid, 'admin', TRUE, TRUE, TRUE, TRUE, TRUE),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'b0000000-0000-0000-0000-000000000006'::uuid, 'board_member', FALSE, FALSE, TRUE, FALSE, TRUE),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'b0000000-0000-0000-0000-000000000007'::uuid, 'elder', TRUE, FALSE, TRUE, FALSE, TRUE),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'b0000000-0000-0000-0000-000000000008'::uuid, 'board_member', FALSE, FALSE, TRUE, FALSE, TRUE),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'b0000000-0000-0000-0000-000000000009'::uuid, 'manager', TRUE, TRUE, TRUE, FALSE, TRUE),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'b0000000-0000-0000-0000-000000000010'::uuid, 'staff', FALSE, FALSE, FALSE, FALSE, TRUE);

-- ============================================================================
-- STEP 5: Create 2023-24 Annual Report Record
-- ============================================================================

INSERT INTO annual_reports (
  id,
  organization_id,
  report_year,
  reporting_period_start,
  reporting_period_end,
  title,
  subtitle,
  theme,
  status,
  template_name,
  acknowledgement_of_country,
  executive_summary,
  leadership_message,
  leadership_message_author,
  year_highlights,
  looking_forward,
  statistics,
  published_date,
  created_at,
  metadata
) VALUES (
  'd0000000-0000-0000-0000-000000002024'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  2024,
  '2023-07-01',
  '2024-06-30',
  'Palm Island Community Company Annual Report 2023-2024',
  'Our Community, Our Future, Our Way',
  'Growth, Community Control, and Delegated Authority',
  'published',
  'traditional',
  'The Palm Island Community Company acknowledges the Traditional Owners of Palm Island, the Manbarra people. We also acknowledge the many First Nations persons who were forcibly removed to Palm Island, and we recognise these persons and their descendants as the historical Bwgcolman people. We recognise the continued connection of the Manbarra and Bwgcolman peoples to the land and waters of this beautiful island. We pay respect to Manbarra and Bwgcolman Elders, their ancestors, all First Nations peoples, and our ancestors who walk in the Dreamtime.',
  'The pace at which PICC has been evolving is nothing short of remarkable. Our expanded investment in services has significantly strengthened and enhanced them, making them more robust and effective than ever before. We now employ three times the number of people compared to ten years ago and our turnover has quadrupled. This substantial growth is directly benefiting Palm Islanders, either through the services we provide or the jobs we offer.',
  'In 2018/19 I wrote, "Now that our first decade is behind us, watch this space for what we will achieve in our second." With PICC more than halfway through our second decade now, our achievements are growing almost by the day. The pace at which PICC has been evolving is nothing short of remarkable. Our expanded investment in services has significantly strengthened and enhanced them, making them more robust and effective than ever before.

We now employ three times the number of people compared to ten years ago and our turnover has quadrupled. This substantial growth is directly benefiting Palm Islanders, either through the services we provide or the jobs we offer.

One of the changes I am most excited and proud about is the delegated authority, which represents a significant and positive shift for children in care on Palm Island. At last, the community will decide the care arrangements for children who cannot stay at home, a change for which I have been fighting for decades.

The number of staff and trainees we employ has increased by a third since last year, with nearly two hundred people now working for PICC. Impressively, three-quarters of our workforce are Palm Islanders. These figures are extraordinarily high compared to other services in remote communities, highlighting our commitment to local employment and development.

Despite our progress, I am acutely aware that we still have a long way to go. Palm Island continues to lag behind mainland communities in many areas of wellbeing. In our efforts to address these disparities, I still encounter racist barriers to change. However, PICC is here to stay and to fight for Palm Islanders to have the services they deserve. Everything we do is for, with, and because of the people of this beautiful community.

- Rachel Atkinson, CEO',
  'b0000000-0000-0000-0000-000000000001'::uuid,
  ARRAY[
    'Staff increased by 30% from 151 to 197 employees',
    'Digital Service Centre employs 21 full-time workers serving Telstra customers nationally',
    'Delegated Authority (Bwgcolman Way) brings community control to child protection decisions',
    'Women''s Healing Service restructured with three new programs',
    'RACGP accreditation renewed for Bwgcolman Healing Service',
    'Human Services Quality Framework interim audit passed with flying colours',
    'Presented twice at the national SNAICC Conference in Darwin',
    '200 Jobs Program supporting 15 community job seekers',
    'Blue Card Liaison Officer position created',
    'Over 80% Aboriginal/Torres Strait Islander staff maintained'
  ],
  'Continue to grow footprint and improve capacity to serve the community. Support Digital Service Centre staff and develop local leadership within the team. Expand First Nations digital service centre operations. Establish permanently funded Digital Service Centre after January 2025 pilot phase. Implement Bwgcolman Way delegated authority service. Launch in-home nursing services for Elders in 2025.',
  '{
    "staff": {
      "total_2024": 197,
      "total_2023": 151,
      "total_2022": 152,
      "growth_rate": "30%",
      "aboriginal_tsi_percentage": "80%+",
      "palm_island_residents_percentage": "70%+",
      "social_enterprises_staff": 44
    },
    "financial": {
      "income": 23400335,
      "total_expenditure": 23678058,
      "net_result": -277723,
      "labour_costs": 14282962,
      "labour_percentage": 60,
      "admin_expenses": 5000820,
      "admin_percentage": 21,
      "property_energy": 1058084,
      "property_percentage": 4,
      "motor_vehicle": 401112,
      "motor_percentage": 2,
      "travel_training": 1778367,
      "travel_percentage": 8,
      "client_costs": 1156713,
      "client_percentage": 5
    },
    "balance_sheet": {
      "current_assets": 8156480,
      "non_current_assets": 2702284,
      "total_assets": 10858764,
      "current_liabilities": 5969264,
      "non_current_liabilities": 1351259,
      "total_liabilities": 7320523,
      "net_assets": 3538241,
      "total_equity": 3538241
    },
    "health_service": {
      "total_clients": 2283,
      "aboriginal_tsi_clients": 1935,
      "non_aboriginal_clients": 108,
      "unknown_clients": 30,
      "episodes_of_care": 17488,
      "aboriginal_tsi_episodes": 16675,
      "non_aboriginal_episodes": 627,
      "unknown_episodes": 186,
      "health_checks_715": 779,
      "child_health_checks": 128,
      "team_care_arrangements": 308,
      "gp_management_plans": 293
    },
    "services": {
      "total_services": 16,
      "digital_centre_staff": 21,
      "digital_centre_capacity": 30
    },
    "service_metrics": {
      "family_care_placement_nights": 6698,
      "safe_house_placement_nights": 1439,
      "safe_haven_children_supported": 1187,
      "early_childhood_children_q1_q2": 711
    }
  }'::jsonb,
  '2024-10-01',
  NOW(),
  '{
    "pdf_source": "picc-2023-24-annual-report.pdf",
    "board_members": [
      {"name": "Luella Bligh", "role": "Chair"},
      {"name": "Rhonda Phillips", "role": "Director"},
      {"name": "Allan Palm Island", "role": "Director"},
      {"name": "Matthew Lindsay", "role": "Company Secretary"},
      {"name": "Harriet Hulthen", "role": "Director"},
      {"name": "Raymond W. Palmer Snr", "role": "Director"},
      {"name": "Cassie Lang", "role": "Director"}
    ],
    "key_programs": {
      "delegated_authority": {
        "name": "Bwgcolman Way: Empowered and Resilient",
        "vision": "All Manbarra and Bwgcolman children are safe and cared for by family, nurtured by strong and enduring connections to their community, culture and Country",
        "legislative_reference": "Child Protection Act 1999 (Qld) Sections 148BA and 148BB(3)"
      },
      "digital_service_centre": {
        "partners": ["Telstra", "Advance Queensland", "Deadly Innovation Strategy", "State of Queensland Digital Economy Strategy"],
        "training": "12-week TAFE + 5-week Telstra + Cert III Business",
        "languages_supported": 50
      }
    },
    "accreditations": [
      "Human Services Quality Framework (interim audit Nov 2023, full audit 2025)",
      "RACGP Quality Practice Accreditation (renewed 2024, next 2027)"
    ],
    "conferences": [
      {
        "name": "SNAICC Conference",
        "year": 2023,
        "location": "Darwin",
        "presentations": [
          "The Storyline of the Palm Island Children and Family Centre",
          "Proud Bwgcolman Youth"
        ]
      }
    ]
  }'::jsonb
)
ON CONFLICT (organization_id, report_year) DO UPDATE SET
  title = EXCLUDED.title,
  executive_summary = EXCLUDED.executive_summary,
  leadership_message = EXCLUDED.leadership_message,
  year_highlights = EXCLUDED.year_highlights,
  statistics = EXCLUDED.statistics,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- ============================================================================
-- STEP 6: Create Report Sections
-- ============================================================================

-- Clear existing sections for this report
DELETE FROM report_sections WHERE report_id = 'd0000000-0000-0000-0000-000000002024'::uuid;

INSERT INTO report_sections (report_id, section_type, section_title, section_content, display_order, layout_style)
VALUES
(
  'd0000000-0000-0000-0000-000000002024'::uuid,
  'leadership_message',
  'Message from the CEO',
  'In 2018/19 I wrote, "Now that our first decade is behind us, watch this space for what we will achieve in our second." With PICC more than halfway through our second decade now, our achievements are growing almost by the day.

The pace at which PICC has been evolving is nothing short of remarkable. Our expanded investment in services has significantly strengthened and enhanced them, making them more robust and effective than ever before.

We now employ three times the number of people compared to ten years ago and our turnover has quadrupled. This substantial growth is directly benefiting Palm Islanders, either through the services we provide or the jobs we offer.

One of the changes I am most excited and proud about is the delegated authority, which represents a significant and positive shift for children in care on Palm Island. At last, the community will decide the care arrangements for children who cannot stay at home, a change for which I have been fighting for decades.

The number of staff and trainees we employ has increased by a third since last year, with nearly two hundred people now working for PICC. Impressively, three-quarters of our workforce are Palm Islanders.

One small but significant example of our impact in the community is that among our recent graduating cohort of trainees in Community Services, all of them express their desire to work for "the Company". This is hugely encouraging to hear, and this sentiment is a testament to how valued and effective PICC is perceived within the community.

Despite our progress, I am acutely aware that we still have a long way to go. Palm Island continues to lag behind mainland communities in many areas of wellbeing. However, PICC is here to stay and to fight for Palm Islanders to have the services they deserve. Everything we do is for, with, and because of the people of this beautiful community.

— Rachel Atkinson',
  1,
  'standard'
),
(
  'd0000000-0000-0000-0000-000000002024'::uuid,
  'leadership_message',
  'Message from the Chair',
  'In my fifth year as Chair of the Board, my commitment to ensuring that PICC remains the exemplary service provider that Palm Island deserves has only grown stronger.

PICC plays a crucial role in our community, offering essential services that impact the lives of many. I am deeply conscious of the responsibility I hold to the people of Palm Island, ensuring that our company is not only well-managed and sustainable but also progressing in the right direction.

The positive changes we strive for are becoming evident within the community. This is particularly noticeable among our young people, who are beginning to feel a sense of optimism about the future of Palm Island. Their hope and enthusiasm are a testament to the progress we are making.

I am immensely grateful for the unwavering support of my fellow Board members. Their dedication and collaborative efforts have been instrumental in guiding PICC towards achieving our shared goals. Together, we are steering PICC towards a brighter future for Palm Island.

— Luella Bligh, Chair',
  2,
  'standard'
),
(
  'd0000000-0000-0000-0000-000000002024'::uuid,
  'corporate_governance',
  'Corporate Governance',
  'Key Achievements:
• PICC continues to have an average of over 80 per cent of its staff members identifying as Aboriginal, Torres Strait Islander or both
• The proportion of staff members living on Palm Island is still above 70 per cent
• The Palm Island Holding Company Ltd was officially wound up
• In November 2023, PICC passed a Human Services Quality Framework interim audit with flying colours

Staff Numbers:
• 30 June 2024: 197 staff members
• 30 June 2023: 151 staff members
• 30 June 2022: 152 staff members

Board Members:
• Luella Bligh, Chair
• Rhonda Phillips, Director
• Allan Palm Island, Director
• Matthew Lindsay, Company Secretary
• Harriet Hulthen, Director
• Raymond W. Palmer Snr, Director
• Cassie Lang, Director',
  3,
  'two_column'
),
(
  'd0000000-0000-0000-0000-000000002024'::uuid,
  'service_highlight',
  'Palm Islanders take calls from across Australia',
  'Opened in 2023, the Palm Island Digital Service Centre has been a great success for PICC and the community of Palm Island.

The Centre provides sales and customer service for Telstra landline, mobile and Internet products and services for Aboriginal and Torres Strait Islander customers. The Centre can also connect callers with interpreters for about fifty First Nations languages.

The Centre employed twenty-one full-time workers at the end of 2023/24, with a capacity of thirty full-time equivalent workers. It is located in the new Retail Centre on Main Street.

Training for workers begins with an intensive twelve-week course at the Palm Island TAFE, followed by a five-week introduction to call centre and customer service work from Telstra. All workers then move on to studying for a Certificate III in Business whilst they work.

The centre is an excellent employment opportunity for people on Palm Island as it is a new industry and has the potential to create another exciting career pathway. The Palm Island Centre is the second of its kind in Australia, the first having opened in Cherbourg in 2022.',
  4,
  'image_focus'
),
(
  'd0000000-0000-0000-0000-000000002024'::uuid,
  'service_highlight',
  'New Bwgcolman Way Service brings Delegated Authority',
  'A major change to caring arrangements for vulnerable children is at last coming to Palm Island: delegated authority.

PICC has chosen to name the delegated authority approach Bwgcolman Way: Empowered and Resilient. "Bwgcolman" meaning "many tribes, one people".

The vision for Bwgcolman Way is that all Manbarra and Bwgcolman children are safe and cared for by family, nurtured by strong and enduring connections to their community, culture and Country. Palm Island mob leading and creating change for Palm Island children, young people and families.

PICC and the PICC CEO meet the legislative requirements of prescribed delegates for Aboriginal and Torres Strait Islander children, as outlined in Sections 148BA and 148BB(3) of the Child Protection Act 1999 (Qld). For Palm Island, there is only one person whom the Director-General has delegated the authority to make decisions concerning children in care: the Chief Executive Officer of PICC.

Bwgcolman Way will focus on family and cultural connection where the CEO of PICC will collaboratively make decisions under the Child Protection Act with children and families in partnership with Child Safety Services.

This goal is also key to achieving target 12 of the National Agreement on Closing the Gap – namely, to reduce the disproportionate rate of Aboriginal and Torres Strait Islander children in out-of-home care by 45 per cent by 2030.',
  5,
  'standard'
),
(
  'd0000000-0000-0000-0000-000000002024'::uuid,
  'service_highlight',
  'The Women''s Healing Service is Giving Better Help',
  'PICC has remodelled its Women''s Healing Service to provide better services to women resident, or at risk of being resident, in the Townsville Women''s Correctional Centre.

In 2023, funding ended for the women''s healing pilot programs in prison across Queensland. PICC negotiated for a new contract in view of the learnings from the previous pilot iteration.

Now, for 2024, PICC has restructured the Women''s Healing Service to strengthen its critical goal of preventing women from entering prison, and to give better assistance to women before and after their stays at the Townsville Women''s Correctional Centre.

The Service now operates three regular programs:
• Re-entry Program - for women soon to leave custody
• Women on Remand Program - for women in custody awaiting trial
• Early Intervention Program - for women at risk of entering prison (Palm Island)

The Service now has an office in Aitkenvale, Townsville, collocated with the PICC NDIS team. The restructured Women''s Healing Service is funded by the Department of Justice and the Attorney-General.',
  6,
  'standard'
),
(
  'd0000000-0000-0000-0000-000000002024'::uuid,
  'health_services',
  'Primary Health Services (Bwgcolman Healing Service)',
  'Key Achievements:
• PICC officially changed the name to Bwgcolman Healing Service after extensive community consultation
• Passed RACGP Quality Practice Accreditation assessment with special mention for outstanding cleanliness, high standards of documentation, and excellent professional standards
• Next full accreditation assessment in 2027

Specialized Services Available:
• Integrated Team Care (ITC) - chronic condition equipment access
• Communicable Infections Program - treatment access and contact tracing
• ARF/RHD Program - tailored support for ARF/RHD patients
• Eldercare Connector Program - My Aged Care registration and homecare packages
• Growing Deadly Families (GDF) - women and children healthcare access
• GP After Hours - Monday to Thursday 5pm to 9pm

2023/24 Statistics:
• Total clients seen: 2,283
• Aboriginal/Torres Strait Islander clients: 1,935
• Episodes of care: 17,488
• 715 Health Checks: 779
• Child Health Checks: 128
• Team Care Arrangements: 308
• GP Management Plans: 293',
  7,
  'data_focus'
),
(
  'd0000000-0000-0000-0000-000000002024'::uuid,
  'financial_summary',
  'Summary Financial Report - 30 June 2024',
  'Income and Expenditure Statement:
• INCOME: $23,400,335
• Total Labour Costs: $14,282,962 (60%)
• Administration Expenses: $5,000,820 (21%)
• Property & Energy Expenses: $1,058,084 (4%)
• Motor Vehicle Expenses: $401,112 (2%)
• Travel & Training Expenses: $1,778,367 (8%)
• Client Related Costs: $1,156,713 (5%)
• Total Expenditure: $23,678,058
• NET SURPLUS (DEFICIT): -$277,723

Balance Sheet:
• Current Assets: $8,156,480
• Non Current Assets: $2,702,284
• TOTAL Assets: $10,858,764
• Current Liabilities: $5,969,264
• Non Current Liabilities: $1,351,259
• TOTAL Liabilities: $7,320,523
• NET ASSETS: $3,538,241
• TOTAL Equity: $3,538,241

Prior Year Comparison (2023):
• Income: $20,103,686
• Expenditure: $19,388,354
• Net Surplus: $715,332',
  8,
  'data_focus'
);

-- ============================================================================
-- STEP 7: Create Sample Stories Based on Annual Report Content
-- ============================================================================

-- Create stories that represent key achievements from the annual report
INSERT INTO stories (
  id, storyteller_id, title, content, story_type, category,
  organization_id, service_id, status, access_level, is_featured, is_verified,
  story_date, tags, created_at
) VALUES
-- Digital Service Centre Success Story
(
  'e0000000-0000-0000-0000-000000000001'::uuid,
  'b0000000-0000-0000-0000-000000000001'::uuid,
  'Palm Island Digital Service Centre: A New Industry for Our Community',
  'The Palm Island Digital Service Centre opened in 2023, marking a significant milestone for our community. This centre provides sales and customer service for Telstra products to Aboriginal and Torres Strait Islander customers across Australia, with interpreters available for about fifty First Nations languages.

Twenty-one Palm Islanders now work at the centre, with capacity for thirty staff. Workers complete intensive training at TAFE and Telstra before taking calls, and continue studying for a Certificate III in Business while working.

There is a great sense of pride in the people working at the digital service centre which has extended across the broader community. This is a new industry for Palm Island with the potential to create exciting career pathways.

The centre is the second of its kind in Australia after Cherbourg, representing pioneering efforts in local employment and training in information technology in remote communities.',
  'service_success',
  'economic_development',
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'c0000000-0000-0000-0000-000000000003'::uuid,
  'published',
  'public',
  TRUE,
  TRUE,
  '2024-06-30',
  ARRAY['digital', 'employment', 'training', 'Telstra', 'innovation'],
  '2024-07-01'
),
-- Bwgcolman Way Story
(
  'e0000000-0000-0000-0000-000000000002'::uuid,
  'b0000000-0000-0000-0000-000000000009'::uuid,
  'Bwgcolman Way: Community Control for Our Children',
  'A major change to caring arrangements for vulnerable children is at last coming to Palm Island through delegated authority.

PICC has named this approach Bwgcolman Way: Empowered and Resilient. "Bwgcolman" means "many tribes, one people."

Our vision is that all Manbarra and Bwgcolman children are safe and cared for by family, nurtured by strong and enduring connections to their community, culture and Country. Palm Island mob leading and creating change for Palm Island children, young people and families.

This change has been decades in the making. At last, the community will decide the care arrangements for children who cannot stay at home. We are empowered by our grandparents, the struggles and hardships they faced, and we continue to be resilient because we''re still here, fighting for a better future for our kids.

Bwgcolman Way provides opportunity for Elders, traditional owner groups and community to have genuine participation in the implementation and development of service delivery, ensuring it is strongly place based and community led.',
  'community_story',
  'family',
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'c0000000-0000-0000-0000-000000000006'::uuid,
  'published',
  'public',
  TRUE,
  TRUE,
  '2024-06-30',
  ARRAY['delegated authority', 'child protection', 'community control', 'Bwgcolman Way', 'family'],
  '2024-07-01'
),
-- Health Service Story
(
  'e0000000-0000-0000-0000-000000000003'::uuid,
  'b0000000-0000-0000-0000-000000000001'::uuid,
  'Bwgcolman Healing Service: A Name That Reflects Our Community',
  'In early 2024, PICC officially changed the name of the Primary Health Centre to the Bwgcolman Healing Service, with new signage installed. This name change occurred after extensive consultation with the Palm Island community and the Elders'' Advisory Group.

The Bwgcolman Healing Service passed the Quality Practice Accreditation assessment by the Royal Australian College of General Practitioners. The assessors made special mention of the outstanding cleanliness of the clinic, the high standards of documentation and record-keeping, and the excellent professional standards and friendliness of staff.

In 2023/24, the service saw 2,283 clients with 17,488 episodes of care. The medical team encourages all Palm Islanders to have an Annual 715 Health Check to help improve and maintain the health of all people on Palm Island.

The service provides comprehensive healthcare including specialist and allied health services, Growing Deadly Families program, and GP After Hours Monday to Thursday from 5pm to 9pm.',
  'service_success',
  'health',
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'c0000000-0000-0000-0000-000000000001'::uuid,
  'published',
  'public',
  TRUE,
  TRUE,
  '2024-06-30',
  ARRAY['health', 'Bwgcolman Healing', 'RACGP', 'community health', 'primary care'],
  '2024-07-01'
),
-- Staff Growth Story
(
  'e0000000-0000-0000-0000-000000000004'::uuid,
  'b0000000-0000-0000-0000-000000000001'::uuid,
  'Nearly 200 Strong: PICC''s Workforce Growth',
  'The number of staff and trainees we employ has increased by a third since last year, with nearly two hundred people now working for PICC. We now employ 197 staff members, up from 151 the previous year.

Impressively, three-quarters of our workforce are Palm Islanders. These figures are extraordinarily high compared to other services in remote communities, highlighting our commitment to local employment and development.

We now employ three times the number of people compared to ten years ago and our turnover has quadrupled. This substantial growth is directly benefiting Palm Islanders, either through the services we provide or the jobs we offer.

One small but significant example of our impact in the community is that among our recent graduating cohort of trainees in Community Services, all of them express their desire to work for "the Company". This is hugely encouraging to hear, and this sentiment is a testament to how valued and effective PICC is perceived within the community.

Social Enterprises alone had 44 staff members at 30 June 2024 - almost one-quarter of all PICC staff.',
  'achievement',
  'economic_development',
  'a0000000-0000-0000-0000-000000000001'::uuid,
  NULL,
  'published',
  'public',
  TRUE,
  TRUE,
  '2024-06-30',
  ARRAY['employment', 'workforce', 'local jobs', 'growth', 'training'],
  '2024-07-01'
),
-- Women's Healing Service Story
(
  'e0000000-0000-0000-0000-000000000005'::uuid,
  'b0000000-0000-0000-0000-000000000001'::uuid,
  'Women''s Healing Service: Restructured for Better Support',
  'PICC has remodelled its Women''s Healing Service to provide better services to women resident, or at risk of being resident, in the Townsville Women''s Correctional Centre.

For 2024, PICC has restructured the Service to strengthen its critical goal of preventing women from entering prison, and to give better assistance to women before and after their stays in custody.

The Service now operates three regular programs:
- The Re-entry Program, for women soon to leave custody
- The Women on Remand Program, for women in custody awaiting trial
- The Early Intervention Program, for women at risk of entering prison (on Palm Island)

The Service now has an office in Aitkenvale, Townsville, as a service centre for clients in the community, conveniently close to other services with which the Women''s Healing Service collaborates. This office is collocated with the PICC NDIS team.

The restructured Women''s Healing Service is funded by the Department of Justice and the Attorney-General.',
  'service_success',
  'family',
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'c0000000-0000-0000-0000-000000000014'::uuid,
  'published',
  'public',
  FALSE,
  TRUE,
  '2024-06-30',
  ARRAY['women', 'healing', 'justice', 'support', 'prison'],
  '2024-07-01'
),
-- SNAICC Conference Story
(
  'e0000000-0000-0000-0000-000000000006'::uuid,
  'b0000000-0000-0000-0000-000000000009'::uuid,
  'PICC Shares Our Story at National Conference',
  'In September 2023, PICC presented twice at the biennial SNAICC Conference, which was held in Darwin.

"The Storyline of the Palm Island Children and Family Centre" told the history and the successes of the CFC and early childhood services on Palm Island.

"Proud Bwgcolman Youth", presented by Jeanie Sam and Dee Ann Sailor, told "a hopeful narrative about our young people" and proposed "an alternative approach to tackling the complex issues driving the over-representation of Aboriginal and Torres Strait Islander children in the youth justice system".

Both sessions were very well attended, helping to spread the news nationally about the effective and innovative work that PICC does.

PICC staff members also attended other sessions at the Conference, as well as other conferences and events throughout the year, so as to learn from other companies like ours and to bring the most modern knowledge and best practices to Palm Island.',
  'achievement',
  'culture',
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'c0000000-0000-0000-0000-000000000005'::uuid,
  'published',
  'public',
  FALSE,
  TRUE,
  '2023-09-15',
  ARRAY['SNAICC', 'conference', 'youth', 'early childhood', 'national'],
  '2024-07-01'
),
-- Safe Haven Story
(
  'e0000000-0000-0000-0000-000000000007'::uuid,
  'b0000000-0000-0000-0000-000000000009'::uuid,
  'Safe Haven: Supporting Our Young People',
  'The Safe Haven continues to be a vital service for Palm Island, providing safe accommodation and support for children and young people who need a safe place to stay.

In 2023/24, the Safe Haven supported:
- Q1: 355 children and young people
- Q2: 299 children and young people
- Q3: 255 children and young people
- Q4: 278 children and young people

This represents over 1,187 instances of support throughout the year.

The Safe Haven is part of PICC''s comprehensive network of child protection related services and programs, working alongside the Family Wellbeing Service, the Family Participation Program, Family Care Services, and the Safe House.

Together, these services ensure that vulnerable children and young people on Palm Island have access to safe, culturally appropriate support when they need it most.',
  'service_success',
  'youth',
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'c0000000-0000-0000-0000-000000000010'::uuid,
  'published',
  'public',
  FALSE,
  TRUE,
  '2024-06-30',
  ARRAY['Safe Haven', 'youth', 'children', 'support', 'safety'],
  '2024-07-01'
);

-- ============================================================================
-- STEP 8: Link Stories to Annual Report
-- ============================================================================

INSERT INTO annual_report_stories (report_id, story_id, inclusion_reason, section_placement, display_order, is_featured)
VALUES
  ('d0000000-0000-0000-0000-000000002024'::uuid, 'e0000000-0000-0000-0000-000000000001'::uuid, 'featured', 'service_highlights', 1, TRUE),
  ('d0000000-0000-0000-0000-000000002024'::uuid, 'e0000000-0000-0000-0000-000000000002'::uuid, 'featured', 'community_stories', 2, TRUE),
  ('d0000000-0000-0000-0000-000000002024'::uuid, 'e0000000-0000-0000-0000-000000000003'::uuid, 'featured', 'service_highlights', 3, TRUE),
  ('d0000000-0000-0000-0000-000000002024'::uuid, 'e0000000-0000-0000-0000-000000000004'::uuid, 'featured', 'year_overview', 4, TRUE),
  ('d0000000-0000-0000-0000-000000002024'::uuid, 'e0000000-0000-0000-0000-000000000005'::uuid, 'service_success', 'service_highlights', 5, FALSE),
  ('d0000000-0000-0000-0000-000000002024'::uuid, 'e0000000-0000-0000-0000-000000000006'::uuid, 'achievement', 'community_stories', 6, FALSE),
  ('d0000000-0000-0000-0000-000000002024'::uuid, 'e0000000-0000-0000-0000-000000000007'::uuid, 'service_success', 'service_highlights', 7, FALSE)
ON CONFLICT (report_id, story_id) DO NOTHING;

-- ============================================================================
-- STEP 9: Create Impact Indicators from Annual Report Data
-- ============================================================================

INSERT INTO impact_indicators (
  story_id, service_area, indicator_type, indicator_name, indicator_description,
  measurement_type, value_numeric, value_text, measurement_date, measurement_period_start, measurement_period_end
) VALUES
-- Staff Growth Indicators
(
  'e0000000-0000-0000-0000-000000000004'::uuid,
  'corporate',
  'economic_benefit',
  'Total Staff Count',
  'Number of PICC staff members as at 30 June 2024',
  'quantitative',
  197,
  '197 staff members (up from 151 in 2023)',
  '2024-06-30',
  '2023-07-01',
  '2024-06-30'
),
(
  'e0000000-0000-0000-0000-000000000004'::uuid,
  'corporate',
  'economic_benefit',
  'Aboriginal/TSI Staff Percentage',
  'Percentage of staff identifying as Aboriginal or Torres Strait Islander',
  'quantitative',
  80,
  'Over 80% of staff identify as Aboriginal or Torres Strait Islander',
  '2024-06-30',
  '2023-07-01',
  '2024-06-30'
),
(
  'e0000000-0000-0000-0000-000000000004'::uuid,
  'corporate',
  'economic_benefit',
  'Palm Island Residents Staff',
  'Percentage of staff living on Palm Island',
  'quantitative',
  70,
  'Over 70% of staff live on Palm Island',
  '2024-06-30',
  '2023-07-01',
  '2024-06-30'
),
-- Health Service Indicators
(
  'e0000000-0000-0000-0000-000000000003'::uuid,
  'health',
  'health_outcome',
  'Total Health Clients',
  'Number of unique clients seen at Bwgcolman Healing Service',
  'quantitative',
  2283,
  '2,283 clients (up from 2,050 in 2022/23)',
  '2024-06-30',
  '2023-07-01',
  '2024-06-30'
),
(
  'e0000000-0000-0000-0000-000000000003'::uuid,
  'health',
  'health_outcome',
  'Episodes of Care',
  'Total number of episodes of care delivered',
  'quantitative',
  17488,
  '17,488 episodes of care',
  '2024-06-30',
  '2023-07-01',
  '2024-06-30'
),
(
  'e0000000-0000-0000-0000-000000000003'::uuid,
  'health',
  'health_outcome',
  '715 Health Checks',
  'Aboriginal and Torres Strait Islander health assessments completed',
  'quantitative',
  779,
  '779 health checks (up from 610 in 2022/23)',
  '2024-06-30',
  '2023-07-01',
  '2024-06-30'
),
-- Digital Service Centre Indicators
(
  'e0000000-0000-0000-0000-000000000001'::uuid,
  'digital_services',
  'economic_benefit',
  'Digital Centre Staff',
  'Number of full-time workers at Digital Service Centre',
  'quantitative',
  21,
  '21 full-time workers (capacity for 30)',
  '2024-06-30',
  '2023-07-01',
  '2024-06-30'
),
-- Safe Haven Indicators
(
  'e0000000-0000-0000-0000-000000000007'::uuid,
  'youth',
  'community_connection',
  'Children Supported - Safe Haven',
  'Total children and young people supported by Safe Haven',
  'quantitative',
  1187,
  '1,187 instances of support across the year',
  '2024-06-30',
  '2023-07-01',
  '2024-06-30'
),
-- Family Care Indicators
(
  NULL,
  'family',
  'service_access',
  'Family Care Placement Nights',
  'Total placement nights provided by Family Care Service',
  'quantitative',
  6698,
  '6,698 placement nights (up from 5,656 in 2022/23)',
  '2024-06-30',
  '2023-07-01',
  '2024-06-30'
),
-- Financial Indicator
(
  NULL,
  'corporate',
  'economic_benefit',
  'Annual Income',
  'Total PICC income for 2023/24 financial year',
  'quantitative',
  23400335,
  '$23,400,335 (up from $20,103,686 in 2022/23)',
  '2024-06-30',
  '2023-07-01',
  '2024-06-30'
);

-- ============================================================================
-- STEP 10: Add Additional Community Member Profiles for Impact Dashboard
-- ============================================================================

-- Add some additional community member profiles to populate the dashboard
INSERT INTO profiles (id, full_name, storyteller_type, location, profile_visibility, primary_organization_id, is_elder, created_at)
SELECT
  uuid_generate_v4(),
  'Community Member ' || n,
  CASE
    WHEN n % 5 = 0 THEN 'elder'
    WHEN n % 4 = 0 THEN 'youth'
    WHEN n % 3 = 0 THEN 'service_provider'
    ELSE 'community_member'
  END,
  'Palm Island',
  'community',
  'a0000000-0000-0000-0000-000000000001'::uuid,
  n % 5 = 0,
  NOW() - (random() * 365 || ' days')::interval
FROM generate_series(1, 50) n
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify organization
DO $$
DECLARE
  org_count INTEGER;
  service_count INTEGER;
  profile_count INTEGER;
  story_count INTEGER;
  report_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO org_count FROM organizations WHERE short_name = 'PICC';
  SELECT COUNT(*) INTO service_count FROM organization_services WHERE organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid;
  SELECT COUNT(*) INTO profile_count FROM profiles WHERE primary_organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid;
  SELECT COUNT(*) INTO story_count FROM stories WHERE organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid;
  SELECT COUNT(*) INTO report_count FROM annual_reports WHERE organization_id = 'a0000000-0000-0000-0000-000000000001'::uuid;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'PICC 2023-24 Annual Report Data Loaded';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Organizations: %', org_count;
  RAISE NOTICE 'Services: %', service_count;
  RAISE NOTICE 'Profiles: %', profile_count;
  RAISE NOTICE 'Stories: %', story_count;
  RAISE NOTICE 'Annual Reports: %', report_count;
  RAISE NOTICE '========================================';
END $$;

-- Success message
SELECT 'PICC 2023-24 Annual Report data successfully populated!' AS status;
