# 🎯 START HERE: Complete Database Setup

## Problem You're Having

You're seeing errors like:
- ❌ `relation "documents" does not exist`
- ❌ `column profiles.role does not exist`

**Root cause:** The base database schema hasn't been set up yet.

---

## ✅ One-Click Solution (5 Minutes)

### Step 1: Open Supabase SQL Editor

1. Go to: **https://supabase.com/dashboard**
2. Select your project
3. Click: **SQL Editor** (in left sidebar)

### Step 2: Run The Complete Setup

1. Open this file: **`COMPLETE_DATABASE_SETUP.sql`**
2. Press **Ctrl+A** (select all)
3. Press **Ctrl+C** (copy)
4. Go to Supabase SQL Editor
5. Press **Ctrl+V** (paste)
6. Click **"Run"** button (or press Ctrl+Enter)
7. Wait 10-15 seconds...
8. Look for: ✅ `Database setup complete!`

**Done!** 🎉

---

## What Just Happened?

This single migration created **everything** you need:

### ✅ Core Tables (20 tables total)
- `profiles` (with the missing `role` column!)
- `stories`
- `organizations`
- `annual_reports`
- `documents` (the missing table!)
- `storyteller_photos`
- `storyteller_relationships`
- And 13 more...

### ✅ AI Tables
- `story_embeddings` - For semantic search
- `document_embeddings` - For document search
- `themes` - AI-extracted themes
- `story_themes` - Theme relationships
- `story_quotes` - AI-extracted quotes
- `chat_sessions` - Research assistant
- `search_history` - Analytics

### ✅ Extensions
- `uuid-ossp` - UUID generation
- `vector` - pgvector for AI embeddings
- `pgcrypto` - Encryption

### ✅ Functions
- `find_similar_stories()` - Semantic story search
- `find_similar_documents()` - Semantic doc search
- `update_storyteller_stats()` - Statistics

### ✅ Triggers
- Auto-update timestamps
- Auto-update statistics

---

## Verify It Worked

After running, you should see at the bottom of the SQL editor:

```
✅ Database setup complete!
Next steps:
1. Create storage buckets in Supabase Storage
2. Configure RLS policies if needed
3. Add OpenAI API key to enable AI features
4. Generate embeddings for existing content
```

You can also run this verification query:

```sql
-- Check if everything is there
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public';
```

**Expected:** Should show ~20+ tables

---

## Next: Create Storage Buckets

After the migration succeeds, create these storage buckets:

1. In Supabase, click **Storage** (left sidebar)
2. Click **"New Bucket"**
3. Create these buckets (all public):

```
✅ documents
✅ profile-images
✅ media
✅ story-media
✅ storyteller-photos
```

For each bucket:
- **Name:** (as above)
- **Public:** ✅ Yes
- Click **Create**

---

## Then: Configure Your App

Update your `.env.local` file:

```bash
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI (For AI features - optional for now)
OPENAI_API_KEY=sk-proj-your-key-here

# Enable features
NEXT_PUBLIC_ENABLE_SEMANTIC_SEARCH=true
NEXT_PUBLIC_ENABLE_ANNUAL_REPORTS=true
```

---

## Finally: Test It Works

```bash
# Install dependencies
cd web-platform
npm install

# Run locally
npm run dev

# Open browser
http://localhost:3000
```

You should now be able to:
- ✅ Create user accounts
- ✅ Add stories
- ✅ Upload documents
- ✅ Create profiles
- ✅ Use semantic search (with OpenAI key)

---

## Troubleshooting

### "Error running SQL"
**Try:**
- Make sure you copied the ENTIRE file
- Make sure you're in SQL Editor, not the table viewer
- Try running in smaller chunks if needed

### "Extension already exists"
**This is fine!** The migration uses `IF NOT EXISTS` for safety.

### "Table already exists"
**This is fine!** The migration won't overwrite existing tables.

### Still having issues?
**Check:** Is this a brand new Supabase project, or did you already run some migrations?

If you already ran some migrations, you might need to:
1. Check which tables exist:
   ```sql
   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
   ```
2. Only run the parts that are missing

---

## 🎯 Quick Command Reference

```bash
# Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;

# Check if profiles.role column exists
SELECT column_name FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'role';

# Check if documents table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'documents'
);

# Check AI functions
SELECT routine_name FROM information_schema.routines
WHERE routine_name LIKE 'find_similar%';
```

---

## Files You Have

- **START_HERE_DATABASE_SETUP.md** ← You are here
- **COMPLETE_DATABASE_SETUP.sql** ← Run this in Supabase
- **DATABASE_MIGRATION_GUIDE.md** ← Detailed troubleshooting
- **QUICK_FIX_README.md** ← Old fix (ignore, use COMPLETE_DATABASE_SETUP.sql instead)

---

## What Makes This Different?

**Previous migrations** required running 6+ files in specific order:
1. Extensions
2. Base profiles
3. Organizations
4. Enhanced profiles
5. Documents
6. AI features

**This migration** does ALL of that in ONE file, in the correct order, with proper dependencies.

**Plus** it fixes the bugs:
- ✅ Adds `profiles.role` column (was missing)
- ✅ Creates `documents` table before AI tables (dependency order)
- ✅ Enables all required extensions
- ✅ Creates all indexes for performance

---

**Ready?** Just copy `COMPLETE_DATABASE_SETUP.sql` into Supabase SQL Editor and click Run!

**Questions?** Check `DATABASE_MIGRATION_GUIDE.md` for detailed troubleshooting.

🚀 You got this!
