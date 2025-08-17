#!/bin/bash
set -e

# Function to update environment variables in env-config.js
update_env_config() {
  echo "Updating env-config.js with environment variables..."
  ENV_FILE=/usr/share/nginx/html/env-config.js
  
  # Create basic structure if file doesn't exist
  if [ ! -f "$ENV_FILE" ]; then
    echo "Creating new env-config.js file..."
    echo 'window.ENV = {};' > "$ENV_FILE"
  fi
  
  # Update environment variables
  sed -i "s|\"VITE_API_URL\": \"[^\"]*\"|\"VITE_API_URL\": \"$VITE_API_URL\"|g" "$ENV_FILE"
  sed -i "s|\"VITE_STUDENT_SUPABASE_URL\": \"[^\"]*\"|\"VITE_STUDENT_SUPABASE_URL\": \"$VITE_STUDENT_SUPABASE_URL\"|g" "$ENV_FILE"
  sed -i "s|\"VITE_STUDENT_SUPABASE_ANON_KEY\": \"[^\"]*\"|\"VITE_STUDENT_SUPABASE_ANON_KEY\": \"$VITE_STUDENT_SUPABASE_ANON_KEY\"|g" "$ENV_FILE"
  
  echo "Environment variables updated in env-config.js"
  echo "Content of env-config.js:"
  cat "$ENV_FILE"
}

# Update environment variables
update_env_config

# Execute the original entrypoint
exec nginx -g 'daemon off;'
