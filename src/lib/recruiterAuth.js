import { recruiterSupabase } from "./supabaseClient";

// Returns a promise that resolves to the current recruiter user (or null)
export async function getCurrentRecruiter() {
  const { data: { session } } = await recruiterSupabase.auth.getSession();
  if (!session || !session.user) return null;
  // Optionally check for role === 'recruiter'
  //if (session.user.user_metadata?.role !== 'recruiter') return null;
  return session.user;
}

// Returns a promise that resolves to true if a recruiter is signed in
export async function isRecruiterAuthenticated() {
  const user = await getCurrentRecruiter();
  return !!user;
}

// Sign out the current recruiter
export async function signOutRecruiter() {
  await recruiterSupabase.auth.signOut();
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
}
