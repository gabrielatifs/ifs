import { createClient } from '@supabase/supabase-js';

// Configuration from your .env
const supabaseUrl = 'https://duewbxktgjugeknesmqn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1ZXdieGt0Z2p1Z2VrbmVzbXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNTEzNzAsImV4cCI6MjA4MzgyNzM3MH0.s51Cy6iUo_u7pl28i3k5vpGxS9hKTib6OAjav0x5NJI';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function testSupabaseConnection() {
  console.log('\n=== SUPABASE CONNECTION TEST ===\n');
  console.log('📡 Supabase URL:', supabaseUrl);
  console.log('🔑 Using Anonymous Key\n');

  const tests = [
    { name: 'courses', table: 'courses' },
    { name: 'course_dates', table: 'course_dates' },
    { name: 'course_variants', table: 'course_variants' },
    { name: 'events', table: 'events' },
    { name: 'community_events', table: 'community_events' },
    { name: 'jobs', table: 'jobs' },
    { name: 'news_items', table: 'news_items' },
  ];

  for (const test of tests) {
    console.log(`\n--- Testing: ${test.name} ---`);

    try {
      // Test 1: Count rows
      const { count, error: countError } = await supabase
        .from(test.table)
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.log(`❌ COUNT ERROR:`, countError.message);
        console.log(`   Code: ${countError.code}`);
        console.log(`   Details:`, countError.details);
        console.log(`   Hint:`, countError.hint);
        continue;
      }

      console.log(`✅ Row Count: ${count}`);

      // Test 2: Fetch first 5 rows
      const { data, error } = await supabase
        .from(test.table)
        .select('*')
        .limit(5);

      if (error) {
        console.log(`❌ FETCH ERROR:`, error.message);
        console.log(`   Code: ${error.code}`);
        continue;
      }

      if (data && data.length > 0) {
        console.log(`✅ Sample Data (first row):`, JSON.stringify(data[0], null, 2).substring(0, 200) + '...');
      } else {
        console.log(`⚠️  No data in table`);
      }

    } catch (err) {
      console.log(`❌ EXCEPTION:`, err.message);
    }
  }

  // Test specific filters used in Dashboard
  console.log('\n\n=== TESTING DASHBOARD QUERIES ===\n');

  try {
    console.log('--- Testing: Events with type=Masterclass ---');
    const { data: masterclass, error: mcError } = await supabase
      .from('events')
      .select('*')
      .eq('type', 'Masterclass')
      .order('date', { ascending: true })
      .limit(10);

    if (mcError) {
      console.log(`❌ ERROR:`, mcError.message);
    } else {
      console.log(`✅ Found ${masterclass?.length || 0} Masterclass events`);
      if (masterclass && masterclass.length > 0) {
        console.log(`   First event:`, masterclass[0].title, '|', masterclass[0].date);
      }
    }
  } catch (err) {
    console.log(`❌ EXCEPTION:`, err.message);
  }

  try {
    console.log('\n--- Testing: Course Dates with status=Available ---');
    const { data: courseDates, error: cdError } = await supabase
      .from('course_dates')
      .select('*')
      .eq('status', 'Available')
      .order('date', { ascending: true })
      .limit(10);

    if (cdError) {
      console.log(`❌ ERROR:`, cdError.message);
    } else {
      console.log(`✅ Found ${courseDates?.length || 0} Available course dates`);
      if (courseDates && courseDates.length > 0) {
        console.log(`   First date:`, courseDates[0].date, '| Course ID:', courseDates[0].courseid || courseDates[0].course_id);
      }
    }
  } catch (err) {
    console.log(`❌ EXCEPTION:`, err.message);
  }

  try {
    console.log('\n--- Testing: Active Community Events ---');
    const { data: communityEvents, error: ceError } = await supabase
      .from('community_events')
      .select('*')
      .eq('status', 'Active')
      .order('date', { ascending: true })
      .limit(10);

    if (ceError) {
      console.log(`❌ ERROR:`, ceError.message);
    } else {
      console.log(`✅ Found ${communityEvents?.length || 0} Active community events`);
      if (communityEvents && communityEvents.length > 0) {
        console.log(`   First event:`, communityEvents[0].title, '|', communityEvents[0].date);
      }
    }
  } catch (err) {
    console.log(`❌ EXCEPTION:`, err.message);
  }

  console.log('\n\n=== TEST COMPLETE ===\n');
}

testSupabaseConnection().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
