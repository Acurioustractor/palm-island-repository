-- ============================================================================
-- SIMPLE DATABASE CHECK
-- ============================================================================
-- Run this and share ALL the output you see
-- ============================================================================

-- What tables do you have?
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
