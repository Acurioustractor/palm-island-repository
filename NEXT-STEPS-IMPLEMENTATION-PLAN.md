# Next Steps Implementation Plan
## Palm Island Community Repository - Phase 1 Development

**Created:** November 2025
**Purpose:** Guide the next phase of development - adding people, transcripts, and preparing for first review
**Status:** Ready for Implementation

---

## Executive Summary

This plan outlines three workstreams for the next phase of development:

1. **Adding People & Content** - Onboard more community members with their stories and transcripts
2. **Automated Annual Report** - Continue building the report generation system
3. **First Review Preparation** - Clean up and organize for stakeholder review

---

## Part 1: Adding People to the Platform

### Current State

The platform already has:
- **6 storytellers** linked to PICC (Roy Prior, Ferdys, Goonyun Anderson, Uncle Alan, Uncle Frank, Ruby Sibley)
- **26 storm stories** imported from February 2024 floods
- **6 sample service stories** created
- **16 PICC services** configured

### Methods for Adding New People

#### Method 1: SQL Migration (Bulk Import)

Best for importing existing data from spreadsheets or other systems.

**Template for adding a new person:**

```sql
-- Add a new community member/storyteller
INSERT INTO profiles (
  id,
  tenant_id,
  full_name,
  email,
  storyteller_type,
  community_role,
  bio,
  can_share_stories,
  consent_given,
  consent_date,
  primary_organization_id
) VALUES (
  gen_random_uuid(),
  '9c4e5de2-d80a-4e0b-8a89-1bbf09485532',  -- PICC tenant ID
  'Person Full Name',
  'email@example.com',  -- Optional
  'community_member',   -- Options: elder, youth, community_member, staff, cultural_advisor
  'Community Role/Title',
  'Short bio about the person and their connection to Palm Island...',
  TRUE,
  TRUE,
  NOW(),
  '3c2011b9-f80d-4289-b300-0cd383cff479'  -- PICC organization ID
);
```

**Template for linking person to organization:**

```sql
-- Link person as organization member
INSERT INTO organization_members (
  organization_id,
  profile_id,
  role,
  service_id,
  can_approve_stories,
  is_active
) VALUES (
  '3c2011b9-f80d-4289-b300-0cd383cff479',  -- PICC org ID
  (SELECT id FROM profiles WHERE full_name = 'Person Full Name'),
  'contributor',  -- Options: admin, coordinator, staff, contributor, elder, cultural_advisor
  (SELECT id FROM organization_services WHERE service_slug = 'youth_services'),  -- Service they're linked to
  FALSE,  -- Can they approve stories?
  TRUE
);
```

#### Method 2: Story Submission Form (Individual)

The web platform at `/stories/submit` provides a form interface for:
- Story title and content
- Category selection (12 options)
- Emotional themes (7 options)
- Privacy level settings

**Current form categories:**
- Health & Healing
- Youth & Education
- Culture & Language
- Family & Community
- Environment & Country
- Economic Development
- Sports & Recreation
- Arts & Creativity
- Elders & Wisdom
- Women's Stories
- Men's Stories
- Community Events

#### Method 3: Transcript Import (For Audio/Video Content)

For transcribed interviews, oral histories, or audio recordings:

```sql
-- Import a transcript as a story
INSERT INTO stories (
  tenant_id,
  organization_id,
  service_id,
  storyteller_id,
  author_id,
  title,
  content,
  summary,
  story_type,
  story_category,
  privacy_level,
  is_public,
  status,
  metadata
) VALUES (
  '9c4e5de2-d80a-4e0b-8a89-1bbf09485532',
  '3c2011b9-f80d-4289-b300-0cd383cff479',
  NULL,  -- Or link to specific service
  (SELECT id FROM profiles WHERE full_name = 'Storyteller Name'),
  (SELECT id FROM profiles WHERE full_name = 'Interviewer Name'),
  'Interview Title or Topic',
  'Full transcript text goes here...',
  'Brief summary of the transcript content',
  'oral_history',  -- Options: personal_story, impact_story, oral_history, traditional_knowledge, service_story
  'culture',
  'community',  -- Options: public, community, restricted
  FALSE,  -- Public visibility
  'draft',  -- Start as draft for review
  jsonb_build_object(
    'source_type', 'transcript',
    'recording_date', '2024-11-20',
    'duration_minutes', 45,
    'transcribed_by', 'Person Name',
    'original_format', 'audio_recording'
  )
);
```

### Recommended Onboarding Process

1. **Collect consent** - Use the consent form template in `/documentation/cultural-protocols.md`
2. **Create profile** - Add person to database with appropriate storyteller_type
3. **Link to organization** - Add organization_members record
4. **Import content** - Add their stories/transcripts
5. **Cultural review** - Flag any content requiring elder approval
6. **Publish** - Change status to 'published' after approval

---

## Part 2: Automated Annual Report - Best Practices

### Research Summary: 2024-2025 Best Practices

Based on research from leading nonprofit and Indigenous organizations:

#### Content & Storytelling Best Practices

| Practice | Implementation for PICC |
|----------|------------------------|
| **Fuse data with stories** | Each metric should have an accompanying community story |
| **Center real voices** | Use direct quotes, authentic photos, not stock imagery |
| **Show transformation** | Before/after narratives that demonstrate impact |
| **Honest reporting** | Acknowledge challenges alongside achievements |
| **Close the loop** | Show how community feedback led to action |

#### CARE Principles for Indigenous Data

| Principle | Application |
|-----------|-------------|
| **Collective Benefit** | Report benefits community, not just funders |
| **Authority to Control** | Community approves all content before publication |
| **Responsibility** | Clear attribution and cultural protocol compliance |
| **Ethics** | Consent for all stories, respect for restricted knowledge |

#### Visual & Design Best Practices

| Practice | Implementation |
|----------|----------------|
| **High-quality photography** | Real community photos, professional quality |
| **Data visualization** | Simple charts that non-accountants can understand |
| **Consistent branding** | PICC colors, cultural design elements |
| **Mobile-responsive** | Digital version works on phones |
| **Accessible** | Large print option, plain language |

#### Multi-Channel Distribution

| Channel | Purpose |
|---------|---------|
| **Community first** | Share with Palm Island community before external |
| **Digital web version** | Interactive, searchable, multimedia |
| **PDF download** | For printing and formal submission |
| **Executive summary** | 2-4 page highlight version |
| **Social media** | Story-by-story sharing throughout year |

### Annual Report Automation Roadmap

#### Phase 1: Content Aggregation (Current Priority)

```
Goal: Collect and organize all content for report

Tasks:
├── [ ] Compile all stories by category
├── [ ] Gather service metrics from each of 16 services
├── [ ] Collect community photos (with permissions)
├── [ ] Document community conversations/feedback
├── [ ] Identify featured stories for each section
└── [ ] Review all content for cultural protocols
```

#### Phase 2: Template & Structure

```
Goal: Create report structure and design

Sections:
├── Cover & Cultural Acknowledgment
├── Leadership Message (CEO/Board)
├── Year in Numbers (Data Dashboard)
├── Community Stories (6-8 featured)
├── Service Highlights (All 16 services)
├── "We Heard You" (Community feedback response)
├── Financial Summary
├── Looking Forward
└── Acknowledgments
```

#### Phase 3: Generation & Review

```
Goal: Produce draft and get approvals

Steps:
├── Generate draft from content hub
├── Internal team review
├── Elder/Cultural advisor review
├── Community leadership approval
├── Final design polish
└── Multi-format production (PDF, web, summary)
```

### Recommended Tools for Report Generation

| Tool | Purpose | Status |
|------|---------|--------|
| **Database queries** | Aggregate stories and metrics | Existing SQL |
| **Next.js components** | Generate report sections | Partial |
| **React-PDF** | Generate PDF documents | To implement |
| **Framer Motion** | Interactive web animations | In Living Ledger plan |
| **Canva/Figma** | Design templates | Manual for now |

### SQL for Annual Report Data

```sql
-- Get stories for annual report by category
SELECT
  s.title,
  s.summary,
  s.content,
  p.full_name as storyteller,
  srv.service_name,
  s.story_category,
  s.published_at
FROM stories s
JOIN profiles p ON s.storyteller_id = p.id
LEFT JOIN organization_services srv ON s.service_id = srv.id
WHERE s.organization_id = '3c2011b9-f80d-4289-b300-0cd383cff479'
  AND s.status = 'published'
  AND s.published_at >= '2024-01-01'
  AND s.published_at < '2025-01-01'
ORDER BY s.story_category, s.published_at;

-- Get service metrics summary
SELECT
  service_name,
  service_category,
  story_count,
  description
FROM organization_services
WHERE organization_id = '3c2011b9-f80d-4289-b300-0cd383cff479'
  AND is_active = TRUE
ORDER BY story_count DESC;

-- Get storyteller engagement
SELECT
  p.full_name,
  p.storyteller_type,
  COUNT(s.id) as stories_contributed,
  p.community_role
FROM profiles p
LEFT JOIN stories s ON s.storyteller_id = p.id
  AND s.published_at >= '2024-01-01'
WHERE p.primary_organization_id = '3c2011b9-f80d-4289-b300-0cd383cff479'
GROUP BY p.id, p.full_name, p.storyteller_type, p.community_role
ORDER BY stories_contributed DESC;
```

---

## Part 3: First Review Preparation Checklist

### Documentation Cleanup

- [ ] **README.md** - Ensure clear project overview
- [ ] **EXECUTIVE-SUMMARY.md** - Update with current status
- [ ] **Getting started guide** - Simplify for new users
- [ ] **Remove duplicate/outdated files** - Clean up repository

### Code & Database Cleanup

- [ ] **Verify database schema** - All tables created correctly
- [ ] **Test SQL scripts** - Ensure migrations run without errors
- [ ] **Check web platform** - All pages load correctly
- [ ] **Fix any broken links** - Internal documentation links

### Content Verification

- [ ] **Verify existing stories** - All content appropriate and approved
- [ ] **Check profile data** - Names, roles, permissions correct
- [ ] **Review cultural protocols** - All sensitive content flagged
- [ ] **Photo permissions** - Ensure all photos have consent

### Files to Review/Update

| File | Action Needed |
|------|---------------|
| `README.md` | Update with current features |
| `web-platform/README.md` | Document setup steps clearly |
| `NEXT-STEPS-ROADMAP.md` | Update with completed items |
| `documentation/getting-started.md` | Simplify for first-time users |
| `templates/*.md` | Ensure templates are complete |

### Demonstration Readiness

For first review, ensure:

1. **Web platform runs locally** - `npm run dev` works
2. **Sample data visible** - Stories and storytellers display
3. **Key features work:**
   - View stories list
   - View storyteller profiles
   - Submit story form (may not save yet)
   - Dashboard shows data
4. **Documentation explains:**
   - What the platform does
   - How to add content
   - Cultural protocol compliance

---

## Part 4: Immediate Action Items

### This Week

| Priority | Task | Owner | Time Est. |
|----------|------|-------|-----------|
| 1 | Add 5-10 more community members to database | Dev | 2 hours |
| 2 | Import 10+ new stories/transcripts | Dev | 3 hours |
| 3 | Run cleanup checklist | Dev | 2 hours |
| 4 | Test web platform locally | Dev | 1 hour |
| 5 | Update key documentation | Dev | 2 hours |

### Next 2 Weeks

| Priority | Task | Time Est. |
|----------|------|-----------|
| 1 | Complete annual report content compilation | 4 hours |
| 2 | Create simple report generation script | 6 hours |
| 3 | Design report template (Canva/Figma) | 4 hours |
| 4 | Generate draft annual report | 2 hours |
| 5 | Prepare demo for first review | 2 hours |

### First Review Agenda (Proposed)

1. **Platform Demo** (15 min)
   - Show web interface
   - Walk through story submission
   - Show storyteller profiles

2. **Content Review** (15 min)
   - Review sample stories
   - Discuss content gaps
   - Identify priority stories to add

3. **Annual Report Preview** (15 min)
   - Show draft structure
   - Review Living Ledger approach
   - Discuss timeline for completion

4. **Next Steps Discussion** (15 min)
   - Community onboarding plan
   - Resource requirements
   - Timeline to launch

---

## Part 5: SQL Templates for Immediate Use

### Bulk Add New People

Save as `add_new_people.sql`:

```sql
-- ============================================================================
-- ADD NEW COMMUNITY MEMBERS TO PICC
-- Run this after customizing with real names and details
-- ============================================================================

DO $$
DECLARE
  picc_org_id UUID := '3c2011b9-f80d-4289-b300-0cd383cff479';
  picc_tenant_id UUID := '9c4e5de2-d80a-4e0b-8a89-1bbf09485532';
  new_person_id UUID;
BEGIN

  -- ============================
  -- PERSON 1: [Replace with real name]
  -- ============================
  INSERT INTO profiles (
    id, tenant_id, full_name, storyteller_type, community_role,
    bio, can_share_stories, consent_given, consent_date, primary_organization_id
  ) VALUES (
    gen_random_uuid(),
    picc_tenant_id,
    '[Full Name]',
    'community_member',  -- elder, youth, community_member, staff, cultural_advisor
    '[Their Role]',
    '[Short bio]',
    TRUE, TRUE, NOW(), picc_org_id
  ) RETURNING id INTO new_person_id;

  -- Link to organization
  INSERT INTO organization_members (organization_id, profile_id, role, is_active)
  VALUES (picc_org_id, new_person_id, 'contributor', TRUE);

  RAISE NOTICE 'Added: [Full Name]';

  -- ============================
  -- PERSON 2: [Replace with real name]
  -- ============================
  -- Copy the block above and customize

  -- ============================
  -- PERSON 3: [Replace with real name]
  -- ============================
  -- Copy the block above and customize

END $$;

-- Verify additions
SELECT full_name, storyteller_type, community_role, created_at
FROM profiles
WHERE primary_organization_id = '3c2011b9-f80d-4289-b300-0cd383cff479'
ORDER BY created_at DESC
LIMIT 10;
```

### Bulk Import Transcripts

Save as `import_transcripts.sql`:

```sql
-- ============================================================================
-- IMPORT TRANSCRIPTS AS STORIES
-- ============================================================================

DO $$
DECLARE
  picc_org_id UUID := '3c2011b9-f80d-4289-b300-0cd383cff479';
  picc_tenant_id UUID := '9c4e5de2-d80a-4e0b-8a89-1bbf09485532';
  storyteller_id UUID;
BEGIN

  -- ============================
  -- TRANSCRIPT 1: [Title]
  -- ============================
  SELECT id INTO storyteller_id FROM profiles WHERE full_name = '[Storyteller Name]';

  INSERT INTO stories (
    tenant_id, organization_id, storyteller_id, author_id,
    title, content, summary,
    story_type, story_category, privacy_level, status,
    metadata
  ) VALUES (
    picc_tenant_id, picc_org_id, storyteller_id, storyteller_id,
    '[Transcript Title]',
    '[Full transcript content goes here - can be multiple paragraphs]',
    '[2-3 sentence summary]',
    'oral_history',
    'culture',  -- health, youth_development, culture, family_support, environment, economic
    'community',  -- public, community, restricted
    'draft',  -- Start as draft for review
    jsonb_build_object(
      'source_type', 'transcript',
      'recording_date', '2024-01-15',
      'duration_minutes', 30
    )
  );

  RAISE NOTICE 'Imported transcript: [Title]';

  -- ============================
  -- TRANSCRIPT 2: [Title]
  -- ============================
  -- Copy the block above and customize

END $$;

-- Verify imports
SELECT title, story_type, status, created_at
FROM stories
WHERE organization_id = '3c2011b9-f80d-4289-b300-0cd383cff479'
  AND metadata->>'source_type' = 'transcript'
ORDER BY created_at DESC;
```

---

## Success Criteria for First Review

### Minimum Requirements

- [ ] **10+ storytellers** in the database
- [ ] **20+ stories** (including transcripts)
- [ ] **All 16 services** have at least one story
- [ ] **Web platform** runs and displays content
- [ ] **Documentation** is clear and up-to-date
- [ ] **Annual report structure** is defined

### Nice to Have

- [ ] Draft annual report generated
- [ ] Interactive dashboard working
- [ ] Story submission saves to database
- [ ] Photo gallery component built

---

## Appendix: Key Reference IDs

```
PICC Organization ID: 3c2011b9-f80d-4289-b300-0cd383cff479
PICC Tenant ID: 9c4e5de2-d80a-4e0b-8a89-1bbf09485532

Existing Storyteller IDs:
- Roy Prior: 0a66bb4b-f437-4a1e-a737-4d8911e05cef
- Ferdys: c34e763b-a1b7-46e4-9e8e-e86301634c9e
- Goonyun Anderson: 32495b83-0275-4bf3-8c3b-5a6b54ea2b6a
- Uncle Alan: cd6c0478-e577-4070-b566-1d66ca6aa455
- Uncle Frank: 13a78adf-c261-443f-90ba-cf8a57f3d301
- Ruby Sibley: 2b139020-fa6a-4012-b1c2-4be54f516913

Service Slugs:
- bwgcolman_healing, family_wellbeing, youth_services
- early_learning, cultural_centre, ranger_program
- digital_services, economic_development, housing_services
- elder_support, community_justice, womens_services
- mens_programs, food_security, sports_recreation, transport
```

---

**Document Version:** 1.0
**Next Review:** After first stakeholder review
