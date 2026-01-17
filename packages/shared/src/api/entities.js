import createSupabaseEntity from './supabaseEntities.js';
import { auth } from './supabaseAuth.js';

// Table names mapped to snake_case for Supabase/Postgres conventions
export const Event = createSupabaseEntity('events');

export const EventSignup = createSupabaseEntity('community_event_signups');

export const Job = createSupabaseEntity('jobs');

export const Course = createSupabaseEntity('courses');

export const TrainingEnquiry = createSupabaseEntity('training_enquiries');

export const FundingRequest = createSupabaseEntity('funding_requests');

export const CourseVariant = createSupabaseEntity('course_variants');

export const MarketingContent = createSupabaseEntity('marketing_content');

export const TeamMember = createSupabaseEntity('team_members');

export const Organisation = createSupabaseEntity('organisations');

export const CourseDate = createSupabaseEntity('course_dates');

export const OrgInvite = createSupabaseEntity('org_invites');

export const DigitalCredential = createSupabaseEntity('digital_credentials');

export const CreditTransaction = createSupabaseEntity('credit_transactions');

export const CourseBooking = createSupabaseEntity('course_bookings');

export const Survey = createSupabaseEntity('surveys');

export const SurveyResponse = createSupabaseEntity('survey_responses');

export const SurveyDemographic = createSupabaseEntity('survey_demographics');

export const CommunityEvent = createSupabaseEntity('community_events');

export const CommunityEventSignup = createSupabaseEntity('community_event_signups');

export const OrganisationSeat = createSupabaseEntity('organisation_seats');

export const EmailTemplate = createSupabaseEntity('email_templates');

export const SupportTicket = createSupabaseEntity('support_tickets');

export const ForumPost = createSupabaseEntity('forum_posts');

export const ForumReply = createSupabaseEntity('forum_replies');

export const ForumVote = createSupabaseEntity('forum_votes');

export const JobMetric = createSupabaseEntity('job_metrics');

export const NotificationPreference = createSupabaseEntity('notification_preferences');

export const ApplicantTracking = createSupabaseEntity('applicant_tracking');

export const NewsSource = createSupabaseEntity('news_sources');

export const NewsItem = createSupabaseEntity('news_items');

export const NewsCategory = createSupabaseEntity('news_categories');


export const FellowshipApplication = createSupabaseEntity('fellowship_applications');
export const UserProfile = createSupabaseEntity('user_profiles');
export const CourseCategory = createSupabaseEntity('course_categories');

// auth sdk compatibility
export const User = auth;
