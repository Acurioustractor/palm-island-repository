-- ============================================================================
-- PICC INNOVATION PROJECTS - Create missing project records
-- Creates The Station, Elders Trips, On-Country Server, Annual Reports
-- ============================================================================

DO $$
DECLARE
  picc_tenant_id UUID := '9c4e5de2-d80a-4e0b-8a89-1bbf09485532';
  picc_org_id UUID := '3c2011b9-f80d-4289-b300-0cd383cff479';
  admin_profile_id UUID;
BEGIN

  -- Get admin profile ID (create if doesn't exist)
  SELECT id INTO admin_profile_id FROM profiles WHERE email = 'admin@picc.org' LIMIT 1;

  IF admin_profile_id IS NULL THEN
    INSERT INTO profiles (
      full_name, email, storyteller_type
    ) VALUES (
      'PICC Admin', 'admin@picc.org', 'service_provider'
    ) RETURNING id INTO admin_profile_id;
  END IF;

  -- ============================================================================
  -- PROJECT 1: The Station - Community Hub & Learning Center
  -- ============================================================================

  INSERT INTO projects (
    slug,
    name,
    tagline,
    description,
    status,
    project_type,
    start_date,
    impact_areas,
    is_public,
    featured,
    project_lead,
    created_by
  ) VALUES (
    'the-station',
    'The Station',
    'Community hub connecting culture, learning, and innovation',
    'The Station is Palm Island''s community innovation hub - a physical and digital space where traditional knowledge meets modern technology. It serves as a learning center, cultural gathering place, and innovation lab for the community.

Key Features:
• Community Learning Space - Workshops, training, and skill-building
• Cultural Programs - Elder-led language and cultural sessions
• Technology Access - Computers, internet, and digital skills training
• Meeting Spaces - Community consultations and gatherings
• Innovation Lab - Prototyping and testing new ideas
• Youth Hub - Safe space for young people to learn and create

The Station operates on the principle that innovation happens at the intersection of tradition and technology. It''s designed and run by community members, ensuring cultural safety and community ownership.',
    'in_progress',
    'infrastructure',
    '2023-06-01',
    ARRAY['education', 'culture', 'employment', 'innovation'],
    true,
    true,
    admin_profile_id,
    admin_profile_id
  ) ON CONFLICT (slug) DO NOTHING;

  -- ============================================================================
  -- PROJECT 2: Elders Trips - Cultural Connection & Knowledge Sharing
  -- ============================================================================

  INSERT INTO projects (
    slug,
    name,
    tagline,
    description,
    status,
    project_type,
    start_date,
    impact_areas,
    is_public,
    featured,
    project_lead,
    created_by
  ) VALUES (
    'elders-trips',
    'Elders Trips',
    'Connecting Elders with Country and sharing cultural knowledge',
    'The Elders Trips program takes Palm Island Elders on cultural connection trips to traditional Country, enabling knowledge transfer and cultural strengthening across generations.

Program Objectives:
• Cultural Connection - Reconnect Elders with traditional sites and Country
• Knowledge Transfer - Record stories, language, and traditional knowledge
• Intergenerational Learning - Bring youth along to learn from Elders
• Health & Wellbeing - Improve Elder wellbeing through connection to Country
• Documentation - Photograph, record, and preserve cultural knowledge

Each trip is carefully planned with Elder guidance, ensuring cultural protocols are followed. We document the journeys through photos, video, and written stories, creating a permanent record of traditional knowledge.

Impact:
• Elders feel valued and respected for their knowledge
• Youth gain direct learning from knowledge holders
• Cultural knowledge is preserved for future generations
• Community strengthens through shared cultural experiences',
    'in_progress',
    'program',
    '2023-03-01',
    ARRAY['culture', 'health', 'education', 'elders'],
    true,
    true,
    admin_profile_id,
    admin_profile_id
  ) ON CONFLICT (slug) DO NOTHING;

  -- ============================================================================
  -- PROJECT 3: On-Country Server - Data Sovereignty Infrastructure
  -- ============================================================================

  INSERT INTO projects (
    slug,
    name,
    tagline,
    description,
    status,
    project_type,
    start_date,
    impact_areas,
    is_public,
    featured,
    project_lead,
    created_by
  ) VALUES (
    'on-country-server',
    'On-Country Server',
    'Community-controlled data storage and digital infrastructure',
    'The On-Country Server project establishes local, community-controlled data storage infrastructure on Palm Island, ensuring data sovereignty and cultural safety.

What It Is:
A physical server located on Palm Island that stores community data, cultural knowledge, and digital assets locally. This means sensitive information never leaves the island without community permission.

Why It Matters:
• Data Sovereignty - Community owns and controls their data
• Cultural Safety - Sensitive cultural knowledge stays on Country
• Resilience - Local access even when internet is down
• Privacy - No third-party companies accessing community data
• Speed - Faster access to local content

Technical Features:
• Secure local storage for photos, videos, stories
• Backup and redundancy systems
• Community access points throughout the island
• Integration with cloud storage for public content
• Encryption and access control for sensitive material

This project is about more than technology - it''s about self-determination and ensuring that Palm Island community data is controlled by the community, not by distant corporations or governments.',
    'planning',
    'infrastructure',
    '2024-01-01',
    ARRAY['data_sovereignty', 'infrastructure', 'innovation'],
    true,
    true,
    admin_profile_id,
    admin_profile_id
  ) ON CONFLICT (slug) DO NOTHING;

  -- ============================================================================
  -- PROJECT 4: Annual Reports - Automated Community Reporting
  -- ============================================================================

  INSERT INTO projects (
    slug,
    name,
    tagline,
    description,
    status,
    project_type,
    start_date,
    impact_areas,
    is_public,
    featured,
    project_lead,
    created_by
  ) VALUES (
    'annual-report',
    'Automated Annual Reports',
    'Generate funder reports from real community stories',
    'Traditional annual reports are written by consultants who don''t live the work. This project flips that model - we generate reports directly from stories shared by community members throughout the year.

How It Works:
1. Community shares stories throughout the year (the work that''s actually happening)
2. Stories are tagged by program area and impact type
3. At reporting time, we filter stories by funder requirements
4. AI helps format stories into report language
5. Staff review and finalize the report
6. Funders get authentic stories from the people doing the work

Benefits:
• Authentic Voice - Stories from community members, not consultants
• Continuous Documentation - Capture impact throughout the year, not just at deadline
• Reduced Burden - Less time writing reports, more time doing the work
• Better Data - Real stories show real impact
• Community Ownership - Community members see their stories valued

This approach respects that the best people to tell the story of community impact are community members themselves. It also saves thousands of dollars in consultant fees that can be redirected to actual programs.

Target Outputs:
• Annual reports for major funders (NIAA, philanthropy, government)
• Impact summaries for community
• Social media content throughout the year
• Evidence base for future funding applications',
    'in_progress',
    'system',
    '2023-09-01',
    ARRAY['innovation', 'governance'],
    true,
    false,
    admin_profile_id,
    admin_profile_id
  ) ON CONFLICT (slug) DO NOTHING;

  RAISE NOTICE '✅ Innovation projects created successfully';

END $$;

-- Verify projects created
SELECT
  name,
  slug,
  status,
  project_type,
  featured,
  is_public
FROM projects
WHERE slug IN ('the-station', 'elders-trips', 'on-country-server', 'annual-report', 'photo-studio')
ORDER BY name;
