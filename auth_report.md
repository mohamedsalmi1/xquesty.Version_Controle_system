# StageQuest Authentication Logic Report

## Overview

This document details the user authentication logic for the StageQuest application, covering both recruiter and student flows. It describes how login, signup, session persistence, logout, route protection, and redirection are handled across the frontend and backend.

---

## 1. **Login Flow**

### **Frontend**
- **Recruiter Login**:  
  - `RecruiterLoginForm.jsx` uses Supabase's `auth.signInWithPassword` for authentication.
  - On success, recruiter metadata is checked (`role === 'recruiter'`).
  - User data is stored in `localStorage` as `userData`.
  - Navigates to `/helloR`.

- **Student Login**:  
  - `StudentLoginForm.jsx` uses a separate Supabase client for students.
  - Checks if `role === 'student'` in user metadata.
  - Navigates to `/helloS`.

- **General Login**:  
  - `LoginForm.jsx` posts credentials to `/api/login`.
  - On success, stores `authToken` and `userType` in `localStorage`.
  - Redirects based on `userType`.

### **Backend**
- `/api/login` endpoint:
  - Validates email and password.
  - Authenticates via Supabase (`authHelper.authenticateUser`).
  - On success, returns user info, token, and userType.
  - Fallback: Demo mode for development, accepts any credentials.

---

## 2. **Signup Flow**

### **Frontend**
- **Recruiter Signup**:  
  - `authService.js` posts registration data to `/api/register`.
  - Requires `name`, `company`, `email`, `password`.
  - On success, stores user info and token.

- **Student Signup**:  
  - `StudentRegisterForm.jsx` uses Supabase `auth.signUp`.
  - Sets metadata (`full_name`, `university`, `role: 'student'`).
  - Stores session in `localStorage` for immediate access.

### **Backend**
- `/api/register` endpoint:
  - Validates required fields.
  - Creates user in Supabase (`authHelper.createUser`).
  - Returns user info and token.
  - Fallback: Returns mock user and token in demo mode.

---

## 3. **Session Persistence**

- **LocalStorage**:
  - On login/signup, stores `authToken`, `userData`, and sometimes `userType`.
  - Used for quick authentication checks and route protection.

- **Supabase Session**:
  - On page load, components check for active Supabase session.
  - If no session, attempts to restore from stored session data.
  - Student and recruiter flows use separate Supabase clients.

---

## 4. **Logout**

- **Frontend**:
  - Removes `authToken`, `userData`, and related keys from `localStorage`.
  - Calls Supabase `auth.signOut`.
  - Redirects to login page with a message.

- **Backend**:
  - No explicit logout endpoint; handled client-side.

---

## 5. **Route Protection**

- **ProtectedRoute.jsx**:
  - Checks authentication status using Supabase session and role.
  - Redirects to appropriate login page if not authenticated.
  - If role mismatch, redirects to home.

- **AuthGuard (hrmatching/lib/jwtAuth.jsx)**:
  - Checks multiple sources: Supabase session, localStorage, HR company ID.
  - Shows loading spinner while verifying.
  - Displays error and blocks access if not authenticated.

---

## 6. **Redirection Logic**

- **On Failed Auth**:
  - Recruiter: Redirects to `/recruiter` with error message.
  - Student: Redirects to `/student` with error message.

- **On Successful Auth**:
  - Redirects to `/helloR` (recruiter) or `/helloS` (student).

- **On Logout**:
  - Redirects to login page with logout message.

---

## 7. **Verification Endpoints**

- `/api/verify-student` and `/api/verify-recruiter`:
  - Used to verify token and role from frontend.
  - In demo mode, accept any token and return mock user info.

---

## 8. **Error Handling**

- **Frontend**:
  - Displays error messages for failed login/signup.
  - Handles connection errors and server errors gracefully.

- **Backend**:
  - Returns detailed error messages for failed authentication or registration.
  - Demo mode provides fallback responses for development.

---

## 9. **Debugging & Fallbacks**

- Debug info is shown in recruiter/student pages for authentication status.
- Fallback/demo modes allow development without full backend availability.

---

## 10. **Summary of Key Storage Keys**

- `authToken`: JWT or mock token for API authentication.
- `userData`: JSON object with user info and role.
- `userType`: String indicating user type (`recruiter` or `student`).
- `hr_company_id`, `hr_recruiter`: Used for HR matching flows.

---

## 11. **Security Notes**

- Password complexity is validated on backend.
- Role is checked both client-side and server-side.
- Tokens are required for protected API endpoints.

---

## 12. **Relevant Files**

- Frontend:  
  - `src/components/LoginForm.jsx`, `StudentLoginForm.jsx`, `RecruiterLoginForm.jsx`, `StudentRegisterForm.jsx`
  - `src/api/authService.js`
  - `src/pages/HelloS.jsx`, `helloR.jsx`, `hrmatching/lib/jwtAuth.jsx`
  - `src/components/ProtectedRoute.jsx`

- Backend:  
  - `server/api.js`, `index.js`, `index-backup.js`, `index-fixed.js`
  - `server/authHelper.js`, `authHelper_new.js`
  - `server/supabaseRecruiterService.js`
  - `server/azureB2CService.js`
  - `server/health-check.js`

---