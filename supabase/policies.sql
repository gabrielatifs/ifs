-- Enable RLS on all tables (already done in init_schema, but good practice to reiterate or ensure policies exist)

-- Policy for Public Read Access (for content that should be visible to everyone or authenticated users)
-- Adjust 'public' to 'authenticated' if you want only logged-in users to see these.
-- For a job board/portal, usually Jobs, Courses, Events are public.

DO $$
BEGIN
    -- Loop through tables and apply simple polices
    -- Note: precise control requires specific knowledge of which tables are private.
    -- Assuming a "public read" default for content tables is safer for a migration start, 
    -- then lock down user-specific data.
END $$;

-- Allow Service Role full access (migrator script uses service role key usually, or if using anon key with admin privileges)
-- Supabase Service Role bypasses RLS automatically, but if using a client with a user token, we need policies.
-- The migration script checks for VITE_SUPABASE_SERVICE_ROLE_KEY. If available, it bypasses RLS.

-- Public Read Policies
CREATE POLICY "Public read access for jobs" ON public.job FOR SELECT USING (true);
CREATE POLICY "Public read access for events" ON public.event FOR SELECT USING (true);
CREATE POLICY "Public read access for courses" ON public.course FOR SELECT USING (true);
CREATE POLICY "Public read access for news" ON public.news_item FOR SELECT USING (true);
CREATE POLICY "Public read access for organisations" ON public.organisation FOR SELECT USING (true);

-- User Specific Policies (examples)
-- ApplicantTracking: User can see their own applications?
CREATE POLICY "Users can view own application tracking" ON public.applicant_tracking 
    FOR SELECT USING (auth.uid()::text = userid);

CREATE POLICY "Users can insert own application tracking" ON public.applicant_tracking 
    FOR INSERT WITH CHECK (auth.uid()::text = userid);

-- User Profiles (if we had a user_profiles table, but we see 'user_profile' in entities not key csv... wait, there was no user_profile csv?)
-- Checked CSV list: TeamMember, but no UserProfile export? 
-- Base44 might store users differently.

-- Grant basic insert access for authenticated users to tables they interact with
CREATE POLICY "Auth users can book courses" ON public.course_booking 
    FOR INSERT WITH CHECK (auth.uid()::text = userid);

CREATE POLICY "Auth users can view own bookings" ON public.course_booking 
    FOR SELECT USING (auth.uid()::text = userid);

-- Admin Access?
-- Usually handled by a role column or separate admin client.
