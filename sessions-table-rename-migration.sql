-- Sessions Table Rename Migration Script
-- This script safely renames the sessions table to user_sessions and updates all related policies
-- Run this ONLY if you can afford a brief table lock during the rename operation

-- STEP 1: Check existing policies on sessions table before rename
SELECT 
    'BEFORE RENAME - Existing policies on sessions table:' as info,
    policyname, 
    tablename, 
    schemaname
FROM pg_policies
WHERE tablename = 'sessions' AND schemaname = 'public'
ORDER BY policyname;

-- STEP 2: Rename the table and update all related objects
DO $$
BEGIN
   IF EXISTS (
      SELECT 1
      FROM   information_schema.tables
      WHERE  table_schema = 'public'
      AND    table_name   = 'sessions'
   )
   AND NOT EXISTS (
      SELECT 1
      FROM   information_schema.tables
      WHERE  table_schema = 'public'
      AND    table_name   = 'user_sessions'
   ) THEN
      RAISE NOTICE 'Renaming public.sessions → public.user_sessions …';
      ALTER TABLE public.sessions RENAME TO user_sessions;

      -- Rename the *old* index names to match the new table name
      IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'IDX_session_expire') THEN
         ALTER INDEX IDX_session_expire RENAME TO IDX_user_session_expire;
      END IF;
      IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_sessions_user_id') THEN
         ALTER INDEX idx_sessions_user_id RENAME TO idx_user_sessions_user_id;
      END IF;

      -- Drop old policies on the renamed table (they still reference old table name internally)
      DROP POLICY IF EXISTS "sessions_select_self" ON user_sessions;
      DROP POLICY IF EXISTS "sessions_insert_self" ON user_sessions;
      DROP POLICY IF EXISTS "sessions_update_self" ON user_sessions;
      DROP POLICY IF EXISTS "sessions_delete_self" ON user_sessions;
      DROP POLICY IF EXISTS "admin_full_access" ON user_sessions;
      RAISE NOTICE 'Old policies dropped from renamed table';
      
      -- Create new policies with updated names for the user_sessions table
      CREATE POLICY "user_sessions_select_self" ON user_sessions 
      FOR SELECT TO authenticated 
      USING (auth.uid() = user_id);

      CREATE POLICY "user_sessions_insert_self" ON user_sessions 
      FOR INSERT TO authenticated 
      WITH CHECK (auth.uid() = user_id);

      CREATE POLICY "user_sessions_update_self" ON user_sessions 
      FOR UPDATE TO authenticated 
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

      CREATE POLICY "user_sessions_delete_self" ON user_sessions 
      FOR DELETE TO authenticated 
      USING (auth.uid() = user_id);

      CREATE POLICY "admin_full_access_user_sessions" ON user_sessions 
      FOR ALL TO service_role 
      USING (true);
      
      RAISE NOTICE 'New policies created for user_sessions table';
      RAISE NOTICE 'Successfully completed sessions table rename to user_sessions!';
      
   ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_sessions') THEN
      RAISE NOTICE 'user_sessions table already exists - rename operation skipped';
      
   ELSIF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sessions') THEN
      RAISE NOTICE 'sessions table does not exist - nothing to rename';
      
   ELSE
      RAISE NOTICE 'Unexpected state - both sessions and user_sessions tables exist';
   END IF;
END;
$$;

-- STEP 3: Verify the rename was successful by checking policies on the new table
SELECT 
    'AFTER RENAME - New policies on user_sessions table:' as info,
    policyname, 
    tablename, 
    schemaname
FROM pg_policies
WHERE tablename = 'user_sessions' AND schemaname = 'public'
ORDER BY policyname;

-- STEP 4: Verify table structure
SELECT 
    'Table structure verification:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'user_sessions'
ORDER BY ordinal_position;

-- STEP 5: Check indexes on the renamed table
SELECT 
    'Index verification:' as info,
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename = 'user_sessions'
ORDER BY indexname;

-- Final success message
SELECT 'Sessions table rename migration completed successfully!' as status;
