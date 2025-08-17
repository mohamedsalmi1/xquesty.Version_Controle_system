/**
 * Supabase Authentication Diagnostic Script
 * This script tests various Supabase auth configurations
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://bpckfdjmqasywbspkvgb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwY2tmZGptcWFzeXdic3BrdmdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNzAyNzIsImV4cCI6MjA2Mjg0NjI3Mn0.rppuwrPGBkJCYhBLupDDdoa7U6qJPBR9IIfO8kVJrUA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runDiagnostics() {
  console.log('🔍 Supabase Authentication Diagnostics');
  console.log('=====================================');
  
  // Test 1: Basic connection
  console.log('\n1. Testing basic connection...');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('❌ Connection error:', error.message);
    } else {
      console.log('✅ Basic connection successful');
    }
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
  }

  // Test 2: Test with a very simple signup
  console.log('\n2. Testing simple signup...');
  const testEmail = `diagnostic-${Date.now()}@test.com`;
  console.log('Using email:', testEmail);
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpass123',
    });

    if (error) {
      console.log('❌ Signup error:');
      console.log('   Status:', error.status || 'unknown');
      console.log('   Code:', error.code || 'unknown');
      console.log('   Message:', error.message);
      
      // Analyze the error
      if (error.message.includes('Database error')) {
        console.log('\n💡 DIAGNOSIS:');
        console.log('   This "Database error" typically means:');
        console.log('   1. RLS (Row Level Security) policies are blocking user creation');
        console.log('   2. Email confirmations are required but not configured');
        console.log('   3. There are custom database constraints causing issues');
        console.log('\n🔧 SUGGESTED FIXES:');
        console.log('   1. Go to Authentication → Settings and disable "Enable email confirmations"');
        console.log('   2. Go to Database → Tables → auth.users and check for restrictive RLS policies');
        console.log('   3. Make sure no custom triggers or constraints are interfering');
      } else if (error.message.includes('Invalid API key')) {
        console.log('\n💡 DIAGNOSIS: API key issue');
      } else if (error.message.includes('User already registered')) {
        console.log('\n💡 DIAGNOSIS: User already exists (this is normal for testing)');
      }
    } else {
      console.log('✅ Signup successful!');
      console.log('   User ID:', data.user?.id);
      console.log('   Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
      console.log('   Session created:', !!data.session);
    }
  } catch (err) {
    console.log('❌ Signup failed with exception:', err.message);
  }

  // Test 3: Check project settings accessibility
  console.log('\n3. Testing project metadata access...');
  try {
    const { data, error } = await supabase.rpc('get_auth_settings');
    if (error && error.code !== '42883') { // function doesn't exist is ok
      console.log('⚠️  Cannot access project settings:', error.message);
    } else {
      console.log('✅ Project metadata accessible');
    }
  } catch (err) {
    console.log('⚠️  Project settings check skipped');
  }

  console.log('\n=====================================');
  console.log('🎯 NEXT STEPS:');
  console.log('1. Check your Supabase dashboard Authentication settings');
  console.log('2. Disable email confirmations for testing');
  console.log('3. Review any custom RLS policies on auth.users');
  console.log('4. Try the registration again after making changes');
}

runDiagnostics().catch(console.error);
