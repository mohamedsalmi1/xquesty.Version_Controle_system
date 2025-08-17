// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Get environment variables or use fallbacks
const getEnvVariable = (key) => {
  // Check for browser environment
  if (typeof window !== 'undefined' && window.ENV && window.ENV[key]) {
    return window.ENV[key];
  }
  // Check for Vite environment variables
  if (import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  // Check for process.env (Node.js)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return null;
};

// Student Supabase client
const studentUrl = getEnvVariable('VITE_STUDENT_SUPABASE_URL');
const studentKey = getEnvVariable('VITE_STUDENT_SUPABASE_ANON_KEY');

if (!studentUrl || !studentKey) {
  console.error("Student Supabase configuration missing");
}

// Recruiter Supabase client
const recruiterUrl = getEnvVariable('VITE_RECRUITER_SUPABASE_URL');
const recruiterKey = getEnvVariable('VITE_RECRUITER_SUPABASE_ANON_KEY');

if (!recruiterUrl || !recruiterKey) {
  console.error("Recruiter Supabase configuration missing");
}

// For backward compatibility - points to student database
// export const supabase = createClient(
//  studentUrl || "https://fikbdwvimbzdnqsrwiyr.supabase.co",
//  studentKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2Jkd3ZpbWJ6ZG5xc3J3aXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzAyNzIsImV4cCI6MjA2NzIwNjI3Mn0.ZlTOBOxCMCnF82VIGTEMO-Puf8qjolRHonb7rX-8PPk",
//  {
//    auth: {
//      storageKey: 'default-auth-token',
//    }  });

// Student Supabase client
export const studentSupabase = createClient(
  studentUrl || "https://fikbdwvimbzdnqsrwiyr.supabase.co",
  studentKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2Jkd3ZpbWJ6ZG5xc3J3aXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzAyNzIsImV4cCI6MjA2NzIwNjI3Mn0.ZlTOBOxCMCnF82VIGTEMO-Puf8qjolRHonb7rX-8PPk",
  {
    auth: {
      storageKey: 'student-auth-token',
    }
  }
);

// Recruiter Supabase client
export const recruiterSupabase = createClient(
  recruiterUrl || "https://pkcrptyqaxiscagpbchr.supabase.co",
  recruiterKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrY3JwdHlxYXhpc2NhZ3BiY2hyIiwicm9zZSI6ImFub24iLCJpYXQiOjE3NTIxNjM1MTQsImV4cCI6MjA2NzczOTUxNH0.jZMVaWZNWYw0chvu8--oFYQgTVh5y31YYzq7X61pojs",
  {
    auth: {
      storageKey: 'recruiter-auth-token',
    }
  }
);

// Export the same client as recruitersSupabase for components using that name
export const recruitersSupabase = recruiterSupabase;

// Debug info
console.log("Supabase clients initialized:");
console.log("- Student URL available:", !!studentUrl);
console.log("- Recruiter URL available:", !!recruiterUrl);

// Utility functions for role management
export async function createUserProfile(supabaseClient, profileData) {
  try {
    const { error } = await supabaseClient
      .from('profiles')
      .insert(profileData);

    if (error) {
      throw error;
    }
  } catch (err) {
    console.error('Error creating user profile:', err);
    throw err;
  }
}

// Updated to use studentSupabase since students are in the main database
export const getUserRole = async () => {
  const { data: { user } } = await studentSupabase.auth.getUser();
  if (!user) return null;
  
  // Ensure role is synced in raw_user_meta_data
  if (user.user_metadata?.role) {
    // Update raw_user_meta_data directly
    const { error } = await studentSupabase.auth.updateUser({
      data: { role: user.user_metadata.role }
    });
    
    if (error) {
      console.error('Error syncing role:', error);
    }
    
    return user.user_metadata.role;
  }
  
  return null;
};

export const isStudent = async () => {
  const role = await getUserRole();
  return role === 'student';
};

export async function getRecruiterRole() {
  const { data: { session } } = await recruiterSupabase.auth.getSession();
  if (session && session.user && session.user.user_metadata && session.user.user_metadata.role) {
    return session.user.user_metadata.role;
  }
  return null;
}

// Helper function to get the appropriate client based on user type
export const getClientForUserType = (userType) => {
  switch (userType) {
    case 'student':
      return studentSupabase;
    case 'recruiter':
      return recruiterSupabase;
    default:
      return supabase; // fallback to generic client
  }
};

// Helper function to get data client (always student DB since that's where tables live)
export const getDataClient = () => supabase;