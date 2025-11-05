-- ============================================================================
-- STEP 1: Enable Required Extensions
-- Run this first in Supabase SQL Editor
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable vector search (for AI embeddings)
CREATE EXTENSION IF NOT EXISTS "vector";

-- Check extensions are installed
SELECT * FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto', 'vector');
