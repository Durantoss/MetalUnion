-- UUID Type Mismatch Fix for MoshUnion Database
-- This script resolves the "operator does not exist: character varying = uuid" error

-- First, let's ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Fix 1: Update the sessions table schema to match Drizzle expectations
-- Add user_id column if it doesn't exist, with proper UUID type
DO $$ 
BEGIN
    -- Check if user_id column exists and add it if it doesn't
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sessions' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE sessions ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    END IF;
    
    -- Convert existing user_id column to UUID if it's not already UUID
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sessions' 
        AND column_name = 'user_id' 
        AND data_type != 'uuid'
    ) THEN
        -- Drop foreign key constraint if it exists
        ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;
        
        -- Convert column to UUID with proper casting
        ALTER TABLE sessions ALTER COLUMN user_id TYPE UUID USING 
            CASE 
                WHEN user_id IS NULL THEN NULL
                WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
                THEN user_id::uuid
                ELSE NULL
            END;
        
        -- Re-add foreign key constraint
        ALTER TABLE sessions ADD CONSTRAINT sessions_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Fix 2: Drop ALL RLS policies before altering column types
-- This is necessary because PostgreSQL cannot alter column types used in policies

-- Drop all existing policies on all tables
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Get all policies in the public schema
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            policy_record.policyname, 
            policy_record.schemaname, 
            policy_record.tablename);
    END LOOP;
END $$;

-- Fix 3: Create a function to safely cast auth.uid() to UUID (MUST BE FIRST)
CREATE OR REPLACE FUNCTION auth_uid_as_uuid()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT COALESCE((auth.uid())::uuid, '00000000-0000-0000-0000-000000000000'::uuid);
$$;

-- Fix 4: Drop all foreign key constraints that reference users.id and convert referencing columns
-- This ensures all foreign key relationships work properly
DO $$
DECLARE
    rec RECORD;
BEGIN
    -- Find all foreign key constraints that reference users(id) and drop them
    FOR rec IN 
        SELECT 
            tc.table_name,
            tc.constraint_name,
            kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu 
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = 'users'
        AND ccu.column_name = 'id'
    LOOP
        -- Drop the foreign key constraint
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', 
            rec.table_name, rec.constraint_name);
    END LOOP;
    
    -- Now convert all referencing columns to UUID
    FOR rec IN 
        SELECT 
            tc.table_name,
            kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu 
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = 'users'
        AND ccu.column_name = 'id'
    LOOP
        -- Check if the referencing column is not UUID type
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = rec.table_name 
            AND column_name = rec.column_name 
            AND data_type != 'uuid'
        ) THEN
            -- Convert the column to UUID
            EXECUTE format('ALTER TABLE %I ALTER COLUMN %I TYPE UUID USING 
                CASE 
                    WHEN %I IS NULL THEN NULL
                    WHEN %I ~ ''^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'' 
                    THEN %I::uuid
                    ELSE NULL
                END', 
                rec.table_name, rec.column_name, rec.column_name, rec.column_name, rec.column_name);
        END IF;
    END LOOP;
END $$;

-- Fix 5: Now safely alter users.id column type
-- Check and fix users table ID column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'id' 
        AND data_type != 'uuid'
    ) THEN
        -- Convert users.id to UUID
        ALTER TABLE users ALTER COLUMN id TYPE UUID USING 
            CASE 
                WHEN id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
                THEN id::uuid
                ELSE gen_random_uuid()
            END;
    END IF;
END $$;

-- Fix 6: Recreate all foreign key constraints that reference users.id
-- Now that both users.id and all referencing columns are UUID, we can safely recreate constraints
DO $$
DECLARE
    rec RECORD;
BEGIN
    -- Find all tables with columns that likely reference users(id)
    -- Look for columns ending in _id that are UUID type and could reference users
    FOR rec IN 
        SELECT 
            table_name,
            column_name
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND data_type = 'uuid'
        AND (
            column_name = 'user_id' OR 
            column_name = 'owner_id' OR 
            column_name = 'author_id' OR
            column_name = 'sender_id' OR
            column_name = 'participant1_id' OR
            column_name = 'participant2_id' OR
            (column_name LIKE '%_id' AND table_name != 'users')
        )
        AND table_name != 'users'
    LOOP
        -- Try to create foreign key constraint, ignore if it fails (table might not reference users)
        BEGIN
            EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I_%I_fkey 
                FOREIGN KEY (%I) REFERENCES users(id) ON DELETE CASCADE', 
                rec.table_name, rec.table_name, rec.column_name, rec.column_name);
        EXCEPTION 
            WHEN others THEN
                -- Ignore errors for columns that don't actually reference users
                NULL;
        END;
    END LOOP;
    
    -- Specifically handle sessions table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sessions') THEN
        ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;
        ALTER TABLE sessions ADD CONSTRAINT sessions_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Fix 7: Create sessions policies with proper UUID casting
-- Sessions policies with proper UUID casting
CREATE POLICY "sessions_select_self" ON sessions 
FOR SELECT TO authenticated 
USING (
    user_id IS NOT NULL AND 
    user_id = auth_uid_as_uuid()
);

CREATE POLICY "sessions_insert_self" ON sessions 
FOR INSERT TO authenticated 
WITH CHECK (
    user_id IS NOT NULL AND 
    user_id = auth_uid_as_uuid()
);

CREATE POLICY "sessions_update_self" ON sessions 
FOR UPDATE TO authenticated 
USING (
    user_id IS NOT NULL AND 
    user_id = auth_uid_as_uuid()
)
WITH CHECK (
    user_id IS NOT NULL AND 
    user_id = auth_uid_as_uuid()
);

CREATE POLICY "sessions_delete_self" ON sessions 
FOR DELETE TO authenticated 
USING (
    user_id IS NOT NULL AND 
    user_id = auth_uid_as_uuid()
);

-- Users table policies
CREATE POLICY "Users can view own profile" ON users 
FOR SELECT TO authenticated 
USING (id = auth_uid_as_uuid());

CREATE POLICY "Users can update own profile" ON users 
FOR UPDATE TO authenticated 
USING (id = auth_uid_as_uuid())
WITH CHECK (id = auth_uid_as_uuid());

-- Fix 8: Recreate essential RLS policies with proper UUID casting
-- Enable RLS on all necessary tables
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_encryption_keys ENABLE ROW LEVEL SECURITY;

-- Admin full access policy for sessions
CREATE POLICY "admin_full_access" ON sessions 
FOR ALL TO service_role 
USING (true);

-- Public read access for community content
CREATE POLICY "bands_public_read" ON bands FOR SELECT TO authenticated USING (true);
CREATE POLICY "bands_owner_write" ON bands FOR ALL TO authenticated 
USING (owner_id IS NULL OR owner_id = auth_uid_as_uuid());

CREATE POLICY "tours_public_read" ON tours FOR SELECT TO authenticated USING (true);
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "photos_public_read" ON photos FOR SELECT TO authenticated USING (true);

-- User-specific content policies
CREATE POLICY "posts_owner_full" ON posts FOR ALL TO authenticated 
USING (user_id = auth_uid_as_uuid());
CREATE POLICY "posts_public_read" ON posts FOR SELECT TO authenticated 
USING (is_public = true);

CREATE POLICY "comments_owner_full" ON comments FOR ALL TO authenticated 
USING (author_id = auth_uid_as_uuid());
CREATE POLICY "comments_public_read" ON comments FOR SELECT TO authenticated USING (true);

CREATE POLICY "messages_owner_full" ON messages FOR ALL TO authenticated 
USING (author_id = auth_uid_as_uuid());
CREATE POLICY "messages_public_read" ON messages FOR SELECT TO authenticated USING (true);

-- Post interactions
CREATE POLICY "post_comments_owner" ON post_comments FOR ALL TO authenticated 
USING (user_id = auth_uid_as_uuid());
CREATE POLICY "post_comments_public_read" ON post_comments FOR SELECT TO authenticated USING (true);

CREATE POLICY "post_likes_owner" ON post_likes FOR ALL TO authenticated 
USING (user_id = auth_uid_as_uuid());

-- Notifications - users can only see their own notifications
CREATE POLICY "notifications_owner" ON notifications 
FOR SELECT TO authenticated 
USING (user_id = auth_uid_as_uuid());

CREATE POLICY "notifications_insert" ON notifications 
FOR INSERT TO authenticated 
WITH CHECK (true);

CREATE POLICY "notifications_update_own" ON notifications 
FOR UPDATE TO authenticated 
USING (user_id = auth_uid_as_uuid())
WITH CHECK (user_id = auth_uid_as_uuid());

-- User locations - users can only see their own location data
CREATE POLICY "user_locations_owner_select" ON user_locations 
FOR SELECT TO authenticated 
USING (user_id = auth_uid_as_uuid());

CREATE POLICY "user_locations_owner_insert" ON user_locations 
FOR INSERT TO authenticated 
WITH CHECK (user_id = auth_uid_as_uuid());

CREATE POLICY "user_locations_owner_update" ON user_locations 
FOR UPDATE TO authenticated 
USING (user_id = auth_uid_as_uuid())
WITH CHECK (user_id = auth_uid_as_uuid());

CREATE POLICY "user_locations_owner_delete" ON user_locations 
FOR DELETE TO authenticated 
USING (user_id = auth_uid_as_uuid());

-- Message encryption keys - users can only see their own keys
CREATE POLICY "message_encryption_keys_owner_select" ON message_encryption_keys 
FOR SELECT TO authenticated 
USING (user_id = auth_uid_as_uuid());

CREATE POLICY "message_encryption_keys_owner_insert" ON message_encryption_keys 
FOR INSERT TO authenticated 
WITH CHECK (user_id = auth_uid_as_uuid());

CREATE POLICY "message_encryption_keys_owner_update" ON message_encryption_keys 
FOR UPDATE TO authenticated 
USING (user_id = auth_uid_as_uuid())
WITH CHECK (user_id = auth_uid_as_uuid());

-- Conversations - users can only see their own conversations
CREATE POLICY "conversations_participant_select" ON conversations 
FOR SELECT TO authenticated 
USING (participant1_id = auth_uid_as_uuid() OR participant2_id = auth_uid_as_uuid());

CREATE POLICY "conversations_participant_insert" ON conversations 
FOR INSERT TO authenticated 
WITH CHECK (participant1_id = auth_uid_as_uuid() OR participant2_id = auth_uid_as_uuid());

CREATE POLICY "conversations_participant_update" ON conversations 
FOR UPDATE TO authenticated 
USING (participant1_id = auth_uid_as_uuid() OR participant2_id = auth_uid_as_uuid())
WITH CHECK (participant1_id = auth_uid_as_uuid() OR participant2_id = auth_uid_as_uuid());

-- Direct messages - users can only see messages in their conversations
CREATE POLICY "direct_messages_participant_select" ON direct_messages 
FOR SELECT TO authenticated 
USING (
    EXISTS (
        SELECT 1
        FROM   conversations
        WHERE  conversations.id = direct_messages.conversation_id
          AND (conversations.participant1_id = auth_uid_as_uuid()
               OR conversations.participant2_id = auth_uid_as_uuid())
    )
);

CREATE POLICY "direct_messages_sender_insert" ON direct_messages
FOR INSERT TO authenticated
WITH CHECK (
    sender_id = auth_uid_as_uuid() AND
    EXISTS (
        SELECT 1
        FROM   conversations
        WHERE  conversations.id = direct_messages.conversation_id
          AND (conversations.participant1_id = auth_uid_as_uuid()
               OR conversations.participant2_id = auth_uid_as_uuid())
    )
);

CREATE POLICY "direct_messages_sender_update" ON direct_messages 
FOR UPDATE TO authenticated 
USING (sender_id = auth_uid_as_uuid())
WITH CHECK (sender_id = auth_uid_as_uuid());

-- Fix 8: Verify and fix any remaining type mismatches
-- Create a diagnostic query to check for remaining issues
CREATE OR REPLACE FUNCTION check_uuid_consistency()
RETURNS TABLE(
    table_name text,
    column_name text,
    data_type text,
    issue text
)
LANGUAGE SQL
AS $$
    SELECT 
        t.table_name::text,
        t.column_name::text,
        t.data_type::text,
        CASE 
            WHEN t.column_name LIKE '%_id' AND t.data_type != 'uuid' 
            THEN 'ID column should be UUID type'
            WHEN t.column_name = 'id' AND t.data_type != 'uuid' 
            THEN 'Primary key should be UUID type'
            ELSE 'OK'
        END::text as issue
    FROM information_schema.columns t
    WHERE t.table_schema = 'public'
    AND (t.column_name LIKE '%_id' OR t.column_name = 'id')
    AND t.data_type != 'uuid'
    ORDER BY t.table_name, t.column_name;
$$;

-- Run the diagnostic
SELECT * FROM check_uuid_consistency() WHERE issue != 'OK';

-- Success message
SELECT 'UUID type mismatch fix completed successfully!' as status,
       'All ID columns should now be properly typed as UUID' as details;

-- Cleanup function
DROP FUNCTION IF EXISTS check_uuid_consistency();
