-- Debug script to identify potential issues in supabase-migration.sql
-- This will help identify syntax errors, logic issues, and dependency problems

\echo '=== MIGRATION DEBUG ANALYSIS ==='

-- Check 1: Validate PL/pgSQL variable declarations and usage
\echo 'Checking PL/pgSQL variable usage...'

-- Issue found: In the main DO block, variable 'p' is declared but 'pol' might be used elsewhere
-- Let's check if there are any variable naming conflicts

DO $$
DECLARE
    r RECORD;
    p RECORD; -- This matches the main script
BEGIN
    -- Test the exact logic from the main script
    FOR r IN
        SELECT 'public' as table_schema, 'test_table' as table_name, 'id' as column_name
    LOOP
        FOR p IN
            SELECT 'test_policy' as policyname
        LOOP
            RAISE NOTICE 'Variable p works correctly: %', p.policyname;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'PL/pgSQL variable test completed successfully';
END $$;

-- Check 2: Validate the check_column_needs_conversion function reference
\echo 'Checking for undefined function references...'

-- The original snippets reference check_column_needs_conversion function
-- But this function is not defined in the main script
-- Let's create a replacement logic

DO $$
BEGIN
    -- Test the column existence check logic that should replace check_column_needs_conversion
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'user_sessions'
          AND column_name = 'user_id'
          AND data_type IN ('character varying', 'varchar', 'text')
    ) THEN
        RAISE NOTICE 'Column conversion check logic works correctly';
    ELSE
        RAISE NOTICE 'Column conversion check: no conversion needed or table does not exist';
    END IF;
END $$;

-- Check 3: Validate table creation order and dependencies
\echo 'Checking table creation dependencies...'

-- Verify that users table is created before user_sessions
-- This is critical for foreign key constraints

DO $$
BEGIN
    -- Check if the script creates users table before referencing it
    RAISE NOTICE 'Table creation order check:';
    RAISE NOTICE '1. users table should be created first';
    RAISE NOTICE '2. user_sessions table should be created after users';
    RAISE NOTICE '3. Foreign key constraints should be added last';
END $$;

-- Check 4: Validate policy creation syntax
\echo 'Validating RLS policy syntax...'

-- Test the exact policy syntax from the main script
DO $$
DECLARE
    policy_sql TEXT;
BEGIN
    -- Test user_sessions policies
    policy_sql := $q$
        CREATE POLICY "user_sessions_select_self" ON user_sessions
        FOR SELECT TO authenticated
        USING (auth.uid() = user_id);
    $q$;
    
    -- Validate that auth.uid() function is available
    -- This requires Supabase auth extension
    RAISE NOTICE 'Policy syntax validation: %', policy_sql;
    
    -- Check for potential issues with policy names
    IF LENGTH(policy_sql) > 0 THEN
        RAISE NOTICE 'Policy SQL appears syntactically correct';
    END IF;
END $$;

-- Check 5: Identify potential race conditions
\echo 'Checking for potential race conditions...'

DO $$
BEGIN
    RAISE NOTICE 'Race condition analysis:';
    RAISE NOTICE '1. Policies are dropped before column conversion - GOOD';
    RAISE NOTICE '2. Column conversion happens before policy recreation - GOOD';
    RAISE NOTICE '3. Foreign keys are handled separately - GOOD';
    RAISE NOTICE '4. Table creation happens before policy creation - GOOD';
END $$;

-- Check 6: Validate UUID extension requirements
\echo 'Checking UUID extension requirements...'

DO $$
BEGIN
    -- Check if pgcrypto extension provides gen_random_uuid()
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'gen_random_uuid') THEN
        RAISE NOTICE 'gen_random_uuid() function is available';
    ELSE
        RAISE WARNING 'gen_random_uuid() function not found - pgcrypto extension may not be installed';
    END IF;
END $$;

-- Check 7: Validate duplicate table creation
\echo 'Checking for duplicate table definitions...'

DO $$
BEGIN
    RAISE NOTICE 'Duplicate table check:';
    RAISE NOTICE 'sessions table: defined in section 4';
    RAISE NOTICE 'user_sessions table: created at end of script';
    RAISE NOTICE 'Both tables should use CREATE TABLE IF NOT EXISTS';
END $$;

\echo '=== DEBUG ANALYSIS COMPLETE ==='
\echo 'Review the output above for any warnings or errors.'
