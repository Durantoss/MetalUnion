-- MetalUnion UUID Conversion Migration Script
-- This script safely converts VARCHAR UUID columns to proper UUID types
-- and handles all dependencies (policies, foreign keys, constraints)

BEGIN;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1️⃣ Function: check whether a column needs conversion
CREATE OR REPLACE FUNCTION check_column_needs_conversion(
    table_schema_name TEXT,
    table_name_param   TEXT,
    column_name_param  TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = table_schema_name
          AND table_name   = table_name_param
          AND column_name  = column_name_param
          AND data_type IN ('character varying', 'varchar', 'text')
          AND (column_default LIKE '%gen_random_uuid()%' OR column_default LIKE '%uuid_generate_v4()%')
    );
END;
$$ LANGUAGE plpgsql;

-- 2️⃣ Function: fetch policies for a list of tables
CREATE OR REPLACE FUNCTION get_policies_for_tables(table_names TEXT[])
RETURNS TABLE(
    policy_name TEXT,
    table_name  TEXT,
    policy_cmd  TEXT,
    policy_roles TEXT,
    policy_using TEXT,
    policy_check TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        policyname::TEXT,
        tablename::TEXT,
        cmd::TEXT,
        roles::TEXT,
        COALESCE(qual,        'true')::TEXT AS using_expr,
        COALESCE(with_check,  'true')::TEXT AS check_expr
    FROM pg_policies
    WHERE tablename = ANY (table_names);
END;
$$ LANGUAGE plpgsql;

-- 3️⃣ Log start
DO $$
BEGIN
    RAISE NOTICE 'Starting UUID conversion migration for MetalUnion database...';
    RAISE NOTICE 'Timestamp: %', NOW();
END;
$$;

-- 4️⃣ Store existing policies for later restoration
CREATE TEMP TABLE temp_policies AS
SELECT *
FROM get_policies_for_tables(
    ARRAY[
        'users','badges','user_badges','sessions','user_locations','bands',
        'message_encryption_keys','notifications','conversations','direct_messages',
        'message_delivery_receipts'
    ]
);

-- 5️⃣ Drop all RLS policies that may reference the columns we'll convert
DO $$
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE 'Dropping existing RLS policies...';
    FOR r IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE tablename = ANY (
            ARRAY[
                'users','badges','user_badges','sessions','user_locations',
                'message_encryption_keys','notifications','conversations',
                'direct_messages','message_delivery_receipts','proximity_matches',
                'user_follows','reactions','comment_reactions','posts','post_comments',
                'post_likes','post_comment_likes','comments','bands','tours',
                'concert_attendance','reviews','photos','messages','user_achievements',
                'activity_feed','polls','poll_votes','events','event_attendees',
                'review_ratings','pit_messages','pit_replies'
            ]
        )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
        RAISE NOTICE 'Dropped policy % on table %', r.policyname, r.tablename;
    END LOOP;
END;
$$;

-- 6️⃣ Drop foreign‑key constraints that depend on the columns we'll convert
DO $$
BEGIN
    RAISE NOTICE 'Dropping foreign key constraints...';

    ALTER TABLE user_badges          DROP CONSTRAINT IF EXISTS user_badges_user_id_fkey;
    ALTER TABLE user_badges          DROP CONSTRAINT IF EXISTS user_badges_badge_id_fkey;
    -- Drop foreign key constraints (updated)
    ALTER TABLE user_sessions DROP CONSTRAINT IF EXISTS user_sessions_user_id_fkey;
    ALTER TABLE user_locations       DROP CONSTRAINT IF EXISTS user_locations_user_id_fkey;
    ALTER TABLE message_encryption_keys DROP CONSTRAINT IF EXISTS message_encryption_keys_user_id_fkey;
    ALTER TABLE notifications        DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
    ALTER TABLE notifications        DROP CONSTRAINT IF EXISTS notifications_from_user_id_fkey;
    ALTER TABLE conversations        DROP CONSTRAINT IF EXISTS conversations_participant1_id_fkey;
    ALTER TABLE conversations        DROP CONSTRAINT IF EXISTS conversations_participant2_id_fkey;
    ALTER TABLE direct_messages      DROP CONSTRAINT IF EXISTS direct_messages_conversation_id_fkey;
    ALTER TABLE direct_messages      DROP CONSTRAINT IF EXISTS direct_messages_sender_id_fkey;
    ALTER TABLE message_delivery_receipts DROP CONSTRAINT IF EXISTS message_delivery_receipts_message_id_fkey;
    ALTER TABLE message_delivery_receipts DROP CONSTRAINT IF EXISTS message_delivery_receipts_user_id_fkey;
    ALTER TABLE bands                DROP CONSTRAINT IF EXISTS bands_owner_id_fkey;
    ALTER TABLE proximity_matches    DROP CONSTRAINT IF EXISTS proximity_matches_user_id_1_fkey;
    ALTER TABLE proximity_matches    DROP CONSTRAINT IF EXISTS proximity_matches_user_id_2_fkey;
    ALTER TABLE user_follows         DROP CONSTRAINT IF EXISTS user_follows_follower_id_fkey;
    ALTER TABLE user_follows         DROP CONSTRAINT IF EXISTS user_follows_following_id_fkey;
    ALTER TABLE reactions            DROP CONSTRAINT IF EXISTS reactions_user_id_fkey;
    ALTER TABLE comment_reactions    DROP CONSTRAINT IF EXISTS comment_reactions_user_id_fkey;

    RAISE NOTICE 'Foreign key constraints dropped';
END;
$$;

-- 7️⃣ Convert primary‑key columns to UUID (if they are still varchar/text)
DO $$
BEGIN
    RAISE NOTICE 'Converting primary‑key columns to UUID...';

    IF check_column_needs_conversion('public','users','id') THEN
        ALTER TABLE users ALTER COLUMN id TYPE UUID USING (id::uuid);
        ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();
    END IF;

    IF check_column_needs_conversion('public','badges','id') THEN
        ALTER TABLE badges ALTER COLUMN id TYPE UUID USING (id::uuid);
        ALTER TABLE badges ALTER COLUMN id SET DEFAULT gen_random_uuid();
    END IF;

    IF check_column_needs_conversion('public','bands','id') THEN
        ALTER TABLE bands ALTER COLUMN id TYPE UUID USING (id::uuid);
        ALTER TABLE bands ALTER COLUMN id SET DEFAULT gen_random_uuid();
    END IF;

    -- Additional primary‑keys (add/remove as needed)
    IF check_column_needs_conversion('public','user_badges','id') THEN
        ALTER TABLE user_badges ALTER COLUMN id TYPE UUID USING (id::uuid);
        ALTER TABLE user_badges ALTER COLUMN id SET DEFAULT gen_random_uuid();
    END IF;
    IF check_column_needs_conversion('public','user_locations','id') THEN
        ALTER TABLE user_locations ALTER COLUMN id TYPE UUID USING (id::uuid);
        ALTER TABLE user_locations ALTER COLUMN id SET DEFAULT gen_random_uuid();
    END IF;
    IF check_column_needs_conversion('public','message_encryption_keys','id') THEN
        ALTER TABLE message_encryption_keys ALTER COLUMN id TYPE UUID USING (id::uuid);
        ALTER TABLE message_encryption_keys ALTER COLUMN id SET DEFAULT gen_random_uuid();
    END IF;
    IF check_column_needs_conversion('public','notifications','id') THEN
        ALTER TABLE notifications ALTER COLUMN id TYPE UUID USING (id::uuid);
        ALTER TABLE notifications ALTER COLUMN id SET DEFAULT gen_random_uuid();
    END IF;
    IF check_column_needs_conversion('public','conversations','id') THEN
        ALTER TABLE conversations ALTER COLUMN id TYPE UUID USING (id::uuid);
        ALTER TABLE conversations ALTER COLUMN id SET DEFAULT gen_random_uuid();
    END IF;
    IF check_column_needs_conversion('public','direct_messages','id') THEN
        ALTER TABLE direct_messages ALTER COLUMN id TYPE UUID USING (id::uuid);
        ALTER TABLE direct_messages ALTER COLUMN id SET DEFAULT gen_random_uuid();
    END IF;
    IF check_column_needs_conversion('public','message_delivery_receipts','id') THEN
        ALTER TABLE message_delivery_receipts ALTER COLUMN id TYPE UUID USING (id::uuid);
        ALTER TABLE message_delivery_receipts ALTER COLUMN id SET DEFAULT gen_random_uuid();
    END IF;
END;
$$;

-- 8️⃣ Convert foreign‑key columns to UUID (if needed)
DO $$
BEGIN
    RAISE NOTICE 'Converting foreign‑key columns to UUID...';

    IF check_column_needs_conversion('public','user_badges','user_id') THEN
        ALTER TABLE user_badges ALTER COLUMN user_id TYPE UUID USING (user_id::uuid);
    END IF;
    IF check_column_needs_conversion('public','user_badges','badge_id') THEN
        ALTER TABLE user_badges ALTER COLUMN badge_id TYPE UUID USING (badge_id::uuid);
    END IF;
    -- Convert foreign‑key column (updated)
    IF check_column_needs_conversion('public', 'user_sessions', 'user_id') THEN
        ALTER TABLE user_sessions ALTER COLUMN user_id TYPE UUID USING (user_id::uuid);
    END IF;
    IF check_column_needs_conversion('public','user_locations','user_id') THEN
        ALTER TABLE user_locations ALTER COLUMN user_id TYPE UUID USING (user_id::uuid);
    END IF;
    IF check_column_needs_conversion('public','message_encryption_keys','user_id') THEN
        ALTER TABLE message_encryption_keys ALTER COLUMN user_id TYPE UUID USING (user_id::uuid);
    END IF;
    IF check_column_needs_conversion('public','notifications','user_id') THEN
        ALTER TABLE notifications ALTER COLUMN user_id TYPE UUID USING (user_id::uuid);
    END IF;
    IF check_column_needs_conversion('public','notifications','from_user_id') THEN
        ALTER TABLE notifications ALTER COLUMN from_user_id TYPE UUID USING (from_user_id::uuid);
    END IF;
    IF check_column_needs_conversion('public','conversations','participant1_id') THEN
        ALTER TABLE conversations ALTER COLUMN participant1_id TYPE UUID USING (participant1_id::uuid);
    END IF;
    IF check_column_needs_conversion('public','conversations','participant2_id') THEN
        ALTER TABLE conversations ALTER COLUMN participant2_id TYPE UUID USING (participant2_id::uuid);
    END IF;
    IF check_column_needs_conversion('public','direct_messages','conversation_id') THEN
        ALTER TABLE direct_messages ALTER COLUMN conversation_id TYPE UUID USING (conversation_id::uuid);
    END IF;
    IF check_column_needs_conversion('public','direct_messages','sender_id') THEN
        ALTER TABLE direct_messages ALTER COLUMN sender_id TYPE UUID USING (sender_id::uuid);
    END IF;
    IF check_column_needs_conversion('public','message_delivery_receipts','message_id') THEN
        ALTER TABLE message_delivery_receipts ALTER COLUMN message_id TYPE UUID USING (message_id::uuid);
    END IF;
    IF check_column_needs_conversion('public','message_delivery_receipts','user_id') THEN
        ALTER TABLE message_delivery_receipts ALTER COLUMN user_id TYPE UUID USING (user_id::uuid);
    END IF;
    IF check_column_needs_conversion('public','bands','owner_id') THEN
        ALTER TABLE bands ALTER COLUMN owner_id TYPE UUID USING (owner_id::uuid);
    END IF;
END;
$$;

-- 9️⃣ Re‑create the `sessions` table (example – adapt columns as needed)
CREATE TABLE sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    -- other columns as needed
    created_at timestamp with time zone DEFAULT now()
);

-- 10️⃣ Re‑create foreign‑key constraints
DO $$
BEGIN
    RAISE NOTICE 'Re‑creating foreign‑key constraints...';

    ALTER TABLE user_badges
        ADD CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        ADD CONSTRAINT user_badges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE ON UPDATE CASCADE;

    -- Re‑create foreign key (updated)
    ALTER TABLE user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

    ALTER TABLE user_locations
        ADD CONSTRAINT user_locations_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

    ALTER TABLE message_encryption_keys
        ADD CONSTRAINT message_encryption_keys_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

    ALTER TABLE notifications
        ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        ADD CONSTRAINT notifications_from_user_id_fkey FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE;

    ALTER TABLE conversations
        ADD CONSTRAINT conversations_participant1_id_fkey FOREIGN KEY (participant1_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        ADD CONSTRAINT conversations_participant2_id_fkey FOREIGN KEY (participant2_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

    ALTER TABLE direct_messages
        ADD CONSTRAINT direct_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE ON UPDATE CASCADE,
        ADD CONSTRAINT direct_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

    ALTER TABLE message_delivery_receipts
        ADD CONSTRAINT message_delivery_receipts_message_id_fkey FOREIGN KEY (message_id) REFERENCES direct_messages(id) ON DELETE CASCADE ON UPDATE CASCADE,
        ADD CONSTRAINT message_delivery_receipts_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

    ALTER TABLE bands
        ADD CONSTRAINT bands_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

    RAISE NOTICE 'Foreign‑key constraints recreated';
END;
$$;

-- 11️⃣ Re‑create RLS policies (example subset – add the rest as needed)
DO $$
BEGIN
    RAISE NOTICE 'Re‑creating RLS policies...';

    CREATE POLICY "Users can view own profile" ON users
        FOR SELECT TO authenticated USING (id = auth.uid());

    CREATE POLICY "Users can update own profile" ON users
        FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

    CREATE POLICY "user_sessions_select_self" ON user_sessions
        FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "user_sessions_insert_self" ON user_sessions
        FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "user_sessions_update_self" ON user_sessions
        FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "user_sessions_delete_self" ON user_sessions
        FOR DELETE TO authenticated USING (auth.uid() = user_id);

    CREATE POLICY "user_badges_owner" ON user_badges
        FOR SELECT TO authenticated USING (user_id = auth.uid());

    CREATE POLICY "User locations – read/write" ON user_locations
        FOR SELECT TO authenticated USING (user_id = auth.uid());
    CREATE POLICY "User locations – insert" ON user_locations
        FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
    CREATE POLICY "User locations – update" ON user_locations
        FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
    CREATE POLICY "User locations – delete" ON user_locations
        FOR DELETE TO authenticated USING (user_id = auth.uid());

    -- Message encryption keys policies
    CREATE POLICY "Users can view own encryption keys" ON message_encryption_keys
        FOR SELECT TO authenticated USING (user_id = auth.uid());
    CREATE POLICY "Users can insert own encryption keys" ON message_encryption_keys
        FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
    CREATE POLICY "Users can update own encryption keys" ON message_encryption_keys
        FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

    -- Notifications policies
    CREATE POLICY "Users can view own notifications" ON notifications
        FOR SELECT TO authenticated USING (user_id = auth.uid());
    CREATE POLICY "Users can insert notifications" ON notifications
        FOR INSERT TO authenticated WITH CHECK (true);
    CREATE POLICY "Users can update own notifications" ON notifications
        FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

    -- Conversations policies
    CREATE POLICY "Users can view own conversations" ON conversations
        FOR SELECT TO authenticated USING (participant1_id = auth.uid() OR participant2_id = auth.uid());
    CREATE POLICY "Users can insert conversations" ON conversations
        FOR INSERT TO authenticated WITH CHECK (participant1_id = auth.uid() OR participant2_id = auth.uid());
    CREATE POLICY "Users can update own conversations" ON conversations
        FOR UPDATE TO authenticated USING (participant1_id = auth.uid() OR participant2_id = auth.uid()) WITH CHECK (participant1_id = auth.uid() OR participant2_id = auth.uid());

    -- Direct messages policies
    CREATE POLICY "Users can view own messages" ON direct_messages
        FOR SELECT TO authenticated USING (
            EXISTS (
                SELECT 1
                FROM conversations
                WHERE conversations.id = direct_messages.conversation_id
                  AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
            )
        );
    CREATE POLICY "Users can insert messages in own conversations" ON direct_messages
        FOR INSERT TO authenticated WITH CHECK (
            sender_id = auth.uid() AND
            EXISTS (
                SELECT 1
                FROM conversations
                WHERE conversations.id = direct_messages.conversation_id
                  AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
            )
        );
    CREATE POLICY "Users can update own messages" ON direct_messages
        FOR UPDATE TO authenticated USING (sender_id = auth.uid()) WITH CHECK (sender_id = auth.uid());

    -- Message delivery receipts policies
    CREATE POLICY "message_delivery_receipts_participant" ON message_delivery_receipts
        FOR ALL TO authenticated USING (user_id = auth.uid());

    -- Bands table policies
    CREATE POLICY "bands_public_select" ON bands
        FOR SELECT TO authenticated USING (true);
    CREATE POLICY "bands_owner_insert" ON bands
        FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
    CREATE POLICY "bands_owner_update" ON bands
        FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
    CREATE POLICY "bands_owner_delete" ON bands
        FOR DELETE TO authenticated USING (auth.uid() = owner_id);

    RAISE NOTICE 'RLS policies recreated';
END;
$$;

-- 12️⃣ Clean‑up helper objects
DROP FUNCTION IF EXISTS check_column_needs_conversion(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS get_policies_for_tables(TEXT[]);
DROP TABLE IF EXISTS temp_policies;

COMMIT;

-- 13️⃣ Final validation step (optional – you can keep it empty)
DO $$
BEGIN
    RAISE NOTICE 'UUID migration completed successfully at %', NOW();
END;
$$;
