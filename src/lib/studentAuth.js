import { studentSupabase } from "./supabaseClient";

// Returns a promise that resolves to the current student user (or null)
export async function getCurrentStudent() {
  const { data: { session } } = await studentSupabase.auth.getSession();
  if (!session || !session.user) return null;
  // Optionally check for role === 'student'
  //if (session.user.user_metadata?.role !== 'student') return null;
  return session.user;
}

// Returns a promise that resolves to true if a student is signed in
export async function isStudentAuthenticated() {
  const user = await getCurrentStudent();
  return !!user;
}

// Sign out the current student
export async function signOutStudent() {
  await studentSupabase.auth.signOut();
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
}
