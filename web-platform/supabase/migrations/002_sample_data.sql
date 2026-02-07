-- ============================================================================
-- PICC Annual Reports System - Sample Data
-- Run this AFTER 001_annual_reports_system.sql
-- ============================================================================

-- ============================================================================
-- SAMPLE ELDER QUOTES
-- ============================================================================

INSERT INTO elder_quotes (text, speaker_name, speaker_role, theme, category, is_validated, validation_date) VALUES
(
  'Our strength has always been in our community. When one of us struggles, we all come together. That''s the Palm Island way.',
  'Aunty Margaret',
  'Elder',
  'community',
  'culture',
  true,
  NOW()
),
(
  'Healing doesn''t happen overnight. It takes time, patience, and most importantly - it takes connection to culture and Country.',
  'Uncle James',
  'Elder',
  'healing',
  'health',
  true,
  NOW()
),
(
  'When we make decisions about our children, they need to be made by people who understand our families, our history, our culture.',
  'Aunty Joyce',
  'Elder / Community Leader',
  'family',
  'family',
  true,
  NOW()
),
(
  'The young ones are our future. Everything we do, every program we run, it''s for them. So they have opportunities we never had.',
  'Uncle Thomas',
  'Elder',
  'youth',
  'youth',
  true,
  NOW()
),
(
  'Language carries our stories, our law, our connection to this place. Without language, we lose a part of ourselves.',
  'Aunty Sarah',
  'Language Keeper / Elder',
  'language',
  'culture',
  true,
  NOW()
),
(
  'We survived because we stayed together. Hull River, the missions, all of it. Our ancestors'' strength lives in us.',
  'Uncle Robert',
  'Elder / Historian',
  'history',
  'culture',
  true,
  NOW()
),
(
  'True healing comes from the land. When our young people connect with Country, they find themselves.',
  'Aunty Patricia',
  'Elder / Traditional Healer',
  'country',
  'health',
  true,
  NOW()
);

-- ============================================================================
-- SAMPLE COMMUNITY FEEDBACK
-- ============================================================================

INSERT INTO community_feedback (
  feedback_text, category, is_anonymous, source, status, priority,
  picc_response, investment_amount, outcome_summary, related_program, fiscal_year
) VALUES
(
  'We need more activities for young people during school holidays',
  'youth',
  true,
  'meeting',
  'completed',
  'high',
  'PICC has launched the Youth Holiday Program with sports, cultural activities, and skills workshops running every school break.',
  45000,
  'School holiday program now running with 50+ youth participants each break. Activities include traditional fishing, art, sports, and TAFE preparation.',
  'youth-services',
  '2024-25'
),
(
  'The health clinic waiting times are too long',
  'health',
  true,
  'form',
  'in_progress',
  'high',
  'We are recruiting additional staff and implementing a new booking system to reduce wait times.',
  NULL,
  'New booking system being trialed. Additional nurse recruited and starting next month.',
  'health-services',
  '2024-25'
),
(
  'Can we have more cultural programs for kids to learn language?',
  'culture',
  false,
  'conversation',
  'completed',
  'medium',
  'Working with Elders, we have developed a language program for the Children and Family Centre.',
  25000,
  'Weekly language classes now running at CFC with 30+ children enrolled. Elder-led sessions every Wednesday.',
  'children-family-centre',
  '2024-25'
),
(
  'Need better lighting on the roads near the community centre',
  'infrastructure',
  true,
  'survey',
  'planned',
  'medium',
  'We have raised this with council and are seeking funding for improved street lighting.',
  NULL,
  NULL,
  NULL,
  '2024-25'
),
(
  'More support needed for families dealing with domestic violence',
  'safety',
  true,
  'form',
  'completed',
  'urgent',
  'We have expanded our Safe House capacity and launched the Specialist DFV Service.',
  180000,
  'Safe House now operates 24/7 with increased bed capacity. Specialist DFV workers providing ongoing support to 40+ families.',
  'crisis-services',
  '2024-25'
),
(
  'Would like to see more employment opportunities for young people',
  'economic',
  true,
  'survey',
  'completed',
  'high',
  'The Digital Service Centre has created 50+ new jobs in partnership with Telstra.',
  NULL,
  'Digital Service Centre now employs 54 local staff. Trainee program launched with 12 positions.',
  'digital-service-centre',
  '2024-25'
),
(
  'Need more mental health support services',
  'health',
  true,
  'form',
  'in_progress',
  'urgent',
  'Expanding the Bwgcolman Healing Service with additional counsellors and cultural healing programs.',
  120000,
  'Two new mental health workers employed. Weekly yarning circles and cultural healing sessions now available.',
  'health-services',
  '2024-25'
),
(
  'Request for parenting support groups',
  'family',
  false,
  'conversation',
  'completed',
  'medium',
  'Family Support Service now runs weekly parenting groups with childcare provided.',
  15000,
  'Parenting groups meet every Tuesday. Average attendance of 15 families per session.',
  'family-services',
  '2024-25'
);

-- ============================================================================
-- UPDATE EXISTING STORIES WITH REPORT FLAGS (if they exist)
-- ============================================================================

-- Mark some stories as report-worthy (update these IDs based on your actual data)
UPDATE stories
SET
  auto_include = true,
  report_worthy = true,
  engagement_score = 85
WHERE category = 'health' AND status = 'published'
LIMIT 3;

UPDATE stories
SET
  auto_include = true,
  report_worthy = true,
  elder_approval_given = true,
  engagement_score = 92
WHERE category = 'culture' AND status = 'published'
LIMIT 2;

UPDATE stories
SET
  report_worthy = true,
  engagement_score = 78
WHERE category = 'family' AND status = 'published'
LIMIT 3;

-- ============================================================================
-- CREATE A SAMPLE ANNUAL REPORT
-- ============================================================================

-- First, get the organization ID (adjust if needed)
DO $$
DECLARE
  org_id UUID;
  report_id UUID;
BEGIN
  -- Get PICC organization (or create placeholder)
  SELECT id INTO org_id FROM organizations WHERE name ILIKE '%Palm Island%' LIMIT 1;

  IF org_id IS NULL THEN
    INSERT INTO organizations (name, slug, description)
    VALUES ('Palm Island Community Company', 'picc', 'Community-controlled organization serving Palm Island')
    RETURNING id INTO org_id;
  END IF;

  -- Create sample annual report
  INSERT INTO annual_reports (
    organization_id,
    title,
    fiscal_year,
    status,
    report_type,
    metadata
  ) VALUES (
    org_id,
    'PICC Annual Report 2024-25',
    '2024-25',
    'draft',
    'annual',
    '{
      "theme": "Stronger Together",
      "cover_quote": "Our strength has always been in our community",
      "key_stats": {
        "staff": 197,
        "health_clients": 2283,
        "children_supported": 156,
        "services": 18
      }
    }'::jsonb
  )
  RETURNING id INTO report_id;

  -- Add report sections
  INSERT INTO report_sections (report_id, section_type, title, order_index, content) VALUES
  (report_id, 'cover', 'Cover Page', 0, '{"title": "PICC Annual Report 2024-25", "theme": "Stronger Together"}'::jsonb),
  (report_id, 'executive_summary', 'Message from the CEO', 1, '{"placeholder": true}'::jsonb),
  (report_id, 'statistics', 'Year at a Glance', 2, '{"placeholder": true}'::jsonb),
  (report_id, 'program_highlight', 'Health Services', 3, '{"program": "health-services"}'::jsonb),
  (report_id, 'program_highlight', 'Family Services', 4, '{"program": "family-services"}'::jsonb),
  (report_id, 'stories', 'Community Stories', 5, '{"placeholder": true}'::jsonb),
  (report_id, 'elder_quotes', 'Elder Wisdom', 6, '{"placeholder": true}'::jsonb),
  (report_id, 'community_feedback', 'What You Said, What We Did', 7, '{"placeholder": true}'::jsonb),
  (report_id, 'financials', 'Financial Summary', 8, '{"placeholder": true}'::jsonb),
  (report_id, 'acknowledgements', 'Thank You', 9, '{"placeholder": true}'::jsonb);

  RAISE NOTICE 'Created annual report with ID: %', report_id;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

SELECT 'Elder Quotes:' as table_name, COUNT(*) as count FROM elder_quotes
UNION ALL
SELECT 'Community Feedback:', COUNT(*) FROM community_feedback
UNION ALL
SELECT 'Annual Reports:', COUNT(*) FROM annual_reports
UNION ALL
SELECT 'Report Sections:', COUNT(*) FROM report_sections;

SELECT 'Sample data inserted successfully!' as status;
