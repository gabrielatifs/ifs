-- Diagnose NULL user IDs in user_profiles table
-- Run this in Supabase SQL Editor

-- Check for profiles with NULL id (should be impossible with PRIMARY KEY constraint!)
SELECT
    COUNT(*) as profiles_with_null_id
FROM user_profiles
WHERE id IS NULL;

-- Check for profiles with NULL auth_id (legacy accounts)
SELECT
    COUNT(*) as profiles_with_null_auth_id
FROM user_profiles
WHERE auth_id IS NULL;

-- Check for profiles where id exists but is used elsewhere
SELECT
    id,
    auth_id,
    email,
    first_name,
    last_name,
    organisation,
    membership_type,
    membership_status
FROM user_profiles
WHERE email ILIKE '%gabriel%'
ORDER BY email;

-- Check constraint on user_profiles table
SELECT
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.user_profiles'::regclass;

-- Check if there are any orphaned records in related tables
-- (records with userid that doesn't exist in user_profiles)
SELECT
    'course_bookings' as table_name,
    COUNT(*) as orphaned_count
FROM course_bookings
WHERE userid IS NOT NULL
    AND userid NOT IN (SELECT id FROM user_profiles WHERE id IS NOT NULL)

UNION ALL

SELECT
    'digital_credentials' as table_name,
    COUNT(*) as orphaned_count
FROM digital_credentials
WHERE userid IS NOT NULL
    AND userid NOT IN (SELECT id FROM user_profiles WHERE id IS NOT NULL)

UNION ALL

SELECT
    'credit_transactions' as table_name,
    COUNT(*) as orphaned_count
FROM credit_transactions
WHERE userid IS NOT NULL
    AND userid NOT IN (SELECT id FROM user_profiles WHERE id IS NOT NULL);
