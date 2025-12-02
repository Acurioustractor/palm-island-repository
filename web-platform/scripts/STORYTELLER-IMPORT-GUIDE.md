# Storyteller Import Guide

This guide explains how to replace the placeholder "Community Member X" profiles with real storytellers and their transcripts from a CSV file.

## Overview

The process has two steps:
1. **Cleanup**: Delete all "Community Member X" placeholder profiles
2. **Import**: Add new storytellers and their interviews from CSV

## CSV Format

Your CSV should have exactly 2 columns:

```csv
Title,Transcript
"Uncle Frank - Storm Recovery Story","When the cyclone hit, we knew what to do..."
"Auntie Mary's Experience","I remember that day clearly..."
"Elder Discussion on Traditional Knowledge","We need to pass this on to the young ones..."
```

**Important:**
- Column names must be `Title` and `Transcript` (case-insensitive)
- Use quotes around values that contain commas
- The script will extract the person's name from the Title:
  - `"Uncle Frank - Storm Recovery"` → Person: "Uncle Frank"
  - `"Auntie Mary's Story"` → Person: "Auntie Mary"
  - `"Elder Discussion"` → Person: "Elder Discussion"

**Metadata (auto-set):**
- **Date**: December 1, 2024 for all interviews
- **Location**: Palm Island for all
- **Elder status**: Auto-detected if title contains "Uncle", "Auntie", or "Elder"

## Step-by-Step Process

### Step 1: Prepare Your CSV

1. Save your CSV file somewhere accessible, e.g., `~/Downloads/storytellers.csv`
2. Verify it has the correct format (2 columns: Title, Transcript)

### Step 2: Run Cleanup Script

This deletes all "Community Member X" profiles:

```bash
cd web-platform
node scripts/cleanup-community-members.js
```

**Output:**
```
🔍 Finding Community Member profiles...

Found 50 Community Member profiles:

  1. Community Member 1 (ID: abc-123...)
  2. Community Member 2 (ID: def-456...)
  ...

⚠️  WARNING: This will DELETE all the profiles listed above.
⚠️  Related stories and interviews will also be deleted (cascade).

🗑️  Deleting profiles...

✅ Successfully deleted 50 Community Member profiles

Next step: Run the import script to add new storytellers from CSV
```

### Step 3: Run Import Script

This creates new storytellers and interviews from your CSV:

```bash
cd web-platform
node scripts/import-storytellers-csv.js ~/Downloads/storytellers.csv
```

**Output:**
```
📂 Reading CSV file: /Users/you/Downloads/storytellers.csv

✓ Found 25 entries to import

📝 Processing 1/25: Uncle Frank - Storm Recovery Story
   Person: Uncle Frank
   ✓ Created profile: xyz-789...
   ✓ Created interview: abc-123...
   ✓ Updated interview count

📝 Processing 2/25: Auntie Mary's Experience
   Person: Auntie Mary
   ℹ️  Profile exists, using existing: def-456...
   ✓ Created interview: ghi-789...
   ✓ Updated interview count

...

============================================================

✅ Import complete!
   Success: 25
   Errors: 0
   Total: 25

✓ All done!
```

## What the Scripts Do

### Cleanup Script (`cleanup-community-members.js`)
- Finds all profiles with names like "Community Member 1", "Community Member 2", etc.
- Deletes them from the database
- Related records (stories, interviews) are automatically deleted via cascade

### Import Script (`import-storytellers-csv.js`)
- Reads the CSV file
- For each row:
  1. Extracts person name from Title
  2. Creates a new profile (or uses existing if name matches)
  3. Creates an interview record with the transcript
  4. Sets date to December 2024
  5. Sets location to Palm Island
  6. Auto-detects elder status from name
  7. Updates profile interview counter

## Troubleshooting

### "File not found"
- Make sure the CSV path is correct
- Use absolute path or relative path from `web-platform/` directory

### "Missing title or transcript"
- Check your CSV has both columns
- Make sure there are no empty rows

### "Failed to create profile"
- Check Supabase connection in `.env.local`
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set

### Duplicate Names
If two entries have the same person name (e.g., both extract to "Uncle Frank"), the script will:
- Reuse the same profile
- Create multiple interview records for that person

## After Import

1. **Verify in UI**: Go to `/picc/storytellers` to see the new profiles
2. **Check counts**: Each storyteller should show `interviews_completed: 1` (or more if they had multiple entries)
3. **Add photos**: Use the upload feature to add profile photos

## Example CSV

Save this as `example.csv`:

```csv
Title,Transcript
"Uncle Frank Foster - Storm Recovery","When the cyclone hit in 2019, I was worried about the old people. But our community came together. The young ones helped the Elders first. That's our way."
"Auntie Mary - Community Strength","I've lived here all my life. Through good times and hard times. What keeps us strong is our connection to each other and to this land."
"Elder Discussion - Traditional Knowledge","We need to teach the young ones about the old ways. Not just stories - the knowledge that helped our people survive for thousands of years."
```

Then run:
```bash
node scripts/import-storytellers-csv.js example.csv
```
