/**
 * Supabase Recruiter Service
 * Handles interactions with Supabase for recruiter authentication
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

console.log('Environment check:');
console.log('VITE_RECRUITER_SUPABASE_URL:', process.env.VITE_RECRUITER_SUPABASE_URL ? 'Found' : 'Not found');
console.log('VITE_RECRUITER_SUPABASE_ANON_KEY:', process.env.VITE_RECRUITER_SUPABASE_ANON_KEY ? 'Found' : 'Not found');

// Supabase configuration for recruiters
const config = {
  url: process.env.VITE_RECRUITER_SUPABASE_URL,
  anonKey: process.env.VITE_RECRUITER_SUPABASE_ANON_KEY
};

console.log('Supabase config loaded:');
console.log('URL:', config.url);
console.log('Key prefix:', config.anonKey.substring(0, 20) + '...');

// Initialize Supabase client
const supabase = createClient(config.url, config.anonKey);

/**
 * Create a recruiter user in Supabase
 * @param {Object} userData - User data containing name, email, company, password
 * @returns {Promise<Object>} The created user data
 */
async function createUser(userData) {
  const { name, email, company, password } = userData;
  
  if (!name || !email || !company || !password) {
    throw new Error('Missing required user data');
  }
  
  console.log('Creating user with data:', { name, email, company, hasPassword: !!password });
  
  try {
    // Test connection first
    console.log('Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase.auth.getSession();
    console.log('Connection test result:', { testData: !!testData, testError: testError?.message });
    
    // Create user with Supabase auth
    console.log('Attempting to create user with email:', email);
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: name,
          company: company,
          role: 'recruiter'
        }
      }
    });

    console.log('Supabase signUp result:');
    console.log('- Data:', data ? { user: !!data.user, session: !!data.session } : 'null');
    console.log('- Error:', error ? { status: error.status, code: error.code, message: error.message } : 'null');
    
    if (error) {
      console.error('Supabase signUp error details:', JSON.stringify(error, null, 2));
      
      // Check if this is a configuration error
      if (error.status === 500 || error.code === 'unexpected_failure') {
        if (error.message?.includes('Database error saving new user')) {
          throw new Error(`Supabase database configuration error: The auth.users table is not properly configured or has restrictive policies. Please check your Supabase project settings: 1) Enable Email/Password auth, 2) Configure RLS policies for auth.users table, 3) Make sure email confirmations are disabled for testing.`);
        }
        throw new Error(`Supabase configuration error: ${error.message}. This typically means the Supabase project needs proper setup for user registration.`);
      }
      
      if (error.status === 401 || error.message?.includes('Invalid API key')) {
        throw new Error(`Invalid API key: ${error.message}. Please check the Supabase project configuration.`);
      }
      
      if (error.status === 422 || error.message?.includes('User already registered')) {
        throw new Error(`User already exists: ${error.message}`);
      }
      
      throw new Error(error.message || 'Failed to create user in Supabase');
    }

    if (!data || !data.user) {
      console.error('Supabase signUp returned no user data');
      throw new Error('No user data returned from Supabase');
    }

    console.log('Supabase user created successfully:', data.user.id);
    return data.user;
  } catch (error) {
    console.error('Failed to create user:', error.message);
    throw new Error(error.message || 'Failed to create user in Supabase');
  }
}

/**
 * Find a user by email in Supabase
 * @param {string} email - The email to search for
 * @returns {Promise<Object|null>} The user data or null if not found
 */
async function findUserByEmail(email) {
  try {
    // Note: In Supabase, we typically use the auth.signInWithPassword for authentication
    // This function is mainly for consistency with the original API
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: 'dummy' // This will fail but we can check if user exists
    });
    
    // If error is invalid_credentials, user exists but password is wrong
    if (error && error.message.includes('Invalid login credentials')) {
      return { email: email, exists: true };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to find user by email:', error.message);
    return null;
  }
}

/**
 * Authenticate user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object|null>} The user session or null if authentication fails
 */
async function authenticateUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error) {
      console.error('Authentication failed:', error.message);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Authentication error:', error.message);
    return null;
  }
}

module.exports = {
  createUser,
  findUserByEmail,
  authenticateUser,
  config,
  supabase
};
