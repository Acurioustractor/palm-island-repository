# Production & Development Plan
## Palm Island Community Platform - Build Plan

**Document Version:** 1.0
**Date:** November 5, 2025
**Purpose:** Actionable plan to build and deploy the Palm Island platform infrastructure

---

## Executive Summary

This document provides a **practical, step-by-step plan** to build and deploy the Palm Island Community Platform. This is the bridge between strategic planning and actual implementation.

**Timeline:** 90 days (3 months) for MVP
**Team Required:** 3-4 developers + 1 DevOps engineer
**Budget:** $50,000-$75,000 for MVP phase

**MVP Deliverables:**
1. ✅ Supabase infrastructure configured and integrated
2. ✅ On-country server deployed (or cloud staging environment)
3. ✅ Core platform features working (stories, upload, search)
4. ✅ First live annual report generated
5. ✅ Testing and quality assurance complete

---

## Sprint Plan Overview (90 Days)

```
┌────────────────────────────────────────────────────────────┐
│  90-Day MVP Development Sprints                             │
└────────────────────────────────────────────────────────────┘

Sprint 1 (Days 1-14): Infrastructure & Setup
├─ Supabase setup and configuration
├─ Database schema deployment
├─ Development environment
├─ CI/CD pipeline
└─ Team onboarding

Sprint 2 (Days 15-28): Core Features Development
├─ Story viewing and display
├─ Story submission
├─ Photo upload system
├─ User authentication
└─ Basic search

Sprint 3 (Days 29-42): Enhanced Features
├─ Advanced search
├─ Story relationships
├─ Media management
├─ Admin dashboard
└─ Mobile optimization

Sprint 4 (Days 43-56): Annual Report MVP
├─ Data aggregation system
├─ Report templates
├─ Automated generation
├─ PDF export
└─ Interactive web view

Sprint 5 (Days 57-70): On-Country Infrastructure (Optional)
├─ Server procurement and setup
├─ Local network configuration
├─ Data migration
├─ Backup systems
└─ Testing

Sprint 6 (Days 71-90): Testing, Launch & Training
├─ Full system testing
├─ Performance optimization
├─ Security audit
├─ User training
└─ Production launch
```

---

## Part 1: Team & Prerequisites

### 1.1 Team Roles

```
Development Team (3-4 people):

1. Tech Lead / Fullstack Developer
   ├─ Architecture decisions
   ├─ Code review
   ├─ Backend + Frontend development
   └─ 40 hours/week

2. Frontend Developer
   ├─ React/Next.js development
   ├─ UI/UX implementation
   ├─ Mobile optimization
   └─ 40 hours/week

3. Backend Developer
   ├─ API development
   ├─ Database design
   ├─ Integration work
   └─ 30 hours/week

4. DevOps Engineer (Part-time)
   ├─ Infrastructure setup
   ├─ CI/CD pipeline
   ├─ Monitoring
   └─ 20 hours/week

Optional:
├─ Designer (Part-time): 10 hours/week
├─ QA Tester (Part-time): 20 hours/week
└─ Technical Writer: 10 hours/week
```

### 1.2 Required Tools & Accounts

```
Development Tools:
├─ Code editor: VS Code or similar
├─ Git client: Git CLI
├─ Node.js: v18+ LTS
├─ Package manager: npm or pnpm
├─ Docker Desktop (for local development)
└─ Database client: DBeaver or pgAdmin

Accounts & Services:
├─ Supabase account (Pro plan: $25/month)
├─ Vercel account (Pro plan: $20/month)
├─ GitHub account (Team plan: $4/user/month)
├─ Cloudflare account (Free tier OK)
├─ OpenAI API key (for embeddings: ~$50/month)
└─ Domain name (palmisland.org.au or similar)

Communication:
├─ Slack or Microsoft Teams
├─ Jira or Linear (project management)
└─ Figma (for design collaboration)
```

### 1.3 Development Environment Setup

```bash
# Clone repository
git clone https://github.com/Acurioustractor/palm-island-repository.git
cd palm-island-repository/web-platform

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your credentials
# (We'll populate these in Sprint 1)

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## Part 2: Sprint 1 - Infrastructure & Setup (Days 1-14)

### Week 1: Supabase Setup

#### Day 1-2: Create Supabase Project

**Task 1.1: Create Supabase Project**

```bash
# 1. Go to https://supabase.com
# 2. Click "New Project"
# 3. Fill in details:
#    - Name: palm-island-production
#    - Database Password: [Generate strong password]
#    - Region: Sydney (ap-southeast-2)
#    - Pricing Plan: Pro ($25/month)

# 4. Wait for project provisioning (2-3 minutes)

# 5. Note down credentials:
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:[password]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

**Task 1.2: Configure Supabase Settings**

```sql
-- Enable required extensions
-- Run in Supabase SQL Editor

-- Vector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- PostGIS for geographic data
CREATE EXTENSION IF NOT EXISTS postgis;

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

**Task 1.3: Set up Storage Buckets**

```javascript
// Run in Supabase SQL Editor or via API

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('story-images', 'story-images', false),
  ('profile-photos', 'profile-photos', false),
  ('media-files', 'media-files', false),
  ('public-assets', 'public-assets', true);

-- Set up storage policies (Row Level Security)
-- Allow authenticated users to upload to story-images
CREATE POLICY "Authenticated users can upload story images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'story-images');

-- Allow users to view images they have access to
CREATE POLICY "Users can view authorized images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'story-images');

-- Public assets are viewable by anyone
CREATE POLICY "Anyone can view public assets"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'public-assets');
```

#### Day 3-4: Database Schema Deployment

**Task 1.4: Deploy Core Database Schema**

Create file: `web-platform/supabase/migrations/001_core_schema.sql`

```sql
-- ============================================
-- PALM ISLAND COMMUNITY PLATFORM
-- Core Database Schema v1.0
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- ORGANIZATIONS
-- ============================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  website TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert PICC as default organization
INSERT INTO organizations (name, slug, description) VALUES
('Palm Island Community Company', 'picc', 'Palm Island Community Company providing essential services to the Palm Island community');

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) DEFAULT (SELECT id FROM organizations WHERE slug = 'picc'),
  email TEXT,
  full_name TEXT,
  display_name TEXT,
  role TEXT CHECK (role IN ('admin', 'staff', 'community_member', 'elder', 'youth')) DEFAULT 'community_member',
  bio TEXT,
  avatar_url TEXT,

  -- Community context
  community_role TEXT, -- e.g., "Elder", "Youth Leader", "PICC Staff Member"
  service_affiliation TEXT, -- e.g., "Bwgcolman Healing Service"

  -- Permissions
  can_submit_stories BOOLEAN DEFAULT true,
  can_approve_stories BOOLEAN DEFAULT false,
  can_manage_content BOOLEAN DEFAULT false,
  can_view_analytics BOOLEAN DEFAULT false,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- SERVICES
-- ============================================

CREATE TABLE organization_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  service_type TEXT, -- e.g., "healing", "youth", "family", "education"
  staff_count INTEGER DEFAULT 0,
  contact_email TEXT,
  contact_phone TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, slug)
);

-- Insert PICC services
INSERT INTO organization_services (organization_id, name, slug, service_type) VALUES
((SELECT id FROM organizations WHERE slug = 'picc'), 'Bwgcolman Healing Service', 'bwgcolman-healing', 'healing'),
((SELECT id FROM organizations WHERE slug = 'picc'), 'Family Wellbeing Centre', 'family-wellbeing', 'family'),
((SELECT id FROM organizations WHERE slug = 'picc'), 'Youth Services', 'youth-services', 'youth'),
((SELECT id FROM organizations WHERE slug = 'picc'), 'Women''s Healing Service', 'womens-healing', 'healing'),
((SELECT id FROM organizations WHERE slug = 'picc'), 'Educational Services', 'educational-services', 'education');

-- ============================================
-- STORIES
-- ============================================

CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,

  -- Core content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT, -- Short summary for cards/search results

  -- Storyteller
  storyteller_id UUID REFERENCES profiles(id),
  storyteller_name TEXT, -- In case storyteller doesn't have account
  storyteller_role TEXT, -- e.g., "Elder", "Community Member"

  -- Categorization
  category TEXT[], -- e.g., ['health', 'culture']
  themes TEXT[], -- e.g., ['healing', 'traditional-medicine']
  tags TEXT[],

  -- Service affiliation
  service_id UUID REFERENCES organization_services(id),

  -- Geographic
  location_name TEXT, -- e.g., "Cultural Centre", "Bwgcolman"
  location_coordinates GEOGRAPHY(POINT, 4326), -- PostGIS point

  -- Temporal
  story_date DATE, -- When the event occurred
  time_period TEXT, -- e.g., "historical", "contemporary"

  -- Access control (Indigenous Data Sovereignty)
  access_level TEXT CHECK (access_level IN ('public', 'community', 'restricted')) DEFAULT 'community',
  data_sovereignty_tier TEXT CHECK (data_sovereignty_tier IN ('on-island-only', 'community-controlled', 'public-approved')) DEFAULT 'community-controlled',

  -- Permissions and approvals
  requires_elder_approval BOOLEAN DEFAULT false,
  elder_approved_by UUID REFERENCES profiles(id),
  elder_approved_at TIMESTAMP WITH TIME ZONE,

  -- Media
  featured_image_url TEXT,
  media_urls TEXT[], -- Array of media file URLs
  media_types TEXT[], -- Array of media types: 'image', 'video', 'audio'

  -- Engagement
  view_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMP WITH TIME ZONE,

  -- Search
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'C')
  ) STORED,
  embedding vector(1536), -- For semantic search

  -- Metadata
  metadata JSONB DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id)
);

-- Indexes
CREATE INDEX stories_organization_idx ON stories(organization_id);
CREATE INDEX stories_category_idx ON stories USING GIN(category);
CREATE INDEX stories_search_idx ON stories USING GIN(search_vector);
CREATE INDEX stories_embedding_idx ON stories USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX stories_location_idx ON stories USING GIST(location_coordinates);
CREATE INDEX stories_story_date_idx ON stories(story_date);

-- Enable Row Level Security
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public stories are viewable by everyone"
  ON stories FOR SELECT
  USING (access_level = 'public' AND published = true);

CREATE POLICY "Community members can view community stories"
  ON stories FOR SELECT
  TO authenticated
  USING (
    access_level IN ('public', 'community')
    AND published = true
  );

CREATE POLICY "Staff can view all non-restricted stories"
  ON stories FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles
      WHERE role IN ('admin', 'staff')
      AND organization_id = stories.organization_id
    )
    OR access_level != 'restricted'
  );

CREATE POLICY "Users can create stories"
  ON stories FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE can_submit_stories = true
    )
  );

-- ============================================
-- MEDIA FILES
-- ============================================

CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,

  -- File details
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Storage path
  file_type TEXT NOT NULL, -- 'image', 'video', 'audio', 'document'
  mime_type TEXT,
  file_size INTEGER, -- in bytes

  -- Media metadata
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- for video/audio in seconds

  -- Relationships
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES profiles(id),

  -- Access control
  access_level TEXT CHECK (access_level IN ('public', 'community', 'restricted')) DEFAULT 'community',
  data_sovereignty_tier TEXT CHECK (data_sovereignty_tier IN ('on-island-only', 'community-controlled', 'public-approved')) DEFAULT 'community-controlled',

  -- Cloud sync
  cloud_sync_allowed BOOLEAN GENERATED ALWAYS AS (
    CASE
      WHEN data_sovereignty_tier = 'public-approved' THEN true
      ELSE false
    END
  ) STORED,
  cloud_sync_approved_by UUID REFERENCES profiles(id),
  cloud_sync_approved_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  alt_text TEXT,
  caption TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX media_files_story_idx ON media_files(story_id);
CREATE INDEX media_files_type_idx ON media_files(file_type);

-- Enable RLS
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Media files follow story access rules"
  ON media_files FOR SELECT
  USING (
    CASE
      WHEN story_id IS NOT NULL THEN
        EXISTS (
          SELECT 1 FROM stories
          WHERE stories.id = media_files.story_id
          -- User can see the story
        )
      ELSE
        access_level = 'public'
    END
  );

-- ============================================
-- STORY RELATIONSHIPS
-- ============================================

CREATE TABLE story_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  related_story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  relationship_type TEXT NOT NULL, -- 'follows', 'references', 'related', 'part_of_series'
  strength FLOAT DEFAULT 1.0 CHECK (strength >= 0 AND strength <= 1), -- Relationship strength
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  UNIQUE(story_id, related_story_id, relationship_type)
);

-- Indexes
CREATE INDEX story_relationships_story_idx ON story_relationships(story_id);
CREATE INDEX story_relationships_related_idx ON story_relationships(related_story_id);

-- ============================================
-- COLLECTIONS
-- ============================================

CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,

  -- Collection details
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL,

  -- Type and visibility
  collection_type TEXT CHECK (collection_type IN ('curated', 'auto-generated', 'user-created')) DEFAULT 'curated',
  is_public BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,

  -- Creator
  created_by UUID REFERENCES profiles(id),

  -- Metadata
  cover_image_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, slug)
);

CREATE TABLE collection_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  order_index INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, story_id)
);

-- Indexes
CREATE INDEX collection_stories_collection_idx ON collection_stories(collection_id);
CREATE INDEX collection_stories_order_idx ON collection_stories(collection_id, order_index);

-- ============================================
-- ANALYTICS
-- ============================================

CREATE TABLE content_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  session_id TEXT,
  view_duration INTEGER, -- seconds
  completion_percentage FLOAT,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partitioning by month for performance (optional, can add later)
CREATE INDEX content_views_story_idx ON content_views(story_id);
CREATE INDEX content_views_created_idx ON content_views(created_at DESC);

-- ============================================
-- DATA ACCESS AUDIT LOG
-- ============================================

CREATE TABLE data_access_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,

  -- What was accessed
  resource_type TEXT NOT NULL, -- 'story', 'media_file', 'profile'
  resource_id UUID NOT NULL,

  -- Who accessed it
  accessed_by UUID REFERENCES profiles(id),
  ip_address INET,
  user_agent TEXT,

  -- Access details
  access_type TEXT NOT NULL, -- 'view', 'download', 'edit', 'delete', 'sync-to-cloud'
  access_location TEXT, -- 'on-island', 'external'
  success BOOLEAN NOT NULL,
  denial_reason TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX data_access_log_resource_idx ON data_access_log(resource_type, resource_id);
CREATE INDEX data_access_log_accessed_idx ON data_access_log(accessed_at DESC);
CREATE INDEX data_access_log_user_idx ON data_access_log(accessed_by);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_files_updated_at BEFORE UPDATE ON media_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_story_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stories
  SET view_count = view_count + 1
  WHERE id = NEW.story_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_views AFTER INSERT ON content_views
  FOR EACH ROW EXECUTE FUNCTION increment_story_views();

-- ============================================
-- SEED DATA (Sample stories)
-- ============================================

-- Note: We'll add seed data in a separate migration
-- This allows clean separation of schema and data

COMMIT;
```

**Task 1.5: Deploy Migration to Supabase**

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migration
supabase db push

# Verify schema
supabase db diff
```

#### Day 5-7: Development Environment

**Task 1.6: Configure Web Platform**

Update `web-platform/.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database
DATABASE_URL=postgresql://postgres:[password]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres

# App Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Palm Island Story Server

# Organization
NEXT_PUBLIC_DEFAULT_ORG_SLUG=picc

# Feature Flags
NEXT_PUBLIC_ENABLE_SEMANTIC_SEARCH=false
NEXT_PUBLIC_ENABLE_ANNUAL_REPORTS=false

# OpenAI (for embeddings, optional initially)
OPENAI_API_KEY=sk-...

# Analytics (optional)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=palmisland.org.au
```

**Task 1.7: Update Supabase Client Configuration**

Create/Update `web-platform/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient, createServerComponentClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Browser client (for client components)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Server client (for server components)
export const createServerSupabaseClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}

// Service role client (for admin operations)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Database types (will be generated)
export type Database = {
  public: {
    Tables: {
      // Types will be auto-generated from schema
    }
  }
}
```

**Task 1.8: Generate TypeScript Types**

```bash
# Generate TypeScript types from Supabase schema
npx supabase gen types typescript --project-id your-project-ref > web-platform/types/supabase.ts

# Update imports
# Now you have full type safety!
```

---

### Week 2: CI/CD and Infrastructure

#### Day 8-10: CI/CD Pipeline

**Task 1.9: GitHub Actions Setup**

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, staging, claude/**]
  pull_request:
    branches: [main, staging]

env:
  NODE_VERSION: '18'

jobs:
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: web-platform/package-lock.json

      - name: Install dependencies
        working-directory: ./web-platform
        run: npm ci

      - name: Run ESLint
        working-directory: ./web-platform
        run: npm run lint

      - name: Type check
        working-directory: ./web-platform
        run: npm run type-check

  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: web-platform/package-lock.json

      - name: Install dependencies
        working-directory: ./web-platform
        run: npm ci

      - name: Run tests
        working-directory: ./web-platform
        run: npm test
        env:
          CI: true

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: web-platform/package-lock.json

      - name: Install dependencies
        working-directory: ./web-platform
        run: npm ci

      - name: Build application
        working-directory: ./web-platform
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/staging'
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel Staging
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./web-platform
          scope: ${{ secrets.VERCEL_ORG_ID }}

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./web-platform
          scope: ${{ secrets.VERCEL_ORG_ID }}
```

**Task 1.10: Vercel Deployment Setup**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
cd web-platform
vercel link

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add DATABASE_URL

# Deploy to staging
vercel --env staging

# Deploy to production (when ready)
vercel --prod
```

#### Day 11-14: Seed Data & Testing

**Task 1.11: Create Seed Data**

Create `web-platform/supabase/seed.sql`:

```sql
-- ============================================
-- SEED DATA FOR PALM ISLAND PLATFORM
-- ============================================

-- Create sample profiles
INSERT INTO profiles (id, full_name, display_name, role, community_role, email)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Martha Johnson', 'Martha', 'community_member', 'Elder', 'martha@palmisland.test'),
  ('550e8400-e29b-41d4-a716-446655440001', 'William Thompson', 'William', 'community_member', 'Elder', 'william@palmisland.test'),
  ('550e8400-e29b-41d4-a716-446655440002', 'James Williams', 'James', 'community_member', 'Youth Leader', 'james@palmisland.test'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Sarah Anderson', 'Sarah', 'staff', 'PICC Staff - Bwgcolman Healing', 'sarah@picc.org.au');

-- Create sample stories
INSERT INTO stories (
  organization_id,
  title,
  content,
  summary,
  storyteller_id,
  storyteller_name,
  category,
  themes,
  service_id,
  location_name,
  story_date,
  access_level,
  published
) VALUES
(
  (SELECT id FROM organizations WHERE slug = 'picc'),
  'Finding Strength Through Healing Circle',
  'My journey with the Bwgcolman Healing Service began after experiencing profound loss. Through monthly healing circles, I found a safe space where traditional medicine combined with contemporary therapeutic approaches. The support of other community members and the guidance of our healing practitioners helped me find my voice again. I learned that healing happens in community, not isolation. Today, I share my story to encourage others to seek support when they need it.',
  'Martha shares her healing journey through Bwgcolman Healing Service monthly circles.',
  '550e8400-e29b-41d4-a716-446655440000',
  'Martha Johnson',
  ARRAY['health', 'healing'],
  ARRAY['traditional-medicine', 'community-support', 'grief', 'resilience'],
  (SELECT id FROM organization_services WHERE slug = 'bwgcolman-healing'),
  'Cultural Centre',
  '2024-03-15',
  'public',
  true
),
(
  (SELECT id FROM organizations WHERE slug = 'picc'),
  'Youth Basketball Program Success',
  'The youth basketball program has been more than just a sport for me and my mates. It''s given us purpose, discipline, and a sense of belonging. Every week we come together, learn from our coaches, and support each other on and off the court. The program has helped many of us stay focused on our goals and build friendships that will last a lifetime. We''re grateful to PICC Youth Services for believing in us.',
  'James describes how the basketball program has positively impacted youth on Palm Island.',
  '550e8400-e29b-41d4-a716-446655440002',
  'James Williams',
  ARRAY['youth', 'sports', 'community'],
  ARRAY['youth-development', 'sports', 'mentorship', 'community-building'],
  (SELECT id FROM organization_services WHERE slug = 'youth-services'),
  'Community Sports Ground',
  '2024-06-20',
  'public',
  true
),
(
  (SELECT id FROM organizations WHERE slug = 'picc'),
  'Traditional Healing Practices',
  'As an elder who has practiced traditional healing for over 40 years, I''ve seen the importance of passing this knowledge to younger generations. Traditional bush medicine, combined with modern understanding, offers powerful healing for our people. The Bwgcolman Healing Service respects both ways of knowing and creates space for our ancestral wisdom. This is how we maintain our culture while moving forward together.',
  'Elder William shares traditional healing knowledge and its integration with contemporary services.',
  '550e8400-e29b-41d4-a716-446655440001',
  'William Thompson',
  ARRAY['culture', 'health', 'healing'],
  ARRAY['traditional-knowledge', 'cultural-preservation', 'intergenerational', 'traditional-medicine'],
  (SELECT id FROM organization_services WHERE slug = 'bwgcolman-healing'),
  'Cultural Centre',
  '2024-01-10',
  'community',
  true
);

-- Create a sample collection
INSERT INTO collections (
  organization_id,
  title,
  description,
  slug,
  collection_type,
  is_public,
  featured
) VALUES
(
  (SELECT id FROM organizations WHERE slug = 'picc'),
  'Healing Journeys 2024',
  'Stories of healing and resilience from our community members',
  'healing-journeys-2024',
  'curated',
  true,
  true
);

-- Add stories to collection
INSERT INTO collection_stories (collection_id, story_id, order_index)
SELECT
  (SELECT id FROM collections WHERE slug = 'healing-journeys-2024'),
  id,
  ROW_NUMBER() OVER (ORDER BY created_at) - 1
FROM stories
WHERE 'healing' = ANY(category);

COMMIT;
```

Run seed data:

```bash
# Apply seed data
psql $DATABASE_URL -f web-platform/supabase/seed.sql

# Or via Supabase SQL editor
# Copy and paste the seed.sql content
```

---

## Sprint 1 Deliverables Checklist

```
✅ Supabase project created and configured
✅ Database schema deployed
✅ Storage buckets set up
✅ Row Level Security policies configured
✅ TypeScript types generated
✅ Development environment working
✅ CI/CD pipeline configured
✅ Vercel deployment set up
✅ Seed data loaded
✅ Team onboarded and ready
```

---

## Next Steps

**Sprint 2 Preview (Days 15-28):** Core Features Development
- Story viewing and display pages
- Story submission form
- Photo upload system
- User authentication flows
- Basic keyword search

**Sprint 3 Preview (Days 29-42):** Enhanced Features
- Advanced search with filters
- Story relationships and recommendations
- Media gallery and management
- Admin dashboard
- Mobile optimization

This production plan continues in the next file...

---

**Document Status:** Part 1 of 3 Complete
**Next:** PRODUCTION-DEVELOPMENT-PLAN-PART2.md (Sprints 2-4)
