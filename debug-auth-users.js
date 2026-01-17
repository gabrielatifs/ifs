// Debug script to check auth.users table (requires service role key)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://duewbxktgjugeknesmqn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1ZXdieGt0Z2p1Z2VrbmVzbXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNTEzNzAsImV4cCI6MjA4MzgyNzM3MH0.s51Cy6iUo_u7pl28i3k5vpGxS9hKTib6OAjav0x5NJI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugAuthUsers() {
  console.log('\n=== DEBUG AUTH USERS ===\n');

  // Try to sign in as gabriel@cause.cx (you'll need the password)
  // First, let's check if we can query user_profiles with a proper auth context

  // Check the raw SQL query to bypass RLS
  const { data, error } = await supabase.rpc('exec_sql', {
    query: "SELECT COUNT(*) as count FROM user_profiles"
  });

  if (error) {
    console.log('RPC not available (expected). Trying direct query...');
  } else {
    console.log('Total profiles:', data);
  }

  // Try authenticated query (need to sign in first)
  console.log('\n--- Attempting to check auth status ---');
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('Session error:', sessionError);
  } else {
    console.log('Current session:', sessionData.session ? 'Logged in' : 'Not logged in');
  }

  // Check with auth.users via admin API (requires service role key)
  console.log('\n--- Note: This query is subject to RLS policies ---');
  console.log('The anon key can only see profiles that match RLS policy conditions');
  console.log('To see all profiles, you need to:');
  console.log('1. Use the service_role key (dangerous - has full access)');
  console.log('2. Query directly from Supabase SQL Editor');
  console.log('3. Sign in as a user and query their own profile');

  console.log('\n=== END DEBUG ===\n');
}

debugAuthUsers().catch(console.error);
