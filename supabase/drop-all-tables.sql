-- DROP ALL TABLES IN PUBLIC SCHEMA
-- WARNING: THIS WILL DELETE ALL DATA PERMANENTLY
-- Run this in Supabase SQL Editor

-- Drop all tables in cascade mode to remove dependencies
DROP TABLE IF EXISTS public.applicant_tracking CASCADE;
DROP TABLE IF EXISTS public.community_event_signups CASCADE;
DROP TABLE IF EXISTS public.community_event_signup CASCADE;
DROP TABLE IF EXISTS public.community_events CASCADE;
DROP TABLE IF EXISTS public.community_event CASCADE;
DROP TABLE IF EXISTS public.course_bookings CASCADE;
DROP TABLE IF EXISTS public.course_booking CASCADE;
DROP TABLE IF EXISTS public.course_dates CASCADE;
DROP TABLE IF EXISTS public.course_date CASCADE;
DROP TABLE IF EXISTS public.course_variants CASCADE;
DROP TABLE IF EXISTS public.course_variant CASCADE;
DROP TABLE IF EXISTS public.course_categories CASCADE;
DROP TABLE IF EXISTS public.course_category CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.course CASCADE;
DROP TABLE IF EXISTS public.credit_transactions CASCADE;
DROP TABLE IF EXISTS public.credit_transaction CASCADE;
DROP TABLE IF EXISTS public.digital_credentials CASCADE;
DROP TABLE IF EXISTS public.digital_credential CASCADE;
DROP TABLE IF EXISTS public.email_templates CASCADE;
DROP TABLE IF EXISTS public.email_template CASCADE;
DROP TABLE IF EXISTS public.event_signups CASCADE;
DROP TABLE IF EXISTS public.event_signup CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.event CASCADE;
DROP TABLE IF EXISTS public.fellowship_applications CASCADE;
DROP TABLE IF EXISTS public.fellowship_application CASCADE;
DROP TABLE IF EXISTS public.forum_posts CASCADE;
DROP TABLE IF EXISTS public.forum_post CASCADE;
DROP TABLE IF EXISTS public.forum_replies CASCADE;
DROP TABLE IF EXISTS public.forum_reply CASCADE;
DROP TABLE IF EXISTS public.forum_votes CASCADE;
DROP TABLE IF EXISTS public.forum_vote CASCADE;
DROP TABLE IF EXISTS public.funding_requests CASCADE;
DROP TABLE IF EXISTS public.funding_request CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.job CASCADE;
DROP TABLE IF EXISTS public.job_metrics CASCADE;
DROP TABLE IF EXISTS public.job_metric CASCADE;
DROP TABLE IF EXISTS public.marketing_content CASCADE;
DROP TABLE IF EXISTS public.news_categories CASCADE;
DROP TABLE IF EXISTS public.news_category CASCADE;
DROP TABLE IF EXISTS public.news_items CASCADE;
DROP TABLE IF EXISTS public.news_item CASCADE;
DROP TABLE IF EXISTS public.news_sources CASCADE;
DROP TABLE IF EXISTS public.news_source CASCADE;
DROP TABLE IF EXISTS public.notification_preferences CASCADE;
DROP TABLE IF EXISTS public.notification_preference CASCADE;
DROP TABLE IF EXISTS public.organisations CASCADE;
DROP TABLE IF EXISTS public.organisation CASCADE;
DROP TABLE IF EXISTS public.organisation_seats CASCADE;
DROP TABLE IF EXISTS public.organisation_seat CASCADE;
DROP TABLE IF EXISTS public.org_invites CASCADE;
DROP TABLE IF EXISTS public.org_invite CASCADE;
DROP TABLE IF EXISTS public.support_tickets CASCADE;
DROP TABLE IF EXISTS public.support_ticket CASCADE;
DROP TABLE IF EXISTS public.survey_demographics CASCADE;
DROP TABLE IF EXISTS public.survey_demographic CASCADE;
DROP TABLE IF EXISTS public.survey_responses CASCADE;
DROP TABLE IF EXISTS public.survey_response CASCADE;
DROP TABLE IF EXISTS public.surveys CASCADE;
DROP TABLE IF EXISTS public.survey CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.team_member CASCADE;
DROP TABLE IF EXISTS public.training_enquiries CASCADE;
DROP TABLE IF EXISTS public.training_enquiry CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
DROP FUNCTION IF EXISTS public.handle_auth_user_insert() CASCADE;
DROP FUNCTION IF EXISTS public.handle_auth_user_confirmed() CASCADE;
DROP FUNCTION IF EXISTS public.link_or_create_profile(UUID, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.get_my_profile_id() CASCADE;
DROP FUNCTION IF EXISTS public.auth_email_matches(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.has_linked_profile() CASCADE;
DROP FUNCTION IF EXISTS public.email_matches_if_linked(TEXT) CASCADE;

-- Verify all tables are gone
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
