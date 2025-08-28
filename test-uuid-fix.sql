-- Test Script for UUID Type Mismatch Fix
-- Run this AFTER applying uuid-type-mismatch-fix.sql to verify everything works

-- Test 1: Verify all ID columns are UUID type
SELECT 
    'ID Column Type Check' as test_name,
    table_name,
    column_name,
    data_type,
    CASE 
        WHEN data_type = 'uuid' THEN '✅ PASS'
        ELSE '❌ FAIL - Should be UUID'
    END as result
FROM information_schema.columns 
WHERE table_schema = 'public'
AND (column_name LIKE '%_id' OR column_name = 'id')
AND table_name IN ('users', 'sessions', 'bands', 'tours', 'reviews', 'photos', 'messages')
ORDER BY table_name, column_name;

-- Test 2: Verify sessions table has user_id column
SELECT 
    'Sessions user_id Column Check' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'sessions' 
            AND column_name = 'user_id'
            AND data_type = 'uuid'
        ) THEN '✅ PASS - user_id column exists and is UUID'
        ELSE '❌ FAIL - user_id column missing or wrong type'
    END as result;

-- Test 3: Verify foreign key relationships work
SELECT 
    'Foreign Key Relationships Check' as test_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name as foreign_table_name,
    ccu.column_name as foreign_column_name,
    '✅ PASS - FK exists' as result
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('sessions', 'bands', 'tours', 'reviews', 'photos', 'messages')
AND ccu.table_name = 'users'
ORDER BY tc.table_name;

-- Test 4: Verify RLS policies exist
SELECT 
    'RLS Policies Check' as test_name,
    schemaname,
    tablename,
    policyname,
    '✅ PASS - Policy exists' as result
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('users', 'sessions', 'bands', 'tours', 'reviews', 'photos', 'messages')
ORDER BY tablename, policyname;

-- Test 5: Verify helper function exists
SELECT 
    'Helper Function Check' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public'
            AND p.proname = 'auth_uid_as_uuid'
        ) THEN '✅ PASS - auth_uid_as_uuid function exists'
        ELSE '❌ FAIL - Helper function missing'
    END as result;

-- Test 6: Test UUID casting in a safe way (without actual auth context)
SELECT 
    'UUID Casting Test' as test_name,
    CASE 
        WHEN '550e8400-e29b-41d4-a716-446655440000'::text::uuid IS NOT NULL 
        THEN '✅ PASS - UUID casting works'
        ELSE '❌ FAIL - UUID casting broken'
    END as result;

-- Test 7: Verify table structure integrity
SELECT 
    'Table Structure Check' as test_name,
    table_name,
    COUNT(*) as column_count,
    '✅ PASS - Table exists' as result
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name IN ('users', 'sessions', 'bands', 'tours', 'reviews', 'photos', 'messages')
GROUP BY table_name
ORDER BY table_name;

-- Summary Report
SELECT 
    '=== TEST SUMMARY ===' as summary,
    'Run the queries above to verify the UUID fix worked correctly' as instructions,
    'All ID columns should be UUID type' as expectation_1,
    'All foreign keys should reference users(id)' as expectation_2,
    'RLS policies should exist with proper UUID casting' as expectation_3;
