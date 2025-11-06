-- ============================================================================
-- SUPABASE DATABASE DIAGNOSTIC SCRIPT
-- ============================================================================
-- Run this FIRST to see what you currently have
-- Copy the output and share it so we can create the exact fix you need
-- ============================================================================

-- ============================================================================
-- 1. LIST ALL TABLES
-- ============================================================================
SELECT '========================================' AS divider;
SELECT '1. ALL TABLES IN YOUR DATABASE' AS section;
SELECT '========================================' AS divider;

SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================================================
-- 2. CHECK PROFILES TABLE (the problematic one)
-- ============================================================================
SELECT '========================================' AS divider;
SELECT '2. PROFILES TABLE - ALL COLUMNS' AS section;
SELECT '========================================' AS divider;

SELECT
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check specifically for 'role' column
SELECT '--- Checking for role column specifically ---' AS check;
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'profiles' AND column_name = 'role'
        )
        THEN '✅ role column EXISTS'
        ELSE '❌ role column MISSING - this is your problem!'
    END AS role_column_status;

-- ============================================================================
-- 3. CHECK DOCUMENTS TABLE
-- ============================================================================
SELECT '========================================' AS divider;
SELECT '3. DOCUMENTS TABLE CHECK' AS section;
SELECT '========================================' AS divider;

SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_name = 'documents'
        )
        THEN '✅ documents table EXISTS'
        ELSE '❌ documents table MISSING - needs to be created!'
    END AS documents_table_status;

-- If it exists, show its columns
SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'documents'
ORDER BY ordinal_position;

-- ============================================================================
-- 4. CHECK STORIES TABLE
-- ============================================================================
SELECT '========================================' AS divider;
SELECT '4. STORIES TABLE CHECK' AS section;
SELECT '========================================' AS divider;

SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_name = 'stories'
        )
        THEN '✅ stories table EXISTS'
        ELSE '❌ stories table MISSING'
    END AS stories_table_status;

-- Show some key columns
SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'stories'
  AND column_name IN ('id', 'title', 'storyteller_id', 'is_published', 'created_at')
ORDER BY ordinal_position;

-- ============================================================================
-- 5. CHECK AI TABLES
-- ============================================================================
SELECT '========================================' AS divider;
SELECT '5. AI TABLES CHECK' AS section;
SELECT '========================================' AS divider;

SELECT
    table_name,
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND t.table_name = table_name)
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM (
    VALUES
        ('story_embeddings'),
        ('document_embeddings'),
        ('themes'),
        ('story_themes'),
        ('story_quotes'),
        ('chat_sessions'),
        ('chat_messages'),
        ('search_history'),
        ('saved_searches')
) AS t(table_name);

-- ============================================================================
-- 6. CHECK EXTENSIONS
-- ============================================================================
SELECT '========================================' AS divider;
SELECT '6. POSTGRESQL EXTENSIONS' AS section;
SELECT '========================================' AS divider;

SELECT
    extname as extension_name,
    extversion as version,
    '✅ Enabled' as status
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'vector', 'pgcrypto')
ORDER BY extname;

-- Check specifically for vector (needed for AI)
SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector')
        THEN '✅ pgvector extension ENABLED (AI features ready)'
        ELSE '❌ pgvector extension MISSING (needed for AI features)'
    END AS vector_status;

-- ============================================================================
-- 7. CHECK ORGANIZATIONS TABLE
-- ============================================================================
SELECT '========================================' AS divider;
SELECT '7. ORGANIZATIONS TABLE CHECK' AS section;
SELECT '========================================' AS divider;

SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_name = 'organizations'
        )
        THEN '✅ organizations table EXISTS'
        ELSE '❌ organizations table MISSING'
    END AS organizations_table_status;

-- ============================================================================
-- 8. CHECK FUNCTIONS (for AI)
-- ============================================================================
SELECT '========================================' AS divider;
SELECT '8. AI FUNCTIONS CHECK' AS section;
SELECT '========================================' AS divider;

SELECT
    routine_name as function_name,
    '✅ EXISTS' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%similar%'
ORDER BY routine_name;

-- Check specifically for our AI functions
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines
            WHERE routine_name = 'find_similar_stories'
        )
        THEN '✅ find_similar_stories function EXISTS'
        ELSE '❌ find_similar_stories function MISSING'
    END AS similar_stories_status;

SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines
            WHERE routine_name = 'find_similar_documents'
        )
        THEN '✅ find_similar_documents function EXISTS'
        ELSE '❌ find_similar_documents function MISSING'
    END AS similar_documents_status;

-- ============================================================================
-- 9. CHECK ENHANCED PROFILE TABLES
-- ============================================================================
SELECT '========================================' AS divider;
SELECT '9. ENHANCED PROFILE TABLES CHECK' AS section;
SELECT '========================================' AS divider;

SELECT
    table_name,
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND t.table_name = table_name)
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM (
    VALUES
        ('storyteller_photos'),
        ('storyteller_relationships'),
        ('storyteller_stats')
) AS t(table_name);

-- ============================================================================
-- 10. SUMMARY
-- ============================================================================
SELECT '========================================' AS divider;
SELECT '10. SUMMARY - WHAT YOU HAVE' AS section;
SELECT '========================================' AS divider;

SELECT
    'Total Tables' as metric,
    COUNT(*)::text as value
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'

UNION ALL

SELECT
    'Extensions Enabled',
    COUNT(*)::text
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'vector', 'pgcrypto')

UNION ALL

SELECT
    'AI Functions',
    COUNT(*)::text
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%similar%'

UNION ALL

SELECT
    'Has profiles.role column',
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role')
        THEN '✅ YES'
        ELSE '❌ NO'
    END

UNION ALL

SELECT
    'Has documents table',
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents')
        THEN '✅ YES'
        ELSE '❌ NO'
    END;

-- ============================================================================
-- INSTRUCTIONS
-- ============================================================================
SELECT '========================================' AS divider;
SELECT 'NEXT STEPS:' AS instructions;
SELECT '========================================' AS divider;
SELECT '1. Copy ALL output from this query' AS step_1;
SELECT '2. Share it with Claude' AS step_2;
SELECT '3. Claude will create the exact SQL you need' AS step_3;
SELECT '4. Run that SQL to fix everything' AS step_4;
SELECT '========================================' AS divider;
