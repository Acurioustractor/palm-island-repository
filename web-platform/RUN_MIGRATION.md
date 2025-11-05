# How to Run the Migration - Step by Step

## 🎯 Quick Start

### Option 1: Using Supabase Dashboard (Easiest)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Click "SQL Editor" in the left sidebar

2. **Run Pre-Migration Check**
   - Open `QUICK_CHECK.sql` in your code editor
   - Copy ALL the contents
   - Paste into Supabase SQL Editor
   - Click "Run" button
   - Review the results

3. **Expected Results:**
   ```
   CHECK 1: Should show current profile count (probably 6-7)
   CHECK 2: Should list 6 existing PICC members
   CHECK 3: Should be EMPTY (no duplicates)
   CHECK 4: Should show PICC organization
   CHECK 5: Should show 0 or 1 (column exists or not)
   ```

4. **If all looks good, Run Migration:**
   - Open `migrate_airtable_storytellers.sql`
   - Copy ALL the contents (it's long!)
   - Paste into Supabase SQL Editor
   - Click "Run"
   - Wait for success message

### Option 2: Using Command Line (Advanced)

```bash
# Make sure you have your Supabase database URL
export DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"

# Run pre-check
psql $DATABASE_URL -f web-platform/QUICK_CHECK.sql

# If all good, run migration
psql $DATABASE_URL -f web-platform/migrate_airtable_storytellers.sql
```

---

## 🔍 What to Look For in Pre-Check

### ✅ GOOD Results:

```sql
-- CHECK 1: Shows your current profiles
total_profiles | picc_profiles
14            | 6

-- CHECK 2: Lists the 6 existing members
full_name                    | status
Goonyun Anderson            | ❌ Missing Airtable ID  <- This is OK!
Roy Prior                   | ❌ Missing Airtable ID  <- This is OK!
Ruby Sibley                 | ❌ Missing Airtable ID  <- This is OK!
Uncle Alan Palm Island      | ❌ Missing Airtable ID  <- This is OK!
Uncle Frank Daniel Landers  | ❌ Missing Airtable ID  <- This is OK!
Ferdys staff               | ❌ Missing Airtable ID  <- This is OK!

-- CHECK 3: Should be EMPTY (no results = good!)
(No rows returned)

-- CHECK 4: PICC org exists
id                                   | name
3c2011b9-f80d-4289-b300-0cd383cff479 | Palm Island Community Company

-- CHECK 5: Column check
exists
0 or 1    <- Either is fine
```

### ⚠️ PROBLEM Results:

**If CHECK 3 shows duplicates:**
```sql
full_name           | count
Roy Prior          | 2       <- BAD! Duplicates exist!
```
→ **Fix**: Delete duplicates before migrating

**If CHECK 4 is empty:**
```
(No rows returned)
```
→ **Fix**: You need to create the PICC organization first

**If existing members already have Airtable IDs:**
```
Roy Prior | ✅ Has Airtable ID
```
→ **Note**: Migration already ran! You're good.

---

## 🚀 After Migration

### Verify Success

Run this in Supabase SQL Editor:

```sql
-- Count total profiles
SELECT COUNT(*) as total FROM profiles;
-- Should show: 6 (existing) + 19 (new) = 25 total

-- Count PICC profiles
SELECT COUNT(*) FROM profiles
WHERE primary_organization_id = '3c2011b9-f80d-4289-b300-0cd383cff479';
-- Should show: 25

-- Count profiles with Airtable IDs
SELECT COUNT(*) FROM profiles WHERE metadata ? 'airtable_id';
-- Should show: 25

-- List all new storytellers
SELECT full_name, storyteller_type
FROM profiles
WHERE metadata ? 'airtable_id'
ORDER BY full_name;
```

### Expected Final State

```
Total Profiles: 25+ (or more if you had others)
PICC Profiles: 25
With Airtable IDs: 25

Storytellers added:
✅ Alfred Johnson
✅ Allison Aley
✅ Carmelita & Colette
✅ Childcare workers
✅ Daniel Patrick Noble
✅ Elders Group
✅ Ethel and Iris Ferdies
✅ Goonyun Anderson (updated)
✅ Henry Doyle
✅ Iris
✅ Irene Nleallajar
✅ Ivy
✅ Jason
✅ Jenni Calcraft
✅ Jess Smit
✅ Men's Group
✅ Natalie Friday
✅ Paige Tanner Hill
✅ Peggy Palm Island
✅ Richard Cassidy
✅ Roy Prior (updated)
✅ Ruby Sibley (updated)
✅ Uncle Alan Palm Island (updated)
✅ Uncle Frank Daniel Landers (updated)
✅ Ferdys staff (updated)
```

---

## 🆘 Troubleshooting

### Error: "duplicate key value violates unique constraint"
**Cause**: Profile already exists with same ID
**Fix**: The migration uses `ON CONFLICT DO NOTHING`, so this shouldn't happen. If it does, names might be duplicated.

### Error: "column profile_image_url does not exist"
**Cause**: Migration script should create it, but didn't run
**Fix**: Run this first:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
```

### Error: "relation profiles does not exist"
**Cause**: profiles table not created yet
**Fix**: Run your main schema setup first

### "No organization found"
**Cause**: PICC organization doesn't exist with expected ID
**Fix**: Check organization ID or create it first

---

## 📋 Checklist

- [ ] Open Supabase Dashboard
- [ ] Copy QUICK_CHECK.sql contents
- [ ] Run in SQL Editor
- [ ] Verify no duplicates in results
- [ ] Verify PICC organization exists
- [ ] Copy migrate_airtable_storytellers.sql contents
- [ ] Run in SQL Editor
- [ ] Wait for success message
- [ ] Run verification queries above
- [ ] Confirm 25 profiles with Airtable IDs

---

## 🎉 Success!

Once done, you'll have:
- ✅ 25 storytellers in database
- ✅ All linked to PICC organization
- ✅ Airtable IDs stored for reference
- ✅ Ready for transcript migration
- ✅ Ready for image migration

**Next Steps:**
1. Migrate profile images (see AIRTABLE_MIGRATION_GUIDE.md)
2. Create stories from transcripts
3. Build storyteller directory page
