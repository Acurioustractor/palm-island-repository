# PICC Supabase Database - Direct Links & Sync Guide

## Project Reference
- **Project ID:** `uaxhjzqrdotoahjnxmbj`
- **Dashboard:** https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj

---

## Quick Links to All Tables

| Table | Records | Direct Link |
|-------|---------|-------------|
| **stories** | 66 (45 published) | [Open →](https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/editor/stories) |
| **profiles** | 54 (24 with photos) | [Open →](https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/editor/profiles) |
| **organization_services** | 48 | [Open →](https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/editor/organization_services) |
| **projects** | 5 | [Open →](https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/editor/projects) |
| **annual_reports** | 2 | [Open →](https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/editor/annual_reports) |
| **knowledge_entries** | 86 | [Open →](https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/editor/knowledge_entries) |
| **media_files** | 1,825 | [Open →](https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/editor/media_files) |
| **publications** | 1 | [Open →](https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/editor/publications) |
| **organizations** | 2 | [Open →](https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/editor/organizations) |

---

## Current Database State (Live)

### 📖 Stories
- **Total:** 66
- **Published:** 45 ✅
- **Pending Review:** 21

**Categories:**
- Community: 37
- Culture: 10
- Elders: 8
- Family: 4
- Youth: 2
- Education: 2
- Economic Development: 2
- Health: 1

[View all stories →](https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/editor/stories)

---

### 👤 Profiles
- **Total:** 54
- **With Photos:** 24 ✅
- **Elders:** 6

**Profiles with Photos:**
| Name | Type | Elder |
|------|------|-------|
| Clay Alfred | community_member | |
| Paige Tanner Hill | community_member | |
| Henry Doyle | community_member | |
| Roy Prior | service_provider | |
| Ruby Sibley | service_provider | |
| Uncle Frank Foster | elder | ✅ |
| Ferdys staff | service_provider | |
| Goonyun Anderson | community_member | |
| Rachel Atkinson | service_provider | |
| Aunty Ethel Robertson | elder | ✅ |
| Marjoyie Burns | elder | ✅ |
| + 13 more... | | |

[View all profiles →](https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/editor/profiles)

---

### 🏢 Services
- **Total Records:** 48
- **Unique Names:** 42 (some duplicates from multiple SQL runs)
- **Active:** 48

**Note:** There are duplicate service records. Consider deduplicating.

[View all services →](https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/editor/organization_services)

---

### 🚀 Projects
- **Total:** 5

| Project | Status | Hero Image |
|---------|--------|------------|
| Palm Island Photo Studio | in_progress | ❌ Missing |
| The Station | planning | ❌ Missing |
| Elders Cultural Trips | in_progress | ❌ Missing |
| On-Country Server | in_progress | ❌ Missing |
| Annual Report System | planning | ❌ Missing |

[View all projects →](https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/editor/projects)

---

### 📷 Media Files
- **Total:** 1,825

**By Page Context:**
| Context | Count |
|---------|-------|
| about | 885 |
| home | 107 |
| community | 8 |
| (untagged) | ~825 |

[View all media →](https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/editor/media_files)

**Storage Buckets:**
- [profile-images](https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/storage/buckets/profile-images)
- [media-files](https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/storage/buckets/media-files)
- [annual-reports](https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/storage/buckets/annual-reports)

---

## MCP Integration (Claude Code)

### Setup (Already Done)
```bash
claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp?project_ref=uaxhjzqrdotoahjnxmbj"
```

### Config File
`.mcp.json`:
```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=uaxhjzqrdotoahjnxmbj"
    }
  }
}
```

### Using MCP
After restarting Claude Code, you can:
- Query tables directly
- Create/modify schema
- Run SQL queries
- Manage data

**Note:** Requires re-authentication via browser on first use.

---

## Code ↔ Database Sync Issues

### Known Discrepancies

| Issue | Location | Status |
|-------|----------|--------|
| SQL files reference data that's already in Supabase | `*.sql` files | Outdated |
| Duplicate services | `organization_services` | Needs cleanup |
| Duplicate organizations | `organizations` | Needs cleanup |
| Some stories in SQL not matching Supabase | `import_storm_stories.sql` | Check needed |

### SQL Files in Codebase
These files are for **seeding new databases**, not syncing:

| File | Purpose | Supabase Status |
|------|---------|-----------------|
| `picc_complete_setup.sql` | Initial setup | ✅ Already run |
| `import_storm_stories.sql` | Storm stories | ✅ Already run |
| `populate_picc_2023_24_annual_report.sql` | 2023-24 data | ✅ Already run |
| `import_transcripts.sql` | Template only | N/A |

---

## Recommended Workflow

### For Database Changes

1. **Make changes in Supabase Dashboard first**
   - Use the Table Editor for data changes
   - Use SQL Editor for schema changes

2. **Generate migration file**
   ```bash
   supabase db diff -f migration_name
   ```

3. **Commit migration to code**
   ```bash
   git add supabase/migrations/
   git commit -m "Add migration: description"
   ```

### For Viewing Current State

**Option 1: Direct Links (Recommended)**
- Use the table links above

**Option 2: Supabase CLI**
```bash
supabase db dump -f current_schema.sql --schema-only
```

**Option 3: MCP (after restart)**
- Ask Claude to query the database

---

## Database Schema Reference

### Core Tables

```
organizations
├── profiles (via primary_organization_id)
│   └── stories (via storyteller_id)
├── organization_services
├── organization_members
├── projects
└── annual_reports
    ├── report_sections
    └── annual_report_stories

media_files (standalone, linked via page_context)
knowledge_entries (standalone)
publications (standalone)
```

### Key Foreign Keys

| Table | References |
|-------|------------|
| profiles.primary_organization_id | organizations.id |
| stories.storyteller_id | profiles.id |
| stories.organization_id | organizations.id |
| stories.service_id | organization_services.id |
| annual_report_stories.report_id | annual_reports.id |
| annual_report_stories.story_id | stories.id |

---

## Actions Needed

### Cleanup Tasks
- [ ] Deduplicate `organization_services` (48 → ~16 unique)
- [ ] Deduplicate `organizations` (2 → 1)
- [ ] Add hero images to 5 projects

### Content Tasks
- [ ] Review 21 submitted stories and publish
- [ ] Tag more media with `page_context`
- [ ] Add more publications

---

## Useful SQL Queries

### Count stories by status
```sql
SELECT status, COUNT(*)
FROM stories
GROUP BY status;
```

### Find profiles without photos
```sql
SELECT full_name, storyteller_type
FROM profiles
WHERE profile_image_url IS NULL
  AND storyteller_type IS NOT NULL;
```

### Find duplicate services
```sql
SELECT service_name, COUNT(*)
FROM organization_services
GROUP BY service_name
HAVING COUNT(*) > 1;
```

### Tag media files
```sql
UPDATE media_files
SET page_context = 'stories'
WHERE id IN ('...', '...');
```

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://uaxhjzqrdotoahjnxmbj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

*Last Updated: December 2025*
*Source of Truth: Supabase Dashboard*
