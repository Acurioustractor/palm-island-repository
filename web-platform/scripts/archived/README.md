# Archived SQL Scripts

These scripts have already been executed against the Supabase database.
**DO NOT run them again** - they will create duplicate data.

## What's Here

| File | Date Run | Purpose | Result |
|------|----------|---------|--------|
| `2024-11_picc_complete_setup.sql` | Nov 2024 | Initial PICC setup, 16 services, 6 storytellers | ✅ In database |
| `2024-11_import_storm_stories.sql` | Nov 2024 | 26 storm recovery stories | ✅ In database |
| `2024-12_populate_picc_2023_24_annual_report.sql` | Dec 2024 | 2023-24 annual report data | ✅ In database |
| `add_new_people.sql` | Various | Added storyteller profiles | ✅ In database |
| `migrate_airtable_storytellers.sql` | 2024 | Migrated from Airtable | ✅ In database |
| `create_2024_annual_report.sql` | 2024 | Created report record | ✅ In database |
| `POPULATE_2024_REPORT.sql` | 2024 | Populated report data | ✅ In database |
| `step3_organizations_*.sql` | 2024 | Organization setup | ✅ In database |
| `BULK-UPLOAD-COMPLETE-SETUP.sql` | 2024 | Bulk upload config | ✅ In database |
| `FIX-STORAGE-POLICIES.sql` | 2024 | Fixed storage RLS | ✅ Applied |
| `FIX_RLS_POLICIES.sql` | 2024 | Fixed RLS policies | ✅ Applied |
| `MEDIA-FILES-RLS-POLICIES.sql` | 2024 | Media file policies | ✅ Applied |
| `STORAGE-*.sql` | 2024 | Storage bucket setup | ✅ Applied |
| `CREATE_STORY_MEDIA_TABLE.sql` | 2024 | Story media table | ✅ Applied |
| `setup_image_storage.sql` | 2024 | Image storage setup | ✅ Applied |

## If You Need to Re-seed

If you need to reset the database with this data:

1. **Never run these directly on production**
2. Use `supabase db reset` for local development
3. For production, check what data already exists first

## Source of Truth

The **Supabase database** is the source of truth, not these files.

To see current data:
- [Stories](https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/editor/stories)
- [Profiles](https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/editor/profiles)
- [Services](https://supabase.com/dashboard/project/uaxhjzqrdotoahjnxmbj/editor/organization_services)
