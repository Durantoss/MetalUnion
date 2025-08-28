-- Comprehensive UUID Type Diagnostic Script
-- This script checks for type mismatches across all foreign key relationships

-- 1. Check all foreign key constraints and their column types
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    c1.data_type as local_column_type,
    c1.udt_name as local_udt_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    c2.data_type as foreign_column_type,
    c2.udt_name as foreign_udt_name,
    CASE 
        WHEN c1.udt_name = c2.udt_name THEN '✓ MATCH'
        ELSE '✗ MISMATCH'
    END as type_compatibility
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.columns c1
    ON c1.table_name = tc.table_name
    AND c1.column_name = kcu.column_name
    AND c1.table_schema = tc.table_schema
JOIN information_schema.columns c2
    ON c2.table_name = ccu.table_name
    AND c2.column_name = ccu.column_name
    AND c2.table_schema = ccu.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- 2. Specifically check user_badges table
SELECT 
    'user_badges table column types:' as info,
    column_name,
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_badges' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check users table id column type
SELECT 
    'users table id column:' as info,
    column_name,
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'id'
AND table_schema = 'public';

-- 4. Check badges table id column type
SELECT 
    'badges table id column:' as info,
    column_name,
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'badges' 
AND column_name = 'id'
AND table_schema = 'public';

-- 5. Check if user_badges table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_badges' AND table_schema = 'public')
        THEN 'user_badges table EXISTS'
        ELSE 'user_badges table DOES NOT EXIST'
    END as table_status;

-- 6. List all tables with UUID columns
SELECT 
    table_name,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE udt_name = 'uuid'
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 7. Check for any varchar/text columns that might be storing UUIDs
SELECT 
    table_name,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE (column_name LIKE '%_id' OR column_name = 'id')
AND udt_name IN ('varchar', 'text', 'bpchar')
AND table_schema = 'public'
ORDER BY table_name, column_name;

SELECT 'UUID type diagnostic completed!' as status;
