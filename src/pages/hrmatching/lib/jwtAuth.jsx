import { recruiterSupabase as supabase } from '@/lib/supabaseClient';
import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
// import { supabase } from './customSupabaseClient';

/**
 * Authentication Handler for HR Profile Matching App
 * Uses Supabase for authentication
 * 
 * This component handles authentication through:
 * - Active Supabase session with secure session management
 */

console.log('Authentication handler loaded');

export function useJWTAuth() {
  const [recruiter, setRecruiter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  // Check if we have a stored session
  const getStoredSession = () => {
    try {
      const storedSession = localStorage.getItem('supabase.auth.token');
      return storedSession ? JSON.parse(storedSession) : null;
    } catch (error) {
      console.error('Error reading stored session:', error);
      return null;
    }
  };

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Log all localStorage keys to help debug
        console.log('Available localStorage keys:', Object.keys(localStorage));
        
        // PRIORITY 0: Check for stored recruiter data from main app
        const storedUserData = localStorage.getItem('userData');
        const authToken = localStorage.getItem('authToken');
        const hrCompanyId = localStorage.getItem('hr_company_id');
        
        console.log('HR company ID in localStorage:', hrCompanyId);
        
        // If we have userData and authToken from main app, consider user authenticated
        if (storedUserData && authToken && hrCompanyId) {
          try {
            const userData = JSON.parse(storedUserData);
            console.log('Found user data from main app login:', userData.email);
            
            // Create recruiter object from main app data
            const recruiterData = {
              uuid: userData.uuid || userData.id,
              hr_company_id: hrCompanyId,
              email: userData.email,
              name: userData.name || userData.email.split('@')[0],
              company: userData.company || 'Your Company',
              role: userData.role || 'recruiter'
            };
            
            setRecruiter(recruiterData);
            setIsAuthenticated(true);
            
            // Store recruiter info in localStorage for persistence
            localStorage.setItem('hr_recruiter', JSON.stringify(recruiterData));
            
            toast({
              title: "Welcome!",
              description: `Successfully authenticated as ${recruiterData.name}`,
            });
            
            setIsLoading(false);
            return;
          } catch (e) {
            console.error('Error parsing userData:', e);
          }
        }
        
        // PRIORITY 1: Check for active Supabase session
        let sessionData = await supabase.auth.getSession();
        
        // If no active session, try to get it from storage
        if (!sessionData?.data?.session && getStoredSession()) {
          console.log('No active session, trying stored session');
          const storedSession = getStoredSession();
          // Set the stored session
          await supabase.auth.setSession({
            access_token: storedSession.access_token,
            refresh_token: storedSession.refresh_token
          });
          sessionData = await supabase.auth.getSession();
        }
        
        if (sessionData?.data?.session?.user) {
          const user = sessionData.data.session.user;
          console.log('Active Supabase session found for user:', user.email);
          
          // Fetch recruiter's profile from the profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching profile:', profileError);
          }
          
          // Create a recruiter object from Supabase user and profile data
          const recruiterData = {
            uuid: user.id,
            hr_company_id: user.id,
            email: user.email,
            name: profileData?.full_name || user.user_metadata?.full_name || user.email,
            company: profileData?.company || user.user_metadata?.company || 'Unknown Company',
            phone: profileData?.phone || user.user_metadata?.phone,
            role: user.user_metadata?.role || 'recruiter'
          };
          
          setRecruiter(recruiterData);
          setIsAuthenticated(true);
          
          // Store recruiter info in localStorage for persistence
          localStorage.setItem('hr_recruiter', JSON.stringify(recruiterData));
          
          toast({
            title: "Welcome!",
            description: `Successfully authenticated as ${recruiterData.name}`,
          });
          return;
        }
        

        
        // If we got this far, authentication failed
        toast({
          title: "Authentication Required",
          description: "Please login through xQuesty to access this page",
          variant: "destructive"
        });
        
      } catch (error) {
        console.error('Authentication error:', error);
        
        toast({
          title: "Authentication Error",
          description: "Could not verify authentication. Please try logging in again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Also check for stored authentication, but verify with Supabase session
    const checkStoredAuth = async () => {
      try {
        const storedRecruiter = localStorage.getItem('hr_recruiter');
        
        if (storedRecruiter) {
          // Verify that there's still an active Supabase session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            // No active session, clear stored data and return false
            localStorage.removeItem('hr_recruiter');
            return false;
          }
          
          const recruiterData = JSON.parse(storedRecruiter);
          setRecruiter(recruiterData);
          setIsAuthenticated(true);
          setIsLoading(false);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error checking stored auth:', error);
        localStorage.removeItem('hr_recruiter'); // Clear potentially corrupted data
        return false;
      }
    };

    // First try stored auth, then check URL token
    const init = async () => {
      const hasStoredAuth = await checkStoredAuth();
      if (!hasStoredAuth) {
        await checkAuthentication();
      }
    };
    
    init();
  }, [toast]);

  const logout = () => {
    setRecruiter(null);
    setIsAuthenticated(false);
    localStorage.removeItem('hr_recruiter');
    localStorage.removeItem('hr_jwt_token');
    
    toast({
      title: "Logged Out",
      description: "Please log in again to continue",
    });

    // Refresh the page to show the auth required screen
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return {
    recruiter,
    isAuthenticated,
    isLoading,
    logout
  };
}

/**
 * Authentication guard component
 */
export function AuthGuard({ children, fallback }) {
  const { isAuthenticated, isLoading, recruiter } = useJWTAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    // Check for authentication from different sources
    const hrCompanyId = localStorage.getItem('hr_company_id');
    const storedRecruiter = localStorage.getItem('hr_recruiter');
    const userData = localStorage.getItem('userData');
    const authToken = localStorage.getItem('authToken');
    
    // Consider authenticated if ANY of these authentication methods are available
    const isAnyAuth = hrCompanyId || storedRecruiter || (userData && authToken);
    
    if (!isAnyAuth) {
      console.log('No authentication found from any source');
      toast({
        title: "Authentication Required",
        description: "Please contact your system administrator or use valid credentials to access this application.",
        variant: "destructive"
      });
    } else {
      console.log('Authentication found:', 
        hrCompanyId ? 'HR company ID, ' : '',
        storedRecruiter ? 'Stored recruiter, ' : '',
        (userData && authToken) ? 'User data & token' : ''
      );
    }
  }, [toast]);

  // No debug mode - require proper authentication

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Check multiple sources of authentication
  // First, check our internal isAuthenticated flag, then fall back to checking localStorage directly
  
  // Additional check for direct authentication through localStorage
  const directHrCompanyId = localStorage.getItem('hr_company_id');
  const directUserData = localStorage.getItem('userData');
  const directAuthToken = localStorage.getItem('authToken');
  
  // We're authenticated if EITHER:
  // 1. Our hook says we're authenticated, OR
  // 2. We have direct localStorage authentication
  const directlyAuthenticated = directHrCompanyId && (directUserData || directAuthToken);
  
  if (!isAuthenticated && !directlyAuthenticated) {
    // Not authenticated - block access regardless of HR company ID
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">
            This HR Profile Matching application requires authentication from StageQuest.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Please contact your system administrator or use valid credentials to access this application.
          </p>
        </div>
      </div>
    );
  }

  return children;
}

/**
 * Recruiter info display component
 */
export function RecruiterInfo() {
  const { recruiter, logout } = useJWTAuth();

  if (!recruiter) return null;

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 rounded-full p-2">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{recruiter.name}</p>
            <p className="text-xs text-gray-500">{recruiter.company} • {recruiter.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
