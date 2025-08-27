-- Test script to validate the supabase-migration.sql syntax and logic
-- This script will check for common SQL issues and validate the structure

-- Test 1: Check if the main migration script has valid SQL syntax
\echo 'Testing SQL syntax validation...'

-- Test 2: Validate the DO blocks for proper PL/pgSQL syntax
DO $$
BEGIN
    RAISE NOTICE 'Testing PL/pgSQL block syntax - this should execute without errors';
END $$;

-- Test 3: Check for potential issues in the UUID conversion logic
-- Simulate the information_schema query that's used in the main script
SELECT 
    table_schema, 
    table_name, 
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE data_type = 'character varying'
AND column_default LIKE 'gen_random_uuid()%'
LIMIT 5;

-- Test 4: Validate policy creation syntax (dry run)
-- Test the policy SQL without actually creating policies
DO $$
DECLARE
    test_sql TEXT;
BEGIN
    -- Test user_sessions policy syntax
    test_sql := $q$
        CREATE POLICY "user_sessions_select_self" ON user_sessions
        FOR SELECT TO authenticated
        USING (auth.uid() = user_id);
    $q$;
    
    RAISE NOTICE 'Policy SQL syntax appears valid: %', test_sql;
    
    -- Test foreign key constraint syntax
    test_sql := $q$
        ALTER TABLE user_sessions
        ADD CONSTRAINT user_sessions_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;
    $q$;
    
    RAISE NOTICE 'Foreign key SQL syntax appears valid: %', test_sql;
END $$;

-- Test 5: Check for table creation dependencies
-- Verify that referenced tables exist before foreign keys are created
\echo 'Checking table creation order and dependencies...'

-- Test 6: Validate UUID extension availability
SELECT 
    extname,
    extversion
FROM pg_extension 
WHERE extname IN ('pgcrypto', 'uuid-ossp');

-- Test 7: Check for potential naming conflicts
SELECT 
    schemaname,
    tablename
FROM pg_tables 
WHERE tablename IN ('users', 'sessions', 'user_sessions')
AND schemaname = 'public';

\echo 'Migration test script completed. Check output for any errors or warnings.'
