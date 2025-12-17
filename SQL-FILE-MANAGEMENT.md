# SQL File Management Guide
## Cleaning Up the Chaos

---

## The Problem

You have **56 SQL files** scattered across the project:
- Root directory: 20+ files
- `lib/empathy-ledger/`: 15+ files
- `lib/empathy-ledger/migrations/`: 12 files
- `migrations/`: 4 files
- `supabase/migrations/`: 3 files
- `scripts/`: 1 file

**This causes:**
- Confusion about what's been run
- Duplicate data when files are run multiple times
- No clear source of truth
- Difficult to know current database state

---

## The Solution: Supabase Best Practices

### 1. Migrations = Schema Changes Only
**Location:** `supabase/migrations/`
**Purpose:** CREATE TABLE, ALTER TABLE, CREATE INDEX, etc.
**When they run:** `supabase db push` or `supabase migration up`

### 2. Seed Files = Initial Data Only
**Location:** `supabase/seed.sql` (or `supabase/seeds/*.sql`)
**Purpose:** INSERT statements for initial/test data
**When they run:** `supabase start` (first time) or `supabase db reset`

### 3. One-Time Scripts = Archive After Use
**Location:** `scripts/archived/` or delete
**Purpose:** Data imports, fixes, one-off operations
**When they run:** Manually, once, then archived

---

## Current File Classification

### ✅ PROPER MIGRATIONS (Keep in `supabase/migrations/`)
```
supabase/migrations/
├── 20251129110434_fix_storage_policies.sql
├── 20251202170100_photo_collections_and_smart_folders.sql
└── 20251207120000_publications.sql
```

### 📦 SHOULD BE ARCHIVED (Already run, move to `archive/`)
```
# Root directory - ALREADY IN SUPABASE
picc_complete_setup.sql              # ✅ Data exists
import_storm_stories.sql             # ✅ Data exists
populate_picc_2023_24_annual_report.sql  # ✅ Data exists

# These were one-time operations
add_new_people.sql
migrate_airtable_storytellers.sql
create_2024_annual_report.sql
step3_organizations_corrected.sql
step3_organizations_final.sql
```

### 🔧 UTILITY SCRIPTS (Keep for debugging)
```
CHECK_DATABASE_STATUS.sql
CHECK_PROFILE_PHOTOS.sql
VERIFY_DATA.sql
QUICK_CHECK.sql
check_all_profiles.sql
check_all_tables.sql
check_before_migration.sql
```

### 📝 TEMPLATES (Keep but rename)
```
import_transcripts.sql  → templates/import_transcript_template.sql
```

### ⚠️ DUPLICATES/REDUNDANT (Review and delete)
```
# Multiple versions of same thing:
lib/empathy-ledger/migrations/04_living_ledger.sql
lib/empathy-ledger/migrations/04_living_ledger_standalone.sql
lib/empathy-ledger/migrations/04b_living_ledger_add_fks.sql

# Multiple photo collection migrations:
supabase/migrations/20250129134500_photo_collections_and_smart_folders.sql
supabase/migrations/20251202170100_photo_collections_and_smart_folders.sql
```

---

## Recommended New Structure

```
web-platform/
├── supabase/
│   ├── migrations/           # SCHEMA ONLY - versioned
│   │   ├── 20251129110434_fix_storage_policies.sql
│   │   ├── 20251202170100_photo_collections.sql
│   │   └── 20251207120000_publications.sql
│   │
│   ├── seed.sql              # MAIN SEED FILE - imports from seeds/
│   │
│   └── seeds/                # DATA ONLY - organized by type
│       ├── 01_organizations.sql
│       ├── 02_services.sql
│       ├── 03_profiles.sql
│       ├── 04_stories.sql
│       └── 05_annual_reports.sql
│
├── scripts/
│   ├── utilities/            # Debugging/checking scripts
│   │   ├── check_database_status.sql
│   │   └── verify_data.sql
│   │
│   ├── templates/            # Templates for imports
│   │   └── import_transcript_template.sql
│   │
│   └── archived/             # Already-run one-time scripts
│       ├── 2024-11_picc_complete_setup.sql
│       ├── 2024-11_import_storm_stories.sql
│       └── README.md (explains what each did)
│
└── lib/empathy-ledger/       # LEGACY - schema reference only
    └── schema-reference/     # Rename migrations/ to this
```

---

## Workflow Going Forward

### Adding New Schema (Tables/Columns)

```bash
# 1. Create migration
supabase migration new add_feature_name

# 2. Edit the file in supabase/migrations/
# 3. Test locally
supabase db reset

# 4. Push to production
supabase db push
```

### Adding Seed Data

```bash
# 1. Add INSERT statements to supabase/seeds/XX_name.sql
# 2. Update supabase/seed.sql to include it
# 3. Test locally
supabase db reset

# 4. For production, run manually or use:
supabase db push --include-seed
```

### One-Time Data Import

```bash
# 1. Create script in scripts/ directory
# 2. Run against production
psql $DATABASE_URL -f scripts/my_import.sql

# 3. ARCHIVE the script
mv scripts/my_import.sql scripts/archived/2024-12_my_import.sql
```

---

## Cleaning Up: Action Plan

### Step 1: Create Archive Directory
```bash
mkdir -p web-platform/scripts/archived
mkdir -p web-platform/scripts/utilities
mkdir -p web-platform/scripts/templates
mkdir -p web-platform/supabase/seeds
```

### Step 2: Move Already-Run Files
```bash
# These have already been executed - archive them
mv picc_complete_setup.sql scripts/archived/
mv import_storm_stories.sql scripts/archived/
mv populate_picc_2023_24_annual_report.sql scripts/archived/
mv add_new_people.sql scripts/archived/
mv migrate_airtable_storytellers.sql scripts/archived/
mv create_2024_annual_report.sql scripts/archived/
mv POPULATE_2024_REPORT.sql scripts/archived/
```

### Step 3: Move Utility Scripts
```bash
mv CHECK_*.sql scripts/utilities/
mv VERIFY_*.sql scripts/utilities/
mv QUICK_CHECK.sql scripts/utilities/
mv check_*.sql scripts/utilities/
```

### Step 4: Move Templates
```bash
mv import_transcripts.sql scripts/templates/
```

### Step 5: Clean Up Legacy Location
```bash
# lib/empathy-ledger/migrations/ is confusing - rename or remove
mv lib/empathy-ledger/migrations lib/empathy-ledger/schema-reference
```

### Step 6: Delete Redundant Files
Review and delete:
- Duplicate migrations
- Fix scripts that have been applied
- Old setup files

---

## The Golden Rule

> **If it's in Supabase, the SQL file should be archived.**
>
> The database IS the source of truth. SQL files are just the history of how we got there.

---

## Checking What's Actually Applied

### See current schema
```bash
supabase db dump --schema-only > current_schema.sql
```

### See applied migrations
```bash
supabase migration list
```

### Compare local vs remote
```bash
supabase db diff
```

---

## MCP for Real-Time Sync

With the Supabase MCP configured, after restarting Claude Code:

```
# Ask Claude to:
- "Show me all tables in Supabase"
- "What's the schema for the stories table?"
- "How many rows in each table?"
```

This gives you **live database state** without confusion from SQL files.

---

## Summary

| Before | After |
|--------|-------|
| 56 SQL files scattered | Organized by purpose |
| No idea what's been run | Archived = already run |
| Duplicate runs = duplicate data | Clear workflow |
| SQL files = source of truth | Database = source of truth |

---

## Direct Links

- [Supabase Dashboard](https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj)
- [Database Migrations Guide](https://supabase.com/docs/guides/deployment/database-migrations)
- [Seeding Guide](https://supabase.com/docs/guides/local-development/seeding-your-database)

---

*The database is the truth. SQL files are just the story of how we got there.*
