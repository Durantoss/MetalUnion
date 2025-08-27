-- Sessions Table Add user_id Column Migration Script
-- This script safely adds the user_id column to existing sessions table if it doesn't exist
-- Handles both 'sessions' and 'user_sessions' table names

-- STEP 1: Check current table structure before adding column
SELECT 
    'BEFORE - Current sessions table structure:' as info,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('sessions', 'user_sessions')
ORDER BY table_name, ordinal_position;

-- -------------------------------------------------
-- 2️⃣  Add user_id column to the *existing* sessions table (if it exists)
-- -------------------------------------------------
DO $$
BEGIN
   IF EXISTS (
      SELECT 1
      FROM   information_schema.tables
      WHERE  table_schema = 'public'
      AND    table_name   = 'sessions'
   ) THEN
      IF NOT EXISTS (
         SELECT 1
         FROM   information_schema.columns
         WHERE  table_schema = 'public'
         AND    table_name   = 'sessions'
         AND    column_name  = 'user_id'
      ) THEN
         RAISE NOTICE 'Adding user_id column to public.sessions …';
         ALTER TABLE public.sessions
            ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
      END IF;

      -- Create the index **only after** the column exists
      IF NOT EXISTS (
         SELECT 1
         FROM   pg_class c
         JOIN   pg_namespace n ON n.oid = c.relnamespace
         WHERE  c.relname = 'idx_sessions_user_id'
         AND    n.nspname = 'public'
      ) THEN
         RAISE NOTICE 'Creating idx_sessions_user_id …';
         CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
      END IF;
   END IF;
END;
$$;

-- -------------------------------------------------
-- 3️⃣  Add user_id column to user_sessions table (if it exists)
-- -------------------------------------------------
DO $$
BEGIN
   IF EXISTS (
      SELECT 1
      FROM   information_schema.tables
      WHERE  table_schema = 'public'
      AND    table_name   = 'user_sessions'
   ) THEN
      IF NOT EXISTS (
         SELECT 1
         FROM   information_schema.columns
         WHERE  table_schema = 'public'
         AND    table_name   = 'user_sessions'
         AND    column_name  = 'user_id'
      ) THEN
         RAISE NOTICE 'Adding user_id column to public.user_sessions …';
         ALTER TABLE public.user_sessions
            ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
      END IF;

      IF NOT EXISTS (
         SELECT 1
         FROM   pg_class c
         JOIN   pg_namespace n ON n.oid = c.relnamespace
         WHERE  c.relname = 'idx_user_sessions_user_id'
         AND    n.nspname = 'public'
      ) THEN
         RAISE NOTICE 'Creating idx_user_sessions_user_id …';
         CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
      END IF;
   END IF;
END;
$$;

-- -------------------------------------------------
-- 4️⃣  Alternative approach using ALTER TABLE IF EXISTS (PostgreSQL 9.6+)
-- -------------------------------------------------
-- This is a more concise version that handles table existence automatically

-- For sessions table
ALTER TABLE IF EXISTS public.sessions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- For user_sessions table  
ALTER TABLE IF EXISTS public.user_sessions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- Create indexes if they don't exist (for both possible table names)
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- STEP 5: Verify the column addition was successful
SELECT 
    'AFTER - Updated table structure:' as info,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('sessions', 'user_sessions')
  AND column_name = 'user_id'
ORDER BY table_name;

-- STEP 6: Check foreign key constraints
SELECT 
    'Foreign key constraints verification:' as info,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('sessions', 'user_sessions')
  AND kcu.column_name = 'user_id'
ORDER BY tc.table_name;

-- STEP 7: Check indexes on user_id column
SELECT 
    'Index verification for user_id column:' as info,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('sessions', 'user_sessions')
  AND indexdef LIKE '%user_id%'
ORDER BY tablename, indexname;

-- Final success message
SELECT 'Sessions table user_id column addition migration completed successfully!' as status;
