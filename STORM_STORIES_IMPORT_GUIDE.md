# 🌪️ Storm Stories Import Guide

## Overview

This guide will help you import **26 authentic storm stories** from the 2019 cyclone into your Palm Island Story Server database.

---

## 📊 What Will Be Imported

### Stories Breakdown:
- **26 total stories** about the 2019 cyclone and recovery
- **4 Men's Health & Recovery stories** - Men's group, Clay Alfred, addiction recovery
- **7 Housing & Infrastructure stories** - Agnes Watten, Ellen Friday, damage reports
- **4 Elder Wisdom stories** - Elder consultations, historical trauma, governance
- **3 Community Services stories** - Playgroup flooding, PIC workers, emergency response
- **4 Systemic Issues stories** - Christopher on inequality, justice issues
- **4 Cultural Preservation stories** - Gail Larry (artist), native title, traditional names

### Storytellers:
- **Community Voice** (generic profile for unidentified speakers)
- **Men's Group** (collective)
- **Elders Group** (collective)
- **Playgroup Staff Team**
- Individual storytellers: Clay Alfred, Patricia & Kranjus Doyle, Agnes Watten, Ellen Friday, Gregory, Gail Larry, Craig, Margaret Rose Parker, and more

### Categories:
- `mens_health` - Men's programs and recovery
- `housing` - Housing damage and repairs
- `elder_care` - Elder support and wisdom
- `education` - Playgroup and schools
- `justice` - Community justice issues
- `culture` - Cultural preservation and native title
- `community` - General community resilience
- `environment` - Storm impact and infrastructure

---

## 🔑 Step 1: Get Your Supabase Credentials

### You Need 3 Keys:

1. **Go to your Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/settings/api

2. **Copy these values:**
   - **Project URL**: `https://uaxhjzqrdotoahjnxmbj.supabase.co` (already in .env.local)
   - **Anon/Public Key**: Copy from "Project API keys" → anon/public
   - **Service Role Key**: Copy from "Project API keys" → service_role (⚠️ keep secret!)

3. **Find your Database Password:**
   - Go to: https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/settings/database
   - If you don't have it saved, you may need to reset it

---

## 📝 Step 2: Update Your .env.local File

Open `/web-platform/.env.local` and replace the placeholders:

```bash
# Replace these lines:
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD_HERE@db.uaxhjzqrdotoahjnxmbj.supabase.co:5432/postgres

# With your actual values:
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your actual key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your actual key)
DATABASE_URL=postgresql://postgres:your-actual-password@db.uaxhjzqrdotoahjnxmbj.supabase.co:5432/postgres
```

---

## 🚀 Step 3: Choose Your Import Method

### Option A: Direct SQL Import (Recommended)

1. **Install PostgreSQL client** (if not already installed):
   ```bash
   # macOS
   brew install postgresql

   # Ubuntu/Debian
   sudo apt-get install postgresql-client

   # Windows - Download from postgresql.org
   ```

2. **Run the import**:
   ```bash
   # From the repository root
   psql "postgresql://postgres:YOUR_PASSWORD@db.uaxhjzqrdotoahjnxmbj.supabase.co:5432/postgres" < import_storm_stories.sql
   ```

3. **You should see output like**:
   ```
   NOTICE:  🌪️  Importing Palm Island Storm Stories...
   NOTICE:  ✅ Created/found profiles for unidentified speakers
   NOTICE:
   NOTICE:  🎉 ALL STORM STORIES IMPORTED!
   NOTICE:  ================================================
   NOTICE:  ✅ ALL 26 storm-related stories added
   ```

### Option B: Supabase SQL Editor (Web-based)

1. Go to: https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/editor
2. Click "SQL Editor" in left sidebar
3. Click "+ New query"
4. Copy the entire contents of `import_storm_stories.sql`
5. Paste into the editor
6. Click "Run" (▶️ button)
7. Check for success messages in output

### Option C: Node.js Import Script (Coming Soon)

We can create a TypeScript/Node.js script that uses the Supabase client if you prefer programmatic import.

---

## ✅ Step 4: Verify the Import

### Check Stories Were Created:

1. **Via Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/editor
   - Run this query:
   ```sql
   SELECT
     COUNT(*) as total_stories,
     story_category,
     COUNT(*) as count
   FROM stories
   WHERE story_type IN ('impact_story', 'personal_story', 'community_story', 'service_story', 'traditional_knowledge')
   GROUP BY story_category
   ORDER BY count DESC;
   ```

2. **Expected Results:**
   - Should see ~26+ stories across multiple categories
   - Categories: mens_health, housing, elder_care, community, culture, justice, education, environment

### Check Profiles Were Created:

```sql
SELECT full_name, storyteller_type, stories_contributed
FROM profiles
WHERE full_name IN ('Community Voice', 'Men''s Group', 'Elders Group', 'Playgroup Staff')
ORDER BY full_name;
```

Expected:
- Community Voice (community_member)
- Elders Group
- Men's Group
- Playgroup Staff (service_provider)

---

## 🌐 Step 5: View Stories on Your Website

### Start Your Development Server:

```bash
cd web-platform
npm install  # if you haven't already
npm run dev
```

### Visit These Pages:

1. **All Stories Page:**
   - http://localhost:3000/stories
   - Should see storm stories mixed with existing stories

2. **Cyclone Narrative Page:**
   - http://localhost:3000/stories/cyclone-2019
   - Beautiful scroll-based storytelling experience

3. **Filter by Category:**
   - Click category filters to see storm stories grouped
   - Try "Community", "Housing", "Elder Care", "Men's Health"

4. **Search for Storm Content:**
   - Search for: "storm", "cyclone", "flood", "power outage"
   - Should return relevant stories

---

## 🎯 Step 6: Feature Storm Stories

### Add Storm Category Filter:

The stories page should automatically show category filters including:
- Housing (7 stories)
- Men's Health (4 stories)
- Community (multiple stories)
- Elder Care (4 stories)

### Link from Cyclone Page:

The `/stories/cyclone-2019` page already exists with a beautiful narrative. After import, you can:

1. Add "Read Community Stories" button that filters to storm-related stories
2. Feature specific storm stories in the narrative sections
3. Add photo galleries when available

---

## 📊 Sample Story Titles You'll See:

1. **Finding Purpose Beyond Addiction - Men's Group**
2. **Clay Alfred: Prepared for the Storm**
3. **Sisters Patricia and Kranjus: Community Strength During the Storm**
4. **Agnes Watten: $5,000 in Storm Damage**
5. **Thomas the Tanker, Margaret & Venus: Storm Veterans**
6. **Community Innovation: Beds, Washing Machines, and Orange Sky**
7. **Storm, History, and Healing: Breaking Generational Trauma**
8. **Christopher: The Storm Revealed Government Failures**
9. **Ellen Friday: Still Waiting for a Fridge**
10. **Storytelling, Data Sovereignty, and Community Recovery**
11. **Rodney, Daniel & George: 24 Hours Without Power**
12. **Gregory: Worse Rain Than 50 Years of Cyclones**
13. **Playgroup Closed for Weeks: Building Flooded**
14. **Gail Larry: Artist Calls for Stronger Infrastructure**
15. **Craig: Walking Palm Island Through the Storm**
16. **Margaret Rose Parker (75): Justice, DV Support & Storm Response**
17. **James, Jordan & Stanley: PIC Emergency Response**
18. **Elders Speak: "We Should Have Been Consulted"**
19. **Catherine (66): Still No Repairs**
20. **Technology Challenges: Drones and Documentation**
21. **At the Mountain During the Storm: A Story of Fear**
22. **Preserving History: The Centenary Exhibition**
23. **Gunnamaru and Bugumanbara: Reclaiming Traditional Names**
24. **Angela: Documenting the Storm Through Photos**
25. **Community Voice Fragment: "What's On Here"**
26. **Group Conversation: Innovation and Expensive Goods**

---

## 🔍 Troubleshooting

### Error: "relation 'organization_services' does not exist"

**Problem**: Database migrations haven't been run yet.

**Solution**: Run the migrations first:
```bash
# In Supabase SQL Editor, run these in order:
# 1. lib/empathy-ledger/migrations/01_extensions.sql
# 2. lib/empathy-ledger/migrations/02_profiles.sql
# 3. lib/empathy-ledger/migrations/03_organizations_and_annual_reports.sql
```

### Error: "profile 'Clay Alfred' not found"

**Problem**: Individual storyteller profiles don't exist yet.

**Solution**: The import script creates group profiles (Community Voice, Men's Group, etc.) but links to individual profiles where they exist. This is OK - stories will be attributed to "Community Voice" if individual profiles aren't found.

To add individual profiles later:
```sql
-- Example for Clay Alfred
INSERT INTO profiles (full_name, preferred_name, storyteller_type, location)
VALUES ('Clay Alfred', 'Clay', 'community_member', 'Palm Island');
```

### Error: "authentication required"

**Problem**: Database credentials are incorrect.

**Solution**: Double-check your password and service role key in .env.local

---

## 🎉 Success Indicators

You'll know the import worked when you see:

✅ 26+ stories in your database
✅ Storm stories appear on /stories page
✅ Category filters show storm content
✅ Search returns storm-related stories
✅ "Community Voice" profile has 15+ stories
✅ Men's Group profile has multiple stories
✅ Elders Group profile has stories
✅ Stories link to PICC services (Men's Programs, Healing Service, etc.)

---

## 🚀 Next Steps After Import

1. **Add Photos**: Upload storm damage photos to story_media table
2. **Link to Cyclone Page**: Feature stories on /stories/cyclone-2019
3. **Create Storm Report**: Use stories for 2019 annual report section
4. **Tag for Search**: Stories are already categorized and searchable
5. **Community Review**: Have PICC review for accuracy and permissions

---

## 📞 Need Help?

If you encounter issues:

1. Check Supabase logs: https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/logs
2. Verify migrations are run: Check if `profiles` and `stories` tables exist
3. Test database connection: Try a simple SELECT query in SQL Editor
4. Review .env.local: Make sure no spaces or quotes around values

---

## 📋 Quick Reference

**Supabase Project ID**: `uaxhjzqrdotoahjnxmbj`
**Database**: PostgreSQL 15
**Import File**: `import_storm_stories.sql` (675 lines)
**Stories**: 26 total
**New Profiles**: 4 (Community Voice, Men's Group, Elders Group, Playgroup Staff)
**Categories**: 8 (mens_health, housing, elder_care, education, justice, culture, community, environment)
**Services Linked**: Men's Programs, Bwgcolman Healing, Elder Support, Early Learning

---

**Last Updated**: November 2025
**Next**: After import, proceed to Phase 2 - Profile Photos & Galleries
