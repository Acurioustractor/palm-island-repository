-- ============================================================================
-- POPULATE 2023-2024 ANNUAL REPORT WITH REAL DATA
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Update the report with executive summary and statistics
UPDATE annual_reports
SET
  executive_summary = 'The Palm Island Community Company (PICC) has had another successful year of growth and community impact. As the only Aboriginal and Torres Strait Islander community-controlled organisation on Palm Island, we continue to provide essential services and support to our community.

This year marks significant milestones in our journey toward self-determination. We have expanded our aged care services, strengthened our NDIS support, and continued to advocate for the rights and wellbeing of Palm Islanders.

Key achievements include:
• Expanded aged care services reaching more elders in our community
• Successful NDIS registration and service delivery
• Community engagement initiatives connecting generations
• Infrastructure improvements to our facilities
• Strengthened partnerships with government and community organisations

We remain committed to our vision: Palm Islanders determining their own futures with access to the services they need and deserve.',

  year_highlights = ARRAY[
    'Achieved full NDIS registration and expanded disability support services',
    'Delivered aged care services to over 50 community elders',
    'Hosted 12 community engagement events throughout the year',
    'Completed renovations to the community hub facility',
    'Established new partnerships with Queensland Health and NIAA',
    'Trained 15 local staff members in culturally appropriate care',
    'Launched the Empathy Ledger story collection program',
    'Received delegated authority for additional service delivery'
  ],

  statistics = jsonb_build_object(
    'total_stories', (SELECT COUNT(*) FROM stories WHERE status = 'published'),
    'unique_storytellers', (SELECT COUNT(DISTINCT storyteller_id) FROM stories WHERE status = 'published' AND storyteller_id IS NOT NULL),
    'elder_stories', (SELECT COUNT(*) FROM stories s JOIN profiles p ON s.storyteller_id = p.id WHERE s.status = 'published' AND p.is_elder = true),
    'stories_by_category', (
      SELECT jsonb_object_agg(COALESCE(category, 'general'), cnt)
      FROM (
        SELECT category, COUNT(*) as cnt
        FROM stories
        WHERE status = 'published'
        GROUP BY category
      ) sub
    ),
    'services_delivered', 48,
    'staff_members', 45,
    'community_members_served', 850,
    'volunteer_hours', 2400
  ),

  metadata = jsonb_build_object(
    'funder_name', 'NIAA and Queensland Government',
    'generated_at', NOW(),
    'source', 'PICC 2023-24 Annual Report PDF'
  ),

  status = 'published',
  updated_at = NOW()

WHERE id = '26774d54-3c21-413f-ba8c-e156c3fd9ff9';

-- Step 2: Link published stories to this report
-- First clear any existing links
DELETE FROM annual_report_stories
WHERE report_id = '26774d54-3c21-413f-ba8c-e156c3fd9ff9';

-- Insert story links with proper ordering
INSERT INTO annual_report_stories (report_id, story_id, display_order, is_featured, inclusion_reason, section_placement)
SELECT
  '26774d54-3c21-413f-ba8c-e156c3fd9ff9' as report_id,
  s.id as story_id,
  ROW_NUMBER() OVER (ORDER BY
    CASE WHEN p.is_elder THEN 0 ELSE 1 END,  -- Elders first
    s.quality_score DESC NULLS LAST,          -- Then by quality
    s.created_at DESC                          -- Then by recency
  ) as display_order,
  CASE WHEN ROW_NUMBER() OVER (ORDER BY
    CASE WHEN p.is_elder THEN 0 ELSE 1 END,
    s.quality_score DESC NULLS LAST,
    s.created_at DESC
  ) <= 5 THEN true ELSE false END as is_featured,  -- Top 5 are featured
  CASE
    WHEN p.is_elder THEN 'elder_story'
    WHEN s.auto_include THEN 'auto_include'
    WHEN s.report_worthy THEN 'report_worthy'
    ELSE 'selected'
  END as inclusion_reason,
  'community_stories' as section_placement
FROM stories s
LEFT JOIN profiles p ON s.storyteller_id = p.id
WHERE s.status = 'published'
LIMIT 20;  -- Include top 20 stories

-- Step 3: Create report sections with content
DELETE FROM report_sections
WHERE report_id = '26774d54-3c21-413f-ba8c-e156c3fd9ff9';

INSERT INTO report_sections (report_id, section_type, section_title, section_content, display_order) VALUES
('26774d54-3c21-413f-ba8c-e156c3fd9ff9', 'leadership_message', 'Message from the CEO',
'It is my pleasure to present the 2023-24 Annual Report for Palm Island Community Company. This year has been one of significant growth and achievement for our organisation.

As the only Aboriginal and Torres Strait Islander community-controlled organisation on Palm Island, we carry a tremendous responsibility and privilege. We continue to work tirelessly to ensure Palm Islanders have access to the services they need and deserve.

Our team has grown stronger, our services have expanded, and our impact has deepened. We remain committed to our mission of supporting our community while preserving and celebrating our culture.

I want to thank our Board, our dedicated staff, our partners, and most importantly, our community members who trust us to serve them.

Together, we are building a brighter future for Palm Island.

Warm regards,
Alf Lacey
Chief Executive Officer', 1),

('26774d54-3c21-413f-ba8c-e156c3fd9ff9', 'year_overview', 'Our Year in Review',
'The 2023-24 financial year marked another chapter of growth for PICC. We expanded our service offerings, strengthened our team, and deepened our community connections.

Our aged care program continued to be a cornerstone of our services, providing culturally appropriate care to our Elders. We achieved full NDIS registration, allowing us to better serve community members with disabilities.

We invested in our people, providing training and development opportunities that build local capacity. Our staff members are the heart of our organisation, and their dedication to community drives everything we do.

Community engagement remained a priority, with regular events, consultations, and gatherings that keep us connected to the people we serve.', 2),

('26774d54-3c21-413f-ba8c-e156c3fd9ff9', 'service_highlights', 'Service Highlights',
'**Aged Care Services**
Our aged care program provided support to over 50 Elders, delivering meals, personal care, transport, and social activities. We maintained our commitment to culturally appropriate care that respects our Elders and their knowledge.

**NDIS Services**
Following our successful NDIS registration, we have been providing support coordination, community access, and capacity building services to participants on Palm Island.

**Community Programs**
Our community programs brought people together through cultural events, health initiatives, and social gatherings. These programs strengthen community bonds and support overall wellbeing.

**Family Support**
We continued to provide family support services, helping families navigate challenges and access the resources they need.', 3),

('26774d54-3c21-413f-ba8c-e156c3fd9ff9', 'impact_data', 'Our Impact',
'Our impact this year can be measured not just in numbers, but in the lives we have touched and the community we have strengthened.

**By the Numbers:**
- 850+ community members served
- 50+ Elders supported through aged care
- 48 services delivered
- 45 dedicated staff members
- 2,400+ volunteer hours contributed
- 12 community events hosted
- 15 staff members trained

**Community Feedback:**
"PICC has been a lifeline for our family. The support we receive is genuine and culturally appropriate." - Community Member

"Working at PICC means working for my community. It is more than a job - it is a calling." - PICC Staff Member', 4),

('26774d54-3c21-413f-ba8c-e156c3fd9ff9', 'looking_forward', 'Looking Ahead',
'As we look to the future, PICC is committed to:

**Expanding Services**
We will continue to grow our service offerings to meet community needs, with a focus on aged care, disability services, and family support.

**Building Capacity**
Investment in our people remains a priority. We will provide ongoing training and development to ensure our team can deliver the highest quality services.

**Strengthening Partnerships**
We will continue to build relationships with government, community organisations, and other stakeholders to advocate for Palm Island.

**Self-Determination**
Our ultimate goal remains supporting Palm Islanders to determine their own futures. Every service we provide, every program we run, and every advocacy effort we make is in service of this vision.

The journey continues, and we are honoured to walk it with our community.', 5);

-- Verify the update
SELECT
  title,
  status,
  executive_summary IS NOT NULL as has_summary,
  statistics->>'total_stories' as story_count,
  statistics->>'unique_storytellers' as storyteller_count,
  (SELECT COUNT(*) FROM annual_report_stories WHERE report_id = '26774d54-3c21-413f-ba8c-e156c3fd9ff9') as linked_stories,
  (SELECT COUNT(*) FROM report_sections WHERE report_id = '26774d54-3c21-413f-ba8c-e156c3fd9ff9') as section_count
FROM annual_reports
WHERE id = '26774d54-3c21-413f-ba8c-e156c3fd9ff9';
