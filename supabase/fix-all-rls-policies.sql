-- ============================================================================
-- FIX: ALL RLS POLICIES THAT CAUSE INFINITE RECURSION
-- ============================================================================
-- Replace all admin check subqueries with the is_admin() SECURITY DEFINER function
-- ============================================================================

-- ============================================================================
-- COURSES
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
CREATE POLICY "Admins can manage courses" ON public.courses
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage course variants" ON public.course_variants;
CREATE POLICY "Admins can manage course variants" ON public.course_variants
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage course dates" ON public.course_dates;
CREATE POLICY "Admins can manage course dates" ON public.course_dates
    FOR ALL USING (public.is_admin());

-- ============================================================================
-- COURSE BOOKINGS
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.course_bookings;
CREATE POLICY "Admins can manage all bookings" ON public.course_bookings
    FOR ALL USING (public.is_admin());

-- ============================================================================
-- EVENTS
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
CREATE POLICY "Admins can manage events" ON public.events
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage community events" ON public.community_events;
CREATE POLICY "Admins can manage community events" ON public.community_events
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage signups" ON public.community_event_signups;
CREATE POLICY "Admins can manage signups" ON public.community_event_signups
    FOR ALL USING (public.is_admin());

-- ============================================================================
-- JOBS
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage jobs" ON public.jobs;
CREATE POLICY "Admins can manage jobs" ON public.jobs
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage job metrics" ON public.job_metrics;
CREATE POLICY "Admins can manage job metrics" ON public.job_metrics
    FOR ALL USING (public.is_admin());

-- ============================================================================
-- FORUM
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage forum posts" ON public.forum_posts;
CREATE POLICY "Admins can manage forum posts" ON public.forum_posts
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage forum replies" ON public.forum_replies;
CREATE POLICY "Admins can manage forum replies" ON public.forum_replies
    FOR ALL USING (public.is_admin());

-- ============================================================================
-- CREDENTIALS & TRANSACTIONS
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage credentials" ON public.digital_credentials;
CREATE POLICY "Admins can manage credentials" ON public.digital_credentials
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage transactions" ON public.credit_transactions;
CREATE POLICY "Admins can manage transactions" ON public.credit_transactions
    FOR ALL USING (public.is_admin());

-- ============================================================================
-- SURVEYS
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage surveys" ON public.surveys;
CREATE POLICY "Admins can manage surveys" ON public.surveys
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view demographics" ON public.survey_demographics;
CREATE POLICY "Admins can view demographics" ON public.survey_demographics
    FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view responses" ON public.survey_responses;
CREATE POLICY "Admins can view responses" ON public.survey_responses
    FOR SELECT USING (public.is_admin());

-- ============================================================================
-- SUPPORT TICKETS
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage tickets" ON public.support_tickets;
CREATE POLICY "Admins can manage tickets" ON public.support_tickets
    FOR ALL USING (public.is_admin());

-- ============================================================================
-- NOTIFICATION PREFERENCES
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage preferences" ON public.notification_preferences;
CREATE POLICY "Admins can manage preferences" ON public.notification_preferences
    FOR ALL USING (public.is_admin());

-- ============================================================================
-- APPLICATIONS & REQUESTS
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage applications" ON public.fellowship_applications;
CREATE POLICY "Admins can manage applications" ON public.fellowship_applications
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage funding requests" ON public.funding_requests;
CREATE POLICY "Admins can manage funding requests" ON public.funding_requests
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage tracking" ON public.applicant_tracking;
CREATE POLICY "Admins can manage tracking" ON public.applicant_tracking
    FOR ALL USING (public.is_admin());

-- ============================================================================
-- NEWS & CONTENT
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage news sources" ON public.news_sources;
CREATE POLICY "Admins can manage news sources" ON public.news_sources
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage news categories" ON public.news_categories;
CREATE POLICY "Admins can manage news categories" ON public.news_categories
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage news items" ON public.news_items;
CREATE POLICY "Admins can manage news items" ON public.news_items
    FOR ALL USING (public.is_admin());

-- ============================================================================
-- MARKETING & TEAM
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage marketing content" ON public.marketing_content;
CREATE POLICY "Admins can manage marketing content" ON public.marketing_content
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage team members" ON public.team_members;
CREATE POLICY "Admins can manage team members" ON public.team_members
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage email templates" ON public.email_templates;
CREATE POLICY "Admins can manage email templates" ON public.email_templates
    FOR ALL USING (public.is_admin());

-- ============================================================================
-- TRAINING & ORGANISATIONS
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage enquiries" ON public.training_enquiries;
CREATE POLICY "Admins can manage enquiries" ON public.training_enquiries
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage organisations" ON public.organisations;
CREATE POLICY "Admins can manage organisations" ON public.organisations
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage org invites" ON public.org_invites;
CREATE POLICY "Admins can manage org invites" ON public.org_invites
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage org seats" ON public.organisation_seats;
CREATE POLICY "Admins can manage org seats" ON public.organisation_seats
    FOR ALL USING (public.is_admin());
