-- ============================================================================
-- CHECK EXTENSIONS
-- ============================================================================
-- Shows what PostgreSQL extensions are enabled
-- ============================================================================

SELECT extname, extversion
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'vector', 'pgcrypto')
ORDER BY extname;
