import { getEnv, isRunningInDocker } from './utils/loadEnv';

// Helper function to determine the correct API URL
function determineApiUrl() {
  // First try to get from environment
  const envApiUrl = getEnv('VITE_API_URL');
  if (envApiUrl) return envApiUrl;
  
  // If not available, use current hostname with port 3000 (for local development)
  if (typeof window !== 'undefined') {
    // Check if we're in localhost or a real domain
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    } else {
      // In production, assume API is on the same hostname but with /api path
      return `${window.location.protocol}//${window.location.hostname}/api`;
    }
  }
  
  // Fallback
  return 'http://localhost:3000';
}

const config = {
  // API URL configuration
  apiUrl: determineApiUrl(),
  
  // Supabase configurations (student only)
  supabase: {
    student: {
      url: getEnv('VITE_STUDENT_SUPABASE_URL'),
      key: getEnv('VITE_STUDENT_SUPABASE_ANON_KEY')
    }
  },
  
  // Environment detection
  isDocker: isRunningInDocker(),
  isLocalhost: typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'),
  
  // Debug mode - enable for more logging
  debug: true
};

// Log config in debug mode
if (config.debug && typeof window !== 'undefined') {
  console.log('App configuration:', {
    ...config,
    // Don't log sensitive keys
    supabase: { student: { url: config.supabase.student.url, key: '***' } }
  });
}

export default config;
