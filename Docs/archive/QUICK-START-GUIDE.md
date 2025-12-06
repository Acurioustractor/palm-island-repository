# 🚀 Quick Start Guide - Palm Island Wiki Platform

## Get Your Wiki Running Locally in 5 Steps!

---

## Step 1: Create Environment File (30 seconds)

**In VS Code:**

1. Navigate to `web-platform/` folder
2. Create new file: `.env.local`
3. Copy this content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk5MTU5OTksImV4cCI6MjAzNTQ5MTk5OX0.JGqYN9QyXfzWqZPJrFPGLxNz_lTXN2ydKI71hQGQ0e0
```

4. Save (Cmd+S)

---

## Step 2: Verify Database Connection (1 minute)

**In Terminal:**

```bash
cd web-platform
node scripts/verify-database.js
```

**You should see:**
- ✓ Environment variables found
- ✓ Successfully connected to Supabase
- Count of stories, storytellers, organizations
- List of recent stories
- List of storytellers

**If you see errors:**
- Check that `.env.local` exists and has correct values
- Make sure you're in the `web-platform/` directory

---

## Step 3: Start the Development Server (30 seconds)

**In Terminal:**

```bash
cd web-platform
npm run dev
```

**Wait for:**
```
✓ Ready on http://localhost:3000
```

---

## Step 4: View Your Wiki! (Explore!)

**Open in your browser:**

1. **Homepage**: http://localhost:3000
   - See your stories and navigation

2. **All Stories**: http://localhost:3000/stories
   - Grid view of all stories with search

3. **Categories**: http://localhost:3000/wiki/categories
   - Browse stories by category

4. **People Directory**: http://localhost:3000/wiki/people
   - All storytellers with profiles and story counts

5. **Knowledge Graph**: http://localhost:3000/wiki/graph
   - Visual network of relationships

6. **Analytics Dashboard**: http://localhost:3000/analytics
   - Stats, metrics, and insights

7. **Search**: http://localhost:3000/search
   - Advanced search with filters

---

## Step 5: Check What Data You Have

**Three ways to check:**

### Option A: Use the Verification Script
```bash
cd web-platform
node scripts/verify-database.js
```

This shows exactly what's in your database!

### Option B: Use Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Sign in
3. Select project: `yvnuayzslukamizrlhwb`
4. Click **Table Editor**
5. Browse tables:
   - `stories` - All your stories
   - `profiles` - All storytellers
   - `organizations` - PICC organization
   - `services` - PICC services

### Option C: Use SQL Editor
1. In Supabase Dashboard → SQL Editor
2. Run this:

```sql
-- Quick overview
SELECT
  (SELECT COUNT(*) FROM stories) as total_stories,
  (SELECT COUNT(*) FROM profiles) as total_storytellers,
  (SELECT COUNT(*) FROM organizations) as total_organizations,
  (SELECT COUNT(*) FROM services) as total_services;

-- Recent stories
SELECT id, title, created_at, story_category
FROM stories
ORDER BY created_at DESC
LIMIT 10;

-- All storytellers
SELECT full_name, preferred_name, is_elder, location
FROM profiles
ORDER BY full_name;
```

---

## 📊 What Data Should Already Be There?

Based on your repository, you should have:

### ✅ Storm Stories (26 stories)
- From `import_storm_stories.sql`
- February 2024 flood stories
- **Check if imported**: Look for stories in Supabase or verify script output

### ✅ PICC Setup Data
- From `picc_complete_setup.sql`
- Organization information
- Services data
- Initial profiles

### 📝 To Add: Your 8 Elder Stories
- See next section!

---

## 🌟 Add Your 8 Elder Stories

### Method 1: Using the Import Script (Recommended!)

**Step 1: Prepare your data**

1. Copy `web-platform/scripts/elder-stories-data-example.json`
2. Rename to `elder-stories-data.json`
3. Fill in your 8 stories following the template

**Step 2: Run the import**

```bash
cd web-platform
node scripts/import-elder-stories.js scripts/elder-stories-data.json
```

The script will:
- ✓ Create storyteller profiles if they don't exist
- ✓ Import all 8 stories
- ✓ Show you a summary of what was imported

### Method 2: Manual Entry via Supabase Dashboard

1. Go to Supabase Dashboard → Table Editor
2. Click `stories` table
3. Click **Insert Row**
4. Fill in the fields
5. Click **Save**
6. Repeat for each story

### Method 3: Use SQL
See `ELDER-STORIES-IMPORT-TEMPLATE.md` for SQL templates

---

## 🎨 Next Steps After Setup

Once you have data loading, you mentioned wanting to:

### 1. Tone Down Colors
- We'll update the Tailwind color scheme
- Make the design more subtle and professional
- Keep cultural elements but soften the palette

### 2. Import Missing Data
- Storm stories (if not already imported)
- Your 8 elder stories
- Any other stories in Supabase

### 3. Build Analysis Tools
- Story analytics by category
- Storyteller contribution graphs
- Timeline views
- Impact metrics

### 4. Enhance Profile Editor
- Better profile management
- Photo uploads
- Rich bios with cultural info
- Connection management

---

## 🔧 Troubleshooting

### Dev server won't start
```bash
# Install dependencies first
cd web-platform
npm install

# Then try again
npm run dev
```

### "No stories found" on stories page
- Check Supabase dashboard to confirm data exists
- Check browser console (F12) for errors
- Verify `.env.local` is correct
- Run `node scripts/verify-database.js`

### Database connection fails
- Verify `.env.local` exists in `web-platform/`
- Check the Supabase URL and key are correct
- Make sure you have internet connection
- Try accessing Supabase dashboard directly

### Wiki navigation not showing
- Hard refresh the page (Cmd+Shift+R)
- Check console for errors
- Make sure you're on the latest code from the branch

---

## 📁 Project Structure

```
palm-island-repository/
├── web-platform/              # Next.js application
│   ├── app/                   # App router pages
│   │   ├── stories/          # Stories pages
│   │   ├── wiki/             # Wiki pages (categories, people, graph)
│   │   ├── search/           # Search page
│   │   └── analytics/        # Analytics dashboard
│   ├── components/           # React components
│   │   └── wiki/             # Wiki-specific components
│   ├── lib/                  # Utilities and configs
│   │   └── supabase/         # Supabase client
│   ├── scripts/              # Helper scripts
│   │   ├── verify-database.js       # Check DB connection
│   │   ├── import-elder-stories.js  # Import stories
│   │   └── elder-stories-data-example.json
│   ├── migrations/           # Database migrations
│   │   └── 001_wiki_infrastructure.sql
│   ├── .env.local           # Your environment variables (create this!)
│   └── package.json         # Dependencies
├── QUICK-START-GUIDE.md     # This file!
├── DATABASE-CHECK-AND-SETUP.md
├── ELDER-STORIES-IMPORT-TEMPLATE.md
├── WIKI-BUILD-COMPLETE.md
└── WIKI-DESIGN-ARCHITECTURE.md
```

---

## 🎯 Success Checklist

After following this guide, you should have:

- [x] `.env.local` file created
- [x] Database connection verified
- [x] Dev server running
- [x] Can see stories at http://localhost:3000/stories
- [x] Can see storytellers at http://localhost:3000/wiki/people
- [x] Can navigate the wiki sidebar
- [x] Know how many stories/storytellers you have
- [x] Ready to import your 8 elder stories

---

## 💡 Tips

1. **Keep the dev server running** while you work
2. **Use the verification script** whenever you want to check your data
3. **Browser DevTools** (F12) shows helpful error messages
4. **Hot reload** - changes to code update automatically
5. **Database changes** require page refresh to see

---

## 📞 Quick Reference Commands

```bash
# Start dev server
cd web-platform && npm run dev

# Check database
cd web-platform && node scripts/verify-database.js

# Import elder stories
cd web-platform && node scripts/import-elder-stories.js scripts/elder-stories-data.json

# Install dependencies
cd web-platform && npm install

# Run database migration (in Supabase Dashboard SQL Editor)
# Copy contents of migrations/001_wiki_infrastructure.sql and run
```

---

## 🌟 What You've Built

You now have a **world-class wiki-style knowledge management system** with:

- ✨ Beautiful navigation and discovery
- ✨ Rich story pages with metadata
- ✨ People directory with profiles
- ✨ Knowledge graph visualization
- ✨ Advanced search
- ✨ Analytics dashboard
- ✨ Category organization
- ✨ Mobile-responsive design
- ✨ Cultural sensitivity indicators
- ✨ Elder approval tracking

---

**Ready to explore your wiki!** 🎉

Open http://localhost:3000 and start navigating!
