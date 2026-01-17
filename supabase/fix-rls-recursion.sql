-- ============================================================================
-- FIX: RLS INFINITE RECURSION ON PROFILES TABLE
-- ============================================================================
-- The problem: Policies on "profiles" that check admin status query "profiles"
-- again, causing infinite recursion.
--
-- Solution: Use simple, direct conditions that don't trigger subqueries on
-- the same table. For admin checks, use SECURITY DEFINER functions.
-- ============================================================================

-- First, drop ALL existing policies on profiles to start fresh
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;

-- Create a helper function that bypasses RLS to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM public.profiles
    WHERE auth_id = auth.uid()
    LIMIT 1;

    RETURN COALESCE(user_role = 'admin', FALSE);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create a single, simple SELECT policy for profiles
-- This allows:
-- 1. Users to see their own profile (matched by auth_id)
-- 2. Users to see unclaimed legacy profiles matching their email
-- 3. Admins to see all profiles
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT USING (
        -- User's own profile (direct match, no subquery)
        auth.uid() = auth_id
        -- OR legacy profile claim (email match, profile not yet linked)
        OR (auth_id IS NULL AND LOWER(email) = LOWER(auth.jwt()->>'email'))
        -- OR user is admin (uses SECURITY DEFINER function to avoid recursion)
        OR public.is_admin()
    );

-- UPDATE policy - users can update their own, admins can update all
CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = auth_id
        OR public.is_admin()
    )
    WITH CHECK (
        auth.uid() = auth_id
        OR public.is_admin()
    );

-- INSERT policy - for creating new profiles (typically done by triggers)
CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT WITH CHECK (
        -- Allow if auth_id matches current user or is admin
        auth.uid() = auth_id
        OR public.is_admin()
    );

-- Ensure get_my_profile_id uses SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.get_my_profile_id()
RETURNS TEXT AS $$
DECLARE
    profile_id TEXT;
BEGIN
    SELECT id INTO profile_id
    FROM public.profiles
    WHERE auth_id = auth.uid()
    LIMIT 1;

    RETURN profile_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Ensure has_linked_profile uses SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.has_linked_profile()
RETURNS BOOLEAN AS $$
DECLARE
    found BOOLEAN;
BEGIN
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE auth_id = auth.uid()) INTO found;
    RETURN COALESCE(found, FALSE);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
