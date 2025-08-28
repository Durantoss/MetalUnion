-- Fix user_badges table UUID type mismatch
-- This script specifically addresses the foreign key constraint error

-- First, check if the constraint exists and drop it
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_badges_user_id_fkey' 
        AND table_name = 'user_badges'
    ) THEN
        ALTER TABLE user_badges DROP CONSTRAINT user_badges_user_id_fkey;
    END IF;
END $$;

-- Drop the table if it exists to recreate with correct types
DROP TABLE IF EXISTS user_badges CASCADE;

-- Recreate the user_badges table with proper UUID types
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    badge_id UUID NOT NULL,
    awarded_at TIMESTAMP DEFAULT NOW(),
    progress JSONB
);

-- Add the foreign key constraints with proper UUID types
ALTER TABLE user_badges 
ADD CONSTRAINT user_badges_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_badges 
ADD CONSTRAINT user_badges_badge_id_fkey 
FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Add RLS policy
CREATE POLICY "user_badges_owner" ON user_badges 
FOR ALL TO authenticated 
USING (user_id = auth_uid_as_uuid());

-- Verify the fix by checking column types
SELECT 
    table_name,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'user_badges' 
AND column_name IN ('user_id', 'badge_id')
ORDER BY ordinal_position;

-- Verify foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
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
AND tc.table_name = 'user_badges';

SELECT 'user_badges table UUID fix completed successfully!' as status;
