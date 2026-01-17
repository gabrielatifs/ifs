import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://duewbxktgjugeknesmqn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1ZXdieGt0Z2p1Z2VrbmVzbXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNTEzNzAsImV4cCI6MjA4MzgyNzM3MH0.s51Cy6iUo_u7pl28i3k5vpGxS9hKTib6OAjav0x5NJI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDataStructure() {
  console.log('\n=== CHECKING DATA STRUCTURE ===\n');

  // Get a sample course
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .limit(1);

  console.log('--- Sample Course ---');
  console.log('Keys:', Object.keys(courses[0]).join(', '));
  console.log('Has "id"?', 'id' in courses[0]);
  console.log('Sample ID:', courses[0].id);

  // Get sample course dates
  const { data: courseDates } = await supabase
    .from('course_dates')
    .select('*')
    .limit(3);

  console.log('\n--- Sample Course Dates ---');
  console.log('Keys:', Object.keys(courseDates[0]).join(', '));
  console.log('Has "courseId"?', 'courseId' in courseDates[0]);
  console.log('Has "courseid"?', 'courseid' in courseDates[0]);
  console.log('Course ID field value:', courseDates[0].courseid || courseDates[0].courseId || 'NOT FOUND');

  // Check if any course dates match courses
  console.log('\n--- Checking Course Date Relationships ---');
  const courseId = courses[0].id;
  console.log('Looking for course dates with courseid =', courseId);

  courseDates.forEach((date, idx) => {
    console.log(`Date ${idx + 1}:`, {
      courseid: date.courseid,
      courseId: date.courseId,
      date: date.date,
      status: date.status
    });
  });

  // Get sample events
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .limit(1);

  console.log('\n--- Sample Event ---');
  console.log('Keys:', Object.keys(events[0]).join(', '));
  console.log('Type field:', events[0].type);
  console.log('Date field:', events[0].date);

  // Get sample community events
  const { data: communityEvents } = await supabase
    .from('community_events')
    .select('*')
    .limit(1);

  console.log('\n--- Sample Community Event ---');
  console.log('Keys:', Object.keys(communityEvents[0]).join(', '));
  console.log('Status field:', communityEvents[0].status);
  console.log('Date field:', communityEvents[0].date);

  console.log('\n=== COMPLETE ===\n');
}

testDataStructure();
