-- ============================================================================
-- CHECK ALL TABLES IN YOUR SUPABASE DATABASE
-- Let's find the table with random conversations!
-- ============================================================================

-- List all tables in your database
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE columns.table_name = tables.table_name) as column_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Look for tables that might contain conversations/transcripts
SELECT
  table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND (
    table_name LIKE '%conversation%' OR
    table_name LIKE '%transcript%' OR
    table_name LIKE '%story%' OR
    table_name LIKE '%media%' OR
    table_name LIKE '%quote%' OR
    table_name LIKE '%interview%'
  )
ORDER BY table_name;
