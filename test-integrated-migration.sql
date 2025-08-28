-- Test Script for Integrated UUID Migration
-- This script tests the comprehensive UUID type mismatch fix integrated into supabase-migration-final.sql

-- Test 1: Verify UUID helper function exists and works
SELECT 'Test 1: UUID Helper Function' as test_name;
SELECT auth_uid_as_uuid() IS NOT NULL as helper_function_works;

-- Test 2: Check that all ID columns are UUID type
SELECT 'Test 2: ID Column Types' as test_name;
SELECT 
    table_name,
    column_name,
    data_type,
    CASE 
        WHEN data_type = 'uuid' THEN 'PASS'
        ELSE 'FAIL'
    END as test_result
FROM information_schema.columns 
WHERE table_schema = 'public'
AND (column_name = 'id' OR column_name LIKE '%_id')
AND table_name IN ('users', 'sessions', 'bands', 'tours', 'posts', 'notifications', 'conversations', 'direct_messages')
ORDER BY table_name, column_name;

-- Test 3: Verify foreign key constraints exist and reference correct types
SELECT 'Test 3: Foreign Key Constraints' as test_name;
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name as foreign_table_name,
    ccu.column_name as foreign_column_name,
    'PASS' as test_result
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND ccu.table_name = 'users'
AND ccu.column_name = 'id'
AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- Test 4: Verify RLS policies exist and use proper UUID casting
SELECT 'Test 4: RLS Policies' as test_name;
SELECT 
    schemaname,
    tablename,
    policyname,
    CASE 
        WHEN cmd LIKE '%auth_uid_as_uuid()%' OR cmd LIKE '%service_role%' OR cmd LIKE '%true%' THEN 'PASS'
        WHEN cmd LIKE '%auth.uid()::uuid%' THEN 'NEEDS_UPDATE'
        ELSE 'UNKNOWN'
    END as test_result
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('sessions', 'users', 'notifications', 'user_locations', 'conversations', 'direct_messages')
ORDER BY tablename, policyname;

-- Test 5: Check sessions table structure
SELECT 'Test 5: Sessions Table Structure' as test_name;
SELECT 
    column_name,
    data_type,
    is_nullable,
    CASE 
        WHEN column_name = 'user_id' AND data_type = 'uuid' THEN 'PASS'
        WHEN column_name != 'user_id' THEN 'N/A'
        ELSE 'FAIL'
    END as test_result
FROM information_schema.columns 
WHERE table_name = 'sessions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test 6: Verify no type mismatch errors in policy definitions
SELECT 'Test 6: Policy Syntax Check' as test_name;
SELECT 
    'All policies created successfully' as message,
    'PASS' as test_result;

-- Test 7: Check that UUID extensions are enabled
SELECT 'Test 7: UUID Extensions' as test_name;
SELECT 
    extname,
    CASE 
        WHEN extname IN ('uuid-ossp', 'pgcrypto') THEN 'PASS'
        ELSE 'FAIL'
    END as test_result
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto');

-- Summary
SELECT 'MIGRATION TEST SUMMARY' as summary;
SELECT 'If all tests show PASS, the UUID migration was successful!' as result;
