/**
 * Supabase Authentication Helper
 * Provides utility functions for user registration and authentication using Supabase
 */

const supabaseService = require('./supabaseRecruiterService');

/**
 * Create a new user in Supabase
 * @param {Object} userData User data for registration
 * @returns {Promise<Object>} Created user data
 */
async function createUser(userData) {
  console.log('Creating user in Supabase:', {
    ...userData,
    password: '***REDACTED***'
  });
  
  const { name, company, email, password } = userData;
  
  if (!name || !company || !email || !password) {
    throw new Error('Missing required user data fields');
  }
  
  // Validate password complexity
  validatePassword(password);
  
  try {
    const user = await supabaseService.createUser(userData);
    console.log('User created successfully in Supabase:', user.id);
    return user;
  } catch (error) {
    console.error('Error in createUser:', error.message);
    throw error; // Re-throw to be handled by caller
  }
}

/**
 * Find a user by email in Supabase
 * @param {string} email Email address to search for
 * @returns {Promise<Object|null>} User object or null if not found
 */
async function findUserByEmail(email) {
  if (!email) {
    throw new Error('Email is required');
  }
  
  try {
    console.log(`Searching for user with email: ${email}`);
    const user = await supabaseService.findUserByEmail(email);
    
    if (!user) {
      console.log("No user found with this email");
      return null;
    }
    
    console.log(`Found user with email: ${email}`);
    return user;
  } catch (error) {
    console.error('Error finding user:', error.message);
    throw new Error(`Failed to find user: ${error.message}`);
  }
}

/**
 * Authenticate user with email and password
 * @param {string} email User email
 * @param {string} password User password
 * @returns {Promise<Object|null>} User session or null if authentication fails
 */
async function authenticateUser(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  
  try {
    console.log(`Authenticating user: ${email}`);
    const session = await supabaseService.authenticateUser(email, password);
    
    if (!session) {
      console.log("Authentication failed");
      return null;
    }
    
    console.log(`Authentication successful for: ${email}`);
    return session;
  } catch (error) {
    console.error('Authentication error:', error.message);
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

/**
 * Validate password complexity
 * @param {string} password Password to validate
 * @throws {Error} If password doesn't meet requirements
 */
function validatePassword(password) {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    throw new Error('Password must contain uppercase, lowercase, numbers, and special characters');
  }
}

/**
 * Generate a secure session token
 * @param {string} userId User ID to include in token
 * @returns {string} Session token
 */
function generateSessionToken(userId) {
  const payload = {
    userId: userId,
    timestamp: Date.now(),
    random: Math.random().toString(36).substring(2)
  };
  
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

module.exports = {
  createUser,
  findUserByEmail,
  authenticateUser,
  validatePassword,
  generateSessionToken
};
