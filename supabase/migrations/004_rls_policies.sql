-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- These policies control access to data based on authentication status and
-- ownership. They use case-insensitive email matching to support legacy data
-- migration.
-- ============================================================================

-- ============================================================================
-- PROFILES
-- ============================================================================

-- Users can view their own profile (by auth_id or email match for legacy)
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (
        auth.uid() = auth_id
        OR (public.auth_email_matches(email) AND status = 'LEGACY' AND auth_id IS NULL)
    );

-- Users can update their own profile (must be linked via auth_id)
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = auth_id)
    WITH CHECK (auth.uid() = auth_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================================================
-- ORGANISATIONS
-- ============================================================================

-- Anyone can view public organisations
CREATE POLICY "Anyone can view public organisations" ON public.organisations
    FOR SELECT USING (is_publicly_visible = TRUE OR status = 'active');

-- Primary contacts can update their organisation
CREATE POLICY "Primary contacts can update org" ON public.organisations
    FOR UPDATE USING (
        public.email_matches_if_linked(primary_contact_email)
    );

-- Admins can manage all organisations
CREATE POLICY "Admins can manage organisations" ON public.organisations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================================================
-- COURSES (Public read, admin write)
-- ============================================================================

CREATE POLICY "Anyone can view courses" ON public.courses
    FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage courses" ON public.courses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Anyone can view course variants" ON public.course_variants
    FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage course variants" ON public.course_variants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Anyone can view course dates" ON public.course_dates
    FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage course dates" ON public.course_dates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================================================
-- COURSE BOOKINGS
-- ============================================================================

-- Users can view their own bookings (by auth link OR email match)
CREATE POLICY "Users can view own bookings" ON public.course_bookings
    FOR SELECT USING (
        user_id = public.get_my_profile_id()
        OR public.email_matches_if_linked(user_email)
    );

-- Users can create bookings for themselves
CREATE POLICY "Authenticated users can create bookings" ON public.course_bookings
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- Admins can view all bookings
CREATE POLICY "Admins can manage all bookings" ON public.course_bookings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================================================
-- EVENTS & COMMUNITY
-- ============================================================================

CREATE POLICY "Anyone can view events" ON public.events
    FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage events" ON public.events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Anyone can view community events" ON public.community_events
    FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage community events" ON public.community_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Users can view their own signups
CREATE POLICY "Users can view own signups" ON public.community_event_signups
    FOR SELECT USING (
        user_id = public.get_my_profile_id()
        OR public.email_matches_if_linked(user_email)
    );

-- Authenticated users can create signups
CREATE POLICY "Authenticated users can create signups" ON public.community_event_signups
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- Admins can manage all signups
CREATE POLICY "Admins can manage signups" ON public.community_event_signups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================================================
-- JOBS
-- ============================================================================

CREATE POLICY "Anyone can view active jobs" ON public.jobs
    FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage jobs" ON public.jobs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Anyone can view job metrics" ON public.job_metrics
    FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage job metrics" ON public.job_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================================================
-- FORUM
-- ============================================================================

CREATE POLICY "Anyone can view forum posts" ON public.forum_posts
    FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can create posts" ON public.forum_posts
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Authors can update own posts" ON public.forum_posts
    FOR UPDATE USING (
        author_id = public.get_my_profile_id()
    );

CREATE POLICY "Admins can manage forum posts" ON public.forum_posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Anyone can view forum replies" ON public.forum_replies
    FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can create replies" ON public.forum_replies
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Authors can update own replies" ON public.forum_replies
    FOR UPDATE USING (
        author_id = public.get_my_profile_id()
    );

CREATE POLICY "Admins can manage forum replies" ON public.forum_replies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Users can manage own votes" ON public.forum_votes
    FOR ALL USING (
        user_id = public.get_my_profile_id()
    );

-- ============================================================================
-- DIGITAL CREDENTIALS
-- ============================================================================

-- Users can view their own credentials (by user_id match since no email in CSV)
CREATE POLICY "Users can view own credentials" ON public.digital_credentials
    FOR SELECT USING (
        user_id = public.get_my_profile_id()
    );

-- Admins can manage all credentials
CREATE POLICY "Admins can manage credentials" ON public.digital_credentials
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================================================
-- CREDIT TRANSACTIONS
-- ============================================================================

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON public.credit_transactions
    FOR SELECT USING (
        user_id = public.get_my_profile_id()
        OR public.email_matches_if_linked(user_email)
    );

-- Admins can manage all transactions
CREATE POLICY "Admins can manage transactions" ON public.credit_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================================================
-- SURVEYS
-- ============================================================================

CREATE POLICY "Anyone can view active surveys" ON public.surveys
    FOR SELECT USING (status = 'published' OR status = 'active');

CREATE POLICY "Admins can manage surveys" ON public.surveys
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Authenticated users can create demographics" ON public.survey_demographics
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Admins can view demographics" ON public.survey_demographics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Authenticated users can create responses" ON public.survey_responses
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Admins can view responses" ON public.survey_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================================================
-- SUPPORT TICKETS
-- ============================================================================

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON public.support_tickets
    FOR SELECT USING (
        user_id = public.get_my_profile_id()
        OR public.email_matches_if_linked(user_email)
    );

-- Users can create tickets
CREATE POLICY "Authenticated users can create tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- Users can update their own tickets (add messages)
CREATE POLICY "Users can update own tickets" ON public.support_tickets
    FOR UPDATE USING (
        user_id = public.get_my_profile_id()
        OR public.email_matches_if_linked(user_email)
    );

-- Admins can manage all tickets
CREATE POLICY "Admins can manage tickets" ON public.support_tickets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================================================
-- NOTIFICATION PREFERENCES
-- ============================================================================

-- Users can manage their own preferences
CREATE POLICY "Users can manage own preferences" ON public.notification_preferences
    FOR ALL USING (
        user_id = public.get_my_profile_id()
        OR public.email_matches_if_linked(email)
    );

-- Admins can view all preferences
CREATE POLICY "Admins can manage preferences" ON public.notification_preferences
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================================================
-- FELLOWSHIP APPLICATIONS
-- ============================================================================

-- Users can view their own applications
CREATE POLICY "Users can view own applications" ON public.fellowship_applications
    FOR SELECT USING (
        user_id = public.get_my_profile_id()
        OR public.email_matches_if_linked(user_email)
    );

-- Authenticated users can create applications
CREATE POLICY "Authenticated users can create applications" ON public.fellowship_applications
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- Admins can manage all applications
CREATE POLICY "Admins can manage applications" ON public.fellowship_applications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================================================
-- FUNDING REQUESTS
-- ============================================================================

-- Users can view their own requests
CREATE POLICY "Users can view own funding requests" ON public.funding_requests
    FOR SELECT USING (
        requester_id = public.get_my_profile_id()
        OR public.email_matches_if_linked(requester_email)
    );

-- Authenticated users can create requests
CREATE POLICY "Authenticated users can create funding requests" ON public.funding_requests
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- Admins can manage all requests
CREATE POLICY "Admins can manage funding requests" ON public.funding_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================================================
-- APPLICANT TRACKING
-- ============================================================================

-- Users can view their own tracking
CREATE POLICY "Users can view own tracking" ON public.applicant_tracking
    FOR SELECT USING (
        user_id = public.get_my_profile_id()
        OR public.email_matches_if_linked(email)
    );

-- Admins can manage all tracking
CREATE POLICY "Admins can manage tracking" ON public.applicant_tracking
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================================================
-- NEWS & CONTENT (Public read, admin write)
-- ============================================================================

CREATE POLICY "Anyone can view news sources" ON public.news_sources
    FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage news sources" ON public.news_sources
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Anyone can view news categories" ON public.news_categories
    FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage news categories" ON public.news_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Anyone can view published news" ON public.news_items
    FOR SELECT USING (status = 'published' OR status = 'active');

CREATE POLICY "Admins can manage news items" ON public.news_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================================================
-- MARKETING & TEAM (Public read, admin write)
-- ============================================================================

CREATE POLICY "Anyone can view marketing content" ON public.marketing_content
    FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage marketing content" ON public.marketing_content
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Anyone can view team members" ON public.team_members
    FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage team members" ON public.team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage email templates" ON public.email_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================================================
-- TRAINING ENQUIRIES
-- ============================================================================

CREATE POLICY "Users can view own enquiries" ON public.training_enquiries
    FOR SELECT USING (
        public.email_matches_if_linked(email)
    );

CREATE POLICY "Anyone can create enquiries" ON public.training_enquiries
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can manage enquiries" ON public.training_enquiries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================================================
-- ORG INVITES & SEATS
-- ============================================================================

CREATE POLICY "Users can view invites to their email" ON public.org_invites
    FOR SELECT USING (
        public.email_matches_if_linked(email)
    );

CREATE POLICY "Admins can manage org invites" ON public.org_invites
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Users can view their own seats" ON public.organisation_seats
    FOR SELECT USING (
        user_id = public.get_my_profile_id()
        OR public.email_matches_if_linked(user_email)
    );

CREATE POLICY "Admins can manage org seats" ON public.organisation_seats
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );
