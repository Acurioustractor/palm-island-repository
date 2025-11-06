# Database Migrations

This directory contains SQL migration scripts for the Palm Island Story Server platform.

## Running Migrations

### Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of the migration file
4. Paste and run the SQL script

### Via Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push
```

## Migration Files

### 002_enhanced_profiles.sql

Creates tables and functions for enhanced storyteller profiles:

- `storyteller_photos` - Photo gallery for storytellers
- `storyteller_relationships` - Connections between storytellers
- `storyteller_stats` - Cached statistics for performance
- `update_storyteller_stats()` - Function to calculate and update stats
- Trigger to auto-update stats when stories are modified

**Note**: You'll need to run this migration via your Supabase dashboard to enable the enhanced profile features (photo galleries, statistics, etc.).

## Order of Operations

1. Run the migration in Supabase dashboard
2. Create storage bucket named `storyteller-photos` in Supabase Storage
3. Set up RLS policies for the bucket if needed
4. Enhanced profile features will be fully functional
