# 🗄️ Database Migration Guide
## Palm Island Story Server - Complete Setup

**Problem:** Getting "relation does not exist" errors?
**Solution:** Run migrations in the correct order!

---

## ⚠️ Important: Migration Order Matters!

The migrations have dependencies. You MUST run them in this exact order:

---

## 📋 Step-by-Step Migration Process

### Step 1: Access Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your project: `palm-island-story-server`
3. Click: **SQL Editor** (left sidebar)
4. You should see a blank SQL editor

---

### Step 2: Run Base Schema (Empathy Ledger)

Run these migrations in order:

#### Migration 1A: Extensions
**File:** `web-platform/lib/empathy-ledger/migrations/01_extensions.sql`

```sql
-- Copy and paste this entire file into SQL Editor
-- Click "Run" or press Ctrl+Enter
```

**What it does:** Enables required PostgreSQL extensions (uuid-ossp, etc.)

---

#### Migration 1B: Profiles & Core Tables
**File:** `web-platform/lib/empathy-ledger/migrations/02_profiles.sql`

```sql
-- Copy and paste this entire file into SQL Editor
-- Click "Run"
```

**What it does:** Creates core tables (profiles, stories, etc.)

---

#### Migration 1C: Organizations & Reports
**File:** `web-platform/lib/empathy-ledger/migrations/03_organizations_and_annual_reports.sql`

```sql
-- Copy and paste this entire file into SQL Editor
-- Click "Run"
```

**What it does:** Creates organizations and annual reports tables

---

### Step 3: Run Enhanced Features

#### Migration 2: Enhanced Profiles
**File:** `database-migrations/002_enhanced_profiles.sql`

```sql
-- Copy and paste this entire file into SQL Editor
-- Click "Run"
```

**What it does:**
- Creates `storyteller_photos` table
- Creates `storyteller_relationships` table
- Creates `storyteller_stats` table
- Adds statistics functions

---

#### Migration 3: Document System ⭐ (REQUIRED BEFORE AI)
**File:** `database-migrations/003_document_system.sql`

```sql
-- Copy and paste this entire file into SQL Editor
-- Click "Run"
```

**What it does:**
- Creates `documents` table ← **This is what you're missing!**
- Creates `document_categories` table
- Creates `document_tags` table
- Adds full-text search

**✅ After this runs, the "documents" table will exist**

---

#### Migration 4: AI Features 🤖
**File:** `database-migrations/004_ai_features.sql`

```sql
-- Copy and paste this entire file into SQL Editor
-- Click "Run"
```

**What it does:**
- Enables pgvector extension
- Creates `story_embeddings` table
- Creates `document_embeddings` table (requires documents table!)
- Creates `themes`, `story_themes` tables
- Creates `story_quotes` table
- Creates chat and search tables
- Adds AI search functions

**⚠️ This will fail if you haven't run Migration 3 first!**

---

## ✅ Verify Migrations Worked

After running all migrations, verify they worked:

```sql
-- Check if all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**You should see these tables:**
```
✅ profiles
✅ stories
✅ organizations
✅ annual_reports
✅ storyteller_photos
✅ storyteller_relationships
✅ storyteller_stats
✅ documents                 ← From migration 3
✅ document_categories
✅ document_tags
✅ story_embeddings          ← From migration 4
✅ document_embeddings       ← From migration 4
✅ themes
✅ story_themes
✅ story_quotes
✅ chat_sessions
✅ chat_messages
✅ search_history
✅ saved_searches
```

---

## 🔍 Check Specific Tables

### Check if documents table exists:
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'documents'
);
```

**Expected:** `true`

---

### Check if pgvector extension is enabled:
```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

**Expected:** Should return one row with pgvector info

---

### Check if AI functions exist:
```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%similar%';
```

**Expected:** Should show `find_similar_stories` and `find_similar_documents`

---

## 🐛 Troubleshooting Common Errors

### Error: "relation 'documents' does not exist"
**Cause:** You tried to run migration 004 before 003
**Solution:** Run migration 003 first, then run 004 again

---

### Error: "extension 'vector' does not exist"
**Cause:** pgvector extension not enabled
**Solution:**
1. Make sure you're on Supabase (pgvector is pre-installed)
2. Run this first:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

---

### Error: "relation 'profiles' does not exist"
**Cause:** Base schema not created
**Solution:** Run the empathy ledger migrations first (Step 2)

---

### Error: "permission denied"
**Cause:** Using anon key instead of service role
**Solution:** Make sure you're running in Supabase SQL Editor (has admin access)

---

### Error: "column already exists"
**Cause:** Migration already ran
**Solution:** This is usually safe to ignore. The migration uses `IF NOT EXISTS` for most operations.

---

## 🚀 Quick Migration Script

If you want to run all migrations at once, you can combine them:

**⚠️ WARNING:** Only do this if you have a fresh database!

```bash
# In your local terminal (not SQL editor)

# Make sure you're in the right directory
cd /home/user/palm-island-repository

# Combine all migrations into one file
cat \
  web-platform/lib/empathy-ledger/migrations/01_extensions.sql \
  web-platform/lib/empathy-ledger/migrations/02_profiles.sql \
  web-platform/lib/empathy-ledger/migrations/03_organizations_and_annual_reports.sql \
  database-migrations/002_enhanced_profiles.sql \
  database-migrations/003_document_system.sql \
  database-migrations/004_ai_features.sql \
  > complete_migration.sql

echo "Complete migration created: complete_migration.sql"
echo "Copy this file's contents into Supabase SQL Editor and run it"
```

Then:
1. Open `complete_migration.sql`
2. Copy ALL contents
3. Paste into Supabase SQL Editor
4. Run once

---

## 📦 Storage Buckets Setup

After migrations, create these storage buckets in Supabase:

1. Go to: **Storage** (left sidebar)
2. Click: **New Bucket**
3. Create these buckets:

```
✅ documents               (Public)
✅ profile-images         (Public)
✅ media                  (Public)
✅ story-media            (Public)
✅ storyteller-photos     (Public)
```

For each bucket:
- Name: (as above)
- Public: ✅ Yes
- Allowed MIME types: Leave empty (allow all)
- Max file size: 50 MB

---

## 🔐 Row Level Security (RLS)

After creating tables, you may want to set up RLS policies. Basic example:

```sql
-- Enable RLS on documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Documents are viewable by everyone"
ON documents FOR SELECT
USING (access_level = 'public');

-- Allow authenticated users to insert
CREATE POLICY "Authenticated users can create documents"
ON documents FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
```

---

## ✅ Final Verification Checklist

After all migrations:

- [ ] All 4 migrations ran without errors
- [ ] `documents` table exists (run verification query)
- [ ] `story_embeddings` table exists
- [ ] `document_embeddings` table exists
- [ ] pgvector extension enabled
- [ ] AI functions created (`find_similar_stories`, etc.)
- [ ] Storage buckets created
- [ ] RLS policies configured (optional)
- [ ] Can connect from application

---

## 🎯 What To Do Right Now

**You are here:** ❌ Migration 4 failed because `documents` table doesn't exist

**Next steps:**

1. **Open Supabase SQL Editor**
   - https://supabase.com/dashboard → Your Project → SQL Editor

2. **Run Migration 3 (Document System)**
   - Open: `database-migrations/003_document_system.sql`
   - Copy entire contents
   - Paste in SQL Editor
   - Click "Run"
   - Wait for "Success" message

3. **Run Migration 4 Again (AI Features)**
   - Open: `database-migrations/004_ai_features.sql`
   - Copy entire contents
   - Paste in SQL Editor
   - Click "Run"
   - Should work now! ✅

4. **Verify Success**
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_name IN ('documents', 'story_embeddings', 'document_embeddings');
   ```
   Should return all 3 tables.

---

## 📞 Still Having Issues?

Run this diagnostic query and share the results:

```sql
-- Diagnostic Query
SELECT
  'Tables' as type,
  COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'

UNION ALL

SELECT
  'Extensions' as type,
  COUNT(*) as count
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'vector')

UNION ALL

SELECT
  'Functions' as type,
  COUNT(*) as count
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE 'find_similar%';
```

This will show what's currently in your database.

---

**Ready to fix it?** Start with Migration 3! 🚀
