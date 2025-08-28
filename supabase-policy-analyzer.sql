-- MetalUnion Policy Analyzer Script
-- This script helps analyze existing policies and generates DROP/CREATE statements
-- Use this BEFORE running the UUID conversion migration to understand your current state

-- 1. Generate DROP POLICY statements for all policies on tables that will be affected
SELECT 
    format('DROP POLICY IF EXISTS %I ON %I;', policyname, tablename) as drop_statement,
    tablename,
    policyname,
    cmd as policy_type,
    roles as policy_roles
FROM pg_policies 
WHERE tablename IN (
    'users', 'badges', 'user_badges', 'sessions', 'user_locations', 
    'message_encryption_keys', 'notifications', 'conversations', 
    'direct_messages', 'message_delivery_receipts', 'proximity_matches',
    'user_follows', 'reactions', 'comment_reactions', 'posts', 'post_comments',
    'post_likes', 'post_comment_likes', 'comments', 'bands', 'tours',
    'concert_attendance', 'reviews', 'photos', 'messages', 'user_achievements',
    'activity_feed', 'polls', 'poll_votes', 'events', 'event_attendees',
    'review_ratings', 'pit_messages', 'pit_replies'
)
ORDER BY tablename, policyname;

-- 2. Generate CREATE POLICY statements for restoration after UUID conversion
SELECT 
    format(
        'CREATE POLICY %I ON %I FOR %s TO %s USING (%s)%s;',
        policyname,
        tablename,
        cmd,
        roles,
        COALESCE(qual, 'true'),
        CASE 
            WHEN with_check IS NOT NULL THEN format(' WITH CHECK (%s)', with_check)
            ELSE ''
        END
    ) as create_statement,
    tablename,
    policyname,
    cmd as policy_type
FROM pg_policies 
WHERE tablename IN (
    'users', 'badges', 'user_badges', 'sessions', 'user_locations', 
    'message_encryption_keys', 'notifications', 'conversations', 
    'direct_messages', 'message_delivery_receipts'
)
ORDER BY tablename, policyname;

-- 3. Check current column types that might need UUID conversion
SELECT 
    table_name,
    column_name,
    data_type,
    column_default,
    is_nullable,
    CASE 
        WHEN data_type IN ('character varying', 'varchar', 'text') 
             AND (column_default LIKE '%gen_random_uuid()%' OR column_default LIKE '%uuid_generate_v4()%')
        THEN 'NEEDS_CONVERSION'
        WHEN data_type = 'uuid'
        THEN 'ALREADY_UUID'
        ELSE 'NO_ACTION_NEEDED'
    END as conversion_status
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN (
      'users', 'badges', 'user_badges', 'sessions', 'user_locations', 
      'message_encryption_keys', 'notifications', 'conversations', 
      'direct_messages', 'message_delivery_receipts'
  )
  AND column_name IN ('id', 'user_id', 'badge_id', 'conversation_id', 'sender_id', 'message_id', 'participant1_id', 'participant2_id', 'from_user_id')
ORDER BY table_name, column_name;

-- 4. Check foreign key constraints that will be affected
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
    AND tc.table_schema = rc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN (
      'user_badges', 'sessions', 'user_locations', 'message_encryption_keys', 
      'notifications', 'conversations', 'direct_messages', 'message_delivery_receipts'
  )
ORDER BY tc.table_name, tc.constraint_name;

-- 5. Summary report of what will be affected by the UUID conversion
WITH policy_count AS (
    SELECT 
        tablename,
        COUNT(*) as policy_count
    FROM pg_policies 
    WHERE tablename IN (
        'users', 'badges', 'user_badges', 'sessions', 'user_locations', 
        'message_encryption_keys', 'notifications', 'conversations', 
        'direct_messages', 'message_delivery_receipts'
    )
    GROUP BY tablename
),
column_analysis AS (
    SELECT 
        table_name,
        COUNT(*) as total_columns,
        COUNT(CASE WHEN data_type IN ('character varying', 'varchar', 'text') 
                        AND (column_default LIKE '%gen_random_uuid()%' OR column_default LIKE '%uuid_generate_v4()%')
                   THEN 1 END) as needs_conversion,
        COUNT(CASE WHEN data_type = 'uuid' THEN 1 END) as already_uuid
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name IN (
          'users', 'badges', 'user_badges', 'sessions', 'user_locations', 
          'message_encryption_keys', 'notifications', 'conversations', 
          'direct_messages', 'message_delivery_receipts'
      )
      AND column_name IN ('id', 'user_id', 'badge_id', 'conversation_id', 'sender_id', 'message_id', 'participant1_id', 'participant2_id', 'from_user_id')
    GROUP BY table_name
),
fk_count AS (
    SELECT 
        tc.table_name,
        COUNT(*) as foreign_key_count
    FROM information_schema.table_constraints AS tc 
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name IN (
          'user_badges', 'sessions', 'user_locations', 'message_encryption_keys', 
          'notifications', 'conversations', 'direct_messages', 'message_delivery_receipts'
      )
    GROUP BY tc.table_name
)
SELECT 
    ca.table_name,
    ca.total_columns,
    ca.needs_conversion,
    ca.already_uuid,
    COALESCE(pc.policy_count, 0) as policies_to_recreate,
    COALESCE(fk.foreign_key_count, 0) as foreign_keys_to_recreate,
    CASE 
        WHEN ca.needs_conversion > 0 THEN 'MIGRATION_REQUIRED'
        WHEN ca.already_uuid > 0 THEN 'ALREADY_MIGRATED'
        ELSE 'NO_ACTION_NEEDED'
    END as migration_status
FROM column_analysis ca
LEFT JOIN policy_count pc ON ca.table_name = pc.tablename
LEFT JOIN fk_count fk ON ca.table_name = fk.table_name
ORDER BY ca.table_name;

-- 6. Generate a backup script for current policies (run this before migration)
SELECT 
    format(
        '-- Backup of policy: %s on table %s
CREATE POLICY %I ON %I FOR %s TO %s USING (%s)%s;',
        policyname,
        tablename,
        policyname,
        tablename,
        cmd,
        roles,
        COALESCE(qual, 'true'),
        CASE 
            WHEN with_check IS NOT NULL THEN format(' WITH CHECK (%s)', with_check)
            ELSE ''
        END
    ) as policy_backup_script
FROM pg_policies 
WHERE tablename IN (
    'users', 'badges', 'user_badges', 'sessions', 'user_locations', 
    'message_encryption_keys', 'notifications', 'conversations', 
    'direct_messages', 'message_delivery_receipts'
)
ORDER BY tablename, policyname;
