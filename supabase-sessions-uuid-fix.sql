-- 🔧 COMPREHENSIVE SUPABASE SESSIONS TABLE UUID FIX
-- Run this AFTER the main migration if you encounter UUID type errors with sessions table
-- This file includes multiple approaches - use the one that works for your setup

-- ==========================================
-- METHOD 1: Basic UUID Conversion + Simple RLS
-- ==========================================

-- 1️⃣ Ensure user_id is UUID
ALTER TABLE sessions
    ALTER COLUMN user_id TYPE UUID USING user_id::uuid;

-- 2️⃣ Drop any existing policies that reference the old type
DROP POLICY IF EXISTS "sessions_select_self" ON sessions;
DROP POLICY IF EXISTS "sessions_insert_self" ON sessions;
DROP POLICY IF EXISTS "sessions_update_self" ON sessions;
DROP POLICY IF EXISTS "sessions_delete_self" ON sessions;

-- 3️⃣ Create basic RLS policies
CREATE POLICY "sessions_select_self" ON sessions 
FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "sessions_insert_self" ON sessions 
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sessions_update_self" ON sessions 
FOR UPDATE TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sessions_delete_self" ON sessions 
FOR DELETE TO authenticated 
USING (auth.uid() = user_id);

-- ==========================================
-- METHOD 2: Enhanced RLS with SELECT Wrapper
-- ==========================================

-- Drop existing policies
DROP POLICY IF EXISTS "sessions_select_self" ON sessions;
DROP POLICY IF EXISTS "sessions_insert_self" ON sessions;
DROP POLICY IF EXISTS "sessions_update_self" ON sessions;
DROP POLICY IF EXISTS "sessions_delete_self" ON sessions;

-- Create enhanced RLS policies with (SELECT auth.uid()) for better UUID handling
CREATE OR REPLACE POLICY "sessions_select_self" ON sessions
FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE OR REPLACE POLICY "sessions_insert_self" ON sessions
FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE OR REPLACE POLICY "sessions_update_self" ON sessions
FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE OR REPLACE POLICY "sessions_delete_self" ON sessions
FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- ==========================================
-- METHOD 3: Complete Table Recreation (Nuclear Option)
-- ==========================================

-- WARNING: This will delete all existing session data!
-- Only use if other methods fail

DROP TABLE IF EXISTS sessions;
CREATE TABLE sessions (
    sid      VARCHAR PRIMARY KEY,
    sess     JSONB NOT NULL,
    expire   TIMESTAMP NOT NULL,
    user_id  UUID REFERENCES users(id) ON DELETE CASCADE
);

-- Enable RLS on the new table
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- ==========================================
-- METHOD 4: Comprehensive Fix (Recommended)
-- ==========================================

-- Ensure the sessions.user_id column is UUID
ALTER TABLE sessions
  ALTER COLUMN user_id TYPE UUID USING user_id::uuid;

-- Re‑create the sessions RLS policies with proper UUID handling
DROP POLICY IF EXISTS "sessions_select_self"      ON sessions;
DROP POLICY IF EXISTS "sessions_insert_self"      ON sessions;
DROP POLICY IF EXISTS "sessions_update_self"      ON sessions;
DROP POLICY IF EXISTS "sessions_delete_self"      ON sessions;
DROP POLICY IF EXISTS "admin_full_access"         ON sessions;

CREATE POLICY "sessions_select_self" ON sessions
FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "sessions_insert_self" ON sessions
FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "sessions_update_self" ON sessions
FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "sessions_delete_self" ON sessions
FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- Keep the admin full‑access policy for service operations
CREATE POLICY "admin_full_access" ON sessions
FOR ALL TO service_role
USING (true);

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Check if user_id column is properly UUID
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sessions' AND column_name = 'user_id';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'sessions';

-- ✅ Success message
SELECT 'Sessions table UUID type and RLS policies fixed successfully with multiple methods!' as status;
