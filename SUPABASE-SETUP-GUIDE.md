# Fresh Supabase Setup - Palm Island Story Server
## Project ID: `uaxhjzqrdotoahjnxmbj`

**Purpose**: Set up Supabase with Indigenous data sovereignty principles from day one.

---

## 🔑 STEP 1: Get Your API Keys (DO THIS NOW)

### In Supabase Dashboard:

1. **Go to**: https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj
2. **Click**: Settings (⚙️ in left sidebar)
3. **Click**: API
4. **Copy these 3 values**:

```bash
# Project URL
URL: https://uaxhjzqrdotoahjnxmbj.supabase.co

# Project API keys (found under "Project API keys" section)
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database password (found under "Database password" section)
# If you forgot it, click "Reset database password"
postgres password: [your-password-here]
```

---

## 📝 STEP 2: Configure Environment Variables

Run this to update your `.env.local`:

```bash
cd /home/user/palm-island-repository/web-platform

# Create/update .env.local with your actual keys
cat > .env.local << 'EOF'
# =============================================================================
# SUPABASE - Palm Island Story Server
# =============================================================================
# Project: uaxhjzqrdotoahjnxmbj
# Region: [check your dashboard for region]

NEXT_PUBLIC_SUPABASE_URL=https://uaxhjzqrdotoahjnxmbj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE

# Database connection string
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD_HERE@db.uaxhjzqrdotoahjnxmbj.supabase.co:5432/postgres

# =============================================================================
# SITE CONFIGURATION
# =============================================================================

NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Palm Island Story Server
NEXT_PUBLIC_DEFAULT_ORG_SLUG=picc

# =============================================================================
# FEATURE FLAGS (Start with basics, add AI later)
# =============================================================================

NEXT_PUBLIC_ENABLE_SEMANTIC_SEARCH=false
NEXT_PUBLIC_ENABLE_ANNUAL_REPORTS=true
NEXT_PUBLIC_ENABLE_AI_CATEGORIZATION=false
NEXT_PUBLIC_ENABLE_FACE_RECOGNITION=false

# =============================================================================
# OPTIONAL (Add these in Phase 2)
# =============================================================================

# OPENAI_API_KEY=
# QDRANT_URL=
# QDRANT_API_KEY=
EOF
```

**ACTION REQUIRED**: Open `.env.local` and replace:
- `YOUR_ANON_KEY_HERE` with your anon key
- `YOUR_SERVICE_ROLE_KEY_HERE` with your service_role key
- `YOUR_PASSWORD_HERE` with your database password

---

## 🗄️ STEP 3: Deploy Database Schema

We'll run the SQL files in the correct order to set up the database.

### 3A. Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/sql
2. Click "+ New query"

### 3B. Run Schema in This Order:

#### **QUERY 1: Enable Extensions & Create Core Schema**

Copy and paste `lib/empathy-ledger/schema.sql` into SQL Editor and run it.

This creates:
- ✅ `profiles` table (storytellers)
- ✅ `stories` table (micro-stories with embeddings)
- ✅ `story_media` table (photos, videos, audio)
- ✅ `impact_indicators` table (measurable outcomes)
- ✅ `engagement_activities` table (user interactions)
- ✅ `service_story_links` table (PICC service connections)
- ✅ `cultural_permissions` table (consent management)
- ✅ `story_patterns` table (ML pattern recognition)
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Triggers for auto-updates
- ✅ Helper functions

**Expected result**: "Success. No rows returned"

---

#### **QUERY 2: Create Organizations & Services**

We need to check if you have an organizations table setup. Let's create a new query:

```sql
-- ============================================================================
-- ORGANIZATIONS & SERVICES SETUP FOR PICC
-- ============================================================================

-- Create organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name TEXT NOT NULL,
  short_name TEXT,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,

  -- Contact
  email TEXT,
  phone TEXT,
  website TEXT,

  -- Location
  address TEXT,
  location TEXT DEFAULT 'Palm Island',
  coordinates POINT,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  organization_type TEXT, -- community_org, government, ngo, business

  -- Metadata
  logo_url TEXT,
  primary_color TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create organization_services table
CREATE TABLE IF NOT EXISTS organization_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Service Info
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  service_category TEXT, -- health, youth, family, culture, education, employment

  -- Details
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(organization_id, slug)
);

-- Add organization_id to stories if not exists
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Add service_id to stories if not exists
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES organization_services(id);

-- Add primary_organization_id to profiles if not exists
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS primary_organization_id UUID REFERENCES organizations(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stories_organization ON stories(organization_id);
CREATE INDEX IF NOT EXISTS idx_stories_service ON stories(service_id);
CREATE INDEX IF NOT EXISTS idx_profiles_organization ON profiles(primary_organization_id);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Organizations
CREATE POLICY "Organizations viewable by everyone" ON organizations
  FOR SELECT USING (TRUE);

CREATE POLICY "Services viewable by everyone" ON organization_services
  FOR SELECT USING (TRUE);

-- ============================================================================
-- INSERT PICC ORGANIZATION
-- ============================================================================

INSERT INTO organizations (
  id,
  name,
  short_name,
  slug,
  description,
  location,
  website,
  organization_type,
  is_active
) VALUES (
  '3c2011b9-f80d-4289-b300-0cd383cff479',
  'Palm Island Community Company',
  'PICC',
  'picc',
  'Palm Island Community Company provides essential services to the Palm Island community, including health, youth services, family wellbeing, and community development programs.',
  'Palm Island',
  'https://palmisland.org.au',
  'community_org',
  TRUE
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  updated_at = NOW();

-- ============================================================================
-- INSERT PICC SERVICES (16 services)
-- ============================================================================

INSERT INTO organization_services (organization_id, name, slug, description, service_category, is_active) VALUES
-- Health Services
('3c2011b9-f80d-4289-b300-0cd383cff479', 'Bwgcolman Healing Service', 'bwgcolman-healing', 'Traditional and contemporary healing services', 'health', TRUE),
('3c2011b9-f80d-4289-b300-0cd383cff479', 'Community Health', 'community-health', 'Primary health care services', 'health', TRUE),
('3c2011b9-f80d-4289-b300-0cd383cff479', 'Mental Health Services', 'mental-health', 'Mental health support and counseling', 'health', TRUE),

-- Family Services
('3c2011b9-f80d-4289-b300-0cd383cff479', 'Family Wellbeing Service', 'family-wellbeing', 'Support for families and children', 'family', TRUE),
('3c2011b9-f80d-4289-b300-0cd383cff479', 'Child Care Services', 'child-care', 'Early childhood education and care', 'family', TRUE),
('3c2011b9-f80d-4289-b300-0cd383cff479', 'Family Support', 'family-support', 'Family counseling and support services', 'family', TRUE),

-- Youth Services
('3c2011b9-f80d-4289-b300-0cd383cff479', 'Youth Services', 'youth-services', 'Programs and support for young people', 'youth', TRUE),
('3c2011b9-f80d-4289-b300-0cd383cff479', 'Youth Development', 'youth-development', 'Youth leadership and development programs', 'youth', TRUE),

-- Culture & Education
('3c2011b9-f80d-4289-b300-0cd383cff479', 'Cultural Programs', 'cultural-programs', 'Traditional culture and language programs', 'culture', TRUE),
('3c2011b9-f80d-4289-b300-0cd383cff479', 'Education Support', 'education-support', 'Educational programs and tutoring', 'education', TRUE),
('3c2011b9-f80d-4289-b300-0cd383cff479', 'Language & Culture', 'language-culture', 'Language preservation and cultural education', 'culture', TRUE),

-- Employment & Economic Development
('3c2011b9-f80d-4289-b300-0cd383cff479', 'Employment Services', 'employment-services', 'Job training and placement services', 'employment', TRUE),
('3c2011b9-f80d-4289-b300-0cd383cff479', 'Economic Development', 'economic-development', 'Business support and economic initiatives', 'employment', TRUE),

-- Community Services
('3c2011b9-f80d-4289-b300-0cd383cff479', 'Community Development', 'community-development', 'Community projects and initiatives', 'community', TRUE),
('3c2011b9-f80d-4289-b300-0cd383cff479', 'Sport & Recreation', 'sport-recreation', 'Sports programs and recreational activities', 'community', TRUE),
('3c2011b9-f80d-4289-b300-0cd383cff479', 'Housing Support', 'housing-support', 'Housing assistance and support', 'community', TRUE)

ON CONFLICT DO NOTHING;

-- Verify
SELECT
  o.name as organization,
  COUNT(s.id) as services_count
FROM organizations o
LEFT JOIN organization_services s ON o.id = s.organization_id
WHERE o.id = '3c2011b9-f80d-4289-b300-0cd383cff479'
GROUP BY o.id, o.name;

-- Should show: "Palm Island Community Company" with 16 services
```

**Expected result**: "Palm Island Community Company" with 16 services

---

## 🪣 STEP 4: Create Storage Buckets

In Supabase Dashboard:

1. Go to: https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/storage/buckets
2. Click "**Create bucket**"

### Create 3 buckets:

#### **Bucket 1: profile-images**
- Name: `profile-images`
- Public bucket: ✅ YES (checked)
- File size limit: 5 MB
- Allowed MIME types: `image/jpeg, image/png, image/webp`
- Click "Create bucket"

#### **Bucket 2: story-media**
- Name: `story-media`
- Public bucket: ✅ YES (checked)
- File size limit: 50 MB
- Allowed MIME types: `image/*, video/*, audio/*`
- Click "Create bucket"

#### **Bucket 3: documents**
- Name: `documents`
- Public bucket: ⬜ NO (unchecked) - controlled access
- File size limit: 20 MB
- Allowed MIME types: `application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Click "Create bucket"

---

## ✅ STEP 5: Verify Setup

Run this in SQL Editor to check everything is ready:

```sql
-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

DO $$
DECLARE
  table_count INTEGER;
  org_count INTEGER;
  service_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔍 SUPABASE SETUP VERIFICATION';
  RAISE NOTICE '================================================';
  RAISE NOTICE '';

  -- Check tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('profiles', 'stories', 'story_media', 'organizations', 'organization_services');

  RAISE NOTICE '📊 Core Tables: % of 5 created', table_count;

  -- Check organization
  SELECT COUNT(*) INTO org_count
  FROM organizations
  WHERE id = '3c2011b9-f80d-4289-b300-0cd383cff479';

  RAISE NOTICE '🏢 PICC Organization: %', CASE WHEN org_count = 1 THEN '✅ Created' ELSE '❌ Missing' END;

  -- Check services
  SELECT COUNT(*) INTO service_count
  FROM organization_services
  WHERE organization_id = '3c2011b9-f80d-4289-b300-0cd383cff479';

  RAISE NOTICE '🛠️  PICC Services: % of 16', service_count;

  -- Check storage buckets (you'll need to manually verify)
  RAISE NOTICE '';
  RAISE NOTICE '🪣 Storage Buckets (verify manually):';
  RAISE NOTICE '  ☐ profile-images (public)';
  RAISE NOTICE '  ☐ story-media (public)';
  RAISE NOTICE '  ☐ documents (private)';
  RAISE NOTICE '';

  IF table_count = 5 AND org_count = 1 AND service_count = 16 THEN
    RAISE NOTICE '✅ ✅ ✅ SETUP COMPLETE - READY FOR DATA MIGRATION! ✅ ✅ ✅';
  ELSE
    RAISE WARNING '⚠️  Some setup steps incomplete - review above';
  END IF;

  RAISE NOTICE '';
END $$;
```

---

## 📦 STEP 6: Ready for Data Migration

Once verification passes, you're ready to:

1. **Migrate 25 storytellers** (run `migrate_airtable_storytellers.sql`)
2. **Fetch transcript data** from external GitHub repo
3. **Download profile images** from Airtable (2-hour window!)
4. **Create stories** from transcripts
5. **Test the application** with real data

---

## 🎯 Indigenous Data Sovereignty Principles (Built In!)

Your setup now includes:

✅ **Community Control**: PICC organization owns all data
✅ **Access Controls**: RLS policies respect cultural sensitivity
✅ **Consent Management**: `cultural_permissions` table tracks all consents
✅ **Privacy Levels**: Stories can be public/community/restricted
✅ **Elder Approval**: Stories requiring elder approval are flagged
✅ **Face Recognition Consent**: Granular photo consent tracking
✅ **Data Residency**: Can self-host Supabase on Palm Island server later
✅ **Cultural Protocols**: Access levels and sensitivity ratings built in

---

## 🚨 Best Practices Implemented

### Security:
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Service role key only used server-side
- ✅ Anon key safe for client-side use
- ✅ Private documents bucket for sensitive files

### Performance:
- ✅ Indexes on foreign keys
- ✅ Full-text search indexes
- ✅ Vector indexes for semantic search (when enabled)

### Data Integrity:
- ✅ Foreign key constraints
- ✅ Check constraints for valid values
- ✅ Automated triggers for metrics
- ✅ Timestamps auto-updated

### Indigenous Data Rights:
- ✅ Consent tracked at granular level
- ✅ Cultural sensitivity levels
- ✅ Elder approval workflows
- ✅ Community vs. public access
- ✅ Revocable permissions

---

## 📋 Next Steps Checklist

- [ ] Copy API keys from Supabase dashboard
- [ ] Update `.env.local` with real credentials
- [ ] Run Query 1: Core schema (`schema.sql`)
- [ ] Run Query 2: Organizations & services
- [ ] Create 3 storage buckets
- [ ] Run verification query
- [ ] Ready to migrate data! 🚀

---

**Need help?** Ask me to walk you through any step!
