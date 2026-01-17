import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://duewbxktgjugeknesmqn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1ZXdieGt0Z2p1Z2VrbmVzbXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNTEzNzAsImV4cCI6MjA4MzgyNzM3MH0.s51Cy6iUo_u7pl28i3k5vpGxS9hKTib6OAjav0x5NJI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSchema() {
  console.log('\n=== CHECKING SUPABASE TABLES ===\n');

  console.log('Trying direct table queries...\n');

  // Try various possible table name variations
  const possibleTables = [
    'courses',
    'Courses',
    'COURSES',
    'course',
    'Course',
    'training_courses',
    'events',
    'Events',
    'EVENTS',
    'event',
    'Event',
    'masterclass_events',
    'community_events',
    'CommunityEvents',
    'course_dates',
    'CourseDates',
    'coursedates',
    'training_dates',
  ];

  for (const tableName of possibleTables) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (!error) {
        console.log(`✅ Table "${tableName}" exists - ${count} rows`);

        // If table has data, get column names
        if (count > 0) {
          const { data, error: dataError } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

          if (!dataError && data && data.length > 0) {
            console.log(`   Columns:`, Object.keys(data[0]).join(', '));
          }
        }
      }
    } catch (err) {
      // Ignore - table doesn't exist
    }
  }

  console.log('\n=== TESTING WITH SERVICE ROLE KEY ===\n');

  // Test with service role key to see if RLS is the issue
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1ZXdieGt0Z2p1Z2VrbmVzbXFuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI1MTM3MCwiZXhwIjoyMDgzODI3MzcwfQ.9p8NwQiNow3cbWdd5EDLLa9mER0MGaKbk0xA1TulVHg';
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const testTables = ['courses', 'events', 'community_events', 'course_dates'];

  for (const tableName of testTables) {
    try {
      const { count, error } = await supabaseAdmin
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (!error) {
        console.log(`✅ [SERVICE ROLE] Table "${tableName}" - ${count} rows`);
      } else {
        console.log(`❌ [SERVICE ROLE] Table "${tableName}" - Error: ${error.message}`);
      }
    } catch (err) {
      console.log(`❌ [SERVICE ROLE] Table "${tableName}" - Exception: ${err.message}`);
    }
  }

  console.log('\n=== COMPLETE ===\n');
}

testSchema();
