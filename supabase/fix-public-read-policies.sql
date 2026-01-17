-- ============================================================================
-- FIX: ENSURE PUBLIC READ POLICIES EXIST
-- ============================================================================
-- These policies allow anyone (authenticated or not) to READ public data.
-- This is separate from admin write policies.
-- ============================================================================

-- COURSES - public read
DROP POLICY IF EXISTS "Anyone can view courses" ON public.courses;
CREATE POLICY "Anyone can view courses" ON public.courses
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone can view course variants" ON public.course_variants;
CREATE POLICY "Anyone can view course variants" ON public.course_variants
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone can view course dates" ON public.course_dates;
CREATE POLICY "Anyone can view course dates" ON public.course_dates
    FOR SELECT USING (TRUE);

-- EVENTS - public read
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
CREATE POLICY "Anyone can view events" ON public.events
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone can view community events" ON public.community_events;
CREATE POLICY "Anyone can view community events" ON public.community_events
    FOR SELECT USING (TRUE);

-- JOBS - public read (active only)
DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.jobs;
CREATE POLICY "Anyone can view active jobs" ON public.jobs
    FOR SELECT USING (TRUE);  -- Changed from status='active' to TRUE for now

-- JOB METRICS - public read
DROP POLICY IF EXISTS "Anyone can view job metrics" ON public.job_metrics;
CREATE POLICY "Anyone can view job metrics" ON public.job_metrics
    FOR SELECT USING (TRUE);

-- NEWS - public read
DROP POLICY IF EXISTS "Anyone can view published news" ON public.news_items;
CREATE POLICY "Anyone can view published news" ON public.news_items
    FOR SELECT USING (TRUE);  -- Changed from status check to TRUE for now

DROP POLICY IF EXISTS "Anyone can view news sources" ON public.news_sources;
CREATE POLICY "Anyone can view news sources" ON public.news_sources
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone can view news categories" ON public.news_categories;
CREATE POLICY "Anyone can view news categories" ON public.news_categories
    FOR SELECT USING (TRUE);

-- SURVEYS - public read for active
DROP POLICY IF EXISTS "Anyone can view active surveys" ON public.surveys;
CREATE POLICY "Anyone can view active surveys" ON public.surveys
    FOR SELECT USING (TRUE);  -- Changed from status check to TRUE for now

-- FORUM - public read
DROP POLICY IF EXISTS "Anyone can view forum posts" ON public.forum_posts;
CREATE POLICY "Anyone can view forum posts" ON public.forum_posts
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone can view forum replies" ON public.forum_replies;
CREATE POLICY "Anyone can view forum replies" ON public.forum_replies
    FOR SELECT USING (TRUE);

-- ORGANISATIONS - public read
DROP POLICY IF EXISTS "Anyone can view public organisations" ON public.organisations;
CREATE POLICY "Anyone can view public organisations" ON public.organisations
    FOR SELECT USING (TRUE);

-- MARKETING & TEAM - public read
DROP POLICY IF EXISTS "Anyone can view marketing content" ON public.marketing_content;
CREATE POLICY "Anyone can view marketing content" ON public.marketing_content
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone can view team members" ON public.team_members;
CREATE POLICY "Anyone can view team members" ON public.team_members
    FOR SELECT USING (TRUE);
