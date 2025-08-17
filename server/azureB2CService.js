/**
 * Supabase Recruiter Service
 * Handles interactions with Supabase for recruiter authentication
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration for recruiters
const config = {
  url: process.env.VITE_RECRUITER_SUPABASE_URL || 'https://pkcrptyqaxiscagpbchr.supabase.co',
  anonKey: process.env.VITE_RECRUITER_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrY3JwdHlxYXhpc2NhZ3BiY2hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNjM1MTQsImV4cCI6MjA2NzczOTUxNH0.jZMVaWZNWYw0chvu8--oFYQgTVh5y31YYzq7X61pojs'
};

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
  
  try {
    // Create user with Supabase auth
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
    
    if (error) {
      console.error('Failed to create user:', error.message);
      throw new Error(error.message || 'Failed to create user in Supabase');
    }
    
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
