-- ============================================================================
-- IFS APP SEED DATA
-- ============================================================================
--
-- This file is executed by `supabase db seed` command
-- It provides an alternative to the large 002_import_data.sql migration
--
-- For local development with Supabase CLI:
--   1. Ensure CSV files are in ./migration_source/
--   2. Run: supabase db seed
--
-- For direct psql execution:
--   psql -h localhost -p 54322 -U postgres -d postgres -f supabase/seed.sql
--
-- ============================================================================

-- NOTE: Supabase seed.sql doesn't support \COPY directly from the CLI
-- This file demonstrates the structure. For actual CSV imports, use either:
-- 1. The Node.js script: node scripts/seed-database.js
-- 2. Direct psql with the 002_import_data_from_csv.sql file
-- 3. The Supabase Dashboard's CSV import feature

-- Example of how to insert sample/minimal data for development:

BEGIN;

-- ============================================================================
-- SAMPLE DATA FOR LOCAL DEVELOPMENT
-- ============================================================================

-- Sample admin user profile (create the auth user separately via Supabase Auth)
-- INSERT INTO public.profiles (id, email, role, full_name, membership_type, membership_status, status)
-- VALUES ('00000000-0000-0000-0000-000000000001', 'admin@example.com', 'admin', 'Admin User', 'Full', 'active', 'NEW')
-- ON CONFLICT (id) DO NOTHING;

-- Sample organisation
INSERT INTO public.organisations (name, type, tier, sector, id, created_at)
VALUES ('Sample Organisation', 'Corporate', 'Standard', 'Education', 'sample-org-001', NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample course
INSERT INTO public.courses (title, level, description, price, cpd_hours, format, id, created_at)
VALUES (
  'Introduction to Safeguarding',
  'Foundation',
  'A comprehensive introduction to safeguarding principles and practices.',
  99.00,
  3.0,
  'online',
  'sample-course-001',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Sample event
INSERT INTO public.events (title, description, date, start_time, end_time, type, id, created_at)
VALUES (
  'Safeguarding Best Practices Webinar',
  'Join us for an informative session on safeguarding best practices.',
  CURRENT_DATE + INTERVAL '30 days',
  '10:00',
  '11:30',
  'webinar',
  'sample-event-001',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Sample news category
INSERT INTO public.news_categories (name, description, display_order, id, created_at)
VALUES ('General', 'General safeguarding news and updates', 1, 'news-cat-001', NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample team member
INSERT INTO public.team_members (name, title, category, display_order, id, created_at)
VALUES ('Jane Smith', 'CEO', 'Leadership', 1, 'team-001', NOW())
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- ============================================================================
-- INSTRUCTIONS FOR FULL DATA IMPORT
-- ============================================================================
--
-- To import the full dataset from CSV files, use one of these methods:
--
-- METHOD 1: Node.js Script (Recommended)
--   npm install pg csv-parse dotenv
--   node scripts/seed-database.js
--
-- METHOD 2: psql with COPY
--   cd "c:\IFS App"
--   psql -h localhost -p 54322 -U postgres -d postgres -f supabase/migrations/002_import_data_from_csv.sql
--
-- METHOD 3: Supabase Dashboard
--   1. Go to Table Editor in Supabase Dashboard
--   2. Select a table
--   3. Use "Import from CSV" feature
--   4. Repeat for each table
--
-- ============================================================================
