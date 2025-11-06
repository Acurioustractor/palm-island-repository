# 🚨 QUICK FIX: Database Migration Error

## Problem
You're seeing this error:
```
ERROR: 42P01: relation "documents" does not exist
```

## Solution (2 Minutes)

### Option A: Run Migrations Separately (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project
   - Click: **SQL Editor** (left sidebar)

2. **Run Migration 3 First**
   - Open file: `database-migrations/003_document_system.sql`
   - Copy ALL contents (Ctrl+A, Ctrl+C)
   - Paste into SQL Editor
   - Click **"Run"** (or press Ctrl+Enter)
   - Wait for "Success ✓"

3. **Run Migration 4 Second**
   - Open file: `database-migrations/004_ai_features.sql`
   - Copy ALL contents
   - Paste into SQL Editor
   - Click **"Run"**
   - Wait for "Success ✓"

4. **Done!** ✅

---

### Option B: Run Combined Migration (Easier)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project
   - Click: **SQL Editor**

2. **Run Combined File**
   - Open file: `QUICK_FIX_run_migrations_3_and_4.sql`
   - Copy ALL contents
   - Paste into SQL Editor
   - Click **"Run"**
   - Wait for "Success ✓"

3. **Done!** ✅

---

## Verify It Worked

Run this query in SQL Editor:

```sql
-- Check if documents table exists
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('documents', 'story_embeddings', 'document_embeddings')
  AND table_schema = 'public';
```

**Expected Result:**
```
documents
story_embeddings
document_embeddings
```

If you see all 3 tables, you're good to go! ✅

---

## What Just Happened?

The migrations had to run in order:

1. ❌ You tried to run: **Migration 4** (AI Features)
2. ⚠️ Migration 4 needs: **documents table**
3. ✅ Migration 3 creates: **documents table**
4. 🎯 Solution: Run **Migration 3**, then **Migration 4**

Now they're both installed correctly!

---

## Next Steps

Now that migrations are complete:

1. **Generate embeddings for existing content**
   ```bash
   npm run generate-embeddings
   ```

2. **Test semantic search**
   - Go to: http://localhost:3000/research/semantic-search
   - Try a search query
   - See AI-powered results!

3. **Check the documentation**
   - Read: `AI_FEATURES_DOCUMENTATION.md`
   - Quick start: `AI_QUICK_START.md`

---

## Still Having Issues?

See the complete guide: `DATABASE_MIGRATION_GUIDE.md`

Or run this diagnostic:

```sql
-- Show all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

This will show what's in your database.

---

**You got this!** 🚀
