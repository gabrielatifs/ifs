#!/usr/bin/env node

/**
 * ============================================================================
 * LEGACY DATA CSV IMPORT SCRIPT
 * ============================================================================
 * Imports legacy CSV data into Supabase, handling:
 * - Removal of legacy ID columns
 * - Email-based user references for LEGACY users
 * - Proper foreign key relationships
 * ============================================================================
 *
 * USAGE:
 *   node scripts/import-legacy-data.js import
 *
 * ============================================================================
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
config({ path: path.join(__dirname, '..', '.env') });

// ============================================================================
// Configuration
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

// Debug: Check if we have service role key (contains 'service_role' in JWT payload)
try {
  const payload = JSON.parse(Buffer.from(SUPABASE_SERVICE_KEY.split('.')[1], 'base64').toString());
  console.log(`Using key with role: ${payload.role}`);
  if (payload.role !== 'service_role') {
    console.error('⚠️  WARNING: Not using service_role key! RLS will block inserts.');
  }
} catch (e) {
  console.log('Could not decode JWT to verify role');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-supabase-bypass-rls': 'true'
    }
  }
});

const MIGRATION_SOURCE_DIR = path.join(__dirname, '..', 'migration_source');
const BATCH_SIZE = 100; // Insert in batches to avoid overwhelming the database

// ============================================================================
// CSV to Table Mapping
// ============================================================================

const CSV_TABLE_MAPPING = {
  'profiles.csv': 'profiles',
  'Organisation_export.csv': 'organisations',
  'Course_export.csv': 'courses',
  'CourseVariant_export.csv': 'course_variants',
  'CourseDate_export.csv': 'course_dates',
  'CourseBooking_export.csv': 'course_bookings',
  'TrainingEnquiry_export.csv': 'training_enquiries',
  'Event_export.csv': 'events',
  'CommunityEvent_export.csv': 'community_events',
  'CommunityEventSignup_export.csv': 'community_event_signups',
  'Job_export (1).csv': 'jobs',
  'JobMetric_export.csv': 'job_metrics',
  'ForumPost_export.csv': 'forum_posts',
  'ForumReply_export.csv': 'forum_replies',
  'DigitalCredential_export.csv': 'digital_credentials',
  'CreditTransaction_export.csv': 'credit_transactions',
  'Survey_export.csv': 'surveys',
  'SurveyDemographic_export.csv': 'survey_demographics',
  'SurveyResponse_export.csv': 'survey_responses',
  'SupportTicket_export.csv': 'support_tickets',
  'NotificationPreference_export (1).csv': 'notification_preferences',
  'FellowshipApplication_export.csv': 'fellowship_applications',
  'FundingRequest_export.csv': 'funding_requests',
  'ApplicantTracking_export (1).csv': 'applicant_tracking',
  'NewsSource_export.csv': 'news_sources',
  'NewsCategory_export.csv': 'news_categories',
  'NewsItem_export.csv': 'news_items',
  'MarketingContent_export.csv': 'marketing_content',
  'TeamMember_export.csv': 'team_members',
  'EmailTemplate_export.csv': 'email_templates',
};

// Import order (respects foreign key dependencies)
const IMPORT_ORDER = [
  'profiles',
  'organisations',
  'courses',
  'course_variants',
  'course_dates',
  'course_bookings',
  'training_enquiries',
  'events',
  'community_events',
  'community_event_signups',
  'jobs',
  'job_metrics',
  'forum_posts',
  'forum_replies',
  'digital_credentials',
  'credit_transactions',
  'surveys',
  'survey_demographics',
  'survey_responses',
  'support_tickets',
  'notification_preferences',
  'fellowship_applications',
  'funding_requests',
  'applicant_tracking',
  'news_sources',
  'news_categories',
  'news_items',
  'marketing_content',
  'team_members',
  'email_templates',
];

// ============================================================================
// Column Mapping Functions
// ============================================================================

/**
 * Maps CSV column names to database column names (snake_case conversion)
 */
function toDatabaseColumnName(csvColumnName) {
  // Handle special cases - CSV column name -> DB column name
  const specialMappings = {
    // ID columns - both 'ID' (profiles CSV) and 'id' (other CSVs) map to 'id' primary key
    'ID': 'id',
    'id': 'id',
    'Associate ID': 'associate_id',
    'Email': 'email',
    'Role': 'role',
    'Full Name (Computed)': 'full_name',
    'Display Name': 'display_name',
    'First Name': 'first_name',
    'Last Name': 'last_name',
    'Phone Number': 'phone_number',
    'City': 'city',
    'Country': 'country',
    'Job Role': 'job_role',
    'Organisation': 'organisation',
    'Organisation ID': 'organisation_id',
    'Organisation Role': 'organisation_role',
    // Stripe & subscription
    'Stripe Customer ID': 'stripe_customer_id',
    'Stripe Subscription ID': 'stripe_subscription_id',
    'Stripe Subscription Status': 'stripe_subscription_status',
    'Subscription Status': 'subscription_status',
    'Subscription Start Date': 'subscription_start_date',
    'Subscription End Date': 'subscription_end_date',
    'Subscription Current Period End': 'subscription_current_period_end',
    'Subscription Trial End': 'subscription_trial_end',
    // CPD fields (acronym-safe)
    'CPD Hours': 'cpd_hours',
    'Total CPD Earned': 'total_cpd_earned',
    'Total CPD Spent': 'total_cpd_spent',
    'Monthly CPD Hours': 'monthly_cpd_hours',
    'Last CPD Allocation Date': 'last_cpd_allocation_date',
    'CPD Charter Agreed': 'cpd_charter_agreed',
    // URLs/IDs with acronyms
    'Profile Image URL': 'profile_image_url',
    'Dismissed Org Welcome IDs': 'dismissed_org_welcome_ids',
    // CSV audit columns -> DB audit columns
    'created_by': 'created_by_email',
    'created_date': 'created_at',
    'updated_date': 'updated_at',
    'sub_categories': 'subcategories',
    'sub_category': 'subcategory',
    // Fellowship applications
    'current_role': 'applicant_current_role',
    'currentRole': 'applicant_current_role',
  };

  if (csvColumnName in specialMappings) {
    return specialMappings[csvColumnName];
  }

  // Convert to snake_case
  const converted = csvColumnName
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
    .replace(/ /g, '_')
    .replace(/[()]/g, '')
    .replace(/__+/g, '_');

  if (converted === 'sub_categories') return 'subcategories';
  if (converted === 'sub_category') return 'subcategory';

  return converted;
}

/**
 * Transforms a CSV row into a database record
 */
function transformRow(row, tableName) {
  const transformed = {};

  for (const [csvColumn, value] of Object.entries(row)) {
    const dbColumn = toDatabaseColumnName(csvColumn);

    // Skip null mappings
    if (dbColumn === null) {
      continue;
    }

    // Handle empty values
    if (value === 'N/A' || value === '' || value === null || value === undefined) {
      transformed[dbColumn] = null;
      continue;
    }

    // Type conversions based on column patterns
    if (dbColumn.includes('_date') || dbColumn.includes('_at')) {
      // Parse dates
      transformed[dbColumn] = parseDate(value);
    } else if (
      dbColumn.includes('_id') &&
      dbColumn !== 'stripe_customer_id' &&
      dbColumn !== 'stripe_subscription_id' &&
      dbColumn !== 'stripe_product_id' &&
      dbColumn !== 'stripe_price_id' &&
      dbColumn !== 'stripe_invoice_id' &&
      dbColumn !== 'associate_id'
    ) {
      // Handle foreign key IDs - keep as text for now, will be resolved later
      transformed[dbColumn] = value;
    } else if (
      dbColumn.includes('price') ||
      dbColumn.includes('amount') ||
      dbColumn.includes('cost') ||
      dbColumn.includes('salary') ||
      dbColumn.includes('cpd_hours') ||
      dbColumn.includes('balance')
    ) {
      // Parse numbers
      transformed[dbColumn] = parseFloat(value) || null;
    } else if (
      dbColumn.includes('count') ||
      dbColumn.includes('seats') ||
      dbColumn.includes('participants') ||
      dbColumn.includes('views') ||
      dbColumn.includes('clicks') ||
      dbColumn.includes('upvotes') ||
      dbColumn.includes('downvotes') ||
      dbColumn.includes('score') ||
      dbColumn.includes('months')
    ) {
      // Parse integers
      transformed[dbColumn] = parseInt(value, 10) || 0;
    } else if (
      value === 'true' ||
      value === 'false' ||
      value === 'Yes' ||
      value === 'No'
    ) {
      // Parse booleans
      transformed[dbColumn] = value === 'true' || value === 'Yes';
    } else if (dbColumn === 'tags' || dbColumn.includes('_ids')) {
      // Parse arrays
      try {
        transformed[dbColumn] = JSON.parse(value);
      } catch {
        transformed[dbColumn] = value ? value.split(',').map(s => s.trim()) : [];
      }
    } else if (
      dbColumn.includes('metadata') ||
      dbColumn.includes('config') ||
      dbColumn.includes('sections') ||
      dbColumn.includes('questions') ||
      dbColumn.includes('responses') ||
      dbColumn.includes('messages') ||
      dbColumn.includes('resources') ||
      dbColumn.includes('attachments')
    ) {
      // Parse JSON
      try {
        transformed[dbColumn] = JSON.parse(value);
      } catch {
        transformed[dbColumn] = value;
      }
    } else {
      // Keep as string
      transformed[dbColumn] = value;
    }
  }

  // Special handling for profiles table
  if (tableName === 'profiles') {
    transformed.status = 'LEGACY';
    transformed.is_unclaimed = true;
  }

  if (tableName === 'fellowship_applications') {
    if (!transformed.applicant_current_role && transformed.current_role) {
      transformed.applicant_current_role = transformed.current_role;
      delete transformed.current_role;
    }
  }

  if (tableName === 'jobs') {
    if (!transformed.title || String(transformed.title).trim() === '') {
      transformed.title = 'Untitled job';
    }
  }

  return transformed;
}

/**
 * Parse date strings from various formats
 */
function parseDate(dateStr) {
  if (!dateStr || dateStr === 'N/A') return null;

  // Try parsing DD/MM/YYYY HH:MM format
  const ddmmyyyyMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})\s*(\d{2}):(\d{2})?/);
  if (ddmmyyyyMatch) {
    const [, day, month, year, hour, minute] = ddmmyyyyMatch;
    return new Date(`${year}-${month}-${day}T${hour}:${minute || '00'}:00Z`).toISOString();
  }

  // Try parsing ISO format
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch (e) {
    console.warn(`Could not parse date: ${dateStr}`);
  }

  return null;
}

// ============================================================================
// Import Functions
// ============================================================================

/**
 * Read and parse a CSV file
 */
function readCSV(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
}

/**
 * Import data from a single CSV file
 */
async function importTable(tableName) {
  // Find the CSV file for this table
  const csvFile = Object.entries(CSV_TABLE_MAPPING).find(
    ([, table]) => table === tableName
  )?.[0];

  if (!csvFile) {
    console.log(`⚠️  No CSV file found for table: ${tableName}`);
    return { success: true, count: 0 };
  }

  const csvPath = path.join(MIGRATION_SOURCE_DIR, csvFile);

  if (!fs.existsSync(csvPath)) {
    console.log(`⚠️  CSV file not found: ${csvFile}`);
    return { success: true, count: 0 };
  }

  console.log(`\n📂 Importing ${tableName} from ${csvFile}...`);

  try {
    const rows = readCSV(csvPath);

    if (rows.length === 0) {
      console.log(`   ✓ Empty file, skipping`);
      return { success: true, count: 0 };
    }

    // Transform rows
    const transformedRows = rows.map(row => transformRow(row, tableName));

    // Debug: show first transformed row's keys
    if (transformedRows.length > 0) {
      console.log(`   Columns being inserted: ${Object.keys(transformedRows[0]).join(', ')}`);
    }

    // Insert in batches
    let totalInserted = 0;
    for (let i = 0; i < transformedRows.length; i += BATCH_SIZE) {
      const batch = transformedRows.slice(i, i + BATCH_SIZE);

      const { data, error } = await supabase
        .from(tableName)
        .insert(batch)
        .select();

      if (error) {
        console.error(`   ❌ Error inserting batch ${i / BATCH_SIZE + 1}:`, error.message);
        console.error('   First row of failed batch:', JSON.stringify(batch[0], null, 2));
        throw error;
      }

      totalInserted += batch.length;
      process.stdout.write(`   Progress: ${totalInserted}/${transformedRows.length}\r`);
    }

    console.log(`\n   ✓ Imported ${totalInserted} records into ${tableName}`);
    return { success: true, count: totalInserted };

  } catch (error) {
    console.error(`   ❌ Failed to import ${tableName}:`, error.message);
    return { success: false, count: 0, error: error.message };
  }
}

/**
 * Run the full import process
 */
async function runImport() {
  console.log('============================================================================');
  console.log('LEGACY DATA IMPORT');
  console.log('============================================================================');
  console.log(`Source directory: ${MIGRATION_SOURCE_DIR}`);
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log('============================================================================\n');

  const results = {
    total: 0,
    successful: 0,
    failed: 0,
    records: 0,
  };

  const startTime = Date.now();

  for (const tableName of IMPORT_ORDER) {
    results.total++;
    const result = await importTable(tableName);

    if (result.success) {
      results.successful++;
      results.records += result.count;
    } else {
      results.failed++;
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n============================================================================');
  console.log('IMPORT SUMMARY');
  console.log('============================================================================');
  console.log(`Total tables: ${results.total}`);
  console.log(`Successful: ${results.successful}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Total records imported: ${results.records}`);
  console.log(`Duration: ${duration}s`);
  console.log('============================================================================\n');

  if (results.failed > 0) {
    console.log('⚠️  Some imports failed. Please review the errors above.');
    process.exit(1);
  } else {
    console.log('✅ All data imported successfully!');
    console.log('\nNext steps:');
    console.log('1. Review the imported data in Supabase');
    console.log('2. Check migration status: SELECT * FROM count_unmigrated_users();');
    console.log('3. When users verify their email, legacy profiles will be claimed automatically');
  }
}

// ============================================================================
// CLI Commands
// ============================================================================

const command = process.argv[2];

if (command === 'list') {
  console.log('Available CSV files:');
  Object.entries(CSV_TABLE_MAPPING).forEach(([csv, table]) => {
    const exists = fs.existsSync(path.join(MIGRATION_SOURCE_DIR, csv));
    console.log(`  ${exists ? '✓' : '✗'} ${csv} -> ${table}`);
  });
} else if (command === 'import') {
  runImport().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
} else {
  console.log('Usage:');
  console.log('  node import-legacy-data.js list     - List available CSV files');
  console.log('  node import-legacy-data.js import   - Import all CSV data to Supabase');
}
