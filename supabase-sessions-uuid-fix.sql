-- 🔧 SUPABASE SESSIONS TABLE UUID FIX
-- Run this AFTER the main migration if you encounter UUID type errors with sessions table

-- 1️⃣ Ensure user_id is UUID
ALTER TABLE sessions
    ALTER COLUMN user_id TYPE UUID USING user_id::uuid;

-- 2️⃣ Drop any existing policies that reference the old type
DROP POLICY IF EXISTS "sessions_select_self" ON sessions;
DROP POLICY IF EXISTS "sessions_insert_self" ON sessions;
DROP POLICY IF EXISTS "sessions_update_self" ON sessions;
DROP POLICY IF EXISTS "sessions_delete_self" ON sessions;

-- 3️⃣ Re‑create correct RLS policies (UUID vs UUID)
CREATE POLICY "sessions_select_self" ON sessions
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "sessions_insert_self" ON sessions
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "sessions_update_self" ON sessions
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "sessions_delete_self" ON sessions
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- ✅ Success message
SELECT 'Sessions table UUID type and RLS policies fixed successfully!' as status;
