// Debug script to check user profile data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://duewbxktgjugeknesmqn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1ZXdieGt0Z2p1Z2VrbmVzbXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNTEzNzAsImV4cCI6MjA4MzgyNzM3MH0.s51Cy6iUo_u7pl28i3k5vpGxS9hKTib6OAjav0x5NJI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUserProfile() {
  console.log('\n=== DEBUG USER PROFILE ===\n');

  // Check user_profiles table for gabriel@cause.cx
  const { data: profiles, error: profilesError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', 'gabriel@cause.cx');

  if (profilesError) {
    console.error('Error fetching from user_profiles:', profilesError);
  } else {
    console.log('user_profiles data for gabriel@cause.cx:');
    if (profiles && profiles.length > 0) {
      const profile = profiles[0];
      console.log('  ID:', profile.id);
      console.log('  Auth ID:', profile.auth_id);
      console.log('  Email:', profile.email);
      console.log('  First Name:', profile.first_name);
      console.log('  Last Name:', profile.last_name);
      console.log('  Organisation:', profile.organisation);
      console.log('  Membership Type:', profile.membership_type);
      console.log('  Membership Status:', profile.membership_status);
    } else {
      console.log('  ❌ No profile found for gabriel@cause.cx');
    }
  }

  // Check if there are any profiles with similar emails
  const { data: allProfiles, error: allError } = await supabase
    .from('user_profiles')
    .select('id, email, auth_id, organisation, membership_type, membership_status')
    .ilike('email', '%gabriel%');

  if (allError) {
    console.error('\nError fetching similar profiles:', allError);
  } else {
    console.log('\n\nProfiles with "gabriel" in email:');
    if (allProfiles && allProfiles.length > 0) {
      allProfiles.forEach(p => {
        console.log(`  - ${p.email} (ID: ${p.id}, Auth: ${p.auth_id || 'none'}, Org: ${p.organisation || 'N/A'}, Type: ${p.membership_type})`);
      });
    } else {
      console.log('  None found');
    }
  }

  // List first 10 profiles to see what's in the table
  const { data: sampleProfiles, error: sampleError } = await supabase
    .from('user_profiles')
    .select('id, email, auth_id, organisation, membership_type')
    .limit(10);

  if (sampleError) {
    console.error('\nError fetching sample profiles:', sampleError);
  } else {
    console.log('\n\nSample profiles in table (first 10):');
    if (sampleProfiles && sampleProfiles.length > 0) {
      sampleProfiles.forEach(p => {
        console.log(`  - ${p.email} (Auth: ${p.auth_id ? 'linked' : 'not linked'}, Org: ${p.organisation || 'N/A'})`);
      });
    } else {
      console.log('  No profiles found in table!');
    }
  }

  console.log('\n=== END DEBUG ===\n');
}

debugUserProfile().catch(console.error);
