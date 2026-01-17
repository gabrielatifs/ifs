// Check if gabriel@cause.cx exists in auth.users
// This requires signing in or using service role key
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://duewbxktgjugeknesmqn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1ZXdieGt0Z2p1Z2VrbmVzbXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNTEzNzAsImV4cCI6MjA4MzgyNzM3MH0.s51Cy6iUo_u7pl28i3k5vpGxS9hKTib6OAjav0x5NJI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkGabrielAuth() {
  console.log('\n=== CHECKING GABRIEL AUTH ===\n');

  // The issue: RLS policies in 06_user_profiles_rls.sql require:
  // 1. auth.uid() = auth_id (user is viewing their own linked profile)
  // 2. auth.email() = email AND auth_id IS NULL (user viewing unclaimed profile)

  // Since we're using anon key (not authenticated), we can't see ANY profiles!

  console.log('PROBLEM IDENTIFIED:');
  console.log('- The debug script uses the anon (unauthenticated) key');
  console.log('- RLS policies REQUIRE authentication to view profiles');
  console.log('- Policy 1: auth.uid() = auth_id (only see YOUR linked profile when logged in)');
  console.log('- Policy 2: auth.email() = email AND auth_id IS NULL (only see YOUR unclaimed profile when logged in)');
  console.log('');
  console.log('This means:');
  console.log('✗ Anonymous users cannot see ANY profiles (correct behavior for privacy)');
  console.log('✓ Authenticated users can only see their OWN profile');
  console.log('');
  console.log('TO FIX THIS INVESTIGATION:');
  console.log('1. Check Supabase Dashboard > Authentication > Users');
  console.log('   - See if gabriel@cause.cx exists as an auth user');
  console.log('2. Check Supabase Dashboard > Table Editor > user_profiles');
  console.log('   - Disable RLS temporarily or use the dashboard to view all rows');
  console.log('   - Look for gabriel@cause.cx and check the auth_id column');
  console.log('');
  console.log('LIKELY SCENARIOS:');
  console.log('A) gabriel@cause.cx exists in user_profiles but auth_id is NULL');
  console.log('   → Need to link the profile to an auth user');
  console.log('B) gabriel@cause.cx was deleted from auth.users');
  console.log('   → auth_id in user_profiles is orphaned (points to non-existent user)');
  console.log('C) gabriel@cause.cx never existed in auth.users (legacy account)');
  console.log('   → User needs to sign up and claim their profile');
  console.log('');
  console.log('IMMEDIATE ACTION:');
  console.log('Go to Supabase Dashboard and check both:');
  console.log('- Authentication > Users table (auth.users)');
  console.log('- Table Editor > user_profiles table');
  console.log('');

  console.log('\n=== END CHECK ===\n');
}

checkGabrielAuth().catch(console.error);
