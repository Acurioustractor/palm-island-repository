# Service & Innovation Project Photo Relationships
Generated: 2026-02-21

## Summary
Services and innovation projects do NOT have direct photo columns in their tables. Instead, photos are linked via:
1. **Media Files Table** (`media_files`) using tags and page_context metadata
2. **Project Media Junction Table** (`project_media`) for innovation projects only
3. NO junction table exists for services — photos are linked purely through metadata

## Table Schemas

### organization_services (Services Table)
**Location:** `lib/empathy-ledger/migrations/03_organizations_and_annual_reports.sql` (lines 82-126)

**Photo-related columns:** NONE

**Full schema:**
```sql
CREATE TABLE IF NOT EXISTS organization_services (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  service_name TEXT NOT NULL,
  service_slug TEXT NOT NULL,
  description TEXT,
  service_category TEXT NOT NULL,
  manager_profile_id UUID REFERENCES profiles(id),
  staff_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE,
  clients_served_annual INTEGER,
  budget_annual DECIMAL,
  impact_categories TEXT[],
  story_count INTEGER DEFAULT 0,
  service_color TEXT,
  icon_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);
```

**Later additions:**
- `supabase/migrations/20260130_service_coordinates.sql` — adds lat/lng
- `supabase/migrations/20260212_service_relationships.sql` — adds parent_service_id
- `supabase/migrations/20260218_service_grants.sql` — creates service_grants table
- `supabase/migrations/20260218_service_notes.sql` — creates service_notes table
- `supabase/migrations/20260220_service_team_members.sql` — creates service_team_members table
- `supabase/migrations/20260220_service_activity_logs.sql` — creates service_activity_logs table

**NO photo columns added in any migration.**

---

### projects (Innovation Projects Table)
**Location:** `lib/empathy-ledger/projects-schema.sql` (lines 7-66)

**Photo-related columns:** 
- `hero_image_url TEXT` (line 40)
- `logo_url TEXT` (line 41)
- `gallery_images TEXT[]` (line 42)

**Full photo-related schema:**
```sql
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planning',
  project_type TEXT NOT NULL DEFAULT 'innovation',
  start_date DATE,
  target_completion_date DATE,
  
  -- Media
  hero_image_url TEXT,           -- Main hero image
  logo_url TEXT,                 -- Project logo
  gallery_images TEXT[],         -- Array of image URLs
  
  -- ... other fields
);
```

**Verification:** ✓ VERIFIED (Read file: `lib/empathy-ledger/projects-schema.sql`)

---

### project_media (Junction Table for Projects)
**Location:** `lib/empathy-ledger/projects-schema.sql` (lines 103-144)

**Full schema:**
```sql
CREATE TABLE IF NOT EXISTS project_media (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  update_id UUID REFERENCES project_updates(id) ON DELETE SET NULL,
  
  -- Media Info
  media_type TEXT NOT NULL,  -- photo, video, document, audio
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,   -- Path in Supabase storage
  file_size BIGINT,
  mime_type TEXT,
  
  -- Storage
  supabase_bucket TEXT DEFAULT 'project-media',
  
  -- Metadata
  title TEXT,
  description TEXT,
  caption TEXT,
  alt_text TEXT,
  photographer TEXT,
  credit TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  
  -- Display
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);
```

**Usage:** ✓ VERIFIED — used in `app/picc/projects/[slug]/page.tsx` line 89:
```typescript
const { data: media } = await supabase
  .from('project_media')
  .select('id, media_type, file_name, title, is_featured, created_at')
  .eq('project_id', project.id)
```

---

### media_files (Central Media Repository)
**Location:** Multiple migrations, primarily `lib/empathy-ledger/migrations/07_media_page_context.sql`

**Photo-to-service linking columns:**
- `tags TEXT[]` — e.g., `['service:health-services', 'hero']`
- `page_context TEXT` — e.g., `'home'`
- `page_section TEXT` — e.g., `'service-health-services'`
- `is_featured BOOLEAN` — marks cover photos
- `display_order INTEGER` — priority ranking

**How it works:**
```sql
-- A service cover photo has:
tags = ['service:health-services', 'hero']
page_context = 'home'
page_section = 'service-health-services'
is_featured = true
display_order = 0
```

**Set Cover Photo API:** `app/api/media/set-cover-photo/route.ts`
1. Unfeatures all existing covers for that service
2. Sets new photo's metadata:
   - Adds `service:{slug}` tag
   - Adds `hero` tag
   - Sets `page_context = 'home'`
   - Sets `page_section = 'service-{slug}'`
   - Sets `is_featured = true`

**Verification:** ✓ VERIFIED (Read file: `app/api/media/set-cover-photo/route.ts`)

---

## Architecture Patterns

### Services ↔ Photos (NO Junction Table)
```
organization_services (no photo columns)
         ↓
    LINKED VIA METADATA
         ↓
media_files
  - tags: ['service:slug', 'hero']
  - page_context: 'home'
  - page_section: 'service-slug'
  - is_featured: true
```

**Query pattern:**
```typescript
// Find cover photo for a service
const { data } = await supabase
  .from('media_files')
  .select('*')
  .eq('page_context', 'home')
  .eq('page_section', `service-${serviceSlug}`)
  .eq('is_featured', true)
  .limit(1)
```

**Fallback pattern:**
```typescript
// Tag-based fallback
const { data } = await supabase
  .from('media_files')
  .select('*')
  .contains('tags', [`service:${serviceSlug}`, 'hero'])
```

---

### Projects ↔ Photos (Dual System)

**System 1: Direct URL columns**
```
projects.hero_image_url → External URL or storage path
projects.logo_url → External URL or storage path
projects.gallery_images[] → Array of URLs
```

**System 2: Junction table**
```
projects
   ↓
project_media (junction)
   - project_id (FK)
   - file_path
   - media_type
   - is_featured
   - display_order
```

**Usage:** Both systems coexist. Junction table is preferred for rich media management (metadata, credits, captions), while direct URLs are simpler for basic use.

---

## Cover Photos Management

### Page: `/picc/media/cover-photos`
**File:** `app/picc/media/cover-photos/page.tsx`

**How it works:**
1. Loads all services via `/api/media/taxonomy` (queries `organization_services`)
2. For each service, checks for cover photo in two ways:
   - **Primary:** page_context-based query (`page_context=home&pageSection=service-{slug}&featured=true`)
   - **Fallback:** Tag-based query (`tags=hero` + filter by `service:{slug}`)
3. Displays grid of services with cover photo thumbnails
4. Click a service → opens MediaPickerDialog
5. Select photo → POSTs to `/api/media/set-cover-photo` → updates metadata

**Progress tracking:**
```typescript
const totalServices = services.length
const coveredServices = services.filter(s => coverPhotos[s.service_slug]).length
const progressPct = Math.round((coveredServices / totalServices) * 100)
```

---

## Key Files

| File | Purpose | Status |
|------|---------|--------|
| `lib/empathy-ledger/migrations/03_organizations_and_annual_reports.sql` | Services table schema | ✓ VERIFIED |
| `lib/empathy-ledger/projects-schema.sql` | Projects + project_media tables | ✓ VERIFIED |
| `app/api/media/set-cover-photo/route.ts` | API to assign cover photos to services | ✓ VERIFIED |
| `app/api/media/taxonomy/route.ts` | Lists all services + projects | ✓ VERIFIED |
| `app/picc/media/cover-photos/page.tsx` | UI for managing service cover photos | ✓ VERIFIED |
| `app/picc/projects/[slug]/page.tsx` | Shows project with project_media junction | ✓ VERIFIED |

---

## Data Counts

**Unable to verify live counts** — database connection failed via psql and supabase CLI.

**Expected query:**
```sql
SELECT COUNT(*) AS total_photos, 
       COUNT(DISTINCT page_section) AS services_with_photos
FROM media_files 
WHERE page_context = 'home' 
  AND page_section LIKE 'service-%' 
  AND is_featured = true;
```

---

## Open Questions

1. **Why no `service_media` junction table?**
   - Likely design decision to keep services lightweight
   - Media system uses flexible tagging instead of hard FK relationships
   - Allows one photo to belong to multiple services via multiple tags

2. **Why do projects get both direct URLs AND junction table?**
   - Legacy from earlier schema (direct URLs)
   - Junction table added later for richer metadata
   - Both coexist for backward compatibility

3. **What happens to orphaned tags?**
   - If a service is renamed/deleted, tags like `service:old-slug` become orphaned
   - No CASCADE delete on metadata changes
   - Cleanup would need manual query or scheduled job

---

## Recommendations

### For Services
If you need to query all photos for a service:
```typescript
// Primary query (recommended)
const { data } = await supabase
  .from('media_files')
  .select('*')
  .eq('page_context', 'home')
  .eq('page_section', `service-${serviceSlug}`)
  .order('is_featured', { ascending: false })
  .order('display_order', { ascending: true })

// Fallback query (broader)
const { data } = await supabase
  .from('media_files')
  .select('*')
  .contains('tags', [`service:${serviceSlug}`])
  .order('display_order', { ascending: true })
```

### For Projects
Use junction table for new code:
```typescript
const { data } = await supabase
  .from('project_media')
  .select('*')
  .eq('project_id', projectId)
  .order('is_featured', { ascending: false })
  .order('display_order', { ascending: true })
```

Only use direct URL fields (`hero_image_url`, `gallery_images`) if you need simple external image references without metadata.
