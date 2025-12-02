# Deploy Multi-Organization Schema Extension
## Quick Start Guide

### Prerequisites
✅ Existing Empathy Ledger schema deployed (profiles, stories, impact_indicators)
✅ Supabase project connected
✅ Database credentials available

---

## Step 1: Deploy the Schema

### Option A: Using psql directly

```bash
# Navigate to empathy ledger directory
cd /Users/benknight/Code/Palm\ Island\ Reposistory/web-platform/lib/empathy-ledger

# Deploy the multi-org schema
psql "postgresql://postgres.yvnuayzslukamizrlhwb:Drillsquare99@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres" < migrations/03_organizations_and_annual_reports.sql
```

### Option B: Using Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/editor
2. Open SQL Editor
3. Copy entire contents of `migrations/03_organizations_and_annual_reports.sql`
4. Paste and Run

---

## Step 2: Verify Installation

```bash
# Check if new tables were created
psql "postgresql://postgres.yvnuayzslukamizrlhwb:Drillsquare99@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres" << 'EOF'
-- List all organization tables
SELECT tablename, schemaname 
FROM pg_tables 
WHERE schemaname = 'public' 
AND (
  tablename LIKE 'organization%' 
  OR tablename LIKE 'annual%'
  OR tablename = 'report_templates'
  OR tablename = 'report_sections'
  OR tablename = 'report_feedback'
)
ORDER BY tablename;

-- Expected output:
-- annual_reports
-- annual_report_stories
-- organization_members
-- organizations
-- organization_services
-- report_feedback
-- report_sections
-- report_templates
EOF
```

---

## Step 3: Verify PICC Setup

```bash
psql "postgresql://postgres.yvnuayzslukamizrlhwb:Drillsquare99@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres" << 'EOF'
-- Check PICC organization was created
SELECT 
  name, 
  short_name, 
  organization_type, 
  primary_location,
  traditional_country
FROM organizations 
WHERE short_name = 'PICC';

-- Check PICC services (should be 16)
SELECT COUNT(*) as service_count
FROM organization_services
WHERE organization_id = (SELECT id FROM organizations WHERE short_name = 'PICC');

-- List PICC services
SELECT 
  service_name, 
  service_category, 
  service_color, 
  is_active
FROM organization_services
WHERE organization_id = (SELECT id FROM organizations WHERE short_name = 'PICC')
ORDER BY service_name;

-- Check report templates (should be 3)
SELECT 
  template_name, 
  display_name, 
  category, 
  is_public
FROM report_templates
ORDER BY template_name;
EOF
```

Expected output:
- **PICC organization**: 1 row
- **Services**: 16 rows
- **Templates**: 3 rows (traditional, modern_professional, photo_story)

---

## Step 4: Link Existing Data (Optional but Recommended)

This connects your existing Palm Island profiles and stories to the new PICC organization.

```bash
psql "postgresql://postgres.yvnuayzslukamizrlhwb:Drillsquare99@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres" << 'EOF'
DO $$
DECLARE
  picc_org_id UUID;
  linked_profiles INTEGER;
  linked_stories INTEGER;
BEGIN
  -- Get PICC organization ID
  SELECT id INTO picc_org_id 
  FROM organizations 
  WHERE short_name = 'PICC';
  
  IF picc_org_id IS NULL THEN
    RAISE EXCEPTION 'PICC organization not found!';
  END IF;
  
  -- Link existing Palm Island profiles to PICC
  UPDATE profiles 
  SET primary_organization_id = picc_org_id 
  WHERE location = 'Palm Island'
    AND primary_organization_id IS NULL;
  
  GET DIAGNOSTICS linked_profiles = ROW_COUNT;
  
  -- Link existing stories from Palm Island profiles to PICC
  UPDATE stories 
  SET organization_id = picc_org_id 
  WHERE storyteller_id IN (
    SELECT id FROM profiles WHERE location = 'Palm Island'
  )
  AND organization_id IS NULL;
  
  GET DIAGNOSTICS linked_stories = ROW_COUNT;
  
  RAISE NOTICE '✅ Linked % profiles to PICC', linked_profiles;
  RAISE NOTICE '✅ Linked % stories to PICC', linked_stories;
  RAISE NOTICE '🌊 Existing data successfully connected to PICC organization';
END $$;
EOF
```

---

## Step 5: Test Database Functions

```bash
psql "postgresql://postgres.yvnuayzslukamizrlhwb:Drillsquare99@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres" << 'EOF'
-- Test organization stats function
SELECT * FROM get_organization_stats(
  (SELECT id FROM organizations WHERE short_name = 'PICC')
);

-- Test story selection for report function
-- (This will work once you have stories linked)
SELECT 
  story_title, 
  category, 
  impact_score, 
  relevance_score
FROM get_stories_for_report(
  (SELECT id FROM organizations WHERE short_name = 'PICC'),
  2024,
  10  -- Limit to 10 stories
);
EOF
```

---

## Step 6: Create Organization Members (PICC Staff)

Once you have profiles created, link them to PICC as members:

```bash
psql "postgresql://postgres.yvnuayzslukamizrlhwb:Drillsquare99@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres" << 'EOF'
-- Example: Link existing profiles as PICC members
-- Replace with actual profile IDs once you have them

DO $$
DECLARE
  picc_org_id UUID;
  sample_profile_id UUID;
BEGIN
  SELECT id INTO picc_org_id FROM organizations WHERE short_name = 'PICC';
  
  -- Get a sample profile (or create test profiles first)
  SELECT id INTO sample_profile_id FROM profiles LIMIT 1;
  
  IF sample_profile_id IS NOT NULL THEN
    -- Create a sample membership
    INSERT INTO organization_members (
      organization_id,
      profile_id,
      role,
      can_approve_stories,
      can_manage_reports,
      can_view_analytics
    ) VALUES (
      picc_org_id,
      sample_profile_id,
      'staff',
      true,
      true,
      true
    )
    ON CONFLICT (organization_id, profile_id) DO NOTHING;
    
    RAISE NOTICE '✅ Created sample organization member';
  ELSE
    RAISE NOTICE '⚠️  No profiles found - create profiles first, then run this again';
  END IF;
END $$;
EOF
```

---

## Step 7: Test Annual Report Creation

```bash
psql "postgresql://postgres.yvnuayzslukamizrlhwb:Drillsquare99@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres" << 'EOF'
-- Create a test annual report for 2024
INSERT INTO annual_reports (
  organization_id,
  report_year,
  reporting_period_start,
  reporting_period_end,
  title,
  subtitle,
  theme,
  template_name,
  status
) VALUES (
  (SELECT id FROM organizations WHERE short_name = 'PICC'),
  2024,
  '2024-01-01',
  '2024-12-31',
  'Palm Island Community Company Annual Report 2024',
  'Our Community, Our Future, Our Way',
  'Community Strength Through Cultural Connection',
  'traditional',
  'planning'
)
ON CONFLICT (organization_id, report_year) DO UPDATE
SET 
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  theme = EXCLUDED.theme
RETURNING id, title, report_year, status;

-- View the report with stats
SELECT * FROM annual_reports_with_stats 
WHERE report_year = 2024;
EOF
```

---

## Step 8: Verify Views Work

```bash
psql "postgresql://postgres.yvnuayzslukamizrlhwb:Drillsquare99@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres" << 'EOF'
-- Test organization overview view
SELECT 
  name,
  short_name,
  member_count,
  service_count,
  story_count,
  report_count
FROM organization_overview
WHERE short_name = 'PICC';

-- Test stories with storyteller view (existing view)
SELECT COUNT(*) as total_stories
FROM stories_with_storyteller;

-- Test annual reports with stats view
SELECT 
  title,
  report_year,
  status,
  story_count,
  organization_name
FROM annual_reports_with_stats
ORDER BY report_year DESC;
EOF
```

---

## ✅ Deployment Checklist

- [ ] **Step 1**: Schema deployed successfully
- [ ] **Step 2**: 8 new tables created
- [ ] **Step 3**: PICC organization created with 16 services
- [ ] **Step 3**: 3 report templates created
- [ ] **Step 4**: Existing profiles linked to PICC (optional)
- [ ] **Step 4**: Existing stories linked to PICC (optional)
- [ ] **Step 5**: Database functions work correctly
- [ ] **Step 6**: Organization members can be created
- [ ] **Step 7**: Annual reports can be created
- [ ] **Step 8**: All views return data

---

## 🐛 Troubleshooting

### Error: "relation already exists"
This is safe to ignore - it means the table was already created. The migration uses `CREATE TABLE IF NOT EXISTS`.

### Error: "function does not exist"
Make sure the base Empathy Ledger schema is deployed first (profiles, stories tables).

### Error: "permission denied"
Check that you're using the postgres user credentials with full permissions.

### No data in views
This is normal if you haven't created any profiles or stories yet. The schema is ready for data.

### PICC organization not created
Check the end of the migration output for error messages. The PICC setup is wrapped in a `DO $$ ... END $$` block.

---

## 📊 Next Steps

After successful deployment:

1. **Create/Import Profiles**: Use the profiles table to create storyteller accounts
2. **Link Profiles to PICC**: Use organization_members to assign roles
3. **Create Stories**: Staff can start creating stories linked to services
4. **Build Report UI**: Create frontend for annual report management
5. **Test Report Generation**: Create a test report for 2024

---

## 🔄 Rollback (If Needed)

If you need to undo this migration:

```bash
psql "postgresql://..." << 'EOF'
-- WARNING: This will delete all organization data
DROP TABLE IF EXISTS report_feedback CASCADE;
DROP TABLE IF EXISTS report_sections CASCADE;
DROP TABLE IF EXISTS annual_report_stories CASCADE;
DROP TABLE IF EXISTS annual_reports CASCADE;
DROP TABLE IF EXISTS report_templates CASCADE;
DROP TABLE IF EXISTS organization_members CASCADE;
DROP TABLE IF EXISTS organization_services CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Remove added columns from existing tables
ALTER TABLE profiles DROP COLUMN IF EXISTS primary_organization_id;
ALTER TABLE stories DROP COLUMN IF EXISTS organization_id;
ALTER TABLE stories DROP COLUMN IF EXISTS service_id;

-- Drop helper functions
DROP FUNCTION IF EXISTS get_organization_stats(UUID);
DROP FUNCTION IF EXISTS get_stories_for_report(UUID, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS update_service_story_count();
DROP FUNCTION IF EXISTS increment_template_usage();

-- Drop views
DROP VIEW IF EXISTS organization_overview;
DROP VIEW IF EXISTS annual_reports_with_stats;
EOF
```

---

## 📞 Support

If you encounter issues:
1. Check the error message carefully
2. Verify base schema is deployed
3. Check database user permissions
4. Review Supabase logs in dashboard

---

**🌊 You're now ready to use the multi-organization Empathy Ledger!**

Palm Island can start creating annual reports immediately, and the platform is ready for other organizations to join whenever you're ready.
