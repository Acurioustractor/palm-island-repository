# Deploy Complete Empathy Ledger Architecture to Supabase

## Current Status

Your Supabase database at `yvnuayzslukamizrlhwb.supabase.co` has:
- ✅ `profiles` table (storytellers)
- ✅ `stories` table (31 stories)
- ❓ `organizations` table (needs verification)
- ❓ `organization_services` table (needs verification)
- ❓ `organization_members` table (needs verification)
- ❓ `projects` table (NOT YET CREATED)
- ❓ `story_media` table (needs verification)

## Step 1: Verify Current Schema

Run this in Supabase SQL Editor:

```sql
-- Check which tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

## Step 2: Deploy Missing Tables

If `organizations`, `organization_services`, or `organization_members` don't exist, run:

```sql
-- Run: lib/empathy-ledger/migrations/03_organizations_and_annual_reports.sql
```

## Step 3: Ensure PICC Organization Exists

```sql
-- Check if PICC exists
SELECT * FROM organizations WHERE name = 'Palm Island Community Company';

-- If not, create it:
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
  established_date,
  indigenous_controlled,
  governance_model,
  empathy_ledger_enabled,
  annual_reports_enabled
) VALUES (
  '3c2011b9-f80d-4289-b300-0cd383cff479', -- Fixed PICC ID
  'Palm Island Community Company',
  'Palm Island Community Company Ltd',
  'PICC',
  'aboriginal_community',
  'From Colonial Control to Community Sovereignty',
  'Everything we do is for, with, and because of the people of this beautiful community',
  'Palm Island',
  'Manbarra & Bwgcolman Country',
  ARRAY['Manbarra'],
  'https://www.picc.com.au',
  'info@picc.com.au',
  '(07) 4421 4300',
  '2007-01-01',
  TRUE,
  'community_controlled',
  TRUE,
  TRUE
);
```

## Step 4: Create 16 PICC Services

```sql
-- Run: picc_complete_setup.sql
```

This creates all 16 services:
1. Bwgcolman Healing Service
2. Family Wellbeing Centre
3. Youth Services
4. Early Learning Centre
5. Cultural Centre
6. Ranger Program
7. Digital Service Centre
8. Economic Development
9. Housing Services
10. Elder Support Services
11. Community Justice
12. Women's Services
13. Men's Programs
14. Food Security
15. Sports & Recreation
16. Transport Services

## Step 5: Link Storytellers to PICC

The migration script also:
- Links all storytellers as `organization_members`
- Assigns them to appropriate services
- Sets their roles (elder, coordinator, staff, contributor)

## Step 6: Add Projects Table (NEW)

```sql
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Organization Connection
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Project Details
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL,
  -- program, initiative, campaign, event, infrastructure, research

  -- Status
  status TEXT DEFAULT 'planning',
  -- planning, active, completed, on_hold, cancelled

  start_date DATE,
  end_date DATE,

  -- Leadership
  project_lead_id UUID REFERENCES profiles(id),
  service_id UUID REFERENCES organization_services(id),

  -- Funding & Budget
  total_budget DECIMAL,
  funding_source TEXT,

  -- Impact Goals
  impact_goals TEXT[],
  target_beneficiaries INTEGER,

  -- Story Collection
  story_collection_enabled BOOLEAN DEFAULT TRUE,
  story_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,

  UNIQUE(organization_id, slug)
);

-- Link stories to projects
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);

-- Add organization reference to stories
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Add service reference to stories
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES organization_services(id);

CREATE INDEX IF NOT EXISTS stories_project_id_idx ON stories(project_id);
CREATE INDEX IF NOT EXISTS stories_organization_id_idx ON stories(organization_id);
CREATE INDEX IF NOT EXISTS stories_service_id_idx ON stories(service_id);
```

## Step 7: Update Existing Stories

```sql
-- Link all existing stories to PICC organization
UPDATE stories
SET organization_id = '3c2011b9-f80d-4289-b300-0cd383cff479'
WHERE organization_id IS NULL;

-- Map story categories to services
UPDATE stories s
SET service_id = (
  SELECT id FROM organization_services os
  WHERE os.organization_id = '3c2011b9-f80d-4289-b300-0cd383cff479'
  AND (
    (s.story_category = 'mens_health' AND os.service_slug = 'mens_programs') OR
    (s.story_category = 'elder_care' AND os.service_slug = 'elder_support') OR
    (s.story_category = 'youth' AND os.service_slug = 'youth_services') OR
    (s.story_category = 'health' AND os.service_slug = 'bwgcolman_healing') OR
    (s.story_category = 'culture' AND os.service_slug = 'cultural_centre') OR
    (s.story_category = 'family_support' AND os.service_slug = 'family_wellbeing') OR
    (s.story_category = 'community' AND os.service_slug = 'community_justice')
  )
  LIMIT 1
)
WHERE service_id IS NULL;
```

## Step 8: Verify Complete Architecture

```sql
-- Check everything is connected
SELECT
  o.name as organization,
  COUNT(DISTINCT os.id) as services_count,
  COUNT(DISTINCT om.id) as members_count,
  COUNT(DISTINCT s.id) as stories_count
FROM organizations o
LEFT JOIN organization_services os ON o.id = os.organization_id
LEFT JOIN organization_members om ON o.id = om.organization_id
LEFT JOIN stories s ON o.id = s.organization_id
WHERE o.id = '3c2011b9-f80d-4289-b300-0cd383cff479'
GROUP BY o.name;
```

Expected result:
```
organization                    | services_count | members_count | stories_count
Palm Island Community Company   | 16             | 30+           | 31
```

## Step 9: Setup Supabase Storage for Photos/Videos

```sql
-- Run: setup_image_storage.sql
```

This creates buckets:
- `story-images` - Photos attached to stories
- `story-videos` - Videos attached to stories
- `story-audio` - Audio recordings
- `profile-photos` - Storyteller profile photos
- `organization-assets` - PICC logos, service images

## Next: Update Frontend

After all tables are deployed, update the frontend to:
1. Show PICC organization context on all stories
2. Display which service the story relates to
3. Show storyteller's role in PICC
4. Link to service pages
5. Group stories by project
6. Enable photo/video upload to Supabase Storage
