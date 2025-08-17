// This file will be processed at container startup
// Environment variables will be injected by the entrypoint script

window.ENV = {
  VITE_STUDENT_SUPABASE_URL: "${VITE_STUDENT_SUPABASE_URL}",
  VITE_STUDENT_SUPABASE_ANON_KEY: "${VITE_STUDENT_SUPABASE_ANON_KEY}",
  VITE_API_URL: "${VITE_API_URL}",
  IS_DOCKER: "true"
};
