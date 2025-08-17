# Supabase Project Migration Guide

## Current Project (BROKEN)
- URL: https://bpckfdjmqasywbspkvgb.supabase.co
- Status: All signup requests return 500 errors

## Steps to Fix:

### 1. Create New Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose a name (e.g., "stagequest-working")
4. Select region (same as before for consistency)
5. Generate strong password

### 2. Get New Credentials
After project creation, go to Settings → API:
- Copy the "Project URL" 
- Copy the "anon public" key

### 3. Update Your Project
Replace credentials in these files:
- public/env-config.js
- server/supabaseRecruiterService.js
- .env file (if exists)

### 4. Test the New Project
Run: node test-minimal-signup.cjs

### 5. Enable Authentication
In the new project:
- Go to Authentication → Providers
- Make sure Email is enabled
- Go to Authentication → Settings
- Disable "Enable email confirmations" for testing

## Why This Happened
The original project appears to have a database-level issue where the auth.users table
or related infrastructure is corrupted. This requires Supabase support to fix.

## Backup Plan
If you need to report this to Supabase support, provide:
- Project ID: bpckfdjmqasywbspkvgb
- Error IDs: 9575ca88dd98d7a1, 9575ca840b450e84, 9575c795de889f9c
- Issue: All auth/v1/signup requests return 500 "Database error saving new user"
