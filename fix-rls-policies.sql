-- Fix RLS Policies for Public Read Access
-- Run this in Supabase SQL Editor

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access to courses" ON courses;
DROP POLICY IF EXISTS "Allow public read access to course_dates" ON course_dates;
DROP POLICY IF EXISTS "Allow public read access to course_variants" ON course_variants;
DROP POLICY IF EXISTS "Allow public read access to events" ON events;
DROP POLICY IF EXISTS "Allow public read access to community_events" ON community_events;
DROP POLICY IF EXISTS "Allow public read access to jobs" ON jobs;
DROP POLICY IF EXISTS "Allow public read access to news_items" ON news_items;

-- Create new policies allowing anonymous and authenticated users to read public data
CREATE POLICY "Allow public read access to courses"
ON courses FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public read access to course_dates"
ON course_dates FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public read access to course_variants"
ON course_variants FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public read access to events"
ON events FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public read access to community_events"
ON community_events FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public read access to jobs"
ON jobs FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public read access to news_items"
ON news_items FOR SELECT
TO anon, authenticated
USING (true);

-- Verify RLS is enabled on these tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FIX USER_PROFILES RLS POLICIES
-- =====================================================

-- Drop existing user_profiles policies
DROP POLICY IF EXISTS "Users can view own linked profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can claim unlinked profile by email" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own linked profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view unclaimed profile by email" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can claim profile by email" ON user_profiles;
DROP POLICY IF EXISTS "Service can insert profiles" ON user_profiles;

-- Create new policies for user_profiles
-- Policy 1: Users can view their own profile (linked by auth_id)
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
TO authenticated
USING (auth.uid() = auth_id);

-- Policy 2: Users can view unclaimed profiles matching their email (for legacy account claiming)
CREATE POLICY "Users can view unclaimed profile by email"
ON user_profiles FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'email' = email AND auth_id IS NULL);

-- Policy 3: Users can update their own profile (linked by auth_id)
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);

-- Policy 4: Users can claim unclaimed profiles by setting auth_id to their own
CREATE POLICY "Users can claim profile by email"
ON user_profiles FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'email' = email AND auth_id IS NULL)
WITH CHECK (auth.jwt() ->> 'email' = email AND auth.uid() = auth_id);

-- Policy 5: Allow insert for new profiles (triggered by auth.users insert)
CREATE POLICY "Service can insert profiles"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = auth_id);

-- Verify RLS is enabled on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FIX DIGITAL_CREDENTIALS RLS POLICIES
-- =====================================================

-- Drop existing digital_credentials policies if any
DROP POLICY IF EXISTS "Users can view own credentials" ON digital_credentials;
DROP POLICY IF EXISTS "Public can verify credentials by code" ON digital_credentials;
DROP POLICY IF EXISTS "Service can insert credentials" ON digital_credentials;
DROP POLICY IF EXISTS "Service can update credentials" ON digital_credentials;

-- Policy 1: Users can view their own credentials
CREATE POLICY "Users can view own credentials"
ON digital_credentials FOR SELECT
TO authenticated
USING (userid IN (
  SELECT id FROM user_profiles WHERE auth_id = auth.uid()
));

-- Policy 2: Public (anonymous + authenticated) can verify any credential by verification code
-- This supports the public /verify-credential page
CREATE POLICY "Public can verify credentials by code"
ON digital_credentials FOR SELECT
TO anon, authenticated
USING (verificationcode IS NOT NULL);

-- Policy 3: Authenticated service can insert credentials
CREATE POLICY "Service can insert credentials"
ON digital_credentials FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 4: Authenticated service can update credentials
CREATE POLICY "Service can update credentials"
ON digital_credentials FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Verify RLS is enabled on digital_credentials
ALTER TABLE digital_credentials ENABLE ROW LEVEL SECURITY;
