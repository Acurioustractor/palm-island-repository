# 🚀 Quick Start: Import Storm Stories

## ⚡ Fastest Method (2 minutes)

Since your Supabase is already configured, here are the 3 quickest ways to import:

---

## Method 1: Direct SQL Import (RECOMMENDED)

### Step 1: Get your Database URL from .env.local
```bash
cd "/Users/benknight/Code/Palm Island Reposistory/web-platform"
grep DATABASE_URL .env.local
```

### Step 2: Run the import
```bash
# From repository root
cd "/Users/benknight/Code/Palm Island Reposistory"
psql "YOUR_DATABASE_URL_FROM_STEP_1" < import_storm_stories.sql
```

**Expected Output:**
```
NOTICE:  🌪️  Importing Palm Island Storm Stories...
NOTICE:  ✅ Created/found profiles for unidentified speakers
NOTICE:  🎉 ALL STORM STORIES IMPORTED!
NOTICE:  ✅ ALL 26 storm-related stories added
```

---

## Method 2: Supabase SQL Editor (NO INSTALL NEEDED)

### Step 1: Copy the SQL file
```bash
cd "/Users/benknight/Code/Palm Island Reposistory"
cat import_storm_stories.sql | pbcopy  # Copies to clipboard on Mac
```

### Step 2: Paste and run in Supabase
1. Go to: https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/editor
2. Click "SQL Editor" in sidebar
3. Click "+ New query"
4. Paste the copied SQL
5. Click "Run" (▶️ button)
6. Wait for success messages

---

## Method 3: Node.js Script (REQUIRES NPM INSTALL)

### Step 1: Install dependencies
```bash
cd "/Users/benknight/Code/Palm Island Reposistory/web-platform"
npm install  # Installs tsx, dotenv, and other dependencies
```

### Step 2: Run import script
```bash
npm run import:storm-stories
```

**Expected Output:**
```
🌪️  Storm Stories Import Script
================================================

📝 Step 1: Setting up storyteller profiles...
  ✓ Created Community Voice profile
  ✓ Created Men's Group profile
  ✓ Created Elders Group profile
  ✓ Created Playgroup Staff profile
✅ Profiles ready

🏢 Step 2: Finding PICC services...
  ✓ Found mens_programs service
  ✓ Found bwgcolman_healing service
  ✓ Found elder_support service
  ✓ Found early_learning service
✅ Services found

📚 Step 3: Importing 26 storm stories...
  ✓ Imported: Finding Purpose Beyond Addiction - Men's Group
  ✓ Imported: Clay Alfred: Prepared for the Storm
  ...
✅ All stories imported

🔍 Step 4: Verifying import...
  ✓ Total stories in database: 26+
✅ Verification complete

================================================
🎉 SUCCESS! Storm stories have been imported.
================================================
```

---

## ⚠️ Troubleshooting

### Error: "psql: command not found"
**Solution:** Install PostgreSQL client
```bash
brew install postgresql@15  # macOS
```

### Error: "relation 'profiles' does not exist"
**Problem:** Database migrations haven't been run yet.

**Solution:** Run migrations first in Supabase SQL Editor:

1. Go to: https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/editor
2. Run these files in order:
   - `web-platform/lib/empathy-ledger/migrations/01_extensions.sql`
   - `web-platform/lib/empathy-ledger/migrations/02_profiles.sql`
   - `web-platform/lib/empathy-ledger/migrations/03_organizations_and_annual_reports.sql`

### Error: "authentication failed"
**Problem:** Database URL or credentials are incorrect.

**Solution:** Check your .env.local file has real values (not placeholders like `YOUR_PASSWORD_HERE`)

---

## ✅ Verify Import Worked

### Check via Supabase Dashboard:
1. Go to: https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/editor
2. Run this query:
```sql
SELECT COUNT(*) as total FROM stories;
```

Should see 26+ stories.

### Check on Website:
```bash
cd "/Users/benknight/Code/Palm Island Reposistory/web-platform"
npm run dev
```

Then visit:
- http://localhost:3000/stories (should see storm stories)
- http://localhost:3000/stories/cyclone-2019 (cyclone narrative)

---

## 🎯 What Gets Imported

- ✅ **26 storm stories**
- ✅ **4 group profiles** (Community Voice, Men's Group, Elders, Playgroup Staff)
- ✅ **8 categories** (mens_health, housing, elder_care, community, culture, justice, education, environment)
- ✅ **Links to services** (Men's Programs, Healing, Elder Support, Early Learning)
- ✅ **All published** and searchable

---

## 🚨 Need Help?

If you get stuck:
1. Share the error message
2. I'll help troubleshoot
3. We can try an alternative method

**Most Common Issue:** Database migrations not run yet.
**Quick Fix:** Run migrations in Supabase SQL Editor first (see Troubleshooting above)

---

**Ready? Pick a method and run it!** 🎉
