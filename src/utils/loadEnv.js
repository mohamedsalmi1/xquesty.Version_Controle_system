/**
 * Utility to load environment variables in both development and Docker environments
 */

// Get environment variables from either the window.ENV object (set by Docker entrypoint)
// or from the import.meta.env (set by Vite during development)
export function getEnv(key, defaultValue = null) {
  // Try to read from window.ENV first (Docker and local dev with env-config.js)
  if (typeof window !== 'undefined' && window.ENV && window.ENV[key] !== undefined) {
    return window.ENV[key];
  }
  
  // Then try to get from import.meta.env (Vite development)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  
  // Finally use default value
  return defaultValue;
}

// Check if running in Docker
export function isRunningInDocker() {
  return typeof window !== 'undefined' && window.ENV && window.ENV.IS_DOCKER === true;
}

// Get all environment variables
export function getAllEnv() {
  // If running in Docker or local dev with env-config.js, use window.ENV
  if (typeof window !== 'undefined' && window.ENV) {
    return { ...window.ENV };
  }
  
  // Otherwise use import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const viteEnvVars = Object.keys(import.meta.env)
      .filter(key => key.startsWith('VITE_') || key.startsWith('REACT_APP_'))
      .reduce((obj, key) => {
        obj[key] = import.meta.env[key];
        return obj;
      }, {});
    
    return viteEnvVars;
  }
  
  // Return empty object as fallback
  return {};
}
