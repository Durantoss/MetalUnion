-- CRITICAL FIXES for supabase-migration.sql
-- These fixes address major issues that would cause the migration to fail

-- Issue 1: Table creation order problem
-- The script tries to create policies for tables that don't exist yet
-- The UUID conversion block (section 2) runs BEFORE tables are created (sections 3-6)
-- This will cause "relation does not exist" errors

-- Issue 2: Forward references to non-existent tables
-- The policy creation in section 2 references tables like:
-- - direct_messages (created much later)
-- - conversations (created much later) 
-- - user_sessions (created at the very end)
-- - notifications, user_locations, etc. (all created later)

-- Issue 3: Missing user_sessions table definition
-- The script tries to operate on user_sessions table but doesn't create it until the very end
-- The DO block for user_sessions operations will fail because the table doesn't exist

-- Issue 4: Inconsistent ID column types
-- Some tables use VARCHAR for ID columns with gen_random_uuid() default
-- This creates a type mismatch (VARCHAR vs UUID)

-- SOLUTION: Reorder the script sections
-- 1. Extensions
-- 2. Create ALL tables first
-- 3. THEN run UUID conversion and policy creation
-- 4. Add foreign key constraints last

\echo 'MIGRATION FIXES IDENTIFIED:'
\echo '1. Table creation order must be fixed'
\echo '2. Policy creation must happen AFTER table creation'
\echo '3. user_sessions table must be created before operations'
\echo '4. ID column types must be consistent (all UUID)'
\echo '5. Forward references must be resolved'

-- Test the problematic query that will fail:
-- This simulates what happens when the UUID conversion block runs
-- before tables are created

DO $$
BEGIN
    -- This will fail if user_sessions table doesn't exist
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'user_sessions'  -- Table doesn't exist yet!
          AND column_name = 'user_id'
          AND data_type IN ('character varying', 'varchar', 'text')
    ) THEN
        RAISE NOTICE 'user_sessions table exists and needs conversion';
    ELSE
        RAISE NOTICE 'user_sessions table does not exist or no conversion needed';
    END IF;
    
    -- This will also fail - trying to create policies on non-existent tables
    BEGIN
        EXECUTE 'CREATE POLICY "test_policy" ON user_sessions FOR SELECT TO authenticated USING (true)';
        RAISE NOTICE 'Policy creation would succeed';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'ERROR: Cannot create policy - user_sessions table does not exist';
        WHEN OTHERS THEN
            RAISE NOTICE 'ERROR: Policy creation failed: %', SQLERRM;
    END;
END $$;

\echo 'Fix required: Move table creation BEFORE UUID conversion and policy creation'
