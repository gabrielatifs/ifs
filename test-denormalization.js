import createSupabaseEntity from './packages/shared/src/api/supabaseEntities.js';

async function testDenormalization() {
  console.log('\n=== TESTING DENORMALIZATION ===\n');

  const CourseDate = createSupabaseEntity('course_dates');
  const Course = createSupabaseEntity('courses');
  const Event = createSupabaseEntity('events');

  // Test course dates
  console.log('--- Fetching Course Dates ---');
  const courseDates = await CourseDate.filter({ status: 'Available' }, 'date', 3);
  console.log('Retrieved', courseDates.length, 'course dates');

  if (courseDates.length > 0) {
    const firstDate = courseDates[0];
    console.log('\nFirst course date keys:', Object.keys(firstDate).join(', '));
    console.log('Has courseId (camelCase)?', 'courseId' in firstDate ? '✅ YES' : '❌ NO');
    console.log('Has courseid (lowercase)?', 'courseid' in firstDate ? '⚠️  YES (should be camelCase)' : '✅ NO');
    console.log('courseId value:', firstDate.courseId);
    console.log('date value:', firstDate.date);
    console.log('status value:', firstDate.status);
  }

  // Test courses
  console.log('\n--- Fetching Courses ---');
  const courses = await Course.list('-created_date', 3);
  console.log('Retrieved', courses.length, 'courses');

  if (courses.length > 0) {
    const firstCourse = courses[0];
    console.log('\nFirst course keys:', Object.keys(firstCourse).join(', '));
    console.log('Has imageUrl (camelCase)?', 'imageUrl' in firstCourse ? '✅ YES' : '❌ NO');
    console.log('Has imageurl (lowercase)?', 'imageurl' in firstCourse ? '⚠️  YES (should be camelCase)' : '✅ NO');
    console.log('Title:', firstCourse.title);
    console.log('Level:', firstCourse.level);
  }

  // Test events
  console.log('\n--- Fetching Events ---');
  const events = await Event.filter({ type: 'Masterclass' }, 'date', 3);
  console.log('Retrieved', events.length, 'masterclass events');

  if (events.length > 0) {
    const firstEvent = events[0];
    console.log('\nFirst event keys:', Object.keys(firstEvent).join(', '));
    console.log('Has meetingUrl (camelCase)?', 'meetingUrl' in firstEvent ? '✅ YES' : '❌ NO');
    console.log('Has meetingurl (lowercase)?', 'meetingurl' in firstEvent ? '⚠️  YES (should be camelCase)' : '✅ NO');
    console.log('Title:', firstEvent.title);
    console.log('Type:', firstEvent.type);
    console.log('Date:', firstEvent.date);
  }

  console.log('\n=== TEST COMPLETE ===\n');
}

testDenormalization();
