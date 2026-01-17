-- ============================================================================
-- IFS APP DATABASE SCHEMA
-- ============================================================================
-- This migration creates all tables with proper structure for:
-- 1. Legacy data import from CSV files (preserving all holder/reference fields)
-- 2. Future auth linking via email matching
-- ============================================================================

-- Enable UUID + CITEXT extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ============================================================================
-- PROFILES TABLE (Core User Table)
-- ============================================================================
-- Legacy users are imported with status = 'LEGACY'
-- When they sign up via Supabase Auth, status changes to 'CLAIMED'
-- New users who sign up directly get status = 'NEW'
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  -- Primary identifiers
  id TEXT PRIMARY KEY,                    -- Legacy ID from old system or auth UUID (stored as text)
  auth_id UUID UNIQUE,                    -- Supabase auth.users.id (NULL for legacy users until they sign up)
  associate_id TEXT,                      -- Associate ID from old system

  -- Migration tracking
  status TEXT NOT NULL DEFAULT 'LEGACY'
    CHECK (status IN ('LEGACY', 'CLAIMED', 'NEW')),

  -- Core Identity
  email CITEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  full_name TEXT,
  display_name TEXT,
  first_name TEXT,
  last_name TEXT,

  -- Contact Information
  phone_number TEXT,
  city TEXT,
  country TEXT,

  -- Professional Information
  job_role TEXT,
  organisation TEXT,
  organisation_id TEXT,                   -- Reference to organisations table
  organisation_role TEXT,
  sector TEXT,
  other_sector TEXT,
  subsector TEXT,
  other_subsector TEXT,
  safeguarding_role TEXT,

  -- Training & Development
  had_induction BOOLEAN DEFAULT FALSE,
  completed_training TEXT,
  training_refresh_frequency TEXT,
  attended_training_topics TEXT,
  other_training_details TEXT,
  receives_supervision BOOLEAN DEFAULT FALSE,

  -- Membership
  membership_type TEXT,
  membership_status TEXT,
  join_date TIMESTAMPTZ,
  onboarding_completed BOOLEAN DEFAULT FALSE,

  -- Stripe & Subscription
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_subscription_status TEXT,
  subscription_status TEXT,
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  subscription_current_period_end TIMESTAMPTZ,
  subscription_trial_end TIMESTAMPTZ,

  -- CPD (Continuous Professional Development)
  cpd_hours DECIMAL(10,2) DEFAULT 0,
  total_cpd_earned DECIMAL(10,2) DEFAULT 0,
  total_cpd_spent DECIMAL(10,2) DEFAULT 0,
  monthly_cpd_hours DECIMAL(10,2) DEFAULT 0,
  last_cpd_allocation_date TIMESTAMPTZ,

  -- UI/UX Preferences
  onboarding_checklist_dismissed BOOLEAN DEFAULT FALSE,
  has_seen_portal_tour BOOLEAN DEFAULT FALSE,
  needs_application_processing BOOLEAN DEFAULT FALSE,
  profile_image_url TEXT,

  -- Account State
  is_unclaimed BOOLEAN NOT NULL DEFAULT TRUE,
  welcome_email_sent_at TIMESTAMPTZ,
  has_posted_intro BOOLEAN DEFAULT FALSE,
  cpd_charter_agreed BOOLEAN DEFAULT FALSE,
  dismissed_org_welcome_ids TEXT,

  -- Metadata
  certificates_count INTEGER DEFAULT 0,
  job_view_date TIMESTAMPTZ,
  notes TEXT,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

CREATE UNIQUE INDEX idx_profiles_email_unique ON public.profiles(email);
CREATE INDEX idx_profiles_auth_id ON public.profiles(auth_id);
CREATE INDEX idx_profiles_status ON public.profiles(status);

-- ============================================================================
-- ORGANISATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.organisations (
  id TEXT PRIMARY KEY,

  -- Basic Information
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  sector TEXT,

  -- Address
  address TEXT,
  city TEXT,
  postcode TEXT,
  country TEXT,
  phone_number TEXT,

  -- Primary Contact (holder fields from CSV)
  primary_contact_id TEXT,               -- Legacy user ID
  primary_contact_name TEXT,             -- Denormalized name
  primary_contact_email TEXT,            -- Denormalized email for linking

  -- Status & Settings
  status TEXT DEFAULT 'active',
  organisation_type TEXT,
  registration_date TIMESTAMPTZ,
  is_publicly_visible BOOLEAN DEFAULT TRUE,
  badge_url TEXT,

  -- Seat Management
  total_seats INTEGER DEFAULT 0,
  used_seats INTEGER DEFAULT 0,
  available_seats INTEGER DEFAULT 0,

  -- Stripe & Billing
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'none',
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  monthly_price DECIMAL(10,2),

  -- Metadata
  team_member_count INTEGER DEFAULT 0,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_organisations_primary_contact_email ON public.organisations(LOWER(primary_contact_email));

-- ============================================================================
-- COURSES & TRAINING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,

  level TEXT,
  title TEXT NOT NULL,
  stripe_product_id TEXT,
  description TEXT,
  overview TEXT,
  objectives TEXT,
  benefits TEXT,
  faq TEXT,
  tags TEXT,
  image_url TEXT,
  prospectus_url TEXT,
  certification TEXT,
  default_variant_id TEXT,

  -- Pricing & Details
  price TEXT,
  cpd_hours TEXT,
  stripe_price_id TEXT,
  geography TEXT,
  duration TEXT,
  format TEXT,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.course_variants (
  id TEXT PRIMARY KEY,

  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  objectives TEXT,
  benefits TEXT,
  supported_geographies TEXT,

  price DECIMAL(10,2),
  credit_cost INTEGER,
  stripe_price_id TEXT,
  duration TEXT,
  format TEXT,
  status TEXT DEFAULT 'active',

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.course_dates (
  id TEXT PRIMARY KEY,

  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  variant_id TEXT,

  date TEXT,
  end_date TEXT,
  start_time TEXT,
  end_time TEXT,
  location TEXT,
  status TEXT DEFAULT 'active',
  date_pattern_description TEXT,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.course_bookings (
  id TEXT PRIMARY KEY,

  -- User Reference (CRITICAL: holder fields from CSV)
  user_id TEXT,                          -- Legacy user ID
  user_email TEXT,                       -- Denormalized email for linking
  user_name TEXT,                        -- Denormalized name for display

  -- Course Reference
  course_id TEXT,
  course_title TEXT,
  variant_id TEXT,
  variant_name TEXT,
  course_date_id TEXT,

  -- Selected Details
  selected_date TEXT,
  selected_time TEXT,
  selected_location TEXT,

  -- Payment
  payment_method TEXT,
  credits_used DECIMAL(10,2) DEFAULT 0,
  gbp_amount DECIMAL(10,2),
  total_cost DECIMAL(10,2),

  -- Organisation & Status
  organisation_name TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,

  -- Stripe
  stripe_invoice_id TEXT,
  stripe_invoice_url TEXT,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_course_bookings_user_email ON public.course_bookings(LOWER(user_email));
CREATE INDEX idx_course_bookings_user_id ON public.course_bookings(user_id);

CREATE TABLE IF NOT EXISTS public.training_enquiries (
  id TEXT PRIMARY KEY,

  course_title TEXT,
  course_id TEXT,

  -- Enquirer Details (holder fields)
  name TEXT,
  email TEXT,
  phone_number TEXT,
  organisation TEXT,
  message TEXT,

  -- Status & Details
  status TEXT DEFAULT 'pending',
  selected_date TEXT,
  selected_time TEXT,
  selected_location TEXT,
  number_of_participants INTEGER,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- EVENTS & COMMUNITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,

  title TEXT NOT NULL,
  description TEXT,
  who_is_this_for TEXT,
  what_to_expected TEXT,
  what_you_will_learn TEXT,
  session_objectives TEXT,
  facilitator_bio TEXT,

  -- Timing
  date TEXT,
  start_time TEXT,
  end_time TEXT,
  time TEXT,
  duration TEXT,

  -- Location
  location TEXT,
  latitude TEXT,
  longitude TEXT,

  -- Media & Details
  image_url TEXT,
  type TEXT,
  facilitator TEXT,
  tags TEXT,

  -- Pricing
  price_standard DECIMAL(10,2),
  price_associate DECIMAL(10,2),
  price_full_member DECIMAL(10,2),
  credit_cost TEXT,

  -- Meeting Details
  meeting_url TEXT,
  meeting_password TEXT,
  meeting_id TEXT,
  recording_url TEXT,
  resources_url TEXT,
  resources TEXT,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.community_events (
  id TEXT PRIMARY KEY,

  title TEXT NOT NULL,
  description TEXT,
  type TEXT,

  -- Timing
  date TEXT,
  start_time TEXT,
  end_time TEXT,

  -- Location
  location TEXT,
  latitude TEXT,
  longitude TEXT,

  -- Details
  image_url TEXT,
  max_participants TEXT,
  current_participants TEXT,
  status TEXT DEFAULT 'active',
  facilitator TEXT,
  target_audience TEXT,

  -- Meeting Details
  meeting_url TEXT,
  meeting_password TEXT,
  meeting_id TEXT,
  tags TEXT,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.community_event_signups (
  id TEXT PRIMARY KEY,

  -- User Reference (CRITICAL: holder fields from CSV)
  user_id TEXT,                          -- Legacy user ID
  user_email TEXT,                       -- Denormalized email for linking
  user_name TEXT,                        -- Denormalized name for display

  event_id TEXT,

  -- Event Details (denormalized from CSV)
  event_title TEXT,
  event_date TEXT,
  event_type TEXT,

  notes TEXT,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_community_event_signups_user_email ON public.community_event_signups(LOWER(user_email));
CREATE INDEX idx_community_event_signups_user_id ON public.community_event_signups(user_id);

-- ============================================================================
-- JOBS & CAREERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.jobs (
  id TEXT PRIMARY KEY,

  title TEXT NOT NULL,
  company_name TEXT,
  department TEXT,

  -- Location
  location TEXT,
  latitude TEXT,
  longitude DECIMAL(11,8),
  address_locality TEXT,
  street_address TEXT,
  postal_code TEXT,
  address_region TEXT,
  address_country TEXT,
  working_arrangement TEXT,

  -- Job Details
  description TEXT,
  key_responsibilities TEXT,
  requirements TEXT,
  desirable_skills TEXT,

  -- Compensation
  salary DECIMAL(10,2),
  salary_unit TEXT,
  salary_currency TEXT DEFAULT 'GBP',
  salary_display_text TEXT,
  incentive_compensation TEXT,
  benefits TEXT,

  -- Job Type
  contract_type TEXT,
  working_hours TEXT,
  hours_per_week DECIMAL(5,2),
  experience_level TEXT,
  experience_requirements TEXT,
  education_requirements TEXT,
  occupational_category TEXT,
  sector TEXT,
  safeguarding_focus TEXT,

  -- Dates
  application_deadline TEXT,
  start_date TEXT,

  -- Contact & Application
  contact_email TEXT,
  application_method TEXT,
  application_url TEXT,

  -- Company Details
  company_logo_url TEXT,
  company_description TEXT,

  -- Status & Metadata
  is_featured BOOLEAN DEFAULT FALSE,
  special_commitments TEXT,
  status TEXT DEFAULT 'active',
  views DECIMAL(10,0) DEFAULT 0,
  application_clicks DECIMAL(10,0) DEFAULT 0,
  public_job_url TEXT,

  -- Submission Details (holder fields from CSV)
  submitted_by_organisation_id TEXT,
  submitted_by_organisation_name TEXT,
  submitted_by_user_id TEXT,
  submitted_by_user_email TEXT,

  review_notes TEXT,
  attachments TEXT,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_jobs_submitted_by_user_email ON public.jobs(LOWER(submitted_by_user_email));

CREATE TABLE IF NOT EXISTS public.job_metrics (
  id TEXT PRIMARY KEY,

  job_id TEXT,
  job_title TEXT,
  date TEXT,
  views DECIMAL(10,0) DEFAULT 0,
  clicks DECIMAL(10,0) DEFAULT 0,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- FORUM & DISCUSSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.forum_posts (
  id TEXT PRIMARY KEY,

  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  is_anonymous TEXT,

  -- Author (holder fields from CSV)
  author_id TEXT,
  author_name TEXT,
  author_role TEXT,

  -- Engagement
  reply_count TEXT,
  upvotes TEXT,
  downvotes TEXT,
  score TEXT,
  last_activity_at TEXT,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.forum_replies (
  id TEXT PRIMARY KEY,

  post_id TEXT,
  parent_reply_id TEXT,

  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,

  -- Author (holder fields from CSV)
  author_id TEXT,
  author_name TEXT,
  author_role TEXT,

  -- Engagement
  upvotes DECIMAL(10,0) DEFAULT 0,
  downvotes DECIMAL(10,0) DEFAULT 0,
  score DECIMAL(10,0) DEFAULT 0,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.forum_votes (
  id TEXT PRIMARY KEY,

  post_id TEXT,
  reply_id TEXT,
  user_id TEXT,
  vote_type TEXT,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- CREDENTIALS & TRANSACTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.digital_credentials (
  id TEXT PRIMARY KEY,

  -- User Reference (holder fields from CSV)
  user_id TEXT,                          -- Legacy user ID
  user_name TEXT,                        -- Denormalized name (CSV has this but NOT email)

  -- Credential Details
  credential_type TEXT,
  title TEXT NOT NULL,
  description TEXT,
  issued_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  verification_code TEXT,
  metadata TEXT,
  badge_image_url TEXT,
  skills TEXT,
  status TEXT DEFAULT 'active',

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_digital_credentials_user_id ON public.digital_credentials(user_id);

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id TEXT PRIMARY KEY,

  -- User Reference (holder fields from CSV)
  user_id TEXT,                          -- Legacy user ID
  user_email TEXT,                       -- Denormalized email for linking

  transaction_type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2),
  description TEXT,

  -- Related Entity (Polymorphic)
  related_entity_type TEXT,
  related_entity_id TEXT,
  related_entity_name TEXT,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_credit_transactions_user_email ON public.credit_transactions(LOWER(user_email));
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);

-- ============================================================================
-- SURVEYS & FEEDBACK
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.surveys (
  id TEXT PRIMARY KEY,

  title TEXT NOT NULL,
  description TEXT,
  sections TEXT,
  questions TEXT,
  status TEXT DEFAULT 'draft',

  start_date TEXT,
  end_date TEXT,
  is_always_available TEXT,
  target_audience TEXT,
  response_count TEXT,
  allow_multiple_responses TEXT,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.survey_demographics (
  id TEXT PRIMARY KEY,

  membership_type TEXT,
  sector TEXT,
  subsector TEXT,
  safeguarding_role TEXT,
  job_role TEXT,
  city TEXT,
  country TEXT,
  years_in_role TEXT,
  training_refresh_frequency TEXT,
  receives_supervision BOOLEAN,
  has_organisational_membership BOOLEAN,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.survey_responses (
  id TEXT PRIMARY KEY,

  survey_id TEXT,
  survey_title TEXT,
  demographic_id TEXT,

  responses TEXT,
  completed BOOLEAN DEFAULT FALSE,
  submitted_date TIMESTAMPTZ,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- SUPPORT & NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id TEXT PRIMARY KEY,

  -- User Reference (holder fields from CSV)
  user_id TEXT,                          -- Legacy user ID
  user_email TEXT,                       -- Denormalized email for linking
  user_name TEXT,                        -- Denormalized name for display

  subject TEXT NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'normal',
  messages TEXT,
  last_message_at TIMESTAMPTZ,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_support_tickets_user_email ON public.support_tickets(LOWER(user_email));
CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id TEXT PRIMARY KEY,

  -- User Reference (holder fields from CSV)
  user_id TEXT,                          -- Legacy user ID
  email TEXT,                            -- Denormalized email for linking

  weekly_job_alerts BOOLEAN DEFAULT TRUE,
  news_updates BOOLEAN DEFAULT TRUE,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_notification_preferences_email ON public.notification_preferences(LOWER(email));
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- ============================================================================
-- APPLICATIONS & REQUESTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.fellowship_applications (
  id TEXT PRIMARY KEY,

  -- User Reference (holder fields from CSV)
  user_id TEXT,                          -- Legacy user ID
  user_email TEXT,                       -- Denormalized email for linking
  user_name TEXT,                        -- Denormalized name for display

  route TEXT,
  years_in_role TEXT,
  applicant_current_role TEXT,
  organisation TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  is_member_in_good_standing TEXT,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_fellowship_applications_user_email ON public.fellowship_applications(LOWER(user_email));

CREATE TABLE IF NOT EXISTS public.funding_requests (
  id TEXT PRIMARY KEY,

  -- Requester (holder fields from CSV)
  requester_id TEXT,                     -- Legacy user ID
  requester_name TEXT,                   -- Denormalized name
  requester_email TEXT,                  -- Denormalized email for linking

  -- Manager (holder fields from CSV)
  manager_name TEXT,
  manager_email TEXT,

  personal_message TEXT,
  status TEXT DEFAULT 'pending',
  token TEXT,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_funding_requests_requester_email ON public.funding_requests(LOWER(requester_email));

CREATE TABLE IF NOT EXISTS public.applicant_tracking (
  id TEXT PRIMARY KEY,

  -- User Reference (holder fields from CSV)
  user_id TEXT,                          -- Legacy user ID
  email TEXT,                            -- Denormalized email for linking

  stage TEXT,
  notes TEXT,
  last_status_change TIMESTAMPTZ,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_applicant_tracking_email ON public.applicant_tracking(LOWER(email));

-- ============================================================================
-- NEWS & CONTENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.news_sources (
  id TEXT PRIMARY KEY,

  name TEXT NOT NULL,
  type TEXT,
  url TEXT,
  api_key_secret_name TEXT,
  parser_config TEXT,
  last_fetched_at TIMESTAMPTZ,
  fetch_interval_minutes DECIMAL(10,0),
  status TEXT DEFAULT 'active',
  error_message TEXT,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.news_categories (
  id TEXT PRIMARY KEY,

  name TEXT NOT NULL,
  description TEXT,
  display_order DECIMAL(10,0),
  subcategories TEXT,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.news_items (
  id TEXT PRIMARY KEY,

  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  source_name TEXT,
  source_url TEXT,
  image_url TEXT,
  published_date TIMESTAMPTZ,
  display_order DECIMAL(10,0),
  status TEXT DEFAULT 'draft',
  category TEXT,
  subcategory TEXT,
  tags TEXT,
  is_featured BOOLEAN DEFAULT FALSE,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- MARKETING & TEAM
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.marketing_content (
  id TEXT PRIMARY KEY,

  identifier TEXT,
  page TEXT,
  title TEXT,
  description TEXT,
  image_url TEXT,
  link_to TEXT,
  link_text TEXT,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id TEXT PRIMARY KEY,

  name TEXT NOT NULL,
  title TEXT,
  category TEXT,
  image TEXT,
  bio TEXT,
  display_order DECIMAL(10,0),
  linkedin_url TEXT,
  email TEXT,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.email_templates (
  id TEXT PRIMARY KEY,

  name TEXT NOT NULL,
  subject TEXT,
  message TEXT,
  sender TEXT,
  template_type TEXT,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- ORGANISATION INVITES & SEATS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.org_invites (
  id TEXT PRIMARY KEY,

  organisation_id TEXT,
  email TEXT,
  role TEXT,
  status TEXT DEFAULT 'pending',
  token TEXT,
  expires_at TIMESTAMPTZ,

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.organisation_seats (
  id TEXT PRIMARY KEY,

  organisation_id TEXT,
  user_id TEXT,
  user_email TEXT,
  user_name TEXT,
  role TEXT,
  status TEXT DEFAULT 'active',

  -- Timestamps & Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id TEXT,
  created_by_email TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_event_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_demographics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fellowship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicant_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organisation_seats ENABLE ROW LEVEL SECURITY;
