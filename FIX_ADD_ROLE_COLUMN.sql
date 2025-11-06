-- ============================================================================
-- QUICK FIX: Add Missing role Column to profiles Table
-- ============================================================================
-- Run this FIRST if you already have tables created
-- This adds the missing column that's causing the error
-- ============================================================================

-- Add role column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'member';
        ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
            CHECK (role IN ('admin', 'editor', 'member', 'viewer'));
        CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

        RAISE NOTICE 'Added role column to profiles table';
    ELSE
        RAISE NOTICE 'role column already exists';
    END IF;
END $$;

-- Verify it worked
SELECT 'Checking role column...' AS status;
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'role';

-- If you see one row with role column, you're good!
SELECT '✅ Fix complete! Role column added.' AS result;
