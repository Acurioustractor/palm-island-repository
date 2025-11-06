-- ============================================================================
-- CHECK PROFILES TABLE COLUMNS
-- ============================================================================
-- This will show all columns in your profiles table
-- Look for 'role' in the list
-- ============================================================================

SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
