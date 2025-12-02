# 🗄️ Database Check & Setup Guide

## Current Status Check

Let me help you verify what's in your Supabase database and get everything connected.

---

## Step 1: Create Environment File

**On your Mac, in VS Code:**

1. Navigate to: `web-platform/` folder
2. Create new file: `.env.local` (copy from `.env.local.example`)
3. Add this content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk5MTU5OTksImV4cCI6MjAzNTQ5MTk5OX0.JGqYN9QyXfzWqZPJrFPGLxNz_lTXN2ydKI71hQGQ0e0
```

4. Save the file
5. **Restart the dev server** (Ctrl+C, then `npm run dev`)

---

## Step 2: Check What's in Supabase

### Option A: Using Supabase Dashboard (Easiest!)

1. Go to: https://supabase.com/dashboard
2. Sign in
3. Select project: `yvnuayzslukamizrlhwb`
4. Click **"Table Editor"** on left sidebar
5. Check these tables:
   - `profiles` - Your storytellers
   - `stories` - All stories
   - `organizations` - PICC organization
   - `services` - PICC services

### Option B: Using SQL in Supabase

1. In Supabase Dashboard
2. Click **"SQL Editor"**
3. Run this query:

```sql
-- Check storytellers
SELECT COUNT(*) as storyteller_count FROM profiles;

-- Check stories
SELECT COUNT(*) as story_count FROM stories;

-- See recent stories
SELECT id, title, created_at, storyteller_id
FROM stories
ORDER BY created_at DESC
LIMIT 10;

-- Check organizations
SELECT * FROM organizations;

-- Check services
SELECT * FROM services LIMIT 10;
```

---

## Step 3: What Data You Currently Have

Based on your repo, you should have:

### ✅ Storm Stories (26 stories)
- Located in: `web-platform/import_storm_stories.sql`
- These are from the Feb 2024 floods
- Should already be imported if you ran the SQL

### ✅ PICC Setup Data
- Located in: `web-platform/picc_complete_setup.sql`
- Organization data
- Services data
- Initial profiles

### 📝 To Add: Elder Stories (8 stories)
- You mentioned you have 8 elder stories to add
- We'll create an import template for these

---

## Step 4: Verify Connection in the App

Once you have `.env.local` set up and server restarted:

1. **Go to**: http://localhost:3000/stories
2. You should see stories loading!
3. **Go to**: http://localhost:3000/wiki/people
4. You should see storytellers!
5. **Go to**: http://localhost:3000/analytics
6. You should see counts and stats!

### If you see "No stories found":
- Check Supabase dashboard to confirm data is there
- Check browser console (F12) for errors
- Verify `.env.local` is correct
- Restart dev server

---

## Step 5: Check Current Storytellers

### In Supabase SQL Editor:

```sql
-- See all storytellers
SELECT
  id,
  full_name,
  preferred_name,
  bio,
  storyteller_type,
  created_at
FROM profiles
ORDER BY full_name;

-- Count stories per storyteller
SELECT
  p.full_name,
  p.preferred_name,
  COUNT(s.id) as story_count
FROM profiles p
LEFT JOIN stories s ON s.storyteller_id = p.id
GROUP BY p.id, p.full_name, p.preferred_name
ORDER BY story_count DESC;
```

---

## Step 6: Import Missing Data

### If Storm Stories Not Imported:

```bash
cd web-platform

# Connect to your Supabase database and run:
psql "postgresql://postgres.yvnuayzslukamizrlhwb:YOUR_PASSWORD@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres" < import_storm_stories.sql
```

**Or in Supabase Dashboard:**
1. Click **SQL Editor**
2. Open `import_storm_stories.sql` in VS Code
3. Copy the contents
4. Paste into Supabase SQL Editor
5. Click **Run**

### Run the Wiki Infrastructure Migration:

```bash
# This creates categories, knowledge graph tables, etc.
cd web-platform
psql "postgresql://postgres.yvnuayzslukamizrlhwb:YOUR_PASSWORD@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres" < migrations/001_wiki_infrastructure.sql
```

**Or in Supabase Dashboard:**
1. Copy contents of `migrations/001_wiki_infrastructure.sql`
2. Paste into SQL Editor
3. Run

---

## Step 7: Create Template for Elder Stories

I'll create a simple CSV/JSON template for your 8 elder stories:

**Format: `elder-stories-import.csv`**

```csv
title,content,storyteller_name,story_date,cultural_sensitivity,elder_approval
"Elder Story Title","The full story content here...","Elder Name","2024-01-15","high","true"
```

**Or JSON format: `elder-stories-import.json`**

```json
[
  {
    "title": "Elder Story Title",
    "content": "The full story content...",
    "storyteller_name": "Elder Name",
    "story_date": "2024-01-15",
    "story_category": "elder_care",
    "cultural_sensitivity_level": "high",
    "elder_approval_given": true,
    "access_level": "public"
  }
]
```

---

## Step 8: What You Should See Right Now

After setting up `.env.local` and restarting:

### ✅ Homepage (http://localhost:3000)
- Navigation sidebar on left
- Story cards
- Stats showing counts

### ✅ Stories Page (http://localhost:3000/stories)
- All your stories in a grid
- Search and filters
- Category badges

### ✅ People Page (http://localhost:3000/wiki/people)
- All storytellers
- Profile cards
- Story counts per person

### ✅ Analytics (http://localhost:3000/analytics)
- Total stories count
- Total storytellers count
- Category breakdown
- Recent activity

---

## Quick Checklist

- [ ] Create `.env.local` file in `web-platform/`
- [ ] Restart dev server (`npm run dev`)
- [ ] Check Supabase dashboard for existing data
- [ ] Verify stories load on http://localhost:3000/stories
- [ ] Verify storytellers load on http://localhost:3000/wiki/people
- [ ] Check analytics at http://localhost:3000/analytics
- [ ] Run wiki migration if categories aren't showing
- [ ] Prepare elder stories data for import

---

## Next Steps

1. **First**: Get `.env.local` set up and verify data is loading
2. **Then**: We'll tone down colors and refine the design
3. **Then**: Add your 8 elder stories
4. **Then**: Enhance the profile editor for managing storytellers
5. **Then**: Build analysis tools for the data

**Let me know what you see after Step 1!** 🚀
